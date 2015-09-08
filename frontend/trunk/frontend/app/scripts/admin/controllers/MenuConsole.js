/**
 *   @description
 *   Módulo del panel de control
 *
 *   @author: Alejandro Castaño <acastano@kijho.com>
 *
 *   @created: 13/05/2015
 */
/**
 *   Controlador de la vista PANDEL DE CONTROL para el organizador
 */
appControllers.controller('MenuController', ['$scope', '$state',
    function($scope, $state) {

        $scope.buttonsList = [{
            id: 1,
            selected: false,
            state: 'info'
        }, {
            id: 2,
            selected: false,
            state: 'question'
        }, {
            id: 3,
            selected: false,
            state: 'controlPanel'
        }, {
            id: 4,
            selected: false,
            state: 'monitorActivity'
        }, {
            id: 5,
            selected: false,
            state: 'resultsActivity'
        }, {
            id: 6,
            selected: false,
            state: 'rooms'
        }];

        $scope.toggleFunctions = function(index) {
            $scope.lodash.forEach($scope.buttonsList, function(button, i) {
                if (angular.equals(i, index)) {
                    $scope.buttonsList[index].selected = true;
                    $state.go($scope.buttonsList[index].state);
                } else {
                    $scope.buttonsList[i].selected = false;
                }
            })
        };

    }
]);