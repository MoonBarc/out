/**
 * @typedef {import("./createjs.min.js")}
 */
/**
 * @typedef {import("./matter.min.js")}
 */

/**
 * hello
 */

/**
 * Game settings
 */
var SETTINGS = {
    JUMPFORCE: 0.07,
    STRAFEFORCE: 0.002,
    JUMPDEBOUNCE: 200,
    BOUNCYNESS: 0.03,
    DEBUGENABLED: false,
    JUMPS: 1,
    SIZE: 25
}

const is_key_down = (() => {
    const state = {};

    window.addEventListener('keyup', (e) => state[e.key] = false);
    window.addEventListener('keydown', (e) => state[e.key] = true);
    return (key) => state.hasOwnProperty(key) && state[key] || false;
})();

document.addEventListener("DOMContentLoaded",() => {
    var jump = SETTINGS.JUMPS
    var eng = Matter.Engine.create()
    var Bodies = Matter.Bodies
    Matter.Engine.run(eng)
    var edges = [
        Bodies.rectangle(150,0,300,20),
        Bodies.rectangle(150,399,300,20,{label:"Floor"}),
        Bodies.rectangle(0,200,20,400),
        Bodies.rectangle(300,200,20,400),
    ]
    if(SETTINGS.DEBUGENABLED) {
        // setup debug renderer
        var r = Matter.Render.create({
            element: document.body,
            engine: eng
        })
        Matter.Render.run(r)
    }
    var redges = []
    edges.forEach((e) => {
        Matter.Body.setStatic(e,true)
        var shape = new createjs.Shape()
        shape.x = e.position.x
        shape.y = e.position.y
        shape.scaleX = e.vertices
        redges.push(shape)
    })

    var stage = new createjs.Stage("maincanvas");
    var player = new createjs.Shape();
    player.graphics.beginFill("red").drawCircle(0, 0, SETTINGS.SIZE);
    var physicsplayer = Bodies.circle(0,0,SETTINGS.SIZE)
    physicsplayer.restitution = SETTINGS.BOUNCYNESS
    physicsplayer.label = "Player"
    Matter.World.add(eng.world,[physicsplayer])
    Matter.World.add(eng.world,edges)
    Matter.Body.setPosition(physicsplayer,Matter.Vector.create(10,10))
    stage.addChild(player);
    createjs.Ticker.on("tick", tick);
    createjs.Ticker.framerate = 60
    
    Matter.Events.on(eng,"collisionStart",(col) => {
        if(col.pairs[0].bodyA.label == "Floor" && col.pairs[0].bodyB.label == "Player") {
            jump = SETTINGS.JUMPS
        }
    })
    var debounce = false
    function tick(event) {
        if((is_key_down("w") || is_key_down(" ")) && jump != 0 && !debounce) {
            debounce = true
            console.log("jumped")
            jump -= 1
            setTimeout(() => {
                debounce = false
            },SETTINGS.JUMPDEBOUNCE)
            Matter.Body.applyForce(physicsplayer,physicsplayer.position,Matter.Vector.create(0,-(SETTINGS.JUMPFORCE)))
        }
        if(is_key_down("a")) {
            Matter.Body.applyForce(physicsplayer,physicsplayer.position,Matter.Vector.create(-(SETTINGS.STRAFEFORCE),0))
        }
        if(is_key_down("d")) {
            Matter.Body.applyForce(physicsplayer,physicsplayer.position,Matter.Vector.create(SETTINGS.STRAFEFORCE,0))
        }
        player.x = physicsplayer.position.x
        player.y = physicsplayer.position.y
        player.rotation = physicsplayer.angle * (180/Math.PI)
        Matter.Engine.update(eng, event.delta);
        stage.update(event); // important!!
    }
})