define(["Templates", "text!avatars", "jQuery", "jQueryUI"], function(Templates, avatarsData) {

	var State;
	var Coordinator;

	//var interfaceMode = "normal";			//how scenes progress...a timeline that's returned to ("timeline") or progress scene-to-scene ("normal")
	//var avatarMode = "oneMain";				//oneMain means just one main character, otherwise "normal" RPG style

	//var sandboxMode = false;				//whether to start it in sandbox mode with everything activated

	//initializes our copy of State and Coordinator
	var init = function(_Coordinator, _State) {
		State = _State;
		Coordinator = _Coordinator;

		State.set("displayType", "notEditor");		//this is so we properly end scenes, etc. and don't do editor/viz stuff
	}

	var makeLink = function(_coordinator, id, content, target) {
		
		var pTag = $('<p/>', {
		    class: 'titleLink',
		});

		var linkId = id;
		if (id.indexOf(":") > -1) { linkId = id.split(":")[1]; }

		$('<a/>', {
		    href: target,
		    id: "startScene_" + linkId,
		    text: content,
		    click: function() {
				$( "#blackout" ).fadeIn( "slow", function() {
	    			startScene(_coordinator,id, true);
  				});
			}
		}).appendTo(pTag);

		return pTag;
	}

	var startScene = function(_coordinator, id, loadIntro) {

		if (id.substring(0,6) == "intro:") {		//if we're just using the intro as an interstitial scene, not actually running the game...
			initSceneScreen(State, bg, id);
			_coordinator.loadSceneIntro(id);
			State.set("currentScene", id);
		}
		else {
			_coordinator.cleanState(id);
			var bg = _coordinator.loadBackground(id);
			processWishlistSettings(_coordinator, id);
			initSceneScreen(State, bg, id);
			if (loadIntro) { _coordinator.loadSceneIntro(id); }
			_coordinator.loadAvatars(id);
			_coordinator.validateArtAssets(id);
			_coordinator.loadStoryMaterials(id);
		}
	}
/*
	var startGraphScene = function(_coordinator, id, loadIntro) {

		$("#graphClickBlocker").hide();			//turn off click blocker

		if (id.substring(0,6) == "intro:") {		//if we're just using the intro as an interstitial scene, not actually running the game...
			initSceneScreen(State, bg, id);
			_coordinator.loadSceneIntro(id);
			State.set("currentScene", id);
		}
		else {
			_coordinator.cleanState(id);
			var bg = _coordinator.loadBackground(id);
			processWishlistShimmers(_coordinator, id);
			initSceneScreen(State, bg, id);
			if (loadIntro) { _coordinator.loadSceneIntro(id); }
			_coordinator.loadAvatars(id);
			_coordinator.validateArtAssets(id);
			_coordinator.loadStoryMaterials(id);
		}
	}
	*/

	//This function creates the title screen inside a div called "titleScreen" and appends that to the body
	//If you want to change the title screen, this is where to do it!
	var initTitleScreen = function(_Coordinator, _State, scenes, playGameScenes, initialize = true) {

		if (initialize) { init(_Coordinator, _State); }				//initialize our copy of the coordinator and state
		
		$('<div/>', {
			id: 'titleScreen'
		}).appendTo('body');

		$('<h1/>', {
		    text: _Coordinator.settings.gameTitle,
		    id: 'title'
		}).appendTo('#titleScreen');

		var begin = $('<h2/>', {
			text: 'Begin',
			id: 'begin',
			click: function() {
				$( "#blackout" ).fadeIn( "slow", function() {
	    			startScene(_Coordinator, playGameScenes[0], true);
  				});
			}
		}).appendTo('#titleScreen');

		$('<h2/>', {
		    text: 'Scene Selection',
		    id: 'sceneSelectTitle',
		    style: 'margin-top:0px'
		}).appendTo('titleScreen');

		// For each scene, make a link to start it.
		for (var scene in scenes) {
			var el = makeLink(_Coordinator, scene, scene, "#");
			$('#titleScreen').append(el);
			$('#titleScreen').append("<div id='hiddenKnobs'></div>");
			createKnobs(scene, "hiddenKnobs");
			populateKnobs(scene, _Coordinator, _State, scenes);
		};


		//blackout div that's used for fading in and out between screens
		$('<div/>', {
		    id: 'blackout'
		}).appendTo('body');
	}

	//Resets the HTML and re-initializes the title screen
	var returnToTitleScreen = function(_Coordinator, _State, scenes, playGameScenes) {
		$('body').empty();			//reset all html
		$('body').css("background-image", "none");
		initTitleScreen(_Coordinator, _State, scenes, playGameScenes, false);
	}

	//---------Functions for the timeline UI-----------------------------
	var initTimelineScreen = function(_Coordinator, _State, scenes) {
		init(_Coordinator, _State);				//initialize our copy of the coordinator and state

		var theDiv = $('<div/>', {			//make container
		    id: 'timeline'
		}).appendTo('body');

		$('<div/>', {
		    id: 'blackout'
		    //text: ''
		}).appendTo('body');

		for (var scene in scenes) {					//make scene / knob containers		

			$("#timeline").append("<div id='"+scene+"-panel' class='scenePanel'></div>");

			var yearStr;
			//if (_Coordinator.getStorySpec(scene))

			var dateClass = 'date';
			var dateText = "&nbsp;";
			if (typeof _Coordinator.getStorySpec(scene).year !== "undefined") {
				dateClass = 'date';
				dateText = _Coordinator.getStorySpec(scene).year;
			}
			var date = $('<div/>', {
				id: 'date_' + scene,
				class: dateClass,
				html: dateText
			}).appendTo("#" + scene + '-panel');

			var theDiv = $('<div/>', {
			    id: 'scene_' + scene,
			    class: 'sceneWindows',
			    html: '<p>' + _Coordinator.loadTimelineDesc(scene) + '</p>'
			}).appendTo("#" + scene + '-panel');

			$("#scene_" + scene).click(function() {
				$('.sceneKnobs:visible').slideToggle("slow", function() {});
				$('#knobs_' + scene).slideToggle("slow", function() {});

				$('.sceneWindows.active').toggleClass('active', 500);
				$(this).toggleClass('active', 500);
			});

			var targetDiv = scene + '-panel';
			createKnobs(scene, targetDiv);
			populateKnobs(scene, _Coordinator, _State, scenes);
		};

		initMetaKnobs(_Coordinator, _State);	//initiate meta knobs (after we've made scene knobs, so we can give default meta-knob values)

		activateBegins(_Coordinator, _State, scenes);

		//if we haven't sent form data yet, send it
		postTrackingStats();
		
		//if we don't have a unique tracking identifier for the player, set it	
		if (localStorage.getItem("playerIdentifier") == null) { setPlayerIdentifier(); }
	}

	var returnToTimelineScreen = function(scenes) {

		$('body').empty();			//reset all html
		$('body').css("background-image", "none");

		var theDiv = $('<div/>', {			//make container
		    id: 'timeline'
		}).appendTo('body');

		$('<div/>', {
		    id: 'blackout'
		    //text: ''
		}).appendTo('body');

		for (var scene in scenes) {				//make scene / knob containers		


			$("#timeline").append("<div id='"+scene+"-panel' class='scenePanel'></div>");

			var date = $('<div/>', {
				id: 'date_' + scene,
				class: 'date',
				html: '<span>' + Coordinator.getStorySpec(scene).year + '</span>'
			}).appendTo("#" + scene + '-panel');

			var theDiv = $('<div/>', {
			    id: 'scene_' + scene,
			    class: 'sceneWindows',
			    html: '<p>' + Coordinator.loadTimelineDesc(scene) + '</p>'
			}).appendTo("#" + scene + '-panel');

			$("#scene_" + scene).click(function() {
				$('.sceneKnobs:visible').slideToggle("slow", function() {});
				$('#knobs_' + scene).slideToggle("slow", function() {});

				$('.sceneWindows.active').toggleClass('active', 500);
				$(this).toggleClass('active', 500);
			});

			var theKnobs = $('<div/>', {
			    id: 'knobs_' + scene,
			    class: 'sceneKnobs closed'
			}).appendTo("#" + scene + '-panel');

			populateKnobs(scene, Coordinator, State, scenes);
		};

		initMetaKnobs(Coordinator, State);	//initiate meta knobs (after we've made scene knobs, so we can give default meta-knob values)

		activateBegins(Coordinator, State, scenes);

		//if we haven't sent form data yet, send it
		postTrackingStats();
	}
	//------end of functions for Timeline UI----------------------------------------------

	var setUISceneContent = function(content, contentIndex, toggleableTitle) {
		State.set("UIselectedLevel", content[contentIndex].beginScene);
		State.set("UIlastContentIndex", contentIndex);

		var mainTextAssets = Templates.interactiveRender(content[contentIndex].text);
		$("#mainTextContent").html(mainTextAssets.txt);
		attachClickEvents(mainTextAssets.textEvents);
		$("#climateFacts .title").html(content[contentIndex].climateFacts[0].title);
		$("#climateFacts .text").html(content[contentIndex].climateFacts[0].text);

		if (toggleableTitle) {
			$("#mainTextContent h3").addClass("mutable");

			$("#mainTextContent h3").on( "click", function(event) {
				if ($("#mainTextContent h3").html().includes("UN Scene")) {
					State.set("lifelongAcademic", false);
					setUISceneContent(content, contentIndex.substr(0, contentIndex.lastIndexOf("_")), toggleableTitle);
				}
				else {
					State.set("lifelongAcademic", true);
					setUISceneContent(content, contentIndex + "_alt", toggleableTitle);
				}
			});
		}
	}

	//simple helper function that binds click events to template text
	var attachClickEvents = function(textEventsArray) {
		for (var x=0; x < textEventsArray.length; x++) {
			var textEvent = textEventsArray[x];
			$("#" + textEvent.elemId).on("click", {
				funcName: textEvent.funcName
			}, textClickFuncs);
			
			$("#" + textEvent.elemId).trigger("click");	//hacky: run it once to populate dynamic wishlist variables in localstorage
		}
	}

	//functions attached to shimmer text
	//var textClickFuncs = function(functionName, oldVal, divId) {
	var textClickFuncs = function(event) {
		var functionName = event.data.funcName;
		var oldVal = event.target.innerHTML;
		var divId = event.target.id;
	
		var funcs = {
			//Dinner Scene funcs-----------------------------
			"studyShimmer" : function(oldVal) {

				var shimmerVals = ["phytoplankton", "coral", "lobsters"];
				var i = shimmerVals.indexOf(oldVal) + 1;
				if (i == shimmerVals.length) { i = 0; }

				setDynamicWishlistItem("state: set areaOfExpertise [phytoplankton|lobsters|coral]", shimmerVals[i]);
				
				return shimmerVals[i];
			},
			"friendBalance" : function(oldVal) {
				var shimmerVals = [
					{text : "They're both activists, unlike you.", val1 : 0, val2 : 2}, 
					{text : "One of them is an academic like you, and one is an activist.", val1 : 1, val2 : 1}, 
					{text : "Both of them are academics like you.", val1 : 2, val2 : 0}
				];
				var i = shimmerVals.findIndex(function(ele) { return ele.text==oldVal}) + 1;
				if (i == shimmerVals.length) { i = 0; }

				setDynamicWishlistItem("state: set academicFriend [0-2:1]", shimmerVals[i].val1);
				setDynamicWishlistItem("state: set activistFriend [0-2:1]", shimmerVals[i].val2);
				return shimmerVals[i].text;

			},
			"friendSupport" : function(oldVal) {
				var shimmerVals = [
					{text : "Both of them are a bit critical.", val1 : 0, val2: 2}, 
					{text : "One of them is supportive, but the other is more critical.", val1 : 1, val2: 1}, 
					{text : "Both of them are supportive.", val1 : 2, val2: 0}
				];
				var i = shimmerVals.findIndex(function(ele) { return ele.text==oldVal}) + 1;
				if (i == shimmerVals.length) { i = 0; }

				setDynamicWishlistItem("state: set supportiveFriend [0-2:1]", shimmerVals[i].val1);
				setDynamicWishlistItem("state: set challengingFriend [0-2:1]", shimmerVals[i].val2);
				
				return shimmerVals[i].text;
			},

			//Lecture Scene funcs---------------------------
			"topicShimmer" : function(oldVal) {

				var shimmerVals = ["acidity", "warming"];
				var i = shimmerVals.indexOf(oldVal) + 1;
				if (i == shimmerVals.length) { i = 0; }

				setDynamicWishlistItem("lectureTopic eq [acidity|warming]", shimmerVals[i]);
				
				return shimmerVals[i];
			},
			"subjectShimmer" : function(oldVal) {

				var shimmerVals = ["phytoplankton", "lobsters", "coral"];
				var i = shimmerVals.indexOf(oldVal) + 1;
				if (i == shimmerVals.length) { i = 0; }

				setDynamicWishlistItem("areaOfExpertise eq [phytoplankton|lobsters|coral]", shimmerVals[i]);
				
				return shimmerVals[i];
			},
			"classSizeShimmer" : function(oldVal) {

				var shimmerVals = [
					{text : "large lecture", val : "lecture"}, 
					{text : "small seminar", val : "seminar"}
				];
				var i = shimmerVals.findIndex(function(ele) { return ele.text==oldVal}) + 1;
				if (i == shimmerVals.length) { i = 0; }

				setDynamicWishlistItem("classSize eq [lecture|seminar]", shimmerVals[i].val);
				
				return shimmerVals[i].text;
			},
			"classFriendliness" : function(oldVal) {
				var shimmerVals = [
					{text : "which should mesh well with the friendliness of the students", val1 : 0, val2: 3}, 
					{text : "which should help with the mostly friendly students", val1 : 1, val2: 2}, 
					{text : "which should help with the mix of mostly antagonistic students", val1 : 2, val2: 1}, 
					{text : "which will hopefully help with the notoriously antagonistic students", val1 : 3, val2: 0}
				];
				var i = shimmerVals.findIndex(function(ele) { return ele.text==oldVal}) + 1;
				if (i == shimmerVals.length) { i = 0; }

				setDynamicWishlistItem("state: optimisticStudent eq [0-3:2]", shimmerVals[i].val1);
				setDynamicWishlistItem("state: antagonisticStudent eq [0-3:1]", shimmerVals[i].val2);
				
				return shimmerVals[i].text;
			},
			//Beach scene funcs---------------------------------------------
			"protagIdentity" : function(oldVal) {

				var shimmerVals = [
					{text : "left academia and", val : "academic"}, 
					{text : "shifted your activist focus and", val : "activist"}
				];
				var i = shimmerVals.findIndex(function(ele) { return ele.text==oldVal}) + 1;
				if (i == shimmerVals.length) { i = 0; }

				setDynamicWishlistItem("protagonistIdentity eq [academic|activist]", shimmerVals[i].val);
				
				return shimmerVals[i].text;
			},
			"coworkerRelationShimmer" : function(oldVal) {

				var shimmerVals = [
					{text : "new", val : "unfamiliar"}, 
					{text : "long-time", val : "familiar"}
				];
				var i = shimmerVals.findIndex(function(ele) { return ele.text==oldVal}) + 1;
				if (i == shimmerVals.length) { i = 0; }

				setDynamicWishlistItem("state: set coworkerRelation eq [unfamiliar|familiar]", shimmerVals[i].val);
				
				return shimmerVals[i].text;
			},
			"coworkerIdentity" : function(oldVal) {

				var shimmerVals = [
					{text : "an activist", val : "activist"}, 
					{text : "a fellow former academic", val : "academic"}
				];
				var i = shimmerVals.findIndex(function(ele) { return ele.text==oldVal}) + 1;
				if (i == shimmerVals.length) { i = 0; }

				setDynamicWishlistItem("state: set coworkerIdentity [activist|academic]", shimmerVals[i].val);
				
				return shimmerVals[i].text;
			},
			"protagOptimism" : function(oldVal) {

				var shimmerVals = [
					{text : "pessimism doesn't rub him the wrong way", val : "low"}, 
					{text : "optimism rubs off on him a bit", val : "high"}
				];
				var i = shimmerVals.findIndex(function(ele) { return ele.text==oldVal}) + 1;
				if (i == shimmerVals.length) { i = 0; }

				setDynamicWishlistItem("state: set protagonistOptimism eq [high|low]", shimmerVals[i].val);
				
				return shimmerVals[i].text;
			},
			"coworkerOptimism" : function(oldVal) {

				var shimmerVals = [
					{text : "pessimism", val : "low"}, 
					{text : "optimism", val : "high"}
				];
				var i = shimmerVals.findIndex(function(ele) { return ele.text==oldVal}) + 1;
				if (i == shimmerVals.length) { i = 0; }

				setDynamicWishlistItem("state: set coworkerOptimism [low|high]", shimmerVals[i].val);
				
				return shimmerVals[i].text;
			},
		}

		var animations = $.chain(function() {
		    return $("#" + divId).toggle("highlight");
		}, function() {

			return $("#" + divId).html(funcs[functionName]($("#" + divId).html()));
		}, function() {
			return $("#" + divId).fadeIn("fast");
		});

		
	}

	//sets wishlist items from when knobs are twiddled
	var setDynamicWishlistItem = function(itemKey, itemValue) {
		var bbWishlist = parseBlackboardWishlist();
		if (bbWishlist[State.get("UIselectedLevel")] == undefined) {
			bbWishlist[State.get("UIselectedLevel")] = {};
		}
		bbWishlist[State.get("UIselectedLevel")][itemKey] = itemValue;
		State.set("wishlists", JSON.stringify(bbWishlist));
	}

	var parseBlackboardWishlist = function() {
		var bbWishlist = State.get("wishlists");
		if (bbWishlist !== undefined) { return JSON.parse(bbWishlist);	}
		else { return {}; }
	}

	//process the wishlist for the passed in story according to its current settings in the UI
	var processWishlistSettings = function(_Coordinator, id) {

		var knobList = [];
		var widgetNum = 0;
		var story = _Coordinator.getStorySpec(id);
		var knobsWishlistStateSettingsCache = [];				//a cache we store in case we need to use it later (just used for viz right now)

		for (var x=0; x < story.wishlist.length; x++) {
			if (story.wishlist[x].condition.includes("[") && !story.wishlist[x].condition.includes("game_mode")) {
				
				State.set("dynamicWishlist", true);			//set flag that we have a dynamic wishlist (so we know to look it up later)
				
				var stateSetter = false;			//whether it's a state setter, not a wishlist setter
				story.wishlist[x].condition.replace("State:", "state:");		//correct capitalization if necessary
				if (story.wishlist[x].condition.includes("state:")) { stateSetter = true; }

				if (story.wishlist[x].condition.includes("-")) {			//it's a slider
					var value = $("#" + story.id + "-slider-" + x).slider("option", "value");
					if (stateSetter) {
						var key = story.wishlist[x].condition.replace("state:","").trim().split(" ")[1];
						State.set(key, value);
						knobsWishlistStateSettingsCache.push({"type" : "stateSetter", "key" : key, "value" : value});
					}
					else {
						story.wishlist[x].condition = story.wishlist[x].condition.replace(/\[.*?\]/g, value);
					}
					widgetNum++;
				}
				else if (story.wishlist[x].condition.includes("|")) {	//it's a dropdown
					var value = $("#" + story.id + "-select-" + x).val();
					if (stateSetter) {
						var key = story.wishlist[x].condition.replace("state:","").trim().split(" ")[1];
						State.set(key, value);
						knobsWishlistStateSettingsCache.push({"type" : "stateSetter", "key" : key, "value" : value});
					}
					else {
						story.wishlist[x].condition = story.wishlist[x].condition.replace(/\[.*?\]/g, value);
					}
					widgetNum++;
				}
				else {									//it's a switch
					var value = $("#" + story.id + "-switch" + x).val();
					if (value == "on") {		//if it's on, remove brackets
						story.wishlist[x].condition = story.wishlist[x].condition.replace(/^\[(.+)\]$/,'$1');
					}
					else {			//otherwise, remove it
						story.wishlist.splice(x,1);
					}
					widgetNum++;
				}
				delete story.wishlist[x].label;
				delete story.wishlist[x].hoverText;
				delete story.wishlist[x].changeFunc;

				if (stateSetter) { delete story.wishlist[x]; }		//if it's a state setter, just remove whole thing
				
			}
			else if (story.wishlist[x].condition.includes("game_mode")) {
				var value = $("#" + story.id + "-select-" + x).val();
				if (value !== "random") { State.set("gameModeChosen",value); }			//if they chose a non-random value, set it
				delete story.wishlist[x];					//remove it from the list, as it's not actually a wishlist item
			}
		}

		State.set("processedWishlist", story.wishlist);
		State.set("knobsWishlistStateSettingsCache", knobsWishlistStateSettingsCache);
	}

	//processes current shimmer values by looking them up in localStorage and updating wishlist items
	var processWishlistShimmers = function(_Coordinator, id) {
		var story = _Coordinator.getStorySpec(id);
		var knobsWishlistStateSettingsCache = [];			//a cache we store in case we need to use it later (just used for viz right now)

		for (var x=0; x < story.wishlist.length; x++) {
			if (story.wishlist[x].condition.includes("[") && !story.wishlist[x].condition.includes("game_mode")) {
				State.set("dynamicWishlist", true);			//set flag that we have a dynamic wishlist (so we know to look it up later)
				var stateSetter = false;			//whether it's a state setter, not a wishlist setter
				story.wishlist[x].condition.replace("State:", "state:");		//correct capitalization if necessary
				if (story.wishlist[x].condition.includes("state:")) { stateSetter = true; }

				var bbWishlistValues = parseBlackboardWishlist()[id];
				if (bbWishlistValues == undefined) { throw "dynamic wishlist item (" + story.wishlist[x].condition + ") but no dynamic shimmers used to set them!"}
				var value = bbWishlistValues[story.wishlist[x].condition];
				if (value == undefined) { throw "no shimmertext value for " + story.wishlist[x].condition; }
				if (stateSetter) {
					var key = story.wishlist[x].condition.replace("state:","").trim().split(" ")[1];
					State.set(key, value);
					knobsWishlistStateSettingsCache.push({"type" : "stateSetter", "key" : key, "value" : value});
				}
				else {
					story.wishlist[x].condition = story.wishlist[x].condition.replace(/\[.*?\]/g, value);
				}
			}
			else if (story.wishlist[x].condition.includes("game_mode")) {		//game mode dynamic wishlist items
				throw "there shouldn't be dynamic game settings in the wishlists now!"
				/* 
				var value = $("#" + story.id + "-select-" + x).val();
				if (value !== "random") { State.set("gameModeChosen",value); }			//if they chose a non-random value, set it
				delete story.wishlist[x];					//remove it from the list, as it's not actually a wishlist item
				*/
			}

			//these shouldn't even be necessary any more, remove once confirmed
			delete story.wishlist[x].label;
			delete story.wishlist[x].hoverText;
			delete story.wishlist[x].changeFunc;

			if (stateSetter) { delete story.wishlist[x]; }		//if it's a state setter, just remove whole thing
		}

		State.set("processedWishlist", story.wishlist);
		State.set("knobsWishlistStateSettingsCache", knobsWishlistStateSettingsCache);

	}

	//activate begin links in timeline UI
	var activateBegins = function(_Coordinator, _State, scenes) {
		$(".beginScene").click(function(evnt) { 
			evnt.stopPropagation(); 
			var sceneId = $(this).attr( "id" ).split("-")[1];
			$( "#blackout" ).fadeIn( "slow", function() {
    			startScene(_Coordinator, sceneId, true);
			});
		});
	}

	var initMetaKnobs = function(_Coordinator, _State) {
		//TODO
	}

	var createKnobs = function(sceneId, targetDivId) {
		var theKnobs = $('<div/>', {
		    id: 'knobs_' + sceneId,
		    class: 'sceneKnobs closed'
		}).appendTo("#" + targetDivId);
	}

	//activate and add in knobs for coordinator stuff
	var populateKnobs = function(sceneId, _Coordinator, _State, scenes) {
		var sceneSpec = _Coordinator.getStorySpec(sceneId);

		if (sceneSpec == null) { 
			console.log("no sceneSpec for scene to use to populate knobs!");
			return;
		}

		var sliderX = [];
		for (var x=0; x < sceneSpec.wishlist.length; x++) {
			
			if (sceneSpec.wishlist[x].condition.includes("[")) {		//if the wishlist item has [] in it...
				var knobHtml = "";
				var regExp = /\[([^)]+)\]/;
				var knobString = regExp.exec(sceneSpec.wishlist[x].condition)[1];
				
				var theLabel;			//set up label stuff if they have it
				if (sceneSpec.wishlist[x].label != null) { theLabel = sceneSpec.wishlist[x].label; }
				else { theLabel = sceneSpec.wishlist[x].condition.replace(/ *\[[^)]*\] */g, ""); }

				var hoverTextClass = "";
				var hoverText;
				if (sceneSpec.wishlist[x].hoverText != null) { 		//set up hovertext stuff if they have it
					hoverTextClass = " class='tooltip'"; 
					hoverText = "<span class='tooltiptext'>"+sceneSpec.wishlist[x].hoverText + "</span>"; 
				}

				if (knobString.includes("-")) {			//range slider (e.g. "confidence eq [0-4]")
					if (!knobString.includes(":")) { throw knobString + " needs a default value!"}
					var minValStart = knobString.indexOf("[") + 1;
					var minValEnd = knobString.indexOf("-");
					var minVal = knobString.substring(minValStart,minValEnd);		//get min value
					var maxValStart = knobString.indexOf("-") + 1;
					var maxValEnd = knobString.indexOf(":");
					var maxVal = knobString.substring(maxValStart,maxValEnd);		//get max value
					knobHtml += '<label for="'+ sceneId +'-slider-' + x.toString() +'"'+ hoverTextClass +'>'+hoverText+theLabel+'</label><div id="'+ sceneId +'-slider-' + x.toString() +'"><div id="custom-handle-'+ sceneId + '_' + x.toString() +'" class="ui-slider-handle"></div></div>';
					$("#knobs_" + sceneId).append(knobHtml);
					sliderX.push({xVal:x, min: minVal, max: maxVal, knobString: knobString});
					$( function() {
						var data = sliderX.shift();
						var knobString = data.knobString;
				    	var handle = $( "#custom-handle-"+ sceneId + "_" + data.xVal.toString() );
					    $( "#" + sceneId + "-slider-" + data.xVal.toString() ).slider({
					    	create: function() { 
					    		var sliderDefaultStart = knobString.indexOf(":")+1;
								var sliderDefaultEnd = knobString.length;
					    		$(this).slider('value', knobString.substring(sliderDefaultStart,sliderDefaultEnd));
					    		handle.text( $( this ).slider( "value" ) ); 
					    	},
					      	slide: function( event, ui ) { handle.text( ui.value );	},
					      	stop: function(event, ui) {
					      		if (sceneSpec.wishlist[data.xVal].changeFunc !== null){
					      			runChangeFunc(this, sceneSpec.wishlist[data.xVal].changeFunc);
					      		}
					      	},
					      	min: parseFloat(data.min),
					      	max: parseFloat(data.max),
					      	step: 1
					    });
					});
					

					
				}
				else if (knobString.includes("|")) {		//dropdown w/ options (e.g. "career eq [shrimp|lobster]")
					var theLabel;
					if (sceneSpec.wishlist[x].label != null) { theLabel = sceneSpec.wishlist[x].label; }
					else { theLabel = sceneSpec.wishlist[x].condition.replace(/ *\[[^)]*\] */g, ""); }

					knobHtml += "<label for='"+ sceneId +"-select-"+x+"'"+ hoverTextClass +">"+hoverText+theLabel+"</label><select id='"+ sceneId +"-select-"+x+"' class='selectKnob'>";
					var theOptions = knobString.split("|");
					for (var y=0; y < theOptions.length; y++) {
						knobHtml += '<option value="'+ theOptions[y] +'">'+ theOptions[y] +'</option>';
					}
					knobHtml += "</select>";
					$("#knobs_" + sceneId).append(knobHtml);
					$("#knobs_" + sceneId).append("<br class='clearFloat'/>");
				}
				else {			//otherwise must be an on/off switch (e.g. "[introFriends eq true]")
					var theLabel;
					if (sceneSpec.wishlist[x].label != null) { theLabel = sceneSpec.wishlist[x].label; }
					else { theLabel = sceneSpec.wishlist[x].condition; }
					knobHtml += '<div class="switch-container">';
					knobHtml += '<label class="switch" for="'+ sceneId +'-switch'+ x +'"'+hoverTextClass+'>'+hoverText+'<input type="checkbox" id="'+ sceneId +'-switch'+x+'" checked="checked"><span class="slider round"></span></label>';
					knobHtml += '<span class="switch-label">'+ theLabel +'</span>';
					knobHtml += "</div>"
					$("#knobs_" + sceneId).append(knobHtml);
					$("#knobs_" + sceneId).append("<br class='clearFloat'/>");
				}				
				
			}
		}

	}

	var runChangeFunc = function(changingElement, functionName) {
		switch (functionName) {
			case "studentBalance":
				studentBalance(changingElement);
				break;
			case "friendBackgroundBalance":
				friendBackgroundBalance(changingElement);
				break;
			case "friendSupportivenessBalance":
				friendSupportivenessBalance(changingElement);
				break;
		}
	}

	//-------------KNOB TWIDDLING FUNCTIONS-------------------------------------------
