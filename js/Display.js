define(["Templates", "jQuery", "jQueryUI"], function(Templates) {

	var State;
	var Coordinator;

	//initializes our copy of State and Coordinator
	var init = function(_Coordinator, _State) {
		State = _State;
		Coordinator = _Coordinator;
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

	var initTitleScreen = function(_Coordinator, _State, scenes, playGameScenes) {

		init(_Coordinator, _State);				//initialize our copy of the coordinator and state

		$('<h2/>', {
		    text: 'Scene Selection',
		    id: 'sceneSelectTitle',
		    style: 'margin-top:' + offset
		}).appendTo('body');

		// For each scene, make a link to start it.
		scenes.forEach(function(scene, pos) {
			var el = makeLink(_Coordinator, scene, scene, "#");
			$('body').append(el);
			$('body').append("<div id='hiddenKnobs'></div>");
			createKnobs(scene, "hiddenKnobs");
			populateKnobs(scene, _Coordinator, _State, scenes);
		});


		$('<div/>', {
		    id: 'blackout'
		    //text: ''
		}).appendTo('body');
	}



	var startSandboxMode = function() {

		circleClicked(Coordinator, State.get("sceneIndex"), State.get("sceneTimeline"), null);

		$("#graphClickBlocker").hide();
		$("svg circle").show();

		$("#sandbox").show();
		State.set("introCompleted", true);
		sandboxMode = true;
	}


//------------------------------------------------------------------------------------
	//builds the scene divs
	var initSceneScreen = function(State, bg, id) {

		$('#graphContainer').hide();
		$('body').css("background-image", "url('assets/bgs/"+ bg +"')"); 

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
			    id: 'gameContainer'
			    //text: ''
			}).appendTo('#totalGameContainer');

			$('<div/>', {
				id: 'gameControls'
			}).appendTo('#gameContainer');

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

	}

	//sets the intro screen for each scene
	var setSceneIntro = function(sceneText, id) {
		$("#blackout").show();

		$("#sceneIntro").html("<div id='introText'>In this scene you'll have to balance exploring the narrative with playing this game. Try it out to get the hang of it before starting!</div><div id='introGame'></div>");
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

		$("#gameContainer").css("visibility","hidden"); // hide the empty game container during intro or interstitial scene

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
						returnToGraphScreen();
					}
					else {
						if (nextScene.indexOf(":") > 0) { nextScene = nextScene.split(":")[1]; }
						setTimeout(function (){
						  $("#startScene_" + nextScene).click();
						}, 500);
					}
					
				}
				else {			//otherwise, it closes the intro window and starts the scene
					$("#gameContainer").show();
					Coordinator.startGame(id);				//start real game
					$("#sceneIntro").fadeOut( "slow" );
					$("#blackout").fadeOut( "slow" );
					$("#gameContainer").css("visibility","visible"); // unhide the game container
					State.set("refreshEnabled", true);		//enable refreshNarrative for game hook up
					State.setPlaythroughData(State.get("currentTextId"), State.get("currentChoices"));	//set playthrough data
				}
			}
		}).appendTo("#sceneIntro");
		$("#sceneIntro").fadeIn( "slow" );
	}

	var setSceneOutro = function(endText) {

		$("#gameContainer").hide();

		var nextIndex = Coordinator.getNextScene(State.get("currentScene"));
		var nextScene = State.get("scenes")[nextIndex];
		$( "#blackout" ).delay(1600).fadeIn( "slow", function() {
	    	$("#sceneIntro").html("<div id='outroText'>" + endText + "</div>");

	    	var begin = $('<h2/>', {
			text: 'Next',
			click: function() {

				postTrackingStats();		//post tracking stats

				if (interfaceMode == "timeline") {		//if timeline, return there
					returnToTimelineScreen(State.get("scenes"));
				}
				else if (interfaceMode == "graph") {
					returnToGraphScreen();
				}
				else {			//otherwise, start next scene
					$('body').append("<div id='hiddenKnobs'></div>");
					createKnobs(nextScene, "hiddenKnobs");
					populateKnobs(nextScene, Coordinator, State, State.get("scenes"));
					setTimeout(function (){		//gotta put in some lag for the knobs to populate
					  startScene(Coordinator, nextScene, true);
					}, 500);
					
				}
			}
			}).appendTo("#sceneIntro");

	    	$( "#sceneIntro" ).fadeIn();
	    });
	}

	return {
		init : init,
		initTitleScreen : initTitleScreen,
		initSceneScreen : initSceneScreen,
		setSceneIntro : setSceneIntro,
		setSceneOutro : setSceneOutro,
		startScene : startScene
	} 
});