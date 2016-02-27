

var canvas = document.getElementById("game-canvas");
var ctx = canvas.getContext("2d");;
var bgImg, towerImg, towerButtonImg;
var towerButton;
var cursor;
var isBuilding = false;
var towers = [];
var enemies = [];
var cannonBalls = [];
var enemySpawningTime = 50;
var enemyPath = [
	{x:96, y:64},
	{x:384, y:64},
	{x:384, y:192},
	{x:224, y:192},
	{x:224, y:320},
	{x:544, y:320},
	{x:544, y:96}
];
var hp = 100;
var money = 50;
var clock = 0;
var towerPrice = 25;
var enemyUpdatePeriod = 200;
var score = 0;


var Tower = function(){
	this.x = parseInt(cursor.x/32)*32;
	this.y = parseInt(cursor.y/32)*32;
	this.width = 32;
	this.height = 32;
	this.level = 1;
	this.range = 96;
	this.fireRate = 16;
	this.damage = 4;
	this.readyToShootTime = 10;
	this.aimingEnemyId = null;
	this.searchEnemy = function(){
		for(var _i=0; _i<enemies.length; _i++){
			var distance = Math.sqrt( Math.pow(this.x-enemies[_i].x,2) + Math.pow(this.y-enemies[_i].y,2) );
			if (distance<=this.range) {
				this.aimingEnemyId = _i;
				return;
			}
		}
		// 如果都沒找到，會進到這行，清除鎖定的目標
		this.aimingEnemyId = null;
	};
	this.upgrade = function(){
		this.level++;
		this.range = 64+32*this.level;
		this.damage = 2+2*this.level;
		this.fireRate = 16-2*(this.level-1);
	};
	this.shoot = function(){
		var newConnonBall = new ConnonBall(this);
		cannonBalls.push(newConnonBall);
		this.readyToShootTime = this.fireRate;
	}
};

var ConnonBall = function(tower){

	var aimedEnemy = enemies[tower.aimingEnemyId];
	var offsetX = aimedEnemy.x - tower.x;
	var offsetY = aimedEnemy.y - tower.y;
	var distance = Math.sqrt( Math.pow(offsetX,2) + Math.pow(offsetY,2) );

	this.startingPoint = {
		x: tower.x+tower.width/2,
		y: tower.y
	};
	this.x = tower.x+tower.width/2;
	this.y = tower.y;
	this.size = 8;
	this.speed = 5+5*tower.level;
	this.damage = tower.damage;
	this.hitted = false;
	this.direction = {
		x: offsetX/distance,
		y: offsetY/distance
	};
	this.move = function(){
		this.x += this.direction.x*this.speed;
		this.y += this.direction.y*this.speed;
		for(var _i=0; _i<enemies.length; _i++){
			this.hitted =  isCollided(this.x, this.y, enemies[_i].x, enemies[_i].y, enemies[_i].width, enemies[_i].height );
			if (this.hitted) {
				enemies[_i].hp -= this.damage;
				// 如果不加這行會很慘喔！
				break;
			}
		}
	};
};

var Enemy = function(){
	var level = 1+parseInt(clock/enemyUpdatePeriod);

	this.x = 96;
	this.y = 448;
	this.width = 32;
	this.height = 32;
	this.speed = 1+level;
	this.pathDes = 0;
	this.hp = 5+level*5;
	this.direction = {x:0, y:-1},
	this.money = 3*level;
	this.score = 10*level;
	this.move = function(){
		this.x += this.direction.x * this.speed;
		this.y += this.direction.y * this.speed;
		if(	isCollided(enemyPath[this.pathDes].x, enemyPath[this.pathDes].y, this.x, this.y, this.speed, this.speed) ){

			if (this.pathDes === enemyPath.length-1) {
				this.hp=0;
				hp -= 10;
			} else {
				this.x = enemyPath[this.pathDes].x;
				this.y = enemyPath[this.pathDes].y;

				this.pathDes++;

				if( enemyPath[this.pathDes].x > this.x ){
					this.direction.x = 1;
				} else if ( enemyPath[this.pathDes].x < this.x ){
					this.direction.x = -1;
				} else {
					this.direction.x = 0;
				}

				if( enemyPath[this.pathDes].y > this.y ){
					this.direction.y = 1;
				} else if ( enemyPath[this.pathDes].y < this.y ){
					this.direction.y = -1;
				} else {
					this.direction.y = 0;
				}
			}
		}
	};
}

// ================================== //

