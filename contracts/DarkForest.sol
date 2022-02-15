// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "./terminus/TerminusFacet.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./IStatsFacet.sol";

contract DarkForest is
    Ownable,
    IERC721Receiver,
    VRFConsumerBase,
    ReentrancyGuard
{
    struct Sacrifice {
        // Statuses:
        // 1 -> offered
        // 2 -> randomness fulfilled
        // 3 -> completed
        uint32 status;
        address sacrificer;
        // threshold is an index into UnicornMilkThresholds - determined when the sacrifice is offered
        uint256 threshold;
        uint256 randomness;
    }

    address CryptoUnicornsAddress;
    address UnicornMilkTokenAddress;
    address TerminusAddress;
    uint256 UnicornMilkStakingReward;
    uint256 StakePeriodSeconds;
    mapping(uint256 => address) Staker;
    mapping(uint256 => uint256) UnstakesAt;
    mapping(address => uint256[]) TokensStaked;
    mapping(uint256 => uint256) StakedTokenIndexInStakerArray;
    uint256[3] UnicornMilkThresholds;
    uint256[3] ShadowcornPoolIds;
    uint256[3] LootboxPoolIds;
    uint256 ChainlinkVRFFee;
    bytes32 ChainlinkVRFKeyhash;
    uint256[3] ShadowcornEggBonusesToUnicornMilk;
    mapping(bytes32 => Sacrifice) ActiveSacrifices;
    mapping(address => bytes32) CurrentSacrificeForSacrificer;

    event EnteredForest(uint256 indexed tokenId, address indexed staker);
    event ExitedForest(
        uint256 indexed tokenId,
        address indexed staker,
        uint256 reward
    );
    event SacrificeOffered(address indexed sacrificer, uint256 amount);
    event SacrificeCompleted(
        address indexed sacrificer,
        uint256 indexed terminusPoolId,
        bytes32 requestId
    );

    constructor(
        address _CryptoUnicornsAddress,
        address _UnicornMilkTokenAddress,
        address _TerminusAddress,
        uint256 _UnicornMilkStakingReward,
        uint256 _StakePeriodSeconds,
        address _VRFCoordinatorAddress,
        address _LinkTokenAddress,
        uint256 _ChainlinkVRFFee,
        bytes32 _ChainlinkVRFKeyhash
    ) VRFConsumerBase(_VRFCoordinatorAddress, _LinkTokenAddress) {
        transferOwnership(_msgSender());
        CryptoUnicornsAddress = _CryptoUnicornsAddress;
        UnicornMilkTokenAddress = _UnicornMilkTokenAddress;
        TerminusAddress = _TerminusAddress;
        UnicornMilkStakingReward = _UnicornMilkStakingReward;
        StakePeriodSeconds = _StakePeriodSeconds;
        ChainlinkVRFFee = _ChainlinkVRFFee;
        ChainlinkVRFKeyhash = _ChainlinkVRFKeyhash;
    }

    function setCryptoUnicornsAddress(address _CryptoUnicornsAddress)
        external
        onlyOwner
    {
        CryptoUnicornsAddress = _CryptoUnicornsAddress;
    }

    function cryptoUnicornsAddress() external view returns (address) {
        return CryptoUnicornsAddress;
    }

    function setUnicornMilkTokenAddress(address _UnicornMilkTokenAddress)
        external
        onlyOwner
    {
        UnicornMilkTokenAddress = _UnicornMilkTokenAddress;
    }

    function unicornMilkTokenAddress() external view returns (address) {
        return UnicornMilkTokenAddress;
    }

    function setTerminusAddress(address _TerminusAddress) external onlyOwner {
        TerminusAddress = _TerminusAddress;
    }

    function terminusAddress() external view returns (address) {
        return TerminusAddress;
    }

    function setUnicornMilkStakingReward(uint256 _UnicornMilkStakingReward)
        external
        onlyOwner
    {
        UnicornMilkStakingReward = _UnicornMilkStakingReward;
    }

    function unicornMilkStakingReward() external view returns (uint256) {
        return UnicornMilkStakingReward;
    }

    function setStakePeriodSeconds(uint256 _StakePeriodSeconds)
        external
        onlyOwner
    {
        StakePeriodSeconds = _StakePeriodSeconds;
    }

    function stakePeriodSeconds() external view returns (uint256) {
        return StakePeriodSeconds;
    }

    function setUnicornMilkThresholds(uint256[3] memory _UnicornMilkThresholds)
        external
        onlyOwner
    {
        UnicornMilkThresholds = _UnicornMilkThresholds;
    }

    function unicornMilkThresholds() external view returns (uint256[3] memory) {
        return UnicornMilkThresholds;
    }

    function setShadowcornPoolIds(uint256[3] memory _ShadowcornPoolIds)
        external
        onlyOwner
    {
        ShadowcornPoolIds = _ShadowcornPoolIds;
    }

    function shadowcornPoolIds() external view returns (uint256[3] memory) {
        return ShadowcornPoolIds;
    }

    function setLootboxPoolIds(uint256[3] memory _LootboxPoolIds)
        external
        onlyOwner
    {
        LootboxPoolIds = _LootboxPoolIds;
    }

    function lootboxPoolIds() external view returns (uint256[3] memory) {
        return LootboxPoolIds;
    }

    function setShadowcornEggBonusesToUnicornMilk(uint256[3] memory _bonuses)
        external
        onlyOwner
    {
        ShadowcornEggBonusesToUnicornMilk = _bonuses;
    }

    function shadowcornEggBonusesToUnicornMilk()
        external
        view
        returns (uint256[3] memory)
    {
        return ShadowcornEggBonusesToUnicornMilk;
    }

    function contractIsInitialized() public view returns (bool) {
        return
            UnicornMilkThresholds[0] > 0 &&
            ShadowcornPoolIds[0] > 0 &&
            LootboxPoolIds[0] > 0;
    }

    // This function surrenders control of Terminus pools back to the contract owner. This is so that,
    // in case this contract is deprecated, the owner can still perform operations on the shadowcorn
    // eggs and lootboxes.
    function surrenderTerminusPools() external onlyOwner {
        address _owner = owner();
        TerminusFacet terminusContract = TerminusFacet(TerminusAddress);
        for (uint256 i = 0; i < 3; i++) {
            terminusContract.setPoolController(ShadowcornPoolIds[i], _owner);
            terminusContract.setPoolController(LootboxPoolIds[i], _owner);
        }
    }

    function numStaked(address _staker) public view returns (uint256) {
        return TokensStaked[_staker].length;
    }

    function tokenOfStakerByIndex(address _staker, uint256 index)
        public
        view
        returns (uint256)
    {
        require(
            index < numStaked(_staker),
            "DarkForest: tokenOfStakerByIndex -- staker index out of bounds"
        );
        return TokensStaked[_staker][index];
    }

    function _addTokenToStakerEnumeration(address _staker, uint256 _tokenId)
        private
    {
        uint256 numPreviouslyStaked = numStaked(_staker);
        TokensStaked[_staker].push(_tokenId);
        StakedTokenIndexInStakerArray[_tokenId] = numPreviouslyStaked;
    }

    function _removeTokenFromStakerEnumeration(
        address _staker,
        uint256 _tokenId
    ) private {
        // Swap to last index (if necessary), then pop.
        uint256 lastIndex = numStaked(_staker) - 1;
        uint256 tokenIndex = StakedTokenIndexInStakerArray[_tokenId];
        require(
            TokensStaked[_staker][tokenIndex] == _tokenId,
            "DarkForest: _removeTokenFromStakerEnumeration -- token was not found where expected in TokensStaked array"
        );
        if (tokenIndex != lastIndex) {
            uint256 lastId = TokensStaked[_staker][lastIndex];
            TokensStaked[_staker][tokenIndex] = lastId;
            StakedTokenIndexInStakerArray[lastId] = tokenIndex;
        }

        TokensStaked[_staker].pop();
        delete StakedTokenIndexInStakerArray[_tokenId];
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4) {
        require(
            _msgSender() == CryptoUnicornsAddress,
            "DarkForest: onERC721Received -- Only Crypto Unicorns may enter the Dark Forest (nice try, my friend)"
        );
        IStatsFacet CUContract = IStatsFacet(CryptoUnicornsAddress);
        (, bool gameLocked, , uint256 lifecycleStage, , , ) = CUContract
            .getUnicornMetadata(tokenId);
        require(
            !gameLocked,
            "DarkForest: onERC721Received -- Cannot enter the Dark Forest while the Crypto Unicorns game has locked your token"
        );
        require(
            lifecycleStage == 2,
            "DarkForest: onERC721Received -- Only adult unicorns can enter the dark forest"
        );
        Staker[tokenId] = from;
        UnstakesAt[tokenId] = block.timestamp + StakePeriodSeconds;
        _addTokenToStakerEnumeration(from, tokenId);
        emit EnteredForest(tokenId, from);
        return IERC721Receiver.onERC721Received.selector;
    }

    function exitForest(uint256 tokenId)
        external
        nonReentrant
        returns (uint256)
    {
        require(
            _msgSender() == Staker[tokenId],
            "DarkForest: exitForest -- only the address which staked the token can make it exit the dark forest"
        );
        require(
            block.timestamp >= UnstakesAt[tokenId],
            "DarkForest: exitForest -- unicorn cannot find the exit yet"
        );
        IERC721(CryptoUnicornsAddress).safeTransferFrom(
            address(this),
            _msgSender(),
            tokenId
        );
        ERC20Burnable unimContract = ERC20Burnable(UnicornMilkTokenAddress);
        uint256 darkForestUnicornMilkBalance = unimContract.balanceOf(
            address(this)
        );
        uint256 reward = UnicornMilkStakingReward;
        TerminusFacet terminusContract = TerminusFacet(TerminusAddress);
        for (uint256 i = 0; i < 3; i++) {
            reward += (ShadowcornEggBonusesToUnicornMilk[i] *
                terminusContract.balanceOf(_msgSender(), ShadowcornPoolIds[i]));
        }
        if (darkForestUnicornMilkBalance < reward) {
            reward = UnicornMilkStakingReward;
        }
        if (darkForestUnicornMilkBalance >= reward) {
            unimContract.transfer(_msgSender(), reward);
        } else {
            reward = 0;
        }
        _removeTokenFromStakerEnumeration(_msgSender(), tokenId);
        Staker[tokenId] = address(0);
        UnstakesAt[tokenId] = 0;
        emit ExitedForest(tokenId, _msgSender(), reward);
        return reward;
    }

    function remainingShadowcornEggs()
        public
        view
        returns (uint256[3] memory, uint256)
    {
        TerminusFacet terminusContract = TerminusFacet(TerminusAddress);

        uint256[3] memory remainingShadowcornEggsByType;
        uint256 totalRemainingShadowcornEggs;
        for (uint256 i = 0; i < 3; i++) {
            uint256 availableCapacity = terminusContract.terminusPoolCapacity(
                ShadowcornPoolIds[i]
            ) - terminusContract.terminusPoolSupply(ShadowcornPoolIds[i]);
            totalRemainingShadowcornEggs += availableCapacity;
            remainingShadowcornEggsByType[i] = availableCapacity;
        }

        return (remainingShadowcornEggsByType, totalRemainingShadowcornEggs);
    }

    function offerSacrifice(uint256 amount) external nonReentrant {
        require(
            contractIsInitialized(),
            "DarkForest: offerSacrifice -- The altar is in ruins"
        );
        require(
            CurrentSacrificeForSacrificer[_msgSender()] == 0,
            "DarkForest: offerSacrifice -- Sender already has a sacrifice in progress"
        );

        uint256 totalRemainingShadowcornEggs;
        (, totalRemainingShadowcornEggs) = remainingShadowcornEggs();
        require(
            totalRemainingShadowcornEggs > 0,
            "DarkForest: offerSacrifice -- The altar seems lifeless and without energy"
        );

        emit SacrificeOffered(_msgSender(), amount);

        ERC20Burnable unimContract = ERC20Burnable(UnicornMilkTokenAddress);

        // Determine how generous of a sacrifice the caller is making. This is stored in the threshold
        // variable. 0 means low, 1 means medium, 2 means high.
        require(
            amount >= UnicornMilkThresholds[0],
            "DarkForest: offerSacrifice -- The altar rejects your paltry sacrifice"
        );
        uint256 threshold = 0;
        if (amount >= UnicornMilkThresholds[2]) {
            threshold = 2;
        } else if (amount >= UnicornMilkThresholds[1]) {
            threshold = 1;
        }
        uint256 sacrificeAmount = UnicornMilkThresholds[threshold];
        require(
            unimContract.allowance(_msgSender(), address(this)) >=
                sacrificeAmount,
            "DarkForest: offerSacrifice -- Insufficient allowance on Unicorm Milk token"
        );
        unimContract.burnFrom(_msgSender(), sacrificeAmount);

        Sacrifice memory currentSacrifice;
        currentSacrifice.status = 1;
        currentSacrifice.sacrificer = _msgSender();
        currentSacrifice.threshold = threshold;

        bytes32 requestId = requestRandomness(
            ChainlinkVRFKeyhash,
            ChainlinkVRFFee
        );
        ActiveSacrifices[requestId] = currentSacrifice;
        CurrentSacrificeForSacrificer[_msgSender()] = requestId;
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        Sacrifice storage currentSacrifice = ActiveSacrifices[requestId];
        if (currentSacrifice.status != 1) {
            return;
        }
        currentSacrifice.status = 2;
        currentSacrifice.randomness = randomness;
    }

    function completeSacrifice() external nonReentrant {
        bytes32 requestId = CurrentSacrificeForSacrificer[_msgSender()];
        require(
            requestId != 0,
            "DarkForest: completeSacrifice -- Sender has no sacrifice in progress"
        );
        Sacrifice storage currentSacrifice = ActiveSacrifices[requestId];

        TerminusFacet terminusContract = TerminusFacet(TerminusAddress);

        uint256[3] memory remainingShadowcornEggsByType;
        uint256 totalRemainingShadowcornEggs;

        (
            remainingShadowcornEggsByType,
            totalRemainingShadowcornEggs
        ) = remainingShadowcornEggs();

        uint256 terminusPoolId = 0;
        if (totalRemainingShadowcornEggs > 0) {
            require(
                currentSacrifice.status == 2,
                "DarkForest: completeSacrifice -- Ritual cannot be completed at this time"
            );

            // The following extraction of randomness assumes maximal entropy (256 bits worth) in the random number returned by
            // Chainlink VRF. This was confirmed by Max Melcher from Chainlink.
            // There will be a slight bias introduced by how we use this randomness.
            // The first random number we are selecting is being selected modulo 100, which has factors prime to 2.
            // The second random number will be reduced modulo the number of remaining shadowcorn eggs, which may or may not be a power of 2.
            // Either way, the bias will be very small because 2^(256-m)/N is very large for m = 0, N = 100 or m = 7, N = number of remaining shadowcorn eggs.
            // The bias amounts to a difference between probabilities of outcomes closer to 0 compared to those of outcomes closer to N and is
            // 1/[floor(2^(256-m)/N)*(floor(2^(256-m)/N) + 1)].
            // Even at the largest number of available shadowcorn eggs (3000), this bias is a difference in probabilities of: 1.0997770908598577e-143
            uint256 initialRandomness = currentSacrifice.randomness % 100;
            uint256 secondaryRandomness = currentSacrifice.randomness >> 7;

            terminusPoolId = LootboxPoolIds[currentSacrifice.threshold];
            bool selectShadowcornEgg = (currentSacrifice.threshold == 0 &&
                initialRandomness < 10) ||
                (currentSacrifice.threshold == 1 && initialRandomness < 50) ||
                (currentSacrifice.threshold == 2);
            if (selectShadowcornEgg) {
                uint256 eggNumber = secondaryRandomness %
                    totalRemainingShadowcornEggs;
                if (eggNumber < remainingShadowcornEggsByType[0]) {
                    terminusPoolId = ShadowcornPoolIds[0];
                } else if (
                    eggNumber <
                    remainingShadowcornEggsByType[0] +
                        remainingShadowcornEggsByType[1]
                ) {
                    terminusPoolId = ShadowcornPoolIds[1];
                } else {
                    terminusPoolId = ShadowcornPoolIds[2];
                }
            }
            if (terminusPoolId > 0) {
                terminusContract.mint(_msgSender(), terminusPoolId, 1, "");
            }
        }
        currentSacrifice.status = 3;
        delete CurrentSacrificeForSacrificer[_msgSender()];
        emit SacrificeCompleted(_msgSender(), terminusPoolId, requestId);
    }

    function staker(uint256 tokenId) external view returns (address) {
        return Staker[tokenId];
    }

    function unstakesAt(uint256 tokenId) external view returns (uint256) {
        return UnstakesAt[tokenId];
    }

    function setChainlinkVRFFee(uint256 _fee) external onlyOwner {
        ChainlinkVRFFee = _fee;
    }

    function chainlinkVRFFee() external view returns (uint256) {
        return ChainlinkVRFFee;
    }

    function setChainlinkVRFKeyhash(bytes32 _keyhash) external onlyOwner {
        ChainlinkVRFKeyhash = _keyhash;
    }

    function chainlinkVRFKeyhash() external view returns (bytes32) {
        return ChainlinkVRFKeyhash;
    }

    function viewSacrifice(bytes32 _requestId)
        external
        view
        returns (Sacrifice memory)
    {
        Sacrifice memory requestedSacrifice = ActiveSacrifices[_requestId];
        return requestedSacrifice;
    }

    function currentSacrificeId(address sacrificer)
        external
        view
        returns (bytes32)
    {
        return CurrentSacrificeForSacrificer[sacrificer];
    }

    function withdrawERC20(address tokenAddress, uint256 amount)
        external
        onlyOwner
    {
        ERC20Burnable erc20Contract = ERC20Burnable(tokenAddress);
        erc20Contract.transfer(_msgSender(), amount);
    }

    function drainERC20(address tokenAddress) external onlyOwner {
        ERC20Burnable erc20Contract = ERC20Burnable(tokenAddress);
        uint256 darkForestUnicornMilkBalance = erc20Contract.balanceOf(
            address(this)
        );
        erc20Contract.transfer(_msgSender(), darkForestUnicornMilkBalance);
    }

    function rescueUnicorn(uint256 tokenId) external onlyOwner {
        IERC721 cryptoUnicornsContract = IERC721(CryptoUnicornsAddress);
        require(
            cryptoUnicornsContract.ownerOf(tokenId) == address(this),
            "DarkForest: recoverUnicorn -- That unicorn is not in the Dark Forest"
        );
        address _staker = Staker[tokenId];
        _removeTokenFromStakerEnumeration(_staker, tokenId);
        delete Staker[tokenId];
        delete UnstakesAt[tokenId];
        IERC721(CryptoUnicornsAddress).transferFrom(
            address(this),
            _msgSender(),
            tokenId
        );
    }

    function resetSacrificeForSacrificer(address sacrificer)
        external
        onlyOwner
    {
        delete CurrentSacrificeForSacrificer[sacrificer];
    }
}