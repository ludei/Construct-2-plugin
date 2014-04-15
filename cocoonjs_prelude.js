//////////////////////////////////////
// COCOONJS.JS                      //
//////////////////////////////////////

(function()
{
	// There should not be a CocoonJS object when this code is executed.
	// if (typeof window.CocoonJS !== 'undefined') throw("This is strange, a CocoonJS object already exists when trying to create it.");

    /**
    * The basic object for all the CocoonJS related specific APIs === extensions.
    * @namespace
    */
    CocoonJS = window.CocoonJS ? window.CocoonJS : {};

	CocoonJS.nativeExtensionObjectAvailable = typeof window.ext !== 'undefined';

	/**
	* This type represents a 2D size structure with horizontal and vertical values.
	* @namespace
	*/
	CocoonJS.Size = {
		/**
		* The horizontal size value.
		*/
		width : 0,

		/**
		* The vertical size value.
		*/
		height : 0
	};

	/**
	* This utility function allows to create an object oriented like hierarchy between two functions using their prototypes.
	* This function adds a "superclass" and a "__super" attributes to the subclass and it's functions to reference the super class.
	* @param {function} subc The subclass function.
	* @param {function} superc The superclass function.
	*/
	CocoonJS.extend = function(subc, superc) {
	    var subcp = subc.prototype;

	    // Class pattern.
	    var CocoonJSExtendHierarchyChainClass = function() {};
	    CocoonJSExtendHierarchyChainClass.prototype = superc.prototype;

	    subc.prototype = new CocoonJSExtendHierarchyChainClass();       // chain prototypes.
	    subc.superclass = superc.prototype;
	    subc.prototype.constructor = subc;

	    // Reset constructor. See Object Oriented Javascript for an in-depth explanation of this.
	    if (superc.prototype.constructor === Object.prototype.constructor) {
	        superc.prototype.constructor = superc;
	    }

	    // Check all the elements in the subclass prototype and add them to the chain object's prototype.
	    for (var method in subcp) {
	        if (subcp.hasOwnProperty(method)) {
	            subc.prototype[method] = subcp[method];

	            // // tenemos en super un metodo con igual nombre.
	            // if ( superc.prototype[method]) 
	            // {
	            //     subc.prototype[method]= (function(fn, fnsuper) 
	            //     {
	            //         return function() 
	            //         {
	            //             var prevMethod= this.__super;

	            //             this.__super= fnsuper;

	            //             var retValue= fn.apply(
	            //                     this,
	            //                     Array.prototype.slice.call(arguments) );

	            //             this.__super= prevMethod;

	            //             return retValue;
	            //         };
	            //     })(subc.prototype[method], superc.prototype[method]);
	            // }
	        }
	    }
	}

	/**
	* IMPORTANT: This function should only be used by Ludei.
	* This function allows a call to the native extension object function reusing the same arguments object.
	* Why is interesting to use this function instead of calling the native object's function directly?
	* As the CocoonJS object functions expicitly receive parameters, if they are not present and the native call is direcly mapped,
	* undefined arguments are passed to the native side. Some native functions do not check the parameters validation
	* correctly (just check the number of parameters passed).
	* Another solution instead of using this function call is to correctly check if the parameters are valid (not undefined) to make the
	* call, but it takes more work than using this approach.
	* @static
	* @param {string} nativeExtensionObjectName The name of the native extension object name. The object that is a member of the 'ext' object.
	* @param {string} nativeFunctionName The name of the function to be called inside the native extension object.
	* @param {object} arguments The arguments object of the CocoonJS extension object function. It contains all the arguments passed to the CocoonJS extension object function and these are the ones that will be passed to the native call too.
	* @param {boolean} [async] A flag to indicate if the makeCall (false or undefined) or the makeCallAsync function should be used to perform the native call.
	* @returns Whatever the native function call returns.
	*/
	CocoonJS.makeNativeExtensionObjectFunctionCall = function(nativeExtensionObjectName, nativeFunctionName, args, async) {
		if (CocoonJS.nativeExtensionObjectAvailable) {
			var argumentsArray = Array.prototype.slice.call(args);
			argumentsArray.unshift(nativeFunctionName);
			var nativeExtensionObject = ext[nativeExtensionObjectName];
			var makeCallFunction = async ? nativeExtensionObject.makeCallAsync : nativeExtensionObject.makeCall;
			var ret = makeCallFunction.apply(nativeExtensionObject, argumentsArray);
			var finalRet = ret;
			if (typeof ret === "string") {
				try	{
					finalRet = JSON.parse(ret);
				}
				catch(error) {
				}
			}
			return finalRet;
		}
	};

	/**
	* Returns an object retrieved from a path specified by a dot specified text path starting from a given base object.
	* It could be useful to find the reference of an object from a defined base object. For example the base object could be window and the
	* path could be "CocoonJS.App" or "document.body".
	* @param {Object} baseObject The object to start from to find the object using the given text path.
	* @param {string} objectPath The path in the form of a text using the dot notation. i.e. "document.body"
	* For example:
	* var body = getObjectFromPath(window, "document.body");
	*/
	CocoonJS.getObjectFromPath = function(baseObject, objectPath) {
    	var parts = objectPath.split('.');
    	var obj = baseObject;
        for (var i = 0, len = parts.length; i < len; ++i) 
        {
            obj[parts[i]] = obj[parts[i]] || undefined;
    		obj = obj[parts[i]];
    	}
    	return obj;
 	};

 	/**
 	* Returns the key for a value in a dictionary. It looks for an specific value inside a dictionary and returns the corresponding key.
 	* @param {Object} dictionary The dictionary to look for the value in and get the corresponding key.
 	* @param {Object} value The value to look for inside the dictionary and return it's corresponding key.
 	* @return The key that corresponds to the given value it is has been found or null.
 	*/
 	CocoonJS.getKeyForValueInDictionary = function(dictionary, value) {
        var finalKey = null;
        for (var key in dictionary) {
            if (dictionary[key] === value)            {
                finalKey = key;
                break;
            }
        }
        return finalKey;
 	}

 	/**
 	* Finds a string inside a given array of strings by looking for a given substring. It can also
 	* specify if the search must be performed taking care or not of the case sensitivity.
 	* @param {Array} stringArray The array of strings in which to to look for the string.
 	* @param {string} subString The substring to look for inside all the strings of the array.
 	* @param {boolean} caseSensitive A flag to indicate if the search must be performed taking case of the 
 	* case sensitiveness (true) or not (false).
 	* @return {string} The string that has been found or null if the substring is not inside any of the string of the array.
 	*/
 	CocoonJS.findStringInStringArrayThatIsIndexOf = function(stringArray, subString, caseSensitive) {
 		var foundString = null;
 		subString = caseSensitive ? subString : subString.toUpperCase();
 		for (var i = 0; foundString == null && i < stringArray.length; i++)	{
 			foundString = caseSensitive ? stringArray[i] : stringArray[i].toUpperCase();
 			foundString = foundString.indexOf(subString) >= 0 ? stringArray[i] : null; 
 		}
 		return foundString;
 	};

	/**
	* A class that represents objects to handle events. Event handlers have always the same structure:
	* Mainly they provide the addEventListener and removeEventListener functions.
	* Both functions receive a callback function that will be added or removed. All the added callback
	* functions will be called when the event takes place.
	* Additionally they also allow the addEventListenerOnce and notifyEventListeners functions.
	* @constructor
	* @param {string} nativeExtensionObjectName The name of the native extension object (inside the ext object) to be used.
	* @param {string} cocoonJSExtensionObjectName The name of the sugarized extension object.
	* @param {string} nativeEventName The name of the native event inside the ext object.
	* @param {number} [chainFunction] An optional function used to preprocess the listener callbacks. This function, if provided,
	* will be called before any of the other listeners.
	*/
	CocoonJS.EventHandler = function(nativeExtensionObjectName, cocoonJSExtensionObjectName, nativeEventName, chainFunction) {
		this.listeners = [];
		this.listenersOnce = [];
		this.chainFunction = chainFunction;

		/**
		* Adds a callback function so it can be called when the event takes place.
		* @param {function} listener The callback function to be added to the event handler object. See the referenced Listener function documentation for more detail in each event handler object's documentation.
		*/
		this.addEventListener = function(listener) {
			if (chainFunction) {
				var f = function() {
					chainFunction.call(this, arguments.callee.sourceListener, Array.prototype.slice.call(arguments)); 
				};
				listener.CocoonJSEventHandlerChainFunction = f;
				f.sourceListener = listener;
				listener = f;
			}

			var cocoonJSExtensionObject = CocoonJS.getObjectFromPath(CocoonJS, cocoonJSExtensionObjectName);
            if (cocoonJSExtensionObject && cocoonJSExtensionObject.nativeExtensionObjectAvailable) {
                ext[nativeExtensionObjectName].addEventListener(nativeEventName, listener);
            }
            else {
                var indexOfListener = this.listeners.indexOf(listener);
                if (indexOfListener < 0) {
                	this.listeners.push(listener);
                }
            }
		};

        this.addEventListenerOnce = function(listener)
		{
			if (chainFunction) {
				var f = function() { chainFunction(arguments.callee.sourceListener,Array.prototype.slice.call(arguments)); };
				f.sourceListener = listener;
				listener = f;
			}

			var cocoonJSExtensionObject = CocoonJS.getObjectFromPath(CocoonJS, cocoonJSExtensionObjectName);
            if (cocoonJSExtensionObject.nativeExtensionObjectAvailable) {
                ext[nativeExtensionObjectName].addEventListenerOnce(nativeEventName, listener);
            }
            else
            {
                var indexOfListener = this.listeners.indexOf(listener);
                if (indexOfListener < 0)
                {
                	this.listenersOnce.push(listener);
                }
            }
		};

        /**
         * Removes a callback function that was added to the event handler so it won't be called when the event takes place.
         * @param {function} listener The callback function to be removed from the event handler object. See the referenced Listener function documentation for more detail in each event handler object's documentation.
         */
        this.removeEventListener = function (listener) {

        	if (chainFunction) {
        		listener = listener.CocoonJSEventHandlerChainFunction;
        		delete listener.CocoonJSEventHandlerChainFunction;
        	}

			var cocoonJSExtensionObject = CocoonJS.getObjectFromPath(CocoonJS, cocoonJSExtensionObjectName);
            if (cocoonJSExtensionObject.nativeExtensionObjectAvailable) {
                ext[nativeExtensionObjectName].removeEventListener(nativeEventName, listener);
            }
            else {
                var indexOfListener = this.listeners.indexOf(listener);
                if (indexOfListener >= 0) {
                    this.listeners.splice(indexOfListener, 1);
                }
            }
        };

		this.notifyEventListeners = function() {
			var cocoonJSExtensionObject = CocoonJS.getObjectFromPath(CocoonJS, cocoonJSExtensionObjectName);
            if (cocoonJSExtensionObject && cocoonJSExtensionObject.nativeExtensionObjectAvailable) {
                ext[nativeExtensionObjectName].notifyEventListeners(nativeEventName);
            } else {

                var argumentsArray= Array.prototype.slice.call(arguments);
                var listeners =     Array.prototype.slice.call(this.listeners);
                var listenersOnce = Array.prototype.slice.call(this.listenersOnce);
                var _this = this;
                // Notify listeners after a while ;) === do not block this thread.
                setTimeout(function() {
                    for (var i = 0; i < listeners.length; i++) {
                        listeners[i].apply(_this, argumentsArray);
                    }
                    for (var i = 0; i < listenersOnce.length; i++) {
                        listenersOnce[i].apply(_this, argumentsArray);
                    }
                }, 0);

                _this.listenersOnce= [];
            }
		};
		return this;
	};

	/**
	* A simple timer class. Update it every loop iteration and get values from accumulated time to elapsed time in seconds or milliseconds.
	*/
	CocoonJS.Timer = function() {
		this.reset();
		return this;
	};

	CocoonJS.Timer.prototype = {
		currentTimeInMillis : 0,
		lastTimeInMillis : 0,
		elapsedTimeInMillis : 0,
		elapsedTimeInSeconds : 0,
		accumTimeInMillis : 0,

		/**
		Resets the timer to 0.
		*/
		reset : function() {
			this.currentTimeInMillis = this.lastTimeInMillis = new Date().getTime();
			this.accumTimeInMillis = this.elapsedTimeInMillis = this.elapsedTimeInSeconds = 0;
		},

		/**
		Updates the timer calculating the elapsed time between update calls.
		*/
		update : function() {
			this.currentTimeInMillis = new Date().getTime();
			this.elapsedTimeInMillis = this.currentTimeInMillis - this.lastTimeInMillis;
			this.elapsedTimeInSeconds = this.elapsedTimeInMillis / 1000.0;
			this.lastTimeInMillis = this.currentTimeInMillis;
			this.accumTimeInMillis += this.elapsedTimeInMillis;
		}
	};

	// CocoonJS.FindAllNativeBindingsInCocoonJSExtensionObject = function(cocoonJSExtensionObject, nativeFunctionBindingCallback, nativeEventBindingCallback)
	// {
	// 	for (var cocoonJSExtensionObjectAttributeName in cocoonJSExtensionObject)
	// 	{
	// 		var cocoonJSExtensionObjectAttribute = cocoonJSExtensionObject[cocoonJSExtensionObjectAttributeName];

	// 		// Function
	// 		if (typeof cocoonJSExtensionObjectAttribute === 'function' && typeof cocoonJSExtensionObjectAttribute.nativeFunctionName !== 'undefined')
	// 		{
	// 			var nativeFunctionName = cocoonJSExtensionObjectAttribute.nativeFunctionName;
	// 			nativeFunctionBindingCallback(cocoonJSExtensionObjectAttributeName, nativeFunctionName);
	// 		}
	// 		// Event object
	// 		else if (typeof cocoonJSExtensionObjectAttribute === 'object' && cocoonJSExtensionObjectAttribute !== null && typeof cocoonJSExtensionObjectAttribute.nativeEventName !== 'undefined')
	// 		{
	// 			var nativeEventName = cocoonJSExtensionObjectAttribute.nativeEventName;
	// 			nativeEventBindingCallback(cocoonJSExtensionObjectAttributeName, nativeEventName);
	// 		}
	// 	}
	// }

	/**
	This function looks for a CocoonJS extension object that is bound to the given native ext object name.
	@returns The CocoonJS extension object that corresponds to the give native extension object name or null if it cannot be found.
	*/
	// CocoonJS.GetCocoonJSExtensionObjectForNativeExtensionObjectName = function(nativeExtensionObjectName)
	// {
	// 	var cocoonJSExtensionObject = null;
	// 	// Look in the CocoonJS object and for every object that is a CocoonJS.Extension check if it's nativeExtensionObjectName matches to the one passed as argument. If so, create an object that will represent it's documentation for the native ext object.
	// 	for (var cocoonJSAttributeName in CocoonJS)
	// 	{
	// 		var cocoonJSAttribute = CocoonJS[cocoonJSAttributeName];
	// 		if (typeof cocoonJSAttribute === 'object' && cocoonJSAttribute instanceof CocoonJS.Extension && cocoonJSAttribute.nativeExtensionObjectName === nativeExtensionObjectName)
	// 		{
	// 			// We have found the CocoonJS object that represents the native ext extension object name. 
	// 			cocoonJSExtensionObject = cocoonJSAttribute;
	// 			break;
	// 		}
	// 	}
	// 	return cocoonJSExtensionObject;
	// };

	/**
	This function adds functions to a CocoonJS extension object in order to bind them to the native makeCall function calls of the ext object.

	@param extensionObject The reference to the CocoonJS extension object where to add the new functions bound to the ext object makeCall functions calls.

	@param nativeFunctionsConfiguration An array of objects with the following structure:

		{ nativeFunctionName : "" [, functionName : "", isAsync : true/false] }

		- nativeFunctionName: Specifies the name of the function inside the ext object makeCall function call that will be bound.
		- functionName: An optional attribute that allows to specify the name of the function to be added to the CocoonJS extension object. If is not present, the name of the function will be the same
		as the nativeFunctionName.
		- isAsync: An optional attribute that allows to specify if the call should be performed using makeCall (false or missing) or makeCallAsync (true).
		- alternativeFunction: An optional attribute that allows to specify an alternative function that will be called internally when this function is called. This attribute
		allows for adding new functionalities like for example adding methods 

	@returns The CocoonJS extension object.
	*/
	// CocoonJS.AddNativeFunctionBindingsToExtensionObject = function(extensionObject, nativeFunctionsConfiguration)
	// {
	// 	if (typeof extensionObject === 'undefined' || extensionObject === null) throw("The passed extension object be a valid object.");
	// 	if (typeof nativeFunctionsConfiguration === 'undefined' || nativeFunctionsConfiguration === null) throw("The passed native functions configuration array must be a valid object.");

	// 	for (var i = 0; i < nativeFunctionsConfiguration.length; i++)
	// 	{
	// 		if (typeof nativeFunctionsConfiguration[i].nativeFunctionName === 'undefined') throw("The 'nativeFunctionName' attribute in the native function configuration object at index '" + i + "' in the native function configuration array cannot be undefined.");
	// 		var nativeFunctionName = nativeFunctionsConfiguration[i].nativeFunctionName;
	// 		var functionName = typeof nativeFunctionsConfiguration[i].functionName !== 'undefined' ? nativeFunctionsConfiguration[i].functionName : nativeFunctionName;
	// 		var makeCallFunction = null;
	// 		makeCallFunction = typeof nativeFunctionsConfiguration[i].isAsync !== 'undefined' && nativeFunctionsConfiguration[i].isAsync ? extensionObject.nativeExtensionObject.makeCallAsync : extensionObject.nativeExtensionObject.makeCall;
	// 		// Add the new function to the CocoonJS extension object
	// 		extensionObject[functionName] = function()
	// 		{
	// 			// Convert the arguments object to an array
	// 			var arguments = Array.prototype.slice.call(arguments);
	// 			// Add the native function name as the first parameter
	// 			arguments.unshift(nativeFunctionName);
	// 			// Make the native ext object call
	// 			var result = makeCallFunction.apply(extensionObject.nativeExtensionObject, arguments);
	// 			return result;
	// 		}
	// 		// Add a property to the newly added function to store the name of the original function.
	// 		extensionObject[functionName].nativeFunctionName = nativeFunctionName;
	// 	}
	// 	return extensionObject;
	// };

	/**
	This function adds objects to a CocoonJS extension object to allow event listener handling (add and remove) bound to the native ext object event listener handling.

	@param extensionObject The reference to the CocoonJS extension object where to add the new objects bound to the ext object event listener handling.

	@param nativeEventsConfiguration An array of objects with the following structure:

		{ nativeEventName : "" [, eventObjectName : ""] }

		- nativeEventName: Specifies the event in the native ext object to be bound.
		- eventObjectName: An optional attribute that allows to specify the name of the object to be added to the CocoonJS extension object. If is not present, the name of the function will be the same
		as the nativeEventName.
		- alternativeAddEventListenerFunction:
		- alternativeRemoveEventListenerFunction:

	@returns The CocoonJS extension object.
	*/
	// CocoonJS.AddNativeEventBindingsToExtensionObject = function(extensionObject, nativeEventsConfiguration)
	// {
	// 	if (typeof extensionObject === 'undefined' || extensionObject === null) throw("The passed extension object be a valid object.");
	// 	if (typeof nativeEventsConfiguration === 'undefined' || nativeEventsConfiguration === null) throw("The passed native events configuration array must be a valid object.");

	// 	for (var i = 0; i < nativeEventsConfiguration.length; i++)
	// 	{
	// 		if (typeof nativeEventsConfiguration[i].nativeEventName === 'undefined') throw("The 'nativeEventName' attribute in the native event configuration object at index '" + i + "' in the native event configuration array cannot be undefined.");
	// 		var nativeEventName = nativeEventsConfiguration[i].nativeEventName;
	// 		var eventObjectName = typeof nativeEventsConfiguration[i].eventObjectName !== 'undefined' ? nativeEventsConfiguration[i].eventObjectName : nativeEventName;
	// 		// Anonymous function call so each variable in the loop is used in the event listener handling function bindings.
	// 		(function(nativeEventName, eventObjectName)
	// 		{
	//     		extensionObject[eventObjectName] =
	//     		{
	//     			// Store the native event name
	//     			nativeEventName : nativeEventName,
	//     			// Create the event listener management functions bound to the native counterparts
	//     			addEventListener : function(callback)
	// 	    		{
	// 	    			extensionObject.nativeExtensionObject.addEventListener(nativeEventName, callback);
	//     			},
	//     			removeEventListener : function(callback)
	//     			{
	// 	    			extensionObject.nativeExtensionObject.removeEventListener(nativeEventName, callback);
	//     			}
	//     			// ,
	//     			// removeAllEventListeners : function()
	//     			// {

	//     			// }
	//     		};
	// 		})(nativeEventName, eventObjectName);
	// 	}
	// 	return extensionObject;
	// };

	/**
	The function object constructor function all the CocoonJS extensions can use to instantiate the CocoonJS extension object and add all the functionality needed bound to the native ext object.

	@param nativeExtensionObject The reference to the ext object extension object.

	@param nativeFunctionsConfiguration See CocoonJS.AddNativeFunctionBindingsToExtensionObject function's documentation for more details.

	@param nativeEventsConfiguration See CocoonJS.AddNativeEventBindingsToExtensionObject function's documentation for more details.

	@returns The new CocoonJS extension object.
	*/
	// CocoonJS.Extension = function(nativeExtensionObjectName, nativeFunctionsConfiguration, nativeEventsConfiguration)
	// {
	// 	if (typeof nativeExtensionObjectName === 'undefined' || nativeExtensionObjectName === null) throw("The native extension object name cannot be null");

	// 	if (window.ext[nativeExtensionObjectName] === 'undefined') throw("The given native extension object name '" + nativeExtensionObjectName + "' is incorrect or the native extension object is undefined.");

	// 	var nativeExtensionObject = window.ext[nativeExtensionObjectName];

	// 	// Store a reference to the native extension object and to it's name
	// 	this.nativeExtensionObject = nativeExtensionObject;
	// 	this.nativeExtensionObjectName = nativeExtensionObjectName;

	// 	// If native function configuration is passed, use it to add some functions to the new extension object.
	// 	if (typeof nativeFunctionsConfiguration !== 'undefined')
	// 	{
	// 		CocoonJS.AddNativeFunctionBindingsToExtensionObject(this, nativeFunctionsConfiguration);
	// 	}

	// 	// If native event configuration is passed, use it to add some event objects to the new extension object.
	// 	if (typeof nativeEventsConfiguration !== 'undefined')
	// 	{
	// 		CocoonJS.AddNativeEventBindingsToExtensionObject(this, nativeEventsConfiguration);
	// 	}

	// 	return this;
	// };   

})();

//////////////////////////////////////
// COCOONJS_APP.JS                  //
//////////////////////////////////////

