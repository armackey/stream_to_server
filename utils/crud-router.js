var Router = require('express').Router;
var bodyParser = require('body-parser');

module.exports = function(array){
    var router = new Router();
    var id = 0;
    router.__data = array;
    
    router.get('/', function(req, res){
        res.send(array);
    });
    router.post('/', bodyParser, function(req, res){
        req.body.id = id + '-' + Date.now();
        array.push(req.body);
    });
    router.get('/:id', function(req, res, next){
        var requested_id = req.params.id;
        var items = array.filter(function(item){
            item.id === requested_id;
        });
        if(items !== 1) return next()
        res.send(items[0]);
    });
    router.post('/:id', bodyParser, function(req, res, next){
        var requested_id = req.params.id;
        var items = array.filter(function(item){
            item.id === requested_id;
        });
        if(items !== 1) return next()
        var item = items[0];
        Object.keys(req.body).forEach(function(key){
            item[key] = req.body[key];
        });
        res.send(item);
    });
    router.delete('/:id', function(req, res, next){
        var requested_id = req.params.id;
        var index = array.reduce(function(prev, item, index){
            if(prev !== null) return prev;
            item.id === requested_id;
            return index;
        }, null);
        if(index === null) return next()
        array.splice(index, 1);
        res.send(array[index]);
    })
    return router;
};