/*global define*/

define( [

    'virtjs',

    './utilities'

], function ( Virtjs, utilities ) {

    return Virtjs.ClassUtil.extend( {

        initialize : function ( pokelib ) {

            this._pokelib = pokelib;

            this._firstAddress = 0xD31E;
            this._lastAddress = 0xD344;

            this._maxCount = ( this._lastAddress - this._firstAddress ) / 2 + 1;

        },

        at : function ( index ) {

            if ( index >= this.size( ) )
                return null;

            return {
                item : this._pokelib.readUint8( this._firstAddress + index * 2 + 0 ),
                count : this._pokelib.readUint8( this._firstAddress + index * 2 + 1 )
            };

        },

        size : function ( ) {

            return this._pokelib.readUint8( this._firstAddress - 1 );

        },

        add : function ( item, howMany ) {

            if ( typeof howMany === 'undefined' )
                howMany = 1;

            for ( var index = 0, count = this.size( ); index < count; ++ index )
                if ( this._pokelib.readUint8( this._firstAddress + index * 2 + 0 ) === item )
                    break ;

            if ( index === this._maxCount )
                throw new Error( 'Bag full; empty a slot before adding a new item type' );

            if ( index === count ) {
                this._pokelib.writeUint8( this._firstAddress - 1, count + 1 );
                this._pokelib.writeUint8( this._firstAddress + index * 2 + 0, item );
                this._pokelib.writeUint8( this._firstAddress + index * 2 + 1, Math.min( howMany, 0xFF ) );
                this._pokelib.writeUint8( this._firstAddress + ( index + 1 ) * 2 + 0, 0xFF );
            } else {
                this._pokelib.writeUint8( this._firstAddress + index * 2 + 1, Math.min( this._pokelib.readUint8( this._firstAddress + index * 2 + 1 ) + howMany, 0xFF ) );
            }

            return this;

        },

        remove : function ( item, howMany ) {

            if ( typeof howMany === 'undefined' )
                howMany = Infinity;

            var index = 0;

            for ( var index = 0, count = this.size( ); index < count; ++ index )
                if ( this._pokelib.readUint8( this._firstAddress + index * 2 + 0 ) === item )
                    break ;

            if ( index === count )
                return this;

            var newCount = Math.max( 0, this._pokelib.readUint8( this._firstAddress + index * 2 + 1 ) - howMany );

            if ( newCount > 0 ) {

                this._pokelib.writeUint8( this._firstAddress + index * 2 + 1, newCount );

                return this;

            } else {

                this._pokelib.writeUint8( this._firstAddress - 1, count - 1 );

                for ( ; index < count; ++ index ) {

                    var next = index + 1;

                    this._pokelib.writeUint8( this._firstAddress + index * 2 + 0, this._pokelib.readUint8( this._firstAddress + next * 2 + 0 ) );
                    this._pokelib.writeUint8( this._firstAddress + index * 2 + 1, this._pokelib.readUint8( this._firstAddress + next * 2 + 1 ) );

                }

                return this;

            }

        }

    } );

} );
