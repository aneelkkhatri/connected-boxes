
function Box(x, y) {
	this.x = x;
	this.y = y;
	this.connectedBoxes = [];
	this.moveCallback = null;
};
Box.prototype._move = function(horizontal, vertical) {
	if (horizontal) this.x += horizontal;
	if (vertical) this.y += vertical;

	if (this.moveCallback) {
		this.moveCallback();
	}
};
Box.prototype.attachMoveCallback = function (callback) {
	this.moveCallback = callback;
};
Box.prototype.setConnectedBoxes = function(boxes) {
	this.connectedBoxes = boxes;
};
Box.prototype.move = function(horizontal, vertical) {
	this._move(horizontal, vertical);
	var connectedBoxes = this.connectedBoxes;
	for (var i = connectedBoxes.length - 1; i >= 0; i--) {
		connectedBoxes[i]._move(horizontal, vertical);
	};
	showAll();
};
Box.prototype.moveLeft = function() {
	this.move(-1, 0);
};
Box.prototype.moveRight = function() {
	this.move(1, 0);
};
Box.prototype.moveUp = function() {
	this.move(0, -1);
};
Box.prototype.moveDown = function() {
	this.move(0, 1);
};
Box.prototype.setId = function(id) {
	this.id = id;
}
Box.prototype.getId = function() {
	return this.id;
}
var boxes = [
	new Box(5, 3),
	new Box(12, 12),
	new Box(2, 6),
	new Box(4, 5)
];
for (var i = 0; i < boxes.length; ++i) { boxes[i].setId(i+1); }
boxes[0].setConnectedBoxes([boxes[1], boxes[3]]);
boxes[1].setConnectedBoxes([boxes[2], boxes[3]]);
boxes[2].setConnectedBoxes([boxes[3], boxes[1]]);
boxes[3].setConnectedBoxes([boxes[0], boxes[2]]);

var boxesDataMap = {};

function showAll() {
	var objToPrint = [];
	for (var i = 0; i < boxes.length; ++i) {
		objToPrint.push({x: boxes[i].x, y: boxes[i].y});
	}
	// console.log(JSON.stringify(objToPrint));
}

var cursors;
var currentBox = boxes[0];
var SCALE = 40;
var INACTIVE_ALPHA = 0.3;
var INACTIVE_CONNECTED_ALPHA = 0.6;

var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

var WebFontConfig = {
	active: function () {
		game.time.events.add(Phaser.Timer.SECOND*0, createText, this); 
	},
	google: {
      families: ['Roboto']
    }
}
function preload() {
	game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
}

function setBoxAlpha(box, alpha, depth) {
	var boxData = boxesDataMap[box.getId()];
	if (!boxData) return ;

	var box = boxData.box;
	boxData.sprite.alpha = alpha;
	boxData.text.alpha = alpha;

	if (depth) {
		var connectedBoxes = box.connectedBoxes;
		var alpha1 = alpha == INACTIVE_ALPHA ? INACTIVE_ALPHA : INACTIVE_CONNECTED_ALPHA;
		for (var i = connectedBoxes.length - 1; i >= 0; i--) {
			setBoxAlpha(connectedBoxes[i], alpha1, depth - 1);
		}
	}
	
}
function setCurrentBoxById(id) {
	var boxData = boxesDataMap[id];
	if (!boxData) return ;

	setBoxAlpha(currentBox, INACTIVE_ALPHA, 1);

	var box = boxData.box;
	setBoxAlpha(box, 1.0, 1);
	currentBox = box;
}

var createCount = 0;
function create() {
	++createCount;
	if (createCount == 2) createFinal();
}
function createText() {
	++createCount;
	if (createCount == 2) createFinal();
}
function createFinal() {
	var graphics = game.add.graphics(0, 0);
	for (var i = 0; i < boxes.length; ++i) {
		var box = boxes[i];
		var color = 0x777777; //parseInt((255*256*256 + 255*256 + 255) * Math.random());
		graphics.beginFill(color);
		graphics.drawRect(0, 0, SCALE, SCALE);
		graphics.endFill();
		
		var sprite = game.add.sprite(box.x * SCALE, box.y * SCALE, graphics.generateTexture());
		sprite.alpha = INACTIVE_ALPHA;

		graphics.destroy();
		
		var text = game.add.text(box.x * SCALE, box.y * SCALE, i+1, { fill: '#fff' });
		text.font = 'Roboto';
		text.fontSize = 20;
		text.alpha = INACTIVE_ALPHA;

		boxesDataMap[box.getId()] = {
			box: box,
			sprite: sprite,
			text: text
		};
		
		box.attachMoveCallback(function (box, sprite, text) {
			sprite.position.set(box.x * SCALE, box.y * SCALE);
			text.position.set(box.x * SCALE, box.y * SCALE);
		}.bind(this, box, sprite, text));
	}
	
	setCurrentBoxById(1);

	var keyboard = game.input.keyboard;
	var KEYS = Phaser.Keyboard;

	keyboard.onDownCallback = function (key) {
		if (key.keyCode >= 49 && key.keyCode <= 57) {
			setCurrentBoxById(key.keyCode - 48);
		}
		else switch(key.keyCode) {
			case 37: currentBox.moveLeft();
				break;
			case 38: currentBox.moveUp();
				break;
			case 39: currentBox.moveRight();
				break;
			case 40: currentBox.moveDown();
				break;
		}
	}
}
function update() {
	// game.input
}
