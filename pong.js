//variable declaration.
const canvas = document.getElementById("pong");
//This allows you to change parts of the canvas 
const context = canvas.getContext("2d");
//This is for the opp paddle to move smoothly
let playerVelocityY = 0;
//Variable to make 1 or 2 person game
let isTwoPlayer;



//create user paddle properties
// the 100/2 in the y property is from the height of the paddle
const user = {
    x : 0,
    y : canvas.height / 2 - 100/2,
    width : 10,
    height : 100,
    color : "White",
    score : 0,
    velocityY : playerVelocityY

}

//create opponent paddle properties
const opp = {
    x : canvas.width - 10,
    y : canvas.height / 2 - 100/2,
    width : 10,
    height : 100,
    color : "White",
    score : 0,
    velocityY : playerVelocityY
}

//create the ball properties
const ball = {
    x : canvas.width / 2,
    y : canvas.height / 2,
    radius : 10,
    speed : 5, 
    velocityX : 5,
    velocityY : 5,
    color : "White"
}

//create the net properties 
const net = {
    x : canvas.width/2 - 1,
    y : 0,
    width : 2,
    height : 10,
    color : "White"
}

/*
Objects above and functions needed for render below 
*/

//draw rect function

function drawRectangle(x,y,w,h, color) {
    context.fillStyle = color;
    context.fillRect(x,y,w,h);
}

//draw circle function, the end angle is 3.14 * 2 as pi itself 
// only accounts for 180 degrees

function drawCircle(x,y,r,color) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(x,y,r,0,Math.PI * 2, false);
    context.closePath();
    context.fill();
    
}

//draw text using js translation of html attrubutes
function drawText(text,x,y,color) {
    context.fillStyle = color;
    context.font = "45px Times New Roman";
    context.fillText(text,x,y);
}


//draw the net 
function drawNet() {
    for(let i = 0; i <= canvas.height; i += 15) {
        drawRectangle(net.x, net.y + i, net.width, net.height, net.color)
    }
}


/*
game logic starts below, needed functions are above
*/


// execute once the render once it is called
function render() {
    //set up the canvas/ clearing the canvas
    drawRectangle(0,0,canvas.width,canvas.height, "orange" );

    //draw the net
    drawNet();

    //draw the score
    drawText(user.score, canvas.width / 4, canvas.height / 5, "White");
    drawText(opp.score, 3 * canvas.width / 4, canvas.height / 5, "White");

    //draw the paddles (User and Opp)
    drawRectangle(user.x, user.y, user.width, user.height, user. color);
    drawRectangle(opp.x, opp.y, opp.width, opp.height, opp.color);

    //draw the ball
    drawCircle(ball.x, ball.y, ball.radius, ball.color);

    if(isTwoPlayer) {
        document.addEventListener("keydown", moveOppPaddle);
        document.addEventListener("keyup", moveOppPaddle2);
        document.addEventListener("keydown", movePaddle1);
        document.addEventListener("keyup", movePaddle2);
    } else if (!isTwoPlayer) {
        //allowing for the user control of paddles
        canvas.addEventListener("mousemove", movePaddle);
    }
    
    
}

//collisons between paddle & ball
function collision(ball, player) {
    ball.top = ball.y - ball.radius;
    ball.bottom = ball.y + ball.radius;
    ball.left = ball.x - ball.radius;
    ball.right = ball.x + ball.radius;

    player.top = player.y;
    player.bottom = player.y + player.height;
    player.left = player.x;
    player.right = player.x + player.width

    //if any one of these conditions are true then a collison occured
    // left hand of first && used for right side collision
    // right hand of second && used for left side collision
    // the other conditions are used to make sure if the ball is between
    // extremas of the paddles when collsion occurs.
    return ball.right > player.left && ball.bottom > player.top 
            && ball.left < player.right && ball.top < player.bottom;
}

//reset game after score
function resetBall() {
    ball.speed = 5;
    ball.velocityY = ball.velocityY / Math.abs(ball.velocityY) * 4;
    ball.velocityX = (-ball.velocityX / Math.abs(ball.velocityX)) * 5 
    ball.x = canvas.width/2;
    ball.y = canvas.height/2;
}