/*
	var studentBalance = function(changer) {
		var partnerSlider;
		if (changer.id == "finalLecture-slider-11") { partnerSlider = "#finalLecture-slider-12"}
		else { partnerSlider = "#finalLecture-slider-11"; }
		var currentValue = $("#" + changer.id).slider('value');
		$(partnerSlider).slider('value', (3-currentValue));
		$(partnerSlider).find(".ui-slider-handle").text((3-currentValue));
	}

	var friendBackgroundBalance = function(changer) {
		var sliders = $('#knobs_finalDinner .ui-slider').toArray();
		var changerIndex = sliders.indexOf(changer);
		var partnerIndex = (changerIndex % 2 === 0) ? changerIndex + 1 : changerIndex - 1;
		var partnerSlider = sliders[partnerIndex];
		var currentValue = $("#" + changer.id).slider('value');
		$(partnerSlider).slider('value', (2-currentValue));
		$(partnerSlider).find(".ui-slider-handle").text((2-currentValue));
	}

	var friendSupportivenessBalance = function(changer) {
		var sliders = $('#knobs_finalDinner .ui-slider').toArray();
		var changerIndex = sliders.indexOf(changer);
		var partnerIndex = (changerIndex % 2 === 0) ? changerIndex + 1 : changerIndex - 1;
		var partnerSlider = sliders[partnerIndex];
		var currentValue = $("#" + changer.id).slider('value');
		$(partnerSlider).slider('value', (2-currentValue));
		$(partnerSlider).find(".ui-slider-handle").text((2-currentValue));
	}
	*/
