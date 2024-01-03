require('./client/js/Inventory');
require('./Database');

var initPack = {player:[],bullet:[],portal:[],npc:[], monster:[]};
var removePack = {player:[],bullet:[],portal:[],npc:[], monster:[]};

getRandomArbitrary = function(min, max) {
    var rand = min - 0.5 + Math.random() * (max - min + 1)
    rand = Math.round(rand);
    return rand;
}

Entity = function(param) {
    var self = {
        x:1060,
        y:870,
        spdX:0,
        spdY:0,
        id:"",
        map:'farm',
    }
    if(param) {
        if(param.x)
            self.x = param.x;
        if(param.y)
            self.y = param.y;
        if(param.map)
            self.map = param.map;
        if(param.id)
            self.id = param.id;
    }
    self.update = function() {
        self.updatePosition();
    }
    self.updatePosition = function() {
        if (self.x > 300 && self.x < 1600) {
            self.x += self.spdX;
        } else if (self.x >= 1600 && self.spdX < 0) {
            self.x += self.spdX;
        } else if (self.x <= 300 && self.spdX > 0) {
            self.x += self.spdX;
        }
        if (self.y < 1600 && self.y > 300) {
            self.y += self.spdY;
        } else if (self.y >= 1600 && self.spdY < 0) {
            self.y += self.spdY;
        } else if (self.y <= 300 && self.spdY > 0) {
            self.y += self.spdY;
        }
    }

    self.getDistance = function(pt){
        return Math.sqrt(Math.pow(self.x-pt.x,2) + Math.pow(self.y-pt.y,2));
    }
    return self;
}
Entity.getFrameUpdateDate = function() {
    var pack = {
        initPack:{
            player:initPack.player,
            npc:initPack.npc,
            monster:initPack.monster,
            bullet:initPack.bullet,
            portal:initPack.portal
        },
        removePack:{
            player:removePack.player,
            npc:removePack.npc,
            monster:removePack.monster,
            bullet:removePack.bullet,
            portal:removePack.portal
        },
        updatePack:{
            player:Player.update(),
            npc:Npc.update(),
            monster:Monster.update(),
            bullet:Bullet.update(),
            portal:Portal.update(),
        }
    };
    initPack.player = [];
    initPack.npc = [];
    initPack.monster = [];
    initPack.bullet = [];
    initPack.portal = [];
    removePack.player = [];
    removePack.npc = [];
    removePack.monster = [];
    removePack.bullet = [];
    removePack.portal = [];

    return pack;
}

