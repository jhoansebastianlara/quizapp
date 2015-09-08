/**
*   Servicio responsable de enviar y recibir los eventos real-time con
*   con servidor NodeJS.
*
*	@author: Sebastián Lara <jlara@kijho.com>
*
*	@date: 14/05/2015
*/

appServices.factory('SocketService', function socket($rootScope, CONSTANTS, $interval, $q) {
    // se conecta el socket al servidor
    var socket = io.connect(CONSTANTS.SETTINGS.SERVER_HOST.NODEJS);


    var socketService = {
        /**
        *   Función genérica para recibir mensajes del servidor.
        */
        on: function(eventName, callback) {
            console.log('on ' + eventName);
            socket.on(eventName, function() {
                var args = arguments;

                $rootScope.$apply(function() {
                    callback.apply(socket, args);
                });
            });
        },

        /**
        *   Función genérica para enviar mensajes al servidor.
        */
        emit: function(eventName, data, callback) {
            console.log('emit ' + eventName);
            socket.emit(eventName, data, function() {
                var args = arguments;

                $rootScope.$apply(function() {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        },

        /**
        *   Funciones real-time genéricas para la aplicación
        */
        prototypes: {
            /**
            *   Eventos que se emiten desde el cliente al servidor
            */
            emit: {
                /**
                *   Eventos asociados a la app
                */
                app: {

                },

                /**
                *   Eventos asociados a las salas
                */
                room: {
                    /**
                    *   Evento que se emite para crear una sala
                    */
                    create: function (data) {
                        // se emite el evento pare crear una sala
                        return $q(function(resolve, reject) {
                            socketService.emit('room.create', data, 
                            function(response) {
                                // se resuelve la promesa
                                resolve(response);
                            });
                        });
                    },

                    /**
                    *   Función responsable de emitir el evento para obtener todas las salas
                    */
                    getAll: function () {
                        // se emite el evento pare obtener todas las salas
                        return $q(function(resolve, reject) {
                            socketService.emit('room.getAll', {}, 
                            function(response) {
                                // se resuelve la promesa
                                resolve(response);
                            });
                        });
                    }
                },

                /**
                *   Eventos asociados al usuario
                */
                user: {
                    /**
                    *   Función responsable de emitir el evento "join" al servidor real-time
                    *   para unir a l usuario a una sala.
                    */
                    join: function(data) {
                        // se emite el evento para crear una sala
                        return $q(function(resolve, reject) {
                            socketService.emit('user.join', data, 
                            function(response) {
                                // se resuelve la promesa
                                resolve(response);
                            });
                        });
                    },

                    /**
                    *   Función responsable de emitir el evento "user.leave" al servidor real-time
                    */
                    leave: function() {
                        socketService.emit('user.leave');
                    },

                    /**
                    *   Función responsable de emitir el evento "getUsers" al servidor real-time
                    *   para obtener todos los usuarios conectados en la app.
                    */
                    getUsers: function() {


                    },
                },

                /**
                *   eventos asociados al admin
                */
                question: {
                    /**
                    *   Evento que se emite para iniciar una nueva pregunta en la sala
                    */
                    setStatus: function (data) {
                        // se emite el evento que inicia una nueva pregunta en la sala
                        return $q(function(resolve, reject) {
                            socketService.emit('question.update', data, 
                            function(response) {
                                // se resuelve la promesa
                                resolve(response);
                            });
                        });
                    },

                    /**
                    *   Evento que emite la respuesta del usuario al servidor                    
                    */
                    sendAnswer: function (data) {
                        // se emite el evento que inicia una nueva pregunta en la sala
                        return $q(function(resolve, reject) {
                            socketService.emit('question.answer', data, 
                            function(response) {                                
                                // se resuelve la promesa
                                resolve(response);
                            });
                        });
                    },

                    /**
                    *   Evento que solicita el resumen de los resultados de ls pregunta
                    */
                    updateAnswersSummary: function () {
                        // se emite el evento
                        return $q(function(resolve, reject) {
                            socketService.emit('question.updateAnswersSummary', {}, 
                            function(response) {                                
                                // se resuelve la promesa
                                resolve(response);
                            });
                        });
                    }

                }
            }            
        },

        /**
        *   Eventos que escucha el cliente del servidor.
        */
        startListeners: function() {
            /**
            *   Evento que se activa cuando el servidor real-time entra al estado
            *   online.
            */
            socketService.on("connect", function(data) {
                console.log('real-time server connected!');
            });

            /**
            *   Evento que se activa cuando el servidor real-time entra al estado
            *   offline.
            */
            socketService.on('disconnect', function () {
                console.log('real-time server disconnect.');
            });

            /**
            *   Evento que se escucha cuando un usuario ha ingresado a la app.
            */
            socketService.on('user.join', function(data) {
                console.log(data);
            });

            /**
            *   Evento que se escucha cuando un usuario ha ingresado a la app.
            */
            socketService.on('room.update', function(data) {
                console.log(data);

                if (!$rootScope.lodash.isUndefined(data) && !$rootScope.lodash.isEmpty(data.room)) {
                    // se valida si el estado de la sala cambio
                    if (!$rootScope.lodash.isEqual($rootScope.fixedState, data.room.status)) {
                        // se verifica si la pregunta se ha reiniciado
                        if (data.room.restart) {
                            // se indica que el usuario no ha enviado una respuesta
                            $rootScope.localStorage.remove('questionAnswered');
                            // se asigna tambien a la sesion
                            $rootScope.questionAnswered = false;
                        }

                        // es un estado diferente, se actualiza
                        $rootScope.setRoomStatus(data.room.status);
                    }
                }
            });

            /**
            *   Evento que se escucha cuando se actualiza el resumen de resultados de
            */
            socketService.on('question.updateAnswersSummary', function(data) {
                console.log('on question.updateAnswersSummary');
                console.log(data);

                // se obtiene el resumen de respuestas
                if (!$rootScope.lodash.isEmpty(data.answersSummary)) {
                    console.log('summary');
                    console.log(data.answersSummary)

                    // resumen de las respuestas
                    var answersSummary = data.answersSummary;

                    // se valida si llegan resultados
                    if (!$rootScope.lodash.isEmpty(answersSummary.results)) {
                        // resumen de los resultados
                        var results = answersSummary.results;

                        // total de respuestas
                        $rootScope.amountAnswers = answersSummary.totalAnswers;

                        // se parsea la información y se asigna a la variable esperada por la libreria de graficas
                        $rootScope.answersSummary = $rootScope.utils.app.parseAnswersSummary(results);
                    }
                } else {
                    console.log('sin summary');
                }


            });

            /**
            *   Evento que se escucha cuando un usuario ha salido a la app.
            */
            socketService.on('user.logout', function(data) {
                console.log('yes sr');
                console.log(data);
            });

        }
    };

    return socketService;
});
