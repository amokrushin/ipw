var os = require( 'os' ),
    logger = require( './logger' ),
    image = require( './image' ),
    ipwVersion = require( '../package.json' ).version,
    controllers = {};

controllers.imageProcessing = function( req, res ) {
    if( !req.bucket ) return res( {success: false, message: 'Bucket required'}, true );
    if( !req.filename ) return res( {success: false, message: 'Filename required'}, true );

    var app = module.parent.exports,
        bucket = app.gcs.bucket( req.bucket ),
        task = image.decodeFilename( req.filename );

    task.sourceFilename = task.originalFilename;
    task.targetFilename = req.filename;

    bucket.file( task.originalFilename ).exists( function( err, originalImageExists ) {
        if( err ) return res( {success: false, message: err.message}, true );
        if( !originalImageExists ) return rmqres( {success: false, message: 'Original image not found'}, true );

        var readStream = bucket.file( task.sourceFilename ).createReadStream(),
            writeStream = bucket.file( task.targetFilename ).createWriteStream();

        image.processing( readStream, writeStream, task, function( err ) {
            if( err ) return rmqres( {success: false, error: err.message}, true );
            res( {success: true, filename: req.filename}, true );
            if( global.gc ) global.gc();
        } );
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

controllers.update = function( req ) {
    if( req.requiredVersion !== ipwVersion )
    {
        process.emit( 'SIGINT' );
    }
};

module.exports = controllers;