/* BestPath module for StoryAssembler.

Find the path through a library of chunks that maximally satisfies Wants on the wishlist. The two primary functions are allPaths (for every path satisfying any wishlist item) and bestPath (for the single best path).

Note that not everything in "satisfies" will necessarily come to pass: our path might lead through a choice, for instance, but at run time the player selects a different choice. We will really only use the first node in "route" to move the state forward, but we return the whole path in case the rest of the system wants it for some other purpose (such as diagnostics).

The returned path will be an object in the form:
{
	route: [], // array of strings (chunkIDs), each step of the path
	satisfies: [] // every Want object that this path satisfies. order is not important.
	choiceDetails: [] // optional: see below
}

** choiceDetails **
If route[0] has a choice, we need to preserve the ID of a chunk that was found to satisfy each possible choice, so when we're displaying route[0] we know how to label each choice and what it should lead to. The order in the choiceDetails array will match the order that choices are declared in route[0]. 

Each entry in a choiceDetails array will be an object with either the field 'id' (storing the name of a matching chunk), or the fields 'missing' with value true, and 'requestVal' with the choice's request that was unable to be satisfied (i.e. "x gt 5" if we could find no path to a chunk with an effect satisfying that request).

For reference, a Want object (defined in Want.js) is in the form:
{
	request: a Request object, with fields 'type' ("id" or "condition") and 'val'
	optional other fields such as order, mandatory
}

The "logOn" and "logOff" functions can be called to turn on detailed console logging of the pathfinding process.
*/

