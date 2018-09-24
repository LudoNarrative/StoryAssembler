requirejs.config({
	paths: {
		"domReady": "StoryAssembler/lib/domReady",
		"text": "StoryAssembler/lib/text",
		"underscore": "StoryAssembler/lib/underscore-1.8.3.min",

		"util": "StoryAssembler/js/util",
		"StoryAssembler": "StoryAssembler/js/StoryAssembler",
		"StoryDisplay": "StoryAssembler/js/Display",
		"State": "StoryAssembler/js/State",
		"Wishlist" : "StoryAssembler/js/Wishlist",
		"Condition": "StoryAssembler/js/Condition",
		"Request": "StoryAssembler/js/Request",
		"Want": "StoryAssembler/js/Want",
		"Validate": "StoryAssembler/js/Validate",
		"ChunkLibrary": "StoryAssembler/js/ChunkLibrary",
		"BestPath": "StoryAssembler/js/BestPath",
		"Templates": "StoryAssembler/js/Templates",
		"Character": "StoryAssembler/js/Character",
		"Hanson": "StoryAssembler/js/Hanson",
		//"HealthBar" : "StoryAssembler/lib/healthbarstandalone",

		"globalData" : "StoryAssembler/data/scene-content/global.json",

		//each scene should have a data file and a config file included here
		"exampleData" : "StoryAssembler/data/scene-content/example.json",
		"exampleConfig" : "StoryAssembler/data/scene-configs/example.json",

		"Coordinator" : "StoryAssembler/js/Coordinator",
		"Display" : "Display",
		"avatars" : "../assets/avatars/avatars.json",

		"jQuery": "StoryAssembler/lib/jquery-3.0.0.min",
		"jQueryUI": "StoryAssembler/lib/jquery-ui.min",
		"jsonEditor": "StoryAssembler/lib/jsonEditor/jsoneditor"
	},

	shim: {
		"jQueryUI": {
			export: "$",
			deps: ["jQuery"]
		}
	}
});

gameVersion = "release";			//if "release", will disable testing buttons and gears etc

requirejs(
	["State", "StoryDisplay", "Display", "Coordinator", "ChunkLibrary", "Wishlist", "StoryAssembler", "Character", "util", "domReady!"],
	function(State, StoryDisplay, Display, Coordinator, ChunkLibrary, Wishlist, StoryAssembler, Character) {

	Coordinator.init();

});