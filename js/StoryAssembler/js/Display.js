/* 	Display Module

	This module handles showing stories in the UI, and responding to user events.
*/

/* global define */

define([], function() {
	"use strict";

	/* PRIVATE FUNCTIONS AND VARIABLES */
	var showUnavailableChoices = true;
	var enableDiagnostics = true;				//whether to show the gear or not

	var clickHandler;
	var varClickChangerFunc;		//this changes variables in the game when clicked
	var pathEl;
	var wishlistEl;
	var stateEl;

	/* PUBLIC-FACING FUNCTIONS */

	// Set up the Display module to begin showing stories.
	var init = function(_clickHandler, _varClickChanger) {

		if (gameVersion == "release") { enableDiagnostics = false; }
		clickHandler = _clickHandler;
		varClickChangerFunc = _varClickChanger;
		if (!document.getElementById("storyArea")) {
			makeUI();
		} else {
			clearAll();
		}
	}

	// Add some story text to the story window.
	var addStoryText = function(text) {
		var el = makeEl("span", text, "chunk");
		document.getElementById("storyArea").appendChild(el);
	}

	var getStoryText = function() {
		var theSpan = document.getElementById("storyArea").getElementsByTagName("span")[0];
		if (theSpan) { return theSpan.innerText; }
		else { return undefined; }
	}

	// Add a choice to the choice window.
	var addChoice = function(choice) {
		var el = makeEl("div", choice.text, "choice");
		if (!choice.cantChoose) {
			el.onclick = function() {
				clickHandler(choice);
			}
		} else {
			if (!showUnavailableChoices) return;
			el.classList.add("unavailableChoice");
		}
		document.getElementById("choiceArea").appendChild(el);
	}

	// Remove all content from the UI.
	var clearAll = function() {
		clearText();
		clearChoices();
	}

	var clearText = function() {
		document.getElementById("storyArea").innerHTML = "";
	}

	var clearChoices = function() {
		document.getElementById("choiceArea").innerHTML = "";
	}

	var diagnose = function(params) {
		if (enableDiagnostics) {
			if (params.path) {
				_showPath(params.path);
			}
			if (params.wishlist) {
				_showWishlist(params.wishlist);
			}
			if (params.state) {
				_showState(params.state);
			}
		}
	}

	// Private functions

	// Create and return an HTML element of a given type with the given content.
	var makeEl = function(type, content, elClass) {
		var el = document.createElement(type);
		el.innerHTML = content;
		if (elClass) el.classList.add(elClass);
		return el;
	}

	// Create a basic UI in the DOM to show story frames: a story area and a choice area.
	var makeUI = function() {
		var el;
		el = makeEl("div", "");
		el.id = "storyArea";
		if (document.getElementById('storyContainer') == null) {
			var el2 = makeEl("div", "");
			el2.id = "storyContainer";
			document.getElementsByTagName("BODY")[0].appendChild(el2);
		}
		document.getElementById('storyContainer').appendChild(el);
		el = makeEl("div", "");
		el.id = "choiceArea";
		document.getElementById('storyContainer').appendChild(el);


		// Create Diagnostic container.
		if (enableDiagnostics) {

			$('<div/>', {
				id: "storyDiagnosticsButton",
				click: function() {
					$("#storyDiagnostics").toggle();
				}
			}).appendTo("body");

			var diagEl = makeEl("div", "");
			diagEl.id = "storyDiagnostics";
			document.getElementsByTagName('body')[0].appendChild(diagEl);

			$('<div/>', {
				id: "varChangers"
			}).appendTo("#storyDiagnostics");

			$('<div/>', {
				class: "dHeader",
				text: "Change State Vars"
			}).appendTo("#varChangers");

			pathEl = makeEl("div", "<div class='dHeader'>Best Path:</div><div class='pathArea'></div>");
			diagEl.appendChild(pathEl);
			wishlistEl = makeEl("div", "<div class='dHeader'>Wishlist Is Now:</div><div class='wishlistArea'></div>");
			diagEl.appendChild(wishlistEl);
			stateEl = makeEl("div", "<div class='dHeader'>State:</div><div class='stateArea'></div>");
			diagEl.appendChild(stateEl);

			

		}

	}

	var addVarChangers = function(varList, setStateFunction) {
		varList.forEach(function(storyVar, pos) {
			var row = $('<div/>', {
				class: 'varChangerRow'
			}).appendTo("#varChangers");
			$('<span/>', {
				class: "varLabel",
				text: storyVar.label + ": "
			}).appendTo(row);
			$('<span/>', {
				class: "varIncrease",
				text: "+1",
				click: function() {
					setStateFunction(storyVar, "+1");
				}
			}).appendTo(row);
			$('<span/>', {
				class: "varDecrease",
				text: "-1",
				click: function() {
					setStateFunction(storyVar, "-1");
				}
			}).appendTo(row);
		});
	}

	// Diagnostic functions (to display status of system)
	var satisfiesList;
	var _showPath = function(bestPath) {
		var area = document.getElementsByClassName("pathArea")[0];
		area.innerHTML = "";
		// Show Best Path.
		var pathSteps = makeEl("div", "", "pathSteps");
		if (bestPath && bestPath.route) {
			bestPath.route.forEach(function(node, pos) {
				var arrow = pos < bestPath.route.length-1 ? " -> " : "";
				var step = makeEl("span", node + arrow, "pathStep");
				if (pos === 0) {
					step.classList.add("firstPathStep");
				}
				pathSteps.appendChild(step);
			});
		} else {
			pathSteps.innerHTML = "No Path";
		}
		area.appendChild(pathSteps);
		satisfiesList = [];
		if (bestPath && bestPath.satisfies) {
			satisfiesList = bestPath.satisfies.map(function(item){
				return item.val;
			});
			var satisfiesEl = makeEl("div", "This path would satisfy (or make progress towards satisfying) the highlighted Wants below.", "pathExpl");
			area.appendChild(satisfiesEl);
		}
	}

	var _showWishlist = function(wishlist) {
		var area = document.getElementsByClassName("wishlistArea")[0];
		area.innerHTML = "";
		if (typeof satisfiesList == "undefined") { satisfiesList = []; }

		// Show Wishlist.
		var wishlistArr = wishlist.wantsAsArray();
		if (wishlistArr.length > 0) {
			wishlistArr.forEach(function(want) {
				var wantEl = makeEl("div", want.val, "wlWant");
				if (satisfiesList.indexOf(want.val) >= 0) {
					wantEl.classList.add("matchedWant");
				}
				area.appendChild(wantEl);
			});
		} else {
			area.appendChild(makeEl("div", "Wishlist Empty", "pathSteps"));
		}
	}

	var _showState = function(blackboard) {
		var area = document.getElementsByClassName("stateArea")[0];
		area.innerHTML = "";
		// Show State.
		var stateKeys = Object.keys(blackboard);
		stateKeys.forEach(function(key) {
			if (blackboard[key]) {
				if (key == "validChunks") {
					var text = blackboard["validChunks"].map(function(item){ return item.chunkId; }).join(", ");
					var entryEl = makeEl("div", "<span class='bbKey'>" + key + "</span>: <span class='bbValue'>" + text + "</span>", "blackboardEntry");
				}
				else {
					var entryEl = makeEl("div", "<span class='bbKey'>" + key + "</span>: <span class='bbValue'>" + blackboard[key] + "</span>", "blackboardEntry");
				}
				area.appendChild(entryEl);
			}
		})
	}


	// PUBLIC INTERFACE
	return {
		init: init,
		clearAll: clearAll,
		clearText: clearText,
		clearChoices: clearChoices,
		addStoryText: addStoryText,
		getStoryText: getStoryText,
		addChoice: addChoice,
		diagnose: diagnose,
		addVarChangers : addVarChangers
	}
})