module.exports = function(deployer) {
  deployer.deploy(ConvertLib);
  deployer.autolink();
  //deployer.deploy(People);
  //deployer.deploy(DNSRegistry);
 // deployer.deploy(DNSMarket);
  deployer.deploy(BlockCycle);
};
