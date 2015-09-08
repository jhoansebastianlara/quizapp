module.exports = function(req, res, next){
    res.locals.nick = 'jsebastianlara';
    next();
}; 
