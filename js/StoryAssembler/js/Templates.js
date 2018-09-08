/* 	Templates Module

Allows including inline templating to vary text based on the State.

*/
/* global define */

define(["util", "Condition", "State"], function(util, Condition, State) {
	"use strict";

	//var State;
	var Character;
	var Coordinator;
	var Display;
	var currentSpeaker = "";

	var init = function(_Character, _Coordinator, _Display) {
		//State = _State;
		Character = _Character;
		Coordinator = _Coordinator;
		Display = _Display
	}

	/* The built-in list of templates and how they should be processed is defined in this object. addTemplateCommand() can also be called to add new ones at run-time.

	Each template command is give a function to process it, that expects two variables: an array of parameters the template was called with, and the full original template command (mostly useful for debugging if something goes wrong). 

	eg. for "{ifState|career|3|text if true|text if false}", 
	'params' will be ["career", "3", "text if true", "text if false"]
	and 'text' will be the quoted string above.

	A template function should verify that its receiving the correct params and output an error if it's not.
	*/ 
	var templates = {
		// Template to randomly print one of the given params.
		"rnd": function(params, text) {
			// {rnd|one|of|these}
			if (params.length === 0) {
				console.error("Template command 'rnd' must have at least one param, in text '" + text + "'.");
				return "(rnd)";
			}
			var rNum = util.randomNumber(params.length) - 1;
			return params[rNum];
		},
		//Conditionally print text based on if state variable has specific value
		"ifState": function(params, text) {
			// {ifState|career|3|text if true|text if false}
			if (params.length !== 4) {
				console.error("Template command 'ifState' must have four params: variable, value, text if true, text if false: in text '" + text + "'.");
				return "(ifState)";
			}
			
			var varToCheck = params[0];
			var expectedVal = params[1];
			var textIfTrue = params[2];
			var textIfFalse = params[3];

			var currVal = State.get(varToCheck);
			if (currVal === true && expectedVal === "true") { return textIfTrue; }
			if (currVal === false && expectedVal === "false") { return textIfTrue; }
			if (currVal == expectedVal) { // Note: double equals "truthy" comparison
				return textIfTrue;
			} else {
				return textIfFalse;
			}
		},
		//Conditionally print text based on state condition (like career lte 3)
		"ifStateCondition": function(params, text) {
			// {ifStateCondition|career lte 3|text if true|text if false}
			if (params.length !== 3) {
				console.error("Template command 'ifState' must have three params: statement, text if true, text if false: in text '" + text + "'.");
				return "(ifStateCondition)";
			}

			if (State.isTrue(params[0])) {
				return params[1];
			} else {
				return params[2];
			}
		},
		// Returns the name of the current speaker (which is stored in the "speaker" variable on the blackboard), using the expected 'name' property. 
		"speaker": function(params, text) {
			if (params.length !== 0) {
				console.error("Template command 'speaker' must not have any params, in text '" + text + "'.");
				return "(speaker)";
			}
			var speaker = State.get("speaker");
			if (!speaker) return "(speaker)";
			var speakerChar = Character.get(speaker);
			if (!speakerChar) return "(speaker)";
			return speakerChar.name || speaker;
		},

		//{name|protagonist}
		"name": function(params, text) {
			if (params.length !== 1) {
				console.error("Template command 'speaker' must have 1 param, in text '" + text + "'.");
				return "(speaker)";
			}
			var speakerChar = Character.get(params[0]);
			if (!speakerChar) return "(speaker)";
			return speakerChar.name || speaker;
		},
		//{nickname|protagonist}
		"nickname": function(params, text) {
			if (params.length !== 1) {
				console.error("Template command 'nickname' must have 1 param, in text '" + text + "'.");
				return "(nickname)";
			}
			var speakerChar = Character.get(params[0]);
			if (!speakerChar) return "(nickname)";
			return speakerChar.nickname || speaker;
		},
		//{ifSpeaker|protagonist|text if true|text if false}
		"ifSpeaker": function(params, text) {
			if (params.length !== 3) {
				console.error("Template 'ifSpeaker' doesn't have three params in chunk '" + text + "'.");
				return "(ifSpeaker)";
			}
			var speakerId = State.get("speaker");
			if (params[0] == speakerId) { return params[1] }
			else { return params[2] }
		},
		"convoMode": function(params, text) {
			if (params.length !==3){
				console.error("Template 'convoMode' doesn't have three params in chunk '" + text + "'.");
				return "(convoMode)";
			}
			var cMode = State.get("mode").type;
			if (cMode == params[0]) { return params[1] }
			else { return params[2] }
		},
		
		//{charTrait|protagonist|favFood|fallback text}
		"charTrait": function(params, text) {
			if (params.length !== 3) {
				console.error("Template command 'charTrait' must have 3 params, in text '" + text + "'.");
				return "(charTrait)";
			}
			var theChar = Character.get(params[0]);
			if (!theChar) {
				console.error("Tried to run 'charTrait' template, but no char for '" + params[0] + "'");
				return "(charTrait)";
			}

			if (typeof theChar[params[1]] == "undefined") {
				console.error("Tried to run 'charTrait' template, but '" + params[0] + "' doesn't have the trait '" + params[1] + "'.");
				return params[2];
			}

			return theChar[params[1]];
		},

		//{ifCharTraitIs|protagonist|trait statement like charisma eq 5|text if true|text if false}
		"ifCharTraitIs": function(params, text) {
			if (params.length !== 4) {
				console.error("Template command 'ifCharTraitIs' must have 4 params, in text '" + text + "'.");
				return "(ifCharTraitIs)";
			}
			var theChar = Character.get(params[0]);
			if (!theChar) {
				console.error("Tried to run 'ifCharTraitIs' template, but no char for '" + params[0] + "'");
				return "(ifCharTraitIs)";
			}
			
			var parts = Condition.parts(params[1]);
			var bbParam = params[0] + "_" + parts.param;
			var check = bbParam + " " + parts.op + " " + parts.value;

			if (typeof theChar[parts.param] == "undefined") {
				console.error("Tried to run 'ifCharTraitIs' template, but '" + params[0] + "' doesn't have the trait '" + parts.param + "'.");
				return params[3];
			}

			State.set(bbParam, theChar[parts.param]);		//set temp blackboard item
			if (State.isTrue(check)) {
				State.remove(bbParam);			//remove temp blackboard item
				return params[2];
			}
			
			State.remove(bbParam);			//remove temp blackboard item
			return params[3];
		},

		//	{stateVar|effort|lots}			//returns value of effort, or lots if no value found
		"stateVar": function(params, text) {
			if (params.length !==2) {
				console.error("Template command 'stateVarAdd' must have 2 params, in text '" + text + "'.");
				return "(stateVar)";
			}
			var value = State.get(params[0]);
			if (typeof value == "undefined") {
				return params[1];
			}
			else { return value; }
		},
		//	{stateVarAdd|effort|2}		(returns the value of effort + 2)
		"stateVarAdd": function(params, text) {
			if (params.length !==2) {
				console.error("Template command 'stateVarAdd' must have 2 params, in text '" + text + "'.");
				return "(stateVarAdd)";
			}
			console.log("doof:" + State.get(params[0]) + parseFloat(params[1]));
			return State.get(params[0]) + parseFloat(params[1]);
		},

		//{shimmer|studyShimmer|phytoplankton}
		//{shimmer|shimmerFuncName|initialvalue}
		"shimmer": function(params, text) {
			var shimmerNum = incrShimmers();
			var shimmer = $('<span/>', {
			text: params[1],
			class: "mutable",
			id: "shimmer" + shimmerNum,
			});

			textEvents.push({elemId: "shimmer" + shimmerNum, clickEvent: Display.shimmerFuncs, funcName: params[0]});
			return shimmer[0].outerHTML;
		}


		// Template stub demonstrating how you might show a random character trait. Look up the current speaker, and print something based on the first found property we have code for.
		//para
		/*
		"showSpeakerTrait": function(params, text) {
			if (params.length !== 0) {
				console.error("Template command 'showSpeakerTrait' must not have any params, in text '" + text + "'.");
				return "(showSpeakerTrait)";
			}

			var speakerId = State.get("speaker");
			var char = Character.get(speakerId);
			if (char.confident) {
				return char.name + " flashes a confident smile. ";
			} else if (char.forceful) {
				return char.name + " leans forward forcefully. ";
			} else {
				return "";
			}
		}
		*/
	}

	var textEvents = [];			//array of {id: div/spanid, clickEvent: function you're attaching} (used in shimmer)

	var incrShimmers = function() {
		var currentShimmers = State.get("totalShimmers");
		if (currentShimmers == undefined) {
			State.set("totalShimmers", 0);
			currentShimmers = 0;
		}
		else {
			currentShimmers++;
			State.set("totalShimmers", currentShimmers);
		}
		return currentShimmers;
	}

	// Add a new template command at run-time. (Probably mostly only useful for testing, or to load in template commands from an external definition file. Normally, you would add them to the "templates" object above.)
	var addTemplateCommand = function(cmd, func) {
		templates[cmd] = func;
	}

	// Process a single templated string in the form {command|param1|param2}
	// (Parameters are optional)
	// Identify the command, isolate the parameters, and call the appropriate function.
	var processTemplate = function(text) {
		// Check format is correct
		console.assert(text[0] === "{", "template '" + text + "' does not begin with curly brace.");
		console.assert(text[text.length - 1] === "}", "template '" + text + "' does not end with curly brace.");

		//if there are a non-matching number of curly braces, return error
		if ((text.match(/{/g)||[]).length !== (text.match(/}/g)||[]).length) {
			console.log("'" + text + "' has non-matching numbers of curly braces!");
			return "()";
		}

		// strip opening/closing characters, verify no nesting, and make into an array
		var strippedText = text.slice(1, text.length - 1);
		var sanity = 1000;

		while (strippedText.search(/[\{\}]/g) >= 0 && sanity>0) {		//if there's nesting...
			sanity--;
			var start = strippedText.indexOf("(");
			var end = strippedText.indexOf(")");
			var numOpen = 1;
			var numClosed = 0;
			var x = start;
			while (numOpen !== numClosed) {				//get correct nested string for both cases of () asdf () and (asdf ())
				x++;
				if (strippedText[x] == "(") { numOpen++;}
				else if (strippedText[x] == ")") { numClosed++; }
			}
			end = x;

			if (start == -1 || end == -1) {
				console.log("'" + strippedText + "' portion of '" + text + "' has non-matching opening and closing parentheses!");
				return "()";
			}
			var processedNested = _render(strippedText.substring(start+1, end), undefined, undefined);
			strippedText = strippedText.replace(strippedText.substring(start,end+1), processedNested);	//replace what was in ( and ) with processedNested
			//console.error("Nested params are not allowed in template '" + strippedText + "'");
			//return "()";
		}

		if (sanity == 0) { alert('whaaat'); }

		var texts = strippedText.split("|");

		// If we just have a single word, and it's not a recognized command, assume we want to print a value by this name from the State.
		if (texts.length === 1 && !templates[texts[0]]) {
			return State.get(texts[0]);
		}

		// Assume the first element is the command, and the rest are parameters
		var cmd = texts[0];
		var params = [];
		if (texts.length > 0) {
			texts.shift();
			params = texts;
		}
		if (!templates[cmd]) {
			console.error("Missing template command '" + cmd + "'. Process text '" + text + "'.");
			return "(" + cmd + ")";
		}
		if (typeof templates[cmd] !== "function") {
			console.error("Template command '" + cmd + "' is not a function! Processing text '" + text + "'.");
			return "(" + cmd + ")";
		}
		return templates[cmd](params, text);
	}

	// Main public interface. Given text with grammars, return its content with any templates rendered into fully realized text.
	var _render = function(rawText, speaker, mode) {

		var currentSpeaker = speaker;
		var txt;
		if (typeof rawText == "object") { txt = rawText[0]; }		//if rawText is coming from chunk content, it's an array, otherwise string
		else { txt = rawText; }
		if (txt == undefined) { return "{undefined}"; }
		/*
		var re = /{[^}]*}/g;  // matches every pair of {} characters with contents
		var match;
		while ((match = re.exec(txt)) !== null) {
			// Reject escaped opening braces, so \{ won't count.
			if (match.index > 0 && txt[match.index - 1] === "\\") continue;

			// Replace match with rendered version.
			//var matchText = match[0];
			var matchText = match.input;
			txt = txt.replace(matchText, processTemplate(matchText));
			re = /{[^}]*}/g;
		}
		*/
		var maxLoops = 200;
		while (txt.indexOf("{") > -1 && maxLoops > 0) {
			var templateString = "";
			var openingBraces = 0;
			var closingBraces = 0;
			var firstBraceIndex = -1;
			var lastBraceIndex = -1;
			for (var x=0; x < txt.length; x++) {
				templateString+=txt[x];			//add character
				if (txt[x] == "{" && (x==0 || txt[x-1] !== "\\")) { 		//if we have an unescaped opening parenthesis...
					if (firstBraceIndex == -1) { firstBraceIndex = x; }
					openingBraces++; 
				}
				if (txt[x] == "}" && txt[x-1] !== "\\") { closingBraces++; lastBraceIndex = x; }
				if (openingBraces == closingBraces && openingBraces !== 0) {		//if we've found our next template to process...
					templateString = txt.substring(firstBraceIndex, lastBraceIndex+1);
					break;
				}
			}
			txt = txt.replace(templateString, processTemplate(templateString));
			maxLoops--;
		}

		if (maxLoops == 0) { console.log("problem with template in '" + txt + "'!"); }



		/*
		Uncomment this to add speaker tags like "Emma: 'Oh hey there' "
		
		// If you wanted to do additional NLG-style processing here like analyzing a sentence and adding hedges, etc., this would be the place to modify 'txt' further before returning it.
		if (typeof txt !== "undefined" && mode !== "want") {		//if it's undefined (other systems expecting undefined, not a txt string back, so leave it if so)
			var speakerName = processTemplate("{name|" + currentSpeaker + "}");
			//if (speakerName !== "(speaker)") { txt = speakerName + ": " + txt; }
			
		}
		*/

		return txt;
	}

	//mode to just return text (this is what's usually returned)
	var render = function(rawText, speaker, mode) {
		return _render(rawText, speaker, mode);		//call internal render function
	}

	//mode that returns both text and an array of clickEvent objects {id: divId, clickEvent: doop(){} } to attach
	var interactiveRender = function(rawText, speaker, mode) {
		textEvents = [];		//reset clickEvents so we don't inadvertantly cache clickEvents
		return {txt:_render(rawText, speaker, mode), textEvents: textEvents};		//call internal render function
	}

	// PUBLIC INTERFACE
	return {
		init: init,
		render: render,
		interactiveRender: interactiveRender,
		addTemplateCommand: addTemplateCommand
	}

});