Player = function(param) {
    var self = Entity(param);
    self.username = param.username;
    self.pressingRight = false;
    self.pressingLeft = false;
    self.pressingUp = false;
    self.pressingDown = false;
    self.pressingAttack = false;
    self.mouseAngle = 0;
    self.class = param.progress.class;
    self.agi = param.progress.agi;
    self.str = param.progress.str;
    self.int = param.progress.int;
    self.maxSpd = 7 + (7 * (0.01 * self.agi));
    self.mana = 15 * self.int;
    self.manaPool = 15 * self.int;
    self.manaReg = 0.01 + (0.05 * self.int);
    self.hp = 100 + 25 * self.str;
    self.hpMax = 100 + 25 * self.str;
    if (self.class === 'Mage') {
        self.dmg = 1 + self.int;
        self.img = 'mage';
        self.bulletImg = 'fireball';
        self.ability = 'fireHit';
        self.manaAbility = 100;
        self.dmgAbility = (10 + self.dmg) * 1.5;
    } else if (self.class === 'Rogue') {
        self.dmg = 1 + self.agi;
        self.img = 'rogue';
        self.bulletImg = 'arrow';
        self.ability = 'rainArrow';
        self.manaAbility = 100;
        self.dmgAbility = (10 + self.dmg) * 1.5;
    } else {
        self.dmg = 1 + self.str;
        self.img = 'war';
        self.bulletImg = 'bone';
        self.ability = 'earthBomb';
        self.manaAbility = 100;
        self.dmgAbility = self.dmg * 0.25;
    }
    self.attackRate = 15/(1+(0.02 * self.agi)); // countdown between 2 attacks
    self.score = param.progress.score;
    self.inventory = new Inventory(param.progress.items,param.socket,true);
    self.quest = param.progress.quest;
    self.die = false;
    self.spriteAnimCounter = 0;
    self.shootTimer = 15/(1+(0.02 * self.agi));
    self.abilityTimer = 5;
    self.canUseAbilitiy = true;

    var super_update = self.update; //entity update
    self.update = function() {
        self.updateSpd();
        super_update();
        var level = 1;

        if (self.score <= 200) {
            level = 1;
        } else if (self.score > 200 && self.score <= 500) {
            level = 2;
        } else if (self.score > 500 && self.score <= 900) {
            level = 3;
        } else if (self.score > 900 && self.score <= 1400) {
            level = 4;
        } else if (self.score > 1400 && self.score <= 2000) {
            level = 5;
        } else if (self.score > 2000 && self.score <= 2700) {
            level = 6;
        } else if (self.score > 2700 && self.score <= 3500) {
            level = 7;
        } else if (self.score > 3500 && self.score <= 4400) {
            level = 8;
        } else if (self.score > 4400 && self.score <= 5400) {
            level = 9;
        } else {
            level = 10;
        }

        if (self.level !== undefined && self.level !== level) { //level up
            if (self.class === 'Mage') {
                self.int += 1;
                self.str += 0.25;
                self.agi += 0.5;
            } else if (self.class === 'Rogue') {
                self.int += 0.25;
                self.str += 0.5;
                self.agi += 1;
            } else {
                self.int += 0.5;
                self.str += 1;
                self.agi += 0.25;
            }
            self.level = level;
        } else { // init level
            self.level = level;
        }

        if(self.pressingRight || self.pressingLeft || self.pressingDown || self.pressingUp)
            self.spriteAnimCounter += 0.2;

        if(self.pressingAttack)
            self.shootBullet(self.mouseAngle);

        if(self.activeAbility)
            self.useAbility(self.mouseAngle);

        if (self.canUseAbilitiy === false) {
            if(self.abilityTimer++ >= 5)
                self.canUseAbilitiy = true;
        }

        if (self.manaPool > 0 && self.mana < self.manaPool) {
            self.mana += self.manaReg;
        }
    }

    self.shootBullet = function(angle) {
        if(self.shootTimer++ >= self.attackRate) {
            self.shootTimer = 0;
            Bullet({
                parent:self.id,
                angle:angle,
                x:self.x,
                y:self.y,
                map:self.map,
                dmg:self.dmg,
                img:self.bulletImg
            });
        }
    }

    self.useAbility = function(angle) {
        if (self.mana >= self.manaAbility && self.canUseAbilitiy) {
            if (self.ability === 'rainArrow') {
                angle -= 10;
                for (var i = 0; i < 3; i++) {
                    Bullet({
                        parent:self.id,
                        angle:angle + i * 10,
                        x:self.x,
                        y:self.y,
                        map:self.map,
                        dmg:self.dmg,
                        img:self.bulletImg
                    });
                }
            } else {
                Bullet({
                    parent:self.id,
                    angle:angle,
                    x:self.x,
                    y:self.y,
                    map:self.map,
                    dmg:self.dmgAbility,
                    img:self.ability
                });
            }
            self.mana -= self.manaAbility;
            self.abilityTimer = 0;
            self.canUseAbilitiy = false;
        }
    }

    self.updateSpd = function() {
        if(self.pressingRight)
            self.spdX = self.maxSpd;
        else if (self.pressingLeft)
            self.spdX = -self.maxSpd;
        else
            self.spdX = 0;

        if(self.pressingUp)
            self.spdY = -self.maxSpd;
        else if(self.pressingDown)
            self.spdY = self.maxSpd;
        else
            self.spdY = 0;
    }

    self.getInitPack = function() {
        return {
            id:self.id,
            username:self.username,
            x:self.x,
            y:self.y,
            hp:self.hp,
            hpMax:self.hpMax,
            mana:self.mana,
            manaPool:self.manaPool,
            score:self.score,
            level:self.level,
            map:self.map,
            img:self.img,
            mouseAngle:self.mouseAngle,
            spriteAnimCounter:self.spriteAnimCounter
        }
    }

    self.getUpdatePack = function() {
        return {
            id:self.id,
            x:self.x,
            y:self.y,
            hp:self.hp,
            mana:self.mana,
            score:self.score,
            level:self.level,
            map:self.map,
            mouseAngle:self.mouseAngle,
            spriteAnimCounter:self.spriteAnimCounter
        }
    }

    for (var i in Player.list) {
        if (Player.list[i].username === self.username) {
            delete self;
            return false;
        }
    }

    Player.list[self.id] = self;
    initPack.player.push(self.getInitPack());

    return self;
}
Player.list = {};
Player.onConnect = function(socket,username,progress) {
    var map = 'field';
    var player = Player({
        username:username,
        id:socket.id,
        map:map,
        socket:socket,
        progress:progress,
    });

    if (!player)
        return false;

    player.inventory.refreshRender();
    socket.on('keyPress', function(data) {
        if(data.inputId === 'left')
            player.pressingLeft = data.state;
        else if(data.inputId === 'right')
            player.pressingRight = data.state;
        else if(data.inputId === 'up')
            player.pressingUp = data.state;
        else if(data.inputId === 'down')
            player.pressingDown = data.state;
        else if(data.inputId === 'attack')
            player.pressingAttack = data.state;
        else if(data.inputId === 'mouseAngle')
            player.mouseAngle = data.state;
        else if(data.inputId === 'ability')
            player.activeAbility = data.state;
    });

    socket.on('showQuest',function() {
        if (!player.quest.taken) {
            socket.emit('showQuest', {'title': 'Welcome home, good hunter', 'description': ['У меня есть для тебя работа.', 'Принеси мне сердце дракона и я отдам тебе флаг. Я слышал дракон спрятался в замке к востоку отсюда.'], 'answers': ['Что за работа?', 'Хорошо, я беру это задание!']});
        } else if(player.quest.taken && !player.quest.done) {
            socket.emit('showQuest', {'title': 'Welcome home, good hunter', 'description': ['Ну что, где мое сердце?'], 'answers': ['']});
        } else if (player.quest.taken && player.quest.done && !player.quest.complete) {
            socket.emit('showQuest', {'title': 'Welcome home, good hunter', 'description': ['Ну что, где мое сердце?', 'О, благодарю тебя путник, забери свою награду'], 'answers': ['Держи!', 'Забрать']});
        } else if (player.quest.taken && player.quest.done && player.quest.complete) {
            socket.emit('showQuest', {'title': 'Welcome home, good hunter', 'description': ['У меня больше нет заданий для тебя'], 'answers': ['Еще увидимся']});
        }
    });

    socket.on('getQuest',function() {
        if (!player.quest.taken) {
            player.quest.taken = true;
        } else if(player.quest.taken && !player.quest.done) {
            '';
        } else if (player.quest.taken && player.quest.done && !player.quest.complete) {
            player.inventory.addItem('money', 1000000, 'money', 1, '', 'Fua');
            player.quest.complete = true;
        }
    });

    socket.on('showShop', function() {
        fuaInventory = Npc.list[1].inventory;
        items = [];
        for (var i in fuaInventory.items.slice(0, Math.min(fuaInventory.items.length, 100))) {
            items.push({
                id: fuaInventory.items[i].id,
                name: fuaInventory.items[i].name,
                price: fuaInventory.items[i].price,
                from: fuaInventory.items[i].from
            });
        }
        socket.emit('showShop', items);
    });

    socket.on('Buy', function(id) {
        fuaItems = Npc.list[1].inventory.items;
        var item = fuaItems.find(function(element, index, array) {
            if (parseFloat(element.id) === parseFloat(id))
                return true;
            return false;
        });
        var playerMoney = player.inventory.items.find(function(element, index, array) {
            if (element.name === 'money')
                return true;
            return false;
        });

        if (item && playerMoney && (parseInt(playerMoney.amount) >= parseInt(item.price))) {
            player.inventory.addItem(item.id, 1, item.name, item.price, item.description, 'Fua');
            playerMoney.amount -= item.price;
            Database.savePlayerProgress({
                username:player.username,
                items:player.inventory.items,
                die:player.die,
                quest:player.quest,
                score:player.score,
                class:player.class,
                str:player.str,
                int:player.int,
                agi:player.agi
            });
            player.inventory.refreshRender();
        } else {
            player.inventory.socket.emit('addToChat','You not have such money.');
        }
    });

    socket.on('Sell', function(id, desc, price) {
        var item = player.inventory.items.find(function(element, index, array) {
            if (parseFloat(element.id) === parseFloat(id))
                return true;
            return false;
        });
        fuaInventory = Npc.list[1].inventory;
        if (item && item.amount > 0) {
            fuaInventory.addItem(Math.random(), 1, item.name, price, desc, player.username);
            player.inventory.removeItem(item.id, item.name, 1);
            Database.savePlayerProgress({
                username:player.username,
                items:player.inventory.items,
                die:player.die,
                quest:player.quest,
                score:player.score,
                class:player.class,
                str:player.str,
                int:player.int,
                agi:player.agi
            });
            player.inventory.refreshRender();
        }

        Database.saveNpcProgress(1, {id:1, items: fuaInventory.items});
        socket.emit('showInventory', items);
    });

    socket.on('showInventory', function() {
        var items = [];
        fuaInventory = Npc.list[1].inventory;
        items = [].concat(player.inventory.items);

        fuaInventory.items.find(function(element, index, array) {
            if (element.from === player.username) {
                items.push(element);
            }
            return false;
        });
        socket.emit('showInventory', items);
    });

    socket.on('changeMap',function(data){
        if(player.map === 'field')
            player.map = 'farm';
        else
            player.map = 'field';
    });

    socket.on('sendMsgToServer',function(data){
        for(var i in Player.list) {
            Player.list[i].inventory.socket.emit('addToChat',player.username + ': ' + data);
        }
    });
    socket.on('sendPmToServer',function(data){
        var recipientSocket = null;
        for(var i in Player.list)
            if(Player.list[i].username === data.username)
                recipientSocket = Player.list[i].inventory.socket;
        if(recipientSocket === null){
            socket.emit('addToChat','The player ' + data.username + ' is not online.');
        } else {
            recipientSocket.emit('addToChat','From ' + player.username + ':' + data.message);
            socket.emit('addToChat','To ' + data.username + ':' + data.message);
        }
    });

    socket.emit('init', {
        selfId:socket.id,
        player:Player.getAllInitPack(),
        bullet:Bullet.getAllInitPack(),
        npc:Npc.getAllInitPack(),
        monster:Monster.getAllInitPack(),
        portal:Portal.getAllInitPack(),
    });

    return true;
}
Player.getAllInitPack = function() {
    var players = [];
    for (var i in Player.list)
        players.push(Player.list[i].getInitPack());
    return players;
}
Player.onDisconnect = function(socket) {
    let player = Player.list[socket.id];
    if(!player)
        return;

    Database.savePlayerProgress({
        username:player.username,
        items:player.inventory.items,
        die:player.die,
        quest:player.quest,
        score:player.score,
        class:player.class,
        str:player.str,
        int:player.int,
        agi:player.agi
    });
    delete Player.list[socket.id];
    removePack.player.push(socket.id);
}
Player.update = function() {
    var pack = [];
    for(var i in Player.list) {
        var player = Player.list[i];
        player.update();
        pack.push(player.getUpdatePack());
    }
    return pack;
}

