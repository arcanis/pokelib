/*global define*/

define( [

    'virtjs',

    './Bag',
    './GrowthRate',
    './Item',
    './Move',
    './OpponentTeam',
    './Opponent',
    './PlayerTeam',
    './Player',
    './Pokedex',
    './Species',
    './utilities'

], function ( Virtjs, Bag, GrowthRate, Item, Move, OpponentTeam, Opponent, PlayerTeam, Player, Pokedex, Species, utilities ) {

    /**
     * @class Pokelib
     *
     * The main class of the library. It contains a handful of utilities, and all the root references to the ROM / RAM elements.
     */

    return Virtjs.ClassUtil.extend( [

        Virtjs.EmitterMixin

    ], {

        /**
         * @property {Player} player
         *
         * A property containing a reference toward the player interface.
         */

        /**
         * @property {Opponent} opponent
         *
         * A property containing a reference toward the opponent interface.
         */

        /**
         * @property {Object} teams
         *
         * A property containing the current Pokemon teams.
         *
         * It's an object containing the following fields:
         *
         * @property {PlayerTeam}   teams.player   The player team interface.
         * @property {OpponentTeam} teams.opponent The opponent team interface.
         */

        /**
         * @property {Pokedex} pokedex
         *
         * A property containing a reference toward the pokedex interface.
         */

        /**
         * @property {Bag} bag
         *
         * A property containing a reference toward the bag interface.
         */

        /**
         * @property {Item[]} items
         *
         * An array containing the list of all items defined in the ROM.
         */

        /**
         * @property {GrowthRate[]} growthRates
         *
         * An array containing the list of all growth rates defined in the ROM.
         */

        /**
         * @property {Species[]} species
         *
         * An array containing the list of all species defined in the ROM.
         */

        /**
         * @property {Move[]} moves
         *
         * An array containing the list of all moves defined in the ROM.
         */

        initialize : function ( engine ) {

            this._engine = engine;

            this.player = new Player( this );
            this.opponent = new Opponent( this );

            this.teams = { };
            this.teams.player = new PlayerTeam( this );
            this.teams.opponent = new OpponentTeam( this );

            this.bag = new Bag( this );

            this.items = [ ];
            for ( var t = 0; t < 255; ++ t )
                this.items[ t ] = new Item( this, t );

            this.growthRates = [ ];
            for ( var t = 0; t < 5; ++ t )
                this.growthRates[ t ] = new GrowthRate( this, t );

            this.species = [ ];
            for ( var t = 0; t < 255; ++ t )
                this.species[ t ] = new Species( this, t );

            this.moves = [ ];
            for ( var t = 0; t < 165; ++ t )
                this.moves[ t ] = new Move( this, t );

            this.pokedex = new Pokedex( this );

            this._events = { };

            this._events.ready = [ 'ready' ];

            this._events.player = [ 'player' ];

            this._events.bag = [ 'bag' ];

            this._events.teams = { };

            this._events.teams.player = [ ];
            this._events.teams.player[ 0 ] = [ 'team.player', { slot : 0 } ];
            this._events.teams.player[ 1 ] = [ 'team.player', { slot : 1 } ];
            this._events.teams.player[ 2 ] = [ 'team.player', { slot : 2 } ];
            this._events.teams.player[ 3 ] = [ 'team.player', { slot : 3 } ];
            this._events.teams.player[ 4 ] = [ 'team.player', { slot : 4 } ];
            this._events.teams.player[ 5 ] = [ 'team.player', { slot : 5 } ];

            this._events.teams.opponent = [ ];
            this._events.teams.opponent[ 0 ] = [ 'team.opponent', { slot : 0 } ];
            this._events.teams.opponent[ 1 ] = [ 'team.opponent', { slot : 1 } ];
            this._events.teams.opponent[ 2 ] = [ 'team.opponent', { slot : 2 } ];
            this._events.teams.opponent[ 3 ] = [ 'team.opponent', { slot : 3 } ];
            this._events.teams.opponent[ 4 ] = [ 'team.opponent', { slot : 4 } ];
            this._events.teams.opponent[ 5 ] = [ 'team.opponent', { slot : 5 } ];

            this._pendingEvents = [ ];

            this._engine.mmu.on( 'post-write', function ( e ) {
                this._checkMemoryWrite( e.address );
            }.bind( this ) );

        },

        /**
         * Return true if the game contains a valid data save.
         *
         * However, please note that the game may be still writing the save in the RAM. You probably should wait a bit (for example by using the delayEvent option ?) to be sure.
         */

        ready : function ( ) {

            // According to my tests, this value will only be equal to 0xFF when a valid save game is being loaded.
            // However, you may have to wait for the save to be fully loaded (the byte is wrote in the first instructions, when there is still other memory space to fill).

            return this._engine.mmu.readUint8( 0xD71B ) === 0xFF;

        },

        /**
         * Read a single byte of data from the current memory space.
         *
         * @param {Number} address The memory address.
         *
         * @return {Number} The byte at the specified address.
         */

        readUint8 : function ( address ) {

            return this._engine.mmu.readUint8( address );

        },

        /**
         * Read two bytes of data from the current memory space, using big endian.
         *
         * @param {Number} address The memory address.
         *
         * @return {Number} The word at the specified address.
         */

        readUint16 : function ( address ) {

            return ( this.readUint8( address + 0 ) << 8 )
                 | ( this.readUint8( address + 1 ) << 0 );

        },

        /**
         * Read three bytes of data from the current memory space, using big endian.
         *
         * @param {Number} address The memory address.
         *
         * @return {Number} The dword at the specified address.
         */

        readUint24 : function ( address ) {

            return ( this.readUint16( address + 0 ) << 8 )
                 | ( this.readUint8( address + 2 ) << 0 );

        },

        /**
         * Read four bytes of data from the current memory space, using big endian.
         *
         * @param {Number} address The memory address.
         *
         * @return {Number} The dword at the specified address.
         */

        readUint32 : function ( address ) {

            return ( this.readUint16( address + 0 ) << 16 )
                 | ( this.readUint16( address + 2 ) << 0 );

        },

        /**
         * Read a Pokemon Data String from the current memory space. Runs up to the next 0x50 character.
         *
         * @param {Number} address The memory address.
         *
         * @return {Array} A Pokemon Data String.
         */

        readPds : function ( address ) {

            var pds = [ ];

            do {

                var character = this.readUint8( address );
                address += 1;

                pds.push( character );

            } while ( character !== 0x50 );

            return pds;

        },

        /**
         * Write a single byte of data into the current memory space.
         *
         * @param {Number} address The memory address.
         * @param {Number} value   The new value.
         */

        writeUint8 : function ( address, value ) {

            this._engine.mmu.writeUint8( address, value );

        },

        /**
         * Write two bytes of data into the current memory space, using big endian.
         *
         * @param {Number} address The memory address.
         * @param {Number} value   The new value.
         */

        writeUint16 : function ( address, value ) {

            this.writeUint8( address + 0, ( value & 0xFF00 ) >> 8 );
            this.writeUint8( address + 1, ( value & 0x00FF ) >> 0 );

        },

        /**
         * Write three bytes of data into the current memory space, using big endian.
         *
         * @param {Number} address The memory address.
         * @param {Number} value   The new value.
         */

        writeUint24 : function ( address, value ) {

            this.writeUint16( address + 0, ( value & 0xFFFF00 ) >> 8 );
            this.writeUint8( address + 2, ( value & 0x0000FF ) >> 0 );

        },

        /**
         * Write four bytes of data into the current memory space, using big endian.
         *
         * @param {Number} address The memory address.
         * @param {Number} value   The new value.
         */

        writeUint32 : function ( address, value ) {

            this.writeUint16( address + 0, ( value & 0xFFFF0000 ) >> 16 );
            this.writeUint16( address + 2, ( value & 0x0000FFFF ) >> 0 );

        },

        /**
         * Write a Pokemon Data String into the current memory space.
         *
         * @param {Number} address The memory address.
         * @param {Number} pds     The Pokemon Data String.
         */

        writePds : function ( address, pds ) {

            var length = pds.indexOf( 0x50 );

            if ( length === - 1 ) {
                length = pds.length;
            } else {
                length += 1;
            }

            for ( var t = 0; t < length; ++ t ) {
                this.writeUint8( address + t, pds[ t ] );
            }

        },

        /**
         * Switch the current ROM bank, then instantly call the `fn` callback. When this function returns, the original ROM bank is restaured. This function is synchronous.
         *
         * @param {Number}    bank   A ROM bank number.
         * @param {Function}  fn     A callback called when the ROM bank is changed.
         * @param {Number}   [size]  The address size. Used only when `fn` is an address.
         *
         * @return {*} The valued returned by the callback.
         */

        bankSwitch : function ( bank, fn, size ) {

            var result;
            var currentBank = this._engine.environment.mbc3RomBank;

            this._engine.mmu.writeUint8( 0x2000, bank );

            if ( typeof fn === 'function' ) {
                result = fn( );
            } else {
                result = this[ 'readUint' + size ]( fn );
            }

            this._engine.mmu.writeUint8( 0x2000, currentBank );

            return result;

        },

        _checkMemoryWrite : function ( address ) {

            if ( address === 0xD71B && this.ready( ) )
                return this._scheduleEvent( this._events.ready );

            if ( address >= 0xD31E && address <= 0xD345 )
                return this._scheduleEvent( this._events.bag );

            if ( address >= 0xD16B && address <= 0xD272 )
                return this._scheduleEvent( this._events.teams.player[ Math.floor( ( address - 0xD16B ) / 44 ) ] );

            if ( address >= 0xD2B5 && address <= 0xD2F6 )
                return this._scheduleEvent( this._events.teams.player[ Math.floor( ( address - 0xD2B5 ) / 11 ) ] );

            if ( address >= 0xD158 && address <= 0xD162 )
                return this._scheduleEvent( this._events.player );
            if ( address >= 0xD347 && address <= 0xD349 )
                return this._scheduleEvent( this._events.player );

            return void 0;

        },

        _scheduleEvent : function ( eventDescriptor ) {

            if ( this._options.delayEvents ) {

                var offset = this._pendingEvents.indexOf( eventDescriptor );

                if ( offset !== - 1 )
                    this._pendingEvents.splice( offset, 1 );

                this._pendingEvents.push( eventDescriptor );

                if ( ! this._eventEmitterDelay ) {

                    this._eventEmitterDelay = window.setTimeout( function ( ) {
                        this._eventEmitterDelay = undefined;
                        this._dispatchEvents( );
                    }.bind( this ), 0 );

                }

            } else {

                this.emit( eventDescriptor[ 0 ], eventDescriptor[ 1 ] );

            }

        },

        _dispatchEvents : function ( ) {

            var events = this._pendingEvents;
            this._pendingEvents = [ ];

            for ( var t = 0, T = events.length; t < T; ++ t ) {
                this.emit( events[ t ][ 0 ], events[ t ][ 1 ] );
            }

        }

    }, {

        utilities : utilities

    } );

} );
