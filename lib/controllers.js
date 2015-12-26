var os = require( 'os' ),
    controllers = {},
    ipwVersion = require( '../package.json' ).version;

controllers.imageProcessing = function( req, res ) {
    res( {
        success: false
    } );
};

controllers.discovery = function( req, res ) {
    var app = module.parent.exports;
    res( {
        uuid: app.uuid,
        version: ipwVersion,
        host: os.hostname(),
        startedAt: app.startedAt
    } );
};

controllers.update = function( req, res ) {
    if( req.requiredVersion !== ipwVersion )
    {
        process.emit( 'SIGINT' );
    }
};

module.exports = controllers;