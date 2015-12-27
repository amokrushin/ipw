var async = require( 'async' ),
    logger = require( './lib/logger' ),
    rmq = require( 'am-rmq' )( logger ),
    controllers = require( './lib/controllers' ),
    gcloud = require( 'gcloud' ),
    app = {};

app.startedAt = Date.now();

logger.info( 'Image processing worker loaded' );

process.on( 'message', function( data ) {
    switch( data.msg )
    {
        case 'settings':
            app.settings = data.content;
            initApp();
            break;
        case 'uuid':
            app.uuid = data.content;
            logger.info( 'Worker UUID', app.uuid );
            break;
        default:
            logger.warn( 'Unknown worker process message received' );
    }
} );


function initApp() {
    rmq.connect( app.settings.rmq );

    app.gcs = gcloud.storage( {
        projectId: app.settings.gcs.projectId,
        credentials: {
            client_email: app.settings.gcs.credentials.clientEmail,
            private_key: app.settings.gcs.credentials.privateKey
        }
    } );

    rmq.onBroadcast( 'ipw.discovery', controllers.discovery );
    rmq.onBroadcast( 'ipw.update', controllers.update );
    rmq.onQueue( 'ipw.request', {ack: true}, controllers.imageProcessing );

    logger.info( 'Image processing worker started' );
}

function onExit() {
    logger.info( 'SIGINT' );
}

process.on( 'SIGINT', function() {
    onExit();
    setTimeout( function() {
        logger.info( 'EXIT' );
        process.exit();
    }, 300 );
} );

module.exports = app;