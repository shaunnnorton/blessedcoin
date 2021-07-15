// contracts/BlessedCoinContracts.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @title A coin for sharing blessings
/// @author Shaun W. Norton
contract BlessedCoinContract is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;



    constructor() ERC721("BlessedCoin", "BLESSED") {}
    
    uint256 lastTransaction = 0;

    /// @notice Contains a token address and mapping of a tokens owners
    struct TokenOwners {
        address token;
        mapping(address => bool) owners; 
    }

    ///@notice mapping for the past owners of a token
    mapping (uint256 => TokenOwners) public pastOwners;

    /**
      @notice Check if address has owned a token
      @param to The address of the person to check
      @param tokenId The id of the token to check
      @return Bool if the person ever owned the token
    */
    function isPastOwner(address to, uint256 tokenId) internal view returns (bool) {
        return pastOwners[tokenId].owners[to];
    }
    
    /**
      @notice Check the latest id minted
      @return The latest id of the newest token 
    */
    function getLatestID() external view returns (uint256) {
        uint256 current = _tokenIds.current();
        return current;
    }


    /**
      @notice Will transfer `token` from `from` to `to` and update its uri with `newURI`
    */
    function transferFrom(address from,address to,uint256 tokenId ,string memory newURI) external virtual {
        _setTokenURI(tokenId, newURI);
        lastTransaction = block.timestamp;
        super.transferFrom(from,to,tokenId);
    }


    /**
      @inheritdoc ERC721
      @notice modifies the _beforeTokenTransfer Hook to check if recipient is a past owner and updates the last Transaction
    */
    function _beforeTokenTransfer(address from, address to, uint256 tokenId) 
        internal virtual override 
    {
        super._beforeTokenTransfer(from, to, tokenId);
        require(isPastOwner(to, tokenId) == false, "Recipient: is a past owner of this token");
        pastOwners[tokenId].owners[to] = true;
    }

    /**
      @notice Validates the Last Transaction was more than 24Hours Ago
      @return true if more than 24hours ago false otherwise
    */
    function validateLastTransaction() public view returns (bool){
        uint256 timestamp = block.timestamp - lastTransaction;
        
        if(timestamp < 86400) {
            return true;
        } else {
            return false;
        }
    }

    /**
      @notice Mints a token and sends to `address`
      @param metadataURI the URI where the metadata is stored
      @return The id of the token that was created.
    */
    function awardItem(address recipient, string memory metadataURI)
        public
        returns (uint256)
    {
        validateLastTransaction();
        _tokenIds.increment();
        
        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, metadataURI);
        if(_exists(_tokenIds.current() - 1)) {
            _burn(_tokenIds.current() - 1);
        }
        lastTransaction = block.timestamp;
        return newItemId;
    }
}