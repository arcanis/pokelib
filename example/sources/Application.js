/*global angular, Pokelib*/

angular.module( 'application', [ 'emulator', 'sizeMonitoring' ] )

    .controller( 'root', [ '$scope', function ( $scope ) {

        $scope.$watch( 'engine', function ( ) {

            if ( ! $scope.engine )
                return ;

            $scope.engine.on( 'load', function ( ) {

                $scope.pokelib = window.pokelib = new Pokelib( $scope.engine, { delayEvents : true } );
                $scope.ready = $scope.pokelib.ready( );

                if ( ! $scope.ready ) {
                    $scope.pokelib.on( 'ready', function ( ) {
                        $scope.ready = true;
                        $scope.$apply( );
                    } );
                }

            } );

        } );

    } ] )

    .controller( 'help', [ '$scope', function ( $scope ) {

        var focus = function ( ) {
            document.querySelector( 'canvas' ).focus( );
        };

        $scope.active = true;

        $scope.hide = function ( e ) {
            $scope.active = false;
            focus( );
        };

        $scope.toggle = function ( ) {
            $scope.active = ! $scope.active;
            if ( ! $scope.active ) {
                focus( );
            }
        };

    } ] )

    .controller( 'bag', [ '$scope', function ( $scope ) {

        var reset = function ( ) {

            $scope.items = [ ];

        };

        var update = function ( ) {

            $scope.items = $scope.pokelib.bag.slice( );

            $scope.changeCount = function ( n ) {

                var type = $scope.items[ n ].item;
                var oldCount = $scope.items[ n ].count;
                var newCount = parseInt( prompt( 'How many instance of this object do you wish to have?', oldCount ), 10 );

                if ( newCount === null || isNaN( newCount ) || oldCount === newCount )
                    return ;

                if ( newCount > oldCount ) {
                    $scope.pokelib.bag.add( type, newCount - oldCount );
                } else {
                    $scope.pokelib.bag.remove( type, oldCount - newCount );
                }

            };

        };

        var attach = function ( ) {
            $scope.pokelib.on( 'bag', function ( ) {
                $scope.$apply( update );
            } );
        };

        $scope.$watch( 'pokelib', function ( ) {
            if ( ! $scope.pokelib ) {
                reset( );
            } else {
                attach( );
                update( );
            }
        } );

    } ] )

    .controller( 'trainer', [ '$scope', function ( $scope ) {

        var reset = function ( ) {

            $scope.name = null;

            $scope.gold = 0;

        };

        var update = function ( ) {

            $scope.name = $scope.pokelib.player.name( );
            $scope.gold = $scope.pokelib.player.gold( );

            $scope.changeName = function ( ) {

                var newName = prompt( 'Which name do you wish to have?', $scope.name );

                if ( ! newName )
                    return ;

                try {
                    $scope.pokelib.player.name( newName );
                } catch ( e ) {
                    alert( 'Error: ' + e.message );
                }

            };

            $scope.changeGold = function ( ) {

                var newLevel = prompt( 'How many gold do you wish to have?', $scope.gold );

                if ( ! newLevel )
                    return ;

                $scope.pokelib.player.gold( parseInt( newLevel, 10 ) );

            };

        };

        var attach = function ( ) {
            $scope.pokelib.on( 'player', function ( ) {
                $scope.$apply( update );
            } );
        };

        $scope.$watch( 'pokelib', function ( ) {
            if ( ! $scope.pokelib ) {
                reset( );
            } else {
                attach( );
                update( );
            }
        } );

    } ] )

    .controller( 'team-member', [ '$scope', function ( $scope ) {

        var reset = function ( ) {

            $scope.empty = true;

            $scope.species = null;

            $scope.experience = 0;
            $scope.life = 0;

        };

        var update = function ( ) {

            var slot = $scope.pokelib.teams.player[ $scope.index ];
            $scope.empty = slot.species( ) === null;

            if ( $scope.empty )
                return ;

            $scope.name = slot.name( );
            $scope.species = slot.species( );
            $scope.level = slot.level( );

            $scope.pokedexId = $scope.species.pokedexId( );

            var growthRate = $scope.species.growthRate( );
            var baseExp = growthRate.levelToExperience( $scope.level );
            var requiredExp = growthRate.levelToExperience( $scope.level + 1 );

            $scope.hpPercent = slot.currentHp( ) / slot.maxHp( );
            $scope.expPercent = ( slot.experience( ) - baseExp ) / ( requiredExp - baseExp );

            $scope.changeName = function ( ) {

                var newName = prompt( 'Which name do you wish to give to this Pokemon?', $scope.name );

                if ( ! newName )
                    return ;

                try {
                    slot.name( newName );
                } catch ( e ) {
                    alert( 'Error: ' + e.message );
                }

            };

            $scope.changeLevel = function ( ) {

                var newLevel = prompt( 'Which level do you wish to give to this Pokemon?', $scope.level );

                if ( ! newLevel )
                    return ;

                slot.level( parseInt( newLevel, 10 ) );

            };

        };

        var attach = function ( ) {
            $scope.pokelib.on( 'team.player', function ( e ) {
                if ( e.slot !== $scope.index ) return ;
                $scope.$apply( update );
            } );
        };

        $scope.$watch( 'pokelib', function ( ) {
            if ( ! $scope.pokelib ) {
                reset( );
            } else {
                attach( );
                update( );
            }
        } );

    } ] )

;