(function () {
    // The CocoonJS must exist before creating the extension.
    if (typeof window.CocoonJS === 'undefined' || window.CocoonJS === null) throw("The CocoonJS object must exist and be valid before creating any extension object.");

    /**
     * This namespace represents all the basic functionalities available in the CocoonJS extension API.
     * @namespace
     */
    CocoonJS.App = CocoonJS.App ? CocoonJS.App : {};

    CocoonJS.App.nativeExtensionObjectAvailable = CocoonJS.nativeExtensionObjectAvailable && typeof window.ext.IDTK_APP !== 'undefined';

    /**
     * The predefined possible layouts for the FPS overlay.
     * @namespace
     */
    CocoonJS.App.FPSLayout = {
        TOP_LEFT:'top-left',
        TOP_RIGHT:'top-right',
        BOTTOM_LEFT:'bottom-left',
        BOTTOM_RIGHT:'bottom-right'
    };

    /**
     * Contains all the possible values to specify the input keyboard type to be used when introducing text.
     * @namespace
     */
    CocoonJS.App.KeyboardType = {
        /**
         * Represents a generic text input keyboard.
         */
        TEXT:"text",

        /**
         * Represents a number like input keyboard.
         */
        NUMBER:"num",

        /**
         * Represents a phone like input keyboard.
         */
        PHONE:"phone",

        /**
         * Represents an email like input keyboard.
         */
        EMAIL:"email",

        /**
         * Represents an URL like input keyboard.
         */
        URL:"url"
    };

    /**
     * The storage types to be used with file system related operations.
     * @namespace
     */
    CocoonJS.App.StorageType = {
        /**
         * Represents the application storage. The application storage is the place where all the resources that come with the application are stored.
         */
        APP_STORAGE:"APP_STORAGE",

        /**
         * Represents the internal storage. The internal storage is a different storage space that the application storage and only the data that the application has stored
         * in it will be in this storage. It is internal to the platform/device.
         */
        INTERNAL_STORAGE:"INTERNAL_STORAGE",

        /**
         * Represents an external storage. The external storage is similar to the internal storage in the sense that it only contains information that the application has written
         * in it but it represents an external storage device like a SD-CARD. If there is no exrernal storage, it will represent the same as the internal storage.
         */
        EXTERNAL_STORAGE:"EXTERNAL_STORAGE",

        /**
         * Represents the temporal storage. Same as the internal and external storage spaces in the sense that it only contains information that the application has written
         * in it but the main difference is that the information in this storage may dissapear without notice.
         */
        TEMPORARY_STORAGE:"TEMPORARY_STORAGE"
    };

    /**
     * The capture types to capture screenshots using CocoonJS native capabilities.
     * @namespace
     */
    CocoonJS.App.CaptureType = {
        /**
         Captures everything, both the CocoonJS GL hardware accelerated surface and the system views (like the WebView).
         */
        EVERYTHING:0,

        /**
         * Captures just the CocoonJS GL hardware accelerated surface.
         */
        JUST_COCOONJS_GL_SURFACE:1,

        /**
         * Captures just the sustem views (like the webview)
         */
        JUST_SYSTEM_VIEWS:2
    };

    /**
     * Makes a forward call of some javascript code to be executed in a different environment (i.e. from CocoonJS to the WebView and viceversa).
     * It waits until the code is executed and the result of it is returned === synchronous.
     * @function
     * @param {string} javaScriptCode Some JavaScript code in a string to be forwarded and executed in a different JavaScript environment (i.e. from CocoonJS to the WebView and viceversa).
     * @return {string} The result of the execution of the passed JavaScript code in the different JavaScript environment.
     */
    CocoonJS.App.forward = function (javaScriptCode) {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP", "forward", arguments);
        }
        else if (!navigator.isCocoonJS) {
            if (window.name == 'CocoonJS_App_ForCocoonJS_WebViewIFrame') {
                return window.parent.eval(javaScriptCode);
            }
            else {
                //return window.parent.frames['CocoonJS_App_ForCocoonJS_WebViewIFrame'].window.eval(javaScriptCode);
                return window.frames['CocoonJS_App_ForCocoonJS_WebViewIFrame'].window.eval(javaScriptCode);
            }
        }
    };

    /**
     * Makes a forward call of some javascript code to be executed in a different environment (i.e. from CocoonJS to the WebView and viceversa).
     * It is asyncrhonous so it does not wait until the code is executed and the result of it is returned. Instead, it calls a callback function when the execution has finished to pass the result.
     * @function
     * @param {string} javaScriptCode Some JavaScript code in a string to be forwarded and executed in a different JavaScript environment (i.e. from CocoonJS to the WebView and viceversa).
     * @param {function} [returnCallback] A function callback that will be called when the passed JavaScript code is executed in a different thread to pass the result of the execution in the different JavaScript environment.
     */
    CocoonJS.App.forwardAsync = function (javaScriptCode, returnCallback) {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            if (typeof returnCallback !== 'undefined') {
                return ext.IDTK_APP.makeCallAsync("forward", javaScriptCode, returnCallback);
            }
            else {
                return ext.IDTK_APP.makeCallAsync("forward", javaScriptCode);
            }
        }
        else if (!navigator.isCocoonJS) {
            if (window.name == 'CocoonJS_App_ForCocoonJS_WebViewIFrame') {
                return window.parent.eval(javaScriptCode);
            }
            else {
                return window.parent.frames['CocoonJS_App_ForCocoonJS_WebViewIFrame'].window.eval(javaScriptCode);
                // window.frames['CocoonJS_App_ForCocoonJS_WebViewIFrame'].window.eval(javaScriptCode);
            }
        }
    };

    /**
     * Pops up a text dialog so the user can introduce some text and the application can get it back. It is the first approach CocoonJS has taken to be able to introduce
     * text input in a easy way. The dialog execution events are passed to the application through the {@link CocoonJS.App.onTextDialogFinished} and the {@link CocoonJS.App.onTextDialogCancelled} event objects.
     * @function
     * @param {string} [title] Default value is "". The title to be displayed in the dialog.
     * @param {string} [message] Default value is "". The message to be displayed in the dialog, next to the text input field.
     * @param {string} [text] Default value is "". The initial text to be introduced in the text input field.
     * @param {CocoonJS.App.KeyboardType} [keyboardType] Default value is {@link CocoonJS.App.KeyboardType.TEXT}. The keyboard type to be used when the text has to be introduced.
     * @param {string} [cancelButtonText] Default value is "". The text to be displayed in the cancel button of the dialog.
     * @param {string} [okButtonText] Default value is "". The text to be displayed in the ok button of the dialog.
     * @see CocoonJS.App.onTextDialogFinished
     * @see CocoonJS.App.onTextDialogCancelled
     */
    CocoonJS.App.showTextDialog = function (title, message, text, keyboardType, cancelButtonText, okButtonText) {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP", "showTextDialog", arguments, true);
        }
        else if (!navigator.isCocoonJS) {
            if (!message) {
                message = "";
            }
            if (!text) {
                text = "";
            }
            var result = prompt(message, text);
            var eventObject = result ? CocoonJS.App.onTextDialogFinished : CocoonJS.App.onTextDialogCancelled;
            eventObject.notifyEventListeners(result);
        }
    };

    /**
     * Pops up a message dialog so the user can decide between a yes or no like confirmation. The message box execution events are passed to the application through the {@link CocoonJS.App.onMessageBoxConfirmed} and the {@link CocoonJS.App.onMessageBoxDenied} event objects.
     * @function
     * @param {string} [title] Default value is "". The title to be displayed in the dialog.
     * @param {string} [message] Default value is "". The message to be displayed in the dialog, next to the text input field.
     * @param {string} [confirmButtonText] Default value is "Yes". The text to be displayed for the confirm button.
     * @param {string} [denyButtonText] Default value is "No". The text to be displayed for the deny button.
     * @see CocoonJS.App.onMessageBoxConfirmed
     * @see CocoonJS.App.onMessageBoxDenied
     */
    CocoonJS.App.showMessageBox = function (title, message, confirmButtonText, denyButtonText) {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP", "showMessageBox", arguments, true);
        }
        else if (!navigator.isCocoonJS) {
            if (!message) {
                message = "";
            }
            var result = confirm(message);
            var eventObject = result ? CocoonJS.App.onMessageBoxConfirmed : CocoonJS.App.onMessageBoxDenied;
            eventObject.notifyEventListeners();
        }
    };

    /**
     * It allows to load a new JavaScript/HTML5 resource that can be loaded either locally (inside the platform/device storage) or using a remote URL.
     * @function
     * @param {string} path A path to a resource stored in the platform or in a URL to a remote resource.
     * @param {CocoonJS.App.StorageType} [storageType] If the path argument represents a locally stored resource, the developer can specify the storage where it is stored. If no value is passes, the {@link CocoonJS.App.StorageType.APP_STORAGE} value is used by default.
     */
    CocoonJS.App.load = function (path, storageType) {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP", "loadPath", arguments);
        }
        else if (!navigator.isCocoonJS) {
            var xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function (event) {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        // TODO: As window load event is not being called (WHY???), I have decided to call the listeners directly
                        // var callback= function(event){
                        //     window.removeEventListener("load", callback);
                        var jsCode;
                        // If there is no webview, it means we are in the webview, so notify the CocoonJS environment
                        if (!CocoonJS.App.EmulatedWebViewIFrame) {
                            jsCode = "window.CocoonJS && window.CocoonJS.App.onLoadInTheWebViewSucceed.notifyEventListeners('" + path + "');";
                        }
                        // If there is a webview, it means we are in CocoonJS, so notify the webview environment
                        else {
                            jsCode = "window.CocoonJS && window.CocoonJS.App.onLoadInCocoonJSSucceed.notifyEventListeners('" + path + "');";
                        }
                        CocoonJS.App.forwardAsync(jsCode);
                        // };
                        // window.addEventListener("load", callback);
                        window.location.href = path;
                    }
                    else if (xhr.status === 404) {
                        this.onreadystatechange = null;
                        var jsCode;
                        // If there is no webview, it means we are in the webview, so notify the CocoonJS environment
                        if (!CocoonJS.App.EmulatedWebViewIFrame) {
                            jsCode = "CocoonJS && CocoonJS.App.onLoadInTheWebViewFailed.notifyEventListeners('" + path + "');";
                        }
                        // If there is a webview, it means we are in CocoonJS, so notify the webview environment
                        else {
                            jsCode = "CocoonJS && CocoonJS.App.onLoadInCocoonJSFailed.notifyEventListeners('" + path + "');";
                        }
                        CocoonJS.App.forwardAsync(jsCode);
                    }
                }
            };
            xhr.open("GET", path, true);
            xhr.send();
        }
    };

    /**
     * Reloads the last loaded path in the current context.
     * @function
     */
    CocoonJS.App.reload = function () {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP", "reload", arguments);
        }
        else if (!navigator.isCocoonJS) {
            if (window.name == 'CocoonJS_App_ForCocoonJS_WebViewIFrame') {
                return window.parent.location.reload();
            }
            else {
                return window.parent.frames['CocoonJS_App_ForCocoonJS_WebViewIFrame'].window.location.reload();
            }
        }
    };

    /**
     * Opens a given URL using a system service that is able to open it. For example, open a HTTP URL using the system WebBrowser.+
     * @function
     * @param {string} url The URL to be opened by a system service.
     */
    CocoonJS.App.openURL = function (url) {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP", "openURL", arguments, true);
        }
        else if (!navigator.isCocoonJS) {
            window.open(url, '_blank');
        }
    }

    /**
     * Forces the app to be finished.
     * @function
     */
    CocoonJS.App.forceToFinish = function () {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP", "forceToFinish", arguments);
        }
        else if (!navigator.isCocoonJS) {
            window.close();
        }
    }

    /**
     * Enables or disables the auto lock to control if the screen keeps on after an inactivity period.
     * When the auto lock is enabled and the application has no user input for a short period, the system puts the device into a "sleepâ€ state where the screen dims or turns off.
     * When the auto lock is disabled the screen keeps on even when there is no user input for long times.
     * @param enabled A boolean value that controls whether to enable or disable the auto lock.
     */
    CocoonJS.App.setAutoLockEnabled = function (enabled) {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP", "setAutoLockEnabled", arguments);
        }
    }

    /**
     * Creates a canvas element that is automatically resized to the screen size. When the app is being executed
     * inside CocoonJS. This canvas is optimized for rendering so it is higly recommended to use it if it fits
     * your app needs. If your app uses one canvas as the main canvas where all other canvases and images are displayed, Ludei recommends to
     * call this function in order to create this main canvas. A usual 2x performance gain is achieved by doing so
     * depending on the device and the graphics card driver.
     * @function
     * @return {object} The canvas object that should be used as the main canvas and that is resized to the screen resolution.
     */
    CocoonJS.App.createScreenCanvas = function () {
        var screenCanvas;
        if (navigator.isCocoonJS) {
            screenCanvas = document.createElement("screencanvas");
        }
        else if (!navigator.isCocoonJS) {
            screenCanvas = document.createElement("canvas");
            screenCanvas.width = window.innerWidth;
            screenCanvas.height = window.innerHeight;
        }
        return screenCanvas;
    };

    /**
     * Disables the touch events in the CocoonJS environment.
     * @function
     */
    CocoonJS.App.disableTouchInCocoonJS = function () {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            window.ext.IDTK_APP.makeCall("disableTouchLayer", "CocoonJSView");
        }
    };

    /**
     * Enables the touch events in the CocoonJS environment.
     * @function
     */
    CocoonJS.App.enableTouchInCocoonJS = function () {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            window.ext.IDTK_APP.makeCall("enableTouchLayer", "CocoonJSView");
        }
    };

    /**
     * Disables the touch events in the WebView environment.
     * @function
     */
    CocoonJS.App.disableTouchInTheWebView = function () {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            window.ext.IDTK_APP.makeCall("disableTouchLayer", "WebView");
        }
    };

    /**
     * Enables the touch events in the WebView environment.
     * @function
     */
    CocoonJS.App.enableTouchInTheWebView = function () {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            window.ext.IDTK_APP.makeCall("enableTouchLayer", "WebView");
        }
    };

    /**
     * Setups the update interval in seconds (1 second / X frames) to receive the accelerometer updates.
     * It defines the rate at which the devicemotion events are updated.
     * @function
     * @param {number} updateIntervalInSeconds The update interval in seconds to be set.
     */
    CocoonJS.App.setAccelerometerUpdateIntervalInSeconds = function (updateIntervalInSeconds) {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            return window.ext.IDTK_APP.makeCall("setAccelerometerUpdateIntervalInSeconds", updateIntervalInSeconds);
        }
    };

    /**
     * Returns the update interval in seconds that is currently set for accelerometer related events.
     * @function
     * @return {number} The update interval in seconds that is currently set for accelerometer related events.
     */
    CocoonJS.App.getAccelerometerUpdateIntervalInSeconds = function () {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            return window.ext.IDTK_APP.makeCall("getAccelerometerUpdateIntervalInSeconds");
        }
    };

    /**
     * Setups the update interval in seconds (1 second / X frames) to receive the gyroscope updates.
     * It defines the rate at which the devicemotion and deviceorientation events are updated.
     * @function
     * @param {number} updateIntervalInSeconds The update interval in seconds to be set.
     */
    CocoonJS.App.setGyroscopeUpdateIntervalInSeconds = function (updateIntervalInSeconds) {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            return window.ext.IDTK_APP.makeCall("setGyroscopeUpdateIntervalInSeconds", updateIntervalInSeconds);
        }
    };

    /**
     * Returns the update interval in seconds that is currently set for gyroscope related events.
     * @function
     * @return {number} The update interval in seconds that is currently set for gyroscope related events.
     */
    CocoonJS.App.getGyroscopeUpdateIntervalInSeconds = function () {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            window.ext.IDTK_APP.makeCall("getGyroscopeUpdateIntervalInSeconds");
        }
    };


    /**
     * Setups a origin proxy for a given typeName. What this means is that after calling this function the environment that makes this call will suddenly
     * have a way of creating instances of the given typeName and those instances will act as a transparent proxy to counterpart instances in the destination environment.
     * Manipulating attributes, calling funcitions or handling events will all be performed in the destination environment but the developer will think they will be
     * happening in the origin environment.
     * IMPORTANT NOTE: These proxies only work with types that use attributes and function parameters and return types that are primitive like numbers, strings or arrays.
     * @param {string} typeName The name of the type to be proxified.
     * @param {array} [attributeNames] A list of the names of the attributes to be proxified.
     * @param {array} [functionNames] A list of the names of the functions to be proxified.
     * @param {array} [eventHandlerNames] A list of the names of the event handlers to be proxified (onXXXX like attributes that represent callbacks).
     * A valid typeName and at least one valid array for attribute, function or event handler names is mandatory.
     */
    CocoonJS.App.setupOriginProxyType = function (typeName, attributeNames, functionNames, eventHandlerNames) {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            // Control the parameters.
            if (!typeName) throw "The given typeName must be valid.";
            if (!attributeNames && !functionNames && !eventHandlerNames) throw "There is no point on setting up a proxy for no attributes, functions nor eventHandlers.";
            attributeNames = attributeNames ? attributeNames : [];
            functionNames = functionNames ? functionNames : [];
            eventHandlerNames = eventHandlerNames ? eventHandlerNames : [];

            // The parent object will be the window. It could be another object but careful, the destination side should know about this.
            // TODO: Specify the parentObject as a parameter, obtain it's path from the window object and pass it to the destination environment so it knows about it.
            var parentObject = window;

            // Setup the destination side too.
            var jsCode = "CocoonJS.App.setupDestinationProxyType(" + JSON.stringify(typeName) + ", " + JSON.stringify(eventHandlerNames) + ");";
            CocoonJS.App.forward(jsCode);

            var originalType = parentObject[typeName];

            // Constructor. This will be the new proxified type in the origin environment. Instances of this type will be created by the developer without knowing that they are
            // internally calling to their counterparts in the destination environment.
            parentObject[typeName] = function () {
                var _this = this;

                // Each proxy object will have a origin object inside with all the necessary information to be a proxy to the destination.
                this._cocoonjs_proxy_object_data = {};
                // The id is obtained calling to the destination side to create an instance of the type.
                var jsCode = "CocoonJS.App.newDestinationProxyObject(" + JSON.stringify(typeName) + ");";
                this._cocoonjs_proxy_object_data.id = CocoonJS.App.forward(jsCode);
                // The eventHandlers dictionary contains objects of the type { eventHandlerName : string, eventHandler : function } to be able to make the callbacks when the 
                // webview makes the corresponding calls.
                this._cocoonjs_proxy_object_data.eventHandlers = {};
                // Also store the typename inside each instance.
                this._cocoonjs_proxy_object_data.typeName = typeName;
                // A dictionary to store the event handlers
                this._cocoonjs_proxy_object_data.eventListeners = {};

                // TODO: eventHandlers and eventListeners should be in the same list ;)

                // Store all the proxy instances in a list that belongs to the type itself.
                parentObject[typeName]._cocoonjs_proxy_type_data.proxyObjects[this._cocoonjs_proxy_object_data.id] = this;

                // Create a setter and a getter for all the attribute names that have been specified. When the attributes are accessed (set or get) a call to the destination counterpart will be performed.
                for (var i = 0; i < attributeNames.length; i++) {
                    (function (attributeName) {
                        _this.__defineSetter__(attributeName, function (value) {
                            var jsCode = "CocoonJS.App.setDestinationProxyObjectAttribute(" + JSON.stringify(typeName) + ", " + _this._cocoonjs_proxy_object_data.id + ", " + JSON.stringify(attributeName) + ", " + JSON.stringify(value) + ");";
                            return CocoonJS.App.forwardAsync(jsCode);
                        });
                        _this.__defineGetter__(attributeName, function () {
                            var jsCode = "CocoonJS.App.getDestinationProxyObjectAttribute(" + JSON.stringify(typeName) + ", " + _this._cocoonjs_proxy_object_data.id + ", " + JSON.stringify(attributeName) + ");";
                            return CocoonJS.App.forwardAsync(jsCode);
                        });
                    })(attributeNames[i]);
                }

                // Create a function that performs a call to the destination environment counterpart for all the function names that have been specified.
                for (var i = 0; i < functionNames.length; i++) {
                    (function (functionName) {
                        _this[functionName] = function () {
                            // Get the arguments as an array and add the typeName, the proxy id and the functionName before all the other arguments before making the call to the destination counterpart.
                            var argumentsArray = Array.prototype.slice.call(arguments);
                            argumentsArray.unshift(functionName);
                            argumentsArray.unshift(this._cocoonjs_proxy_object_data.id);
                            argumentsArray.unshift(typeName);
                            // Use the array to create the correct function call.
                            var jsCode = "CocoonJS.App.callDestinationProxyObjectFunction(";
                            for (var i = 0; i < argumentsArray.length; i++) {
                                // The second argument (the id) should not be stringified
                                jsCode += (i !== 1 ? JSON.stringify(argumentsArray[i]) : argumentsArray[i]) + (i < argumentsArray.length - 1 ? ", " : "");
                            }
                            jsCode += ");";
                            // TODO: This next call should be synchronous but it seems that some customers are experiencing some crash issues. Making it async solves these crashes.
                            // Another possible solution could be to be able to specify which calls could be async and which sync in the proxification array.
                            var ret = CocoonJS.App.forwardAsync(jsCode);
                            return ret;
                        };
                    })(functionNames[i]);
                }

                // Create a setter and getter for all the event handler names that have been specified. When the event handlers are accessed, store them inside the corresponding position on the eventHandlers
                // array so they can be called when the destination environment makes the corresponding callback call.
                for (var i = 0; i < eventHandlerNames.length; i++) {
                    (function (eventHandlerName) {
                        _this.__defineSetter__(eventHandlerName, function (value) {
                            _this._cocoonjs_proxy_object_data.eventHandlers[eventHandlerName] = value;
                        });
                        _this.__defineGetter__(eventHandlerName, function () {
                            return _this._cocoonjs_proxy_object_data.eventHandlers[eventHandlerName];
                        });
                    })(eventHandlerNames[i]);
                }

                // Setup the add and remove event listeners in the proxy object
                _this.addEventListener = function (eventTypeName, eventCallback) {
                    var addEventCallback = true;
                    // Check for the eventListeners
                    var eventListeners = _this._cocoonjs_proxy_object_data.eventListeners[eventTypeName];
                    if (eventListeners) {
                        // As the eventListeners were already added, check that the same callback has not been added.
                        addEventCallback = eventListeners.indexOf(eventCallback) < 0;
                    }
                    else {
                        // There are no event listeners, so add the one and add the listeners array for the specific event type name
                        eventListeners = [];
                        _this._cocoonjs_proxy_object_data.eventListeners[eventTypeName] = eventListeners;

                        // Forward the call so the other end registers a event listener (only one is needed).
                        var jsCode = "CocoonJS.App.addDestinationProxyObjectEventListener(" + JSON.stringify(_this._cocoonjs_proxy_object_data.typeName) + ", " + _this._cocoonjs_proxy_object_data.id + ", " + JSON.stringify(eventTypeName) + ");";
                        CocoonJS.App.forwardAsync(jsCode);
                    }
                    // Only if the alforithm above specify so, add the eventcallback and notify the destination environment to do the same
                    if (addEventCallback) {
                        eventListeners.push(eventCallback);
                    }
                };

                _this.removeEventListener = function (eventTypeName, eventCallback) {
                    // Check for the eventListeners
                    var eventListeners = _this._cocoonjs_proxy_object_data.eventListeners[eventTypeName];
                    if (eventListeners) {
                        var eventCallbackIndex = eventListeners.indexOf(eventCallback);
                        if (eventCallbackIndex >= 0) {
                            eventListeners.splice(eventCallbackIndex, 1);
                        }
                    }
                };

                // Return the proxy instance.
                return this;
            };

            // The type will contain a proxy data structure to store all the instances that are created so they are available when the destination environment calls back. 
            parentObject[typeName]._cocoonjs_proxy_type_data =
            {
                originalType:originalType,
                proxyObjects:[]
            };

            /**
             * Deletes a proxy instance from both the CocoonJS environment structures and also deleting it's webview environment counterpart.
             * This function should be manually called whenever a proxy instance won't be accessed anymore.
             * @param {object} object The proxy object to be deleted.
             */
            parentObject[typeName]._cocoonjs_proxy_type_data.deleteProxyObject = function (object) {
                var proxyObjectKey = CocoonJS.getKeyForValueInDictionary(this.proxyObjects, object);
                if (proxyObjectKey) {
                    var jsCode = "CocoonJS.App.deleteDestinationProxyObject(" + JSON.stringify(typeName) + ", " + object._cocoonjs_proxy_object_data.id + ");";
                    CocoonJS.App.forwardAsync(jsCode);
                    object._cocoonjs_proxy_object_data = null;
                    delete this.proxyObjects[proxyObjectKey];
                }
            };

            /**
             * Calls a event handler for the given proxy object id and eventHandlerName.
             * @param {number} id The id to be used to look for the proxy object for which to make the call to it's event handler.
             * @param {string} eventHandlerName The name of the handler to be called.
             * NOTE: Events are a complex thing in the HTML specification. This function just performs a call but at least provides a
             * structure to the event passing the target (the proxy object).
             * TODO: The destination should serialize the event object as far as it can so many parameters can be passed to the origin
             * side. Using JSON.stringify in the destination side and parse in origin side maybe? Still must add the target to the event structure though.
             */
            parentObject[typeName]._cocoonjs_proxy_type_data.callProxyObjectEventHandler = function (id, eventHandlerName) {
                var object = this.proxyObjects[id];
                var eventHandler = object._cocoonjs_proxy_object_data.eventHandlers[eventHandlerName];
                if (eventHandler) {
                    eventHandler({ target:object });
                }
            };

            parentObject[typeName]._cocoonjs_proxy_type_data.callProxyObjectEventListeners = function (id, eventTypeName) {
                var object = this.proxyObjects[id];
                var eventListeners = object._cocoonjs_proxy_object_data.eventListeners[eventTypeName].slice();
                for (var i = 0; i < eventListeners.length; i++) {
                    eventListeners[i]({ target:object });
                }
            };
        }
    };

    /**
     * Takes down the proxification of a type and restores it to it's original type. Do not worry if you pass a type name that is not proxified yet. The
     * function will handle it correctly for compativility reasons.
     * @param {string} typeName The name of the type to be deproxified (take down the proxification and restore the type to it's original state)
     */
    CocoonJS.App.takedownOriginProxyType = function (typeName) {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            var parentObject = window;
            if (parentObject[typeName] && parentObject[typeName]._cocoonjs_proxy_type_data) {
                parentObject[typeName] = parentObject[typeName]._cocoonjs_proxy_type_data.originalType;
            }
        }
    };

    /**
     * Deletes everything related to a proxy object in both environments. Do not worry of you do not pass a proxified object to the
     * function. For compatibility reasons, you can still have calls to this function even when no poxification of a type has been done.
     * @param {object} object The proxified object to be deleted.
     */
    CocoonJS.App.deleteOriginProxyObject = function (object) {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            var parentObject = window;
            if (object && object._cocoonjs_proxy_object_data) {
                parentObject[object._cocoonjs_proxy_object_data.typeName]._cocoonjs_proxy_type_data.deleteProxyObject(object);
            }
        }
    };

    /**
     * NOTE: This function should never be directly called. It will be called from the destination environment whenever it is needed to work with proxy objects.
     * It calls the origin proxy object when an event handler need to be updated/called from the destination environment.
     * @param {string} typeName The type name of the proxified type.
     * @param {number} id The id of the proxy object.
     * @param {string} eventHandlerName The name of the event handler to be called.
     */
    CocoonJS.App.callOriginProxyObjectEventHandler = function (typeName, id, eventHandlerName) {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            var parentObject = window;
            parentObject[typeName]._cocoonjs_proxy_type_data.callProxyObjectEventHandler(id, eventHandlerName);
        }
    };

    /**
     * NOTE: This function should never be directly called. It will be called from the destination environment whenever it is needed to work with proxy objects.
     * It calls the origin proxy object when all the event listeners related to a specific event need to be updated/called from the destination environment.
     * @param {string} typeName The type name of the proxified type.
     * @param {number} id The id of the proxy object.
     * @param {string} eventTypeName The name of the event type to call the listeners related to it.
     */
    CocoonJS.App.callOriginProxyObjectEventListeners = function (typeName, id, eventTypeName) {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            var parentObject = window;
            parentObject[typeName]._cocoonjs_proxy_type_data.callProxyObjectEventListeners(id, eventTypeName);
        }
    };

    /**
     * NOTE: This function should never be directly called. It will be called from the origin environment whenever it is needed to work with proxy objects.
     * Setups all the structures that are needed to proxify a destination type to an origin type.
     * @param {string} typeName The name of the type to be proxified.
     * @param {array} eventHandlerNames An array with al the event handlers to be proxified. Needed in order to be able to create callbacks for all the event handlers
     * and call to the CocoonJS counterparts accordingly.
     */
    CocoonJS.App.setupDestinationProxyType = function (typeName, eventHandlerNames) {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            var parentObject = window;

            // Add a cocoonjs structure to the destination proxified type to store some useful information like all the proxy instances that are created, plus the id counter 
            // and the names of all the event handlers and some utility functions.
            parentObject[typeName]._cocoonjs_proxy_type_data =
            {
                nextId:0,
                proxyObjects:{},
                eventHandlerNames:eventHandlerNames
            }
        }
    };

    /**
     * NOTE: This function should never be directly called. It will be called from the origin environment whenever it is needed to work with proxy objects.
     * Takes down the proxy type at the destination environment. Just removes the data structure related to proxies that was added to the type when proxification tool place.
     * @param {string} typeName The name of the type to take the proxification down.
     */
    CocoonJS.App.takedownDestinationProxyType = function (typeName) {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            var parentObject = window;
            if (parent[typeName] && parentObject[typeName]._cocoonjs_proxy_type_data) {
                delete parentObject[typeName]._cocoonjs_proxy_type_data;
            }
        }
    };

    /**
     * NOTE: This function should never be directly called. It will be called from the original environment whenever it is needed to work with proxy objects.
     * Creates a new destination object instance and generates a id to reference it from the original environment.
     * @param {string} typeName The name of the type to be proxified and to generate an instance.
     * @return The id to be used from the original environment to identify the corresponding destination object instance.
     */
    CocoonJS.App.newDestinationProxyObject = function (typeName) {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            var parentObject = window;

            var proxyObject = new parentObject[typeName]();
            // Also store some additional information in the proxy object
            proxyObject._cocoonjs_proxy_object_data = {};
            // Like the type name, that could be useful late ;)
            proxyObject._cocoonjs_proxy_object_data.typeName = typeName;
            // Caculate the id for the object. It will be returned to the origin environment so this object can be referenced later
            var proxyObjectId = parentObject[typeName]._cocoonjs_proxy_type_data.nextId;
            // Store the created object in the structure defined in the setup of proxification with an id associated to it
            parentObject[typeName]._cocoonjs_proxy_type_data.proxyObjects[proxyObjectId] = proxyObject;
            // Also store the id inside the proxy object itself
            proxyObject._cocoonjs_proxy_object_data.id = proxyObjectId;
            // Calculate a new id for the next object.
            parentObject[typeName]._cocoonjs_proxy_type_data.nextId++;

            // Setup all the event handlers.
            for (var i = 0; i < parentObject[typeName]._cocoonjs_proxy_type_data.eventHandlerNames.length; i++) {
                (function (eventHandlerName) {
                    proxyObject[eventHandlerName] = function (event) {
                        var proxyObject = this; // event.target;
                        // var eventHandlerName = CocoonJS.getKeyForValueInDictionary(proxyObject, this); // Avoid closures ;)
                        var jsCode = "CocoonJS.App.callOriginProxyObjectEventHandler(" + JSON.stringify(proxyObject._cocoonjs_proxy_object_data.typeName) + ", " + proxyObject._cocoonjs_proxy_object_data.id + ", " + JSON.stringify(eventHandlerName) + ");";
                        CocoonJS.App.forwardAsync(jsCode);
                    };
                })(parentObject[typeName]._cocoonjs_proxy_type_data.eventHandlerNames[i]);
            }

            // Add the dictionary where the event listeners (callbacks) will be added.
            proxyObject._cocoonjs_proxy_object_data.eventListeners = {};

            return proxyObjectId;
        }
    };

    /**
     * NOTE: This function should never be directly called. It will be called from the origin environement whenever it is needed to work with proxy objects.
     * Calls a function of a destination object idetified by it's typeName and id.
     * @param {string} typeName The name of the type of the proxy.
     * @param {number} id The id of the proxy object.
     * @param {string} functionName The name of the function to be called.
     * @return Whatever the function call returns.
     */
    CocoonJS.App.callDestinationProxyObjectFunction = function (typeName, id, functionName) {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            var parentObject = window;
            var argumentsArray = Array.prototype.slice.call(arguments);
            argumentsArray.splice(0, 3);
            var proxyObject = parentObject[typeName]._cocoonjs_proxy_type_data.proxyObjects[id];
            var result = proxyObject[functionName].apply(proxyObject, argumentsArray);
            return result;
        }
    };

    /**
     * NOTE: This function should never be directly called. It will be called from the original environment whenever it is needed to work with proxy objects.
     * Sets a value to the corresponding attributeName of a proxy object represented by it's typeName and id.
     * @param {string} typeName The name of the type of the proxy.
     * @param {number} id The id of the proxy object.
     * @param {string} attributeName The name of the attribute to be set.
     * @param {unknown} attributeValue The value to be set to the attribute.
     */
    CocoonJS.App.setDestinationProxyObjectAttribute = function (typeName, id, attributeName, attributeValue) {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            var parentObject = window;
            var proxyObject = parentObject[typeName]._cocoonjs_proxy_type_data.proxyObjects[id];
            proxyObject[attributeName] = attributeValue;
        }
    };

    /**
     * NOTE: This function should never be directly called. It will be called from the original environment whenever it is needed to work with proxy objects.
     * Retrieves the value of the corresponding attributeName of a proxy object represented by it's typeName and id.
     * @param {string} typeName The name of the type of the proxy.
     * @param {number} id The id of the proxy object.
     * @param {string} attributeName The name of the attribute to be retrieved.
     */
    CocoonJS.App.getDestinationProxyObjectAttribute = function (typeName, id, attributeName) {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            var parentObject = window;
            var proxyObject = parentObject[typeName]._cocoonjs_proxy_type_data.proxyObjects[id];
            return proxyObject[attributeName];
        }
    };

    /**
     * NOTE: This function should never be directly called. It will be called from the original environment whenever it is needed to work with proxy objects.
     * Deletes a proxy object identifying it using it's typeName and id. Deleting a proxy object mainly means to remove the instance from the global structure
     * that hold all the instances.
     * @param {string} typeName The name of the type of the proxy.
     * @param {number} id The id of the proxy object.
     */
    CocoonJS.App.deleteDestinationProxyObject = function (typeName, id) {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            var parentObject = window;
            delete parentObject[typeName]._cocoonjs_proxy_type_data.proxyObjects[id];
        }
    };

    /**
     * NOTE: This function should never be directly called. It will be called from the original environment whenever it is needed to work with proxy objects.
     */
    CocoonJS.App.addDestinationProxyObjectEventListener = function (typeName, id, eventTypeName) {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            var parentObject = window;
            // Look for the proxy object
            var proxyObject = parentObject[typeName]._cocoonjs_proxy_type_data.proxyObjects[id];

            var callback = function (event) {
                var proxyObject = this; // event.target;
                // var eventTypeName = CocoonJS.getKeyForValueInDictionary(proxyObject._cocoonjs_proxy_object_data.eventListeners, this); // Avoid closures ;)
                // TODO: Is there a way to retrieve the callbackId without a closure?
                var jsCode = "CocoonJS.App.callOriginProxyObjectEventListeners(" + JSON.stringify(proxyObject._cocoonjs_proxy_object_data.typeName) + ", " + proxyObject._cocoonjs_proxy_object_data.id + ", " + JSON.stringify(eventTypeName) + ");";
                CocoonJS.App.forwardAsync(jsCode);
            };

            proxyObject._cocoonjs_proxy_object_data.eventListeners[eventTypeName] = callback;

            // Finally add the event listener callback to the proxy object
            proxyObject.addEventListener(eventTypeName, callback);
        }
    };

    // TODO: We could add a removeDestinationProxyObjectEventListener although it seems that is not completely necessary.

    /**
     * Proxifies the XMLHttpRequest type for the environment where this call is made. After calling this function, all the new objects
     * of XMLHttpRequest that are instantiated, will be proxified objects that will make calls to the counterparts in the other environment (CocoonJS <-> WebView viceversa).
     * IMPORTANT NOTE: Remember to take down the proxification once you are done or to delete proxy objects whenever they are not needed anymore or memory leaks may occur.
     */
    CocoonJS.App.proxifyXHR = function () {
        var ATTRIBUTE_NAMES =
            [
                "timeout",
                "withCredentials",
                "upload",
                "status",
                "statusText",
                "responseType",
                "response",
                "responseText",
                "responseXML",
                "readyState"
            ];
        var FUNCTION_NAMES =
            [
                "open",
                "setRequestHeader",
                "send",
                "abort",
                "getResponseHeader",
                "getAllResponseHeaders",
                "overrideMimeType"
            ];
        var EVENT_HANDLER_NAMES =
            [
                "onloadstart",
                "onprogress",
                "onabort",
                "onerror",
                "onload",
                "ontimeout",
                "onloadend",
                "onreadystatechange"
            ];
        CocoonJS.App.setupOriginProxyType("XMLHttpRequest", ATTRIBUTE_NAMES, FUNCTION_NAMES, EVENT_HANDLER_NAMES);
    };

    /**
     * Proxifies the Audio type for the environment where this call is made. After calling this function, all the new objects
     * of Audio that are instantiated, will be proxified objects that will make calls to the counterparts in the other environment (CocoonJS <-> WebView viceversa).
     * IMPORTANT NOTE: Remember to take down the proxification once you are done or to delete proxy objects whenever they are not needed anymore or memory leaks may occur.
     */
    CocoonJS.App.proxifyAudio = function () {
        var ATTRIBUTE_NAMES =
            [
                "src",
                "loop",
                "volume",
                "preload"
            ];
        var FUNCTION_NAMES =
            [
                "play",
                "pause",
                "load",
                "canPlayType"
            ];
        var EVENT_HANDLER_NAMES =
            [
                "onended",
                "oncanplay",
                "oncanplaythrough",
                "onerror"
            ];
        CocoonJS.App.setupOriginProxyType("Audio", ATTRIBUTE_NAMES, FUNCTION_NAMES, EVENT_HANDLER_NAMES);
    };

    /**
     * Captures a image of the screen synchronously and saves it to a file. Sync mode allows to capture the screen in the middle of a frame rendering.
     * @param {string} fileName Desired file name and format (png or jpg). If no value is passed, "capture.png" value is used by default
     * @param {CocoonJS.App.StorageType} storageType The developer can specify the storage where it is stored. If no value is passed, the {@link CocoonJS.App.StorageType.TMP_STORAGE} value is used by default.
     * @param {CocoonJS.App.CaptureType} captureType. Optional value to choose capture type. [0: captures everything, 1: only captures cocoonjs surface 2: only captures system views]. @see CocoonJS.App.CaptureType
     * @return The URL of the saved file.
     * @throws exception if the image fails to be stored or there is another error.
     * @see CocoonJS.App.onCaptureScreenSucceeded
     * @see CocoonJS.App.onCaptureScreenFailed
     */
    CocoonJS.App.captureScreen = function (fileName, storageType, captureType) {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            return window.ext.IDTK_APP.makeCall("captureScreen", fileName, storageType, captureType);
        }
    };

    /**
     * Captures a image of the screen asynchronously and saves it to a file.
     * Async mode captures a final frame as soon as possible.
     * @param {string} Desired file name and format (png or jpg). If no value is passed, "capture.png" value is used by default
     * @param {CocoonJS.App.StorageType} [storageType] The developer can specify the storage where it is stored. If no value is passed, the {@link CocoonJS.App.StorageType.TMP_STORAGE} value is used by default.
     * @param {CocoonJS.App.CaptureType} captureType. Optional value to choose capture type. [0: captures everything, 1: only captures cocoonjs surface, 2: only captures system views]. @see CocoonJS.App.CaptureType
     * @param {function} callback. Response callback, check the error property to monitor errors. Check the 'url' property to get the URL of the saved Image
     */
    CocoonJS.App.captureScreenAsync = function (fileName, storageType, captureType, callback) {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            window.ext.IDTK_APP.makeCallAsync("captureScreen", fileName, storageType, captureType, callback);
        }
    };

    /**
     * Returns the device UUID
     * @return {string} The device UUID
     */
    CocoonJS.App.getDeviceId = function() {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            return window.ext.IDTK_APP.makeCall("getDeviceId");
        }
    };

    /**
     * Structure that defines the getDeviceInfo returned information
     */
    CocoonJS.App.DeviceInfo = {

        /**
        * The operating system name (ios, android,...)
        * @type string
        */
        os: null,

        /**
        * The operating system version (4.2.2, 5.0,...)
        * @type string
        */
        version: null,

        /**
        * The operating system screen density in dpi
        * @type string
        */
        dpi: null,

        /**
        * The device manufacturer (apple, samsung, lg,...)
        * @type string
        */
        brand: null,

        /**
        * The device model (iPhone 4S, SAMSUNG-SGH-I997, SAMSUNG-SGH-I997R, etc)
        * @type string
        */
        model: null,

        /**
        * The phone IMEI
        * Android: The phone IMEI is returned or null if the device has not telepohny
        * iOS: null is returned as we cannot get the IMEI in iOS, no public API available for that yet.
        * @type string
        */
        imei: null,

        /**
        * The platform Id
        * Android: The ANDROID_ID is used.
        * iOS: The OpenUDID is used as there is no Android ANDROID_ID equivalent in iOS
        * @type string
        */
        platformId: null,

        /**
        * The Odin generated id https://code.google.com/p/odinmobile/
        * @type string
        */
        odin: null,

        /**
        * The OpenUDID generated Id https://github.com/ylechelle/OpenUDID
        * @type string
        */
        openudid: null
    };

    /**
     * Returns the device Info
     * @return {CocoonJS.App.DeviceInfo} The device Info
     */
    CocoonJS.App.getDeviceInfo = function() {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            return window.ext.IDTK_APP.makeCall("getDeviceInfo");
        }
    };    

    /**
     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.App.onTextDialogFinished} event calls.
     * @name OnTextDialogFinishedListener
     * @function
     * @static
     * @memberOf CocoonJS.App
     * @param {string} text The text that was introduced in the text dialog when it was finished.
     */
    /**
     * This {@link CocoonJS.EventHandler} object allows listening to events called when the text dialog is finished by accepting it's content.
     * The callback function's documentation is represented by {@link CocoonJS.App.OnTextDialogFinishedListener}
     * @event
     * @static
     * @memberOf CocoonJS.App
     */
    CocoonJS.App.onTextDialogFinished = new CocoonJS.EventHandler("IDTK_APP", "App", "ontextdialogfinish");

    /**
     * This {@link CocoonJS.EventHandler} object allows listening to events called when the text dialog is finished by dismissing it's content.
     * The callback function does not receive any parameter.
     * @event
     * @static
     * @memberOf CocoonJS.App
     */
    CocoonJS.App.onTextDialogCancelled = new CocoonJS.EventHandler("IDTK_APP", "App", "ontextdialogcancel");

    /**
     * This {@link CocoonJS.EventHandler} object allows listening to events called when the text dialog is finished by accepting it's content.
     * The callback function does not receive any parameter.
     * @event
     * @static
     * @memberOf CocoonJS.App
     */
    CocoonJS.App.onMessageBoxConfirmed = new CocoonJS.EventHandler("IDTK_APP", "App", "onmessageboxconfirmed");

    /**
     * This {@link CocoonJS.EventHandler} object allows listening to events called when the text dialog is finished by dismissing it's content.
     * The callback function does not receive any parameter.
     * @event
     * @static
     * @memberOf CocoonJS.App
     */
    CocoonJS.App.onMessageBoxDenied = new CocoonJS.EventHandler("IDTK_APP", "App", "onmessageboxdenied");

    /**
     * This {@link CocoonJS.EventHandler} object allows listening to events called when the application is suspended.
     * The callback function does not receive any parameter.
     * @event
     * @static
     * @memberOf CocoonJS.App
     */
    CocoonJS.App.onSuspended = new CocoonJS.EventHandler("IDTK_APP", "App", "onsuspended");

    /**
     * This {@link CocoonJS.EventHandler} object allows listening to events called when the application is activated.
     * The callback function does not receive any parameter.
     * @event
     * @static
     * @memberOf CocoonJS.App
     */
    CocoonJS.App.onActivated = new CocoonJS.EventHandler("IDTK_APP", "App", "onactivated");

})();

