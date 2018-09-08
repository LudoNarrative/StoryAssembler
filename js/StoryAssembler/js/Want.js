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
	var create = function(want) {

		for (var key in want) {	
			if (typeof want[key] == "string") {
				want[key] = Templates.render(want[key], undefined, "want"); 
			}
		}
		Validate.check(want, requiredFields, optionalFields);

		if (want.condition) {
			try {
				want.request = Request.byCondition(want.condition, want.persistent);
				delete want.condition;
			} catch(e) {
				throw new Error("Could not create a Want with invalid condition: " + e);
			}
		}
		else if (want.chunkId) {
			try {
				want.request = Request.byId(want.chunkId, want.persistent);
				delete want.chunkId;
			} catch(e) {
				throw new Error("Could not create a Want with invalid chunkId: " + e);
			}
		} else {
			throw new Error("A Want must be created with either a 'chunkId' or a 'request' field.");
		}

		want.id = util.iterator("wants");
		if (want.order) {
			if (want.order === "first") {
				want.order = Number.NEGATIVE_INFINITY;
			} else if (want.order === "last") {
				want.order = Number.POSITIVE_INFINITY;
			} else if ((typeof want.order === "number" && want.order < 0) || typeof want.order !== "number") {
				throw new Error("Could not create Want with invalid order '" + want.order + "': must be 'first', 'last', or an integer >= 0.");
			}
		}

		return want;
	}

	return {
		create: create
	}
});	