/*! CocoonJSExtensions - v2.0.0 - 2014-07-23 www.ludei.com */(function() {
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
     * @class
     */
    CocoonJS.Size = {
        /**
         * The horizontal size value.
         */
        width: 0,

        /**
         * The vertical size value.
         */
        height: 0
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

        subc.prototype = new CocoonJSExtendHierarchyChainClass(); // chain prototypes.
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
                try {
                    finalRet = JSON.parse(ret);
                } catch (error) {}
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
        for (var i = 0, len = parts.length; i < len; ++i) {
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
            if (dictionary[key] === value) {
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
        for (var i = 0; foundString == null && i < stringArray.length; i++) {
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
            var indexOfListener = this.listeners.indexOf(listener);
            if (indexOfListener < 0) {
                this.listeners.push(listener);
            }
        };

        this.addEventListenerOnce = function(listener) {
            if (chainFunction) {
                var f = function() {
                    chainFunction(arguments.callee.sourceListener, Array.prototype.slice.call(arguments));
                };
                f.sourceListener = listener;
                listener = f;
            }

            var cocoonJSExtensionObject = CocoonJS.getObjectFromPath(CocoonJS, cocoonJSExtensionObjectName);
            if (cocoonJSExtensionObject.nativeExtensionObjectAvailable) {
                ext[nativeExtensionObjectName].addEventListenerOnce(nativeEventName, listener);
            } else {
                var indexOfListener = this.listeners.indexOf(listener);
                if (indexOfListener < 0) {
                    this.listenersOnce.push(listener);
                }
            }
        };

        /**
         * Removes a callback function that was added to the event handler so it won't be called when the event takes place.
         * @param {function} listener The callback function to be removed from the event handler object. See the referenced Listener function documentation for more detail in each event handler object's documentation.
         */
        this.removeEventListener = function(listener) {

            if (chainFunction) {
                listener = listener.CocoonJSEventHandlerChainFunction;
                delete listener.CocoonJSEventHandlerChainFunction;
            }

            var cocoonJSExtensionObject = CocoonJS.getObjectFromPath(CocoonJS, cocoonJSExtensionObjectName);
            if (cocoonJSExtensionObject.nativeExtensionObjectAvailable) {
                ext[nativeExtensionObjectName].removeEventListener(nativeEventName, listener);
            } else {
                var indexOfListener = this.listeners.indexOf(listener);
                if (indexOfListener >= 0) {
                    this.listeners.splice(indexOfListener, 1);
                }
            }
        };

        this.notifyEventListeners = function() {
            var cocoonJSExtensionObject = CocoonJS.getObjectFromPath(CocoonJS, cocoonJSExtensionObjectName);
            var argumentsArray = Array.prototype.slice.call(arguments);
            if (cocoonJSExtensionObject && cocoonJSExtensionObject.nativeExtensionObjectAvailable) {
                ext[nativeExtensionObjectName].notifyEventListeners(nativeEventName, argumentsArray);
            } else {
                var listeners = Array.prototype.slice.call(this.listeners);
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

                _this.listenersOnce = [];
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
        currentTimeInMillis: 0,
        lastTimeInMillis: 0,
        elapsedTimeInMillis: 0,
        elapsedTimeInSeconds: 0,
        accumTimeInMillis: 0,

        /**
		Resets the timer to 0.
		*/
        reset: function() {
            this.currentTimeInMillis = this.lastTimeInMillis = new Date().getTime();
            this.accumTimeInMillis = this.elapsedTimeInMillis = this.elapsedTimeInSeconds = 0;
        },

        /**
		Updates the timer calculating the elapsed time between update calls.
		*/
        update: function() {
            this.currentTimeInMillis = new Date().getTime();
            this.elapsedTimeInMillis = this.currentTimeInMillis - this.lastTimeInMillis;
            this.elapsedTimeInSeconds = this.elapsedTimeInMillis / 1000.0;
            this.lastTimeInMillis = this.currentTimeInMillis;
            this.accumTimeInMillis += this.elapsedTimeInMillis;
        }
    };

})();;(function () {
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
     * @enum
     */
    CocoonJS.App.FPSLayout = {
        TOP_LEFT:'top-left',
        TOP_RIGHT:'top-right',
        BOTTOM_LEFT:'bottom-left',
        BOTTOM_RIGHT:'bottom-right'
    };

    /**
    * The predefined possible orientations. there can be a bit level combination of them using the OR operator.
    * @namespace
    * @enum
    */
    CocoonJS.App.Orientations = {
        PORTRAIT : 1,
        PORTRAIT_UPSIDE_DOWN : 2,
        LANDSCAPE_LEFT : 4,
        LANDSCAPE_RIGHT : 8,
        PORTRAIT : 1 | 2,
        LANDSCAPE : 4 | 8,
        BOTH : 1 | 2 | 4 | 8
    };

    /**
     * Contains all the possible values to specify the input keyboard type to be used when introducing text.
     * @namespace
     * @enum
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
     * @enum
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
     * @enum
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
     * @ignore
     * Forward service might not be available if only one JS service is included
     */
    function isNativeBridgeServiceAvailable(){
        if (CocoonJS.App.forward.nativeAvailable === 'boolean') {
            //cached value
            return CocoonJS.App.forward.nativeAvailable;
        }
        else {
            var available = CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP", "forwardAvailable", arguments);
            available = !!available;
            CocoonJS.App.forward.nativeAvailable = available;
            return available;
        }

    }

    /**
     * Makes a forward call of some javascript code to be executed in a different environment (i.e. from CocoonJS to the WebView and viceversa).
     * It waits until the code is executed and the result of it is returned === synchronous.
     * @function
     * @param {string} javaScriptCode Some JavaScript code in a string to be forwarded and executed in a different JavaScript environment (i.e. from CocoonJS to the WebView and viceversa).
     * @return {string} The result of the execution of the passed JavaScript code in the different JavaScript environment.
     */
    CocoonJS.App.forward = function (javaScriptCode) {
        if (CocoonJS.App.nativeExtensionObjectAvailable && isNativeBridgeServiceAvailable()) {
            return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP", "forward", arguments);
        }
        else {
            if (window.name == 'CocoonJS_App_ForCocoonJS_WebViewIFrame') {
                return window.parent.eval(javaScriptCode);
            }
            else {
                var frame = window.parent.frames['CocoonJS_App_ForCocoonJS_WebViewIFrame'];
                if (frame) {
                    return frame.window.eval(javaScriptCode);
                }
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
        if (CocoonJS.App.nativeExtensionObjectAvailable && isNativeBridgeServiceAvailable()) {
            if (typeof returnCallback !== 'undefined') {
                return ext.IDTK_APP.makeCallAsync("forward", javaScriptCode, returnCallback);
            }
            else {
                return ext.IDTK_APP.makeCallAsync("forward", javaScriptCode);
            }
        }
        else {
            setTimeout(function() {
                var res;
                if (window.name == 'CocoonJS_App_ForCocoonJS_WebViewIFrame') {
                    res = window.parent.eval(javaScriptCode);
                }
                else {
                    var frame = window.parent.frames['CocoonJS_App_ForCocoonJS_WebViewIFrame'];
                    if (frame) {
                        res = frame.window.eval(javaScriptCode);
                    }
                }
                typeof(returnCallback) === "function" && returnCallback.call(this, res);
            }, 1);
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
            setTimeout(function() {
                var result = prompt(message, text);
                var eventObject = result ? CocoonJS.App.onTextDialogFinished : CocoonJS.App.onTextDialogCancelled;
                eventObject.notifyEventListeners(result);
            }, 0);
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
            setTimeout(function() {
                var result = confirm(message);
                var eventObject = result ? CocoonJS.App.onMessageBoxConfirmed : CocoonJS.App.onMessageBoxDenied;
                eventObject.notifyEventListeners();
            }, 0);
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
     * Opens a given share native window to share some specific text content in any system specific social sharing options. For example, Twitter, Facebook, SMS, Mail, ...
     * @function
     * @param {string} textToShare The text content that will be shared.
     */
    CocoonJS.App.share = function(textToShare) {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP", "share", arguments, true);
        }
        else {
            // TODO: Is there something we could do to share in a browser?
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
     * When the auto lock is enabled and the application has no user input for a short period, the system puts the device into a "sleep” state where the screen dims or turns off.
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

    CocoonJS.App.addADivToDisableInput = function() {
        var div = document.createElement("div");
        div.id = "CocoonJSInputBlockingDiv";
        div.style.left = 0;
        div.style.top = 0;
        div.style.width = "100%";
        div.style.height = "100%";
        div.style.position = "absolute";
        div.style.backgroundColor = 'transparent';
        div.style.border = "0px solid #000"; 
        div.style.zIndex = 999999999;
        document.body.appendChild(div);
    };

    CocoonJS.App.removeTheDivToEnableInput = function() {
        var div = document.getElementById("CocoonJSInputBlockingDiv");
        if (div) document.body.removeChild(div);
    };

    /**
     * Disables the touch events in the CocoonJS environment.
     * @function
     */
    CocoonJS.App.disableTouchInCocoonJS = function () {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            window.ext.IDTK_APP.makeCall("disableTouchLayer", "CocoonJSView");
        }
        else if (!navigator.isCocoonJS) {
            if (!CocoonJS.App.EmulatedWebViewIFrame) {
                CocoonJS.App.forwardEventsToCocoonJSEnabled = false;
                CocoonJS.App.forwardAsync("CocoonJS && CocoonJS.App && CocoonJS.App.disableTouchInCocoonJS();");
            }
            else {
                // CocoonJS.App.addADivToDisableInput();
            }
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
        else if (!navigator.isCocoonJS) {
            if (!CocoonJS.App.EmulatedWebViewIFrame) {
                CocoonJS.App.forwardEventsToCocoonJSEnabled = true;
                CocoonJS.App.forwardAsync("CocoonJS && CocoonJS.App.enableTouchInCocoonJS();");
            }
            else {
                // CocoonJS.App.removeTheDivToEnableInput();
            }
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
        else if (!navigator.isCocoonJS) {
            if (!CocoonJS.App.EmulatedWebViewIFrame) {
                CocoonJS.App.addADivToDisableInput();
            }
            else {
                CocoonJS.App.forwardAsync("CocoonJS && CocoonJS.App.disableTouchInTheWebView();");
            }
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
        else if (!navigator.isCocoonJS) {
            if (!CocoonJS.App.EmulatedWebViewIFrame) {
                CocoonJS.App.removeTheDivToEnableInput();
            }
            else {
                CocoonJS.App.forwardAsync("CocoonJS && CocoonJS.App.enableTouchInTheWebView();");
            }
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
                        return CocoonJS.App.forward(jsCode);
                    });
                    _this.__defineGetter__(attributeName, function () {
                        var jsCode = "CocoonJS.App.getDestinationProxyObjectAttribute(" + JSON.stringify(typeName) + ", " + _this._cocoonjs_proxy_object_data.id + ", " + JSON.stringify(attributeName) + ");";
                        return CocoonJS.App.forward(jsCode);
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
    };

    /**
     * Takes down the proxification of a type and restores it to it's original type. Do not worry if you pass a type name that is not proxified yet. The
     * function will handle it correctly for compativility reasons.
     * @param {string} typeName The name of the type to be deproxified (take down the proxification and restore the type to it's original state)
     */
    CocoonJS.App.takedownOriginProxyType = function (typeName) {
        var parentObject = window;
        if (parentObject[typeName] && parentObject[typeName]._cocoonjs_proxy_type_data) {
            parentObject[typeName] = parentObject[typeName]._cocoonjs_proxy_type_data.originalType;
        }
    };

    /**
     * Deletes everything related to a proxy object in both environments. Do not worry of you do not pass a proxified object to the
     * function. For compatibility reasons, you can still have calls to this function even when no poxification of a type has been done.
     * @param {object} object The proxified object to be deleted.
     */
    CocoonJS.App.deleteOriginProxyObject = function (object) {
        var parentObject = window;
        if (object && object._cocoonjs_proxy_object_data) {
            parentObject[object._cocoonjs_proxy_object_data.typeName]._cocoonjs_proxy_type_data.deleteProxyObject(object);
        }
    };

    /**
     * @ignore
     * NOTE: This function should never be directly called. It will be called from the destination environment whenever it is needed to work with proxy objects.
     * It calls the origin proxy object when an event handler need to be updated/called from the destination environment.
     * @param {string} typeName The type name of the proxified type.
     * @param {number} id The id of the proxy object.
     * @param {string} eventHandlerName The name of the event handler to be called.
     */
    CocoonJS.App.callOriginProxyObjectEventHandler = function (typeName, id, eventHandlerName) {
        var parentObject = window;
        parentObject[typeName]._cocoonjs_proxy_type_data.callProxyObjectEventHandler(id, eventHandlerName);
    };

    /**
     * @ignore
     * NOTE: This function should never be directly called. It will be called from the destination environment whenever it is needed to work with proxy objects.
     * It calls the origin proxy object when all the event listeners related to a specific event need to be updated/called from the destination environment.
     * @param {string} typeName The type name of the proxified type.
     * @param {number} id The id of the proxy object.
     * @param {string} eventTypeName The name of the event type to call the listeners related to it.
     */
    CocoonJS.App.callOriginProxyObjectEventListeners = function (typeName, id, eventTypeName) {
        var parentObject = window;
        parentObject[typeName]._cocoonjs_proxy_type_data.callProxyObjectEventListeners(id, eventTypeName);
    };

    /**
     * @ignore
     * NOTE: This function should never be directly called. It will be called from the origin environment whenever it is needed to work with proxy objects.
     * Setups all the structures that are needed to proxify a destination type to an origin type.
     * @param {string} typeName The name of the type to be proxified.
     * @param {array} eventHandlerNames An array with al the event handlers to be proxified. Needed in order to be able to create callbacks for all the event handlers
     * and call to the CocoonJS counterparts accordingly.
     */
    CocoonJS.App.setupDestinationProxyType = function (typeName, eventHandlerNames) {
        var parentObject = window;

        // Add a cocoonjs structure to the destination proxified type to store some useful information like all the proxy instances that are created, plus the id counter 
        // and the names of all the event handlers and some utility functions.
        parentObject[typeName]._cocoonjs_proxy_type_data =
        {
            nextId:0,
            proxyObjects:{},
            eventHandlerNames:eventHandlerNames
        }
    };

    /**
     * @ignore
     * NOTE: This function should never be directly called. It will be called from the origin environment whenever it is needed to work with proxy objects.
     * Takes down the proxy type at the destination environment. Just removes the data structure related to proxies that was added to the type when proxification tool place.
     * @param {string} typeName The name of the type to take the proxification down.
     */
    CocoonJS.App.takedownDestinationProxyType = function (typeName) {
        var parentObject = window;
        if (parent[typeName] && parentObject[typeName]._cocoonjs_proxy_type_data) {
            delete parentObject[typeName]._cocoonjs_proxy_type_data;
        }
    };

    /**
     * @ignore
     * NOTE: This function should never be directly called. It will be called from the original environment whenever it is needed to work with proxy objects.
     * Creates a new destination object instance and generates a id to reference it from the original environment.
     * @param {string} typeName The name of the type to be proxified and to generate an instance.
     * @return The id to be used from the original environment to identify the corresponding destination object instance.
     */
    CocoonJS.App.newDestinationProxyObject = function (typeName) {
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
    };

    /**
     * @ignore
     * NOTE: This function should never be directly called. It will be called from the origin environement whenever it is needed to work with proxy objects.
     * Calls a function of a destination object idetified by it's typeName and id.
     * @param {string} typeName The name of the type of the proxy.
     * @param {number} id The id of the proxy object.
     * @param {string} functionName The name of the function to be called.
     * @return Whatever the function call returns.
     */
    CocoonJS.App.callDestinationProxyObjectFunction = function (typeName, id, functionName) {
        var parentObject = window;
        var argumentsArray = Array.prototype.slice.call(arguments);
        argumentsArray.splice(0, 3);
        var proxyObject = parentObject[typeName]._cocoonjs_proxy_type_data.proxyObjects[id];
        var result = proxyObject[functionName].apply(proxyObject, argumentsArray);
        return result;
    };

    /**
     * @ignore
     * NOTE: This function should never be directly called. It will be called from the original environment whenever it is needed to work with proxy objects.
     * Sets a value to the corresponding attributeName of a proxy object represented by it's typeName and id.
     * @param {string} typeName The name of the type of the proxy.
     * @param {number} id The id of the proxy object.
     * @param {string} attributeName The name of the attribute to be set.
     * @param {unknown} attributeValue The value to be set to the attribute.
     */
    CocoonJS.App.setDestinationProxyObjectAttribute = function (typeName, id, attributeName, attributeValue) {
        var parentObject = window;
        var proxyObject = parentObject[typeName]._cocoonjs_proxy_type_data.proxyObjects[id];
        proxyObject[attributeName] = attributeValue;
    };

    /**
     * @ignore
     * NOTE: This function should never be directly called. It will be called from the original environment whenever it is needed to work with proxy objects.
     * Retrieves the value of the corresponding attributeName of a proxy object represented by it's typeName and id.
     * @param {string} typeName The name of the type of the proxy.
     * @param {number} id The id of the proxy object.
     * @param {string} attributeName The name of the attribute to be retrieved.
     */
    CocoonJS.App.getDestinationProxyObjectAttribute = function (typeName, id, attributeName) {
        var parentObject = window;
        var proxyObject = parentObject[typeName]._cocoonjs_proxy_type_data.proxyObjects[id];
        return proxyObject[attributeName];
    };

    /**
     * @ignore
     * NOTE: This function should never be directly called. It will be called from the original environment whenever it is needed to work with proxy objects.
     * Deletes a proxy object identifying it using it's typeName and id. Deleting a proxy object mainly means to remove the instance from the global structure
     * that hold all the instances.
     * @param {string} typeName The name of the type of the proxy.
     * @param {number} id The id of the proxy object.
     */
    CocoonJS.App.deleteDestinationProxyObject = function (typeName, id) {
        var parentObject = window;
        delete parentObject[typeName]._cocoonjs_proxy_type_data.proxyObjects[id];
    };

    /**
     * @ignore
     * NOTE: This function should never be directly called. It will be called from the original environment whenever it is needed to work with proxy objects.
     */
    CocoonJS.App.addDestinationProxyObjectEventListener = function (typeName, id, eventTypeName) {
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
     *
     * @constructor
     */
    CocoonJS.App.WebDialog = function() {

        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            this.webDialogID = window.ext.IDTK_APP.makeCall("createWebDialog");
        }
        else {
            var iframe = document.createElement("iframe");
            iframe.id = "CocoonJSWebDialogIFrame";
            iframe.name = "CocoonJSWebDialogIFrame";
            iframe.style.cssText = "position:fixed;left:0;top:0;bottom:0;right:0; width:100%; height:100%;margin:0;padding:0;";
            var me = this;
            iframe.onload = function(){
                me.iframeloaded = true;
                var js = "CocoonJS = {}; CocoonJS.WebDialog = {}; CocoonJS.WebDialog.close = function()" +
                    "{" +
                    "   window.parent.CocoonJSCloseWebDialog();" +
                    "};";
                me.evalIframe(js);
                for (var i = 0; i < me.pendingEvals.length; ++i) {
                    me.evalIframe(me.pendingEvals[i]);
                }
                me.pendingEvals = [];
            }
            iframe.onerror = function(){
                me.close();
            }
            this.iframe = iframe;
            this.pendingEvals = [];

            window.CocoonJSCloseWebDialog = function() {
               me.close();
            }
        }

    }

    CocoonJS.App.WebDialog.prototype = {

        show: function(url, callback) {
            this.closeCallback = function() {
                CocoonJS.App.enableTouchInCocoonJS();
                if (callback)
                    callback();
            }
            if (CocoonJS.App.nativeExtensionObjectAvailable) {
                CocoonJS.App.disableTouchInCocoonJS();
                return window.ext.IDTK_APP.makeCallAsync("showWebDialog", this.webDialogID, url, this.closeCallback);
            }
            else {
                this.iframe.src = url;
                document.body.appendChild(this.iframe);
            }

        },
        close: function() {
            if (CocoonJS.App.nativeExtensionObjectAvailable) {
                return window.ext.IDTK_APP.makeCallAsync("closeWebDialog", this.webDialogID);
            }
            else {
                if (this.iframe.parentNode) {
                    this.iframe.parentNode.removeChild(this.iframe);
                }
            }
            if (this.closeCallback)
                this.closeCallback();
        },
        evalIframe: function(js) {
            window.frames["CocoonJSWebDialogIFrame"].eval(js);
        },
        eval: function(js) {
            if (CocoonJS.App.nativeExtensionObjectAvailable) {
                return window.ext.IDTK_APP.makeCallAsync("evalWebDialog", this.webDialogID, js);
            }
            else {
                if (this.iframeloaded)
                    this.evalIframe(js);
                else
                    this.pendingEvals.push(js);
            }
        }

    };


    /**
    * Retrieves the preferred orientation that has been set in the system.
    * @return {number} The preferred orientation in the system as a combination of the possible {@link CocoonJS.App.Orientations}
    */
    CocoonJS.App.getPreferredOrientation = function() {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            return window.ext.IDTK_APP.makeCall("getPreferredOrientation");
        }
        else {
            return 0;
        }
    };

    /**
    * Sets the preferred orientation in the system.
    * @param {number} preferredOrientation The preferred orientation to be set. A combinatio of the possible {@link CocoonJS.App.Orientations}
    */
    CocoonJS.App.setPreferredOrientation = function(preferredOrientation) {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            window.ext.IDTK_APP.makeCall("setPreferredOrientation", preferredOrientation);
        }
    }

    /**
    * Queries if a file exists in the specified path and storage type. If none or unknown storage type is specified, the TEMPORARY_STORAGE is used as default.
    * @param {string} path The relative path to look for inside the storage of the underlying system.
    * @param {CocoonJS.App.StorageType} storageType The storage type where to look for the specified path inside the system.
    */
    CocoonJS.App.existsPath = function(path, storageType) {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            return window.ext.IDTK_APP.makeCall("existsPath", path, storageType);
        }
        return false;
    }

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
     * This {@link CocoonJS.EventHandler} object allows listening to events called when the application is suspending.
     * The callback function does not receive any parameter.
     * @event
     * @static
     * @memberOf CocoonJS.App
     */
    CocoonJS.App.onSuspending = new CocoonJS.EventHandler("IDTK_APP", "App", "onsuspending");

    /**
     * This {@link CocoonJS.EventHandler} object allows listening to events called when the application is activated.
     * The callback function does not receive any parameter.
     * @event
     * @static
     * @memberOf CocoonJS.App
     */
    CocoonJS.App.onActivated = new CocoonJS.EventHandler("IDTK_APP", "App", "onactivated");

})();
;(function()
{
    if (typeof window.CocoonJS === 'undefined' || window.CocoonJS === null) throw("The CocoonJS object must exist and be valid before adding more functionalities to an extension.");
    if (typeof window.CocoonJS.App === 'undefined' || window.CocoonJS.App === null) throw("The CocoonJS.App object must exist and be valid before adding more functionalities to it.");

    /**
    * This namespace represents all the basic functionalities available in the CocoonJS extension API.
    * @namespace
    */
    CocoonJS.App = CocoonJS.App ? CocoonJS.App : {};

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

    function checkEmulatedWebViewReady() {
        var emulatedWB = CocoonJS.App.EmulatedWebView;
        if (emulatedWB) {
            return; //ready
        }

        emulatedWB = document.createElement('div'); 
        emulatedWB.setAttribute('id', 'CocoonJS_App_ForCocoonJS_WebViewDiv'); 
        emulatedWB.style.width = 0; 
        emulatedWB.style.height = 0; 
        emulatedWB.style.position = "absolute"; 
        emulatedWB.style.left = 0; 
        emulatedWB.style.top = 0;
        emulatedWB.style.backgroundColor = 'transparent';
        emulatedWB.style.border = "0px solid #000"; 

        var frame = document.createElement("IFRAME");
        frame.setAttribute('id', 'CocoonJS_App_ForCocoonJS_WebViewIFrame');
        frame.setAttribute('name', 'CocoonJS_App_ForCocoonJS_WebViewIFrame');
        frame.style.width = 0; 
        frame.style.height = 0; 
        frame.frameBorder = 0;
        frame.allowtransparency = true;

        emulatedWB.appendChild(frame);
        CocoonJS.App.EmulatedWebView = emulatedWB;
        CocoonJS.App.EmulatedWebViewIFrame = frame;

        if(!document.body) {
            document.body = document.createElement("body");
        }
        document.body.appendChild(CocoonJS.App.EmulatedWebView);
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
        if (navigator.isCocoonJS && CocoonJS.App.nativeExtensionObjectAvailable)
        {
            CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP", "loadInTheWebView", arguments)
        }
        else
        {
            var xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function(event) {
                if (xhr.readyState === 4)
                {
                    if ((xhr.status >= 200 && xhr.status <=299) || xhr.status === 0)
                    {

                        checkEmulatedWebViewReady();
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
                    else
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
        if (CocoonJS.App.nativeExtensionObjectAvailable && navigator.isCocoonJS)
        {
            CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP", "reloadWebView", arguments);
        }
        else
        {
            checkEmulatedWebViewReady();
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
        if (CocoonJS.App.nativeExtensionObjectAvailable && navigator.isCocoonJS)
        {
            CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP", "showTheWebView", arguments)
        }
        else
        {
            checkEmulatedWebViewReady();
            CocoonJS.App.EmulatedWebViewIFrame.style.width = (width ? width/window.devicePixelRatio : window.innerWidth)+'px';
            CocoonJS.App.EmulatedWebViewIFrame.style.height = (height ? height/window.devicePixelRatio : window.innerHeight)+'px';
            CocoonJS.App.EmulatedWebView.style.left = (x ? x : 0)+'px';
            CocoonJS.App.EmulatedWebView.style.top = (y ? y : 0)+'px';
            CocoonJS.App.EmulatedWebView.style.width = (width ? width/window.devicePixelRatio : window.innerWidth)+'px';
            CocoonJS.App.EmulatedWebView.style.height = (height ? height/window.devicePixelRatio : window.innerHeight)+'px';
            CocoonJS.App.EmulatedWebView.style.display = "block";

            console.log(CocoonJS.App.EmulatedWebViewIFrame.style.cssText);
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
            checkEmulatedWebViewReady();
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
     * Setups the internal text texture cache size.
     * The CocoonJS Canvas+ environment is very inefficient when it comes to drawing texts.
     * In order to improve the performance, a text texture cache is used internally. Once a text is drawn
     * a texture is stored that matches that text and that text configuration. If the same text is called to 
     * be drawn, this cached texture would be used. 
     * This function allows to set the size of the cache. A value of 0 would mean that no cache
     * will be used. 
     * @param size The size of the text cache.
     */
    CocoonJS.App.setTextCacheSize = function (size) {
        if (CocoonJS.App.nativeExtensionObjectAvailable) {
            return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP", "setTextCacheSize", arguments);
        }
    }

    CocoonJS.App.forwardedEventFromTheWebView = function(eventName, eventDataString) {
        var eventData = JSON.parse(eventDataString);
        eventData.target = window;
        var event = new Event(eventName);
        for (var att in eventData) {
            event[att] = eventData[att];
        }
        event.target = window;
        window.dispatchEvent(event);
        var canvases = document.getElementsByTagName("canvas");
        for (var i = 0; i < canvases.length; i++) {
            event.target = canvases[i];
            canvases[i].dispatchEvent(event);
        }
    }

    
})();
;(function(){
    if (typeof window.CocoonJS === 'undefined' || window.CocoonJS === null) throw("The CocoonJS object must exist and be valid before adding more functionalities to an extension.");
    if (typeof window.CocoonJS.App === 'undefined' || window.CocoonJS.App === null) throw("The CocoonJS.App object must exist and be valid before adding more functionalities to it.");
    if (navigator.isCocoonJS) return;

    /**
    * This namespace represents all the basic functionalities available in the CocoonJS extension API.
    * @namespace
    */
    CocoonJS.App = CocoonJS.App ? CocoonJS.App : {};

    CocoonJS.App.nativeExtensionObjectAvailable = CocoonJS.App.nativeExtensionObjectAvailable;

    /**
    * Shows a transparent WebView on top of the CocoonJS hardware accelerated environment rendering context.
    * @function
    * @param {number} [x] The horizontal position where to show the WebView.
    * @param {number} [y] The vertical position where to show the WebView.
    * @param {number} [width] The horitonzal size of the WebView.
    * @param {number} [height] the vertical size of the WebView.
    */
    CocoonJS.App.show = function(x, y, width, height)
    {
        if (CocoonJS.App.nativeExtensionObjectAvailable)
        {
           return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP", "show", arguments);
        }
        else
        {
            var div = window.parent.document.getElementById('CocoonJS_App_ForCocoonJS_WebViewDiv');
            div.style.left = (x ? x : div.style.left)+'px';
            div.style.top = (y ? y : div.style.top)+'px';
            div.style.width = (width ? width/window.devicePixelRatio : window.parent.innerWidth)+'px';
            div.style.height = (height ? height/window.devicePixelRatio : window.parent.innerHeight)+'px';
            div.style.display = "block";
            var iframe = window.parent.document.getElementById('CocoonJS_App_ForCocoonJS_WebViewIFrame');
            iframe.style.width = (width ? width/window.devicePixelRatio : window.parent.innerWidth)+'px';
            iframe.style.height = (height ? height/window.devicePixelRatio : window.parent.innerHeight)+'px';
        }
    };

    /**
    * Hides the transparent WebView on top of the CocoonJS hardware acceleration environment rendering contect.
    * @function
    */
    CocoonJS.App.hide = function()
    {
        if (CocoonJS.App.nativeExtensionObjectAvailable)
        {
           return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP", "hide", arguments);
        }
        else
        {
            window.parent.document.getElementById('CocoonJS_App_ForCocoonJS_WebViewDiv').style.display = "none";
        }
    };

    /**
    * Loads a resource in the CocoonJS environment from the CocoonJS environment. 
    * @function
    * @param {string} path The path to the resource. It can be a remote URL or a path to a local file.
    * @param {CocoonJS.App.StorageType} [storageType] An optional parameter to specify at which storage in the device the file path is stored. By default, APP_STORAGE is used.
    * @see CocoonJS.App.load
    */
    CocoonJS.App.loadInCocoonJS = function(path, storageType)
    {
        if (CocoonJS.App.nativeExtensionObjectAvailable)
        {
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
        else
        {
            CocoonJS.App.forwardAsync("CocoonJS.App.load('" + path + "');");
        }
    };

    /**
     * Reloads the last loaded path in the CocoonJS context.
     * @function
     */
    CocoonJS.App.reloadCocoonJS = function()
    {
        if (CocoonJS.App.nativeExtensionObjectAvailable)
        {
            return CocoonJS.App.forwardAsync("ext.IDTK_APP.makeCall('reload');");
        }
        else if (!navigator.isCocoonJS)
        {
            window.parent.location.reload();
        }
    };

    /**
    * This function allows to forward console messages from the WebView to the CocoonJS
    * debug console. What it does is to change the console object for a new one
    * with all it's methods (log, error, info, debug and warn) forwarding their
    * messages to the CocoonJS environment.
    * The original console object is stored in the CocoonJS.App.originalConsole property.
    * @function
    */
    CocoonJS.App.proxifyConsole = function() 
    {
        if (!CocoonJS.nativeExtensionObjectAvailable) return;

        if (typeof CocoonJS.App.originalConsole === 'undefined')
        {
            CocoonJS.App.originalConsole = window.console;
        }
        var functions = ["log", "error", "info", "debug", "warn"];

        var newConsole = {};
        for (var i = 0; i < functions.length; i++)
        {
            newConsole[functions[i]] = function(functionName)
            {
                return function(message)
                {
                    var jsCode = "console." + functionName + "(" + JSON.stringify(message) + ");";
                    CocoonJS.App.originalConsole.log(jsCode);
                    ext.IDTK_APP.makeCallAsync("forward", jsCode);
                };
            }(functions[i]);
        }
        if (!newConsole.assert) {
            newConsole.assert = function assert() {
                if (arguments.length > 0 && !arguments[0]) {
                    var str = 'Assertion failed: ' + (arguments.length > 1 ? arguments[1] : '');
                    newConsole.error(str);
                }
            }
        }        
        window.console = newConsole;
    };

    /**
    * This function restores the original console object and removes the proxified console object.
    * @function
    */
    CocoonJS.App.deproxifyConsole = function()
    {
        if (window.navigator.isCocoonJS || !CocoonJS.nativeExtensionObjectAvailable) return;
        if (typeof CocoonJS.App.originalConsole !== 'undefined')
        {
            window.console = CocoonJS.App.originalConsole;
            CocoonJS.App.originalConsole = undefined;
        }
    };

    /**
    * Everytime the page is loaded, proxify the console.
    * @ignore
    */
    window.addEventListener("load", function()
    {
        CocoonJS.App.proxifyConsole();

        // Only if we are completely outside CocoonJS (or CocoonJS' webview),
        // setup event forwarding from the webview (iframe) to CocoonJS.
        if (!CocoonJS.App.nativeExtensionObjectAvailable) {
            CocoonJS.App.forwardEventsToCocoonJSEnabled = true;
            var EVENT_ATTRIBUTES = [ 'timeStamp', 'button', 'type', 'x', 'y', 'pageX', 'pageY', 'clientX', 'clientY', 'offsetX', 'offsetY'];
            var EVENTS = [ "dblclick", "touchmove", "mousemove", "touchend", "touchcancel", "mouseup", "touchstart", "mousedown", "release", "dragleft", "dragright", "swipeleft", "swiperight" ];
            function forwardEventToCocoonJS(eventName, event) {
                var eventData = {};
                var att, i;
                for (var att in event) {
                    i = EVENT_ATTRIBUTES.indexOf(att);
                    if (i >= 0) {
                        eventData[att] = event[att];
                    }
                }
                var jsCode = "CocoonJS && CocoonJS.App && CocoonJS.App.forwardedEventFromTheWebView && CocoonJS.App.forwardedEventFromTheWebView(" + JSON.stringify(eventName) + ", '" + JSON.stringify(eventData) + "');";
                CocoonJS.App.forward(jsCode);
            }
            for (i = 0; i < EVENTS.length; i++) {
                window.addEventListener(EVENTS[i], (function(eventName) {
                    return function(event) {
                        if (CocoonJS.App.forwardEventsToCocoonJSEnabled) {
                            forwardEventToCocoonJS(eventName, event);
                        }
                    };
                })(EVENTS[i]));
            }
        }

    });

    /**
     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.App.onLoadInCocoonJSSucceed} event calls.
     * @name OnLoadInCocoonJSSucceedListener
     * @function
     * @static
     * @memberOf CocoonJS.App
     * @param {string} pageURL The URL of the page that had been loaded in CocoonJS.
     */
    /**
    * This {@link CocoonJS.EventHandler} object allows listening to events called when the CocoonJS load has completed successfully.
    * The callback function's documentation is represented by {@link CocoonJS.App.OnLoadInCocoonJSSucceedListener}
    * @event
    * @static
    * @memberOf CocoonJS.App
    * @param {string} pageURL A string that represents the page URL loaded.
    */
    CocoonJS.App.onLoadInCocoonJSSucceed = new CocoonJS.EventHandler("IDTK_APP", "App", "forwardpageload");

    /**
     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.App.onLoadInCocoonJSFailed} event calls.
     * @name OnLoadInCocoonJSFailedListener
     * @function
     * @static
     * @memberOf CocoonJS.App
     * @param {string} pageURL The URL of the page that had been loaded in CocoonJS.
     */
    /**
    * This {@link CocoonJS.EventHandler} object allows listening to events called when the CocoonJS load fails.
    * The callback function's documentation is represented by {@link CocoonJS.App.OnLoadInCocoonJSFailedListener}
    * @event
    * @static
    * @memberOf CocoonJS.App
    */
    CocoonJS.App.onLoadInCocoonJSFailed = new CocoonJS.EventHandler("IDTK_APP", "App", "forwardpagefail");

})();;(function()
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

})();;(function() {

    // The CocoonJS must exist before creating the extension.
    if (typeof window.CocoonJS === 'undefined' || window.CocoonJS === null) throw("The CocoonJS object must exist and be valid before creating any extension object.");

    /**
     * @namespace
     */
    CocoonJS.Social = {};

    /**
     * This class provides an abstraction API for all the Social Services
     * Each Social service has it's own official API but can also be used within this API interface
     * @class
     */
    CocoonJS.Social.SocialService = function() {
        /**
         * This {@link CocoonJS.EventHandler} object allows listening to events called when the user login status changes
         * The callback parameters: loggedIn status (boolean) and error
         * @memberOf CocoonJS.Social.SocialService
         */
        this.onLoginStatusChanged = new CocoonJS.EventHandler("", "dummy", "onLoginStatusChanged");

        return this;
    }

    CocoonJS.Social.SocialService.prototype = {

        /**
         * Check if the user is logged in.
         * @return {boolean} true if the user is still logged in, false otherwise.
         */
        isLoggedIn: function() {
             return false;
        },

        /**
         * Authenticate the user
         * @param {function} callback. The callback function. Response params: loggedIn(boolean) and error
         */
        login : function(callback) {
            if (callback)
                callback(false, {message:"Not implemented!"});
        },

        /**
         * Log the user out of your application.
         * @param {function} [callback] The callback function. Response params: error
         */
        logout: function(callback) {
            if (callback)
                callback({message:"Not implemented!"});
        },

        /**
         * Returns the information of the currently logged in user.
         * @return {@link CocoonJS.Social.User}
         */
        getLoggedInUser : function() {
            return null;
        },

        /**
         * Checks if the current logged in user has publish permissions
         * @param callback The callback function. Response params: permissions granted and error
         */
        hasPublishPermissions: function(callback) {
            callback(true);
        },

        /**
         * Requests publish permissions for the current logged in user
         * @param callback The callback function. Response params: granted and error
         */
        requestPublishPermissions: function(callback) {
            if (callback)
                callback(true, null);
        },
        /**
         * Retrieves user information for a specific user ID.
         * @param {function} callback The callback function. Response params: {@link CocoonJS.Social.User} and error.
         * @param {string} [userID] The id of the user to retrieve the information from. If no userID is specified, the currently logged in user is assumed.
         */
        requestUser: function(callback, userID) {
            callback(null, {message:"Not implemented!"});
        },
        /**
         * Request to retrieve the profile image of a user
         * @param {function} callback The callback function. Response params: ImageURL and error.
         * @param {string} [userID] The id of the user to get the image for. If no userID is specified, the currently logged user is used.
         * @param {CocoonJS.Social.ImageSize} [imageSize] The desired size of the image. Default value: SMALL.
         */
        requestUserImage : function(callback, userID, imageSize) {
            callback("", {message:"Not implemented!"})
        },

        /**
         * Retrieves user friends for a specific user ID.
         * @param {function} callback The callback function. Response params: Array of {@link CocoonJS.Social.User} and error.
         * @param {string} [userID] The id of the user to retrieve the information from. If no userID is specified, the currently logged in user is assumed.
         */
        requestFriends: function(callback, userID) {
            callback([], {message:"Not implemented!"});
        },

        /**
         * Shares a message without the intervention of the user
         * This action might require publish permissions. If the user has not publish permissions they are automatically requested.
         * @param {CocoonJS.Social.Message} message A object representing the information to be published.
         * @param {function} [callback] The callback function. Response params: error
         */
        publishMessage: function(message, callback) {
            callback({message:"Not implemented!"});
        },

        /**
         * Presents a native/web dialog that allows the user to share a message
         * @param {CocoonJS.Social.Message} message A object representing the information to be published.
         * @param {function} [callback] The callback function. Response params: error
         */
        publishMessageWithDialog: function(message, callback) {
            callback({message:"Not implemented!"});
        }
    }


    /**
     * This class extends the Social Service API with an extended Social Gaming abstraction API (achievements, leaderboards, etc.)
     * @class
     */
    CocoonJS.Social.SocialGamingService = function() {
        CocoonJS.Social.SocialGamingService.superclass.constructor.call(this);
        return this;
    }

    CocoonJS.Social.SocialGamingService.prototype = {

        _cachedAchievements: null,
        _achievementsMap: null,
        _leaderboardsTemplate: null,
        _achievementsTemplate: null,

        /**
         * Retrieves the score for a user from a specific leaderboard
         * @param {function} callback The callback function. Response params: {@link CocoonJS.Social.Score} and error.
         * @param {CocoonJS.Social.ScoreParams} [params] The params to retrieve the score. If no params are specified, the currently logged in user and the default leaderboard are assumed.
         */
        requestScore: function(callback, params) {
            callback(null, {message:"Not implemented!"})
        },

        /**
         * Submits the score for a user to a specific leaderboard
         * @param {number} score the score to submit
         * @param {function} [callback] The callback function. Response params: error.
         * @param {CocoonJS.Social.ScoreParams} [params] The params to submit the score. If no params are specified, the currently logged in user and the default leaderboard are assumed.
         */
        submitScore: function(score, callback, params ) {
            if (callback)
                callback({message:"Not implemented!"})
        },

        /**
         * Shows a modal leaderboard view using a platform dependant view.
         * @param {CocoonJS.Social.ScoreParams} [params] The params to choose the leaderboard and other settings. If no params are specified the default leaderboard id and settings will be assumed.
         * @param {function} [callback] The callback function invoked when the modal leaderboard view is closed by the user. Response params: error.
         * @see setTemplates
         */
        showLeaderboard : function(callback, params) {
            if (callback)
                callback({message:"Not implemented!"})
        },

        /**
         * Retrieves all the achievements of the application.
         * @param {function} callback The callback function. Response params: array of {@link CocoonJS.Social.Achievement} and error.
         */
        requestAllAchievements : function(callback) {
            callback([], {message:"Not implemented!"})
        },

        /**
         * Retrieves the achievements earned by a user.
         * @param {function} callback The callback function. Response params: array of {@link CocoonJS.Social.Achievement} and error.
         * @param {string} [userId] The id of the user to retrieve the information from. If no userID is specified, the currently logged in user is assumed.
         */
        requestAchievements : function(callback, userID) {
            callback([], {message:"Not implemented!"})
        },
        /**
         * Submits the achievement for the current logged In user
         * @param achievementID The achievement ID to submit
         * @param callback [callback] The callback function. Response params: error.
         */
        submitAchievement: function(achievementID, callback) {
            if (callback)
                callback({message:"Not implemented!"})
        },
        /**
         * Resets all the achievements of the current logged in user
         * @param {function} [callback] The callback function. Response params: error.
         */
        resetAchievements : function(callback) {
            if (callback)
                callback([], {message:"Not implemented!"})
        },
        /**
         * Shows a modal achievements view using a platform dependant view.
         * @param {function} [callback] The callback function invoked when the modal achievements view is closed by the user. Response params: error.
         * @see setTemplates
         */
        showAchievements : function(callback) {
            if (!this._achievementsTemplate)
                throw "Please, provide a html template for achievements with the setTemplates method";
            var dialog = new CocoonJS.App.WebDialog();
            var callbackSent = false;
            dialog.show(this._achievementsTemplate, function(error) {
                dialog.closed = true;
                if (!callbackSent && callback)
                    callback(error);
            });
            var me = this;
            this.requestAchievements(function(achievements, error){
                if (dialog.closed)
                    return;
                if (error) {
                    callbackSent = true;
                    if (callback)
                        callback(error);
                    return;
                }

                var achs = [];
                if (me._cachedAchievements) {
                    for (var i = 0; i < me._cachedAchievements.length; ++i) {
                        var ach = me._cachedAchievements[i];
                        achs.push(ach);
                        if (achievements && achievements.length) {
                            for (var j = 0; j< achievements.length; ++j) {
                                if (achievements[j].achievementID === ach.achievementID) {
                                    ach.achieved = true;
                                    break;
                                }
                            }
                        }
                    }
                }
                var js = "addAchievements(" + JSON.stringify(achs) + ");";
                dialog.eval(js);
            });
        },

        /**
         * Set the map for using custom achievement IDs.
         * The map must be a customID to realID map (accessing map.customID must return the real achievement ID)
         * Whenever this map is enabled users are able to submit achievements with the real achievement ID or with the custom one.
         * @params {object} map The achievements map. A null map disables this feature.
         */
        setAchievementsMap: function(map) {
            this._achievementsMap = map;
            if (this._cachedAchievements) {
               this.syncAchievementsMap(this._cachedAchievements);
            }
        },

        /**
         * Provides some templates to be used in the leaderboards and achievements views
         * Some social services (like Facebook) don't have a native view to show achievements or leaderboards views, and use html templates instead
         * @param {string} leaderboardsTemplate relative path to the leaderboards template
         * @param {string} achievementsTemplate relative path to the achievements template
         * @see showAchievements
         * @see showLeaderboard
         */
        setTemplates: function(leaderboardsTemplate, achievementsTemplate) {
            this._leaderboardsTemplate = leaderboardsTemplate;
            this._achievementsTemplate = achievementsTemplate;
        },

        //Internal utility methods

        /**
         * @ignore
         */
        setCachedAchievements: function(achievements) {
            this._cachedAchievements = achievements;
            if (achievements && this._achievementsMap) {
                this.syncAchievementsMap(this._cachedAchievements);
            }
        },

        /**
         * @ignore
         */
        findAchievement: function(id) {
            if (!this._cachedAchievements)
                return null;
            for (var i = 0; i < this._cachedAchievements.length; ++i) {
                if (id === this._cachedAchievements[i].achievementID) {
                    return this._cachedAchievements[i];
                }
            }
            return null;
        },

        /**
         * @ignore
         */
        translateAchievementID: function(id) {
            if (this._achievementsMap) {
                for (var customID in this._achievementsMap) {
                    if (customID == id) { //important: compare with double equal, because id can be numeric
                        return this._achievementsMap[customID];
                    }
                }
            }
            return id;
        },
        /**
         * @ignore
         * @param {array} achievements array of achievements
         */
        syncAchievementsMap: function(achievements) {
            if (!this._achievementsMap)
                return;
            for (var i = 0; i< achievements.length; ++i) {
                for (var customID in this._achievementsMap) {
                     if (this._achievementsMap[customID] === achievements[i].achievementID) {
                         achievements[i].customID = customID;
                     }
                }
            }

        }
    }

    /**
     * @ignore
     */
    CocoonJS.extend(CocoonJS.Social.SocialGamingService, CocoonJS.Social.SocialService);


    /**
     * This enumeration represents the possible images to be obtained for a user in the social gaming extension.
     * @namespace
     * @enum
     */
    CocoonJS.Social.ImageSize =
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
     * @class
     * @constructor
     * @param {string} userID The id of the user.
     * @param {string} userName The user name of the user.
     */
    CocoonJS.Social.User = function(userID, userName, userImage)
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

        /**
         * The user image URL
         * If the image URL is not provided by default fetch it using requestUserImage method.
         * @field
         * @type {string}
         */
        this.userImage = userImage;

        return this;
    };

    /**
     * This type represents a message to be published.
     * @class
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


    /**
     * The data structure that represents the information of the user score in the application.
     * @class
     * @constructor
     * @param {string} userID The user id.
     * @param {number} score The score of the user.
     * @param {string} userName The name of the user.
     * @param {string} imageURL The url of the user image.
     * @param {number} leaderboardID The id of the leaderboard the score belongs to.
     */
    CocoonJS.Social.Score = function(userID, score, userName, imageURL, leaderboardID)
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
        this.score = score || 0;
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
         * @type string
         */
        this.leaderboardID = leaderboardID;

        return this;
    };

    /**
     * The data structure that represents params to retrieve or submit scores
     * @class
     * @constructor
     * @param {string} userID The user id. If no userID is specified the current logged in user is assumed.
     * @param {string} leaderboardID The leaderboard ID. If no leaderboard is specified the default leaderboard is assumed.
     * @param {boolean} [friendScope = false] If enabled the query will get only scores from friends in the social network
     * @param {CocoonJS.Social.TimeScope} [timeScope=0] The time scope for the scores.
     */
    CocoonJS.Social.ScoreParams = function(userID, leaderboardID, friends, timeScope) {
        /**
         * The user id.
         * @type string
         */
        this.userID = userID;
        /**
         * The id of the leaderboard.
         * @type string
         */
        this.leaderboardID = leaderboardID;

        /**
         * Friends scope
         * @type {boolean}
         */
        this.friends = !!friends;

        /**
         * The time scope
         * @type {number}
         */
        this.timeScope = timeScope || 2;
    }

    /**
     * @enum
     * This enumeration represents the possible Time Scopes for a leaderboad query.
     */
    CocoonJS.Social.TimeScope =
    {
        ALL_TIME: 0,
        WEEK: 1,
        TODAY:2
    };

    /**
     * The data structure that represents the information of an achievement in the application.
     * @class
     * @constructor
     * @param {string} achievementID The id of the achievement info.
     * @param {string} title The title of the achievement.
     * @param {string} description The description of the achievement.
     * @param {string} imageURL The url to the image representing the achievement.
     * @param {number} points The points value of the achievement
     */
    CocoonJS.Social.Achievement = function(achievementID, title, description, imageURL, points)
    {
        /**
         * The id of the achievement.
         * @type string
         */
        this.achievementID = achievementID;
        /**
         * The optional custom id of the achievement defined by the user.
         * @type string
         */
        this.customID = achievementID;
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
        this.points = points || 0;

        return this;
    };

})();(function(){

    // The CocoonJS and CocoonJS.Social must exist before creating the extension.
    if (typeof window.CocoonJS === 'undefined' || window.CocoonJS === null) throw("The CocoonJS object must exist and be valid before creating the extension types.");
    if (typeof window.CocoonJS.Social === 'undefined' || window.CocoonJS.Social === null) throw("The CocoonJS.Social object must exist and be valid before creating the extension types.");

    /**
     * @class
     * @constructor
     * Represents a type that mimics the original GameCenter API (somehow ;)) with the addition of the possibility to 
     * retrieve an abstract high level interface API to handle a SocialGamingService (APIs defined by Ludei) and multiplayer support.
     */
    CocoonJS.Social.GameCenterExtension = function() {
        this.nativeExtensionName = "IDTK_SRV_GAMECENTER";
        this.extensionName = "Social.GameCenter";
        this.nativeExtensionObjectAvailable =  CocoonJS.nativeExtensionObjectAvailable && typeof window.ext[this.nativeExtensionName] !== 'undefined';

        var me = this;
        if (this.nativeExtensionObjectAvailable) {
            this.onGameCenterLoginStateChanged = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onGameCenterLoginStateChanged");

            this.onGameCenterLoginStateChanged.addEventListener(function(localPlayer,error){
                me._currentPlayer = localPlayer;
            });
        }
        return this;
    };

    CocoonJS.Social.GameCenterExtension.prototype = {

        _currentPlayer: null,

        /**
         * Return a CocoonJS SocialGaming interface for the Game Center Extension
         * You can use the Game Center extension in two ways, with 1:1 official API equivalent or with the CocoonJS Social API abstraction
         * @see CocoonJS.Social.SocialGamingService
         * @returns {CocoonJS.Social.SocialGamingService}
         */
        getSocialInterface: function() {
            if (!this._socialService) {
                this._socialService = new CocoonJS.Social.SocialGamingServiceGameCenter(this);
            }
            return this._socialService;
        },

        /**
         * Return a CocoonJS Multiplayer interface for the Game Center Extension
         * @returns {CocoonJS.Multiplayer.MultiplayerService}
         */
        getMultiplayerInterface: function() {
            return CocoonJS.Multiplayer.GameCenter;
        },

        isLoggedIn: function() {
            return this._currentPlayer && this._currentPlayer.isAuthenticated;
        },

        /**
         * Authenticate the user
         * @params {function} callback The callback function. Response params: CocoonJS.Social.GameCenter.LocalPlayer and error.
         */
        login: function(callback) {
            var me = this;
            if (this.nativeExtensionObjectAvailable) {
                CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "login", [function(response, error) {
                    me._currentPlayer = response;
                    if (callback) {
                        callback(response,error);
                    }
                }], true);
            }
            else {
                throw "Game Center not available";
            }
        },
        /**
         * Synchronous accessor for the current authResponse
         * @returns {CocoonJS.Social.GameCenter.LocalPlayer} current Local Player data
         */
        getLocalPlayer: function() {
            if (this._currentPlayer)
                return this._currentPlayer;
            if (this.nativeExtensionObjectAvailable) {
                this._currentPlayer = CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "getLocalPlayer", []);
                return this._currentPlayer;
            }
            else {
                throw "Game Center not available";
            }
        },
        /**
         * Load the players for the provided identifiers.
         * @param {array} playerIDs Array of player identifiers
         * @param {function} callback The callback function. Response params: CocoonJS.Social.GameCenter.Player array and error
         */
        loadPlayers: function(playerIDs, callback) {
            if (this.nativeExtensionObjectAvailable) {
                CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "loadPlayers", [playerIDs, callback], true);
            }
            else {
                throw "Game Center not available";
            }
        },
        /**
         * Load the friends for the current logged in user.
         * @param {function} callback The callback function. Response params: CocoonJS.Social.GameCenter.Player array and error
         */
        loadFriends: function(callback) {
            if (this.nativeExtensionObjectAvailable) {
                CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "loadFriends", [callback], true);
            }
            else {
                throw "Game Center not available";
            }
        },
        /**
         * Load the earned achievements for the current logged in user.
         * @param {function} callback The callback function. Response params: CocoonJS.Social.GameCenter.Achievements array and error
         */
        loadAchievements: function(callback) {
            if (this.nativeExtensionObjectAvailable) {
                CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "loadAchievements", [callback], true);
            }
            else {
                throw "Game Center not available";
            }
        },
        /**
         * Load the application achievement descriptions
         * @param {function} callback The callback function. Response params: CocoonJS.Social.GameCenter.AchievementDescription array and error
         */
        loadAchievementDescriptions: function(callback) {
            if (this.nativeExtensionObjectAvailable) {
                CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "loadAchievementDescriptions", [callback], true);
            }
            else {
                throw "Game Center not available";
            }
        },
        /**
         * Load the application achievement descriptions
         * @param {function} callback The callback function. Response params: CocoonJS.Social.GameCenter.Leaderboard object and error
         * @param {CocoonJS.Social.GameCenter.Leaderboard} [query] Optional query parameters
         */
        loadScores: function(callback, query) {
            if (this.nativeExtensionObjectAvailable) {
                CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "loadScores", [query,callback], true);
            }
            else {
                throw "Game Center not available";
            }
        },
        /**
         * Report user score to the server
         * @param {CocoonJS.Social.GameCenter.Score} score definition of the score and it's category (leaderboardID).
         * If no category is specified the default one is used.
         * @param {function} callback The callback function. Response params: error
         */
        submitScore: function(score, callback) {
            if (this.nativeExtensionObjectAvailable) {
                CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "submitScore", [score,callback], true);
            }
            else {
                throw "Game Center not available";
            }
        },
        /**
         * Report user earned achievements to the server
         * @param {array} achievements Array of CocoonJS.Social.GameCenter.Achievement objects
         * @param {function} callback The callback function. Response params: error
         */
        submitAchievements: function(achievements, callback) {
            if (this.nativeExtensionObjectAvailable) {
                CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "submitAchievements", [achievements,callback], true);
            }
            else {
                throw "Game Center not available";
            }
        },
        /**
         * Resets all the achievements of the current logged in user
         * @param {function} [callback] The callback function. Response params: error.
         */
        resetAchievements : function(callback) {
            if (this.nativeExtensionObjectAvailable) {
                CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "resetAchievements", [callback], true);
            }
            else {
                throw "Game Center not available";
            }
        },
        /**
         * Shows a native view with the standard user interface for achievements
         * @param {function} callback The callback function when the view is closed by the user. Response params: error
         */
        showAchievements: function(callback) {
            if (this.nativeExtensionObjectAvailable) {
                CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "showAchievements", [callback], true);
            }
            else {
                throw "Game Center not available";
            }
        },
        /**
         * Shows a native view with the standard user interface for leaderboards
         * @param {function} callback The callback function when the view is closed by the user. Response params: error
         * @param {CocoonJS.Social.GameCenter.Leaderboard} [query] Optional parameters
         */
        showLeaderboards: function(callback, query) {
            if (this.nativeExtensionObjectAvailable) {
                CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "showLeaderboards", [query, callback], true);
            }
            else {
                throw "Game Center not available";
            }
        }
    };

    /**
     * @namespace
     * This is the global variable that enables access to the GameCenter API mimic and the high level abstract API
     * to handle Social and Multiplayer aspects created by Ludei.
     * @see CocoonJS.Social.GameCenterExtension
     */
    CocoonJS.Social.GameCenter = new CocoonJS.Social.GameCenterExtension();

    /**
     * @class
     * The data structure that represents the information of a Game Center player (Readonly)
     */
    CocoonJS.Social.GameCenter.Player = function() {
        /**
         * The identifier of the player.
         * @type string
         */
        this.playerID = "";
        /**
         * The alias of the player.
         * @type string
         */
        this.alias = "";
        /**
         * True if the user is friend of the local player
         * @type boolean
         */
        this.isFriend = false;
    }

    /**
     * @class
     * The data structure that represents the information of the Game Center Local Player (Readonly)
     */
    CocoonJS.Social.GameCenter.LocalPlayer = function() {
        /**
         * The identifier of the player.
         * @type string
         */
        this.playerID = "";
        /**
         * The alias of the player.
         * @type string
         */
        this.alias = "";
        /**
         * Indicates the authentication state of the current player
         * @type boolean
         */
        this.isAuthenticated = false;
    }

    /**
     * The data structure that represents an earned achievement by the user
     * @class
     * @constructor
     * @param {string} identifier The id of the achievement.
     * @param {number} [percentComplete] The percentage on which the achievement has been completed. 100% by default.
     */
    CocoonJS.Social.GameCenter.Achievement = function(identifier, percentComplete) {
        /**
         * The identifier of the achievement.
         * @type string
         */
        this.identifier = identifier;
        /**
         * Percentage of achievement complete (from 0 to 100)
         * @type number
         */
        this.percentComplete = percentComplete;
        /**
         *  Date the achievement was last reported (unix time)
         * @type number
         */
        this.lastReportedDate = 0;
    }

    /**
     * @class
     * The data structure that represents achievements defined by the application (Readonly)
     */
    CocoonJS.Social.GameCenter.AchievementDescription = function() {
        /**
         * The identifier of the achievement.
         * @type string
         */
        this.identifier = "";
        /**
         * The title of the achievement
         * @type string
         */
        this.title = "";
        /**
         * The description for an achieved achievement
         * @type string
         */
        this.achievedDescription = "";
        /**
         * The description for an unachieved achievement.
         * @type string
         */
        this.achievedDescription = "";

        /**
         * The maximum points of the achievement
         * @type number
         */
        this.maximumPoints = 0;
    }

    /**
     * @class
     * @constructor
     * The data structure that a score in the leaderboards
     * @param {number} value The value of the score.
     * @param {string} category The category where the score is associated.
     */
    CocoonJS.Social.GameCenter.Score = function(value,category) {
        /**
         * The score value as a 64bit integer.
         * @type number
         */
        this.value = value;
        /**
         * Leaderboard category
         * @type string
         */
        this.category = category;
        /**
         * The identifier of the player that recorded the score
         * @type string
         */
        this.playerID = "";
        /**
         * The rank of the player within the leaderboard
         * @type number
         */
        this.rank = 0;
    }

    /**
     * @class
     * @constructor
     * The data structure that represents the set of high scores for the current game
     * @param {string} category The category of the leaderboard.
     * @param {array} payerIDs
     * @param {CocoonJS.Social.GameCenter.TimeScope} timeScope
     * @param {CocoonJS.Social.GameCenter.PayerScope} payerScope
     * @param {number} rangeStart
     * @param {number} rangeLength
     */
    CocoonJS.Social.GameCenter.Leaderboard = function(category, playerIDs, timeScope, playerScope, rangeStart, rangeLength) {
        /**
         * leaderboard category (query parameter)
         * @type string
         */
        this.category = category;
        /**
         * Player identifiers array (query parameter)
         * @type string
         */
        this.playerIDs = category;
        /**
         * Time scope (query parameter)
         * @type CocoonJS.Social.GameCenter.TimeScope
         */
        this.timeScope = timeScope;
        /**
         * Player scope (query parameter)
         * @type CocoonJS.Social.GameCenter.PlayerScope
         */
        this.playerScope = playerScope;
        /**
         * Leaderboards start at index 1 and the length should be less than 100 (query parameter)
         * @type number
         */
        this.rangeStart = rangeStart;
        /**
         * Leaderboards start at index 1 and the length should be less than 100 (query parameter)
         * @type number
         */
        this.rangeLength = rangeLength;
        /**
         * Scores array (response parameter)
         * @type Array of CocoonJS.Social.GameCenter.Score
         */
        this.scores = [];
        /**
         * Local player score (response parameter)
         * @type CocoonJS.Social.GameCenter.Score
         */
        this.localPlayerScore = [];
        /**
         * Localized category title
         * @type string
         */
        this.localizedTitle = localizedTitle;
    }

    /**
     * @enum
     * This enumeration represents the possible Time Scopes for a leaderboad query.
     */
    CocoonJS.Social.GameCenter.TimeScope =
    {
        TODAY: 0,
        WEEK: 1,
        ALL_TIME:2
    };

    /**
     * @enum
     * This enumeration represents the possible Player Scopes for a leaderboad query.
     */
    CocoonJS.Social.GameCenter.PlayerScope =
    {
        GLOBAL: 0,
        FRIENDS: 1
    };


    //Social API Interface
    CocoonJS.Social.SocialGamingServiceGameCenter = function(gcExtension) {
        CocoonJS.Social.SocialGamingServiceGameCenter.superclass.constructor.call(this);
        this.gc = gcExtension;
        var me = this;
        this.gc.onGameCenterLoginStateChanged.addEventListener(function(localPlayer, error){
            me.onLoginStatusChanged.notifyEventListeners(localPlayer.isAuthenticated,error);
        });
        return this;
    }

    CocoonJS.Social.SocialGamingServiceGameCenter.prototype =  {

        _cachedAchievements: null,

        isLoggedIn: function() {
            return this.gc.isLoggedIn();
        },
        login : function(callback) {
            this.gc.login(function(localPlayer, error){
                if (callback)
                    callback(localPlayer.isAuthenticated, error);
            });
        },
        logout: function(callback) {
            if (callback)
                callback({message:"User has to logout from the Game Center APP"});
        },
        getLoggedInUser : function() {
            return fromGCPLayerToCocoonUser(this.gc._currentPlayer ? this.gc._currentPlayer : this.gc.getLocalPlayer());
        },

        requestUser: function(callback, userId) {
            if (userId) {
                this.gc.loadPlayers([userId], function(response, error) {
                    var user = response && response.length ? fromGCPLayerToCocoonUser(response[0]) : null;
                    callback(user, error);
                });
            }
            else {
                var me = this;
                setTimeout(function(){
                    callback(me.getLoggedInUser());
                })
            }
        },
        requestFriends: function(callback, userId) {
            this.gc.loadFriends(function(friends, error){
                var users = [];
                if (friends && friends.length) {
                    for (var i= 0; i< friends.length; ++i) {
                        users.push(fromGCPLayerToCocoonUser(friends[i]));
                    }
                }
                callback(users, error);
            });
        },
        requestScore: function(callback, params) {
            var query = {};
            var options = params || {};
            if (options.leaderboardID)
                query.category = options.leaderboardID;
            query.playerIDs = [options.userID || this.getLoggedInUser().userID];

            this.gc.loadScores(function(response, error) {
                var gcScore = null;
                if (options.userID && response && response.scores && response.scores.length)
                    gcScore = response.scores[0];
                else if (response && response.localPlayerScore)
                    gcScore = response.localPlayerScore;
                var loadedScore = gcScore ? new CocoonJS.Social.Score(gcScore.playerID, gcScore.value, "","", gcScore.category) : null;
                callback(loadedScore,error);
            }, query);
        },

        submitScore: function(score, callback, params) {
            var options = params || {};
            this.gc.submitScore({value:score, category:options.leaderboardID || ""}, function(error){
                if (callback)
                    callback(error);
            });
        },

        showLeaderboard : function(callback, params) {
            var options = params || {};
            this.gc.showLeaderboards(function(error){
                if (callback)
                    callback(error);
            }, {category:options.leaderboardID || ""});
        },
        //internal utility function
        prepareAchievements: function(reload, callback) {

            if (!this._cachedAchievements || reload) {
                var me = this;
                this.gc.loadAchievementDescriptions(function(response, error){
                    if (error) {
                        callback([],error);
                    }
                    else {
                       var achievements = [];
                       if (response && response.length) {
                           for (var i = 0; i < response.length; i++) {
                               achievements.push(fromGCAchievementDescriptionToCocoonAchievement(response[i]))
                           }
                       }
                       me.setCachedAchievements(achievements);
                       callback(achievements, null);
                    }

                });
            }
            else {
                callback(this._cachedAchievements, null);
            }
        },

        requestAllAchievements : function(callback) {
            this.prepareAchievements(true, callback);
        },

        requestAchievements : function(callback, userID) {
            var me = this;
            this.prepareAchievements(false, function(allAchievements, error){
                if (error) {
                    callback([], error);
                    return;
                }
                me.gc.loadAchievements(function(response, error){
                    if (!error) {
                        var achievements = [];
                        if (response && response.length) {
                            for (var i = 0; i < response.length; i++) {
                                var ach = me.findAchievement(response[i].identifier);
                                if (ach)
                                    achievements.push(ach);
                            }
                        }
                        callback(achievements, null);
                    }
                    else {
                        callback([], response.error);
                    }

                });
            });
        },
        submitAchievement: function(achievementID, callback) {
            if (achievementID === null || typeof achievementID === 'undefined')
                throw "No achievementID specified";
            var achID = this.translateAchievementID(achievementID);
            this.gc.submitAchievements([{identifier:achID, percentComplete:100}], callback);
        },
        resetAchievements : function(callback) {
            this.gc.resetAchievements(callback);
        },
        showAchievements : function(callback) {
            this.gc.showAchievements(function(error){
                if (callback)
                    callback(error);
            });
        }
    }

    CocoonJS.extend(CocoonJS.Social.SocialGamingServiceGameCenter, CocoonJS.Social.SocialGamingService);

    /**
     * @ignore
     */
    function fromGCPLayerToCocoonUser(player){
        return new CocoonJS.Social.User(player.playerID, player.alias);
    }
    /**
     * @ignore
     */
    function fromGCAchievementDescriptionToCocoonAchievement(ach) {
        return new CocoonJS.Social.Achievement(ach.identifier,ach.title, ach.achievedDescription,"", ach.maximumPoints);
    }
})();
;(function() {

    // The CocoonJS and CocoonJS.Social must exist before creating the extension.
    if (!window.CocoonJS) throw("The CocoonJS object must exist and be valid before creating the extension types.");
    if (!window.CocoonJS.Social) throw("The CocoonJS.Social object must exist and be valid before creating the extension types.");

    /**
     * @class
     * @constructor
     * Represents a type that mimics the original Google Play Games API with the addition of the possibility to
     * retrieve an abstract high level interface API to handle a SocialGamingService (APIs defined by Ludei).
     * Original Google Play Games API: https://developers.google.com/api-client-library/javascript/referencedocs/
     */
    CocoonJS.Social.GooglePlayGamesExtension = function (){
        this.nativeExtensionName = "IDTK_SRV_GOOGLE_PLAY_GAMES";
        this.extensionName = "Social.GooglePlayGames";
        this.nativeExtensionObjectAvailable =  CocoonJS.nativeExtensionObjectAvailable && typeof window.ext[this.nativeExtensionName] !== 'undefined';

        this.auth = new CocoonJS.Social.GooglePlayGamesAuthExtension(this);
        this.client = new CocoonJS.Social.GooglePlayGamesClientExtension(this);
        this.defaultScopes = ["https://www.googleapis.com/auth/games","https://www.googleapis.com/auth/plus.login"];
        this.gamesAPI = "/games/v1";
        this.plusAPI = "/plus/v1";

        this.onSessionChanged = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onSessionChanged");

        CocoonJS.Social.GooglePlayGames = this; //the object it's being created but the addEventListener needs it now
        var me = this;
        this.onSessionChanged.addEventListener(function(session, error) {
            me.token = fromSessionToAuthTokenObject(session,error);
            if (session && session.access_token) {
                //fetch user data
                me.client.request({path: me.gamesAPI + "/players/me", callback: function(response) {
                    me.currentPlayer = response;
                }});
            }
        });

        return this;
    };

    CocoonJS.Social.GooglePlayGamesExtension.prototype = {

        token: null,
        settings: {},
        socialService: null,
        currentPlayer: null,
        initialized: false,

        auth: null,
        client: null,

        /**
         * Initializes the service and tries to restore the last session
         * @param {Object} params Initialization options
         * params.clientId {string} The application clientID. Omit if its already provided in the native application via cloud configuration.
         * params.defaultLeaderboard {string} The default leaderboard ID. You can omit it if you specify the leaderboardID in all the score queries or submits
         * params.showAchievementNotifications {boolean} Enable or disable the native view notifications when an achievement is unlocked.
         */
        init: function(params) {
            if (!params || typeof params !== 'object')
                throw "Invalid params argument";
            this.settings = params;
            this.initialized = true;
            if (this.nativeExtensionObjectAvailable) {
                CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "init", [this.settings.clientId], true);
            }
            else {

                var me = this;
                var initWebAPi = function() {
                    gapi.auth.authorize({immediate: true, scope: me.defaultScopes, client_id:me.settings.clientId},function(response) {
                        me.token = response;
                        if (response && response.access_token) {
                            me.onSessionChanged.notifyEventListeners(response);
                        }
                    })
                }

                if (!window.gapi) {
                    window.onGapiLoadCallback = function() {
                        //initialization timeout recommended by google to avoid some race conditions
                        window.setTimeout(initWebAPi, 1);
                    }
                    var script = document.createElement("script");
                    script.src = "https://apis.google.com/js/client.js?onload=onGapiLoadCallback";
                    document.getElementsByTagName('head')[0].appendChild(script);
                }
                else {
                    initWebAPi();
                }
            }
        },

        /**
         * Return a CocoonJS SocialGaming interface for the Google Play Games Extension
         * You can use the Google Play Games extension in two ways, with the official SDK API equivalent or with the CocoonJS Social API abstraction
         * @see CocoonJS.Social.SocialGamingService
         * @returns {CocoonJS.Social.SocialGamingService}
         */
        getSocialInterface: function() {

            if (!this.initialized) {
                throw "You must call init() before getting the Social Interface";
            }
            if (!this.socialService) {
                this.socialService = new CocoonJS.Social.SocialGamingServiceGooglePlayGames(this);
            }
            return this.socialService;
        },

        /**
         * Return a CocoonJS Multiplayer interface for the Game Center Extension
         * @returns {CocoonJS.Multiplayer.MultiplayerService}
         */
        getMultiplayerInterface: function() {
            return CocoonJS.Multiplayer.GooglePlayGames;
        },

        share: function() {


            window.open(this.href,'', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');return false;

        }

    };

    CocoonJS.Social.GooglePlayGamesAuthExtension = function(extension) {
        this.extension = extension;
        return this;
    }

    CocoonJS.Social.GooglePlayGamesAuthExtension.prototype = {
        /**
         * Initiates the OAuth 2.0 authorization process.
         * The browser displays a popup window prompting the user authenticate and authorize.
         * After the user authorizes, the popup closes and the callback function fires.
         * @param {object} A key/value map of parameters for the request (client_id, inmediate, response_type, scope)
         * @param {function} callback The function to call once the login process is complete. The function takes an OAuth 2.0 token object as its only parameter.
         */
        authorize: function(params, callback) {
            var me = this;
            if (this.extension.nativeExtensionObjectAvailable) {
                CocoonJS.makeNativeExtensionObjectFunctionCall(this.extension.nativeExtensionName, "authorize", [params, function(response, error) {
                    me.extension.token = fromSessionToAuthTokenObject(response,error);
                    if (callback) {
                        callback(me.extension.token);
                    }
                }], true);
            }
            else {
                gapi.auth.authorize(params, function(response){
                    me.extension.token = response;
                    me.extension.onSessionChanged.notifyEventListeners(response, response ? response.error : null);
                    if (callback)
                        callback(response);
                });
            }
        },

        /**
         * Log the user out of the application
         * @param callback
         */
        disconnect: function(callback) {

            if (this.extension.nativeExtensionObjectAvailable) {
                CocoonJS.makeNativeExtensionObjectFunctionCall(this.extension.nativeExtensionName, "disconnect", [callback], true);
            }
            else {
                //TODO
                if (callback)
                    callback({error: "Not implemented yet"});
            }
        },

        /**
         *  Initializes the authorization feature. Call this when the client loads to prevent popup blockers from blocking the auth window on gapi.auth.authorize calls.
         *  @param {Function} callback A callback to execute when the auth feature is ready to make authorization calls
         */
        init: function(callback) {

            if (this.extension.nativeExtensionObjectAvailable) {
                callback();
            }
            else {
                gapi.auth.init(callback);
            }
        },

        /**
         * Retrieves the OAuth 2.0 token for the application.
         */
        getToken: function() {
            if (this.extension.nativeExtensionObjectAvailable) {
                return this.extension.token;
            }
            else {
                return gapi.auth.getToken();
            }
        },
        /*
         * Retrieves the OAuth 2.0 token for the application.
         */
        setToken: function(token) {
            if (this.extension.nativeExtensionObjectAvailable) {
                this.extension.token = token;
            }
            else {
                gapi.auth.setToken(token);
            }
        }
    }


    CocoonJS.Social.GooglePlayGamesClientExtension = function(extension) {
        this.extension = extension;
        return this;
    }

    CocoonJS.Social.GooglePlayGamesClientExtension.prototype = {

        /**
         * Sets the API key for the application, which can be found in the Developer Console. Some APIs require this to be set in order to work.
         * @param apiKey The API key to set
         */
        setApiKey: function(apiKey) {
            if (this.extension.nativeExtensionObjectAvailable) {
                CocoonJS.makeNativeExtensionObjectFunctionCall(this.extension.nativeExtensionName, "setApiKey", [apiKey],true);
            }
            else {
                gapi.client.setApiKey(apiKey);
            }
        },

        /**
         * Creates a HTTP request for making RESTful requests.
         * @param {object} args (More info: https://developers.google.com/api-client-library/javascript/reference/referencedocs#gapiclientrequest)
         * @return {object} If no callback is supplied, a request object is returned. The request can then be executed using gapi.client.HttpRequest.execute(callback).
         */
        request: function(args) {
            if (this.extension.nativeExtensionObjectAvailable) {
                if (args.callback) {
                    CocoonJS.makeNativeExtensionObjectFunctionCall(this.extension.nativeExtensionName, "request", [args, function(response,error){
                        var result = response;
                        if (error) {
                            result = response || {};
                            result.error = error;
                        }
                        args.callback(result);
                    }],true);
                    return null;
                }
                else {
                    var me = this;
                    //return a function to mimic the HttpRequest class
                    var httpRequest =  {
                        execute: function(callback) {
                            CocoonJS.makeNativeExtensionObjectFunctionCall(me.extension.nativeExtensionName, "request", [args, function(response, error){
                                var result = response;
                                if (error) {
                                    result = response || {};
                                    result.error = error;
                                }
                                callback(result);
                            }],true);
                        }
                    };
                    return httpRequest;
                }
            }
            else {
                return gapi.client.request(args);
            }
        }
    }

    /**
     * @namespace
     * This is the global variable that enables access to the Google Play Games API mimic and the high level abstract API
     * to handle Social aspects, created by Ludei.
     * @see CocoonJS.Social.GooglePlayGamesExtension
     */
    CocoonJS.Social.GooglePlayGames = new CocoonJS.Social.GooglePlayGamesExtension();


    /**
     * @ignore
     */
    function fromSessionToAuthTokenObject(response, error) {
        var obj = response || {};
        return {
            access_token: response.access_token,
            state: response.state,
            error: error,
            expires_in: response.expirationDate ? response.expirationDate - Date.now() : 0,
            player_id: response.playerId
        }
    }


    CocoonJS.Social.SocialGamingServiceGooglePlayGames = function (apiObject) {
        CocoonJS.Social.SocialGamingServiceGooglePlayGames.superclass.constructor.call(this);
        this.gapi = apiObject;
        var me = this;

        this.gapi.onSessionChanged.addEventListener(function(session){
            var obj = session || {};
            me.onLoginStatusChanged.notifyEventListeners(!!obj.access_token, obj.error);
        });

        return this;
    }

    CocoonJS.Social.SocialGamingServiceGooglePlayGames.prototype =  {

        isLoggedIn: function() {
            return (this.gapi.token && this.gapi.token.access_token) ? true: false;
        },
        login : function(callback) {
            var me = this;
            this.gapi.auth.authorize({client_id:this.gapi.settings.clientId, scope: this.gapi.defaultScopes}, function(response) {
                if (callback) {
                    callback(me.isLoggedIn(),response.error);
                }
            });
        },
        logout: function(callback) {
            this.gapi.auth.disconnect(callback);
        },
        getLoggedInUser : function() {
            return this.gapi.currentPlayer ? fromGPUserToCocoonUser(this.gapi.currentPlayer) : null;
        },
        requestUser: function(callback, userId) {
            var playerId = userId || "me";
            this.gapi.client.request({path: this.gapi.gamesAPI + "/players/" + playerId, callback: function(response) {
                var user = response && !response.error ? fromGPPlayerToCocoonUser(response) : null;
                callback(user, response.error);
            }});
        },
        requestUserImage: function(callback, userID, imageSize) {
            this.requestUser(function(user, error){
                if (user && user.userImage) {
                    var pixelSize = fromImageSizeToGPSize(imageSize || CocoonJS.Social.ImageSize.MEDIUM);
                    if (user.userImage.indexOf("sz=") ===  -1) {
                        user.userImage+="?sz=" + pixelSize;
                    }
                    else {
                        user.userImage = user.userImage.replace(/sz=\d+/g,"sz=" + pixelSize);
                    }
                }
                callback(user ? user.userImage : null, error);
            }, userID);

        },
        requestFriends: function(callback, userId) {
            var params = { orderBy: "best"};
            var playerId = userId || "me";
            this.gapi.client.request({path: this.gapi.plusAPI + "/people/" + playerId + "/people/visible", params: params, callback: function(response) {
                if (response && !response.error) {
                    var friends = [];
                    for (var i = 0; i< response.items.length; ++i) {
                        friends.push(fromGPPersonToCocoonUser(response.items[i]));
                    }
                    callback(friends);
                }
                else {
                    callback([], response ? response.error : null);
                }
            }});
        },

        publishMessage: function(message, callback) {
            if (callback)
                callback("Not supported... use publishMessageWithDialog method instead");
        },

        publishMessageWithDialog: function(message, callback) {

            if (this.gapi.nativeExtensionObjectAvailable) {
                var params = {
                    prefilledText: message.message,
                    mediaUrl: message.mediaURL,
                    mediaTitle: message.linkCaption,
                    mediaDescription: message.linkText,
                    url: message.linkURL
                }

                CocoonJS.makeNativeExtensionObjectFunctionCall(this.gapi.nativeExtensionName, "shareMessage", [params, callback], true)
            }
            else {

                var me = this;
                var share = function() {
                    var options = {
                        contenturl: 'https://plus.google.com/pages/',
                        contentdeeplinkid: '/pages',
                        clientid: me.gapi.settings.clientId,
                        cookiepolicy: 'single_host_origin',
                        prefilltext: message.message,
                        calltoactionlabel: 'CREATE',
                        calltoactionurl: 'http://plus.google.com/pages/create',
                        calltoactiondeeplinkid: '/pages/create'
                    };

                    gapi.interactivepost.render('sharePost', options);
                }

                if (!gapi.interactivepost) {
                    var script = document.createElement('script'); script.type = 'text/javascript'; script.async = true;
                    script.src = 'https://apis.google.com/js/plusone.js';
                    script.onload = function() {
                        share();
                    }
                    document.getElementsByTagName('head')[0].appendChild(script);
                }
                else {
                    share();
                }
            }
        },

        requestScore: function(callback, params) {
            params = params || {};
            var playerId = params.userID || "me";
            var leaderboardID = params.leaderboardID || this.gapi.settings.defaultLeaderboard;
            if (!leaderboardID)
                throw "leaderboardID not provided in the params. You can also set the default leaderboard in the init method";

            this.gapi.client.request({path: this.gapi.gamesAPI + "/players/" + playerId + "/leaderboards/" + leaderboardID + "/scores/ALL_TIME", callback: function(response) {
                if (response && response.error) {
                    callback(null, response.error)
                }
                else if (response && response.items && response.items.length > 0) {
                    var item = response.items[0];
                    var data = new CocoonJS.Social.Score(playerId, item.scoreValue,"","", item.leaderboard_id);
                    callback(data, null);
                }
                else {
                    //No score has been submitted yet for the user
                    callback(null,null);
                }
            }});

        },

        submitScore: function(score, callback, params) {
            params = params || {};
            var leaderboardID = params.leaderboardID || this.gapi.settings.defaultLeaderboard;
            if (!leaderboardID)
                throw "leaderboardID not provided in the params. You can also set the default leaderboard in the init method";


            this.gapi.client.request({path: this.gapi.gamesAPI + "/leaderboards/" + leaderboardID + "/scores",
                                      method: "POST", params:{score: score}, callback: function(response) {
                    if (callback) {
                        callback(response ? response.error : null);
                    }
            }});

        },

        showLeaderboard : function(callback, params) {
            params = params || {};
            var leaderboardID = params.leaderboardID || this.gapi.settings.defaultLeaderboard;
            if (!leaderboardID)
                throw "leaderboardID not provided in the params. You can also set the default leaderboard in the init method";

            var ios = /(iPad|iPhone|iPod)/ig.test( navigator.userAgent );
            if (!ios && this.gapi.nativeExtensionObjectAvailable) {
                var timeScope = params.timeScope || 0;
                CocoonJS.makeNativeExtensionObjectFunctionCall(this.gapi.nativeExtensionName, "showLeaderboard", [leaderboardID, timeScope, callback], true);
            }
            else {
                if (!this._leaderboardsTemplate)
                    throw "Please, provide a html template for leaderboards with the setTemplates method";
                var dialog = new CocoonJS.App.WebDialog();
                var callbackSent = false;
                dialog.show(this._leaderboardsTemplate, function(error) {
                    dialog.closed = true;
                    if (!callbackSent && callback)
                        callback(error);
                });
                var me = this;
                var collection = params.friends ? "SOCIAL" : "PUBLIC";
                var timeSpan = "ALL_TIME";
                if (params.timeScope === CocoonJS.Social.TimeScope.WEEK) {
                    timeSpan = "WEEKLY";
                }
                else if (params.timeScope === CocoonJS.Social.TimeScope.TODAY) {
                    timeSpan = "DAILY";
                }
                this.gapi.client.request({path: this.gapi.gamesAPI + "/leaderboards/" + leaderboardID + "/window/" + collection,
                    method: "GET", params:{timeSpan: timeSpan}, callback: function(response) {
                        if (dialog.closed)
                            return;
                        if (response.error) {
                            if (callback) {
                                callbackSent = true;
                                callback(response.error);
                                dialog.close();
                            }
                            return;
                        }
                        var scores = [];
                        var items = [];
                        if (response && response.items) {
                            items = response.items.slice(0);
                        }
                        if (response && response.playerScore) {
                            items.push(response.playerScore);
                        }
                        for (var i = 0; i< items.length; ++i) {
                            var item = items[i];
                            var score = fromGPScoreToCocoonScore(item, leaderboardID);
                            score.imageURL+="?sz=50";
                            score.position = item.scoreRank || i + 1;
                            score.me = false;
                            scores.push(score);
                        }
                        var js = "addScores(" + JSON.stringify(scores) + ")";
                        dialog.eval(js);
                    }});
            }
        },

        //internal utility function
        prepareAchievements: function(reload, callback) {
            if (!this._cachedAchievements || reload) {
                var me = this;
                this.gapi.client.request({path: this.gapi.gamesAPI + "/achievements", callback: function(response) {
                    if (response && !response.error) {
                        var achievements = [];
                        if (response && response.items) {
                            for (var i = 0; i < response.items.length; i++) {
                                achievements.push(fromGPAchievementToCocoonAchievement(response.items[i]))
                            }
                        }
                        me.setCachedAchievements(achievements);
                        callback(achievements, null);
                    }
                    else {
                        callback([], response ? response.error : null);
                    }
                }});
            }
            else {
                callback(this._cachedAchievements, null);
            }
        },

        requestAllAchievements : function(callback) {
            this.prepareAchievements(true, callback);
        },

        requestAchievements : function(callback, userID) {
            var me = this;
            this.prepareAchievements(false, function(allAchievements, error){
                if (error) {
                    callback([], error);
                    return;
                }
                var playerID = userID || "me";
                me.gapi.client.request({path: me.gapi.gamesAPI + "/players/" + playerID + "/achievements",
                                        params: {state: "UNLOCKED"}, callback: function(response) {
                    if (response && !response.error) {
                        var achievements = [];
                        if (response.items) {
                            for (var i = 0; i < response.items.length; i++) {
                                var ach = me.findAchievement(response.items[i].id);
                                if (ach)
                                    achievements.push(ach);
                            }
                        }
                        callback(achievements, null);
                    }
                    else {
                        callback([], response ? response.error : null);
                    }
                }});

            });
        },
        submitAchievement: function(achievementID, callback) {
            if (achievementID === null || typeof achievementID === 'undefined')
                throw "No achievementID specified";
            var achID = this.translateAchievementID(achievementID);
            if (this.gapi.nativeExtensionObjectAvailable) {
                //native API allows to show a native notification view. (REST API doesn't)
                var showNotification = !!this.gapi.settings.showAchievementNotifications;
                CocoonJS.makeNativeExtensionObjectFunctionCall(this.gapi.nativeExtensionName, "unlockAchievement", [achID, showNotification, callback], true);
            }
            else {
                //REST api
                this.gapi.client.request({path: this.gapi.gamesAPI + "/achievements/" + achID + "/unlock",
                    method: "POST", callback: function(response) {
                        if (callback) {
                            callback(response ? response.error : null);
                        }
                    }});
            }
        },
        resetAchievements : function(callback) {
            this.gapi.client.request({path: "/games/v1management/achievements/reset",
                method: "POST", callback: function(response) {
                    if (callback) {
                        callback(response ? response.error : null);
                    }
                }});
        },
        showAchievements : function(callback) {
            var ios = /(iPad|iPhone|iPod)/ig.test( navigator.userAgent );
            if (!ios && this.gapi.nativeExtensionObjectAvailable) {
                CocoonJS.makeNativeExtensionObjectFunctionCall(this.gapi.nativeExtensionName, "showAchievements", [callback], true);
            }
            else {
                CocoonJS.Social.SocialGamingServiceGooglePlayGames.superclass.showAchievements.call(this);
            }
        }
    }

    CocoonJS.extend(CocoonJS.Social.SocialGamingServiceGooglePlayGames, CocoonJS.Social.SocialGamingService);


    /**
     *@ignore
     */
    function fromGPPlayerToCocoonUser (gpPlayer) {
        return new CocoonJS.Social.User (gpPlayer.playerId, gpPlayer.displayName, gpPlayer.avatarImageUrl);
    }
    /**
     *@ignore
     */
    function fromGPPersonToCocoonUser (gpUser) {
        var avatar = gpUser.image ? gpUser.image.url : "";
        avatar = avatar.replace(/sz=\d+/g,"sz=100");
        return new CocoonJS.Social.User (gpUser.id, gpUser.displayName, avatar);
    }
    /**
     *@ignore
     */
    function fromImageSizeToGPSize (imageSize) {
        if (imageSize === CocoonJS.Social.ImageSize.THUMB) {
            return 100;
        }
        else if (imageSize === CocoonJS.Social.ImageSize.MEDIUM) {
            return 200;
        }
        else if (imageSize === CocoonJS.Social.ImageSize.LARGE) {
            return 512;
        }
    }
    /**
     *@ignore
     */
    function fromGPAchievementToCocoonAchievement(gpItem) {
        var result = new CocoonJS.Social.Achievement (
            gpItem.id,
            gpItem.name,
            gpItem.description,
            gpItem.revealedIconUrl,
            0
        );
        result.gpAchievementData = gpItem;
        return result;
    }
    /**
     *@ignore
     */
    function fromGPScoreToCocoonScore(gpItem, leaderboardID) {
        return new CocoonJS.Social.Score(gpItem.player.playerId, gpItem.scoreValue, gpItem.player.displayName, gpItem.player.avatarImageUrl, leaderboardID);
    }

})();
;(function() {

    // The CocoonJS must exist before creating the extension.
    if (typeof window.CocoonJS === 'undefined' || window.CocoonJS === null) throw("The CocoonJS object must exist and be valid before creating any extension object.");
    if (typeof window.CocoonJS.Social === 'undefined' || window.CocoonJS === null) throw("The CocoonJS.Social object must exist and be valid before creating a Social Manager extension object.");

    CocoonJS.Social.ManagerService = function() {
       this.services = [];
    }

    CocoonJS.Social.ManagerService.prototype = {

        services:null,

        registerSocialService : function(service) {
            this.services.push(service);
        },

        submitAchievement : function(achievementID) {
            for (var i = 0; i < this.services.length; ++i) {
                var service = this.services[i];
                if (!service.readOnlyHint && service.isLoggedIn())  {
                    service.submitAchievement(achievementID, function(error) {
                        if (error)
                            console.error("Error submitting achievement: " + error.message);
                    });
                }
            }
        },

        submitScore : function(score, params) {
            for (var i = 0; i < this.services.length; ++i) {
                var service = this.services[i];
                if (!service.readOnlyHint && service.isLoggedIn())  {
                    service.submitScore(score, function(error) {
                        if (error)
                            console.error("Error submitting score: " + error.message);
                    }, params);
                }
            }
        },

        getLoggedInServices : function() {
            var result= [];

            for (var i = 0; i < this.services.length; ++i) {
                var service = this.services[i];
                if (!service.fakeSocialService &&  service.isLoggedIn())  {
                    result.push(service);
                }
            }
            return result;
        },

        isLoggedInAnySocialService : function() {
            return this.getLoggedInServices().length > 0;
        }
    }

    CocoonJS.Social.Manager = new CocoonJS.Social.ManagerService();

})();;(function() {

    // The CocoonJS and CocoonJS.Social must exist before creating the extension.
    if (typeof window.CocoonJS === 'undefined' || window.CocoonJS === null) throw("The CocoonJS object must exist and be valid before creating the extension types.");
    if (typeof window.CocoonJS.Social === 'undefined' || window.CocoonJS.Social === null) throw("The CocoonJS.Social object must exist and be valid before creating the extension types.");

    /** 
     * @class
     * @constructor 
     * Represents a type that mimics the original Facebook API with the addition of the possibility to
     * retrieve an abstract high level interface API to handle a SocialGamingService (APIs defined by Ludei).
     */
    CocoonJS.Social.FacebookExtension = function (){
        this.nativeExtensionName = "IDTK_SRV_FACEBOOK";
        this.extensionName = "Social.Facebook";
        this.nativeExtensionObjectAvailable =  CocoonJS.nativeExtensionObjectAvailable && typeof window.ext[this.nativeExtensionName] !== 'undefined';
        this.Event = new CocoonJS.Social.FacebookEvent(this.nativeExtensionObjectAvailable);

        var me = this;
        if (this.nativeExtensionObjectAvailable) {

            this.onFacebookSessionStateChanged = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onFacebookSessionStateChanged");

            CocoonJS.Social.Facebook = this; //the object it's being created but the addEventListener needs it now
            this.onFacebookSessionStateChanged.addEventListener(function(session, error) {
                var data = fromCocoonFBSessionToFBAPISession(session,error);
                if (session.state == 0) {
                    me.Event.notify("auth.login", data);
                }
                me.Event.notify("auth.authResponseChange", data);
                me.Event.notify("auth.statusChange", data);
            });
        }
        return this;
    };

    CocoonJS.Social.FacebookExtension.prototype = {

        _currentSession: null,
        _appId: null,
        _socialService: null,

        /**
         * Initialize the SDK with your app ID. This will let you make calls against the Facebook API. All FB.API methods must be called after FB.init.
         * @param {object} options. Check available options here: https://developers.facebook.com/docs/reference/javascript/FB.init/
         */
        init: function(options) {
            if (!options || !options.appId) {
                throw "appId must be specified!";
            }

            this._appId = options.appId;

            if (this.nativeExtensionObjectAvailable) {
                CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "init", [options], true);
            }
            else {
                FB.init(options);
            }

            var me = this;
            this.Event.subscribe("auth.authResponseChange", function(session) {
                me._currentSession = session;
                if (session.authResponse && !session.authResponse.user){
                    me.api("me?fields=username", function(response) {
                        me._currentSession.authResponse.user = response;
                    });
                }
            });
        },

        /**
         * Return a CocoonJS SocialGaming interface for the Facebook Extension
         * You can use the Facebook extension in two ways, with the official SDK API equivalent or with the CocoonJS Social API abstraction
         * @see CocoonJS.Social.SocialGamingService
         * @returns {CocoonJS.Social.SocialGamingService}
         */
        getSocialInterface: function() {

            if (!this._appId) {
                throw "You must call init() before getting the Social Interface";
            }
            if (!this._socialService) {
                this._socialService = new CocoonJS.Social.SocialGamingServiceFacebook(this);
            }
            return this._socialService;
        },

        /**
         * Authenticate the user
         * By default, calling login will attempt to authenticate the user with only the basic permissions.
         * If you want one or more additional permissions, call login with an option object,
         * and set the scope parameter with a comma-separated list of the permissions you wish to request from the user
         * @param {object} login options
         * @params {function} callback The callback function with received session data or error.
         */
        login: function(callback, options) {
            var me = this;
            if (this.nativeExtensionObjectAvailable) {
                CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "login", [options, function(response, error) {
                    me._currentSession = fromCocoonFBSessionToFBAPISession(response,error);
                    if (callback) {
                        callback(me._currentSession);
                    }

                }], true);
            }
            else {
                FB.login(function(response){
                    me._currentSession = response;
                    if (callback)
                        callback(response);
                }, options);
            }

        },

        /**
         * Log the user out of your application
         * You will need to have a valid access token for the user in order to call the function.
         * @param {function} callback called when the user is logged out
         */
        logout: function(callback) {
            if (this.nativeExtensionObjectAvailable) {
                CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "logout", [function(response, error) {
                    if (callback) {
                        callback(fromCocoonFBSessionToFBAPISession(response, error));
                    }

                }],true);
            }
            else {
                FB.logout(function(response){
                    if (callback) {
                        callback(response);
                    }
                });
            }

        },

        /**
         * Synchronous accessor for the current authResponse
         * @returns {object} current Facebook session data
         */
        getAuthResponse: function() {

            if (this.nativeExtensionObjectAvailable) {
                var response = CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "getFacebookSession", []);
                return fromCocoonFBSessionToFBAPISession(response);
            }
            else {
                return FB.getAuthResponse();
            }

        },

        /**
         * Allows you to determine if a user is logged in to Facebook and has authenticated your app.
         * There are three possible states for a user:
         * 1. the user is logged into Facebook and has authenticated your application (connected)
         * 2. the user is logged into Facebook but has not authenticated your application (not_authorized)
         * 3. the user is not logged into Facebook at this time and so we don't know if they've authenticated your application or not
         * @param {function} callback The callback function.
         * @param {boolean} force Force reloading the login status (default false).
         */
        getLoginStatus: function(callback, force) {
            if (this.nativeExtensionObjectAvailable) {

                var me = this;
                setTimeout(function(){
                    var response = CocoonJS.makeNativeExtensionObjectFunctionCall(me.nativeExtensionName, "getFacebookSession", []);
                    if (callback) {
                        callback(fromCocoonFBSessionToFBAPISession(response));
                    }

                },50);
            }
            else {
                FB.getLoginStatus(callback, force);
            }

        },
        /**
         * Makes API calls to the Graph API.
         * @param path The Graph API url path
         * @param method the http method (default "GET")
         * @param params the parameters for the query
         * @param cb the callback function to handle the response
         */
        api: function(path, method, params, cb ) {

            if (this.nativeExtensionObjectAvailable) {
                var openGraph = arguments[0];
                var httpMethod = arguments.length > 3 ? arguments[1] : "GET";
                var options = null;
                if (arguments.length == 3) options = arguments[1];
                if (arguments.length == 4) options = arguments[2];
                var callback = arguments.length > 1 ? arguments[arguments.length -1 ] : function(){};

                return CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "api", [openGraph, httpMethod, options, callback], true);
            }
            else {
                FB.api(path,method,params,cb);
            }
        },

        /**
         * A generic method for triggering Dialogs which allow the user to take some action.
         * @param params The required arguments vary based on the method being used, but specifying the method itself is mandatory
         * @param cb Callback function to handle the result. Not all methods may have a response.
         */
        ui: function(params, cb) {

            if (this.nativeExtensionObjectAvailable){
                var params = arguments[0];
                var callback = arguments.length > 1 ? arguments[1]: function(){};

                return CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "ui", [params, callback], true);
            }
            else if (!navigator.isCocoonJS)
            {
                FB.ui(params,cb);
            }
        },

        /**
         * @param {string} permissionsType "read" or "publish"
         * @param permissions comma separated Facebook permission names
         * @param callback response authResponse callback
         */

        requestAdditionalPermissions: function(permissionsType, permissions, callback) {
            if (this.nativeExtensionObjectAvailable) {

                var permsArray = permissions.split(',');
                CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "requestAdditionalPermissions", [permissionsType, permsArray, function(session, error){
                    if (callback) {
                        callback(fromCocoonFBSessionToFBAPISession(session,error));
                    }
                }], true);
            }
            else {
                FB.login(callback, {scope:permissions});
            }
        },

        /**
         * Query the current user facebook permissions
         * @param callback Handler function which receives a dictionary with the granted permissions
         */
        getPermissions: function(callback) {
            this.api('me/permissions', function(response) {
                callback(response.data && response.data[0] ? response.data[0] : {});
            });
        },

        /**
         * Presents a dialog in the Facebook application that allows the user to share a status update
         * If the Facebook Application is not available it does a fallback to a feed dialog
         * No publish permissions are required.
         * @param params Dialog params (description, caption, name, link, picture)
         * @param callback Handler with response data or error
         */
        showShareDialog: function(params, callback) {
            if (this.nativeExtensionObjectAvailable) {
                CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "showShareDialog", [params, callback], true);
            }
            else {
                params.method = "feed";
                FB.ui(params, callback);
            }
        },

        /**
         * Upload a local image file to Facebook and get response
         * @param file The local file url to submit to Facebook (For example the one capture with screenCapture API)
         * @param callback Handler to process response with the photoid and other data or the error
         */
        uploadPhoto: function(file, callback) {
            if (this.nativeExtensionObjectAvailable) {
                CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "uploadPhoto", [file, callback], true);
            }
            else {
                //TODO
                callback({error: {message: "Not implemented"}});
            }
        },

        /**
         * Shows a native UI component that can be used to pick friends.
         * @param callback Handlerv function. The response contains the boolen 'donePressed' value and an array of selected users in the 'selection' property.
         */
        showFriendPicker: function(callback) {
            if (this.nativeExtensionObjectAvailable) {
                CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "showFriendPicker", [callback], true);
            }
            else {
                //TODO
                callback({error: {message: "Not implemented"}});
            }
        }

    };

    /**
     * @class
     * @constructor
     */
    CocoonJS.Social.FacebookEvent = function(nativeAvailable ) {
        this.nativeExtensionObjectAvailable = nativeAvailable;
        return this;
    }

    CocoonJS.Social.FacebookEvent.prototype = {
        /**
         * Global Events to which you can subscribe:
         * auth.login - fired when the auth status changes from unknown to connected
         * auth.authResponseChange - fired when the authResponse changes
         * auth.statusChange - fired when the status changes
         * @param name Name of the event
         * @param callback The handler function
         */
        subscribe: function(name, callback){
            if (this.nativeExtensionObjectAvailable)
            {
                var eventKey = name + 'listeners';
                this[eventKey] = this[eventKey] || [];
                this[eventKey].push(callback);
            }
            else if (!navigator.isCocoonJS)
            {
                FB.Event.subscribe(name,callback);
            }
        },
        /**
         * Removes handlers on events so that it no longer invokes your callback when the event fires.
         * @param name Name of the event.
         * @param callback The handler function.
         */
        unsubscribe: function(name, callback) {
            if (this.nativeExtensionObjectAvailable)
            {
                var eventKey = name + 'listeners';
                var array = this[eventKey];
                if (array) {
                    var index = array.indexOf(callback);
                    if (index !== -1) {
                        array.splice(index,1);
                    }
                }
            }
            else if (!navigator.isCocoonJS)
            {
                FB.Event.unsubscribe(name,callback);
            }
        },

        /**
         * @ignore
         */
        notify: function(name, param) {
            var eventKey = name + 'listeners';
            var array = this[eventKey];
            if (array) {
                for (var i = 0; i< array.length; ++i) {
                    array[i](param);
                }
            }

        }
    };

    /**
     * @namespace 
     * This is the global variable that enables access to the Facebook API mimic and the high level abstract API
     * to handle Social aspects, created by Ludei.
     * @see CocoonJS.Social.FacebookExtension
     */
    CocoonJS.Social.Facebook = new CocoonJS.Social.FacebookExtension();

    /**
     * @ignore
     */
    function fromCocoonFBStatusToFBAPIState(state) {
        if (state === 0) {
            return "connected";
        }
        else if (state === 1) {
            return "not_authorized";
        }
        else {
            return "unknown";
        }
    }

    /**
     * @ignore
     */
    function fromCocoonFBSessionToFBAPISession(response, error) {

        var authResponse = null;
        if (response.state === 0) {
            authResponse = {
                accessToken: response.accessToken,
                expirationDate: response.expirationDate,
                userID: response.user ? response.userID : null,
                permissions: response.permissions,
                user: response.user
            }
        }

        return {
            status: fromCocoonFBStatusToFBAPIState(response.state),
            authResponse: authResponse,
            error: error
        }

    }

    CocoonJS.Social.SocialGamingServiceFacebook = function (fbExtension) {
        CocoonJS.Social.SocialGamingServiceFacebook.superclass.constructor.call(this);
        this.fb = fbExtension;
        var me = this;
        this.fb.Event.subscribe("auth.authResponseChange", function(session) {
            me.onLoginStatusChanged.notifyEventListeners(session.status == "connected", session.error);
        });
        return this;
    }

    CocoonJS.Social.SocialGamingServiceFacebook.prototype =  {

        currentPermissions: null,

        isLoggedIn: function() {
            return this.fb._currentSession && this.fb._currentSession.status === "connected";
        },
        login : function(callback) {
            var me = this;
            this.fb.login(function(response){
                if (callback)
                    callback(me.isLoggedIn(), response.error);
            });
        },
        logout: function(callback) {
            this.fb.logout(function(response){
                if (callback)
                    callback(response.error);
            });
        },
        getLoggedInUser : function() {
            var authResponse = this.fb._currentSession ? this.fb._currentSession.authResponse : null;
            if (authResponse && authResponse.user) {
                return fromFBUserToCocoonUser(authResponse.user);
            }
            else if (authResponse && authResponse.userID) {
                return new CocoonJS.Social.User(authResponse.userID, "Loading...");
            }
            return null;
        },
        hasPublishPermissions: function(callback) {
            this.fb.getPermissions(function(perms, error){
               callback(perms.publish_actions, error);
            });
        },
        requestPublishPermissions: function(callback) {
            var me = this;
            this.fb.requestAdditionalPermissions("publish", "publish_actions", function(response){
                if (response.error)
                    callback(false, error);
                else {
                    me.hasPublishPermissions(function(granted, error){
                        callback(granted,error);
                    });
                }
            });
        },
        requestUser: function(calback, userId) {
            var apiCall = (userId || "me");
            this.fb.api(apiCall, function(response){
                var user = response.error ? null : fromFBUserToCocoonUser(response);
                calback(user, response.error);
            });
        },
        requestUserImage: function(callback, userID, imageSize) {
            if (!userID && this.isLoggedIn()) {
                userID = this.fb._currentSession.authResponse.userID;
            }
            var fbPictureSize = "small";
            if (imageSize === CocoonJS.Social.ImageSize.THUMB) {
                  fbPictureSize = "square"
            }
            else if (imageSize === CocoonJS.Social.ImageSize.MEDIUM) {
                fbPictureSize = "normal";
            }
            else if (imageSize === CocoonJS.Social.ImageSize.LARGE) {
                fbPictureSize = "large";
            }
            var url = "https://graph.facebook.com/" + userID + "/picture?type=" + fbPictureSize;
            callback(url);
        },
        requestFriends: function(callback, userId) {
            var apiCall = (userId || "me") + "/friends";
            this.fb.api(apiCall, function(response){
                var friends = [];
                if (!response.error) {
                    for (var i=0; i<response.data.length; i++)
                    {
                        friends.push(fromFBUserToCocoonUser(response.data[i]));
                    }
                }
                callback(friends, response.error);
            });
        },

        //internal utility function
        preparePublishAction: function(callback) {
            if (!this.currentPermissions) {
                var me = this;
                this.fb.getPermissions(function(perms){
                    me.currentPermissions = perms;
                    if (perms)
                        me.preparePublishAction(callback);
                });
            }
            else if (this.currentPermissions.publish_actions) {
                callback(true);
            }
            else{
                this.currentPermissions = null;
                this.fb.requestAdditionalPermissions("publish", "publish_actions", function(response) {
                     callback(response.error ? false : true);
                });
            }

        },
        publishMessage: function(message, callback) {
            this.preparePublishAction(function(granted) {
                if (granted) {
                    var params = fromCocoonMessageToFBMessage(message);
                    var apiCall = "me/feed";
                    this.fb.api(apiCall, params, function(response) {
                        if (callback)
                            callback(response.error);
                    });
                }
                else {
                    if (callback)
                        callback({message: "No publish_actions permission granted"});
                }
            });
        },

        publishMessageWithDialog: function(message, callback) {
            this.fb.showShareDialog(fromCocoonMessageToFBMessage(message), function(response){
                 if (callback) {
                     callback(response.error);
                 }
            });
        },

        requestScore: function(callback, params) {
            var apiCall = ((params && params.userID) ? params.userID : "me") + "/scores";
            this.fb.api(apiCall, function(response) {
                if (response.error) {
                    callback(null, response.error)
                }
                else if (response.data && response.data.length > 0) {
                    var data = fromFBScoreToCocoonScore(response.data[0]);
                    callback(data, null);
                }
                else {
                    //No score has been submitted yet for the user
                    callback(null,null);
                }

            });
        },

        submitScore: function(score, callback, params) {
            var me = this;
            this.preparePublishAction(function(granted) {
                if (granted) {
                    me.requestScore(function(currentScore, error) {
                        if (error) {
                            //can't get the user top score. Don't send the new one because it might be worse than the top score
                            if (callback)
                                callback(error);
                           return;
                        }
                        var topScore = currentScore ? currentScore.score : 0;
                        if (score <= topScore) {
                            //don't submit the new score because a better score is already submitted
                            if (callback)
                                callback(null);
                            return;
                        }
                        var apiCall = "/" + ((params && params.userID) ? params.userID : "me") + "/scores";
                        me.fb.api(apiCall, 'POST', {score:score}, function (response) {
                             if (callback)
                                callback(response.error);
                        });
                    }, params)
                }
                else {
                    if (callback)
                        callback({message: "No publish_actions permission granted"});
                }

            })
        },

        showLeaderboard : function(callback, params) {
            if (!this._leaderboardsTemplate)
                throw "Please, provide a html template for leaderboards with the setTemplates method";
            var dialog = new CocoonJS.App.WebDialog();
            var callbackSent = false;
            dialog.show(this._leaderboardsTemplate, function(error) {
                dialog.closed = true;
                if (!callbackSent && callback)
                    callback(error);
            });
            var me = this;
            this.fb.api(me.fb._appId + "/scores", function(response) {
                if (dialog.closed)
                    return;
                if (response.error) {
                    if (callback) {
                        callbackSent = true;
                        callback(response.error);
                        dialog.close();
                    }
                    return;
                }
                var scores = [];
                if (response.data && response.data.length) {
                    for (var i = 0; i< response.data.length; ++i) {
                        var score = fromFBScoreToCocoonScore(response.data[i]);
                        score.position = i;
                        score.imageURL = "https://graph.facebook.com/" + score.userID + "/picture";
                        score.me = score.userID === me.fb._currentSession.authResponse.userID;
                        scores.push(score);
                    }
                }
                var js = "addScores(" + JSON.stringify(scores) + ")";
                dialog.eval(js);
            });
        },

        //internal utility function
        prepareAchievements: function(reload, callback) {

            if (!this._cachedAchievements || reload) {
                var me = this;
                this.fb.api(this.fb._appId + '/achievements', function(response) {
                    if (!response.error) {
                        var achievements = [];
                        if (response.data) {
                            for (var i = 0; i < response.data.length; i++) {
                                achievements.push(fromFBAchievementToCocoonAchievement(response.data[i]))
                            }
                        }
                        me.setCachedAchievements(achievements);
                        callback(achievements, null);
                    }
                    else {
                        callback([], response.error);
                    }
                });
            }
            else {
                callback(this._cachedAchievements, null);
            }
        },

        requestAllAchievements : function(callback) {
            this.prepareAchievements(true, callback);
        },

        requestAchievements : function(callback, userID) {
            var me = this;
            this.prepareAchievements(false, function(allAchievements, error){

                if (error) {
                    callback([], error);
                    return;
                }
                var apiCall = (userID || "me") + "/achievements";
                me.fb.api(apiCall, function(response) {
                    if (!response.error) {
                        var achievements = [];
                        if (response.data) {
                            for (var i = 0; i < response.data.length; i++) {
                                var ach = me.findAchievement((response.data[i].achievement || response.data[i].data.achievement).id);
                                if (ach)
                                    achievements.push(ach);
                            }
                        }
                        callback(achievements, null);
                    }
                    else {
                        callback([], response.error);
                    }
                });

            });
        },
        submitAchievement: function(achievementID, callback) {
            if (achievementID === null || typeof achievementID === 'undefined')
                throw "No achievementID specified";
            var achID = this.translateAchievementID(achievementID);
            var me = this;
            this.preparePublishAction(function(granted) {
                if (granted) {
                    me.fb.api("me/achievements", "POST", {achievement:achID}, function (response) {
                        if (callback) {
                            callback(response.error);
                        }
                    });
                }
                else {
                    if (callback)
                        callback({message: "No publish_actions permission granted"});
                }

            });
        },
        resetAchievements : function(callback) {
            var me = this;
            this.preparePublishAction(function(granted) {
                if (granted) {
                    me.requestAchievements(function(achievements, error){
                        if (error) {
                            if (callback)
                                callback(error);
                            return;
                        }
                        var someError = null;
                        var remaining = achievements.length;
                        for (var i = 0; i < achievements.length; ++i) {
                            me.fb.api("me/achievements", "DELETE", {achievement:achievements[i].fbAchievementData.url}, function (response) {
                                if (response.error) {
                                   someError = response.error;
                                }
                                remaining--;
                                if (remaining == 0 && callback) {
                                    callback(someError);
                                }
                            });
                        }

                    });
                }
                else {
                    if (callback)
                        callback({message: "No publish_actions permission granted"});
                }

            });
        },
        showAchievements : function(callback) {
            if (!this._achievementsTemplate)
                throw "Please, provide a html template for achievements with the setTemplates method";
            var dialog = new CocoonJS.App.WebDialog();
            var callbackSent = false;
            dialog.show(this._achievementsTemplate, function(error) {
                dialog.closed = true;
                if (!callbackSent && callback)
                    callback(error);
            });
            var me = this;
            this.requestAchievements(function(achievements, error){
                if (dialog.closed)
                    return;
                if (error) {
                    callbackSent = true;
                    if (callback)
                        callback(error);
                    return;
                }

                var achs = [];
                if (me._cachedAchievements) {
                    for (var i = 0; i < me._cachedAchievements.length; ++i) {
                        var ach = me._cachedAchievements[i];
                        achs.push(ach);
                        if (achievements && achievements.length) {
                            for (var j = 0; j< achievements.length; ++j) {
                                if (achievements[j].achievementID === ach.achievementID) {
                                    ach.achieved = true;
                                    break;
                                }
                            }
                        }
                    }
                }
                var js = "addAchievements(" + JSON.stringify(achs) + ");";
                dialog.eval(js);
            });
        }
    }

    CocoonJS.extend(CocoonJS.Social.SocialGamingServiceFacebook, CocoonJS.Social.SocialGamingService);

    /**
     *@ignore
     */
    function fromFBUserToCocoonUser (facebookUser) {
        return new CocoonJS.Social.User (facebookUser.id, facebookUser.username);
    }

    /**
     *@ignore
     */
    function fromCocoonMessageToFBMessage(message) {
        return {
            link: message.linkURL,
            description: message.message,
            name: message.linkText,
            caption: message.linkCaption,
            picture: message.mediaURL
        }
    }
    /**
     *@ignore
     */
    function fromFBScoreToCocoonScore(fbResponse, requestScoreParams) {
        var result = new CocoonJS.Social.Score(fbResponse.user.id, fbResponse.score, fbResponse.user.name);
        if (requestScoreParams) {
            result.leaderboardID = requestScoreParams.leaderboardID;
        }
        result.imageURL = 'https://graph.facebook.com/' + fbResponse.user.id + '/picture';
        return result;
    }
    /**
     *@ignore
     */
    function fromFBAchievementToCocoonAchievement(fbResponse) {
        var result = new CocoonJS.Social.Achievement (
            fbResponse.id,
            fbResponse.title,
            fbResponse.description,
            fbResponse.image[0].url,
            fbResponse.data.points
        );
        result.fbAchievementData = fbResponse;
        return result;
    }

    if (!navigator.isCocoonJS) {
        // Load the Facebook SDK
        var parent = document.getElementsByTagName('script')[0];
        var script = document.createElement('script');
        //script.async = true;
        var prot= location.protocol ? location.protocol : "http:"
        script.src = prot + "//connect.facebook.net/en_US/all.js";
        parent.parentNode.insertBefore(script, parent);
    }

})();;(function() {

    // The CocoonJS must exist before creating the extension.
    if (typeof window.CocoonJS === 'undefined' || window.CocoonJS === null) throw("The CocoonJS object must exist and be valid before creating any extension object.");
    if (typeof window.CocoonJS.Social === 'undefined' || window.CocoonJS === null) throw("The CocoonJS.Social object must exist and be valid before creating a Social Local Storage extension object.");


    /**
     * @constructor
     */
    CocoonJS.Social.LocalStorageService = function() {
        CocoonJS.Social.LocalStorageService.superclass.constructor.call(this);
        this.fakeSocialService = true;
    }

    CocoonJS.Social.LocalStorageService.prototype = {

        loggedIn: false,
        keys: {
            score: "CocoonJS.Social.LocalStorageService.score",
            earnedAchievements: "CocoonJS.Social.LocalStorageService.earned"
        },
        isLoggedIn: function() {
            return this.loggedIn;
        },

        login : function(callback) {
            if (!this.loggedIn)
                this.onLoginStatusChanged.notifyEventListeners(true);
            this.loggedIn = true;
            if (callback)
                setTimeout(function(){callback(true)},0);
        },

        logout: function(callback) {
            if (this.loggedIn)
                this.onLoginStatusChanged.notifyEventListeners(true);
            this.loggedIn = false;

            if (callback)
                setTimeout(function(){callback()},0);
        },

        getLoggedInUser : function() {
            return new CocoonJS.Social.User("me", "LocalStorage");
        },

        requestUser: function(callback, userID) {
            var user = new CocoonJS.Social.User(userID || "me", "LocalStorage");
            if (callback)
                setTimeout(function(){callback(user)},0);
        },

        requestScore: function(callback, params) {
            var scoreItem = localStorage.getItem(this.keys.score);
            var score = parseInt(scoreItem) || 0;
            setTimeout(function(){callback(new CocoonJS.Social.Score("me", score))},0);
        },

        submitScore: function(score, callback, params ) {
            var scoreItem = localStorage.getItem(this.keys.score);
            var topScore = parseInt(scoreItem) || 0;
            if (score > topScore)
                localStorage.setItem(this.keys.score, score);
            if (callback)
                setTimeout(function(){callback()},0);
        },
        getLocalStorageEarnedAchievements: function() {
            var achievementsItem = localStorage.getItem(this.keys.earnedAchievements);
            var earned = [];
            if (achievementsItem) {
                var array = JSON.stringify(achievementsItem);
                if (array && array.length) {
                    earned = array;
                }
            }
            return earned;
        },
        requestAchievements : function(callback, userID) {
            var earned = this.getLocalStorageEarnedAchievements();
            setTimeout(function(){callback(earned)},0);
        },

        submitAchievement: function(achievementID, callback) {
            if (achievementID === null || typeof achievementID === 'undefined')
                throw "No achievementID specified";
            var earned = this.getLocalStorageEarnedAchievements();
            var exists = false;
            for (var i = 0; i< earned.length; ++i) {
               if (earned[i] === achievementID) {
                   exists = true;
                   break;
               }
            }
            if (!exists) {
                earned.push(achievementID);
                localStorage.setItem(this.keys.earnedAchievements, JSON.stringify(earned));
            }

            if (callback)
                setTimeout(function(){callback()},0);
        },
        resetAchievements : function(callback) {
            localStorage.removeItem(this.keys.earnedAchievements);
            if (callback)
                setTimeout(function(){callback()},0);
        }
    };

    CocoonJS.extend(CocoonJS.Social.LocalStorageService, CocoonJS.Social.SocialGamingService);

    CocoonJS.Social.LocalStorage = new CocoonJS.Social.LocalStorageService();

})();;(function() {

    // The CocoonJS must exist before creating the extension.
    if (!window.CocoonJS) throw("The CocoonJS object must exist and be valid before creating any extension object.");

    CocoonJS.Multiplayer = {};

	/**
	* This type represents the access to a native Multiplayer extension API.
    * This service allows to programmatically create matches to invite other players and to receive match invitations sent by other players.
    * Your game must authenticate the related social service before you can use this service.
	* @class
	* @constructor
	* @param {string} nativeExtensionName The name of the native ext object extension property name.
	* @param {string} extensionName The name of the CocoonJS object extension property name.
	*/
	CocoonJS.Multiplayer.MultiplayerService = function(nativeExtensionName, extensionName)
	{
		if (typeof nativeExtensionName !== 'string') throw "The given native extension name '" + nativeExtensionName + "' is not a string.";
		if (typeof extensionName !== 'string') throw "The given extension name '" + nativeExtensionName + "' is not a string.";

		this.nativeExtensionName = nativeExtensionName;
		this.extensionName = extensionName;
	    this.nativeExtensionObjectAvailable = CocoonJS.nativeExtensionObjectAvailable && typeof window.ext[nativeExtensionName] !== 'undefined';

        var me = this;

        /**
         * This {@link CocoonJS.EventHandler} object allows listening to events called when an invitation has been received from another player and the user has accepted it
         * The invitation will start loading.
         * While the invitation is loading a system view might appear on the screen.
         * You should pause/stop your current game and prepare it to process a new match
         * @memberOf CocoonJS.Multiplayer.MultiplayerService
         */
        this.onInvitationReceived = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onInvitationReceived");
        /**
         * This {@link CocoonJS.EventHandler} object allows listening to events called when an accepted invitation has been loaded
         * The invitation is ready to be processed (start the match or handle the error)
         * @memberOf CocoonJS.Multiplayer.MultiplayerService
         * Received params: {CocoonJS.Multiplayer.Match} and error
         */
        this.onInvitationLoaded = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onInvitationLoaded", function(sourceListener, args){
            var matchID = args[0];
            var error = args[1];
            if (matchID && !error) {
                me.currentMatch =  new CocoonJS.Multiplayer.Match(me.nativeExtensionName, me.extensionName, matchID);
                sourceListener(me.currentMatch, null)
            }
            else {
                sourceListener(null, error);
            }
        });



        return this;
	};


	CocoonJS.Multiplayer.MultiplayerService.prototype = {

        currentMatch: null,

        /**
         * Presents a system View for the matchmaking and creates a new Match
         * @param {CocoonJS.Multiplayer.MatchRequest} matchRequest The parameters for the match
         * @param {Function} callback The callback function. Response parameters: {CocoonJS.Multiplayer.Match} and error;
         */
        findMatch : function(matchRequest, callback)  {
            var me = this;
            if (this.nativeExtensionObjectAvailable) {
                CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "findMatch", [matchRequest, function(matchID,error) {
                    if (matchID && !error) {
                        me.currentMatch =  new CocoonJS.Multiplayer.Match(me.nativeExtensionName, me.extensionName, matchID);
                        callback(me.currentMatch, null)
                    }
                    else {
                        callback(null, error);
                    }
                }], true);
            }
        },

        /**
         * Sends an automatch request to join the authenticated user to a match. It doesn't present a system view while waiting to other players.
         * @param  {CocoonJS.Multiplayer.MatchRequest} matchRequest The parameters for the match
         * @param {Function} callback The callback function. Response parameters: {CocoonJS.Multiplayer.Match} and error;
         */
        findAutoMatch : function(matchRequest, callback) {
            var me = this;
            if (this.nativeExtensionObjectAvailable) {
                CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "findAutoMatch", [matchRequest, function(matchID, error){
                    if (matchID && !error) {
                        me.currentMatch =  new CocoonJS.Multiplayer.Match(me.nativeExtensionName, me.extensionName, matchID);
                        callback(me.currentMatch, null)
                    }
                    else {
                        callback(null, error);
                    }
                }], true);
            }
        },

        /**
         * Cancels the ongoing automatch request
         */
        cancelAutoMatch : function() {
            if (this.nativeExtensionObjectAvailable) {
                CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "cancelAutoMatch", [], true);
            }
        },

        /**
         * Automatically adds players to an ongoing match owned by the user.
         * @param {CocoonJS.Multiplayer.MatchRequest} matchRequest The parameters for the match
         * @param {CocoonJS.Multiplayer.Match} matchRequest The match where new players will be added
         * @param {Function} callback The callback function. Response parameters: error
         */
        addPlayersToMatch : function(matchRequest, match, callback) {
            if (this.nativeExtensionObjectAvailable) {
                CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "addPlayersToMatch", [matchRequest, match.matchID, callback], true);
            }
        },
        /**
         * Get the current match reference.
         * @return {CocoonJS.Multiplayer.Match} the current match reference
         */
        getMatch : function() {
            return this.currentMatch;
        }
	};

	/**
	* This type provides a transmission network between a group of users.
	* The match might be returned before connections have been established between players. At this stage, all the players are in the process of connecting to each other.
	* Always check the getExpectedPlayerCount value before starting a match. When its value reaches zero, all expected players are connected, and your game can begin the match.
	* Do not forget to call the start method of the match when your game is ready to process received messages via onMatchDataReceived listener.
	* @class
	* @constructor
	* @param {string} nativeExtensionName The name of the native ext object extension property name.
	* @param {string} extensionName The name of the CocoonJS object extension property name.
	* @param {number} matchID The match ID user for native service bridge.
	*/
	CocoonJS.Multiplayer.Match = function(nativeExtensionName, extensionName, matchID)
	{
		if (typeof nativeExtensionName !== 'string') throw "The given native extension name '" + nativeExtensionName + "' is not a string.";
		if (typeof extensionName !== 'string') throw "The given extension name '" + nativeExtensionName + "' is not a string.";

		this.nativeExtensionName = nativeExtensionName;
		this.extensionName = extensionName;
	    this.nativeExtensionObjectAvailable = CocoonJS.nativeExtensionObjectAvailable && typeof window.ext[nativeExtensionName] !== 'undefined';
	    this.matchID = matchID;
	    var me = this;


	    /**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when a match receives data from the network
	    * The callback function's documentation is represented by {@link CocoonJS.Social.OnMatchDataReceivedListener}
	    * @memberOf CocoonJS.Multiplayer.Match
	    * @param {CocoonJS.Multiplayer.Match} match The source match.
	    * @param {string} data The received data
	    * @param {string} playerID The playerID where the data is received from.
	    */
	    this.onMatchDataReceived = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onMatchDataReceived", function(sourceListener, args) {
	    		if (me.matchID === args[0]) {
	    			sourceListener(me, args[1], args[2]);
	    		}
	    	});

	    /**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when a player connection state changes.
	    * The callback function's documentation is represented by {@link CocoonJS.Social.OnMatchStateChangedListener}
	    * @memberOf CocoonJS.Multiplayer.Match
	    * @param {CocoonJS.Multiplayer.Match} match The source match.
	    * @param {string} playerID The player whose state has changed
	    * @param {CocoonJS.Multiplayer.ConnectionState} The new connection state of the player
	    */
	    this.onMatchStateChanged = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onMatchStateChanged", function(sourceListener, args) {
	    		if (me.matchID === args[0]) {
	    			sourceListener(me, args[1], args[2]);
	    		}
	    	});

	    /**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when a netowrk connection with a player fails
	    * The callback function's documentation is represented by {@link CocoonJS.Social.OnMatchConnectionWithPlayerFailedListener}
	    * @memberOf CocoonJS.Multiplayer.Match
	    * @param {CocoonJS.Multiplayer.Match} match The source match.
	    * @param {string} playerID The player whose state has changed
	    * @param {string} error The error message
	    */
	    this.onMatchConnectionWithPlayerFailed = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onMatchConnectionWithPlayerFailed", function(sourceListener, args) {
	    		if (me.matchID === args[0]) {
	    			sourceListener(me, args[1], args[2]);
	    		}
	    	});

	    /**
	    * This {@link CocoonJS.EventHandler} object allows listening to events called when the match fails
	    * The callback function's documentation is represented by {@link CocoonJS.Social.OnMatchFailedListener}
	    * @memberOf CocoonJS.Multiplayer.Match
	    * @param {CocoonJS.Multiplayer.Match} match The source match.
	    * @param {string} error The error message
	    */
	    this.onMatchFailed = new CocoonJS.EventHandler(this.nativeExtensionName, this.extensionName, "onMatchFailed", function(sourceListener, args) {
	    		if (me.matchID === args[0]) {
	    			sourceListener(me, args[1]);
	    		}
	    	});
	};

	CocoonJS.Multiplayer.Match.prototype = {

		/**
		* Start processing received messages. The user must call this method when the game is ready to process messages. Messages received before being prepared are stored and processed later.
		* @see CocoonJS.Multiplayer.Match.onMatchDataReceived
		*/
		start : function() {
			if (this.nativeExtensionObjectAvailable) {
				CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "startMatch", [this.matchID], true);
			}
		},

		/**
		* Transmits data to all players connected to the match. The match queues the data and transmits it when the network becomes available.
		* @see CocoonJS.Multiplayer.Match.onMatchDataReceived
		* @see CocoonJS.Multiplayer.Match.onMatchStateChanged
		* @see CocoonJS.Multiplayer.Match.onMatchConnectionWithPlayerFailed
		* @see CocoonJS.Multiplayer.Match.onMatchFailed
		* @param {string} data The data to transmit
		* @param {CocoonJS.Multiplayer.SendDataMode} sendMode The optional {@link CocoonJS.Multiplayer.SendDataMode} value. The default value is RELIABLE.
		* @return {boolean} TRUE if the data was successfully queued for transmission; FALSE if the match was unable to queue the data
		*/
		sendDataToAllPlayers : function(data, sendMode) {
			if (this.nativeExtensionObjectAvailable) {
				return CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "sendDataToAllPlayers", [this.matchID, data, sendMode]);
			}
		},

		/**
		* Transmits data to a list of connected players. The match queues the data and transmits it when the network becomes available.
		* @see CocoonJS.Multiplayer.Match.onMatchDataReceived
		* @see CocoonJS.Multiplayer.Match.onMatchStateChanged
		* @see CocoonJS.Multiplayer.Match.onMatchConnectionWithPlayerFailed
		* @see CocoonJS.Multiplayer.Match.onMatchFailed
		* @param {string} data The data to transmit
		* @param {array} playerIDs An array containing the identifier strings for the list of players who should receive the data
		* @param {CocoonJS.Multiplayer.SendDataMode} sendMode The optional {@link CocoonJS.Multiplayer.SendDataMode} value. The default value is RELIABLE.
		* @return {boolean} TRUE if the data was successfully queued for transmission; FALSE if the match was unable to queue the data
		*/
		sendData : function(data, playerIDs,  sendMode) {
			if (this.nativeExtensionObjectAvailable) {
				return CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "sendData", [this.matchID, data, playerIDs, sendMode]);
			}
		},

		/**
		* Disconnects the local player from the match and releases the match. Calling disconnect notifies other players that you have left the match.
		* @see CocoonJS.Multiplayer.Match.onMatchDataReceived
		* @see CocoonJS.Multiplayer.Match.onMatchStateChanged
		* @see CocoonJS.Multiplayer.Match.onMatchConnectionWithPlayerFailed
		* @see CocoonJS.Multiplayer.Match.onMatchFailed
		*/
		disconnect : function() {
			if (this.nativeExtensionObjectAvailable) {
				return CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "disconnect", [this.matchID], true);
			}
		},

		/**
		* Requests additional information of the current players in the match
        * @param {Function} callback The callback function. Response params: players array and error
		*/
		requestPlayersInfo : function(callback) {
			if (this.nativeExtensionObjectAvailable){
				return CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "requestPlayersInfo", [this.matchID, callback], true);
			}
		},

		/**
		* Method to request the remaining players count who have not yet connected to the match.
		* @function
		* @return {number} The remaining number of players who have not yet connected to the match
		*/
		getExpectedPlayerCount : function() {
			if (this.nativeExtensionObjectAvailable) {
				return CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "getExpectedPlayerCount", [this.matchID]);
			}
		},
		/**
		* This method returns an array with all the player identifiers taking part in the match.
		* @return {array} The player identifiers for the players in the match
		*/
		getPlayerIDs : function() {
			if (this.nativeExtensionObjectAvailable){
				return CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "getPlayerIDs", [this.matchID]);
			}
		},

        /**
         * Gets the local playerID taking part in the match.
         * @return {string} the playerID attached to the match manager.
         */
        getLocalPlayerID : function() {
            if (this.nativeExtensionObjectAvailable) {
                return CocoonJS.makeNativeExtensionObjectFunctionCall(this.nativeExtensionName, "getLocalPlayerID", [this.matchID]);
            }
            return "";
        },

	};

	/**
	* This enum represents the modes to send data
	* @namespace
	* @enum
	*/
	CocoonJS.Multiplayer.SendDataMode =  {
		/**
		* The data is sent continuously until it is successfully received by the intended recipients or the connection times out
		*/
	    RELIABLE : 0,

		/**
		* The data is sent once and is not sent again if a transmission error occurs.
		*/
	    UNRELIABLE : 1
	};


	/**
	* This enum represents the connection state of a player
	* @namespace
	* @enum
	*/
	CocoonJS.Multiplayer.ConnectionState = {
		/**
		* The connection is in unknown state.
		*/
	    UNKNOWN : 0,

	    /**
		* The connection is in connected state.
		*/
	    CONNECTED : 1,

	    /**
		* The connection is in disconnected state.
		*/
	    DISCONNECTED : 2
	};

	/**
	* The data structure that represents the information of a player inside a multiplayer match.
	* @class
	* @constructor
	* @param {string} The id of the user.
	* @param {string} The name of the user.
	*/
	CocoonJS.Multiplayer.PlayerInfo = function(userID, userName) {
		/**
		* The id of the user.
		* @field
		* @type string
		*/
		this.userID = userID;

		/**
		* The name of the user.
		* @field
		* @type string
		*/
		this.userName = userName;
	};

	/**
	* This data structure is used to specify the parameters for a new new multiplayer match.
	* @class
	* @constructor
	* @param {number} minPlayers The minimum number of players that may join the match.
	* @param {number} maxPlayers The maximum number of players that may join the match.
	* @param {array}  [playersToInvite] Optional list of player identifers for players to invite to the match.
	* @param {number} [playerGroup] Optional number identifying a subset of players allowed to join the match.
	* @param {number} [playerAttributes] Optional mask that specifies the role that the local player would like to play in the game.
	*/
	CocoonJS.Multiplayer.MatchRequest = function(minPlayers, maxPlayers, playersToInvite, playerGroup, playerAttributes) {
		/**
		* The minimum number of players that may join the match.
		* @field
		* @type number
		*/
		this.minPlayers = minPlayers;

		/**
		* The maximum number of players that may join the match.
		* @field
		* @type number
		*/
		this.maxPlayers = maxPlayers;

		/**
		* Optional list of player identifers for players to invite to the match.
		* @field
		* @type Array
		*/
		this.playersToInvite = playersToInvite;

		/**
		* Optional number identifying a subset of players allowed to join the match.
		* @field
		* @type number
		*/
		this.playerGroup = playerGroup;

		/**
		* Optional mask that specifies the role that the local player would like to play in the game.
		* @field
		* @type number
		*/
		this.playerAttributes = playerAttributes;

		return this;
	};

})();;(function()
{
    // The CocoonJS must exist before creating the extension.
    if (!window) throw("The CocoonJS object must exist and be valid before creating any extension object.");
    if (!window.CocoonJS.Multiplayer) throw("The CocoonJS.Multiplayer object must exist and be valid before creating a Game Center extension object.");

	/**
	* @namespace
	* This instance represents the extension object to access GameCenter Multiplayer API.
	* @see CocoonJS.Multiplayer.MultiplayerService
	*/
	CocoonJS.Multiplayer.GameCenter = new CocoonJS.Multiplayer.MultiplayerService("IDTK_SRV_MULTIPLAYER_GAMECENTER", "Multiplayer.GameCenter");
})();;(function()
{
    // The CocoonJS must exist before creating the extension.
    if (!window.CocoonJS) throw("The CocoonJS object must exist and be valid before creating any extension object.");
    if (!window.CocoonJS.Multiplayer) throw("The CocoonJS.Multiplayer object must exist and be valid before creating a Multiplayer Loopback extension object.");


    var loopbackServices = [];
    var indexCounter = 0;
    var matchServices = [];
    var matchCounter = 0;

    /**
     * This service provides a loopback implementation of the {@link CocoonJS.Multiplayer.MultiplayerService}
     * @constructor
     */
    CocoonJS.Multiplayer.LoopbackService = function() {

        CocoonJS.Multiplayer.LoopbackService.superclass.constructor.call(this, "dummy","dummy");
        loopbackServices.push(this);
        this.playerID = "" + indexCounter;
        indexCounter++;

    }

    CocoonJS.Multiplayer.LoopbackService.prototype =  {

        findMatch : function(request, callback)  {

            this.findMatchCallback = callback;

            //checks if the service is already added to the match list
            var exists = false;
            for (var i = 0; i< matchServices.length; ++i) {
                if (matchServices[i] === this) {
                    exists = true; break;
                }
            }
            if (!exists)
                matchServices.push(this);

            //Create the match is all required players are ready
            //TODO: check more conditions (playerGroup, playerAttributes) to complete a match
            if (matchServices.length >= request.minPlayers) {
                var playerIDs = [];
                //create playerIDs array
                for (var i = 0; i< matchServices.length; ++i) {
                    playerIDs.push(matchServices[i].getPlayerID());
                }

                //notify the found match to each manager
                for (var i = 0; i< matchServices.length; ++i) {
                    var match = new LoopbackMatch(matchServices[i]);
                    match.playerIDs = playerIDs.slice();
                    matchServices[i].currentMatch = match;
                    matchServices[i].findMatchCallback(match, null);
                }
                //clear pending list
                matchServices = [];
            }


        },
        findAutoMatch : function(matchRequest, callback) {
            this.findMatch(matchRequest,callback);
        },
        cancelAutoMatch : function() {

        },

        addPlayersToMatch : function(matchRequest, match, callback) {
            callback({message:"Not implemmented"});
        },
        getPlayerID : function() {
            return this.playerID;
        },

        getMatch : function() {
            return this.currentMatch;
        }
    }

    CocoonJS.extend(CocoonJS.Multiplayer.LoopbackService, CocoonJS.Multiplayer.MultiplayerService);

    var LoopbackMatch = function(service) {
        matchCounter++;
        LoopbackMatch.superclass.constructor.call(this, "","",matchCounter);
        this.started = false;
        this.disconnected = false;
        this.pendingData = [];
        this.service = service;
    }

    LoopbackMatch.prototype = {

        start : function() {
            var me = this;
            setTimeout(function() {
                me.started = true;
                for (var i = 0; i < me.pendingData.length; ++i) {
                    me.onMatchDataReceived.notifyEventListeners(me.matchID,me.pendingData[i].data, me.pendingData[i].player);
                }

            },0);

        },
        sendDataToAllPlayers : function(data, sendMode) {
            this.sendData(data, this.playerIDs, sendMode);
        },

        sendData : function(data, playerIDs,  sendMode) {
            var me = this;
            setTimeout(function() {
                for (var i = 0; i< loopbackServices.length; ++i) {
                    var destService = null;
                    for (var j = 0; j < playerIDs.length; ++j) {
                        if (playerIDs[j] === loopbackServices[i].getPlayerID()) {
                            destService = loopbackServices[i];
                        }
                    }
                    if (destService) {
                        destService.getMatch().notifyDataReceived(data,me.service.getPlayerID());
                    }
                }
            },0);
        },

        disconnect : function() {
            this.disconnected = true;
            for (var i = 0; i < this.playerIDs.length; ++i) {
                var p = this.playerIDs[i];
                for (var j = 0; j < loopbackServices.length; ++j) {
                    if (loopbackServices[j].getPlayerID() === p) {
                        var match = loopbackServices[i].getMatch();
                        if (!match.disconnected) {
                            match.onMatchStateChanged.notifyEventListeners(match, this.service.getPlayerID(), CocoonJS.Multiplayer.ConnectionState.DISCONNECTED);
                        }
                    }
                }
            }
        },

        requestPlayersInfo : function(callback) {
            var me = this;
            setTimeout(function() {
               var playersInfo = [];
                for (var i = 0; i < me.playerIDs.length; ++i) {
                    playersInfo[i] = {userID: me.playerIDs[i], userName: "Player" + me.playerIDs[i]};
                };
                callback(playersInfo);
            },1);
        },

        getExpectedPlayerCount : function() {
            return 0;
        },
        getPlayerIDs : function() {
            return this.playerIDs;
        },
        getLocalPlayerID: function() {
            return this.service.playerID;
        },
        notifyDataReceived: function(data, fromPlayer) {
            if (!this.started) {
                this.pendingData.push({data:data, player:fromPlayer});
            }
            else {
                this.onMatchDataReceived.notifyEventListeners(this.matchID,data,fromPlayer);
            }
        }

    };

    CocoonJS.extend(LoopbackMatch, CocoonJS.Multiplayer.Match);

})();;(function()
{
    // The CocoonJS must exist before creating the extension.
    if (!window) throw("The CocoonJS object must exist and be valid before creating any extension object.");
    if (!window.CocoonJS.Multiplayer) throw("The CocoonJS.Multiplayer object must exist and be valid before creating a Google Play Games extension object.");

    /**
     * @namespace
     * This instance represents the extension object to access Google Play Games Multiplayer API.
     * @see CocoonJS.Multiplayer.MultiplayerService
     */
    CocoonJS.Multiplayer.GooglePlayGames = new CocoonJS.Multiplayer.MultiplayerService("IDTK_SRV_MULTIPLAYER_GPG", "Multiplayer.GooglePlayGames");
})();
;(function()
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

})();;(function()
{
    // The CocoonJS must exist before creating the extension.
    if (typeof window.CocoonJS === 'undefined' || window.CocoonJS === null) throw("The CocoonJS object must exist and be valid before creating any extension object.");

    /**
    * This namespace represents the CocoonJS camera extension API.
    * @namespace
    */
    CocoonJS.Camera = {};

    CocoonJS.Camera.nativeExtensionObjectAvailable = CocoonJS.nativeExtensionObjectAvailable && typeof window.ext.IDTK_SRV_CAMERA !== 'undefined';

    /**
    * The predefined possible camera types.
    * @namespace 
    */
	CocoonJS.Camera.CameraType = {
		/**
		* Represents the front camera on the device.
		*/
	    FRONT : "FRONT",

	    /**
	    * Represents the back camera on the device.
	    */
	    BACK : "BACK"
	};

    /**
    * The predefined possible camera video capturing image format types.
    * @namespace 
    */
	CocoonJS.Camera.CaptureFormatType = {
		/**
		*/
	    JPEG : "JPEG",

		/**
		*/
	    RGB_565 : "RGB_565",

		/**
		*/
	    NV21 : "NV21", 

		/**
		*/
	    NV16 : "NV16",

		/**
		*/
	    YUY2 : "YUY2",

		/**
		*/
	    YV12 : "YV12",

		/**
		*/
	    BGRA32 : "32BGRA"
	};

	/**
	* The data structure that represents the information of a camera. It includes all the information to be able to setup a camera to capture video or to take pictures.
	* @namespace
	*/
	CocoonJS.Camera.CameraInfo =  {
		/**
		* The index of the camera.
		*/
		cameraIndex : 0,

		/**
		* The type of the camera among the possible values in {@link CocoonJS.Camera.CameraType}.
		*/
		cameraType : CocoonJS.Camera.CameraType.BACK,

		/**
		* An array of {@link CocoonJS.Size} values that represent the supported video sizes for the camera.
		*/
		supportedVideoSizes : [],

		/**
		* An array of numbers that represent the supported video frame rates for the camera.
		*/
		supportedVideoFrameRates : [],

		/**
		* An array of {@link CocoonJS.Camera.CaptureFormatType} values that represent the supported video format types for the camera.
		*/
		supportedVideoCaptureImageFormats : []
	};

	/**
	* Returns the number of available camera in the platform/device.
	* @returns {number} The number of cameras available in the platform/device.
	*/
	CocoonJS.Camera.getNumberOfCameras = function()
	{
		if (CocoonJS.Camera.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_CAMERA", "getNumberOfCameras", arguments);
		}
	};

	/**
	* Returns an array of {@link CocoonJS.Camera.CameraInfo} objects representing all the information of all the cameras available in the platform/device.
	* @returns {Array} An array of {@link CocoonJS.Camera.CameraInfo} objects.
	*/
	CocoonJS.Camera.getAllCamerasInfo = function()
	{
		if (CocoonJS.Camera.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_CAMERA", "getAllCamerasInfo", arguments);
		}
	};

	/**
	* Returns the {@link CocoonJS.Camera.CameraInfo} object that represents all the information of the specified camera index in the platform/device.
	* @param {number} cameraIndex The index of the camera to get the info from. The index should be inside 0 and N (N being the value returned by {@link CocoonJS.Camera.getNumberOfCameras}).
	* @returns {CocoonJS.Camera.CameraInfo} The {@link CocoonJS.Camera.CameraInfo} of the given camera index.
	*/
	CocoonJS.Camera.getCameraInfoByIndex = function(cameraIndex)
	{
		if (CocoonJS.Camera.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_CAMERA", "getCameraInfoByIndex", arguments);
		}
	};

	/**
	* Returns the {@link CocoonJS.Camera.CameraInfo} object that represents all the information of the first camera of the specified type found in the platform/device.
	* @param {CocoonJS.Camera.CameraType} cameraType The type of the camera to get the info from. 
	* @returns {CocoonJS.Camera.CameraInfo} The {@link CocoonJS.Camera.CameraInfo} of the first camera of the given camera type that has been found in the platform/device.
	*/
	CocoonJS.Camera.getCameraInfoByType = function(cameraType)
	{
		if (CocoonJS.Camera.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_CAMERA", "getCameraInfoByType", arguments);
		}
	};

	/**
	* Starts a camera to capture video. The developer must specify at least the index of the camera to be used. Some other setup parameters can also be passed to control the video capture. A image object
	* that will be automatically updated with the captured frames is returned so the developer just need to draw the image in every frame. A null image object is returned if the setup did not work or there is
	* no available camera.
	* @param {number} cameraIndex The index of the camera to start video capture with.
	* @param captureWidth The hozirontal size of the video capture resolution. If the value does not correspond to any of the sizes supported by the camera, the closest one is used. See {@link CocoonJS.Camera.CameraInfo}.
	* If no value is given, the maximum size available is used.
	* @param captureHeight The vertical size of the video capture resolution. If value does not correspond to any of the sizes supported by the camera, the closest one is used. See {@link CocoonJS.Camera.CameraInfo}.
	* If no value is given, the maximum size available is used.
	* @param captureFrameRate The frame rate to capture the video at. If the value does not correspond to any of the frame rates supported by the camera, the closest one is used. See {@link CocoonJS.Camera.CameraInfo}.
	* If no value is given, the maximum frame rate available is used.
	* @param captureImageFormat A value from the available {@link CocoonJS.Camera.CaptureFormatType} formats to specify the format of the images that will be captured. See {@link CocoonJS.Camera.CameraInfo}.
	* If no value is given, the first available capture image format is used.
	* @returns {image} A image object that will automatically update itself with the captured frames or null if the camera capture could not start.
	*/
	CocoonJS.Camera.startCapturing = function(cameraIndex, captureWidth, captureHeight, captureFrameRate, captureImageFormat)
	{
		if (CocoonJS.Camera.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_CAMERA", "startCapturing", arguments);
		}
	};

	/**
	* Stops a camera that is already started capturing video.
	* @param cameraIndex The index of the camera to stop capturing video.
	*/
	CocoonJS.Camera.stopCapturing = function(cameraIndex)
	{
		if (CocoonJS.Camera.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_CAMERA", "stopCapturing", arguments);
		}
	};

	/**
	* Indicates if a camera is capturing video or not.
	* @param cameraIndex The index of the camera to check if is capturing video or not.
	* @returns {boolean} A flag indicating if the given camera (by index) is capturing video (true) or not (false).
	*/
	CocoonJS.Camera.isCapturing = function(cameraIndex)
	{
		if (CocoonJS.Camera.nativeExtensionObjectAvailable)
		{
			return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_CAMERA", "isCapturing", arguments);
		}
	};

})();;(function () {
    // The CocoonJS must exist before creating the extension.
    if (typeof window.CocoonJS === 'undefined' || window.CocoonJS === null) throw("The CocoonJS object must exist and be valid before creating any extension object.");

    /**
     * This namespace represents the functionalities related to OUYA android gaming control.
     * @namespace
     */
    CocoonJS.Gamepad = {};

    CocoonJS.Gamepad.nativeExtensionObjectAvailable = CocoonJS.nativeExtensionObjectAvailable && typeof window.ext.Gamepad !== 'undefined';

    /**
    * This enumeration simplifies the access to the indices for button and axis elements according to the HTML5 gamepad standard API specification.
    * You may use these values to access the buttons and axes arrays inside the Gamepad objects, according to the W3C gamepad API specification.
    * For example: 
    * gamepad.button[CocoonJS.Gamepad.BUTTON_LEFT_TRIGGER]; 
    * gamepad.axes[CocoonJS.Gamepad.AXIS_LEFT_JOYSTICK_X]; 
    * @namespace
    */
    CocoonJS.Gamepad.Indices = {
        /**
        * Represents the button 0 (the A on the XBOX controller, the O on the OUYA controller)
        */
        BUTTON_0                : 0, 
        /**
        * Represents the button 1 (the B on the XBOX controller, the A on the OUYA controller)
        */
        BUTTON_1                : 1,
        /**
        * Represents the button 2 (the X on the XBOX controller, the U on the OUYA controller)
        */
        BUTTON_2                : 2,
        /**
        * Represents the button 3 (the Y on the XBOX controller, the Y on the OUYA controller)
        */
        BUTTON_3                : 3,
        /**
        * Represents the left bumper button.
        */
        BUTTON_LEFT_BUMPER      : 4,
        /**
        * Represents the right bumper button.
        */
        BUTTON_RIGHT_BUMPER     : 5,
        
        /**
        * Represents the left trigger button.
        */
        BUTTON_LEFT_TRIGGER     : 6,
        /**
        * Represents the right trigger button.
        */
        BUTTON_RIGHT_TRIGGER    : 7,
        
        /**
        * Represents the left joystick button.
        */
        BUTTON_LEFT_JOYSTICK    : 10,
        /**
        * Represents the right joystick button.
        */
        BUTTON_RIGHT_JOYSTICK   : 11,
        /**
        * Represents the dpad up button.
        */
        BUTTON_DPAD_UP          : 12,
        /**
        * Represents the dpad down button.
        */
        BUTTON_DPAD_DOWN        : 13,
        /**
        * Represents the dpad left button.
        */
        BUTTON_DPAD_LEFT        : 14,
        /**
        * Represents the dpad right button.
        */
        BUTTON_DPAD_RIGHT       : 15,
        /**
        * Represents the menu button.
        */
        BUTTON_MENU             : 16,
        
        /**
        * Represents the left joystick horizontal axis.
        */
        AXIS_LEFT_JOYSTICK_X     : 0,
        /**
        * Represents the left joystick vertical axis.
        */
        AXIS_LEFT_JOYSTICK_Y     : 1,
        /**
        * Represents the right joystick horizontal axis.
        */
        AXIS_RIGHT_JOYSTICK_X    : 2,
        /**
        * Represents the right joystick vertical axis.
        */
        AXIS_RIGHT_JOYSTICK_Y    : 3
    };

    // If the extension is present and the navigator does not provide the gamepad API:
    // 1.- Add the getGamepads function to the navigator object.
    // 2.- Replace the window add and remove event listener functions to call to the extension for the gamepad related events.
    var systemSupportsGamepads = navigator["getGamepads"] || navigator["webkitGetGamepads"];
    if (systemSupportsGamepads) 
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



;(function() {
    // The CocoonJS must exist before creating the extension.
    if (typeof window.CocoonJS === 'undefined' || window.CocoonJS === null) throw ("The CocoonJS object must exist and be valid before creating any extension object.");

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
    CocoonJS.Notification.createLocalNotification = function(message, soundEnabled, badgeNumber, userData, contentBody, contentTitle, scheduleTime) {

        if (CocoonJS.Notification.nativeExtensionObjectAvailable) {
            return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_NOTIFICATION", "createLocalNotification", arguments);
        }
    };


    /**
     * The data structure that represents the information of a local notification.
     * @namespace
     * @constructor
     * @deprecated
     * @param {string} message The notification message.
     * @param {boolean} soundEnabled A flag that indicates if the sound should be enabled for the notification.
     * @param {number} badgeNumber The number that will appear in the badge of the application icon in the home screen.
     * @param {object} userData The JSON data to attached to the notification.
     * @param {string} contentBody The body content to be showed in the expanded notification information.
     * @param {string} contentTitle The title to be showed in the expanded notification information.
     * @param {number} date Time in millisecs from 1970 when the notification will be fired.
     */
    CocoonJS.Notification.LocalNotification = function(message, soundEnabled, badgeNumber, userData, contentBody, contentTitle, scheduleTime) {
        //The id is initialized with -1 for compatibility issues.
        //The new way to use is createLocalNotification. These can be cancelled and the ID is sent from native code to the 
        this.id = -1;

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
        if (scheduleTime !== undefined) {
            this.scheduleTime = scheduleTime;
        } else {
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
    CocoonJS.Notification.PushNotification = function(message, soundEnabled, badgeNumber, userData, channels, expirationTime, expirationTimeInterval) {
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
    CocoonJS.Notification.start = function() {
        if (CocoonJS.Notification.nativeExtensionObjectAvailable) {
            return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_NOTIFICATION", "start", arguments);
        }
    };


    /**
     * Register to be able to receive push notifications.
     * The registration process is controlled using the {@link CocoonJS.Notification.onRegisterForPushNotificationsSucceed} and {@link CocoonJS.Notification.onRegisterForPushNotificationsFailed} event handlers.
     * @function
     * @see {CocoonJS.Notification.onRegisterForPushNotificationsSucceed}
     * @see {CocoonJS.Notification.onRegisterForPushNotificationsFailed}
     */
    CocoonJS.Notification.registerForPushNotifications = function() {
        if (CocoonJS.Notification.nativeExtensionObjectAvailable) {
            return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_NOTIFICATION", "registerForPushNotifications", arguments, true);
        }
    };

    /**
     * Unregister from receiving push notifications.
     * The unregistration process is controlled using the {@link CocoonJS.Notification.onUnregisterForPushNotificationsSucceed} event handler.
     * @function
     * @see CocoonJS.Notification.onUnregisterForPushNotificationsSucceed
     */
    CocoonJS.Notification.unregisterForPushNotifications = function() {
        if (CocoonJS.Notification.nativeExtensionObjectAvailable) {
            return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_NOTIFICATION", "unregisterForPushNotifications", arguments, true);
        }
    };

    /**
     * Cancel the local notification with Id provided.
     * The last sent local notification will be remove from the notifications bar.
     * @function
     */
    CocoonJS.Notification.cancelLocalNotification = function() {
        if (CocoonJS.Notification.nativeExtensionObjectAvailable) {
            return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_NOTIFICATION", "cancelLocalNotification", arguments);
        }
    };

    /**
     * Cancel the last sent local notification.
     * The last sent local notification will be remove from the notifications bar.
     * @function
     */

    //TODO: Change this function to be an extension of cancelLocalNotification
    CocoonJS.Notification.cancelLastSentLocalNotificiation = function() {
        if (CocoonJS.Notification.nativeExtensionObjectAvailable) {
            return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_NOTIFICATION", "cancelLocalNotification", arguments, true);
        }
    };

    /**
     * Cancel all sent local notifications.
     * All the notifications will ve removed from the notifications bar.
     * @function
     */
    CocoonJS.Notification.cancelAllLocalNotifications = function() {
        if (CocoonJS.Notification.nativeExtensionObjectAvailable) {
            return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_NOTIFICATION", "cancelAllLocalNotifications", arguments);
        }
    };

    /**
     * Send a local notification.
     * @function
     * @param {CocoonJS.Notification.LocalNotification} localNotification The local notification to be sent.
     */
    CocoonJS.Notification.sendLocalNotification = function(localNotification) {
        if (CocoonJS.Notification.nativeExtensionObjectAvailable) {
            return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_NOTIFICATION", "sendLocalNotification", arguments, true);
        }
    };

    /**
     * Subscribe to a channel in order to receive notifications targeted to that channel.
     * @function
     * @param {string} channel The channel id to subscribe to.
     */
    CocoonJS.Notification.subscribeToChannel = function(channel) {
        if (CocoonJS.Notification.nativeExtensionObjectAvailable) {
            return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_NOTIFICATION", "subscribe", arguments, true);
        }
    };

    /**
     * Unsubscribe from a channel in order to stop receiving notifications targeted to it.
     * @function
     * @param {string} channel The channel id to unsubscribe from.
     */
    CocoonJS.Notification.unsubscribeFromChannel = function(channel) {
        if (CocoonJS.Notification.nativeExtensionObjectAvailable) {
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
    CocoonJS.Notification.sendPushNotification = function(pushNotification) {
        if (CocoonJS.Notification.nativeExtensionObjectAvailable) {
            return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_NOTIFICATION", "sendPushNotification", arguments, true);
        }
    };

    /**
     * (iOS only) Set the badge number for this application.
     * This is useful if you want to modify the badge number set by a notification.
     * @function
     * @param {number} badgeNumber The number of the badge.
     */
    CocoonJS.Notification.setBadgeNumber = function(badgeNumber) {
        if (CocoonJS.Notification.nativeExtensionObjectAvailable) {
            return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_NOTIFICATION", "setBadgeNumber", arguments);
        }
    };

    /**
     * (iOS only) Returns the current badge number.
     * @function
     * @returns {number} The badge number.
     */
    CocoonJS.Notification.getBadgeNumber = function() {
        if (CocoonJS.Notification.nativeExtensionObjectAvailable) {
            return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_NOTIFICATION", "getBadgeNumber", arguments);
        }
    };

    /**
     * Returns the last received user data from a Local notification.
     * @function
     * @returns {object} The last received user data from a Local notification.
     */
    CocoonJS.Notification.getLastReceivedLocalNotificationData = function() {
        if (CocoonJS.Notification.nativeExtensionObjectAvailable) {
            return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_SRV_NOTIFICATION", "getLastReceivedLocalNotificationData", arguments);
        }
    };

    /**
     * Returns the last received user data from a Push notification.
     * @function
     * @returns {object} The last received user data from a Push notification.
     */
    CocoonJS.Notification.getLastReceivedPushNotificationData = function() {
        if (CocoonJS.Notification.nativeExtensionObjectAvailable) {
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
/*! CocoonJSExtensions - v2.0.0 - 2014-04-10 www.ludei.com */window.ext&&"undefined"!=typeof window.ext.IDTK_SRV_BOX2D?(window.Box2D={},window.Box2D.Dynamics={},window.Box2D.Dynamics.Joints={},window.Box2D.Common={},window.Box2D.Common.Math={},window.Box2D.Collision={},window.Box2D.Collision.Shapes={},function(){"use strict";function a(a){console.error(a)}var b=function(a,b){void 0===a&&(a=0),void 0===b&&(b=0),this.x=a,this.y=b};window.Box2D.Common.Math.b2Vec2=b,b.prototype.SetZero=function(){this.x=0,this.y=0},b.prototype.Set=function(a,b){void 0===a&&(a=0),void 0===b&&(b=0),this.x=a,this.y=b},b.prototype.SetV=function(b){void 0===b&&a("undefined 'v' in b2Vec2.SetV"),this.x=b.x,this.y=b.y},b.Make=function(a,c){return void 0===a&&(a=0),void 0===c&&(c=0),new b(a,c)},void 0===b.Get&&(b.Get=b.Make,b._freeCache=[],b.Free=function(){}),b.prototype.Copy=function(){return new b(this.x,this.y)},b.prototype.Add=function(b){void 0===b&&a("undefined 'v' in b2Vec2.Add"),this.x+=b.x,this.y+=b.y},b.prototype.Subtract=function(b){void 0===b&&a("undefined 'v' in b2Vec2.Subtract"),this.x-=b.x,this.y-=b.y},b.prototype.Multiply=function(a){void 0===a&&(a=0),this.x*=a,this.y*=a},b.prototype.Length=function(){return Math.sqrt(this.x*this.x+this.y*this.y)},b.prototype.LengthSquared=function(){return this.x*this.x+this.y*this.y},b.prototype.Normalize=function(){var a=Math.sqrt(this.x*this.x+this.y*this.y);if(a<Number.MIN_VALUE)return 0;var b=1/a;return this.x*=b,this.y*=b,a},b.prototype.NegativeSelf=function(){this.x=-this.x,this.y=-this.y};var c=function(){this.col1=new b,this.col2=new b,this.SetIdentity()};window.Box2D.Common.Math.b2Mat22=c,c.FromAngle=function(a){void 0===a&&(a=0);var b=new c;return b.Set(a),b},c.FromVV=function(a,b){var d=new c;return d.SetVV(a,b),d},c.prototype.Set=function(a){void 0===a&&(a=0);var b=Math.cos(a),c=Math.sin(a);this.col1.x=b,this.col2.x=-c,this.col1.y=c,this.col2.y=b},c.prototype.SetVV=function(a,b){this.col1.SetV(a),this.col2.SetV(b)},c.prototype.Copy=function(){var a=new c;return a.SetM(this),a},c.prototype.SetM=function(a){this.col1.SetV(a.col1),this.col2.SetV(a.col2)},c.prototype.AddM=function(a){this.col1.x+=a.col1.x,this.col1.y+=a.col1.y,this.col2.x+=a.col2.x,this.col2.y+=a.col2.y},c.prototype.SetIdentity=function(){this.col1.x=1,this.col2.x=0,this.col1.y=0,this.col2.y=1},c.prototype.SetZero=function(){this.col1.x=0,this.col2.x=0,this.col1.y=0,this.col2.y=0},c.prototype.GetAngle=function(){return Math.atan2(this.col1.y,this.col1.x)},c.prototype.GetInverse=function(a){var b=this.col1.x,c=this.col2.x,d=this.col1.y,e=this.col2.y,f=b*e-c*d;return 0!==f&&(f=1/f),a.col1.x=f*e,a.col2.x=-f*c,a.col1.y=-f*d,a.col2.y=f*b,a},c.prototype.Solve=function(a,b,c){void 0===b&&(b=0),void 0===c&&(c=0);var d=this.col1.x,e=this.col2.x,f=this.col1.y,g=this.col2.y,h=d*g-e*f;return 0!==h&&(h=1/h),a.x=h*(g*b-e*c),a.y=h*(d*c-f*b),a},c.prototype.Abs=function(){this.col1.Abs(),this.col2.Abs()};var d=function(a,d){this.position=new b,this.R=new c,void 0===a&&(a=null),void 0===d&&(d=null),a&&(this.position.SetV(a),this.R.SetM(d))};window.Box2D.Common.Math.b2Transform=d,d.prototype.Initialize=function(a,b){this.position.SetV(a),this.R.SetM(b)},d.prototype.SetIdentity=function(){this.position.SetZero(),this.R.SetIdentity()},d.prototype.Set=function(a){this.position.SetV(a.position),this.R.SetM(a.R)},d.prototype.SetAngle=function(){return Math.atan2(this.R.col1.y,this.R.col1.x)};var e=function(){};window.Box2D.Common.Math.b2Math=e,e.IsValid=function(a){return void 0===a&&(a=0),isFinite(a)},e.Dot=function(a,b){return a.x*b.x+a.y*b.y},e.CrossVV=function(a,b){return a.x*b.y-a.y*b.x},e.CrossVF=function(a,c){void 0===c&&(c=0);var d=new b(c*a.y,-c*a.x);return d},e.CrossFV=function(a,c){void 0===a&&(a=0);var d=new b(-a*c.y,a*c.x);return d},e.MulMV=function(c,d){void 0===d&&a("undefined 'v' in b2Math.MulMV");var e=new b(c.col1.x*d.x+c.col2.x*d.y,c.col1.y*d.x+c.col2.y*d.y);return e},e.MulTMV=function(a,c){var d=new b(e.Dot(c,a.col1),e.Dot(c,a.col2));return d},e.MulX=function(a,b){var c=e.MulMV(a.R,b);return c.x+=a.position.x,c.y+=a.position.y,c},e.MulXT=function(a,b){var c=e.SubtractVV(b,a.position),d=c.x*a.R.col1.x+c.y*a.R.col1.y;return c.y=c.x*a.R.col2.x+c.y*a.R.col2.y,c.x=d,c},e.AddVV=function(a,c){var d=new b(a.x+c.x,a.y+c.y);return d},e.SubtractVV=function(a,c){var d=new b(a.x-c.x,a.y-c.y);return d},e.Distance=function(a,b){var c=a.x-b.x,d=a.y-b.y;return Math.sqrt(c*c+d*d)},e.DistanceSquared=function(a,b){var c=a.x-b.x,d=a.y-b.y;return c*c+d*d},e.MulFV=function(a,c){void 0===a&&(a=0);var d=new b(a*c.x,a*c.y);return d},e.AddMM=function(a,b){var d=c.FromVV(e.AddVV(a.col1,b.col1),e.AddVV(a.col2,b.col2));return d},e.MulMM=function(a,b){var d=c.FromVV(e.MulMV(a,b.col1),e.MulMV(a,b.col2));return d},e.MulTMM=function(a,d){var f=new b(e.Dot(a.col1,d.col1),e.Dot(a.col2,d.col1)),g=new b(e.Dot(a.col1,d.col2),e.Dot(a.col2,d.col2)),h=c.FromVV(f,g);return h},e.Abs=function(a){return void 0===a&&(a=0),a>0?a:-a},e.AbsV=function(a){var c=new b(e.Abs(a.x),e.Abs(a.y));return c},e.AbsM=function(a){var b=c.FromVV(e.AbsV(a.col1),e.AbsV(a.col2));return b},e.Min=function(a,b){return void 0===a&&(a=0),void 0===b&&(b=0),b>a?a:b},e.MinV=function(a,c){var d=new b(e.Min(a.x,c.x),e.Min(a.y,c.y));return d},e.Max=function(a,b){return void 0===a&&(a=0),void 0===b&&(b=0),a>b?a:b},e.MaxV=function(a,c){var d=new b(e.Max(a.x,c.x),e.Max(a.y,c.y));return d},e.Clamp=function(a,b,c){return void 0===a&&(a=0),void 0===b&&(b=0),void 0===c&&(c=0),b>a?b:a>c?c:a},e.ClampV=function(a,b,c){return e.MaxV(b,e.MinV(a,c))},e.Swap=function(a,b){var c=a[0];a[0]=b[0],b[0]=c},e.Random=function(){return 2*Math.random()-1},e.RandomRange=function(a,b){void 0===a&&(a=0),void 0===b&&(b=0);var c=Math.random();return c=(b-a)*c+a},e.NextPowerOfTwo=function(a){return void 0===a&&(a=0),a|=a>>1&2147483647,a|=a>>2&1073741823,a|=a>>4&268435455,a|=a>>8&16777215,a|=a>>16&65535,a+1},e.IsPowerOfTwo=function(a){void 0===a&&(a=0);var b=a>0&&0===(a&a-1);return b},e.b2Vec2_zero=new b(0,0),e.b2Mat22_identity=c.FromVV(new b(1,0),new b(0,1)),e.b2Transform_identity=new d(e.b2Vec2_zero,e.b2Mat22_identity);var f=function(){this.e_aabbBit=4,this.e_centerOfMassBit=16,this.e_controllerBit=32,this.e_jointBit=2,this.e_pairBit=8,this.e_shapeBit=0};window.Box2D.Dynamics.b2DebugDraw=f,f.prototype.AppendFlags=function(){},f.prototype.ClearFlags=function(){},f.prototype.DrawCircle=function(){},f.prototype.DrawPolygon=function(){},f.prototype.DrawSegment=function(){},f.prototype.DrawSolidCircle=function(){},f.prototype.DrawSolidPolygon=function(){},f.prototype.DrawTransform=function(){},f.prototype.GetAlpha=function(){},f.prototype.GetDrawScale=function(){},f.prototype.GetFillAlpha=function(){},f.prototype.GetFlags=function(){},f.prototype.GetLineThickness=function(){},f.prototype.GetSprite=function(){},f.prototype.GetXFormScale=function(){},f.prototype.SetAlpha=function(){},f.prototype.SetDrawScale=function(){},f.prototype.SetFillAlpha=function(){},f.prototype.SetFlags=function(){},f.prototype.SetLineThickness=function(){},f.prototype.SetSprite=function(){},f.prototype.SetXFormScale=function(){};var g=function(){this.position=new b(0,0),this.linearVelocity=new b,this.userData=null,this.angle=0,this.linearVelocity.Set(0,0),this.angularVelocity=0,this.linearDamping=0,this.angularDamping=0,this.allowSleep=!0,this.awake=!0,this.fixedRotation=!1,this.bullet=!1,this.type=i.b2_staticBody,this.active=!0,this.inertiaScale=1};window.Box2D.Dynamics.b2BodyDef=g;var h=function(a,c,d,e){this.m_body=a,this.m_userData=c,this.m_fixtureID=d,this.m_shape={},this.m_shape.m_centroid=new b,this.m_isSensor=!1,this.m_density=e.density,this.m_friction=e.friction,this.m_restitution=e.restitution,this.m_isSensor=e.isSensor};window.Box2D.Dynamics.b2Fixture=h,h.prototype.GetBody=function(){return this.m_body},h.prototype.GetShape=function(){return console.log("fixture.GetShape not yet supported in CocoonJS Box2D binding"),null},h.prototype.GetUserData=function(){return this.m_userData},h.prototype.SetSensor=function(a){this.m_isSensor=a,window.ext.IDTK_SRV_BOX2D.makeCall("setSensor",this.m_body.m_world.m_worldID,this.m_fixtureID,this.m_isSensor)},h.prototype.IsSensor=function(){return this.m_isSensor},h.prototype.SetDensity=function(a){window.ext.IDTK_SRV_BOX2D.makeCall("setDensity",this.m_body.m_world.m_worldID,this.m_fixtureID,a),this.m_density=a},h.prototype.SetFriction=function(a){window.ext.IDTK_SRV_BOX2D.makeCall("setFriction",this.m_body.m_world.m_worldID,this.m_fixtureID,a),this.m_friction=a},h.prototype.SetRestitution=function(a){window.ext.IDTK_SRV_BOX2D.makeCall("setRestitution",this.m_body.m_world.m_worldID,this.m_fixtureID,a),this.m_restitution=a},h.prototype.GetDensity=function(){return this.m_density},h.prototype.GetFriction=function(){return this.m_friction},h.prototype.GetRestitution=function(){return this.m_restitution};var i=function(a,b){var e=a.userData;a.userData=null,this.m_world=b,this.m_xf=new d(a.position,c.FromAngle(a.angle)),this.m_fixtures=[],this.m_active=a.active,a.type===i.b2_staticBody&&(a.density=0),this.m_bodyID=window.ext.IDTK_SRV_BOX2D.makeCall("createBody",b.m_worldID,a),this.m_userData=e,a.userData=e};window.Box2D.Dynamics.b2Body=i,i.prototype.CreateFixture=function(a){var b=a.userData;a.userData=null;var c=window.ext.IDTK_SRV_BOX2D.makeCall("createFixture",this.m_world.m_worldID,this.m_bodyID,a);a.userData=b;var d=new h(this,b,c,a);return this.m_world.m_fixturesList[c]=d,this.m_fixtures.push(d),d},i.prototype.GetFixtureList=function(){return 0===this.m_fixtures.length?null:this.m_fixtures[0]},i.prototype.DestroyFixture=function(a){window.ext.IDTK_SRV_BOX2D.makeCall("deleteFixture",this.m_world.m_worldID,a.m_fixtureID),delete this.m_world.m_fixturesList[a.m_fixtureID]},i.prototype.SetPositionAndAngle=function(a,b){window.ext.IDTK_SRV_BOX2D.makeCall("setBodyTransform",this.m_world.m_worldID,this.m_bodyID,a.x,a.y,b),this.m_xf.R.Set(b),this.m_xf.position.SetV(a)},i.prototype.GetPosition=function(){return this.m_xf.position},i.prototype.SetPosition=function(a){this.SetPositionAndAngle(a,this.GetAngle())},i.prototype.GetLinearVelocity=function(){var a=window.ext.IDTK_SRV_BOX2D.makeCall("getLinearVelocity",this.m_world.m_worldID,this.m_bodyID);return new b(a[0],a[1])},i.prototype.GetWorldCenter=function(){var a=window.ext.IDTK_SRV_BOX2D.makeCall("getWorldCenter",this.m_world.m_worldID,this.m_bodyID);return new b(a[0],a[1])},i.prototype.GetLocalCenter=function(){var a=window.ext.IDTK_SRV_BOX2D.makeCall("getLocalCenter",this.m_world.m_worldID,this.m_bodyID);return new b(a[0],a[1])},i.prototype.GetLocalPoint=function(a){return e.MulXT(this.m_xf,a)},i.prototype.ApplyImpulse=function(a,b,c){window.ext.IDTK_SRV_BOX2D.makeCall("applyImpulse",this.m_world.m_worldID,this.m_bodyID,a.x,a.y,b.x,b.y,c)},i.prototype.GetMass=function(){return window.ext.IDTK_SRV_BOX2D.makeCall("getMass",this.m_world.m_worldID,this.m_bodyID)},i.prototype.IsAwake=function(){return window.ext.IDTK_SRV_BOX2D.makeCall("isAwake",this.m_world.m_worldID,this.m_bodyID)},i.prototype.GetAngularVelocity=function(){return window.ext.IDTK_SRV_BOX2D.makeCall("getAngularVelocity",this.m_world.m_worldID,this.m_bodyID)},i.prototype.SetFixedRotation=function(a){window.ext.IDTK_SRV_BOX2D.makeCall("setFixedRotation",this.m_world.m_worldID,this.m_bodyID,a)},i.prototype.SetAwake=function(a){window.ext.IDTK_SRV_BOX2D.makeCall("setAwake",this.m_world.m_worldID,this.m_bodyID,a)},i.prototype.SetLinearVelocity=function(a){window.ext.IDTK_SRV_BOX2D.makeCall("setLinearVelocity",this.m_world.m_worldID,this.m_bodyID,a.x,a.y)},i.prototype.ApplyForceToCenter=function(a,b){window.ext.IDTK_SRV_BOX2D.makeCall("applyForceToCenter",this.m_world.m_worldID,this.m_bodyID,a.x,a.y,b)},i.prototype.ApplyForce=function(a,b,c){window.ext.IDTK_SRV_BOX2D.makeCall("applyForce",this.m_world.m_worldID,this.m_bodyID,a.x,a.y,b.x,b.y,c)},i.prototype.ApplyTorque=function(a,b){window.ext.IDTK_SRV_BOX2D.makeCall("applyTorque",this.m_world.m_worldID,this.m_bodyID,a,b)},i.prototype.SetLinearDamping=function(a){window.ext.IDTK_SRV_BOX2D.makeCall("setLinearDamping",this.m_world.m_worldID,this.m_bodyID,a)},i.prototype.SetAngularVelocity=function(a){window.ext.IDTK_SRV_BOX2D.makeCall("setAngularVelocity",this.m_world.m_worldID,this.m_bodyID,a)},i.prototype.SetType=function(a){window.ext.IDTK_SRV_BOX2D.makeCall("setType",this.m_world.m_worldID,this.m_bodyID,a)},i.prototype.SetActive=function(a){window.ext.IDTK_SRV_BOX2D.makeCall("setActive",this.m_world.m_worldID,this.m_bodyID,a),this.m_active=a},i.prototype.IsActive=function(){return this.m_active},i.prototype.GetAngle=function(){return this.m_xf.R.GetAngle()},i.prototype.SetAngle=function(a){void 0===a&&(a=0),this.SetPositionAndAngle(this.GetPosition(),a)},i.prototype.GetContactList=function(){for(var a=window.ext.IDTK_SRV_BOX2D.makeCall("getObjectContacts",this.m_world.m_worldID,this.m_bodyID),b=[],c=0;c<a.length;c++)b.push(this.m_world.m_bodyList[a[c]]);return b},i.prototype.SetUserData=function(a){this.m_userData=a},i.prototype.GetUserData=function(){return this.m_userData},i.prototype.GetWorld=function(){return this.m_world},window.Box2D.Dynamics.b2Body.b2_staticBody=0,window.Box2D.Dynamics.b2Body.b2_kinematicBody=1,window.Box2D.Dynamics.b2Body.b2_dynamicBody=2;var j=function(a,b,c){this.m_fixtureA=a,this.m_fixtureB=b,this.m_touching=c};window.Box2D.Dynamics.b2Contact=j,j.prototype.GetFixtureA=function(){return this.m_fixtureA},j.prototype.GetFixtureB=function(){return this.m_fixtureB},j.prototype.IsTouching=function(){return this.m_touching};var k=function(){};window.Box2D.Dynamics.b2ContactListener=k,k.prototype.BeginContact=function(){},k.prototype.EndContact=function(){},k.prototype.PreSolve=function(){},k.prototype.PostSolve=function(){},window.Box2D.Dynamics.b2ContactListener.b2_defaultListener=new k;var l=function(){};window.Box2D.Dynamics.b2ContactFilter=l;var m=function(a,b){this.m_bodyList=[],this.m_jointList=[],this.m_fixturesList=[],this.m_contactListener=null,this.m_jointsList=[],this.m_worldID=window.ext.IDTK_SRV_BOX2D.makeCall("createWorld",a.x,a.y,b)};window.Box2D.Dynamics.b2World=m,m.prototype.SetContactListener=function(a){this.m_contactListener=a},m.prototype.SetContactFilter=function(a){var b=a,c=this,d=function(a,d){var e=c.m_fixturesList[a],f=c.m_fixturesList[d];return b.ShouldCollide(e,f)};window.ext.IDTK_SRV_BOX2D.makeCall("setContactFilter",this.m_worldID,d)},m.prototype.CreateBody=function(a){var b=new i(a,this);return this.m_bodyList[b.m_bodyID]=b,b},m.prototype.DestroyBody=function(a){window.ext.IDTK_SRV_BOX2D.makeCall("deleteBody",this.m_worldID,a.m_bodyID),delete this.m_bodyList[a.m_bodyID];for(var b=0;b<a.m_fixtures.length;++b)delete this.m_fixturesList[a.m_fixtures[b].m_fixtureID]},m.prototype.CreateJoint=function(a){if(a.bodyA.m_bodyID!==a.bodyB.m_bodyID){var b=a.bodyA,c=a.bodyB;a.bodyA=b.m_bodyID,a.bodyB=c.m_bodyID;var d="createDistanceJoint";a.type===o.e_revoluteJoint&&(d="createRevoluteJoint");var e=new o(a);return e.m_jointID=window.ext.IDTK_SRV_BOX2D.makeCall(d,this.m_worldID,a),a.bodyA=b,a.bodyB=c,this.m_jointsList.push(e),e}},m.prototype.DestroyJoint=function(a){window.ext.IDTK_SRV_BOX2D.makeCall("destroyJoint",this.m_worldID,a.m_jointID)},m.prototype.GetJointList=function(){if(0===this.m_jointsList.length)return null;for(var a=0;a<this.m_jointsList.length-1;++a)this.m_jointsList[a].next=this.m_jointsList[a+1];return this.m_jointsList[this.m_jointsList.length-1].next=null,this.m_jointsList[0]},m.prototype.SetContinuousPhysics=function(a){window.ext.IDTK_SRV_BOX2D.makeCall("setContinuous",this.m_worldID,a)},m.prototype.SetGravity=function(a){window.ext.IDTK_SRV_BOX2D.makeCall("setGravity",this.m_worldID,a.x,a.y)},m.prototype.Step=function(a,b,c){var d,e=window.ext.IDTK_SRV_BOX2D.makeCall("step",this.m_worldID,a,b,c),f=e[0];for(d=1;4*f>=d;d+=4){var g=this.m_bodyList[e[d+0]];if(null===g)break;g.m_xf.position.Set(e[d+1],e[d+2]),g.m_xf.R.Set(e[d+3])}if(null!==this.m_contactListener){var h=window.ext.IDTK_SRV_BOX2D.makeCall("getLastContacts",this.m_worldID);for(f=h[0],d=1;3*f>=d;d+=3){var i=h[d+0],k=h[d+1],l=h[d+2],m=this.m_fixturesList[i],n=this.m_fixturesList[k];"undefined"!=typeof m&&"undefined"!=typeof n?this.m_contactListener.BeginContact(new j(m,n,l)):console.log("One of the fixtures in a contact DOESN'T EXIST!!")}}},m.prototype.ClearForces=function(){window.ext.IDTK_SRV_BOX2D.makeCall("clearForces",this.m_worldID)},m.prototype.SetDebugDraw=function(){},m.prototype.DrawDebugData=function(){},window.Box2D.Collision.Shapes.b2CircleShape=function(a){this.radius=a,this.type="circle"},window.Box2D.Collision.Shapes.b2PolygonShape=function(){this.SetAsBox=function(a,b){this.type="box",this.width=a,this.height=b},this.SetAsEdge=function(a,b){this.type="edge",this.p1x=a.x,this.p1y=a.y,this.p2x=b.x,this.p2y=b.y},this.SetAsArray=function(a,b){this.type="polygon",this.vertices=[];for(var c=0;b>c;c++)this.vertices.push(a[c].x),this.vertices.push(a[c].y)}};var n=function(){this.shape=null,this.userData=null,this.friction=.2,this.restitution=0,this.density=0,this.isSensor=!1,this.filter={categoryBits:1,maskBits:65535,groupIndex:0}};window.Box2D.Dynamics.b2FixtureDef=n;var o=function(a){this.bodyA=a.bodyA,this.bodyB=a.bodyB,this.userData=a.userData,this.type=a.type,this.next=null};window.Box2D.Dynamics.Joints.b2Joint=o,o.prototype.GetBodyA=function(){return this.bodyA},o.prototype.GetBodyB=function(){return this.bodyB},o.prototype.GetUserData=function(){return this.userData},o.prototype.GetType=function(){return this.type},o.prototype.GetNext=function(){return this.next},o.e_distanceJoint=0,o.e_revoluteJoint=1;var p=function(a,c,d,e){if(this.type=o.e_distanceJoint,this.localAnchorA=new b,this.localAnchorB=new b,this.userData=null,void 0!==a&&(this.bodyA=a),void 0!==c&&(this.bodyB=c),void 0!==d&&this.localAnchorA.SetV(d),void 0!==e&&this.localAnchorB.SetV(e),void 0!==d&&void 0!==e){var f=e.x-d.x,g=e.y-d.y;this.length=Math.sqrt(f*f+g*g)}this.frequencyHz=0,this.dampingRatio=0};window.Box2D.Dynamics.Joints.b2DistanceJointDef=p;var q=function(a,c,d,e){this.type=o.e_revoluteJoint,this.localAnchorA=new b,this.localAnchorB=new b,this.userData=null,void 0!==a&&(this.bodyA=a),void 0!==c&&(this.bodyB=c),void 0!==d&&this.localAnchorA.SetV(d),void 0!==e&&this.localAnchorB.SetV(e),this.referenceAngle=0,this.lowerAngle=0,this.upperAngle=0,this.maxMotorTorque=0,this.motorSpeed=0,this.enableLimit=!1,this.enableMotor=!1};q.prototype.Initialize=function(a,b,c){this.bodyA=a,this.bodyB=b,this.localAnchorA=this.bodyA.GetLocalPoint(c),this.localAnchorB=this.bodyB.GetLocalPoint(c),this.referenceAngle=this.bodyB.GetAngle()-this.bodyA.GetAngle()},window.Box2D.Dynamics.Joints.b2RevoluteJointDef=q}()):console.log("The CocoonJS binding for Box2D has been ignored because ext.IDTK_SRV_BOX2D is not available");