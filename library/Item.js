define( [

    'virtjs',

    './utilities'

], function ( Virtjs, utilities ) {

    return Virtjs.ClassUtil.extend( {

        initialize : function ( engine, index ) {

            this._engine = engine;
            this._index = index;

        },

        name : function ( ) {

            return utilities.readString( this._engine, 0xCD6D );

        }

    } );

} );