Npc = function(param) {
    var self = Entity(param);
    self.mouseAngle = param.mouseAngle;
    self.maxSpd = 3;
    self.hp = 10000;
    self.hpMax = 10000;
    self.score = 1000;
    self.img = param.img;
    self.hpColor = param.hpColor;
    self.spriteAnimCounter = param.spriteAnimCounter;
    self.moveCounter;
    self.stopMove = false;
    Database.getNpcProgress(self.id, function(res) {
        self.inventory = new Inventory(res.items,'',true);
    });

    var super_update = self.update;
    self.update = function() {
        self.updateSpd();
        super_update();

        if(self.spdX !== 0 || self.spdY !== 0) {
            self.spriteAnimCounter += 0.2;
        }
    }

    self.updateSpd = function() {
        if (self.stopMove) {
            self.spdX = 0;
            self.spdY = 0;
            return;
        }

        if (self.moveCounter < 30) {
            self.moveCounter++;
            return;
        }
        self.spdX = 3 * getRandomArbitrary(-1, 1);
        self.spdY = 3 * getRandomArbitrary(-1, 1);

        if (self.spdY !== 0)
            self.spdX = 0;

        if (self.spdY > 0 && self.spdX === 0) {
            self.mouseAngle = getRandomArbitrary(45, 135); //down
        } else if (self.spdY === 0 && self.spdX > 0) {
            self.mouseAngle = getRandomArbitrary(135,225); // left
        } else if (self.spdY < 0 && self.spdX === 0) {
            self.mouseAngle = getRandomArbitrary(225,315); // up
        } else if (self.spdY === 0 && self.spdX < 0) {
            self.mouseAngle = Math.random() < 0.5 ? getRandomArbitrary(-45, 0) : getRandomArbitrary(0, 45); //right
        }

        self.moveCounter = 0;
    }

    self.getInitPack = function() {
        return {
            id:self.id,
            x:self.x,
            y:self.y,
            hp:self.hp,
            hpMax:self.hpMax,
            score:self.score,
            img:self.img,
            map:self.map,
            mouseAngle:self.mouseAngle,
            spriteAnimCounter:self.spriteAnimCounter,
            hpColor:self.hpColor
        }
    }

    self.getUpdatePack = function() {
        return {
            id:self.id,
            x:self.x,
            y:self.y,
            hp:self.hp,
            score:self.score,
            map:self.map,
            mouseAngle:self.mouseAngle,
            spriteAnimCounter:self.spriteAnimCounter
        }
    }


    Npc.list[self.id] = self;
    initPack.npc.push(self.getInitPack());

    return self;
}
Npc.list = {};

