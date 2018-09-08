/* Implements a Request for StoryAssembler.

A Request is a simple object explaining how to find a path leading to a chunk that will satisfy it.

Requests can be for a chunk with a particular ID, or for a chunk that makes a particular condition true. See the Condition module for a definition of how conditions should be formed.

*/

define(["Condition"], function(Condition) {

	var byId = function(id, persistent) {
		var isPersistent = false;
		if (persistent) { isPersistent = true; }
		return {
			type: "id",
			val: id,
			persistent: isPersistent
		}
	}

	var byGoto = function(id, persistent) {
		return {
			type: "goto",
			val: id
		}
	}

	var byCondition = function(condition, persistent) {
		// If an invalid condition is passed in, calling the Condition.parts() function below will throw an error.
		// We don't actually care about the value of the parsed result in this case, however; just that it's not invalid.
		Condition.parts(condition);
		var isPersistent = false;
		if (persistent) { isPersistent = true; }
		return {
			type: "condition",
			val: condition,
			persistent: isPersistent
		}
	}

	return {
		byId: byId,
		byGoto: byGoto,
		byCondition: byCondition
	}
});	