/**
 *   @description
 *   Módulo del panel de control
 *
 *   @author: Alejandro Castaño <acastano@kijho.com>
 *
 *   @created: 13/05/2015
 */
/**
 *   Controlador de la vista MONITOR DE ACTIVIDAD para el administrador
 */
appControllers.controller('MonitorActivityController', ['$rootScope', '$scope', '$state', '$timeout', '$interval', '$mdDialog',
    function($rootScope, $scope, $state, $timeout, $interval, $mdDialog) {
        // se actualiza el resumen de los resultados en la app
        $rootScope.updateAnswersSummary();

        $scope.buttonNameStop = 'DETENER';
        $scope.stateButtonContinue = true;


        /**
        *   Función responsable de detener / continuar una pregunta
        */
        $scope.continueStopQuestion = function() {
            // si la pregunta esta corriendo se emite al server que la detenga y viceverza

            if ($rootScope.runningQuestion) {
                // pregunta corriendo, se pide al server que la detenga
                $rootScope.stopQuestion();
            } else {
                // se emite el evento de seguir corriendo la pregunta
                $rootScope.runQuestion();
            }
        };

        // Función para mostrar las notificaciones o alertas en el Monitor de Actividad.
        $scope.showConfirmPanel = function(ev, state) {

            // Verifica que botón presionó (1 = Volver, 2 = Reiniciar).
            if (state == 1) {
                $scope.messageNotificationPanel = 'Está seguro que desea volver al Panel de Control? tenga en cuenta que los resultados actuales se perderán';
            } else {
                $scope.messageNotificationPanel = 'Desea realizar una nueva pregunta? tenga en cuenta que los resultados actuales se perderán';
            }

            var confirm = $mdDialog.confirm()
                .title('Confirmar')
                .content($scope.messageNotificationPanel)
                .ok('Aceptar')
                .cancel('Cancelar')
                .targetEvent(ev);
            $mdDialog.show(confirm).then(function() {
                $scope.alert = 'si';
                if (state == 1) {
                    // se emite el evento
                    $rootScope.waitingQuestion();
                    console.log('controlPanel');
                } else {
                    // se emite el evento de reiniciar
                    $rootScope.restartQuestion();
                }
            }, function() {
                $scope.alert = 'no';
            });
        };

        // cronometro
        
        // Variable de conteo en minutos.
        $scope.mins = 0;
        // Variable de conteo en segundos.
        $scope.secs = 0;
        $scope.minsLbl = '';
        $scope.secsLbl = '';
        // Separador de minutos y segundos del temporizador.
        $scope.dotsLbl = ':';
        // Variable para mostrar si/no en las notificaciones.
        $scope.alert = '';
        // Mensaje cuando selecciona el botón Volver o Reiniciar.
        $scope.messageNotificationPanel = '';

        // Variable que indica que se muestra el botón (detener/volver) en la vista panel de control.
        $scope.stateButtonVisible = true;

        // Función para cronometrar el tiempo mientras los usuarios están votando.
        $scope.onTimeout = function() {

            $scope.secs++;

            if ($scope.secs == 60) {
                $scope.secs = 0;
                $scope.mins = $scope.mins + 1;
            }

            $scope.minsLbl = ($scope.mins < 10) ? '0' + $scope.mins : $scope.mins;
            $scope.secsLbl = ($scope.secs < 10) ? '0' + $scope.secs : $scope.secs;

            $scope.mytimeout = $timeout($scope.onTimeout, 1000);
        }

        // Inicia una vez el contro del tiempo.
        $scope.mytimeout = $timeout($scope.onTimeout);
    }
]);