let context = document.getElementById("canvas").getContext("2d");
let canvas = document.getElementById("canvas");
let canvasTools = document.getElementById("canvasTools");
let slider = document.getElementById("myRange");
let sliderValue = document.getElementById("demo");

let main = document.getElementById("main");
let form = document.getElementById("new_user");
let keyword = document.getElementById("keyword");
let image = document.getElementById("image");
let signin = document.getElementById("signin");
let gameContent = document.getElementById("gameContent");

let messageForm = document.getElementById("message_form");
let messageText = document.getElementById("message_text");
let allMessages = document.getElementById("allMessages");
let sidebar = document.getElementById("sidebar");
let scoreboard = document.getElementById("scoreboard");

let currentImageId;
let currentColor = `#${document.getElementById("color").value}`;
let currentPenSize = slider.value;
let paint = false;
let xClicks = [];
let yClicks = [];
let dragClicks = [];

let xHistory = [];
let yHistory = [];
let dragHistory = [];
let penColorHistory = [];
let penSizeHistory = [];

let currentGameId;
let currentPlayerUsername;
let currentPlayerId;
let currentDrawerId;
let currentDrawerUsername;

let playerURL = "https://pictionaryapi.herokuapp.com/api/v1/players";
let gamesURL = "https://pictionaryapi.herokuapp.com/api/v1/games/";
let imagesURL = "https://pictionaryapi.herokuapp.com/api/v1/images/";
let messagesURL = "https://pictionaryapi.herokuapp.com/api/v1/messages/";
// let playerURL = "http://localhost:3000/api/v1/players";
// let gamesURL = "http://localhost:3000/api/v1/games/";
// let imagesURL = "http://localhost:3000/api/v1/images/";
// let messagesURL = "http://localhost:3000/api/v1/messages/";

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
			currentPlayerUsername = json.username;
			currentPlayerId = json.id;
			setupGame();
		});
};

const setupGame = function() {
	signin.remove();
	gameContent.removeAttribute("style");

	addListeners();
};

const clearCanvas = function() {
	context.clearRect(0, 0, 490, 600);
	submitImage();
	xHistory = [];
	yHistory = [];
	dragHistory = [];
	penColorHistory = [];
	penSizeHistory = [];
};

// event listeners ----------------------------------------------------------------

const addListeners = function() {
	canvas.addEventListener("mousedown", handleMouseDown);
	canvas.addEventListener("mousemove", handleMouseMove);
	canvas.addEventListener("mouseup", handleMouseUp);
	canvas.addEventListener("mouseleave", handleMouseLeave);

	canvas.addEventListener("touchstart", handleMouseDown);
	canvas.addEventListener("touchmove", handleMouseMove);
	canvas.addEventListener("touchend", handleMouseUp);
	canvas.addEventListener("touchleave", handleMouseLeave);
	messageForm.addEventListener("submit", handleMessageSubmit);
};

// event handlers ----------------------------------------------------------------
slider.oninput = function() {
	sliderValue.value = this.value;
	currentPenSize = this.value;
};

const handleMouseDown = function(ev) {
	// console.log(ev);
	// console.log("PageX:", ev.pageX, "PageY:", ev.pageY);
	// console.log("ClientX:", ev.clientX, "ClientY:", ev.clientY);
	// console.log("OffsetX:", ev.offsetX, "OffsetY:", ev.offsetY);
	// console.log("X:", ev.x, "Y:", ev.y);
	var mouseX = ev.offsetX;
	var mouseY = ev.offsetY;
	paint = true;
	getCurrentColor();
	addClicks(mouseX, mouseY, false, currentColor, currentPenSize);
	redraw();
};

