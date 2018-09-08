/* global test */
"use strict";
define(["../Request"], function(Request) {
	
	var run = function() {
		QUnit.module( "Request Module tests" );
		test("requests", function( assert ) {
			var request = Request.byId("alpha");
			assert.deepEqual(request.type, "id", "id request should have right type");
			assert.deepEqual(request.val, "alpha", "id request should ahve right value");

			request = Request.byCondition("param eq 5");
			assert.deepEqual(request.type, "condition", "condition request should have right type");
			assert.deepEqual(request.val, "param eq 5", "condition request should ahve right value");

			assert.throws(function(){Request.byCondition("param fakeop 5")}, "request with malformed condition");

		});
	}

	return {
		run: run
	}
});