//////////////////////////////////////
// COCOONJS_APP_FORCOCOONJS.JS		//
//////////////////////////////////////

(function()
{
    if (typeof window.CocoonJS === 'undefined' || window.CocoonJS === null) throw("The CocoonJS object must exist and be valid before adding more functionalities to an extension.");
    if (typeof window.CocoonJS.App === 'undefined' || window.CocoonJS.App === null) throw("The CocoonJS.App object must exist and be valid before adding more functionalities to it.");

    /**
    * This namespace represents all the basic functionalities available in the CocoonJS extension API.
    * @namespace
    */
    CocoonJS.App = CocoonJS.App ? CocoonJS.App : {};

    if (!CocoonJS.App.nativeExtensionObjectAvailable)
    {
        (function createWebView() { 
            CocoonJS.App.EmulatedWebView = document.createElement('div'); 
            CocoonJS.App.EmulatedWebView.setAttribute('id', 'CocoonJS_App_ForCocoonJS_WebViewDiv'); 
            CocoonJS.App.EmulatedWebView.style.width = 0; 
            CocoonJS.App.EmulatedWebView.style.height = 0; 
            CocoonJS.App.EmulatedWebView.style.position = "absolute"; 
            CocoonJS.App.EmulatedWebView.style.left = 0; 
            CocoonJS.App.EmulatedWebView.style.top = 0;
            CocoonJS.App.EmulatedWebView.style.backgroundColor = 'transparent';
            CocoonJS.App.EmulatedWebView.style.border = "0px solid #000"; 
            CocoonJS.App.EmulatedWebViewIFrame = document.createElement("IFRAME"); 
            CocoonJS.App.EmulatedWebViewIFrame.setAttribute('id', 'CocoonJS_App_ForCocoonJS_WebViewIFrame');
            CocoonJS.App.EmulatedWebViewIFrame.setAttribute('name', 'CocoonJS_App_ForCocoonJS_WebViewIFrame');
            CocoonJS.App.EmulatedWebViewIFrame.style.width = 0; 
            CocoonJS.App.EmulatedWebViewIFrame.style.height = 0; 
            CocoonJS.App.EmulatedWebViewIFrame.frameBorder = 0;
            CocoonJS.App.EmulatedWebViewIFrame.allowtransparency = true;
            CocoonJS.App.EmulatedWebView.appendChild(CocoonJS.App.EmulatedWebViewIFrame);
            if(!document.body)
            document.body = document.createElement("body");
            document.body.appendChild(CocoonJS.App.EmulatedWebView);
        })(); 
    }

    /**
    * Pauses the CocoonJS JavaScript execution loop.
    * @function
    * @augments CocoonJS.App
    */
    CocoonJS.App.pause = function()
    {
        if (CocoonJS.App.nativeExtensionObjectAvailable)
        {
            return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP", "pause", arguments);
        }
    };

    /**
    * Resumes the CocoonJS JavaScript execution loop.
    * @static
    * @function
    */
    CocoonJS.App.resume = function()
    {
        if (CocoonJS.App.nativeExtensionObjectAvailable)
        {
            return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP", "resume", arguments);
        }
    };

    /**
    * Loads a resource in the WebView environment from the CocoonJS environment.
    * @function
    * @param {string} path The path to the resource. It can be a remote URL or a path to a local file.
    * @param {CocoonJS.App.StorageType} [storageType] An optional parameter to specify at which storage in the device the file path is stored. By default, APP_STORAGE is used.
    * @see CocoonJS.App.load
    * @see CocoonJS.App.onLoadInTheWebViewSucceed
    * @see CocoonJS.App.onLoadInTheWebViewFailed
    */
    CocoonJS.App.loadInTheWebView = function(path, storageType)
    {
        if (CocoonJS.App.nativeExtensionObjectAvailable)
        {
            // TODO: All this code should be changed to a simple call makeNativeExtensionObjectFunctionCall when the native argument control is improved.
            var javaScriptCodeToForward = "ext.IDTK_APP.makeCall('loadPath'";
            if (typeof path !== 'undefined')
            {
                javaScriptCodeToForward += ", '" + path + "'";
                if (typeof storageType !== 'undefined')
                {
                    javaScriptCodeToForward += ", '" + storageType + "'";
                }
            }
            javaScriptCodeToForward += ");";

            return CocoonJS.App.forwardAsync(javaScriptCodeToForward);
        }
        else if (!navigator.isCocoonJS)
        {
            var xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function(event) {
                if (xhr.readyState === 4)
                {
                    if (xhr.status === 200)
                    {
                        var callback= function(event){
                            CocoonJS.App.onLoadInTheWebViewSucceed.notifyEventListeners(path);
                            CocoonJS.App.EmulatedWebViewIFrame.removeEventListener("load", callback);
                        };

                        CocoonJS.App.EmulatedWebViewIFrame.addEventListener(
                            "load", 
                            callback
                        );
                        CocoonJS.App.EmulatedWebViewIFrame.contentWindow.location.href= path;
                    }
                    else if (xhr.status === 404)
                    {
                        this.onreadystatechange = null;
                        CocoonJS.App.onLoadInTheWebViewFailed.notifyEventListeners(path);
                    }
                }
            };
            xhr.open("GET", path, true);
            xhr.send();
        }
    };

    /**
     * Reloads the last loaded path in the WebView context.
     * @function
     */
    CocoonJS.App.reloadWebView = function()
    {
        if (CocoonJS.App.nativeExtensionObjectAvailable)
        {
            return CocoonJS.App.forwardAsync("ext.IDTK_APP.makeCall('reload');");
        }
        else if (!navigator.isCocoonJS)
        {
            CocoonJS.App.EmulatedWebViewIFrame.contentWindow.location.reload();
        }
    };

    /**
    * Shows the webview.
    * @function
    * @param {int} x The top lef x coordinate of the rectangle where the webview will be shown.
    * @param {int} y The top lef y coordinate of the rectangle where the webview will be shown.
    * @param {width} y The width of the rectangle where the webview will be shown.
    * @param {height} y The height of the rectangle where the webview will be shown.
    */
    CocoonJS.App.showTheWebView = function(x, y, width, height)
    {
        if (CocoonJS.App.nativeExtensionObjectAvailable)
        {
            var javaScriptCodeToForward = "ext.IDTK_APP.makeCall('show'";
            if (typeof x !== 'undefined' && typeof y !== 'undefined' && typeof width !== 'undefined' && typeof height !== 'undefined')
            {
                javaScriptCodeToForward += ", " + x + ", " + y + ", " + width + ", " + height;
            }
            javaScriptCodeToForward += ");";

            return CocoonJS.App.forwardAsync(javaScriptCodeToForward);
        }
        else if (!navigator.isCocoonJS)
        {
            CocoonJS.App.EmulatedWebViewIFrame.style.width = (width ? width : window.innerWidth)+'px';
            CocoonJS.App.EmulatedWebViewIFrame.style.height = (height ? height : window.innerHeight)+'px';
            CocoonJS.App.EmulatedWebView.style.left = (x ? x : 0)+'px';
            CocoonJS.App.EmulatedWebView.style.top = (y ? y : 0)+'px';
            CocoonJS.App.EmulatedWebView.style.width = (width ? width : window.innerWidth)+'px';
            CocoonJS.App.EmulatedWebView.style.height = (height ? height : window.innerHeight)+'px';
            CocoonJS.App.EmulatedWebView.style.display = "block";
        }
    };

    /**
    * Hides the webview.
    * @function
    */
    CocoonJS.App.hideTheWebView = function()
    {
        if (CocoonJS.App.nativeExtensionObjectAvailable)
        {
            var javaScriptCodeToForward = "ext.IDTK_APP.makeCall('hide');";
            return CocoonJS.App.forwardAsync(javaScriptCodeToForward);
        }
        else if (!navigator.isCocoonJS)
        {
            CocoonJS.App.EmulatedWebView.style.display = "none";
        }
    };

    /**
    * Marks a audio file to be used as music by the system. CocoonJS, internally, differentiates among music files and sound files.
    * Music files are usually bigger in size and longer in duration that sound files. There can only be just one music file 
    * playing at a specific given time. The developer can mark as many files as he/she wants to be treated as music. When the corresponding
    * HTML5 audio object is used, the system will automatically know how to treat the audio resource as music or as sound.
    * Note that it is not mandatory to use this function. The system automatically tries to identify if a file is suitable to be treated as music
    * or as sound by checking file size and duration thresholds. It is recommended, though, that the developer specifies him/herself what he/she considers
    * to be music.
    * @function
    * @param {string} audioFilePath The same audio file path that will be used to create HTML5 audio objects.
    */
    CocoonJS.App.markAsMusic = function(audioFilePath)
    {
        if (CocoonJS.App.nativeExtensionObjectAvailable)
        {
           return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP", "addForceMusic", arguments);
        }
    };

    /**
    * Activates or deactivates the antialas functionality from the CocoonJS rendering.
    * @function
    * @param {boolean} enable A flag that indicates if the antialas should be activated (true) or deactivated (false).
    */
    CocoonJS.App.setAntialias = function(enable)
    {
        if (CocoonJS.App.nativeExtensionObjectAvailable)
        {
           return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP", "setDefaultAntialias", arguments);
        }
    };

    /**
    * Sets a callback function that will be called whenever the system tries to finish the app.
    * The developer can specify how the system will react to the finish of the app by returning a
    * boolean value in the callback function: true means, close the app, false means that the developer
    * will handle the app close.
    * A common example of this is the back button in Android devices. When the back button is pressed, this
    * callback will be called and the system will react depending on the developers choice finishing, or not,
    * the application.
    * @function
    * @param {function} appShouldFinishCallback A function object that will be called when the system
    * determines that the app should be finished. This function must return a true or a false value
    * depending on what the developer wants: true === finish the app, false === do not close the app.
    */
    CocoonJS.App.setAppShouldFinishCallback = function(appShouldFinishCallback)
    {
        if (navigator.isCocoonJS)
        {
            window.onidtkappfinish = appShouldFinishCallback;
        }
    }

    /**
    * Sets the texture reduction options. The texture reduction is a process that allows big images to be reduced/scaled down when they are loaded.
    * Although the quality of the images may decrease, it can be very useful in low end devices or those with limited amount of memory.
    * The function sets the threshold on image size (width or height) that will be used in order to know if an image should be reduced or not.
    * It also allows to specify a list of strings to identify in which images file paths should be applied (when they meet the size threshold requirement) 
    * The developer will still think that the image is of the original size. CocoonJS handles all of the internals to be able to show the image correctly.
    * IMPORTANT NOTE: This function should be called when the application is initialized before any image is set to be loaded for obvious reasons ;).
    * and in which sould be forbid (even if they meet the threshold requirement).
    * @function
    * @param {number} sizeThreshold This parameter specifies the minimun size (either width or height) that an image should have in order to be reduced.
    * @param {string or array} [applyTo] This parameter can either be a string or an array of strings. It's purpose is to specify one (the string) or more (the array) substring(s) 
    * that will be compared against the file path of an image to be loaded in order to know if the reduction should be applied or not. If the image meets the
    * threshold size requirement and it's file path contains this string (or strings), it will be reduced. This parameter can also be null.
    * @param {string or array} [forbidFor] This parameter can either be a string or an array of strings. It's purpose is to specify one (the string) or more (the array) substring(s) 
    * that will be compared against the file path of an image to be loaded in order to know if the reduction should be applied or not. If the image meets the
    * threshold size requirement and it's file path contains this string (or strings), it won't be reduced. This parameter should be used in order to mantain the 
    * quality of some images even they meet the size threshold requirement.
    */
    CocoonJS.App.setTextureReduction = function(sizeThreshold, applyTo, forbidFor)
    {
        if (CocoonJS.App.nativeExtensionObjectAvailable)
        {
            CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP", "setDefaultTextureReducerThreshold", arguments);
        }
    };


    /**
    * Prints to the console the memory usage of the currently alive textures
    * @function
    */
    CocoonJS.App.logMemoryInfo = function()
    {
        if (CocoonJS.App.nativeExtensionObjectAvailable)
        {
            return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP", "logMemoryInfo", arguments);
        }
    };

    /**
    * Enable CocoonJS Webview FPS overlay.
    * @function
    */
    CocoonJS.App.enableFPSInTheWebView = function(fpsLayout, textColor)
    {
        if (!CocoonJS.App.fpsInTheWebViewEnabled)
        {
            fpsLayout = fpsLayout ? fpsLayout : CocoonJS.App.FPSLayout.TOP_RIGHT;
            textColor = textColor ? textColor : "white";
            var jsCode = "" +
                "(function()" +
                "{" +
                    "var COCOONJS_WEBVIEW_EXTENSION_SCRIPT_FILES = ['js/CocoonJSExtensions/CocoonJS.js', 'js/CocoonJSExtensions/CocoonJS_App.js', 'js/CocoonJSExtensions/CocoonJS_App_ForWebView.js'];" +
                    "var loadedScriptCounter = 0;" + 
                    "var loadedScriptFunction = function() " +
                    "{ " +
                        "loadedScriptCounter++;"+
                        "if (loadedScriptCounter >= COCOONJS_WEBVIEW_EXTENSION_SCRIPT_FILES.length)"+
                        "{"+
                            "CocoonJS.App.enableFPS(" + JSON.stringify(fpsLayout) + ", " + JSON.stringify(textColor) + ");"+
                        "}"+
                    "};"+
                    "for (var i = 0; i < COCOONJS_WEBVIEW_EXTENSION_SCRIPT_FILES.length; i++)"+
                    "{"+
                        "var s = document.createElement('script');"+
                        "s.onload = loadedScriptFunction;"+
                        "s.src = COCOONJS_WEBVIEW_EXTENSION_SCRIPT_FILES[i];"+
                        "document.body.appendChild(s);"+
                    "}" +
                "})();";
            setTimeout(function()
            {
                CocoonJS.App.forward(jsCode);
            }, 3000);
            CocoonJS.App.fpsInTheWebViewEnabled = true;
        }
    };

    /**
    * Disable CocoonJS Webview FPS overlay.
    * @function
    */
    CocoonJS.App.disableFPSInTheWebView = function()
    {
        // TODO: Implement this function.
    };

    /**
     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.App.onLoadInTheWebViewSucceed} event calls.
     * @name OnLoadInTheWebViewSucceedListener
     * @function
     * @static
     * @memberOf CocoonJS.App
     * @param {string} pageURL The URL of the page that had been loaded in the webview.
     */
    /**
    * This {@link CocoonJS.EventHandler} object allows listening to events called when the WebView load has completed successfully.
    * The callback function's documentation is represented by {@link CocoonJS.App.OnLoadInTheWebViewSucceedListener}
    * @event
    * @static
    * @memberOf CocoonJS.App
    * @param {string} pageURL A string that represents the page URL loaded.
    */
    CocoonJS.App.onLoadInTheWebViewSucceed = new CocoonJS.EventHandler("IDTK_APP", "App", "forwardpageload");

    /**
     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.App.onLoadInTheWebViewFailed} event calls.
     * @name OnLoadInTheWebViewFailedListener
     * @function
     * @static
     * @memberOf CocoonJS.App
     * @param {string} pageURL The URL of the page that had been loaded in the webview.
     */
    /**
    * This {@link CocoonJS.EventHandler} object allows listening to events called when the WebView load fails.
    * The callback function's documentation is represented by {@link CocoonJS.App.OnLoadInTheWebViewFailedListener}
    * @event
    * @static
    * @memberOf CocoonJS.App
    */
    CocoonJS.App.onLoadInTheWebViewFailed = new CocoonJS.EventHandler("IDTK_APP", "App", "forwardpagefail");
    
})();

