/* Implements the library of chunks for StoryAssembler.

A chunk is a unit of story content and associated metadata. It can either directly contain text for printing, or contain a request for how to find a more specific chunk.

The library controls access to chunks.
*/

define(["Validate", "Request", "util"], function(Validate, Request, util) {

	var _library = {};

	var requiredFields = [];
	//"id" is optional because, if a chunk doesn't have one, we'll assign one automatically (unnamedChunk5, etc)
	var optionalFields = ["id", "notes", "choices", "choiceLabel", "unavailableChoiceLabel", "effects", "conditions", "request", "content", "repeatable", "speaker", "available", "gameInterrupt", "avatar"];

	// Validates and adds a chunk to the library.
	var addChunk = function(chunk) {
/*
		if (typeof chunk.speaker == "undefined" && typeof chunk.request == "undefined") {
			throw new Error(chunk.id + " has no speaker, and no request field to pull in speaker from other chunk");
		}
*/
		Validate.check(chunk, requiredFields, optionalFields); // will throw an error if chunk has wrong fields.

		// Assign an ID if one was not specified
		if (chunk.id === undefined) {
			chunk.id = "unnamedChunk" + util.iterator("chunks");
		}

		chunk.available = true;

		// If choice in raw form, convert to processed form.
		if (chunk.choices) {
			for (var i = 0; i < chunk.choices.length; i++) {
				var c = chunk.choices[i];
				// TODO check that choice is in valid format.
				if (c.condition) {
					chunk.choices[i] = Request.byCondition(c.condition);
				} else if (c.chunkId) {
					chunk.choices[i] = Request.byId(c.chunkId);
				} else if (c.gotoId) {
					chunk.choices[i] = Request.byGoto(c.gotoId);
				} else {
					console.log(c)
					throw new Error("choice not specified in right format", c);
				}

				if (c.speaker) { chunk.choices[i].speaker = c.speaker; }
			}
		}
		if (chunk.request) {
			if (chunk.request.condition) {
				chunk.request = Request.byCondition(chunk.request.condition);
			} else if (chunk.request.chunkId) {
				chunk.request = Request.byId(chunk.request.chunkId);
			} else if (chunk.request.gotoId) {
				chunk.request = Request.byGoto(chunk.request.gotoId);
			} else {
				throw new Error("chunk request not specified in right format", chunk.request);
			}
		}

		if (typeof _library[chunk.id] == "undefined") {
			_library[chunk.id] = chunk;
		}

		else { throw "Duplicate fragments detected with ID '" + chunk.id + "'!"; }

		return chunk.id;
	}

	// Add a single chunk or an array of chunks to the library, returning a single ID or array of IDs.
	var add = function(input) {
		if (util.isArray(input)) {
			var newIds = [];
			input.forEach(function(chunk) {
				newIds.push(addChunk(chunk));
			});
			return newIds;
		} else {
			return addChunk(input);
		}
	}

	var setAvailable = function(fragmentId) {
		_library[fragmentId].available = true;
	}

	/* 
		Returns a chunk for a given id, or false
		-chunkId: the id of the chunk being requested
		-mode: "normal" = we check for it being available, "refresh" = we do not
	*/

	var get = function(chunkId, mode) {

		mode = mode || "normal";

		if (typeof _library[chunkId] == "undefined") { return false; }

		if (mode == "normal") {
			if (_library[chunkId].available) {
				return _library[chunkId];
			}
			else { return false; }

		}
		else {
			return _library[chunkId];
		}
	}

	var remove = function(chunkId) {
		//delete _library[chunkId];				//changed this so that we can re-render chunks if need be
		_library[chunkId].available = false;
	}

	var reset = function() {
		_library = {};
	}

	var getKeys = function() {
		return Object.keys(_library);
	}

	return {
		add: add,
		get: get,
		setAvailable : setAvailable,
		remove: remove,
		reset: reset,
		getKeys: getKeys
	}
});		