# Pokelib

Pokelib is a Javascript library based on [Virt.js](https://github.com/arcanis/virt.js/). It allows to abstract the inner architecture of a Pokemon Red rom, and offer an API to fetch and manipulate data structures during the runtime.

**Note** This library is originally a proof of concept. However, it is very usable and pull requests / issues will be looked upon. Please consider updating the README documentation when adding new methods.

## ![](http://www.pokemonelite2000.com/sprites/rbspr/rbspr146.png) Usage

This code assume that you have a Virt.js engine already running.

```js
var pokelib = new Pokelib( engine );

pokelib.on( 'team.player', function ( e ) {

    var slot = pokelib.teams.player[ 0 ];

    if ( slot.species( ) === null ) {
        console.log( 'There is no more pokemon in the slot #' + e.index );
    } else {
        console.log( 'The pokemon in the slot #' + e.index + ' is at level ' + slot.level( ) );
    }

} );
```

## ![](http://www.pokemonelite2000.com/sprites/rbspr/rbspr145.png) Example

A basic example is shown [here](http://arcanis.github.io/pokelib/example/). It will display your current team and current bag in real time. Pull requests to add new features to this example (such as listing more data, allowing to instantly send pokemon from the PC to the team, ...) are welcomed!

## ![](http://www.pokemonelite2000.com/sprites/rbspr/rbspr144.png) Reference

> *Coming soon*

## ![](http://www.pokemonelite2000.com/sprites/rbspr/rbspr150.png) License

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
