/* global test */
"use strict";
define(["../StoryAssembler", "../ChunkLibrary", "State", "Wishlist", "StoryDisplay", "Character", "jQueryUI"], function(StoryAssembler, ChunkLibrary, State, Wishlist, StoryDisplay, Character, $) {

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
				"char1" : {name: "Emma", nickname: "Em", gender: "female" },
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

		QUnit.module( "StoryAssembler Module tests" );
		test("Integration tests for StoryAssembler", function( assert ) {
			
			var wl;
/*
			//if a fragment is supposed to fire via continue, but depends on the effects running in a linked choice, and those effects make the state correct to continue, then that should work
			resetTest();
			State.set("mode", "narration");
			State.set("x", false);
			State.set("y", false);
			State.set("blocking", 1);
			wl = Wishlist.create([{condition: "x eq true"},{condition: "y eq true"}], State);
			wl.logOn();
			ChunkLibrary.add([
				{ id: "init", content: "init stuff", choices: [{gotoId: "linkedChoice"}], effects: ["set x true"] },
				{ id: "linkedChoice", content: "linked Choice", effects: ["incr blocking 1"], choiceLabel: "..."},
				{ id: "linkedContinue", content: "...", effects: ["set y true"], conditions: ["blocking eq 2", "x eq true"] }
			], pseudoCoordinator.settings);
			StoryAssembler.beginScene(wl, ChunkLibrary, State, StoryDisplay, undefined, Character, pseudoCoordinator);
			assert.deepEqual(html(getStoryEl()), "init stuff", "Correct chunk is chosen to begin");
			clickChoice(1);
			assert.deepEqual(html(getStoryEl()), "linked Choice", "Correct choice is available");
			assert.deepEqual(contentForChoice(1), "Continue", "Effect applied at correct interval");

			//-----------------------------------------------------------------------------------

*/
			resetTest();
			State.set("wishlist1", false);
			wl = Wishlist.create([
				{ condition: "effect2 eq true"}
				], State);
			wl.logOn();
			ChunkLibrary.add([
			{
				"id": "fragment1",
				//"choiceLabel": "what",
				"content": "fragment1 content",
				//"conditions" : [],
				"choices" : [
					{ "condition": "effect2 eq true"}
				],
				"effects": [
					"set effect1 true",
				]
			},
			{
				"id": "fragment2",
				"choiceLabel": "what",
				"content": "fragment2 content",
				"conditions" : ["effect1 eq true"],
				"effects": [
					"set effect2 true",
				]
			}
			], pseudoCoordinator.settings);

			StoryAssembler.beginScene(wl, ChunkLibrary, State, StoryDisplay, undefined, Character, pseudoCoordinator);
			assert.deepEqual(html(getStoryEl()), "fragment1 content", "fragment1 correctly pathed");
			clickChoice(1);
			assert.deepEqual(html(getStoryEl()), "fragment2 content", "We can successfully link choices by evaluating effects in their caller to know their preconditions would be satisfied by the time the player clicks them");

			//---------------------------------------------------------------
			resetTest();

			wl = Wishlist.create([{condition: "x eq true"}], State);
			ChunkLibrary.add([
				{ id: "Chunk1", content: "Chunk1 Content", choices: [{chunkId: "Chunk2"}] },
				{ id: "Chunk2", choiceLabel: "Chunk2 Label", content: "Chunk2 Content", effects: ["set x true"] }
			], pseudoCoordinator.settings);
			StoryAssembler.beginScene(wl, ChunkLibrary, State, StoryDisplay, undefined, Character, pseudoCoordinator);
			assert.deepEqual(html(getStoryEl()), "Chunk1 Content", "Basic: First chunk should be shown correctly");
			assert.deepEqual(contentForChoice(1), "Chunk2 Label", "Basic: First choice should be shown correctly");
			clickChoice(1);
			assert.deepEqual(html(getStoryEl()), "Chunk2 Content", "Basic: Second chunk should be shown correctly");
			assert.deepEqual(countChildren(getChoiceEl()), 0, "Should be no choices if we've run out of chunks.");

			resetTest();

			wl = Wishlist.create([{condition: "x eq true"}], State);
			wl.logOn();
			ChunkLibrary.add([
				{ id: "Chunk1", content: "Chunk1 Content", choices: [{chunkId: "Chunk2"}] },
				{ id: "Chunk2", choiceLabel: "Chunk2 Label", content: "Chunk2 Content", choices: [{chunkId: "Chunk3"}] },
				{ id: "Chunk3", choiceLabel: "Chunk3 Label", content: "Chunk3 Content", effects: ["set x true"] }
			], pseudoCoordinator.settings);
			StoryAssembler.beginScene(wl, ChunkLibrary, State, StoryDisplay, undefined, Character, pseudoCoordinator);
			assert.deepEqual(html(getStoryEl()), "Chunk1 Content", "In multi-choice chain, first chunk should be shown correctly (if this fails, check to make sure BestPath max depth is 3 or more)");
			assert.deepEqual(contentForChoice(1), "Chunk2 Label", "In multi-choice chain, first option correct.");
			clickChoice(1);
			assert.deepEqual(html(getStoryEl()), "Chunk2 Content", "In multi-choice chain, second chunk shows correctly.");
			assert.deepEqual(contentForChoice(1), "Chunk3 Label", "In multi-choice chain, second option correct.");
			assert.deepEqual(countChildren(getChoiceEl()), 1, "In multi-choice chain, should be exactly 1 option.");
			clickChoice(1);
			assert.deepEqual(html(getStoryEl()), "Chunk3 Content", "In multi-choice chain, last chunk should show correctly.");
			assert.deepEqual(countChildren(getChoiceEl()), 0, "In multi-choice chain, no options when finished.");

			// Test chaining through condition-based request (condition is different than initial wishlist goals)
			resetTest();
			State.set("beat", 1);
			wl = Wishlist.create([{condition: "beat eq 3"}, {condition: "beat eq 2"}], State);
			ChunkLibrary.add([
				{ id: "Chunk1", content: "Chunk1 Content", choices: [{chunkId: "Chunk2x"}], effects: ["set beat 2"] },
				{ id: "Chunk2x", choiceLabel: "Chunk2 Label", request: {condition: "x eq true"} },
				{ id: "Chunk3x", conditions: ["beat eq 2"], content: "Chunk3 Content", effects: ["set beat 3", "set x true"] }
			], pseudoCoordinator.settings);
			StoryAssembler.beginScene(wl, ChunkLibrary, State, StoryDisplay, undefined, Character, pseudoCoordinator);
			assert.deepEqual(html(getStoryEl()), "Chunk1 Content", "Chain through condition request: first node HTML correct");
			assert.deepEqual(countChildren(getChoiceEl()), 1, "Chain through condition request: initially only 1 choice");
			assert.deepEqual(contentForChoice(1), "Chunk2 Label", "Chain through condition request: single choice is to Chunk2");
			console.log("clicking choice in Chunk1");
			clickChoice(1);
			assert.deepEqual(html(getStoryEl()), "Chunk3 Content", "Chain through condition request: after click, should chain through.");
			//assert.deepEqual(contentForChoice(1), "Continue", "Chain through condition request: no options when finished.");
			assert.deepEqual(countChildren(getChoiceEl()), 0, "No choices because the scene is over.");
			// Test "persistent" wishlist parameter and "repeatable" chunk parameter.
			resetTest();
			wl = Wishlist.create([{condition: "x eq true", persistent: true}], State);
			ChunkLibrary.add([
				{ id: "Chunk1", content: "Chunk1 Content", effects: ["set x true"], repeatable: true }
			], pseudoCoordinator.settings);
			StoryAssembler.beginScene(wl, ChunkLibrary, State, StoryDisplay, undefined, Character, pseudoCoordinator);
			assert.deepEqual(html(getStoryEl()), "Chunk1 Content", "Persistent chunks work first time (1/3)");
			assert.deepEqual(countChildren(getChoiceEl()), 1, "Persistent chunks work first time (2/3)");
			assert.deepEqual(contentForChoice(1), "Continue", "Persistent chunks work first time (3/3)");
			clickChoice(1);
			assert.deepEqual(html(getStoryEl()), "Chunk1 Content", "Persistent chunks work second time (1/2)");
			assert.deepEqual(contentForChoice(1), "Continue", "Persistent chunks work second time (2/2)");

//--------------------------------------------------------------------
			resetTest();
			wl = Wishlist.create([{condition: "x eq true", persistent: true}], State);
			ChunkLibrary.add([
				{ id: "Chunk1", content: "Chunk1 Content", effects: ["set x true"], repeatable: false }
			], pseudoCoordinator.settings);
			StoryAssembler.beginScene(wl, ChunkLibrary, State, StoryDisplay, undefined, Character, pseudoCoordinator);
			assert.deepEqual(html(getStoryEl()), "Chunk1 Content", "Non-repeatable chunks work first time (1/2)");
			assert.deepEqual(contentForChoice(1), "Continue", "Non-repeatable chunks work first time (2/2)");
			clickChoice(1);
			assert.deepEqual(html(getStoryEl()), "[End of scene.]", "Non-repeatable chunks: if a used non-repeatable chunk is the only thing satisfying a wishlist item, fail to find a path");

//--------------------------------------------------------------------
			resetTest();
			wl = Wishlist.create([{condition: "x eq true", persistent: true}], State);
			ChunkLibrary.add([
				{ id: "Chunk1", content: "...", effects: ["set x true"], repeatable: false },
				{ id: "Chunk2", content: "...", effects: ["set x true"], repeatable: false },
				{ id: "Chunk3", content: "...", effects: ["set x true"], repeatable: false }
			], pseudoCoordinator.settings);
			StoryAssembler.beginScene(wl, ChunkLibrary, State, StoryDisplay, undefined, Character, pseudoCoordinator);
			clickChoice(1);
			clickChoice(1);
			clickChoice(1);
			assert.deepEqual(html(getStoryEl()), "[End of scene.]", "Non-repeatable chunks: should run out when we've exhausted supply.");

//--------------------------------------------------------------------
			//test whether it can find the next want from wishlist if current choice-thread ends
			resetTest();
			State.set("beat", 1);
			wl = Wishlist.create([{condition: "beat eq 2"}, {condition: "beat eq 3"}], State);
			ChunkLibrary.add([
				{ id: "Chunk1", content: "Chunk1 Content", choices: [{chunkId: "Chunk2b"}], effects: ["set beat 2"] },
				{ id: "Chunk2b", choiceLabel: "Chunk2 Label", content: "Chunk2 content" },
				{ id: "Chunk3", conditions: ["beat eq 2"], content: "Chunk3 Content", effects: ["set beat 3"] }
			], pseudoCoordinator.settings);
			StoryAssembler.beginScene(wl, ChunkLibrary, State, StoryDisplay, undefined, Character, pseudoCoordinator);
			assert.deepEqual(html(getStoryEl()), "Chunk1 Content", "Move to different want after thread ends: first node HTML correct");
			assert.deepEqual(countChildren(getChoiceEl()), 1, "Move to different want after thread ends: initially only 1 choice");
			assert.deepEqual(contentForChoice(1), "Chunk2 Label", "Move to different want after thread ends: single choice is to Chunk2");
			clickChoice(1);
			assert.deepEqual(html(getStoryEl()), "Chunk2 content", "Move to different want after thread ends: after click, should chain through.");
			assert.deepEqual(contentForChoice(1), "Continue", "Move to different want after thread ends: single choice is to Chunk2");
			clickChoice(1);
			assert.deepEqual(html(getStoryEl()), "Chunk3 Content", "Move to different want after thread ends: second node HTML correct");

//--------------------------------------------------------------------
			//unit test for pulling in chunk with choices into chunk making request that has no content
			resetTest();
			State.set("beat", 1);
			wl = Wishlist.create([{condition: "beat eq 2"}, {condition: "beat eq 3"}, {condition: "beat eq 4"}], State);
			ChunkLibrary.add([
				{ id: "Chunk1", content: "Chunk1 Content", choices: [{chunkId: "Chunk2Ref"}], effects: ["set beat 2"] },
				{ id: "Chunk2Ref", choiceLabel: "Chunk2 Label", request: {condition: "x eq true"} },
				{ id: "Chunk3Ref", conditions: ["beat eq 2"], content: "Chunk3 Content", choices: [{chunkId: "Chunk4"}], effects: ["set beat 3", "set x true"] },
				{ id: "Chunk4", choiceLabel: "Chunk4 Label", content: "Chunk4 Content", effects: ["set beat 4"] },
			], pseudoCoordinator.settings);
			StoryAssembler.beginScene(wl, ChunkLibrary, State, StoryDisplay, undefined, Character, pseudoCoordinator);
			assert.deepEqual(html(getStoryEl()), "Chunk1 Content", "Choices also chain from requests: first node HTML correct");
			assert.deepEqual(countChildren(getChoiceEl()), 1, "Choices also chain from requests: initially only 1 choice");
			assert.deepEqual(contentForChoice(1), "Chunk2 Label", "Choices also chain from requests: single choice is to Chunk2");
			clickChoice(1);
			assert.deepEqual(html(getStoryEl()), "Chunk3 Content", "Choices also chain from requests: after click, should chain through.");
			assert.deepEqual(contentForChoice(1), "Chunk4 Label", "Choices also chain from requests: single choice is to Chunk4");
			assert.deepEqual(countChildren(getChoiceEl()), 1, "Choices also chain from requests: second screen only 1 choice");
			clickChoice(1);
			assert.deepEqual(html(getStoryEl()), "Chunk4 Content", "Choices also chain from requests: after click, should chain through again.");
			assert.deepEqual(countChildren(getChoiceEl()), 0, "Choices also chain from requests: no options when finished.");
			console.log(wl.wantsAsArray());

//--------------------------------------------------------------------
			//make sure options aren't being displayed that shouldn't be displayed
			resetTest();
			State.set("beat", 1);
			wl = Wishlist.create([{condition: "beat eq 1"}, {condition: "beat eq 2"}], State);
			ChunkLibrary.add([
				{ 
					id: "Text1", 
					content: "Text1 Content", 
					choices: [{chunkId: "normalChoice"}],
					effects: ["set beat 1"] 
				},
				{ 
					id: "normalChoice", 
					choiceLabel: "normalChoice Label", 
					content: "normalChoice Content"
				},
				{ 
					id: "orphanChoice", 
					choiceLabel: "orphanChoice Label", 
					request: {condition: "beat eq 2"} },
				{ 
					id: "orphanChoiceContent", 
					conditions: ["beat eq 1"], 
					content: "orphanChoiceContent Content", 
					choices: [{chunkId: "Chunk4"}], 
					effects: ["set beat 2"] 
				}
			], pseudoCoordinator.settings);
			StoryAssembler.beginScene(wl, ChunkLibrary, State, StoryDisplay, undefined, Character, pseudoCoordinator);
			assert.deepEqual(html(getStoryEl()), "Text1 Content", "No extra options: first node HTML correct");
			assert.deepEqual(countChildren(getChoiceEl()), 1, "No extra options: no initial options");
			assert.deepEqual(contentForChoice(1), "normalChoice Label", "No extra options: normalChoice displays");

//--------------------------------------------------------------------
			// Test incremental progress towards wishlist items.
			resetTest();
			State.set("stress", 0);
			wl = Wishlist.create([{condition: "stress gte 3"}], State);
			ChunkLibrary.add([
				{ 
					id: "StressChunk", 
					content: "StressChunk Content", 
					effects: ["incr stress 1"], 
					repeatable: true 
				}
			], pseudoCoordinator.settings);
			StoryAssembler.beginScene(wl, ChunkLibrary, State, StoryDisplay, undefined, Character, pseudoCoordinator);
			assert.deepEqual(html(getStoryEl()), "StressChunk Content", "Testing incremental progress (1)");
			assert.deepEqual(contentForChoice(1), "Continue", "Testing incremental progress (2)");
			clickChoice(1);
			assert.deepEqual(html(getStoryEl()), "StressChunk Content", "Testing incremental progress (3)");
			clickChoice(1);
			assert.deepEqual(countChildren(getChoiceEl()), 0, "Testing incremental progress (4)");

//--------------------------------------------------------------------
			// Test gotoId as a Twine-like deterministic link
			resetTest();
			wl = Wishlist.create([{condition: "theChunk eq 1"}, {condition: "theChunk eq 4"}], State);
			wl.logOn();
			ChunkLibrary.add([
				{ 
					id: "LinkTest1", 
					content: "Text1 Content", 
					choices: [{gotoId: "LinkTest2"}],
					effects: ["set theChunk 1"] },
				{ 
					id: "LinkTest2", 
					choiceLabel: "linkChoice link", 
					content: "linkTest2 Content"
				}
			], pseudoCoordinator.settings);
			StoryAssembler.beginScene(wl, ChunkLibrary, State, StoryDisplay, undefined, Character, pseudoCoordinator);
			assert.deepEqual(html(getStoryEl()), "Text1 Content", "Testing goto-style links (1)");
			assert.deepEqual(contentForChoice(1), "linkChoice link", "Testing goto-style links (2)");
			clickChoice(1);
			assert.deepEqual(html(getStoryEl()), "linkTest2 Content", "Testing goto-style links (3)");

//--------------------------------------------------------------------
			// Test compound nodes where second content node fulfills wishlist item
			resetTest();
			wl = Wishlist.create([{condition: "theScene eq start", order: "first"}, {condition: "awesome eq heckYeah"} ], State);
			wl.logOn();
			ChunkLibrary.add([
				{ 
					id: "chunk1", 
					content: "chunk1 is me!", 
					choices: [{condition: "x eq active"}],
					effects: ["set theScene start"]
				},
				{ 
					id: "chunk2", 
					choiceLabel: "hey choicelabel",
					request: {"gotoId": "chunk3"},
					effects: ["set x active"]
				},
				{ 
					id: "chunk3", 
					content: "chunk3 is me!", 
					effects: ["set awesome heckYeah"],
				}
			], pseudoCoordinator.settings);
			StoryAssembler.beginScene(wl, ChunkLibrary, State, StoryDisplay, undefined, Character, pseudoCoordinator);
			assert.deepEqual(html(getStoryEl()), "chunk1 is me!", "Testing compound nodes (1)");
			assert.deepEqual(contentForChoice(1), "hey choicelabel", "Testing compound nodes (2)");
			clickChoice(1);
			assert.deepEqual(html(getStoryEl()), "chunk3 is me!", "Testing compound nodes (3)");

//--------------------------------------------------------------------
			// Test compound nodes with gotoIds
			resetTest();
			wl = Wishlist.create([{condition: "establishSetting eq true", order: "first"}, {condition: "awesome eq heckYeah"} ], State);
			wl.logOn();
			ChunkLibrary.add([
				{
					"id": "setup",
					"speaker" : "ally",
					"content" : "Sorry everything's so messy!",
					"choices" : [
						{"gotoId" : "choiceInterface", "speaker" : "protagonist"}
					],
					"effects": ["set establishSetting true"]
				},
				{
					"id": "choiceInterface",
					"choiceLabel": "What's with all the boxes everywhere?",
					"request": {"gotoId": "interface"},
					//"effects": ["set establishSetting true"]
				},
				{
					"id": "interface",
					"speaker" : "ally",
					"content" : "I'm the interface!",
					"choices" : [
						{"gotoId" : "dummyChoice", "speaker" : "protagonist"}
					],
					//"effects": ["set establishSetting true"]
				},
				{
					"id": "dummyChoice",
					"choiceLabel": "I'm the dummy choice.",
					"content": "dummy content"
				},
			], pseudoCoordinator.settings);
			StoryAssembler.beginScene(wl, ChunkLibrary, State, StoryDisplay, undefined, Character, pseudoCoordinator);
			assert.deepEqual(html(getStoryEl()), "Sorry everything's so messy!", "Test compound nodes with gotoIds w/ no Want motivation (1)");
			assert.deepEqual(contentForChoice(1), "What's with all the boxes everywhere?", "Test compound nodes with gotoIds w/ no Want motivation (2)");
			clickChoice(1);
			assert.deepEqual(html(getStoryEl()), "I'm the interface!", "Test compound nodes with gotoIds w/ no Want motivation (3)");
			assert.deepEqual(contentForChoice(1), "I'm the dummy choice.", "Test compound nodes with gotoIds w/ no Want motivation (4)");

//--------------------------------------------------------------------
			//chunks that are used in dynamic / compound chunks should also be removed from the content library if applicable
			resetTest();
			wl = Wishlist.create([{condition: "establishSetting eq true", order: "first"}, {condition: "awesome eq heckYeah"} ], State);
			wl.logOn();
			ChunkLibrary.add([
				{
					"id": "setup",
					"speaker" : "ally",
					"content" : "Sorry everything's so messy!",
					"choices" : [
						{"gotoId" : "choiceInterface", "speaker" : "protagonist"}
					],
					"effects": ["set establishSetting true"]
				},
				{
					"id": "choiceInterface",
					"choiceLabel": "What's with all the boxes everywhere?",
					"request": {"gotoId": "interface"},
					//"effects": ["set establishSetting true"]
				},
				{
					"id": "interface",
					"speaker" : "ally",
					"content" : "I'm the interface!",
					"choices" : [
						{"gotoId" : "dummyChoice", "speaker" : "protagonist"}
					],
					//"effects": ["set establishSetting true"]
				},
				{
					"id": "dummyChoice",
					"choiceLabel": "I'm the dummy choice.",
					"content": "dummy content"
				},
			], pseudoCoordinator.settings);
			StoryAssembler.beginScene(wl, ChunkLibrary, State, StoryDisplay, undefined, Character, pseudoCoordinator);
			assert.deepEqual(ChunkLibrary.get('interface').available, true, "for first node, interface should still be available from ChunkLibrary");
			clickChoice(1);
			assert.deepEqual(ChunkLibrary.get('interface'), false, "after clicking, interface should not be available");

//--------------------------------------------------------------------
			//StoryAssembler correctly handles looping requests and doesn't display multiple chunks at once
			resetTest();
			State.set("droppedKnowledge", 0 );
			wl = Wishlist.create([{ condition: "setSetting eq true", order: "first" }, { condition: "droppedKnowledge gte 2", persistent: true }, { condition: "establishSetting eq true"}, { condition: "respondToChallenge eq true"} ], State);
			wl.logOn();
			ChunkLibrary.add([
				{
					"id": "start",
					"content": "This is just a start node.",
					"choices" : [
						{"gotoId": "choice1"},
					],
					"conditions": [],
					"effects": ["set setSetting true"]
				},
				{
					"id": "choice1",
					"speaker" : "ally",
					"choiceLabel" : "We're at the dinner scene.",
					"content": "Oh, ok. Right.",
					"effects" : ["set setting dinner"]
				},
				{
					"id": "slide1",
					"speaker" : "protagonist",
					"request" : {"condition": "droppedKnowledge incr 1"},
					//"choices" : [
					//	{"gotoId": "slide2", "speaker" : "protagonist"}
					//],
					//"conditions" : ["setting eq lecture"],
					"effects" : ["set establishSetting true", "set slide1 true"]
				},
				{
					"id": "clathratesDanger",
					//"speaker" : "global",
					"content": "Have you heard of clathrates?",
					"conditions": [],
					"effects": ["incr droppedKnowledge 1"]
				},
			], pseudoCoordinator.settings);
			StoryAssembler.beginScene(wl, ChunkLibrary, State, StoryDisplay, undefined, Character, pseudoCoordinator);
			assert.deepEqual(html(getStoryEl()), "This is just a start node.", "Correct chunk is chosen to begin");
			clickChoice(1);
			assert.deepEqual(html(getStoryEl()), "Oh, ok. Right.", "Simple goto works correctly.");
			assert.deepEqual(contentForChoice(1), "Continue","Proper continue");
			clickChoice(1);
			assert.deepEqual(getStoryEl(1), undefined, "Displays chunk just once, not multiple times");
			assert.deepEqual(countChildren(getChoiceEl()), 1, "There should be only one child");

//--------------------------------------------------------------------
			//Fragments that use requests for content (that contain grammars dependent on state variables) do not set their effects
			resetTest();
			State.set("choiceChosen", 0 );
			wl = Wishlist.create([{ condition: "beat1 eq true", order: "first" }, { condition: "beat2 eq true"}], State);
			wl.logOn();
			ChunkLibrary.add([
				{
					"id": "start",
					"content": "This is just a start node.",
					"choices" : [
						{"gotoId": "choice1EffectsTest"},
						{"gotoId": "choice2EffectsTest"}
					],
					"effects": ["set beat1 true"]
				},
				{
					"id": "choice1EffectsTest",
					"speaker" : "ally",
					"choiceLabel" : "Choice1 Label.",
					"request": {"gotoId": "choiceRequest"},
					"effects" : ["set choiceChosen 1"]
				},
				{
					"id": "choice2EffectsTest",
					"speaker" : "ally",
					"choiceLabel" : "Choice2 Label.",
					"request": {"gotoId": "choiceRequest"},
					"effects" : ["set choiceChosen 2"]
				},
				{
					"id": "choiceRequest",
					"speaker" : "protagonist",
					"content" : "{ifStateCondition|choiceChosen eq 1|You chose choice 1!|You did not choose choice 1!}",
					"effects" : ["set beat2 true"]
				},
			], pseudoCoordinator.settings);
			StoryAssembler.beginScene(wl, ChunkLibrary, State, StoryDisplay, undefined, Character, pseudoCoordinator);
			assert.deepEqual(html(getStoryEl()), "This is just a start node.", "Correct chunk is chosen to begin");
			clickChoice(1);
			assert.deepEqual(html(getStoryEl()), "You chose choice 1!", "State evaluated correctly!");

//-----------------------------------------------------------

			//If there are three choices, correctly choose it first

			//allPaths returns two options: setVars (which satisfies our wishlist item) and familyIsFamily, which satisfies goto AtDinnerYouPay

			resetTest();
			State.set("droppedKnowledge", 0 );
			State.set("academicEnthusiasm", 2);
			State.set("setVars", 0);
			wl = Wishlist.create([
				{ condition: "setVars eq 1", order: "first" },
				{ condition: "establishSetting eq true"}, 
				{ condition: "respondToChallenge eq true"} 
				], State);
			wl.logOn();
			ChunkLibrary.add([
				{    
			        "id": "setVars",
			        "content" : "sets initial vars",
					"choices" : [ 
						{"gotoId": "HighAcademic"},
						{"gotoId": "LowAcademic"},
						{"gotoId": "MediumAcademic"}
					],
					"effects" : ["set setVars 1"]
			    },
			    {	
			        "id": "test1",
					"choiceLabel": "Medium Academic",
			        "content" : "medium academic enthusiasm",
					 "effects" : ["set establishSetting true"],//,"set familyIsFamily true"]
			    },
			    {	
			        "id": "test2",
					"choiceLabel": "Medium Academic",
			        "content" : "medium academic enthusiasm",
					 "effects" : ["set respondToChallenge true"],//,"set familyIsFamily true"]
			    },
				{	
			        "id": "MediumAcademic",
					"choiceLabel": "Medium Academic",
			        "content" : "medium academic enthusiasm",
					 "effects" : ["set academicEnthusiasm 6"],//,"set familyIsFamily true"]
			    },
				{
			         
			        "id": "LowAcademic",
					"choiceLabel": "Low Academic",
			        "content" : "low academic enthusiasm",
					"effects" : ["set academicEnthusiasm 4"],//,"set familyIsFamily true"]
			    },
				{	
			        "id": "HighAcademic",
					"choiceLabel": "High Academic",
			        "content" : "high academic enthusiasm",
					"effects" : ["set academicEnthusiasm 10"],//,"set familyIsFamily true"]
			    },
				{
					"id": "familyIsFamily",
					"content": "at dinner with family",
					"choices": [
						{"gotoId": "atDinnerYouPay"},
						{"gotoId": "atDinnerTheyPay"}
					],
					"effects": [
						"set familyIsFamily true",
					],
				},
					{
					"id": "atDinnerYouPay",
					"choiceLabel": "you treat your family to dinner",
					"content": "treat your family",
					"conditions" : [
						"academicEnthusiasm gt 4",
					],
					"effects": [
						"set atDinner true",
						"set youArePaying true"
					],
				},
				{
					"id": "atDinnerTheyPay",
					"choiceLabel": "parents are paying for dinner.",
					"content": "family treats you",
					"conditions" : [
						"academicEnthusiasm lt 5",
					],
					"effects": [
						"set atDinner true",
						"set youArePaying false", //potentially raise tension here
					]
				},
			], pseudoCoordinator.settings);
			StoryAssembler.beginScene(wl, ChunkLibrary, State, StoryDisplay, undefined, Character, pseudoCoordinator);
			assert.deepEqual(html(getStoryEl()), "sets initial vars", "Correct chunk is chosen to begin");


//-----------------------------------------------------------
			//If you are using a condition choice to pick the right link based on what fulfills the wishlist item, it should pick the right one

			resetTest();
			State.set("wishlist1", false);
			wl = Wishlist.create([
				{ condition: "wishlist1 eq true"}
				], State);
			wl.logOn();
			ChunkLibrary.add([
				{    
			        "id": "setVars",
			        "content" : "sets initial vars",
					"choices" : [ 
						{"condition": "makeChoice eq true"},
					],
					//"effects" : [""]
			    },
			    {
					"id": "badChoice",
					"choiceLabel": "incorrect choice!",
					"content": "incorrect choice!",
					//"conditions" : [],
					"effects": [
						"set makeChoice true",
						"set randomBad true"
					],
				},
				{
					"id": "correctChoice",
					"choiceLabel": "correct choice!",
					"content": "correct choice!",
					//"conditions" : [],
					"effects": [
						"set makeChoice true",
						"set wishlist1 true"
					],
				}
			], pseudoCoordinator.settings);


				StoryAssembler.beginScene(wl, ChunkLibrary, State, StoryDisplay, undefined, Character, pseudoCoordinator);
				assert.deepEqual(html(getStoryEl()), "sets initial vars", "Correct chunk is chosen to begin");
				assert.deepEqual(contentForChoice(1), "correct choice!","Proper choice label brought in");
				clickChoice(1);
				assert.deepEqual(html(getStoryEl()), "correct choice!", "Correct choice is brought in to satisfy wishlist item");

			/*
			clickChoice(1);
			assert.deepEqual(html(getStoryEl()), "Oh, ok. Right.", "Simple goto works correctly.");
			assert.deepEqual(contentForChoice(1), "Continue","Proper continue");
			clickChoice(1);
			assert.deepEqual(getStoryEl(1), undefined, "Displays chunk just once, not multiple times");
			assert.deepEqual(countChildren(getChoiceEl()), 1, "There should be only one child");
			*/



/*
			//dynamic chunks brought in as choices should be valid if the root chunk making the request has an effect that would make their state pre-condition true
			resetTest();
			wl = Wishlist.create([{condition: "establishFriendBackstory eq true", order: "first"}, {condition: "establishEmmaRegrets eq true"} ], State);
			wl.logOn();
			ChunkLibrary.add([
				{
					"id": "inSpain",
					"content": "You would not believe how much of this stuff I ate in Spain.",
					"choices" : [
						{"condition": "establishEmmaRegrets eq true"},
					],
					"conditions": [],
					"effects": ["set establishFriendBackstory true"]
				},
				{
					"id": "stilljealous",
					"choiceLabel": "Still jealous you got to spend six months there.",
					"request": {"condition": "establishEmmaRegrets eq true"}
				},
				{
					"id": "regrets",
					"content": "Oh, come on. Don't beat yourself up. I'm pretty sure you made the right decision.",
					"conditions" : ["establishFriendBackstory eq true"],
					"effects": ["decr confidence 1", "set establishEmmaRegrets true"]
				}
			]);
			StoryAssembler.beginScene(wl, ChunkLibrary, State, StoryDisplay, undefined, Character, pseudoCoordinator);
			assert.deepEqual(html(getStoryEl()), "You would not believe how much of this stuff I ate in Spain.", "dynamic choiceLabels chain correctly (1)");
			assert.deepEqual(contentForChoice(1), "Still jealous you got to spend six months there.", "Dynamic choice label should be brought in without wishlist item");
			clickChoice(1);
			assert.deepEqual(html(getStoryEl()), "Oh, come on. Don't beat yourself up. I'm pretty sure you made the right decision.", "Content should display correctly");
*/

		});
	}

	return {
		run: run
	}
});