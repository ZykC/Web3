contract blockcycle {mapping (address => uint) balances; struct Material{uint id;string name;string photo;string description;string _address;uint price;address sourcer;address benef;uint contributersNumber;}	uint public materialsCount = 0;	mapping (uint => Material) public materials;	function blockcycle(){	}	function addMeterial(	string _name,string _photo,	string _description,string __address,uint _price){	materials[materialsCount].id = materialsCount;	materials[materialsCount].name = _name;	materials[materialsCount].photo = _photo;materials[materialsCount].description = _description;	materials[materialsCount]._address = __address;	materials[materialsCount].price = _price;	materials[materialsCount].sourcer = msg.sender;	materials[materialsCount].benef = 0x00000;	materialsCount++;}	function bookMaterial(uint _id){materials[_id].benef = msg.sender;}}

var blockcycleDeplyed = BlockcycleABI.new(
   {
     from: web3.eth.accounts[0], 
     data: BlockcycleCompiled.blockcycle.code, 
     gas: '4700000'
   }, function (e, contract){
    console.log(e, contract);
    if (typeof contract.address !== 'undefined') {
         console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
    }
 })
contract address: 0x75fe7f57dbb0cddbb97defba2e5199f41476c082

BlockcycleABI = [{
      constant: false,
      inputs: [{...}],
      name: "bookMaterial",
      outputs: [],
      payable: false,
      type: "function"
  }, {
      constant: true,
      inputs: [],
      name: "materialsCount",
      outputs: [{...}],
      payable: false,
      type: "function"
  }, {
      constant: true,
      inputs: [{...}],
      name: "materials",
      outputs: [{...}, {...}, {...}, {...}, {...}, {...}, {...}, {...}, {...}],
      payable: false,
      type: "function"
  }, {
      constant: false,
      inputs: [{...}, {...}, {...}, {...}, {...}],
      name: "addMeterial",
      outputs: [],
      payable: false,
      type: "function"
  }, {
      inputs: [],
      payable: false,
      type: "constructor"
  }]

  myContract.addMeterial("Material1", "Photo1", "Description1", "Address1", 15, function(error, result){
  	if(!error)
  		console.log("resutl: "+result)
  	else
  		console.log("error: "+error)
  })

  metamask 8545 : 0x7E279DEa1BE831cCE007BA3C74a28277f8c277d1
  