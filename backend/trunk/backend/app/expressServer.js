var env = process.env.NODE_ENV || 'production',
    express = require('express'),
    middlewares = require('./middlewares/admin');


var ExpressServer = function(config){
    config = config || {};

    this.expressServer = express();

    // middlewares
    for (var middleware in middlewares){
        this.expressServer.use(middlewares[middleware]);
    }

    if (env == 'development') {
        console.log('Building...');
    }

};

module.exports = ExpressServer;