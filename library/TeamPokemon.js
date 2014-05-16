/*global define*/

define( [

    'virtjs',

    './Species',
    './utilities'

], function ( Virtjs, Species, utilities ) {

    /**
     * @class TeamPokemon
     *
     * A class representing a Pokemon from the player team.
     */

    return Virtjs.ClassUtil.extend( {

        initialize : function ( pokelib, index ) {

            this._pokelib = pokelib;
            this._index = index;

            this._speciesAddress = 0xD164 + index * 1;
            this._dataAddress    = 0xD16B + index * 44;
            this._nameAddress    = 0xD2B5 + index * 11;

        },

        /**
         * Getter / setter for the Pokemon name.
         *
         * The setter version is chainable.
         *
         * @throws
         * This function throws if you try to set a new name, and if this name has a length greater than 10 characters.
         *
         * @param {Array} [value] The new name.
         */

        name : function ( value ) {

            if ( typeof value === 'undefined' ) {

                return utilities.pdsToUtf8( this._pokelib.readPds( this._nameAddress ) );

            } else {

                if ( value.length > 10 )
                    throw new Error( 'A pokemon name cannot have a length greater than 10 characters' );

                this._pokelib.writePds( this._nameAddress, utilities.utf8ToPds( value ) );

                return this;

            }

        },

        /**
         * Getter / setter for the Pokemon species.
         *
         * The setter version is chainable.
         *
         * @param {Species} [value] The new species.
         */

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

        /**
         * Getter / setter for the Pokemon maximal HP. Note that when the Pokemon stats will be computed again by the game (for example during a level up), any change to this value will be overriden as well.
         *
         * Setting this property to a lower value than the current HP will also lower the current HP (so that the two values does not conflict with each other).
         *
         * The setter version is chainable.
         *
         * @param {Number} [value] The new maximal HP.
         */

        maxHp : function ( value ) {

            if ( typeof value === 'undefined' ) {

                return this._pokelib.readUint16( this._dataAddress + 34 );

            } else {

                this._pokelib.writeUint16( this._dataAddress + 34, value );

                if ( this.currentHP( ) > value )
                    this.currentHP( value );

                return this;

            }

        },

        /**
         * Getter / setter for the Pokemon current HP. Note that when the Pokemon stats will be computed again by the game (for example during a level up), any change to this value will be overriden as well.
         *
         * Setting this property to a greater value than the maximal HP will also increase the maximal HP (so that the two values does not conflict with each other).
         *
         * The setter version is chainable.
         *
         * @param {Number} [value] The new current HP.
         */

        currentHp : function ( value ) {

            if ( typeof value === 'undefined' ) {

                return this._pokelib.readUint16( this._dataAddress + 1 );

            } else {

                if ( this.maxHP( ) < value )
                    this.maxHP( value );

                this._pokelib.writeUint16( this._dataAddress + 1, value );

                return this;

            }

        },

        /**
         * Getter / setter for the Pokemon level.
         *
         * Setting this property will also affect the Pokemon experience (so that the two values does not conflict with each other).
         *
         * The setter version is chainable.
         *
         * @param {Number} [value] The new level.
         */

        level : function ( value ) {

            if ( typeof value === 'undefined' ) {

                return this._pokelib.readUint8( this._dataAddress + 33 );

            } else {

                if ( value === this.level( ) )
                    return this;

                this._pokelib.writeUint8( this._dataAddress + 33, value );

                this.experience( this.species( ).growthRate( ).levelToExperience( value ) );

                return this;

            }

        },

        /**
         * Getter / setter for the Pokemon moveset.
         *
         * The setter version is chainable.
         *
         * @param {Array} [value] The new moveset.
         */

        moveset : function ( value ) {

            if ( typeof value === 'undefined' ) {

                var moveset = [
                    this._pokelib.readUint8( this._dataAddress +  8 ),
                    this._pokelib.readUint8( this._dataAddress +  9 ),
                    this._pokelib.readUint8( this._dataAddress + 10 ),
                    this._pokelib.readUint8( this._dataAddress + 11 )
                ];

                moveset[ 0 ] = moveset[ 0 ] !== 0 ? this._pokelib.moves[ moveset[ 0 ] - 1 ] : null;
                moveset[ 1 ] = moveset[ 1 ] !== 0 ? this._pokelib.moves[ moveset[ 1 ] - 1 ] : null;
                moveset[ 2 ] = moveset[ 2 ] !== 0 ? this._pokelib.moves[ moveset[ 2 ] - 1 ] : null;
                moveset[ 3 ] = moveset[ 3 ] !== 0 ? this._pokelib.moves[ moveset[ 3 ] - 1 ] : null;

                return moveset;

            } else {

                this._pokelib.writeUint8( this._dataAddress +  8, value[ 0 ] ? value[ 0 ].index( ) + 1 : 0 );
                this._pokelib.writeUint8( this._dataAddress +  9, value[ 1 ] ? value[ 1 ].index( ) + 1 : 0 );
                this._pokelib.writeUint8( this._dataAddress + 10, value[ 2 ] ? value[ 2 ].index( ) + 1 : 0 );
                this._pokelib.writeUint8( this._dataAddress + 11, value[ 3 ] ? value[ 3 ].index( ) + 1 : 0 );

                return this;

            }

        },

        /**
         * Getter / setter for the Pokemon PPs.
         *
         * The setter version is chainable.
         *
         * @param {Array} [value] The new PPs.
         */

        pps : function ( value ) {

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

        /**
         * Getter / setter for the Pokemon EVs.
         *
         * The setter version is chainable.
         *
         * @param {Array}  [value]         The new EVs.
         * @param {Number} [value.hp]      The HP EV.
         * @param {Number} [value.attack]  The attack EV.
         * @param {Number} [value.defense] The defense EV.
         * @param {Number} [value.speed]   The speed EV.
         * @param {Number} [value.special] The special EV.
         */

        evs : function ( value ) {

            if ( typeof value === 'undefined' ) {

                return {
                    hp      : this._pokelib.readUint16( this._dataAddress + 17 ),
                    attack  : this._pokelib.readUint16( this._dataAddress + 19 ),
                    defense : this._pokelib.readUint16( this._dataAddress + 21 ),
                    speed   : this._pokelib.readUint16( this._dataAddress + 23 ),
                    special : this._pokelib.readUint16( this._dataAddress + 25 )
                };

            } else {

                if ( typeof value.hp !== 'undefined' )
                    this._pokelib.writeUint16( this._dataAddress + 17, value.hp );

                if ( typeof value.attack !== 'undefined' )
                    this._pokelib.writeUint16( this._dataAddress + 19, value.attack );

                if ( typeof value.defense !== 'undefined' )
                    this._pokelib.writeUint16( this._dataAddress + 21, value.defense );

                if ( typeof value.speed !== 'undefined' )
                    this._pokelib.writeUint16( this._dataAddress + 23, value.speed );

                if ( typeof value.special !== 'undefined' )
                    this._pokelib.writeUint16( this._dataAddress + 25, value.special );

                return this;

            }

        },

        /**
         * Getter / setter for the Pokemon IVs.
         *
         * Remember that in Gen I, there is no HP IV. The HP IV is computed from the other IVs (the last bit of each IV is used to compute a fourth one). Pokelib offers a getter / setter on the HP IV too, but modifying it will alter the other IVs. Be careful.
         *
         * The setter version is chainable.
         *
         * @param {Array}  [value]         The new IVs.
         * @param {Number} [value.hp]      The HP IV.
         * @param {Number} [value.attack]  The attack IV.
         * @param {Number} [value.defense] The defense IV.
         * @param {Number} [value.speed]   The speed IV.
         * @param {Number} [value.special] The special IV.
         */

        ivs : function ( value ) {

            if ( typeof value === 'undefined' ) {

                var flag = this._pokelib.readUint16( this._dataAddress + 27 );

                var ivs = {
                    attack  : ( flag >>  0 ) & 0x0F,
                    defense : ( flag >>  4 ) & 0x0F,
                    speed   : ( flag >>  8 ) & 0x0F,
                    special : ( flag >> 12 ) & 0x0F
                };

                ivs.hp =
                    ( ( ivs.attack  & 1 ) << 0 ) |
                    ( ( ivs.defense & 1 ) << 1 ) |
                    ( ( ivs.speed   & 1 ) << 2 ) |
                    ( ( ivs.special & 1 ) << 3 )
                ;

                return ivs;

            } else {

                var flag = this._pokelib.readUint16( this._dataAddress + 27 );

                if ( typeof value.attack !== 'undefined' )
                    flag = ( flag & 0xFFF0 ) | ( ( value.attack & 0x0F ) << 0 );

                if ( typeof value.defense !== 'undefined' )
                    flag = ( flag & 0xFF0F ) | ( ( value.defense & 0x0F ) << 4 );

                if ( typeof value.speed !== 'undefined' )
                    flag = ( flag & 0xF0FF ) | ( ( value.speed & 0x0F ) << 8 );

                if ( typeof value.special !== 'undefined' )
                    flag = ( flag & 0x0FFF ) | ( ( value.special & 0x0F ) << 12 );

                if ( typeof value.hp !== 'undefined' ) {
                    flag &= flag & 0xEEEE;
                    flag |= ( ( value.attack  >> 0 ) & 1 ) <<  0;
                    flag |= ( ( value.defense >> 1 ) & 1 ) <<  4;
                    flag |= ( ( value.speed   >> 2 ) & 1 ) <<  8;
                    flag |= ( ( value.special >> 3 ) & 1 ) << 12;
                }

                return this;

            }

        },

        /**
         * Getter / setter for the Pokemon attack. Note that when the Pokemon stats will be computed again by the game (for example during a level up), any change to this value will be overriden as well.
         *
         * The setter version is chainable.
         *
         * @param {Number} [value] The new Attack stat.
         */

        attack : function ( value ) {

            if ( typeof value === 'undefined' ) {
                return this._pokelib.readUint16( this._dataAddress + 36 );
            } else {
                this._pokelib.writeUint16( this._dataAddress + 36, value );
                return this;
            }

        },

        /**
         * Getter / setter for the Pokemon defense. Note that when the Pokemon stats will be computed again by the game (for example during a level up), any change to this value will be overriden as well.
         *
         * The setter version is chainable.
         *
         * @param {Number} [value] The new Defense stat.
         */

        defense : function ( value ) {

            if ( typeof value === 'undefined' ) {
                return this._pokelib.readUint16( this._dataAddress + 38 );
            } else {
                this._pokelib.writeUint16( this._dataAddress + 38, value );
                return this;
            }

        },

        /**
         * Getter / setter for the Pokemon speed. Note that when the Pokemon stats will be computed again by the game (for example during a level up), any change to this value will be overriden as well.
         *
         * The setter version is chainable.
         *
         * @param {Number} [value] The new Speed stat.
         */

        speed : function ( value ) {

            if ( typeof value === 'undefined' ) {
                return this._pokelib.readUint16( this._dataAddress + 40 );
            } else {
                this._pokelib.writeUint16( this._dataAddress + 40, value );
                return this;
            }

        },

        /**
         * Getter / setter for the Pokemon special. Note that when the Pokemon stats will be computed again by the game (for example during a level up), any change to this value will be overriden as well.
         *
         * The setter version is chainable.
         *
         * @param {Number} [value] The new Special stat.
         */

        special : function ( value ) {

            if ( typeof value === 'undefined' ) {
                return this._pokelib.readUint16( this._dataAddress + 42 );
            } else {
                this._pokelib.writeUint16( this._dataAddress + 42, value );
                return this;
            }

        },

        /**
         * Getter / setter for the Pokemon experience.
         *
         * Setting this property may also affect the Pokemon level (so that the two values does not conflict with each other).
         *
         * The setter version is chainable.
         *
         * @param {Number} [value] The new level.
         */

        experience : function ( value ) {

            if ( typeof value === 'undefined' ) {

                return this._pokelib.readUint24( this._dataAddress + 14 );

            } else {

                this._pokelib.writeUint24( this._dataAddress + 14, value );

                var newLevel = this.species( ).growthRate( ).experienceToLevel( value );
                if ( newLevel !== this.level( ) ) this.level( newLevel );

                return this;

            }

        }

    } );

} );
