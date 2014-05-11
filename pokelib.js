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
