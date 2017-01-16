pragma solidity ^0.4.0;

contract Transport {

	string public addressA;
	string public addressB;

	address public object;
	address public transpoter;
	address public initialPossessor;
	address public finalProssessor;

	function public Transport(string _addressA,
							  string _addressB,
							  address _object,
							  address _transpoter,
							  address _initialPossessor,
							  address _finalProssessor){
		addressA = _addressA;
		addressB = _addressB;
		object = _object;
		transpoter = _transpoter;
		initialPossessor = _initialPossessor;
		finalProssessor = _finalProssessor;

	}

	function public aquire(bool aquired) returns (bool aquisition){
		if (aquired == true){
			
		}

	}

}