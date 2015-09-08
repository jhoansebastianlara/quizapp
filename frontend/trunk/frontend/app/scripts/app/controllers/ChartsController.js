'use strict';

/**
*   @description
*   Controlador responsable de manejar los estados de la aplicación para 
*	mostrar al usuario.
*
*   @author: Sebastián Lara <jlara@kijho.com>
*   
*   @created: 12/05/2015
*/

appControllers.controller('ChartsController', ['$rootScope', '$scope', '$interval', '$timeout',
	function ($rootScope, $scope, $interval, $timeout) {
        
        // se actualiza el resumen de los resultados en la app
        $rootScope.updateAnswersSummary();

        // cronometro

        // Variable de conteo en minutos.
        $scope.mins = 0;
        // Variable de conteo en segundos.
        $scope.secs = 0;
        $scope.minsLbl = '';
        $scope.secsLbl = '';
        // Separador de minutos y segundos del temporizador.
        $scope.dotsLbl = ':';

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


}]);