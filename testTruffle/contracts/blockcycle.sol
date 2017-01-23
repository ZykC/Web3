pragma solidity ^0.4.2;

contract blockcycle {

	mapping (address => uint) balances;

	struct Material{
		uint id;
		string name;
		string photo;
		string description;
		string _address;
		uint price;
		address sourcer;
		address benef;
		uint contributersNumber;

	}
	
	uint public materialsCount = 0;
	mapping (uint => Material) public materials;
	
	function getMaterialsCount() returns (uint){
		return (materialsCount);
	}



	function blockcycle(){
		//initialize liste of materials
	}

	function toString(address x) returns (string) {
    bytes memory b = new bytes(20);
    for (uint i = 0; i < 20; i++)
        b[i] = byte(uint8(uint(x) / (2**(8*(19 - i)))));
    	return string(b);
	}



	function addMeterial(
						string _name, 
						string _photo, 
						string _description, 
						string __address,
						uint _price,
						address sourcer){
		materials[materialsCount].id = materialsCount;
		materials[materialsCount].name = _name;
		materials[materialsCount].photo = _photo;
		materials[materialsCount].description = _description;
		materials[materialsCount]._address = __address;
		materials[materialsCount].price = _price;
		materials[materialsCount].sourcer = sourcer;
		materials[materialsCount].benef = 0x00000;
		materialsCount++;

	}

	function bookMaterial(uint _id, address benef){
		materials[_id].benef = benef;
/*
		if (balances[msg.sender] < materials[_id].price){
			return;
		}else{
			balances[msg.sender] = balances[msg.sender] - materials[_id].price;
			balances[materials[materialsCount].sourcer] = balances[materials[materialsCount].sourcer] + materials[_id].price;
			materials[materialsCount].contributersNumber++;
		}*/

	}

}

