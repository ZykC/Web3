import './app-market.css';
import './app-market.html';

Template.App_market.helpers({
    userDomains: function() {
        let to_return = [];
        let numDomains = window.dnsRegistryContract.ownedByIndex(window.web3.eth.accounts[0]);

        for (var i = 0; i < numDomains; i++) {
            let domain = window.dnsRegistryContract.ownedBy(window.web3.eth.accounts[0], i);
            if (domain.length > 1) {
                to_return.push(domain);
            }
        }

        return to_return;
    },
    domainsForSale: function() {
        let to_return = [];
        let numSales = window.dnsMarketContract.nextSaleId().toNumber(10);

        for (var i = 0; i < numSales; i++) {
            var sale = window.dnsMarketContract.sales(i);
            if (sale[1] != "0x0000000000000000000000000000000000000000") {
                var saleObj = {saleId:i, domain:sale[0], seller:sale[1], price:sale[2]};

                to_return.push(saleObj);
            }
        }

        return to_return;
    }
});

Template.App_market.events({
    'submit .buyDomain'(event) {
        event.preventDefault();

        // Get value from form element
        const target = event.target;
        const saleId = target.saleId.value;

        var sale = window.dnsMarketContract.sales(saleId);
        console.log(sale);

        window.dnsMarketContract.buy(saleId, {from: window.web3.eth.accounts[0], gas: 3000000, value:sale[2].toNumber(10)}, function (error, response) {
            if (error) {
                console.log(error);
            } else {
                console.log(response);
            }
        });
    },
    'submit .sellDomain'(event) {
        event.preventDefault();

        // Get value from form element
        const target = event.target;
        const domain = target.domain.value;
        const price = target.price.value;

        console.log(domain);
        console.log(price);

        window.dnsMarketContract.sell(domain, price, {from:window.web3.eth.accounts[0], gas:3000000}, function (error, response) {
            if (error) {
                console.log(error);
            } else {
                console.log(response);
            }
        });
    },
});
