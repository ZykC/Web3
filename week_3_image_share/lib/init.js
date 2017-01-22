//import Web3 from 'web3';

//window.web3 = new Web3();

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

var contractAddress = "0xeeb3d8b7e4c09af021b73d49ac7434e57319fae1";
var contractABI = [{"constant":false,"inputs":[{"name":"_id","type":"uint256"}],"name":"bookMaterial","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"materialsCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"materials","outputs":[{"name":"id","type":"uint256"},{"name":"name","type":"string"},{"name":"photo","type":"string"},{"name":"description","type":"string"},{"name":"_address","type":"string"},{"name":"price","type":"uint256"},{"name":"sourcer","type":"address"},{"name":"benef","type":"address"},{"name":"contributersNumber","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"string"},{"name":"_photo","type":"string"},{"name":"_description","type":"string"},{"name":"__address","type":"string"},{"name":"_price","type":"uint256"}],"name":"addMeterial","outputs":[],"payable":false,"type":"function"},{"inputs":[],"payable":false,"type":"constructor"}]
var myContract;

var Blockcycle = web3.eth.contract(contractABI);
//var myContract = web3.eth.contract(contractABI).at(contractAddress);
if (Meteor.isClient){

	window.myContract = Blockcycle.at(contractAddress);
}


//console.log(myContract.materialsCount);

if (Meteor.isServer){
  Meteor.startup(function(){
  	

	if (Images.find().count() == 0){
		for (var i=1;i<23;i++){
			Images.insert(
				{
					img_src:"img_"+i+".jpg",
					img_alt:"photo",
					obj_name:"Objet"+i,
		            obj_desc:"Available object",
		            obj_address:"Palaiseau",
		            obj_price:"0 euros",
		            createdOn:new Date(),
            		createdBy:"Company X"
				}
			);
		}// end of for insert images
		// count the images!
		console.log("startup.js says: "+Images.find().count());
	}// end of if have no images
  });
}

