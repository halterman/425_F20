"use strict";

let canvas = document.getElementById("examplecanvas");
canvas.addEventListener("mouseup", (evt) => mouseUp(evt));
canvas.addEventListener("mousemove", (evt) => mouseMove(evt));

let pointList = [];

let context = canvas.getContext("2d");

// Convert the cursor position in the event parameter into a usable (x, y) form.
function mousePosition(canv, evt) {
    const rect = canv.getBoundingClientRect();
    return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
}

function mouseUp(evt) {
    //let mpos = mousePosition(canvas, evt);
    pointList.push(evt.offsetX);
    pointList.push(evt.offsetY);
    draw(context);
}
   
function mouseMove(evt) {
    let mpos = mousePosition(canvas, evt);
    console.log("x = " + mpos.x + "  y = " + mpos.y);

}

function draw(ctx) {
    ctx.fillStyle = "white";
    ctx.beginPath();
    for (let i = 0; i < pointList.length; i += 2) {
        ctx.fillRect(pointList[i], pointList[i + 1], 5, 5);
    }
    ctx.fill();
}