//------------------------------------------------------------------------------------
	//builds the scene divs
	var initSceneScreen = function(State, bg, id) {

		$('#titleScreen').hide();
		$('body').css("background-image", "url('"+ bg +"')"); 

		if ($("#totalGameContainer").length == 0) {
			$('<div/>', {
			    id: 'totalGameContainer'
			    //text: ''
			}).appendTo('body');

			$('<div/>', {
			    id: 'storyContainer'
			    //text: ''
			}).appendTo('#totalGameContainer');

			$('<div/>', {
			    id: 'statsContainer',
			    //text: ''
			}).appendTo('#totalGameContainer');

			$('<div/>', {
			    id: 'sceneIntro'
			    //text: ''
			}).appendTo('#totalGameContainer');

			$('<div/>', {
			    id: 'blackout'
			    //text: ''
			}).appendTo('#totalGameContainer');
		}

		else {
			$("#totalGameContainer").show();
		}

		if (Coordinator.settings.avatarMode == "oneMain") {
			$("#statsContainer").addClass("oneMain");
			$("#storyContainer").addClass("oneMain");
		}

		initStatsUI(State);
	}

	var initStatsUI = function(State) {

		$('<div/>', {
		    id: 'storyStats'
		    //text: ''
		}).appendTo('#stats');

		$('<div/>', {
		    id: 'gameStats'
		    //text: ''
		}).appendTo('#stats');
	}

	/*
		Sets avatar on-screen based on state
	*/
	var setAvatars = function() {
		
		if (typeof State.get("characters") !== "undefined") {
			State.get("characters").forEach(function(char, pos) {
				var url = false;
				var defaultSrc;
				var avatar = State.avatars.filter(function( avatar ) { return avatar.id == char.id; })[0];

				for (var x=0; x < avatar.avatarStates.length; x++) {			//check all avatar states to find true one
					var correctAvatar = false;
					if (avatar.avatarStates[x].state[0] == "default") {
						defaultSrc = avatar.avatarStates[x].img;
					}
					else {			//don't evaluate default avatars
						var allTrue = true;
						for (var y=0; y < avatar.avatarStates[x].state.length; y++) {
							if (!State.isTrue(avatar.avatarStates[x].state[y])) {
								allTrue = false;
								break;
							}
						}
						if (allTrue) {			//if it's valid...
							//url = getAvatar(avatar.graphics, avatar.age, avatar.avatarStates[x].src);		//get avatar URL
							url = avatar.avatarStates[x].img;
							break;
						}
					}
				}

				//fallback to default if no state valid
				if (!url) { 

					//url = getAvatar(avatar.graphics, avatar.age, defaultSrc); 
					url = defaultSrc;
				}

				var picClass = "supportingChar";
				if (pos == 0) { picClass = "mainChar" }

				if (Coordinator.settings.avatarMode == "oneMain") {		//if we're in the mode where there's just one portrait for the main character...

					var fragmentPortraitChar = State.get("currentAvatar");		//grab the avatar for this fragment. If there isn't one, default to main character
					if (typeof fragmentPortraitChar == "undefined") {
						fragmentPortraitChar = State.get("characters")[0].id;
					}
					if (avatar.id == fragmentPortraitChar) {
						if (document.getElementById('mainAvatar') == null){			//if div doesn't exist, create it
							$('<div/>', {
								id: "mainAvatarDiv",
								class: 'statContainer oneMain'
							}).appendTo('#statsContainer');

							$('<div/>', {			//create avatarBox and stat-holding box for character
							    id: "mainAvatar",
							    class: picClass + " oneMain"
							}).appendTo('#mainAvatarDiv');

							createStats();
						}

						$('#mainAvatar').css("background-image", "url("+url+")"); 					//set avatar
						$('#mainAvatar').html("<div class='nameLabel'>" + char.properties.name + "</div>");	//set name label
					}

					else {
						if (document.getElementById(char.id) == null){			//if div doesn't exist, create it
							$('<div/>', {
								id: char.id,
								class: 'statContainer hidden'
							}).appendTo('#statsContainer');

							$('<div/>', {			//create avatarBox and stat-holding box for character
							    id: 'charPic_' + char.id,
							    class: picClass + " hidden"
							}).appendTo('#' + char.id);

							createStats();
						}
					}

				}

				else {				//otherwise if it's one portrait per character...(rpg style)
					if (document.getElementById(char.id) == null){			//if div doesn't exist, create it
						$('<div/>', {
							id: char.id,
							class: 'statContainer'
						}).appendTo('#statsContainer');

						$('<div/>', {			//create avatarBox and stat-holding box for character
						    id: 'charPic_' + char.id,
						    class: picClass
						}).appendTo('#' + char.id);

						createStats();
					}
					
					if (url) { 		//set avatar
						//$('#charPic').css("background-image", "url(/assets/avatar/"+ theAvatar.src +")"); 
						$('#charPic_' + char.id).css("background-image", "url("+url+")"); 
					}

					if (picClass == "supportingChar") { 
						$('#charPic_' + char.id).html("<div class='nameLabel'>" + char.properties.name + "</div>");
					}
				}
			});
		}	
	}

