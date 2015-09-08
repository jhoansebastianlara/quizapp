/**
*   Objeto que se usa como schema para el manejo de usuarios
*
*   @author: Sebastián Lara <jlara@kijho.com>
*
*   @created: 15/05/2015
*/

/**
*   Módulos
*/
var _ = require('lodash');

/**
*   Constructor del modelo
*/
function User(data) {
	// identificador del usuario
    this.userId = data.userId;
    // perfil del usuario: "admin", "user", "public"
    this.profile = data.profile || 'user';
    // estado del usuario
    this.status = "active";
}


/**
*   Función responsable de obtener el estado del usuario
*/
User.prototype.getStatus = function() {
    return this.status;
}

/**
*   Función responsable de obtener el perfil del usuario
*/
User.prototype.getProfile = function() {
    return this.profile;
}

/**
*   Función responsable indicar si el usuario es o no un usuario "admin"
*/
User.prototype.isAdminProfile = function() {
    return _.isEqual(this.profile, 'admin');
}

/**
*   Función responsable indicar si el usuario es o no un usuario "admin"
*/
User.prototype.isUserProfile = function() {
    return _.isEqual(this.profile, 'user');
}

// se exporta el módulo
module.exports = User;
