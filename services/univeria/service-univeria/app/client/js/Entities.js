var SPRITEHEIGHT = 64;
var SPRITEWIDTH = 48;

var Img = [];
Img.npc = [];
Img.portals = [];
Img.monsters = [];
Img.players = [];
Img.bullets = [];
Img.map = [];

Img.monsters['orc_magic'] = new Image;
Img.monsters['orc_magic'].src = '/client/img/orc_magic.png';
Img.monsters['dragon'] = new Image;
Img.monsters['dragon'].src = '/client/img/dragon.png';

Img.players['mage'] = new Image;
Img.players['mage'].src = '/client/img/player-mage.png';
Img.players['war'] = new Image;
Img.players['war'].src = '/client/img/player-war.png';
Img.players['rogue'] = new Image;
Img.players['rogue'].src = '/client/img/player-rogue.png';

Img.bullets['arrow'] = new Image;
Img.bullets['arrow'].src = '/client/img/arrow.png';
Img.bullets['bone'] = new Image;
Img.bullets['bone'].src = '/client/img/bone.png';
Img.bullets['fireball'] = new Image;
Img.bullets['fireball'].src = '/client/img/fireball.png';
Img.bullets['bullet'] = new Image;
Img.bullets['bullet'].src = '/client/img/bullet.png';
Img.bullets['fireHit'] = new Image;
Img.bullets['fireHit'].src = '/client/img/fireHit.png';
Img.bullets['earthBomb'] = new Image;
Img.bullets['earthBomb'].src = '/client/img/earthBomb.png';
Img.bullets['happyface'] = new Image;
Img.bullets['happyface'].src = '/client/img/bullet-happyface.png';

Img.map['field'] = new Image();
Img.map['field'].src = '/client/img/map.png';
Img.map['farm'] = new Image();
Img.map['farm'].src = '/client/img/farm_map.png';
Img.map['boss_room'] = new Image();
Img.map['boss_room'].src = '/client/img/boss_room.png';

function rotatedDrawImage (ctx, image, fromX, fromY, angle, sWidth, sHeight, dx, dy, dWidth, dHeight) {
    ctx.save();
    ctx.translate(dx + dWidth, dy + dHeight);
    ctx.rotate(angle / 180 * Math.PI);
    ctx.translate(-(dx + dWidth), -(dy + dHeight));
    ctx.drawImage(image, fromX, fromY, sWidth, sHeight, dx, dy, dWidth, dHeight);
    ctx.restore();
}

var Entity = function(id,x,y,img,map) {
	var self = {
		id:id,
		x:x,
		y:y,
		img:img,
		map:map
	};

	return self;
}

Actor = function(id,x,y,map,score,mouseAngle,spriteAnimCounter,img,hp,hpMax,hpColor,mana=0,manaPool=0,manaColor='',spriteWidth=null,spriteHeight=null){
	var self = Entity(id,x,y,img,map);
	self.hp = hp;
	self.hpMax = hpMax;
	self.mouseAngle = mouseAngle;
	self.hpColor = hpColor;
	self.hpMax = hpMax;
	self.score = score;
	self.mouseAngle = mouseAngle;
	self.spriteAnimCounter = spriteAnimCounter;
	self.mana = mana;
	self.manaPool = manaPool;
	self.manaColor = manaColor;
    self.spriteWidth = spriteWidth ? spriteWidth : SPRITEWIDTH;
    self.spriteHeight = spriteHeight ? spriteHeight : SPRITEHEIGHT;

	self.draw = function() {
		if(Player.list[selfId].map !== self.map)
			return;
		var x = self.x - Player.list[selfId].x;
		var y = self.y - Player.list[selfId].y;

        var width = self.img.width/2;
        var height = self.img.height/2;
		var hpWidth = width * self.hp / self.hpMax;
		x += WIDTH/2;
		y += HEIGHT/2;
		ctx.fillStyle = self.hpColor;
		ctx.fillRect(x - width/2,y - self.img.height/4, hpWidth, 4);

		if (self.manaPool > 0) {
			ctx.fillStyle = self.manaColor;
			var manaWidth = width * self.mana / self.manaPool;
			ctx.fillRect(x - width/2, y - self.img.height/5, manaWidth, 4);
		}

		x -= width/2;
		y -= height/2;
		var frameWidth = self.img.width/3;
		var frameHeight = self.img.height/4;
		var aimAngle = self.mouseAngle;
		if(aimAngle < 0)
			aimAngle = 360 + aimAngle;

		var directionMod = 3;	//draw right
		if(aimAngle >= 45 && aimAngle < 135)	//down
			directionMod = 2;
		else if(aimAngle >= 135 && aimAngle < 225)	//left
			directionMod = 1;
		else if(aimAngle >= 225 && aimAngle < 315)	//up
			directionMod = 0;

		var walkingMod = Math.floor(self.spriteAnimCounter) % 3;//1,2

		ctx.drawImage(self.img,
			walkingMod*frameWidth,directionMod*(frameHeight + 0.25),frameWidth,frameHeight,
			x,y,self.spriteWidth,self.spriteHeight
		);

		ctx.restore();
	}

	return self;
}

