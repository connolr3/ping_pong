const USER_COLOUR = window.localStorage.getItem('user_colour');
const COM_COLOUR = window.localStorage.getItem('com_colour');

const LEVEL = window.localStorage.getItem('level');
const COM_HEIGHT_RATIOS = { easy: 0.17, medium: 0.2, hard: 0.3 }; //COM PADDLE HEIGHT
const USER_HEIGHT_RATIOS = { easy: 0.3, medium: 0.2, hard: 0.1 }; //USER PADDLE HEIGHT




const LIVES = { easy: 5, medium: 4, hard: 3 };
const STARTING_SPEEDS = { easy: 5.5, medium: 6, hard: 9 }; //BALL STARTING SPEED
const MAX_SPEEDS = { easy: 18, medium: 25, hard: 30 }; //MAX SPEED THE BALL CAN GO
const MAX_COM_SPEEDS = { easy: 7, medium: 9, hard: 12 }; //MAX SPEED THE COM PADDLE CAN GO
const COM_START_SPEEDS = { easy: 4.8, medium: 6, hard: 9 };
const ALLOWANCE = { easy: 0.9, medium: 0.5, hard: 0.5 }; //ratio of ball size that player is allowed to miss hitting the ball by. the larger the easier for the player


class Canvas {
    constructor(width, height, colour, id) {
            this.width = width;
            this.height = height;
            this.colour = colour;
            this.ball = [];
            this.comPaddle = [];
            this.userPaddle = [];
            this.id = id;
        }
        //show canvas
    show() {
        $('body').append(`<div id=${this.id}></div>`); // inject the canvas element into the DOM
        $(`#${this.id}`).css('width', `${this.width}px`);
        $(`#${this.id}`).css('height', `${this.height}px`);
        $(`#${this.id}`).css('z-index', `-1000`);
        $(`#${this.id}`).css('background', `${this.colour}`);
        $(`#${this.id}`).css('background-image', `url(images/texture.png)`);
        $(`#${this.id}`).css('position', "relative"); // so this can be given any idea and it still works 
    }

    //show lives - images on screen
    showlives() {
        for (let i = 1; i <= LIVES[LEVEL]; i++) {
            //remove any lives if exists (for case when restarting)
            $("#com" + i).remove();
            $("#user" + i).remove();
            let user_id_name = "user" + i;
            let com_id_name = "com" + i;
            $('#userlives').append(`<img id=${user_id_name} src="images/life.png" alt="onelife">`);
            $('#comlives').append(`<img id=${com_id_name} src="images/life.png" alt="onelife">`);
        }
    }

    /*iniitialse or update the scoreboards */
    update_scoreboards() {
        let u = (window.localStorage.getItem('user_storage_wins'));
        let c = (window.localStorage.getItem('com_storage_wins'));
        let hs = (window.localStorage.getItem('high_score'));
        let cs = (window.localStorage.getItem('current_score'));

        /*Update Past Glories: past wins contained in local storage */
        $('#user_storage_wins').text(u);
        $('#com_storage_wins').text(c);

        /*Update Scores: Score & High Score */
        $('#currentscore').text(cs);
        $('#high_score').text(hs);

    }

    //add the auto/COM paddle to the dom
    showCOMPaddle() {
        //constructor(y, width, height, speed, index)
        let comPaddle = new COMPaddle(0, 60, window.innerHeight * COM_HEIGHT_RATIOS[LEVEL], COM_START_SPEEDS[LEVEL], 2);
        $(`#${this.id}`).append(`<div class="paddle" id="2"></div>`);
        let compaddleid = $(`#2`);
        compaddleid.css('background', comPaddle.colour);
        compaddleid.css('width', `${comPaddle.width}px`);
        compaddleid.css('height', `${comPaddle.height}px`);
        compaddleid.css('top', `${comPaddle.y}px`);
        compaddleid.css('left', `${comPaddle.x}px`);
        this.comPaddle = comPaddle;
    }

    //add the user paddle to the dom
    showUserPaddle() {
        let userPaddle = new UserPaddle(0, 60, window.innerHeight * USER_HEIGHT_RATIOS[LEVEL], 3);
        $(`#${this.id}`).append(`<div class="paddle" id="3"></div>`);
        let userpaddleid = $(`#3`);
        userpaddleid.css('background', userPaddle.colour);
        userpaddleid.css('width', `${userPaddle.width}px`);
        userpaddleid.css('height', `${userPaddle.height}px`);
        userpaddleid.css('top', `${userPaddle.y}px`);
        userpaddleid.css('left', `${userPaddle.x}px`);
        this.userPaddle = userPaddle;
        userPaddle.move(userpaddleid, this.userPaddle); //movement determined by mouse position!
    }