const handleMouseMove = function(ev) {
	if (paint) {
		getCurrentColor();
		addClicks(ev.offsetX, ev.offsetY, true, currentColor, currentPenSize);
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
	messageForm.reset();
	submitMessage(text);
};

// draw functions ----------------------------------------------------------------

const addClicks = function(x, y, drag, penColor, penSize) {
	xClicks.push(x);
	yClicks.push(y);
	dragClicks.push(drag);

	xHistory.push(x);
	yHistory.push(y);
	dragHistory.push(drag);
	penColorHistory.push(penColor);
	penSizeHistory.push(penSize);
};

const redraw = function() {
	// context.clearRect(0, 0, canvas.width, canvas.height);

	context.strokeStyle = currentColor;
	context.lineJoin = "round";
	context.lineWidth = currentPenSize;
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
	submitImage();
};

const undoDraw = function() {
	context.clearRect(0, 0, 490, 600);
	paint = true;
	let cut = dragHistory.lastIndexOf(false);

	context.lineJoin = "round";

	for (let i = 0; i < cut; i++) {
		context.beginPath();
		if (dragHistory[i] && i) {
			context.strokeStyle = penColorHistory[i];
			context.lineWidth = penSizeHistory[i];
			context.moveTo(xHistory[i - 1], yHistory[i - 1]);
		} else {
			context.strokeStyle = penColorHistory[i];
			context.lineWidth = penSizeHistory[i];
			context.moveTo(xHistory[i] - 1, yHistory[i]);
		}
		context.lineTo(xHistory[i], yHistory[i]);
		context.closePath();
		context.stroke();
	}
	submitImage();
	paint = false;

	xHistory = xHistory.slice(0, cut);
	yHistory = yHistory.slice(0, cut);
	dragHistory = dragHistory.slice(0, cut);
	penColorHistory = penColorHistory.slice(0, cut);
	penSizeHistory = penSizeHistory.slice(0, cut);
};

const getCurrentColor = function() {
	currentColor = `#${document.getElementById("color").value}`;
};

// const setCurrentColor = function(color) {
// 	currentColor = color;
// };

// fetch requests ----------------------------------------------------------------

const createNewImage = function() {
	let dataURL = canvas.toDataURL();
	// console.log("dataURL:", dataURL);
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
			// console.log(res);
			currentImageId = res.id;
			clearCanvas();
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
		.then(res => {});
};

const getGameInfo = function() {
	fetch(gamesURL + currentGameId)
		.then(res => res.json())
		.then(res => {
			// console.log(res);
			renderScore(res);
			renderGameInfo(res);
		});
};

const submitMessage = function(text) {
	if (text == currentKeyword) {
		alert("Correct!");
		msgContent = `${currentPlayerUsername} guessed correctly! The keyword was "${currentKeyword}"`;
	} else {
		msgContent = text;
	}
	let content = {
		message: {
			content: msgContent,
			game_id: currentGameId,
			player_id: currentPlayerId
		}
	};
	let headers = {
		Accept: "application/json",
		"Content-Type": "application/json"
	};

	if (text == currentKeyword) {
		console.log("submitting a correct guess");
		fetch(messagesURL, {
			method: "post",
			body: JSON.stringify(content),
			headers: headers
		})
			.then(res => res.json())
			.then(res => {
				updateDrawer();
			});
	} else {
		console.log("submitting an incorrect guess");
		fetch(messagesURL, {
			method: "post",
			body: JSON.stringify(content),
			headers: headers
		});
	}
};

const updateDrawer = function() {
	let body = { player_id: currentPlayerId };
	let headers = {
		Accept: "application/json",
		"Content-Type": "application/json"
	};

	fetch(gamesURL + currentGameId, {
		method: "put",
		body: JSON.stringify(body),
		headers: headers
	})
		.then(res => res.json())
		.then(res => {
			canvas.removeAttribute("hidden");
			canvasTools.removeAttribute("hidden");
			image.setAttribute("hidden", true);
			createNewImage();
		});
};

// render objects ----------------------------------------------------------------

const renderGameInfo = function(res) {
	// console.log(res);
	currentDrawerId = res.currentDrawerId;
	currentDrawerUsername = res.currentDrawerUsername;
	currentImageId = res.currentImageId;
	currentKeyword = res.currentKeyword;
	renderMessages(res);
	renderGamePrompt(res);
};

const renderGamePrompt = function(res) {
	// console.log(res);
	if (currentDrawerId !== currentPlayerId) {
		keyword.innerText = `${currentDrawerUsername} is currently drawing.`;
		renderImage(res);
	} else {
		keyword.innerText = `You are the drawer! Keyword is: ${res.currentKeyword}`;
	}
};

const renderImage = function(res) {
	canvas.setAttribute("hidden", true);
	canvasTools.setAttribute("hidden", true);
	image.removeAttribute("hidden");
	image.dataset.game_id = res.id;
	image.setAttribute("id", res.currentImageId);
	image.src = res.currentImageURL;
};

const renderMessages = function(res) {
	let messages = res.recentMessages.sort((a, b) => b.msg_id - a.msg_id);
	allMessages.innerHTML = `${messages
		.map(msg => {
			if (msg.content.includes("guessed correctly!")) {
				return `<div class="event"><div class="label"><img class="ui avatar image" src="https://image.flaticon.com/icons/png/512/194/194789.png">
</div><div class="content correct"><strong>${msg.content}</strong></div></div>`;
			} else {
				return `<div class="event"><div class="label"><img class="ui avatar image" src="https://image.flaticon.com/icons/svg/201/201577.svg"></div><div class="content">${msg.player_username} guessed "${msg.content}"</div></div>`;
			}
		})
		.join("")}`;
};

const renderScore = function(res) {
	let scores = res.playerScores
		.filter(player => Object.values(player)[0] > 0)
		.sort((a, b) => {
			return parseInt(Object.values(b)[0]) - parseInt(Object.values(a)[0]);
		})
		.slice(0, 3);

	let medalIcons = [
		"https://image.flaticon.com/icons/svg/179/179249.svg",
		"https://image.flaticon.com/icons/svg/179/179251.svg",
		"https://image.flaticon.com/icons/svg/179/179250.svg"
	];

	scoreboard.innerHTML = ``;
	for (let i = 0; i < scores.length; i++) {
		scoreboard.innerHTML += `<div class="event"><div class="label"><img class="ui avatar image" src='${medalIcons[
			i
		]}'></div><div class="content">${Object.keys(
			scores[i]
		)[0]} - ${Object.values(scores[i])[0]}</div></div>`;
	}
};

// doc ready ----------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
	form.addEventListener("submit", ev => {
		newUser(ev);
		handleSlider();
		setInterval(getGameInfo, 2000);
	});
});

const handleSlider = function() {
	// console.log(slider);
	slider = document.getElementById("myRange");
	sliderValue.value = slider.value; // Display the default slider value
};
