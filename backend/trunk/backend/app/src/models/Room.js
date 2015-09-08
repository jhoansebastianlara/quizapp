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
var UserController = require('../controllers/UserController'),
    Question = require('./Question'),
    _ = require('lodash');


/**
*   Constructor del modelo
*/
function Room(data) {
    // controlador de usuarios
    this.userController = new UserController();
    // identificador de la sala
    this.roomId = data.roomId;
    // pin  de acceso a la sala para el perfil "user"
    this.pin = data.pin || '';
    // pin  de acceso a la sala para el perfil "admin"    
    this.pinAdmin = data.pinAdmin || '';
    // administrador de la sala
    this.admin = null;
    // estado de la sala: waiting.admin | waiting.question | question.running | question.stop
    this.status = "waiting.admin";
    // pregunta asociada a la sala
    this.question = new Question();
    // variable para indicar si la sala es o no privada
    this.private = false;
}


/**
*   Función responsable de agregar un nuevo usuario a la sala.
*   @param userData Object, datos de usuario a crear.
*/
Room.prototype.addUser = function(userData) {
    var user = this.userController.addUser(userData);

    // se valida si el usuario fue agregado y es perfil admin
    if (!_.isEmpty(user) && _.isEqual(user.getProfile(), 'admin')) {
        // se asigna el admin
        this.setAdmin(user);
    }

    return user;
}


/**
*   Función responsable de validar si un usuario existe en la sala
*
*   @param userId, id del usuario a validar.
*/
Room.prototype.existsUser = function (userId) {
    return this.userController.existsUser(userId);
}


/**
*   Función responsable de eliminar un usuario de la sala.
*   @param userId, id del usuario a eliminar de la sala.
*/
Room.prototype.removeUser = function(userId) {
    // se consulta si el usuario a eliminar es admin
    var isAdminProfile = this.userController.getUser(userId).isAdminProfile();

    // se elimina el usuario
    var removeUser =  this.userController.removeUser(userId);

    // si el usuario que se remueve es admin
    if (isAdminProfile) {
        // se elimina el usuario de la sala
        this.removeAdmin();
    }

    return removeUser;
}


/**
*   Función responsable de obtener los usuarios de la sala.
*   @param userId (Opcional), id del usuario que se quiere omitir en la lista.
*/
Room.prototype.getUsers = function() {
    return this.userController.getUsers();
}


/**
*   Función responsable de obtener un usuario específico de la sala.
*   @param userId, id del usuario que se quiere obtener.
*/
Room.prototype.getUser = function(userId) {
    return this.userController.getUser(userId);
}


/**
*   Función responsable de asignar un administrador a la sala.
*   @param userData Object, datos del administrador de la sala.
*/
Room.prototype.setAdmin = function(user) {
    // se asigna el admin a la sala
    this.admin = user;
    // se cambia el estado de la sala dependiendo el estado de la pregunta
    this.defineStatus();
}


/**
*   Función responbsale de eliminar el administrador de la sala.
*/
Room.prototype.removeAdmin = function() {
    // se elimina el admin
    this.admin = null;
    // se cambia el estado de la sala
    this.defineStatus();
}


/**
*   Función responsable de retornar si la sala tiene o no un admin
*/
Room.prototype.hasAdmin = function () {
    return !_.isEmpty(this.admin);
}

/**
*   Función responsable de retornar si la sala tiene o no una pregunta
*/
Room.prototype.hasQuestion = function () {
    return !_.isEmpty(this.question);
}

/**
*   Función responsable de modificar el estado de la pregunta
*/
Room.prototype.setQuestionStatus = function (questionStatus, restartQuestion) {
    // resultado de la operación
    var result = false;

    // se verifica si hay pregunta
    if (this.hasQuestion()) {
        // se modifica el estado de la pregunta
        if (this.question.setStatus(questionStatus, restartQuestion)) {
            // se define el estado de la sala dependiendo del estado de la pregunta
            this.defineStatus();
            result = true;
        }
    }

    return result;
}


/**
*   Función responsable de definir el estado de la sala
*   dependiendo del estado de la pregunta y de si hay o no admin.
*/
Room.prototype.defineStatus = function() {
    // se valida si la sala tiene una pregunta
    if (!this.hasQuestion()) {
        // la sala no tiene pregunta, se verifica si tiene admin
        if (this.hasAdmin()) {
            // con admin y esperando pregunta
            this.status = 'waiting.question';
        } else {
            // esperando por el admin
            this.status = 'waiting.admin';
        }
    } else {
        // se consulta el estado actual de la pregunta
        var statusQuestion = this.question.getStatus();

        // el estado de la sala depende del estado de la pregunta
        switch (statusQuestion) {
            case 'waiting':
                // se la pregunta tiene admin y entra al estado esperando por pregunta
                if (this.hasAdmin()) {
                    this.status = 'waiting.question';
                } else {
                    this.status = 'waiting.admin';                    
                }
            break;

            case 'running':
                this.status = 'question.running';
            break;

            case 'stop':
                this.status = 'question.stop';
            break;

            default:
                this.status = 'waiting.question';
            break;
        }
    }
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


/**
*   Función responsable de obtner la pregunta de la sala
*/
Room.prototype.getQuestion = function () {
    return this.question;
}


/**
*   Función responsable de iniciar una pregunta
*/
Room.prototype.runQuestion = function () {
    // resultado de la acción
    var result = false;

    // se inicia la pregunta en la sala
    if (this.question.run()) {
        // se cambia el estado de la sala
        this.status = "question.running";
        result = true;
    }

    return result;
}


/**
*   Función responsable de detener una pregunta
*/
Room.prototype.stopQuestion = function () {
    // resultado de la acción
    var result = false;

    // se inicia la pregunta en la sala
    if (this.question.stop()) {
        // se cambia el estado de la sala
        this.status = "question.stop";
        result = true;
    }

    return result;
}


// se exporta el módulo
module.exports = Room;
