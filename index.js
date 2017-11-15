let context = document.getElementById("canvas").getContext("2d");
let canvas = document.getElementById("canvas");
let image = document.getElementById("image");

let currentImageId;
let currentColor = "black";
let paint = false;
let xClicks = [];
let yClicks = [];
let dragClicks = [];
let gamesURL = "https://pictionaryapi.herokuapp.com/api/v1/games/";
let imagesURL = "https://pictionaryapi.herokuapp.com/api/v1/images/";

// game setup ----------------------------------------------------------------

const setupGame = function() {
	drawCanvas();
};

const drawCanvas = function() {
	// context.fillStyle = "rgb(200,0,0)";
	context.strokeRect(0, 0, 490, 220, 490, 0);
	// console.log(context)
};

// event listeners ----------------------------------------------------------------

const addListeners = function() {
	canvas.addEventListener("mousedown", handleMouseDown);
	canvas.addEventListener("mousemove", handleMouseMove);
	canvas.addEventListener("mouseup", handleMouseUp);
	canvas.addEventListener("mouseleave", handleMouseLeave);
};

// event handlers ----------------------------------------------------------------

const handleMouseDown = function(ev) {
	// console.log(ev);
	// console.log("PageX:", ev.pageX, "PageY:", ev.pageY);
	// console.log("ClientX:", ev.clientX, "ClientY:", ev.clientY);
	// console.log("OffsetX:", ev.offsetX, "OffsetY:", ev.offsetY);
	// console.log("X:", ev.x, "Y:", ev.y);
	var mouseX = ev.offsetX;
	var mouseY = ev.offsetY;
	paint = true;
	addClicks(mouseX, mouseY, false);
	redraw();
};

const handleMouseMove = function(ev) {
	if (paint) {
		addClicks(ev.offsetX, ev.offsetY, true);
		redraw();
	}
};

const handleMouseUp = function(ev) {
	paint = false;
	xClicks = [];
	yClicks = [];
	dragClicks = [];
};

const handleMouseLeave = function(ev) {
	paint = false;
};

// draw functions ----------------------------------------------------------------

const addClicks = function(x, y, drag) {
	xClicks.push(x);
	yClicks.push(y);
	dragClicks.push(drag);
};

const redraw = function() {
	// context.clearRect(0, 0, canvas.width, canvas.height);
	context.strokeStyle = currentColor;
	context.lineJoin = "round";
	context.lineWidth = 5;
	for (let i = 0; i < xClicks.length; i++) {
		context.beginPath();
		if (dragClicks[i] && i) {
			context.moveTo(xClicks[i - 1], yClicks[i - 1]);
		} else {
			context.moveTo(xClicks[i] - 1, yClicks[i]);
		}
		context.lineTo(xClicks[i], yClicks[i]);
		context.closePath();
		context.stroke();
	}
};

const setCurrentColor = function(color) {
	currentColor = color;
};

// fetch requests ----------------------------------------------------------------

const createNewImage = function() {
	let dataURL = canvas.toDataURL();
	console.log("dataURL:", dataURL);
	let gameId = 1;
	let drawing = { data_url: dataURL, game_id: gameId };
	let headers = {
		Accept: "application/json",
		"Content-Type": "application/json"
	};
	fetch(imagesURL, {
		method: "post",
		body: JSON.stringify(drawing),
		headers: headers
	})
		.then(res => res.json())
		.then(res => {
			console.log(res);
			currentImageId = res.id;
		});
};

const submitImage = function() {
	let dataURL = canvas.toDataURL();
	let gameId = 1;
	let drawing = { data_url: dataURL, game_id: gameId };
	let headers = {
		Accept: "application/json",
		"Content-Type": "application/json"
	};
	fetch(imagesURL + currentImageId, {
		method: "put",
		body: JSON.stringify(drawing),
		headers: headers
	})
		.then(res => res.json())
		.then(res => console.log(res));
};

const getImage = function() {
	let gameId = 1;
	fetch(gamesURL + gameId)
		.then(res => res.json())
		.then(res => renderImage(res));
};

// render objects ----------------------------------------------------------------

const renderImage = function(res) {
	console.log(res);
	canvas.setAttribute("hidden", true);
	image.removeAttribute("hidden");
	image.dataset.game_id = res.id;
	image.setAttribute("id", res.currentImageId);
	image.src = res.currentImageURL;
};

// doc ready ----------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
	setupGame();
	addListeners();
	// setInterval(getImage, 5);
	// submitImage(getImage, 5);
});