var Player = function(initPack) {
	var self = Actor(
		initPack.id,
		initPack.x,
		initPack.y,
		initPack.map,
		initPack.score,
		initPack.mouseAngle,
		initPack.spriteAnimCounter,
		Img.players[initPack.img],
		initPack.hp,
		initPack.hpMax,
		'red',
		initPack.mana,
		initPack.manaPool,
		'blue'
	);
    self.username = initPack.username;
    self.level = initPack.level;

	Player.list[self.id] = self;
	return self;
}
Player.list = {};

var Npc = function(initPack) {
	Img.npc[initPack.id] = new Image();
	Img.npc[initPack.id].src = initPack.img;

	var self = Actor(
		initPack.id,
		initPack.x,
		initPack.y,
		initPack.map,
		initPack.score,
		initPack.mouseAngle,
		initPack.spriteAnimCounter,
		Img.npc[initPack.id],
		initPack.hp,
		initPack.hpMax,
		initPack.hpColor
	);

	Npc.list[self.id] = self;
	return self;
}
Npc.list = {};

var Monster = function(initPack) {
	var self = Actor(
		initPack.id,
		initPack.x,
		initPack.y,
		initPack.map,
		initPack.score,
		initPack.mouseAngle,
		initPack.spriteAnimCounter,
		Img.monsters[initPack.img],
		initPack.hp,
		initPack.hpMax,
		initPack.hpColor
	);

    if (initPack.id === 1) {
        self.spriteWidth = 200;
        self.spriteHeight = 240;
    }

	Monster.list[self.id] = self;
	return self;
}
Monster.list = {};

var Bullet = function(initPack) {
	var self = Entity(
		initPack.id,
		initPack.x,
		initPack.y,
		Img.bullets[initPack.img],
		initPack.map
	);
	self.angle = initPack.angle;
	self.spriteAnimCounter = 0.2;

	if (initPack.img === 'bone' || initPack.img === 'fireHit' || initPack.img === 'earthBomb') {
        if (initPack.img === 'bone' || initPack.img === 'earthBomb') {
            self.stepSprite = 0.3;
            self.spriteAnimCounter = 0.3;
            self.frameWidth = self.img.width/8;
        } else if (initPack.img === 'fireHit') {
            self.stepSprite = 0.4;
            self.spriteAnimCounter = 0.4;
            self.frameWidth = self.img.width/10;
        }
		self.draw = function() {
			var frameWidth = self.frameWidth;
			var frameHeight = self.img.height;
			var x = self.x - Player.list[selfId].x + WIDTH/2;
			var y = self.y - Player.list[selfId].y + HEIGHT/2;
			var walkingMod = Math.round(self.spriteAnimCounter);//1,2
			ctx.drawImage(self.img,
				walkingMod*frameWidth,0,frameWidth,frameHeight,
				x-frameWidth/2,y-frameHeight/2,frameWidth,frameHeight
			);
			self.spriteAnimCounter += self.stepSprite;
		}
	} else {
		self.draw = function() {
			if(Player.list[selfId].map !== self.map)
				return;
			var width = self.img.width;
			var height = self.img.height;
			var x = self.x - Player.list[selfId].x + WIDTH/2;
			var y = self.y - Player.list[selfId].y + HEIGHT/2;
			rotatedDrawImage(ctx, self.img, 0, 0, self.angle, self.img.width,self.img.height,
				x-width/2,y-height/2,width,height);
		}
	}


	Bullet.list[self.id] = self;
	return self;
}
Bullet.list = {};

var Portal = function(initPack) {
	Img.portals[initPack.id] = new Image();
	Img.portals[initPack.id].src = initPack.img;

	var self = Entity(
		initPack.id,
		initPack.x,
		initPack.y,
		Img.portals[initPack.id],
		initPack.map
	);

	self.draw = function() {
		if(Player.list[selfId].map !== self.map)
			return;
		var width = self.img.width/2;
		var height = self.img.height/2;
		var x = self.x - Player.list[selfId].x + WIDTH/2;
		var y = self.y - Player.list[selfId].y + HEIGHT/2;
		ctx.drawImage(self.img,0,0,self.img.width,self.img.height,
		x-width/2,y-height/2,width,height);
	}

	Portal.list[self.id] = self;
	return self;
}
Portal.list = {};
