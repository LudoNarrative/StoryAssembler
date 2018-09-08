function formatChoices(stuff) {

	for(var i = 0; i < stuff.length; i++){
		var formattedChoiceArray = [];
		//console.log("LOOKING AT FRAGMENT ", i);
		if(typeof stuff[i].choices !== 'undefined'){
			for (var x=0; x < stuff[i].choices.length; x++) {
				//console.log("****I'm looking at choice: " , x)
				var placeholderChoice = stuff[i].choices[x];
				//console.log("This is the current formatting my current choice: " , JSON.stringify(placeholderChoice,null, 4));
				var tempType = placeholderChoice.type;
				var tempID = placeholderChoice.id;
				var tempGoToID = placeholderChoice.gotoId
				//console.log("my temp type is: " , tempType);
				//console.log("my temp id is: " , tempID);
				//console.log("my tempGoToID: " , tempGoToID);
				var newChoiceObj = {};
				if(tempType !== undefined) {
					newChoiceObj[stuff[i].choices[x].type] = stuff[i].choices[x].id
					formattedChoiceArray.push(newChoiceObj);
				}
				else{
					//console.log("we are in the `correctly formatted already case'");
					formattedChoiceArray.push(placeholderChoice);
				}
				//console.log("here is newChoiceObj: " , JSON.stringify(newChoiceObj, null, 4))
				//console.log("here is formatted choice array " , JSON.stringify(formattedChoiceArray, null, 4));
				//console.log("new choice obj: " , newChoiceObj)
			}
	
		}
		stuff[i].choices = formattedChoiceArray;
	}
	
	return stuff;
}

function formatConditions(stuff) {
	
	for (var i=0; i < stuff.length; i++) {
		var formattedConditionArray = [];
		if(typeof stuff[i].conditions !== 'undefined'){
			for (var x=0; x < stuff[i].conditions.length; x++) {
				var placeholderCondition = stuff[i].conditions[x];
				var tempEquate = placeholderCondition.operation;
				var newConditionObj = {};
					if( tempEquate !== undefined){
						newConditionObj = stuff[i].conditions[x].variable + " " + stuff[i].conditions[x].operation + " " + stuff[i].conditions[x].value
						formattedConditionArray.push(newConditionObj);
					}
					else{
						formattedConditionArray.push(placeholderCondition);
					}
			}
		}
		stuff[i].conditions = formattedConditionArray;
	}
	
	return stuff;
}
		
function formatEffects(stuff) {
	
	for (var i=0; i < stuff.length; i++) {
		var formattedEffectArray = [];
		if(typeof stuff[i].effects !== 'undefined'){
			for (var x=0; x < stuff[i].effects.length; x++) {
				var newEffectObj = {};
				var placeholderEffect = stuff[i].effects[x];
				var tempChange = placeholderEffect.change;
				var tempVariable = placeholderEffect.variable;
				var tempNumbool = placeholderEffect.numbool;
				if(tempNumbool !== undefined){
					newEffectObj = stuff[i].effects[x].operation + " " + stuff[i].effects[x].variable + " " + stuff[i].effects[x].numbool
					formattedEffectArray.push(newEffectObj);
				}
				else{
					formattedEffectArray.push(placeholderEffect);
				}
			}
		}
		stuff[i].effects = formattedEffectArray;
	}
	return stuff;
}
/*
function formatContent(stuff) {
	for (var i=0; i < stuff.length; i++) {
		if (typeof stuff[i].content !== "undefined" && typeof stuff[i].content.text !== "undefined") {
			stuff[i].content = stuff[i].content.text;
		}
		else if (typeof stuff[i].content.type !== "undefined") {
			var contentRequest = {};
			contentRequest[stuff[i].content.type] = stuff[i].content.value;
			delete stuff[i].content;
			stuff[i].request = contentRequest;
		}
	}

	return stuff;
}
*/

