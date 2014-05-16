/*global define*/

define( [

    'virtjs'

], function ( Virtjs ) {

    /**
     * @class GrowthRate
     *
     * A class used to compute the level of a Pokemon according to its experience.
     *
     * Internally, it is a third-degree polynomial function (ax³+bx²+cx+d).
     */

    return Virtjs.ClassUtil.extend( {

        initialize : function ( pokelib, index ) {

            this._pokelib = pokelib;
            this._index = index;

            this._bank = 0x16;
            this._address = 0x501D + index * 4;

        },

        /**
         * Return the A, B, C and D values used in the polynomial expression.
         *
         * @return {Object} The polynomial values:
         * @return {Number} return.a
         * @return {Number} return.b
         * @return {Number} return.c
         * @return {Number} return.d
         */

        parameters : function ( ) {

            return this._pokelib.bankSwitch( this._bank, function ( ) {

                var w = this._pokelib.readUint8( this._address + 0 );
                var x = this._pokelib.readUint8( this._address + 1 );
                var y = this._pokelib.readUint8( this._address + 2 );
                var z = this._pokelib.readUint8( this._address + 3 );

                return {
                    a : ( ( w & 0xF0 ) >> 4 ) / ( ( w & 0x0F ) >> 0 ),
                    b : ( x & 0x7F ) * ( x & 0x80 ? - 1 : 1 ),
                    c : y, d : - z
                };

            }.bind( this ) );

        },

        /**
         * Compute the level given by a specific experience amount.
         *
         * Please note that calling this function is pretty expensive; a lot of calculations are made in order to prevent rounding issues.
         *
         * @param {Number} experience The experience amount.
         *
         * @return {Number} The related level.
         */

        experienceToLevel : function ( experience ) {

            // I'm gonna be clear here : I have no idea how it works exactly (well, I learned it in high school but ... long time no see).
            // The formula comes from http://www3.telus.net/thothworks/Quad3Deg.html and seems right.

            var p = this.parameters( );
            var a = p.a, b = p.b, c = p.c, d = p.d - experience;

            b /= a; c /= a; d /= a;

            var q = ( 3 * c - Math.pow( b, 2 ) ) / 9;
            var r = ( - 27 * d + b * ( 9 * c - 2 * Math.pow( b, 2 ) ) ) / 54;

            var discrim = Math.pow( q, 3 ) + Math.pow( r, 2 );

            if ( discrim <= 0 ) // more than one real solution. That should never happen (assertion).
                throw new Error( 'The growth rate can have multiple levels for a same experience amount. Wtf?' );

            var s = r + Math.sqrt( discrim );
            s = s < 0 ? - Math.pow( - s, 1 / 3 ) : Math.pow( s, 1 / 3 );

            var t = r - Math.sqrt( discrim );
            t = t < 0 ? - Math.pow( - t, 1 / 3 ) : Math.pow( t, 1 / 3 );

            var root = - ( b / 3 ) + s + t;

            var up = Math.ceil( root );
            if ( experience >= this.levelToExperience( up ) )
                return up;

            return Math.floor( root );

        },

        /**
         * Compute the minimal experience amount required to get to a specific level.
         *
         * @param {Number} level The level.
         *
         * @return {Number} The experience amount.
         */

        levelToExperience : function ( level ) {

            var p = this.parameters( );

            var a = p.a, b = p.b, c = p.c, d = p.d;
            var n = level;

            return Math.floor( a * Math.pow( n, 3 ) + b * Math.pow( n, 2 ) + c * n + d );

        }

    } );

} );
