# Pokelib

Pokelib is a Javascript library based on [Virt.js](https://github.com/arcanis/virt.js/). It allows to abstract the inner architecture of a Pokemon Red rom, and offer an API to fetch and manipulate data structures during the runtime.

**Note** This library is originally a proof of concept. However, it is very usable and pull requests / issues will be looked upon. Please consider updating the README documentation when adding new methods.

## ![](http://www.pokemonelite2000.com/sprites/rbspr/rbspr003.png) Usage

This code assume that you have a Virt.js engine already running.

```js
var pokelib = new Pokelib( engine );

pokelib.on( 'teamslots', function ( e ) {

    var slot = pokelib.teamslots[ e.index ];

    if ( slot.species( ) === null ) {
        console.log( 'There is no more pokemon in the slot #' + e.index );
    } else {
        console.log( 'The pokemon in the slot #' + e.index + ' is at level ' + slot.level( ) );
    }

} );
```

## ![](http://www.pokemonelite2000.com/sprites/rbspr/rbspr006.png) Example

A basic example is shown [here](http://arcanis.github.io/pokelib/example/). It will display your current team and current bag in real time. Pull requests to add new features to this example (such as listing more data, allowing to instantly send pokemon from the PC to the team, ...) are welcomed.

## ![](http://www.pokemonelite2000.com/sprites/rbspr/rbspr009.png) Reference

### Pokelib

#### .bag

An object of type `Bag`, see below.

#### .items

An array of 255 objects of type `Item`, see below. You should not change this array.

#### .teamslots

An array of 6 objects of type `TeamPokemon`, see below. You should not change this array.

<hr />

### TeamPokemon

#### .name( [value] )

Getter / setter for the pokemon name. Max 10 characters.

#### .species( [value] )

Getter / setter for the pokemon species. `value` is an object of type `Species`.

#### .level( [value] )

Getter / setter for the pokemon level.

By convenience, the setter will also update the pokemon experience, according to its growth rate.

#### .experience( [value] )

Getter / setter for the pokemon experience.

By convenience, the setter may also update the pokemon level, according to its growth rate.

#### .moves( [value] )

Getter / setter for the pokemon moves. `value` is an array where each entry is an object containing the following properties :

- **pp** is the amount of pp for the move
- **move** is an object of type `Move` (see below)

#### .evs( [value] )

Getter / setter for the [pokemon EVs](http://bulbapedia.bulbagarden.net/wiki/Effort_values).

#### .ivs( [value] )

Getter / setter for the [pokemon IVs](http://bulbapedia.bulbagarden.net/wiki/Individual_values).

#### .maxHP( [value] )

Getter / setter for the pokemon max HP. This value is resetted after each level.

#### .currentHP( [value] )

Getter / setter for the pokemon current HP.

#### .attack( [value] )

Getter / setter for the pokemon attack stat. It is resetted after each level up, according to the pokemon EV / IV.

#### .defense( [value] )

Getter / setter for the pokemon defense stat. It is resetted after each level up, according to the pokemon EV / IV.

#### .speed( [value] )

Getter / setter for the pokemon speed stat. It is resetted after each level up, according to the pokemon EV / IV.

#### .special( [value] )

Getter / setter for the pokemon special stat. It is resetted after each level up, according to the pokemon EV / IV.

**note** Remember that in Gen I, the special stat was used for both attack and defense.

<hr />

### Bag

#### .size( )

Returns the bag size (ie. the number of item types inside the bag, not the total item count).

#### .at( index )

Returns `null` if the index is greater or equal than the bag size. Otherwise, returns an object with the following properties :

- **item** is an object of type `Item`
- **count** is the size of the item stack

#### .add( item, [howMany = 1] )

Adds new items into the bag. If there is already some items of this type, stack them together. Otherwise, add them at the bottom of the bag.

#### .remove( item, [howMany = all] )

Removes some items from the bag. If the amount of removed items should go lower than zero, the item type is fully removed from the bag.

## ![](http://www.pokemonelite2000.com/sprites/rbspr/rbspr151.png) License

Should someone from Nintendo see this and be offensed by the ROM presence in the example directory (which is only used for demonstration purpose), please feel free to contact me (either by a [regular issue](https://github.com/arcanis/pokelib) on this repository, or by email for more privacy - check [my Github profile](https://github.com/arcanis)), and I will remove the copyrighted material from the repository.

> The MIT License (MIT)
>
> Copyright &copy; 2014 Maël Nison
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
