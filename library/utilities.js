/*global define*/

define( [

    'virtjs'

], function ( Virtjs ) {

    var pdsSpecialCharacters = [ 0x60, 0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6A, 0x6B, 0x6C, 0x6D, 0xBB, 0xBC, 0xBD, 0xBE, 0xBF, 0xE1, 0xE2, 0xE4, 0xE5, 0xF0 ];
    var pdsRegularCharacters = '�������������:ィゥ‘’“”·⋯ぁぇえ╔═╗║╚╝ ABCDEFGHIJKLMNOPQRSTUVWXYZ():;[]abcdefghijklmnopqrstuvwxyzé�����                                ���-��?!.ァ���▷▶▼♂�×./,♀0123456789';

    return {

        /**
         * Convert a Pokemon Data String into UTF-8. You should probably not use this method manually, since most of this library's methods are already using it internally.
         *
         * Note that some characters (such as PkMn) cannot be represented with the UTF-8 encoding. In such case, the result will depends on the optional parameter. If the `allowPrivateSpaceUnicode` is falsy, these characters will be replaced by the unicode character \uFFFD. In any other case, they will be replaced by their private-space unicode counterparts (ie. that the 0xF0 character will become \uE0F0, and similar).
         *
         * @private
         *
         * @param {Array}    value                           A Pokemon Data String.
         * @param {Boolean} [allowPrivateSpaceUnicode=false] An option affecting the output.
         *
         * @return {String} An UTF-8 string.
         */

        pdsToUtf8 : function ( value, allowPrivateSpaceUnicode ) {

            if ( typeof allowPrivateSpaceUnicode === 'undefined' )
                allowPrivateSpaceUnicode = false;

            // 0x50 is a End-Of-Text character
            // We have to ignore any following character

            var end = value.indexOf( 0x50 );

            if ( end !== - 1 )
                value = value.slice( 0, end );

            return String.fromCharCode.apply( String, value.map( function ( n ) {

                if ( allowPrivateSpaceUnicode && pdsSpecialCharacters.indexOf( n ) !== - 1 )
                    return 0xE000 + pdsSpecialCharacters;

                if ( n >= 0x60 && n < 0x60 + pdsRegularCharacters.length )
                    return pdsRegularCharacters.charCodeAt( n - 0x60 );

                return null;

            } ).filter( function ( n ) {

                return ! isNaN( n );

            } ) );

        },

        /**
         * Convert UTF-8 into a Pokemon Data String. You should probably not use this method manually, since most of this library's methods are already using it internally.
         *
         * @private
         *
         * @param {String} utf8String An UTF-8 string.
         *
         * @return {Array} A Pokemon Data String.
         */

        utf8ToPds : function ( utf8String ) {

            return utf8String.split( '' ).map( function ( character ) {

                var charCode = character.charCodeAt( 0 );

                if ( charCode === 0xFFFD )
                    // The 'Unknown Character' symbol should never match
                    return null;

                if ( ( charCode & 0xFF00 ) === 0xE000 && pdsSpecialCharacters.indexOf( charCode & 0x00FF ) )
                    return charCode & 0x00FF;

                var pdsCharCode = pdsRegularCharacters.indexOf( character );

                if ( pdsCharCode !== - 1 )
                    return 0x60 + pdsCharCode;

                return null;

            } ).filter( function ( n ) {

                return ! isNaN( n );

            } ).concat( [ 0x50 ] );

        }

    };

} );
