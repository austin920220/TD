var canvas = document.getElementById("game-canvas");
var ctx = canvas.getContext("2d");
var clock = 0;
var FPS = 60;
var cursor = {};
var isBuilding = false;
var hp = 100;
var tower = {
	range : 96,
	aimingEnemyId : null,
	searchEnemy: function(){
		for(var i=0; i<enemies.length; i++){
	            var distance = Math.sqrt( 
	                Math.pow(this.x-enemies[i].x,2) + Math.pow(this.y-enemies[i].y,2) 
	            );
	            if (distance<=this.range) {
	                this.aimingEnemyId = i;
	                return;
	            }
	        }
	        // 如果都沒找到，會進到這行，清除鎖定的目標
	        this.aimingEnemyId = null;
	}
};


var enemies = [];
function Enemy() { 
    this.x = 96; 
    this.y = 480-32;
    this.hp = 10;
    this.direction = {x:0,y:-1};
    this.speed = 64;
    this.pathDes = 0;
    this.move = function(){
        if( isCollided(enemyPath[this.pathDes].x, enemyPath[this.pathDes].y, this.x, this.y, this.speed/FPS, this.speed/FPS) ){
            
		if(this.pathDes === enemyPath.length-1) {
			this.hp=0;	
			hp -= 10;	
	        }else{
	            this.x = enemyPath[this.pathDes].x;
	            this.y = enemyPath[this.pathDes].y;
	            this.pathDes++;
	            var unitVector = getUnitVector( this.x, this.y, enemyPath[this.pathDes].x, enemyPath[this.pathDes].y );
	            this.direction.x = unitVector.x;
	            this.direction.y = unitVector.y;
	        }
	} else {
		// this.x += this.direction.x * this.speed/FPS;
		this.x = this.x + this.direction.x * this.speed/FPS;
		// this.y += this.direction.y * this.speed/FPS;
		this.y = this.y + this.direction.y * this.speed/FPS;
	}
    };
}


var enemyPath = [
	{x:96, y:64},
	{x:384, y:64},
	{x:384, y:192},
	{x:224, y:192},
	{x:224, y:320},
	{x:544, y:320},
	{x:544, y:96}
];
var crosshairImg = document.createElement("img");
crosshairImg.src = "images/crosshair.png";

// ====== 引入圖檔 ====== //
var bgImg = document.createElement("img");
bgImg.src = "images/map.png";
var buttonImg = document.createElement("img");
buttonImg.src = "images/tower-btn.png";
var towerImg = document.createElement("img");
towerImg.src = "images/tower.png";
var slimeImg = document.createElement("img");  
slimeImg.src = "images/slime.gif";              	 

// ==================== //

$("#game-canvas").mousemove(function(event) {
	cursor = {
		x: event.offsetX,
		y: event.offsetY
	};
});

$("#game-canvas").click(function(){
	if( isCollided(cursor.x, cursor.y, 640-64, 480-64, 64, 64) ){
		if (isBuilding) {
			isBuilding = false;
		} else {
			isBuilding = true;
		}
	} else if (isBuilding) {
		tower.x = cursor.x - cursor.x%32;
		tower.y = cursor.y - cursor.y%32;
	}
});

function draw(){
	ctx.drawImage(bgImg,0,0);
	if(clock % 80 == 0){
		var newEnemy = new Enemy();
		enemies.push(newEnemy);
	}
	ctx.drawImage(buttonImg, 640-64, 480-64, 64, 64);
	ctx.drawImage(towerImg, tower.x, tower.y);
	if(isBuilding){
		ctx.drawImage(towerImg, cursor.x, cursor.y);
	}
	for(var i=0; i<enemies.length; i++){
		if (enemies[i].hp<=0) {
			enemies.splice(i,1);
		} 
		else {
			enemies[i].move();
			ctx.drawImage( slimeImg, enemies[i].x, enemies[i].y);
		}	
		enemies[i].move();
		ctx.drawImage( slimeImg, enemies[i].x, enemies[i].y);
	}
	if ( tower.aimingEnemyId!=null ) {
	    var id = tower.aimingEnemyId;
	    ctx.drawImage( crosshairImg, enemies[id].x, enemies[id].y );
	}
	clock++;
	
	ctx.font = "24px Arial";
	ctx.fillText( "hp:"+hp, 40, 20 );
	ctx.fillStyle = "white";
}

setInterval(draw, 1000/FPS);



// ====== 其他函式 ====== //

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
function getUnitVector (srcX, srcY, targetX, targetY) {
    var offsetX = targetX - srcX;
    var offsetY = targetY - srcY;
    var distance = Math.sqrt( Math.pow(offsetX,2) + Math.pow(offsetY,2) );
    var unitVector = {
        x: offsetX/distance,
        y: offsetY/distance
    };
    return unitVector;
}