    //generate the ball and add to DOM
    instanstiateBall() {
        const size = 30;
        let ball = new Ball(
            randomHelper(70, window.innerWidth / 2 - size), // x position
            randomHelper(70, window.innerHeight / 2 - size), // y position
            30, // the 'diameter'
            STARTING_SPEEDS[LEVEL], // speed
            "white", // colour
            1 // index
        );
        $(`#${this.id}`).append(`<div class="ball" id="1"></div>`);
        let ballid = $(`#1`);
        ballid.css('background', ball.colour);
        ballid.css('width', `${ball.size}px`);
        ballid.css('height', `${ball.size}px`);
        ballid.css('top', `${ball.y}px`);
        ballid.css('left', `${ball.x}px`);
        this.ball = ball;
    }

    //start a new game  excluding first game - resests scores, speeds
    newgame() {
        this.userPaddle.lifes = LIVES[LEVEL];
        this.comPaddle.lifes = LIVES[LEVEL];
        this.ball.speed = STARTING_SPEEDS[LEVEL];

        //new start time
        const currentDate = new Date();
        const start = currentDate.getTime();
        window.localStorage.setItem('start_time', JSON.stringify(start));

        //RESET HEIGHTS
        this.userPaddle.height = window.innerHeight * USER_HEIGHT_RATIOS[LEVEL];
        $(`#3`).css('height', `${this.userPaddle.height}px`);

        this.comPaddle.height = window.innerHeight * COM_HEIGHT_RATIOS[LEVEL];
        $(`#2`).css('height', `${this.comPaddle.height}px`);

        this.update_scoreboards();
        this.showlives();
    }

    //start moving! this is all the functionality for the ball moving and rebounding, scores etc.
    play() {
        let compaddleid = $(`#2`);
        this.comPaddle.move_auto(compaddleid, this.ball.y + this.ball.size / 2);

        this.update_scoreboards();
        this.calculate_score();
        this.ball.x += this.ball.dx * this.ball.speed; //move x pos
        this.ball.y += this.ball.dy * this.ball.speed; //move y pos

        let ballid = $(`#1`);
        ballid.css('left', `${this.ball.x}px`);
        ballid.css('top', `${this.ball.y}px`);

        /*leftmost edge hit - USER SIDE*/
        if (this.ball.x < this.userPaddle.width) {
            let ball_mp = this.ball.y + this.ball.size / 2;
            let paddle_top = this.userPaddle.cursor_y - (this.userPaddle.height / 2);
            let paddle_bottom = this.userPaddle.cursor_y + (this.userPaddle.height / 2);
            let allowance = this.ball.size * ALLOWANCE[LEVEL];
            if ((ball_mp > paddle_top - allowance) && (ball_mp < paddle_bottom + allowance)) { /*user hits */
                this.ball.dx *= -1; //rebound
                this.ball.y *= 1.01 //small offset prevents looping
                $('audio#thud')[0].play(); //make hit noise
            } else { //user misses 
                $("#user" + (this.userPaddle.lifes - 1)).remove(); //remove a life image from DOM! 
                this.userPaddle.lifes += -1; //decrement score variable
                this.update_scoreboards();
                if (this.userPaddle.lifes == 0) { //If the game is over AKA lives are all out! 
                    $('audio#lose')[0].play();
                    this.calculate_score();
                    this.userPaddle.lose();
                    this.newgame();
                } else {
                    $('audio#death')[0].play();
                    if (this.userPaddle.height < window.innerHeight * 0.33) { //if not too big already increase size to give user some help
                        this.userPaddle.height = this.userPaddle.height * 1.4;
                        $(`#3`).css('height', `${this.userPaddle.height}px`);
                    }
                }
                this.reset_ball(); //if there is a miss we need to send the ball back into the game
            }
        }

        /*rightmost edge hit - COM SIDE*/
        if (this.ball.x + this.ball.size > window.innerWidth - (this.comPaddle.width + 1)) {
            let ball_mp = this.ball.y + this.ball.size / 2;
            let paddle_top = this.comPaddle.y
            let paddle_bottom = this.comPaddle.y + (this.comPaddle.height);

            if (ball_mp > paddle_top && ball_mp < paddle_bottom) { /*COM hits */
                this.ball.dx *= -1; //rebound
                this.ball.y *= 0.95 //small offset prevents looping
                $('audio#pop')[0].play(); //make hit noise
                if (this.comPaddle.speed < MAX_COM_SPEEDS[LEVEL])
                    this.comPaddle.speed *= 1.7; //increase speed as game goes on provided it is <<< max

                if (this.ball.speed < MAX_SPEEDS[LEVEL])
                    this.ball.speed *= 1.2; //increase speed to a certain max threshold when it reaches com
            } else { //COM misses
                if (this.userPaddle.height > window.innerHeight * 0.2) { //if not too small already decrease user paddle size
                    this.userPaddle.height = this.userPaddle.height * 0.8;
                    $(`#3`).css('height', `${this.userPaddle.height}px`);
                }
                $("#com" + (this.comPaddle.lifes - 1)).remove(); //remove a life image from DOM
                this.comPaddle.lifes += -1; //decrements score variable
                this.update_scoreboards();
                if (this.comPaddle.lifes == 0) { //if all lives are over GAME OVER
                    $('audio#win')[0].play();
                    this.calculate_score();
                    this.comPaddle.lose();
                    this.newgame();
                } else
                    $('audio#death')[0].play();
                this.reset_ball(); //if there is a miss we need to send the ball back into the game
            }
        }

        /*hits top or bottom */
        if (this.ball.y + this.ball.size > window.innerHeight - 1 || this.ball.y < 0) {
            this.ball.dy *= -1; //rebound
            $('audio#bang')[0].play(); //make hit noise
        }
        window.requestAnimationFrame(() => this.play());
    }


