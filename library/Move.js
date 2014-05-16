/*global define*/

define( [

    'virtjs'

], function ( Virtjs ) {

    /**
     * @class Move
     *
     * A class managing a single move.
     *
     * Since species are defined in the ROM, and since the ROM is read-only, it is not possible to change these values.
     */

    return Virtjs.ClassUtil.extend( {

        initialize : function ( pokelib, index ) {

            this._pokelib = pokelib;
            this._index = index;

            this._dataBank = 0x0E;
            this._dataAddress = 0x4000;

        },

        /**
         * Return the move's index.
         *
         * @return {Number} The move's index.
         */

        index : function ( ) {

            return this._index;

        },

        /**
         * Return the move's animation.
         *
         * @return {Number} The move's animation.
         */

        animation : function ( ) {

            return this._pokelib.bankSwitch( this._dataBank, this._dataAddress + 0, 8 );

        },

        /**
         * Return the move's effect.
         *
         * @return {Number} The move's effect.
         */

        effect : function ( ) {

            return this._pokelib.bankSwitch( this._dataBank, this._dataAddress + 1, 8 );

        },

        /**
         * Return the move's power.
         *
         * @return {Number} The move's power.
         */

        power : function ( ) {

            return this._pokelib.bankSwitch( this._dataBank, this._dataAddress + 2, 8 );

        },

        /**
         * Return the move's type.
         *
         * @return {Number} The move's type.
         */

        type : function ( ) {

            return this._pokelib.bankSwitch( this._dataBank, this._dataAddress + 3, 8 );

        },

        /**
         * Return the move's accuracy.
         *
         * @return {Number} The move's accuracy.
         */

        accuracy : function ( ) {

            return this._pokelib.bankSwitch( this._dataBank, this._dataAddress + 4, 8 );

        },

        /**
         * Return the move's base PP.
         *
         * @return {Number} The move's base PP.
         */

        pp : function ( ) {

            return this._pokelib.bankSwitch( this._dataBank, this._dataAddress + 5, 8 );

        }

    } );

} );
