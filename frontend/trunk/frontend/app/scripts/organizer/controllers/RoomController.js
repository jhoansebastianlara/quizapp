'use strict';

/**
*   @description
*   Controlador responsable de manejar el módulo de salas en la app.
*
*   @author: Sebastián Lara <jlara@kijho.com>
*   
*   @created: 15/05/2015
*/

appControllers.controller('RoomController', ['$rootScope', '$scope', '$mdDialog', 'lodash', '$timeout',
    function ($rootScope, $scope, $mdDialog, lodash, $timeout) {

        // salas en el evento
        $scope.rooms = {};

        /**
        *   @override
        *   Función responsable de mostrar el form para crear una nueva sala.
        */
        $rootScope.createNewItem = function(ev) {
            // se muestra el dialogo con el formulario
            $mdDialog.show({
                controller: 'RoomController',
                templateUrl: '/views/organizer/new-room.html',
                targetEvent: ev,
            })
            .then(function(roomData) {
                console.log('Create room...');
                // se emite el evento al server para crear una nueva sala
                var result = $rootScope.socket.prototypes.emit.room.create(roomData);

                result.then(function (response) {
                    console.log('response:');
                    console.log(response);
                    // se verifica si el resultado fue exitoso
                    if (response.success) {
                        // se verifica si existen salas en la respuesta
                        if (response.data && response.data.rooms) {
                            $timeout(function() {
                                $scope.$apply(function () {
                                    // se asignan las salas al contexto
                                    $scope.rooms = response.data.rooms;
                                    // se personaliza el título
                                    var amountRooms = $scope.lodash.size($scope.rooms);

                                    if (amountRooms == 1) {
                                        $scope.currentState.name = amountRooms + ' sala';
                                    } else {
                                        $scope.currentState.name = amountRooms + ' salas';
                                    }
                                });
                                
                            });
                        }
                    } else {
                        // se informa al usuario el error ocurrido
                        $rootScope.utils.dialog.showAlert({
                            title: 'Error',
                            content: response.error.message
                        });
                    }
                });

            }, function() {
                console.log('You cancelled the dialog.');
            });
        };


        // modal 

        /**
        *   Función que es llamada cuando se cancela la creación de una sala
        */
        $scope.cancel = function() {
            console.log('hide please');
            $mdDialog.cancel();
        };

        /**
        *   Función que se llama cuando el usuario presiona "Crear"
        */
        $scope.create = function() {
            console.log('create please', $scope.data);
            $mdDialog.hide($scope.data);
        };

        /**
        *   Función que se ejecuta una vez carga el módulo
        */
        $scope.init = function () {
            // se emite el evento al server para obener las salas
            var result = $rootScope.socket.prototypes.emit.room.getAll();

            result.then(function (response) {
                console.log('response:');
                console.log(response);

                // se verifica si existen salas en la respuesta
                if (response.data && response.data.rooms) {
                    $timeout(function() {
                        $scope.$apply(function () {
                            // se asignan las salas al contexto
                            $scope.rooms = response.data.rooms;
                            // se personaliza el título
                            var amountRooms = $scope.lodash.size($scope.rooms);

                            if (amountRooms == 1) {
                                $scope.currentState.name = amountRooms + ' sala';
                            } else {
                                $scope.currentState.name = amountRooms + ' salas';
                            }
                        });
                        
                    });
                }

                console.log('promise: ', response);
            });

        }


        



    }
]);