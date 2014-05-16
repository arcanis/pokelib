/*global define*/

define( [

    'virtjs',

    './TeamPokemon'

], function ( Virtjs, TeamPokemon ) {

    return Virtjs.ClassUtil.extend( {

        initialize : function ( pokelib ) {

            this._pokelib = pokelib;

            this[ 0 ] = new TeamPokemon( this._pokelib, 0 );
            this[ 1 ] = new TeamPokemon( this._pokelib, 1 );
            this[ 2 ] = new TeamPokemon( this._pokelib, 2 );
            this[ 3 ] = new TeamPokemon( this._pokelib, 3 );
            this[ 4 ] = new TeamPokemon( this._pokelib, 4 );
            this[ 5 ] = new TeamPokemon( this._pokelib, 5 );

        },

        length : function ( ) {

            return this._pokelib.readUint8( 0xD163 );

        },

        forEach : function ( fn, context ) {

            for ( var t = 0, T = this.length( ); t < T; ++ t ) {
                fn.call( context, this[ t ], t, this );
            }

        },

        map : function ( fn, context ) {

            var result = [ ];

            for ( var t = 0, T = this.length( ); t < T; ++ t )
                result.push( fn.call( context, this[ t ], t, this ) );

            return result;

        },

        filter : function ( fn, context ) {

            var result = [ ];

            for ( var t = 0, T = this.length( ); t < T; ++ t )
                if ( fn.call( context, this[ t ], t, this ) )
                    result.push( this[ t ] );

            return result;

        }

    } );

} );
