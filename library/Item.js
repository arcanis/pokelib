define( [

    'virtjs',

    './utilities'

], function ( Virtjs, utilities ) {

    /**
     * @class Item
     *
     * A class managing a single item.
     *
     * Since items are defined in the ROM, and since the ROM is read-only, it is not possible to change these values.
     */

    return Virtjs.ClassUtil.extend( {

        initialize : function ( pokelib, index ) {

            this._pokelib = pokelib;
            this._index = index;

            this._nameBank = 0x01;
            this._baseNameAddress = 0x472B;

        },

        /**
         */

        index : function ( ) {

            return this._index;

        },

        /**
         * Return the item's name.
         *
         * @return {String} The item name.
         */

        name : function ( ) {

            return this._pokelib.bankSwitch( this._nameBank, function ( ) {

                var address = this._baseNameAddress;

                for ( var t = 0, T = this._index; t < T; ++ t )
                    address += this._pokelib.readPds( address ).length;

                return utilities.pdsToUtf8( this._pokelib.readPds( address ) );

            }.bind( this ) );

        }

    } );

} );
