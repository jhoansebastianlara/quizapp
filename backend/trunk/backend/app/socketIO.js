var Io = require('socket.io'),
	// Controllers
	UserController = require('./src/controllers/UserController'),
	RoomController = require('./src/controllers/RoomController'),
	// utilidades
	_ = require('lodash');

var SocketIO = function(config) {
	config = config || {};
	var io = Io.listen(config.server);

	// se inicializan  los controladores
	var userController = new UserController();
	var roomController = new RoomController();

	io.sockets.on('connection', function(socket) {
		console.log('user connected');
		//socket.join('some::room');

		/**
		*	Evento para crear una nueva sala.
		*/
		socket.on('room.create', function (data, fn) {
			// variable que retorna el resultado del evento, se supone el peor de los casos
			var response = {
				success: false
			};

			// se valida la información de la sala
			if (roomController.validateRoom(data)) {
				// se consulta la existencia de la sala por "roomId", "pin" y "pinAdmin"
				var existRoom = roomController.existsRoom(data);

				// se verifica si la sala existe
				if (existRoom.result) {
					// la sala ya existe, se informa al usuario
					response.error = {
						message: 'Room id already exists, try another',
						data: existRoom.data
					}					
				} else {
					// se agrega la sala
					if (roomController.addRoom(data)) {
						// sala agregada con éxito
						response = {
							success: true,
							data: {
								rooms: roomController.getRooms()
							}
						}
					} else {
						// se indica que no se pudo agregar la sala
						response.error = {
							code: 131,
							message: 'Failed to add the room'
						}
					}
				}
			} else {
				response.error = {
					code: 87,
					message: 'Invalid room data'
				}
			}

			fn(response);
		});
	
		/**
		*	Evento para obtener todas las salas.
		*/
		socket.on('room.getAll', function (data, fn) {
			// respuesta al evento
			var response = {
				data: {
					rooms: roomController.getRooms()
				}
			};

			fn(response);
		});

				
		/**
		*	Evento que une un usuario a una sala
		*/
		socket.on('user.join', function (data, fn) {
			console.log('on user.join');
			// variable que retorna el resultado del evento, se supone el peor de los casos
			var response = {
				success: false
			};

			// se valida que llegue el pin para acceder a una sala
			if (!_.isEmpty(data)) {
				// se consulta si el PIN que llega por parámetro pertenece a una sala
				var checkRoom = roomController.checkRoom(data);

				// se valida si el pin es correcto
				if (checkRoom.result) {
					// se obtiene la sala a la cual pertenece el PIN y a la que se agregará el usuario
					var room = checkRoom.data.room;

					// se crea el objeto con la información del usuario a agregar
					var userData = {
						userId: data.userId || null,
						profile: checkRoom.data.profile
					}

					// se agrega el usuario a la sala
					var user = room.addUser(userData);

					// se valida si se agrego con éxito
					if (!_.isEmpty(user)) {
						// se une el usuario a la sala
						socket.join(room.roomId);

						// se indica el id de la sala al socket para uso futuro
						socket.roomId = room.roomId;

						// se indica el id de la sala al socket para uso futuro
						socket.userId = user.userId;

						// se informa a los demas miembros de la sala sobre la existencia de un nuevo usuario
						io.in(room.roomId).emit('user.join', user);

						// se verifica si el usuario que se acaba de unir es admin, de ser asi se informa a los usuarios
						if (user.isAdminProfile()) {
							// se actualiza el estado de la sala
							io.in(room.roomId).emit('room.update', {
								room: {
									status: room.getStatus()
								}
							});
						}

						// usuario agregado con éxito
						response = {
							success: true,
							data: {
								room: {
									roomId: room.roomId,
									pin: (user.isUserProfile()) ? room.pin : null,
									pinAdmin: (user.isAdminProfile()) ? room.pinAdmin : null,
									status: room.getStatus(),
									users: room.getUsers()
								},
								user: user
							}
						};
					} else {
						response.error = {
							message: 'Failed to add the user',
							code: 131
						}
					}
				} else if (!_.isUndefined(checkRoom.error)) {
					response.error = checkRoom.error;
				}
			}

			fn(response);
		});

		
		/**
		*	Evento para iniciar una nueva pregunta
		*/
		socket.on('question.update', function (data, fn) {
			// resultado de la accion, se supone el peor de los casos
			var response = {
				success: false
			};

			// se obtiene el nuevo estado de la sala
			var questionStatus = data.status;
			// variable que indica si se tiene o no que reiniciar la pregunta
			var restartQuestion = data.restart || false;

			// Se valida la información del emisor del evento, sólo puede activar la pregunta el administrador de la sala.
			if (!_.isEmpty(socket.roomId) && !_.isEmpty(socket.userId) && !_.isEmpty(questionStatus)) {
				// se obtiene el id del usuario y la sala a la que pertenece
				var roomId = socket.roomId;
				var userId = socket.userId;

				// se consulta la sala que contiene la pregunta que se va a iniciar
				var room = roomController.getRoom(roomId);
				// se valida el nuevo estado de la pregunta
				var isValidQuestionStatus = room.getQuestion().validateStatus(questionStatus);

				// se valida si la sala existe y si el nuevo estado es válido
				if (!_.isEmpty(room) && isValidQuestionStatus) {
					// se consulta el usuario emisor
					var user = room.getUser(userId);
					
					// se valida si el emisor es el administrador de la sala a la que pertenece
					if (!_.isEmpty(user) && user.isAdminProfile()) {
						// se valida el resultado de la operación
						if (room.setQuestionStatus(questionStatus, restartQuestion)) {

							// pregunta iniciada, se informa a todos los usuarios conectados en la sala
							io.in(room.roomId).emit('room.update', {
								room: {
									status: room.getStatus(),
									restart: restartQuestion
								}
							});

							// se calcula el resumen de resultados y se envia a todos los usuarios
							var answersSummary = room.getQuestion().getAnswersSummary();

							// se envia el resumen de las respuestas a todos los usuarios en la sala
							io.in(room.roomId).emit('question.updateAnswersSummary', {
								answersSummary: answersSummary
							});

							// éxito al iniciar la pregunta
							response.success = true;
						} else {
							// error interno
							response.error = {
								code: 131,
								message: 'Internal error'
							}
						}
					} else {
						// el usuario no existe o existe pero no es admin
						if (_.isEmpty(user)) {
							// el usuario no existe
							response.error = {
								code: 34,
								message: 'User not found'
							}
						} else {
							// el usuario existe pero no es admin (sin privilegios)
							response.error = {
								code: 179,
								message: 'User not authorized'
							}
						}
					}
				} else {
					if (_.isEmpty(room)) {
						// no se encontro la sala
						response.error = {
							code: 34,
							message: 'Room not found'
						}
					} else if (!isValidQuestionStatus) {
						// estado no válido
						response.error = {
							code: 34,
							message: 'Question status not found'
						}
					}
				}
			} else {
				// faltan parámetros
				response.error = {
					code: 272,
					message: 'Missing params'
				}
			}

			fn(response);
		});


		socket.on('question.updateAnswersSummary', function (data, fn) {
			// respuesta al evento
			var response = {
				result: false
			};

			// se obtiene el usuario y la sala del usuario emisor del evento
			var userData = getUserData(socket);

			// se valida si se encontraron los datos
			if (userData.result) {
				// usuario emisor
				var user = userData.data.user;
				// sala a la que pertenece el usuario
				var room = userData.data.room;

				// se calcula el resumen de resultados y se envia a todos los usuarios
				var answersSummary = room.getQuestion().getAnswersSummary();

				// se arma la respuesta
				response = {
					result: true,
					data: {
						answersSummary: answersSummary
					}
				}
			} else {
				// se responde con el error
				response.error = userData.error;
			}

			fn(response);
		});
		
		/**
		*	Evento para agregar una respuesta a una pregunta
		*/
		socket.on('question.answer', function (data, fn) {
			// resultado de la accion, se supone el peor de los casos
			var response = {
				success: false
			};

			// se obtiene el usuario y la sala del usuario emisor del evento
			var userData = getUserData(socket);

			// se valida si se encontraron los datos
			if (userData.result) {
				// usuario emisor
				var user = userData.data.user;
				// sala a la que pertenece el usuario
				var room = userData.data.room;

				// se agrega el id del usuario a la respuesta
				data.userId = user.userId;

				// pregunta a la cual se envia la respuesta
				var question = room.getQuestion();

				// se validan los datos de la respuesta
				if (question.validateAnswer(data)) {
					// informacion valida, se agrega la respuesta
					if (question.addAnswer(data)) {
						// éxito al agregar la respuesta

						response = {
							success: true,
							data: {
								room: {
									status: room.getStatus()
								},
								answers: question.getAnswers()
							}
						}

						// se calcula el resumen de resultados y se envia a todos los usuarios
						var answersSummary = question.getAnswersSummary();

						// se envia el resumen de las respuestas a todos los usuarios en la sala
						io.in(room.roomId).emit('question.updateAnswersSummary', {
							answersSummary: answersSummary
						});

					} else {
						// error interno
						response.error = {
							code: 131,
							message: 'Internal error'
						}
					}
				} else {
					// Los datos de entrada mno son válidos
					response.error = {
						code: 87,
						message: 'Invalid answer data or already answered'
					}
				}
			} else {
				// se responde con el error
				response.error = userData.error;
			}

			fn(response);
		});


		// Un usuario sale de la sala
		socket.on('user.leave', function () {
			console.log('on user.leave');
			leaveRoom(socket);
		});

		// evento para desconectar al usuario
		socket.on('disconnect', function () {
			console.log('on disconnect');
			leaveRoom(socket);
		});
	});

	var leaveRoom = function(socket) {
		console.log('user disconnect');

		// se elimina el usuario de la sala a la cual pertenecía
		if (!_.isEmpty(socket.roomId) && !_.isEmpty(socket.userId)) {
			// se obtiene el id del usuario y la sala a la que pertenece
			var roomId = socket.roomId;
			var userId = socket.userId;

			// se consulta la sala
			var room = roomController.getRoom(roomId);

			// se valida si la sala existe
			if (!_.isUndefined(room)) {
				// se valida si el usuario existe
				if (room.existsUser(userId)) {
					// se obtiene el usuario a eliminar de la sala
					var user = room.getUser(userId);

					// se elimina el usuario de la sala
					if (room.removeUser(userId)) {
						// se verifica si el usuario que se acaba de unir es admin, de ser asi se informa a los usuarios
						if (user.isAdminProfile()) {
							// se actualiza el estado de la sala
							io.in(room.roomId).emit('room.update', {
								room: {
									status: room.getStatus()
								}
							});
						}

					}
				}
			}
		}
	};

	/**
	*	Función responsable de obtener el usuario y la sala a partir
	*	del socket emisor de un evento.
	*/
	var getUserData = function (socket) {
		// resultado de la consulta
		var response = {
			result: false
		};

		// se elimina el usuario de la sala a la cual pertenecía
		if (!_.isEmpty(socket) && !_.isEmpty(socket.roomId) && !_.isEmpty(socket.userId)) {
			// se obtiene el id del usuario y la sala a la que pertenece
			var roomId = socket.roomId;
			var userId = socket.userId;

			// se consulta la sala
			var room = roomController.getRoom(roomId);

			// se valida si la sala existe
			if (!_.isUndefined(room)) {
				// se valida si el usuario existe
				if (room.existsUser(userId)) {
					// se obtiene el usuario a eliminar de la sala
					var user = room.getUser(userId);

					response = {
						result: true,
						data: {
							user: user,
							room: room
						}
					}
				} else {
					// usuario indefinido
					response.error = {
						code: 34,
						message: 'User not found'
					}
				}
			} else {
				// sala indefinida
				response.error = {
					code: 34,
					message: 'Room not found'
				}
			}
		} else {
			// faltan parámetros
			response.error = {
				code: 272,
				message: 'Missing params'
			}
		}


		return response;
	}
}

module.exports = SocketIO;