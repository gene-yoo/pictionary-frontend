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
	main.removeAttribute("hidden");
	sidebar.removeAttribute("hidden");
	signin.remove();

	addListeners();
};

const clearCanvas = function() {
	context.clearRect(0, 0, 490, 600);
	submitImage();
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
	messageForm.reset();
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
	getCurrentColor();
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
		.then(res => console.log(res));
};

const getGameInfo = function() {
	fetch(gamesURL + currentGameId)
		.then(res => res.json())
		.then(res => {
			console.log(res);
			renderScore(res);
			renderGameInfo(res);
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
		.then(res => {
			console.log(res);
			checkMessage(res);
		});
};

const checkMessage = function(res) {
	// console.log(res);
	if (res.guessed_correctly) {
		alert("It's true!!!!!");
		submitMessage("Guessed Correctly");
		updateDrawer();
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
		keyword.innerText = `Current Drawer is ${currentDrawerUsername}.`;
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
	let messages = res.recentMessages;
	allMessages.innerHTML = `${messages
		.map(msg => {
			if (msg.content === "Guessed Correctly") {
				return `<div class="event"><div class="label"><i class="extra large trophy icon"></i>
</div><div class="content correct"><strong>${msg.player_username} guessed correctly!</strong></div></div>`;
			} else {
				return `<div class="event"><div class="label"><i class="extra large child icon">
</i></div><div class="content">${msg.player_username} guessed "${msg.content}"</div></div>`;
			}
		})
		.join("")}`;
};

const renderScore = function(res) {
	let scores = res.playerScores
		.filter(player => Object.values(player)[0] > 0)
		.sort((a, b) => {
			return parseInt(Object.values(b)[0]) - parseInt(Object.values(a)[0]);
		});
	scoreboard.innerHTML = scores
		.map(player => {
			return `<p><i class="extra large child icon"></i>${Object.keys(
				player
			)[0]} - ${Object.values(player)[0]}</p>`;
		})
		.join("");
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
