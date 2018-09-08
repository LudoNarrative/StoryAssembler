/* Implements a Character module for StoryAssembler.

A character is a person in the story being assembled (player or NPC). We use the standard State module to store character info: this module just provides a convenience wrapper around getting/setting character info.
*/

define([], function() {

	var State;
//	var characters = {}; // For each key, an array of IDs: all properties associated with this character.

	var init = function(_State) {
		State = _State;
		State.set("characters", []);	//empty out any lingering characters
	}

	var add = function(char, charDef) {
		
		var characters = State.get("characters");
		if (typeof characters == "undefined") {
			characters = [];
		}

		var charIndex = characters.map(function(e) { return e.id; }).indexOf(charDef.id);
		if (charIndex > -1) {			//if the char was already read in, return undefined
			return undefined;
		}
		charDef.id = char;			//add dictionary key as id
		characters.push(charDef);
		State.set("characters", characters);
		return get(charDef.id);		
	}

	var remove = function(key) {
		var charIndex = State.get("characters").map(function(e) { return e.id; }).indexOf(key);
		if (charIndex < 0) { return; }

		var newChars = State.get("characters");
		newChars.splice(charIndex,1);
		State.set("characters", newChars);
	}

	/*
	supports {"health" : "set 1"}, {"health": "incr 1"}, {"health": "decr 1"}
	*/
	var set = function(key, statsObj) {
		var characters = State.get("characters");
		var charIndex = characters.map(function(e) { return e.id; }).indexOf(key);

		if (charIndex < 0) {
			throw new Error("Tried to set stats for character '" + key + "' but no such character was found.");
		}

		for (var statsKey in statsObj) {
			var propExists = false;
			if (typeof State.get("characters")[charIndex][statsKey] !== "undefined") { propExists = true; }

			var parts = statsObj[statsKey].split(" ");
			var op = parts[0].trim();
			var val = parts[1].trim();

			if (op == "set") { characters[charIndex][statsKey] = val; }
			if (op == "incr") {	
				if (propExists) { characters[charIndex][statsKey] = parseInt(characters[charIndex][statsKey]) + parseInt(val); } 
				else { throw new Error("Tried to set "+ statsKey +" for character '" + key + "' but no such property was found.");}
			}
			if (op == "decr") {
				if (propExists) { characters[charIndex][statsKey] = parseInt(characters[charIndex][statsKey]) - parseInt(val); } 
				else { throw new Error("Tried to set "+ statsKey +" for character '" + key + "' but no such property was found.");}
			}

			State.set("characters", characters);
		}
	}

	var get = function(key) {

		var charIndex = State.get("characters").map(function(e) { return e.id; }).indexOf(key);

		if (charIndex == -1) {
			return undefined;
		}
		/*
		if (!stat) {
			var charObj = {}
			charObj.id = key;
			characters[key].forEach(function(defKey) {
				charObj[defKey] = State.get(stateKey(key, defKey));
			});
			return charObj;
		}*/ else {
			return State.get("characters")[charIndex];
		}
	}

	var getAllIds = function() {
		return State.get("characters").map(function(e) { return e.id; });
	}

	var stateKey = function(charId, key) {
		return charId + "_" + key;
	}

	//this returns the character id that matches the discourse pattern (dialogue, etc)
	//if rLevel is passed in, will run some times 
	var getBestSpeaker = function(_State, rLevel, textType) {
		var storyMode = _State.get("mode");
		var bestSpeaker;
		var speaker = _State.get("speaker");
		var iterNum = (rLevel === undefined) ? 1 : rLevel+1;

		if (typeof speaker == "undefined") { 			//if there's no current speaker, set one
			if (typeof storyMode == "undefined") { 		//if there's no specified storyMode, use monologue
				storyMode = {
					type: "monologue",
					initiator: _State.get('characters')[0].id
				}
				_State.set('mode', storyMode);
				_State.set('speaker', storyMode.initiator);
			}
			bestSpeaker = storyMode.initiator; 			//otherwise set it to the initiator
		}
		else {
			//var tempCurrentSpeaker = speaker;
			for (var x=0; x < iterNum; x++) {
				switch (storyMode.type) {
					case "narration" : 		//nothing needed
					break;
					case "monologue" : 		//set back to initiator if we get off track
					bestSpeaker = storyMode.initiator;		
					break;
					case "dialogue": 		//alternate between initiator and responder (we set 'speaker' for use in multiple iterations, like choosing choice speakers)
						//if (speaker == storyMode.initiator) { bestSpeaker = storyMode.responder; speaker = storyMode.responder; }
						//else { bestSpeaker = storyMode.initiator; speaker = storyMode.initiator; }
						if (textType == "content") { bestSpeaker = storyMode.initiator; }
						if (textType == "choice") { bestSpeaker = storyMode.responder; }
					break;
				}
			}
		}
		return bestSpeaker;
	}


	// Public interface for Character module.
	return {
		init: init,
		add: add,
		remove: remove,
		set: set,
		get: get,
		getAllIds: getAllIds,
		getBestSpeaker: getBestSpeaker

	}
});	