/* Implements a Condition, a string representing a valid query on the State.

	Currently handles condition strings in the form "PARAM op VALUE", "TRUE", or "FALSE".
	"op" is not case sensitive and can be one of the values defined below.

*/

define([], function() {

	var ops = ["eq", "neq", "gte", "lte", "gt", "lt", "incr", "decr"];

	/* Return a condition string as an object with keys param, op, and value.
	"x gt 5" becomes -> { param: "x", op: "gt", val: "5" }
	*/
	var parts = function(condition) {
		// coerce to string
		condition = "" + condition; 

		// tokenize, getting an array of tokens separated by whitespace.
		var conditionParts = condition.replace(/\s\s+/g, " ").split(" ");

		if (conditionParts.length !== 3) {
			if (conditionParts[0].toLowerCase() === "true") {
				return {
					op: "forceTrue",
				}
			} else if (conditionParts[0].toLowerCase() === "false") {
				return {
					op: "forceFalse",
				}
			} else {
				throw new Error("Expected condition in the form 'PARAM OP VALUE' but saw '" + condition + "' which seems to have " + conditionParts.length + " parts.");
			}
		}
		var param = conditionParts[0];
		var op = conditionParts[1].toLowerCase();
		var value = conditionParts[2];
		if (value === "true") value = true;
		if (value === "false") value = false;

		if (ops.indexOf(op) < 0) {
			throw new Error("Found invalid op '" + op + "' in condition '" + condition + "' (valid ops are: " + ops.join(", ") + ")");
		}

		return {
			param: param,
			op: op,
			value: value
		}
	}

	// When given a condition object parsed by parts() above, and a value, return true or false depending on how the condition evaluates with the given value.
	var test = function(conditionParts, value) {
		switch(conditionParts.op) {
			case "forceTrue":
				return true;
			case "forceFalse":
				return false;
			case "eq":
				return value == conditionParts.value;
			case "neq":
				return value != conditionParts.value;
			case "gte":
				return value >= conditionParts.value;
			case "lte":
				return value <= conditionParts.value;
			case "gt":
				return value > conditionParts.value;
			case "lt":
				return value < conditionParts.value;
			case "incr":
				return true;		//should always evaluate to true, since in doing the action it fulfills it?
			case "decr":
				return true;		//should always evaluate to true, since in doing the action it fulfills it?
			default:
				throw new Error("Tried to test condition with op '" + conditionParts.op + "' but this did not seem to be a valid operator.");
		}
	}


	return {
		parts: parts,
		test: test
	}
});	