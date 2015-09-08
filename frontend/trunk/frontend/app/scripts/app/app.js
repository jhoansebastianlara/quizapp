'use strict';

/**
 * @ngdoc overview
 * @name frontendApp
 * @description
 * # frontendApp
 *
 * Main module of the application.
 */
var angularjsApp = angular.module('starterApp', [
	'ngMaterial', 
	'ui.router',
    'nvd3ChartDirectives',
    'ngLodash',
    'LocalStorageModule',

    'appUtilities',
    'appControllers',
	'appConstants',
	'appDirectives',
    'appServices',
]);

/**
*	Configuración de la app
*/
angularjsApp.config(function($stateProvider, $urlRouterProvider, $mdThemingProvider, $mdIconProvider, localStorageServiceProvider){

    // se configura el prefijo para los nombres de las variables locales para no correr el riesgo de leer o sobreescribir las de otra app.
    localStorageServiceProvider.setPrefix('kuiz');

	// en caso de intentar acceder a una ruta no especificada, la app redirecciona a '/login'
	$urlRouterProvider.otherwise("/login");

    // Now set up the states
	$stateProvider	
    .state('login', {
        url: "/login",
        templateUrl: "views/app/login.html",
        controller: 'LoginController',
        settings: {
            title: 'Login'
        },
        isLogin: true
    })

    .state('leave', {
        url: "/leave",
        controller: function ($rootScope) {
            $rootScope.leaveRoom();
        },
        settings: {
            isPublic: true
        },
        isLogout: true
    })

    .state('info', {
        url: "/info",
        templateUrl: "views/app/info.html",
        controller: 'InfoController',
        settings: {
            title: 'Información'
        }
    })

    .state('question', {
        url: "/question",
        templateUrl: "views/user/question.html",
        controller: 'QuestionController',
        settings: {
            title: 'Pregunta'
        }
    })

    .state('answerResults', {
        url: "/answer/results",
        templateUrl: "views/app/answer-results.html",
        controller: 'ChartsController',
        settings: {
            title: 'Resultados'
        }
    })

    .state('publicResults', {
        url: "/answer/:pin/public-results",
        templateUrl: "views/app/answer-results.html",
        controller: 'ChartsController',
        settings: {
            title: 'Resultados',
            isPublic: true
        }
    })

     // Panel de control del Admin, roles: (Iniciar pregunta, Terminar y Cerrar sesión.)
    .state('controlPanel', {
        url: "/admin/control-panel",
        templateUrl: "views/admin/control-panel.html",
        controller: 'ControlPanelController',
        settings: {
            title: 'Panel de control'        
        }
    })

    // Monitor de actividad donde se ven los resultados gráficos de las votaciones con rol de admin.
    .state('monitorActivity', {
        url: "/admin/monitor-activity",
        templateUrl: "views/admin/monitor-activity.html",
        controller: 'MonitorActivityController',
        settings: {
            title: 'Monitor de actividad'        
        }
    })

    // Monitor de actividad donde se ven los resultados gráficos de las votaciones con rol de user.
    .state('resultsActivity', {
        url: "/admin/monitor-activity",
        templateUrl: "views/admin/monitor-activity-users.html",
        controller: 'ChartsController',
        settings: {
            title: 'Resultados'        
        }
    })

    .state('rooms', {
        url: "/rooms",
        templateUrl: "views/organizer/rooms.html",
        controller: 'RoomController',        
        settings: {
            title: 'Salas',
            showNewButton: true,
            isPublic: true
        }
    });

	// se especifican los íconos en la aplicación
	$mdIconProvider
		.defaultIconSet("./images/svg/avatars.svg", 128)
		.icon("menu"       , "./images/svg/menu.svg"        , 24)
		.icon("share"      , "./images/svg/share.svg"       , 24)
		.icon("google_plus", "./images/svg/google_plus.svg" , 512)
		.icon("hangouts"   , "./images/svg/hangouts.svg"    , 512)
		.icon("twitter"    , "./images/svg/twitter.svg"     , 512)
		.icon("phone"      , "./images/svg/phone.svg"       , 512)
        .iconSet('communication', './images/svg/google_plus.svg', 24);


	// configuración del tema de la app
	$mdThemingProvider.theme('default')
		.primaryPalette('blue')
		.accentPalette('amber')
		.warnPalette('red')
		.backgroundPalette('grey');
});

