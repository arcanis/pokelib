/*global define*/

define( [

    'virtjs',

    './Item',
    './utilities'

], function ( Virtjs, Item, utilities ) {

    /**
     * @class Bag
     *
     * The class managing the player bag.
     */

    return Virtjs.ClassUtil.extend( [

        Virtjs.IterableMixin

    ], {

        initialize : function ( pokelib ) {

            this._pokelib = pokelib;

            this._firstAddress = 0xD31E;
            this._lastAddress = 0xD344;

            this._maxCount = ( this._lastAddress - this._firstAddress ) / 2 + 1;

        },

        /**
         * Fetch the slot index of the specified item type in the bag, or return -1 if there is none.
         *
         * @param {Item} item The item type.
         *
         * @return {Number} The slot index.
         */

        indexOf : function ( item ) {

            if ( item instanceof Item )
                item = item.index( ) + 1;

            for ( var index = 0, count = this.length( ); index < count; ++ index )
                if ( this._pokelib.readUint8( this._firstAddress + index * 2 + 0 ) === item )
                    break ;

            return index !== count ? index : - 1;

        },

        /**
         * Tells how many items of a specific type contains the bag.
         *
         * @param {Item} item The item type.
         *
         * @return {Number} The item count.
         */

        countOf : function ( item ) {

            var index = this.indexOf( item );

            if ( index === - 1 )
                return 0;

            return this.at( index ).count;

        },

        /**
         * Get the item in the specified slot from the bag.
         *
         * @param {Number}  index The slot index.
         *
         * @return {Object} An object describing the slot:
         * @return {Item}   return.item  The item type.
         * @return {Number} return.count The item count.
         */

        at : function ( index ) {

            if ( index >= this.length( ) )
                return null;

            return {
                item : this._pokelib.items[ this._pokelib.readUint8( this._firstAddress + index * 2 + 0 ) - 1 ],
                count : this._pokelib.readUint8( this._firstAddress + index * 2 + 1 )
            };

        },

        /**
         * Get the size of the bag. The bag size is the item type count, not the total item count.
         *
         * @return {Number} The bag size.
         */

        length : function ( ) {

            return this._pokelib.readUint8( this._firstAddress - 1 );

        },

        /**
         * Adds a new item in the bag. You can add multiple instances of the same object at once, but the final result will be capped to 99.
         *
         * @param {Item}    item       The item type.
         * @param {Number} [howMany=1] The item count.
         *
         * @throws
         * This function will throw if the bag is full (ie. if it cannot accept any more item type), and you try to add a new item type.
         *
         * @chainable
         */

        add : function ( item, howMany ) {

            if ( item instanceof Item )
                item = item.index( ) + 1;

            if ( typeof howMany === 'undefined' )
                howMany = 1;

            var index = this.indexOf( item );

            if ( index === this._maxCount )
                throw new Error( 'Bag full; empty a slot before adding a new item type' );

            if ( index === - 1 ) {
                // If the item type is not in the bag yet, we add a slot
                this._pokelib.writeUint8( this._firstAddress - 1, this.length( ) + 1 );
                this._pokelib.writeUint8( this._firstAddress + index * 2 + 0, item.index( ) );
                this._pokelib.writeUint8( this._firstAddress + index * 2 + 1, Math.min( howMany, 0xFF ) );
                this._pokelib.writeUint8( this._firstAddress + ( index + 1 ) * 2 + 0, 0xFF );
            } else {
                // Otherwise, we can just expand the item count from the previous slot
                this._pokelib.writeUint8( this._firstAddress + index * 2 + 1, Math.min( this._pokelib.readUint8( this._firstAddress + index * 2 + 1 ) + howMany, 0xFF ) );
            }

            return this;

        },

        /**
         * Removes items from the bag. You can remove multiple instances of the same item type at once (actually, the default is to remove every instance).
         *
         * @param {Item}    item              The item type.
         * @param {Number} [howMany=Infinity] The item count.
         *
         * @chainable
         */

        remove : function ( item, howMany ) {

            if ( item instanceof Item )
                item = item.index( ) + 1;

            if ( typeof howMany === 'undefined' )
                howMany = Infinity;

            var index = this.indexOf( item );

            if ( index === - 1 )
                return this;

            var newCount = Math.max( 0, this._pokelib.readUint8( this._firstAddress + index * 2 + 1 ) - howMany );

            if ( newCount > 0 ) {

                // Even when removing these items, some will still be here

                this._pokelib.writeUint8( this._firstAddress + index * 2 + 1, newCount );

                return this;

            } else {

                // These items are the last of this item type, and their slot will be fully removed

                var length = this.length( );

                this._pokelib.writeUint8( this._firstAddress - 1, length - 1 );

                for ( ; index < length; ++ index ) {

                    var next = index + 1;

                    this._pokelib.writeUint8( this._firstAddress + index * 2 + 0, this._pokelib.readUint8( this._firstAddress + next * 2 + 0 ) );
                    this._pokelib.writeUint8( this._firstAddress + index * 2 + 1, this._pokelib.readUint8( this._firstAddress + next * 2 + 1 ) );

                }

                return this;

            }

        }

    } );

} );