Npc.update = function() {
    var pack = [];
    for(var i in Npc.list) {
        var npc = Npc.list[i];
        npc.update();
        pack.push(npc.getUpdatePack());
    }
    return pack;
}
Npc.getAllInitPack = function() {
    var npc = [];
    for (var i in Npc.list)
        npc.push(Npc.list[i].getInitPack());
    return npc;
}
new Npc({
    id: 1,
    x: 1260,
    y: 1000,
    map: 'field',
    score: 1000,
    mouseAngle: 90,
    spriteAnimCounter: 1,
    img: '/client/img/npc.png',
    hp: 10000,
    hpMax: 10000,
    hpColor: "rgb(255,165,0,0)",
});

Monster = function(param) {
    var self = Entity(param);
    self.mouseAngle = param.mouseAngle;
    self.maxSpd = 5;
    self.hp = param.hp;
    self.hpMax = param.hpMax;
    self.score = param.score;
    self.img = param.img;
    self.hpColor = param.hpColor;
    self.spriteAnimCounter = param.spriteAnimCounter;
    self.moveCounter;
    self.dmg = param.dmg;
    self.bulletImg = param.bulletImg ? param.bulletImg : 'bullet';

    var super_update = self.update;
    self.update = function() {
        self.updateSpd();
        super_update();

        if(self.spdX !== 0 || self.spdY !== 0) {
            self.spriteAnimCounter += 0.2;
        }
    }

    self.shootBullet = function(angle) {
        Bullet({
            parent:self.id,
            angle:angle,
            x:self.x,
            y:self.y,
            map:self.map,
            dmg:self.dmg,
            img:self.bulletImg
        });
    }

    self.updateSpd = function() {
        if (self.moveCounter < 30) {
            self.moveCounter++;
            return;
        }
        // agr area
        var closeDiffX = 300;
        var closeDiffY = 300;
        var closePlayer;

        for (var i in Player.list) {
            var player = Player.list[i];
            if (player.map === self.map) {
                var diffX = player.x - self.x;
                var diffY = player.y - self.y;
                if (Math.abs(diffX) < closeDiffX && Math.abs(diffY) < closeDiffY)
                    closePlayer = player;
            }
        }

        if (closePlayer) {
            var diffX = closePlayer.x - self.x;
            var diffY = closePlayer.y - self.y;

            if (Math.abs(diffX) > Math.abs(diffY)) {
                self.spdY = 0;
                if (diffX > 0)
                    self.spdX = 3;
                else
                    self.spdX = -3;
            } else {
                self.spdX = 0;
                if (diffY > 0)
                    self.spdY = 3;
                else
                    self.spdY = -3;
            }
        } else {
            self.spdX = 3 * getRandomArbitrary(-1, 1);
            self.spdY = 3 * getRandomArbitrary(-1, 1);
        }

        if (self.spdY !== 0)
            self.spdX = 0;

        if (self.spdY > 0 && self.spdX === 0) {
            self.mouseAngle = getRandomArbitrary(45, 135); //down
        } else if (self.spdY === 0 && self.spdX > 0) {
            self.mouseAngle = Math.random() < 0.5 ? getRandomArbitrary(-45, 0) : getRandomArbitrary(0, 45); // left
        } else if (self.spdY < 0 && self.spdX === 0) {
            self.mouseAngle = getRandomArbitrary(225,315); // up
        } else if (self.spdY === 0 && self.spdX < 0) {
            self.mouseAngle = getRandomArbitrary(135,225); //right
        }
        self.shootBullet(self.mouseAngle);
        self.moveCounter = 0;
    }

    self.getInitPack = function() {
        return {
            id:self.id,
            x:self.x,
            y:self.y,
            hp:self.hp,
            hpMax:self.hpMax,
            score:self.score,
            img:self.img,
            map:self.map,
            mouseAngle:self.mouseAngle,
            spriteAnimCounter:self.spriteAnimCounter,
            hpColor:self.hpColor
        }
    }

    self.getUpdatePack = function() {
        return {
            id:self.id,
            x:self.x,
            y:self.y,
            hp:self.hp,
            map:self.map,
            mouseAngle:self.mouseAngle,
            spriteAnimCounter:self.spriteAnimCounter
        }
    }


    Monster.list[self.id] = self;
    initPack.monster.push(self.getInitPack());

    return self;
}
Monster.list = {};

