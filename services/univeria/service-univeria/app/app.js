require('./Database');
require('./Entity');
require('./client/js/Inventory');

var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));
serv.listen(3000);
console.log("Server started");

var SOCKET_LIST = {};
var DEBUG = true;
var io = require('socket.io')(serv, {});
io.sockets.on('connection', function(socket){
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;

    socket.on('signIn',function(data) {
        Database.isValidPassword(data, function(res) {
            if (!res)
                return socket.emit('signInResponse',{success:false});
            Database.getPlayerProgress(data.username, function(progress) {
                if (progress.die) {
                    return socket.emit('signInResponse',{success:false});
                }
                if (Player.onConnect(socket, data.username,progress)) {
                    return socket.emit('signInResponse',{success:true});
                }

                Player.onDisconnect(socket);
                return socket.emit('signInResponse',{success:false});
            });
        });
    });

    socket.on('signUp',function(data) {
        Database.isUsernameTaken(data, function(res) {
            if (res) {
                socket.emit('signUpResponse',{success:false});
            } else {
                if (data.class === undefined ||
                    data.str === undefined ||
                    data.int === undefined ||
                    data.agi === undefined
                ) {
                    socket.emit('signUpResponse',{success:false});
                    return false;
                }

                Database.addUser(data, function() {
                    socket.emit('signUpResponse',{success:true});
                });
            }
        });
    });

    socket.on('disconnect', function() {
        delete SOCKET_LIST[socket.id];
        Player.onDisconnect(socket);
    });

    socket.on('evalServer',function(data) {
        if(!DEBUG)
            return

        try {
            var res = eval(data);
            socket.emit('evalAnswer',res);
        } catch (e) {
            socket.emit('evalAnswer',e);
        }
    });

    socket.on('openDialog', function() {
        Npc.list[1].stopMove = true;
    });

    socket.on('closeDialog', function() {
        Npc.list[1].stopMove = false;
    });
});

setInterval(function() {
    var packs = Entity.getFrameUpdateDate();
    if (Object.keys(Monster.list).length < 26) {
        Monster.generate();
    }
    for(var i in SOCKET_LIST) {
        var socket = SOCKET_LIST[i];
        socket.emit('init', packs.initPack);
        socket.emit('update', packs.updatePack);
        socket.emit('remove', packs.removePack);
    }
}, 1000/25);
