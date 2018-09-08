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

		"Coordinator" : "StoryAssembler/js/Coordinator",
		"Display" : "Display",

		"Hanson": "StoryAssembler/js/Hanson",
		"jQuery": "lib/jquery-3.0.0.min",
		"jQueryUI": "lib/jquery-ui.min",

		"simpleExampleData" : "../StoryAssembler/data/simpleExampleData.json",

		},

	shim: {
		"jQueryUI": {
			export: "$",
			deps: ["jQuery"]
		}
	}
});

requirejs(
	["State", "StoryDisplay", "Display", "Coordinator", "ChunkLibrary", "Wishlist", "StoryAssembler", "Character", "util", "domReady!"],
	function(State, StoryDisplay, Display, Coordinator, ChunkLibrary, Wishlist, StoryAssembler, Character) {

	Coordinator.init();

});