//delete unused fields before export
function deleteUnusedStuff(data) {
	var stuff = data;

	for (var i=0; i < stuff.length; i++) {
		if(stuff[i].Content !== 'undefined'){
			if(stuff[i].Content == 0){
				delete stuff[i].Content;
			}
		}
			if(stuff[i].Request.value !== 'undefined'){
				if(stuff[i].Request.value == 0){
					delete stuff[i].Request;
				}
		}
		if(typeof stuff[i].conditions !== 'undefined'){
			if (stuff[i].conditions.length == 0){
				delete stuff[i].conditions;
			}
		}
		if(typeof stuff[i].choiceLabel !== 'undefined'){
			if (stuff[i].choiceLabel.length == 0){
				delete stuff[i].choiceLabel;
			}
		}
		if(typeof stuff[i].effects !== 'undefined'){
			if (stuff[i].effects.length == 0){
				delete stuff[i].effects;
			}
		}
		if(typeof stuff[i].choices !== 'undefined'){
			if (stuff[i].choices.length == 0){
				delete stuff[i].choices;
			}
		}

		if(typeof stuff[i].speaker !== 'undefined'){
			if (stuff[i].speaker.length == 0){
				delete stuff[i].speaker;
			}
		}

		if(typeof stuff[i].speaker !== 'undefined'){
			if (stuff[i].speaker.length == 0){
				delete stuff[i].speaker;
			}
		}

		if (typeof stuff[i].unavailableChoiceLabel !== 'undefined') {
			if (stuff[i].unavailableChoiceLabel.length == 0) {
				delete stuff[i].unavailableChoiceLabel;
			}
		}

		if (!stuff[i].repeatable) {
			delete stuff[i].repeatable;
		}

		if (typeof stuff[i].notes !== 'undefined') {
			if (stuff[i].notes.length == 0) {
				delete stuff[i].notes;
			}
		}
	}
	return stuff;
}

//this formats JSON from the editor to StoryAssembler format
function formatJSON(stuff) {
	//console.log("***THIS IS WHAT WE ARE STARTING WITH!!!***")
	//console.log(JSON.stringify(stuff, null, 4));
	
	stuff = formatEffects(stuff);
	stuff = formatChoices(stuff);	
	stuff = formatConditions(stuff);
	//stuff = formatContent(stuff);

	stuff = deleteUnusedStuff(stuff);			//delete unused fields

	console.log("Stringified export:");
	console.log(JSON.stringify(stuff));
	return stuff;
}


