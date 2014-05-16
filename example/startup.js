/*global define, Virtjs, require, angular*/

define( 'virtjs', function ( ) {

    return Virtjs;

} );

require( [

    'pokelib',

    'sources/save'

], function ( Pokelib, save ) {

    window.Pokelib = Pokelib;

    if ( window.localStorage.getItem( 'main.cartridge.format' ) === null ) {
        // These lines define a default save file for every session. It's not the best way, but it works.
        window.localStorage.setItem( 'main.cartridge.data.ram', save );
        window.localStorage.setItem( 'main.cartridge.format', 'J{"ram":null}' );
    }

    angular.element( document ).ready( function ( ) {
        angular.bootstrap( document, [ 'application' ] );
    } );

} );
