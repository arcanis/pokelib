/*global define*/

define( [

    'virtjs'

], function ( Virtjs ) {

    return Virtjs.ClassUtil.extend( {

        initialize : function ( pokelib ) {

            this._pokelib = pokelib;

            this._pokelib.on( 'team.player', function ( ) {
                this._updateTeam( );
            }.bind( this ) );

        },

        _updateTeam : function ( ) {

            var content = this._options.teamElement;
            content.innerHTML = ''; // reset content

            this._pokelib.teams.player.forEach( function ( slot ) {

                if ( slot.species( ) === null )
                    return ;

                var node = document.createElement( 'div' );
                node.className = 'slot';
                content.appendChild( node );

                node.innerHTML = [

                    '<div class="lifebar">',
                    '    <div class="life" style="width: ' + ( slot.currentHP( ) / slot.maxHP( ) * 100 ) + '%"></div>',
                    '</div>',
                    '<div class="sprite">',
                    '    <img src="http://www.pokemonelite2000.com/sprites/rbspr/rbspr' + Virtjs.FormatUtil.decimal( slot.species( ).pokedexId( ), 3 ) + '.png" />',
                    '</div>',
                    '<div class="infos">',
                    '    <div class="name">',
                    '        [' + slot.level( ) + '] ' + slot.name( ),
                    '    </div>',
                    '    <ul class="stats">',
                    '        <li class="attack">' + slot.attack( ) + '</li>',
                    '        <li class="defense">' + slot.defense( ) + '</li>',
                    '        <li class="speed">' + slot.speed( ) + '</li>',
                    '       <li class="special">' + slot.special( ) + '</li>',
                    '   </ul>',
                    '</div>'

                ].join( '' );

            } );

        }

    } );

} );
