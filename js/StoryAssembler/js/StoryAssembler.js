/* Main StoryAssembler Module.
(refactored version)
When beginScene is called, we need to pass in a defined ChunkLibrary, State, and Display module. 
*/

define(["Request", "Templates", "Want", "Wishlist", "Character"], function(Request, Templates, Want, Wishlist, Character) {

	var chunkLibrary;
	//var State;
	var wishlist;
	var StoryDisplay;
	var Display;
	var Coordinator;
	
	var beginScene = function(_wishlist, _chunkLibrary, _State, _StoryDisplay, _Display, _Character, _Coordinator, params) {
		chunkLibrary = _chunkLibrary;
		State = _State;
		StoryDisplay = _StoryDisplay;
		Display = _Display;
		Coordinator = _Coordinator;
		wishlist = _wishlist;
		params = params || {};
		
		StoryDisplay.init(handleChoiceSelection, refreshNarrative);
		continueScene();
	}

	/*
		Continues the scene.
			-optChunkId: a chunk id
			-mode: boolean, will be false if refreshing the view (to pull from whole library)
	*/
	var continueScene = function(optChunkId) {
		
		var bestPath;

		if (typeof State.get("speaker") == "undefined") { State.set("speaker", Character.getBestSpeaker(State, 1, "content")); }
		
		else { 
			/*
			//This would be used if a choiceLabel was a short-hand for the next full text node that expanded it, instead of a stand-alone utterance
			var hardcodedSpeaker = State.get("currentChoices").filter( function(choice) { return choice.chunkId == optChunkId});
			if (hardcodedSpeaker.length > 0) { State.set("speaker", hardcodedSpeaker[0].speaker); }
			else { 
				State.set("speaker", Character.getBestSpeaker(State, 2)); 
			}
			*/
			State.set("speaker", Character.getBestSpeaker(State, 1, "content"));
		}

		//Cases:
		if (optChunkId) {		//optchunkid is defined
		
			//display content field, or ground out request and display that content field (all this should happen in doChunkText)
			displayChunkText(optChunkId);

			var chunk = chunkLibrary.get(optChunkId);	//get data on our chunk to do the check below

			if (chunk.content) {	//if there was no chunk content, it already grounded out recursively and displayed with displayChunkText(), so we shouldn't redo that here
				handleEffects(chunk);			//apply this chunk's effects before running bestPath
				bestPath = getBestPath(chunkLibrary, optChunkId);		//look for path from here

				StoryDisplay.diagnose({
					path: bestPath,
					wishlist: wishlist,
					state: State.getBlackboard()
				});

				if (bestPath) {		//if we found one, handle it
					handleFoundPath(optChunkId, bestPath);
				}

				//if it's ending an interrupt, put a Continue link that triggers the return
				else if (typeof bestPath == "undefined" && typeof chunk.choices !== "undefined" && chunk.choices[0].val === "endInterrupt eq true") {
					//make this a Continue link with a chunk.id of sys_endInterrupt
					var choiceObj = {
						text: "Continue",
						chunkId: "sys_endInterrupt",
						cantChoose: false
					};
					StoryDisplay.addChoice(choiceObj);
					State.set("currentChoices", [choiceObj]);
				}
				
				else {		// otherwise do a blind search
					//console.log("specific search failed, starting general search");
					bestPath = getBestPath(chunkLibrary);		//do a blind search

					if (bestPath) {
						handleFoundPath(optChunkId, bestPath);
					}

					else {
						handleNoPathFound(wishlist.wantsAsArray());
					}
				}
			}
			
		}

		else {	//optchunkid is undefined, so we're trying to continue the scene

			bestPath = getBestPath(chunkLibrary);		//do a blind search

			StoryDisplay.diagnose({
				path: bestPath,
				wishlist: wishlist,
				state: State.getBlackboard()
			});

			if (bestPath) {		//if we find bestPath, then we want to handle the found path (show text, show choices)
				
				displayChunkText(bestPath.route[0]);

				//if displayChunkText didn't populate the text or choices fully, go through and do that
				if ($("#storyArea").html() == "" || $("#choiceArea").html() == "") {	

					var chunk = chunkLibrary.get(bestPath.route[0]);

					handleFoundPath(bestPath.route[0], bestPath);
				}
				
			}
			else {
				handleNoPathFound(wishlist.wantsAsArray());
			}
			
		}

		State.setPlaythroughData(State.get("currentTextId"), State.get("currentChoices"));
		

	}

	var getBestPath = function(chunkLibrary, startingPoint, tempWishlist) {		
	//this function gets best path from the starting point, or if that's not specified, does a blind search 
	//will use initial wishlist by default, but will go off passed in "tempWishlist" if necessary
		//console.log("called getBestPath with chunkLibrary: " + chunkLibrary.getKeys() + " and startingPoint: " + startingPoint);
		if (startingPoint) {
			var temp;
			if (tempWishlist) {	temp = tempWishlist.bestPath(chunkLibrary, {startAt: startingPoint}); }
			else { temp = wishlist.bestPath(chunkLibrary, {startAt: startingPoint}); }

			console.log("bestPath is: " , temp);
			return temp;
		}

		else {
			var temp 
			if (tempWishlist) { temp = tempWishlist.bestPath(chunkLibrary); }
			else { temp = wishlist.bestPath(chunkLibrary); }

			console.log("bestPath is: ", temp);
			return temp;
			//return wishlist.bestPath(chunkLibrary);
		}
	}

	//used to tell the narrative system to refresh
	var refreshNarrative = function() {
		if (typeof State !== "undefined" && State.get("refreshEnabled")) {					//(if State is undefined, we're getting a refreshNarrative event from an intro explain game and shouldn't process)
			//check for interrupt story fragments, and set flag for interrupt if found
			interruptBestPath = getBestPath(chunkLibrary);
			var interruptPossible = false;
			if (typeof interruptBestPath !== "undefined") {
				testChunk = chunkLibrary.get(interruptBestPath.route[0]);		//if we found one, set flag
				if (testChunk.gameInterrupt === true) { interruptPossible = true; }
			}
			
			if (interruptPossible && !State.get("uninterruptable")) {		
				//store current display info to retrieve later, set the flag for interrupted, clear display, and show interrupt fragment
				var resumeChunkInfo = {textId: State.get("currentTextId"), choiceDetails: State.get("currentChoices")}
				State.set("resumeChunkInfo", resumeChunkInfo);
				State.set("uninterruptable", true);
				State.set("interrupted", true);
				StoryDisplay.clearAll();
				continueScene();
			}
			else if (typeof State.get("currentTextId") !== "undefined") { 				//if we didn't find an interrupt fragment, just refresh text display and choices

				StoryDisplay.clearText();
				displayChunkText(State.get("currentTextId"), "refresh");		//continue scene, but draw from whole library (so...refresh)

				newBestPath = getBestPath(chunkLibrary, State.get("currentTextId"));		//grab the best path from here (again)
				if (typeof newBestPath !== "undefined") {
					doChunkChoices(State.get("currentTextId"), newBestPath.choiceDetails, "refresh");
				}
			}
		}
	}

	//used in Diagnostics panel buttons to change a UI var (theVar) by some amount like +1 or -1 (theMod)
	var clickChangeState = function(theVar, theMod) {
		if (theMod[0] == "+") {
			State.set(theVar.varName, State.get(theVar.varName) + 1);
		}
		if (theMod[0] == "-") {
			State.set(theVar.varName, State.get(theVar.varName) - 1);
		}
		Display.setStats("storyStats");			//refresh UI stat display
		refreshNarrative();					//refresh currently displayed chunk in case it's different
		Display.setAvatars();
	}

	var displayChunkText = function(chunkId, mode) {
		var chunkSpeaker;

		mode = mode || "normal";

		var chunk = chunkLibrary.get(chunkId, mode);

		//If the chunk specifies who the speaker should be, use that. Otherwise use the speaker determined 
		//through earlier call to Character.getBestSpeaker
		if (chunk.speaker !== undefined){
			chunkSpeaker = chunk.speaker
			State.set("speaker", chunkSpeaker)
		}
		else { chunkSpeaker = State.get("speaker"); }

		if (Display.avatarMode == "oneMain") { 		//if we're using the mode where you can manually set avatars for each fragment, do that
			State.set("currentAvatar", chunk.avatar);
			Display.setAvatars(); 
		}		

		var text = chunk.content;
		
		if (text !== undefined) { 							//if the chunk has text, display it
			text = Templates.render(text, chunkSpeaker);
			StoryDisplay.addStoryText(text);
			State.set("currentTextId", chunk.id);			//set current text id so we can reference it later
		}
		else {												//if it's making a request for text to display...
			
			var contentRequestWant = Want.create({condition: "dummySetting eq true", order: "first"});		//create a temporary wishlist with that content request
			contentRequestWant.request = chunk.request;
			var tempWishlist = Wishlist.create([contentRequestWant], State);

			bestPath = getBestPath(chunkLibrary, chunkId, tempWishlist);	//grab text from request
			if (!bestPath) {								//if it still isn't known...
				bestPath = getBestPath(chunkLibrary);		//do a blind search
			}
			if (!bestPath) {								//if it's still empty, throw an error
				if (State.get('displayType') !== "editor") {
					throw new Error("Tried to get text for '" + chunkId + "' and it had no content, so we tried to recurse through bestPath, but did not find anything.");
				}
				else { 
					console.log("ENDED EARLY. WISHLIST:",wishlist); 
					endScene(true); }
			}
			else {
				doChunkText(chunkId, bestPath);		//display text from search
			}
			
		}

	}

	var handleNoPathFound = function(wishlistWants) {
		if (wishlistWants.length > 0) {				//if we still have Wants...
			var unsatisfiedWants = false;
			wishlistWants.forEach(function(wish) {	//and they aren't persistent Wants...
				if (!wish.persistent) { unsatisfiedWants = true; }
			});

			if (unsatisfiedWants) {	
				if (gameVersion !== "release") { StoryDisplay.addStoryText("[No path found!]"); } 		//we ended too soon, show error
				else {
					console.log("ENDED EARLY. WISHLISTWANTS:",wishlistWants); 
					endScene(true);
				}
			}			
			else { endScene(); }			//otherwise end the scene
		}
		else {
			endScene();
		}
	}

	var handleFoundPath = function(chunkId, bestPath) {
	
		//var chunkWithText = chunkId ? chunkId : bestPath.route[0];
		doChunkText(chunkId, bestPath);
		doChunkChoices(chunkId, bestPath.choiceDetails);

		// Remove this chunk from consideration, unless it has the 'repeatable' flag.
		if (!chunkLibrary.get(chunkId).repeatable) {
			chunkLibrary.remove(chunkId);
		}
		
	}

	var doChunkText = function(chunkId, bestPath) {
		var chunk = chunkLibrary.get(chunkId);
		State.set("currentTextId", chunkId);			//set current text id so we can reference it later

		// Handle effects
		handleEffects(chunk);

		var chunkForText = chunk;
		var routePos = 0;
		while (!chunkForText.content) {		//find content to display for the chunk
			var nextChunkId = bestPath.route[routePos];

			//TODO: not sure why we have to do this, but if the first entry in the path is the same as the current chunk (sometimes it is) force it to use the next one instead. This is a *really* weird fix and should be de-tangled / gotten rid of
			if (nextChunkId == chunkForText.id) {
				if (routePos+1 <= bestPath.route.length-1) { routePos++; }
				nextChunkId = bestPath.route[routePos];
			}

			chunkForText = chunkLibrary.get(nextChunkId);
			routePos += 1;
			if (chunkForText) {
				if (chunkForText.choices) { continueScene(nextChunkId); } 
				else {
					displayChunkText(chunkForText.id);
					doChunkChoices(chunkForText.id);
					handleEffects(chunkForText);
				}
			} else {
				throw new Error("We started with chunk '" + chunkId + "' and it had no content, so we tried to recurse through bestPath, but did not find anything in the path with content. bestPath was:", bestPath);
			}
		}
	}

	var doChunkChoices = function(chunkId, choiceDetails, mode) {

		mode = mode || "normal";		//mode can be "refresh" driven by state
		var chunk;

		if (mode == "refresh" || mode == "endInterrupt") {
			chunk = chunkLibrary.get(chunkId, "refresh");	
		}
		else {
			chunk = chunkLibrary.get(chunkId);
		}

		//if we're refreshing, and we want to replace / update the choices already in there...
		//(note, if no chunk.choices or choiceDetails, should just be a Continue link already, and we should leave it?)
		if (mode == "refresh" && (chunk.choices !== undefined && choiceDetails !== undefined)) {
			StoryDisplay.clearChoices();
		}

		// Handle choices for all the different cases--------------------------------------------------

		//if we have choices and we're not ending the interrupt, show them
		if (chunk.choices && mode !== "endInterrupt") {
			var choiceObjs = [];		//used to store current choiceObjs in blackboard (for graph reference)
			chunk.choices.forEach(function(choice, pos) {
				// TODO: What to do about choices that can't be met? Remove whole Chunk from consideration? Remove just that choice?

				if (typeof choice.speaker == "undefined") {		//if there's no hard-coded speaker for the choice...
					choice.speaker = Character.getBestSpeaker(State, 1, "choice");
					State.set("speaker", choice.speaker);
				}

				var choiceText = getChoiceText(choiceDetails[pos]);
				choiceText = Templates.render(choiceText, choice.speaker);		//render any grammars in there

				var choiceId = choice.val;
				if (choice.type == "condition") { 
					choiceId = choiceDetails[pos].id //if it's a condition, use the id of the one we fetched	
				}	
				
				var choiceObj = {
					text: choiceText,
					chunkId: choiceId,
					cantChoose: choiceDetails[pos].missing === true,
					persistent: choice.persistent,
					speaker: choice.speaker
				};
				choiceObjs.push(choiceObj);
				StoryDisplay.addChoice(choiceObj);
			});
			State.set("currentChoices", choiceObjs);
		} 

		//if we're ending an interrupt, we have all the info we need
		else if (mode == "endInterrupt") {		
			var choiceObjs = [];		//used to store current choiceObjs in blackboard (for graph reference)
			choiceDetails.forEach(function(choice,pos) {
				choiceObjs.push(choice);
				StoryDisplay.addChoice(choice);
			});
			State.set("currentChoices", choiceObjs);
		}
		//If there's a request, we should find a thing that satisfies it. We only want to go back to the wishlist (stuff below here) if this is truly a dead end.
		else if (wishlist.wantsRemaining() > 0 && mode !== "refresh") {
			// We have finished a path. After clicking this button, since we didn't send a chunkId parameter below, the system will search for a new bestPath given the remaining wishlist items.
			StoryDisplay.addChoice({text: "Continue"});
			var choiceObj = {
				text: "Continue",
				chunkId: "unknown",
				cantChoose: false
			};
			State.set("currentChoices", [choiceObj]);

		} 
		else if (mode !== "refresh") {
			doStoryBreak();
			State.set("currentChoices", []);
			endScene();
		}

		//---------------------------------------------------------------------------------------------------------

		StoryDisplay.diagnose({
			wishlist: wishlist,
			state: State.getBlackboard()
		});
	}

	var allChoicesGotos = function(choices) {		//returns boolean of whether a chunk's choices are all gotos

		if (!choices) { return false }
		var passed = true;
		choices.forEach(function(choice) {
			if (choice.type !== "goto") { passed = false; }
		});
		return passed;
	}

	var getChoiceText = function(choiceDetail) {
		var chunk;

		if (choiceDetail.id) {		//if it has an ID, return the choiceLabel
			var chunk = chunkLibrary.get(choiceDetail.id, "refresh");
			if (chunk.available) { return chunk.choiceLabel; }

			else if (chunk.unavailableChoiceLabel) {			//if it has a label for the choice not being available , return that	
				return chunk.unavailableChoiceLabel;
			}
		} 
			
		else {		//otherwise, return empty?
			//return chunk.choiceLabel;
			return "";
		}
	}

	var handleChoiceSelection = function(choice) {
		StoryDisplay.clearAll();

		//if we're ending the scene, just end it here
		if (choice.chunkId == "sys_endScene") {
			doOutro();
		}
		else if (choice.chunkId == "sys_endInterrupt") {
			State.set("interrupted", false);
			State.set("uninterruptable", false);
			var interruptedFragment = State.get("resumeChunkInfo");
			displayChunkText(interruptedFragment.textId, "refresh");
			doChunkChoices(interruptedFragment.textId, interruptedFragment.choiceDetails, "endInterrupt");
			//reload previous info from interrupt
		}
		else {
			// Continue the scene. If we have a specific chunkId, we'll start our search with that; otherwise if it's undefined, we'll search over the whole library for a new best path.
			continueScene(choice.chunkId);
		}
	}

	var handleEffects = function(chunk) {
		if (!chunk.effects) return;
		chunk.effects.forEach(function(effect) {
			if (effect.indexOf("addWishlist") > -1) {		//if the effect is adding to the wishlist...
				eval("var newWant = " + effect.substring(effect.indexOf("{"), effect.indexOf("}")+1));
				wishlist.add(newWant);
			}
			else if (effect.indexOf("endScene") > -1) {
				endScene();
			}
			else { State.change(effect); }
		});
		wishlist.removeSatisfiedWants();
		//if we're not running tests, update the storyStats on the display
		if (typeof Display !== "undefined") { Display.setStats("storyStats"); }
	}

	var doStoryBreak = function() {
		StoryDisplay.addStoryText("<br><br>");
	}

	// Show the scene is over
	//assemblyFailed: whether we're here because we couldn't assemble a path forward
	var endScene = function(assemblyFailed) {
		
		if (typeof Display !== "undefined" && State.get("displayType") !== "editor") {		//if we're not running tests, display scene outro
			if (!assemblyFailed) {
				State.setPlaythroughData("end", []);	//record last node
				Display.setSceneOutro("<p style='text-align:center'>Chapter complete!</p>");
			}
			else {
				var outroText = Coordinator.loadNoPathFallback(State.get("currentScene"));
				if (outroText) {
					Display.setSceneOutro(outroText);
				}
				else { Display.setSceneOutro("Scene finished early."); }
				
			}
		}
		else {				//if we're using the data viz or editor...
			if (assemblyFailed) { State.set("dataVizState", "assemblyFailed"); }
			else { State.set("dataVizState", "playthroughFinished"); }
		}
	}

	return {
		beginScene: beginScene,
		refreshNarrative : refreshNarrative,
		clickChangeState : clickChangeState,
		wishlist : wishlist
	}
});		