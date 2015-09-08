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


/**
*   Constructor
*/
function UserController(data) {
    console.log('UserController is ready');
    this.users = [1, 2];
};

/**
*   Función responsable de agregar un usuario.
*   @param userData Object, datos del usuario a agregar.
*/
UserController.prototype.addUser = function(userData) {
    console.log('add user please!');
    return 'added!';
};


/**
*   Función responsable de validar la información de un usuario
*   para agregarlo.
*   @param userData Object, datos del usuario a validar.
*/
UserController.prototype.validateUser = function (userData) {

};


/**
*   Función responsable de validar si un usuario exite.
*   @param UserId, id del usuario que se desea validar su existencia.
*/
UserController.prototype.existsUser = function(userId) {

};

/**
*   Función responsable de obtener el listado de usuarios.
*
*   @param userId, id del usuario que se quiere omitir.
*/
UserController.prototype.getUsers = function(userId) {

};


/**
*   Función responsable de obtener los datos de un usuario.
*
*   @param userId, id del usuario que se quiere obtener.
*/
UserController.prototype.getUser = function(userId) {

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

};  


// se exporta el módulo
module.exports = UserController;
