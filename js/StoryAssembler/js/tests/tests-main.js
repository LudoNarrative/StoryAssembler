/* global requirejs */

/*
Some helpful QUnit syntaxes.
https://qunitjs.com/cookbook/

assert.ok(true) --> fails if param is not true
assert.deepEqual(actual, expected) --> === (works on objects, too)
(also notOk, notDeepEqual, etc.


*/

// TODO: Any way to avoid having to require everything twice?
requirejs.config({
	paths: {
    "domReady": "../../lib/domReady",
    "QUnit": "../../lib/qunit-1.23.1",
    //"Game" : "../../../Gemini/js/game",

    "Condition": "../../js/Condition",
    "Request": "../../js/Request",
    "Want": "../../js/Want",
    "Validate": "../../js/Validate",
    "ChunkLibrary": "../../js/ChunkLibrary",

    "StoryDisplay": "../Display",
    //"Display" : "../../../js/Display",

    "Wishlist" : "../../js/Wishlist",
    "State": "../../js/State",
    "Templates": "../../js/Templates",
    "BestPath": "../../js/BestPath",
    "Character" : "../../js/Character",

    "util": "../../js/util",

    "underscore": "../../lib/underscore-1.8.3.min",
    "jQuery": "../../../lib/jquery-3.0.0.min",
    "jQueryUI": "../../../lib/jquery-ui.min",

	},
	shim: {
       "QUnit": {
           exports: "QUnit",
           init: function() {
               QUnit.config.autoload = false;
               QUnit.config.autostart = false;
           }
       },
       "jQueryUI": {
          export: "$",
          deps: ["jQuery"]
        }
  }


});

requirejs(["QUnit", "StateTests", "RequestTests", "WantTests", "WishlistTests", "ChunkLibraryTests", "BestPathTests", "TemplatesTest", "StoryAssemblerTests", "CharacterTests", "NarrationModesTests","domReady!"], function(QUnit, StateTests, RequestTests, WantTests, WishlistTests, ChunkLibraryTests, BestPathTests, TemplatesTest, StoryAssemblerTests, CharacterTests, NarrationModesTests) {

	StateTests.run();
	RequestTests.run();
	WantTests.run();
	WishlistTests.run();
	ChunkLibraryTests.run();
  BestPathTests.run();
  TemplatesTest.run();
  StoryAssemblerTests.run();
  CharacterTests.run();
  NarrationModesTests.run();

	QUnit.load();
	QUnit.start();

});