Monster.update = function() {
    var pack = [];
    for(var i in Monster.list) {
        var monster = Monster.list[i];
        monster.update();
        pack.push(monster.getUpdatePack());
    }
    return pack;
}
Monster.getAllInitPack = function() {
    var monster = [];
    for (var i in Monster.list)
        monster.push(Monster.list[i].getInitPack());
    return monster;
}
Monster.generate = function() {
    while (Object.keys(Monster.list).length < 25) {
        new Monster({
            id: Math.random(),
            x: getRandomArbitrary(1350, 1570),
            y: getRandomArbitrary(350, 1570),
            map: 'farm',
            score: 1,
            mouseAngle: 90,
            spriteAnimCounter: 1,
            img: 'orc_magic',
            hp: 50,
            hpMax: 50,
            hpColor: "rgb(255,165,43,1)",
            dmg: 10
        });
    }

    for (i in Monster.list) {
        if (Monster.list[i].img !== 'dragon') {
            false;
        } else {
            return;
        }
    }
    new Monster({
        id: 1,
        x: getRandomArbitrary(550, 1000),
        y: getRandomArbitrary(350, 700),
        map: 'boss_room',
        score: 1000,
        mouseAngle: 90,
        spriteAnimCounter: 1,
        img: 'dragon',
        hp: 99999999999,
        hpMax: 99999999999,
        hpColor: "rgb(255,165,43,1)",
        dmg: 100,
        bulletImg: 'happyface'
    });
}

