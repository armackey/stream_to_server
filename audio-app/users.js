var Router = require('express').Router;
var bodyParser = require('body-parser');

var users = [];

//var router = CrudRouter(users);


var router = new Router();

router.post('/login', bodyParser, function(req, res, next){
    var valid = users.indexOf(req.body.name);
    
    if(valid > -1) return next(new Error('bad user'));
    
    users.push(req.body.name);
    
    res.cookie('user', valid[0].id);
    res.send('ok');
});

router.get('/logout', function(req, res, next){
    res.clearCookie('user');
    var valid = users.indexOf(req.cookies.user);
    if(valid == -1) return next(new Error('user doesn\'t exist'));
    users.splice(valid, 1);
    res.send('ok');
});

module.exports = router;