/**
 *	@description
 *  Fábrica que contiene utilidades generales de la aplicación.
 *
 *	@author Sebastián Lara <jlara@kijho.com>
 *
 *	@created 19/05/2015
 */

var appUtilities = angular.module('appUtilities', []);

/**
 *   @description
 *   Fábrica que contiene las funciones de uso general en toda la aplicación.
 *   
 */

appUtilities.factory('appUtilities', ['$rootScope', 'CONSTANTS', '$mdDialog', '$mdToast',
    function($rootScope, CONSTANTS, $mdDialog, $mdToast) {
    
        var utilities = {
            /**
            *   Utilidades de la app
            */
            app: {
                /**
                *   Funcionalidad responsable de parsear los resultados de la respuesta
                *   al formato esperado por la libreria de que dibuja las gráficas.
                */
                parseAnswersSummary: function (results) {
                    // objeto con el formato esperado
                    var answersSummaryParse = {};

                    // Array donde almacena las respuestas de las respuestas.
                    var simpleResults = [];

                    angular.forEach(results, function (answer, key) {
                        simpleResults.push(answer.total);
                    });

                    if ($rootScope.lodash.size(simpleResults) > 0) {
                        answersSummaryParse = [
                            {
                                values: [
                                    ["A. " + simpleResults[0], simpleResults[0]],
                                    ["B. " + simpleResults[1], simpleResults[1]],
                                    ["C. " + simpleResults[2], simpleResults[2]],
                                    ["D. " + simpleResults[3], simpleResults[3]]
                                ]
                            }
                        ];
                    }

                    return answersSummaryParse;
                }
            },

            /**
            *   Objeto con funcionalidades de diálogo
            */
            dialog: {

                /**
                *   Función responsable de mostrar un toast
                */
                showAlert: function (data, ev) {
                    $mdDialog.show(
                        $mdDialog.alert()
                            .parent(angular.element(document.body))
                            .title(data.title || '')
                            .content(data.content || '')
                            .ariaLabel(data.ariaLabel || '')
                            .ok(data.ok || 'Ok')
                            .targetEvent(ev)
                    );
                }
                
            },

            /**
            *   Objeto con funcionalidades de Toast
            */
            toast: {
                /**
                *   Función responsable de mostrar un simple Toast
                */
                showSimple: function (data) {
                    /*$mdToast.show(
                        $mdToast.simple()
                            .content(data.content || '')
                            .tempate('<md-toast class="Toast">Gracias por responder!</md-toast>')
                            .position(data.position || 'bottom')
                            .hideDelay(data.hideDelay || 3000)
                    );*/
                    var toastClass = $rootScope.lodash.isEmpty(data.type) ? 'primary' : data.type;

                    $mdToast.show({
                        template  : '<md-toast class="' + toastClass + '">' + data.content + '</md-toast>',
                        hideDelay : data.hideDelay || 3000,
                        position  : data.position || 'bottom left'
                    });
                }
            }
        };

        return utilities;
      
    }
]);
