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
    
    uint256 lastTransaction = 0;

    struct TokenOwners {
        address token;
        mapping(address => bool) owners; 
    }

    mapping (uint256 => TokenOwners) pastOwners;

    function isPastOwner(address to, uint256 tokenId) internal view returns (bool) {
        return pastOwners[tokenId].owners[to];
    }
    
    function getLatestID() external view returns (uint256) {
        uint256 current = _tokenIds.current();
        return current;
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) 
        internal virtual override 
    {
        super._beforeTokenTransfer(from, to, tokenId);
        require(isPastOwner(to, tokenId) == false, "Recipient: is a past owner of this token");
        pastOwners[tokenId].owners[to] = true;
        lastTransaction = block.timestamp;
    }

    function validateLastTransaction() public view returns (bool){
        require((lastTransaction-block.timestamp) > 86400, "It has not been long enough since the last transaction");
        return true;
    }


    function awardItem(address recipient, string memory metadataURI)
        public
        returns (uint256)
    {
        validateLastTransaction();
        _tokenIds.increment();
        
        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, metadataURI);
        _burn(_tokenIds.current() - 1);

        return newItemId;
    }
}