    //resets ball location to random, and speed to original speed
    reset_ball() {
        $('audio#woosh')[0].play();
        this.ball.x = randomHelper(70, window.innerWidth / 2 - this.ball.size); // x position
        this.ball.y = randomHelper(70, window.innerHeight / 2 - this.ball.size); // y position
        this.ball.dx = 1;
        this.ball.dy = 1;
        this.ball.speed = STARTING_SPEEDS[LEVEL];
    }

    //calculates score based on time spent playing. divided by 1000 and rounded so that score is not obscenely long
    calculate_score() {
        /*Local storage only takes /and returns/ strings so we want to convert this string into a datetime object!!! */
        const currentDate = new Date();
        window.localStorage.setItem('end_time', JSON.stringify(currentDate.getTime()));
        let start = parseInt(window.localStorage.getItem('start_time'));
        let end = parseInt(window.localStorage.getItem('end_time'));
        let currentscore = Math.round((end - start) / 1000);
        //check if score beats high score
        update_high_score(currentscore);
        //set score attribute in storage
        window.localStorage.setItem('current_score', JSON.stringify(currentscore));
    }

}

class COMPaddle {
    constructor(y, width, height, speed, index) {
        this.x = window.innerWidth - width;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.dy = 1; /*paddles only move up and down - y direction */
        this.colour = COM_COLOUR;
        this.index = index;
        this.lifes = LIVES[LEVEL];
    }

    //this method makes com move up and down not caring where ball is - easier to beat
    //not used for this game but available!
    move(paddleid, paddle) {
        this.y += this.dy * this.speed;
        paddleid.css('left', `${this.x}px`);
        paddleid.css('top', `${this.y}px`);
        if (this.y + this.height > window.innerHeight - 1 || this.y < 0)
            this.dy *= -1;
        window.requestAnimationFrame(() => this.move(paddleid, paddle));
    }

    //this method makes COM follow mp of ball - harder to beat
    move_auto(paddleid, ball_mp) {
        let paddle_mp = this.y + this.height / 2;
        if ((ball_mp < paddle_mp) && (this.y > 0)) {
            this.dy = -1;
            this.y += this.dy * this.speed;
        } else if (ball_mp > paddle_mp && (this.y + this.height < window.innerHeight)) {
            this.dy = 1;
            this.y += this.dy * this.speed;
        }
        paddleid.css('left', `${this.x}px`);
        paddleid.css('top', `${this.y}px`);
    }

    /*if com loses give the user a win*/
    lose() {
        $('audio#win')[0].play();
        let user_storage_wins = parseInt(window.localStorage.getItem('user_storage_wins'));
        if (isNaN(user_storage_wins))
            window.localStorage.setItem('user_storage_wins', "1");
        else
            window.localStorage.setItem('user_storage_wins', JSON.stringify(user_storage_wins += 1));
        let current_score = parseInt(window.localStorage.getItem('current_score'));
        let bonus_current_score = current_score * 1.5;
        window.localStorage.setItem('current_score', Math.round(current_score * 1.4)); //if they win give them a bonus to their score
        alert("You Won! -  A bonus has been added to your score!\n New Score: " + Math.round(bonus_current_score) + "! (was: " + current_score + ").");
        window.location.href = "pongtitle.html"; //go back to title screen
    }

}