// stuff to update game per render
function update(){

    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    //update the score
    if(ball.x - ball.radius < 0) {
        //opp score
        opp.score += 1;
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        //user score
        user.score += 1;
        resetBall();
    }

    // either two player or one player game
    if(isTwoPlayer) {
        //user.y += user.velocityY;
        //opp.y += opp.velocityY;

        let nextUserY = user.y + user.velocityY;
        let nextOppY = opp.y + opp.velocityY;
        if(!outOfBoundsUser(nextUserY)) {
            user.y += user.velocityY;
        }
        if(!outOfBoundsOpp(nextOppY)) {
            opp.y += opp.velocityY;
        } 
    } else if (!isTwoPlayer) {
        let computerLevel = 0.1;
        opp.y += (ball.y - (opp.y + opp.height/2)) * computerLevel;
    }
    

    //boundaries ball collision
    if(ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0){
        ball.velocityY = -ball.velocityY;
    }

    //to determine if collision was by user or opp
    let player = (ball.x < canvas.width / 2) ? user : opp; 


    //if collision is true ... then change the angle of ball trajectory depending on where the ball hits the paddle.
    if(collision(ball, player)) {
        let collidePoint = ball.y - (player.y + player.height/2);

        //normalization from -50 to 50 (based on the paddle height)
        // to -1 to 1
        collidePoint = collidePoint/(player.height/2);

        //calculate angle in Radian(max -45 to 45 degrees)
        let angleRad = collidePoint * Math.PI /4;


        // flip direction of ball when hit
        let direction = (ball.x < canvas.width/2) ? 1 : -1;
        //change vel x and y
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = direction * ball.speed * Math.sin(angleRad);

        // if ball is hit, increase the speed
        ball.speed += 0.5;
    } 
}

//To determine if game is two player or not
//used URLSearchParams object to parse a URL for its query params I believe
// this event occurs once the DOM loads
document.addEventListener('DOMContentLoaded', function () {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const booleanQueryParam = urlParams.get('bool');

    if (booleanQueryParam === 'true') {
        // Handle when the boolean is true
        isTwoPlayer = true;
        console.log('Boolean is true');
    } else if (booleanQueryParam === 'false') {
        // Handle when the boolean is false
        isTwoPlayer = false
        console.log('Boolean is false');
    } else {
        // Handle the case when the parameter is missing or not recognized
        console.log('Boolean parameter not found');
    }
});


// Functions for moving the paddles depending on the game mode (1 or 2 player).
// One person below
function movePaddle(evt) {
    //this is to take account for scrolling
    let rect = canvas.getBoundingClientRect();

    user.y = evt.clientY - rect.top - user.height /2; 
}
// Two person below
function movePaddle1(evt) {
    if(evt.key === 'w' || evt.key === 'W' || evt.code === 'KeyW') {
        user.velocityY = -7;
    } else if (evt.key === 's' || evt.key === 'S' || evt.code === 'KeyS') {
        user.velocityY = 7;
    }
}

function movePaddle2(evt) {
    if(evt.key === 'w' || evt.key === 'W' || evt.code === 'KeyW') {
        user.velocityY = 0;
    } else if (evt.key === 's' || evt.key === 'S' || evt.code === 'KeyS') {
        user.velocityY = 0;
    }
}

function moveOppPaddle(event) {
    if (event.code == "ArrowUp") {
        opp.velocityY = -7;
    } else if(event.code == "ArrowDown") {
        opp.velocityY = 7;
    }
}

function moveOppPaddle2(event) {
    if (event.code == "ArrowUp") {
        opp.velocityY = 0;
    } else if(event.code == "ArrowDown") {
        opp.velocityY = 0;
    }
    
}
//out of bounds 
function outOfBoundsUser(yPos) {
    return(yPos < 0  || yPos + user.height >= canvas.height);
}

function outOfBoundsOpp(yPos) {
    return(yPos < 0  || yPos + opp.height >= canvas.height);
}
//game start
function game() {
    update();
    render();
}



//update the game per frame
const framePerSecond = 50;
let frames;
let isPaused = false;

function startInterval() {
    frames = setInterval(game,1000/framePerSecond);  
}

startInterval();


//pause and start
document.addEventListener('keydown', function(event) {
    // Check if the pressed key is 'P' (case-insensitive)
    if (event.key === 'p' || event.key === 'P' || event.code === 'KeyP') {
        if (isPaused) {
            // Resume the interval
            startInterval();
            isPaused = false;
        } else {
            // Pause the interval
            clearInterval(frames);
            isPaused = true;
        }

    }
});

// Reset game 
document.addEventListener('keydown', function(event) {
    if(event.key === 'r' || event.key === 'R' || event.code === 'KeyR') {
        this.location.reload();
    }
}) 


/*
 Notes for later

 1.) make a reset game button (kinda got it)
 2.) make a start screen to choose between ai or two player (Kinda got it but needs to be improved)
 3.) make a two player paddle control. (kinda got it)
 4.) enforce that paddles can't go over borders (kinda got it)
 5.) make a counter for the ball speed so that the velocity of paddles can increase apporitatly 
 6.) make adjustable width in start up screen and change ball start speed accordantly
 7.) Add CSS for the index.html page
 */