//////////////////////////////////////
// COCOONJS_AD.JS                   //
//////////////////////////////////////

(function()
{
    // The CocoonJS must exist before creating the extension.
    if (typeof window.CocoonJS === 'undefined' || window.CocoonJS === null) throw("The CocoonJS object must exist and be valid before creating any extension object.");

    /**
    * This namespace represents the CocoonJS Advertisement extension API.
    * @namespace
    */
    CocoonJS.Ad = {};

    CocoonJS.Ad.nativeExtensionObjectAvailable = CocoonJS.nativeExtensionObjectAvailable && typeof window.ext.IDTK_SRV_AD !== 'undefined';

    /**
    * The predefined possible layouts for a banner ad.
    * @namespace 
    */
	CocoonJS.Ad.BannerLayout = 
	{
		/**
		* Specifies that the banner must be shown in the top of the screen and vertically centered.
		*/
	    TOP_CENTER      : "TOP_CENTER",

		/**
		* Specifies that the banner must be shown in the bottom of the screen and vertically centered.
		*/
	    BOTTOM_CENTER   : "BOTTOM_CENTER"
	};

	/**
    * A rectangle object that contains the banner dimensions
    * @namespace 
    * @constructor
    * @param {int} x The top lef x coordinate of the rectangle.
    * @param {int} y The top lef y coordinate of the rectangle.
    * @param {width} y The rectangle width.
    * @param {height} y The rectangle height.
    */
	CocoonJS.Ad.Rectangle = function(x, y, width, height) 
	{
		/**
		* The top lef x coordinate of the rectangle 
		* @field 
		* @type {int}
		*/
	    this.x = x;

		/**
		* The top lef y coordinate of the rectangle 
		* @field 
		* @type {int}
		*/
	    this.y = y;

	    /**
		* The rectangle width
		* @field 
		* @type {int}
		*/
	    this.width = width;

	    /**
		* The rectangle height
		* @field 
		* @type {int}
		*/
	    this.height = height;
	};

	CocoonJS.Ad.Banner = function(id)
	{
		if (typeof id !== 'number') throw "The given ad ID is not a number.";

		this.id = id;
		var me = this;

		/**
    	* This {@link CocoonJS.EventHandler} object allows listening to events called when a banner is shown.
    	* The callback function does not receive any parameter.
    	* @static
    	* @event
    	*/
		this.onBannerShown = new CocoonJS.EventHandler("IDTK_SRV_AD", "Ad", "onbannershow", function(sourceListener, args)
    	{
    		if (me.id === args[0]) 
    		{
    			sourceListener();
    		}
    	});

    	/**
    	* This {@link CocoonJS.EventHandler} object allows listening to events called when a banner is hidden.
    	* The callback function does not receive any parameter.
    	* @static
    	* @event
    	*/
		this.onBannerHidden = new CocoonJS.EventHandler("IDTK_SRV_AD", "Ad", "onbannerhide", function(sourceListener, args)
    	{
    		if (me.id === args[0]) 
    		{
    			sourceListener();
    		}
    	});

    	/**
    	* This {@link CocoonJS.EventHandler} object allows listening to events called when a banner is ready (cached).
    	* The callback function does not receive any parameter.
    	* @param {number} width The banner width
    	* @param {number} height The banner height
    	* @static
    	* @event
    	*/
		this.onBannerReady = new CocoonJS.EventHandler("IDTK_SRV_AD", "Ad", "onbannerready", function(sourceListener, args)
    	{
    		if (me.id === args[0]) 
    		{
    			sourceListener(args[1], args[2]);
    		}
    	});
	};

	CocoonJS.Ad.Banner.prototype = {

		/**
		* Shows a banner ad if available.
		* @function
		*/
		showBanner : function()
		{
			if (CocoonJS.Ad.nativeExtensionObjectAvailable)
			{
				CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_AD", "showBanner", [this.id], true);
			}
		},

		/**
		* Hides the banner ad if it was being shown.
		* @function
		*/
		hideBanner : function()
		{
			if (CocoonJS.Ad.nativeExtensionObjectAvailable)
			{
				CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_AD", "hideBanner", [this.id], true);
			}
		},

		/**
		* Refreshes the banner.
		* @function
		*/
		refreshBanner : function()
		{
			if (CocoonJS.Ad.nativeExtensionObjectAvailable)
			{
				CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_AD", "refreshBanner", [this.id], true);
			}
		},

		/**
		* Gets the rectangle representing the banner screen position.
		* @function
		* @return {CocoonJS.Ad.Rectangle} rectangle The rectangle representing the banner position and domensions.
		*/
		getRectangle : function()
		{
			if (CocoonJS.Ad.nativeExtensionObjectAvailable)
			{
				return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_AD", "getRectangle", [this.id]);
			}
		},

		/**
		* Sets the rectangle where the banner ad is going to be shown.
		* @function
		* @param {CocoonJS.Ad.Rectangle} rect The rectangle representing the banner position and domensions.
		*/
		setRectangle : function(rect)
		{
			if (CocoonJS.Ad.nativeExtensionObjectAvailable)
			{
				CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_AD", "setRectangle", [this.id, rect],true);
			}
		},

		/**
		* Sets the rectangle where the banner ad is going to be shown.
		* You can use this method if you want to have better control of the banner screen positioning.
		* @function
		* @param {CocoonJS.Ad.BannerLayout} bannerLayout The layout where the bannerwill be placed.
		*/
		setBannerLayout : function(bannerLayout)
		{
			if (CocoonJS.Ad.nativeExtensionObjectAvailable)
			{
				CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_AD", "setBannerLayout", [this.id, bannerLayout],true);
			}
		}
	};

	CocoonJS.Ad.Fullscreen = function(id)
	{
		if (typeof id !== 'number') throw "The given ad ID is not a number.";

		this.id = id;
		var me = this;

		/**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when a full screen ad is shown.
	    * The callback function does not receive any parameter.
	    * @static
	    * @event
	    */
		this.onFullScreenShown = new CocoonJS.EventHandler("IDTK_SRV_AD", "Ad", "onfullscreenshow", function(sourceListener, args)
    	{
    		if (me.id === args[0]) {
    			sourceListener();
    		}
    	});

		/**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when a full screen ad is hidden.
	    * The callback function does not receive any parameter.
	    * @static
	    * @event
	    */
    	this.onFullScreenHidden = new CocoonJS.EventHandler("IDTK_SRV_AD", "Ad", "onfullscreenhide", function(sourceListener, args)
    	{
    		if (me.id === args[0]) {
    			sourceListener();
    		}
    	});

    	/**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when a full screen ad is ready (cached).
	    * The callback function does not receive any parameter.
	    * @static
	    * @event
	    */
    	this.onFullScreenReady = new CocoonJS.EventHandler("IDTK_SRV_AD", "Ad", "onfullscreenready", function(sourceListener, args)
    	{
    		if (me.id === args[0]) {
    			sourceListener();
    		}
    	});
	};

	CocoonJS.Ad.Fullscreen.prototype = {

		/**
		* Shows a full screen ad if available.
		* @function
		* @see CocoonJS.Ad.onFullScreenShown
		* @see CocoonJS.Ad.onFullScreenHidden
		*/
		showFullScreen : function()
		{
			if (CocoonJS.Ad.nativeExtensionObjectAvailable)
			{
				return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_AD", "showFullScreen", [this.id], true);
			}
		},

		/**
		* Refreshes the fullscreen.
		* @function
		*/
		refreshFullScreen : function()
		{
			if (CocoonJS.Ad.nativeExtensionObjectAvailable)
			{
				return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_AD", "refreshFullScreen", [this.id], true);
			}
		}
	};

	/**
	* Initialize the service with service level initialization parameters.
	* @function
	* @param {object} An object with the required initialization parameters for the service.
	*/
	CocoonJS.Ad.requestInitialization = function(parameters)
	{
        if (typeof parameters === "undefined") {
            parameters = {};
        }

		if (CocoonJS.Ad.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_AD", "requestInitialization", arguments, true);
		}
	};

	/**
	* Creates a new banner ad.
	* @function
	* @param {object} An object containing the properties the ad will need for its initialization.
	*/
	CocoonJS.Ad.createBanner = function(parameters)
	{
		if (typeof parameters === "undefined") {
            parameters = {};
        }

		if (CocoonJS.Ad.nativeExtensionObjectAvailable)
		{
			var adId = CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_AD", "createBanner", [parameters]);
			var banner = new CocoonJS.Ad.Banner(adId);

			return banner;
		}
	};

	/**
	* Releases a banner.
	* @function
	* @param {object} The banner ad object to be released.
	*/
	CocoonJS.Ad.releaseBanner = function(banner)
	{
		if (typeof banner === "undefined") {
            throw "The banner ad object to be released is undefined"
        }

		if (CocoonJS.Ad.nativeExtensionObjectAvailable)
		{
			CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_AD", "releaseBanner", [banner.id]);
		}
	};

	/**
	* Creates a new fullscreen ad.
	* @function
	* @param {object} An object containing the properties the ad will need for its initialization.
	*/
	CocoonJS.Ad.createFullscreen = function(parameters)
	{
		if (typeof parameters === "undefined") {
            parameters = {};
        }

		if (CocoonJS.Ad.nativeExtensionObjectAvailable)
		{
			var adId = CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_AD", "createFullscreen", [parameters]);
			var fullscreen = new CocoonJS.Ad.Fullscreen(adId);

			return fullscreen;
		}
	};

	/**
	* Releases a fullscreen ad.
	* @function
	* @param {object} The fullscreen ad object to be released.
	*/
	CocoonJS.Ad.releaseFullscreen = function(fullscreen)
	{
		if (typeof fullscreen === "undefined") {
            throw "The fullscreen ad object to be released is undefined"
        }

		if (CocoonJS.Ad.nativeExtensionObjectAvailable)
		{
			CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_AD", "releaseFullscreen", [fullscreen.id]);
		}
	};

	/**
	* Shows a banner ad if available.
	* @function
	* @see CocoonJS.Ad.setBannerLayout
	* @see CocoonJS.Ad.onBannerShown
	*/
	CocoonJS.Ad.showBanner = function()
	{
		if (CocoonJS.Ad.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_AD", "showBanner", arguments, true);
		}
	};

	/**
	* Hides the banner ad if it was being shown.
	* @function
	*/
	CocoonJS.Ad.hideBanner = function()
	{
		if (CocoonJS.Ad.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_AD", "hideBanner", arguments, true);
		}
	};

	/**
	* Refreshes the banner.
	* @function
	*/
	CocoonJS.Ad.refreshBanner = function()
	{
		if (CocoonJS.Ad.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_AD", "refreshBanner", arguments, true);
		}
	};

	/**
	* Shows a full screen ad if available.
	* @function
	* @see CocoonJS.Ad.onFullScreenShown
	* @see CocoonJS.Ad.onFullScreenHidden
	*/
	CocoonJS.Ad.showFullScreen = function()
	{
		if (CocoonJS.Ad.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_AD", "showFullScreen", arguments, true);
		}
	};

	/**
	* Refreshes the fullscreen.
	* @function
	*/
	CocoonJS.Ad.refreshFullScreen = function()
	{
		if (CocoonJS.Ad.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_AD", "refreshFullScreen", arguments, true);
		}
	};

	/**
	* Makes a request to preload a banner ad.
	* @function
	*/
	CocoonJS.Ad.preloadBanner = function()
	{
		if (CocoonJS.Ad.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_AD", "preloadBanner", arguments, true);
		}
	};

	/**
	* Makes a request to preload a full screen ad.
	* @function
	*/
	CocoonJS.Ad.preloadFullScreen = function()
	{
		if (CocoonJS.Ad.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_AD", "preloadFullScreen", arguments, true);
		}
	};

	/**
	* Sets the rectangle where the banner ad is going to be shown.
	* @function
	* @param {CocoonJS.Ad.Rectangle} rect The rectangle representing the banner position and domensions.
	*/
	CocoonJS.Ad.setRectangle = function()
	{
		if (CocoonJS.Ad.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_AD", "setRectangle", arguments, true);
		}
	};

	/**
	* Gets the rectangle representing the banner screen position.
	* @function
	* @return {CocoonJS.Ad.Rectangle} rectangle The rectangle representing the banner position and domensions.
	*/
	CocoonJS.Ad.getRectangle = function()
	{
		if (CocoonJS.Ad.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_AD", "getRectangle", arguments);
		}
	};

	/**
	* Sets the rectangle where the banner ad is going to be shown.
	* You can use this method if you want to have better control of the banner screen positioning.
	* @function
	* @param {CocoonJS.Ad.BannerLayout} bannerLayout The layout where the bannerwill be placed.
	*/
	CocoonJS.Ad.setBannerLayout = function(bannerLayout)
	{
		if (CocoonJS.Ad.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_AD", "setBannerLayout", arguments, true);
		}
	};

    /**
    * This {@link CocoonJS.EventHandler} object allows listening to events called when a banner is shown.
    * The callback function does not receive any parameter.
    * @static
    * @event
    */
	CocoonJS.Ad.onBannerShown = new CocoonJS.EventHandler("IDTK_SRV_AD", "Ad", "onbannershow");

	/**
    * This {@link CocoonJS.EventHandler} object allows listening to events called when a banner is hidden.
    * The callback function does not receive any parameter.
    * @static
    * @event
    */
	CocoonJS.Ad.onBannerHidden = new CocoonJS.EventHandler("IDTK_SRV_AD", "Ad", "onbannerhide"); 

	/**
	* This {@link CocoonJS.EventHandler} object allows listening to events called when a banner is ready (cached).
	* The callback function does not receive any parameter.
	* @param {number} width The banner width
	* @param {number} height The banner height
	* @static
	* @event
	*/
	CocoonJS.Ad.onBannerReady = new CocoonJS.EventHandler("IDTK_SRV_AD", "Ad", "onbannerready"); 

    /**
    * This {@link CocoonJS.EventHandler} object allows listening to events called when a full screen ad is shown.
    * The callback function does not receive any parameter.
    * @static
    * @event
    */
	CocoonJS.Ad.onFullScreenShown = new CocoonJS.EventHandler("IDTK_SRV_AD", "Ad", "onfullscreenshow"); 

    /**
    * This {@link CocoonJS.EventHandler} object allows listening to events called when a full screen ad is hidden.
    * The callback function does not receive any parameter.
    * @static
    * @event
    */
	CocoonJS.Ad.onFullScreenHidden = new CocoonJS.EventHandler("IDTK_SRV_AD", "Ad", "onfullscreenhide");

	/**
    * This {@link CocoonJS.EventHandler} object allows listening to events called when a full screen ad is ready (cached).
    * The callback function does not receive any parameter.
    * @static
    * @event
    */
	CocoonJS.Ad.onFullScreenReady = new CocoonJS.EventHandler("IDTK_SRV_AD", "Ad", "onfullscreenready"); 

})();

