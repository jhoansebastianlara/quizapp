/**
*	@description
*	Archivo que contiene las constantes generales de la aplicación.
*
*	@author Sebastián Lara <jlara@kijho.com>
*   
*	@created 14/05/2015
*/

var appConstants = angular.module('appConstants', []);

var CONSTANTS = {
    SETTINGS: {
        /**
        *   Configuración de conexión a los servidores
        */
        SERVER_HOST: {
            NODEJS: '52.4.118.168:8484'
        },
    },

    APP: {
        NAME: 'ACMI',
        PROFILES: {
            USER: 'user',
            PUBLIC: 'public',
            ADMIN: 'admin'
        }
    },

    VALUES: {
        TYPING: 'typing'
    }

};


// constantes de la aplicación
appConstants.constant('CONSTANTS', CONSTANTS);