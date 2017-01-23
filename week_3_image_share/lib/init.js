//import Web3 from 'web3';

//window.web3 = new Web3();

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}
//ETH_CLIENT = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

var contractAddress = "0x75fe7f57dbb0cddbb97defba2e5199f41476c082";
//var contractAddress = "0xD586c4a412F695f929C493aBc89f804a5a72D072";
//var contractABI = [{"constant":false,"inputs":[{"name":"_id","type":"uint256"}],"name":"bookMaterial","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"materialsCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"materials","outputs":[{"name":"id","type":"uint256"},{"name":"name","type":"string"},{"name":"photo","type":"string"},{"name":"description","type":"string"},{"name":"_address","type":"string"},{"name":"price","type":"uint256"},{"name":"sourcer","type":"address"},{"name":"benef","type":"address"},{"name":"contributersNumber","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"string"},{"name":"_photo","type":"string"},{"name":"_description","type":"string"},{"name":"__address","type":"string"},{"name":"_price","type":"uint256"}],"name":"addMeterial","outputs":[],"payable":false,"type":"function"},{"inputs":[],"payable":false,"type":"constructor"}]

var contractABI = [
      {
        "constant": false,
        "inputs": [
          {
            "name": "x",
            "type": "address"
          }
        ],
        "name": "toString",
        "outputs": [
          {
            "name": "",
            "type": "string"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [],
        "name": "getMaterialsCount",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "materialsCount",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_id",
            "type": "uint256"
          },
          {
            "name": "benef",
            "type": "address"
          }
        ],
        "name": "bookMaterial",
        "outputs": [],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_name",
            "type": "string"
          },
          {
            "name": "_photo",
            "type": "string"
          },
          {
            "name": "_description",
            "type": "string"
          },
          {
            "name": "__address",
            "type": "string"
          },
          {
            "name": "_price",
            "type": "uint256"
          },
          {
            "name": "sourcer",
            "type": "address"
          }
        ],
        "name": "addMeterial",
        "outputs": [],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "materials",
        "outputs": [
          {
            "name": "id",
            "type": "uint256"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "photo",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "_address",
            "type": "string"
          },
          {
            "name": "price",
            "type": "uint256"
          },
          {
            "name": "sourcer",
            "type": "address"
          },
          {
            "name": "benef",
            "type": "address"
          },
          {
            "name": "contributersNumber",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "inputs": [],
        "payable": false,
        "type": "constructor"
      }
    ]
var myContract;




var Blockcycle = web3.eth.contract(contractABI);
//var myContract = web3.eth.contract(contractABI).at(contractAddress);
if (Meteor.isClient){

	window.myContract =  web3.eth.contract(contractABI).at("0x384da65d3064daa76d8d72abe8ff749550499d78");
}


//console.log(myContract.materialsCount);

if (Meteor.isServer){
  Meteor.startup(function(){
  	

	if (Images.find().count() == 0){

		Images.insert(
			{
				img_src:"img_1"+".jpg",
				img_alt:"photo",
				obj_name:"Donne bureau",
	            obj_desc:"Je donne un bureau en bois, avec trois tiroirs.bon état général.a venir chercher sur place, démonté.",
	            obj_address:"Paris, 20eme arrondissement",
	            obj_price:"0 euros",
	            createdOn:new Date(),
        		createdBy:"MRI T51"
			}
		);

		Images.insert(
			{
				img_src:"img_2"+".jpg",
				img_alt:"photo",
				obj_name:"Donne ordinateur acer",
	            obj_desc:"Donne ordinateur car achat de neuf, peut être utiliser en l'état ou pour les pièces.merci",
	            obj_address:"7, boulevard Gaspard Monge, 91120, Palaiseau",
	            obj_price:"0 euros",
	            createdOn:new Date(),
        		createdBy:"EDF R&D Sacalay"
			}
		);

		Images.insert(
			{
				img_src:"img_3"+".jpg",
				img_alt:"photo",
				obj_name:"Donne machine à café nespresso",
	            obj_desc:"Magimix nespresso qui pour une raison je ne comprends pas l'eau ne se verse pas. un bloquage quelque part mais le moteur marche.",
	            obj_address:"6, quai de Watier, 78401 CHATOU cedex",
	            obj_price:"0 euros",
	            createdOn:new Date(),
        		createdBy:"EDF R&D Chatou"
			}
		);

		// count the images!
		console.log("startup.js says: "+Images.find().count());
	}// end of if have no images
  });
}

