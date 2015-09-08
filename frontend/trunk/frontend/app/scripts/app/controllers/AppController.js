'use strict';

/**
*   @description
*   Módulo que encapsula todos los controladores de la aplicación.
*
*   @author: Sebastián Lara <jlara@kijho.com>
*   
*   @created: 12/05/2015
*/

var appControllers = angular.module('appControllers', []);

appControllers.controller('AppController', ['$rootScope', '$state',
	function ($rootScope, $state) {
		// Variable que indica que la aplicación esta realizando una operación
		$rootScope.loading = false;


		/**
		*	Función responsable de fijar el estado de la sala.
		*
		*	@param roomStatus, nuevo estado de la sala.
		*/
		$rootScope.setRoomStatus = function (roomStatus) {
			console.log('setRoomStatus: ' + roomStatus);
			// se verifica si el usuario esta o no en sala
			if ($rootScope.userIsJoin) {
				// Se actualiza el estado de la sala según el perfil de usuario conectado
				if ($rootScope.isUserProfile || $rootScope.isPublicProfile) {
					setUserState(roomStatus);
				} else if ($rootScope.isAdminProfile) {
					setAdminState(roomStatus);
				}
			}
		}

		/**
		*	Función responsable de eliminar la sesión de un usuario en una sala
		*/
		$rootScope.leaveRoom = function (data) {
			console.log('leave room');
            // se indica en la sesión que el usuario NO esta unido al servidor
            $rootScope.userIsJoin = false;

    		// variable que indica si el usuario es user
		    $rootScope.isUserProfile = false;

    		// variable que indica si el usuario es admin
		    $rootScope.isAdminProfile = false;

		    // variable que indica si el usuario es public
		    $rootScope.isPublicProfile = false;

    		// se almacenan los datos localmente
    		$rootScope.localStorage.remove('inRoom');
    		$rootScope.localStorage.remove('roomId');
    		$rootScope.localStorage.remove('roomPin');
    		$rootScope.localStorage.remove('userId');
    		$rootScope.localStorage.remove('profile');
    		$rootScope.localStorage.remove('fixedState');
			$rootScope.localStorage.remove('messageInfo');
			$rootScope.localStorage.remove('questionAnswered');

    		// se elimina el estado fijo
    		$rootScope.fixedState = null;
            // se indica que no se ha enviado respuesta
            $rootScope.questionAnswered = false;

    		// se emite el evento al servidor
    		$rootScope.socket.prototypes.emit.user.leave();

    		// Se envía el usuario al login
        	$state.go('login');
        }


		/**
		*	Función responsable de emitir el evento de unir un usuario a una sala y manipular la respuesta.
		*
		*	@param joinData, datos del usuario a unir a una sala.
		*/
		$rootScope.joinToRoom = function (joinData, showAlerts) {
			// se indica el loading
			$rootScope.loading = true;

			// se emite el evento al server para crear una nueva sala
            $rootScope.socket.prototypes.emit.user.join(joinData)
            .then(function (response) {
            	console.log('joinData:');
                console.log(joinData);
                console.log('response:');
                console.log(response);

                // se verifica si el resultado fue exitoso
                if (response.success) {
                	// se muestra el toast si la variable para mostrar alertas esta activa 
                	if (showAlerts) {
                		// se informa al usuario que el código es correcto
			    		$rootScope.utils.toast.showSimple({
			    			content: 'PIN Correcto!',
			    			type: 'primary',
			    			hideDelay: 3000
			    		});
                	}

                	// se crea la sesion al usuario
                	createUserSesion(response.data);
                } else {
                	// se muestran los errores si la variable para mostrar alertas esta activa 
                	if (showAlerts) {
                		showJoinUserError(response.error);
                	} else {
                		console.log('leave from join', response.error)
                		$rootScope.leaveRoom();
                	}
                }

                // El loading se termina
                $rootScope.loading = false;
            }, function () {
            	console.log('ERROR!!');
                // El loading se termina
                $rootScope.loading = false;
            });
		}


		/**
		*	Función responsable de iniciar una pregunta en la sala para habilitar 
		*	el formulario de respuesta en los usuarios conectados.
		*/
		$rootScope.runQuestion = function () {
			// se valida que el que emite el evento este en la sala y que tenga un perfil admin
			if (validateAdminProfile()) {
				// se emite el evento al server para iniciar una nueva pregunta
		        $rootScope.socket.prototypes.emit.question.setStatus({
					status: 'running'
				});
			}
		}


		/**
		*	Función responsable de parar una pregunta en la sala y asi inhabilitar el formulario 
		*	de respuesta de los usuarios y desplegar la gráfica de resultados
		*/
		$rootScope.stopQuestion = function () {
			// se valida que el que emite el evento este en la sala y que tenga un perfil admin
			if (validateAdminProfile()) {
				// se emite el evento al server
		        $rootScope.socket.prototypes.emit.question.setStatus({
					status: 'stop'
				});
			}
		}


		/**
		*	Función responsable reiniciar una pregunta.
		*/
		$rootScope.restartQuestion = function () {
			// se valida que el que emite el evento este en la sala y que tenga un perfil admin
			if (validateAdminProfile()) {
				// se emite el evento al server
		        $rootScope.socket.prototypes.emit.question.setStatus({
					status: 'running',
					restart: true
				});
			}
		}


		/**
		*	Función responsable de dejar una pregunta en espera
		*/
		$rootScope.waitingQuestion = function () {
			// se valida que el que emite el evento este en la sala y que tenga un perfil admin
			if (validateAdminProfile()) {
				// se emite el evento al server
		        $rootScope.socket.prototypes.emit.question.setStatus({
					status: 'waiting',
					restart: true
				});
			}
		}

		/**
		*	Función responsable de actualizar el resumen de resultados en la app
		*/
		$rootScope.updateAnswersSummary = function () {
			// Variable donde almacena los resultados luego de procesarlos.
	        $rootScope.answersSummary = [
	            {
	                values: [
	                    ["A", 0],
	                    ["B", 0],
	                    ["C", 0],
	                    ["D", 0]
	                ]
	            }
	        ];

	        // numero total de respuestas
	        $rootScope.amountAnswers = 0;

	        // se solicita la actualizacion de los resultados
	        $rootScope.socket.prototypes.emit.question.updateAnswersSummary()
	        .then(function (response) {
	            console.log('response updateAnswersSummary: ', response)

	            // se valida la respuesta
	            if (response.result && !$rootScope.lodash.isEmpty(response.data.answersSummary)) {
	                // resumen de los resultados
	                var results = response.data.answersSummary.results;

	                // total de respuestas
	                $rootScope.amountAnswers = response.data.answersSummary.totalAnswers;

	                // se parsea la información y se asigna a la variable esperada por la libreria de graficas
	                $rootScope.answersSummary = $rootScope.utils.app.parseAnswersSummary(results);
	            }
	        });
		}


		/**
		*	Función responsable de validar si el usuario puede manipular
		*	los eventos de un admin
		*/
		var validateAdminProfile = function () {
			// se supone el peor de los casos
			var isValid = false;

			// se valida que el que emite el evento este en la sala y que tenga un perfil admin
			if ($rootScope.userIsJoin && $rootScope.isAdminProfile) {
				isValid = true;
			} else {
				// no tienen los privilegios, se expulsa.
				$rootScope.leaveRoom();
			}

			return isValid;			 
		}


		/**
		*	Función responsable de mostrar los errores que pueden ocurrir
		*	al unir un usuario a una sala.
		*
		*	@param error, objeto con el error que ha ocurrido.
		*/
		var showJoinUserError = function (error) {	
			console.log(error);		
        	// se verifica que tipo de error llega y se muestra el correspondiente mensaje al usuario
        	switch(error.code) {
        		case 215:
                    $rootScope.utils.dialog.showAlert({
                        title: 'PIN Incorrecto',
                        content: 'El PIN ingresado no corresponde a ninguna sala, verifíquelo e intente nuevamente.'
                    });
                break;

                case 187:
        			$rootScope.utils.dialog.showAlert({
        				title: 'La sala ya cuenta con un expositor',
        				content: 'Actualmente la sala ya cuenta con un expositor, contacta al organizador del evento.'
        			});
        		break;

        		default:
        			$rootScope.utils.dialog.showAlert({
        				title: 'Alerta',
        				content: 'Ha ocurrido un error al procesar su petición, intente de nuevo más tarde. Gracias'
        			});
        		break;
        	}        
		}

		/**
		*	Función responsable de crear la sesión de un usuario en una sala
		*
		*	@param joinData, datos de conexion a una sala.
		*/
		var createUserSesion = function (data) {
            // se indica en la sesión que el usuario esta unido al servidor
            $rootScope.userIsJoin = true;

    		// se obtienen los datos de la sala y el perfil del usuario que se une a la sala.
    		var roomId = data.room.roomId;
    		var pin = data.room.pin;
    		var pinAdmin = data.room.pinAdmin;
    		var userId = data.user.userId;
    		var profile = data.user.profile;

    		// variable que indica si el usuario es user
		    $rootScope.isUserProfile = angular.equals(profile, $rootScope.CONSTANTS.APP.PROFILES.USER);

    		// variable que indica si el usuario es admin
		    $rootScope.isAdminProfile = angular.equals(profile, $rootScope.CONSTANTS.APP.PROFILES.ADMIN);

		    // variable que indica si el usuario es public
    		$rootScope.isPublicProfile = angular.equals(profile, $rootScope.CONSTANTS.APP.PROFILES.PUBLIC);

    		// se almacenan los datos localmente
    		$rootScope.localStorage.set('inRoom', true);
    		$rootScope.localStorage.set('roomId', roomId);
    		$rootScope.localStorage.set('roomPin', pinAdmin || pin);
    		$rootScope.localStorage.set('userId', userId);
    		$rootScope.localStorage.set('profile', profile);

    		// Se cambia el estado de la sala y se redirecciona al usuario según su perfil.
        	$rootScope.setRoomStatus(data.room.status);
        }
        
		
        /**
		*	Función responsable de configurar la aplicación para un perfil de usuario "user"
		*
		*	@param roomStatus, estado de la sala.
		*/
		var setUserState = function (roomStatus) {
			console.log('setUserState: ', roomStatus);
			// variable del nuevo estado fijo
			var newFixedState = '';
			var fixedStateParams = {};
			var messageInfo = '';

			// segun el estado de la sala se cambia al usuario de vista
			switch(roomStatus) {
				case 'waiting.admin':
					newFixedState = 'info';
					messageInfo = 'Esperando a que el expositor inicie con la actividad...';
				break;

				case 'waiting.question':
					newFixedState = 'info';
					messageInfo = 'Esperando a que el expositor inicie una nueva pregunta...';
				break;

				case 'question.running':
					// se verifica si es un usuario tipo "user"
					if ($rootScope.isUserProfile) {
						// Se valida si el usuario ha respuesto o no
						if ($rootScope.questionAnswered) {
							// el usuario ya envio una respuesta, se envía al gráfico de resultados
							newFixedState = 'answerResults';
							console.log('ya respondio');
						} else {
							// el usuario aún no responde, se envía al form de la pregunta
							newFixedState = 'question';
							console.log('aun no responde');
						}						
					} else if ($rootScope.isPublicProfile) {
						newFixedState = 'publicResults'
						/*fixedStateParams = {
							pin: $rootScope.localStorage.get('roomPin')
						}*/
					}
				break;

				case 'question.stop':
					if ($rootScope.isUserProfile) {
						newFixedState = 'answerResults';						
					}
				break;

				default:
					console.log('unreconized roomStatus');
				break;
			}

			console.log('messageInfo: ', messageInfo);

			// se modifica el mensaje de informacion
			if (!$rootScope.lodash.isEmpty(newFixedState)) {
				$rootScope.messageInfo = messageInfo;
				$rootScope.localStorage.set('messageInfo', $rootScope.messageInfo);
			}			

			// Se verifica si hay un nuevo estado fijo para redireccionar
			if (!$rootScope.lodash.isEmpty(newFixedState)) {
				// se modifica el estado fijo en el contexto local
				$rootScope.fixedState = newFixedState;

				// se almacena el estado fijo y el mensaje informativo localmente para uso futuro
				$rootScope.localStorage.set('fixedState', $rootScope.fixedState);

				console.log('fixedStateParams: ', fixedStateParams);

				// se modifica el estado fijo
				$state.go($rootScope.fixedState, fixedStateParams);
			}
		}


		/**
		*	Función responsable de configurar la aplicación para un perfil de usuario "admin"
		*
		*	@param roomStatus, estado de la sala.
		*/
		var setAdminState = function (roomStatus) {				
			// variable del nuevo estado fijo
			var newFixedState = '';

			// segun el estado de la sala se cambia al usuario de vista
			switch(roomStatus) {
				case 'waiting.admin':
				case 'waiting.question':
					newFixedState = 'controlPanel';
				break;

				case 'question.running':
					$rootScope.runningQuestion = true;
					newFixedState = 'monitorActivity';
				break;
									
				case 'question.stop':
					$rootScope.runningQuestion = false;
					newFixedState = 'monitorActivity';
				break;

				default:
					console.log('unreconized roomStatus');
				break;
			}

			// Se verifica si hay un nuevo estado fijo para redireccionar
			if (!$rootScope.lodash.isEmpty(newFixedState)) {
				// se almacena el estado fijo localmente para uso futuro
				$rootScope.localStorage.set('fixedState', newFixedState);
				
				// se modifica el estado fijo en el contexto local
				$rootScope.fixedState = newFixedState;

				// se modifica el estado fijo
				$state.go(newFixedState);
			}
		}

	}
]);