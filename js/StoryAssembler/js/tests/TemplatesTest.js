/* global test, QUnit */
"use strict";
define(["../Templates", "../State", "../StoryAssembler", "../ChunkLibrary", "Wishlist", "StoryDisplay", "Character", "jQueryUI"], function(Templates, State, StoryAssembler, ChunkLibrary, Wishlist, StoryDisplay, Character, $) {

	var getStoryEl = function(childIndex) {
		var theIndex = (typeof childIndex !== 'undefined') ?  childIndex : 0;
		return document.getElementById("storyArea").children[theIndex];
	}
	var getChoiceEl = function() {
		return document.getElementById("choiceArea");
	}
	var html = function(el) {
		return el.innerHTML;
	}
	var countChildren = function(el) {
		return el.children.length;
	}
	var child = function(num, el) {
		return el.children[num-1];
	}
	var clickEl = function(el) {
		el.click();
	}
	var clickChoice = function(num) {
		clickEl(child(num, getChoiceEl()));
	}
	var contentForChoice = function(num) {
		return html(child(num, getChoiceEl()));
	}
	var cleanUpDom = function() {
		var el = document.getElementById("storyArea");
		el.parentNode.removeChild(el);
		el = document.getElementById("choiceArea");
		el.parentNode.removeChild(el);
		el = document.getElementById("diagnostics");
		el.parentNode.removeChild(el);
	}

	var pseudoCoordinator ={
		"settings": {
			"releaseMode" : false,				//if true, will end a scene early if a path bug is found. If false, will display NoPathFound error on console and crash.
			"requiredFields" : [],
			"optionalFields" : ["id", "notes", "choices", "choiceLabel", "unavailableChoiceLabel", "effects", "conditions", "request", "content", "repeatable", "speaker", "available", "gameInterrupt", "avatar"],		//"id" is optional because, if a chunk doesn't have one, we'll assign one automatically (unnamedChunk5, etc)
			"sceneOrder" : ["exampleScene-branching", "exampleScene"]			//progression of scenes when you hit "Begin", or laid out in timeline
		}
	};
	
	var run = function() {

		var resetTest = function() {		//local function for resetting stuff between tests
			var characters = {
				"char1" : {name: "Emma", nickname: "Em", gender: "female", favFood: "pork" },
				"char2": {name: "Miguel", nickname: "Miguel", gender: "male"}
			};

			ChunkLibrary.reset();
			State.reset();
			Character.init(State);
			for (var key in characters) {
				Character.add(key, characters[key]);
			}
			State.set("mode", { type: "narration" } );
		}

		QUnit.module( "Templates Module tests" );
		test("templating", function( assert ) {

			Templates.init(Character, pseudoCoordinator, StoryDisplay);

			// Add two template commands
			Templates.addTemplateCommand("testNoParams", function(params, text) {
				return "resultOne";
			});
			Templates.addTemplateCommand("testTwoParams", function(params, text) {
				if (params.length !== 2) {
					console.error("Template command 'testTwoParams' must have exactly two params, in text '" + text + "'.");
					return "(testTwoParams)";
				}
				if (true) {
					return params[0]
				} else {
					return params[1];
				}
			});

			// Shorthand function
			var render = function(txt) { return Templates.render(txt); }

			// Tests
			assert.deepEqual(render("some text"), "some text", "text without templates is unchanged");
			assert.deepEqual(render("some {testNoParams} text"), "some resultOne text", "cmd without params");
			assert.deepEqual(render("{testNoParams} at start"), "resultOne at start", "templates at start of string");
			assert.deepEqual(render("at end is {testNoParams}"), "at end is resultOne", "templates at end of string");
			//assert.deepEqual(render("some \\{testNoParams\\} text"), "some \\{testNoParams\\} text", "escaping braces");
			//assert.deepEqual(render("\\{testNoParams\\} at start"), "\\{testNoParams\\} at start", "escaping braces at start of string");
			assert.deepEqual(render("oops {{testNoParams}"), "()", "extra opening braces should be skipped");
			assert.deepEqual(render("oops {testNoParams}}"), "oops resultOne}", "extra closing braces should be skipped");
			assert.deepEqual(render("lots of {testTwoParams|fun|asdf} {testTwoParams|exciting|xcvb} {testNoParams} stuff"), "lots of fun exciting resultOne stuff", "test with multiple params");
			assert.deepEqual(render("{testTwoParams|paral|x}{testTwoParams|lel|y}"), "parallel", "adjacent templates");
			assert.deepEqual(render("nested {testTwoParams|({testNoParams})|nope}"), "nested resultOne", "nested templates with parentheses");
			assert.deepEqual(render("nested {testTwoParams|{testNoParams}|nope}"), "nested ()", "nested templates without parentheses should be rejected");

/*
//Manually confirmed these two tests are passing using the game logic, but testing character templates requires we initialize State, which also needs Coordinator, so the pipeline is super complicated.
//TODO: in general for tests, we should develop a simple (as possible) way that people can simply call StoryAssembler.beginScene() and get back a Javascript object with content in it. We need this anyway for people who don't want to use our display stuff.

			//test ifCharTraitIs grammar for conditionals based on char traits
			var wl;
			resetTest();
			//State.set("mode", "narration");
			wl = Wishlist.create([{condition: "x eq true"}], State);
			wl.logOn();
			ChunkLibrary.add([
				{ 	id: "init", 
					content: "{ifCharTraitIs|char1|gender eq female|she|uh oh} {ifCharTraitIs|char1|gender eq fwa|she|uh oh} {ifCharTraitIs|char1|honk eq fwa|she|uh oh}", 
					effects: ["set x true"] 
				}
			], pseudoCoordinator.settings);
			//function(_wishlist, _chunkLibrary, _State, _StoryDisplay, _Display, _Character, _Coordinator, params) 
			StoryAssembler.beginScene(wl, ChunkLibrary, State, StoryDisplay, undefined, Character, Coordinator);
			assert.deepEqual(html(getStoryEl()), "she uh oh uh oh", "ifCharTraitIs works correctly");

			//test charTrait grammar
			resetTest();
			State.set("mode", "narration");
			wl = Wishlist.create([{condition: "x eq true"}], State);
			wl.logOn();
			ChunkLibrary.add([
				{ id: "init", content: "{charTrait|char1|favFood|food} {charTrait|char1|favssFood|food}", effects: ["set x true"] }
			], pseudoCoordinator.settings);
			StoryAssembler.beginScene(wl, ChunkLibrary, State, StoryDisplay, undefined, Character);
			assert.deepEqual(html(getStoryEl()), "pork food", "charTrait work correctly");
			*/

		});

	}

	return {
		run: run
	}
});			