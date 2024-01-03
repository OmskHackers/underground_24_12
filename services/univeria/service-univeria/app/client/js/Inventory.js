Inventory = function(items,socket,server){
    var self = {
        items:items, //{id:"itemId",amount:1}
		socket:socket ? socket : '',
        server:server,
    }
    self.addItem = function(id,amount,name,price,description,from){
		for(var i = 0 ; i < self.items.length; i++){
			if(self.items[i].id === id){
				self.items[i].amount += amount;
				self.refreshRender();
				return;
			}
		}
		self.items.push({id:id,name:name,amount:amount,price:price,from:from,description:description});
		self.refreshRender();
    }
    self.removeItem = function(id=null,name,amount){
		for(var i = 0 ; i < self.items.length; i++){
			if(self.items[i].name === name){
                if (id && self.items[i].id !== id) {
                    continue;
                }
				self.items[i].amount -= amount;
				if(self.items[i].amount <= 0) {
                    self.items.splice(i,1);
                }
				self.refreshRender();
				return;
			}
		}
    }
    self.hasItem = function(name,amount){
		for(var i = 0 ; i < self.items.length; i++){
			if(self.items[i].name === name && self.items[i].amount >= amount){
				return true;
			}
		}
		return false;
    }
	self.refreshRender = function(){
		//server
		if(self.server){
            if (self.socket)
			    self.socket.emit('updateInventory',self.items);
			return;
		}
        //client only
        var inventory = document.getElementById("inventory");
        inventory.innerHTML = "";
        var items = [];
        var buttons = [];

        var addButton = function(data) {
            let item = Item.list[data.name];
            let button = document.createElement('button');
            button.onclick = function() {
                self.socket.emit("useItem",item.name, item.id);
            }
            if (item.name === 'potion') {
                button.innerHTML = '<span class="glyphicon glyphicon-heart"></span>' + ' x' + items[item.name];
                button.className = 'btn btn-danger';
            } else if (item.name === 'flag') {
                button.innerHTML = '<span class="glyphicon glyphicon-flag"></span>' + ' x' + items[item.name];
                button.className = 'btn btn-success';
            } else {
                button.innerText = item.name + ' x' + data.amount;
                button.className = 'btn btn-default';
            }

            if (!buttons[item.name]) {
                buttons[item.name] = true;
                inventory.appendChild(button);
            } else {
                button.remove();
            }
        }
		for(var i = 0 ; i < self.items.length; i++)
            if (!items[self.items[i].name])
                items[self.items[i].name] = self.items[i].amount;
            else
                items[self.items[i].name] += self.items[i].amount;

        for(var i = 0 ; i < self.items.length; i++)
            addButton(self.items[i]);
	}

    if(self.server && self.socket){
        self.socket.on("useItem",function(itemName, itemId) {
            if (!self.hasItem(itemName,1)){
                console.log('cheater');

                return;
            }
            let item = Item.list[itemName];
            item.event(Player.list[self.socket.id], self.socket, itemId);
        });
    }

	return self;
}

Item = function(name,event){
	var self = {
		name:name,
		event:event,
	}
	Item.list[self.name] = self;
	return self;
}
Item.list = {};

Item("potion",function(player, socket, itemId){
	player.hp += 10;
	player.inventory.removeItem(null,"potion",1);
});

Item("flag",function(player, socket, itemId){
    for(var i = 0 ; i < player.inventory.items.length; i++){
        if(player.inventory.items[i].name === 'flag'){
            if (socket) {
                socket.emit('addToChat', 'Your flag: ' + player.inventory.items[i].description);
            }
        }
    }
});

Item("money",function(player, socket, itemId) {

});
