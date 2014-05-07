/*global window, module, define, Virtjs*/

( function ( factory ) {

    var library = factory( );

    if ( typeof window !== 'undefined' )
        window.Pokelib = library;

    if ( typeof module !== 'undefined' )
        module.exports = library;

    if ( typeof define === 'function' && define.amd ) {
        define( [ ], function ( ) {
            return library;
        } );
    }

} )( function ( ) {

    var unserializeString = function ( value ) {

        var end = value.indexOf( 0x50 );

        if ( end !== - 1 )
            value = value.slice( 0, end );

        return String.fromCharCode.apply( String, value.map( function ( n ) {

            if ( n === 0x7F )
                return 32;

            if ( n >= 0x80 && n <= 0x99 )
                return 65 + n - 0x80;

            if ( n >= 0x9A && n <= 0x9F )
                return '():;[]'.charCodeAt( n - 0x9A );

            if ( n >= 0xA0 && n <= 0xB9 )
                return 97 + n - 0xA0;

            if ( n >= 0xF6 && n <= 0xFF )
                return 48 + n - 0xF6;

            return null;

        } ).filter( function ( n ) { return ! isNaN( n ); } ) );

    };

    var serializeString = function ( value ) {

    };

    var readUint8 = function ( engine, address ) {
        return engine.mmu.readUint8( address ); };

    var readUint16 = function ( engine, address ) {
        return ( readUint8( engine, address + 0 ) << 8 )
             | ( readUint8( engine, address + 1 ) << 0 ); };

    var readUint24 = function ( engine, address ) {
        return ( readUint16( engine, address + 0 ) << 8 )
             | ( readUint8( engine, address + 2 ) << 0 ); };

    var readUint32 = function ( engine, address ) {
        return ( readUint16( engine, address + 0 ) << 16 )
             | ( readUint16( engine, address + 2 ) << 0 ); };

    var readString = function ( engine, index ) {
        for ( var serialized = [ ]; readUint8( engine, index ) !== 0x50; ++ index )
            serialized.push( readUint8( engine, index ) );
        return unserializeString( serialized );
    };

    var writeUint8 = function ( engine, address, value ) {
        engine.mmu.writeUint8( address, value ); };

    var writeUint16 = function ( engine, address, value ) {
        writeUint8( engine, address + 0, ( value & 0xFF00 ) >> 8 );
        writeUint8( engine, address + 1, ( value & 0x00FF ) >> 0 );
    };

    var writeUint24 = function ( engine, address, value ) {
        writeUint16( engine, address + 0, ( value & 0xFFFF00 ) >> 8 );
        writeUint16( engine, address + 2, ( value & 0x0000FF ) >> 0 );
    };

    var writeUint32 = function ( engine, address, value ) {
        writeUint16( engine, address + 0, ( value & 0xFFFF0000 ) >> 16 );
        writeUint16( engine, address + 2, ( value & 0x0000FFFF ) >> 0 );
    };

    var executeShellcode = function ( engine, shellcode ) {

        if ( typeof engine._shellCodeAddress === 'undefined' )
            engine._shellCodeAddress = 0x0154;

        for ( var t = 0, T = shellcode.length; t < T; ++ t )
            engine.environment.rom[ engine._shellCodeAddress + t ] = shellcode[ t ];

        engine._shellCodeAddress += shellcode.length;

    };

    var getPokemonNumberFromId = function ( engine, id ) {

        if ( id === 0 )
            return null;

        var currentBank = engine.environment.mbc3RomBank;

        engine.mmu.writeUint8( 0x2000, 0x10 );
        var number = engine.mmu.readUint8( 0x5024 + id - 1 );
        engine.mmu.writeUint8( 0x2000, currentBank );

        return number;

    };

    var Item = Virtjs.ClassUtil.extend( {

        initialize : function ( engine, index ) {

            this._engine = engine;
            this._index = index;

        },

        name : function ( ) {

            return readString( this._engine, 0xCD6D );

        }

    } );

    var Bag = Virtjs.ClassUtil.extend( {

        initialize : function ( engine ) {

            this._engine = engine;

            this._firstAddress = 0xD31E;
            this._lastAddress = 0xD344;

            this._maxCount = ( this._lastAddress - this._firstAddress ) / 2 + 1;

        },

        at : function ( index ) {

            if ( index >= this.size( ) )
                return null;

            return {
                item : readUint8( this._engine, this._firstAddress + index * 2 + 0 ),
                count : readUint8( this._engine, this._firstAddress + index * 2 + 1 )
            };

        },

        size : function ( ) {

            return readUint8( this._engine, this._firstAddress - 1 );

        },

        add : function ( item, howMany ) {

            if ( typeof howMany === 'undefined' )
                howMany = 1;

            for ( var index = 0, count = this.size( ); index < count; ++ index )
                if ( readUint8( this._engine, this._firstAddress + index * 2 + 0 ) === item )
                    break ;

            if ( index === this._maxCount )
                throw new Error( 'Bag full; empty a slot before adding a new item type' );

            if ( index === count ) {
                writeUint8( this._engine, this._firstAddress - 1, count + 1 );
                writeUint8( this._engine, this._firstAddress + index * 2 + 0, item );
                writeUint8( this._engine, this._firstAddress + index * 2 + 1, Math.min( howMany, 0xFF ) );
                writeUint8( this._engine, this._firstAddress + ( index + 1 ) * 2 + 0, 0xFF );
            } else {
                writeUint8( this._engine, this._firstAddress + index * 2 + 1, Math.min( readUint8( this._engine, this._firstAddress + index * 2 + 1 ) + howMany, 0xFF ) );
            }

            return this;

        },

        remove : function ( item, howMany ) {

            if ( typeof howMany === 'undefined' )
                howMany = Infinity;

            var index = 0;

            for ( var index = 0, count = this.size( ); index < count; ++ index )
                if ( readUint8( this._engine, this._firstAddress + index * 2 + 0 ) === item )
                    break ;

            if ( index === count )
                return this;

            var newCount = Math.max( 0, readUint8( this._engine, this._firstAddress + index * 2 + 1 ) - howMany );

            if ( newCount > 0 ) {

                writeUint8( this._engine, this._firstAddress + index * 2 + 1, newCount );

                return this;

            } else {

                writeUint8( this._engine, this._firstAddress - 1, count - 1 );

                for ( ; index < count; ++ index ) {

                    var next = index + 1;

                    writeUint8( this._engine, this._firstAddress + index * 2 + 0, readUint8( this._engine, this._firstAddress + next * 2 + 0 ) );
                    writeUint8( this._engine, this._firstAddress + index * 2 + 1, readUint8( this._engine, this._firstAddress + next * 2 + 1 ) );

                }

                return this;

            }

        }

    } );

    var TeamPokemon = Virtjs.ClassUtil.extend( {

        initialize : function ( engine, index ) {

            this._engine = engine;
            this._index = index;

            this._speciesAddress = 0xD164 + index * 1;
            this._dataAddress    = 0xD16B + index * 44;
            this._nameAddress    = 0xD2B5 + index * 11;

        },

        name : function ( value ) {

            if ( typeof value === 'undefined' ) {

                return unserializeString( [
                    readUint8( this._engine, this._nameAddress + 0 ),
                    readUint8( this._engine, this._nameAddress + 1 ),
                    readUint8( this._engine, this._nameAddress + 2 ),
                    readUint8( this._engine, this._nameAddress + 3 ),
                    readUint8( this._engine, this._nameAddress + 4 ),
                    readUint8( this._engine, this._nameAddress + 5 ),
                    readUint8( this._engine, this._nameAddress + 6 ),
                    readUint8( this._engine, this._nameAddress + 7 ),
                    readUint8( this._engine, this._nameAddress + 8 ),
                    readUint8( this._engine, this._nameAddress + 9 )
                ] );

            } else {

                value = serializeString( value );

                writeUint8( this._engine, this._nameAddress + 0, value[ 0 ] );
                writeUint8( this._engine, this._nameAddress + 1, value[ 1 ] );
                writeUint8( this._engine, this._nameAddress + 2, value[ 2 ] );
                writeUint8( this._engine, this._nameAddress + 3, value[ 3 ] );
                writeUint8( this._engine, this._nameAddress + 4, value[ 4 ] );
                writeUint8( this._engine, this._nameAddress + 5, value[ 5 ] );
                writeUint8( this._engine, this._nameAddress + 6, value[ 6 ] );
                writeUint8( this._engine, this._nameAddress + 7, value[ 7 ] );
                writeUint8( this._engine, this._nameAddress + 8, value[ 8 ] );
                writeUint8( this._engine, this._nameAddress + 9, value[ 9 ] );

                return this;

            }

        },

        species : function ( value ) {

            if ( typeof value === 'undefined' ) {
                return getPokemonNumberFromId( this._engine, readUint8( this._engine, this._dataAddress + 0 ) );
            } else {
                writeUint8( this._engine, this._speciesAddress, value );
                writeUint8( this._engine, this._dataAddress + 0, value );
                return this;
            }

        },

        maxHP : function ( value ) {

            if ( typeof value === 'undefined' ) {
                return readUint16( this._engine, this._dataAddress + 34 );
            } else {
                writeUint16( this._engine, this._dataAddress + 34, value );
                return this;
            }

        },

        currentHP : function ( value ) {

            if ( typeof value === 'undefined' ) {
                return readUint16( this._engine, this._dataAddress + 1 );
            } else {
                writeUint16( this._engine, this._dataAddress + 1, value );
                return this;
            }

        },

        level : function ( value ) {

            if ( typeof value === 'undefined' ) {
                return readUint8( this._engine, this._dataAddress + 33 );
            } else {
                writeUint8( this._engine, this._dataAddress + 33, value );
                return this;
            }

        },

        moves : function ( value ) {

            if ( typeof value === 'undefined' ) {

                return [
                    readUint8( this._engine, this._dataAddress + 8 ),
                    readUint8( this._engine, this._dataAddress + 9 ),
                    readUint8( this._engine, this._dataAddress + 10 ),
                    readUint8( this._engine, this._dataAddress + 11 )
                ];

            } else {

                writeUint8( this._engine, this._dataAddress + 8, value[ 0 ] );
                writeUint8( this._engine, this._dataAddress + 9, value[ 1 ] );
                writeUint8( this._engine, this._dataAddress + 10, value[ 2 ] );
                writeUint8( this._engine, this._dataAddress + 11, value[ 3 ] );

                return this;

            }

        },

        pp : function ( value ) {

            if ( typeof value === 'undefined' ) {

                return [
                    readUint8( this._engine, this._dataAddress + 29 ),
                    readUint8( this._engine, this._dataAddress + 30 ),
                    readUint8( this._engine, this._dataAddress + 31 ),
                    readUint8( this._engine, this._dataAddress + 32 )
                ];

            } else {

                writeUint8( this._engine, this._dataAddress + 29, value[ 0 ] );
                writeUint8( this._engine, this._dataAddress + 30, value[ 1 ] );
                writeUint8( this._engine, this._dataAddress + 31, value[ 2 ] );
                writeUint8( this._engine, this._dataAddress + 32, value[ 3 ] );

                return this;

            }

        },

        evs : function ( value ) {

            if ( typeof value === 'undefined' ) {

                return [
                    readUint16( this._engine, this._dataAddress + 17 ),
                    readUint16( this._engine, this._dataAddress + 18 ),
                    readUint16( this._engine, this._dataAddress + 19 ),
                    readUint16( this._engine, this._dataAddress + 20 ),
                    readUint16( this._engine, this._dataAddress + 21 )
                ];

            } else {

                writeUint16( this._engine, this._dataAddress + 17, value[ 0 ] );
                writeUint16( this._engine, this._dataAddress + 18, value[ 1 ] );
                writeUint16( this._engine, this._dataAddress + 19, value[ 2 ] );
                writeUint16( this._engine, this._dataAddress + 20, value[ 3 ] );
                writeUint16( this._engine, this._dataAddress + 21, value[ 4 ] );

                return this;

            }

        },

        ivs : function ( value ) {

            if ( typeof value === 'undefined' ) {
                return readUint16( this._engine, this._dataAddress + 27 );
            } else {
                writeUint16( this._engine, this._dataAddress + 27, value[ 0 ] );
                return this;
            }

        },

        attack : function ( value ) {

            if ( typeof value === 'undefined' ) {
                return readUint16( this._engine, this._dataAddress + 36 );
            } else {
                writeUint16( this._engine, this._dataAddress + 36, value );
                return this;
            }

        },

        defense : function ( value ) {

            if ( typeof value === 'undefined' ) {
                return readUint16( this._engine, this._dataAddress + 38 );
            } else {
                writeUint16( this._engine, this._dataAddress + 38, value );
                return this;
            }

        },

        speed : function ( value ) {

            if ( typeof value === 'undefined' ) {
                return readUint16( this._engine, this._dataAddress + 40 );
            } else {
                writeUint16( this._engine, this._dataAddress + 40, value );
                return this;
            }

        },

        special : function ( value ) {

            if ( typeof value === 'undefined' ) {
                return readUint16( this._engine, this._dataAddress + 42 );
            } else {
                writeUint16( this._engine, this._dataAddress + 42, value );
                return this;
            }

        },

        experience : function ( value ) {

            if ( typeof value === 'undefined' ) {
                return readUint16( this._engine, this._dataAddress + 14 );
            } else {
                writeUint16( this._engine, this._dataAddress + 14, value );
                return this;
            }

        }

    } );

    return Virtjs.ClassUtil.extend( [

        Virtjs.EmitterMixin

    ], {

        initialize : function ( engine ) {

            this._engine = engine;

            this.bag = new Bag( this._engine );

            this.items = [ ];
            for ( var t = 0; t < 0xFF; ++ t )
                this.items.push( new Item( this._engine, t ) );

            this.teamslots = [ ];
            for ( var t = 0; t < 6; ++ t )
                this.teamslots.push( new TeamPokemon( this._engine, t ) );

            engine.mmu.on( 'post-write', function ( e ) {
                this._checkMemoryChange( e.address );
            }.bind( this ) );

        },

        _checkMemoryChange : function ( address ) {

            if ( address >= 0xD31E && address <= 0xD345 )
                this.emit( 'bag' );

            if ( address >= 0xD16B && address <= 0xD196 )
                this.emit( 'teamslot', { slot : 0 } );
            if ( address >= 0xD2B5 && address <= 0xD2BF )
                this.emit( 'teamslot', { slot : 0 } );

            if ( address >= 0xD197 && address <= 0xD1C2 )
                this.emit( 'teamslot', { slot : 1 } );
            if ( address >= 0xD2C0 && address <= 0xD2CA )
                this.emit( 'teamslot', { slot : 1 } );

            if ( address >= 0xD1C3 && address <= 0xD1EE )
                this.emit( 'teamslot', { slot : 2 } );
            if ( address >= 0xD2CB && address <= 0xD2D5 )
                this.emit( 'teamslot', { slot : 2 } );

            if ( address >= 0xD1EF && address <= 0xD21A )
                this.emit( 'teamslot', { slot : 3 } );
            if ( address >= 0xD2D6 && address <= 0xD2E1 )
                this.emit( 'teamslot', { slot : 3 } );

            if ( address >= 0xD21B && address <= 0xD246 )
                this.emit( 'teamslot', { slot : 4 } );
            if ( address >= 0xD2E2 && address <= 0xD2EB )
                this.emit( 'teamslot', { slot : 4 } );

            if ( address >= 0xD247 && address <= 0xD272 )
                this.emit( 'teamslot', { slot : 5 } );
            if ( address >= 0xD2EC && address <= 0xD2F6 )
                this.emit( 'teamslot', { slot : 5 } );

            return ;

        }

    } );

} );
