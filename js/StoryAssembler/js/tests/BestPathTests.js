/* global test, QUnit */
"use strict";
define(["../Wishlist", "../ChunkLibrary", "../Request", "../State", "../Character"], function(Wishlist, ChunkLibrary, Request, State, Character) {

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
		

		QUnit.module( "BestPath Module tests" );
		test("bestPath", function( assert ) {
			var wl, nextPath;

			wl = Wishlist.create([{chunkId: "TestNode"}], State);
			ChunkLibrary.reset();

			// Test one-step path based on ID.
			ChunkLibrary.add([
				{ id: "TestNode", content: "Hello, world!" },
			]);
			nextPath = wl.bestPath(ChunkLibrary);
			assert.deepEqual(nextPath.route, ["TestNode"], "simple id request should have right path");
			// We expect "nextPath.satisfies" to be an array of Wants satisfied by this path. Normally we could not guarantee these would be in any special order, but in this case since we know there's only one, we can grab it and check its two fields, "type" and "val".
			assert.deepEqual(nextPath.satisfies[0].type, "id", "simple id request should satisfy the right want (type)");
			assert.deepEqual(nextPath.satisfies[0].val, "TestNode", "simple id request should satisfy the right want (val)");

			// Test that ID paths ends when it satisfies Wants.
			ChunkLibrary.reset();
			ChunkLibrary.add([
				{ id: "TestNodeX", content: "..." },
				{ id: "TestNode", request: {chunkId: "TestNode2"} },
				{ id: "TestNodeZ", content: "..." },
				{ id: "TestNode2", content: "Hola, mundo!" }
			]);
			nextPath = wl.bestPath(ChunkLibrary);
			assert.deepEqual(nextPath.route, ["TestNode"], "don't need to go to leaf nodes that don't satisfy any wants");
			assert.deepEqual(nextPath.satisfies.length, 1, "two-step path should only show wants satisfied");
			assert.deepEqual(nextPath.satisfies[0].val, "TestNode", "two-step path should have correct want satisfied");

			// Test one-step path based on a request.
			ChunkLibrary.reset();
			State.set("x", false);
			wl = Wishlist.create([{condition: "x eq true"}], State);
			ChunkLibrary.add([
				{ id: "alpha", effects: ["set x true"] }
			]);
			nextPath = wl.bestPath(ChunkLibrary);
			assert.deepEqual(nextPath.route, ["alpha"], "request-based path");
			assert.deepEqual(nextPath.satisfies.length, 1, "request path should only show wants satisfied");
			assert.deepEqual(nextPath.satisfies[0].val, "x eq true", "request-based path should have correct want satisfied");

			// Test that request paths stop when Want is satisfied.
			ChunkLibrary.reset();
			State.reset();
			State.set("x", true);
			wl = Wishlist.create([{condition: "x eq false"}], State);
			ChunkLibrary.add([
				{ id: "Node1", effects: ["set x false"], request: {chunkId: "Node2"} },
				{ id: "Node2", effects: ["set z true"], request: {chunkId: "Node3"} },
				{ id: "Node3", content: "..." }
			]);
			nextPath = wl.bestPath(ChunkLibrary);
			assert.deepEqual(nextPath.route, ["Node1"], "request-based path doesn't need to go to leaf nodes that don't satisfy useful wants");
			assert.deepEqual(nextPath.satisfies.length, 1, "request path should only show original wants satisfied");

			// Test that conditions restrict valid paths.
			ChunkLibrary.reset();
			State.reset();
			State.set("jokesTold", 3);
			State.set("location", 10);

			wl = Wishlist.create([{condition: "jokesTold gte 4"}], State);
			ChunkLibrary.add([
				{ id: "Node1", effects: ["decr jokesTold 1"], content: "..." },
				{ id: "Node2", effects: ["incr jokesTold 1"], conditions: ["location eq 10"], content: "..." },
				{ id: "Node3", effects: ["incr jokesTold 1"], conditions: ["location eq 5"], content: "..." } 
			]);
			nextPath = wl.bestPath(ChunkLibrary);
			assert.deepEqual(nextPath.route, ["Node2"], "conditions should restrict valid paths");

			// Test choice structure.
			resetTest();

			wl = Wishlist.create([{condition: "x eq 1"}], State);
			ChunkLibrary.add([
				{ id: "Choice1", effects: ["set x 1"], choiceLabel: "..." },
				{ id: "Choice2", effects: ["set x 1"] } 
			]);
			nextPath = wl.bestPath(ChunkLibrary);
			assert.deepEqual(nextPath.route, ["Choice2"], "can't choose a chunk with a choiceLabel unless through a choice");

			resetTest();
			wl = Wishlist.create([{condition: "x eq 1"}], State);
			ChunkLibrary.add([
				{ id: "alpha", content: "What do you choose?", choices: [{chunkId: "Choice1"}, {condition: "z eq 5"}] },
				{ id: "Choice1", choiceLabel: "Choice 1", content: "Result of Choice 1." },
				{ id: "Choice2", choiceLabel: "Choice 2", content: "Result of Choice 2.", effects: ["set z 5", "set x 1"] },
			]);
			nextPath = wl.bestPath(ChunkLibrary);
			assert.deepEqual(nextPath.route, ["alpha", "Choice2"], "can iterate down through choices");
			assert.deepEqual(nextPath.satisfies.length, 1, "'satisfies' should only show original Wants");
			var allPaths = wl.allPaths(ChunkLibrary);
			assert.deepEqual(allPaths.length, 1, "should only find a single path when only one choice can meet an original Want.");

			resetTest();
			wl = Wishlist.create([{condition: "x eq 1"}], State);
			State.set("node2Banned", true);
			ChunkLibrary.add([
				{ id: "Node1", request: {chunkId: "Node2"} },
				{ id: "Node2", request: {chunkId: "Node1"}, conditions: ["node2Banned eq false"], effects: ["set x 1"] },
			]);
			nextPath = wl.bestPath(ChunkLibrary);
			assert.notOk(nextPath, "can't find a path ending in a node with an invalid condition.");

			// Test multiple wants. 
			resetTest();
			State.set("mode", "narration");
			wl = Wishlist.create([{condition: "x eq true"}, {condition: "y eq true"}], State);
			ChunkLibrary.add([
				{ id: "Node1", content: "...", effects: ["set x true", "set q true"] },
				{ id: "Node2", content: "...", effects: ["set y true", "set w true", "set r true"] },
				{ id: "Node3", content: "...", effects: ["set x true", "set y true"] },

			]);
			nextPath = wl.bestPath(ChunkLibrary);
			assert.deepEqual(nextPath.route, ["Node3"], "should pick a path that satisfies as many Wants as possible.");

			wl = Wishlist.create([{condition: "x eq true"}, {condition: "y eq true"}, {condition: "foo eq true"}], State);
			nextPath = wl.bestPath(ChunkLibrary);
			assert.deepEqual(nextPath.route, ["Node3"], "should pick a maximally Want-satisfying path, even if not all wants can be satisfied.");

			resetTest();
			State.set("mode", "narration");
			wl = Wishlist.create([{condition: "x eq true"}, {condition: "y eq true"}], State);
			ChunkLibrary.add([
				{ id: "DirectNode", content: "...", effects: ["set x true"] },
				{ id: "ChoiceNode", content: "...", effects: ["set x true"], choices: [{chunkId: "Result1"}, {chunkId: "Result2"}] },
				{ id: "Result1", choiceLabel: "...", content: "...", effects: ["set q true"] },
				{ id: "Result2", choiceLabel: "...", content: "...", effects: ["set y true"] }
			]);
			nextPath = wl.bestPath(ChunkLibrary);
			assert.deepEqual(nextPath.route, ["ChoiceNode", "Result2"], "should maximize Wants through choice structures.");

			resetTest();
			State.set("mode", "narration");
			wl = Wishlist.create([{condition: "x eq true"}], State);
			ChunkLibrary.add([
				{ id: "Choice1", choices: [{chunkId: "answer1"}] },
				{ id: "answer1", choiceLabel: "..." },
				{ id: "Choice2", choices: [{chunkId: "answer2"}], effects: ["set x true"] },
				{ id: "answer2", choiceLabel: "..." }
			]);
			nextPath = wl.bestPath(ChunkLibrary);
			assert.deepEqual(nextPath.route, ["Choice2"], "Multiple choices should be handled correctly.");

		});

		test("choice labels", function( assert ) {
			var bestPath, wl;

			ChunkLibrary.reset();
			State.reset();
			State.set("mode", "narration");
			wl = Wishlist.create([{chunkId: "TestNode"}], State);
			ChunkLibrary.add([
				{ id: "TestNode", content: "Hello, world!" },
			]);
			bestPath = wl.bestPath(ChunkLibrary);
			assert.notOk(bestPath.choiceDetails, "If the first step in the path is not a choice, should not have a choiceDetails field.");

			ChunkLibrary.reset();
			State.reset();
			State.set("mode", "narration");
			wl = Wishlist.create([{condition: "x eq true"}, {condition: "y eq true"}], State);
			ChunkLibrary.add([
				{ id: "Choice1", effects: ["set x true"], choices: [{chunkId: "answerY"}, {condition: "z eq true"}] },
				{ id: "answerY", choiceLabel: "answerY choiceLabel", effects: ["set y true"] },
				{ id: "answerZ", choiceLabel: "answerZ choiceLabel", effects: ["set z true"]}
			]);
			bestPath = wl.bestPath(ChunkLibrary);
			assert.deepEqual(bestPath.route, ["Choice1", "answerY"], "choiceDetails correct when we recurse into a choice.");
			assert.deepEqual(bestPath.choiceDetails.length, 2, "choiceDetails field should exist and have same length as chunk's choices field");
			assert.deepEqual(bestPath.choiceDetails[0].id, "answerY", "choiceDetails order should match up with chunk's choices array (1/2)");
			assert.deepEqual(bestPath.choiceDetails[1].id, "answerZ", "choiceDetails order should match up with chunk's choices array (2/2)");

			wl = Wishlist.create([{condition: "x eq true"}], State);
			ChunkLibrary.reset();
			ChunkLibrary.add([
				{ id: "Choice1", effects: ["set x true"], choices: [{chunkId: "answerY"}, {condition: "z eq true"}] },
				{ id: "answerY", choiceLabel: "answerY choiceLabel", effects: ["set y true"] },
				{ id: "answerZ", choiceLabel: "answerZ choiceLabel", effects: ["set z true"]}
			]);
			bestPath = wl.bestPath(ChunkLibrary);
			assert.deepEqual(bestPath.route, ["Choice1"], "choiceDetails correct when we don't need to recurse into a choice.");
			assert.deepEqual(bestPath.choiceDetails.length, 2, "choiceDetails field should exist and have same length as chunk's choices field (when no recurse)");
			assert.deepEqual(bestPath.choiceDetails[0].id, "answerY", "choiceDetails order should match up with chunk's choices array when no recurse (1/2)");
			assert.deepEqual(bestPath.choiceDetails[1].id, "answerZ", "choiceDetails order should match up with chunk's choices array when no recurse (2/2)");

			wl = Wishlist.create([{condition: "x eq true"}], State);
			ChunkLibrary.reset();
			ChunkLibrary.add([
				{ id: "Choice1", effects: ["set x true"], choices: [{chunkId: "answerY"}, {condition: "z eq true"}] },
				{ id: "answerY", choiceLabel: "answerY choiceLabel", choices: [{condition: "q eq true"}], effects: ["set y true"] },
				{ id: "answerZ", choiceLabel: "answerZ choiceLabel", effects: ["set z true"]},
				{ id: "NodeQ", choiceLabel: "NodeQ choiceLabel", effects: ["set q true"] }
			]);
			bestPath = wl.bestPath(ChunkLibrary);
			assert.deepEqual(bestPath.choiceDetails.length, 2, "recursing through multiple choices shouldn't affect top-level choiceDetails (1/3)");
			assert.deepEqual(bestPath.choiceDetails[0].id, "answerY", "recursing through multiple choices shouldn't affect top-level choiceDetails (2/3)");
			assert.deepEqual(bestPath.choiceDetails[1].id, "answerZ", "recursing through multiple choices shouldn't affect top-level choiceDetails (3/3)");
		});

		test("allPaths", function( assert ) {
			var allPaths, wl;

			ChunkLibrary.reset();
			State.reset();
			State.set("mode", "narration");
			wl = Wishlist.create([{condition: "x eq true"}], State);
			ChunkLibrary.add([
				{ id: "Node1", effects: ["set x true"] },
				{ id: "Node2", effects: ["set x true"] },
				{ id: "Node3", effects: ["set x true"] },
			]);
			allPaths = wl.allPaths(ChunkLibrary);
			assert.deepEqual(allPaths.length, 3, "allPaths should return right number of paths");
			assert.deepEqual(allPaths[0].satisfies.length, 1, "allPaths should have satisfies of right length");
			assert.deepEqual(allPaths[0].satisfies[0].val, "x eq true", "allPaths should return paths with right 'satisfies'");

			ChunkLibrary.reset();
			State.reset();
			wl = Wishlist.create([{condition: "x eq true"}], State);
			ChunkLibrary.add([
				{ id: "Node1", content: "...", choices: [{chunkId: "Node2"}, {chunkId: "Node3"}], effects: ["set x true"] },
				{ id: "Node2", content: "...", choiceLabel: "...", effects: ["set x true"] },
				{ id: "Node3", content: "...", choiceLabel: "..." }
			]);
			allPaths = wl.allPaths(ChunkLibrary);
			assert.deepEqual(allPaths.length, 1, "setting up test");
			assert.deepEqual(allPaths[0].satisfies.length, 1, "duplicate effects shouldn't change 'satisfies' size");
		});

		test("missing choices", function( assert ) {
			var bestPath, wl;
			
			ChunkLibrary.reset();
			State.reset();
			State.set("mode", "narration");
			wl = Wishlist.create([{chunkId: "Choice1"}], State);
			ChunkLibrary.add([
				{ id: "Choice1", choices: [{condition: "x eq true"}, {condition: "y eq true"}] },
				{ id: "AnswerX", effects: ["set x true"], choiceLabel: "..." }
			]);
			bestPath = wl.bestPath(ChunkLibrary);
			assert.deepEqual(bestPath.route, ["Choice1"], "A missing choice request shouldn't affect a matching path to that choice.");
			assert.deepEqual(bestPath.choiceDetails.length, 2, "A missing choice request shouldn't affect the number of choiceDetails objects returned.");
			assert.deepEqual(bestPath.choiceDetails[0].id, "AnswerX", "A missing choice request shouldn't affect the non-missing choice.");
			assert.deepEqual(bestPath.choiceDetails[1].missing, true, "A missing choice request should have a choiceDetails where missing is true.");
			assert.notOk(bestPath.choiceDetails[1].id, "A missing choice request should not have an id field.");

			ChunkLibrary.reset();
			State.reset();
			State.set("mode", "narration");
			wl = Wishlist.create([{chunkId: "Node1"}], State);
			ChunkLibrary.add([
				{ id: "Node2", content: "..." }
			]);
			bestPath = wl.bestPath(ChunkLibrary);
			assert.notOk(bestPath, "Should return no path if a valid node can't be found by ID.");
			wl = Wishlist.create([{condition: "x eq true"}], State);
			bestPath = wl.bestPath(ChunkLibrary);
			assert.notOk(bestPath, "Should return no path if a valid node can't be found by condition.");

			ChunkLibrary.reset();
			State.reset();
			State.set("mode", "narration");
			wl = Wishlist.create([{condition: "x eq true"}], State);
			ChunkLibrary.add([
				{ id: "Choice1", choices: [{chunkId: "Fake1"}, {chunkId: "Fake2"}], effects: ["set x true"] },
				{ id: "Choice2", choices: [{chunkId: "NodeP"}], effects: ["set x true"] },
				{ id: "NodeP", content: "...", choiceLabel: "..." }
			]);
			bestPath = wl.bestPath(ChunkLibrary);
			assert.deepEqual(bestPath.route, ["Choice2"], "We should prefer a path with available options over one without.");

		});

		test("max_depth", function( assert ) {
			var bestPath, wl;

			ChunkLibrary.reset();
			State.reset();
			State.set("mode", "narration");
			wl = Wishlist.create([{condition: "x eq true"}], State);
			ChunkLibrary.add([
				{ id: "Chunk1", choices: [{chunkId: "Chunk2"}] },
				{ id: "Chunk2", choiceLabel: "...", choices: [{chunkId: "Chunk3"}] },
				{ id: "Chunk3", choiceLabel: "...", effects: ["set x true"] }
			]);
			bestPath = wl.bestPath(ChunkLibrary, {max_depth: 4});
			assert.deepEqual(bestPath.route, ["Chunk1", "Chunk2", "Chunk3"], "Should find route if max_depth is more than required.");
			bestPath = wl.bestPath(ChunkLibrary, {max_depth: 3});
			assert.deepEqual(bestPath.route, ["Chunk1", "Chunk2", "Chunk3"], "Should find route if max_depth is exactly enough.");
			bestPath = wl.bestPath(ChunkLibrary, {max_depth: 2});
			assert.notOk(bestPath, "Should fail to find route if max_depth is not deep enough.");


		});

		test("order", function( assert ) {
			var bestPath, allPaths, wl;

			ChunkLibrary.reset();
			State.reset();
			State.set("mode", "narration");
			wl = Wishlist.create([{condition: "x eq true"}, {condition: "y eq true", order: "first"}, {condition: "z eq true"}], State);
			ChunkLibrary.add([
				{ id: "Chunk1", content: "...", effects: ["set x true"] },
				{ id: "Chunk2", content: "...", effects: ["set y true"] },
				{ id: "Chunk3", content: "...", effects: ["set z true"] }
			]);
			bestPath = wl.bestPath(ChunkLibrary);
			assert.deepEqual(bestPath.route, ["Chunk2"], "Should satisfy an order: first Want before any others.");

			wl = Wishlist.create([{condition: "x eq true", order: "last"}, {condition: "y eq true"}], State);
			bestPath = wl.bestPath(ChunkLibrary);
			assert.deepEqual(bestPath.route, ["Chunk2"], "Should satisfy an order: last Want after any others.");

			wl = Wishlist.create([{condition: "x eq true", order: 2}, {condition: "y eq true", order: 1}], State);
			bestPath = wl.bestPath(ChunkLibrary);
			assert.deepEqual(bestPath.route, ["Chunk2"], "Should satisfy numerical orders with lower values first.");

			wl = Wishlist.create([{condition: "x eq true", order: 1}, {condition: "y eq true", order: 2}, {condition: "z eq true", order: "first"}], State);
			bestPath = wl.bestPath(ChunkLibrary);
			assert.deepEqual(bestPath.route, ["Chunk3"], "Should satisfy order: first before any numeric orders.");

			wl = Wishlist.create([{condition: "x eq true", order: "last"}, {condition: "y eq true", order: 1}], State);
			bestPath = wl.bestPath(ChunkLibrary);
			assert.deepEqual(bestPath.route, ["Chunk2"], "Should satisfy order: last after any numeric orders.");

			wl = Wishlist.create([{condition: "x eq true"}, {condition: "y eq true", order: 5}], State);
			allPaths = wl.allPaths(ChunkLibrary);
			assert.deepEqual(allPaths.length, 2, "If only one numeric order, no preference between that and a standard Want.");

			wl = Wishlist.create([{condition: "x eq true"}, {condition: "y eq true", order: 5}, {condition: "z eq true", order: 5}], State);
			allPaths = wl.allPaths(ChunkLibrary);
			assert.deepEqual(allPaths.length, 3, "If multiple numeric orders with same value, no preference between those and a standard Want.");

			wl = Wishlist.create([{condition: "x eq true"}, {condition: "y eq true", order: 1}, {condition: "y eq true", order: 2}], State);
			bestPath = wl.bestPath(ChunkLibrary);
			assert.deepEqual(bestPath.route, ["Chunk2"], "If multiple different numeric orders, prioritize lowest-valued one.");

		});

		test("shortest", function( assert ) {

			var bestPath, allPaths, wl;

			ChunkLibrary.reset();
			State.reset();
			State.set("mode", "narration");
			wl = Wishlist.create([{condition: "x eq true"}], State);
			ChunkLibrary.add([
				{ id: "shortest_Chunk1", content: "...", choices: [{condition: "x eq true"}] },
				{ id: "shortest_Chunk2", content: "...", choices: [{condition: "x eq true"}] },
				{ id: "shortest_Chunk3", content: "...", effects: ["set x true"], choiceLabel: "..." }
			]);

			wl.logOn();
			bestPath = wl.bestPath(ChunkLibrary);
			assert.deepEqual(bestPath.route, ["shortest_Chunk1", "shortest_Chunk3"], "Shouldn't unneccesarily route through nodes.");

		});		

	}

	return {
		run: run
	}
});