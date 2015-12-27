var gm = require( 'gm' ).subClass( {imageMagick: true} ),
    logger = require( './logger' ),
    imageFilename = require( './image-filename' ),
    image = {};

image.decodeFilename = function( filename ) {
    var imageinfo = imageFilename.decode( filename );
    imageinfo.originalFilename = imageFilename.original( filename );
    return imageinfo;
};

image.processing = function( readStream, writeStream, task, callback ) {
    var timeStart = Date.now(),
        message = 'Image processing task | ' + task.hash;

    writeStream.on( 'finish', function() {
        message += ' | ' + (Date.now() - timeStart) + 'ms';
        logger.info( message );
        callback();
    } );

    message += ' | resize ' + task.width + 'x' + task.height;

    var g = gm( readStream ).noProfile();

    if( task.rotation )
    {
        message += ' | rotate ' + task.rotation;
        g = g.rotate( 'white', task.rotation );
    }
    if( task.flip )
    {
        message += ' | flip ';
        g = g.flop();
    }
    g.resize( task.width, task.height )
        .stream()
        .pipe( writeStream );
};

module.exports = image;