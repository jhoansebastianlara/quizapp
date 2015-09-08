/**
*   Objeto que se usa como schema para el manejo de preguntas
*
*   @author: Sebastián Lara <jlara@kijho.com>
*
*   @created: 19/05/2015
*/

/**
*   Módulos
*/
var AnswerController = require('../controllers/AnswerController'),
    Answer = require('../models/Answer'),
    _ = require('lodash');

/**
*   Constructor del modelo
*/
function Question(data) {
    // controlador de respuestas
    this.answerController = new AnswerController();
	// identificador de la pregunta
    this.questionId = null;
    // estado de la pregunta: waiting | running | stop
    this.status = "waiting";
    // tipo de pregunta: single | multiple
    this.answerType = 'single';
    // cantidad de respuestas máximas por usuario
    this.maxAnswersByUser = 1;
    // posibles respuestas para la pregunta
    this.availableAnswers = {};
    // objeto con el resumen de las respuestas
    this.answersSummary = {};
    // total de respuestas
    this.totalAnswers = 0;

    // se generan las posibles respuestas a la pregunta
    this.generateAvailableAnswers();
}

/**
*   Función responsable de generar las posibles respuestas para la pregunta
*/
Question.prototype.generateAvailableAnswers = function () {
    // A
    var answerA = new Answer({
        code: '1',
        value: 'A'
    });

    // B
    var answerB = new Answer({
        code: '2',
        value: 'B'
    });

    // C
    var answerC = new Answer({
        code: '3',
        value: 'C'
    });

    // D
    var answerD = new Answer({
        code: '4',
        value: 'D'
    });

    // se agregan las posibles respuestas
    this.availableAnswers[answerA.getAnswerId()] = answerA;
    this.availableAnswers[answerB.getAnswerId()] = answerB;
    this.availableAnswers[answerC.getAnswerId()] = answerC;
    this.availableAnswers[answerD.getAnswerId()] = answerD;

    // se genera la estructura base para el resumen de las respuestas
    this.generateBaseAnswerSummary();
}

/**
*   Función responsable de generar la estructura base para el resumen de respuestas
*   teniendo en cuenta las respuestas posibles de la pregunta.
*/
Question.prototype.generateBaseAnswerSummary = function () {
    // var que contiene la estructura base de los resultados
    this.answersSummary = {};

    // se inicializa el total de respuestas
    this.totalAnswers = 0;

    for (availableAnswerId in this.availableAnswers) {
        this.answersSummary[this.availableAnswers[availableAnswerId].code] = {
            total: 0
        }
    }
}

/**
*   Función responsable de registrar una respuesta
*/
Question.prototype.addAnswer = function (answerData) {
    // se agrega la respuesta
    var answer = this.answerController.addAnswer(answerData);

    // si la respuesta fue agregada con exito, se actualiza el resumen :)
    if (!_.isEmpty(answer)) {
        // variable para saber si se encontro o no la pregunta en el resumen
        var foundInSummary = false

        for (answersSummaryId in this.answersSummary) {
            if (!foundInSummary && (answersSummaryId == answer.code)) {
                // se actualiza el resumen
                this.answersSummary[answersSummaryId].total++;
                this.totalAnswers++;
                foundInSummary = true;
            }
        }
    }

    return answer;
}

/**
*   Función responsable de validar los datos de una respuesta, se valida que existan
*   los datos mñinimos de la respuesta y que el usuario no haya respuesto más de las
*   veces permitidas.
*/
Question.prototype.validateAnswer = function (answerData) {
    // resultado de la validación
    var result = false;

    // se valida la información de entrada
    if (this.answerController.validateAnswer(answerData)) {
        // se consulta la cantidad máxima de respuestas por usuario
        var maxAnswersByUser = this.getMaxAnswersByUser();

        // se consulta la cantidad de veces que ha respuesto el usuario
        var amountAnswersByUser = this.answerController.getAmountAnswersByUser(answerData.userId);

        // se valida que el usuario no exceda la cantidad de respuestas permitidas
        if (amountAnswersByUser < maxAnswersByUser) {
            result = true;
        }
    }

    return result;
}


/**
*   Función responsable de obtener las respuestas de la pregunta
*/
Question.prototype.getAnswers = function () {
    return this.answerController.getAnswers();
}


/**
*   Función responsable de iniciar una pregunta
*/
Question.prototype.run = function () {
    return this.setStatus('running');
}


/**
*   Función responsable de parar una pregunta
*/
Question.prototype.stop = function () {
    return this.setStatus('stop');
}


/**
*   Función responsable de obtener el estado de la pregunta
*/
Question.prototype.getStatus = function () {
    return this.status;
}

/**
*   Función responsable de modificar el estado de la pregunta
*/
Question.prototype.setStatus = function (status, restart) {
    // resultado de la operación
    var result = false;

    // se valida el estado de la pregunta
    if (this.validateStatus(status)) {
        // se modifica el estado
        this.status = status;

        // se valida si se debe reiniciar la pregunta        
        if (restart) {
            // se reinician las respuestas
            if (this.answerController.restartAnswers()) {
                // se reinicia el resumen de resultados
                this.generateBaseAnswerSummary();
                result = true;                
            }
        } else {
            result = true;            
        }
    }

    return result;
}


/**
*   Función responsable de validar el estdo de una pregunta
*/
Question.prototype.validateStatus = function (status) {
    return (_.isEqual(status, 'waiting') || _.isEqual(status, 'running') || _.isEqual(status, 'stop'));
}


/**
*   Función responsable de validar si la pregunta es de respuesta única.
*/
Question.prototype.isSingleAnswer = function () {
    return (_.isEqual(this.answerType, 'single'));
}


/**
*   Función responsable de validar si la pregunta es de respuesta única.
*/
Question.prototype.getMaxAnswersByUser = function () {
    return this.maxAnswersByUser;
}

/**
*   Función responsable de retornar el resumen de respuestas para una pregunta
*/
Question.prototype.getAnswersSummary = function () {
    // se arma la estructura que espera el frontend
    var response = {
        results: this.answersSummary,
        totalAnswers: this.totalAnswers
    }

    return response;
}





// se exporta el módulo
module.exports = Question;
