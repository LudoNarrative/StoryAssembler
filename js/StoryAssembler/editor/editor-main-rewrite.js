requirejs.config({
	baseUrl: "../",
	paths: {
		"domReady": "../StoryAssembler/lib/domReady",
		"text": "../StoryAssembler/lib/text",
		"underscore": "../StoryAssembler/lib/underscore-1.8.3.min",

		"util": "../StoryAssembler/js/util",
		"StoryAssembler": "../StoryAssembler/js/StoryAssembler",
		"StoryDisplay": "../StoryAssembler/js/Display",
		"State": "../StoryAssembler/js/State",
		"Wishlist" : "../StoryAssembler/js/Wishlist",
		"Condition": "../StoryAssembler/js/Condition",
		"Request": "../StoryAssembler/js/Request",
		"Want": "../StoryAssembler/js/Want",
		"Validate": "../StoryAssembler/js/Validate",
		"ChunkLibrary": "../StoryAssembler/js/ChunkLibrary",
		"BestPath": "../StoryAssembler/js/BestPath",
		"Templates": "../StoryAssembler/js/Templates",
		"Character": "../StoryAssembler/js/Character",
		"Hanson": "../StoryAssembler/js/Hanson",
		"HealthBar" : "../lib/healthbarstandalone",

		"globalData" : "../StoryAssembler/data/global.json",
		"travelData" : "../StoryAssembler/data/travel.json", 
		"workerData" : "../StoryAssembler/data/worker.json", 
		"lectureData" : "../StoryAssembler/data/lecture.json", 
		"dinnerData" : "../StoryAssembler/data/dinner.json",
		"generalistData" : "../StoryAssembler/data/generalist.json",


		"undergradDinnerData_talon" : "../StoryAssembler/data/undergradDinnerData-talon.json",
		"undergradDinnerData_irapopor" : "../StoryAssembler/data/undergradDinnerData-irapopor.json",
		"undergradDinnerData_sgadsby" : "../StoryAssembler/data/undergradDinnerData-sgadsby.json",

		"undergradDean_sgadsby" : "../StoryAssembler/data/undergradDean-sgadsby.json",
		"undergradDean_talon" : "../StoryAssembler/data/undergradDean-talon.json",
		"undergradDean_irapopor" : "../StoryAssembler/data/undergradDean-irapopor.json",

		"undergradLecture_kply" : "../StoryAssembler/data/undergradLecture-kply.json",
		"undergradLecture_sjsherma" : "../StoryAssembler/data/undergradLecture-sjsherma.json",

		"undergradTravel_sjsherma" :  "../StoryAssembler/data/undergradTravel-sjsherma.json",
		"undergradTravel_kply" : "../StoryAssembler/data/undergradTravel-kply.json",

		"undergradFamilyDinner_sgadsby" : "../StoryAssembler/data/undergrad_familyDinner_sgadsby.json",
		"undergradFamilyDinner_talon" : "../StoryAssembler/data/undergrad_familyDinner_talon.json",
		"undergradFamilyDinner_irapopor" : "../StoryAssembler/data/undergrad_familyDinner_irapopor.json",

		"undergradUN_irapopor" : "../StoryAssembler/data/undergradUN-irapopor.json",
		"undergradUN_kply" : "../StoryAssembler/data/undergradUN-kply.json",
		"undergradUN_talon" : "../StoryAssembler/data/undergradUN-talon.json",

		"undergradBeach_sjsherma" : "../StoryAssembler/data/undergradBeach-sjsherma.json",
		"undergradBeach_madreed" : "../StoryAssembler/data/undergradBeach-madreed.json",
		"undergradBeach_sgadsby" : "../StoryAssembler/data/undergradBeach-sgadsby.json",

		"undergradFaculty_sjsherma" : "../StoryAssembler/data/undergradFaculty-sjsherma.json",
		"undergradFaculty_madreed" : "../StoryAssembler/data/undergradFaculty-madreed.json",
		"undergradFaculty_kply" : "../StoryAssembler/data/undergradFaculty-kply.json",


		"sjsherma_testfile" : "../StoryAssembler/data/sjsherma-testfile.json",
		"kply_testfile" : "../StoryAssembler/data/kply-testfile.json",
		"irapopor_testfile" : "../StoryAssembler/data/irapopor-testfile.json",
		"talon_testfile" : "../StoryAssembler/data/talon-testfile.json",
		"sgadsby_testfile" : "../StoryAssembler/data/sgadsby-testfile.json",
		"madreed_testfile" : "../StoryAssembler/data/madreed-testfile.json",


		"finalDinner" : "../StoryAssembler/data/final/finalDinner.json",
		"finalLecture" : "../StoryAssembler/data/knobs/lecture.json",
		"finalDean" : "../StoryAssembler/data/final/finalDean.json",
		"finalTravel" : "../StoryAssembler/data/final/finalTravel.json",
		"finalFamilyDinner" : "../StoryAssembler/data/final/finalFamilyDinner.json",
		"finalUN" : "../StoryAssembler/data/final/finalUN.json",
		"finalBeach" : "../StoryAssembler/data/knobs/beach.json",
		"finalFaculty" : "../StoryAssembler/data/final/finalFaculty.json",


		"newExampleData" : "../StoryAssembler/data/newExampleData.json",

		"Coordinator" : "../Coordinator/Coordinator",
		"Display" : "js/Display",
		"avatars" : "../assets/avatars/avatars.json",

		"Phaser" : "../lib/phaser",
		"jQuery": "../lib/jquery-3.0.0.min",
		"jQueryUI": "../lib/jquery-ui.min",
		"jsonEditor": "../lib/jsonEditor/jsoneditor",

		"Game" : "../Gemini/js/game",
		"AspPhaserGenerator" : "../asp-phaser-generator-2/index",
		"translateAsp" : '../asp-phaser-generator-2/src/asp-to-cygnus-2',
		"rensa" : '../asp-phaser-generator-2/src/brain',
		"ctp" : '../asp-phaser-generator-2/src/cygnus-to-phaser-brain-2',
		"translatePhaserBrain" : '../asp-phaser-generator-2/src/phaser-brain-to-code-2',

		"testData" : "../StoryAssembler/data/testData.json",

		"cytoscape": "../StoryAssembler/lib/cytoscape",
		"cytoscape-cxtmenu" : "../StoryAssembler/lib/cytoscape-cxtmenu",
		"cytoscape-cose-bilkent" : "../StoryAssembler/lib/cytoscape-cose-bilkent",
		"cytoscape-edgehandles" : "../StoryAssembler/lib/cytoscape-edgehandles",
		"dagre" : "../StoryAssembler/lib/dagre.min",
		"cytoscape-dagre" : "../StoryAssembler/lib/cytoscape-dagre",
		"cola" : "../StoryAssembler/lib/cola",
		"cytoscape-cola" : "../StoryAssembler/lib/cytoscape-cola",

		
		//"Phaser" : "../../lib/phaser",
		//"Game" : "../../Gemini/js/game",
		//"AspPhaserGenerator" : "../../asp-phaser-generator-2/index",
		/*"translateAsp" : '../../asp-phaser-generator-2/src/asp-to-cygnus',
		"rensa" : '../../asp-phaser-generator-2/src/brain',
		"ctp" : '../../asp-phaser-generator-2/src/cygnus-to-phaser-brain',
		"translatePhaserBrain" : '../../asp-phaser-generator-2/src/phaser-brain-to-code'
		*/
	},

	shim: {
		"jQueryUI": {
			export: "$",
			deps: ["jQuery"]
		},
		"cola": { exports: "cola" }
	}
});

