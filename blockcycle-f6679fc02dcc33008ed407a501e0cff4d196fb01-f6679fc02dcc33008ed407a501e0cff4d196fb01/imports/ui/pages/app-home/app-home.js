/*global Template, Session, window, updateAccountInfo*/
/*jshint esversion:6*/

import './app-home.css';
import './app-home.html';

Template.App_home.helpers({

	registeredDomains: function() {
        let to_return = [];
        var cursor = Materials.find();
        // get the number of currently registered domains
      //  let numRegistered = window.dnsRegistryContract.numRegistered().toNumber(10);

        // loop through each registered domain in the contract and add it to an array
       console.log("Materials count: "+Materials.find().count())

      	cursor.forEach(function(x) {

      			let obj_name = x.obj_name;
	            let obj_desc = x.obj_desc;
	            let obj_weight = x.obj_weight;
	            let obj_val = x.obj_val;
	            let obj_price = x.obj_price;

            	to_return.push({
	              name: obj_name,
	             	desc: obj_desc,
	            	weight: obj_weight,
	            	val: obj_val,
	            	price: obj_price
            	});

				});

            
     

        // return the registered domains array
        return to_return;
    }
    //
});

Template.App_home.events({


});
