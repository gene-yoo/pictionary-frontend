let context = document.getElementById("canvas").getContext("2d");
let canvas = document.getElementById("canvas");
let form = document.getElementById("new_user");
let currentColor = "black";
let paint = false;
let xClicks = [];
let yClicks = [];
let dragClicks = [];

let currentUser;

let playerURL = "https://pictionaryapi.herokuapp.com/api/v1/players";
let getURL = "https://pictionaryapi.herokuapp.com/api/v1/games/";
// let postURL = "https://pictionaryapi.herokuapp.com/api/v1/games/";
let imagesURL = "https://pictionaryapi.herokuapp.com/api/v1/images";
let putURL = "https://pictionaryapi.herokuapp.com/api/v1/images/";

// game setup ----------------------------------------------------------------

const setupGame = function() {
	canvas.removeAttribute("hidden");
	let buttons = document.querySelectorAll("button");
	buttons.forEach(button => button.removeAttribute("hidden"));
	form.setAttribute("hidden", true);
	drawCanvas();
	addListeners();
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
let imageId;
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
			imageId = res.id;
		});
	setInterval(submitImage, 300);
};

const submitImage = function() {
	let dataURL = canvas.toDataURL();

	let gameId = 1;
	let drawing = { data_url: dataURL, game_id: gameId };
	let headers = {
		Accept: "application/json",
		"Content-Type": "application/json"
	};

	fetch(putURL + imageId, {
		method: "put",
		body: JSON.stringify(drawing),
		headers: headers
	})
		.then(res => res.json())
		.then(res => console.log(res));
};

const getImage = function() {
	let gameId = 1;

	fetch(getURL + gameId)
		.then(res => res.json())
		.then(res => renderImage(res));
};

// render objects ----------------------------------------------------------------

const renderImage = function(res) {
	let newImg = document.createElement("img");
	newImg.dataset.game_id = res.id;
	newImg.setAttribute("id", res.id);
	newImg.src = res.currentImageURL;
	document.body.appendChild(newImg);
};

// doc ready

document.addEventListener("DOMContentLoaded", () => {
	form.addEventListener("submit", ev => {
		newUser(ev);
	});
	// setupGame();
});

const newUser = function(ev) {
	ev.preventDefault();

	let username = document.getElementById("username").value;
	let playerData = { username: username };
	let headers = {
		Accept: "application/json",
		"Content-Type": "application/json"
	};
	fetch(playerURL, {
		method: "post",
		body: JSON.stringify(playerData),
		headers: headers
	})
		.then(res => res.json())
		.then(json => {
			currentUser = json.username;
			setupGame();
		});
};
