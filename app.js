var async = require( 'async' ),
    logger = require( './lib/logger' ),
    rmq = require( 'am-rmq' )( logger ),
    controllers = require( './lib/controllers' ),
    app = {};

app.startedAt = Date.now();

logger.info( 'Image processing worker loaded' );

process.on( 'message', function( data ) {
    switch( data.msg )
    {
        case 'settings':
            app.settings = data.content;
            onSettingsReceived();
            break;
        case 'uuid':
            app.uuid = data.content;
            logger.info( 'Worker UUID', app.uuid );
            break;
        default:
            logger.warn( 'Unknown worker process message received' );
    }
} );

function onSettingsReceived() {
    rmq.connect( app.settings.rmq );
    logger.info( 'Image processing worker started' );
}

function onExit() {
    logger.info( 'SIGINT' );
}

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