$(window).load(function(){
	init();
	GAME_TICKER = setInterval(draw, 40);
});

function init(){
	c = document.getElementById("gameCanvas");
	ctx = c.getContext("2d");
	ctx.font = "24px Arial";
	ctx.fillStyle = "white";

	bgImg = document.getElementById("bg-img");
	towerImg = document.getElementById("tower-img");
	towerButtonImg = document.getElementById("tower-btn-img");
	slimeImg = document.getElementById("slime-img");
	crosshairImg = document.getElementById("crosshair-img");
	cannonballImg = document.getElementById("cannonball-img");

	towerButton = {
		x:576, 
		y:416,
		width: 64,
		height: 64
	};

	$("#gameCanvas").mousemove(function(event) {
		cursor = {
			x: event.offsetX, 
			y: event.offsetY
		};
	});

	$("#gameCanvas").click(function(){
		if( isCollided(cursor.x, cursor.y, towerButton.x, towerButton.y, towerButton.width, towerButton.width) ){
			
			if (!isBuilding && money>=towerPrice) {
				isBuilding = true;
			} else {
				isBuilding = false;
			}

		} else if(isBuilding){
			var newTower = new Tower();
			towers.push(newTower);
			isBuilding = false;
			money -= towerPrice;
		} else {
			for(var _i=0; _i<towers.length; _i++){
				var touched = isCollided(cursor.x, cursor.y, towers[_i].x, towers[_i].y, towers[_i].width, towers[_i].height);
				if(touched){
					if(money>=towerPrice){
						towers[_i].upgrade();
						money -= towerPrice;
					}
					break;
				}
			}
		}
	});
}

function isCollided(pointX, pointY, targetX, targetY, targetWidth, targetHeight) {
	if(		pointX >= targetX
		&&	pointX <= targetX + targetWidth
		&&	pointY >= targetY
		&&	pointY <= targetY + targetHeight
	){
		return true;
	} else {
		return false;
	}
}

function gameover(){
	ctx.textAlign = "center";
	ctx.font = "64px Arial";
	ctx.fillText("GAME OVER", c.width/2, c.height/2-96);
	ctx.font = "48px Arial";
	ctx.fillText("you got", c.width/2, c.height/2-32);
	ctx.font = "128px Arial";
	ctx.fillText(score, c.width/2, c.height/2+96);
	clearInterval(GAME_TICKER);
}

function draw () {

	if(clock%enemySpawningTime===0){
		var newEnemy = new Enemy();
		enemies.push(newEnemy);
	}

	ctx.drawImage(bgImg,0,0);
	ctx.drawImage(towerButtonImg, towerButton.x, towerButton.y, towerButton.width, towerButton.height);
	if(isBuilding){
		ctx.drawImage(towerImg, parseInt(cursor.x/32)*32, parseInt(cursor.y/32)*32, 32, 32);
	}

	for(var _i=0; _i<enemies.length; _i++){
		enemies[_i].move();
		if (enemies[_i].hp<=0) {
			money += enemies[_i].money;
			score += enemies[_i].score;
			enemies.splice(_i,1);
		} else {
			ctx.drawImage( slimeImg, enemies[_i].x, enemies[_i].y, enemies[_i].width, enemies[_i].height );
		}
	}

	for(var _i=0; _i<towers.length; _i++){
		towers[_i].searchEnemy();
		ctx.drawImage(towerImg, towers[_i].x, towers[_i].y, 32, 32);
		if ( towers[_i].aimingEnemyId!=null ) {
			var id = towers[_i].aimingEnemyId;
			ctx.drawImage( crosshairImg, enemies[id].x, enemies[id].y, enemies[id].width, enemies[id].height );
			if ( towers[_i].readyToShootTime === 0 ){
				towers[_i].shoot();
			}
		}
		if(towers[_i].readyToShootTime>0){
			towers[_i].readyToShootTime--;
		}
	}

	for(var _i=0; _i<cannonBalls.length; _i++){
		cannonBalls[_i].move();

		if (cannonBalls[_i].hitted) {
			cannonBalls.splice(_i,1);
		} else {
			ctx.drawImage( cannonballImg, cannonBalls[_i].x, cannonBalls[_i].y, cannonBalls[_i].size, cannonBalls[_i].size );
		}
	}

	ctx.fillText("HP:"+hp+"  Money:"+money, 16, 32);
	ctx.fillText("Score:"+score, 16, 64);

	if(hp<=0){
		gameover();
	}

	clock++;

}
