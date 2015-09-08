/**
*   Módulo de administración de respuestas.
*
*   @author: Sebastián Lara <jlara@kijho.com>
*
*   @created: 21/05/2015
*/

/**
*   Módulos
*/
var Answer = require('../models/Answer'),
	uuid = require('uuid'),
    _ = require('lodash');

/**
*   Constructor
*/
function AnswerController(data) {
	// respuestas
    this.answers = {};
};


/**
*   Función responsable de agregar una respuesta para una pregunta.
*
*   @param answerData Object, objeto con los datos para la nueva respuesta.
*/
AnswerController.prototype.addAnswer = function (answerData) {
    // se supone el peor de los casos
    var answer = null;

    // se valida la respuesta
    if (this.validateAnswer(answerData)) {
        // se genera el id de la respuesta
        answerData.answerId = this.generateAnswerId();

        // se instancia la respuesta
        answer = new Answer(answerData);

        // se agrega la respuesta al listado
        this.answers[answerData.answerId] = answer;
    }

    return answer;
}


/**
*   Función responsable de crear un id de respuesta único.
*/
AnswerController.prototype.generateAnswerId = function () {
    // se crea un id de respuesta
    var answerId = uuid.v4();

    // variable 
    var isUnique = false;

    do {
        // en caso de existir el id de respuesta, se itera hasta encontrar uno único
        isUnique = !this.existsAnswer(answerId);
    } while(!isUnique);

    return answerId;
}


/**
*   Función responsable de validar los datos de una respuesta, se valida
*   que existan los datos mínimos.
*   
*   @param answerDat Object, datos de la respuesta a validar
*/
AnswerController.prototype.validateAnswer = function (answerData) {
    // se espera el peor de los casos
    var result = false;

    // se valida que el objeto no sea vacío
    if (!_.isEmpty(answerData)) {
        // se espera que mínimamente llegue el codigo de la respuesta y el id del que la envia
        if (!_.isUndefined(answerData.code) && !_.isUndefined(answerData.userId)) {
            result = true;
        }
    }

    return result;

}

/**
*   Función responsable de consultar la cantidad de veces que un usuario
*   ha enviado una respuesta.
*/
AnswerController.prototype.getAmountAnswersByUser = function (userId) {
    // cantidad de veces que el usuario a respuesto
    var amountAnswers = 0;

    if (!_.isUndefined(userId)) {
        // se recorren las respuestas actuales
        _.forEach(this.answers, function(answer, answerId) {
            if (_.isEqual(answer.getUserId(), userId)) {
                // se aumenta la cantidad de respuestas enviadas
                ++amountAnswers;
            }
        });
    }

    return amountAnswers;
}


/**
*   Función responsable de validar si una respuesta existe.
*   @param answerId, id de la respuesta que se desea validar su existencia.
*/
AnswerController.prototype.existsAnswer = function(answerId) {
    // se supone el peor de los casos.
    var result = false;

    if (!_.isUndefined(answerId) && !_.isUndefined(this.answers[answerId])) {
        // usuario encontrado
        result = true;
    }

    return result;
};


/**
*   Función responsable de obtener el listado de respuestas
*/
AnswerController.prototype.getAnswers = function () {
    return this.answers;
}


/**
*   Función responsable re reiniciar las respuestas de una pregunta
*/
AnswerController.prototype.restartAnswers = function () {
    // se resetean las respuestas
    this.answers = {};

    return true;
}


// se exporta el módulo
module.exports = AnswerController;