//////////////////////////////////////
// COCOONJS_STORE.JS                //
//////////////////////////////////////

(function()
{
    // The CocoonJS must exist before creating the extension.
    if (typeof window.CocoonJS === 'undefined' || window.CocoonJS === null) throw("The CocoonJS object must exist and be valid before creating any extension object.");

    /**
    * This namespace represents the CocoonJS In-App Purchase extension.
    * @namespace
    */
    CocoonJS.Store = {};

    CocoonJS.Store.nativeExtensionObjectAvailable = CocoonJS.nativeExtensionObjectAvailable && typeof window.ext.IDTK_SRV_STORE !== 'undefined';

	/**
	* The data structure that represents the information of a product in the store.
	* @namespace
	* @constructor
	* @param {string} The id of the product.
	* @param {string} The alias of the product.
	* @param {CocoonJS.Store.ProductType} The product type @see CocoonJS.Store.ProductType.
	* @param {string} The title of the product.
	* @param {string} The description of the product.
	* @param {string} The localized price of the product.
	* @param {string} The URL of the asset to be downloaded for this purchase.
	*/
	CocoonJS.Store.ProductInfo = function(productAlias, productId, productType, title, description, price, localizedPrice, downloadURL)
	{
		/**
		* The id of the product.
		* @field
		* @type string
		*/
		this.productId = productId;

		/**
		* The alias of the product.
		* @field
		* @type string
		*/
		this.productAlias = productAlias;

		/**
		* The product type @see CocoonJS.Store.ProductType
		* @field
		* @type CocoonJS.Store.ProductType
		*/
		this.productType = productType;

		/**
		* The title of the product.
		* @field
		* @type string
		*/
		this.title = title;

		/**
		* The description of the product.
		* @field
		* @type string
		*/
		this.description = description;

		/**
		* The price of the product.
		* @field
		* @type string
		*/
		this.price = price;

		/**
		* The localized price of the product.
		* @field
		* @type string
		*/
		this.localizedPrice = localizedPrice;

		/**
		* The URL of the asset to be downloaded for this purchase.
		* @field
		* @type string
		*/
		this.downloadURL = downloadURL;

		return this;
	};

	/**
    * The predefined possible states of a purchase.
    * @namespace 
    */
	CocoonJS.Store.ProductType = 
	{
		/**
		* A consumable product. See platform documentation for further information.
		*/
	    CONSUMABLE : 0,

		/**
		* A non-cunsumable product. . See platform documentation for further information.
		*/
	    NON_CONSUMABLE : 1,

	    /**
		* An auto-renewable subscription. See platform documentation for further information.
		*/
	    AUTO_RENEWABLE_SUBSCRIPTION : 2,

	    /**
		* A free subscription. See platform documentation for further information.
		*/
	    FREE_SUBSCRIPTION : 3,

	    /**
		* A non-renewable subscription. See platform documentation for further information.
		*/
	    NON_RENEWABLE_SUBSCRIPTION : 4
	};

	/**
    * The predefined possible store types.
    * @namespace 
    */
	CocoonJS.Store.StoreType = 
	{
		/**
		* Apple AppStore
		*/
	    APP_STORE : 0,

	    /**
	    * Android Play Store
	    */
	    PLAY_STORE : 1,

		/**
		* Mock Store
		*/
		MOCK_STORE : 2,

		/**
	    * Amazon AppStore
	    */
	    CHROME_STORE : 3,

	    /**
	    * Amazon AppStore
	    */
	    AMAZON_STORE : 4,

	    /**
	    * Nook Store
	    */
	    NOOK_STORE : 5
	};

	/**
	* The data structure that represents the information of a purchase.
	* @namespace
	* @constructor
	* @param {string} The transaction id of a purchase.
	* @param {string} The time when the purchase was done in seconds since 1970.
	* @param {CocoonJS.Store.PurchaseState} The state of the purchase. @see CocoonJS.Store.PurchaseState
	* @param {string} The product id related to this purchase.
	* @param {number} The number of products of the productId kind purchased in this transaction.
	*/
	CocoonJS.Store.PurchaseInfo = function(transactionId, purchaseTime, purchaseState, productId, quantity)
	{
		/**
		* The transaction id of a purchase.
		* @field
		* @type string
		*/
		this.transactionId = transactionId;

		/**
		* The time when the purchase was done in seconds since 1970.
		* @field
		* @type string
		*/
		this.purchaseTime = purchaseTime;

		/**
		* The state of the purchase. @see CocoonJS.Store.PurchaseState
		* @field
		* @type CocoonJS.Store.PurchaseState
		*/
		this.purchaseState = purchaseState;

		/**
		* The product id related to this purchase.
		* @field
		* @type string
		*/
		this.productId = productId;

		/**
		* The number of products of the productId kind purchased in this transaction.
		* @field
		* @type number
		*/
		this.quantity = quantity;

		return this;
	};

	/**
    * The predefined possible states of a purchase.
    * @namespace 
    */
	CocoonJS.Store.PurchaseState = 
	{
		/**
		* The product has been successfully purchased. The transaction has ended successfully.
		*/
	    PURCHASED : 0,

		/**
		* The purchase has been canceled.
		*/
	    CANCELED : 1,

	    /**
		* The purchase has been refunded.
		*/
	    REFUNDED : 2,

	    /**
		* The purchase (subscriptions only) has expired and is no longer valid.
		*/
	    EXPIRED : 3
	};

	/**
	* Gets the name of the native store implementation. 
	* @return {CocoonJS.Store.StoreType} The store type
	* @function
	*/ 
	CocoonJS.Store.getStoreType = function()
	{
		if (CocoonJS.Store.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_STORE", "getStoreType", arguments);
		}
	};

	/**
	* Initialize the service with service level initialization parameters.
	* @function
	* @param {object} An object with the required initialization parameters for the service.
	*/
	CocoonJS.Store.requestInitialization = function(parameters)
	{
        if (typeof parameters === "undefined") 
        {
            parameters = {};
        }
        else
        {
        	if (parameters['managed'] !== undefined) parameters['remote'] = parameters['managed'];
        	if (parameters['sandbox'] !== undefined) parameters['debug'] = parameters['sandbox'];
        }

		if (CocoonJS.Store.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_STORE", "requestInitialization", arguments, true);
		}
	};

	/**
	* Starts the Store Service. 
	* This will make the system to initialize the Store Service and probably Store callbacks will start to be received after calling this method so you should have set your event handler before calling this method so don't lose any callback.
	* @function
	*/ 
	CocoonJS.Store.start = function()
	{
		if (CocoonJS.Store.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_STORE", "start", arguments);
		}
	};

	/**
	* This method allows you to check is the  Store service is available in this platform. 
	* Not all iOS and Android devices will have the Store service available so you should check if it is before calling any other method.
	* @function
	* @return {boolean} True if the service is available and false otherwise.
	*/ 
	CocoonJS.Store.canPurchase = function()
	{
		if (CocoonJS.Store.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_STORE", "canPurchase", arguments);
		}
	};

	/**
	* Fetches the products from the CocoonJS Cloud Compiling service store configuration. 
	* The request is monitored using the {@link CocoonJS.Store.onProductsFetchStarted}, {@link CocoonJS.Store.onProductsFetchCompleted} and {@link CocoonJS.Store.onProductsFetchFailed} event handlers.
	* @deprecated You should now use fetchProductsFromStore. We don't support cloud products now.
	* @function
	* @see CocoonJS.Store.onProductsFetchStarted
	* @see CocoonJS.Store.onProductsFetchCompleted
	* @see CocoonJS.Store.onProductsFetchFailed
	*/ 
	CocoonJS.Store.fetchProductsFromServer = function()
	{
		if (CocoonJS.Store.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_STORE", "fetchProductsFromServer", arguments, true);
		}
	};

	/**
	* Fetches the products information from the Store. 
	* The request is monitored using the {@link CocoonJS.Store.onProductsFetchStarted}, {@link CocoonJS.Store.onProductsFetchCompleted} and {@link CocoonJS.Store.onProductsFetchFailed} event handlers.
	* @function
	* @param {array} productIds An array with the ids of the products to retrieve information from.
	* @see CocoonJS.Store.onProductsFetchStarted
	* @see CocoonJS.Store.onProductsFetchCompleted
	* @see CocoonJS.Store.onProductsFetchFailed
	*/ 
	CocoonJS.Store.fetchProductsFromStore = function(productIds)
	{
		if (CocoonJS.Store.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_STORE", "fetchProductsFromStore", arguments, true);
		}
	};

	/**
	* Finish a purchase transaction and removes the transaction from the transaction queue. 
	* This method must be called after a purchase finishes successfully and the  {@link CocoonJS.Store.onProductPurchaseCompleted} callback has been received. 
	* If the purchase includes some asset to download from an external server this method must be called after the asset has been successfully downloaded. 
	* If you do not finish the transaction because the asset has not been correctly downloaded the {@link CocoonJS.Store.onProductPurchaseStarted} method will be called again later on.
	* @function
	* @param {string} transactionId The transactionId of the purchase to finish.
	*/ 
	CocoonJS.Store.finishPurchase = function(transactionId)
	{
		if (CocoonJS.Store.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_STORE", "finishPurchase", arguments, true);
		}
	};

	/**
	* Consumes a purchase. This makes that product to be purchasable again. 
	* @function
	* @param {string} transactionId The transaction Id of the purchase to consume.
	* @param {string} productId The product Id of the product to be consumed.
	*/ 
	CocoonJS.Store.consumePurchase = function(transactionId, productId)
	{
		if (CocoonJS.Store.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_STORE", "consumePurchase", arguments, true);
		}
	};

	/**
	* Request a product purchase given it's product id. 
	* The request is monitored using the {@link CocoonJS.Store.onPurchaseProductStarted}, {@link CocoonJS.Store.onProductPurchaseStarted} and {@link CocoonJS.Store.onProductPurchaseFailed} event handlers.
	* @function
	* @param {string} productId The id or alias of the product to be purchased.
	* @see CocoonJS.Store.onProductPurchaseStarted
	* @see CocoonJS.Store.onProductPurchaseCompleted
	* @see CocoonJS.Store.onProductPurchaseFailed
	*/ 
	CocoonJS.Store.purchaseProduct = function(productId)
	{
		if (CocoonJS.Store.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_STORE", "purchaseFeature", arguments, true);
		}
	};

	/**
	* Request a product purchase given it's product id showing a modal progress dialog. 
	* The request is monitored using the {@link CocoonJS.Store.onProductPurchaseStarted}, {@link CocoonJS.Store.onProductPurchaseCompleted} and {@link CocoonJS.Store.onProductPurchaseFailed} event handlers.
	* @function
	* @param {string} productId The id or alias of the product to be purchased.
	* @see CocoonJS.Store.onProductPurchaseStarted
	* @see CocoonJS.Store.onProductPurchaseCompleted
	* @see CocoonJS.Store.onProductPurchaseFailed
	*/ 
	CocoonJS.Store.puchaseProductModal = function(productId)
	{
		if (CocoonJS.Store.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_STORE", "purchaseFeatureModal", arguments, true);
		}
	};

	/**
	* Request the purchase of a product given it's product id showing a dialog with a preview of the product (title and description). 
	* The request is monitored using the {@link CocoonJS.Store.onProductPurchaseStarted}, {@link CocoonJS.Store.onProductPurchaseCompleted} and {@link CocoonJS.Store.onProductPurchaseFailed} event handlers.
	* @function
	* @param {string} productId The id or alias of the product to be purchased.
	* @see CocoonJS.Store.onProductPurchaseStarted
	* @see CocoonJS.Store.onProductPurchaseCompleted
	* @see CocoonJS.Store.onProductPurchaseFailed
	*/ 
	CocoonJS.Store.purchaseProductModalWithPreview = function(productId)
	{
		if (CocoonJS.Store.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_STORE", "purchaseFeatureModalWithPreview", arguments, true);
		}
	};

	/**
	* Returns if a product has been already purchased or not. 
	* @function
	* @param {string} productId The product id or alias of the product to be checked.
	* @returns {boolean} A flag that indicates whether the product has been already purchased (true) or not (false).
	*/
	CocoonJS.Store.isProductPurchased = function(productId)
	{
		if (CocoonJS.Store.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_STORE", "isFeaturePurchased", arguments);
		}
	};

	/**
	* Restores all the purchases from the platform's market. 
	* For each already purchased product {@link CocoonJS.Store.onPurchaseProductStarted}, {@link CocoonJS.Store.onPurchaseProductCompleted} and {@link CocoonJS.Store.onPurchaseProductFailed} event handlers are called again
	* @function
	* @see CocoonJS.Store.onRestorePurchasesStarted
	* @see CocoonJS.Store.onRestorePurchasesCompleted
	* @see CocoonJS.Store.onRestorePurchasesFailed
	*/
	CocoonJS.Store.restorePurchases = function()
	{
		if (CocoonJS.Store.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_STORE", "restorePurchases", arguments, true);
		}
	};

	/**
	* Restores all the purchases from the platform's market showing a modal progress dialog. 
	* For each already purchased product {@link CocoonJS.Store.onPurchaseProductStarted}, {@link CocoonJS.Store.onPurchaseProductCompleted} and {@link CocoonJS.Store.onPurchaseProductFailed} event handlers are called again
	* @function
	* @see CocoonJS.Store.onRestorePurchasesStarted
	* @see CocoonJS.Store.onRestorePurchasesCompleted
	* @see CocoonJS.Store.onRestorePurchasesFailed
	*/
	CocoonJS.Store.restorePurchasesModal = function()
	{
		if (CocoonJS.Store.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_STORE", "restorePurchasesModal", arguments, true);
		}
	};

	/**
	* Returns all the products available to be purchased.
	* @function
	* @returns {array} An array with  all the {@link CocoonJS.Store.ProductInfo} objects available for purchase.
	*/
	CocoonJS.Store.getProducts = function()
	{
		if (CocoonJS.Store.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_STORE", "getProducts", arguments);
		}
	};

	/**
	* Adds a product to the products local DB. 
	* @function
	* @param {CocoonJS.Store.ProductInfo} product The product to be added to the local products DB.
	*/
	CocoonJS.Store.addProduct = function(product)
	{
		if (CocoonJS.Store.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_STORE", "addProduct", arguments);
		}
	};

	/**
	* Removes a product from the products local DB given its productId. 
	* @function
	* @param {string} productId The product or alias of the product to be removed from the local products DB.
	*/
	CocoonJS.Store.removeProduct = function(productId)
	{
		if (CocoonJS.Store.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_STORE", "removeProduct", arguments);
		}
	};

	/**
	* Returns all the locally stored purchases.
	* @function
	* @returns {array} An array with all the {@link CocoonJS.Store.PurchaseInfo} completed purchases.
	*/
	CocoonJS.Store.getPurchases = function()
	{
		if (CocoonJS.Store.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_STORE", "getPurchases", arguments);
		}
	};

	/**
	* Adds a purchase to the local purchases DB. 
	* @function
	* @param {CocoonJS.Store.StorePurchase} purchase The purchase to be added.
	*/ 
	CocoonJS.Store.addPurchase = function(purchase)
	{
		if (CocoonJS.Store.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_STORE", "addPurchase", arguments);
		}
	};

	/**
	* Removes a purchase from the local purchases DB given it's transaction id. 
	* @function
	* @param {string} transactionId The id of the transaction to be removed.
	*/ 
	CocoonJS.Store.removePurchase = function(transactionId)
	{
		if (CocoonJS.Store.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_STORE", "removePurchase", arguments);
		}
	};

	/**
	* (TESTING ONLY) Simulate a purchase cancel. 
	* This method is not allowed in production services and will only work in Mocks. 
	* The request is monitored using the {@link CocoonJS.Store.onPurchaseProductStarted}, {@link CocoonJS.Store.onProductPurchaseStarted} and {@link CocoonJS.Store.onProductPurchaseFailed} event handlers.
	* @function
	* @param {string} transactionId The transactionId of the purchase to be canceled.
	*/
	CocoonJS.Store.cancelPurchase = function(transactionId)
	{
		if (CocoonJS.Store.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_STORE", "cancelPurchase", arguments);
		}
	};

	/**
	* (TESTING ONLY) Simulate a purchase refundment. 
	* This method is not allowed in production services and will only work in Mocks. 
	* The request is monitored using the {@link CocoonJS.Store.onPurchaseProductStarted}, {@link CocoonJS.Store.onProductPurchaseStarted} and {@link CocoonJS.Store.onProductPurchaseFailed} event handlers.
	* @function
	* @param {string} transactionId The transactionId of the purchase to be refunded.
	*/
	CocoonJS.Store.refundPurchase = function(transactionId)
	{
		if (CocoonJS.Store.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_STORE", "refundPurchase", arguments);
		}
	};

	/**
	* (TESTING ONLY) Simulate a purchase expiration. 
	* This method is not allowed in production services and will only work in Mocks. 
	* The request is monitored using the {@link CocoonJS.Store.onPurchaseProductStarted}, {@link CocoonJS.Store.onProductPurchaseStarted} and {@link CocoonJS.Store.onProductPurchaseFailed} event handlers.
	* @function
	* @param {string} transactionId The transactionId of the purchase to be expired.
	*/
	CocoonJS.Store.expirePurchase = function(transactionId)
	{
		if (CocoonJS.Store.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_STORE", "expirePurchase", arguments);
		}
	};

	/**
    * This {@link CocoonJS.EventHandler} object allows listening to events called when the products fetch has started.
    * The callback function receives no parameters.
    * @static
    * @event
    */
	CocoonJS.Store.onProductsFetchStarted = new CocoonJS.EventHandler("IDTK_SRV_STORE", "Store", "onProductsFetchStarted");

    /**
    * This {@link CocoonJS.EventHandler} object allows listening to events called when the products fetch has completed.
    * The callback function receives a parameter with an the valid products array.
    * @static
    * @event
    * @param {array} validProducts An array of {@link CocoonJS.Store.ProductInfo} objects representing all the valid fetched products.
    */
	CocoonJS.Store.onProductsFetchCompleted = new CocoonJS.EventHandler("IDTK_SRV_STORE", "Store", "onProductsFetchCompleted"); 

    /**
    * This {@link CocoonJS.EventHandler} object allows listening to events called when the products fetch has failed.
    * The callback function receives an error message as a parameter.
    * @static
    * @event
    * @param {string} errorMessage The error message.
    */
	CocoonJS.Store.onProductsFetchFailed = new CocoonJS.EventHandler("IDTK_SRV_STORE", "Store", "onProductsFetchFailed"); 

    /**
    * This {@link CocoonJS.EventHandler} object allows listening to events called when the purchase of a product starts.
    * The callback function receives a parameters with the information of the purchased product @see CocoonJS.Store.ProductInfo.
    * @static
	* @event
    * @param {string} productId The product id of the product being purchased.
    */
	CocoonJS.Store.onProductPurchaseStarted = new CocoonJS.EventHandler("IDTK_SRV_STORE", "Store", "onProductPurchaseStarted"); 

	/**
    * This {@link CocoonJS.EventHandler} object allows listening to events called when a request for purchase verification has been received from the Store.
    * The callback function receives two parameters, one with the productId of the purchased product and another one with a JSON object containing the data to be verified.
    * In Andorid this JSON object will containt two keys: signedData and signature. You will need that information to verify the purchase against the backend server.
    * @static
    * @event
    * @param {string} productId The product id of the product to be verified.
    * @param {string} data The string with the data to be verified.
    */
	CocoonJS.Store.onProductPurchaseVerificationRequestReceived = new CocoonJS.EventHandler("IDTK_SRV_STORE", "Store", "onProductPurchaseVerificationRequestReceived");

    /**
    * This {@link CocoonJS.EventHandler} object allows listening to events called when the purchase of a product succeeds.
    * The callback function receives as parameter the information of the purchase {@see CocoonJS.Store.PurchaseInfo}.
    * @static
    * @event
    * @param {CocoonJS.Store.PurchaseInfo} purchaseInfo The purchase info.
    */
	CocoonJS.Store.onProductPurchaseCompleted = new CocoonJS.EventHandler("IDTK_SRV_STORE", "Store", "onProductPurchaseCompleted"); 

    /**
    * This {@link CocoonJS.EventHandler} object allows listening to events called when the purchase of a product fails.
    * The callback function receives a parameters with the product id and an error message.
    * @static
    * @event
    * @param {string} productId The product id.
    * @param {string} msg The error message.
    */
	CocoonJS.Store.onProductPurchaseFailed = new CocoonJS.EventHandler("IDTK_SRV_STORE", "Store", "onProductPurchaseFailed"); 

    /**
    * This {@link CocoonJS.EventHandler} object allows listening to events called when the restore purchases operation has started.
    * The callback function receives no parameters.
    * @static
    * @event
    */
	CocoonJS.Store.onRestorePurchasesStarted = new CocoonJS.EventHandler("IDTK_SRV_STORE", "Store", "onRestorePurchasesStarted"); 

    /**
    * This {@link CocoonJS.EventHandler} object allows listening to events called when the restore purchases operation has completed.
    * The callback function receives no parameters.
    * @static
    * @event
    */
	CocoonJS.Store.onRestorePurchasesCompleted = new CocoonJS.EventHandler("IDTK_SRV_STORE", "Store", "onRestorePurchasesCompleted"); 

	/**
    * This {@link CocoonJS.EventHandler} object allows listening to events called when the restore purchases operation has failed.
    * The callback function receives an error message as a parameter.
    * @static
    * @event
    * @param {string} errorMessage The error message.
    */
	CocoonJS.Store.onRestorePurchasesFailed = new CocoonJS.EventHandler("IDTK_SRV_STORE", "Store", "onRestorePurchasesFailed");

	/**
    * This {@link CocoonJS.EventHandler} object allows listening to events called when the consume purchase operation has started.
    * @static
    * @event
    * @param {string} transactionId The transaction id of the purchase being consumed.
    */
	CocoonJS.Store.onConsumePurchaseStarted = new CocoonJS.EventHandler("IDTK_SRV_STORE", "Store", "onConsumePurchaseStarted"); 

    /**
    * This {@link CocoonJS.EventHandler} object allows listening to events called when the consume purchase operation has completed.
    * @static
    * @event
    * @param {string} transactionId The transaction id of the consumed purchase.
    */
	CocoonJS.Store.onConsumePurchaseCompleted = new CocoonJS.EventHandler("IDTK_SRV_STORE", "Store", "onConsumePurchaseCompleted"); 

	/**
    * This {@link CocoonJS.EventHandler} object allows listening to events called when the consume purchase operation has failed.
    * @static
    * @event
    * @param {string} transactionId The transaction id of the purchase that couldn't be consumed.
    * @param {string} errorMessage The error message.
    */
	CocoonJS.Store.onConsumePurchaseFailed = new CocoonJS.EventHandler("IDTK_SRV_STORE", "Store", "onConsumePurchaseFailed");

})();

//////////////////////////////////////
// COCOONJS_SOCIAL.JS               //
//////////////////////////////////////

