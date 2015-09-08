/**
*   Módulo de administración de usuarios.
*
*   @author: Sebastián Lara <jlara@kijho.com>
*
*   @created: 28/04/2015
*/

/**
*   Módulos
*/
var User = require('../models/User'),
	uuid = require('uuid'),
    _ = require('lodash');

/**
*   Constructor
*/
function UserController(data) {
	// lista de usuarios
    this.users = {};
};

/**
*   Función responsable de agregar un usuario.
*   @param userData Object, datos del usuario a agregar.
*/
UserController.prototype.addUser = function(userData) {
	// se supone el peor de los casos
    var user = null;

    // puede o no llegar un id de usuario, si no llega se genera
    if (_.isEmpty(userData.userId)) {
    	userData.userId = this.generateUserId();
    }

    // se valida que la info del usuario a crear
    if (this.validateUser(userData)) {
    	// se instancia el usuario
    	user = new User(userData);

	    // se agrega el usuario al listado
        this.users[userData.userId] = user;
    }
    
    return user;
}


/**
*	Función responsable de crear un id de usuario único.
*/
UserController.prototype.generateUserId = function () {
	// se crea un id de usuario
    var userId = uuid.v4();
    // Var que indica si el id es único
    var isUnique = false;

    do {
    	// en caso de existir el id del usuario, se itera hasta encontrar un id único
    	isUnique = !this.existsUser(userId);
    } while(!isUnique);

    return userId;
}


/**
*   Función responsable de validar la información de un usuario
*   para agregarlo.
*   @param userData Object, datos del usuario a validar.
*/
UserController.prototype.validateUser = function (userData) {
	// se supone el peor de los casos
	var result = false;

	// se valida que la información llegue
	if (!_.isUndefined(userData) && !_.isEmpty(userData)) {
		// si el id es no vacio y no existe aún, entonces la info es válida
		if (!_.isEmpty(userData.userId)) {
			result = true;
		}
	}

	return result;
}


/**
*   Función responsable de validar si un usuario exite.
*   @param UserId, id del usuario que se desea validar su existencia.
*/
UserController.prototype.existsUser = function(userId) {
	// se supone el peor de los casos.
    var result = false;

    if (!_.isUndefined(userId) && !_.isUndefined(this.users[userId])) {
    	// usuario encontrado
        result = true;
    }

    return result;
};

/**
*   Función responsable de obtener el listado de usuarios.
*
*   @param userId, id del usuario que se quiere omitir.
*/
UserController.prototype.getUsers = function(userId) {
	return this.users;
};


/**
*   Función responsable de obtener los datos de un usuario.
*
*   @param userId, id del usuario que se quiere obtener.
*/
UserController.prototype.getUser = function(userId) {
    // objeto de respuesta
    var user = null;

    // se consulta si la sala existe
    if (!_.isUndefined(userId) && !_.isUndefined(this.users[userId])) {
        // usuario encontrada
        user = this.users[userId];
    }

    return user;
};


/**
*   funcion responsable de responder el socket asociado a un usuario.
*
*   @param userId, id del usuario que se quiere obtener su socket.
*/
UserController.prototype.getSocket = function(userId) {

};


/**
*   Función responsable de eliminar un usuario del listado de usuarios.
*
*   @param userId, id del usuario que se quiere eliminar.
*/
UserController.prototype.removeUser = function(userId) {
    // se supone el peor de los casos
    var result = false;

    // se valida que llegue un id de usuario y que exista en el listado
    if (!_.isEmpty(userId) && this.existsUser(userId)) {
        // se elimina el usuario del listado
        delete this.users[userId];
        result = true;
    }
    
    return result;
};  


// se exporta el módulo
module.exports = UserController;
