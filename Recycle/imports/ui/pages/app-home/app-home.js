/*global Template, Session, window, updateAccountInfo*/
/*jshint esversion:6*/

import './app-home.css';
import './app-home.html';

Template.App_home.helpers({
    registeredDomains: function() {
        let to_return = [];

        // get the number of currently registered domains
        let numRegistered = window.dnsRegistryContract.numRegistered().toNumber(10);

        // loop through each registered domain in the contract and add it to an array
        for (let i = 0; i < numRegistered; i++) {
            let domain = window.dnsRegistryContract.registered(i)[0];
            let owner = window.dnsRegistryContract.registered(i)[1];

            to_return.push({
                domain: domain,
                owner: owner
            });
        }

        // return the registered domains array
        return to_return;
    }
});

Template.App_home.events({

});
