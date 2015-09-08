/**
*   @description
*   Directiva de la App
*
*   @author: Alejandro Castaño <acastano@kijho.com>
*
*   @created: 18/03/2015
*/

/**
*   Directiva necesaria para generar los gráficos de  barras.
*/
var appDirectives = angular.module('appDirectives', []);

appDirectives.directive('bars', function ($parse) {
  
  return {
     restrict: 'E',
     replace: true,
     template: '<div id="chart"></div>',
     link: function (scope, element, attrs) {
       var data = attrs.data.split(','),
       chart = d3.select('#chart')
         .append("div").attr("class", "chart")
         .selectAll('div')
         .data(data).enter()
         .append("div")
         .transition().ease("elastic")
         .style("width", function(d) { return d + "%"; })
         .text(function(d) { return d + "%"; });
     } 
  };
});