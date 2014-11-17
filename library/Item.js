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
            if ( this._pokelib.version[ 0 ] == "R/B" ) {
                if ( [ "IT", "FR", "DE" ].indexOf( this._pokelib.version[ 1 ] ) != -1 ) this._baseNameAddress = 0x472D;
                else this._baseNameAddress = 0x472B;
            } else if ( this._pokelib.version[ 0 ] == "R/G" /* jp */ ) this._baseNameAddress = 0x433F;
            else if ( this._pokelib.version[ 0 ] == "Blue" /* jp */ ) this._baseNameAddress = 0x4733;
            else if ( this._pokelib.version[ 0 ] == "Yellow" ) {
                if ( this._pokelib.isJapan( ) ) this._baseNameAddress = 0x45C4;
                else if ( [ "DE", "ES", "FR", "IT" ].indexOf ( this._pokelib.version[ 1 ] ) != -1 ) this._baseNameAddress = 0x45b8;
                else if ( this._pokelib.version[ 1 ] == "EN" ) this._baseNameAddress = 0x45b7;
                else if ( this._pokelib.isJapan( ) ) this._baseNameAddress = 0x45c4;
            }
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
            if ( this._index >= 0xc4 ) {
                // this item is a TM/HM
                // todo: localisation?
                if ( this._index <= 0xc8 ) {
                    return "HM0" + ( this._index - 0xc3 );
                }
                var machNum = this._index - 0xc8;
                if ( machNum < 10 ) return "TM0" + machNum;
                return "TM" + machNum;
            }

            return this._pokelib.bankSwitch( this._nameBank, function ( ) {

                var address = this._baseNameAddress;
                
                var realIndex = ( this._index - 1 ) & 0xff;

                for ( var t = 0, T = realIndex; t < T; ++ t )
                    address += this._pokelib.readPds( address ).length;

                return utilities.pdsToUtf8( this._pokelib.version[ 1 ], this._pokelib.readPds( address ) );

            }.bind( this ) );

        }

    } );

} );