(function()
{
    // The CocoonJS must exist before creating the extension.
    if (typeof window.CocoonJS === 'undefined' || window.CocoonJS === null) throw("The CocoonJS object must exist and be valid before creating any extension object.");

	/**
	* This type represents the access to a native Social extension API. As there can be more than
	* one service of this type, more than one instance can be created.
	* @namespace
	* @constructor
	* @param {string} nativeExtensionName The name of the native ext object extension property name.
	* @param {string} extensionName The name of the CocoonJS object extension property name.
	*/
	CocoonJS.Social = function(nativeExtensionName, extensionName)
	{
		if (typeof nativeExtensionName !== 'string') throw "The given native extension name '" + nativeExtensionName + "' is not a string.";
		if (typeof extensionName !== 'string') throw "The given extension name '" + extensionName + "' is not a string.";

		this.nativeExtensionName = nativeExtensionName;
		this.extensionName = extensionName;
	    this.nativeExtensionObjectAvailable = CocoonJS.nativeExtensionObjectAvailable && typeof window.ext[nativeExtensionName] !== 'undefined';

	    /**
	     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.Social.onRequestInitializationSucceed} event calls.
	     * @name OnRequestInitializationSucceedListener
	     * @function
	     * @static
	     * @memberOf CocoonJS.Social
	     * @param {object} initializationData The data structure passed when requestInitialization was called.
	     */
	    /**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when the user information request suceeds.
	    * The callback function's documentation is represented by {@link CocoonJS.Social.OnRequestInitializationSucceedListener}
	    * @static
	    * @event
	    * @memberOf CocoonJS.Social
	    */
	    this.onRequestInitializationSucceed = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onRequestInitializationSucceed");

	    /**
	     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.Social.onRequestInitializationFailed} event calls.
	     * @name OnRequestInitializationFailedListener
	     * @function
	     * @static
	     * @memberOf CocoonJS.Social
	     * @param {object} initializationData The data structure passed when the requestInitialization function was called.
	     * @param {string} errorMessage The message that describes why the request did fail.
	     */
	    /**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when the user information request fails.
	    * The callback function's documentation is represented by {@link CocoonJS.Social.OnRequestInitializationFailedListener}
	    * @static
	    * @event
	    * @memberOf CocoonJS.Social
	    */
	    this.onRequestInitializationFailed = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onRequestInitializationFailed");

	    /**
	     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.Social.onRequestLoginSucceed} event calls.
	     * @name OnRequestLoginSucceedListener
	     * @function
	     * @static
	     * @memberOf CocoonJS.Social
	     * @param {CocoonJS.Social.UserInfo} userInfo The structure that describes the information of the user that logged in.
	     */
	    /**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when the user login request succeeds.
	    * The callback function's documentation is represented by {@link CocoonJS.Social.OnRequestLoginSucceedListener}
	    * @static
	    * @event
	    * @memberOf CocoonJS.Social
	    */
		this.onRequestLoginSucceed = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onRequestLoginSucceed");

	    /**
	     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.Social.onRequestLoginFailed} event calls.
	     * @name OnRequestLoginFailedListener
	     * @function
	     * @static
	     * @memberOf CocoonJS.Social
	     * @param {string} errorMessage The message that describes why the request did fail.
	     */
	    /**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when the user login request fails.
	    * The callback function's documentation is represented by {@link CocoonJS.Social.OnRequestLoginFailedListener}
	    * @static
	    * @event
	    * @memberOf CocoonJS.Social
	    */
		this.onRequestLoginFailed = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onRequestLoginFailed");

	    /**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when the user logs out.
	    * The callback function does not receive any parameter.
	    * @static
	    * @event
	    * @memberOf CocoonJS.Social
	    */
		this.onLogout = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onLogout");

	    /**
	     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.Social.onRequestUserInfoSucceed} event calls.
	     * @name OnRequestUserInfoSucceedListener
	     * @function
	     * @static
	     * @memberOf CocoonJS.Social
	     * @param {CocoonJS.Social.UserInfo} userInfo The structure that describes the information of the request user id.
	     */
	    /**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when the user information request suceeds.
	    * The callback function's documentation is represented by {@link CocoonJS.Social.OnUserInfoRequestSucceedListener}
	    * @static
	    * @event
	    * @memberOf CocoonJS.Social
	    */
		this.onRequestUserInfoSucceed = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onRequestUserInfoSucceed");

	    /**
	     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.Social.onRequestUserInfoFailed} event calls.
	     * @name OnRequestUserInfoFailedListener
	     * @function
	     * @static
	     * @memberOf CocoonJS.Social
	     * @param {string} userID The id used in the request.
	     * @param {string} errorMessage The message that describes why the request did fail.
	     */
	    /**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when the user information request fails.
	    * The callback function's documentation is represented by {@link CocoonJS.Social.OnUserInfoRequestFailedListener}
	    * @static
	    * @event
	    * @memberOf CocoonJS.Social
	    */
		this.onRequestUserInfoFailed = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onRequestUserInfoFailed");

	    /**
	     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.Social.onRequestUserImageURLSucceed} event calls.
	     * @name OnRequestUserImageURLSucceedListener
	     * @function
	     * @static
	     * @memberOf CocoonJS.Social
	     * @param {string} userID The id used in the request.
	     * @param {string} imageURL The URL of the image of the requested user. 
	     */
	    /**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when the user image URL request succeeds.
	    * The callback function's documentation is represented by {@link CocoonJS.Social.OnRequestUserImageURLSucceedListener}
	    * @static
	    * @event
	    * @memberOf CocoonJS.Social
	    */
		this.onRequestUserImageURLSucceed = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onRequestUserImageURLSucceed");

	    /**
	     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.Social.onRequestUserImageURLFailed} event calls.
	     * @name OnRequestUserImageURLFailedListener
	     * @function
	     * @static
	     * @memberOf CocoonJS.Social
	     * @param {string} userID The id of the user the request was placed for.
	     * @param {string} errorMessage The message that describes why the request did fail.
	     */
	    /**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when the user image URL request fails.
	    * The callback function's documentation is represented by {@link CocoonJS.Social.OnRequestUserImageURLFailedListener}
	    * @static
	    * @event
	    * @memberOf CocoonJS.Social
	    */
		this.onRequestUserImageURLFailed = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onRequestUserImageURLFailed");

	    /**
	     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.Social.onRequestUserFriendsUserInfosSucceed} event calls.
	     * @name OnRequestUserFriendsUserInfosSucceedListener
	     * @function
	     * @static
	     * @memberOf CocoonJS.Social
	     * @param {string} userID The id of the user for whom the friend user infos where requested.
	     * @param {array} friendsInfo An array of {@link CocoonJS.Social.UserInfo} objects representing the information of the friends of the user.
	     */
	    /**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when the user's friends info is successfully retrieved.
	    * The callback function's documentation is represented by {@link CocoonJS.Social.OnRequestUserFriendsUserInfosSucceedListener}
	    * @static
	    * @event
	    * @memberOf CocoonJS.Social
	    */
		this.onRequestUserFriendsUserInfosSucceed = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onRequestUserFriendsUserInfosSucceed");

	    /**
	     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.Social.onRequestUserFriendsUserInfosFailed} event calls.
	     * @name OnRequestUserFriendsUserInfosFailedListener
	     * @function
	     * @static
	     * @memberOf CocoonJS.Social
	     * @param 
	     * @param {string} userID The id of the user fro whom the friends infos were requested.
	     * @param {string} errorMessage The error message.
	     */
	    /**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when the user's friends info fails to be retrieved.
	    * The callback function's documentation is represented by {@link CocoonJS.Social.OnRequestUserFriendsUserInfosFailedListener}
	    * @static
	    * @event
	    * @memberOf CocoonJS.Social
	    */
		this.onRequestUserFriendsUserInfosFailed = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onRequestUserFriendsUserInfosFailed");

	    /**
	     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.Social.onRequestMessagePublicationSucceed} event calls.
	     * @name OnRequestMessagePublicationSucceedListener
	     * @function
	     * @static
	     * @memberOf CocoonJS.Social
 	     * @param {CocoonJS.Social.Message} message The message that has been published.
	     */
	    /**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when the user message publication request succeeds.
	    * The callback function's documentation is represented by {@link CocoonJS.Social.OnRequestMessagePublicationSucceedListener}
	    * @static
	    * @event
	    * @memberOf CocoonJS.Social
	    * @param {CocoonJS.Social.Message} message The message that has been published.
	    */
		this.onRequestMessagePublicationSucceed = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onRequestMessagePublicationSucceed");

	    /**
	     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.Social.onRequestMessagePublicationFailed} event calls.
	     * @name OnRequestMessagePublicationFailedListener
	     * @function
	     * @static
	     * @memberOf CocoonJS.Social
	     * @param {CocoonJS.Social.Message} message The message that was supposed to be published.
	     * @param {string} errorMessage The error message.
	     */
	    /**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when the user message publication request fails.
	    * The callback function's documentation is represented by {@link CocoonJS.Social.OnRequestMessagePublicationFailedListener}
	    * @static
	    * @event
	    * @memberOf CocoonJS.Social
	    */
		this.onRequestMessagePublicationFailed = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onRequestMessagePublicationFailed");

		/**
        * @ignore
        */
        this.on= function(event, callback) {
            event= "on"+event[0].toUpperCase()+event.substr(1);
            var signal= this[event];
            if (signal) {
                signal.addEventListener(callback);
            } else {
                console.error("SocialGaming service: '"+this.extensionName+"' does not understand '"+event+' signal.');
            }

            return this;
        };

	    return this;
	};

	CocoonJS.Social.prototype = {
        userInfo : null,
        userInfoCocoonJS : null,

        /**
        * @ignore
        */
        getUserInfo : function() {
            return this.userInfo;
        },

        /**
        * Returns the information of the currently logged in user.
        * @return {@link CocoonJS.Social.UserInfo}
        */
        getLoggedInUserInfo : function() {
            if (this.nativeExtensionObjectAvailable) {
                return CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "getLoggedInUserInfo", arguments);
            }
            else {
                return this.userInfoCocoonJS;
            }
        },

        /**
        * @ignore
        */
        setUserInfo : function( userInfo) {
            this.userInfo= userInfo;
        },

        /**
        * @ignore
        */
        setUserInfoCocoonJS : function( userInfoCocoonJS ) {
            this.userInfoCocoonJS = userInfoCocoonJS;
        },

		/**
        * Request initialization of the underlying social service.
        * @param {object} paramsObject A data structure to initialize the service. It will be dependable of the underlying service.
        * @see CocoonJS.Social.onRequestInitializationSucceed
        * @see CocoonJS.Social.onRequestInitializationFailed
        */
		requestInitialization : function(paramsObject) 
		{
			if (this.nativeExtensionObjectAvailable)
			{
				return CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "requestInitialization", arguments, true);
			}
		},

		/**
        * Returns a flag to indicate if the underlying service has been initialized or not.
        * @return {boolean} If the underlying service had been initialized using the requestInitialization function call.
        */
		isInitialized : function()
		{
			if (this.nativeExtensionObjectAvailable)
			{
				return CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "isInitialized", arguments);
			}
			else
			{
				return false;
			}
		},

		/**
		* Request to log in the social gaming application.
		* @see CocoonJS.Social.onRequestLoginSucceed
		* @see CocoonJS.Socual.onRequestLoginFailed
		*/
		requestLogin : function()
		{
			if (this.nativeExtensionObjectAvailable)
			{
				return CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "requestLogin", arguments, true);
			}
		},

		/**
		* Request to log out of the social gaming application.
		* @see CocoonJS.Social.onRequestLoginSucceed
		* @see CocoonJS.Social.onRequestLoginFailed
		* @see CocoonJS.Social.onLogout
		*/
		requestLogout : function()
		{
			if (this.nativeExtensionObjectAvailable)
			{
				return CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "requestLogout", arguments, true);
			}
		},

		/**
		* Check if the user is logged in.
		* @return {boolean} true if the user is still logged in, false otherwise.
		*/
		isLoggedIn : function()
		{
			if (this.nativeExtensionObjectAvailable)
			{
				return CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "isLoggedIn", arguments);
			}
			else
			{
				return false;
			}
		},

		/**
		* Returns all the granted permissions for the current session.
		* @return {Array} An array containin the user granted permissions.
		*/
		getPermissions : function() 
		{
			if (this.nativeExtensionObjectAvailable)
			{
				return CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "getPermissions", arguments);
			}
			else
			{
				return new Array();
			}
		},

		/**
		* Check if the user has granted the publish permission for the current session.
		* @return {boolean} true if the user has granted the publish permission for the current session, false otherwise.
		*/
		hasPublishPermission : function() 
		{
			if (this.nativeExtensionObjectAvailable)
			{
				return CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "hasPublishPermission", arguments);
			}
			else
			{
				return false;
			}
		},

		/**
		* Request to retrieve the current or a specific user's id. The request can be monitored using the {@link CocoonJS.Social.onUserInfoRequestSucceed} and {@link CocoonJS.Social.onUserInfoRequestFailed} event handlers.
		* @param {string} [userId] The id of the user to retireve the information from. If no userID is specified, the currently logged in user is assumed.
		* @see CocoonJS.Social.onRequestUserInfoSucceed
		* @see CocoonJS.Social.onRequestUserInfoFailed
		*/
		requestUserInfo : function(userID)
		{
			if (this.nativeExtensionObjectAvailable)
			{
				return CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "requestUserInfo", arguments, true);
			}
		},

		/**
		* Request to retrieve the Image of a user
		* @param {string} [userID] The id of the user to get the image for. If no userID is specified, the currently logged user is used.
		* @param {CocoonJS.Social.ImageSizeType} [imageSizeType] The size of the image. One of the possible values among the ones in the {@link CocoonJS.Social.ImageSizeType}. If no value is specified, SMALL is used.
		* @see CocoonJS.Social.onRequestUserImageURLSucceed;
		* @see CocoonJS.Social.onRequestUserImageURLFailed;
		*/
		requestUserImageURL : function( imageSizeType, userID)
		{
			if (this.nativeExtensionObjectAvailable)
			{
				return CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "requestUserImageURL", arguments, true);
			}
		},

		/**
		* Request for the information of all the friends of the currently logged user.
		* @param {string} [userID] The id of the user to get the friends infos for. If no userID is specified, the currently logged user is used.
		* @see CocoonJS.Social.onRequestUserFriendsUserInfosSucceed;
		* @see CocoonJS.Social.onRequestUserFriendsUserInfosFailed;
		*/
		requestUserFriendsUserInfos : function(userID)
		{
			if (this.nativeExtensionObjectAvailable)
			{
				return CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "requestUserFriendsUserInfos", arguments, true);
			}
		},

		/**
		* Request the publication of a message using a dialog.
		* @param {CocoonJS.Social.Message} message A object representing the information to be published.
		* @see CocoonJS.Social.onRequestMessagePublicationSucceed
		* @see CocoonJS.Social.onRequestMessagePublicationFailed
		*/
		requestMessagePublicationWithDialog : function(message)
		{
			if (this.nativeExtensionObjectAvailable)
			{
				return CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "requestMessagePublicationWithDialog", arguments, true);
			}
		}
	};

	/**
	* This structure represents the possible images to be obtained for a user in the social gaming extension.
	* @namespace
	*/
	CocoonJS.Social.ImageSizeType = 
	{
		/**
		* Represent a thumbnail like image size.
		*/
	    THUMB : "thumb",

		/**
		* Represents the small image size.
		*/
	    SMALL : "small",

		/**
		* Represents the medium image size.
		*/
	    MEDIUM : "medium",

		/**
		* Represents the large image size.
		*/
	    LARGE : "large"
	};

	/**
	* The data structure that represents the information of a user inside the social gaming extension.
	* @namespace
	* @constructor
	* @param {string} userID The id of the user.
	* @param {string} userName The user name of the user.
	*/
	CocoonJS.Social.UserInfo = function(userID, userName)
	{
		/**
		* The id of the user.
		* @field
		* @type string
		*/
		this.userID = userID;

		/**
		* The user name of the user.
		* @field
		* @type string
		*/
		this.userName = userName;
	};

	/**
	* This type represents a message to be published.
	* @namespace
	* @constructor
	* @param {string} message The message to be published.
	* @param {string} mediaURL An URL to a media (image, video, ...)
	* @param {string} linkURL An URL to add to the message so the user can click on that link to get more information.
	* @param {string} linkText The text that will appear in the message link.
	* @param {string} linkCaption The text caption that will appear in the message link.
	*/
	CocoonJS.Social.Message = function(message, mediaURL, linkURL, linkText, linkCaption)
	{
		/**
		* The message to be published.
		* @field
		* @type string
		*/
		this.message = message;

		/**
		* An URL to a media (image, video, ...)
		* @field
		* @type string
		*/
		this.mediaURL = mediaURL;

		/**
		* An URL to add to the message so the user can click on that link to get more information.
		* @field
		* @type string
		*/
		this.linkURL = linkURL;

		/**
		* The text that will appear in the message link.
		* @field
		* @type string
		*/
		this.linkText = linkText;

		/**
		* The text caption that will appear in the message link.
		* @field
		* @type string
		*/
		this.linkCaption = linkCaption;

		return this;
	};

})();

//////////////////////////////////////
// COCOONJS_SOCIALGAMING.JS         //
//////////////////////////////////////

