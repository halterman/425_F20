"use strict";

let canvas = document.getElementById("examplecanvas");
// canvas.addEventListener("mouseup", (evt) => mouseUp(evt));
// canvas.addEventListener("mousemove", (evt) => mouseMove(evt));
canvas.addEventListener("mouseup", mouseUp);
canvas.addEventListener("mousemove", mouseMove);

let pointList = [];

let context = canvas.getContext("2d");


function mouseUp(evt) {
    pointList.push(evt.offsetX);
    pointList.push(evt.offsetY);
    draw(context);
}
   
function mouseMove(evt) {
    console.log("x = " + evt.offsetX + "  y = " + evt.offsetY);

}

function draw(ctx) {
    ctx.fillStyle = "white";
    ctx.beginPath();
    for (let i = 0; i < pointList.length; i += 2) {
        ctx.fillRect(pointList[i], pointList[i + 1], 5, 5);
    }
    ctx.fill();
}




