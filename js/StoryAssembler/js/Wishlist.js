/* Implements a Wishlist for StoryAssembler.

A wishlist is an unordered set of Wants.
*/

define(["Want", "Validate", "BestPath", "util"], function(Want, Validate, BestPath, util) {

	/* Create a new wishlist from the given array of Wants, with its own interface for accessing and modifying the values within. I.e. we'll use it something like this:
		var wl = Wishlist.create(listOfWants, State);
		var path = wl.bestPath();

	Note: We need to pass in a reference to State, rather than including it here, so we don't create a duplicate State by requiring it above.
	*/
	var create = function(items, _State) {
		var State = _State;
		items = items || [];
		var _wants = {};

		// Add the wants passed in to the constructor.
		var want;
		items.forEach(function(item) {

			if (typeof item.condition == "string" || !item.request) {
				want = Want.create(item); // will throw error if any wants in list are invalid
			}
			else {		//if we passed in items that are already wants...
				//Validate.check(item, Want.requiredFields, Want.optionalFields);
				want = item;
			}
			_wants[want.id] = want;
		});

		// Interface functions for the Wishlist.

		var remove = function(id) {
			delete _wants[id];
		}

		var add = function(item) {		//add an item to the wishlist
			var want;
			want = Want.create(item);
			_wants[want.id] = want;
		}

		// Get a random Want from the wishlist. (this is not especially useful except maybe for testing.)
		var getRandom = function() {
			if (wantsRemaining() > 0) {
				return _wants[util.oneOf(Object.keys(_wants))];
			}
			return undefined;
		}

		var wantsRemaining = function() {
			return Object.keys(_wants).length;
		}

		var wantsAsArray = function() {
			var keys = Object.keys(_wants);
			var arr = [];
			keys.forEach(function(key) {
				arr.push(_wants[key].request);
			});
			return arr;
		}
		var fullWantsAsArray = function() {
			var keys = Object.keys(_wants);
			var arr = [];
			keys.forEach(function(key) {
				arr.push(_wants[key]);
			});
			return arr;
		}

		var bestPath = function(chunkLibrary, params) {
			return BestPath.bestPath(fullWantsAsArray(), params || {}, chunkLibrary, State);
		}
		var allPaths = function(chunkLibrary, params) {
			return BestPath.allPaths(fullWantsAsArray(), params || {}, chunkLibrary, State);
		}

		var removeSatisfiedWants = function() {
			var keys = Object.keys(_wants);
			var wantsSatisfied = [];

			keys.forEach(function(key) {
				if (State.isTrue(_wants[key].request.val) && !_wants[key].persistent) {
					wantsSatisfied.push(_wants[key].request.val);
					delete _wants[key];
				}
			});

			if (wantsSatisfied.length > 0) { State.set("wantsSatisfied", wantsSatisfied); }			//set flag in state that wants were satisfied
			else { State.set("wantsSatisfied", []); }

		}

		var toStr = function() {
			return wantsAsArray().map(function(want) {
				return want.val;
			}).join(", ");
		}

		// Return the wishlist interface.
		return {
			remove: remove,
			add: add,
			getRandom: getRandom,
			wantsRemaining: wantsRemaining,
			toStr: toStr,
			removeSatisfiedWants: removeSatisfiedWants,
			wantsAsArray: wantsAsArray,

			bestPath: bestPath,
			allPaths: allPaths,
			// Let us call BestPath functions on this wishlist.
			pathToStr: BestPath.pathToStr,
			pathsToStr: BestPath.pathsToStr,
			logOn: BestPath.logOn,
			logOff: BestPath.logOff

		}
	}

	return {
		create: create
	}
});	