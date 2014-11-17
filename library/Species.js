/*global define*/

define( [

    'virtjs'

], function ( Virtjs ) {

    /**
     * @class Species
     *
     * A class managing a single species.
     *
     * Since species are defined in the ROM, and since the ROM is read-only, it is not possible to change these values.
     */

    return Virtjs.ClassUtil.extend( {

        initialize : function ( pokelib, index ) {

            this._pokelib = pokelib;
            this._index = ( index - 1 ) & 0xff;

            this._pokedexIdBank = 0x10;
            if ( this._pokelib.version[ 0 ] == "R/G" /* jp */ ) this._pokedexIdAddress = 0x679a;
            else if ( this._pokelib.version[ 0 ] == "Blue" /* jp */ ) this._pokedexIdAddress = 0x6784;
            else if ( this._pokelib.version[ 0 ] == "R/B" ) {
                if ( this._pokelib.version[ 1 ] == "DE" ) this._pokedexIdAddress = 0x4f96;
                else if ( this._pokelib.version[ 1 ] == "ES" ) this._pokedexIdAddress = 0x4fb4;
                else if ( this._pokelib.version[ 1 ] == "FR" ) this._pokedexIdAddress = 0x4faa;
                else if ( this._pokelib.version[ 1 ] == "IT" ) this._pokedexIdAddress = 0x4fb6;
                else if ( this._pokelib.version[ 1 ] == "EN" ) this._pokedexIdAddress = 0x5024;
            } else if ( this._pokelib.version[ 0 ] == "Yellow" ) {
                if ( this._pokelib.isJapan( ) ) this._pokedexIdAddress = 0x682d;
                else if ( this._pokelib.version[ 1 ] == "EN" ) this._pokedexIdAddress = 0x50b1;
                else if ( this._pokelib.version[ 1 ] == "DE" ) this._pokedexIdAddress = 0x5023;
                else if ( this._pokelib.version[ 1 ] == "ES" ) this._pokedexIdAddress = 0x5041;
                else if ( this._pokelib.version[ 1 ] == "FR" ) this._pokedexIdAddress = 0x5036;
                else if ( this._pokelib.version[ 1 ] == "IT" ) this._pokedexIdAddress = 0x5043;
            }
            this._pokedexIdAddress += this._index;

            this._speciesDataBank = 0x0E;
            this._speciesDataAddress = 0x43DE + this.pokedexId( ) * 28; // comes after move data; thus, is the same for all versions + languages :)

        },

        /**
         * Return the species' index, which may not be the pokedex number.
         *
         * @return {Number} The species index.
         */

        index : function ( ) {

            return this._index;

        },

        /**
         * Return the species' pokedex number.
         *
         * @return {Number} The pokedex number.
         */

        pokedexId: function ( ) {

            return this._pokelib.bankSwitch( this._pokedexIdBank, this._pokedexIdAddress, 8 );

        },

        /**
         * Return the species' base HP stat.
         *
         * @return {Number} The base HP stat.
         */

        baseHp : function ( ) {

            return this._pokelib.bankSwitch( this._speciesDataBank, this._speciesDataAddress + 1, 8 );

        },

        /**
         * Return the species' base Attack stat.
         *
         * @return {Number} The base Attack stat.
         */

        baseAttack : function ( ) {

            return this._pokelib.bankSwitch( this._speciesDataBank, this._speciesDataAddress + 2, 8 );

        },

        /**
         * Return the species' base Defense stat.
         *
         * @return {Number} The base Defense stat.
         */

        baseDefense : function ( ) {

            return this._pokelib.bankSwitch( this._speciesDataBank, this._speciesDataAddress + 3, 8 );

        },

        /**
         * Return the species' base Speed stat.
         *
         * @return {Number} The base Speed stat.
         */

        baseSpeed : function ( ) {

            return this._pokelib.bankSwitch( this._speciesDataBank, this._speciesDataAddress + 4, 8 );

        },

        /**
         * Return the species' base Special stat.
         *
         * @return {Number} The base Special stat.
         */

        baseSpecial : function ( value ) {

            return this._pokelib.bankSwitch( this._speciesDataBank, this._speciesDataAddress + 5, 8 );

        },

        /**
         * Return the species' growth rate.
         *
         * @return {GrowthRate} The growth rate.
         */

        growthRate : function ( ) {

            return this._pokelib.growthRates[ this._pokelib.bankSwitch( this._speciesDataBank, this._speciesDataAddress + 19, 8 ) ];

        }

    } );

} );