(function()
{
    // The CocoonJS must exist before creating the extension.
    if (typeof window.CocoonJS === 'undefined' || window.CocoonJS === null) throw("The CocoonJS object must exist and be valid before creating any extension object.");

    if (!CocoonJS.Social)
		throw("The CocoonJS.Social object must exist and be valid before creating any extension object.");

	/**
	* This type represents the access to a native Social Gamming extension API. As there can be more than
	* one service of this type, more than one instance can be created.
	* @namespace
	* @constructor
	* @param {string} nativeExtensionName The name of the native ext object extension property name.
	* @param {string} extensionName The name of the CocoonJS object extension property name.
	*/
	CocoonJS.SocialGaming = function(nativeExtensionName, extensionName)
	{
		CocoonJS.SocialGaming.superclass.constructor.call(this, nativeExtensionName, extensionName);

	    /**
	     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.SocialGaming.onRequestUserAndFriendsScoresSucceed} event calls.
	     * @name OnRequestUserAndFriendsScoresSucceedListener
	     * @function
	     * @static
	     * @memberOf CocoonJS.SocialGaming
	     * @param {array} userAndFriendsScoreInfos An array of {@link CocoonJS.SocialGaming.UserScoreInfo} objects representing the information of the user's and friends' scores.
	     */
		/**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when the user and friends scores request succeeds.
	    * The callback function's documentation is represented by {@link CocoonJS.SocialGaming.OnRequestUserAndFriendsScoresSucceedListener}
	    * @event
	    * @static
	    * @memberOf CocoonJS.SocialGaming
	    */
		this.onRequestUserAndFriendsScoresSucceed = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onRequestUserAndFriendsScoresSucceed");

	    /**
	     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.SocialGaming.onRequestUserAndFriendsScoresFailed} event calls.
	     * @name OnRequestUserAndFriendsScoresFailedListener
	     * @function
	     * @static
	     * @memberOf CocoonJS.SocialGaming
	     * @param {string} userID The id of the user for whom the score and friends scores were requested.
	     * @param {string} leadeboardID The id of the leaderboard for whom the score and friends scores were requested.
	     * @param {string} errorMessage The error message.
	     */
	    /**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when the user and his/her friends scores request fails.
	    * The callback function's documentation is represented by {@link CocoonJS.SocialGaming.OnRequestUserAndFriendsScoresFailedListener}
	    * @event
	    * @static
	    * @memberOf CocoonJS.SocialGaming
	    */
		this.onRequestUserAndFriendsScoresFailed = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onRequestUserAndFriendsScoresFailed");

	    /**
	     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.SocialGaming.onRequestUserScoreSucceed} event calls.
	     * @name OnRequestUserScoreSucceedListener
	     * @function
	     * @static
	     * @memberOf CocoonJS.SocialGaming
	     * @param {CocoonJS.SocialGaming.UserScoreInfo} userScoreInfo The info of the user's score.
	     */
	    /**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when the user's score information request suceeds.
	    * The callback function's documentation is represented by {@link CocoonJS.SocialGaming.OnRequestUserScoreSucceedListener}
	    * @event
	    * @static
	    * @memberOf CocoonJS.SocialGaming
	    */
		this.onRequestUserScoreSucceed = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onRequestUserScoreSucceed");

	    /**
	     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.SocialGaming.onRequestUserScoreFailed} event calls.
	     * @name OnRequestUserScoreFailedListener
	     * @function
	     * @static
	     * @memberOf CocoonJS.SocialGaming
	     * @param {string} userID The id of the user for whom the score was requested.
	     * @param {string} leaderboardID The id of the leaderboard for whom the score was requested.
	     * @param {string} errorMessage The error message.
	     */
	    /**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when the user's score information request fails.
	    * The callback function's documentation is represented by {@link CocoonJS.SocialGaming.OnRequestUserScoreFailedListener}
	    * @event
	    * @static
	    * @memberOf CocoonJS.SocialGaming
	    */
		this.onRequestUserScoreFailed = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onRequestUserScoreFailed");

	    /**
	     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.SocialGaming.onSubmitUserScoreSucceed} event calls.
	     * @name OnSubmitUserScoreSucceedListener
	     * @function
	     * @static
	     * @memberOf CocoonJS.SocialGaming
	     * @param {string} userID The id of the user for whom the score has been submitted.
	     * @param {string} leaderboardID The id of the leaderboard for which the score has been submitted.
	     * @param {number} score The score that has been submitted.
	     */
	    /**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when the user's score submit suceeds.
	    * The callback function's documentation is represented by {@link CocoonJS.SocialGaming.OnSubmitUserScoreSucceedListener}
	    * @event
	    * @static
	    * @memberOf CocoonJS.SocialGaming
	    */
		this.onSubmitUserScoreSucceed = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onSubmitUserScoreSucceed");

	    /**
	     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.SocialGaming.onSubmitUserScoreFailed} event calls.
	     * @name OnSubmitUserScoreFailedListener
	     * @function
	     * @static
	     * @memberOf CocoonJS.SocialGaming
	     * @param {string} userID The id of the user for whom the score submition was requested.
	     * @param {string} leaderboadID The id of the leaderboard for which the score submition was requested.
	     * @param {number} score The score that was submitted and failed.
	     * @param {string} errorMessage The error message.
	     */
	    /**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when the user's score submit fails.
	    * The callback function's documentation is represented by {@link CocoonJS.SocialGaming.OnSubmitUserScoreFailedListener}
	    * @event
	    * @static
	    * @memberOf CocoonJS.SocialGaming
	    */
		this.onSubmitUserScoreFailed = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onSubmitUserScoreFailed");

	    /**
	     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.SocialGaming.onRequestUserAchievementsSucceed} event calls.
	     * @name OnRequestUserAchievementsSucceedListener
	     * @function
	     * @static
	     * @memberOf CocoonJS.SocialGaming
	     * @param {string} userID The id of the user for whom the achievements where requested.
	     * @param {array} achievementsInfos An array of {@link CocoonJS.SocialGaming.AchievementInfo} objects representing the information of the user's achievements.
	     */
	    /**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when the user's achievements info are successfully retrieved.
	    * The callback function's documentation is represented by {@link CocoonJS.SocialGaming.OnRequestUserAchievementsSucceedListener}
	    * @event
	    * @static
	    * @memberOf CocoonJS.SocialGaming
	    */
		this.onRequestUserAchievementsSucceed = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onRequestUserAchievementsSucceed");

	    /**
	     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.SocialGaming.onRequestUserAchievementsFailed} event calls.
	     * @name OnRequestUserAchievementsFailedListener
	     * @function
	     * @static
	     * @memberOf CocoonJS.SocialGaming
	     * @param {string} userID The id of the user for whom the achievements were requested.
	   	 * @param {string} msg The error message.
	     */
	    /**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when the user's achievmeents info fails to be retrieved.
	    * The callback function's documentation is represented by {@link CocoonJS.SocialGaming.OnRequestUserAchievementsFailedListener}
	    * @event
	    * @static
	    * @memberOf CocoonJS.SocialGaming
	    */
		this.onRequestUserAchievementsFailed = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onRequestUserAchievementsFailed");

	    /**
	     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.SocialGaming.onRequestAllAchievementsSucceed} event calls.
	     * @name OnRequestAllAchievementsSucceedListener
	     * @function
	     * @static
	     * @memberOf CocoonJS.SocialGaming
	     * @param {array} achievementsInfos An array of {@link CocoonJS.SocialGaming.AchievementInfo} objects representing the information of all the achievements.
	     */
	    /**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when the user's achievements info are successfully retrieved.
	    * The callback function's documentation is represented by {@link CocoonJS.SocialGaming.OnRequestAllAchievementsSucceedListener}
	    * @event
	    * @static
	    * @memberOf CocoonJS.SocialGaming
	    */
		this.onRequestAllAchievementsSucceed = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onRequestAllAchievementsSucceed");

	    /**
	     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.SocialGaming.onRequestAllAchievementsFailed} event calls.
	     * @name OnRequestAllAchievementsFailedListener
	     * @function
	     * @static
	     * @memberOf CocoonJS.SocialGaming
	   	 * @param {string} msg The error message.
	     */
	    /**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when the user's achievmeents info fails to be retrieved.
	    * The callback function's documentation is represented by {@link CocoonJS.SocialGaming.OnRequestAllAchievementsFailedListener}
	    * @event
	    * @static
	    * @memberOf CocoonJS.SocialGaming
	    */
		this.onRequestAllAchievementsFailed = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onRequestAllAchievementsFailed");

	    /**
	     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.SocialGaming.onRequestAchievementInfoSucceed} event calls.
	     * @name OnRequestAchievementInfoSucceedListener
	     * @function
	     * @static
	     * @memberOf CocoonJS.SocialGaming
	     * @param {CocoonJS.SocialGaming.AchievementInfo} achievementInfo A {@link CocoonJS.SocialGaming.AchievementInfo} object representing the information of the achievement.
	     */
		/**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when the request to retrieve the information of an achievement succeeds.
	    * The callback function's documentation is represented by {@link CocoonJS.SocialGaming.OnRequestAchievementInfoSucceedListener}
	    * @event
	    * @static
	    * @memberOf CocoonJS.SocialGaming
	    */
		this.onRequestAchievementInfoSucceed = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onRequestAchievementInfoSucceed");

	    /**
	     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.SocialGaming.onRequestAchievementInfoFailed} event calls.
	     * @name OnRequestAchievementInfoFailedListener
	     * @function
	     * @static
	     * @memberOf CocoonJS.SocialGaming
	     * @param {string} achievementID The id of the achievement for which the information retrieval was requested.
	     * @param {string} errorMessage The error message.
	     */
		/**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when the request to retrieve the information of an achievement fails.
	    * The callback function's documentation is represented by {@link CocoonJS.SocialGaming.OnRequestAchievementInfoFailedListener}
	    * @event
	    * @static
	    * @memberOf CocoonJS.SocialGaming
	    */
		this.onRequestAchievementInfoFailed = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onRequestAchievementInfoFailed");

	    /**
	     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.SocialGaming.onSubmitUserAchievementSucceed} event calls.
	     * @name OnSubmitUserAchievementSucceedListener
	     * @function
	     * @static
	     * @memberOf CocoonJS.SocialGaming
	     * @param {string} userID The id of the user for whom the achievement has been submitted.
	     * @param {string} achievementID The id of the achievement that has been submitted.
	     */
	    /**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when a user's achievement submition succeeds.
	    * The callback function's documentation is represented by {@link CocoonJS.SocialGaming.OnSubmitUserAchievementSucceedListener}
	    * @event
	    * @static
	    * @memberOf CocoonJS.SocialGaming
	    */
		this.onSubmitUserAchievementSucceed = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onSubmitUserAchievementSucceed");

	    /**
	     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.SocialGaming.onSubmitUserAchievementFailed} event calls.
	     * @name OnSubmitUserAchievementFailedListener
	     * @function
	     * @static
	     * @memberOf CocoonJS.SocialGaming
	     * @param {string} userID The id of the user for whom the achievment was submitted.
	     * @param {string} achievementID The id of the achievement that was submitted.
	     * @param {string} msg The error message.
	     */
	    /**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when a user's achievement submition fails.
	    * The callback function's documentation is represented by {@link CocoonJS.SocialGaming.OnSubmitUserAchievementFailedListener}
	    * @event
	    * @static
	    * @memberOf CocoonJS.SocialGaming
	    */
		this.onSubmitUserAchievementFailed = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onSubmitUserAchievementFailed");

	    /**
	     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.SocialGaming.onResetUserAchievementsSucceed} event calls.
	     * @name OnResetUserAchievementsSucceedListener
	     * @function
	     * @static
	     * @memberOf CocoonJS.SocialGaming
	     * @param {string} userID The id of the user for whom the achievements were reset.
	     */
	    /**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when a user's achievement reset succeeds.
	    * The callback function's documentation is represented by {@link CocoonJS.SocialGaming.OnResetUserAchievementsSucceedListener}
	    * @event
	    * @static
	    * @memberOf CocoonJS.SocialGaming
	    */
		this.onResetUserAchievementsSucceed = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onResetUserAchievementsSucceed");

	    /**
	     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.SocialGaming.onResetUserAchievementsFailed} event calls.
	     * @name OnResetUserAchievementsFailedListener
	     * @function
	     * @static
	     * @memberOf CocoonJS.SocialGaming
	     * @param {string} userID The id of the user for whom the achievements where tried to be reset.
	     * @param {string} msg The error message.
	     */
	    /**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when a user's achievement reset fails.
	    * The callback function's documentation is represented by {@link CocoonJS.SocialGaming.OnResetUserAchievementsFailedListener}
	    * @event
	    * @static
	    * @memberOf CocoonJS.SocialGaming
	    */
		this.onResetUserAchievementsFailed = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onResetUserAchievementsFailed");

	    /**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when the users closes the achievements view.
	    * The callback function does not receive any parameter.
	    * @event
	    * @static
	    * @memberOf CocoonJS.SocialGaming
	    */
		this.onAchievementsViewClosed  = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onAchievementsViewClosed");

	    /**
	     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.SocialGaming.onAchievementsViewFailed} event calls.
	     * @name OnAchievementsViewFailedListener
	     * @function
	     * @static
	     * @memberOf CocoonJS.SocialGaming
	     * @param {string} errorMessage The message that describes why the call failed.
	     */
		/**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when the achievements view failed to show.
	    * The callback function's documentation is represented by {@link CocoonJS.SocialGaming.OnAchievementsViewFailedListener}
	    * @event
	    * @static
	    * @memberOf CocoonJS.SocialGaming
	    */
		this.onAchievementsViewFailed  = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onAchievementsViewFailed");

		/**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when achievements view shows successfully.
	    * The callback function does not receive any parameter.
	    * @event
	    * @static
	    * @memberOf CocoonJS.SocialGaming
	    */
		this.onAchievementsViewSucceed = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onAchievementsViewSucceed");

	    /**
	     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.SocialGaming.onLeaderboardViewClosed} event calls.
	     * @name OnLeaderboardViewClosedListener
	     * @function
	     * @static
	     * @memberOf CocoonJS.SocialGaming
	     * @param {string} leaderboardID The id of the leaderboard for which it's vew was requested to be shown.
	     */
	    /**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when a user's achievement reset fails.
	    * The callback function's documentation is represented by {@link CocoonJS.SocialGaming.OnLeaderboardViewClosedListener}
	    * @event
	    * @static
	    * @memberOf CocoonJS.SocialGaming
	    */
   		this.onLeaderboardViewClosed  = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onLeaderboardViewClosed");

	    /**
	     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.SocialGaming.onLeaderboardViewFailed} event calls.
	     * @name OnLeaderboardViewFailedListener
	     * @function
	     * @static
	     * @memberOf CocoonJS.SocialGaming
	     * @param {string} leaderboardID The id of the leaderboard for which it's vew was requested to be shown.
	     * @param {string} errorMessage The error message.
	     */
	    /**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when a user's achievement reset fails.
	    * The callback function's documentation is represented by {@link CocoonJS.SocialGaming.OnLeaderboardViewFailedListener}
	    * @event
	    * @static
	    * @memberOf CocoonJS.SocialGaming
	    */
   		this.onLeaderboardViewFailed  = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onLeaderboardViewFailed");

	    /**
	     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.SocialGaming.onLeaderboardViewSucceed} event calls.
	     * @name OnLeaderboardViewSucceedListener
	     * @function
	     * @static
	     * @memberOf CocoonJS.SocialGaming
	     * @param {string} leaderboardID The id of the leaderboard for which it's vew was requested to be shown.
	     */
	    /**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when a user's achievement reset fails.
	    * The callback function's documentation is represented by {@link CocoonJS.SocialGaming.OnLeaderboardViewSucceedListener}
	    * @event
	    * @static
	    * @memberOf CocoonJS.SocialGaming
	    */
   		this.onLeaderboardViewSucceed = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onLeaderboardViewSucceed");

		return this;
	};

	CocoonJS.SocialGaming.prototype = 
	{
        abstractToSocialGamingAchievementMap : null,
        abstractToSocialGamingAchievementMapInverse : null,

        /**
        * @ignore
        */
        setAbstractToSocialGamingAchievementMap : function( map ) {
            this.abstractToSocialGamingAchievementMap= map;

            // build a reciprocal map.
            this.abstractToSocialGamingAchievementMapInverse= {};
            for( var id in map ) {
                if ( map.hasOwnProperty(id) ) {
                    this.abstractToSocialGamingAchievementMapInverse[ map[id] ]= id;
                }
            }
            return this;
        },

        /**
        * @ignore
        */
        getAbstractToSocialGamingAchievementTranslation : function( achievementID ) {
            /**
             * If a translation map for abstract in-game achievements has been set, translate achievementID from
             * abstract to SocialGamingService.
             */
            if (this.abstractToSocialGamingAchievementMap) {
                var socialGamingAchievementID = this.abstractToSocialGamingAchievementMap[achievementID];
                if (socialGamingAchievementID) {
                    console.log("Abstract achieventID='" + achievementID + "' turned to '" + socialGamingAchievementID + "'");
                    achievementID = socialGamingAchievementID;
                } else {
                    console.log("Something may be wrong: abstract achievementID: '" + achievementID + "' w/o translation.")
                }
            }

            return achievementID;
        },

		/**
		* Request to retrieve the scores of all friends of a given user.
		* @param {string} [leaderboardID] The id of the leaderboard to request the scores for.
		* @param {string} [userID] The id of the user. If null or undefined is passed, the currently logged in user id is used.
		* @see CocoonJS.SocialGaming.onRequestUserAndFriendsScoresSucceed
		* @see CocoonJS.SocialGaming.onRequestUserAndFriendsScoresFailed
		*/
		requestUserAndFriendsScores : function(leaderboardID, userID)
		{
			if (this.nativeExtensionObjectAvailable)
			{
				return CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "requestUserAndFriendsScores", arguments, true);
			}
		},

		/**
		* Request to retrieve the score of a user.
		* @param {string} [leaderboardID] The id of the scores leaderboard to retireve the score from. If null or underfined is passed, the "leadeboard" id will be used.
		* @param {string} [userID] The id of the user to retireve the score from. If null or undefined is passed, the currently logged in user id is used.
		* @see CocoonJS.SocialGaming.onRequestUserScoreSucceed
		* @see CocoonJS.SocualGaming.onRequestUserScoreFailed
		*/
		requestUserScore : function(leaderboardID, userID)
		{
			if (this.nativeExtensionObjectAvailable)
			{
				return CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "requestUserScore", arguments, true);
			}
		},

		/**
		* Request to the server the score of a user.
		* @param {number} [score] the score to submit
		* @param {string} [leaderboardID] The id of the scores leaderboard to submit the score to. If null or underfined is passed, the "leadeboard" id will be used.
		* @param {string} [userID] The id of the user to submit the score for. If null or undefined is passed, the currently logged in user id is used.
		* @see CocoonJS.SocialGaming.onSubmitUserScoreSucceed
		* @see CocoonJS.SocualGaming.onSubmitUserScoreFailed
		*/
		submitUserScore : function(score, leaderboardID, userID)
		{
			if (this.nativeExtensionObjectAvailable)
			{
				return CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "submitUserScore", arguments, true);
			}
		},
		/**
		* Shows the leaderboard using a platform dependant view.
		* @param {string} [leaderboardID] The id of the scores leaderboard to show the view for. If null or underfined is passed, the "leadeboard" id will be used.
		* @see CocoonJS.SocialGaming.onLeaderboardViewClosed
		*/
		showLeaderboardView : function(leaderboardID)
		{
			if (this.nativeExtensionObjectAvailable)
			{
				return CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "showLeaderboardView", arguments, true);
			}
		},

		/**
		* Request to retrieve the user achievements. The request can be monitored using the {@link CocoonJS.SocialGaming.onRequestUserAchievementsSucceed} and {@link CocoonJS.Social.onRequestUserAchievementsFailed} event handlers.
		* @param {string} [userID] The id of the user to retireve the achievements from. if null/undefined/"" is specified, the currently logged in user is assumed.
		* @see CocoonJS.SocialGaming.onRequestUserAchievementsSucceed
		* @see CocoonJS.SocialGaming.onRequestUserAchievementsFailed
		*/
		requestUserAchievements : function(userID)
		{
			if (this.nativeExtensionObjectAvailable)
			{
				return CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "requestUserAchievements", arguments, true);
			}
		},

		/**
		* Request to retrieve all the achievements. The request can be monitored using the {@link CocoonJS.SocialGaming.onRequestAllAchievementsSucceed} and {@link CocoonJS.Social.onRequestAllAchievementsFailed} event handlers.
		* @see CocoonJS.SocialGaming.onRequestAllAchievementsSucceed
		* @see CocoonJS.SocialGaming.onRequestAllAchievementsFailed
		*/
		requestAllAchievements : function()
		{
			if (this.nativeExtensionObjectAvailable)
			{
				return CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "requestAllAchievements", arguments, true);
			}
		},

		/**
		* Request to retrieve the information about an achievement. 
		* @param {string} achievementID The id of the achievement to get the information for.
		* @param {CocoonJS.Social.ImageSizeType} [imageSizeType] The size of the image. One of the possible values among the ones in the {@link CocoonJS.Social.ImageSizeType}
		*/
		requestAchievementInfo : function(achievementID)
		{
			if (this.nativeExtensionObjectAvailable)
			{
				return CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "requestAchievementInfo", arguments, true);
			}
		},

		/**
		* Submits an achievement to the server. If the process fails, the achievement is stored to submit it later.
		* @param {string} [achievementID] the achievement identifier
		* @param {number} [percentComplete] an optional number between 0 and 100 that indicates a completion percentage.
		* @see CocoonJS.SocialGaming.onSubmitAchievementSucceed
		* @see CocoonJS.SocualGaming.onSubmitAchievementFailed
		*/
        submitUserAchievement:function (achievementID, userID) {
            achievementID = this.getAbstractToSocialGamingAchievementTranslation(achievementID);

            if (this.nativeExtensionObjectAvailable) {
                return CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "submitUserAchievement", arguments, true);
            }
        },

		/**
		* Shows the achievements using a platform dependant view.
		* @see CocoonJS.SocialGaming.onAchievementsViewClosed
		*/
		showUserAchievementsView : function(userID)
		{
			if (this.nativeExtensionObjectAvailable)
			{
				return CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "showUserAchievementsView", arguments, true);
			}
		},

		/**
		* Resets all the achievements of the current user
		* @param {string} [userID] The id of the user to reset the achievements for. If null/undefined/"", the logged in user is assumed.
		* @see CocoonJS.SocialGaming.onResetAchievementsSucceed
		* @see CocoonJS.SocualGaming.onResetAchievementsFailed
		*/
		resetUserAchievements : function(userID)
		{
			if (this.nativeExtensionObjectAvailable)
			{
				return CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "resetUserAchievements", arguments, true);
			}
		}
	};

	/**
    * @ignore
    */
	CocoonJS.extend(CocoonJS.SocialGaming, CocoonJS.Social);

	/**
	* The data structure that represents the information of the user score in the application.
	* @namespace
	* @constructor
	* @param {string} userID The user id.
	* @param {number} score The score of the user.
	* @param {string} userName The name of the user.
	* @param {string} imageURL The url of the user image.
	* @param {number} leaderboardID The id of the leaderboard the score belongs to.
	*/
	CocoonJS.SocialGaming.UserScoreInfo = function(userID, score, userName, imageURL, leaderboardID)
	{
		/**
		* The user id. 
		* @type string
		*/
		this.userID = userID;

		/**
		* The score of the user.
		* @type number
		*/
		this.score = score ? score : 0;

		/**
		* The name of the user.
		* @type string
		*/
        this.userName = userName;

		/**
		* The url of the user image.
		* @type string
		*/
        this.imageURL = imageURL;

        /**
		* The id of the leaderboard the score belongs to.
		* @type number
		*/
        this.leaderboardID = leaderboardID;
	};

	/**
	* The data structure that represents the information of an achievement in the application.
	* @namespace
	* @constructor
	* @param {string} achievementID The id of the achievement info.
	* @param {string} title The title of the achievement.
	* @param {string} description The description of the achievement.
	* @param {string} imageURL The url to the image representing the achievement.
	* @param {number} points The points value of the achievement
	*/
	CocoonJS.SocialGaming.AchievementInfo = function(achievementID, title, description, imageURL, points)
	{
		/**
		* The id of the achievement info.
		* @type string
		*/
		this.achievementID = achievementID;

		/**
		* The title of the achievement.
		* @type string
		*/
		this.title = title;

		/**
		* The description of the achievement.
		* @type string
		*/
		this.description = description;

		/**
		* The url to the image representing the achievement.
		* @type string
		*/
		this.imageURL = imageURL;

		/**
		* The points value of the achievement
		* @type number
		*/
		this.points = points ? points : 0;
	};

})();

/////////////////////////////////////////
// COCOONJS_SOCIALGAMING_GAMECENTER.JS //
/////////////////////////////////////////

(function()
{
    // The CocoonJS must exist before creating the extension.
    if (typeof window.CocoonJS === 'undefined' || window.CocoonJS === null) throw("The CocoonJS object must exist and be valid before creating any extension object.");
    if (typeof window.CocoonJS.SocialGaming === 'undefined' || window.CocoonJS === null) throw("The CocoonJS.SocialGaming object must exist and be valid before creating a Game Center extension object.");

	/**
	* This instance represents the extension object to access GameCenter related native functionalities.
	* The data structure for initialization: None.
	* @see CocoonJS.Social
	*/
	CocoonJS.SocialGaming.GameCenter = new CocoonJS.SocialGaming("IDTK_SRV_SOCIAL_GAMECENTER", "SocialGaming.GameCenter");
})();

//////////////////////////////
// COCOONJS_GAMEPAD.JS 		//
//////////////////////////////

(function () {
    // The CocoonJS must exist before creating the extension.
    if (typeof window.CocoonJS === 'undefined' || window.CocoonJS === null) throw("The CocoonJS object must exist and be valid before creating any extension object.");

    /**
     * This namespace represents the functionalities related to OUYA android gaming control.
     * @namespace
     */
    CocoonJS.Gamepad = {};

    CocoonJS.Gamepad.nativeExtensionObjectAvailable = CocoonJS.nativeExtensionObjectAvailable && typeof window.ext.Gamepad !== 'undefined';

    CocoonJS.Gamepad.Indices = {
        BUTTON_0                : 0, 
        BUTTON_1                : 1,
        BUTTON_2                : 2,
        BUTTON_3                : 3,
        BUTTON_LEFT_BUMPER      : 4,
        BUTTON_RIGHT_BUMPER     : 5,
        
        BUTTON_LEFT_TRIGGER     : 6,
        BUTTON_RIGHT_TRIGGER    : 7,
        
        BUTTON_LEFT_JOYSTICK    : 10,
        BUTTON_RIGHT_JOYSTICK   : 11,
        BUTTON_DPAD_UP          : 12,
        BUTTON_DPAD_DOWN        : 13,
        BUTTON_DPAD_LEFT        : 14,
        BUTTON_DPAD_RIGHT       : 15,
        BUTTON_MENU             : 16,
        
        AXE_LEFT_JOYSTICK_X     : 0,
        AXE_LEFT_JOYSTICK_Y     : 1,
        AXE_RIGHT_JOYSTICK_X    : 2,
        AXE_RIGHT_JOYSTICK_Y    : 3
    };

    // If the extension is present and the navigator does not provide the gamepad API:
    // 1.- Add the getGamepads function to the navigator object.
    // 2.- Replace the window add and remove event listener functions to call to the extension for the gamepad related events.
    var systemSupportsGamepads = navigator["getGamepads"] || navigator["webkitGetGamepads"];
    if (CocoonJS.Gamepad.nativeExtensionObjectAvailable && !systemSupportsGamepads)
    {
        navigator.getGamepads = function()
        {
            return window.ext.Gamepad.makeCall("getGamepads");
        };

        CocoonJS.Gamepad.originalWindowAddEventListener = window.addEventListener;
        CocoonJS.Gamepad.originalWindowRemoveEventListener = window.removeEventListener;

        window.addEventListener = function(eventName, callback)
        {
            console.log("The new window.addEventListener has been called.");
            if (eventName === "gamepadconnected" || eventName === "gamepaddisconnected")
            {
                window.ext.Gamepad.addEventListener(eventName, callback);
            }
            else
            {
                var argumentsArray = Array.prototype.slice.call(arguments);
                CocoonJS.Gamepad.originalWindowAddEventListener.apply(window, argumentsArray);
            }
        };
        window.removeEventListener = function(eventName, callback)
        {
            console.log("The new window.removeEventListener has been called.");
            if (eventName === "gamepadconnected" || eventName === "gamepaddisconnected")
            {
                window.ext.Gamepad.removeEventListener(eventName, callback);
            }
            else
            {
                var argumentsArray = Array.prototype.slice.call(arguments);
                CocoonJS.Gamepad.originalWindowRemoveEventListener.apply(window, argumentsArray);
            }
        };
    } 
    else if (systemSupportsGamepads) 
    {
        if (!navigator.getGamepads)
        {
            console.log("navigator.getGamepads does not exist.");
            if (navigator.webkitGetGamepads)
            {
                console.log("navigator.webkitGamepads exists, adding navigator.getGamepads to point to it.");
                navigator.getGamepads = navigator.webkitGetGamepads;
            }
            else
            {
                console.log("navigator.webkitGetGamepads does not exist either.");
            }
        }
    }
})();

//////////////////////////////
// COCOONJS_NOTIFICATION.JS //
//////////////////////////////

