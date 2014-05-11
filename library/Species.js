define( [

    'virtjs'

], function ( Virtjs ) {

    return Virtjs.ClassUtil.extend( {

        initialize : function ( pokelib, index ) {

            this._pokelib = pokelib;
            this._index = index;

        },

        indexedexId : function ( ) {

            return this._index;

        },

        pokedexId: function ( ) {

            return this._pokelib.bankSwitch( 0x10, function ( ) {
                return this._pokelib.readUint8( 0x5024 + this._index );
            }.bind( this ) );

        }

    } );

} );
