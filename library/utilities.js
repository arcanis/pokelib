/*global define*/

define( [

    'virtjs'

], function ( Virtjs ) {

    return {

        unserializeString : function ( value ) {

            // 0x50 is a End-Of-Text character

            var end = value.indexOf( 0x50 );

            if ( end !== - 1 )
                value = value.slice( 0, end );

            return String.fromCharCode.apply( String, value.map( function ( n ) {

                if ( n === 0x7F )
                    return 32;

                if ( n >= 0x80 && n <= 0x99 )
                    return 65 + n - 0x80;

                if ( n >= 0x9A && n <= 0x9F )
                    return '():;[]'.charCodeAt( n - 0x9A );

                if ( n >= 0xA0 && n <= 0xB9 )
                    return 97 + n - 0xA0;

                if ( n >= 0xF6 && n <= 0xFF )
                    return 48 + n - 0xF6;

                return null;

            } ).filter( function ( n ) {

                return ! isNaN( n );

            } ) );

        }

    };

} );
