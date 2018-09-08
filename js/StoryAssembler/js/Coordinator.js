define(["Display", "StoryDisplay", "State", "ChunkLibrary", "Wishlist", "StoryAssembler", "Templates", "Character", "Hanson", "text!simpleExampleData"], function(Display, StoryDisplay, State, ChunkLibrary, Wishlist, StoryAssembler, Templates, Character, Hanson, simpleExampleData) {


	var recordPlaythroughs = true;
	var consoleLogs = []				//can be StoryAssembler, Gemini, or All...in an array so in the future we can be additive

	/*
		Initializing function
	*/
	var init = function() {

		Templates.init(Character, this, Display);
		State.init(Templates);
		

		//selectable scenes from main menu
		var scenes = ["finalDinner", "finalLecture", "intro:deanOrTravel", "intro:tempDinnerWithFam", "finalBeach", "finalUN", "intro:theEnd"];


		//for reference, easy access to old temporary scenes.
		var allScenes = ["dinner", "dinner_argument", "generalist", "lecture", "travel", "worker", "newExample", "undergradDinner", "undergradLecture", "undergradDean", "undergradTravel", "undergradFamilyDinner", "undergradUN", "undergradBeach", "undergradFaculty", "sereneTest", "ianTest", "kevinTest", "mattTest", "summerTest", "talonTest", "finalDinner", "finalLecture", "finalTravel", "finalDean", "finalFamilyDinner", "finalBeach", "finalUN", "finalFaculty"];

		//scenes played when you hit Begin
		var playGameScenes = ["finalDinner", "finalLecture", "finalBeach", "intro:theEnd"];
		State.set("scenes", playGameScenes);

		if (Display.interfaceMode == "timeline") {
			Display.initTimelineScreen(this, State, scenes, playGameScenes);		//start up Timeline UI
		}
		else if (Display.interfaceMode == "graph") {
			Display.initGraphScreen(this, State, scenes, playGameScenes);
		}
		else {
			Display.initTitleScreen(this, State, scenes, playGameScenes);		//start up scene list UI
		}
		

	}

	//cleans all variables out of state that aren't supposed to cross over between scenes
	var cleanState = function(id) {
		State.set("characters", []);			//get rid of extraneous characters
	}

	//modifies the console functions for filtering statements
	//TODO: make it do that (currently only disables it for release, which doesn't matter because players don't have the developer toolbar open)
	var setConsole = function() {

		if (gameVersion == "release") {
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
		for (var x=0; x < story.dataFiles.length; x++) { levelDataArray.push(HanSON.parse(require(story.dataFiles[x]))); }
		levelDataArray.push(HanSON.parse(globalData));

		ChunkLibrary.reset();
		for (var x=0; x < levelDataArray.length; x++) { ChunkLibrary.add(levelDataArray[x]); }		//add in fragments from all files

		if (State.get("dynamicWishlist")) {
			story.wishlist = State.get("processedWishlist");
		}

		var wishlist = Wishlist.create(story.wishlist, State);
		wishlist.logOn();

		if (story.characters) {
			Character.init(State);
			for (var key in story.characters) {
				Character.add(key, story.characters[key]);
			}
		}
		State.set("mode", story.mode);
		State.set("storyUIvars", story.UIvars);
		Display.setAvatars();
		StoryAssembler.beginScene(wishlist, ChunkLibrary, State, StoryDisplay, Display, Character, this);
		StoryDisplay.addVarChangers(story.UIvars, StoryAssembler.clickChangeState);		//add controls to change variable values in story (in diagnostics panel)
	}

	//returns index of next scene
	//available scenes: ["finalDinner", "finalLecture", "finalTravel", "finalDean", "finalFamilyDinner", "finalBeach", "finalUN", "finalFaculty"]
	var getNextScene = function(currentScene) {
		/* 
		This is the old conditional code for moving between scenes based on states, needs to be refactored away from here to evaluate custom State compares put in each scene to see if it's valid, but that means we have to write them, so leaving for now
		*/
		/*
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
		
		return State.get("scenes").indexOf(currentScene)+1;

	}


	//returns specs for stories. If id == "all", will return all of them (for populating a menu)
	var getStorySpec = function(id) {

		var storySpec = [
		{
			id: "simpleExample",
			year: 2025,
			characters: {
				"protagonist": {name: "Emma", nickname: "Em", gender: "female"},
				"friend1": {name: "Zanita", nickname: "Z", gender: "female"},
				"friend2": {name: "Shelly", nickname: "Shelly", gender: "female"}
			},
			wishlist: [
				{ condition: "satiation gte 5", order: "first", persistent: true },		//game interrupt
				{ condition: "establishFriends eq true"},
				{ condition: "outro eq true", order: "last"},

				{
					condition: "state: set academicFriend [0-2:1]",
					label: "# of Academic Friends",
					hoverText: "How many of your friends are academics? (0 is low, 2 is high)",
					changeFunc: "friendBackgroundBalance"
				}
			],
			dataFiles: [
				"text!simpleExampleData"
			],

			startState: [
				"set establishFriends false",
			],
			UIvars: [
				{
					"varName" : "satiation",
					"label" : "Satiation",
					"characters" : [],
					"affectedBy" : "both",
					"range" : [0,10]
				}
			],
			mode: {
				type: "dialogue",
				initiator: "ally",
				responder: "protagonist"
			}
		}

		]

		if (id == "all") { return storySpec; }
		else { return storySpec.filter(function(v) { return v.id === id; })[0]; }
	}

	//fallback text to display if we're in release mode, so No Path Founds don't show up, but instead just end the scene early
	//(only shows up if gameVersion is set to "release")
	var loadNoPathFallback = function(id) {
		var fallbacks = [
			{
				id : "simpleExampleData",
				text : "<p>There was some unforeseen consequences of the reader's choices, and so the scene ended early.</p>"
			}
		];

		for (var x=0; x < fallbacks.length; x++) { if (fallbacks[x].id == id) { 
			return Templates.render(fallbacks[x].text); } }
		return false;
	}

	var loadSceneIntro = function(id) {

		var sceneScreens = [
			{
				id : "simpleExample",
				text : "<p>This is an introduction for an example scene!</p>"
			}
		]
		
		var lookup;
		if (id.substring(0,6) == "intro:") {	//if we're just using the intro as an interstitial scene, not actually running the scene...
			lookup = id.substring(6,id.length);
		}
		else { lookup = id; }
		var sceneText = sceneScreens.filter(function(v) { return v.id === lookup; })[0].text;
		sceneText = Templates.render(sceneText);
		Display.setSceneIntro(sceneText, id);
	};

	//loads background, for now this is based on scene id
	var loadBackground = function(id) {
		var sceneBgs = [
			{
				id : "simpleExample",
				src : "lecturehall.png"
			}
		]
		var sceneBg = sceneBgs.filter(function(v) { return v.id === id; })[0].src;
		return sceneBg;
	}

	/*
		Returns pre-defined list of avatars...hypothetically in the future we could use some metric to pull avatars based on their state gating...
	*/
	var loadAvatars = function(id) {
		var avatarSpec= [
			{
				sceneId : "simpleExample",
				characters: [
					{
						id: "protagonist",
						graphics: "char3",
						age: "20s",
						states: [	//happy, neutral, upset
							{ state: ["concentration gte 8"], tag: "happy"},
							{ state: ["concentration gt 3", "concentration lt 8"], tag: "neutral"},
							{ state: ["concentration lte 3"], tag: "upset"}
						]
					},
					{
						id: "student1",
						graphics: "char9",
						age: "20s",
						states: [	//happy, neutral, upset
							{ state: ["default"], tag: "happy" }
						]
					},
					{
						id: "student2",
						graphics: "char8",
						age: "20s",
						states: [	//happy, neutral, upset
							{ state: ["default"], tag: "happy" }
						]
					},
					{
						id: "student3",
						graphics: "char2",
						age: "20s",
						states: [	//happy, neutral, upset
							{ state: ["default"], tag: "happy" }
						]
					}
				]
			}
		];

		State.avatars = avatarSpec.filter(function(v) { return v.sceneId === id; })[0].characters;

		Display.setAvatars(State);
		Display.createStats();
	}

	//validates the backgrounds and character avatars for the given scene
	var validateArtAssets = function(id) {

		var sceneData = getStorySpec(id);

		for (char in sceneData.characters) {		//loop through to make sure each character has a default avatar
			var passed = false;
			for (var y=0; y < State.avatars.length; y++) {
				if (State.avatars[y].id == char) {
					for (var x=0; x < State.avatars[y].states.length; x++) {
						if (State.avatars[y].states[x].state == "default") {
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

	return {
		init : init,
		loadStoryMaterials : loadStoryMaterials,
		loadAvatars : loadAvatars,
		loadBackground : loadBackground,
		validateArtAssets : validateArtAssets,
		loadSceneIntro : loadSceneIntro,
		loadNoPathFallback : loadNoPathFallback,
		getNextScene : getNextScene,
		cleanState : cleanState,

		getStorySpec : getStorySpec,
	}
});
