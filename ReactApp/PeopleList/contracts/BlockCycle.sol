pragma solidity ^0.4.0;


contract BlockCycle {

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
	

	function BlockCycle(){
		//initialize liste of materials
	}

	function addMeterial(
						string _name, 
						string _photo, 
						string _description, 
						string __address,
						uint _price){
		materials[materialsCount].id = materialsCount - 1;
		materials[materialsCount].name = _name;
		materials[materialsCount].photo = _photo;
		materials[materialsCount].description = _description;
		materials[materialsCount]._address = __address;
		materials[materialsCount].price = _price;
		materials[materialsCount].sourcer = msg.sender;
		materialsCount++;

	}

	function bookMaterial(uint _id){
		materials[_id].benef = msg.sender;

		if (balances[msg.sender] < materials[_id].price){
			return;
		}else{
			balances[msg.sender] = balances[msg.sender] - materials[_id].price;
			balances[materials[materialsCount].sourcer] = balances[materials[materialsCount].sourcer] + materials[_id].price;
			materials[materialsCount].contributersNumber++;
		}

	}

}