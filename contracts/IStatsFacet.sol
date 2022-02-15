// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IStatsFacet {
    function getUnicornMetadata(uint256 _tokenId)
        external
        view
        returns (
            bool origin,
            bool gameLocked,
            bool limitedEdition,
            uint256 lifecycleStage,
            uint256 breedingPoints,
            uint256 unicornClass,
            uint256 hatchBirthday
        );

    function getStats(uint256 _dna)
        external
        view
        returns (
            uint256 attack,
            uint256 accuracy,
            uint256 movementSpeed,
            uint256 attackSpeed,
            uint256 defense,
            uint256 vitality,
            uint256 resistance,
            uint256 magic
        );
}