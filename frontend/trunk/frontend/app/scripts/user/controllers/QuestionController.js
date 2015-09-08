'use strict';

/**
 *   @description
 *   Controlador responsable de manejar el módulo de respuestas de los usuarios.
 *
 *   @author: Sebastián Lara <jlara@kijho.com>
 *   
 *   @created: 12/05/2015
 */
appControllers.controller('QuestionController', ['$rootScope', '$scope', '$mdToast', '$state', '$timeout', '$mdDialog',
    function($rootScope, $scope, $mdToast, $state, $timeout, $mdDialog) {

        $scope.answers = [{
            code: 1,
            value: 'A',
            selected: false,
            disabled: false
        }, {
            code: 2,
            value: 'B',
            selected: false,
            disabled: false
        }, {
            code: 3,
            value: 'C',
            selected: false,
            disabled: false
        }, {
            code: 4,
            value: 'D',
            selected: false,
            disabled: false
        }];

        /**
        *   Función responsable de enviar la respuesta al servidor.
        */
        $scope.sendAnswer = function(index, answer) {
            // se valida que el usuario no haya enviado una respuesta anteriormente
            if ($rootScope.lodash.isEmpty($rootScope.questionAnswered)) {
                // se indica gráficamente la respuesta seleccionada
                selectUIAnswer(index);

                // El loading se inicia
                $rootScope.loading = true;

                // se envía la respuesta al servidor
                $rootScope.socket.prototypes.emit.question.sendAnswer({
                    code: answer.code,
                    value: answer.value
                })
                .then(function (response) {
                    console.log('response:');
                    console.log(response);

                    // se verifica si el resultado fue exitoso
                    if (response.success) {
                        console.log('ohh yeahh!');

                        // se obtiene el nuevo estado de la app
                        var roomStatus = response.data.room.status;

                        // se indica localmente que el usuario ya respondio para que no lo vuelva a hacer
                        $rootScope.localStorage.set('questionAnswered', true);
                        // se asigna tambien a la sesion
                        $rootScope.questionAnswered = true;

                        // Se notifica al usuario que la respuesta se ha enviado exitosamente
                        /*$mdToast.show({
                            template  : '<md-toast class="Toast">Gracias por responder!</md-toast>',
                            hideDelay : 3000,
                            position  : 'bottom right'
                        });*/
                        $rootScope.utils.toast.showSimple({
                            content: 'Gracias por responder',
                            type: 'primary',
                            hideDelay: 3000
                        }); 

                        // se envía el usuario a los resultados :)                        
                        console.log('go go go');
                        // se actualiza el estado de la app
                        $rootScope.setRoomStatus(roomStatus);
                    } else {
                        console.log(':(');
                        /*$rootScope.utils.dialog.showAlert({
                            title: 'Error al enviar la respuesta',
                            content: 'Lo sentimos, ha ocurrido un error inesperado. Vuelva a intentarlo más tarde ;)'
                        });*/
                        // se indica al usuario del error y se habilitan las respuestas
                        enableAnswers();
                    }

                    // El loading se termina
                    $rootScope.loading = false;
                }, function () {
                    console.log('ERROR!!');
                    // El loading se termina
                    $rootScope.loading = false;
                });
            } else {
                // el usuario ya ha enviado una respuesta e intenta enviar otra, se expulsa de la app
                $rootScope.leaveRoom();
            }            
        };

        /**
        *   Función responsable de indicar gráficamente la respuesta seleccionada
        */
        var selectUIAnswer = function (index) {
            $scope.lodash.forEach($scope.answers, function(button, i) {
                // el item seleccionado se resalta y los demas se deshabilitan
                if (angular.equals(i, index)) {
                    // se resalta la respuesta seleccionada
                    $scope.answers[index].selected = true;
                } else {
                    // las demas respuestas se bloquean
                    $scope.answers[i].selected = false;
                    $scope.answers[i].disabled = true;
                }
            });
        }

        /**
        *   Función responsable habilitar los botones de respuesta para 
        *   que el usuario pueda responder.
        */
        var enableAnswers = function () {
            $scope.lodash.forEach($scope.answers, function(button, i) {
                // Se habilitan todas las opciones y se dejan sin seleccionar.
                $scope.answers[i].selected = false;
                $scope.answers[i].disabled = false;
            });
        }
    }
]);