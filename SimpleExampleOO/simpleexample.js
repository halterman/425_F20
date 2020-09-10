"use strict";

window.DotMaker = function (canvas) {
    let self = this;
    // canvas.addEventListener("mouseup", (evt) => mouseUp(evt));
    // canvas.addEventListener("mousemove", (evt) => mouseMove(evt));

    let pointList = [];

    let context = canvas.getContext("2d");

    // Try changing the self to this, and then
    // change the self reference in the mouseMove method
    // to this, and see happens 
    self.value = canvas;


    self.mouseUp = function (evt) {
        pointList.push(evt.offsetX);
        pointList.push(evt.offsetY);
        self.draw(context);
    }
   
    self.mouseMove = function(evt) {
        console.log(self.value, "  x = " + evt.offsetX + "  y = " + evt.offsetY);
    }

    self.draw = function (ctx) {
        ctx.fillStyle = "white";
        ctx.beginPath();
        for (let i = 0; i < pointList.length; i += 2) {
            ctx.fillRect(pointList[i], pointList[i + 1], 5, 5);
        }
        ctx.fill();
    }

    canvas.addEventListener("mouseup", self.mouseUp);
    canvas.addEventListener("mousemove", self.mouseMove);
}

let  c = document.getElementById("examplecanvas");
let dotMaker = new DotMaker(c);
