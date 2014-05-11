define( [

    'virtjs',

    './Species',
    './utilities'

], function ( Virtjs, Species, utilities ) {

    return Virtjs.ClassUtil.extend( {

        initialize : function ( pokelib, index ) {

            this._pokelib = pokelib;
            this._index = index;

            this._speciesAddress = 0xD164 + index * 1;
            this._dataAddress    = 0xD16B + index * 44;
            this._nameAddress    = 0xD2B5 + index * 11;

        },

        name : function ( value ) {

            if ( typeof value === 'undefined' ) {

                return utilities.unserializeString( [

                    this._pokelib.readUint8( this._nameAddress + 0 ),
                    this._pokelib.readUint8( this._nameAddress + 1 ),
                    this._pokelib.readUint8( this._nameAddress + 2 ),
                    this._pokelib.readUint8( this._nameAddress + 3 ),
                    this._pokelib.readUint8( this._nameAddress + 4 ),
                    this._pokelib.readUint8( this._nameAddress + 5 ),
                    this._pokelib.readUint8( this._nameAddress + 6 ),
                    this._pokelib.readUint8( this._nameAddress + 7 ),
                    this._pokelib.readUint8( this._nameAddress + 8 ),
                    this._pokelib.readUint8( this._nameAddress + 9 )

                ] );

            } else {

                if ( value.length > 10 )
                    throw new Error( 'A pokemon name cannot have a length greater than 10 characters' );

                value = utilities.serializeString( value );

                this._pokelib.writeUint8( this._nameAddress + 0, value[ 0 ] );
                this._pokelib.writeUint8( this._nameAddress + 1, value[ 1 ] );
                this._pokelib.writeUint8( this._nameAddress + 2, value[ 2 ] );
                this._pokelib.writeUint8( this._nameAddress + 3, value[ 3 ] );
                this._pokelib.writeUint8( this._nameAddress + 4, value[ 4 ] );
                this._pokelib.writeUint8( this._nameAddress + 5, value[ 5 ] );
                this._pokelib.writeUint8( this._nameAddress + 6, value[ 6 ] );
                this._pokelib.writeUint8( this._nameAddress + 7, value[ 7 ] );
                this._pokelib.writeUint8( this._nameAddress + 8, value[ 8 ] );
                this._pokelib.writeUint8( this._nameAddress + 9, value[ 9 ] );

                return this;

            }

        },

        species : function ( value ) {

            if ( typeof value === 'undefined' ) {

                var speciesIndex = this._pokelib.readUint8( this._speciesAddress );

                return speciesIndex !== 0 && speciesIndex !== 0xFF
                    ? this._pokelib.species[ speciesIndex - 1 ] : null;

            } else {

                var speciesIndex = value !== null ? value.index( ) + 1 : 0;

                this._pokelib.writeUint8( this._speciesAddress, speciesIndex );
                this._pokelib.writeUint8( this._dataAddress + 0, speciesIndex );

                return this;

            }

        },

        maxHP : function ( value ) {

            if ( typeof value === 'undefined' ) {
                return this._pokelib.readUint16( this._dataAddress + 34 );
            } else {
                this._pokelib.writeUint16( this._dataAddress + 34, value );
                return this;
            }

        },

        currentHP : function ( value ) {

            if ( typeof value === 'undefined' ) {
                return this._pokelib.readUint16( this._dataAddress + 1 );
            } else {
                this._pokelib.writeUint16( this._dataAddress + 1, value );
                return this;
            }

        },

        level : function ( value ) {

            if ( typeof value === 'undefined' ) {
                return this._pokelib.readUint8( this._dataAddress + 33 );
            } else {
                this._pokelib.writeUint8( this._dataAddress + 33, value );
                return this;
            }

        },

        moves : function ( value ) {

            if ( typeof value === 'undefined' ) {

                return [
                    this._pokelib.readUint8( this._dataAddress + 8 ),
                    this._pokelib.readUint8( this._dataAddress + 9 ),
                    this._pokelib.readUint8( this._dataAddress + 10 ),
                    this._pokelib.readUint8( this._dataAddress + 11 )
                ];

            } else {

                this._pokelib.writeUint8( this._dataAddress + 8, value[ 0 ] );
                this._pokelib.writeUint8( this._dataAddress + 9, value[ 1 ] );
                this._pokelib.writeUint8( this._dataAddress + 10, value[ 2 ] );
                this._pokelib.writeUint8( this._dataAddress + 11, value[ 3 ] );

                return this;

            }

        },

        pp : function ( value ) {

            if ( typeof value === 'undefined' ) {

                return [
                    this._pokelib.readUint8( this._dataAddress + 29 ),
                    this._pokelib.readUint8( this._dataAddress + 30 ),
                    this._pokelib.readUint8( this._dataAddress + 31 ),
                    this._pokelib.readUint8( this._dataAddress + 32 )
                ];

            } else {

                this._pokelib.writeUint8( this._dataAddress + 29, value[ 0 ] );
                this._pokelib.writeUint8( this._dataAddress + 30, value[ 1 ] );
                this._pokelib.writeUint8( this._dataAddress + 31, value[ 2 ] );
                this._pokelib.writeUint8( this._dataAddress + 32, value[ 3 ] );

                return this;

            }

        },

        evs : function ( value ) {

            if ( typeof value === 'undefined' ) {

                return [
                    this._pokelib.readUint16( this._dataAddress + 17 ),
                    this._pokelib.readUint16( this._dataAddress + 18 ),
                    this._pokelib.readUint16( this._dataAddress + 19 ),
                    this._pokelib.readUint16( this._dataAddress + 20 ),
                    this._pokelib.readUint16( this._dataAddress + 21 )
                ];

            } else {

                this._pokelib.writeUint16( this._dataAddress + 17, value[ 0 ] );
                this._pokelib.writeUint16( this._dataAddress + 18, value[ 1 ] );
                this._pokelib.writeUint16( this._dataAddress + 19, value[ 2 ] );
                this._pokelib.writeUint16( this._dataAddress + 20, value[ 3 ] );
                this._pokelib.writeUint16( this._dataAddress + 21, value[ 4 ] );

                return this;

            }

        },

        ivs : function ( value ) {

            if ( typeof value === 'undefined' ) {
                return this._pokelib.readUint16( this._dataAddress + 27 );
            } else {
                this._pokelib.writeUint16( this._dataAddress + 27, value[ 0 ] );
                return this;
            }

        },

        attack : function ( value ) {

            if ( typeof value === 'undefined' ) {
                return this._pokelib.readUint16( this._dataAddress + 36 );
            } else {
                this._pokelib.writeUint16( this._dataAddress + 36, value );
                return this;
            }

        },

        defense : function ( value ) {

            if ( typeof value === 'undefined' ) {
                return this._pokelib.readUint16( this._dataAddress + 38 );
            } else {
                this._pokelib.writeUint16( this._dataAddress + 38, value );
                return this;
            }

        },

        speed : function ( value ) {

            if ( typeof value === 'undefined' ) {
                return this._pokelib.readUint16( this._dataAddress + 40 );
            } else {
                this._pokelib.writeUint16( this._dataAddress + 40, value );
                return this;
            }

        },

        special : function ( value ) {

            if ( typeof value === 'undefined' ) {
                return this._pokelib.readUint16( this._dataAddress + 42 );
            } else {
                this._pokelib.writeUint16( this._dataAddress + 42, value );
                return this;
            }

        },

        experience : function ( value ) {

            if ( typeof value === 'undefined' ) {
                return this._pokelib.readUint16( this._dataAddress + 14 );
            } else {
                this._pokelib.writeUint16( this._dataAddress + 14, value );
                return this;
            }

        }

    } );

} );
