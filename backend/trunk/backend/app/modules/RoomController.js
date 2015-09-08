/**
*   Módulo de administración de salas.
*
*   @author: Sebastián Lara <jlara@kijho.com>
*
*   @created: 05/05/2015
*/

/**
*   Módulos
*/
var UserManager = require('./UserController'),
    _ = require('lodash');


/**
*   Constructor
*/
function RoomController() {
    this.rooms = {};
}


/**
*   Función responsable de agregar una sala.
*
*   @param roomData Object, datos de la sala a agregar.
*/
RoomController.prototype.addRoom = function(roomData) {
    // se supone el peor de los casos
    var result = false;
    
    // se valida la información antes de agregarla y que no exista previamente
    if (this.validateRoom(roomData) && !this.existsRoom(roomData.roomId)) {
        // se agrega la sala al listado
        this.rooms[roomData.roomId] = roomData;
        // la sala fue agregada con éxito
        result = true;
    }

    return result;
}

/**
*   Función responsable de validar los datos de una sala para agregar.
*
*   @param roomData Object, datos de la sala a agregar.
*/
RoomController.prototype.validateRoom = function(roomData) {    
    // se supone el peor de los casos
    var result = false;

    // se valida que por lo menos llegue el id de la sala
    if (!_.isUndefined(roomData.roomId) && !_.isEmpty(roomData.roomId)) {        
        result = true;        
    }

    return result;    
}

/**
*   Función responsable de validar si una sala ya existe.
*
*   @param roomId, id de la sala a validar su existencia.
*/
RoomController.prototype.existsRoom = function(roomId) {
    // se supone el peor de los casos.
    var result = false;

    if (!_.isEmpty(roomId) && !_.isEmpty(this.rooms[roomId])) {
        result = true;
    }

    return result;
}




/**
*   Función responsable de obtener el listado de salas.
*/
RoomController.prototype.getRooms = function (roomId) {
    // Listado de las salas con información básica
    var roomsList = {};

    _.forEach(this.rooms, function(room, roomId) {
        roomsList[roomId] = {
            roomId: room.roomId,
            name: room.name
        }
    });

    return roomsList;
}


/**
*   Función responsable de obtener una sala.
*
*   @param roomId, id de la sala que se desea obtener.
*/
RoomController.prototype.getRoom = function (roomId) {

}


/**
*   Función responsable de eliminar una sala.
*
*   @param roomId, id de la sala que se desea eliminar.
*/
RoomController.prototype.removeRoom = function (roomId) {

}

// se exporta el módulo
module.exports = RoomController;
