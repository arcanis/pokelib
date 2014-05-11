/*global define*/

define( [

    'virtjs',

    './Bag',
    './Item',
    './OpponentTeam',
    './Opponent',
    './PlayerTeam',
    './Player',
    './Pokedex',
    './Species'

], function ( Virtjs, Bag, Item, OpponentTeam, Opponent, PlayerTeam, Player, Pokedex, Species ) {

    return Virtjs.ClassUtil.extend( [

        Virtjs.EmitterMixin

    ], {

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

            this.species = [ ];
            for ( var t = 0; t < 255; ++ t )
                this.species[ t ] = new Species( this, t );

            this.pokedex = new Pokedex( this );

            this._events = { };

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

        readUint8 : function ( address ) {

            return this._engine.mmu.readUint8( address );

        },

        readUint16 : function ( address ) {

            return ( this.readUint8( address + 0 ) << 8 )
                 | ( this.readUint8( address + 1 ) << 0 );

        },

        readUint24 : function ( address ) {

            return ( this.readUint16( address + 0 ) << 8 )
                 | ( this.readUint8( address + 2 ) << 0 );

        },

        readUint32 : function ( address ) {

            return ( this.readUint16( address + 0 ) << 16 )
                 | ( this.readUint16( address + 2 ) << 0 );

        },

        writeUint8 : function ( address, value ) {

            this._engine.mmu.writeUint8( address, value );

        },

        writeUint16 : function ( address, value ) {

            this.writeUint8( address + 0, ( value & 0xFF00 ) >> 8 );
            this.writeUint8( address + 1, ( value & 0x00FF ) >> 0 );

        },

        writeUint24 : function ( address, value ) {

            this.writeUint16( address + 0, ( value & 0xFFFF00 ) >> 8 );
            this.writeUint16( address + 2, ( value & 0x0000FF ) >> 0 );

        },

        writeUint32 : function ( address, value ) {

            this.writeUint16( address + 0, ( value & 0xFFFF0000 ) >> 16 );
            this.writeUint16( address + 2, ( value & 0x0000FFFF ) >> 0 );

        },

        bankSwitch : function ( bank, fn ) {

            var currentBank = this._engine.environment.mbc3RomBank;

            this._engine.mmu.writeUint8( 0x2000, 0x10 );
            var result = fn( );
            this._engine.mmu.writeUint8( 0x2000, currentBank );

            return result;

        },

        _checkMemoryWrite : function ( address ) {

            if ( address >= 0xD31E && address <= 0xD345 )
                return this._scheduleEvent( this._events.bag );

            if ( address >= 0xD16B && address <= 0xD272 )
                return this._scheduleEvent( this._events.teams.player[ Math.floor( ( address - 0xD16B ) / 44 ) ] );

            if ( address >= 0xD2B5 && address <= 0xD2F6 )
                return this._scheduleEvent( this._events.teams.player[ Math.floor( ( address - 0xD2B5 ) / 11 ) ] );

            return void 0;

        },

        _scheduleEvent : function ( eventDescriptor ) {

            if ( this._options.delayEvents ) {

                var offset = this._pendingEvents.indexOf( eventDescriptor );
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

    } );

} );
