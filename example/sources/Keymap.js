/*global define*/

define( [

    'virtjs-gb'

], function ( GameBoy ) {

    return {
        81 : GameBoy.A,    87 : GameBoy.B,
        65 : GameBoy.A,    90 : GameBoy.B,  13 : GameBoy.START, 32 : GameBoy.SELECT,
        37 : GameBoy.LEFT, 38 : GameBoy.UP, 39 : GameBoy.RIGHT, 40 : GameBoy.DOWN
    };

} );
