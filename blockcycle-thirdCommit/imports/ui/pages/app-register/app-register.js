import './app-register.css';
import './app-register.html';

Template.App_register.events({
    'submit #register'(event) {
        event.preventDefault();

        // Get value from form element
        const target = event.target;
        const domain = target.domain.value;

        console.log("Registering " + domain);

        // get the current number of registered domains
        let numRegistered = dnsRegistryContract.numRegistered().toNumber(10);

        // loop through the currently registered domains to see if the user's requested domain already exists
        for (let i = 0; i < numRegistered; i++) {
            let rDomain = dnsRegistryContract.registered(i)[0];
            if (rDomain == domain) {
                console.log("Already registered");
                return;
            }
        }

        // register the new DNS with the contract
        window.dnsRegistryContract.registerDNS(domain, {from: window.web3.eth.defaultAccount, gas: 3000000}, function (error, response) {
            if (error) {
                console.log(error);
            } else {
                console.log(response);
            }
        });
    },
});
