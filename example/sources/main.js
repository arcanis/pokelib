/*global require*/

require( {

    baseUrl : 'sources/',

    paths : {
        'virtjs'    : '../assets/vendors/Virtjs-0.0.2.min',
        'virtjs-gb' : '../assets/vendors/Virtjs.GameBoy-0.0.2.min'
    },

    map : {
        '*' : {
            'pokelib'   : '../../library/Pokelib'
        }
    }

}, [

    'virtjs',
    'virtjs-gb',
    'pokelib',

    './Application',
    './Keymap',
    './save',

    './rom!../assets/roms/pokemonred.gb'

], function ( Virtjs, GameBoy, Pokelib, Application, Keymap, save, rom ) {

    if ( window.localStorage.getItem( 'cartridge.format' ) === null ) {
        // These lines define a default save file for every session. It's not the best way, but it works.
        window.localStorage.setItem( 'cartridge.data.ram', save );
        window.localStorage.setItem( 'cartridge.format', 'J{"ram":null}' );
    }

    // Start a standard Virtjs engine, feeding it the Pokemon Red ROM
    var engine = window.engine = Virtjs.create( GameBoy, {

        skipBios : true,

        devices : {
            screen : new Virtjs.screen.WebGL( ),
            input : new Virtjs.input.Keyboard( { map : Keymap } ),
            timer : new Virtjs.timer.RAFrame( ),
            data : new Virtjs.data.LocalStorage( )
        },

        // Enabling the post-write event enable the Pokelib custom events, allowing to automatically monitor changes
        events : [ 'post-write' ]

    } ).load( rom );

    // Enable the Pokelib on the running emulator, "via" a custom class managing the display
    var application = new Application( window.pokelib = new Pokelib( engine, {
        delayEvents : true
    } ), {
        teamElement : document.querySelector( '#infos' )
    } );

    // Plug the screen on the web page
    document.body.appendChild( engine.devices.screen.canvas );

    // Keep the emulator fullscreen
    var resize = function ( ) { engine.devices.screen.setOutputSize( window.innerWidth, window.innerHeight ); };
    window.addEventListener( 'resize', resize );
    resize( );

} );
