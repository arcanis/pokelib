/*global define*/

define( [

    'virtjs',

    './utilities'

], function ( Virtjs, utilities ) {

    /**
     * @class Player
     *
     * The class managing the player.
     */

    return Virtjs.ClassUtil.extend( {

        initialize : function ( pokelib ) {

            this._pokelib = pokelib;

            this._nameAddress = 0xD158;
            this._goldAddress = 0xD347;

        },

        /**
         * Getter / setter for the trainer name.
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
                    throw new Error( 'You trainer name cannot have more than 10 characters' );

                this._pokelib.writePds( this._nameAddress, utilities.utf8ToPds( value ) );

                return this;

            }

        },

        /**
         * Getter / setter for the trainer gold.
         *
         * The setter version is chainable.
         *
         * The gold amount will be clamped into the [0;999999] range.
         *
         * @param {Number} [value] The new gold amount.
         */

        gold : function ( value ) {

            if ( typeof value === 'undefined' ) {

                return parseInt( this._pokelib.readUint24( this._goldAddress ).toString( 16 ), 10 );

            } else {

                value = Math.max( 0, Math.min( value, 999999 ) );

                this._pokelib.writeUint24( this._goldAddress, parseInt( value.toString( 10 ), 16 ) );

                return this;

            }

        }

    } );

} );