//properly formats JSON string
function toJSON(input) {
	var UNESCAPE_MAP = { '\\"': '"', "\\`": "`", "\\'": "'" };
	var ML_ESCAPE_MAP = {'\n': '\\n', "\r": '\\r', "\t": '\\t', '"': '\\"'};
	function unescapeQuotes(r) { return UNESCAPE_MAP[r] || r; }

		return input.replace(/`(?:\\.|[^`])*`|'(?:\\.|[^'])*'|"(?:\\.|[^"])*"|\/\*[^]*?\*\/|\/\/.*\n?/g, // pass 1: remove comments
			function(s) {
				if (s.charAt(0) == '/')
					return '';
				else  
					return s;
			})
		.replace(/(?:true|false|null)(?=[^\w_$]|$)|([a-zA-Z_$][\w_$]*)|`((?:\\.|[^`])*)`|'((?:\\.|[^'])*)'|"(?:\\.|[^"])*"|(,)(?=\s*[}\]])/g, // pass 2: requote
			function(s, identifier, multilineQuote, singleQuote, lonelyComma) {
				if (lonelyComma)
					return '';
				else if (identifier != null)
					return '"' + identifier + '"';
				else if (multilineQuote != null)
					return '"' + multilineQuote.replace(/\\./g, unescapeQuotes).replace(/[\n\r\t"]/g, function(r) { return ML_ESCAPE_MAP[r]; }) + '"';
				else if (singleQuote != null)
					return '"' + singleQuote.replace(/\\./g, unescapeQuotes).replace(/"/g, '\\"') + '"';
				else
					return s;
			});
	}

//format data for use in the editor
function unChew(unformattedData){
/*		EDITOR DATA FORMAT
[
  {
    "id": "testID",
    "choiceLabel": "test Choice Label",
    "unavailableChoiceLabel": "Unavailabe acohice Label",
    "speaker": "Spaekrajs",
    "repeatable": true,
    "content": {
      "text": "This is text because I ahve text content"
    },
    "content": {
		"type": "gotoId",
		"value": "aldskfajs"
    }
    "choices": [
      {
        "type": "gotoId",
        "id": "ImaChoiceGoto"
      },
      {
        "type": "condition",
        "id": "choiceCondition eq true"
      }
    ],
    "conditions": [
      {
        "variable": "testCondition",
        "operation": "gt",
        "value": "5"
      }
    ],
    "effects": [
      {
        "operation": "set",
        "variable": "testEffects",
        "numbool": "true"
      }
    ]
  }
]
*/
	for (var x=0; x < unformattedData.length; x++) {
		var formattedChoices = [];
		var formattedEffects = [];
		var formattedConditions = [];

		//format choices
		if(unformattedData[x].choices !== undefined){
			for (var y=0; y < unformattedData[x].choices.length; y++) {
				for(var key in unformattedData[x].choices[y]){
					var formattedChoice = {type: key, id: unformattedData[x].choices[y][key]};
					//console.log("***HERE***  " + JSON.stringify(formattedChoice));
					//console.log(formattedChoice.ID);
					//console.log(formattedChoice.type);
					formattedChoices.push(formattedChoice);
				}
			}
			unformattedData[x].choices = formattedChoices;
		}
		
		//format effects
		if(unformattedData[x].effects !== undefined){
			for (var y=0; y < unformattedData[x].effects.length; y++) {
				var effectParts = unformattedData[x].effects[y].split(" ");
				var formattedeffect = {operation: effectParts[0], numbool: effectParts[2], variable: effectParts[1]};
				formattedEffects.push(formattedeffect);
			}
			unformattedData[x].effects = formattedEffects;
		}

		//format conditions
		if(unformattedData[x].conditions !== undefined){
			for (var y=0; y < unformattedData[x].conditions.length; y++) {
				var conditionParts = unformattedData[x].conditions[y].split(" ");
				var formattedcondition = {variable: conditionParts[0], value: conditionParts[2], operation: conditionParts[1]};
				formattedConditions.push(formattedcondition);
			}
			unformattedData[x].conditions = formattedConditions;
		}

		//format content
		if (unformattedData[x].content !== undefined) {
			if (typeof unformattedData[x].content == "string") {
				unformattedData[x].content = {"text": unformattedData[x].content}
			}	
		}
		else if (unformattedData[x].request !== undefined) {
		    var type = Object.keys(unformattedData[x].request)[0];
		    var newObj = {
		    	"type": type,
		    	"value": unformattedData[x].request[type]
		    }
		    unformattedData[x].content = newObj;
		    delete unformattedData[x].request;
		}

		//format repeatable
		if (typeof unformattedData[x].repeatable == "undefined") { unformattedData[x].repeatable = false; }

		//format unavailableChoiceLabel
		if (typeof unformattedData[x].unavailableChoiceLabel == "undefined") { 
			unformattedData[x].unavailableChoiceLabel = ""; 
		}

		//format speaker
		if (typeof unformattedData[x].speaker == "undefined") { unformattedData[x].speaker = ""; }

		if (typeof unformattedData[x].choices == "undefined") { unformattedData[x].choices = []; }

		if (typeof unformattedData[x].conditions == "undefined") { unformattedData[x].conditions = []; }

		if (typeof unformattedData[x].effects == "undefined") { unformattedData[x].effects = []; }
	}

	editor.setValue(unformattedData);		//set the editor 
}    

var openFile = function(event) {

	var input = event.target;

	var reader = new FileReader();
	reader.onload = function(){
		var data = JSON.parse(toJSON(reader.result));
		console.log("Stringified version from file:");
		console.log(JSON.stringify(data));
		unChew(data);
	};
	reader.readAsText(input.files[0]);
};

function exportJSON() {

	if (document.getElementById("exportDiv").style.display == "block") {
		document.getElementById("exportDiv").style.display = "none";
		exportDivShow = true;
	}
	else {
		document.getElementById("exportDiv").style.display = "block";
		var cleaned = formatJSON(editor.getValue());
		document.getElementById("exportDiv").childNodes[0].innerHTML = JSON.stringify(cleaned, null, 2);
	}
}

function importJSON() {
	var confirmed = confirm("Anything currently in the editor will be erased! Import?");
	if (confirmed) { document.getElementById('importField').click(); }
}

function restoreEditor() {
	var lastEditorVal = localStorage.getItem('lastEditorVal');
	if (lastEditorVal !== null) {
		editor.setValue(JSON.parse(lastEditorVal));
	}
}

editor.on('change',function() {
	if (JSON.stringify(editor.getValue()) !== "[]") {
  		localStorage.setItem('lastEditorVal', JSON.stringify(editor.getValue()));
  	}
});

