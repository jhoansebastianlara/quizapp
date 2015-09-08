/**
 *   @description
 *   Módulo del panel de control
 *
 *   @author: Alejandro Castaño <acastano@kijho.com>
 *
 *   @created: 13/05/2015
 */

/**
 *   Controlador de la vista PANDEL DE CONTROL para el administrador
 */

angularApp.controller('PanelController', ['$scope', '$state',
    function ($scope, $state) {

	$scope.message = 'PANEL DE CONTROL';
	$scope.usersConnected = 'Usuarios conectados: 1453';
	$scope.statesFromMonitor = '';

	// Función para cargar la vista de los gráficos con los datos.
	$scope.loadQuestion = function () {
		$state.go('monitorActivity');
	}

	$scope.finishQuestion = function () {
		$state.go('info');
	}

	$scope.closeSession = function () {
		$state.go('info');
	}
}]);