Bullet = function(param) {
    var self = Entity(param);

    // if (self.map === 'field') {
    //     self.toRemove = true;
    //     return self;
    // }

    self.id = Math.random();
    self.angle = param.angle;
    self.spdX = Math.cos(param.angle/180*Math.PI) * 10;
    self.spdY = Math.sin(param.angle/180*Math.PI) * 10;
    self.parent = param.parent;
    self.dmg = param.dmg;
    self.img = param.img;
    // earthBomb
    if (self.img === 'earthBomb') {
        self.spdX = 0;
        self.spdY = 0;

        // agr area
        var closeDiffX = 150;
        var closeDiffY = 150;
        var closeEntity;

        for (var i in Player.list) {
            var player = Player.list[i];
            if (player.map === self.map && player.id !== self.parent) {
                var diffX = player.x - self.x;
                var diffY = player.y - self.y;
                if (Math.abs(diffX) < closeDiffX && Math.abs(diffY) < closeDiffY) {
                    closeEntity = player;
                    closeDiffX = Math.abs(diffX);
                    closeDiffY = Math.abs(diffY);
                }
            }
        }

        for (var i in Monster.list) {
            var monster = Monster.list[i];
            if (monster.map === self.map) {
                var diffX = monster.x - self.x;
                var diffY = monster.y - self.y;
                if (Math.abs(diffX) < closeDiffX && Math.abs(diffY) < closeDiffY)
                    closeEntity = monster;
                    closeDiffX = Math.abs(diffX);
                    closeDiffY = Math.abs(diffY);
            }
        }

        if (closeEntity) {
            self.x = closeEntity.x;
            self.y = closeEntity.y;
        }
    }

    self.timer = 0;
    self.toRemove = false;
    var super_update = self.update;
    self.update = function() {
        if(self.timer++ > 25)
            self.toRemove = true;
        super_update();

        for(var i in Player.list){
            var p = Player.list[i];
            if(self.map === p.map && self.getDistance(p) < 32 && self.parent !== p.id) {
                p.hp -= self.dmg;

                if(p.hp <= 0){
                    var shooter = Player.list[self.parent];
                    if(shooter)
                        shooter.score += p.score * 0.1;

                    p.die = true;
                    Player.onDisconnect(p);
                }

                if (self.img !== 'earthBomb')
                    self.toRemove = true;
            }
        }

        for(var y in Monster.list){
            var m = Monster.list[y];
            if (self.map === m.map && self.getDistance(m) < 32 && self.parent !== m.id) {
                var shooter = Player.list[self.parent];
                if (shooter === undefined) {
                    self.toRemove = true;
                    return;
                }

                m.hp -= self.dmg;
                if(m.hp <= 0) {
                    shooter.score += m.score;

                    if (m.id === 1 && (shooter.quest.taken && !shooter.quest.done)) {
                        shooter.quest.done = true;
                        shooter.inventory.socket.emit('addToChat','Congrats your quest is done. Find Fua and take your reward.');
                    } else {
                        var threshhold = 20.5;
                        var randomNumber = Math.random() * 100;
                        if (randomNumber < threshhold) {
                            if (Math.round(Math.random()) === 0)
                                shooter.inventory.addItem('money', 100, 'money', 1, '', m.img)
                            else
                                shooter.inventory.addItem(Math.random(), 1, 'potion', 1, '', m.img)
                        }
                    }

                    delete Monster.list[m.id];
                    removePack.monster.push(m.id);
                }

                if (self.img !== 'earthBomb')
                    self.toRemove = true;
            }
        }
    }

    self.getInitPack = function() {
        return {
            id:self.id,
            x:self.x,
            y:self.y,
            angle:self.angle,
            map:self.map,
            img:self.img
        }
    }

    self.getUpdatePack = function() {
        return {
            id:self.id,
            x:self.x,
            y:self.y,
        }
    }

    Bullet.list[self.id] = self;
    initPack.bullet.push(self.getInitPack());
    return self;
}
Bullet.list = {};

