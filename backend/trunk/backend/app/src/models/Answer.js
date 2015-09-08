/**
*   Objeto que se usa como schema para el manejo de respuestas
*
*   @author: Sebastián Lara <jlara@kijho.com>
*
*   @created: 21/05/2015
*/

/**
*   Módulos
*/
var _ = require('lodash'),
    uuid = require('uuid');


/**
*   Constructor del modelo
*/
function Answer(data) {
	// identificador de la respuesta, si no llega se genera uno
    this.answerId = data.answerId || uuid.v4();
    // código de la respuesta
    this.code = data.code;
    // id del usuario que envia la respuesta
    this.userId = data.userId || null;
    // valor de la respuesta
    this.value = data.value || '';
    // estado de la respuesta
    this.status = "active";
}


/**
*   Función responsable de enviar el id de la respuesta
*/
Answer.prototype.getAnswerId = function () {
    return this.answerId;
}


/**
*   Función responsable de enviar el id del usuario que envio la respuesta
*/
Answer.prototype.getUserId = function () {
    return this.userId;
}


// se exporta el módulo
module.exports = Answer;
