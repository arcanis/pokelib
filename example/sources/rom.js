/*global define*/

define( [

], function ( ) {

    return {

        load : function ( name, req, onload, config ) {

            var xhr = new XMLHttpRequest( );

            xhr.open( 'GET', req.toUrl( name ), true );

            xhr.responseType = 'arraybuffer';

            xhr.addEventListener( 'load', function ( ) {
                onload( xhr.response );
            } );

            xhr.send( null );

        }

    };

} );