class UserPaddle {
    constructor(y, width, height, index) {
        this.x = 0;
        this.y = y;
        this.width = width;
        this.height = height;
        this.colour = USER_COLOUR;
        this.index = index;
        this.cursor_y = 0;
        this.lifes = LIVES[LEVEL];
    }


    /*if user loses give the com a win*/
    lose() {
        $('audio#bang')[0].play();
        $('audio#bang')[0].play();
        $('audio#bang')[0].play();
        $('audio#lose')[0].play();
        $('audio#lose')[0].play();
        let com_storage_wins = parseInt(window.localStorage.getItem('com_storage_wins'));
        if (isNaN(com_storage_wins))
            window.localStorage.setItem('com_storage_wins', "1");
        else
            window.localStorage.setItem('com_storage_wins', JSON.stringify(com_storage_wins += 1));
        $('audio#lose')[0].play();
        alert("You Lost :( Yeesh");
        relocate();

    }

    //move based on cursor position
    move(paddleid, paddle) {
        this.y = this.cursor_y - (this.height / 2);
        paddleid.css('left', `${this.x}px`);
        paddleid.css('top', `${this.y}px`);
        document.addEventListener("mousemove", (e) => {
            move(e);
        });
        const move = (e) => {
            //pageX and pageY return the position of the clients cursor from top left of screen
            this.cursor_y = e.pageY
        }
        if (this.cursor_y > window.innerHeight - (1 * this.height)) { //ensure paddle moves within the paddle space limits
            this.y = window.innerHeight - (1 * this.height);
        } else if (this.cursor_y < this.height / 2) {
            this.y = this.height / 2;
        }

        window.requestAnimationFrame(() => this.move(paddleid, paddle));
    }
}


class Ball {
    constructor(x, y, size, speed, colour, index) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.dx = 1.4; //OFFSET FROM 1 PREVENTS LOOPING
        this.dy = 1;
        this.colour = colour;
        this.index = index;
    }
}


/* ------------------
   helper functions
   ------------------ */
function relocate() {
    $('audio#woosh')[0].play();
    window.location.href = "pongtitle.html"; //go back to title screen
}

function randomHelper(min, max) {
    return Math.floor(Math.random() * max) + min;
}

//check if score>>> high score and update if true
function update_high_score(score) {
    let high_score = parseInt(window.localStorage.getItem('high_score'));
    if (isNaN(high_score) || score > high_score) {
        window.localStorage.setItem('high_score', score);
    } else { return; }
}



//check if storage is exisitng and if not give a start value
function iniitialise_storage() {
    const currentDate = new Date();
    const start = currentDate.getTime();

    /*localStorage only wants Strings. You can store an object in
localStorage, but you'll have to convert it to a string first. JSON has a
function for that. */

    start_string = JSON.stringify(start);
    window.localStorage.setItem('start_time', start_string);

    let user_storage_wins = window.localStorage.getItem('user_storage_wins');
    let com_storage_wins = window.localStorage.getItem('com_storage_wins');

    /*If NaN/null/undefined then init as zero! */
    if (isNaN(user_storage_wins) || user_storage_wins == null)
        window.localStorage.setItem('user_storage_wins', "0");
    if (isNaN(com_storage_wins) || com_storage_wins == null)
        window.localStorage.setItem('com_storage_wins', "0");
    if (isNaN(window.localStorage.getItem('high_score')))
        window.localStorage.setItem('high_score', "0");
    if (isNaN(window.localStorage.getItem('user_colour')))
        window.localStorage.setItem('user_colour', "blue");
    if (isNaN(window.localStorage.getItem('com_colour')))
        window.localStorage.setItem('com_colour', "red");
    if (isNaN(window.localStorage.getItem('level')))
        window.localStorage.setItem('level', "medium");

    /*current score will  always be init as zero!*/
    window.localStorage.setItem('current_score', "0");

}

//only used for dev/test purposes when I want to reset things to 0!
function clear_storage() {
    window.localStorage.setItem('user_storage_wins', "0");
    window.localStorage.setItem('com_storage_wins', "0");
    window.localStorage.setItem('high_score', "0");
}


$(document).ready(function() {

    iniitialise_storage(); //check if storage is exisitng and if not give a start value
    //uncomment below to reset high scores and past wins 
    //clear_storage();
    const LEVEL = window.localStorage.getItem('level')

    const canvas = new Canvas(window.innerWidth, window.innerHeight, "black", 'canvas');
    $('audio#woosh')[0].play();
    canvas.show();
    canvas.showlives();
    canvas.instanstiateBall();
    canvas.showCOMPaddle();
    canvas.showUserPaddle();

    canvas.play();

});
