var Server = require('http').Server;
var express = require('express');
var app = require('express-ws-routes')({
	methodName: 'WS'
});

require('./audio-app')(app);

app.listen(process.env.PORT, function(){
  console.log('running at ', process.env.IP, process.env.PORT);
});