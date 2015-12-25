var os = require( 'os' ),
    controllers = {};

controllers.imageProcessing = function( req, res ) {
    res( {
        success: false
    } );
};

controllers.discovery = function( req, res ) {
    var app = module.parent.exports;
    res( {
        host: os.hostname(),
        startedAt: app.startedAt
    } );
};

controllers.updateWorker = function( req, res ) {

};

module.exports = controllers;