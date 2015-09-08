/**
*   Objeto que se usa como shema para el manejo de usuarios
*
*   @author: Sebastián Lara <jlara@kijho.com>
*
*   @created: 15/05/2015
*/

/**
*   Constructor del modelo
*/
function User(data) {
    this.id = data.id;
    this.status = "active";
}


/**
*   Función responsable de obtener el estado del usuario
*/
User.prototype.getStatus = function() {
    return this.status;
}

// se exporta el módulo
module.exports = User;