/**
*   Función que se ejecuta cuando la app esta "corriendo"
*/
angularjsApp.run(function($rootScope, $state, $interval, CONSTANTS, SocketService, lodash, localStorageService, appUtilities) {
    // socket conectado al servidor real time
    $rootScope.socket = SocketService;

    // constantes generales
    $rootScope.CONSTANTS = CONSTANTS;

    // variable que indica si la app esta realizando una accion
    $rootScope.loading = false;

    // utilidades
    $rootScope.lodash = lodash;

    // almacenamiento local
    $rootScope.localStorage = localStorageService;

    // utilidades de la app
    $rootScope.utils = appUtilities;

    // estado actual de el usuario en la app
    $rootScope.currentState = {};

    // Estado fijo en el que se debe mantener la app
    $rootScope.fixedState = $rootScope.localStorage.get('fixedState');

    // Mensaje informativo que se muestra en el estado de información
    $rootScope.messageInfo = $rootScope.localStorage.get('messageInfo');

    // variable que indica si un usuario ha enviado una respuesta
    $rootScope.questionAnswered = $rootScope.localStorage.get('questionAnswered');

    // perfil de usuario
    $rootScope.profile = $rootScope.localStorage.get('profile');

    // variable que indica si el usuario es admin
    $rootScope.isAdminProfile = angular.equals($rootScope.profile, $rootScope.CONSTANTS.APP.PROFILES.ADMIN);

    // variable que indica si el usuario es user
    $rootScope.isUserProfile = angular.equals($rootScope.profile, $rootScope.CONSTANTS.APP.PROFILES.USER);

    // variable que indica si el usuario es public
    $rootScope.isPublicProfile = angular.equals($rootScope.profile, $rootScope.CONSTANTS.APP.PROFILES.PUBLIC);
        
    // variable de configuración de la app
    $rootScope.settings = {
        // opciones del header
        header: {
            // variable para saber si muestra o no el boton "+"
            showNewButton: false
        }
    }

    /**
    *   Listeners
    */
    // se inicia la escucha de los eventos del servidor real-time
    $rootScope.socket.startListeners();

    /**
    *   Función que se ejecuta automáticamente cuando la app va a cambiar de un estado a otro
    **/
    $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {
        // variable que indica si un usuario esta o no en sala
        var inRoom = $rootScope.localStorage.get('inRoom');

        // cada vez que el estado se cambia se actualiza el título en el header de la app
        if (angular.isDefined(toState.settings.title)) {
            $rootScope.currentState.name = toState.settings.title;
        }

        // si el usuario no esta en una sala, se envía al login
        if (!inRoom && !toState.isLogin && !toState.settings.isPublic) {
            e.preventDefault();
            $state.go('login');
        } else {
            // verificamos si el usuario esta en una sala pero ha perdido conexión con el servidor
            var lostServerConnection = (inRoom && !$rootScope.userIsJoin) ;
            // var que indica si el usuario intenta autenticarse por URL
            var joinFromURL = (toState.settings.isPublic && !$rootScope.lodash.isEmpty(toParams.pin));

            // se verifica que el usuario realmente este conectado al server o intenta autenticarse por url (charts)
            if (lostServerConnection || joinFromURL) {
                // datos de conexion al server
                var joinData = null;

                // se verifica si el usuario perdio conexion con el server
                if (lostServerConnection) {
                    // se obtienen los datos de la sala
                    var roomId = $rootScope.localStorage.get('roomId');
                    var pin = $rootScope.localStorage.get('roomPin');
                    var userId = $rootScope.localStorage.get('userId');
                    
                    // se validan los datos
                    if (!$rootScope.lodash.isEmpty(roomId) && !$rootScope.lodash.isEmpty(pin) && !$rootScope.lodash.isEmpty(userId)) {
                        joinData = {
                            roomId: roomId,
                            userId: userId,
                            pin: pin,
                        };
                    }
                } else if (joinFromURL) {
                    joinData = {
                        pin: toParams.pin,
                        isPublic: true // se indica un perfil publico
                    }
                }

                    
                // se valida que existan datos de autenticación
                if (!$rootScope.lodash.isEmpty(joinData) && !toState.isLogout) {
                    // el usuario esta autenticado pero se reinicio la sesión (recargaron la pagina, cerraron el tab, etc), se une nuevamente.
                    $rootScope.joinToRoom(joinData, false);
                } else {
                    console.log('leave!');
                    // leave room
                    $rootScope.leaveRoom();
                }
                
                console.log('RE-JOIN!!');
            } else if ($rootScope.lodash.isEmpty($rootScope.fixedState) 
                    || (!$rootScope.lodash.isEmpty($rootScope.fixedState) && angular.equals(toState.name, $rootScope.fixedState))
                    || toState.settings.isPublic) {
                // Validación para que el usuario se mantenga en el estado actual (si esta especificado)

                // se verifica si se debe o no mostrar el boton "+" para el módulo actual
                if (angular.isDefined(toState.settings.showNewButton)) {
                    $rootScope.settings.header.showNewButton = toState.settings.showNewButton;
                } else {
                    // por defecto no se muestra el boton "+" en el header
                    $rootScope.settings.header.showNewButton = false;
                }
            } else {
                console.log('redirect to fixedState: ', $rootScope.fixedState);
                // El estado al que se intenta acceder es diferente al especificado por la app, se envía el usuario al estado especificado.
                e.preventDefault();
                $state.go($rootScope.fixedState);
            }            
        }
    });
});