define([
	"Display", "StoryDisplay", "State", "ChunkLibrary", "Wishlist", "StoryAssembler", "Templates", "Character", "Hanson", 
	"text!example_staticBranchingData", "text!example_staticBranchingConfig","text!example_dynamicBranchingData", "text!example_dynamicBranchingConfig"], function(Display, StoryDisplay, State, ChunkLibrary, Wishlist, StoryAssembler, Templates, Character, Hanson, 
		example_staticBranchingData, example_staticBranchingConfig, example_dynamicBranchingData, example_dynamicBranchingConfig) {


	//----------------------------------------------------------------
	//all the different options you can configure storyassembler with!
	//----------------------------------------------------------------			

	var settings = {

		"gameTitle" : "Sample Game",		//title of game (used for title screen in themes)
		"releaseMode" : false,				//if true, will end a scene early if a path bug is found. If false, will display NoPathFound error on console and crash.
		"recordPlaythroughs" : true,
		"consoleLogs" : [],					//which logs are displayed. Can be StoryAssembler or All...in an array so in the future we can be additive

		"interfaceMode" : "titleScreen",	//what title screen interface to use...a Begin link and progress scene-to-scene ("titleScreen") or a timeline that's returned to ("timeline")
		"avatarMode" : "oneMain",			//"oneMain" means display avatar of speaking character next to text, otherwise "normal" RPG style

		"showUnavailableChoices" : true,	//if players should see choices they can't pick due to state, or if they're hidden
		"enableDiagnostics" : true,			//whether to display the gear you can click to see diagnostics for debugging

		"requiredFields" : [],
		"optionalFields" : ["id", "notes", "choices", "choiceLabel", "unavailableChoiceLabel", "effects", "conditions", "request", "content", "repeatable", "speaker", "available", "gameInterrupt", "avatar"],		//"id" is optional because, if a chunk doesn't have one, we'll assign one automatically (unnamedChunk5, etc)

		"scenes" : {
			"example-staticBranching" : {
				"config" : HanSON.parse(example_staticBranchingConfig)
			},
			"example-dynamicBranching" : {
				"config" : HanSON.parse(example_dynamicBranchingConfig)
			}
		},

		"sceneOrder" : ["example-staticBranching", "example-dynamicBranching"]			//progression of scenes when you hit "Begin", or laid out in timeline
	}

	/*
		Initializing function
	*/
	var init = function() {

		Templates.init(Character, this, Display);
		State.init(Templates);


		//setConsole();

		State.set("scenes", settings.sceneOrder);

		if (settings.interfaceMode == "timeline") {
			Display.initTimelineScreen(this, State, settings.scenes, settings.sceneOrder);		//start up Timeline UI
		}
		else if (settings.interfaceMode == "titleScreen") {
			Display.initTitleScreen(this, State, settings.scenes, settings.sceneOrder);		//start up scene list UI
		}

		else {console.error("settings.interfaceMode isn't set to timeline or titleScreen!")}

	}

	//cleans all variables out of state that aren't supposed to cross over between scenes
	var cleanState = function(id) {
		State.set("characters", []);			//get rid of extraneous characters
	}

	//modifies the console functions for filtering statements
	//TODO: make it do that (currently only disables it for release, which doesn't matter because players don't have the developer toolbar open)
	var setConsole = function() {

		if (settings.releaseMode == true) {
			var console = {};
			console.log = function(){};
			console.info = function(){};
			console.warn = function(){};
			console.error = function(){};
			console.assert = function(){};

			window.console = console;
		}
	}

	/*
		Loads the necessary materials for the story
	*/
	var loadStoryMaterials = function(id) {

		State.set("currentScene", id);
		var story = getStorySpec(id);
		story.startState.forEach(function(command) {
			State.change(command);
		});
		var levelDataArray = [];

		//load the levelDataArray with all the dataFiles for both the level, and the global fragments file
		for (var x=0; x < story.dataFiles.length; x++) { 
			try {
			    levelDataArray.push(HanSON.parse(require(story.dataFiles[x]))); 
			} catch (ex) {
			    console.error("\"" + story.dataFiles[x] + "\" couldn't be loaded via require.js. Is that name correct? Check \n1. the filename in the dataFiles array in your scene config\n2. the paths object in main.js \n3. the top of Coordinator.js \nto make sure all those names are correct!");
			}
			
		}
		try { levelDataArray.push(HanSON.parse(globalData)); }
		catch (ex) {
			console.log("no global data file defined for this project")
		}

		ChunkLibrary.reset();
		for (var x=0; x < levelDataArray.length; x++) { ChunkLibrary.add(levelDataArray[x], settings); }		//add in fragments from all files

		if (State.get("dynamicWishlist")) {
			story.wishlist = State.get("processedWishlist");
		}

		var wishlist = Wishlist.create(story.wishlist, State);
		wishlist.logOn();

		if (story.characters) {
			Character.init(State);
			for (var x=0; x < story.characters.length; x++) {
				Character.add(story.characters[x].id, story.characters[x]);
			}
		}
		State.set("mode", story.mode);
		State.set("storyUIvars", story.UIvars);
		Display.setAvatars();
		StoryAssembler.beginScene(wishlist, ChunkLibrary, State, StoryDisplay, Display, Character, this);
		//StoryDisplay.addVarChangers(story.UIvars, StoryAssembler.clickChangeState);		//add controls to change variable values in story (in diagnostics panel)
	}

	//returns index of next scene
	var getNextScene = function(currentScene) {
		/* This is the old conditional code for moving between scenes based on states, needs to be refactored away from here to evaluate custom State compares put in each scene to see if it's valid, but that means we have to write them, so leaving for now
		switch(currentScene) {
			case "finalDinner":
				return 1;
			case "finalLecture": {
				if (State.get('composure') > 5) {
					return 2;
				}
				else { return 3; }
			}
			case "finalDean": {
				return 4;
			}
			case "finalTravel":
				return 4;
			case "finalFamilyDinner": {
				if (State.get('academicEnthusiasm' > 8)) {			//UN branch
					return 6;
				}
				if (State.get('academicEnthusiasm') > 4 && State.get('academicEnthusiasm') < 9) {		//senior faculty branch
					return 6;
				}
				if (State.get('academicEnthusiasm') < 5) {				//beach
					return 5;
				}
			}
			case "finalBeach": 		//this should return epilogue eventually
				return 0;
			case "finalUN": 		//this should return epilogue eventually
				return 0;

			case "finalFaculty": 		//this should return epilogue eventually
				return 0;
		}
		*/
		if (State.get("scenes").indexOf(currentScene) == -1) { return -1;}			//this will happen if we're starting a loose scene from Main Menu, but it's not entered into scene progression.
		else { return State.get("scenes").indexOf(currentScene)+1; }

	}


	//returns specs for stories. If id == "all", will return all of them (for populating a menu)
	var getStorySpec = function(id) {

		if (id == "all") { return settings.scenes; }
		else { 
			return settings.scenes[id].config; }
	}

	//fallback text to display if we're in release mode, so No Path Founds don't show up, but instead just end the scene early
	//(only shows up if gameVersion is set to "release")
	var loadNoPathFallback = function(id) { 

		if (settings.scenes[id].fallbackOutro) {
			return Templates.render(settings.scenes[id].fallbackOutro);
		}

		else { return false; }
	}

	var loadSceneIntro = function(id) {

		/*
		var sceneScreens = [
			{
				id : "exampleScene",
				text : "<p>It's the year 2025. You are Emma Richards, a PhD student finishing up your degree on the effects of climate change.</p><p>Tomorrow, you'll be defending your thesis. Your friends have decided to throw a dinner party for you.</p><p>Choose what Emma says, but keep an eye on the task you're performing, too!</p>"
			}
		]
		
		var lookup;
		if (id.substring(0,6) == "intro:") {	//if we're just using the intro as an interstitial scene, not actually running the scene...
			lookup = id.substring(6,id.length);
		}
		else { lookup = id; }
		var sceneText = sceneScreens.filter(function(v) { return v.id === lookup; })[0].text;
		*/
		var story = getStorySpec(id);
		var sceneText = Templates.render(story.introText);
		Display.setSceneIntro(sceneText, id);
	};

	//returns a scene description written for the timeline
	var loadTimelineDesc = function(id) {
		var story = getStorySpec(id);
		var timelineDesc = Templates.render(story.descriptionText);
		return timelineDesc;		
	}

	//loads background, for now this is based on scene id
	var loadBackground = function(id) {
		return getStorySpec(id).sceneBackground;;
	}

	/*
		Returns pre-defined list of avatars...hypothetically in the future we could use some metric to pull avatars based on their state gating...
	*/
	var loadAvatars = function(id) {

		State.avatars = getStorySpec(id).characters;

		Display.setAvatars(State);
		Display.createStats();
	}

	//validates the backgrounds and character avatars for the given scene
	var validateArtAssets = function(id) {

		var sceneData = getStorySpec(id);

		for (char in sceneData.characters) {		//loop through to make sure each character has a default avatar
			var passed = false;
			for (var y=0; y < State.avatars.length; y++) {
				if (State.avatars[y].id == sceneData.characters[char].id) {
					for (var x=0; x < State.avatars[y].avatarStates.length; x++) {
						if (State.avatars[y].avatarStates[x].state == "default") {
							passed = true;
						}
					}
				}
			}
			if (!passed) {
				console.warn("Warning! No default avatar set for " + char + "!");
			}
		}
		//TODO: warn if there are characters in avatars that aren't in scene
		//TODO: warn if avatar depends on state var that is not a scene state var
	}

	//put code here if you need to initialize game logic to interface with StoryAssembler in each scene
	var startGame = function(id,increment=true, introGame=false) {
		
	}
    

	return {
		init : init,
		settings : settings,
		loadStoryMaterials : loadStoryMaterials,
		loadTimelineDesc : loadTimelineDesc,
		loadAvatars : loadAvatars,
		loadBackground : loadBackground,
		validateArtAssets : validateArtAssets,
		loadSceneIntro : loadSceneIntro,
		loadNoPathFallback : loadNoPathFallback,
		getNextScene : getNextScene,
		cleanState : cleanState,
		startGame : startGame,
		getStorySpec : getStorySpec,
	}
});
