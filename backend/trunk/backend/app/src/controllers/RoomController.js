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
var Room = require('../models/Room'),
    _ = require('lodash');


/**
*   Constructor
*/
function RoomController() {
    // objeto que contiene las salas de un evento
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

    // se consulta si la sala existe
    var existRoom = this.existsRoom(roomData);
    
    // se valida la información antes de agregarla y que no exista previamente
    if (this.validateRoom(roomData) && !existRoom.result) {
        // se instancia la sala
        var room = new Room(roomData);
        // se agrega la sala al listado
        this.rooms[roomData.roomId] = room;
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

    // se valida que exista info
    if (!_.isUndefined(roomData)) {
        // se valida que llegue el "roomId", "pin" y "pinAdmin"        
        if (!_.isEmpty(roomData.roomId) && !_.isEmpty(roomData.pin) && !_.isEmpty(roomData.pinAdmin)) {
            result = true;
        }
    }    

    return result;    
}


/**
*   Función responsable de validar si una sala ya existe teniendo en cuenta
*   su "roomId", "pin" y "pinAdmin".
*
*   @param roomId, id de la sala a validar su existencia.
*/
RoomController.prototype.existsRoom = function(roomData) {
    // se supone el peor de los casos.
    var response = {
        result: false
    };

    // se valida que lleguen los datos
    if (this.validateRoom(roomData)) {
        // se busca la sala por su "roomId"
        var roomByRoomId = this.getRoomByProperty({
            'roomId': roomData.roomId
        });

        // se busca la sala por su "pin"
        var roomByPin = this.getRoomByProperty({
            'pin': roomData.pin
        });

        // se busca la sala por su "pinAdmin"
        var roomByPinAdmin = this.getRoomByProperty({
            'pinAdmin': roomData.pinAdmin
        });

        // se valida si se encontro la sala por uno de los parámetros
        if (!_.isUndefined(roomByRoomId) || !_.isUndefined(roomByPin) 
                || !_.isUndefined(roomByPinAdmin)) {
            // La sala existe
            response = {
                result: true,
                data: {
                    roomId: !_.isUndefined(roomByRoomId) ? true : false,
                    pin: !_.isUndefined(roomByPin) ? true : false,
                    pinAdmin: !_.isUndefined(roomByPinAdmin) ? true : false,
                }
            }
        }
    }

    return response;
}

/**
*   Función responsable de obtener una sala por una propiedad indicada.
*
*   @param key, nombre de la propiedad por la cual buscar.
*   @param value, valor de la propiedad por la cual buscar.
*/
RoomController.prototype.getRoomByProperty = function(search) {
    // se busca una sala que corresponda al pin que llega como parametro
    var room = _.find(this.rooms, search);

    return room;
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
            status: room.status,
            users: room.getUsers()
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
    // objeto de respuesta
    var room = null;

    // se consulta si la sala existe
    if (!_.isUndefined(roomId) && !_.isUndefined(this.rooms[roomId])) {
        // sala encontrada
        room = this.rooms[roomId];
    }

    return room;
}


/**
*   Función responsable de eliminar una sala.
*
*   @param roomId, id de la sala que se desea eliminar.
*/
RoomController.prototype.removeRoom = function (roomId) {

}


/*
*   Función responsable de verificar su una sala por su pin, en caso de encontrarla
*   se consulta si el pin pertenece a un perfil de "user" o "admin".
*
*   @param data, datos para verificar la sala.
*/
RoomController.prototype.checkRoom = function (data) {
    // objeto de respuesta, se espera el peor de los casos: que el pin no corresponda a ninguna sala.
    var response = {
        result: false
    };

    // pin para unirse a una sala
    var pin = data.pin || null;
    // indica si el usuario es o no público
    var isPublic = data.isPublic || false;
    // id de la sala a la que se desea unir
    var roomId = data.roomId || null;

    // se valida que el pin contenga un valor
    if (!_.isUndefined(pin) && !_.isEmpty(pin)) {
        // se busca la sala por su "pin"
        var roomByPin = this.getRoomByProperty({
            'pin': pin
        });

        // se busca la sala por su "pinAdmin"
        var roomByPinAdmin = this.getRoomByProperty({
            'pinAdmin': pin
        });

        // se valida si el pin es correcto y si se especifica una sala se compara que corresponda a la encontrada.
        if (!_.isUndefined(roomByPin) && (_.isEmpty(roomId) || _.isEqual(roomByPin.roomId, roomId)) ) {
            // El PIN es correcto
            response = {
                result: true,
                data: {
                    profile: isPublic ? 'public' : 'user',
                    room: roomByPin
                }
            };
        } else if (!_.isUndefined(roomByPinAdmin) && (_.isEmpty(roomId) || _.isEqual(roomByPinAdmin.roomId, roomId)) ) {
            // perfil "admin", PIN correcto se valida si actualmente hay un administrador de la sala
            if (_.isEmpty(roomByPinAdmin.admin)) {                
                response = {
                    result: true,
                    data: {
                        profile: "admin",
                        room: roomByPinAdmin
                    }
                };
            } else {
                response.error = {
                    message: 'The room already has an administrator',
                    code: 187 // already exists
                }
            }
        } else {
            response.error = {
                message: 'Bad authentication data',
                code: 215
            }
        }
    } else {
        response.error = {
            message: 'Missing or incorrect credentials',
            code: 401 // already exists
        }
    }

    return response;
}


// se exporta el módulo
module.exports = RoomController;
