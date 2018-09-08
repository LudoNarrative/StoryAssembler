/* Utility functions for StoryAssembler. */

define([], function() {
	"use strict";
	var _iterators = {};

	/* Function: iterator
	Given a key, returns a number that starts at 1 and increases by 1 each time the function is called for the same key.
	
	Parameters:
	key - a string
	
	Returns:
	number (integer)
	*/	
	var iterator = function (key) {
		if (_iterators[key] === undefined) {
			_iterators[key] = 0;
		}
		_iterators[key] += 1;
		return _iterators[key];
	}

	/* Function: oneOf
	Returns a random entry from an array, or undefined if the array is empty or not an array.
	
	Parameters:
	arr - an array of anything
	
	Returns:
	an entry from a random position in arr.
	*/
	var oneOf = function (arr) {
		return arr[randomNumber(arr.length) - 1];
	}

	/* Function: randomNumber
	Returns a random integer from 1 to max. Return 1 if max <= 1 or not a number.
	
	Parameters:
	max - an integer, the highest number that might be returned.
	
	Returns:
	number (integer) between 1 and max.
	*/	
	var randomNumber = function (max) {
		if (max <= 1 || typeof max !== "number") {
			return 1;
		}
		return Math.floor(Math.random() * Math.round(max)) + 1;
	}

	/* Function: clone
	Creates a clone (non-reference version) of an array or object. Code courtesy A. Levy on Stackoverflow.
	
	Parameters:
	obj - the object to clone
	
	Returns:
	a new object identical to obj
	*/	
	var clone = function (obj) {
	    // Handle the 3 simple types, and null or undefined
	    if (null === obj || "object" !== typeof obj) return obj;

	    // Handle Array
	    if (obj instanceof Array) {
	        var copy = [];
	        for (var i = 0, len = obj.length; i < len; i++) {
	            copy[i] = clone(obj[i]);
	        }
	        return copy;
	    }

	    // Handle Object
	    if (obj instanceof Object) {
	        var copy = {};
	        for (var attr in obj) {
	            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
	        }
	        return copy;
	    }

	    throw new Error("Unable to copy obj! Its type isn't supported.");
	}

	// Returns true if the given object is an array.
	var isArray = function(obj) {
		return toString.call(obj) === "[object Array]";
	}

	// Remove a given string from a list of strings.
	var removeFromStringList = function(list, itemToRemove) {
		var newList = clone(list);
		var pos = newList.indexOf(itemToRemove);
		if (pos < 0) return newList;
		newList.splice(pos, 1);
		return newList;
	}

	// Return the given array stripped of any duplicate entries.
	var removeArrDuplicates = function(arr) {
		var newArr = [];
		var keys = {};
		arr.forEach(function(val) {
			if (typeof val === "object") {
				throw new Error("Tried to call removeArrDuplicates on an object; must be able to compare equality. Object was:", val);
			}
			if (!keys[val]) {
				newArr.push(val);
				keys[val] = 1;
			} 
		});
		return newArr;
	}

	// Return true if the two arrays have the same contents in the same order.
	var arrEqual = function(arr1, arr2) {
		if (arr1.length !== arr2.length) return false;
		if (arr1.length === 0) return true;
		for (var i = 0; i < arr1.length; i++) {
			if (arr1[i] !== arr2[i]) return false;
		}
		return true;
	}

	// Return if object is already in array
	var objInArray = function(obj, array) {
	    var i;
	    for (i = 0; i < array.length; i++) {
	        if (array[i] === obj) {
	            return true;
	        }
	    }

	    return false;
	}

	return {
		iterator: iterator,
		oneOf: oneOf,
		randomNumber: randomNumber,
		clone: clone,
		isArray: isArray,
		arrEqual: arrEqual,
		removeFromStringList: removeFromStringList,
		removeArrDuplicates: removeArrDuplicates,
		objInArray : objInArray
	}
});