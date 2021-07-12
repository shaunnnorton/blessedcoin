// contracts/BlessedCoinContracts.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract BlessedCoinContract is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;



    constructor() ERC721("BlessedCoin", "BLESSED") {}
    
    struct TokenOwners {
        address token;
        mapping(address => bool) owners; 
    }

    mapping (uint256 => TokenOwners) pastOwners;

    function isPastOwner(address to, uint256 tokenId) internal view returns (bool) {
        return pastOwners[tokenId].owners[to];
    }
    
    // function lastStatus(uint tokenId) internal view returns (uint256) 

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) 
        internal virtual override 
    {
        super._beforeTokenTransfer(from, to, tokenId);
        require(isPastOwner(to, tokenId));
    }


    function awardItem(address recipient, string memory metadataURI)
        public
        returns (uint256)
    {
        _tokenIds.increment();
        
        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, metadataURI);

        return newItemId;
    }
}