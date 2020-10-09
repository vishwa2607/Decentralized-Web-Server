pragma solidity 0.5.16;

contract Meme {
	// Smart Contract Code 

	string memeHash;
	//Write Function
	function set(string memory _memeHash) public {
       memeHash = _memeHash;
	}

	//Read Function

	function get() public view returns (string memory) {
	  return memeHash;
	}
}
