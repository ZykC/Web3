/*jshint esversion:6*/

import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// Import to load these templates
import '../../ui/layouts/app-base.js';

// Pages
import '../../ui/pages/app-home/app-home.js';
import '../../ui/pages/app-register/app-register.js';
import '../../ui/pages/app-market/app-market.js';

// Below here are the route definitions
FlowRouter.route('/', {
  name: 'App.home',
  action() {
    BlazeLayout.render('App_base', { main: 'App_home' });
  },
});

FlowRouter.route('/register', {
  name: 'App.register',
  action() {
    BlazeLayout.render('App_base', { main: 'App_register' }); // use the App_register template
  },
});

FlowRouter.route('/market', {
  name: 'App.market',
  action() {
    BlazeLayout.render('App_base', { main: 'App_market' }); // use the App_market template
  },
});
