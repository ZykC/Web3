// create global `app` namespace
window.app = window.app || {};
// es6 import - notice the capitalized Web3
import Web3 from 'web3';
// initialize web3
window.web3 = new Web3();
// set the provider to our local node
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

Meteor.startup(function () {
    web3.eth.defaultAccount = web3.eth.coinbase;

    // connect to contracts here
    // window.dnsMarketContract = window.DNSMarket.at("0xf415a715539fb251ab1138b6eafdac574bed0542");
    // window.dnsRegistryContract = window.DNSRegistry.at("0xdfff65158c6cc4ec105c625ec7ea592897c2c7e7");
    window.dnsMarketContract = window.DNSMarket.at("0xfa8746caa320a7e4cf8bc03db525bbae76d13d23");
    window.dnsRegistryContract = window.DNSRegistry.at("0xb5aecce9f83811b6d10e3e12629f50db92915589");
});
