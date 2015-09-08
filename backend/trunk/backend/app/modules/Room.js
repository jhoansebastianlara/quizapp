/**
*   Módulo que se usa para la administración de las salas.
*
*   @author: Sebastián Lara <jlara@kijho.com>
*
*   @created: 14/05/2015
*/

/**
*   Módulos
*/
var UserManager = require('./UserController'),
    _ = require('lodash');

/**
*   Constructor del modelo
*/
function Room(data) {
    this.roomId = data.roomId;
    this.pin = data.pin || '';
    this.admin = null;
    this.users = [];
    this.status = "active";
    this.private = false;
}

/**
*   Función responsable de agregar un nuevo usuario a la sala.
*   @param userData Object, datos de usuario a crear.
*/
Room.prototype.addUser = function(userData) {
    
}


/**
*   Función responsable de eliminar un usuario de la sala.
*   @param userId, id del usuario a eliminar de la sala.
*/
Room.prototype.removeUser = function(userId) {

}


/**
*   Función responsable de obtener los usuarios de la sala.
*   @param userId (Opcional), id del usuario que se quiere omitir en la lista.
*/
Room.prototype.getUsers = function(userId) {

}

/**
*   Función responsable de obtener un usuario específico de la sala.
*   @param userId, id del usuario que se quiere obtener.
*/
Room.prototype.getUser = function(userId) {

}


/**
*   Función responsable de asignar un administrador a la sala.
*   @param userData Object, datos del administrador de la sala.
*/
Room.prototype.setAdmin = function(userData) {

}

/**
*   Función responbsale de eliminar el administrador de la sala.
*/
Room.prototype.removeAdmin = function() {

}

/**
*   Función responsable de obtener el estado de la sala.
*/
Room.prototype.getStatus = function() {
    return this.status;
}

/**
*   Función responsable responder si la sala es o no privada.
*/
Room.prototype.isPrivate = function() {
    return this.private;
}

// se exporta el módulo
module.exports = Room;
