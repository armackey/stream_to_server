var Router = require('express').Router;
var path = require('path');

module.exports = function(dir){
    var router = new Router();
    router.get('/', function(req, res){
        res.sendFile(path.resolve(dir, 'index.html'));
    })
    router.get('/main.js', function(req, res){
        res.sendFile(path.resolve(dir, 'main.js'));
    })
    router.get('/main.css', function(req, res){
        res.sendFile(path.resolve(dir, 'main.css'));
    })
    return router;
};
