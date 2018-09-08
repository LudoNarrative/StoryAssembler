/* global define */
/* 	State Module

	Stores information about the world that the story generator might wish to access or modify.
*/

define(["Condition"], function(Condition) {
	"use strict";

	var Templates;

	var _blackboard = {};	// Internal object, the blackboard itself.

	var init = function(init_Templates) {
		Templates = init_Templates;
	}

	var get = function(key) {
		return _blackboard[key];
	}

	var set = function(key, value) {
		var tryNum = parseFloat(value);
		if (!isNaN(tryNum)) {
			value = tryNum;
		}

		_blackboard[key] = value;

	}

	var remove = function(key) {
		delete _blackboard[key];
	}

	var reset = function() {
		_blackboard = {};
	}


	// Checks a condition against the blackboard.
	var isTrue = function(condition) {

		if (condition.includes("{")) {		//if it has a template, render it
			condition = Templates.render(condition);
		}

		// Parse the condition string; if invalid, will throw an error.
		var conditionParts = Condition.parts(condition);
		var param = conditionParts.param;
		var op = conditionParts.op;

		var valOfParam;
		if (param !== undefined) {
			valOfParam = get(param);
			if (op !== "eq" && op !== "neq" && isNaN(parseFloat(valOfParam))) {
				throw new Error("Tried to perform numeric op '" + op + "' on param '" + param + "' (" + valOfParam + ") but that does not appear to be a number.");
			}
		}

		return Condition.test(conditionParts, valOfParam);

	}

	/*
	 * Makes a change to the state based on a recognized effect string.
	 *
	 * Currently handles:
	 *  - "set PARAM VALUE": Sets a variable to a number or string.
	 *  - "incr PARAM x": Increments a numeric variable by x.
	 *  - "decr PARAM x": Decrements a numeric variable by x.
	 *  - "mult PARAM x": Multiplies a numeric variable by x.
	 */
	var change = function(effect) {

		// Internal function to enforce a certain number of parameters for a given operator.
		var expect = function(num) {
			if (fields.params.length !== num) {
				throw new Error("Invalid number of params for op '" + fields.op + "' (found " + fields.params.length + ", expected " + num + ") in effect '" + effect + "'");
			}
		}
		// Internal function to expect a parameter for a given operator to be a number.
		var expectNum = function(val) {
			if (val === undefined) {
				set(val, 0);
			} else if (isNaN(parseFloat(val))) {
				throw new Error("Expected in effect '" + effect + "' that '" + val + "' would be a number but it was a " + typeof val);
			}
		}
		// Internal function to validate number fields for an operator.
		var validateNumberParams = function() {
			expect(2);
			var oldVal = get(fields.params[0]);
			if (oldVal === undefined) {
				set(fields.param, 0);
				oldVal = 0;
			}
			expectNum(oldVal);
			expectNum(fields.params[1]);
		}

		// Begin "change" function proper. Ensure each recognized effect is formatted properly, then apply it with the "set" function.
		var fields = _getEffectFields(effect);
		switch(fields.op) {
			case "set":
				expect(2);
				set(fields.param, fields.val);
				break;
			case "incr":
				validateNumberParams();
				set(fields.param, get(fields.param) + parseFloat(fields.val));
				break;
			case "decr":
				validateNumberParams();
				set(fields.param, get(fields.param) - parseFloat(fields.val));
				break;
			case "mult":
				validateNumberParams();
				set(fields.param, get(fields.param) * parseFloat(fields.val));
				break;
			default:
				throw new Error("Invalid op '" + fields.op + "' in effect '" + effect + "'");
		}
	}

	// Check if a given effect would make the given condition true, by storing the current blackboard value, running the effect, checking the condition, then restoring the original value. 
	var wouldMakeMoreTrue = function(effect, condition) {

		var fields = _getEffectFields(effect);
		var param = fields.param;
		var fieldsVal = parseInt(fields.val);
		var isNumOp = ["incr", "decr", "mult"].indexOf(fields.op) >= 0;
		var conditionParts = condition.split(" ");
		var conditionParam = conditionParts[0];
		var conditionOp = conditionParts[1];
		var conditionTarget = parseInt(conditionParts[2]);

		var currVal = get(param);

		// Return false if the variables don't match, or we're trying to change a number that doesn't exist on the blackboard.
		if (param !== conditionParam) {
			return false;
		}
		if (currVal === undefined && isNumOp) {
			return false;
		}
		
		// Try performing the effect; save the value, then restore the original.
		change(effect);
		var wouldBeTrue = isTrue(condition);
		var valAfterEffect = get(param);
		set(param, currVal);

		// wouldBeTrue now stores whether this effect would directly make the condition true. If not, we also want to check for the case of incremental progress, i.e. if effect is "incr x 1", condition is "x eq 5", and get(x) is 1, we should also return true. But only bother to check for a numeric operation, because strings or booleans don't have a notion of "closer" or "farther" to a target.
		if (!wouldBeTrue && isNumOp) {

			var isEmbiggeningOp = fields.op === "incr" || fields.op === "mult";
			var conditionOpLteOrEq = conditionOp === "lte" || conditionOp === "eq";

			// If this operation will make the value larger...
			if ((isEmbiggeningOp && fieldsVal > 0) || (!isEmbiggeningOp && fieldsVal < 0)) {
				// ... and we're not EXCEEDING the constraint specified in the conditional operator, then yes, we're closer.
				if (conditionOp === "gte" || conditionOp === "gt") {
					wouldBeTrue = true;
				} else if ((conditionOp === "lte" || conditionOp === "eq") && valAfterEffect <= conditionTarget) {
					wouldBeTrue = true;
				} else if (conditionOp === "lt" && valAfterEffect < conditionTarget) {
					wouldBeTrue = true;
				}  

			// Otherwise, if this operation will make the value smaller... 
			} else {
				// ... and we're not SMALLER THAN the constraint specified in the conditional operator, then yes, we're closer. (This bit is basically same, but with the comparators reversed.)
				if (conditionOp === "lte" || conditionOp === "lt") {
					wouldBeTrue = true;
				} else if ((conditionOp === "lte" || conditionOp === "eq") && valAfterEffect >= conditionTarget) {
					wouldBeTrue = true;
				} else if (conditionOp === "lt" && valAfterEffect > conditionTarget) {
					wouldBeTrue = true;
				}  
			}
		}

		return wouldBeTrue;
	}

	// Same as wouldMakeMoreTrue, except returns true if any effects in the given array would make the given condition true (stopping as soon as one does)
	var wouldAnyMakeMoreTrue = function(effectArray, condition) {
		for (var i = 0; i < effectArray.length; i++) {
			if (wouldMakeMoreTrue(effectArray[i], condition)) {
				return true;
			}
		}
		return false;
	}

	// Used by the Display module to show the blackboard contents for diagnostic purposes.
	var getBlackboard = function() {
		return _blackboard;
	}

	// Utility function to break an effect string (like "set x 5") into an object with named components (like {op: "set", param: "x", val: "5"})
	var _getEffectFields = function(effect) {
		var fields = {};
		var params = effect.replace(/\s\s+/g, " ").split(" ");
		fields.op = params.splice(0, 1)[0];
		var val = params[1];
		if (val === "true") val = true;
		if (val === "false") val = false;
		fields.val = val;
		fields.param = params[0];
		fields.params = params;
		return fields;
	}

	var setPlaythroughData = function(textId, choices) {

		if (get("displayType") !== "editor") {
			//set current scene
			localStorage.setItem('playthroughScene', get("currentScene")); 

			var pageData = {};
			pageData.textId = textId;
			pageData.choices = choices;
			pageData.time = new Date().getTime();

			//parse out existing data for addition of new data, or make new array if it doesn't exist
			var temp = JSON.parse(localStorage.getItem('playthroughData'));
			if (temp == null) { temp = []; }

			temp.push(pageData);		//add new data

			localStorage.setItem('playthroughData', JSON.stringify(temp));			//put back in localStorage
		}
	}

	return {
		init: init,
		get: get,
		set: set,
		remove: remove,
		reset: reset,
		change: change,
		isTrue: isTrue,
		wouldMakeMoreTrue: wouldMakeMoreTrue,
		wouldAnyMakeMoreTrue: wouldAnyMakeMoreTrue,
		getBlackboard: getBlackboard,
		setPlaythroughData : setPlaythroughData
	}
});