// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./IStatsFacet.sol";

contract CryptoUnicorns is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable, IStatsFacet {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("Crypto Unicorns", "UNICORNS") {}

    function safeMint(address to, string memory uri) public {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function burn(uint256 tokenId) public {
        _burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function getUnicornMetadata(uint256 _tokenId) external pure returns (bool,bool,bool,uint256,uint256,uint256,uint256) {

            // bool origin, true
            // bool gameLocked, false
            // bool limitedEdition, true
            // uint256 lifecycleStage, 2
            // uint256 breedingPoints, 2
            // uint256 unicornClass, 2
            // uint256 hatchBirthday  1637710000
            return (true, false, true, 2, 2, 2, 1637710000);
        }

    function getStats(uint256 _dna) external pure returns (uint256 attack, uint256 accuracy, uint256 movementSpeed, uint256 attackSpeed, uint256 defense, uint256 vitality, uint256 resistance, uint256 magic) {
            return(130, 140, 123, 188, 151, 134, 213, 117);
        }
}
