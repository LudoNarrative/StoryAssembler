/* global test */
"use strict";
define(["../Want"], function(Want) {
	
	var run = function() {
		QUnit.module( "Want Module tests" );
		// TODO: "request" is confusing; should be "condition"?
		test("wants", function( assert ) {
			var want = Want.create({
				condition: "introduceFriend eq true",
				order: "first",
				persistent: true
			});
			assert.deepEqual(want.request.val, "introduceFriend eq true", "request-based want should have a valid request value");
			assert.deepEqual(want.request.type, "condition", "request-based want should have a valid request type");
			assert.deepEqual(want.persistent, true, "want should preserve creation parameters");

			var want2 = Want.create({
				chunkId: "epilogue",
				order: 2
			});
			assert.deepEqual(want2.request.val, "epilogue", "chunkId-based want should have a valid request value");
			assert.deepEqual(want2.request.type, "id", "chunkId-based want should have a valid request type");
			assert.notDeepEqual(want.id, want2.id, "wants should have unique ids.");

			assert.throws(function(){Want.create({})}, "should reject invalid want definition");
			assert.throws(function(){Want.create({id: "test", foo: "bar"})}, "should reject invalid want params");

		});
	}

	return {
		run: run
	}
});