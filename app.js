var async = require( 'async' ),
    logger = require( './lib/logger' ),
    rmq = require( 'am-rmq' )( logger ),
    controllers = require( './lib/controllers' ),
    app = {};

app.startedAt = Date.now();

function waitSettings( callback ) {
    logger.info( 'Waiting for settings...' );
    process.on( 'message', function( data ) {
        if( data.msg === 'settings' )
        {
            logger.info( 'Settings were received' );
            callback( null, data.content );
        }
    } );
}

function onExit() {
    logger.info( 'SIGINT' );
}

waitSettings( function( err, settings ) {
    app.settings = settings;
    rmq.connect( settings.rmq );
} );

rmq.onBroadcast( 'ipw.discovery', controllers.discovery );
rmq.onBroadcast( 'ipw.update', controllers.update );
rmq.onQueue( 'ipw.image-processing', {ack: true}, controllers.imageProcessing );

process.on( 'SIGINT', function() {
    onExit();
    setTimeout( function() {
        logger.info( 'EXIT' );
        process.exit();
    }, 300 );
} );

module.exports = app;