// module aliases
// const Matter = require('matter-js');
const Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Runner = Matter.Runner;
// create an engine
const engine = Engine.create();
const runner = Runner.create();

// create a renderer
const render = Render.create({
    element: document.body,
    engine: engine
});


var canvas = document.getElementById('pong'),
    context = canvas.getContext('2d');
// canvas.style = 'margin : auto';
// canvas.width = 800;
// canvas.height = 600;

// document.body.appendChild(canvas);


const BALL_SIZE = 20;
const PLANK_HEIGHT = 100;
const PLANK_WIDTH = 20;

const GAME_WIDTH = 700;
const GAME_HEIGHT = 450;

const BALL_START_POINT_X = GAME_WIDTH / 2 - BALL_SIZE;
const BALL_START_POINT_Y = GAME_HEIGHT / 2;
const BORDER = 30;

const WINNING_SCORE = 5;

const score = {
    playerOne: 0,
    playerTwo: 0
}

// create two boxes and a ground
const ball = Matter.Bodies.circle(
    BALL_START_POINT_X,
    BALL_START_POINT_Y,
    BALL_SIZE, {
        inertia: 0,
        friction: 0,
        frictionStatic: 0,
        frictionAir: 0,
        restitution: 1.05,
        label: "ball"
    }
);


const paddle1 = Bodies.rectangle(
    BORDER,
    GAME_HEIGHT / 2,
    PLANK_WIDTH,
    PLANK_HEIGHT, { isStatic: true, label: "plankOne" }
);
const paddle2 = Bodies.rectangle(
    GAME_WIDTH - BORDER,
    GAME_HEIGHT / 2,
    PLANK_WIDTH,
    PLANK_HEIGHT, { isStatic: true, label: "plankTwo" }
);


const top = Bodies.rectangle(
    GAME_WIDTH / 2,
    20,
    GAME_WIDTH,
    BORDER, { isStatic: true, label: "topWall" }
);
const bottom = Bodies.rectangle(
    GAME_WIDTH / 2,
    GAME_HEIGHT - 20,
    GAME_WIDTH,
    BORDER, { isStatic: true, label: "bottomWall" }
);

// setInterval(() => {
//     Matter.Runner.tick(runner, engine, 0);

// }, 1000 / 60)

World.add(engine.world, [ball, paddle1, paddle2, bottom, top]);

engine.world.gravity.y = 0;
// Engine.run(engine);
// Engine.update(Engine, 1000 / 60);




(function render() {
    var bodies = Matter.Composite.allBodies(engine.world);

    window.requestAnimationFrame(render);

    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.beginPath();

    for (var i = 0; i < bodies.length; i += 1) {
        var vertices = bodies[i].vertices;

        context.moveTo(vertices[0].x, vertices[0].y);

        for (var j = 1; j < vertices.length; j += 1) {
            context.lineTo(vertices[j].x, vertices[j].y);
        }

        context.lineTo(vertices[0].x, vertices[0].y);
    }

    context.lineWidth = 1;
    context.strokeStyle = '#999';
    context.stroke();
})();

let in_goal = false;

function reset_ball(cb) {
    in_goal = true;
    ball.visibel = false;
    setTimeout(() => {
        Matter.Body.setPosition(paddle1, {
            x: paddle1.position.x,
            y: GAME_HEIGHT / 2,
        });
        Matter.Body.setPosition(paddle2, {
            x: paddle2.position.x,
            y: GAME_HEIGHT / 2,
        });
        Matter.Body.setVelocity(ball, {
            x: 0,
            y: 0
        });
        ball.visibel = true;
        Matter.Body.setPosition(ball, { x: BALL_START_POINT_X, y: BALL_START_POINT_Y });
        setTimeout(() => {
            Matter.Body.setVelocity(ball, {
                x: ((Math.random() > 0.5) ? 1 : -1) * Math.floor((Math.random() * 7) + 6),
                y: ((Math.random() > 0.5) ? 1 : -1) * Math.floor((Math.random() * 7) + 6)
            });
        }, 500);
        in_goal = false;
        cb();
    }, 500);

}

function update() {
    if (ball.position.x > GAME_WIDTH - BORDER && !in_goal) {
        reset_ball(() => {
            score.playerOne++;
            console.log(score);
        });
    } else if (ball.position.x < BORDER && !in_goal) {
        // console.log(score);
        reset_ball(() => {
            score.playerTwo++;
            console.log(score);
        });
    }

    if((ball.position.y > GAME_HEIGHT + 200) || (ball.position.y < -200))
    {
        reset_ball(cb => {console.log("pooof matter.js" + ball.position.y + " WTF "+ GAME_HEIGHT + 200)});
    }
    
    paddleone_ai(paddle1, -1);
    paddleone_ai(paddle2, 1);
}

// distans is -1 or 1
function paddleone_ai(paddle, dis) {

    if (ball.velocity.x > dis * ball.velocity.x) {
        // paddle must rest
        return true;
    }
    // console.log(paddle.label + " WTF man")
    let x_dist = Math.abs(paddle.position.x - ball.position.x);
    let time_dist = x_dist / ball.velocity.x;
    let ball_finial_pos_y = (ball.position.y + (ball.velocity.y * time_dist));
    // console.log(ball_finial_pos_y)
    if (Math.abs((ball_finial_pos_y - (paddle.position.y + paddle.height / 2)))) {
        //do nothing
    } else if (ball_finial_pos_y > paddle.position.y + 50) {
        if (paddle.position.y < GAME_HEIGHT - 100) {
            // console.log(paddle.label + " Go Down")
            Matter.Body.setPosition(paddle, { x: paddle.position.x, y: paddle.position.y + 7 });
        }
    } else if (ball_finial_pos_y < paddle.position.y - 50) {
        if (paddle.position.y > 100) {
            // console.log(paddle.label + " Go Up")
            Matter.Body.setPosition(paddle, { x: paddle.position.x, y: paddle.position.y - 7 });
        }
    } else {
        // do nothing
    }

}

function paddletwo_ai(paddle) {

    if (ball.velocity.x < 0) {
        // paddle must rest
        return true;
    }
    let x_dist = (paddle.position.x - ball.position.x);
    let time_dist = x_dist / ball.velocity.x;
    let ball_finial_pos_y = (ball.position.y + (ball.velocity.y * time_dist));
    // console.log(ball_finial_pos_y)
    if (Math.abs((ball_finial_pos_y - (paddle.position.y + paddle.height / 2)))) {
        //do nothing
    } else if (ball_finial_pos_y > paddle.position.y + 50) {
        if (paddle.position.y < GAME_HEIGHT - 100) {
            console.log(paddle.label + " Go Down")
            Matter.Body.setPosition(paddle, { x: paddle.position.x, y: paddle.position.y + 10 });
        }
    } else if (ball_finial_pos_y / 2 < paddle.position.y - 50) {
        if (paddle.position.y > 100) {
            console.log(paddle.label + " Go Up")
            Matter.Body.setPosition(paddle, { x: paddle.position.x, y: paddle.position.y - 10 });
        }
    } else {
        // do nothing
    }

}


reset_ball();


(function run() {
    window.requestAnimationFrame(run);
    Engine.update(engine, 1000 / 60);

    update();
})();