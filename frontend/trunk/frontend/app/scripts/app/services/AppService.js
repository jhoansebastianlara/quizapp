/**
*   @description
*   Módulo que encapsula todos los servicios de la aplicación.
*
*   @author: Sebastián Lara <jlara@kijho.com>
*   
*   @created: 14/05/2015
*/
var appServices = angular.module('appServices', []);

/**
*   @description
*   Servicio que interactúa con el "Backend" para obtener información
*	general y de configuración de la app.
*/
appServices.factory('AppService', ['$rootScope', '$resource', 'CONSTANTS', 

    /**
    *
    * @param $resource Servicio de AngularJS para crear clientes REST
    * @returns {*} función que regresa los metodos de nuestro servicio
    */
    function($rootScope, $resource, CONSTANTS) {
        
    }]

);
