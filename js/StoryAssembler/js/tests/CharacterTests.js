/* global QUnit, test */
"use strict";
define(["Character", "State"], function(Character, State) {
	
	var run = function() {
		QUnit.module( "Character Module tests" );
		test("interface", function( assert ) {

			Character.init(State);

			Character.add("mposi", {id: "mposi", name: "Mposi Akinya", age: 49});
			assert.deepEqual(Character.get("mposi")["name"], "Mposi Akinya", "Basic add and get work as expected.")
			assert.deepEqual(Character.get("mposi").id, "mposi", "Id field should be added to object with passed-in key.")
			assert.deepEqual(Character.get("mposi").name, "Mposi Akinya", "Whole object should include passed-in parameters.")
			assert.notOk(Character.get("fake"), "Returns undefined for an undefined character.");
			assert.notOk(Character.add("mposi", {id: "mposi", age: 100}), "Should return false if you try to add an already existing character");
			assert.deepEqual(Character.get("mposi").age, 49, "A failed add should not alter an existing character.")
			Character.remove("mposi");
			assert.notOk(Character.get("mposi"), "Removing character should work.");

			Character.add("mposi", {id: "mposi", name: "Mposi", age: 49});
			Character.add("ndege", {id: "ndege", name: "Ndege", age: 31});
			var allChars = Character.getAllIds();
			assert.deepEqual(allChars.length, 2, "getAll should return correct number of added chars");
			assert.ok(["mposi", "ndege"].indexOf(allChars[0]) >= 0, "keys from all passed-in characters should exist in allChars");

			Character.set("mposi", {"health": "set 1"});
			assert.deepEqual(parseInt(Character.get("mposi").health), 1, "Setting and getting stats should work.");
			assert.deepEqual(parseInt(Character.get("mposi").health), 1, "Should also return each stats as a param.");
			Character.set("mposi", {"health": "incr 2"});
			assert.deepEqual(parseInt(Character.get("mposi").health), 3, "Standard State operators should work.");
			Character.set("ndege", {"strength": "set 5", "wisdom": "set 3"});
			assert.deepEqual(parseInt(Character.get("ndege").strength), 5, "Setting multiple stats should work (1/2).");
			assert.deepEqual(parseInt(Character.get("ndege").wisdom), 3, "Setting multiple stats should work (2/2).");
			// The below test doesn't work because State's syntax currently only handles spaces in a "set" command, not change.
			// Character.set("ndege", {"comment": "set really quite amazing"});
			// assert.deepEqual(Character.get("ndege", "comment"), "really quite amazing", "Set with strings should work.");

			assert.throws(function(){Character.set("fake", {"strength": "set 5"})}, "can't set stats for an undefined character.");
			
		});
	}

	return {
		run: run
	}
});