/*
	//returns asset url for an avatar of a given tag, in a given set
	var getAvatar = function(set, age, tag) {
		var avatarsObj = HanSON.parse(avatarsData);
		avatarSet = avatarsObj.filter(function( avatar ) { return avatar.character == set; })[0];
		var ageIndex = false;
		for (var x=0; x < avatarSet.ages.length; x++) { if (avatarSet.ages[x] == age) { ageIndex = x; }}
		if (!ageIndex) { ageIndex = 0; }		//if no age provided, use first value

		return "assets/avatars/" + avatarSet.character + "/" + avatarSet.character + "_" + avatarSet.ages[ageIndex] + "_" + tag +".png"; 
	}
	*/

	/*
	Called by story and game systems to change stat displayed, or add it
	containerId: which container to update...if set to "all" updates all containers
	*/

	var createStats = function() {
		var stats = State.get("storyUIvars");

		if (typeof stats !== "undefined") {

			State.get("characters").forEach(function(char, pos) {

				if (document.getElementById(char.id + "_barContainer") == null) {
					$('<div/>', {		//make progressbar divs
				    	class: 'barContainer',
				    	id: char.id + "_barContainer"
					}).appendTo("#"+char.id);
				}
			});

			var statClass = "stat";
			if (Coordinator.settings.avatarMode == "oneMain") { statClass += " hidden";	}

			stats.forEach(function(stat, pos) {

				for (var x=0; x < stat.characters.length; x++) { //for each character...

					if (document.getElementById(stat.characters[x] + "_" + stat.varName) == null) {
						$('<div/>', {		//make progressbar divs
							id: stat.characters[x] + "_" + stat.varName,
					    	class: statClass,
					    	html: "<div class='stat-label'>"+ stat.label + "</div>"
						}).appendTo("#"+stat.characters[x] + "_barContainer");
					}

					setBarWidth(stat.characters[x] + "_" + stat.varName);

				}
			});
		}
	};

	var setStats = function() {
		var stats = State.get("storyUIvars");
		if (typeof stats !== "undefined") {
			stats.forEach(function(stat, pos) {
				for (var x=0; x < stat.characters.length; x++) { //for each character...
					setBarWidth(stat.characters[x] + "_" + stat.varName);
				}
			});
		}

	}

	//sets stat bar width
	var setBarWidth = function(statDivId) {
		var character = statDivId.split("_")[0];
		var statName = statDivId.split("_")[1];
		var stat = State.getBlackboard().storyUIvars.filter(function(thing,i){ 
			return thing.varName == statName;
		})[0];
		var newWidth = State.get(statName)/(stat.range[1] - stat.range[0]) * 100;

		if (Coordinator.settings.avatarMode !== "oneMain" && statsContainer.firstChild !== null && typeof statsContainer.firstChild.children[1].children[2] !== "undefined") {
			var statName1 = statsContainer.firstChild.children[1].firstChild.id;
			var statName2 = statsContainer.firstChild.children[1].children[2].id;

			if (statDivId == statName1 || statDivId == statName2) {		//if it's a big stat, increase appropriately
				newWidth *= 2;
			}
		}
		$("#" + statDivId).css("width", newWidth + "%");
	}

	//sets the intro screen for each scene
	var setSceneIntro = function(sceneText, id) {
		$("#blackout").show();

		$("#sceneIntro").html("<div id='introText'>" + sceneText + "</div>");
		if (id.substring(0,6) == "intro:") { 
			$("#sceneIntro").html("<div id='introText' style='width:100%'>" + sceneText + "</div>");
		}

		var linkText = "";
		var nextIndex = Coordinator.getNextScene(State.get("currentScene"));
		var nextScene = State.get("scenes")[nextIndex];

		if (id.substring(0,6) !== "intro:") {	//if we're not using the intro as an interstitial scene, start game...
			Coordinator.startGame(id, true, true);		//start intro game
			linkText = "Start Scene";
		}
		else if (nextScene == "intro:theEnd") { linkText = "Start Sandbox Mode"; }
		else { linkText = "Continue"; }

		var linkClass = "";
		if (id.substring(0,6) == "intro:") { linkClass = "soloLink"; }		//if we don't have a game, set CSS class so "Continue" is centered

		var begin = $('<h2/>', {
			text: linkText,
			id: "introLink",
			class: linkClass,
			click: function() {
				if (id.substring(0,6) == "intro:") {	//if this is interstitial, clicking the link starts the next scene
					//initGraphScreen(Coordinator, State, State.get("scenes"));					//reinitialize title screen (terrible)
					//initTitleScreen(Coordinator, State, State.get("scenes"), State.get("scenes"));		//reinitialize title screen (terrible)
					nextIndex = Coordinator.getNextScene(State.get("currentScene"));
					nextScene = State.get("scenes")[nextIndex];
					if (nextScene == undefined) {		//if there's no next scene, we're at the end, so go back to title
						State.set("playthroughCompleted", true);
						switch(Coordinator.settings.interfaceMode) {
							case "normal":
								returnToTitleScreen(Coordinator, State, Coordinator.settings.scenes, Coordinator.settings.sceneOrder);
								break;
							case "timeline" :
								returnToTimelineScreen(State.get("scenes"));
								break;
							default:
								throw Coordinator.settings.interfaceMode + " is not a supported mode!";
						}
					}
					else {
						if (nextScene.indexOf(":") > 0) { nextScene = nextScene.split(":")[1]; }
						setTimeout(function (){
						  $("#startScene_" + nextScene).click();
						}, 500);
					}
					
				}
				else {			//otherwise, it closes the intro window and starts the scene
					Coordinator.startGame(id);				//start real game
					$("#sceneIntro").fadeOut( "slow" );
					$("#blackout").fadeOut( "slow" );
					State.set("refreshEnabled", true);		//enable refreshNarrative for game hook up
					State.setPlaythroughData(State.get("currentTextId"), State.get("currentChoices"));	//set playthrough data
				}
			}
		}).appendTo("#sceneIntro");
		$("#sceneIntro").fadeIn( "slow" );
	}

	var setSceneOutro = function(successfulEnd) {

		var currentScene = State.get("currentScene");
		var endText;
		if (successfulEnd) { 
			if (typeof Coordinator.settings.scenes[currentScene].config.outroText !== "undefined") { endText = Coordinator.settings.scenes[currentScene].config.outroText; }
			else { endText = "<p>Chapter complete!</p>"; }
		}
		else {
			if (typeof Coordinator.settings.scenes[currentScene].config.fallbackOutro !== "undefined") { endText = Coordinator.settings.scenes[currentScene].config.fallbackOutro; }
			else { endText = "<p>Chapter complete!</p>"; }
		}
		var nextIndex = Coordinator.getNextScene(currentScene);
		var nextScene = State.get("scenes")[nextIndex];
		$( "#blackout" ).delay(1600).fadeIn( "slow", function() {
	    	$("#sceneIntro").html("<div id='outroText'>" + endText + "</div>");
	    	/*
	    	$('<h3/>', {
	    		text : 'Stats',
	    	}).appendTo("#sceneIntro");
	    	var stats = State.get("storyUIvars");
	    	stats.forEach(function(stat, pos) {
	    		if ($.inArray("protagonist", stat.characters) !== -1) {
					$('<div/>', {
						id: stat.varName+'ContainerOutro',
				    	class: 'stat'
					}).appendTo("#sceneIntro");

					$('<span/>', {
				    	class: 'statLabel',
				    	text: "Ending " + stat.label + ": "
					}).appendTo('#'+stat.varName+'ContainerOutro');

					$('<span/>', {
				    	class: 'statValue',
				    	text: State.get(stat.varName).toFixed(1)
					}).appendTo('#'+stat.varName+'ContainerOutro');
				}
			});
			*/
			var linkText = "Return To Main Screen";
			if (nextScene !== undefined) { linkText = "Next Scene"; }
	    	var begin = $('<h2/>', {
			click: function() {

				postTrackingStats();		//post tracking stats

				if (Coordinator.settings.interfaceMode == "timeline") {		//if timeline, return there
					returnToTimelineScreen(State.get("scenes"));
				}
				else if (nextScene == undefined) {			//if we're on the last scene, return to title screen
					returnToTitleScreen(Coordinator, State, Coordinator.settings.scenes, Coordinator.settings.sceneOrder);
				}
				else {			//otherwise, start next scene
					$('body').append("<div id='hiddenKnobs'></div>");
					createKnobs(nextScene, "hiddenKnobs");
					populateKnobs(nextScene, Coordinator, State, State.get("scenes"));
					setTimeout(function (){		//gotta put in some lag for the knobs to populate
					  startScene(Coordinator, nextScene, true);
					}, 500);
					
				}
			},
			text: linkText,
			}).appendTo("#sceneIntro");

	    	$( "#sceneIntro" ).fadeIn();
	    });
	}

