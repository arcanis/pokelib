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
			if (this._index >= 0xc4) {
				// this item is a TM/HM
				if (this._index <= 0xc8) {
					return "HM0"+(this._index - 0xc3);
				}
				var machNum = this._index - 0xc8;
				if (machNum < 10) return "TM0"+machNum;
				return "TM"+machNum;
			}

            return this._pokelib.bankSwitch( this._nameBank, function ( ) {

                var address = this._baseNameAddress;
				
				var realIndex = this._index - 1;
				if (realIndex < 0) realIndex = 255;

                for ( var t = 0, T = realIndex; t < T; ++ t )
                    address += this._pokelib.readPds( address ).length;

                return utilities.pdsToUtf8( this._pokelib.readPds( address ) );

            }.bind( this ) );

        }

    } );

} );
