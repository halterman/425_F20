// Global constants controling the animation
const frame_rate = 30;  // frames per second
const milliseconds_between_frames = Math.round((1/frame_rate)*1000);
const increment = 0.05;

let canvas, context;             // The HTML canvas and its drawing context
let x, y;                        // The current box location
let startX, startY;              // The box's location at the start of an animation
let destinationX, destinationY;  // The box's location at the end of an animation
let moving, previous_time;


// Set up the web program
function initialize() {
  canvas = document.getElementById("boxcanvas");
  addEventListener("mouseup", (evt) => mouseUp(evt));
  context = canvas.getContext("2d");
  // Box starts at the center of the canvas
  x = canvas.width/2;
  y = canvas.height/2;
  startX = x;
  startY = y;
  destinationX = x;
  destinationY = y;
  moving = false;     // Not animating initially
  previous_time = 0;
  draw();
}


// React to a mouse release
function mouseUp(evt) {
  console.log("Mouse up");
  destinationX = evt.offsetX;
  destinationY = evt.offsetY;
  startX = x;
  startY = y;
  moving = true;
  t = 0;
  animate();
}


// Draw the box in its current position
function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height); 
  context.strokeStyle = "#ff0000"; 
  context.beginPath();
  context.rect(x - 5, y - 5, 10, 10);
  context.fill();
}


// Performs the animation
function animate() {
  console.log("Executing animate this.moving =", moving, "this.t =", t);
  let now, elapsed_time;
  if (moving && t < 1) {
    now = Date.now();
    elapsed_time = now - previous_time;
    console.log("elapsed_time =", elapsed_time, milliseconds_between_frames);
    if (elapsed_time >= milliseconds_between_frames) {
      // Remember when this scene was rendered.
      previous_time = now;
      // Change the scene
      t = Math.min(t + increment, 1);
      x = startX*(1 - t) + destinationX*t;
      y = startY*(1 - t) + destinationY*t;
      // Update the screen
      draw();
      if (t == 1) {
        moving = false;
      }
    }
    window.requestAnimationFrame(animate);
  }
}


initialize();
