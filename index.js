'use strict';

var express = require('express');
var kraken = require('kraken-js');
var cors = require('cors');
var expressJwt = require('express-jwt');
var utils = require('./utils');


var options, app;

/*
 * Create and configure application. Also exports application instance for use by tests.
 * See https://github.com/krakenjs/kraken-js#options for additional configuration options.
 */
options = {
    onconfig: function (config, next) {
        /*
         * Add any additional config setup or overrides here. `config` is an initialized
         * `confit` (https://github.com/krakenjs/confit/) configuration object.
         */
        next(null, config);
    }
};

var corsOptions = {
    origin: function (origin, callback) {
        callback(null, true);
        // if (whitelist.indexOf(origin) !== -1) {
        //     callback(null, true)
        // } else {
        //     callback(new Error('Not allowed by CORS'))
        // }
    }
};





app = module.exports = express();
app.use(kraken(options));
app.use('/users',cors(corsOptions));
app.use('/images',cors(corsOptions));


app.use('/*',expressJwt({
    secret: utils.getSecret,
    getToken: utils.getToken,
}).unless({ path: ['/users/authenticate','/users/register'] }));


app.on('start', function () {
    console.log('Application ready to serve requests.');
    console.log('Environment: %s', app.kraken.get('env:env'));
});
