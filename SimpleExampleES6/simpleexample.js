"use strict";

class DotMaker {
    // Some private properties
    #pointList;
    #context;
    constructor(canvas) {

        this.#pointList = [];

        this.#context = canvas.getContext("2d");

        canvas.addEventListener("mouseup", (evt) => this.#mouseUp(evt));
        canvas.addEventListener("mousemove", (evt) => this.#mouseMove(evt));

        this.value = canvas;
    }

    #mouseUp(evt) {
        this.#pointList.push(evt.offsetX);
        this.#pointList.push(evt.offsetY);
        this.draw(this.#context);
    }
   
    #mouseMove(evt) {
        console.log(this.value, "  x = " + evt.offsetX + "  y = " + evt.offsetY);
    }

    draw(ctx) {
        ctx.fillStyle = "white";
        ctx.beginPath();
        for (let i = 0; i < this.#pointList.length; i += 2) {
            ctx.fillRect(this.#pointList[i], this.#pointList[i + 1], 5, 5);
        }
        ctx.fill();
    }
}

let  c = document.getElementById("examplecanvas");
let dotMaker = new DotMaker(c);