Bullet.update = function() {
    var pack = [];
    for(var i in Bullet.list) {
        var bullet = Bullet.list[i];
        bullet.update();
        if(bullet.toRemove)
        {
            delete Bullet.list[i];
            removePack.bullet.push(bullet.id);
        }
        else {
            pack.push(bullet.getUpdatePack());
        }
    }
    return pack;
}
Bullet.getAllInitPack = function() {
    var bullets = [];
    for (var i in Bullet.list)
        bullets.push(Bullet.list[i].getInitPack());
    return bullets;
}

Portal = function(param) {
    var self = Entity(param);
    self.img = param.img;
    self.changeMap = param.changeMap;

    var super_update = self.update;
    self.update = function() {
        super_update();

        for(var i in Player.list){
            var p = Player.list[i];
            if(self.map === p.map && self.getDistance(p) < 32) {
                p.map = self.changeMap;
            }
        }
    }

    self.getInitPack = function() {
        return {
            id:self.id,
            x:self.x,
            y:self.y,
            map:self.map,
            img:self.img
        }
    }

    Portal.list[self.id] = self;
    initPack.portal.push(self.getInitPack());
    return self;
}
Portal.list = {};

Portal.update = function() {
    var pack = [];
    for(var i in Portal.list) {
        var portal = Portal.list[i];
        portal.update();
    }
    return pack;
}
Portal.getAllInitPack = function() {
    var portals = [];
    for (var i in Portal.list)
        portals.push(Portal.list[i].getInitPack());
    return portals;
}
new Portal({
    id: 1,
    x: 920,
    y: 770,
    map: 'field',
    changeMap: 'farm',
    img: '/client/img/portal.png'
});
new Portal({
    id: 2,
    x: 950,
    y: 730,
    map: 'farm',
    changeMap: 'field',
    img: '/client/img/portal.png'
});
new Portal({
    id: 3,
    x: 1500,
    y: 700,
    map: 'farm',
    changeMap: 'boss_room',
    img: '/client/img/tunnel.png'
});
new Portal({
    id: 4,
    x: 1550,
    y: 750,
    map: 'boss_room',
    changeMap: 'farm',
    img: '/client/img/tunnel.png'
});
new Portal({
    id: 5,
    x: 550,
    y: 750,
    map: 'boss_room',
    changeMap: 'field',
    img: '/client/img/portal.png'
});
