/* Validation code for StoryAssembler.
  Helper functions to verify that loaded-in data is in the right format.
*/

define(["util"], function(util) {

	// The "check" function is a simple object validator. When given an object and arrays of required and optional fields, will throw an error if the object violates the given specifications, or contains unrecognized fields.
	var check = function(_obj, reqFields, optFields) {

		var obj = util.clone(_obj) || {};

		var missingFields = [];
		reqFields.forEach(function(field) {
			if (obj[field] === undefined) {
				missingFields.push(field);
			}
			delete obj[field];
		});
		if (missingFields.length > 0) {
			throw new Error("Couldn't find required field(s) " + missingFields.join(", "));
		}

		optFields.forEach(function(field) {
			delete obj[field];
		});



		// Ensure we don't have any extra fields
		var remainingKeys = Object.keys(obj);
		if (remainingKeys.length > 0) {
			throw new Error("Unrecognized field(s) " + remainingKeys.join(", "));
		}
	}

	return {
		check: check
	}
});		