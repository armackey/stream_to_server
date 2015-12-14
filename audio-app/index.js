var AppRouter = require('../utils/app-router');
var cookieParser = require('cookie-parser');
var fs = require('fs');
var currentStreams = {};

module.exports = function(server){
    

  var parser = cookieParser();
  server
    .use(parser)
    .use('/', AppRouter(__dirname + '/../client'))
    .use('/users', require('./users'))
    .get('/stream', function(req, res){
        res.send(Object.keys(currentStreams));
    });

  var __clips_dir = __dirname + '/../audio-clips';

  server
    .ws('/stream/:user', function(req, cb){
        if(!currentStreams[req.params.user]){
            return cb(false);
        }
        cb(function(socket){
            var subs = currentStreams[req.params.user].subscribers;
            subs.push(socket);
            socket.on('close', function(){
                subs.splice(subs.indexOf(socket), 1);
            })
        });

    })
    .ws('/stream', function(req, cb){
        if(!req.cookies){
            return cb(false);
        }

        if(!req.cookies.user){
            return cb(false);
        }
        
        if(currentStreams[req.cookies.user]){
            return cb(false);
        }
        
        var user = req.cookies.user;

        cb(function(socket){
            var stream = currentStreams[user] = {
                socket:socket,
                user:user,
                file: fs.createWriteStream(__clips_dir + '/' + Date.now() + user + '.ogg'),
                subscribers: []
            };
    
            socket.on('message', function(message, flags){
                var binary;
                if(!flags.binary) return;

                var length = message.length;
                var binary = new Uint8Array(length);
                for (var i = 0; i < length; i++) {
                  binary[i] = message.readUInt8(i);
                }
                stream.file.write(binary);
                stream.subscribers.forEach(function(sub){
                    sub.send(binary, {binary:true, mask:false});
                });
            });
            
            socket.on('close', function(){
                stream.file.end();
                stream.subscribers.forEach(function(sub){
                    stream.subscribers.forEach(function(sub){
                        sub.close();
                    });
                })
                delete currentStreams[user];
            });
        })
    });
};