(function()
{
    // The CocoonJS must exist before creating the extension.
    if (typeof window.CocoonJS === 'undefined' || window.CocoonJS === null) throw("The CocoonJS object must exist and be valid before creating any extension object.");

    /**
    * This namespace represents the CocoonJS Notification extension.
    * @namespace
    */
    CocoonJS.Notification = {};

    CocoonJS.Notification.nativeExtensionObjectAvailable = CocoonJS.nativeExtensionObjectAvailable && typeof window.ext.IDTK_SRV_NOTIFICATION !== 'undefined';

	/**
	* The data structure that represents the information of a local notification.
	* @namespace
	* @constructor
	* @param {string} message The notification message.
	* @param {boolean} soundEnabled A flag that indicates if the sound should be enabled for the notification.
	* @param {number} badgeNumber The number that will appear in the badge of the application icon in the home screen.
	* @param {object} userData The JSON data to attached to the notification.
	* @param {string} contentBody The body content to be showed in the expanded notification information.
	* @param {string} contentTitle The title to be showed in the expanded notification information.
	* @param {number} date Time in millisecs from 1970 when the notification will be fired.
	*/
	CocoonJS.Notification.LocalNotification = function(message, soundEnabled, badgeNumber, userData, contentBody, contentTitle, scheduleTime)
	{
		/**
		* The notification message.
		* @field
		* @type string
		*/
		this.message = message;

		/**
		* A flag that indicates if the sound should be enabled for the notification.
		* @field
		* @type boolean
		*/
		this.soundEnabled = soundEnabled;

		/**
		* (iOS only) The number that will appear in the badge of the application icon in the home screen.
		* @field
		* @type number
		*/
		this.badgeNumber = badgeNumber;

		/**
		* The JSON data to attached to the notification.
		* @field
		* @type object
		*/
		this.userData = userData;

		/**
		* (Android only) The body content to be showed in the expanded notification information.
		* @field
		* @type string
		*/
		if (contentBody !== undefined)
			this.contentBody = contentBody;
		else
			this.contentBody = "";

		/**
		* (Android only) The title to be showed in the expanded notification information.
		* @field
		* @type string
		*/
		if (contentTitle !== undefined)
			this.contentTitle = contentTitle;
		else
			this.contentTitle = "";

		/**
		* Time in millisecs from 1970 when the local notification will be fired
		* @field
		* @type number
		*/
		var currentTime = new Date().getTime();
		if (scheduleTime !== undefined){
			this.scheduleTime = scheduleTime;
		}else{
			this.scheduleTime = currentTime;
		}
	};

	/**
	* The data structure that represents the information of a push notification.
	* @namespace
	* @constructor
	* @param {string} message The notification message.
	* @param {boolean} soundEnabled A flag that indicates if the sound should be enabled for the notification.
	* @param {number} badgeNumber The number that will appear in the badge of the application icon in the home screen.
	* @param {object} userData The JSON data to attached to the notification.
	* @param {array} channels An array containing the channels names this notification will be delivered to.
	* @param {number} expirationTime A time in seconds from 1970 when the notification is no longer valid and will not be delivered in case it has not already been delivered.
	* @param {number} expirationTimeInterval An incremental ammount of time in from now when the notification is no longer valid and will not be delivered in case it has not already been delivered.
	*/
	CocoonJS.Notification.PushNotification = function(message, soundEnabled, badgeNumber, userData, channels, expirationTime, expirationTimeInterval)
	{
		/**
		* The notification message.
		* @field
		* @type string
		*/
		this.message = message;

		/**
		* A flag that indicates if the sound should be enabled for the notification.
		* @field
		* @type boolean
		*/
		this.soundEnabled = soundEnabled;

		/**
		* The number that will appear in the badge of the application icon in the home screen.
		* @field
		* @type number
		*/
		this.badgeNumber = badgeNumber;

		/**
		* The JSON data to attached to the notification.
		* @field
		* @type object
		*/
		this.userData = userData

		/**
		* An array containing the channels names this notification will be delivered to.
		* @field
		* @type array
		*/
		this.channels = channels;

		/**
		* A time in seconds from 1970 when the notification is no longer valid and will not be delivered in case it has not already been delivered.
		* @field
		* @type number
		*/
		if (expirationTime !== undefined)
			this.expirationTime = expirationTime;
		else
			this.expirationTime = 0;

		/**
		* An incremental ammount of time in from now when the notification is no longer valid and will not be delivered in case it has not already been delivered.
		* @field
		* @type number
		*/
		if (expirationTimeInterval !== undefined)
			this.expirationTimeInterval = expirationTimeInterval;
		else
			this.expirationTimeInterval = 0;
	};

	/**
	* Start processing received notifications. The user must call this method when the game is ready to process notifications. Notifications received before being prepared are stored and processed later.
	*/
	CocoonJS.Notification.start = function()
	{
		if (CocoonJS.Notification.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_NOTIFICATION", "start", arguments, true);
		}
	};


	/**
	* Register to be able to receive push notifications.
	* The registration process is controlled using the {@link CocoonJS.Notification.onRegisterForPushNotificationsSucceed} and {@link CocoonJS.Notification.onRegisterForPushNotificationsFailed} event handlers.
	* @function
	* @see {CocoonJS.Notification.onRegisterForPushNotificationsSucceed}
	* @see {CocoonJS.Notification.onRegisterForPushNotificationsFailed}
	*/
	CocoonJS.Notification.registerForPushNotifications = function()
	{
		if (CocoonJS.Notification.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_NOTIFICATION", "registerForPushNotifications", arguments, true);
		}
	};

	/**
	* Unregister from receiving push notifications.
	* The unregistration process is controlled using the {@link CocoonJS.Notification.onUnregisterForPushNotificationsSucceed} event handler.
	* @function
	* @see CocoonJS.Notification.onUnregisterForPushNotificationsSucceed
	*/
	CocoonJS.Notification.unregisterForPushNotifications = function()
	{
		if (CocoonJS.Notification.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_NOTIFICATION", "unregisterForPushNotifications", arguments, true);
		}
	};

	/**
	* Cancel the last sent local notification.
	* The last sent local notification will be remove from the notifications bar.
	* @function
	*/
	CocoonJS.Notification.cancelLastSentLocalNotificiation = function()
	{
		if (CocoonJS.Notification.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_NOTIFICATION", "cancelLocalNotification", arguments, true);
		}
	};

	/**
	* Cancel all sent local notifications.
	* All the notifications will ve removed from the notifications bar.
	* @function
	*/
	CocoonJS.Notification.cancelAllLocalNotifications = function()
	{
		if (CocoonJS.Notification.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_NOTIFICATION", "cancelAllLocalNotifications", arguments, true);
		}
	};

	/**
	* Send a local notification.
	* @function
	* @param {CocoonJS.Notification.LocalNotification} localNotification The local notification to be sent.
	*/
	CocoonJS.Notification.sendLocalNotification = function(localNotification)
	{
		if (CocoonJS.Notification.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_NOTIFICATION", "sendLocalNotification", arguments, true);
		}
	};

	/**
	* Subscribe to a channel in order to receive notifications targeted to that channel.
	* @function
	* @param {string} channel The channel id to subscribe to.
	*/
	CocoonJS.Notification.subscribeToChannel = function(channel)
	{
		if (CocoonJS.Notification.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_NOTIFICATION", "subscribe", arguments, true);
		}
	};

	/**
	* Unsubscribe from a channel in order to stop receiving notifications targeted to it.
	* @function
	* @param {string} channel The channel id to unsubscribe from.
	*/
	CocoonJS.Notification.unsubscribeFromChannel = function(channel)
	{
		if (CocoonJS.Notification.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_NOTIFICATION", "unsubscribe", arguments, true);
		}
	};

	/**
	* Send a push notification.
	* @function
	* @param {CocoonJS.Notification.PushNotification} pushNotification The push notification object to be sent.
	* @see CocoonJS.Notification.onPushNotificationDeliverySucceed
	* @see CocoonJS.Notification.onPushNotificationDeliveryFailed
	*/
	CocoonJS.Notification.sendPushNotification = function(pushNotification)
	{
		if (CocoonJS.Notification.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_NOTIFICATION", "sendPushNotification", arguments, true);
		}
	};

	/**
	* (iOS only) Set the badge number for this application.
	* This is useful if you want to modify the badge number set by a notification.
	* @function
	* @param {number} badgeNumber The number of the badge.
	*/
	CocoonJS.Notification.setBadgeNumber = function(badgeNumber)
	{
		if (CocoonJS.Notification.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_NOTIFICATION", "setBadgeNumber", arguments);
		}
	};

	/**
	* (iOS only) Returns the current badge number.
	* @function
	* @returns {number} The badge number.
	*/
	CocoonJS.Notification.getBadgeNumber = function()
	{
		if (CocoonJS.Notification.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_NOTIFICATION", "getBadgeNumber", arguments);
		}
	};

	/**
	* Returns the last received user data from a Local notification.
	* @function
	* @returns {object} The last received user data from a Local notification.
	*/
	CocoonJS.Notification.getLastReceivedLocalNotificationData = function()
	{
		if (CocoonJS.Notification.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_NOTIFICATION", "getLastReceivedLocalNotificationData", arguments);
		}
	};

	/**
	* Returns the last received user data from a Push notification.
	* @function
	* @returns {object} The last received user data from a Push notification.
	*/
	CocoonJS.Notification.getLastReceivedPushNotificationData = function()
	{
		if (CocoonJS.Notification.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_NOTIFICATION", "getLastReceivedPushNotificationData", arguments);
		}
	};

    /**
    * This {@link CocoonJS.EventHandler} object allows listening to events called when the registration for push notification succeeds.
    * The callback function does not receive any parameter.
    * @static
    * @event
    * @param {string} token The token (apid or device token) received at registration time.
    * @memberOf CocoonJS.Notification
    */
	CocoonJS.Notification.onRegisterForPushNotificationsSucceed = new CocoonJS.EventHandler("IDTK_SRV_NOTIFICATION", "Notification", "pushNotificationServiceRegistered");

    /**
    * This {@link CocoonJS.EventHandler} object allows listening to events called when the unregistration for push notifications succeeds.
    * The callback function does not receive any parameter.
    * @static
    * @event
    * @memberOf CocoonJS.Notification
    */
	CocoonJS.Notification.onUnregisterForPushNotificationsSucceed = new CocoonJS.EventHandler("IDTK_SRV_NOTIFICATION", "Notification", "pushNotificationServiceUnregistered");

    /**
    * This {@link CocoonJS.EventHandler} object allows listening to events called when the registration for push notifications fails.
    * The callback function receives a parameter with error information.
    * @static
    * @event
    * @param {string} msg The error message.
    */
	CocoonJS.Notification.onRegisterForPushNotificationsFailed = new CocoonJS.EventHandler("IDTK_SRV_NOTIFICATION", "Notification", "pushNotificationServiceFailedToRegister");

    /**
    * This {@link CocoonJS.EventHandler} object allows listening to events called when a push notification is received.
    * The callback function receives a parameter with the userData of the received notification.
    * @static
    * @event
    * @param {object} userData An object with the notification userData information.
    */
	CocoonJS.Notification.onPushNotificationReceived = new CocoonJS.EventHandler("IDTK_SRV_NOTIFICATION", "Notification", "pushNotificationReceived");

    /**
    * This {@link CocoonJS.EventHandler} object allows listening to events called when a local notification is received.
    * The callback function receives a parameter with the userData of the received notification.
    * @static
    * @event
    * @param {object} userData An object with the notification userData information.
    */
	CocoonJS.Notification.onLocalNotificationReceived = new CocoonJS.EventHandler("IDTK_SRV_NOTIFICATION", "Notification", "localNotificationReceived");

    /**
    * This {@link CocoonJS.EventHandler} object allows listening to events called when a notification is successfully delivered.
    * The callback function receives a parameter with the notificationId of the delivered notification.
    * @static
    * @event
    * @param {string} userData A string with the notification userData information.
    */
	CocoonJS.Notification.onPushNotificationDeliverySucceed = new CocoonJS.EventHandler("IDTK_SRV_NOTIFICATION", "Notification", "pushNotificationSuccessfullyDelivered");

    /**
    * This {@link CocoonJS.EventHandler} object allows listening to events called when the delivery of push a notification fails.
    * The callback function receives a parameter with error information.
    * @static
    * @event
    * @param {string} msg The error message.
    */
	CocoonJS.Notification.onPushNotificationDeliveryFailed = new CocoonJS.EventHandler("IDTK_SRV_NOTIFICATION", "Notification", "pushNotificationDeliveryError");

})();

/////////////////
// PATHFIND.JS //
/////////////////

// Pathfind.js
// Written by Ashley Gullen
// Copyright (c) 2013 Scirra Ltd.

// A* pathfinding javascript implementation

(function() {
	
	var PF_CLEAR = 0;
	var PF_OBSTACLE = 32767;
	
	function node()
	{
		this.parent = null;
		
		this.x = 0;
		this.y = 0;

		this.f = 0;
		this.g = 0;
		this.h = 0;
	};
	
	var nodeCache = [];			// for recycling nodes
	
	function allocNode()
	{
		var ret;
		
		if (nodeCache.length)
			ret = nodeCache.pop();
		else
			ret = new node();
			
		ret.parent = null;
		ret.x = 0;
		ret.y = 0;
		ret.f = 0;
		ret.g = 0;
		ret.h = 0;
		return ret;
	};
	
	function freeNode(n)
	{
		if (nodeCache.length < 64000)
			nodeCache.push(n);
	};
	
	function resultNode(x_, y_)
	{
		this.x = x_ || 0;
		this.y = y_ || 0;
	};
	
	var resultNodeCache = [];			// for recycling resultNodes
	
	function allocResultNode()
	{
		if (resultNodeCache.length)
			return resultNodeCache.pop();
		else
			return new resultNode(0, 0);
	};
	
	function freeResultNode(n)
	{
		if (resultNodeCache.length < 10000)
			resultNodeCache.push(n);
	};
	
	var workersSupported = (typeof Worker !== "undefined");
	var isInWebWorker = (typeof document === "undefined");		// no DOM in a worker
	var myInstance = null;										// single pathfinder instance for worker
	
	if (isInWebWorker)
	{
		self.addEventListener("message", function (e)
		{
			var d = e.data;
			
			if (!d)
				return;		// could be empty postMessage() to start worker
			
			if (d.cmd === "init")
			{
				if (!myInstance)
					myInstance = new pathfinder();
					
				myInstance.init(d.hcells, d.vcells, d.data, d.diagonals);
			}
			else if (d.cmd === "find")
			{
				// receive a pathfind job, process it them dispatch result
				myInstance.pathEnd.parent = null;
				myInstance.targetX = d.endX;
				myInstance.targetY = d.endY;
				
				if (myInstance.doLongFindPath(d.startX, d.startY))
				{
					self.postMessage({ cmd: "result", pathList: myInstance.pathList });
				}
				else
				{
					self.postMessage({ cmd: "result", pathList: null });
				}
			}
			else if (d.cmd === "setdiag")
			{
				// update diagonalsEnabled flag
				myInstance.diagonalsEnabled = d.diagonals;
			}
			
		}, false);
	}
	
	function pathfinder()
	{
		this.hcells = 0;
		this.vcells = 0;
		
		this.pathEnd = allocNode();
		
		this.cells = null;
		this.openList = [];
		this.closedList = [];
		this.closedCache = {};
		this.pathList = [];
		
		this.currentNode = null;
		this.targetX = 0;
		this.targetY = 0;
		this.diagonalsEnabled = true;
		
		this.worker = null;
		this.workerQueue = [];		// jobs awaiting completion from worker in order of requests made
		this.workerRecycle = [];
		
		var self = this;
		var i, len;
		
		if (workersSupported && !isInWebWorker)
		{
			// Create worker and receive results of pathfind jobs from it
			this.worker = new Worker("pathfind.js");
			
			this.worker.addEventListener("message", function (e) {
			
				if (!e || !e.data)
					return;
				
				if (e.data.cmd === "result")
				{
					if (e.data.pathList)
					{
						for (i = 0, len = self.pathList.length; i < len; i++)
							freeResultNode(self.pathList[i]);
						
						self.pathList = e.data.pathList;
						self.workerQueue[0].success();
					}
					else
						self.workerQueue[0].fail();
						
					self.workerRecycle.push(self.workerQueue.shift());
				}
			}, false);
			
			this.worker.addEventListener("error", function (e) {
				console.error(e);
			}, false);
			
			this.worker.postMessage(null);
		}
	};
	
	pathfinder.prototype.init = function (hcells_, vcells_, data_, diagonals_)
	{
		this.hcells = hcells_;
		this.vcells = vcells_;
		this.cells = data_;
		this.diagonalsEnabled = diagonals_;
		
		if (workersSupported && !isInWebWorker)
		{
			this.worker.postMessage({
				cmd: "init",
				hcells: hcells_,
				vcells: vcells_,
				diagonals: diagonals_,
				data: data_
			});
		}
	};
	
	pathfinder.prototype.isReady = function ()
	{
		return !!this.cells;
	};
	
	pathfinder.prototype.setDiagonals = function (d)
	{
		if (this.diagonalsEnabled === d)
			return;
		
		this.diagonalsEnabled = d;
		
		if (workersSupported && !isInWebWorker)
		{
			this.worker.postMessage({
				cmd: "setdiag",
				diagonals: d,
			});
		}
	};
	
	pathfinder.prototype.at = function (x_, y_)
	{
		if (x_ < 0 || y_ < 0 || x_ >= this.hcells || y_ >= this.vcells)
			return PF_OBSTACLE;
			
		return this.cells[x_][y_];
	};
	
	pathfinder.prototype.findPath = function (startX, startY, endX, endY, successCallback, failCallback)
	{
		if (!this.cells)
		{
			// not yet initialised
			failCallback();
			return;
		}
		
		startX = Math.floor(startX);
		startY = Math.floor(startY);
		endX = Math.floor(endX);
		endY = Math.floor(endY);
		
		this.targetX = endX;
		this.targetY = endY;
		this.pathEnd.parent = null;
		
		// Check the box made by the start and dest cells.
		// If the complete box is empty, allow a direct move to target.
		var minX = Math.min(startX, endX);
		var maxX = Math.max(startX, endX);
		var minY = Math.min(startY, endY);
		var maxY = Math.max(startY, endY);
		
		// Path goes out of bounds: no calculable path
		if (minX < 0 || minY < 0 || maxX >= this.hcells || maxY >= this.vcells)
		{
			failCallback();
			return;
		}
		
		var x, y, i, len, c, h, n;

		if (this.diagonalsEnabled)
		{
			var canMoveDirect = true;
			
			for (x = minX; x <= maxX; x++)
			{
				for (y = minY; y <= maxY; y++)
				{
					if (this.cells[x][y] !== 0)
					{
						canMoveDirect = false;
						
						// Break both loops
						x = maxX + 1;
						break;
					}
				}
			}

			// A "direct" path is available (box is empty)
			if (canMoveDirect)
			{
				for (i = 0, len = this.pathList.length; i < len; i++)
					freeResultNode(this.pathList[i]);
				this.pathList.length = 0;
			
				this.pathEnd.x = endX;
				this.pathEnd.y = endY;
				this.pathEnd.parent = null;
				n = allocResultNode();
				n.x = endX;
				n.y = endY;
				this.pathList.push(n);
				successCallback();
				return;
			}
		}
		
		if (workersSupported)
		{
			// recycle objects in the worker queue
			if (this.workerRecycle.length)
				h = this.workerRecycle.pop();
			else
				h = {};
			
			h.success = successCallback;
			h.fail = failCallback;
			
			// dispatch the heavy lifting to the worker thread
			this.workerQueue.push(h);

			this.worker.postMessage({
				cmd: "find",
				startX: startX,
				startY: startY,
				endX: endX,
				endY: endY
			});
		}
		else
		{
			// no web worker support, just run on main thread
			if (this.doLongFindPath(startX, startY))
				successCallback();
			else
				failCallback();
		}
	};
		
	pathfinder.prototype.doLongFindPath = function (startX, startY)
	{
		var i, len, c, n, p, lastDir = 8, curDir = -1, addNode;
		for (i = 0, len = this.openList.length; i < len; i++)
			freeNode(this.openList[i]);
		for (i = 0, len = this.closedList.length; i < len; i++)
			freeNode(this.closedList[i]);
		for (i = 0, len = this.pathList.length; i < len; i++)
			freeResultNode(this.pathList[i]);
		this.openList.length = 0;
		this.closedList.length = 0;
		this.closedCache = {};
		this.pathList.length = 0;

		// Add the start node to the open list
		var startNode = allocNode();
		startNode.x = startX;
		startNode.y = startY;

		this.openList.push(startNode);
		var obsLeft = false, obsTop = false, obsRight = false, obsBottom = false;
		var diagonals = this.diagonalsEnabled;
		
		// While there are nodes on the open list
		while (this.openList.length)
		{
			// Move the best F value to closed list
			c = this.openList.shift();
			this.closedList.unshift(c);
			this.closedCache[((c.x << 16) + c.y).toString()] = true;

			// Are we there yet?
			if (c.x === this.targetX && c.y === this.targetY)
			{
				this.pathEnd.parent = c.parent;
				this.pathEnd.x = c.x;
				this.pathEnd.y = c.y;
				
				// Link up the whole path to an indexable array
				p = this.pathEnd;
				
				while (p)
				{
					// filter redundant nodes in straight lines
					if (this.pathList.length === 0)
					{
						addNode = true;
						
						if (p.parent)
						{
							lastDir = this.nodeDirection(p, p.parent);
							curDir = lastDir;
						}
					}
					else if (!p.parent)
						addNode = false;
					else 
					{
						curDir = this.nodeDirection(p, p.parent);
						addNode = (curDir !== lastDir);
					}
					
					if (addNode)
					{
						n = allocResultNode();
						n.x = p.x;
						n.y = p.y;
						this.pathList.unshift(n);
						lastDir = curDir;
					}
					
					p = p.parent;
				}
				
				return true;
			}

			// Get current node
			this.currentNode = c;
			var x = c.x;
			var y = c.y;
			
			var obsLeft = (this.at(x - 1, y) === PF_OBSTACLE);
			var obsTop = (this.at(x, y - 1) === PF_OBSTACLE);
			var obsRight = (this.at(x + 1, y) === PF_OBSTACLE);
			var obsBottom = (this.at(x, y + 1) === PF_OBSTACLE);

			// Check adjacent 8 nodes.  No diagonals allowed if either cell being crossed is obstacle.
			if (!obsLeft)
				this.addCellToOpenList(x - 1, y, 10);

			if (diagonals && !obsLeft && !obsTop)
				this.addCellToOpenList(x - 1, y - 1, 14);

			if (!obsTop)
				this.addCellToOpenList(x, y - 1, 10);

			if (diagonals && !obsTop && !obsRight)
				this.addCellToOpenList(x + 1, y - 1, 14);

			if (!obsRight)
				this.addCellToOpenList(x + 1, y, 10);

			if (diagonals && !obsRight && !obsBottom)
				this.addCellToOpenList(x + 1, y + 1, 14);

			if (!obsBottom)
				this.addCellToOpenList(x, y + 1, 10);

			if (diagonals && !obsBottom && !obsLeft)
				this.addCellToOpenList(x - 1, y + 1, 14);
		}
		
		return false;
	};
	
	pathfinder.prototype.insertToOpenList = function (c)
	{
		var i, len;
		
		// Needs to go at end
		if (c.f >= this.openList[this.openList.length - 1].f)
		{
			this.openList.push(c);
		}
		else
		{
			for (i = 0, len = this.openList.length; i < len; i++)
			{
				if (c.f < this.openList[i].f)
				{
					this.openList.splice(i, 0, c);
					break;
				}
			}
		}
	};
	
	pathfinder.prototype.addCellToOpenList = function (x_, y_, g_)
	{
		// Ignore if cell on closed list
		if (this.closedCache.hasOwnProperty(((x_ << 16) + y_).toString()))
			return;
		
		var i, len, c;
		
		// Cell costs can be increased by changing the number in the map
		var curCellCost = this.at(x_, y_);

		// Is this cell already on the open list?
		for (i = 0, len = this.openList.length; i < len; i++)
		{
			c = this.openList[i];
			
			if (x_ === c.x && y_ === c.y)
			{
				// Is this a better path?
				if (this.currentNode.g + g_ + curCellCost < c.g)
				{
					// Update F, G and H and update parent
					c.parent = this.currentNode;
					c.g = this.currentNode.g + g_ + curCellCost;
					c.h = this.estimateH(c.x, c.y);
					c.f = c.g + c.h;

					// This node's F has changed:  Delete it then re-insert it in the right place

					if (this.openList.length === 1)
					{
						// no need to remove then re-insert same node, just leave it there
						return;
					}
					
					this.openList.splice(i, 1);
					this.insertToOpenList(c);
				}

				return;
			}
		}

		// Not on the open list; add it in the right place
		c = allocNode();
		c.x = x_;
		c.y = y_;
		c.h = this.estimateH(x_, y_);
		c.g = this.currentNode.g + g_ + curCellCost;
		c.f = c.h + c.g;
		c.parent = this.currentNode;

		// Insert this node sorted in the open list
		// The loop below won't add new largest F values
		if (!this.openList.length)
		{
			this.openList.push(c);
			return;
		}
		
		this.insertToOpenList(c);
	};
	
	function quickAbs(x)
	{
		return x < 0 ? -x : x;
	};
	
	pathfinder.prototype.estimateH = function (x_, y_)
	{
		var dx = quickAbs(x_ - this.targetX);
		var dy = quickAbs(y_ - this.targetY);

		return dx * 10 + dy * 10;
	};
	
	pathfinder.prototype.nodeDirection = function (a, b)
	{
		var ax = a.x;
		var ay = a.y;
		var bx = b.x;
		var by = b.y;

		if (ax === bx)
		{
			if (by > ay) return 6;
			if (by < ay) return 2;
			if (ay == by) return 8;
		}
		else if (ay === by)
		{
			if (bx > ax) return 4;
			if (by < ax) return 0;
		}
		else
		{
			if (bx < ax && by < ay) return 1;
			if (bx > ax && by < ay) return 3;
			if (bx < ax && by > ay) return 7;
			if (bx > ax && by > ay) return 5;
		}
		return 8;
	};
	
	if (!isInWebWorker)
	{
		window.PF_CLEAR = PF_CLEAR;
		window.PF_OBSTACLE = PF_OBSTACLE;
		window.Pathfinder = pathfinder;
		
		window.ResultNode = resultNode;
		window.allocResultNode = allocResultNode;
		window.freeResultNode = freeResultNode;
	}

})();