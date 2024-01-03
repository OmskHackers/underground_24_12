var mongojs = require('mongojs');
var db = mongojs('mongodb:27017/univeria', ['account','progress','npc']);

Database = {};
Database.isValidPassword = function(data, callback) {
    db.account.find({username:data.username,password:data.password}, function(err,res) {
        callback(res.length > 0);
    });
}

Database.isUsernameTaken = function(data, callback) {
    db.account.findOne({username:data.username}, function(err,res) {
        response = false;
        if (res)
            response = true;
        callback(response);
    });
}

Database.addUser = function(data, callback) {
    db.account.insert({username:data.username,password:data.password}, function(err) {
        Database.savePlayerProgress({
            username:data.username,
            items:[
                {"id": Math.random(), "name": "potion", "amount": 1, "price": 1, "from": "starter pack", "description": ""},
                {"id": Math.random(), "name": "money", "amount": 1, "price": 1, "from": "starter pack", "description": ""}
            ],
            die:false,
            quest: {taken:false, done:false, complete:false},
            class: data.class,
            str: data.str,
            int: data.int,
            agi: data.agi,
            score: 0
        },function() {
            callback();
        })
    });
}

Database.getPlayerProgress = function(username, callback) {
    db.progress.findOne({username:username}, function(err,res) {
        if (res)
            callback({
                items:res.items,
                die:res.die,
                quest:res.quest,
                score:res.score,
                class: res.class,
                str: res.str,
                int: res.int,
                agi: res.agi,
            });
        else
            callback({
                items:[],
                quest:{taken:false, done:false, complete:false},
                die:false,
                score:0,
                class:'Mag',
                str: 10,
                int: 15,
                agi: 10
            });
    });
}

Database.savePlayerProgress = function(data, callback) {
    callback = callback || function(){}
    db.progress.update({username:data.username},data,{upsert:true}, callback);
}

Database.addNpc = function(id, callback) {
    callback = callback || function(){}

    db.npc.insert({id:id, items:[]}, function(res) {
    });
}

Database.getNpcProgress = function(id, callback) {
    db.npc.findOne({id:id}, function(err, res) {
        if (res) {
            callback({
                items:res.items,
            });
        } else {
            Database.addNpc(id);
            callback({
                items:[],
            });
        }
    });
}

Database.saveNpcProgress = function(id, data, callback) {
    callback = callback || function(){}
    db.npc.update({id:id},data,{upsert:true}, callback);
}
