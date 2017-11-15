let context = document.getElementById("canvas").getContext("2d");
let canvas = document.getElementById("canvas");

let main = document.getElementById("main");
let form = document.getElementById("new_user");
let keyword = document.getElementById("keyword");
let image = document.getElementById("image");

let messageForm = document.getElementById("message_form");
let messageText = document.getElementById("message_text");
let allMessages = document.getElementById("all_messages");
let chatroom = document.getElementById("chatroom");

let currentImageId;
let currentColor = "black";
let paint = false;
let xClicks = [];
let yClicks = [];
let dragClicks = [];

let currentGameId;
let currentPlayerUsername;
let currentPlayerId;
let currentDrawerId;

// let playerURL = "https://pictionaryapi.herokuapp.com/api/v1/players";
// let gamesURL = "https://pictionaryapi.herokuapp.com/api/v1/games/";
// let imagesURL = "https://pictionaryapi.herokuapp.com/api/v1/images/";
// let messagesURL = "https://pictionaryapi.herokuapp.com/api/v1/messages/";
let playerURL = "http://localhost:3000/api/v1/players";
let gamesURL = "http://localhost:3000/api/v1/games/";
let imagesURL = "http://localhost:3000/api/v1/images/";
let messagesURL = "http://localhost:3000/api/v1/messages/";

// game setup ----------------------------------------------------------------

const newUser = function(ev) {
	ev.preventDefault();

	let username = document.getElementById("username").value;
	currentGameId = document.getElementById("game").value;
	let playerData = { username: username, game_id: currentGameId };
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
			debugger;
			currentPlayerUsername = json.username;
			currentPlayerId = json.id;
			setupGame();
		});
};

const setupGame = function() {
	main.removeAttribute("hidden");
	chatroom.removeAttribute("hidden");
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
	messageForm.addEventListener("submit", handleMessageSubmit);
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

const handleMessageSubmit = function(ev) {
	ev.preventDefault();
	let text = messageText.value;
	console.log(text);
	submitMessage(text);
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

// const setCurrentColor = function(color) {
// 	currentColor = color;
// };

// fetch requests ----------------------------------------------------------------

const createNewImage = function() {
	let dataURL = canvas.toDataURL();
	console.log("dataURL:", dataURL);
	let drawing = { data_url: dataURL, game_id: currentGameId };
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
	let drawing = { data_url: dataURL, game_id: currentGameId };
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

const getGameInfo = function() {
	fetch(gamesURL + currentGameId)
		.then(res => res.json())
		.then(res => {
			renderImage(res);
			renderMessages(res);
			renderKeyword(res);
		});
};

const submitMessage = function(text) {
	let content = {
		message: {
			content: text,
			game_id: currentGameId,
			player_id: currentPlayerId
		}
	};
	let headers = {
		Accept: "application/json",
		"Content-Type": "application/json"
	};

	fetch(messagesURL, {
		method: "post",
		body: JSON.stringify(content),
		headers: headers
	})
		.then(res => res.json())
		.then(res => console.log(res));
};

// render objects ----------------------------------------------------------------

const renderKeyword = function(res) {
	console.log(res);
	keyword.innerText = res.currentKeyword;
};

const renderImage = function(res) {
	console.log(res);
	canvas.setAttribute("hidden", true);
	image.removeAttribute("hidden");
	image.dataset.game_id = res.id;
	image.setAttribute("id", res.currentImageId);
	image.src = res.currentImageURL;
};

const renderMessages = function(res) {
	let messages = res.recentMessages;
	allMessages.innerHTML = `<ul>${messages
		.map(msg => `<li>${msg.player_username} - ${msg.content}</li>`)
		.join("")}</ul>`;
};

// doc ready ----------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
	form.addEventListener("submit", ev => {
		newUser(ev);
	});
});
