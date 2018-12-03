/* Implements a Want for StoryAssembler.

A want is a Request with associated metadata.
*/

define(["Request", "Validate", "Templates", "util", ], function(Request, Validate, Templates, util) {

	var requiredFields = [];
	var optionalFields = ["condition", "chunkId", "order", "persistent"];

	/* When passed a specification for a Want object, returns a valid Want or throws an error if the specification is invalid.

	A Want specification should look like either this...
	{
		condition: "x gt 5"
	}
	...or this...
	{
		chunkId: "someSpecificChunk"
	}
	... and in either case can optionally have an "order" field (which can be numeric, "first", or "last").
	Note that this is the same format as valid Wants, except that instead of condition or chunkId there will be a 'request' field that is a Request object (see the Request module).
	*/
	var create = function(rawWant) {

		var want = {};			//create base object for our formatted Want

		for (var key in rawWant) {			//if it's a string, run templating on it
			if (typeof rawWant[key] == "string") {
				want[key] = Templates.render(rawWant[key], undefined, "want"); 
			}
		}
		Validate.check(want, requiredFields, optionalFields);			//validate new string is correct

		if (rawWant.condition) {		//if it is a request by condition, format it
			try {
				want.request = Request.byCondition(rawWant.condition, rawWant.persistent);
				//delete want.condition;
			} catch(e) {
				throw new Error("Could not create a Want with invalid condition: " + e);
			}
		}
		else if (rawWant.chunkId) {
			try {
				want.request = Request.byId(rawWant.chunkId, rawWant.persistent);
				//delete want.chunkId;
			} catch(e) {
				throw new Error("Could not create a Want with invalid chunkId: " + e);
			}
		} else {
			throw new Error("A Want must be created with either a 'chunkId' or a 'request' field.");
		}

		want.id = util.iterator("wants");
		if (rawWant.order) {
			if (rawWant.order === "first") {
				want.order = Number.NEGATIVE_INFINITY;
			} else if (rawWant.order === "last") {
				want.order = Number.POSITIVE_INFINITY;
			} else {
				var invalidNumber = (typeof rawWant.order === "number" && rawWant.order < 0 && rawWant.order !== Number.NEGATIVE_INFINITY);
				if (invalidNumber || typeof rawWant.order !== "number") {
					throw new Error("Could not create Want with invalid order '" + want.order + "': must be 'first', 'last', or an integer >= 0.");
				}
			}
		}

		return want;
	}

	return {
		create: create
	}
});	