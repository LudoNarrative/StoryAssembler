/* global test, QUnit */
"use strict";
define(["../State"], function(State) {
	
	var run = function() {
		QUnit.module( "State Module tests" );
		test("getting and setting", function( assert ) {
			
			State.set("testNum", 5);
			assert.deepEqual(State.get("testNum"), 5, "number set/get");
			
			State.set("testStr", "alpha");
			assert.deepEqual(State.get("testStr"), "alpha", "string set/get");

			State.set("testNum", 12);
			assert.deepEqual(State.get("testNum"), 12, "updating number value");

			State.set("testNum", "12");
			assert.deepEqual(State.get("testNum"), 12, "strings that look like numbers should become numbers");

			State.set("testBool", true);
			assert.deepEqual(State.get("testBool"), true, "true booleans");
			State.set("testBool", false);
			assert.deepEqual(State.get("testBool"), false, "false booleans");

			assert.deepEqual(State.get("notARealValue"), undefined, "getting something nonexistent should return undefined");
		});

		test("conditions", function(assert) {
			State.set("testNum", 5);
			assert.ok(State.isTrue("testNum eq 5"), "eq");
			assert.notOk(State.isTrue("testNum neq 5"), "neq");
			assert.ok(State.isTrue("testNum gte 5"), "gte (equal)");
			assert.ok(State.isTrue("testNum gte 4"), "gte (when lesser)");
			assert.notOk(State.isTrue("testNum gte 6"), "gte (when greater)");
			assert.ok(State.isTrue("testNum lte 5"), "lte");
			assert.ok(State.isTrue("testNum gt 4"), "gt");
			assert.ok(State.isTrue("testNum lt 6"), "lt");

			assert.ok(State.isTrue("testNum EQ 5"), "not case sensitive");
			assert.ok(State.isTrue("testNum    EQ    5"), "whitespace doesn't matter");

			assert.ok(State.isTrue("true"), "plain true");
			assert.notOk(State.isTrue("false"), "plain false");

			State.set("testBool", false);
			assert.ok(State.isTrue("testBool eq false"), "eq on booleans");
			assert.ok(State.isTrue("testBool neq true"), "neq on booleans");

			assert.throws(function(){State.isTrue("testNum")}, "param alone invalid");
			assert.throws(function(){State.isTrue("testNum eq")}, "missing val invalid");
			assert.throws(function(){State.isTrue("testNum 4")}, "missing op invalid");
			assert.throws(function(){State.isTrue("testNum eq 5 blank")}, "extra param invalid");
			assert.throws(function(){State.isTrue("testNum foo 5")}, "invalid op");
		});

		test("change", function(assert) {
			State.set("testVal", 5);
			State.change("set testVal 7");
			assert.ok(State.isTrue("testVal eq 7"), "set param val");
			State.change("set testVal alpha");
			assert.ok(State.isTrue("testVal eq alpha"), "set param val (changing type to string)");
			State.change("set testVal true");
			assert.ok(State.isTrue("testVal eq true"), "set param val (changing type to bool)");
			State.set("testVal", 5);
			State.change("incr testVal 6");
			assert.ok(State.isTrue("testVal eq 11"), "incr param val");
			State.change("decr testVal 5");
			assert.ok(State.isTrue("testVal eq 6"), "decr param val");
			State.change("mult testVal 3");
			assert.ok(State.isTrue("testVal eq 18"), "mult param val");
			State.change("mult testVal -2");
			assert.ok(State.isTrue("testVal eq -36"), "negative number");
			State.change("incr testVal 1.5");
			assert.ok(State.isTrue("testVal eq -34.5"), "decimal");

			assert.throws(function(){State.change("incr")}, "op alone invalid");
			assert.throws(function(){State.change("incr testVal")}, "missing val invalid");
			assert.throws(function(){State.change("incr 5")}, "missing var invalid");
			assert.throws(function(){State.change("foobar testVal 5")}, "bad op invalid");
			assert.throws(function(){State.change("incr testVal string")}, "expected number");

		});

		test("wouldMakeMoreTrue (exact matches)", function(assert) {
			State.reset();
			State.set("x", 5);
			assert.ok(State.wouldMakeMoreTrue("incr x 1", "x eq 6"), "wouldMakeMoreTrue for inc");
			assert.deepEqual(State.get("x"), 5, "wouldMakeMoreTrue should not change values");
			assert.notOk(State.wouldMakeMoreTrue("incr x 1", "x lte 5"), "wouldMakeMoreTrue for inc, negated");
			assert.notOk(State.wouldMakeMoreTrue("decr x 1", "x eq 5"), "wouldMakeMoreTrue for decr, checking old value");
			assert.ok(State.wouldMakeMoreTrue("set x -1", "x lt 0"), "wouldMakeMoreTrue for set");
			assert.notOk(State.wouldMakeMoreTrue("set x -1", "x gt 0"), "wouldMakeMoreTrue for set, negated");
			assert.deepEqual(State.get("x"), 5, "wouldMakeMoreTrue should not change values (2)");
			State.set("y", false);
			assert.ok(State.wouldMakeMoreTrue("set x true", "x eq true"), "wouldMakeMoreTrue for booleans (1)");
			assert.notOk(State.wouldMakeMoreTrue("set x true", "x eq false"), "wouldMakeMoreTrue for booleans (2)");
			State.set("y", true);
			assert.ok(State.wouldMakeMoreTrue("set y false", "y eq false"), "wouldMakeMoreTrue for booleans (3)");
			assert.notOk(State.wouldMakeMoreTrue("set y false", "y eq true"), "wouldMakeMoreTrue for booleans (4)");

			assert.notOk(State.wouldMakeMoreTrue("incr z 1", "z eq 1"), "can't relatively change value of non-existent entry");
			assert.ok(State.wouldMakeMoreTrue("set a 2", "a eq 2"), "ok to assign values that don't exist yet");
		});

		test("wouldMakeMoreTrue (incremental change)", function(assert) {
			// Test incremental effects: i.e. when searching for "x gt 3" the effect "incr x 1" should match.
			State.reset();

			// Quick function to simplify testing the truth table defined below. Pass in a condition, and a collection of arrays with an operation to perform and a truth state to expect.
			var check = function() {
				var cond = arguments[0];
				for (var x = 1; x < arguments.length; x++) {
					var op = arguments[x][0];
					var truthState = arguments[x][1];
					assert.deepEqual(State.wouldMakeMoreTrue(op, cond), truthState, "incremental wouldMakeMoreTrue for condition " + cond + ", op " + op);
				}
			}

			State.set("x", 5);

			check("x eq 15", ["incr x 1", true], ["mult x 3", true], ["mult x 4", false], ["decr x 1", false]);
			check("x gt 15", ["incr x 1", true], ["mult x 3", true], ["mult x 4", true], ["decr x 1", false]);
			check("x lt 15", ["incr x 1", true], ["mult x 3", false], ["mult x 4", false], ["decr x 1", true]);
			check("x eq -15", ["incr x 1", false], ["mult x 3", false], ["mult x 4", false], ["decr x 1", true]);

		});

	}

	return {
		run: run
	}
});