/*
//old code to add diagnostics for ASP games...no longer needed?
	var addGameDiagnostics = function(gameSpec, aspFilepath, aspGame, aspGameInstructions, initialPhaserFile) {
		if (document.getElementById("gameDiagnostics") !== null) {
		  $("#gameDiagnostics").remove();
		  $("#gameDiagnosticsButton").remove();
		}
		$('<div/>', {
			id: "gameDiagnostics",
			html: '<ul><li><a href="#ReportBugDiv">Report Bug</a></li><li><a href="#ASPEditor">ASP Editor</a></li><li><a href="#JSONEditorDiv">JSON Editor</a></li></ul><div id="ReportBugDiv"></div><div id="ASPEditor"></div><div id="JSONEditorDiv"></div>'
		}).appendTo("body");

		addBugReporter(gameSpec, aspFilepath, aspGame, aspGameInstructions);
		addJSONEditor(gameSpec, initialPhaserFile);
		addASPEditor(gameSpec, aspFilepath, aspGame);

		$('<div/>', {
			id: "gameDiagnosticsButton",
			click: function() {
        updateBugReportTexts(aspFilepath, aspGame, aspGameInstructions);
  			$("#gameDiagnostics").toggle();
			}
		}).appendTo("body");

		$( "#gameDiagnostics" ).tabs();
	};
  var gameBugBaseURL = "https://github.com/LudoNarrative/ClimateChange/issues/new?labels="+encodeURIComponent("Gemini/Cygnus")+",bug";
  var storyBugBaseURL = "https://github.com/LudoNarrative/ClimateChange/issues/new?labels=StoryAssembler,bug";

  var updateGameBugHref = function() {
    $("#GameBugSubmit").attr("href", gameBugBaseURL + "&body="+encodeURIComponent($("#GameBug").text()));
  };
  var updateStoryBugHref = function() {
    $("#StoryBugSubmit").attr("href", storyBugBaseURL + "&body="+encodeURIComponent($("#StoryBug").text()));
  };
    
  var updateBugReportTexts = function(aspFilepath, aspGame, aspGameInstructions) {
    $("#GameBug").text(
      "This game (delete any that do not apply):\n- Was confusing.\n- Was difficult to play.\n- Was boring.\n- Did not function according to the instructions.\n- Was not appropriate for this scene.\n\n"+
        "Other comments/elaborations:\n\n\n"+
        "Game: "+aspFilepath+"\n" +
        "```\n"+
        aspGame + "\n" + "==========\n" + aspGameInstructions +
        "\n```"
    );
    
    // TODO: also show vars and other interesting things, and grab this in a nice way instead of this rude way 
    $("#StoryBug").text("Issue:\n\nCurrent story chunks:\n```\n"+$( "#storyContainer" ).text()+"\n```");

    updateGameBugHref();
    updateStoryBugHref();
  };

	  var addBugReporter = function(gameSpec, aspFilepath, aspGame, aspGameInstructions) {

        var left = $("<div/>", {style:"width: 40%; display:inline-block;"}).appendTo("#ReportBugDiv");
        var submitLeft = $("<a/>", {
            id: 'GameBugSubmit',
            text: 'Submit game bug',
            href: gameBugBaseURL,
            target: "_blank",
            style: "display:block; width:200px;"
        }).appendTo(left);
		    $('<textarea/>', {
			      id: 'GameBug',
			      rows: "4",
			      cols: "40",
            style: "margin-right: 20px",
            text: "",
            change: updateGameBugHref
		    }).attr('spellcheck',false)
		        .appendTo(left);

        var right = $("<div/>", {style:"width:40%; display:inline-block;"}).appendTo("#ReportBugDiv");
        var submitRight = $("<a/>", {
            id: 'StoryBugSubmit',
            text: 'Submit story bug',
            href: storyBugBaseURL,
            target: "_blank",
            style: "display:block; width:200px;"
        }).appendTo(right);
        $('<textarea/>', {			//add editing field
			      id: 'StoryBug',
			      rows: "4",
			      cols: "40",
			      text: "",
            change: updateStoryBugHref
		    }).attr('spellcheck',false)
		        .appendTo(right);
	  };
*/
	//posts tracking stats if we have any unsent ones
	var postTrackingStats = function() {
		if (Coordinator.recordPlaythroughs && localStorage.getItem('playthroughScene') !== null) {
			postToExternalTracker();
			localStorage.removeItem("playthroughScene");
			localStorage.removeItem("playthroughData");
		}
	}

	/* 
	send playthrough data to an external tracker. The code in here is taken from 
	https://medium.com/@dmccoy/how-to-submit-an-html-form-to-google-sheets-without-google-forms-b833952cc175
	all you should need to do is setup your own macro and put the url link in the url var in postToForm()
	*/
	var postToExternalTracker = function() {

		if (State.get("displayType") !== "editor") {
			postToForm(getData());
			postToForm(getData("times"));
		}

		function postToForm(data) {
			/*
			var url = 'your google script exec macro link';
		    var xhr = new XMLHttpRequest();
		    xhr.open('POST', url);
		    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

		    // url encode form data for sending as post data
		    var encoded = Object.keys(data).map(function(k) { return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) }).join('&');
		    xhr.send(encoded);	
		    */
		}
	}

	var setPlayerIdentifier = function() {

		var emotions = ['understanding','great','playful','calm','confident','courageous','peaceful','reliable','joyous','energetic','lucky','liberated','comfortable','amazed','fortunate','optimistic','pleased','free','delighted','provocative','encouraged','sympathetic','overjoyed','impulsive'];
		var colors = ['amber','amethyst','apricot','aqua','aquamarine','auburn','azure','beige','black','blue','bronze','brown','cardinal','carmine','celadon','cerise','cerulean','charcoal','chartreuse','chocolate','cinnamon','scarlet','copper','coral','cream','crimson','cyan','denim','ebony','ecru','eggplant','emerald','fuchsia','gold','goldenrod','gray','green','indigo','ivory','jade','jet','khaki','lavender','lemon','light','lilac','lime','magenta','mahogany','maroon','mauve','mustard','ocher','olive','orange','orchid','pale','pastel','peach','periwinkle'];
		var animals = ['alligator','ant','bear','bee','bird','bull','camel','cat','cheetah','chicken','chimpanzee','cow','crocodile','deer','dog','dolphin','duck','eagle','elephant','fish','fly','fox','frog','giraffe','goat','goldfish','gorilla','hamster','hippopotamus','horse','kangaroo','kitten','lion','lobster','monkey','octopus','owl','panda','pig','puppy','rabbit','rat','scorpion','seal','shark','sheep','snail','snake','spider','squirrel','swan','tiger','turtle','wolf','wren','zebra','pale','pastel','peach','periwinkle'];
		var letters = ['A','B','C','D','E','F','G','H','I','J','H'];
		var identifier = "";
		var d = new Date();
		identifier = emotions[d.getHours()] + " " + colors[d.getMinutes()] + " " + animals[d.getSeconds()] + " " + letters[Math.trunc(d.getMilliseconds()/100)] + (d.getMilliseconds()%100).toString();

		localStorage.setItem("playerIdentifier", identifier);
	}

	// get all data in form and return object
	//mode: if it's "times", it only puts times for choices
	var getData = function(mode) {

		var data = {};
		data.scene = localStorage.getItem("playthroughScene");
		data.identifier = localStorage.getItem("playerIdentifier");

		var temp = JSON.parse(localStorage.getItem('playthroughData'));

		//set total time
		totalTime = (temp[temp.length-1].time - temp[0].time)/1000;

		//set times for each node
		for (x = 0; x < temp.length-1; x++) {
			temp[x].time = (temp[x+1].time - temp[x].time)/1000;
		}

		var labels = '["identifier","scene","total time"';
		for (var x=1; x < 51; x++) { 
			if (x <= temp.length) {
				labels += ',"choice_' + x + '"';		//add label field
				if (mode == "times" && data["choice_" + x] !== null) { 		//add time data if mode correct
					data["choice_" + x] = temp[x-1].time; 
				}		
				else if (data["choice_" + x] !== null) { 			//otherwise add all choice data
					data["choice_" + x] = JSON.stringify(temp[x-1]); 
				}
			}
			else { labels += ',""'; }
		}
		labels += "]";

		// add form-specific values into the data
		//data.formDataNameOrder = '["scene","data"]';
		data.formDataNameOrder = labels;
		data.totalTime = totalTime;
		data.formGoogleSheetName = "responses"; // default sheet name
		if (mode == "times") { data.formGoogleSheetName = "justTimes"; }
		data.formGoogleSendEmail = ""; // no email by default

		return data;
	}

	return {
		init : init,
		initTitleScreen : initTitleScreen,
		initSceneScreen : initSceneScreen,
		initTimelineScreen : initTimelineScreen,
		setAvatars : setAvatars,
		createStats : createStats,
		createKnobs : createKnobs,
		populateKnobs : populateKnobs,
		setStats : setStats,
		setSceneIntro : setSceneIntro,
		setSceneOutro : setSceneOutro,
		startScene : startScene,
		processWishlistSettings : processWishlistSettings,
		textClickFuncs : textClickFuncs
	} 
});