requirejs(
	["State", "StoryDisplay", "Display", "cytoscape", "cytoscape-cxtmenu", "cytoscape-cose-bilkent", "dagre", "cytoscape-dagre", "cola", "cytoscape-cola", "Coordinator", "ChunkLibrary", "Wishlist", "StoryAssembler", "Character", "Templates", "Game", "AspPhaserGenerator", "util", "text!testData", "domReady!"],
	function(State, StoryDisplay, Display, cytoscape, cxtmenu, regCose, dagre, cydagre, cola, cycola, Coordinator, ChunkLibrary, Wishlist, StoryAssembler, Character, Templates, Game, AspPhaserGenerator, util, testData) {

	cxtmenu( cytoscape, $ ); 		// register extension
	cydagre( cytoscape, dagre );	// register extension
	cycola( cytoscape, cola ); // register extension
	regCose( cytoscape );

	var wait = true;

	var levelData;
	var globalData;
	var story;

	var graphData = [];
	var leftToVisit = [];
	var playThroughs = [];
	var currentScene = "finalLecture";		//starting scene (you can change this in the UI from the dropdown)

	var stories = Coordinator.getStorySpec("all");
	var testStories = HanSON.parse(testData);
	var scenes = stories.map(function(obj){return obj.id});

	//which state variables to check to determine if we create a new node or merge it into one node
	var stateCompares = ["validChunks", "invalidChunks"];
	//which variables to check to determine if broken out but still in same container if same ID
	//var groupingCompares = ["droppedKnowledge", "establishFriendBackstory", "establishSpecialtyInfo", "provokeConfidenceChoice"];

	var graphRootId = "";
	var iterNum = 4;				//number of playthroughs to run (offset by zero)
	var iterStep = 0;
	var idStepper = 0;
	var deadendPaths = 1;
	var uniqueDeadEnds = true;		//whether to make each dead end a unique node

	var graphElements = [];				//global holder for graph elements so we can redraw graph if need be (options are changed)

	//----RUN-THROUGH HELPER FUNCTIONS------------------------------------------------------
	var getStoryEl = function() {
		return document.getElementById("storyArea").children[0];
	}
	var getChoiceEl = function() {
		return document.getElementById("choiceArea");
	}
	var countChildren = function(el) {
		return el.children.length;
	}
	var html = function(el) {
		return el.innerHTML;
	}
	var child = function(num, el) {
		return el.children[num-1];
	}
	var clickEl = function(el) {
		el.click();
	}
	var clickChoice = function(num) {
		clickEl(child(num, getChoiceEl()));
	}
	var contentForChoice = function(num) {
		return html(child(num, getChoiceEl()));
	}
	var cleanUpDom = function() {
		var el = document.getElementById("storyArea");
		el.parentNode.removeChild(el);
		el = document.getElementById("choiceArea");
		el.parentNode.removeChild(el);
		el = document.getElementById("diagnostics");
		if (el !== null) {
			el.parentNode.removeChild(el);
		}
	}
	//----------------------------------------------------------------------------------------

	//adds unique string to node ids based off State (so the connections between stuff link up)
	//type: either "id" or "groupId"
	var uniquify = function(type) {
		var theCompares;
		var theString = "";

		if (type == "id") { theCompares = stateCompares; }
		
		for (var x=0; x < theCompares.length; x++) {
			var temp = State.get(theCompares[x]);
			if (typeof temp == "undefined") { theString = theString + theCompares[x] + "-u"; }
			else if (temp == false) { theString = theString + theCompares[x] + "-f"; }
			else if (temp == true) { theString = theString + theCompares[x] + "-t"; }
			else { theString = theString + theCompares[x] + "-" + theString; }
		}

		idStepper++;

		return theString;
	}

	//returns a color for a node if a want was satisfied
	var setNodeColor = function(wantsSatisfied) {
		if (wantsSatisfied == "error") {
			return "#fa0505"
		}
		else if (wantsSatisfied && wantsSatisfied.length > 0) {
			return "#43d9ff"
		}
		
		else {
			return "#666666"
		}
	}

	//resets the story and goes to first node, usually called before clicking to re-traverse the choices
	var resetStory = function(_callback) {
		
		var processedWishlist = State.get("processedWishlist");
		var knobsWishlistStateSettingsCache = State.get("knobsWishlistStateSettingsCache");

		State.reset();
		State.set("displayType", "editor");

		if (typeof processedWishlist == "undefined") {					//if we haven't processed the wishlist before...process it
			$('body').append("<div id='hiddenKnobs'></div>");
	    	Display.createKnobs(currentScene, "hiddenKnobs");
			Display.populateKnobs(currentScene, Coordinator, State, State.get("scenes"));
			setTimeout(function (){
				Display.processWishlistSettings(Coordinator, currentScene);			//extra bit to load dynamic wishlists
				Display.initSceneScreen();
				Coordinator.loadAvatars(currentScene);
				Coordinator.loadStoryMaterials(currentScene);
				
				$("#storyDiagnostics").hide();
				$("#storyDiagnosticsButton").hide();	
				console.log("we're cool");
				_callback();
			}, 500);
		}

		else {						//otherwise, restore the cached settings
			State.set("processedWishlist", processedWishlist);					//preserve for future
			State.set("knobsWishlistStateSettingsCache", knobsWishlistStateSettingsCache);			//preserve for future
			State.set("dynamicWishlist", true);
			for (var x=0; x < knobsWishlistStateSettingsCache.length; x++) {
				var setting = knobsWishlistStateSettingsCache[x];
				State.set(setting.key, setting.value);
			}
			Display.initSceneScreen();
			Coordinator.loadAvatars(currentScene);
			Coordinator.loadStoryMaterials(currentScene);
			
			$("#storyDiagnostics").hide();
			$("#storyDiagnosticsButton").hide();	
			console.log("we're cool");
			_callback();
		}

		
	}

	/*
	resets game and clicks through until it makes the choice you've passed in
	(bound as right-click action for nodes in the graph so you can click to go to them)
	*/
	var gotoChoice = function(clickPath, story, levelData, globalData, _callback) {
		
		resetStory(function(){
			for (var x=0; x < clickPath.length; x++) { clickChoice(clickPath[x].clickNum); }		//return to where you were before
			addToGraph(clickPath);			//add the node you're on
			if (typeof _callback !== "undefined") { _callback(); }
		});		//reset story and load first node
		
	}

	//steps the story
	var stepStory = function(clickPath) {

		function restart(logMsg) {
			if (leftToVisit.length > 0 && (iterStep < iterNum)) {
				iterStep++;
				console.log(logMsg);
				var nextNode = leftToVisit.shift();
				gotoChoice(nextNode.clickPath, story, levelData, globalData, function() {
					stepStory(nextNode.clickPath);
				});
				
			}
		}

		var uniqueNodeId = graphData[graphData.length-1].data.id;		//grab last thing added to graphData
		if (typeof uniqueNodeId == "undefined") { uniqueNodeId = graphData[graphData.length-2].data.id; }		//if it wasn't a node, grab next one up
		
		var newChoices = checkForNewChoices(graphData, clickPath);			//check and see if there are any new choices

		newChoices.forEach(function(newChoice, pos) {			//copy them to the leftToVisit with the path to them
			var choiceClickPath = clickPath.slice(0);		//clone array
			choiceClickPath.push({source: uniqueNodeId, dest: newChoice.chunkId, clickNum: newChoice.choiceNum+1, choiceText: newChoice.text});
			newChoice.clickPath = choiceClickPath;

			leftToVisit.push(newChoice);		//add it to leftToVisit
		});

		var currentHtml = $("#storyArea").html();

		if (leftToVisit.length > 0 && document.getElementById("choiceArea").children.length > 0) {		//if there is in fact a choice to click, click it
			var nextChoice = leftToVisit.pop();						//pop last item off array, which should be last choice currently available?
			var transition = nextChoice.clickPath[nextChoice.clickPath.length-1];
			clickPath.push({source: transition.source, dest: transition.dest, clickNum: transition.clickNum, choiceText: transition.choiceText});			//add it to clickPath
			clickChoice(transition.clickNum);					//click the choice		
			addToGraph(clickPath);
			stepStory(clickPath);			//repeat process
		}

		else if (State.get("dataVizState") == "assemblyFailed") {			//if we errored out, restart
			restart("reached an error in this playthrough, backing up and restarting...");
			State.set("dataVizState", "playthroughRestarting");
		}
		
		else if (currentHtml.indexOf("[No path found!]") > -1) {					//if we couldn't find a path, restart
			restart("reached the end of this playthrough, backing up and restarting...");
		}

		else if (State.get("dataVizState") == "playthroughFinished") {			//if we finished a playthrough...
			State.set("dataVizState", "playthroughRestarting");
			restart("Playthrough finished! Starting over...");
		}
		
	};

	//checks current choices and returns them if they aren't present in the graphData yet
	var checkForNewChoices = function(graphData, clickPath) {

		var newChoices = [];

		function isClickPathIdentical(clickPath1, clickPath2) {		//helper function
			
			if (clickPath1.length !== clickPath2.length) { return false; }
			
			for (var x=0; x < clickPath1.length; x++) {
				var string1 = clickPath1[x].dest + clickPath1[x].source;
				var string2 = clickPath2[x].dest + clickPath2[x].source;
				if (string1 !== string2) { return false; }
			}
			return true;
		}

		function isNew(graphData, theChoice) {		//helper function

			var usedBefore = false;
			var usedBeforeIndex = -1;
			for (var x=0; x < graphData.length; x++) {
				if (typeof graphData[x].data.clickPath !== "undefined" && theChoice.chunkId == graphData[x].data.textId) {		//if it's been visited before...
					var clickPathIdentical = isClickPathIdentical(graphData[x].data.clickPath, clickPath);
					if (clickPathIdentical) {		//and the path to it is identical...
						return false;			//it isn't new
					}
				}
			}

			return true;
			
		}

		State.get("currentChoices").forEach(function(choice, pos) {
			if (isNew(graphData, choice) && !choice.cantChoose) {
				choice.choiceNum = pos;
				newChoices.push(choice);
			}
		});

		return newChoices;
	}

	//creates UI for viz
	var createUI = function() {
		createDropdown();
		createKnobs();
	}

	var resetUI = function() {
		graphData = [];
		leftToVisit = [];
		graphRootId = "";
		graphElements = [];
		$("#sceneSelect").remove();
		iterStep = 0;
		deadendPaths = 1;
	}

	var createKnobs = function() {
		Display.initTimelineScreen(Coordinator, State, scenes);
		$("#timeline").hide();
	}

	//creates dropdown for selecting scenes
	var createDropdown = function() {
		$("#sceneSelectDiv").remove();
		$("#cyto").before("<div id='sceneSelectDiv'><label>Scene Selector</label><select id='sceneSelect'></select><br/><label># of Iterations</label><select id='iterSelect'></select><div id='storyButton'></div></div>");

		scenes.forEach(function(scene) {
			$('#sceneSelect').append($('<option>', {value: scene, text:scene }));
		});

		$("#sceneSelect").val(currentScene);

		$("#sceneSelect").change(function(e) {
			resetUI();
			currentScene = this.value;
			createGraph();
		});

		for (var x=-1; x <= 500; x+=5) {
			var val;
			if (x==-1) { val = 0;} else { val = x; }
			$("#iterSelect").append($('<option>', {value: val, text: val+1}));
		}
		$("#iterSelect").val(iterNum);

		$("#iterSelect").change(function(e) {
			resetUI();
			iterNum = this.value;
			createGraph();
		});

		$("#storyButton").click(function() {
	 		 $("#storyContainer.editor").toggle();
		});
	} 

	/*
		This function adds a node and edge to the graph
		clickPath: (used when called recursively) the path it took to get us to this fragment
	*/
	var addToGraph = function(clickPath) {

		var newNode = {};
		var uniqueNodeId = "";
		var theParent;
		
		var currHtml = $("#storyArea span.chunk")[$("#storyArea span.chunk").length-1].innerHTML;
		if (currHtml == "[No path found!]" || currHtml == "[Scene assembly failed.]") {		//if there's no path, make node for it
			if (uniqueDeadEnds) {
				uniqueNodeId = 'deadend' + deadendPaths;			//swap out for unique nodes for each ending
			}
			else {	uniqueNodeId = 'deadend'; }
			newNode = {							//create ending node for graph
				group: 'nodes',
				classes: 'lexia',
				data: {
					id: uniqueNodeId,
					textId: currHtml,	
					clickPath: util.clone(clickPath),
					wantsSatisfied: State.get('wantsSatisfied'),
					color: setNodeColor("error"),
					validChunks: State.get("validChunks").filter(function(val){ return val.valid == true }),
					invalidChunks: State.get("validChunks").filter(function(val){ return val.valid == false })
				}			
			};
			deadendPaths++;
		}
		else {
			uniqueNodeId = State.get("currentTextId") + "_" + uniquify("id");
			
			var groupingStateString = State.get("currentTextId");

			//var duplicateNodeIndex = groupingStates.indexOf(groupingStateString);

			var groupCheck = graphData.filter(function(item){ return item.data.textId == groupingStateString; });

			if (groupCheck.length > 0) {		//if the id already exists, make a parent box for it in the graph to group it
				if (typeof groupCheck[0].data.parent == "undefined") {		//if that item doesn't have a parent
					var parentId = "parent_" + groupCheck[0].data.textId;
					var newParent = {							//create node for parent box to add to graph
						group: 'nodes',
						data: {
							id: parentId,
							textId: parentId,
							color: '#666',
							wantsSatisfied: State.get('wantsSatisfied'),
							//clickPath: util.clone(clickPath),
							//validChunks: State.get("validChunks").filter(function(val){ return val.valid == true }),
							//invalidChunks: State.get("validChunks").filter(function(val){ return val.valid == false }),
							parent: undefined
						}			
					}
					graphData.push(newParent);		//add it
					graphData[graphData.indexOf(groupCheck[0])].data.parent = parentId;		//set the parent
					theParent = parentId;
				}
				else {
					theParent = "parent_" + groupCheck[0].data.textId;
				}
			}

			if (clickPath.length == 0) { graphRootId = uniqueNodeId; }		//if this was called as the first one, set graph root to that node

			newNode = {							//create node for current fragment to add to graph
				group: 'nodes',
				classes: 'lexia',
				data: {
					id: uniqueNodeId,
					textId: State.get("currentTextId"),	
					clickPath: util.clone(clickPath),
					wantsSatisfied: State.get('wantsSatisfied'),
					validChunks: State.get("validChunks").filter(function(val){ return val.valid == true }),
					invalidChunks: State.get("validChunks").filter(function(val){ return val.valid == false }),
					groupingState: groupingStateString,
					parent: theParent,
					color: setNodeColor(State.get('wantsSatisfied'))
				}			
			}
		}

		graphData.push(newNode);		//add node to graph


		//add an edge to the graph, if necessary
		if (clickPath.length > 0) {

			var lastTransition = clickPath[clickPath.length-1];

			if (lastTransition.source == uniqueNodeId) { 
				throw "You can't come from yourself!"; 
			}

			var text = lastTransition.choiceText;			//make label of choicetext for each edge
			var type = "choice";
			if (text == "Continue") { type = "continue"; }


			var truncatedText = "";
			if (text.length > 15) { truncatedText = text.substring(0,14) + "..."; }
			else { truncatedText = text; }

			var newEdge = {
				group: 'edges',
		      	data: {
		        	//id: 'e1',
		        	//TODO: this says ".id" but we just store the click number right now!
		        	source: lastTransition.source,	 // the source node id (edge comes from this node)
		        	target: uniqueNodeId,  		 // the target node id (edge goes to this node)
		        	choiceText: truncatedText,
		        	type : type,
		        	weight : 3
		      	}
   			}

   			graphData.push(newEdge);		//add edge to graph

		}
	}

	//creates the graph of paths in the narrative scene
	var createGraph = function() {

		//graphElements = simulateRunthroughs();

		resetStory(function(){	//reset story and go to first node
			addToGraph([]);		//add that node to graph
			stepStory([]);		//step the story and continue adding to graph until iterations is exhausted			
		
		graphElements = graphData;

		console.log("GraphElements", graphElements);
		console.log("leftToVisit", leftToVisit);

		$('body').append("<div id='cyto'></div><div id='popup'></div>");

		cytoGraph = cytoscape({
			container : $("#cyto"),
			elements : graphElements,
			style: [ // the stylesheet for the graph
			    {
			    	selector: ':parent',
					style: {
						'padding-top': '10px',
						'padding-left': '10px',
						'padding-bottom': '10px',
						'padding-right': '10px',
						'text-valign': 'top',
						'text-halign': 'center',
						'background-opacity': 0.333
					}
			    },
			    {
			      selector: 'node',
			      style: {
			        'background-color': 'data(color)',
			        'label': 'data(textId)'
			      }
			    },

			    {
			      selector: 'edge',
			      style: {
			      	'label' : 'data(choiceText)',
			      	'edge-text-rotation': 'autorotate',
			        'line-color': '#999',
			        'target-arrow-color': '#999',
			        'target-arrow-shape': 'triangle',
			        'curve-style': 'bezier'
			      }
			    },
			    {
			    	selector: '.highlighted',					//used for path highlighting
			    	style: {
						'background-color': '#61bffc',
						'line-color': '#61bffc',
						'target-arrow-color': '#61bffc',
						'transition-property': 'background-color, line-color, target-arrow-color',
						'transition-duration': '0.5s'
			    	}
			    },
			    {
			    	selector: 'edge.showPath',					//used for path highlighting
			    	style: {
						'line-color' : 'yellow',
						'target-arrow-color' : 'yellow'
			    	}
			    },
			    {
			    	selector: 'node.showPath',					//used for path highlighting
			    	style: {
						'border-width' : 10,
						'border-color' : 'yellow'
			    	}
			    }
			],
			/*
			layout : {
				name: 'cose',
				fit: true,
				nodeOverlap: 10,
				idealEdgeLength: function( edge ){ return 10; },
				useMultitasking: true,
				animate: true
			}
			*/
			/*
			layout : {
				name: 'cose-bilkent',
				//ready: function () {},		// Called on `layoutready`
				//stop: function () {},				  // Called on `layoutstop`
				fit: true,		 		 // Whether to fit the network view after when done
				//padding: 10,				// Padding on fit
				randomize: false,			// Whether to enable incremental mode
				nodeRepulsion: 55000,		// Node repulsion (non overlapping) multiplier
				idealEdgeLength: 200,		// Ideal edge (non nested) length
				// Divisor to compute edge forces
				edgeElasticity: 1.0,
				// Nesting factor (multiplier) to compute ideal edge length for nested edges
				// nestingFactor: 0.1,
				// Gravity force (constant)
				// gravity: 0.25,
				// Maximum number of iterations to perform
				numIter: 7500,
				// For enabling tiling
				// tile: true,
				// Type of layout animation. The option set is {'during', 'end', false}
				animate: 'false',
				// Represents the amount of the vertical space to put between the zero degree members during the tiling operation(can also be a function)
				// tilingPaddingVertical: 10,
				// Represents the amount of the horizontal space to put between the zero degree members during the tiling operation(can also be a function)
				// tilingPaddingHorizontal: 10,
				// Gravity range (constant) for compounds
				// gravityRangeCompound: 1.5,
				// Gravity force (constant) for compounds
				// gravityCompound: 1.0,
				// Gravity range (constant)
				gravityRange: 6.8
			}
			*/
			
			layout : {						//this is the best so far
				name: 'breadthfirst',
				directed: true,
				spacingFactor: 3,
				roots: '#' + graphRootId,
				avoidOverlap: true,
			}
			
			/*
			layout : {					//settings here: https://github.com/cytoscape/cytoscape.js-cola
				name: 'cola',
				animate: true,
				refresh: 1,
				maxSimulationTime: 10000,
				avoidOverlap: true,

				flow: { axis: 'y', minSeparation: 30},
				edgeSymDiffLength: 6
			}
			*/
	/*		
			layout : {				//settings here: https://github.com/cytoscape/cytoscape.js-dagre
				name: 'dagre',
				rankDir: 'TB',
				rankSep: 75
			}
		*/	
			/*
			layout : {
				name: 'concentric',
				equidistant: true
			}
			*/
			/*
			layout : {
				name : 'grid'
			}
			*/
		});

		//cyto.$('*').codirectedEdges().remove();

		cytoGraph.cxtmenu({			//walkthrough of options at https://github.com/cytoscape/cytoscape.js-cxtmenu
			selector: 'node.lexia',

			commands: [
				{
					content: 'Goto Here',
					select: function(ele){
						gotoChoice(ele.data().clickPath, story, levelData, globalData, function() {stepStory(ele.data().clickPath);});
						$("#storyContainer.editor").show();
					}
				},

				{
					content: 'Valid/Invalid Nodes',
					select: function(ele){
						var temp = { "valid" : ele.data().validChunks, "invalid" : ele.data().invalidChunks }
						createPopup( "validInvalid", temp );
					}
				},

				{
					content: 'Data',
					select: function(ele){
						createPopup("data", ele.data());
					}
				},

				{
					content: 'Paths to Here',
					select: function(ele){
						createPopup("pathsToHere", ele.data());
					}
				},

				
			],
			fillColor: 'rgba(0, 92, 128,0.75)',
			activeFillColor: 'rgba(6, 173, 239,0.75)'
		});

		collapseEdges(cytoGraph);			//convert multiple identical edges to one edge with a thicker stroke

		createDropdown();					//create scene selector dropdown menu
		});	
	}

	/*
	creates a popup menu for the right-click node action on the graph
	type:
		-pathsToHere: displays clickpaths that lead to this node, and highlights them on the graph
		-validInvalid: list of valid and invalid fragments at this state point
		-data: list of all data fields for that node
	*/
	
	var createPopup = function(type, data) {

		$("#popup").html("");
		var theHtml = "<div id='popup_close'>X</div>";


		if (type == "pathsToHere") {
			theHtml+="<p><strong>Paths</strong></p><ul>";
			cytoGraph.nodes().removeClass('showPath');
			cytoGraph.edges().removeClass('showPath');

			var pathNum = 1;
			for (var x=0; x < playThroughs.length; x++) {
				var thePlaythrough = playThroughs[x];
				var flagged = false;
				var ids = [];
				for (var y=0; y < thePlaythrough.length; y++) {
					ids.push(thePlaythrough[y].source);					//add node to temp array
					if (thePlaythrough[y].source == data.id) { flagged = true; break; }		//if we encounter the target node, break early
				}
				if (flagged) {
					theHtml+="<li>"
					for (var a=0; a < ids.length; a++) {
						cytoGraph.getElementById(ids[a]).addClass('showPath');
						if (a > 0) {
							cytoGraph.getElementById(ids[a-1]).edgesTo(cytoGraph.getElementById(ids[a])).addClass('showPath');
						}
						theHtml += cytoGraph.getElementById(ids[a]).data('textId') + "->";
					}
					theHtml = theHtml.substring(0, theHtml.length-2);
					theHtml+="</li>";
				}
			}
			theHtml+="</ul>";
		}

		if (type == "validInvalid") {
			theHtml += "<p>Valid</p><ul>";
			for (var x=0; x< data.valid.length; x++) {
				theHtml+= "<li>" + data.valid[x].chunkId + "</li>";
			}
			theHtml += "</ul><p>Invalid</p><ul>";
			for (var x=0; x < data.invalid.length; x++) {
				theHtml+= "<li><strong>" + data.invalid[x].chunkId + "</strong> (" + data.invalid[x].reason + ")</li>";
			}
			theHtml += "</ul>";
		}

		if (type == "data") {
			console.log(data);
			for (var subData in data) {
				switch (subData) {
					case "id":
						theHtml += "<p><strong>ID</strong></p><ul><li>" + data[subData] + "</li></ul>";
					break;
					case "textId":
						theHtml += "<p><strong>textId</strong></p><ul>" + data[subData] + "</li></ul>";
					break;
					case "clickPath":
						theHtml += "<p><strong>ClickPath</strong></p><ul>";
						for (var x=0; x < data[subData].length; x++) {
							theHtml += "<li>" + data[subData][x].source + "</li>";
						}
					break;
					case "invalidChunks":
						/*if (data[subData].length == 0) { theHtml += "<li>none</li>"; }
						for (var x=0; x < data[subData].length; x++) {
							theHtml += "<li>" + data[subData][x].chunkId + "</li>";
						}*/
					break;
					case "validChunks":
						/*
						if (data[subData].length == 0) { theHtml += "<li>none</li>"; }
						for (var x=0; x < data[subData].length; x++) {
							theHtml += "<li>" + data[subData][x].chunkId + "</li>";
						}*/
					break;
					case "wantsSatisfied":
						if (typeof data[subData] !== "undefined") {			//first node is undefined for this var
							theHtml += "<p><strong>Wants Satisfied</strong></p><ul>"
							if (data[subData].length == 0) { theHtml += "<li>(none satisfied)</li>"; }
							else { theHtml += "<li>" + data[subData] + "</li>"; }
						}
					break;
					default:
						theHtml += "<li><p><strong>" + subData + "</strong></p><ul><li>" + JSON.stringify(data[subData], null, 4) + "</li></ul>";
						break;
				}
				
				theHtml += "</ul>";
			}
			//theHtml += JSON.stringify(data, null, 4);
		}
		var left = parseInt($(".cxtmenu div").css("left").substring(0, $(".cxtmenu div").css("left").length - 2)) + 120;
		left = left + "px";
		var top = parseInt($(".cxtmenu div").css("top").substring(0, $(".cxtmenu div").css("top").length - 2)) + 80;
		top = top + "px";

		$("#popup").css({"left":left, "top":top});
		$("#popup").show();
		$("#popup").html(theHtml);

		$("#popup_close").click(function() {
			$("#popup").hide();
		});

		//highlight the paths to this node on the graph 
		if (type == "pathsToHere") {
			$("#popup .goto").click(function() {
				gotoChoice(ele.data().clickPath, story, levelData, globalData, function() {stepStory(ele.data().clickPath);});
				$("#storyContainer.editor").show();
			});
		}

	}

	//takes cytoscape graph object, finds parallel edges, and removes them if they are parallel (preserving playthrough data)
	var collapseEdges = function(cytoGraph) {
		var deleteList = [];		//list of edge ids to delete
		var saveList = [];
		for (var x=0; x < cytoGraph.edges().length; x++) {			//for each edge...
			var currentEdge = cytoGraph.edges()[x];

			if (currentEdge.codirectedEdges().length > 1 && deleteList.indexOf(currentEdge.id()) == -1) {		//if there's an identical edge...

				saveList.push(currentEdge.id());				//add it to the saveList (so we keep at least one)

				for (var y=0; y < currentEdge.codirectedEdges().length; y++) {		//for each identical edge...
					var codirectedEdge = currentEdge.codirectedEdges()[y];
					
					if (codirectedEdge.id() !== currentEdge.id()							//if it's not the same edge,
					//&& codirectedEdge.data().choiceText == currentEdge.data().choiceText 	//and they have the same label,
					&& saveList.indexOf(codirectedEdge.id()) == -1) {						// and it isn't on the save list...
						deleteList.push({ 'delete': codirectedEdge.id(), 'addWeight': currentEdge.id() });
					}
				}

			}
		}

		deleteList.filter(function(item, pos) { return deleteList.indexOf(item) == pos; });		//de-duplicate list
		deleteList.forEach(function(theId) {
			cytoGraph.remove("#" + theId.delete);
			if (typeof cytoGraph.getElementById(theId.addWeight).data() !== "undefined") {
				cytoGraph.getElementById(theId.addWeight).data().weight += 3;
			}
		});
		for (var x=0; x < cytoGraph.edges().length; x++) {
			if (cytoGraph.edges()[x].data('weight')/3 > 1) {
				var newText = "(" + (cytoGraph.edges()[x].data('weight')/3) + "x) " + cytoGraph.edges()[x].data('choiceText');		//set text to "(2x) blahblah"
				cytoGraph.edges()[x].data('choiceText', newText);
			}
		}

		cytoGraph.style()
			.selector('edge')
				.style({
					'width': 'data(weight)',
					'label' : 'data(choiceText)',

				})
		.update();

	}




    var instructionHtml = "<div id='instructions'><h2>Instructions</h2><ul><li>Use dropdown to switch between scenes or change # of playthroughs</li><li>Right-click on nodes for contextual menus</li><li>Graph can pan and zoom using scrollwheel / click and drag</div>"

    $('body').append(instructionHtml + "<div id='cyto'></div><!--<button id='submit'>Save JSON file</button><button id='restore'>Reset Changes</button><span id='valid_indicator'></span><div id='editor_holder'></div>--><div id='storyContainer' class='editor'></div><div id='popup'></div>");

    createUI();
  	createGraph();


});