/* global test, QUnit */
"use strict";
define(["../StoryAssembler", "../ChunkLibrary", "State", "Wishlist", "StoryDisplay", "Character", "jQueryUI"], function(StoryAssembler, ChunkLibrary, State, Wishlist, StoryDisplay, Character, $) {

	var getStoryEl = function() {
		return document.getElementById("storyArea").children[0];
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

	var run = function() {

		var resetTest = function() {		//local function for resetting stuff between tests
			

			var characters = {
				"char1" : {name: "Emma", nickname: "Em", gender: "female" },
				"char2": {name: "Miguel", nickname: "Miguel", gender: "male"}
			};

			ChunkLibrary.reset();
			State.reset();
			Character.init(State);
			for (var key in characters) {
				Character.add(key, characters[key]);
			}
		}
		

		QUnit.module( "Narration Mode tests" );
		test("'narration' Narration Mode", function( assert ) {
			var wl, nextPath;

			resetTest();


			//if mode is dialogue, it should vary if no speaker is specified by chunk
			State.set("mode", {initiator: "char1", responder: "char2", type: "dialogue"});
			wl = Wishlist.create([{condition: "x eq true", persistent: true},{condition: "y eq true", persistent: true},{condition: "z eq true", persistent: true}], State);
			ChunkLibrary.add([
				{ 
					id: "chunk1", 
					content: "I'm chunk 1", 
					choices: [
						{chunkId: "chunk2"}
					],
					effects: ["set x true"], 
					repeatable: false 
				},
				{ 
					id: "chunk2",
					choiceLabel: "I'm chunk 2's label", 
					content: "I'm chunk 2's text", 
					choices: [
						{chunkId: "chunk3"}
					],
					effects: ["set y true"], 
					repeatable: false },
				{ 
					id: "chunk3", 
					choiceLabel: "I'm chunk3's label",
					content: "I'm chunk 3's text", 
					effects: ["set z true"], 
					repeatable: false 
				}
			]);
			StoryAssembler.beginScene(wl, ChunkLibrary, State, StoryDisplay, undefined, Character);
			assert.deepEqual(State.getBlackboard().mode.type, "dialogue", "properly updates to dialogue");
			assert.deepEqual(html(getStoryEl()), "Emma: I'm chunk 1", "Casts speaker correctly at beginning");
			assert.deepEqual(contentForChoice(1), "Miguel: I'm chunk 2's label", "Casts speaker for choice correctly");
			clickChoice(1);
			assert.deepEqual(html(getStoryEl()), "Emma: I'm chunk 2's text", "Casts speaker correctly after one click");
			assert.deepEqual(contentForChoice(1), "Miguel: I'm chunk3's label", "Casts speaker for choice correctly after one click");
			clickChoice(1);
			assert.deepEqual(html(getStoryEl()), "Emma: I'm chunk 3's text", "Casts speaker correctly after two clicks");

			resetTest();

			//default mode should be "monologue"
			wl = Wishlist.create([{condition: "x eq true", persistent: true}], State);
			ChunkLibrary.add([
				{ id: "Chunk1", content: "...", effects: ["set x true"], repeatable: false },
				{ id: "Chunk2", content: "...", effects: ["set x true"], repeatable: false },
				{ id: "Chunk3", content: "...", effects: ["set x true"], repeatable: false }
			]);
			StoryAssembler.beginScene(wl, ChunkLibrary, State, StoryDisplay, undefined, Character);
			nextPath = wl.bestPath(ChunkLibrary);
			assert.deepEqual(State.getBlackboard().mode.type, "monologue", "default mode is 'monologue'");

			//if mode is dialogue, choice speaker should still be one explicitly coded if chosen

			//should respect speaker explicitly coded if choiceLabel is different from main speaker



			//if mode is monologue, the speaker should always be the same

			//if mode is narrative, the speaker should be...?

		});		

	}

	return {
		run: run
	}
});