define(["Request", "util", "Character", "underscore"], function(Request, util, Character, underscore) {

	var DEFAULT_MAX_DEPTH = 3; // The maximum length of a path, unless "max_depth" is passed in to a function below as a parameter. Raising this too high has severe performance impacts.

	// Module-level reference variables
	var curr_max_depth;
	var chunkLibrary; 
	var State;

	// The usual entry function: does setup, calls allPaths to gets the set of all possible paths that satisfy at leat one Want from the list, and returns the best candidate, or undefined if no paths found.
	var bestPath = function(wants, params, _chunkLibrary, _State) {

		var paths = allPaths(wants, params, _chunkLibrary, _State);
		if (paths.length > 0) {
			return chooseFromPotentialPaths(paths, wants, _chunkLibrary, _State);
		} else {
			return undefined;
		}
	}

	// Another possible entry function, for if we want to return the list of all possible paths. (And used internally by bestPath above.)
	var allPaths = function(wants, params, _chunkLibrary, _State) {
		if (_chunkLibrary) chunkLibrary = _chunkLibrary;
		if (_State) State = _State;
		curr_max_depth = params.max_depth ? params.max_depth : DEFAULT_MAX_DEPTH;

		// Turn each object in the wants array into just the object for the actual request: the search doesn't need to know about metadata like order etc. 
		var requests = wants.map(function(want) {
			return want.request;
		});

		return searchLibraryForPaths(requests, false, [], params, 1);
	}

	// Given a set of paths, choose the path that maximally satisfies Wants.
	// We are assuming the only Wants listed are those in our original list.
	var chooseFromPotentialPaths = function(paths, wants, _chunkLibrary, _State) {

		var bestPos = -1;
		var bestSpeakerScore = -1;
		paths = cullByWantOrder(paths, wants); // eliminate paths that ordering constraints make impossible
		
		paths.sort(function(a,b) {		//descending order, satisfies most to satisfies least
			return b.satisfies.length - a.satisfies.length;
		});
		
		var cutoffLength = typeof paths[0] !== "undefined" ? paths[0].satisfies.length : 0;		//if paths[0] exists, set to that length, otherwise 0

		for (var x=0; x < paths.length; x++) {		//for each path...
			if (paths[x].satisfies.length < cutoffLength) { break; }			//if it doesn't satisfy as many wants, just stop

			var thisScore = _calcSpeakerScore(paths[x], _chunkLibrary, _State);		//add in the score from speaker (paths written for current speaker score higher)

			if (thisScore > bestSpeakerScore) {
				bestSpeakerScore = thisScore;
				bestPos = x;
			}
		}
		
		return paths[bestPos];
	}

	//helper function...calculates the speaker score. Penalizes choices written for other characters than current one desired
	var _calcSpeakerScore = function(thePath, _chunkLibrary, _State) {
		var speakerScore = 0;

		if (typeof _chunkLibrary.get(thePath.route[0]).speaker !== "undefined") {		//if the speaker for the chunk is good, add a point
			if (_chunkLibrary.get(thePath.route[0]).speaker == Character.getBestSpeaker(_State) ) {
				speakerScore++;
			}
		}
		else { speakerScore++; }		//if there's no speaker, add a point because we can cast it how we want

		if (typeof thePath.choiceDetails !== "undefined") {			//if there are options...
			var optionPoints = 1 / thePath.choiceDetails.length;		//we'll give 1/n points, where n is # of choices

			for (var y=0; y < thePath.choiceDetails.length; y++) {			//for each of the choices in each path...
				var theChoiceSpeaker;
				theChoiceSpeaker = _chunkLibrary.get(thePath.choiceDetails[y].id).speaker;		//grab a speaker if it has one
				if (!theChoiceSpeaker) {				//if it doesn't have one...
					var bestSpeaker = Character.getBestSpeaker(_State,1);		//make one
					if (bestSpeaker == theChoiceSpeaker) {
						speakerScore += optionPoints;
					}
				}
				else { speakerScore += optionPoints; }		//if it isn't defined, give it points because we can cast it ourselves
			}
		}
		return speakerScore;
	}

	// Cull paths based on the "order" field of wishlist wants. 
	var cullByWantOrder = function(paths, wants) {

		// If there are any wants with order "first", we simply return only those paths.
		var firstWants = underscore.where(wants, {order: Number.NEGATIVE_INFINITY});
		if (firstWants.length > 0) {
			var prunedPaths = pathsPrunedToWants(paths, firstWants.map(function(want){
				return want.request;
			}));
			if (prunedPaths.length == 0) { console.log("Warning! we have 'firstWants' but no paths satisfy those wants!", firstWants); }
			return prunedPaths;
		}
		
		// If there are at least two wants with different numeric orders, return only the wants with the lowest defined order number. Done!
		var orderIndex = {};
		wants.forEach(function(want, pos) {
			if (typeof want.order === "number" && want.order >= 0 && want.order !== Number.POSITIVE_INFINITY) {
				if (!orderIndex[want.order]) {
					orderIndex[want.order] = [];
				}
				orderIndex[want.order].push(pos);
			}
		});
		var uniqueOrderNumsFound = Object.keys(orderIndex).sort();
		if (uniqueOrderNumsFound.length >= 2) {
			var culledWants = [];
			orderIndex[uniqueOrderNumsFound[0]].forEach(function(wantsPos) {
				culledWants.push(wants[wantsPos]);
			});
			return pathsPrunedToWants(paths, culledWants.map(function(want){
				return want.request;
			}));
		}

		// If there are some (but not all) wants with order "last", return everything that's not "last".
		var nonLastWants = underscore.filter(wants, function(want) {
			return want.order !== Number.POSITIVE_INFINITY;
		});
		if (nonLastWants.length > 0) {
			return pathsPrunedToWants(paths, nonLastWants.map(function(want){
				return want.request;
			}));
		}

		// No order-based culling necessary. If we have a mixture of wants with a single numeric order and unordered wants, the numeric order is not prioritized above or below the unlabeled ones. (Numbers can only be compared to each other.)
		return paths;
	}


	/* 
	Returns paths from searching in the chunk library. allPaths calls this to begin the search, and it's also called in findValidPaths to begin recursion.
	params:
		-wants : a list of wants needing to be satisfied
		-okToBeChoice : the parent of whatever spawned this function call has choice fields
		-skipList : list of chunks not to consider (to avoid infinite loops)
		-rLevel : recursion depth (increases when we iterate into populating choices for chunks)
	*/
	var searchLibraryForPaths = function(wants, okToBeChoice, skipList, params, rLevel) {

		var paths = [];
		var keys = chunkLibrary.getKeys();

		log(rLevel, "searchLibraryForPaths. wants is [" + getWantVals(wants) + "] and we are skipping [" + skipList + "]. rLevel " + rLevel);

		// Small internal function to do a search and add any unique results.
		var doSearchFromHere = function(chunkId) {
			var chunk = chunkLibrary.get(chunkId, "refresh");
			var result = findAllSatisfyingPathsFrom(chunk, wants, skipList, rLevel);
			if (result.length > 0) {
				paths = addNewIfUnique(paths, result);
			} 
		}

		// Either do a search starting from a given chunk, or look through every chunk in the library.
		if (params.startAt) {
			log(rLevel, "b/c params.startAt, starting at " + params.startAt);
			doSearchFromHere(params.startAt);
		} else {
			keys.forEach(function(key) {
				if (chunkOkToSearch(key, skipList, okToBeChoice, rLevel)) {
					doSearchFromHere(key);
				}
			});
		}

		// Return all discovered paths.
		log(rLevel, "finished searchLibraryForPaths for wants: [" + getWantVals(wants) + "] and skipList [" + skipList + "].");
		return paths;
	}

	// Make sure it's currently OK to recurse into a chunk.
	var chunkOkToSearch = function(chunkId, skipList, okToBeChoice, rLevel) {

		var updateDebugObj = function(valid, reason) {			//adds info to validChunks (for graph viz)
			if (rLevel == 1) {
				var temp = State.get("validChunks");
				if (typeof temp == "undefined") { temp = []; }
				var tempObj = {'chunkId': chunkId, 'valid': valid, 'reason': reason}
				State.set("validChunks", temp.concat([tempObj]));
			}
		}
		var chunk = chunkLibrary.get(chunkId);

		if (!chunk) { return false; }	//if it's not in the chunkLibrary, it's not valid

		// --> shouldn't be blacklisted.
		if (skipList.indexOf(chunk.id) >= 0) {
			var msg = "skipping '" + chunk.id + "' b/c it's on skiplist";
			log(rLevel, msg);
			updateDebugObj(false, msg);
			return false;
		}
		// --> conditions should allow it given the current State.
		if (chunk.conditions && chunk.conditions.length > 0) {
			var shouldContinue = false;
			var badCondition;
			for (var j = 0; j < chunk.conditions.length; j++) {
				if (!State.isTrue(chunk.conditions[j])) {
					shouldContinue = true;				
					badCondition = chunk.conditions[j];
				}
			}
			if (shouldContinue) {
				var msg = "skipping '" + chunk.id + "' because the condition " + badCondition + " contradicts current State.";
				log(rLevel, msg);
				updateDebugObj(false, msg);
				return false;
			}
		}
		// --> response to a choice only allowed if prior node was a choice.
		if (chunk.choiceLabel && (!okToBeChoice)) {
			var msg = "skipping '" + chunk.id + "' b/c has a choiceLabel field";
			log(rLevel, msg);
			updateDebugObj(false, msg);
			return false;
		}

		if (okToBeChoice && typeof chunk.choiceLabel == "undefined") {
			var msg = "skipping '" + chunk.id + "' b/c it's not a choice and we're looking for one";
			log(rLevel, msg);
			updateDebugObj(false, msg);
			return false;
		}
		updateDebugObj(true, "");
		return true;
	}

	// Returns paths from searching a single valid chunk in the library.
	var findAllSatisfyingPathsFrom = function(chunk, originalWants, skipList, rLevel) {
		var paths = [];
		var pathToHere;
		log(rLevel, "findAllSatisfyingPaths starting from '" + chunk.id + "' and satisfying wants: " + getWantVals(originalWants));
		
		var unsatisfiedWants = [];
		var gotoFlag = false;
		
		//if there's a goto want, fulfill that and ignore all other wants
		originalWants.forEach(function(want) { 	
			//if (want.type === "goto" && chunk.id === want.val) {		//it used to be this?? Not sure why the chunk.id of what we're looking for is the chunk we're on?
			if (want.type === "goto") { 
				gotoFlag = true;
				pathToHere = createPathOrAddWant(pathToHere, want.val, want);
				log(rLevel, "-->goto matches '" + want.val + "' so going with that and stopping.");
			}
		});	

		// Otherwise, determine: does this chunk directly make one or more Wants true, or make progress towards one of them being true?
		if (!gotoFlag) {
			originalWants.forEach(function(want) {		//for each original want...
				var satisfied = false;
				if (want.type === "id") {			//if the type is id, if the id matches it satisfies
					satisfied = (chunk.id === want.val);
					if (satisfied) log(rLevel, "-->id makes '" + want.val + "' true");
				} 
				else {					//if condition, then if an effect makes it true, then it satisfies
					if (chunk.effects) {
						satisfied = State.wouldAnyMakeMoreTrue(chunk.effects, want.val);
					}
					if (satisfied) log(rLevel, "-->an effect makes '" + want.val + "' true");
				}

				if (satisfied) {
					pathToHere = createPathOrAddWant(pathToHere, chunk.id, want);
				} else {
					unsatisfiedWants.push(want);
				}
			});
		}

		//log message
		if (unsatisfiedWants.length !== originalWants.length) {
			log(rLevel, "--> remaining wants: " + (unsatisfiedWants.length ? getWantVals(unsatisfiedWants) : "none"));
		} else { log(rLevel, "nothing in " + chunk.id + " directly made any Wants true"); }

		// If we still have unsatisfied wants, check for outgoing nodes; otherwise we can stop here.
		var choiceDetails = [];
		if (unsatisfiedWants.length > 0) { 
			// See if any outgoing nodes can meet any of our wants. If so, add paths for each that start with this node, noting any satisfied Wants discovered along the way.
			if (chunk.request) {
				var req;
				if (chunk.request.type === "id") {
					req = Request.byId(chunk.request.val);
				}
				else if (chunk.request.type === "goto") {
					req = Request.byGoto(chunk.request.val);
				}
				else {
					req = Request.byCondition(chunk.request.val);
				}
				log(rLevel, "We will now search for the request in chunk " + chunk.id + ".");
				var validPaths = searchFromHere(paths, chunk, skipList, req, unsatisfiedWants, pathToHere, rLevel, false);
				if (validPaths.length > 0 && validPaths[0].route) {
					paths = addNewIfUnique(paths, validPaths);
				}
			}
		}
		if (chunk.choices) {
			// Even if we've satisfied all our wants, we need to recurse so we know what nodes this choice leads to.
			log(rLevel, "We will now search through the " + chunk.choices.length + " choice(s) in chunk " + chunk.id + ".");

			populateChoices(chunk, skipList, rLevel, paths, unsatisfiedWants, pathToHere, choiceDetails);

			log(rLevel, "Search through choice(s) of " + chunk.id + " finished.")
		}
		if (paths.length === 0) {
			if (pathToHere) {
				// If nothing beneath this chunk led to a successful path, but this chunk satisfied at least one Want, then the only possible path from this point is a single one-step path to here.
				if (chunk.choices && numChoicesFound(choiceDetails) === 0) {
					log(rLevel, "**>no choices of '" + chunk.id + "' were valid, so we can't count this path as successful.");
					return []; // We can't pick this node because none of the choices were available.
				}
				log(rLevel, "**>no valid descendants of '" + chunk.id + "', but it directly satisfied >= 1 Want, so marking path to here successful: " + pathToStr(pathToHere));
				if (chunk.choices) {
					pathToHere.choiceDetails = choiceDetails;
				}
				return [pathToHere];
			} else {
				return []; // return an empty array to indicate our search was unsuccessful
			}
		} else {
			// Otherwise, we found something and added it to paths.
			paths.forEach(function(path) {
				path.choiceDetails = choiceDetails;
				if (typeof pathToHere !== "undefined") {
					if (typeof pathToHere.satisfies !== "undefined") {
						path.satisfies = path.satisfies.concat(pathToHere.satisfies);		//if pathToHere satisfied things, add that too
					}
				}
			});

			log(rLevel, "**> found these paths: " + pathsToStr(paths));	
			return paths;
		}
	}

// adds choices / choiceDetails to paths object
	var populateChoices = function(chunk, skipList, rLevel, paths, satisfiedWants, pathToHere, choiceDetails) {

		State.set("validChunks", []);
		var choiceSkipList = util.clone(skipList);		//list of choiceIDs that will be in this (used to prevent duplicate choices)

		chunk.choices.forEach(function(choice) {
			var validPaths;
			if (choice.type == "goto") {	//if it's a goto choice, we don't need to recurse, just return
				var missingVal = !chunkOkToSearch(choice.val, skipList, true, rLevel)
				validPaths = [{ 
					route: [chunk.id],
					satisfies: [{type: "goto", val:choice.val}],
					choiceDetails: { missing:missingVal, requestVal: choice.val, id: choice.val }
				}];
			}
			else {
				validPaths = searchFromHere(paths, chunk, choiceSkipList, choice, satisfiedWants, pathToHere, rLevel, true);
			}

			// Each path in validPaths should have a choiceDetails field, even if it didn't meet the Want requirements (so we know what choice labels to print when displaying the choice).
			var newChoiceDetails;
			if (!util.isArray(validPaths[0].choiceDetails)) { newChoiceDetails = validPaths[0].choiceDetails; } 
			else { newChoiceDetails = validPaths[0].choiceDetails[0]; }

			if (typeof newChoiceDetails == "undefined") {
				return undefined;
			}
			choiceDetails.push(newChoiceDetails);
			choiceSkipList.push(newChoiceDetails.id);

			if (validPaths.length > 0 && validPaths[0].route) {
				paths = addNewIfUnique(paths, validPaths);
			}
		});
	}

	var numChoicesFound = function(choiceDetails) {
		var count = 0;
		choiceDetails.forEach(function(d) {
			if (d.id) count += 1;
		});
		return count;
	}

	// Recurse down into a request (either a direct request or a choice request) and return any unique paths found.
	var searchFromHere = function(paths, chunk, skipList, req, wants, pathToHere, rLevel, isChoice) {

		// If we've bottomed out our recursion depth, if we have established that the path to this chunk is valid, then say the set of all valid paths from here is just the path to here. Otherwise, say no valid paths from here.
		if (rLevel >= curr_max_depth) {
			log(rLevel, "hit curr_max_depth " + curr_max_depth + "; stopping here for this path.");
			if (pathToHere === undefined) {
				return [{id: "skipping", choiceDetails: {missing: true, requestVal: req.val}}];
			} else {
				return [pathToHere];
			}
		} 

		var newSkipList = util.clone(skipList);
		return findValidPaths(chunk, newSkipList, req, wants, pathToHere, rLevel, isChoice);
	}

	// Internal function to setup, recurse, and takedown a restricted search through the chunk library.
	// We have a list of Wants we're searching for. In that context, we have a specific Want (req). What we want to do is start a new top-level search for just req; but from the results, we want to abandon any that don't meet one of our original wants.
	var findValidPaths = function(chunk, skipList, req, wants, pathToHereRef, rLevel, isChoice) {

		var validPaths = [];

		// First we'll revise the list of Wants we're looking for to include the additional search parameter.
		var newWants = util.clone(wants);
		newWants.push(req);

		var okToBeChoice = chunk.choices !== undefined;


		// Then we'll temporarily exclude the current node from the search space (to avoid infinite loops/graphs with cycles), and do the search.
		skipList.push(chunk.id);
		var foundPaths = searchLibraryForPaths(newWants, okToBeChoice, skipList, {}, rLevel + 1);
		skipList = util.removeFromStringList(skipList, chunk.id);

		// The only valid paths are those that DID satisfy "req", AND also satisfied at least one original Want.
		log(rLevel, "found " + foundPaths.length + " paths");
		log(rLevel, "We only want paths that satisfy " + req.val + " AND satisfy at least one of these Wants: " + getWantVals(wants));
		validPaths = pathsThatSatisfyReq(foundPaths, req);
		validPaths.sort(function(a, b) { return b.satisfies.length - a.satisfies.length; });	//sort so best one is first

		// If we have any paths at this point, pick one and save the id of the first step in its route, so if this is a choice we'll know what chunk matched.
		var choiceMatch;
		if (isChoice && validPaths.length) {
			choiceMatch = validPaths[0].route[0];
			log(rLevel, "setting choiceMatch to " + choiceMatch);
		}

		if (req.type !== "goto") {		//if the path is a goto we don't care, otherwise try to prune to wants
			validPaths = pathsPrunedToWants(validPaths, wants);
		}
		log(rLevel, "(" + validPaths.length + " are valid)");

		// Link each remaining path to the current node, first ensuring we have a pathToHere obj. I.e. if we're at A and we found a path B->C, we want the path to now be A->B->C.
		if (validPaths.length > 0) {
			if (!pathToHereRef) {
				pathToHereRef = createPathOrAddWant(pathToHereRef, chunk.id);
			}
			validPaths.forEach(function(path) {
				path.route = pathToHereRef.route.concat(path.route);
				path.satisfies = pathToHereRef.satisfies.concat(path.satisfies);
				if (choiceMatch) {
					path.choiceDetails = [{id: choiceMatch}];
				} 
			});
			return validPaths;
		}
		else {
			if (choiceMatch) {
				return [{choiceDetails: {id: choiceMatch}}];
			} else {
				return [{choiceDetails: {missing: true, requestVal: req.val}}]
			}
		}
	}

	// From pathList, eliminate paths that do not satisfy 'req'.
	var pathsThatSatisfyReq = function(pathList, req) {
		var validPaths = [];
		pathList.forEach(function(path) {
			var wantVals = getWantVals(path.satisfies);
			if (wantVals.indexOf(req.val) >= 0) {
				validPaths.push(path);
			} 
		});
		return validPaths;
	}

	// From pathList, remove any wants in the 'satisfies' field that are not in the given 'wants' list. If this removes all wants from a path's 'satisfies' field, remove that path entirely.
	var pathsPrunedToWants = function(pathList, wants) {
		var validPaths = [];
		pathList.forEach(function(path) {

			//determine if one of the wants is a goto (we accept paths from these by default 
			//changed to only accept if none other exist due to incorrectly returning gotos as if they satisfy "first" tagged wishlist items...is this the right way to handle that case???
			var gotoFlag = false;
			path.satisfies.forEach(function(satisfaction) {
				if (satisfaction.type == "goto") { gotoFlag = true; }
			});

			var pathsSatisfyingWants = restrictWantsTo(path.satisfies, wants);
			if (pathsSatisfyingWants.length > 0 || (gotoFlag && validPaths.length == 0)) {		//if it satisfies a want or a goto, add it
				validPaths.push(path);
			}

			/*
			path.satisfies = restrictWantsTo(path.satisfies, wants);
			if (path.satisfies.length > 0 || gotoFlag) {		//if it satisfies a want or a goto, add it
				validPaths.push(path);
			} 
			*/
		});
		return validPaths;
	}

	// wantsList might be [x, y, z]. if targetWants is [y, z], we want to return [y, z]. If targetWants is [q], we want to return [].
	var restrictWantsTo = function(wantsList, targetWants) {
		var newList = [];
		var targetWantVals = getWantVals(targetWants);
		wantsList.forEach(function(want) {
			if (targetWantVals.indexOf(want.val) >= 0) {
				newList.push(want);
			}
		});
		return newList;
	}

	// Take two lists of paths, and return the first list with any unique paths from the second list added. 
	var addNewIfUnique = function(paths, newPaths) {
		newPaths.forEach(function(path1) {
			for (var i = 0; i < paths.length; i++) {
				var path2 = paths[i]
				if (util.arrEqual(path1.route, path2.route)) {
					// path1 is in paths; we can exclude path1.
					return; // from forEach (consider next newPath)
				}
			}
			// not found, so add.
			paths.push(path1);	
		});
		return paths;
	}

	// Take a list of Want objects and return an array of their "val" fields, making it easier to compare two Wants.
	var getWantVals = function(wants) {
		return wants.map(function(want) {
			return want.val;
		})
	}

	// At various points in the search, we may have either a) found a successful path, or b) discovered that an existing path satisfies an additional want. This function handles either case so we don't have to worry about whether the path variable we pass in has been initialized yet.
	var createPathOrAddWant = function(path, id, want) {
		if (!path) {
			path = { 
				route: [id],
				satisfies: want ? [want] : [],
			}
		} else if (want) {
			path.satisfies.push(want);
		}
		return path;
	}

	// Two quick functions to pretty-print paths and lists of paths.
	var pathToStr = function(path) {
		if (!path) return "undefined";
		var msg = path.route.join("->") + " [satisfies " + path.satisfies.map(function(x){return x.val}).join("; ");
		msg += "]";
		return msg;
	}
	var pathsToStr = function(arrOfPaths) {
		return arrOfPaths.map(pathToStr).join(" | ");
	}

	// Basic console logging, handling indentation to track recursion levels.
	var logState = false;
	var logOn = function() {
		logState = true;
	}
	var logOff = function() {
		logState = false;
	}
	var _spaces = "                                                                                                                              ";
	var _spacesPerTab = 5;
	var log = function(rLevel, msg) {
		if (logState) {
			console.log(_spaces.slice(0, (rLevel-1) * _spacesPerTab) + msg);
		}
	}


	// Public interface for BestPath module.
	return {
		bestPath: bestPath,
		allPaths: allPaths,

		logOn: logOn,
		logOff: logOff,
		
		pathToStr: pathToStr,
		pathsToStr: pathsToStr
	}
});