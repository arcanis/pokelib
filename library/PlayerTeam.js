/*global define*/

define( [

    'virtjs',

    './TeamPokemon'

], function ( Virtjs, TeamPokemon ) {

    return Virtjs.ClassUtil.extend( {

        initialize : function ( pokelib ) {

            this._pokelib = pokelib;

            this._slots = [

                new TeamPokemon( this._pokelib, 0 ),
                new TeamPokemon( this._pokelib, 1 ),
                new TeamPokemon( this._pokelib, 2 ),
                new TeamPokemon( this._pokelib, 3 ),
                new TeamPokemon( this._pokelib, 4 ),
                new TeamPokemon( this._pokelib, 5 )

            ];

        },

        forEach : function ( /* ... */ ) {

            Array.prototype.forEach.apply( this._slots, arguments );

        }

    } );

} );
