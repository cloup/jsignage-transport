/*!
 * The jSignage digital signage library, beta 4.
 * http://www.spinetix.com/
 * Copyright 2011, SpinetiX S.A.
 * Released under the GPL Version 2 license.
 *
 * Includes code from the jQuery JavaScript Library v1.5.1
 * http://jquery.com/
 * Copyright 2011, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2011, The Dojo Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * $Date: 2012-01-17 01:42:37 +0100 (Tue, 17 Jan 2012) $
 * $Revision: 14690 $
 */

jSignage = $ = (function() {
var 
	_jSignage = this.jSignage,
	_$ = this.$,
    jSignage = function( selector, context ) {
        // The jSignage object is actually just the init constructor 'enhanced'
        return new jSignage.fn.init( selector, context, rootjSignage );
    },
    rootjSignage,
    quickExpr = /^(?:[^<]*(<[\w\W]+>)[^>]*$|#([\w\-]+)$)/,
    rnotwhite = /\S/,
    trimLeft = /^\s+/,
    trimRight = /\s+$/,
    rdigit = /\d/,
    rvalidchars = /^[\],:{}\s]*$/,
    rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
    rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
    rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
    rnocache = /<(?:script|style)/i,
    readyBound = false,
    promiseMethods = "then done fail isResolved isRejected promise".split( " " ),
    toString = Object.prototype.toString,
    hasOwn = Object.prototype.hasOwnProperty,
    push = Array.prototype.push,
    slice = Array.prototype.slice,
    trim = String.prototype.trim,
    indexOf = Array.prototype.indexOf,
    class2type = {};

jSignage.features = {
    textArea: true,         // Supports the <textArea> element of SVG 1.2 and implements it correctly
    animation: true,        // Supports the <animation> element of SVG 1.2
    audio: true,            // Supports the <audio> element of SVG 1.2
    video: true,            // Supports the <video> element of SVG 1.2
    HTML5Video: false,      // Supports the <video> element of HTML5 and displays it correctly inside an SVG document
    HTML5Audio: false,      // Supports the <audio> element of HTML5
    WMPlayer: false,        // Windows media player plugin available
    QuickTime: false,       // QuickTime plugin available
    viewportFill: true,     // Supports the viewport-fill attribute of SVG 1.2
    SMILTimeEvent: true,    // Generates beginEvent and endEvent
    SVGAnimation: true,     // Supports SVG animations, including the .beginElement() and .endElement() methods
    XMLHTTPRequest: true    // Supports the XMLHTTPRequest object
};

if ( window.navigator ) {
    var ua = window.navigator.userAgent;
    if ( /WebKit/.test(ua) ) {
        jSignage.features.WebKit = true;
        jSignage.features.HTML5Audio = { aac: true, m4a: true, mp3: true, wav: true, ogg: true };
    } else if ( /Opera/.test(ua) ) {
        jSignage.features.Opera = true;
    } else if ( /MSIE/.test(ua) ) {
        jSignage.features.MSIE = true;
        jSignage.features.HTML5Audio = { aac: true, m4a: true, mp3: true, wav: true };
        if ( !Date.now ) Date.now = function now() { return +new Date(); };
        jSignage.originOfTime = Date.now();
    } else if ( /Gecko/.test(ua) ) {
        jSignage.features.Gecko = true;
        jSignage.features.HTML5Audio = { wav: true, ogg: true };
        jSignage.features.HTML5Video = { webm: true, ogv: true };
    }
    if ( window.navigator.plugins ) {
        for ( var i=0; i<window.navigator.plugins.length; i++ ) {
            if ( window.navigator.plugins[i].name.indexOf( 'QuickTime' ) >= 0 && !jSignage.features.Gecko && !jSignage.features.MSIE )
                jSignage.features.QuickTime = true;
            else if ( window.navigator.plugins[i].name.indexOf( 'Windows Media Player' ) >= 0 && !jSignage.features.Gecko && !jSignage.features.MSIE )
                jSignage.features.WMPlayer = true;
        }
    }
} else {
    jSignage.features.XMLHTTPRequest = false;
}

if ( document.implementation ) {
    jSignage.features.textArea = document.implementation.hasFeature( 'http://www.w3.org/Graphics/SVG/feature/1.2/#TextFlow', '' );
    if ( jSignage.features.Opera )
        jSignage.features.textArea = false; // Opera's line breaking and flow layout enging is broken !
    jSignage.features.animation = document.implementation.hasFeature( 'http://www.w3.org/Graphics/SVG/feature/1.2/#Animation', '' );
    jSignage.features.audio = document.implementation.hasFeature( 'http://www.w3.org/Graphics/SVG/feature/1.2/#Audio', '' );
    jSignage.features.video = document.implementation.hasFeature( 'http://www.w3.org/Graphics/SVG/feature/1.2/#Video', '' );
    jSignage.features.SVGAnimation = document.implementation.hasFeature( 'http://www.w3.org/Graphics/SVG/feature/1.2/#TimedAnimation', '' ) || document.implementation.hasFeature( 'http://www.w3.org/TR/SVG11/feature#Animation', '' ) || document.implementation.hasFeature( 'http://www.w3.org/TR/SVG11/feature#SVG-animation', '' ) || jSignage.features.Gecko;
    if ( jSignage.features.WebKit )
        jSignage.features.SVGAnimation = false;
    jSignage.features.SMILTimeEvent = document.implementation.hasFeature( 'http://www.w3.org/TR/SVG11/feature#AnimationEventsAttribute', '' );
    jSignage.features.viewportFill = document.implementation.hasFeature( 'http://www.w3.org/Graphics/SVG/feature/1.2/#PaintAttribute', '' );
}

var version = new String( "0.9.0" );
version.major = 0;
version.minor = 9;
version.revision = 0;

jSignage.fn = jSignage.prototype = {
	constructor: jSignage,
	init: function( selector, context, rootjSignage ) {
		var match, elem, ret, doc;

		// Handle $(""), $(null), or $(undefined)
		if ( !selector ) {
			return this;
		}

		// Handle $(DOMElement)
		if ( selector.localName ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;
		}

		// The svg top element only exists once, optimize finding it
		if ( selector === "svg" && !context && document.documentElement ) {
			this.context = document;
			this[0] = document.documentElement;
			this.selector = "svg";
			this.length = 1;
			return this;
		}

		// Handle XML strings
		if ( typeof selector === "string" ) {
			// Are we dealing with XML string or an ID?
			match = quickExpr.exec( selector );

			// Verify a match, and that no context was specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(xml) -> $(array)
				if ( match[1] ) {
					context = context instanceof jSignage ? context[0] : context;
					doc = (context ? context.ownerDocument || context : document);
					selector = [ jSignage.buildFragment( [ match[1] ], doc ) ];
					if ( jSignage.isPlainObject( context ) )
						jSignage.fn.attr.call( selector, context, true );
					return jSignage.merge( this, selector );
				// HANDLE: $("#id")
				} else {
					elem = document.getElementById( match[2] );
					if ( elem && elem.parentNode ) {
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jsignage ) {
				return (context || rootjSignage).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jSignage.isFunction( selector ) ) {
			return rootjSignage.ready( selector );
		}

		if (selector.selector !== undefined) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jSignage.makeArray( selector, this );
	},

	// Start with an empty selector
	selector: "",

	// The current version of jSignage being used
	jsignage: version,

	// The default length of a jSignage object is 0
	length: 0,

	// The number of elements contained in the matched element set
	size: function() {
		return this.length;
	},

	toArray: function() {
		return slice.call( this, 0 );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num == null ?

			// Return a 'clean' array
			this.toArray() :

			// Return just the object
			( num < 0 ? this[ this.length + num ] : this[ num ] );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems, name, selector ) {
		// Build a new jSignage matched element set
		var ret = this.constructor();

		if ( jSignage.isArray( elems ) ) {
			push.apply( ret, elems );

		} else {
			jSignage.merge( ret, elems );
		}

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		ret.context = this.context;

		if ( name === "find" ) {
			ret.selector = this.selector + (this.selector ? " " : "") + selector;
		} else if ( name ) {
			ret.selector = this.selector + "." + name + "(" + selector + ")";
		}

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jSignage.each( this, callback, args );
	},

	ready: function( fn ) {
		// Attach the listeners
		jSignage.bindReady();

		// Add the callback
		readyList.done( fn );

		return this;
	},

	eq: function( i ) {
		return i === -1 ?
			this.slice( i ) :
			this.slice( i, +i + 1 );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ),
			"slice", slice.call(arguments).join(",") );
	},

	map: function( callback ) {
		return this.pushStack( jSignage.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jSignage method.
	push: push,
	sort: [].sort,
	splice: [].splice
};

// Give the init function the jSignage prototype for later instantiation
jSignage.fn.init.prototype = jSignage.fn;

var reImg = /<\s*img(\s+[^>]*)>/g;
var reSrc = /\s+src\s*=\s*["']([^"']+)["']/;
var reTags = /<[^>]*>/g;
var reSpaces = /[\t\n\v\f\r \u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000]+/g;

jSignage.extend = jSignage.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jSignage.isFunction(target) ) {
		target = {};
	}

	// extend jSignage itself if only one argument is passed
	if ( length === i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jSignage.isPlainObject(copy) || (copyIsArray = jSignage.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jSignage.isArray(src) ? src : [];

					} else {
						clone = src && jSignage.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jSignage.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

// Port of jSignage core

jSignage.extend({
	noConflict: function( deep ) {
		window.$ = _$;

		if ( deep ) {
			window.jSignage = _jSignage;
		}

		return jSignage;
	},

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Handle when the DOM is ready
	ready: function( wait ) {
		// A third-party is pushing the ready event forwards
		if ( wait === true ) {
			jSignage.readyWait--;
		}

		// Make sure that the DOM is not already loaded
		if ( !jSignage.readyWait || (wait !== true && !jSignage.isReady) ) {

			// Remember that the DOM is ready
			jSignage.isReady = true;

			// If a normal DOM Ready event fired, decrement, and wait if need be
			if ( wait !== true && --jSignage.readyWait > 0 ) {
				return;
			}

			// SVG does not define what the default font is. Assume Arial is always there as this probably has the most unicode coverage.
			var svg = document.documentElement;
			if ( !svg.getAttribute( 'font-family' ) )
			    svg.setAttribute( 'font-family', 'Arial' );

			// Fix for missing handling of viewport-fill attribute
			if ( !jSignage.features.viewportFill ) {
			    var viewportFill = svg.getAttribute( 'viewport-fill' );
			    if ( viewportFill!==null && viewportFill!==''  ) {
			        var viewBox = svg.getRectTrait ? svg.getRectTrait( 'viewBox' ) : svg.viewBox.baseVal;
			        var bg = jSignage._createElement( 'rect', { x: viewBox.x, y:viewBox.y, width:viewBox.width, height:viewBox.height, fill: viewportFill, stroke: 'none' } );
			        for ( var child = svg.firstElementChild; child; child=child.nextElementSibling )
			            if ( child.localName!='set' && child.localName!='animate' )
			                break;
			        svg.insertBefore( bg, child );
			    }
			}

			// If there are functions bound, to execute
			readyList.resolveWith( document, [ jSignage ] );

			// Trigger any bound ready events
			if ( jSignage.fn.trigger ) {
				jSignage( document ).trigger( "ready" ).unbind( "ready" );
			}
		}
	},

	bindReady: function() {
		if ( readyBound ) {
			return;
		}
		readyBound = true;
		if ( jSignage.features.MSIE )
            window.addEventListener( "load", jSignage.ready, false );
		else if ( jSignage.features.Opera || jSignage.features.Gecko )
		    document.documentElement.addEventListener( 'SVGLoad', jSignage.ready, false );
		else
		    document.documentElement.addEventListener( 'load', jSignage.ready, false );
	},

	isFunction: function( obj ) {
		return jSignage.type(obj) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jSignage.type(obj) === "array";
	},

	// A crude way of determining if an object is a window
	isWindow: function( obj ) {
		return obj && typeof obj === "object" && ( "setTimeout" in obj || "createTimer" in obj );
	},

	isNaN: function( obj ) {
		return obj == null || !rdigit.test( obj ) || isNaN( obj );
	},

	type: function( obj ) {
		return obj == null ?
			String( obj ) :
			class2type[ toString.call(obj) ] || "object";
	},

	isPlainObject: function( obj ) {
		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jSignage.type(obj) !== "object" || obj.localName || jSignage.isWindow( obj ) ) {
			return false;
		}

		// Not own constructor property must be Object
		if ( obj.constructor &&
			!hasOwn.call(obj, "constructor") &&
			!hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.

		var key;
		for ( key in obj ) {}

		return key === undefined || hasOwn.call( obj, key );
	},

	isEmptyObject: function( obj ) {
		for ( var name in obj ) {
			return false;
		}
		return true;
	},

	error: function( msg ) {
		throw msg;
	},

	parseJSON: function( data ) {
		if ( typeof data !== "string" || !data ) {
			return null;
		}

		// Make sure leading/trailing whitespace is removed (IE can't handle it)
		data = jSignage.trim( data );

		// Make sure the incoming data is actual JSON
		// Logic borrowed from http://json.org/json2.js
		if ( rvalidchars.test(data.replace(rvalidescape, "@")
			.replace(rvalidtokens, "]")
			.replace(rvalidbraces, "")) ) {

			// Try to use the native JSON parser first
			return window.JSON && window.JSON.parse ?
				window.JSON.parse( data ) :
				(new Function("return " + data))();

		} else {
			jSignage.error( "Invalid JSON: " + data );
		}
	},

	parseXML: function( data ) {
	    return window.parseXML( data );
	},

	xmlToJSON: function( xml ) {
	    var r = [];
	    if ( xml ) for ( var item=xml.firstElementChild; item; item=item.nextElementSibling ) {
	        var obj = { };
	        for ( var field=item.firstElementChild; field; field=field.nextElementSibling )
	            obj[field.localName] = field.textContent;
	        r.push( obj );
	    }
	    return r;
	},

	parseRSS: function( feed ) {
	    if ( window.parseRSS ) {
	        var doc = window.parseRSS( feed );
            return jSignage.xmlToJSON( doc && doc.documentElement );
        } else if ( window.DOMParser ) {
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString( feed, "text/xml" );
            var rss = xmlDoc.documentElement;
            var r = [ ];
            if ( rss ) for ( var channel=rss.firstElementChild; channel; channel=channel.nextElementSibling )
                if ( channel.localName=='channel' )
                    break;
            if ( channel ) for ( var item=channel.firstElementChild; item; item=item.nextElementSibling ) {
                if ( item.localName=='item' ) {
                    var obj = { title: '', description: '', pubDate: '' }, url='', weakUrl='';
                    for ( var field=item.firstElementChild; field; field=field.nextElementSibling ) {
                        var t = field.textContent, img, src;
                        if ( field.localName=='description' && !weakUrl ) {
                            while ( img=reImg.exec( t ) ) {
                                var tag = img[1];
                                var src = reSrc.exec( tag );
                                if ( src ) {
                                    weakUrl = src[1];
                                    break;
                                }
                            }                            
                        }
                        if ( field.localName=='enclosure' ) {
                            if ( !url )
                                url = field.getAttribute( 'url' );
                        } else {
	                        obj[field.localName] = t.replace( reTags, '' ).replace( reSpaces, ' ' );
	                    }
	                }
	                obj.enclosure = url || weakUrl || '';
	                r.push( obj );
                }
            }
            return r;
        }
        return [];
	},

	parseCSV: function( csv, n1, n2, n3, n4, n5, n6, n7, n8, n9, n10 ) {
	    var doc = window.parseCSV( csv, null, n1, n2, n3, n4, n5, n6, n7, n8, n9, n10, Array.prototype.slice.call( arguments, 11 ) );
        return jSignage.xmlToJSON( doc && doc.documentElement );
	},

	parseTXT: function( text ) {
	    return text.split( /[\r\n]+/ );
	},

	parseICAL: function( text, start, end, format ) {
	    var calendar = window.parseICAL( text );
	    if ( calendar ) {
	        var doc = calendar.getScheduleAsRSS( start, end, null, format );
	        return jSignage.xmlToJSON( doc && doc.documentElement );
	    }
	    return [];
	},

	noop: function() {},

	// Evalulates a script in a global context
	globalEval: function( data ) {
		if ( data && rnotwhite.test(data) ) {
			// Inspired by code by Andrea Giammarchi
			// http://webreflection.blogspot.com/2007/08/global-scope-evaluation-and-dom.html
			var head = document.documentElement,
				script = document.createElementNS( document.documentElement.namespaceURI, "script" );
			script.text = data;
			// Use insertBefore instead of appendChild to circumvent an IE6 bug.
			// This arises when a base node is used (#2709).
			head.insertBefore( script, head.firstElementChild );
			head.removeChild( script );
		}
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
	},

	// args is for internal usage only
	each: function( object, callback, args ) {
		var name, i = 0,
			length = object.length,
			isObj = length === undefined || jSignage.isFunction(object);

		if ( args ) {
			if ( isObj ) {
				for ( name in object ) {
					if ( callback.apply( object[ name ], args ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; ) {
					if ( callback.apply( object[ i++ ], args ) === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isObj ) {
				for ( name in object ) {
					if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
						break;
					}
				}
			} else {
				for ( var value = object[0];
					i < length && callback.call( value, i, value ) !== false; value = object[++i] ) {}
			}
		}

		return object;
	},

	// Use native String.trim function wherever possible
	trim: trim ?
		function( text ) {
			return text == null ?
				"" :
				trim.call( text );
		} :

		// Otherwise use our own trimming functionality
		function( text ) {
			return text == null ?
				"" :
				text.toString().replace( trimLeft, "" ).replace( trimRight, "" );
		},

	// results is for internal usage only
	makeArray: function( array, results ) {
		var ret = results || [];

		if ( array != null ) {
			// The window, strings (and functions) also have 'length'
			// The extra typeof function check is to prevent crashes
			// in Safari 2 (See: #3039)
			// Tweaked logic slightly to handle Blackberry 4.7 RegExp issues #6930
			var type = jSignage.type(array);

			if ( array.length == null || type === "string" || type === "function" || type === "regexp" || jSignage.isWindow( array ) ) {
				push.call( ret, array );
			} else {
				jSignage.merge( ret, array );
			}
		}

		return ret;
	},

	inArray: function( elem, array ) {
		if ( array.indexOf ) {
			return array.indexOf( elem );
		}

		for ( var i = 0, length = array.length; i < length; i++ ) {
			if ( array[ i ] === elem ) {
				return i;
			}
		}

		return -1;
	},

	merge: function( first, second ) {
		var i = first.length,
			j = 0;

		if ( typeof second.length === "number" ) {
			for ( var l = second.length; j < l; j++ ) {
				first[ i++ ] = second[ j ];
			}

		} else {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, inv ) {
		var ret = [], retVal;
		inv = !!inv;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( var i = 0, length = elems.length; i < length; i++ ) {
			retVal = !!callback( elems[ i ], i );
			if ( inv !== retVal ) {
				ret.push( elems[ i ] );
			}
		}

		return ret;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var ret = [], value;

		// Go through the array, translating each of the items to their
		// new value (or values).
		for ( var i = 0, length = elems.length; i < length; i++ ) {
			value = callback( elems[ i ], i, arg );

			if ( value != null ) {
				ret[ ret.length ] = value;
			}
		}

		// Flatten any nested arrays
		return ret.concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	proxy: function( fn, proxy, thisObject ) {
		if ( arguments.length === 2 ) {
			if ( typeof proxy === "string" ) {
				thisObject = fn;
				fn = thisObject[ proxy ];
				proxy = undefined;

			} else if ( proxy && !jSignage.isFunction( proxy ) ) {
				thisObject = proxy;
				proxy = undefined;
			}
		}

		if ( !proxy && fn ) {
			proxy = function() {
				return fn.apply( thisObject || this, arguments );
			};
		}

		// Set the guid of unique handler to the same of original handler, so it can be removed
		if ( fn ) {
			proxy.guid = fn.guid = fn.guid || proxy.guid || jSignage.guid++;
		}

		// So proxy can be declared as an argument
		return proxy;
	},

	// Mutifunctional method to get and set values to a collection
	// The value/s can be optionally by executed if its a function
	access: function( elems, key, value, exec, fn, pass ) {
		var length = elems.length;

		// Setting many attributes
		if ( typeof key === "object" ) {
			for ( var k in key ) {
				jSignage.access( elems, k, key[k], exec, fn, value );
			}
			return elems;
		}

		// Setting one attribute
		if ( value !== undefined ) {
			// Optionally, function values get executed if exec is true
			exec = !pass && exec && jSignage.isFunction(value);

			for ( var i = 0; i < length; i++ ) {
				fn( elems[i], key, exec ? value.call( elems[i], i, fn( elems[i], key ) ) : value, pass );
			}

			return elems;
		}

		// Getting an attribute
		return length ? fn( elems[0], key ) : undefined;
	},

	now: function() {
		return (new Date()).getTime();
	},

	// Create a simple deferred (one callbacks list)
	_Deferred: function() {
		var // callbacks list
			callbacks = [],
			// stored [ context , args ]
			fired,
			// to avoid firing when already doing so
			firing,
			// flag to know if the deferred has been cancelled
			cancelled,
			// the deferred itself
			deferred  = {

				// done( f1, f2, ...)
				done: function() {
					if ( !cancelled ) {
						var args = arguments,
							i,
							length,
							elem,
							type,
							_fired;
						if ( fired ) {
							_fired = fired;
							fired = 0;
						}
						for ( i = 0, length = args.length; i < length; i++ ) {
							elem = args[ i ];
							type = jSignage.type( elem );
							if ( type === "array" ) {
								deferred.done.apply( deferred, elem );
							} else if ( type === "function" ) {
								callbacks.push( elem );
							}
						}
						if ( _fired ) {
							deferred.resolveWith( _fired[ 0 ], _fired[ 1 ] );
						}
					}
					return this;
				},

				// resolve with given context and args
				resolveWith: function( context, args ) {
					if ( !cancelled && !fired && !firing ) {
						firing = 1;
						try {
							while( callbacks[ 0 ] ) {
								callbacks.shift().apply( context, args );
							}
						}
						// We have to add a catch block for
						// IE prior to 8 or else the finally
						// block will never get executed
						catch (e) {
							throw e;
						}
						finally {
							fired = [ context, args ];
							firing = 0;
						}
					}
					return this;
				},

				// resolve with this as context and given arguments
				resolve: function() {
					deferred.resolveWith( jSignage.isFunction( this.promise ) ? this.promise() : this, arguments );
					return this;
				},

				// Has this deferred been resolved?
				isResolved: function() {
					return !!( firing || fired );
				},

				// Cancel
				cancel: function() {
					cancelled = 1;
					callbacks = [];
					return this;
				}
			};

		return deferred;
	},

	// Full fledged deferred (two callbacks list)
	Deferred: function( func ) {
		var deferred = jSignage._Deferred(),
			failDeferred = jSignage._Deferred(),
			promise;
		// Add errorDeferred methods, then and promise
		jSignage.extend( deferred, {
			then: function( doneCallbacks, failCallbacks ) {
				deferred.done( doneCallbacks ).fail( failCallbacks );
				return this;
			},
			fail: failDeferred.done,
			rejectWith: failDeferred.resolveWith,
			reject: failDeferred.resolve,
			isRejected: failDeferred.isResolved,
			// Get a promise for this deferred
			// If obj is provided, the promise aspect is added to the object
			promise: function( obj ) {
				if ( obj == null ) {
					if ( promise ) {
						return promise;
					}
					promise = obj = {};
				}
				var i = promiseMethods.length;
				while( i-- ) {
					obj[ promiseMethods[i] ] = deferred[ promiseMethods[i] ];
				}
				return obj;
			}
		} );
		// Make sure only one callback list will be used
		deferred.done( failDeferred.cancel ).fail( deferred.cancel );
		// Unexpose cancel
		delete deferred.cancel;
		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}
		return deferred;
	},

	// Deferred helper
	when: function( object ) {
		var lastIndex = arguments.length,
			deferred = lastIndex <= 1 && object && jSignage.isFunction( object.promise ) ?
				object :
				jSignage.Deferred(),
			promise = deferred.promise();

		if ( lastIndex > 1 ) {
			var array = slice.call( arguments, 0 ),
				count = lastIndex,
				iCallback = function( index ) {
					return function( value ) {
						array[ index ] = arguments.length > 1 ? slice.call( arguments, 0 ) : value;
						if ( !( --count ) ) {
							deferred.resolveWith( promise, array );
						}
					};
				};
			while( ( lastIndex-- ) ) {
				object = array[ lastIndex ];
				if ( object && jSignage.isFunction( object.promise ) ) {
					object.promise().then( iCallback(lastIndex), deferred.reject );
				} else {
					--count;
				}
			}
			if ( !count ) {
				deferred.resolveWith( promise, array );
			}
		} else if ( deferred !== object ) {
			deferred.resolve( object );
		}
		return promise;
	},

	sub: function() {
		function jSignageSubclass( selector, context ) {
			return new jSignageSubclass.fn.init( selector, context );
		}
		jSignage.extend( true, jSignageSubclass, this );
		jSignageSubclass.superclass = this;
		jSignageSubclass.fn = jSignageSubclass.prototype = this();
		jSignageSubclass.fn.constructor = jSignageSubclass;
		jSignageSubclass.subclass = this.subclass;
		jSignageSubclass.fn.init = function init( selector, context ) {
			if ( context && context instanceof jSignage && !(context instanceof jSignageSubclass) ) {
				context = jSignageSubclass(context);
			}

			return jSignage.fn.init.call( this, selector, context, rootjSignageSubclass );
		};
		jSignageSubclass.fn.init.prototype = jSignageSubclass.fn;
		var rootjSignageSubclass = jSignageSubclass(document);
		return jSignageSubclass;
	},

	browser: { svg: true, version: '1.2' },
	
    childNodes: function( elem ) {
        var children = [];
        for ( var e=elem.firstElementChild; e!=null; e=e.nextElementSibling )
            children.push( e );
        return children;
    },

	eachElement: function( ctx, callback ) {
	    var root = ctx.documentElement ? ctx.documentElement : ctx;
	    var x = root;
        for ( var idx=0; x!=null; idx++ ) {
            if ( callback.call( x, idx, x )===false )
                return;
            if ( x.firstElementChild!=null ) {
                x=x.firstElementChild;
            } else do {
                if ( x==root ) {
	                x=null;
                } else if ( x.nextElementSibling!=null ) {
	                x=x.nextElementSibling;
	                break;
                } else {
	                x=x.parentNode;
	            }
            } while ( x!=null );
        }
	}
});

// Create readyList deferred
readyList = jSignage._Deferred();

// Populate the class2type map
jSignage.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

if ( indexOf ) {
	jSignage.inArray = function( elem, array ) {
		return indexOf.call( array, elem );
	};
}

// IE doesn't match non-breaking spaces with \s
if ( rnotwhite.test( "\xA0" ) ) {
	trimLeft = /^[\s\xA0]+/;
	trimRight = /[\s\xA0]+$/;
}

// All jSignage objects should point back to these
jSignage.rootjSignage = rootjSignage = jSignage(document);

// Cleanup functions for the document ready method
DOMContentLoaded = function() {
	document.documentElement.removeEventListener( "load", DOMContentLoaded, false );
	jSignage.ready();
};

// Expose jSignage to the global object
return jSignage;

})();



(function() {

	jSignage.support = {
		deleteExpando: true,
		noCloneEvent: true
	};

	var _scriptEval = true;
	jSignage.support.scriptEval = function() {
		return _scriptEval;
	};

})();

var rbrace = /^(?:\{.*\}|\[.*\])$/;

jSignage.extend({

	// Please use with caution
	uuid: 0,

	// Unique for each copy of jSignage on the page
	// Non-digits removed to match rinlinejSignage
	expando: "jSignage" + ( jSignage.fn.jsignage+ Math.random() ).replace( /\D/g, "" ),

	hasData: function( elem ) {
		elem = elem[ jSignage.expando ];
		return !!elem && !isEmptyDataObject( elem );
	},

	data: function( elem, name, data, pvt /* Internal Use Only */ ) {

		var internalKey = jSignage.expando, getByName = typeof name === "string", thisCache,
            cache = elem,
			id = elem[ jSignage.expando ] && jSignage.expando;

		// Avoid doing any more work than we need to when trying to get data on an
		// object that has no data at all
		if ( (!id || (pvt && id && !cache[ id ][ internalKey ])) && getByName && data === undefined ) {
			return;
		}

		if ( !id ) {
    		id = jSignage.expando;
		}

		if ( !cache[ id ] ) {
			cache[ id ] = { toJSON: jSignage.noop };
		}

		// An object can be passed to jSignage.data instead of a key/value pair; this gets
		// shallow copied over onto the existing cache
		if ( typeof name === "object" || typeof name === "function" ) {
			if ( pvt ) {
				cache[ id ][ internalKey ] = jSignage.extend(cache[ id ][ internalKey ], name);
			} else {
				cache[ id ] = jSignage.extend(cache[ id ], name);
			}
		}

		thisCache = cache[ id ];

		// Internal jSignage data is stored in a separate object inside the object's data
		// cache in order to avoid key collisions between internal data and user-defined
		// data
		if ( pvt ) {
			if ( !thisCache[ internalKey ] ) {
				thisCache[ internalKey ] = {};
			}

			thisCache = thisCache[ internalKey ];
		}

		if ( data !== undefined ) {
			thisCache[ name ] = data;
		}

		// TODO: This is a hack for 1.5 ONLY. It will be removed in 1.6. Users should
		// not attempt to inspect the internal events object using jSignage.data, as this
		// internal data object is undocumented and subject to change.
		if ( name === "events" && !thisCache[name] ) {
			return thisCache[ internalKey ] && thisCache[ internalKey ].events;
		}

		return getByName ? thisCache[ name ] : thisCache;
	},

	removeData: function( elem, name, pvt /* Internal Use Only */ ) {

		var internalKey = jSignage.expando,
			cache = elem,
			id = jSignage.expando;

		// If there is already no cache entry for this object, there is no
		// purpose in continuing
		if ( !cache[ id ] ) {
			return;
		}

		if ( name ) {
			var thisCache = pvt ? cache[ id ][ internalKey ] : cache[ id ];

			if ( thisCache ) {
				delete thisCache[ name ];

				// If there is no data left in the cache, we want to continue
				// and let the cache object itself get destroyed
				if ( !isEmptyDataObject(thisCache) ) {
					return;
				}
			}
		}

		// See jSignage.data for more information
		if ( pvt ) {
			delete cache[ id ][ internalKey ];

			// Don't destroy the parent cache unless the internal data object
			// had been the only thing left in it
			if ( !isEmptyDataObject(cache[ id ]) ) {
				return;
			}
		}

		var internalCache = cache[ id ][ internalKey ];

		delete cache[ id ];

		// We destroyed the entire user cache at once because it's faster than
		// iterating through each key, but we need to continue to persist internal
		// data if it existed
		if ( internalCache ) {
			cache[ id ] = {
			    toJSON: jSignage.noop,
			    internalKey: internalCache
			};
		}
	},

	// For internal use only.
	_data: function( elem, name, data ) {
		return jSignage.data( elem, name, data, true );
	},

});

jSignage.fn.extend({
	data: function( key, value ) {
		var data = null;

		if ( typeof key === "undefined" ) {
			if ( this.length ) {
				data = jSignage.data( this[0] );

				if ( this[0].localName ) {
					var attr = this[0].attributes, name;
					for ( var i = 0, l = attr.length; i < l; i++ ) {
						name = attr[i].name;

						if ( name.indexOf( "data-" ) === 0 ) {
							name = name.substr( 5 );
							dataAttr( this[0], name, data[ name ] );
						}
					}
				}
			}

			return data;

		} else if ( typeof key === "object" ) {
			return this.each(function() {
				jSignage.data( this, key );
			});
		}

		var parts = key.split(".");
		parts[1] = parts[1] ? "." + parts[1] : "";

		if ( value === undefined ) {
			data = this.triggerHandler("getData" + parts[1] + "!", [parts[0]]);

			// Try to fetch any internally stored data first
			if ( data === undefined && this.length ) {
				data = jSignage.data( this[0], key );
				data = dataAttr( this[0], key, data );
			}

			return data === undefined && parts[1] ?
				this.data( parts[0] ) :
				data;

		} else {
			return this.each(function() {
				var $this = jSignage( this ),
					args = [ parts[0], value ];

				$this.triggerHandler( "setData" + parts[1] + "!", args );
				jSignage.data( this, key, value );
				$this.triggerHandler( "changeData" + parts[1] + "!", args );
			});
		}
	},

	removeData: function( key ) {
		return this.each(function() {
			jSignage.removeData( this, key );
		});
	}
});

function dataAttr( elem, key, data ) {
	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.localName ) {
		data = elem.getAttribute( "data-" + key );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
				data === "false" ? false :
				data === "null" ? null :
				!jSignage.isNaN( data ) ? parseFloat( data ) :
					rbrace.test( data ) ? jSignage.parseJSON( data ) :
					data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			jSignage.data( elem, key, data );

		} else {
			data = undefined;
		}
	}

	return data;
}

// TODO: This is a hack for 1.5 ONLY to allow objects with a single toJSON
// property to be considered empty objects; this property always exists in
// order to make sure JSON.stringify does not expose internal metadata
function isEmptyDataObject( obj ) {
	for ( var name in obj ) {
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}

var rreturn = /\r/g,
	rspecialurl = /^(?:href|src|style)$/

jSignage.fn.extend({
	attr: function( name, value ) {
		return jSignage.access( this, name, value, true, jSignage.attr );
	},

	removeAttr: function( name, fn ) {
		return this.each(function(){
			jSignage.attr( this, name, "" );
			if ( this.localName ) {
				this.removeAttribute( name );
			}
		});
	},

});

jSignage.extend({
	attrFn: {
		val: true,
		css: true,
		html: true,
		text: true,
		data: true,
		width: true,
		height: true,
		offset: true
	},

	attr: function( elem, name, value, pass ) {
		if ( !elem  )
			return undefined;

		if ( pass && name in jSignage.attrFn )
			return jSignage(elem)[name](value);

		var set = value !== undefined;  // Whether we are setting (or getting)

		if ( elem.localName ) {
			if ( set ) {
			    if ( value===null )
			        element.removeAttribute( name, value );
			    else
				    elem.setAttribute( name, value );
	        }
			if ( elem.hasAttribute && !elem.hasAttribute( name ) )
				return undefined;

			var attr = elem.getAttribute( name );

			// Non-existent attributes return null, we normalize to undefined
			return attr === null ? undefined : attr;
		}

		// Handle everything which isn't a DOM element node
		if ( set ) {
		    if ( value===null )
		        delete elem.name;
		    else
			    elem[ name ] = value;
		}
		return elem[ name ];
	}
});

/*!
 * Sizzle CSS Selector Engine
 *  Copyright 2011, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function(){

var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
	done = 0,
	toString = Object.prototype.toString,
	hasDuplicate = false,
	baseHasDuplicate = true,
	rBackslash = /\\/g,
	rNonWord = /\W/;

// Here we check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
[0, 0].sort(function() {
	baseHasDuplicate = false;
	return 0;
});

var Sizzle = function( selector, context, results, seed ) {
	results = results || [];
	context = context || document;

	var origContext = context;

	if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
		return [];
	}
	
	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	var m, set, checkSet, extra, ret, cur, pop, i,
		prune = true,
		contextXML = Sizzle.isXML( context ),
		parts = [],
		soFar = selector;
	
	// Reset the position of the chunker regexp (start from head)
	do {
		chunker.exec( "" );
		m = chunker.exec( soFar );

		if ( m ) {
			soFar = m[3];
		
			parts.push( m[1] );
		
			if ( m[2] ) {
				extra = m[3];
				break;
			}
		}
	} while ( m );

	if ( parts.length > 1 && origPOS.exec( selector ) ) {

		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
			set = posProcess( parts[0] + parts[1], context );

		} else {
			set = Expr.relative[ parts[0] ] ?
				[ context ] :
				Sizzle( parts.shift(), context );

			while ( parts.length ) {
				selector = parts.shift();

				if ( Expr.relative[ selector ] ) {
					selector += parts.shift();
				}
				
				set = posProcess( selector, set );
			}
		}

	} else {
		// Take a shortcut and set the context if the root selector is an ID
		// (but not if it'll be faster if the inner selector is an ID)
		if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
				Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {

			ret = Sizzle.find( parts.shift(), context, contextXML );
			context = ret.expr ?
				Sizzle.filter( ret.expr, ret.set )[0] :
				ret.set[0];
		}

		if ( context ) {
			ret = seed ?
				{ expr: parts.pop(), set: makeArray(seed) } :
				Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );

			set = ret.expr ?
				Sizzle.filter( ret.expr, ret.set ) :
				ret.set;

			if ( parts.length > 0 ) {
				checkSet = makeArray( set );

			} else {
				prune = false;
			}

			while ( parts.length ) {
				cur = parts.pop();
				pop = cur;

				if ( !Expr.relative[ cur ] ) {
					cur = "";
				} else {
					pop = parts.pop();
				}

				if ( pop == null ) {
					pop = context;
				}

				Expr.relative[ cur ]( checkSet, pop, contextXML );
			}

		} else {
			checkSet = parts = [];
		}
	}

	if ( !checkSet ) {
		checkSet = set;
	}

	if ( !checkSet ) {
		Sizzle.error( cur || selector );
	}

	if ( toString.call(checkSet) === "[object Array]" ) {
		if ( !prune ) {
			results.push.apply( results, checkSet );

		} else if ( context && context.nodeType === 1 ) {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i])) ) {
					results.push( set[i] );
				}
			}

		} else {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
					results.push( set[i] );
				}
			}
		}

	} else {
		makeArray( checkSet, results );
	}

	if ( extra ) {
		Sizzle( extra, origContext, results, seed );
		Sizzle.uniqueSort( results );
	}

	return results;
};

Sizzle.uniqueSort = function( results ) {
	if ( sortOrder ) {
		hasDuplicate = baseHasDuplicate;
		results.sort( sortOrder );

		if ( hasDuplicate ) {
			for ( var i = 1; i < results.length; i++ ) {
				if ( results[i] === results[ i - 1 ] ) {
					results.splice( i--, 1 );
				}
			}
		}
	}

	return results;
};

Sizzle.matches = function( expr, set ) {
	return Sizzle( expr, null, null, set );
};

Sizzle.matchesSelector = function( node, expr ) {
	return Sizzle( expr, null, null, [node] ).length > 0;
};

Sizzle.find = function( expr, context, isXML ) {
	var set;

	if ( !expr ) {
		return [];
	}

	for ( var i = 0, l = Expr.order.length; i < l; i++ ) {
		var match,
			type = Expr.order[i];
		
		if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
			var left = match[1];
			match.splice( 1, 1 );

			if ( left.substr( left.length - 1 ) !== "\\" ) {
				match[1] = (match[1] || "").replace( rBackslash, "" );
				set = Expr.find[ type ]( match, context, isXML );

				if ( set != null ) {
					expr = expr.replace( Expr.match[ type ], "" );
					break;
				}
			}
		}
	}

	if ( !set ) {
	    if ( typeof context.getElementsByTagName !== "undefined" ) {
		    set =  context.getElementsByTagName( "*" );
		} else {
		    set = [];
		    jSignage.eachElement( context, function() {
		        set.push( this );
		    });
	    }
	}

	return { set: set, expr: expr };
};

Sizzle.filter = function( expr, set, inplace, not ) {
	var match, anyFound,
		old = expr,
		result = [],
		curLoop = set,
		isXMLFilter = set && set[0] && Sizzle.isXML( set[0] );

	while ( expr && set.length ) {
		for ( var type in Expr.filter ) {
			if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) {
				var found, item,
					filter = Expr.filter[ type ],
					left = match[1];

				anyFound = false;

				match.splice(1,1);

				if ( left.substr( left.length - 1 ) === "\\" ) {
					continue;
				}

				if ( curLoop === result ) {
					result = [];
				}

				if ( Expr.preFilter[ type ] ) {
					match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

					if ( !match ) {
						anyFound = found = true;

					} else if ( match === true ) {
						continue;
					}
				}

				if ( match ) {
					for ( var i = 0; (item = curLoop[i]) != null; i++ ) {
						if ( item ) {
							found = filter( item, match, i, curLoop );
							var pass = not ^ !!found;

							if ( inplace && found != null ) {
								if ( pass ) {
									anyFound = true;

								} else {
									curLoop[i] = false;
								}

							} else if ( pass ) {
								result.push( item );
								anyFound = true;
							}
						}
					}
				}

				if ( found !== undefined ) {
					if ( !inplace ) {
						curLoop = result;
					}

					expr = expr.replace( Expr.match[ type ], "" );

					if ( !anyFound ) {
						return [];
					}

					break;
				}
			}
		}

		// Improper expression
		if ( expr === old ) {
			if ( anyFound == null ) {
				Sizzle.error( expr );

			} else {
				break;
			}
		}

		old = expr;
	}

	return curLoop;
};

Sizzle.error = function( msg ) {
	throw "Syntax error, unrecognized expression: " + msg;
};

var Expr = Sizzle.selectors = {
	order: [ "ID", "NAME", "TAG" ],

	match: {
		ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
		ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
		TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
		CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
		PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
	},

	leftMatch: {},

	attrMap: {
		"class": "className",
		"for": "htmlFor"
	},

	attrHandle: {
		href: function( elem ) {
			return elem.getAttribute( "href" );
		},
		type: function( elem ) {
			return elem.getAttribute( "type" );
		}
	},

	relative: {
		"+": function(checkSet, part){
			var isPartStr = typeof part === "string",
				isTag = isPartStr && !rNonWord.test( part ),
				isPartStrNotTag = isPartStr && !isTag;

			if ( isTag ) {
				part = part.toLowerCase();
			}

			for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
				if ( (elem = checkSet[i]) ) {
					while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

					checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
						elem || false :
						elem === part;
				}
			}

			if ( isPartStrNotTag ) {
				Sizzle.filter( part, checkSet, true );
			}
		},

		">": function( checkSet, part ) {
			var elem,
				isPartStr = typeof part === "string",
				i = 0,
				l = checkSet.length;

			if ( isPartStr && !rNonWord.test( part ) ) {
				part = part.toLowerCase();

				for ( ; i < l; i++ ) {
					elem = checkSet[i];

					if ( elem ) {
						var parent = elem.parentNode;
						checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
					}
				}

			} else {
				for ( ; i < l; i++ ) {
					elem = checkSet[i];

					if ( elem ) {
						checkSet[i] = isPartStr ?
							elem.parentNode :
							elem.parentNode === part;
					}
				}

				if ( isPartStr ) {
					Sizzle.filter( part, checkSet, true );
				}
			}
		},

		"": function(checkSet, part, isXML){
			var nodeCheck,
				doneName = done++,
				checkFn = dirCheck;

			if ( typeof part === "string" && !rNonWord.test( part ) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn( "parentNode", part, doneName, checkSet, nodeCheck, isXML );
		},

		"~": function( checkSet, part, isXML ) {
			var nodeCheck,
				doneName = done++,
				checkFn = dirCheck;

			if ( typeof part === "string" && !rNonWord.test( part ) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn( "previousSibling", part, doneName, checkSet, nodeCheck, isXML );
		}
	},

	find: {
		ID: function( match, context, isXML ) {
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [m] : [];
			}
		},

		NAME: function( match, context ) {
			if ( typeof context.getElementsByName !== "undefined" ) {
				var ret = [],
					results = context.getElementsByName( match[1] );

				for ( var i = 0, l = results.length; i < l; i++ ) {
					if ( results[i].getAttribute("name") === match[1] ) {
						ret.push( results[i] );
					}
				}

				return ret.length === 0 ? null : ret;
			} else {
			    var ret = [];
			    var name = match[1];
			    jSignage.eachElement( context, function() {
			        if ( this.getAttribute('name')==name )
			            ret.push( this );
			    });
			    return ret.length === 0 ? null : ret;
			}
		},

		TAG: function( match, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( match[1] );
			} else {
			    var nodes = [];
			    var localName = match[1];
			    jSignage.eachElement( context, function() {
			        if ( this.localName==localName )
			            nodes.push( this );
			    });
			    return nodes;
			}
		}
	},

	preFilter: {
		CLASS: function( match, curLoop, inplace, result, not, isXML ) {
			match = " " + match[1].replace( rBackslash, "" ) + " ";

			if ( isXML ) {
				return match;
			}

			for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
				if ( elem ) {
					if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n\r]/g, " ").indexOf(match) >= 0) ) {
						if ( !inplace ) {
							result.push( elem );
						}

					} else if ( inplace ) {
						curLoop[i] = false;
					}
				}
			}

			return false;
		},

		ID: function( match ) {
			return match[1].replace( rBackslash, "" );
		},

		TAG: function( match, curLoop ) {
			return match[1].replace( rBackslash, "" ).toLowerCase();
		},

		CHILD: function( match ) {
			if ( match[1] === "nth" ) {
				if ( !match[2] ) {
					Sizzle.error( match[0] );
				}

				match[2] = match[2].replace(/^\+|\s*/g, '');

				// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
				var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(
					match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
					!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

				// calculate the numbers (first)n+(last) including if they are negative
				match[2] = (test[1] + (test[2] || 1)) - 0;
				match[3] = test[3] - 0;
			}
			else if ( match[2] ) {
				Sizzle.error( match[0] );
			}

			// TODO: Move to normal caching system
			match[0] = done++;

			return match;
		},

		ATTR: function( match, curLoop, inplace, result, not, isXML ) {
			var name = match[1] = match[1].replace( rBackslash, "" );
			
			if ( !isXML && Expr.attrMap[name] ) {
				match[1] = Expr.attrMap[name];
			}

			// Handle if an un-quoted value was used
			match[4] = ( match[4] || match[5] || "" ).replace( rBackslash, "" );

			if ( match[2] === "~=" ) {
				match[4] = " " + match[4] + " ";
			}

			return match;
		},

		PSEUDO: function( match, curLoop, inplace, result, not ) {
			if ( match[1] === "not" ) {
				// If we're dealing with a complex expression, or a simple one
				if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
					match[3] = Sizzle(match[3], null, null, curLoop);

				} else {
					var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);

					if ( !inplace ) {
						result.push.apply( result, ret );
					}

					return false;
				}

			} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
				return true;
			}
			
			return match;
		},

		POS: function( match ) {
			match.unshift( true );

			return match;
		}
	},
	
	filters: {
		enabled: function( elem ) {
			return elem.disabled === false && elem.type !== "hidden";
		},

		disabled: function( elem ) {
			return elem.disabled === true;
		},

		checked: function( elem ) {
			return elem.checked === true;
		},
		
		selected: function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}
			
			return elem.selected === true;
		},

		parent: function( elem ) {
			return !!elem.firstChild;
		},

		empty: function( elem ) {
			return !elem.firstChild;
		},

		has: function( elem, i, match ) {
			return !!Sizzle( match[3], elem ).length;
		},

		header: function( elem ) {
			return (/h\d/i).test( elem.nodeName );
		},

		text: function( elem ) {
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc) 
			// use getAttribute instead to test this case
			return "text" === elem.getAttribute( 'type' );
		},
		radio: function( elem ) {
			return "radio" === elem.type;
		},

		checkbox: function( elem ) {
			return "checkbox" === elem.type;
		},

		file: function( elem ) {
			return "file" === elem.type;
		},
		password: function( elem ) {
			return "password" === elem.type;
		},

		submit: function( elem ) {
			return "submit" === elem.type;
		},

		image: function( elem ) {
			return "image" === elem.type;
		},

		reset: function( elem ) {
			return "reset" === elem.type;
		},

		button: function( elem ) {
			return "button" === elem.type || elem.nodeName.toLowerCase() === "button";
		},

		input: function( elem ) {
			return (/input|select|textarea|button/i).test( elem.nodeName );
		}
	},
	setFilters: {
		first: function( elem, i ) {
			return i === 0;
		},

		last: function( elem, i, match, array ) {
			return i === array.length - 1;
		},

		even: function( elem, i ) {
			return i % 2 === 0;
		},

		odd: function( elem, i ) {
			return i % 2 === 1;
		},

		lt: function( elem, i, match ) {
			return i < match[3] - 0;
		},

		gt: function( elem, i, match ) {
			return i > match[3] - 0;
		},

		nth: function( elem, i, match ) {
			return match[3] - 0 === i;
		},

		eq: function( elem, i, match ) {
			return match[3] - 0 === i;
		}
	},
	filter: {
		PSEUDO: function( elem, match, i, array ) {
			var name = match[1],
				filter = Expr.filters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );

			} else if ( name === "contains" ) {
				return (elem.textContent || elem.innerText || Sizzle.getText([ elem ]) || "").indexOf(match[3]) >= 0;

			} else if ( name === "not" ) {
				var not = match[3];

				for ( var j = 0, l = not.length; j < l; j++ ) {
					if ( not[j] === elem ) {
						return false;
					}
				}

				return true;

			} else {
				Sizzle.error( name );
			}
		},

		CHILD: function( elem, match ) {
			var type = match[1],
				node = elem;

			switch ( type ) {
				case "only":
				case "first":
					while ( (node = node.previousSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}

					if ( type === "first" ) { 
						return true; 
					}

					node = elem;

				case "last":
					while ( (node = node.nextSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}

					return true;

				case "nth":
					var first = match[2],
						last = match[3];

					if ( first === 1 && last === 0 ) {
						return true;
					}
					
					var doneName = match[0],
						parent = elem.parentNode;
	
					if ( parent && (parent.sizcache !== doneName || !elem.nodeIndex) ) {
						var count = 0;
						
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.nodeIndex = ++count;
							}
						} 

						parent.sizcache = doneName;
					}
					
					var diff = elem.nodeIndex - last;

					if ( first === 0 ) {
						return diff === 0;

					} else {
						return ( diff % first === 0 && diff / first >= 0 );
					}
			}
		},

		ID: function( elem, match ) {
			return elem.nodeType === 1 && elem.getAttribute("id") === match;
		},

		TAG: function( elem, match ) {
			return (match === "*" && elem.nodeType === 1) || elem.nodeName.toLowerCase() === match;
		},
		
		CLASS: function( elem, match ) {
			return (" " + (elem.className || elem.getAttribute("class")) + " ")
				.indexOf( match ) > -1;
		},

		ATTR: function( elem, match ) {
			var name = match[1],
				result = Expr.attrHandle[ name ] ?
					Expr.attrHandle[ name ]( elem ) :
					elem[ name ] != null ?
						elem[ name ] :
						elem.getAttribute( name ),
				value = result + "",
				type = match[2],
				check = match[4];

			return result == null ?
				type === "!=" :
				type === "=" ?
				value === check :
				type === "*=" ?
				value.indexOf(check) >= 0 :
				type === "~=" ?
				(" " + value + " ").indexOf(check) >= 0 :
				!check ?
				value && result !== false :
				type === "!=" ?
				value !== check :
				type === "^=" ?
				value.indexOf(check) === 0 :
				type === "$=" ?
				value.substr(value.length - check.length) === check :
				type === "|=" ?
				value === check || value.substr(0, check.length + 1) === check + "-" :
				false;
		},

		POS: function( elem, match, i, array ) {
			var name = match[2],
				filter = Expr.setFilters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			}
		}
	}
};

var origPOS = Expr.match.POS,
	fescape = function(all, num){
		return "\\" + (num - 0 + 1);
	};

for ( var type in Expr.match ) {
	Expr.match[ type ] = new RegExp( Expr.match[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source) );
	Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, fescape) );
}

var makeArray = function( array, results ) {
	array = Array.prototype.slice.call( array, 0 );

	if ( results ) {
		results.push.apply( results, array );
		return results;
	}
	
	return array;
};

makeArray = function( array, results ) {
	var i = 0,
		ret = results || [];

	if ( toString.call(array) === "[object Array]" ) {
		Array.prototype.push.apply( ret, array );

	} else {
		if ( typeof array.length === "number" ) {
			for ( var l = array.length; i < l; i++ ) {
				ret.push( array[i] );
			}

		} else {
			for ( ; array[i]; i++ ) {
				ret.push( array[i] );
			}
		}
	}

	return ret;
};

var sortOrder, siblingCheck;

if ( document.documentElement.compareDocumentPosition ) {
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
			return a.compareDocumentPosition ? -1 : 1;
		}

		return a.compareDocumentPosition(b) & 4 ? -1 : 1;
	};

} else {
	sortOrder = function( a, b ) {
		var al, bl,
			ap = [],
			bp = [],
			aup = a.parentNode,
			bup = b.parentNode,
			cur = aup;

		// The nodes are identical, we can exit early
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// If the nodes are siblings (or identical) we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );

		// If no parents were found then the nodes are disconnected
		} else if ( !aup ) {
			return -1;

		} else if ( !bup ) {
			return 1;
		}

		// Otherwise they're somewhere else in the tree so we need
		// to build up a full list of the parentNodes for comparison
		while ( cur ) {
			ap.unshift( cur );
			cur = cur.parentNode;
		}

		cur = bup;

		while ( cur ) {
			bp.unshift( cur );
			cur = cur.parentNode;
		}

		al = ap.length;
		bl = bp.length;

		// Start walking down the tree looking for a discrepancy
		for ( var i = 0; i < al && i < bl; i++ ) {
			if ( ap[i] !== bp[i] ) {
				return siblingCheck( ap[i], bp[i] );
			}
		}

		// We ended someplace up the tree so do a sibling check
		return i === al ?
			siblingCheck( a, bp[i], -1 ) :
			siblingCheck( ap[i], b, 1 );
	};

	siblingCheck = function( a, b, ret ) {
		if ( a === b ) {
			return ret;
		}

		var cur = a.nextSibling;

		while ( cur ) {
			if ( cur === b ) {
				return -1;
			}

			cur = cur.nextSibling;
		}

		return 1;
	};
}

// Utility function for retreiving the text value of an array of DOM nodes
Sizzle.getText = function( elems ) {
	var ret = "", elem;

	for ( var i = 0; elems[i]; i++ )
	    ret += elems[i].textContent;

	return ret;
};

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];

		if ( elem ) {
			var match = false;

			elem = elem[dir];

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 && !isXML ){
					elem.sizcache = doneName;
					elem.sizset = i;
				}

				if ( elem.nodeName.toLowerCase() === cur ) {
					match = elem;
					break;
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];

		if ( elem ) {
			var match = false;
			
			elem = elem[dir];

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 ) {
					if ( !isXML ) {
						elem.sizcache = doneName;
						elem.sizset = i;
					}

					if ( typeof cur !== "string" ) {
						if ( elem === cur ) {
							match = true;
							break;
						}

					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
						match = elem;
						break;
					}
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

if ( document.documentElement.contains ) {
	Sizzle.contains = function( a, b ) {
		return a !== b && (a.contains ? a.contains(b) : true);
	};

} else if ( document.documentElement.compareDocumentPosition ) {
	Sizzle.contains = function( a, b ) {
		return !!(a.compareDocumentPosition(b) & 16);
	};

} else {
	Sizzle.contains = function() {
		return false;
	};
}

Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833) 
	var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;

	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

var posProcess = function( selector, context ) {
	var match,
		tmpSet = [],
		later = "",
		root = context.nodeType ? [context] : context;

	// Position selectors must be done after the filter
	// And so must :not(positional) so we move all PSEUDOs to the end
	while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
		later += match[0];
		selector = selector.replace( Expr.match.PSEUDO, "" );
	}

	selector = Expr.relative[selector] ? selector + "*" : selector;

	for ( var i = 0, l = root.length; i < l; i++ ) {
		Sizzle( selector, root[i], tmpSet );
	}

	return Sizzle.filter( later, tmpSet );
};

// EXPOSE
jSignage.find = Sizzle;
jSignage.expr = Sizzle.selectors;
jSignage.expr[":"] = jSignage.expr.filters;
jSignage.unique = Sizzle.uniqueSort;
jSignage.text = Sizzle.getText;
jSignage.isXMLDoc = Sizzle.isXML;
jSignage.contains = Sizzle.contains;


})();

var runtil = /Until$/,
	rparentsprev = /^(?:parents|prevUntil|prevAll)/,
	// Note: This RegExp should be improved, or likely pulled from Sizzle
	rmultiselector = /,/,
	isSimple = /^.[^:#\[\.,]*$/,
	slice = Array.prototype.slice,
	POS = jSignage.expr.match.POS,
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jSignage.fn.extend({
	find: function( selector ) {
		var ret = this.pushStack( "", "find", selector ),
			length = 0;

		for ( var i = 0, l = this.length; i < l; i++ ) {
			length = ret.length;
			jSignage.find( selector, this[i], ret );

			if ( i > 0 ) {
				// Make sure that the results are unique
				for ( var n = length; n < ret.length; n++ ) {
					for ( var r = 0; r < length; r++ ) {
						if ( ret[r] === ret[n] ) {
							ret.splice(n--, 1);
							break;
						}
					}
				}
			}
		}

		return ret;
	},

	has: function( target ) {
		var targets = jSignage( target );
		return this.filter(function() {
			for ( var i = 0, l = targets.length; i < l; i++ ) {
				if ( jSignage.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	not: function( selector ) {
		return this.pushStack( winnow(this, selector, false), "not", selector);
	},

	filter: function( selector ) {
		return this.pushStack( winnow(this, selector, true), "filter", selector );
	},

	is: function( selector ) {
		return !!selector && jSignage.filter( selector, this ).length > 0;
	},

	closest: function( selectors, context ) {
		var ret = [], i, l, cur = this[0];

		if ( jSignage.isArray( selectors ) ) {
			var match, selector,
				matches = {},
				level = 1;

			if ( cur && selectors.length ) {
				for ( i = 0, l = selectors.length; i < l; i++ ) {
					selector = selectors[i];

					if ( !matches[selector] ) {
						matches[selector] = jSignage.expr.match.POS.test( selector ) ?
							jSignage( selector, context || this.context ) :
							selector;
					}
				}

				while ( cur && cur.ownerDocument && cur !== context ) {
					for ( selector in matches ) {
						match = matches[selector];

						if ( match.jsignage ? match.index(cur) > -1 : jSignage(cur).is(match) ) {
							ret.push({ selector: selector, elem: cur, level: level });
						}
					}

					cur = cur.parentNode;
					level++;
				}
			}

			return ret;
		}

		var pos = POS.test( selectors ) ?
			jSignage( selectors, context || this.context ) : null;

		for ( i = 0, l = this.length; i < l; i++ ) {
			cur = this[i];

			while ( cur ) {
				if ( pos ? pos.index(cur) > -1 : jSignage.find.matchesSelector(cur, selectors) ) {
					ret.push( cur );
					break;

				} else {
					cur = cur.parentNode;
					if ( !cur || !cur.ownerDocument || cur === context ) {
						break;
					}
				}
			}
		}

		ret = ret.length > 1 ? jSignage.unique(ret) : ret;

		return this.pushStack( ret, "closest", selectors );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {
		if ( !elem || typeof elem === "string" ) {
			return jSignage.inArray( this[0],
				// If it receives a string, the selector is used
				// If it receives nothing, the siblings are used
				elem ? jSignage( elem ) : this.parent().children() );
		}
		// Locate the position of the desired element
		return jSignage.inArray(
			// If it receives a jSignage object, the first element is used
			elem.jsignage ? elem[0] : elem, this );
	},

	add: function( selector, context ) {
		var set = typeof selector === "string" ?
				jSignage( selector, context ) :
				jSignage.makeArray( selector ),
			all = jSignage.merge( this.get(), set );

		return this.pushStack( isDisconnected( set[0] ) || isDisconnected( all[0] ) ?
			all :
			jSignage.unique( all ) );
	},

	andSelf: function() {
		return this.add( this.prevObject );
	}
});

// A painfully simple check to see if an element is disconnected
// from a document (should be improved, where feasible).
function isDisconnected( node ) {
	return !node || !node.parentNode || node.parentNode.nodeType === 11;
}

jSignage.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jSignage.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jSignage.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return jSignage.nth( elem, 2, "nextSibling" );
	},
	prev: function( elem ) {
		return jSignage.nth( elem, 2, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jSignage.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jSignage.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jSignage.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jSignage.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jSignage.sibling( elem.parentNode.firstChild, elem );
	},
	children: function( elem ) {
		return jSignage.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return jSignage.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jSignage.makeArray( elem.childNodes );
	}
}, function( name, fn ) {
	jSignage.fn[ name ] = function( until, selector ) {
		var ret = jSignage.map( this, fn, until ),
			// The variable 'args' was introduced in
			// https://github.com/jquery/jquery/commit/52a0238
			// to work around a bug in Chrome 10 (Dev) and should be removed when the bug is fixed.
			// http://code.google.com/p/v8/issues/detail?id=1050
			args = slice.call(arguments);

		if ( !runtil.test( name ) ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			ret = jSignage.filter( selector, ret );
		}

		ret = this.length > 1 && !guaranteedUnique[ name ] ? jSignage.unique( ret ) : ret;

		if ( (this.length > 1 || rmultiselector.test( selector )) && rparentsprev.test( name ) ) {
			ret = ret.reverse();
		}

		return this.pushStack( ret, name, args.join(",") );
	};
});

jSignage.extend({
	filter: function( expr, elems, not ) {
		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 ?
			jSignage.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :
			jSignage.find.matches(expr, elems);
	},

	dir: function( elem, dir, until ) {
		var matched = [],
			cur = elem[ dir ];

		while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jSignage( cur ).is( until )) ) {
			if ( cur.nodeType === 1 ) {
				matched.push( cur );
			}
			cur = cur[dir];
		}
		return matched;
	},

	nth: function( cur, result, dir, elem ) {
		result = result || 1;
		var num = 0;

		for ( ; cur; cur = cur[dir] ) {
			if ( cur.nodeType === 1 && ++num === result ) {
				break;
			}
		}

		return cur;
	},

	sibling: function( n, elem ) {
		var r = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				r.push( n );
			}
		}

		return r;
	}
});

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, keep ) {
	if ( jSignage.isFunction( qualifier ) ) {
		return jSignage.grep(elements, function( elem, i ) {
			var retVal = !!qualifier.call( elem, i, elem );
			return retVal === keep;
		});

	} else if ( qualifier.nodeType ) {
		return jSignage.grep(elements, function( elem, i ) {
			return (elem === qualifier) === keep;
		});

	} else if ( typeof qualifier === "string" ) {
		var filtered = jSignage.grep(elements, function( elem ) {
			return elem.nodeType === 1;
		});

		if ( isSimple.test( qualifier ) ) {
			return jSignage.filter(qualifier, filtered, !keep);
		} else {
			qualifier = jSignage.filter( qualifier, filtered );
		}
	}

	return jSignage.grep(elements, function( elem, i ) {
		return (jSignage.inArray( elem, qualifier ) >= 0) === keep;
	});
}

jSignage.fn.extend({
	wrapAll: function( html ) {
		if ( jSignage.isFunction( html ) ) {
			return this.each(function(i) {
				jSignage(this).wrapAll( html.call(this, i) );
			});
		}

		if ( this[0] ) {
			// The elements to wrap the target around
			var wrap = jSignage( html, this[0].ownerDocument ).eq(0).clone(true);

			if ( this[0].parentNode ) {
				wrap.insertBefore( this[0] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstElementChild ) {
					elem = elem.firstElementChild;
				}

				return elem;
			}).append(this);
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jSignage.isFunction( html ) ) {
			return this.each(function(i) {
				jSignage(this).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jSignage( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		return this.each(function() {
			jSignage( this ).wrapAll( html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jSignage.nodeName( this, "svg" ) )
				jSignage( this ).replaceWith( jSignage.childNodes(this) );
		}).end();
	},

	append: function() {
		return this.domManip(arguments, function( elem ) {
			if ( this.localName )
				this.appendChild( elem );
		});
	},

	prepend: function() {
		return this.domManip(arguments, function( elem ) {
			if ( this.localName )
				this.insertBefore( elem, this.firstElementChild );
		});
	},

	before: function() {
		if ( this[0] && this[0].parentNode ) {
			return this.domManip(arguments, function( elem ) {
				this.parentNode.insertBefore( elem, this );
			});
		}
	},

	after: function() {
		if ( this[0] && this[0].parentNode ) {
			return this.domManip(arguments, function( elem ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			});
		}
	},

	remove: function( selector ) {
		for ( var i = 0, elem; (elem = this[i]) != null; i++ )
			if ( !selector || jSignage.filter( selector, [ elem ] ).length )
			    elem.textContent = '';
		return this;
	},

	empty: function() {
		for ( var i = 0, elem; (elem = this[i]) != null; i++ )
		    elem.textContent = '';
		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function () {
			return jSignage.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

	replaceWith: function( value ) {
		if ( this[0] && this[0].parentNode ) {
			// Make sure that the elements are removed from the DOM before they are inserted
			// this can help fix replacing a parent with child elements
			if ( jSignage.isFunction( value ) ) {
				return this.each(function(i) {
					var self = jSignage(this), old = self.html();
					self.replaceWith( value.call( this, i, old ) );
				});
			}

			if ( typeof value !== "string" ) {
				value = jSignage( value ).detach();
			}

			return this.each(function() {
				var next = this.nextElementSibling, parent = this.parentNode;

				jSignage( this ).remove();

				if ( next ) {
					jSignage(next).before( value );
				} else {
					jSignage(parent).append( value );
				}
			});
		}
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, callback ) {
		var first, fragment, parent, value = args[0];

		if ( jSignage.isFunction(value) ) {
			return this.each(function(i) {
				var self = jSignage(this);
				args[0] = value.call(this, i, undefined);
				self.domManip( args, callback );
			});
		}

		if ( this[0] ) {
			fragment = jSignage.buildFragment( args, this );
			for ( var i = 0, l = this.length, lastIndex = l - 1; i < l; i++ )
				callback.call( this[i], (l > 1 && i < lastIndex) ? jSignage.clone( fragment, true, true ) : fragment );
		}

		return this;
	}
});

jSignage.rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;

jSignage.buildFragment = function( args, nodes ) {
    args = args[0];
    if ( !args )
        return null;
    if ( jSignage.isArray(args) )
        args = args[0];
	if ( args.nodeType===1 ) {
	    return args;
	} else if ( args.jsignage ) {
	    return args[0];
	} else {
    	var doc = (nodes && nodes[0] ? nodes[0].ownerDocument || nodes[0] : document);
    	var nsuri = doc.documentElement ? doc.documentElement.namespaceURI : jSignage.svgNS;
	    var ret = jSignage.rsingleTag.exec( args );
    	if ( ret )
			return document.createElementNS( nsuri, ret[1] );
        var idx = args.search( /\s|[>/]/ );
        if ( idx > 0 )
            args = args.substring(0,idx) + ' xmlns="' + nsuri + '"' + args.substring(idx);
		return parseXML( args, doc );
    }
    return null;
};

jSignage.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jSignage.fn[ name ] = function( selector ) {
		var ret = [], insert = jSignage( selector );
		for ( var i = 0, l = insert.length; i < l; i++ ) {
			var elems = (i > 0 ? this.clone(true) : this).get();
			jSignage( insert[i] )[ original ]( elems );
			ret = ret.concat( elems );
		}
		return this.pushStack( ret, name, insert.selector );
	};
});

(function(){

jSignage.extend({
    xmlNS: 'http://www.w3.org/XML/1998/namespace',
    svgNS: 'http://www.w3.org/2000/svg',
    spxNS: 'http://www.spinetix.com/namespace/1.0/spx',
    xlinkNS: 'http://www.w3.org/1999/xlink',
    xmlevNS: 'http://www.w3.org/2001/xml-events',
    xhtmlNS: 'http://www.w3.org/1999/xhtml',

    bind: function( element, eventType, data, handler ) {
		if ( handler == null ) {
			handler = data;
			data = null;
		}
        element.addEventListener( eventType, function(event) {
            if ( data!=null )
                event.data = data;
            handler.call( element, event );
        }, false );
    },

    setTimeout: function( callback, ms ) {
        if ( jSignage.timeline ) {
            var action = new TimedAction( ms/1000, 'callback', callback );
            jSignage.timeline.scheduleRelative( null, action );
            return action;
        }
        if ( 'createTimer' in window ) {
            var timer = createTimer( ms, -1 );
            timer.addEventListener( 'SVGTimer', callback, false );
            timer.start();
            return timer;
        }
        return window.setTimeout( callback, ms );
    },

    clearTimeout: function( timer ) {
        if ( jSignage.timeline )
            jSignage.timeline.cancel( timer );
        else if ( 'createTimer' in window )
            timer.stop();
        else
            window.clearTimeout( timer );
    },

    setInterval: function( callback, ms ) {
        if ( 'createTimer' in window ) {
            var timer = createTimer( ms, ms );
            timer.addEventListener( 'SVGTimer', callback, false );
            timer.start();
            return timer;
        }
        return window.setInterval( callback, ms );
    },

    clearInterval: function( timer ) {
        if ( 'createTimer' in window )
            timer.stop();
        else
            window.clearInterval( timer );
    },

    getCurrentTime: function() {
        if ( jSignage.features.MSIE )
            return (Date.now() - jSignage.originOfTime)/1000;
        else
            return document.documentElement.getCurrentTime();
    }
});

jSignage.fn.extend({
    bind: function( eventType, data, handler ) {
		if ( handler == null ) {
			handler = data;
			data = null;
		}
        this.each( function() {
            jSignage.bind( this, eventType, data, handler );
        } );
        return this;
    }
});

jSignage.each( [ 'DOMFocusIn', 'DOMFocusOut', 'DOMActivate', 'click', 'mousedown', 'mouseup', 'mouseover', 'mousemove', 'mouseout', 'mousewheel', 'textInput', 'keydown', 'keyup', 'load', 'resize', 'scroll', 'beginEvent', 'endEvent', 'repeatEvent' ], function( index, eventType ) {
    jSignage.fn[ eventType ] = function( data, handler ) {
		if ( handler == null ) {
			handler = data;
			data = null;
		}
		return this.bind( eventType, data, handler );
	};
});

jSignage.fn.extend({
    dblclick: function( data, handler ) {
        this.click( data, function( event ) {
            if ( event.detail==2 )
                handler.call( this, event );
        });
    },

    mouseenter: function( data, handler ) {
        this.mouseover( data, function( event ) {
            var parent = event.relatedTarget;
            while ( parent && parent!==this )
                parent=parent.parentNode;
            if ( parent !== this )
                handler.call( this, event );
        });
    },

    mouseleave: function( data, handler ) {
        this.mouseout( data, function( event ) {
            var parent = event.relatedTarget;
            while ( parent && parent!==this )
                parent = parent.parentNode;
            if ( parent!==this )
                handler.call( this, event );
        });
    },

    hover: function( handlerIn, handlerOut ) {
        this.mouseenter( handlerIn ).mouseleave( handlerOut || handlerIn );
    }
});

// Layer support

var smilTimecount = /^([0-9]+(?:\.[0-9]+)?)(h|min|s|ms)?$/;
var smilClockValue = /^([0-9][0-9])?:([0-9][0-9]):([0-9][0-9](?:\.[0-9]+)?)$/;
var viewport_attributes = [ 'top', 'bottom', 'left', 'right', 'width', 'height', 'viewBox', 'transform' ];
var timing_attributes = [ 'begin', 'dur', 'repeatDur', 'repeatCount', 'min', 'max' ];
var reSplitList = / *[ ,] */;
var reTimePoint = /^((?:[\w\u00c0-\uFFFF\-]|\\.)+)\.(begin|end)/;

function parseTimePoint( timePoint ) {
    var tp = {
        timed: null,
        point: null,
        offset: 0
    };
    var ref = reTimePoint.exec( timePoint );
    if ( ref ) {
        tp.timed = jSignage.timedLayers[ref[1]];
        tp.point = ref[2];
        if ( ref[0].length >= timePoint.length )
            tp.offset = 0;
        else if ( timePoint.charAt(ref[0].length)=='+' )
            tp.offset = jSignage.durInSeconds( timePoint.substring( ref[0].length+1 ), 0 );
        else if ( timePoint.charAt(ref[0].length)=='-' )
            tp.offset = -jSignage.durInSeconds( timePoint.substring( ref[0].length+1 ), 0 );
    } else {
        tp.offset = jSignage.durInSeconds( timePoint, 0 );
    }
    return tp;
}

function computeActiveDur( smil ) {
    var dur = smil.getAttribute( 'dur' );
    if ( dur!='indefinite' && dur!='media' ) {
        dur = jSignage.durInSeconds( dur, -1 );
        if ( dur < 0 )
            dur = smil.localName=='audio' || smil.localName=='video' || smil.localName=='animation' ? 'media' : 'indefinite';
    }
    var repeatDur = smil.getAttribute( 'repeatDur' );
    if ( repeatDur!='indefinite' ) {
        repeatDur = jSignage.durInSeconds( repeatDur, -1 );
        if ( repeatDur<0 )
            repeatDur = null;
    }
    var repeatCount = smil.getAttribute( 'repeatCount' );
    if ( repeatCount!='indefinite' ) {
        repeatCount = jSignage.durInSeconds( repeatCount, -1 );
        if ( repeatCount<0 )
            repeatCount = null;
    }
    var min = jSignage.durInSeconds( smil.getAttribute( 'min' ), -1 );
    if ( min < 0 )
        min = 0;
    var max = jSignage.durInSeconds( smil.getAttribute( 'max' ), -1 );
    if ( max < 0 )
        max = 'indefinite';
    var p0 = typeof(dur)=='number' && dur>=0 ? dur : 'indefinite', AD;
    if ( p0==0 ) {
        AD = 0;
    } else if ( repeatDur===null && repeatCount===null ) {
        AD = p0;
    } else {
        var p1 = repeatCount===null || repeatCount==='indefinite' || typeof(dur)!='number' || dur<0 ? 'indefinite' : repeatCount * dur;
        var p2 = repeatDur===null || repeatDur==='indefinite' ? 'indefinite' : repeatDur;
        AD = p1==='indefinite' ? p2 : p2==='indefinite' ? p1 : Math.min( p1, p2 );
    }
    if ( typeof(AD)=='number' && AD < min )
        AD = min;
    if ( typeof(max)=='number' && ( AD=='indefinite' || AD > max ) )
        AD = max;
    return AD;
}

function TimedAction( dueDate, type, target ) {
    this.dueDate = dueDate;
    this.type = type;
    this.target = target;
}

TimedAction.prototype = {
    trig: function( tNow ) {
        if ( this.type=='beginLayer' ) {
            this.target.begin( tNow );
        } else if ( this.type=='endLayer' ) {
            this.target.end( tNow );
        } else if ( this.type=='callback' ) {
            this.target( tNow );
        } else if ( this.type=='beginElement' ) {
            if ( jSignage.features.SVGAnimation )
                this.target.beginElement();
            else
                launchSoftAnimation( tNow, this.target );
        } else if ( this.type=='endElement' ) {
            if ( jSignage.features.SVGAnimation )
                this.target.endElement();
            else
                cancelSoftAnimation( tNow, this.target );
        }
    }
};

function Timeline() {
    this.actions = [ ];                 // List of actions sorted by 1) dueDate, 2) order of insertion
    this.currentDate = 0;               // Current position in the timeline
    this.timer = null;
    this.intimeout = false;
}

Timeline.prototype = {
    schedule: function( action ) {
        var oldDueDate = this.actions.length ? this.actions[0].dueDate : null;
        // Binary search for correct position
        var i, a = 0, b = this.actions.length;
        while ( a+1 < b ) {
            i = Math.floor((a+b)/2);
            if ( this.actions[i].dueDate > action.dueDate )
                b = i;
            else
                a = i;
        }
        if ( a==this.actions.length || this.actions[a].dueDate > action.dueDate )
            i = a;
        else
            i = b;
        while ( i<this.actions.length && this.actions[i].dueDate==action.dueDate )
            ++i;
        if ( i==this.actions.length )
            this.actions.push( action );
        else
            this.actions.splice( i, 0, action );
        var newDueDate = this.actions[0].dueDate;
        if ( !this.intimeout && ( oldDueDate==null || newDueDate < oldDueDate ) ) {
            now = jSignage.getCurrentTime();
            if ( newDueDate <= now ) {
                this.timeout( newDueDate );
            } else {
                if ( this.timer )
                    clearTimeout( this.timer );
                var timeline = this;
                this.timer = setTimeout( function() {
                    timeline.timeout( newDueDate )
                }, (newDueDate-now)*1000 );
            }
        }
    },

    scheduleRelative: function( tNow, action ) {
        this.schedule( new TimedAction( (tNow || jSignage.getCurrentTime())+action.dueDate, action.type, action.target ) );        
    },

    cancel: function( action ) {
        // Binary search for correct position
        var i, a = 0, b = this.actions.length;
        if ( b==0 )
            return;
        while ( a+1 < b ) {
            i = Math.floor((a+b)/2);
            if ( this.actions[i].dueDate > action.dueDate )
                b = i;
            else
                a = i;
        }
        if ( b==this.actions.length )
            --b;
        for ( i = b; i>=0 && this.actions[i].dueDate==action.dueDate; --i ) {
            if ( this.actions[i].type==action.type && this.actions[i].target==action.target ) {
                this.actions.splice( i, 1 );
                return;
            }
        }
        for ( i = a; i<this.actions.length && this.actions[i].dueDate==action.dueDate; i++ ) {
            if ( this.actions[i].type==action.type && this.actions[i].target==action.target ) {
                this.actions.splice( i, 1 );
                return;
            }
        }
    },

    timeout: function( tNow ) {
        if ( this.timer ) {
            clearTimeout( this.timer );
            this.timer = null;
        }
        this.intimeout = true;
        while ( this.actions.length>0 && this.actions[0].dueDate<=tNow ) {
            var action = this.actions.shift();
            action.trig( tNow );
        }
        this.intimeout = false;
        if ( this.actions.length ) {
            var timeline = this;
            var nextDueDate = this.actions[0].dueDate;
            this.timer = setTimeout( function() {
                timeline.timeout( nextDueDate )
            }, (nextDueDate-jSignage.getCurrentTime())*1000 );
        }
    },

    scheduleElement: function( trigger, smil, endCallback ) {
        var tp = parseTimePoint( trigger ), dur;
        if ( endCallback )
            dur = computeActiveDur( smil );

        if ( tp.timed==null ) {
            this.schedule( new TimedAction( tp.offset, 'beginElement', smil ) );
            if ( endCallback && dur!='indefinite' )
                this.schedule( new TimedAction( tp.offset+dur, 'callback', endCallback ) );
        } else {
            if ( tp.point=='begin' || tp.point=='beginEvent' ) {
                tp.timed.beginActions.push( new TimedAction( tp.offset, 'beginElement', smil ) );
                if ( endCallback && dur!='indefinite' )
                    tp.timed.beginActions.push( new TimedAction( tp.offset+dur, 'callback', endCallback ) );
            } else if ( tp.point=='end' || tp.point=='endEvent' ) {
                tp.timed.endActions.push( new TimedAction( tp.offset, 'beginElement', smil ) );
                if ( endCallback && dur!='indefinite' )
                    tp.timed.endActions.push( new TimedAction( tp.offset+dur, 'callback', endCallback ) );
            }
            if ( tp.timed.activeStart!=null ) {
                if ( tp.point=='begin' ) {
                    this.schedule( new TimedAction( tp.timed.activeStart+tp.offset, 'beginElement', smil ) );
                    if ( endCallback && dur!='indefinite' )
                        this.schedule( new TimedAction( tp.timed.activeStart+tp.offset+dur, 'callback', endCallback ) );
                } else if ( ( tp.point=='end' || tp.point=='endEvent' ) && tp.offset<0 && tp.timed.activeEnd!='indefinite' ) {
                    this.schedule( new TimedAction( tp.timed.activeEnd+tp.offset, 'beginElement', smil ) );
                    if ( endCallback && dur!='indefinite' && tp.offset+dur<0 )
                        this.schedule( new TimedAction( tp.timed.activeEnd+tp.offset+dur, 'callback', endCallback ) );
                }
            }
        }
    }
};

function SoftAnimatedElement( targetElement ) {
    this.targetElement = targetElement || null; // Element whose attribute(s) are animated
    this.animatedAttributes = { };              // Map of attribute name to SoftAnimatedAttribute object
    this.animatedAttributesCount = 0;
}

var attributeTypeTable = {
    'audio-level': 1, 'fill-opacity': 1, 'font-size': 1, 'line-increment': 1, opacity: 1, 'solid-opacity': 1, 'stop-opacity': 1,
    'stroke-dashoffset': 1, 'stroke-miterlimit': 1, 'stroke-opacity': 1, 'stroke-width': 1, 'viewport-fill-opacity': 1,
    cx: 1, cy: 1, r: 1, rx: 1, ry: 1, x: 1, y: 1, width: 1, height: 1, x1: 1, x2: 1, y1: 1, y2: 1, offset: 1, pathLength: 1,
    'stroke-dasharray': 2, points: 2, rotate: 2,
    'color': 3, 'solid-color': 3, fill: 3, stroke: 3, 'viewport-fill': 3,
    transform: 4,
    motion: 5
};

var attributeLacunaTable = {
    'audio-level': 1, 'fill-opacity': 1, opacity: 1, 'solid-opacity': 1, 'stop-opacity': 1, 'stroke-opacity': 1, 'viewport-fill-opacity': 1
};

function SoftAnimatedAttribute( target, name ) {
    this.target = target || null;       // Target SoftAnimatedElement object
    this.name = name || '';             // Name of attribute
    this.type = 0;                      // Type of attribute ( 0 => text, 1 => number, 2 => vector, 3 => color, 4 => transform, 5 => motion )
    this.rawBase = '';                  // Raw base value
    this.baseValue = null;              // Base value, parsed
    this.animations = [ ];              // Array of active SoftAnimation objects in sandwich order

    this.type = attributeTypeTable[this.name] || 0;
    if ( this.target ) {
        var text = this.target.targetElement.getAttribute( this.name );
        if ( text===null ) text='';
        this.rawBase = text;
        this.baseValue = this.parse( text );
    }
}

var reSplitValues = /\s*;\s*/;
var reSplitVector = /\s+,?\s*|,\s*/;
var reTransformMatrix = /^matrix\s*\(\s*([+-]?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)(?:\s+,?\s*|,\s*)([+-]?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)(?:\s+,?\s*|,\s*)([+-]?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)(?:\s+,?\s*|,\s*)([+-]?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)(?:\s+,?\s*|,\s*)([+-]?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)(?:\s+,?\s*|,\s*)([+-]?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*\)/;
var reTransformTranslate = /^translate\s*\(\s*([+-]?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)(?:(?:\s+,?\s*|,\s*)([+-]?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?))?\s*\)/;
var reTransformScale = /^scale\s*\(\s*([+-]?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)(?:(?:\s+,?\s*|,\s*)([+-]?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?))?\s*\)/;
var reTransformRotate = /^rotate\s*\(\s*([+-]?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)(?:(?:\s+,?\s*|,\s*)([+-]?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?))?(?:(?:\s+,?\s*|,\s*)([+-]?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?))?\s*\)/;
var reTransformSkew = /^skew([XY])\s*\(\s*([+-]?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*\)/;
var reSplitCSS = /;\s*/;

function addVector( a, b ) {
    var n1 = Math.min( a.length, b.length );
    var r = [];
    for ( var i=0; i<n1; i++ )
        r.push( a[i] + b[i] );
    for ( ; i<a.length; i++ )
        r.push( a[i] );
    for ( ; i<b.length; i++ )
        r.push( b[i] );
    return r;
}

function subVector( a, b ) {
    var n1 = Math.min( a.length, b.length );
    r = [];
    for ( var i=0; i<n1; i++ )
        r.push( a[i] - b[i] );
    for ( ; i<a.length; i++ )
        r.push( a[i] );
    for ( ; i<b.length; i++ )
        r.push( -b[i] );
    return r;
}

function scalarMulVector( a, coef ) {
    var r = [];
    for ( var i=0; i<a.length; i++ )
        r.push( a[i] * coef );
    return r;
}

function transformMatrix( type, v ) {
    if ( type=='matrix' )
        return [ v[0], v[1], v[2], v[3], v[4], v[5] ];
    if ( type=='translate' )
        return [ 1, 0, 0, 1, v[0], v[1] ];
    if ( type=='scale' )
        return [ v[0], 0, 0, v[1], 0, 0 ];
    if ( type=='rotate' ) {
        var mat = [ Math.cos( v[0] ), Math.sin( v[0] ), -Math.sin( v[0] ), Math.cos( v[0] ), 0, 0 ];
        if ( v[1] || v[2] )
            mat = postMultiply( [ 1, 0, 0, 1, v[1], v[2] ], postMultiply( mat, [ 1, 0, 0, 1, -v[1], -v[2] ] ) );
        return mat;
    }
    if ( type=='skewX' )
        return [ 1, 0, Math.tan( v[0] ), 1, 0, 0 ];
    if ( type=='skewY' )
        return [ 1, Math.tan( v[0] ), 0, 1, 0, 0 ];
    return [ 1, 0, 0, 1, 0, 0 ];
}

function postMultiply( value, mat ) {
    return [
        value[0]*mat[0] + value[2]*mat[1],
        value[1]*mat[0] + value[3]*mat[1],
        value[0]*mat[2] + value[2]*mat[3],
        value[1]*mat[2] + value[3]*mat[3],
        value[0]*mat[4] + value[2]*mat[5] + value[4],
        value[1]*mat[4] + value[3]*mat[5] + value[5]
    ];
}

var cssProperties = {
    'audio-level': true, color: true, direction: true, fill: true, 'fill-opacity': true, 'fill-rule': true,
    opacity: true, 'solid-color': true, 'solid-opacity': true, 'stop-color': true, 'stop-opacity': true, stroke: true,
    'stroke-dasharray': true, 'stroke-dashoffset': true, 'stroke-linecap': true, 'stroke-miterlimit': true, 'stroke-opacity': true,
    'stroke-width': true, 'text-align': true, 'text-anchor': true, 'viewport-fill': true, 'viewport-fill-opacity': true,
    visibility: true, 'clip-path': true
};

SoftAnimatedAttribute.prototype = {
    apply: function( tNow ) {
        var value = this.baseValue;
        for ( var i=0; i<this.animations.length; i++ )
            value = this.animations[i].apply( tNow, value );
        if ( jSignage.isArray( value ) ) {
            if ( this.type==2 )
                value = value.join( ',' );
            else if ( this.type==3 )
                value = 'rgb(' + (!value[0]||value[0]<0 ? 0 : value[0]>255 ? 255 : Math.floor(value[0])) + ',' + (!value[1]||value[1]<0 ? 0 : value[1]>255 ? 255 : Math.floor(value[1])) + ',' + (!value[2]||value[2]<0 ? 0 : value[2]>255 ? 255 : Math.floor(value[2])) + ')';
            else if ( this.type==4 )
                value = 'matrix(' + (value[0]||0) + ',' + (value[1]||0) + ',' + (value[2]||0) + ',' + (value[3]||0) + ',' + (value[4]||0) + ',' + (value[5]||0) + ')';
        }
        if ( jSignage.features.WebKit && cssProperties[this.name] )
            this.target.targetElement.style[this.name] = value;
        else
            this.target.targetElement.setAttribute( this.name, value );
    },

    parse: function( text ) {
        var value = null;
        if ( this.type==1 ) {
             value = parseFloat( text );
             if ( isNaN(value ) )
                value = attributeLacunaTable[this.name] || 0;
        } else if ( this.type==2 ) {
            var value = text.split( reSplitVector );
            for ( var i=0; i<value.length; i++ ) {
                value[i] = parseFloat( value[i] );
                if ( isNaN(value[i]) )
                    value[i] = 0;
            }
        } else if ( this.type==3 ) {
            var rgb = jSignage.colorToRGB( text );
            value = [ rgb.red, rgb.green, rgb.blue ];
        } else if ( this.type==4 ) {
            value = [ 1, 0, 0, 1, 0, 0 ];
            if ( text!='' && text!='none' ) {
                for ( var i=0; i<text.length; ) {
                    while ( i<text.length && text.charAt[i]==' ' ) i++;
                    var sub = text.substring(i);
                    var m = reTransformMatrix.exec( sub ), mat;
                    if ( m ) {
                        mat = transformMatrix( 'matrix', [ parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]), parseFloat(m[4]), parseFloat(m[5]), parseFloat(m[6]) ] );
                    } else {
                        m = reTransformTranslate.exec( sub );
                        if ( m ) {
                            mat = transformMatrix( 'translate', [ parseFloat(m[1]), m[2] ? parseFloat(m[2]) : 0 ] );
                        } else {
                            m = reTransformScale.exec( sub );
                            if ( m ) {
                                mat = transformMatrix( 'scale', [ parseFloat(m[1]), m[2] ? parseFloat(m[2]) : parseFloat(m[1]) ] );
                            } else {
                                m = reTransformRotate.exec( sub );
                                if ( m ) {
                                    mat = transformMatrix( 'rotate', [ parseFloat(m[1]), m[2] ? parseFloat(m[2]) : 0, m[3] ? parseFloat(m[3]) : 0 ] );
                                } else {
                                    m = reTransformSkew.exec( sub );
                                    if ( m ) {
                                        if ( m[1]=='X' )
                                            mat = transformMatrix( 'skewX', [ parseFloat(m[2]) ] );
                                        else
                                            mat = transformMatrix( 'skewY', [ parseFloat(m[2]) ] );
                                    } else {
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    value = postMultiply( value, mat );
                    i += m[0].length;
                    while ( i<text.length && text.charAt[i]==' ' ) i++;
                    if ( i<text.length && text.charAt[i]==',' ) i++
                }
            }
        } else {
            value = text;
        }
        return value;
    },

    addition: function( a, b ) {
        var r = null;
        if ( this.type==1 )
            r = a + b;
        else if ( this.type==2 || this.type==3 )
            r = addVector( a, b );
        else if ( this.type==4 )
            r = postMultiply( a, b );
        else
            r = a;
        return r;
    },

    substraction: function( a, b ) {
        var r = null;
        if ( this.type==1 )
            r = a - b;
        else if ( this.type==2 || this.type==3 || this.type==4 )
            r = subVector( a, b );
        else
            r = a;
        return r;
    },

    scalarMultiply: function( a, coef ) {
        var r = null;
        if ( this.type==1 )
            r = a * coef;
        else if ( this.type==2 || this.type==3 || this.type==4 )
            r = scalarMulVector( a, corf );
        else
            r = a;
        return r;
    }
};

function SoftAnimation( tStart, elem, target ) {
    this.tStart = tStart || 0;
    this.elem = elem || null;
    this.target = target || null;       // Target SoftAnimatedAttribute object
    this.simpleDur = 0;                 // Simple duration of the animation function
    this.activeEnd = 'indefinite';      // End of active animation
    this.values = [ ];
    this.calcMode = 0;                  // 0 => discrete, 1 => linear, 2 => paced, 3 => spline
    this.additive = false;
    this.accumulate = false;
    this.keyTimes = [ ];
    this.keySplines = [ ];
    this.freeze = false;
    this.toAnimation = false;
    this.byAnimation = false;
    
    if ( !elem || !target )
        return;

    this.simpleDur = jSignage.durInSeconds( elem.getAttribute( 'dur' ), 0 );
    var activeDur = computeActiveDur( elem );
    if ( activeDur!='indefinite' )
        this.activeEnd = tStart + activeDur;    
    this.freeze = elem.getAttribute( 'fill' )=='freeze';

    if ( elem.localName=='set' ) {
        this.calcMode = 0;
        this.additive = false;
        this.accumulate = false;
        var to = elem.getAttribute( 'to' );
        if ( to!==null && to!=='' ) {
            this.toAnimation = true;
            this.values = [ to ];
        }
    } else {
        if ( elem.localName=='animateTransform' ) {
            this.transformType = elem.getAttribute( 'type' );
            if ( this.transformType!='translate' && this.transformType!='scale' && this.transformType!='rotate' && this.transformType!='skewX' && this.transformType!='skewY' ) {
                this.transformType = null;
                return;
            }
        }
        var calcMode = elem.getAttribute( 'calcMode' );
        if ( calcMode=='discrete' )
            this.calcMode = 0;
        else if ( calcMode=='linear' )
            this.calcMode = 1;
        else if ( calcMode=='paced' )
            this.calcMode = 2;
        else if ( calcMode=='spline' )
            this.calcMode = 3;
        else if ( this.target.type==1 || this.target.type==2 || this.target.type==3 || this.target.type==4 )
            this.calcMode = 1;
        else if ( this.target.type==5 )
            this.calcMode = 2;
        else
            this.calcMode = 0;

        this.additive = elem.getAttribute( 'additive' )=='sum';

        this.accumulate = elem.getAttribute( 'accumulate' )=='sum';

        var keyTimes = elem.getAttribute( 'keyTimes' );
        if ( keyTimes!==null && keyTimes!=='' ) {
            keyTimes = keyTimes.split( reSplitValues );
            for ( var i=0; i<keyTimes.length; i++ ) {
                keyTimes[i] = parseFloat( keyTimes[i] );
                if ( isNaN(keyTimes[i]) || keyTimes[i]<0 || keyTimes[i]>1 || ( i>0 && keyTimes[i]<keyTimes[i-1] ) )
                    break;
            }
            if ( i==keyTimes.length )
                this.keyTimes = keyTimes;
        }

        var values = elem.getAttribute( 'values' );
        if ( values!==null && values!=='' ) {
            var v = values.split( reSplitValues );
            for ( var i=0; i<v.length; i++ )
                this.values[i] = this.transformType ? this.parseTransform(v[i]) : this.target.parse( v[i] );
        }
        if ( this.values.length==0 ) {
            var to = elem.getAttribute( 'to' );
            if ( to!==null && to!=='' ) {
                var from = elem.getAttribute( 'from' );
                if ( from!==null && from!=='' ) {
                    this.keyTimes = [ ];
                    this.values = [ this.transformType ? this.parseTransform(from) : this.target.parse( from ), this.transformType ? this.parseTransform(to) : this.target.parse( to ) ];
                } else {
                    this.toAnimation = true;
                    this.values = [ this.transformType ? this.parseTransform(to) : this.target.parse( to ) ];
                }
            } else {
                var by = elem.getAttribute( 'by' );
                if( by!==null && by!=='' ) {
                    var from = elem.getAttribute( 'from' );
                    if ( from!==null && from!=='' ) {
                        this.keyTimes = [ ];
                        from = this.transformType ? this.parseTransform(from) : this.target.parse( from );
                        this.values = [ from, this.transformType ? addVector( from, this.parseTransform( by ) ) : this.target.addition( from, this.target.parse( by ) ) ];
                    } else {
                        this.byAnimation = true;
                        this.values = [ this.transformType ? this.parseTransform(by) : this.target.parse( by ) ];
                    }
                }
            }
        }
    }

    if ( this.values.length > 1 ) {
        if ( this.calcMode==0 ) {
            if ( this.keyTimes.length!=this.values.length || this.keyTimes[0]!=0 ) {
                this.keyTimes = [];
                for ( var i=0; i<this.values.length; i++ )
                    this.keyTimes.push( i / this.values.length );
            }
        } else {
            if ( this.keyTimes.length!=this.values.length || this.keyTimes[0]!=0 || this.keyTimes[this.keyTimes.length-1]!=1 ) {
                this.keyTimes = [];
                for ( var i=0; i<this.values.length; i++ )
                    this.keyTimes.push( i / (this.values.length-1) );
            }
        }
    }
}

SoftAnimation.prototype = {
    parseTransform: function( text ) {
        if ( this.transformType=='translate' ) {
            var v = text.split( reSplitVector );
            var tx = parseFloat( v[0] ), ty = parseFloat( v[1] );
            if ( isNaN( tx ) )
                tx = 0;
            if ( isNaN( ty ) )
                ty = 0;
            return [ tx, ty ];
        } else if ( this.transformType=='scale' ) {
            var v = text.split( reSplitVector );
            var sx = parseFloat( v[0] ), sy = parseFloat( v[1] );
            if ( isNaN( sx ) )
                sx = 1;
            if ( isNaN( sy ) )
                sy = sx;
            return [ sx, sy ];
        } else if ( this.transformType=='rotate' ) {
            var v = text.split( reSplitVector );
            var teta = parseFloat( v[0] ), cx = parseFloat( v[1] ), cy = parseFloat( v[2] );
            if ( isNaN( teta ) )
                teta = 0;
            if ( isNaN( cx ) )
                cx = 0;
            if ( isNaN( cy ) )
                cy = 0;
            return [ teta, cx, cy ];
        } else {
            var skew = parseFloat( text );
            if ( isNaN( skew ) )
                skew = 0;
            return [ skew ];
        }
    },

    apply: function( tNow, base ) {
        var value = null;
        if ( this.activeEnd!='indefinite' && tNow > this.activeEnd )
            tNow = this.activeEnd;
        var tSimple = 0, iterCount = 0;

        if ( this.simpleDur > 0 && tNow>this.tStart ) {
            tSimple = ( (tNow-this.tStart) % this.simpleDur ) / this.simpleDur;
            iterCount = Math.floor( (tNow-this.tStart) / this.simpleDur );
            if ( tNow==this.activeEnd && tSimple==0 && iterCount > 0 ) {
                --iterCount;
                tSimple = 1;
            }
        }
        if ( this.toAnimation ) {
            value = this.values[0];
        } else if ( this.byAnimation ) {
            value = base + this.values[0];
        } else if ( this.calcMode==0 ) {
            for ( var i=1; i<this.values.length; i++ )
                if ( tSimple<this.keyTimes[i] )
                    break;
            value = this.values[ i-1 ];
        } else {
            for ( var i=1; i<this.values.length-1; i++ )
                if ( tSimple<this.keyTimes[i] )
                    break;
            var t0 = this.keyTimes[i-1], v0 = this.values[i-1];
            var t1 = this.keyTimes[i], v1 = this.values[i];
            if ( this.calcMode==1 ) {
                if ( this.transformType )
                    value = addVector( v0, scalarMulVector( subVector( v1, v0 ), ( tSimple - t0 ) / ( t1 - t0 ) ) );
                else
                    value = this.target.addition( v0, this.target.scalarMultiply( this.target.substraction( v1, v0 ), ( tSimple - t0 ) / ( t1 - t0 ) ) );
            }
        }
        if ( this.accumulate && iterCount>0 ) {
            if ( this.transformType )
                value = addVector( value, scalarMulVector( this.values[this.values.length-1], iterCount ) );
            else
                value = this.target.addition( value, this.target.scalarMultiply( this.values[this.values.length-1], iterCount ) );
        }
        if ( this.transformType )
            value = transformMatrix( this.transformType, value );
        if ( this.additive )
            value = this.target.addition( base, value );
        return value;
    }
};

function applyAnimations() {
    var tNow = jSignage.getCurrentTime();
    for ( var targetElement in jSignage.softAnimatedElements )
        for ( var targetAttribute in jSignage.softAnimatedElements[targetElement].animatedAttributes )
            jSignage.softAnimatedElements[targetElement].animatedAttributes[targetAttribute].apply( tNow );
}

function launchSoftAnimation( tStart, elem ) {
    if ( !tStart )
        tStart = jSignage.getCurrentTime();
    var targetElement = elem.parentNode;
    var href = elem.getAttributeNS( jSignage.xlinkNS, 'href' ) || elem.getAttribute( 'href' );
    if ( href && href[0]=='#' )
        targetElement = document.getElementById( href.substring(1) );
    if ( !targetElement )
        return;
    if ( !targetElement.id )
        targetElement.id = jSignage.guuid();
    var attributeName = elem.getAttribute( 'attributeName' );
    if ( !attributeName ) {
        if ( elem.localName=='animateTransform' )
            attributeName = 'transform';
        else if ( elem.localName=='animateMotion' )
            attributeName = 'motion';
        else
            return;
    }
    var softAnimatedElement = jSignage.softAnimatedElements[targetElement.id];
    if ( !softAnimatedElement ) {
        softAnimatedElement = new SoftAnimatedElement( targetElement );
        jSignage.softAnimatedElements[targetElement.id] = softAnimatedElement;
        jSignage.softAnimatedElementsCount++;
    }
    var softAnimatedAttribute = softAnimatedElement.animatedAttributes[attributeName];
    if ( !softAnimatedAttribute ) {
        softAnimatedAttribute = new SoftAnimatedAttribute( softAnimatedElement, attributeName );
        softAnimatedElement.animatedAttributes[attributeName] = softAnimatedAttribute;
        softAnimatedElement.animatedAttributesCount++;
    }
    var softAnimation = new SoftAnimation( tStart, elem, softAnimatedAttribute );
    for ( var i=0; i<softAnimatedAttribute.animations.length; i++ )
        if ( softAnimatedAttribute.animations[i].tStart > tStart )
            break;
    if ( i<softAnimatedAttribute.animations.length )
        softAnimatedAttribute.animations.splice( i, 0, softAnimation );
    else
        softAnimatedAttribute.animations.push( softAnimation );
    softAnimatedAttribute.apply( tStart );
    if ( !softAnimation.freeze && softAnimation.activeEnd!='indefinite' )
        jSignage.timeline.schedule( new TimedAction( softAnimation.activeEnd, 'endElement', elem ) );
    if ( !jSignage.softAnimationTimeout )
        jSignage.softAnimationTimeout = jSignage.setInterval( applyAnimations, 1000/60 );
}

function cancelSoftAnimation( tStop, elem ) {
    var targetElement = elem.parentNode;
    var href = elem.getAttributeNS( jSignage.xlinkNS, 'href' ) || elem.getAttribute( 'href' );
    if ( href && href[0]=='#' )
        targetElement = document.getElementById( href.substring(1) );
    if ( !targetElement )
        return;
    if ( !targetElement.id )
        return;
    var attributeName = elem.getAttribute( 'attributeName' );
    if ( !attributeName ) {
        if ( elem.localName=='animateTransform' )
            attributeName = 'transform';
        else if ( elem.localName=='animateMotion' )
            attributeName = 'motion';
        else
            return;
    }
    var softAnimatedElement = jSignage.softAnimatedElements[targetElement.id];
    if ( !softAnimatedElement )
        return;
    var softAnimatedAttribute = softAnimatedElement.animatedAttributes[attributeName];
    if ( !softAnimatedAttribute )
        return;
    for ( var i=0; i<softAnimatedAttribute.animations.length; i++ )
        if ( softAnimatedAttribute.animations[i].elem==elem )
            break;
    if ( i==softAnimatedAttribute.animations.length )
        return;
    softAnimatedAttribute.animations.splice( i, 1 );
    if ( softAnimatedAttribute.animations.length==0 ) {
        if ( jSignage.features.WebKit && cssProperties[attributeName] )
            softAnimatedElement.targetElement.style[attributeName] = softAnimatedAttribute.rawBase;
        softAnimatedElement.targetElement.setAttribute( attributeName, softAnimatedAttribute.rawBase );
        delete softAnimatedElement.animatedAttributes[attributeName];
        if ( --softAnimatedElement.animatedAttributesCount==0 ) {
            delete jSignage.softAnimatedElements[targetElement.id];
            if ( --jSignage.softAnimatedElementsCount==0 ) {
                jSignage.clearInterval( jSignage.softAnimationTimeout );
                jSignage.softAnimationTimeout = null;
            }
        }
    }
}

function TimedLayer( target ) {
    this.target = target || null;       // realMediaTarget element of the target layer
    this.attr = { };                    // SMIL Timing attributes. As per SMIL, attributes may be modified only outside of the rendering tree.

    // These members set by this.resolve() based on SMIL timing attributes
    this.beginOffset = 'indefinite';    // Begin time relative to parent layer
    this.activeDur = 'indefinite';      // Computed duration, including repeats
    this.initialVisibility = false;     // initialVisibility=='always'
    this.fillFreeze = false;            // fill=='freeze'
    this.ends = null;                   // End this layer when we end
    this.endsOffset = 0;                // Offset to end the this.ends layer

    // These members set by this.begin()
    this.activeStart = null;            // Start date of the current active interval
    this.activeEnd = null;              // End date of the current active interval

    // Actions triggered by the layer
    this.beginActions = [];             // List of actions on begin event
    this.endActions = [];               // List of actions on end event
    this.subLayers = [];                // List of sub layers
}

TimedLayer.prototype = {
    addSubLayer: function( subLayer ) {
        for ( var i=0; i<this.subLayers.length; i++ )
            if ( this.subLayers[i]==subLayer )
                return;
        this.subLayers.push( subLayer );
    },

    addEventListener: function( event, handler, delay ) {
        var array = event=='beginEvent' ? this.beginActions : event=='endEvent' ? this.endActions: null;
        if ( array ) {
            for ( var i=0; i<array.length; i++ )
                if ( array[i].target==handler )
                    break;
            if ( i==array.length )
                array.push( new TimedAction( delay || 0, 'callback', handler ) );
        }
    },

    removeEventListener: function( event, handler ) {
        var array = event=='beginEvent' ? this.beginActions : event=='endEvent' ? this.endActions: null;
        if ( array ) {
            for ( var i=0; i<array.length; i++ )
                if ( array[i].target==handler )
                    break;
            if ( i<array.length )
                array.splice( i, 1 );
        }
    },

    begin: function( tNow ) {
        this.activeStart = tNow;
        this.activeEnd = typeof(this.activeDur)=='number' ? tNow + this.activeDur : 'indefinite';
        if ( !this.initialVisibility )
            this.target.setAttribute( 'display', 'inherit' );
        for ( var i=0; i<this.beginActions.length; i++ ) {
            if ( this.beginActions[i].dueDate==0 )
                this.beginActions[i].trig( tNow );
            else if ( this.beginActions[i].dueDate > 0 )
                jSignage.timeline.scheduleRelative( tNow, this.beginActions[i] );
        }
        for ( i=0; i<this.subLayers.length; i++ ) {
            var subLayer = this.subLayers[i];
            if ( subLayer.beginOffset!='indefinite' )
                jSignage.timeline.schedule( new TimedAction( tNow+subLayer.beginOffset, 'beginLayer', subLayer ) );
        }
        if ( this.activeEnd!=='indefinite' ) {
            for ( var i=0; i<this.endActions.length; i++ )
                if ( this.endActions[i].dueDate < 0 )
                    jSignage.timeline.scheduleRelative( this.activeEnd, this.endActions[i] );
            jSignage.timeline.schedule( new TimedAction( this.activeEnd, 'endLayer', this ) );
        }
    },

    end: function( tNow ) {
        if ( this.activeStart==null )
            return;
        if ( !this.fillFreeze )
            this.target.setAttribute( 'display', 'none' );
        this.activeStart = null;
        this.activeEnd = null;
        for ( var i=0; i<this.endActions.length; i++ ) {
            if ( this.endActions[i].dueDate==0 )
                this.endActions[i].trig( tNow );
            else if ( this.endActions[i].dueDate > 0 )
                jSignage.timeline.scheduleRelative( tNow, this.endActions[i] );
        }
    },

    endAt: function( tNow, offset ) {
        if ( this.activeStart==null )
            return;
        if ( !offset || offset<0 )
            return this.end();
        if ( !tNow )
            tNow = jSignage.getCurrentTime();
        var tNewEnd = tNow + offset;
        if ( this.activeEnd!='indefinite' && this.activeEnd < tNewEnd )
            return;
        this.changeActiveEnd( tNow, tNewEnd );
    },

    setMediaDur: function( tNow, mediaDur ) {
        var oldDur = this.target.getAttribute( 'dur' );
        if ( oldDur!==null && oldDur!=='' && oldDur!=='media' )
            return;
        this.target.setAttribute( 'dur', mediaDur );
        var newDur = computeActiveDur( this.target );
        if ( newDur!='indefinite' && newDur!=this.activeDur ) {
            this.activeDur = newDur;
            if ( this.activeStart==null )
                return;
            if ( !tNow )
                tNow = jSignage.getCurrentTime();
            this.changeActiveEnd( tNow, this.activeStart + this.activeDur );
        }
    },

    changeActiveEnd: function( tNow, tNewEnd ) {
        if ( this.activeEnd!='indefinite' ) {
            jSignage.timeline.cancel( new TimedAction( this.activeEnd, 'endLayer', this ) );
            for ( var i=0; i<this.endActions.length; i++ )
                if ( this.endActions[i].dueDate < 0 )
                    jSignage.timeline.cancel( new TimedAction( this.activeEnd+this.endActions[i].dueDate, this.endActions[i].type, this.endActions[i].target ) );
        }
        this.activeEnd = tNewEnd;
        for ( var i=0; i<this.endActions.length; i++ ) {
            if ( this.endActions[i].dueDate < 0 ) {
                var tAction = tNewEnd+this.endActions[i].dueDate;
                if ( tAction == tNow )
                    this.endActions[i].trig( tNow );
                else if ( tAction > tNow )
                    jSignage.timeline.schedule( new TimedAction( tAction, this.endActions[i].type, this.endActions[i].target ) );
            }
        }
        jSignage.timeline.schedule( new TimedAction( tNewEnd, 'endLayer', this ) );
    },

    resolve: function() {
        var begin = this.target.getAttribute( 'begin' );
        if ( begin!='indefinite' )
            begin = jSignage.durInSeconds( begin, 0 );
        this.beginOffset = begin;
        this.activeDur = computeActiveDur( this.target );
        this.initialVisibility = this.target.getAttribute( 'initialVisibility' )=='always';
        this.fillFreeze = this.target.getAttribute( 'fill' )=='freeze';
        if ( !this.initialVisibility )
            this.target.setAttribute( 'display', 'none' );
        var end = this.target.getAttribute( 'end' );
        if ( end!=='' && end!==null && end!='indefinite' ) {
            var tp = parseTimePoint( end );
            if ( tp.timed==null ) {
                this.schedule( new TimedAction( tp.offset, 'endLayer', this ) );
            } else {
                if ( tp.point=='begin' || tp.point=='beginEvent' )
                    tp.timed.beginActions.push( new TimedAction( tp.offset, 'endLayer', this ) );
                else if ( tp.point=='end' || tp.point=='endEvent' )
                    tp.timed.endActions.push( new TimedAction( tp.offset, 'endLayer', this ) );
                if ( tp.timed.activeStart!=null ) {
                    if ( tp.point=='begin' )
                        jSignage.timeline.schedule( new TimedAction( tp.timed.activeStart+tp.offset, 'endLayer', this ) );
                    else if ( ( tp.point=='end' || tp.point=='endEvent' ) && tp.offset<0 && tp.timed.activeEnd!='indefinite' )
                        jSignage.timeline.schedule( new TimedAction( tp.timed.activeEnd+tp.offset, 'endLayer', this ) );
                }
            }
        }
    }
};

if ( !jSignage.features.SMILTimeEvent ) {
    jSignage.timeline = new Timeline();     // Main scheduler for layers
    jSignage.timedLayers = new Object();    // Index of layer ids to TimedLayer objects
    if ( !jSignage.features.SVGAnimation ) {
        jSignage.softAnimatedElements = new Object();
        jSignage.softAnimatedElementsCount = 0;
    }
}

function build_frame( deco, g, g2, g4, width, height, media, postLayoutCallback, x, y, bbw, bbh, parent ) {
    var backColor = deco.backColor || 'none';
    var backOpacity = jSignage.getPercent( deco.backOpacity, 1 );
    var frameColor = deco.frameColor || 'none';
    var bgColor = deco.screenColor || 'currentColor';
    var shape = deco.shape || 'square';

    if ( deco.uiStyle ) {
        shape = deco.uiStyle=='manzana' ? 'round' : deco.uiStyle;
        if ( backColor=='none' )
            backColor = jSignage.uiColor;
        shades = jSignage.shades( backColor );
        if ( deco.uiStyle!='manzana' ) {
            frameSize = '5%';
            frameColor = shades.darker;
            backColor = shades.normal;
        }
    }
    
    var top = 0, right = 0, bottom = 0, left = 0;
    var min = Math.min(width,height);
    var frameSize = frameColor=='none' ? 0 : jSignage.relAbs( deco.frameSize, min, 0.06*min );
    var rx = jSignage.relAbs( deco.rx, min, 0.2*min );
    var ry = jSignage.relAbs( deco.ry, min, rx );
    var frame = null;

    if ( deco.specialFX=='rotate' ) {
        g4.setAttribute( 'transform', 'translate('+(width/2)+' '+(height/2)+') rotate(-5) translate('+(-width/2)+' '+(-height/2)+')' );
        var br = min * 0.05, tl = min * 0.025, fz = min * 0.02;
        var shad = [
            [ 0, height*0.3, -tl, -tl, 0, 0, -1 ],
            [ width*0.3, 0, -tl, -tl, 0, 0, 1 ],
            [ width, height*0.2, width+br, height+br, width, height, -1 ],
            [ width*0.2, height, width+br, height+br, width, height, 1 ]
        ];
        for ( var i=0; i<shad.length; i++ ) {
            var s = shad[i], d = new jSignage.pathData();
            var vx = s[2] - s[0], vy = s[3] - s[1];
            var lx = (s[0]+s[2])/2, ly = (s[1]+s[3])/2;
            var vn = Math.sqrt( vx*vx + vy*vy );
            var gx = -vy*fz/vn*s[6], gy = vx*fz/vn*s[6];
            var gr = jSignage._linearGradient({ x1: lx-gx, y1: ly-gy, x2: lx, y2: ly, stops: [
                { offset: 0, color: '#606060', opacity: 0.5 },
                { offset: 1, color: '#606060', opacity: 0 }
            ]});
            g4.insertBefore( gr, g2 || media );
            d.moveTo( s[0], s[1] );
            d.lineTo( s[2], s[3] );
            d.lineTo( s[4], s[5] );
            d.close();
            g4.insertBefore( jSignage._createElement( 'path', { d: d.toString(), stroke: 'none', fill: 'url(#'+gr.id+')' } ), g2 || media );
        }
    }

    if ( backColor!='none' && backOpacity > 0 ) {
        var back = jSignage._mkshape( shape, deco.corners, rx, ry, 0, 0, width, height );
        back.setAttribute( 'stroke', 'none' );
        back.setAttribute( 'fill-opacity', backOpacity );
        if ( deco.uiStyle=='manzana' ) {
            var gradient = jSignage._linearGradient({ x1: 0, y1: 0, x2: 0, y2: height, stops: [
                { offset: 0, color: shades.lighter },
                { offset: 0.5, color: shades.normal },
                { offset: 0.5, color: shades.darker },
                { offset: 1, color: shades.darker }
            ]});
            g4.insertBefore( gradient, g2 || media );
            backColor = 'url(#'+gradient.id+')';
        }
        back.setAttribute( 'fill', backColor );
        g4.insertBefore( back, g2 || media );
    }

    if ( frameSize ) {
        frame = jSignage._mkshape( shape, deco.corners, rx > frameSize/2 ? rx-frameSize/2 : 0, ry > frameSize/2 ? ry-frameSize/2 : 0, frameSize/2, frameSize/2, width-frameSize, height-frameSize );
        frame.setAttribute( 'stroke', frameColor );
        frame.setAttribute( 'stroke-width', frameSize );
        frame.setAttribute( 'fill', 'none' );
        if ( deco.clip==='none' || ( deco.clip!=='force' && !media ) ) {
            g4.insertBefore( frame, g2 || media );
            frame = null;
        }
        // The image must be cropped a little bit to maintain the aspect ratio of the layer
        if ( width > height ) {
            left = right = frameSize;
            top = bottom = frameSize*height/width;
        } else {
            left = right = frameSize*width/height;
            top = bottom = frameSize;
        }
    }

    if ( deco.padding ) {
        var pads = (''+deco.padding).split( reSplitList ), n = pads.length;
        if ( n > 0 ) {
            if ( n<2 ) pads[1] = pads[0];
            if ( n<3 ) pads[2] = pads[0];
            if ( n<4 ) pads[3] = pads[1];
            top += jSignage.relAbs( pads[0], min );
            right += jSignage.relAbs( pads[1], min );
            bottom += jSignage.relAbs( pads[2], min );
            left += jSignage.relAbs( pads[3], min );
        }
    }

    if ( media ) {
        media.setAttribute( 'x', left );
        media.setAttribute( 'y', top );
        media.setAttribute( 'width', width-right-left );
        media.setAttribute( 'height', height-bottom-top );
    } else {
        g2.setAttribute( 'transform', 'translate('+left+','+top+')' );
        g2.setAttribute( 'width', width-right-left );
        g2.setAttribute( 'height', height-bottom-top );
    }

    if ( deco.softEdge ) {
        var softEdgeSize = jSignage.relAbs( deco.softEdgeSize, min, 0.06*min );
        g4.appendChild( jSignage._mksoft( shape, deco.corners, rx, ry, left, top, width-left-right, height-top-bottom, softEdgeSize, frameSize ? frameColor: bgColor, frameSize ? frameColor : bgColor, 0, 1, 0 ) );
    }

    if ( frame )
        g4.appendChild( frame );

    if ( rx > 0 && ry > 0 && deco.clip!=='none' && ( deco.clip==='force' || media ) ) {
        var clipCorners = false;
        if ( deco.clip==='force' ) {
            if ( shape!='square' )
                clipCorners = true;
        } else if ( shape=='round' ) {
            var L2 = ((rx-left)*(rx-left))/(rx*rx);
            var T2 = ((ry-top)*(ry-top))/(ry*ry);
            var R2 = ((rx-right)*(rx-right))/(rx*rx);
            var B2 = ((ry-bottom)*(ry-bottom))/(ry*ry);
            clipCorners = ( left < rx && top < ry && L2 + T2 > 1 ) || ( right < rx && top < ry && R2 + T2 > 1 ) || ( right < rx && bottom < ry && R2 + B2 > 1 ) || ( left < rx && bottom < ry && L2 + B2 > 1 );
        } else if ( shape=='snip' ) {
            var L1 = left/rx, R1 = right/rx, T1 = top/ry, B1 = bottom/ry;
            clipCorners = L1 + T1 < 1 || R1 + T1 < 1 || R1 + B1 < 1 || L1 + B1 < 1;
        }
        if ( clipCorners ) {
            var xpx = jSignage.getDevicePixelSize( false ), ypx = jSignage.getDevicePixelSize( true );
            var anti = jSignage._mkanti( shape, deco.corners, rx+xpx*2, ry+ypx*2, -xpx, -ypx, width+xpx*2, height+ypx*2 );
            for ( var i=0; i<anti.length; i++ ) {
                anti[i].setAttribute( 'fill', bgColor );
                anti[i].setAttribute( 'stroke', 'none' );
                g4.appendChild( anti[i] );
            }
        }
    }

    if ( deco.shadow ) {
        var shadow = jSignage.relAbs( deco.shadowSize, min, 0.03*min );
        var rrx = rx, rry = ry;
        if ( shape=='snip' ) {
            var t2 = (ry*ry)/(rx*rx);
            rrx = rx + frameSize*( -Math.sqrt(t2/(1+t2 )) + ( 1 - Math.sqrt(1/(1 +t2)) )*rx/ry );
            t2 = (rx*rx)/(ry*ry);
            rry = ry + frameSize*( -Math.sqrt(t2/(1+t2 )) + ( 1 - Math.sqrt(1/(1 +t2)) )*ry/rx );
        }
        g4.appendChild( jSignage._mksoft( shape, deco.corners, rrx+shadow, rry+shadow, -shadow, -shadow, width+shadow*2, height+shadow*2, shadow, '#A0A0A0', '#A0A0A0', 1, 0, shadow ) );
    }

    if ( deco.specialFX=='reflection' ) {
        var refY = height*1.005, refH = height*0.3;
        var use = jSignage._createElement( 'use', {
            transform: 'matrix( 1 0 0 -1 0 '+(height+refY)+')'
        });
        jSignage.setClipRect( use, 0, refY-refH, width, refH, g );
        use.setAttributeNS( jSignage.xlinkNS, 'href', '#'+g4.id );
        g.appendChild( use );
        var grad = jSignage._linearGradient({ x1: 0, y1: refY, x2: 0, y2: refY+refH, stops: [
            { offset: 0, color: bgColor, opacity: 0.5 },
            { offset: 1, color: bgColor, opacity: 1 }
        ]});
        g.appendChild( grad );
        g.appendChild( jSignage._createElement( 'rect', {
            x: 0,
            y: refY,
            width: width,
            height: refH,
            stroke: 'none',
            fill: 'url(#'+grad.id+')'
        }));
    }

    if ( g2 && postLayoutCallback )
        postLayoutCallback.call( g2, width-right-left, height-top-bottom, x+left, y+top, bbw, bbh, parent );
}

function resize_media_frame( deco, g, width, height ) {
    var g4=null, x, next, media=null;

    for ( x=g.firstElementChild; x; x=x.nextElementSibling )
        if ( x.localName!='set' && x.localName!='animate' )
            break;

    if ( !x )
        return;

    var y = x.nextElementSibling;
    if ( x.localname=='g' && y && y.localName=='use' ) {
        g4 = x;
        for ( ; y; y=next ) {
            next = y.nextElementSibling;
            g.removeChild( y );
        }
    }

    for ( x = g4 ? g4.firstElementChild : x; x; x=next ) {
        next = x.nextElementSibling;
        var name = x.localName;
        if ( name=='image' || name=='video' || name=='animation' )
            media = x;
        else
            (g4||g).removeChild( x );
    }

    if ( media ) {
        if ( deco ) {
            build_frame( deco, g, null, g4 || g, width, height, media );
        } else {
            media.setAttribute( 'width', args.width );
            media.setAttribute( 'height', args.height );
        }
    }
}

jSignage.extend({
    guuid_counter: 0,

    guuid: function() { return "guuid_"+(++jSignage.guuid_counter); },

    _createElement: function( name, attr ) {
        var elem = document.createElementNS( jSignage.svgNS, name );
        if ( attr!==undefined ) for ( var key in attr )
            elem.setAttribute( key, attr[key] );
        return elem;
    },

    createElement: function( name, attr ) { return jSignage(jSignage._createElement(name, attr)); },

    setAttributes: function( elem, attr ) {
        for ( var key in attr )
            elem.setAttribute( key, attr[key] );
    },

    setViewportAttr: function( elem, attr ) {
        if ( attr ) {
            for ( var i=0; i<viewport_attributes.length; i++ ) {
                var name=viewport_attributes[i];
                if ( name in attr )
                    elem.setAttributeNS( jSignage.spxNS, name, attr[name] );
            }
            if ( 'opacity' in attr )
                elem.setAttribute( 'opacity', attr.opacity );
            if ( 'audioLevel' in attr )
                elem.setAttribute( 'audio-level', attr['audioLevel'] );
            elem.id = 'id' in attr ? attr.id : jSignage.guuid();
        } else { 
            elem.id = jSignage.guuid();
        }
    },

    setTimingAttr: function( elem, attr, media ) {
        var hasTiming = false;
        elem.setAttribute( 'begin', '0' );
        elem.setAttribute( 'dur', media ? 'media' : 'indefinite' );
        if ( attr ) for ( var i=0; i<timing_attributes.length; i++ ) {
            var name=timing_attributes[i];
            if ( name in attr ) {
                hasTiming = true;
                elem.setAttribute( name, attr[name] );
            }
        }
        return hasTiming;
    },

    addSetForTiming: function( elem, attr, always, media ) {
        if ( jSignage.timeline ) {
            jSignage.setTimingAttr( elem, attr, media );
            return elem;
        }
        var set = jSignage._createElement( "set", { attributeName: 'display', to: 'inherit' } );
        if ( jSignage.setTimingAttr( set, attr, media ) || always ) {
            elem.setAttribute( 'display', 'none' );
            set.id = jSignage.guuid();
            elem.insertBefore( set, elem.firstElementChild );
        } else {
            set = null;
        }
        return set;
    },

    setClipRect: function( elem, x, y, width, height, parent ) {
        var clipPath = jSignage._createElement( 'clipPath' );
        var id = jSignage.guuid();
        clipPath.id = id;
        clipPath.appendChild( jSignage._createElement( 'rect', { x: x, y: y, width: width, height: height } ) );
        ( parent || elem ).appendChild( clipPath );
        elem.setAttribute( 'clip-path', 'url(#'+id+')' );
    },

    _mkshape: function( shape, corners, rx, ry, x, y, width, height ) {
        var d = null;
        if ( shape=='round' ) {
            if ( corners && jSignage.isArray( corners ) ) {
                d = new jSignage.pathData();
                var i = 0;
                if ( corners[i]=='topLeft' ) { d.moveTo( x, ry+y ); d.arcTo( rx, ry, 0, 0, 1, x+rx, y ); ++i; } else d.moveTo( x, y );
                if ( corners[i]=='topRight' ) { d.lineTo( x+width-rx, y ); d.arcTo( rx, ry, 0, 0, 1, x+width, y+ry ); ++i; } else d.lineTo( x+width, y );
                if ( corners[i]=='bottomRight' ) { d.lineTo( x+width, y+height-ry ); d.arcTo( rx, ry, 0, 0, 1, x+width-rx, y+height ); ++i; } else d.lineTo( x+width, y+height );
                if ( corners[i]=='bottomLeft' ) { d.lineTo( x+rx, y+height ); d.arcTo( rx, ry, 0, 0, 1, x, y+height-ry ); } else d.lineTo( x, y+height );
                d.close();
            } else if ( corners=='left' ) {            
                var min = Math.min( width, height );
                d = new jSignage.pathData();
                d.moveTo( x+width-rx, y );
                d.arcTo( rx, ry, 0, 0, 1, x+width, y+ry );
                d.lineTo( x+width, y+height-ry );
                d.arcTo( rx, ry, 0, 0, 1, x+width-rx, y+height );
                d.lineTo( x+rx, y+height );
                d.quadTo( x, y+height, x-rx, y+height-ry );
                d.lineTo( x-min/2+rx, y+height/2+ry );
                d.quadTo( x-min/2, y+height/2, x-min/2+rx, y+height/2-ry );
                d.lineTo( x-rx, y+ry );
                d.quadTo( x, y, x+rx, y );
                d.close();
            } else if ( corners=='right' ) {
                var min = Math.min( width, height );
                d = new jSignage.pathData();
                d.moveTo( x, y+ry );
                d.arcTo( rx, ry, 0, 0, 1, x+rx, y );
                d.lineTo( x+width-rx, y );
                d.quadTo( x+width, y, x+width+rx, y+ry );
                d.lineTo( x+width+min/2-rx, y+height/2-ry );
                d.quadTo( x+width+min/2, y+height/2, x+width+min/2-rx, y+height/2+ry );
                d.lineTo( x+width+rx, y+height-ry );
                d.quadTo( x+width, y+height, x+width-rx, y+height );
                d.lineTo( x+rx, y+height );
                d.arcTo( rx, ry, 0, 0, 1, x, y+height-ry );
                d.close();
            } else {
                return jSignage._createElement( 'rect', { x: x, y: y, width: width, height: height, rx: rx, ry: ry });
            }
        } else if ( shape=='snip' ) {
            d = new jSignage.pathData();
            var i = 0;
            if ( !corners || corners[i]=='topLeft' ) { d.moveTo( x, y+ry ); d.lineTo( x+rx, y ); ++i; } else d.moveTo( x, y );
            if ( !corners || corners[i]=='topRight' ) { d.lineTo( x+width-rx, y ); d.lineTo( x+width, y+ry ); ++i; } else d.lineTo( x+width, y );
            if ( !corners || corners[i]=='bottomRight' ) { d.lineTo( x+width, y+height-ry ); d.lineTo( x+width-rx, y+height ); ++i; } else d.lineTo( x+width, y+height );
            if ( !corners || corners[i]=='bottomLeft' ) { d.lineTo( x+rx, y+height ); d.lineTo( x, y+height-ry ); } else d.lineTo( x, y+height );
            d.close();
        } else if ( corners=='left' ) {
            var min = Math.min( width, height );
            d = new jSignage.pathData();
            d.moveTo( x+width, y );
            d.lineTo( x+width, y+height, x, y+height, x-min/2, y+height/2, x, y );
            d.close();
        } else if ( corners=='right' ) {
            var min = Math.min( width, height );
            d = new jSignage.pathData();
            d.moveTo( x, y );
            d.lineTo( x+width, y, x+width+min/2, y+height/2, x+width, y+height, x, y+height );
            d.close();
        } else {
            return jSignage._createElement( 'rect', { x: x, y: y, width: width, height: height });
        }
        return jSignage._createElement( 'path', { d: d.toString() } );
    },

    relAbs: function( x, size, fallback ) {
        if ( x===undefined || x===null )
            return fallback || 0;
        if ( typeof(x) == 'number' )
            return x;
        if ( x.charAt(x.length-1)=='%' )
            x = parseFloat(x) * size / 100;
        else
            x = parseFloat(x);
        if ( isNaN(x) )
            x = fallback || 0;
        return x;
    },

    addFrame: function( g, attr, postLayoutCallback, media ) {
        var deco = attr && attr.frame, shades;
        if ( !deco ) {
            if ( media )
                g.appendChild( media );
            if ( postLayoutCallback )
                jSignage.postLayoutCallback( g, postLayoutCallback );
            return;
        }

        var g2 = null, g4 = g;

        if ( deco.specialFX ) {
            g4 = jSignage._createElement( 'g' );
            g4.id = jSignage.guuid();
            g.appendChild( g4 );
        }

        if ( media ) {
            g4.appendChild( media );
        } else {
            g2 = jSignage._createElement( 'g' );
            g2.id = jSignage.guuid();
            g4.appendChild( g2 );
            g.setAttributeNS( jSignage.spxNS, 'g2-id', g2.id );
        }

        jSignage.postLayoutCallback( g, function( width, height, x, y, bbw, bbh, parent ) {
            build_frame( deco, g, g2, g4, width, height, media, postLayoutCallback, x, y, bbw, bbh, parent );
        });
    },

    _customLayer: function( type, attr, attr2, postLayoutCallback ) {
        var g = jSignage._createElement( 'g' );
        g.setAttributeNS( jSignage.spxNS, 'layer-type', type );
        jSignage.setViewportAttr( g, attr );
        jSignage.addSetForTiming( g, attr2 || attr, true );
        jSignage.addFrame( g, attr, postLayoutCallback );
        return g;
    },

    customLayer: function( type, attr, attr2, postLayoutCallback ) {
        return jSignage( jSignage._customLayer( type, attr, attr2, postLayoutCallback ) );
    },

    subclass: function( parent, init, methods ) { // Creates a constructor with a custom prototype and inheritance chain
        var ctor;

        if ( !methods ) {
            methods = init;
            init = parent;
            parent = null;
            ctor = function( name, args ) {
                if ( name ) {
                    var obj = this;
                    jSignage.fn.init.call( this, jSignage._customLayer( name, args, null, function( width, height, x, y, bbw, bbh, parent ) {
                        if ( obj.postLayout )
                            obj.postLayout( this, width, height, x, y, bbw, bbh, parent );
                    }), null, jSignage.rootjSignage );
                    init.call( this, args );
                }
            }
        } else {
            ctor = function( name, args ) {
                parent.call( this, name, args );
                if ( name )
                    init.call( this, args );
            }
        }
        ctor.prototype = parent ? new parent() : jSignage();
        jSignage.extend( ctor.prototype, methods );
        return ctor;
    },

    findChildById: function( root, id ) {
        var res = null;
        jSignage.eachElement( root, function() {
            if ( this.id==id ) {
                res = this; 
                return false;
            }
        });
        return res;
    },

    findMediaChild: function( root ) {
        var res = null;
        jSignage.eachElement( root, function() {
            var name = this.localName;
            if ( name=='video' || name=='audio' || name=='animation' ) {
                res = this; 
                return false;
            }
        });
        return res;
    },

    isLayer: function( elem ) {
        var name = elem.localName;
        if ( name=='video' || name=='audio' || name=='animation' || name=='image' || name=='textArea' || name=='svg' )
            return true;
        if ( name=='g' && elem.getAttributeNS( jSignage.spxNS, 'layer-type' ) )
            return true;
        return false;
    },

    getRealMediaTarget: function( root ) {
        var target = root;
        while ( target!==null ) {
            var effectTargetID=target.getAttributeNS( jSignage.spxNS, "effect-target-id" );
            if ( !effectTargetID )
                break;
            target = jSignage.findChildById( target, effectTargetID );
        }
        return target;
    },

    getTimingElement: function( root ) {
        if ( root==document.documentElement )
            return null;
        if ( jSignage.timeline ) {
            if ( !root.id )
                root.id = jSignage.guuid();
            if ( !jSignage.timedLayers[root.id] )
                jSignage.timedLayers[root.id] = new TimedLayer( root );
            return root;
        }
        var name=root.localName;
        if ( name=='video' || name=='animation' || name=='audio' ) {
            return root;
        } else {
            var child=root.firstElementChild;
            if ( child && ( child.localName=='set' || child.localName=='animate' ) )
                return child;
            if ( name=='g' ) {
                var type = root.getAttributeNS( jSignage.spxNS, 'layer-type' );
                if ( type=='media' ) {
                    child = jSignage.findMediaChild( jSignage.getG2( root ) );
                    if ( child )
                        return child;
                }
            }
        }
        return jSignage.addSetForTiming( root, null, true );
    },

    setLoopingInfo: function( args, ctx ) {
        if ( !('dur' in args) || args.dur=='media' || args.dur=='auto' ) {
            ctx.looping = true;
            ctx.loopCount = 1;
            ctx.dur='indefinite';
            if ( 'repeatDur' in args ) {
                ctx.dur=args.repeatDur;
                ctx.loopCount = -1;
            } else if ( 'repeatCount' in args ) {
                if ( args.repeatCount=='indefinite' ) {
                    ctx.loopCount = -1;
                } else {
                    var repeatCount=parseFloat(args.repeatCount);
                    if ( !isNaN(repeatCount) && repeatCount>=1 )
                        ctx.loopCount=Math.floor(repeatCount);
                }
            }
            ctx.reloadLoopCount = ctx.loopCount;
        } else {
            ctx.looping = false;
            ctx.dur = args.dur;
        }
        jSignage.copyProps( args, ctx, [ 'begin', 'end', 'min', 'max' ] );
    },

    copyProps: function( src, dst, lst ) {
        if ( lst.length ) {
            for ( var i=0; i<lst.length; i++ ) {
                var p = lst[i];
                if ( p in src )
                    dst[p]=src[p];
            }
        } else {
            for ( var p in src )
                if ( p in lst )
                    dst[ lst[p] ] = src[p];
        }
    },
    
    _isTextAreaLayer: function( layerType ) {
        if ( !layerType )
            return false;
        var l = layerType.length;
        return layerType=='textArea' || ( l>8 && layerType.substring( l-8 )=='TextArea' );
    },

    getBBox: function( elem, futureParent ) {
        var width = NaN, height = NaN, r = null;
        var w = elem.getAttributeNS( jSignage.spxNS, 'width' );
        if ( w!=null && w!='' && w!='auto' && w.charAt(w.length-1)!='%' )
            width = parseFloat( w );
        var h = elem.getAttributeNS( jSignage.spxNS, 'height' );
        if ( h!=null && h!='' && h!='auto' && h.charAt(h.length-1)!='%' )
            height = parseFloat( h );
        if ( !isNaN(width) && width >= 0 && !isNaN(height) && height>=0 ) {
            r = document.documentElement.createSVGRect();
            r.width = width;
            r.height = height;
            r.auto = false;
            return r;
        }
        if ( futureParent )
            futureParent.appendChild( elem );
        if ( !jSignage.features.textArea ) {
            var media = jSignage.getRealMediaTarget( elem );
            if ( media.localName=='g' ) {
                var type = media.getAttributeNS( jSignage.spxNS, 'layer-type' );
                if ( jSignage._isTextAreaLayer(type) ) {
                    for ( var textArea=media.firstElementChild; textArea; textArea=textArea.nextElementSibling )
                        if ( textArea.localName=='textArea' )
                            break;
                    if ( textArea ) {
                        r = document.documentElement.createSVGRect();
                        if ( isNaN(width) || width < 0 )
                            r.width = jSignage.getTextAreaWidth( textArea, futureParent );
                        else
                            r.height = jSignage.getTextAreaHeight( textArea, futureParent );
                    }
                }
            }
        }
        if ( !r )
            r=elem.getBBox();
        if ( r === null )
            r = document.documentElement.createSVGRect();
        r.auto = true;
        if ( !isNaN(width) && width >= 0 )
            r.width = width;
        if ( !isNaN(height) && height>=0 )
            r.height = height;
        if ( futureParent )
            futureParent.removeChild( elem );
        return r;
    },

    isInRenderingTree: function( elem ) {
        var top = document.documentElement;
        while ( elem && elem!=top )
            elem = elem.parentNode;
        return elem==top;
    },

    _calcLayout: function( subtree, bbw, bbh, skip, parent ) {
        var elem=jSignage.getRealMediaTarget(subtree);
        var x1, y1, x2, y2, xw, yw;
        if ( !skip ) {
            var left = elem.getAttributeNS( jSignage.spxNS, 'left' );
            if ( left==null || left=='' || left=='auto' )
                left=null;
            else if ( left.charAt(left.length-1)=='%' )
                left = parseFloat(left) * bbw / 100;
            else
                left = parseFloat(left);
            var top = elem.getAttributeNS( jSignage.spxNS, 'top' );
            if ( top==null || top=='' || top=='auto' )
                top=null;
            else if ( top.charAt(top.length-1)=='%' )
                top = parseFloat(top) * bbh / 100;
            else
                top = parseFloat(top);
            var right = elem.getAttributeNS( jSignage.spxNS, 'right' );
            if ( right==null || right=='' || right=='auto' )
                right=null;
            else if ( right.charAt(right.length-1)=='%' )
                right = parseFloat(right) * bbw / 100;
            else
                right = parseFloat(right);
            var bottom = elem.getAttributeNS( jSignage.spxNS, 'bottom' );
            if ( bottom==null || bottom=='' || bottom=='auto' )
                bottom=null;
            else if ( bottom.charAt(bottom.length-1)=='%' )
                bottom = parseFloat(bottom) * bbh / 100;
            else
                bottom = parseFloat(bottom);
            var width = elem.getAttributeNS( jSignage.spxNS, 'width' );
            if ( width==null || width=='' || width=='auto' )
                width=null;
            else if ( width.charAt(width.length-1)=='%' )
                width = parseFloat(width) * bbw / 100;
            else
                width = parseFloat(width);
            var height = elem.getAttributeNS( jSignage.spxNS, 'height' );
            if ( height==null || height=='' || height=='auto' )
                height=null;
            else if ( height.charAt(height.length-1)=='%' )
                height = parseFloat(height) * bbh / 100;
            else
                height = parseFloat(height);
            var viewBox = elem.getAttributeNS( jSignage.spxNS, 'viewBox' );

            if ( viewBox==null || viewBox=='' || viewBox=='none' ) {
                viewBox = null;
            } else {
                viewBox = viewBox.split( reSplitList );
                if ( viewBox.length!=4 )
                    viewBox = null;
                for ( var i=0; i<4; i++ ) {
                    viewBox[i] = parseFloat(viewBox[i]);
                    if ( isNaN(viewBox[i]) || ( i>=2 && viewBox[i]==0 ) ) {
                        viewBox = null;
                        break;
                    }
                }       
            }

            var transform = elem.getAttributeNS( jSignage.spxNS, 'transform' );
            if ( transform==null || transform=='' || transform=='none' )
                transform = null;
            else
                transform = transform.split( reSplitList );

	        if ( left==null ) {
		        if ( width==null ) {
			        if ( right==null ) {
				        x1 = 0;
				        x2 = bbw;
			        } else {			        
				        x1 = 0;
				        x2 = bbw - right;
			        }
		        } else {
			        if ( right==null ) {
				        x1 = 0;
				        x2 = width;
			        } else {
				        x1 = bbw - right - width;
				        x2 = bbw - right;
			        }
		        }
	        } else {
		        if ( width==null ) {
			        if ( right==null ) {
				        x1 = left;
				        x2 = bbw;
			        } else {
				        x1 = left;
				        x2 = bbw - right;
			        }
		        } else {
			        x1 = left;
			        x2 = left + width;
		        }
	        }

	        if ( top==null ) {
		        if ( height==null ) {
			        if ( bottom==null ) {
				        y1 = 0;
				        y2 = bbh;
			        } else {
				        y1 = 0;
				        y2 = bbh - bottom;
			        }
		        } else {
			        if ( bottom==null ) {
				        y1 = 0;
				        y2 = height;
			        } else {
				        y1 = bbh - bottom - height;
				        y2 = bbh - bottom;
			        }
		        }
	        } else {
		        if ( height==null ) {
			        if ( bottom==null ) {
				        y1 = top;
				        y2 = bbh;
			        } else {
				        y1 = top;
				        y2 = bbh - bottom;
			        }
		        } else {
			        y1 = top;
			        y2 = top + height;
		        }
	        }
	        if ( x1 > x2 ) { var t = x1; x1 = x2; x2 = t; }
	        if ( y1 > y2 ) { var t = y1; y1 = y2; y2 = t; }

            var tbase = x1 || y1 ? 'translate('+x1+','+y1+')' : '';
            subtree.setAttribute( 'transform', tbase );

            if ( transform || viewBox ) {
                var xx = 1, yy = 1, xy = 0, yx = 0, x0 = 0, y0 = 0, t;
                if ( transform ) for ( var i=0; i<transform.length; i++ ) {
                    if ( transform[i]=='rotateLeft' ) {
                        t = xx; xx = xy; xy = -t;
                        t = yy; yy = -yx; yx = t; 
                    } else if ( transform[i]=='rotateRight' ) {
                        t = xx; xx = -xy; xy = t;
                        t = yy; yy = yx; yx = -t; 
                    } else if ( transform[i]=='flipHorizontal' ) {
                        xx = -xx; yx = -yx;
                    } else if ( transform[i]=='flipVertical' ) {
                        yy = -yy; xy = -xy;
                    }
                }
                xw = Math.abs(xx)*(x2-x1) + Math.abs(xy)*(y2-y1);
                yw = Math.abs(yx)*(x2-x1) + Math.abs(yy)*(y2-y1);
                if ( viewBox ) {
                    var sx = xw / viewBox[2];
                    var sy = yw / viewBox[3];
                    xx *= sx; yx *= sy; xy *= sx; yy *= sy;
                    xw = viewBox[2];
                    yw = viewBox[3];
                    x0 = viewBox[0];
                    y0 = viewBox[1];
                }
                if ( subtree!=elem ) tbase = '';
                if ( tbase!='' ) tbase += ' ';
                if ( transform )
                    tbase += 'matrix('+ xx +','+ xy +',' + yx +','+ yy +','+ (x2-x1)/2 +','+ (y2-y1)/2 +') translate('+ (-x0-xw/2) +','+ (-y0-yw/2) +')';
                else
                    tbase += 'matrix('+ xx +','+ xy +',' + yx +','+ yy +','+ (-x0) +','+ (-y0) +')';
                elem.setAttribute( 'transform', tbase );
            } else {
                xw = x2 - x1;
                yw = y2 - y1;
            }
        } else {
            x1 = 0;
            xw = x2 = bbw;
            y1 = 0;
            yw = y2 = bbh;
        }
	    if ( !skip || elem.localName!='textArea' ) {
	        elem.setAttributeNS( null, 'width', xw );
	        elem.setAttributeNS( null, 'height', yw );
	    }
	    if ( elem!=subtree ) {
	        subtree.setAttributeNS( null, 'width', x2-x1 );
	        subtree.setAttributeNS( null, 'height', y2-y1 );
	        // Call post layout callback for effects and transitions
            var target = subtree;
            var timeBase = jSignage.getTimingElement( elem ).id;
            while ( target!==null ) {
                var effectTargetID=target.getAttributeNS( jSignage.spxNS, "effect-target-id" );
                if ( !effectTargetID )
                    break;
                var postLayoutCallback = target.getAttributeNS( jSignage.spxNS, "postLayoutCallback" );
                var inner = jSignage.findChildById( target, effectTargetID );
                if ( postLayoutCallback ) {
                    jSignage._postLayoutCallback[postLayoutCallback].call( target, timeBase, inner, x2-x1, y2-y1, x1, y1, bbw, bbh );
                    delete jSignage._postLayoutCallback[postLayoutCallback];
                    target.setAttributeNS( jSignage.spxNS, "postLayoutCallback", '' );
                }
                target = inner;
            }
	    }
	    if ( skip!==2 ) {
            var postLayoutCallback = elem.getAttributeNS( jSignage.spxNS, "postLayoutCallback" );
            if ( postLayoutCallback ) {
                jSignage._postLayoutCallback[postLayoutCallback].call( elem, xw, yw, x1, y1, bbw, bbh, parent );
                delete jSignage._postLayoutCallback[postLayoutCallback];
                elem.setAttributeNS( jSignage.spxNS, "postLayoutCallback", '' );
            }
	    }
    },

    postLayoutCallback: function( elem, callback ) {
        var cbid = jSignage.guuid();
        jSignage._postLayoutCallback[cbid] = callback;
        var chain = elem.getAttributeNS( jSignage.spxNS, 'postLayoutCallback' );
        elem.setAttributeNS( jSignage.spxNS, 'postLayoutCallback', cbid );
        return chain ? jSignage._postLayoutCallback[chain] : null;
    },

    addToLayout: function( parent, child, before ) {
        var bbw=null, bbh=null, ancestor;
        for( ancestor=parent; ancestor!=null; ancestor=ancestor.parentNode ) {
            if ( ancestor==document.documentElement )
                break;
            if ( bbw==null ) {               
                var w = ancestor.getAttributeNS( null, 'width' );
                if ( w!=null && w!='' ) {
                    var h = ancestor.getAttributeNS( null, 'height' );
                    if ( h!=null && h!='' ) {
                        bbw = w;
                        bbh = h;
                    }
                }
            }
        }
        if ( ancestor==document.documentElement ) {
            if ( bbw==null ) {
                var viewBox = ancestor.getRectTrait ? ancestor.getRectTrait( 'viewBox' ) : ancestor.viewBox.baseVal;
                if ( viewBox!=null ) {
                    bbw = viewBox.width;
                    bbh = viewBox.height;
                }
            }
            if ( bbw!=null )
                jSignage._calcLayout( child, bbw, bbh, 0, parent );
        }
        if ( before )
            parent.insertBefore( child, before );
        else
            parent.appendChild( child );
    },

    scheduleLayer: function( parent, timingElement ) {    
        if ( jSignage.timeline ) {            
            var timed = jSignage.timedLayers[timingElement.id];
            timed.resolve();
            if ( timed.beginOffset!='indefinite' ) {
                var parentTimingElement = jSignage.getTimingElement( parent );
                if ( parentTimingElement ) {
                    timedParent = jSignage.timedLayers[parentTimingElement.id];
                    timedParent.addSubLayer( timed );
                    if ( timedParent.activeStart!==null ) {
                        dueDate = timedParent.activeStart + timed.beginOffset;
                        return new TimedAction( dueDate, 'beginLayer', timed );
                    }
                } else {
                    return new TimedAction( timed.beginOffset, 'beginLayer', timed );
                }
            }
        } else {
            var begin = timingElement.getAttribute( 'begin' );
            if ( begin!='indefinite' ) {
                var parentTimingElement = jSignage.getTimingElement( parent );
                if ( parentTimingElement )
                    timingElement.setAttribute( 'begin', jSignage.triggerWithOffset( parentTimingElement.id+'.begin', jSignage.durInSeconds( begin ) ) );
            }
        }
        return null;
    },

    scheduleLayerAbsolute: function( timingElement ) {    
        if ( jSignage.timeline ) {            
            var timed = jSignage.timedLayers[timingElement.id];
            timed.resolve();
            if ( timed.beginOffset!='indefinite' )
                return new TimedAction( timed.beginOffset, 'beginLayer', timed );
        }
        return null;
    },

    beginLayerAt: function( timingElement, beginTime ) {
        if ( jSignage.timeline )
            jSignage.timeline.scheduleRelative( null, new TimedAction( beginTime || 0, 'beginLayer', jSignage.timedLayers[timingElement.id] ) );
        else if ( beginTime )
            timingElement.beginElementAt( beginTime );
        else
            timingElement.beginElement();
    },

    endLayerAt: function( timingElement, endTime ) {
        if ( jSignage.timeline )
            jSignage.timedLayers[timingElement.id].endAt( null, endTime || 0 );
        else if ( endTime )
            timingElement.endElementAt( endTime );
        else
            timingElement.endElement();
    },

    setLayerMediaDur: function( timingElement, mediaDur ) {
        if ( jSignage.timeline ) {
            jSignage.timedLayers[timingElement.id].setMediaDur( null, mediaDur );
        } else {
            if ( timingElement.getAttribute( 'dur' )=='media' ) {
                var parent = timingElement.parentNode;
                var before = timingElement.nextElementSibling;
                parent.removeChild( timingElement );
                timingElement.setAttribute( 'dur', mediaDur );
                parent.insertBefore( timingElement, before );
            }
        }
    },

    add: function( parent, child, timingElement, before ) {
        parent = jSignage.getRealMediaTarget(parent);
        if ( !timingElement ) {
            var realChild = jSignage.getRealMediaTarget(child);
            if ( jSignage.isLayer( realChild ) )
                timingElement = jSignage.getTimingElement( realChild );
        }
        if ( timingElement ) {
            var begin = timingElement.getAttribute( 'begin' );
            if ( !begin ) {
                if ( jSignage.isInRenderingTree(parent) )
                    begin = 'now';
                else
                    begin = '0';
                timingElement.setAttribute( 'begin', begin );
            }
            if ( begin.substring( 0, 3 )=='now' ) {
                var beginTime = 0;
                if ( begin!='now' ) {
                    var offset = jSignage.durInSeconds( begin.substring( 4 ), 0 );
                    if ( begin.charAt(3)=='+' )
                        beginTime = offset;
                    else if ( begin.charAt(3)=='-' )
                        beginTime = -offset;
                }
                timingElement.setAttribute( 'begin', 'indefinite' );        
                jSignage.scheduleLayer( parent, timingElement );
                jSignage.addToLayout( jSignage.getG2(parent), child, before );
                jSignage.beginLayerAt( timingElement, beginTime );
            } else {
                var action = jSignage.scheduleLayer( parent, timingElement );
                jSignage.addToLayout( jSignage.getG2(parent), child, before );
                if ( action )
                    jSignage.timeline.schedule( action );
            }
        } else {
            parent.insertBefore( child, before || null );
        }
    },

    addAndKick: function( parent, child, timingElement, beginTime, before ) {
        timingElement.setAttribute( 'begin', 'indefinite' );
        jSignage.scheduleLayer( parent, timingElement );
        jSignage.addToLayout( jSignage.getG2(jSignage.getRealMediaTarget(parent)), child, before );
        jSignage.beginLayerAt( timingElement, beginTime || 0 );
    },

    svgAnimation: function( target, name, attr, endCallback ) {
        var elem, href = null, id = null;
        if ( 'href' in attr ) {
            href = attr.href;
            delete attr.href;
        }
        if ( 'id' in attr ) {
            id = attr.id;
            delete attr.id;
        }
        var trigger = 'begin' in attr ? attr.begin : 'indefinite';
        if ( jSignage.timeline ) {
            attr.begin = 'indefinite';
            elem = jSignage._createElement( name, attr );            
            if ( trigger!='indefinite' )
                jSignage.timeline.scheduleElement( trigger, elem, endCallback );
        } else {
            elem = jSignage._createElement( name, attr );
            if ( endCallback && trigger!='indefinite' )
                elem.addEventListener( 'endEvent', endCallback );
        }
        elem.id = id || jSignage.guuid();
        if ( href )
            elem.setAttributeNS( jSignage.xlinkNS, 'href', href );
        target.appendChild( elem );
        return elem;
    },

    beginAnimation: function( smil, offset, endCallback ) {
        if ( offset ) {
            if ( jSignage.timeline )
                jSignage.timeline.scheduleRelative( null, new TimedAction( offset, 'beginElement', smil ) );
            else
                smil.beginElementAt( offset );
        } else {
            if ( jSignage.features.SVGAnimation )
                smil.beginElement();
            else
                launchSoftAnimation( null, smil );
        }
        if ( endCallback ) {
            if ( jSignage.timeline ) {
                var activeDur = computeActiveDur( smil );
                if ( typeof(activeDur) == 'number' )
                    jSignage.timeline.scheduleRelative( null, new TimedAction( offset+activeDur, 'callback', endCallback ) );
            } else {
                var handler = smil.addEventListener( 'endEvent', function() {
                    smil.removeEventListener( 'endEvent', handler );
                    endCallback();
                }, false );
            }
        }
    },

    removeAnimation: function( smil ) {
        smil.parentNode.removeChild( smil );
    },

    durInSeconds: function( qdur, def ) {
        if ( qdur===undefined || qdur===null )
            return def || 0;
        var tc = smilTimecount.exec( qdur );
        if ( tc ) {
            var dur = parseFloat( tc[1] );
            if ( tc[2] ) {
                if ( tc[2]=='h' )
                    dur *= 3600;
                else if ( tc[2]=='min' )
                    dur *= 60;
                else if ( tc[2]=='ms' )
                    dur /= 1000;
            }
            return dur;
        }
        var cv = smilClockValue.exec( qdur );
        if ( cv ) {
            var dur = parseInt(tc[2])*60 + parseFloat(tc[3]);
            if ( tc[1] )
                dur += parseInt(tc[1])*3600;
            return dur;
        }
        return def || 0;
    },

    getEffectTrigger: function( subtree, eventName, args ) {
        var media = jSignage.getRealMediaTarget( subtree );
        if ( media==null )
            return 'indefinite';
        var timing = jSignage.getTimingElement( media );
        var trigger = timing.id+"."+eventName;
        return trigger;
    },

    triggerWithOffset: function( trigger, offset ) {
        if ( trigger=='indefinite' )
            return trigger;
        if ( trigger==0 )
            return offset;
        if ( offset < 0 )
            return trigger+offset;
        if ( offset > 0 )
            return trigger+'+'+offset;
        return trigger;
    },

    wrapInNewElement: function( x, postLayoutCallback, name ) {
        var parent=x.parentNode, id;
        var g = document.createElementNS( jSignage.svgNS, name || 'g' );
        var oldid = x.id, id = jSignage.guuid();
        g.id = oldid || jSignage.guuid();
        x.id = id;
        if ( jSignage.timedLayers && oldid && jSignage.timedLayers[oldid] ) {
            jSignage.timedLayers[id] = jSignage.timedLayers[oldid];
            delete jSignage.timedLayers[oldid];
        }
        g.setAttributeNS( jSignage.spxNS, 'effect-target-id', id );
        if ( postLayoutCallback )
            jSignage.postLayoutCallback( g, postLayoutCallback );
        if ( parent ) {
            parent.insertBefore( g, x );
            parent.removeChild( x );
        }
        g.appendChild( x );
        if ( postLayoutCallback && parent && jSignage.isInRenderingTree( parent ) ) {
            var bbox = jSignage.getBBox( x, null );
            if ( bbox && bbox.height>0 && bbox.width>0 )
                jSignage._calcLayout( g, bbox.width, bbox.height, 2, parent );
        }
        return g;
    },

    groupEach: function( subtree, callback ) {
        var layer = jSignage.getRealMediaTarget( subtree );
        if ( layer ) {
            callback.call( layer );
            if ( layer.localName=='g' && layer.getAttributeNS( jSignage.spxNS, 'layer-type' )=='group' ) {
                for ( var child=jSignage.getG2(layer).firstElementChild; child!=null; child=child.nextElementSibling )
                    if ( child.localName!='set' && child.localName!='animate' )
                        groupEach( child, callback );
            }
        }
    },

    setInitialVisibility: function( subtree, always ) {
        if ( always===undefined )
            always=true;
        var layer = jSignage.getRealMediaTarget( subtree );
        if ( layer==null )
            return null;
        var name=layer.localName, t=null;
        if ( name=='audio' || name=='video' || name=='animation' || jSignage.timeline ) {
	        layer.setAttribute( 'initialVisibility', always ? 'always' : 'whenStarted' );
	        t = layer;
	    } else {
	        t=layer.firstElementChild;
            if ( t && ( t.localName=='set' || t.localName=='animate' ) ) {
                if ( layer.getAttribute( 'display' )=='none' ) {
                    if ( always ) {
                        layer.setAttribute( 'display', 'inherit' );
                        if ( t.localName=='set' && t.getAttribute( 'fill' )!='freeze' ) {
                            var n = jSignage._createElement( 'animate', { attributeName: 'display', values: 'inherit;none', keyTimes: '0;1', fill: 'freeze', dur: t.getAttribute('dur'), begin: t.getAttribute('begin') } );
                            layer.insertBefore( n, t );
                            layer.removeChild( t );
                            n.id = t.id;
                            t = n;
                        }
                    }
                } else {
                    if ( !always ) {
                        layer.setAttribute( 'display', 'none' );
                        if ( t.localName=='animate' ) {
                            var n = jSignage._createElement( 'set', { attributeName: 'display', to: 'inherit', dur: t.getAttribute('dur'), begin: t.getAttribute('begin') } );
                            layer.insertBefore( n, t );
                            layer.removeChild( t );
                            n.id = t.id;
                            t = n;
                        } else if ( t.localName=='set' ) {
                            var next=t.nextElementSibling;
                            layer.removeChild( t );
                            t.setAttribute( 'fill', 'freeze' );
                            layer.insertBefore( t, next );
                        }
                    }
                }
            }
	    }
	    return t;
    },

    setFillFreeze: function( subtree, freeze ) {
        if  ( freeze===undefined )
            freeze=true;
        var layer = jSignage.getRealMediaTarget( subtree );
        if ( layer==null )
            return null;
        var name=layer.localName, t=null;
        if ( jSignage.timeline ) {
	        t = jSignage.getTimingElement( layer );
	        t.setAttribute( 'fill', freeze ? 'freeze' : 'remove' );
        } else if ( name=='audio' || name=='video' || name=='animation' ) {
	        layer.setAttribute( 'fill', freeze ? 'freeze' : 'remove' );
	        t = layer;
	    } else {
	        var t=layer.firstElementChild;
            if ( t && ( t.localName=='set' || t.localName=='animate' ) ) {
                if ( layer.getAttribute( 'display' )=='none' ) {
                    if ( t.localName=='set' ) {
                        var next=t.nextElementSibling;
                        layer.removeChild( t );
                        t.setAttribute( 'fill', freeze ? 'freeze' : 'remove' );
                        layer.insertBefore( t, next );
                    }
                } else {
                    if ( !freeze && t.localName=='set' ) {
                        var n = jSignage._createElement( 'animate', { attributeName: 'display', values: 'inherit;none', keyTimes: '0;1', fill: 'freeze', dur: t.getAttribute('dur'), begin: t.getAttribute('begin') } );
                        layer.insertBefore( n, t );
                        layer.removeChild( t );
                        n.id = t.id;
                        t = n;
                    } else if ( freeze && t.localName=='animate' ) {
                        var n = jSignage._createElement( 'set', { attributeName: 'display', to: 'inherit', dur: t.getAttribute('dur'), begin: t.getAttribute('begin') } );
                        layer.insertBefore( n, t );
                        layer.removeChild( t );
                        n.id = t.id;
                        t = n;
                    }
                }
            }
	    }
        return t;
    },

    removeAfter: function( layer, timingElement, timeAfterEnd, handler ) {
        jSignage.endEventOnce( timingElement, function() {
            layer.parentNode.removeChild( layer );
            if ( handler )
                handler();
        }, timeAfterEnd || 0 );
    },

    beginEvent: function( timingElement, handler ) {
        if ( jSignage.timeline )
            jSignage.timedLayers[timingElement.id].addEventListener( 'beginEvent', handler );
        else
            timingElement.addEventListener( 'beginEvent', handler, false );
    },

    endEvent: function( timingElement, handler ) {
        if ( jSignage.timeline )
            jSignage.timedLayers[timingElement.id].addEventListener( 'endEvent', handler );
        else
            timingElement.addEventListener( 'endEvent', handler, false );
    },

    endEventOnce: function( timingElement, handler, delay ) {
        if ( jSignage.timeline ) {
            function once() {
                timed.removeEventListener( 'endEvent', once );
                handler();
            }
            var timed = jSignage.timedLayers[timingElement.id];
            timed.addEventListener( 'endEvent', once, delay );
        } else {
            function once() {
                timingElement.removeEventListener( 'endEvent', once );
                if ( delay )
                    jSignage.setTimeout( handler, delay*1000 );
                else
                    handler();                
            }
            timingElement.addEventListener( 'endEvent', once, false );
        }
    },

    repeatCount: function( args ) {
        var repeatCount = 1;
        if ( args && 'repeatCount' in args ) {
            if ( args.repeatCount=='indefinite' ) {
                repeatCount = 'indefinite';
            } else {
                repeatCount = parseInt( args.repeatCount );
                if ( isNaN(repeatCount) || repeatCount < 1 )
                    repeatCount = 1;
            }
        }
        return repeatCount;
    },

    repeatDur: function( args ) {
        var repeatDur = 0;
        if ( args && 'repeatDur' in args ) {
            if ( args.repeatDur=='indefinite' )
                repeatDur = 'indefinite';
            else
                repeatDur = jSignage.durInSeconds( args.repeatDur, 0 );
        }
        return repeatDur;
    },

    repeatInterval: function( args, max ) {
        var repeatInterval = jSignage.durInSeconds( args && args.repeatInterval, 1 );
        if ( max && repeatInterval < max )
            repeatInterval=max;
        return repeatInterval;
    },

    verticalDevicePixelSize: null,
    horizontalDevicePixelSize: null,

    getDevicePixelSize: function( vertical ) {
        if ( jSignage.verticalDevicePixelSize===null ) {
            var svg = document.documentElement;
            var ctm = svg.getDeviceCTM ? svg.getDeviceCTM() : svg.getScreenCTM();
            if ( ctm.getComponent ) {
                if ( ctm.getComponent(2)==0 )
                    jSignage.verticalDevicePixelSize = Math.abs(ctm.getComponent(3));
                else
                    jSignage.verticalDevicePixelSize = Math.abs(ctm.getComponent(2));
                if ( ctm.getComponent(1)==0 )
                    jSignage.horizontalDevicePixelSize = Math.abs(ctm.getComponent(0));
                else
                    jSignage.horizontalDevicePixelSize = Math.abs(ctm.getComponent(1));
            } else {
                if ( ctm.c==0 )
                    jSignage.verticalDevicePixelSize = Math.abs(ctm.d);
                else
                    jSignage.verticalDevicePixelSize = Math.abs(ctm.c);
                if ( ctm.b==0 )
                    jSignage.horizontalDevicePixelSize = Math.abs(ctm.a);
                else
                    jSignage.horizontalDevicePixelSize = Math.abs(ctm.b);
            }
            if ( jSignage.verticalDevicePixelSize<=0 )
                jSignage.verticalDevicePixelSize = 1;
            if ( jSignage.horizontalDevicePixelSize<=0 )
                jSignage.horizontalDevicePixelSize = 1;
        }
        return vertical ? jSignage.verticalDevicePixelSize : jSignage.horizontalDevicePixelSize;
    },

    getLocalCoord: function( elem, clientX, clientY ) {
        var click = document.documentElement.createSVGPoint();
        click.x = clientX;
        click.y = clientY;
        try {
            var ictm = elem.getScreenCTM().inverse();
            click = click.matrixTransform( ictm );
        } catch ( e ) {
        }
        return click;
    },

    getG2: function( g ) {
        var id = g.getAttributeNS( jSignage.spxNS, 'g2-id' );
        if ( id )
            return jSignage.findChildById( g, id );
        return g;
    },

    _postLayoutCallback: { }
});

function getChangeNumber( str ) {
    if ( !str )
        return null;
    var nums = str.split( '.' );
    var r = [];
    for ( var i=0; i<nums.length; i++ ) {
        var n = parseInt( nums[i] );
        if ( !isNaN(n) && n >= 0 )
            r.push( n );
        else
            return null;
    }
    if ( r.length > 0 )
        return r;
    return null;
}

function compareChangeNumber( newNums, oldNums ) {
    if ( !newNums || !newNums.length || !oldNums || !oldNums.length )
        return 1;
    for ( var i=0; i<newNums.length && i<oldNums.length; i++ )
        if ( newNums[i]!=oldNums[i] )
            return i+1;
    if ( i<newNums.length || i<oldNums.length )
        return i+1;
    return 0;
}

jSignage.changeGeometry = function( attachPoint, x, args ) {
    x.setAttribute( 'transform', 'translate(' + args.left + ',' + args.top + ')' );
    var g = jSignage.getRealMediaTarget( x );
    if ( g.localName=='g' ) {
        resize_media_frame( args.frame, g, args.width, args.height );
    } else {
        g.setAttribute( 'width', args.width );
        g.setAttribute( 'height', args.height );
    }
};

jSignage.fn.extend({
    g2: function() {
        return jSignage.getG2( jSignage.getRealMediaTarget(this[0]) );
    },

    add: function( elem ) {
        if ( this.length==0 || !elem )
            return;
        var me=this[0];
        jSignage.each( elem, function() {
            if ( this.jsignage )
                jSignage.each( this, function() {
                    jSignage.add( me, this );
                } );
            else
                jSignage.add( me, this );
        });
        return this;
    },

    updateCanned: function( layers ) {
        if ( !this[0] || this[0].localName!='g' || !layers || !layers.length )
            return this;
        var attachPoint = jSignage.getG2( jSignage.getRealMediaTarget( this[0] ) ), newIds={};

        // Check who's part of the new layer list
        for ( var i=0; i<layers.length; i++ ) {
            var args = layers[i].args;
            if ( args ) {
                var id = args.id;
                if ( id )
                    newIds[id] = i;
            }
        }

        // Weed out any existing layer that is not part the new layer list and reorder them
        for ( var x=attachPoint.firstElementChild; x; x=nextX ) {
            var nextX = x.nextElementSibling, id=x.id;
            if ( x.localName=='set' || x.localName=='animate' )
                continue;
            if ( !id || !(id in newIds) ) {
                attachPoint.removeChild( x );
            } else {
                var prev = x.previousElementSibling;
                if ( prev ) {
                    var prevNum = newIds[prev.id];
                    if ( newIds[id] < prevNum ) {
                        while ( newIds[id] < prevNum && prev.previousElementSibling ) {
                            prev = prev.previousElementSibling;
                            prevNum = newIds[prev.id];
                        }
                        attachPoint.insertBefore( x, prev );
                    }
                }
            }
        }

        // Add new layers, update existing ones
        x = attachPoint.firstElementChild;
        while ( x && ( x.localName=='set' || x.localName=='animate' ) )
            x = x.nextElementSibling;
        for ( i=0; i<layers.length; i++ ) {
            var layer = layers[i], args = layer.args, append = true;
            var layerId = args && args.id;
            if ( !args || !layerId )
                continue;
            if ( x && x.id==layerId ) {
                nextX = x.nextElementSibling;
                var oldChangeNumber = getChangeNumber( jSignage.getRealMediaTarget(x).getAttributeNS( jSignage.spxNS, 'changeNumber' ) );
                var newChangeNumber = getChangeNumber( layer.changeNumber );
                var newer = compareChangeNumber( newChangeNumber, oldChangeNumber );
                if ( newer==1 ) {
                    attachPoint.removeChild( x );
                } else if ( newer>=2 ) {
                    if ( layer.ctor=='media' || layer.ctor=='image' || layer.ctor=='video' || layer.ctor=='animation' ) {
                        jSignage.changeGeometry( attachPoint, x, args );
                        append = false;
                    } else {
                        attachPoint.removeChild( x );
                    }
                } else {
                    append = false;
                }
                x = nextX;
            }
            if ( append ) {
                var jl = jSignage.uncan( layer );
                if ( jl && jl.jsignage && jl[0] )
                    jSignage.add( attachPoint, jl[0] );
            }
        }
    },

    addTo: function( target ) {
        if ( target.localName===undefined )
            target=jSignage(target);
        if ( target.jsignage ) {
            if ( target.length==0 )
                return;
            target=target[0];
        }
        jSignage.each( this, function() {
            jSignage.add( target, this );
        });
        return this;
    },

    setInitialVisibility: function( always ) {
        jSignage.each( this, function() {
            jSignage.setInitialVisibility( this, always );
        });
        return this;
    },

    setFillFreeze: function( freeze ) {
        jSignage.each( this, function() {
            jSignage.setFillFreeze( this, freeze );
        });
        return this;
    },

    removeAfter: function( timeAfterEnd, handler ) {
        timeAfterEnd = jSignage.durInSeconds( timeAfterEnd, 0 );
        jSignage.each( this, function() {
            jSignage.removeAfter( this, jSignage.getTimingElement( jSignage.getRealMediaTarget( this ) ), timeAfterEnd, handler );
        });
        return this;
    },

    begin: function( beginTime ) {
        jSignage.each( this, function() {
            jSignage.beginLayerAt( jSignage.getTimingElement( jSignage.getRealMediaTarget(this) ), beginTime || 0 );
        });
        return this;
    },

    end: function( endTime ) {
        jSignage.each( this, function() {
            jSignage.endLayerAt( jSignage.getTimingElement( jSignage.getRealMediaTarget(this) ), endTime || 0 );
        });
        return this;
    },

    endsWith: function( peer, offset ) {
        if ( !peer[0] )
            return this;
        var end = jSignage.triggerWithOffset( jSignage.getTimingElement( jSignage.getRealMediaTarget(peer[0]) ).id+'.endEvent', jSignage.durInSeconds( offset, 0 ) );
        jSignage.each( this, function() {
            jSignage.getTimingElement( jSignage.getRealMediaTarget(this) ).setAttribute( 'end', end );
        });
        return this;
    },

    setVisible: function( on ) {
        if ( on && !this.isOn )
            this.show();
        else if ( !on && this.isOn )
            this.hide();
        return this;
    },

    show: function() {
        this.isOn = true;
        if ( this.outEffectInProgressUntil && jSignage.getCurrentTime() < this.outEffectInProgressUntil )
            this.begin( this.outEffectInProgressUntil-jSignage.getCurrentTime() );
        else
            this.begin();
        return this;
    },

    hide: function() {
        this.isOn = false;
        this.end( this.longestOutEffect || 0 );
        if ( this.longestOutEffect )
            this.outEffectInProgressUntil = jSignage.getCurrentTime() + this.longestOutEffect;
        return this;
    },

    pause: function() {
        jSignage.each( this, function() {
            jSignage.groupEach( this, function() {
                jSignage.getTimingElement( this ).pauseElement();
            });
        });
        return this;
    },

    resume: function() {
        jSignage.each( this, function() {
            jSignage.groupEach( this, function() {
                jSignage.getTimingElement( this ).resumeElement();
            });
        });
        return this;
    },

    beginEvent: function( handler ) {
        jSignage.each( this, function() {
            jSignage.beginEvent( jSignage.getTimingElement( jSignage.getRealMediaTarget(this) ), handler );
        });
        return this;
    },

    endEvent: function( handler ) {
        jSignage.each( this, function() {
            jSignage.endEvent( jSignage.getTimingElement( jSignage.getRealMediaTarget(this) ), handler );
        });
        return this;
    },

    effectIn: function( callback ) {
        var wrapper=this;
        this.each( function(i) {
            wrapper[i] = jSignage.wrapInNewElement( this, function( timeBase, inner, width, height, x, y, bbw, bbh ) {
                callback.call( this, timeBase+'.begin', inner, width, height, x, y, bbw, bbh );
            } );
        });
        return this;
    },

    effectOut: function( dur, callback ) {
        if ( !this.longestOutEffect || this.longestOutEffect < dur )
            this.longestOutEffect = dur;
        var wrapper=this;
        this.each( function(i) {
            wrapper[i] = jSignage.wrapInNewElement( this, function( timeBase, inner, width, height, x, y, bbw, bbh ) {
                callback.call( this, jSignage.triggerWithOffset( timeBase+'.end', -dur ), inner, width, height, x, y, bbw, bbh );
            } );
        });
        return this;
    }

});

})();

// Basic layer types

(function(){

var extensionToType = {
    jpeg: 0, jpg: 0, png: 0,
    gif: 1, avi: 1, divx: 1, m4v: 1, 264: 1, h264: 1, mov: 1, mp4: 1, wmv: 1, mkv: 1, mpeg: 1, mpg: 1, m2ts: 1, ts: 1, m2v: 1, webm: 1, ogv: 1,
    mp3: 2, wav: 2, aac: 2, m4a: 2, ogg: 2, oga: 2,
    svg: 3, smil: 3
};

var textAreaProps = { lineIncrement: 'line-increment', textAlign: 'text-align', displayAlign: 'display-align', fontFamily: 'font-family', fontSize: 'font-size', fontStyle: 'font-style', fontWeight: 'font-weight', fontVariant: 'font-variant', fill: 'fill', direction: 'direction', unicodeBidi: 'unicode-bidi' };
var tspanProps = { lineIncrement: 'line-increment', fontFamily: 'font-family', fontSize: 'font-size', fontStyle: 'font-style', fontWeight: 'font-weight', fontVariant: 'font-variant', fill: 'fill', direction: 'direction', unicodeBidi: 'unicode-bidi' };
var shapeProps = { fill: 'fill', fillRule: 'fill-rule', fillOpacity: 'fill-opacity', stroke: 'stroke', strokeWidth: 'stroke-width', strokeLineCap: 'stroke-linecap', strokeLineJoin: 'stroke-linejoin', strokeMiterLimit: 'stroke-miterlimit', strokeDashArray: 'stroke-dasharray', strokeDashOffset: 'stroke-dashoffset', strokeOpacity: 'stroke-opacity' };
var animateProps = [ 'calcMode', 'from', 'to', 'by', 'additive', 'accumulate', 'end', 'dur', 'min', 'max', 'repeatCount', 'repeatDur', 'fill', 'id' ];
var mediaAlignToPAR = { topLeft: 'xMinYMin', topMid: 'xMidYMin', topRight: 'xMaxYMin', midLeft: 'xMinYMid', center: 'xMidYMid', midRight: 'xMaxYMid', bottomLeft: 'xMinYMax', bottomMid: 'xMidYMax', bottomRight: 'xMaxYMax' };
var textProps = [ 'font-family', 'font-size', 'font-style', 'font-weight', 'font-variant', 'fill', 'direction', 'unicode-bidi' ];

function _mkstyle( attr ) {
    var style='';
    for ( var x in attr ) {
        if ( style!='' ) style += '; ';
        style += x + ': ';
        style += attr[x];
        if ( x=='font-size' )
            style += 'px';
    }
    return style;
}

// Emulates "10.11.7 Text in an area layout rules" from the SVG 1.2 specification

var classOP = "\xA1\xBF\u2E18";
var classCL = "\u3001\u3002\uFE11\uFE12\uFE50\uFE52\uFF0C\uFF0E\uFF61\uFF64";
var classCP = ")]";
var classQU = "\"'\u275B\u275C\u275D\u275E\u2E00\u2E01\u2E06\u2E07\u2E08\u2E0B";
var classGL = "\xA0\u202F\u180E\u034F\u2007\u2011\u0F08\u0F0C\u0F12\u035C\u035D\u035E\u035F\u0360\u0361\u0362";
var classNS = "\u17D6\u203C\u203D\u2047\u2048\u2049\u3005\u301C\u303C\u303B\u309B\u309C\u309D\u309E\u30A0\u30FB\u30FC\u30FD\u30FE\uFE54\uFE55\uFF1A\uFF1B\uFF65\uFF70\uFF9E\uFF9F";
var classEX = "!?\u05C6\u061B\u061E\u061F\u06D4\u07F9\u0F0D\uFF01\uFF1F";
var classSY = "/";
var classIS = ",.:;\u037E\u0589\u060C\u060D\u07F8\u2044\uFE10\uFE13\uFE14";
var classPR = "+\\\xB1\u2116\u2212\u2213";
var classPO = "%\xA2\xB0\u060B\u066A\u2030\u2031\u2032\u2033\u2034\u2035\u2036\u2037\u20A7\u2103\u2109\uFDFC\uFE6A\uFF05\uFFE0";
var classNU = "0123456789\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669\u066B\u066C\u06F0\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9\u07C0\u07C1\u07C2\u07C3\u07C4\u07C5\u07C6\u07C7\u07C8\u07C9\u0966\u0967\u0968\u0969\u096A\u096B\u096C\u096D\u096E\u096F\u09E6\u09E7\u09E8\u09E9\u09EA\u09EB\u09EC\u09ED\u09EE\u09EF\u0A66\u0A67\u0A68\u0A69\u0A6A\u0A6B\u0A6C\u0A6D\u0A6E\u0A6F\u0AE6\u0AE7\u0AE8\u0AE9\u0AEA\u0AEB\u0AEC\u0AED\u0AEE\u0AEF\u0B66\u0B67\u0B68\u0B69\u0B6A\u0B6B\u0B6C\u0B6D\u0B6E\u0B6F\u0BE6\u0BE7\u0BE8\u0BE9\u0BEA\u0BEB\u0BEC\u0BED\u0BEE\u0BEF\u0C66\u0C67\u0C68\u0C69\u0C6A\u0C6B\u0C6C\u0C6D\u0C6E\u0C6F\u0CE6\u0CE7\u0CE8\u0CE9\u0CEA\u0CEB\u0CEC\u0CED\u0CEE\u0CEF\u0D66\u0D67\u0D68\u0D69\u0D6A\u0D6B\u0D6C\u0D6D\u0D6E\u0D6F\u0E50\u0E51\u0E52\u0E53\u0E54\u0E55\u0E56\u0E57\u0E58\u0E59\u0ED0\u0ED1\u0ED2\u0ED3\u0ED4\u0ED5\u0ED6\u0ED7\u0ED8\u0ED9\u0F20\u0F21\u0F22\u0F23\u0F24\u0F25\u0F26\u0F27\u0F28\u0F29\u1040\u1041\u1042\u1043\u1044\u1045\u1046\u1047\u1048\u1049\u1090\u1091\u1092\u1093\u1094\u1095\u1096\u1097\u1098\u1099\u17E0\u17E1\u17E2\u17E3\u17E4\u17E5\u17E6\u17E7\u17E8\u17E9\u1810\u1811\u1812\u1813\u1814\u1815\u1816\u1817\u1818\u1819\u1946\u1947\u1948\u1949\u194A\u194B\u194C\u194D\u194E\u194F\u19D0\u19D1\u19D2\u19D3\u19D4\u19D5\u19D6\u19D7\u19D8\u19D9\u1A80\u1A81\u1A82\u1A83\u1A84\u1A85\u1A86\u1A87\u1A88\u1A89\u1A90\u1A91\u1A92\u1A93\u1A94\u1A95\u1A96\u1A97\u1A98\u1A99\u1B50\u1B51\u1B52\u1B53\u1B54\u1B55\u1B56\u1B57\u1B58\u1B59\u1BB0\u1BB1\u1BB2\u1BB3\u1BB4\u1BB5\u1BB6\u1BB7\u1BB8\u1BB9\u1C40\u1C41\u1C42\u1C43\u1C44\u1C45\u1C46\u1C47\u1C48\u1C49\u1C50\u1C51\u1C52\u1C53\u1C54\u1C55\u1C56\u1C57\u1C58\u1C59\uA620\uA621\uA622\uA623\uA624\uA625\uA626\uA627\uA628\uA629\uA8D0\uA8D1\uA8D2\uA8D3\uA8D4\uA8D5\uA8D6\uA8D7\uA8D8\uA8D9\uA900\uA901\uA902\uA903\uA904\uA905\uA906\uA907\uA908\uA909\uA9D0\uA9D1\uA9D2\uA9D3\uA9D4\uA9D5\uA9D6\uA9D7\uA9D8\uA9D9\uAA50\uAA51\uAA52\uAA53\uAA54\uAA55\uAA56\uAA57\uAA58\uAA59\uABF0\uABF1\uABF2\uABF3\uABF4\uABF5\uABF6\uABF7\uABF8\uABF9";
var classID = /[\u2E80-\u2FFF\u3040-\u30FF\u3130-\u318F\u3400-\u4DB5\u4E00-\uA4CF\uF900-\uFAD9\uFE62-\uFE66\uFF01-\uFF5A]/;
var classIN = "\u2024\u2025\u2026\uFE19";
var classHY = "-";
var classBA = "\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2008\u2009\u200A\u205F\t\xAD\u058A\u2010\u2012\u2013\u05BE\u0F0B\u1361\u17D8\u17DA\u2027\x7C\u16EB\u16EC\u16ED\u2056\u2058\u2059\u205A\u205B\u205C\u205D\u205E\u2E19\u2E2A\u2E2B\u2E2C\u2E2D\u2E30\u0964\u0965\u0E5A\u0E5B\u104A\u104B\u1735\u1736\u17D4\u17D5\u1B5E\u1B5F\uA8CE\uA8CF\uAA5D\uAA5E\uAA5F\u0F34\u0F7F\u0F85\u0FBE\u0FBF\u0FD2\u1804\u1805\u1B5A\u1B5B\u1B5D\u1B60\u1C3B\u1C3C\u1C3D\u1C3E\u1C3F\u1C7E\u1C7F\u2CFA\u2CFB\u2CFC\u2CFF\u2E0E\u2E0F\u2E10\u2E11\u2E12\u2E13\u2E14\u2E15\u2E17\uA60D\uA60F\uA92E\uA92F";
var classBB = "\xB4\u1FFD\u02DF\u02C8\u02CC\u0F01\u0F02\u0F03\u0F04\u0F06\u0F07\u0F09\u0F0A\u0FD0\u0FD1\u0FD3\uA874\uA875\u1816";
var classB2 = "\u2014";
var classZW = "\u200B";
var classCM = "\u0903\u093B\u093E\u093F\u0940\u0949\u094A\u094B\u094C\u094E\u094F\u0982\u0983\u09BE\u09BF\u09C0\u09C7\u09C8\u09CB\u09CC\u09D7\u0A03\u0A3E\u0A3F\u0A40\u0A83\u0ABE\u0ABF\u0AC0\u0AC9\u0ACB\u0ACC\u0B02\u0B03\u0B3E\u0B40\u0B47\u0B48\u0B4B\u0B4C\u0B57\u0BBE\u0BBF\u0BC1\u0BC2\u0BC6\u0BC7\u0BC8\u0BCA\u0BCB\u0BCC\u0BD7\u0C01\u0C02\u0C03\u0C41\u0C42\u0C43\u0C44\u0C82\u0C83\u0CBE\u0CC0\u0CC1\u0CC2\u0CC3\u0CC4\u0CC7\u0CC8\u0CCA\u0CCB\u0CD5\u0CD6\u0D02\u0D03\u0D3E\u0D3F\u0D40\u0D46\u0D47\u0D48\u0D4A\u0D4B\u0D4C\u0D57\u0D82\u0D83\u0DCF\u0DD0\u0DD1\u0DD8\u0DD9\u0DDA\u0DDB\u0DDC\u0DDD\u0DDE\u0DDF\u0DF2\u0DF3\u0F3E\u0F3F\u0F7F\u102B\u102C\u1031\u1038\u103B\u103C\u1056\u1057\u1062\u1063\u1064\u1067\u1068\u1069\u106A\u106B\u106C\u106D\u1083\u1084\u1087\u1088\u1089\u108A\u108B\u108C\u108F\u109A\u109B\u109C\u17B6\u17BE\u17BF\u17C0\u17C1\u17C2\u17C3\u17C4\u17C5\u17C7\u17C8\u1923\u1924\u1925\u1926\u1929\u192A\u192B\u1930\u1931\u1933\u1934\u1935\u1936\u1937\u1938\u19B0\u19B1\u19B2\u19B3\u19B4\u19B5\u19B6\u19B7\u19B8\u19B9\u19BA\u19BB\u19BC\u19BD\u19BE\u19BF\u19C0\u19C8\u19C9\u1A19\u1A1A\u1A1B\u1A55\u1A57\u1A61\u1A63\u1A64\u1A6D\u1A6E\u1A6F\u1A70\u1A71\u1A72\u1B04\u1B35\u1B3B\u1B3D\u1B3E\u1B3F\u1B40\u1B41\u1B43\u1B44\u1B82\u1BA1\u1BA6\u1BA7\u1BAA\u1BE7\u1BEA\u1BEB\u1BEC\u1BEE\u1BF2\u1BF3\u1C24\u1C25\u1C26\u1C27\u1C28\u1C29\u1C2A\u1C2B\u1C34\u1C35\u1CE1\u1CF2\uA823\uA824\uA827\uA880\uA881\uA8B4\uA8B5\uA8B6\uA8B7\uA8B8\uA8B9\uA8BA\uA8BB\uA8BC\uA8BD\uA8BE\uA8BF\uA8C0\uA8C1\uA8C2\uA8C3\uA952\uA953\uA983\uA9B4\uA9B5\uA9BA\uA9BB\uA9BD\uA9BE\uA9BF\uA9C0\uAA2F\uAA30\uAA33\uAA34\uAA4D\uAA7B\uABE3\uABE4\uABE6\uABE7\uABE9\uABEA\uABEC\u0488\u0489\u20DD\u20DE\u20DF\u20E0\u20E2\u20E3\u20E4\uA670\uA671\uA672\u0300\u0301\u0302\u0303\u0304\u0305\u0306\u0307\u0308\u0309\u030A\u030B\u030C\u030D\u030E\u030F\u0310\u0311\u0312\u0313\u0314\u0315\u0316\u0317\u0318\u0319\u031A\u031B\u031C\u031D\u031E\u031F\u0320\u0321\u0322\u0323\u0324\u0325\u0326\u0327\u0328\u0329\u032A\u032B\u032C\u032D\u032E\u032F\u0330\u0331\u0332\u0333\u0334\u0335\u0336\u0337\u0338\u0339\u033A\u033B\u033C\u033D\u033E\u033F\u0340\u0341\u0342\u0343\u0344\u0345\u0346\u0347\u0348\u0349\u034A\u034B\u034C\u034D\u034E\u034F\u0350\u0351\u0352\u0353\u0354\u0355\u0356\u0357\u0358\u0359\u035A\u035B\u035C\u035D\u035E\u035F\u0360\u0361\u0362\u0363\u0364\u0365\u0366\u0367\u0368\u0369\u036A\u036B\u036C\u036D\u036E\u036F\u0483\u0484\u0485\u0486\u0487\u0591\u0592\u0593\u0594\u0595\u0596\u0597\u0598\u0599\u059A\u059B\u059C\u059D\u059E\u059F\u05A0\u05A1\u05A2\u05A3\u05A4\u05A5\u05A6\u05A7\u05A8\u05A9\u05AA\u05AB\u05AC\u05AD\u05AE\u05AF\u05B0\u05B1\u05B2\u05B3\u05B4\u05B5\u05B6\u05B7\u05B8\u05B9\u05BA\u05BB\u05BC\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610\u0611\u0612\u0613\u0614\u0615\u0616\u0617\u0618\u0619\u061A\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652\u0653\u0654\u0655\u0656\u0657\u0658\u0659\u065A\u065B\u065C\u065D\u065E\u065F\u0670\u06D6\u06D7\u06D8\u06D9\u06DA\u06DB\u06DC\u06DF\u06E0\u06E1\u06E2\u06E3\u06E4\u06E7\u06E8\u06EA\u06EB\u06EC\u06ED\u0711\u0730\u0731\u0732\u0733\u0734\u0735\u0736\u0737\u0738\u0739\u073A\u073B\u073C\u073D\u073E\u073F\u0740\u0741\u0742\u0743\u0744\u0745\u0746\u0747\u0748\u0749\u074A\u07A6\u07A7\u07A8\u07A9\u07AA\u07AB\u07AC\u07AD\u07AE\u07AF\u07B0\u07EB\u07EC\u07ED\u07EE\u07EF\u07F0\u07F1\u07F2\u07F3\u0816\u0817\u0818\u0819\u081B\u081C\u081D\u081E\u081F\u0820\u0821\u0822\u0823\u0825\u0826\u0827\u0829\u082A\u082B\u082C\u082D\u0859\u085A\u085B\u0900\u0901\u0902\u093A\u093C\u0941\u0942\u0943\u0944\u0945\u0946\u0947\u0948\u094D\u0951\u0952\u0953\u0954\u0955\u0956\u0957\u0962\u0963\u0981\u09BC\u09C1\u09C2\u09C3\u09C4\u09CD\u09E2\u09E3\u0A01\u0A02\u0A3C\u0A41\u0A42\u0A47\u0A48\u0A4B\u0A4C\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81\u0A82\u0ABC\u0AC1\u0AC2\u0AC3\u0AC4\u0AC5\u0AC7\u0AC8\u0ACD\u0AE2\u0AE3\u0B01\u0B3C\u0B3F\u0B41\u0B42\u0B43\u0B44\u0B4D\u0B56\u0B62\u0B63\u0B82\u0BC0\u0BCD\u0C3E\u0C3F\u0C40\u0C46\u0C47\u0C48\u0C4A\u0C4B\u0C4C\u0C4D\u0C55\u0C56\u0C62\u0C63\u0CBC\u0CBF\u0CC6\u0CCC\u0CCD\u0CE2\u0CE3\u0D41\u0D42\u0D43\u0D44\u0D4D\u0D62\u0D63\u0DCA\u0DD2\u0DD3\u0DD4\u0DD6\u0E31\u0E34\u0E35\u0E36\u0E37\u0E38\u0E39\u0E3A\u0E47\u0E48\u0E49\u0E4A\u0E4B\u0E4C\u0E4D\u0E4E\u0EB1\u0EB4\u0EB5\u0EB6\u0EB7\u0EB8\u0EB9\u0EBB\u0EBC\u0EC8\u0EC9\u0ECA\u0ECB\u0ECC\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F71\u0F72\u0F73\u0F74\u0F75\u0F76\u0F77\u0F78\u0F79\u0F7A\u0F7B\u0F7C\u0F7D\u0F7E\u0F80\u0F81\u0F82\u0F83\u0F84\u0F86\u0F87\u0F8D\u0F8E\u0F8F\u0F90\u0F91\u0F92\u0F93\u0F94\u0F95\u0F96\u0F97\u0F99\u0F9A\u0F9B\u0F9C\u0F9D\u0F9E\u0F9F\u0FA0\u0FA1\u0FA2\u0FA3\u0FA4\u0FA5\u0FA6\u0FA7\u0FA8\u0FA9\u0FAA\u0FAB\u0FAC\u0FAD\u0FAE\u0FAF\u0FB0\u0FB1\u0FB2\u0FB3\u0FB4\u0FB5\u0FB6\u0FB7\u0FB8\u0FB9\u0FBA\u0FBB\u0FBC\u0FC6\u102D\u102E\u102F\u1030\u1032\u1033\u1034\u1035\u1036\u1037\u1039\u103A\u103D\u103E\u1058\u1059\u105E\u105F\u1060\u1071\u1072\u1073\u1074\u1082\u1085\u1086\u108D\u109D\u135D\u135E\u135F\u1712\u1713\u1714\u1732\u1733\u1734\u1752\u1753\u1772\u1773\u17B7\u17B8\u17B9\u17BA\u17BB\u17BC\u17BD\u17C6\u17C9\u17CA\u17CB\u17CC\u17CD\u17CE\u17CF\u17D0\u17D1\u17D2\u17D3\u17DD\u180B\u180C\u180D\u18A9\u1920\u1921\u1922\u1927\u1928\u1932\u1939\u193A\u193B\u1A17\u1A18\u1A56\u1A58\u1A59\u1A5A\u1A5B\u1A5C\u1A5D\u1A5E\u1A60\u1A62\u1A65\u1A66\u1A67\u1A68\u1A69\u1A6A\u1A6B\u1A6C\u1A73\u1A74\u1A75\u1A76\u1A77\u1A78\u1A79\u1A7A\u1A7B\u1A7C\u1A7F\u1B00\u1B01\u1B02\u1B03\u1B34\u1B36\u1B37\u1B38\u1B39\u1B3A\u1B3C\u1B42\u1B6B\u1B6C\u1B6D\u1B6E\u1B6F\u1B70\u1B71\u1B72\u1B73\u1B80\u1B81\u1BA2\u1BA3\u1BA4\u1BA5\u1BA8\u1BA9\u1BE6\u1BE8\u1BE9\u1BED\u1BEF\u1BF0\u1BF1\u1C2C\u1C2D\u1C2E\u1C2F\u1C30\u1C31\u1C32\u1C33\u1C36\u1C37\u1CD0\u1CD1\u1CD2\u1CD4\u1CD5\u1CD6\u1CD7\u1CD8\u1CD9\u1CDA\u1CDB\u1CDC\u1CDD\u1CDE\u1CDF\u1CE0\u1CE2\u1CE3\u1CE4\u1CE5\u1CE6\u1CE7\u1CE8\u1CED\u1DC0\u1DC1\u1DC2\u1DC3\u1DC4\u1DC5\u1DC6\u1DC7\u1DC8\u1DC9\u1DCA\u1DCB\u1DCC\u1DCD\u1DCE\u1DCF\u1DD0\u1DD1\u1DD2\u1DD3\u1DD4\u1DD5\u1DD6\u1DD7\u1DD8\u1DD9\u1DDA\u1DDB\u1DDC\u1DDD\u1DDE\u1DDF\u1DE0\u1DE1\u1DE2\u1DE3\u1DE4\u1DE5\u1DE6\u1DFC\u1DFD\u1DFE\u1DFF\u20D0\u20D1\u20D2\u20D3\u20D4\u20D5\u20D6\u20D7\u20D8\u20D9\u20DA\u20DB\u20DC\u20E1\u20E5\u20E6\u20E7\u20E8\u20E9\u20EA\u20EB\u20EC\u20ED\u20EE\u20EF\u20F0\u2CEF\u2CF0\u2CF1\u2D7F\u2DE0\u2DE1\u2DE2\u2DE3\u2DE4\u2DE5\u2DE6\u2DE7\u2DE8\u2DE9\u2DEA\u2DEB\u2DEC\u2DED\u2DEE\u2DEF\u2DF0\u2DF1\u2DF2\u2DF3\u2DF4\u2DF5\u2DF6\u2DF7\u2DF8\u2DF9\u2DFA\u2DFB\u2DFC\u2DFD\u2DFE\u2DFF\u302A\u302B\u302C\u302D\u302E\u302F\u3099\u309A\uA66F\uA67C\uA67D\uA6F0\uA6F1\uA802\uA806\uA80B\uA825\uA826\uA8C4\uA8E0\uA8E1\uA8E2\uA8E3\uA8E4\uA8E5\uA8E6\uA8E7\uA8E8\uA8E9\uA8EA\uA8EB\uA8EC\uA8ED\uA8EE\uA8EF\uA8F0\uA8F1\uA926\uA927\uA928\uA929\uA92A\uA92B\uA92C\uA92D\uA947\uA948\uA949\uA94A\uA94B\uA94C\uA94D\uA94E\uA94F\uA950\uA951\uA980\uA981\uA982\uA9B3\uA9B6\uA9B7\uA9B8\uA9B9\uA9BC\uAA29\uAA2A\uAA2B\uAA2C\uAA2D\uAA2E\uAA31\uAA32\uAA35\uAA36\uAA43\uAA4C\uAAB0\uAAB2\uAAB3\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uABE5\uABE8\uABED\uFB1E\uFE00\uFE01\uFE02\uFE03\uFE04\uFE05\uFE06\uFE07\uFE08\uFE09\uFE0A\uFE0B\uFE0C\uFE0D\uFE0E\uFE0F\uFE20\uFE21\uFE22\uFE23\uFE24\uFE25\uFE26\u0001\u0002\u0003\u0004\u0005\u0006\u0007\u0008\u0009\u000A\u000B\u000C\u000D\u000E\u000F\u0010\u0011\u0012\u0013\u0014\u0015\u0016\u0017\u0018\u0019\u001A\u001B\u001C\u001D\u001E\u001F\u007F\u0080\u0081\u0082\u0083\u0084\u0085\u0086\u0087\u0088\u0089\u008A\u008B\u008C\u008D\u008E\u008F\u0090\u0091\u0092\u0093\u0094\u0095\u0096\u0097\u0098\u0099\u009A\u009B\u009C\u009D\u009E\u009F\u0600\u0601\u0602\u0603\u06DD\u070F\u17B4\u17B5\u200B\u200C\u200D\u200E\u200F\u202A\u202B\u202C\u202D\u202E\u2060\u2061\u2062\u2063\u2064\u206A\u206B\u206C\u206D\u206E\u206F\uFEFF\uFFF9\uFFFA\uFFFB";
var classWJ = "\u2060\uFEFF";
var classBK = "\x0C\x0B\u2028\u2029";

var pairTable = [
    "^^^^^^^^^^^^^^^^^^^^@^^^^^^",
    "_^^%%^^^^%%____%%__^#^_____",
    "_^^%%^^^^%%%%__%%__^#^_____",
    "^^^%%%^^^%%%%%%%%%%^#^%%%%%",
    "%^^%%%^^^%%%%%%%%%%^#^%%%%%",
    "_^^%%%^^^______%%__^#^_____",
    "_^^%%%^^^______%%__^#^_____",
    "_^^%%%^^^__%___%%__^#^_____",
    "_^^%%%^^^__%%__%%__^#^_____",
    "%^^%%%^^^__%%%_%%__^#^%%%%%",
    "%^^%%%^^^__%%__%%__^#^_____",
    "%^^%%%^^^%%%%_%%%__^#^_____",
    "%^^%%%^^^__%%_%%%__^#^_____",
    "_^^%%%^^^_%___%%%__^#^_____",
    "_^^%%%^^^_____%%%__^#^_____",
    "_^^%_%^^^__%___%%__^#^_____",
    "_^^%_%^^^______%%__^#^_____",
    "%^^%%%^^^%%%%%%%%%%^#^%%%%%",
    "_^^%%%^^^______%%_^^#^_____",
    "___________________^_______",
    "%^^%%%^^^__%%_%%%__^#^_____",
    "%^^%%%^^^%%%%%%%%%%^#^%%%%%",
    "_^^%%%^^^_%___%%%__^#^___%%",
    "_^^%%%^^^_%___%%%__^#^____%",
    "_^^%%%^^^_%___%%%__^#^%%%%_",
    "_^^%%%^^^_%___%%%__^#^___%%",
    "_^^%%%^^^_%___%%%__^#^____%"
];

// class Numbers:
// SP=-1 BK=-2 CB=-3 CR=-4 LF=-5 NL=-6 SG=-7
// OP=0 CL=1 CP=2 QU=3 GL=4 NS=5 EX=6 SY=7 IS=8 PR=9 PO=10 NU=11 AL=12 ID=13 IN=14 HY=15 BA=16 BB=17 B2=18 ZW=19 CM=20 WJ=21 H2=22 H3=23 JL=24 JV=25 JT=26
// Rules: DIRECT_BRK = _ INDIRECT_BRK = % COMBINING_INDIRECT_BRK = # COMBINING_PROHIBITED_BRK = @ PROHIBITED_BRK = ^ EXPLICIT_BRK = !

var classLookup = null;

function addClass( members, num ) {
    for ( var i=0; i<members.length; i++ )
        classLookup[members.charAt(i)] = num;
}

function checkClassLookup() {
    if ( classLookup )
        return;
    classLookup = new Object;
    addClass( classCM, 20 ); addClass( classOP, 0 ); addClass( classCL, 1 ); addClass( classCP, 2 ); addClass( classQU, 3 );
    addClass( classGL, 4 ); addClass( classNS, 5 ); addClass( classEX, 6 ); addClass( classSY, 7 ); addClass( classIS, 8 );
    addClass( classPR, 9 ); addClass( classPO, 10 ); addClass( classNU, 11 ); addClass( classIN, 14 ); addClass( classHY, 15 );
    addClass( classBA, 16 ); addClass( classBB, 17 ); addClass( classB2, 18 ); addClass( classZW, 19 ); addClass( classWJ, 21 );
    classLookup[' '] = -1; addClass( classBK, -2 ); classLookup['\r'] = -4;  classLookup['\n'] = -5; classLookup['\x85'] = -6;
}

function lookupClass( unichar ) {
    var cl = classLookup[unichar];
    if ( cl===undefined )
        cl = classID.test(unichar)? 13 : 12;
    return cl;
}

function LineBreaker() {
    this.panicLevel = 0;
    this.trailingSpace = null;
}

LineBreaker.prototype = {
    findBrk: function( textContent, startIndex ) {
        var action = '^', i, beforeChar, beforeClass, prevChar, prevClass;

        if ( this.beforeChar===undefined ) {
            beforeChar = textContent.charAt( startIndex++ );
            beforeClass = lookupClass( beforeChar );
            if ( beforeClass==-1 )
                beforeClass = 21;
            else if ( beforeClass==-5 || beforeClass==-4 )
                beforeClass = -2;
        } else {
            beforeChar = this.beforeChar;
            beforeClass = this.beforeClass;
        }
        prevChar = beforeChar;
        prevClass = beforeClass;

        for ( i=startIndex; i<textContent.length && beforeClass!=-2 && ( beforeClass!=-4 || textContent.charAt(i)=='\n' ); i++ ) {
            prevChar = beforeChar;
            prevClass = beforeClass;
            var c = textContent.charAt( i );
            if ( c==' ' ) {
                beforeChar = c;
                continue;
            }
            var afterClass = lookupClass( c );
            if ( afterClass==-2 || afterClass==-6 || afterClass==-5 ) {
                action = '^' ;
                beforeChar = c;
                beforeClass = -2;
                continue;
            }
            if ( afterClass==-4 ) {
                action = '^';
                beforeChar = c;
                beforeClass = -4;
                continue;
            }
            action = this.panicLevel<=1 ? pairTable[beforeClass].charAt( afterClass ) : '_';
            if ( action=='%' ) {
                if ( beforeChar!=' ' && !this.panicLevel )
                    action = '^';
            } else if ( action=='#' ) {
                if ( beforeChar!=' ' ) {
                    action = '^';
                    beforeChar = c;
                    continue;
                }
            } else if ( action=='@' ) {
                action = '^';
                if ( beforeChar!=' ' ) {
                    beforeChar = c;
                    continue;
                }
            }
            beforeChar = c;
            beforeClass = afterClass;
            if ( action!='^' )
                break;
        }
        if ( action=='^' && i<textContent.length )
            action = '!';
        this.action = action;
        this.trailingSpace = prevChar==' ' || prevClass==16 ? prevChar : null;
        this.beforeChar = beforeChar;
        this.beforeClass = beforeClass;
        return i;
    },

    dup: function() {
        var copy = new LineBreaker;
        copy.trailingSpace = null;
        copy.beforeChar = this.beforeChar;
        copy.beforeClass = this.beforeClass;
        copy.panicLevel = this.panicLevel;
    }
};

var mandatoryBreak = /\x0D\x0A|[\x0A-\x0D\x85\u2028\u2029]/g;

function layoutTextInAnArea( g2, futureParent ) {
    var telem, tidx, textContent, x=0, y=0, textAttr={ }, fontSize;

    checkClassLookup();
    for ( var textArea=g2.firstElementChild; textArea; textArea=textArea.nextElementSibling )
        if ( textArea.localName=='textArea' )
            break;
    if ( !textArea )
        return 0;

    var lineIncrement = parseFloat( textArea.getAttribute( 'line-increment' ) );
    if ( isNaN(lineIncrement) || lineIncrement < 0 )
        lineIncrement = -1;

    for ( var g=textArea; g && g.nodeType==1; g=g.parentNode ) {
        fontSize = parseFloat( g.getAttribute( 'font-size' ) );
        if ( !isNaN(fontSize) && fontSize>=0 )
            break;
    }
    if ( isNaN(fontSize) || fontSize < 0 )
        fontSize = -1;
    var textAlign = textArea.getAttribute( 'text-align' ) || 'start';
    var displayAlign = textArea.getAttribute( 'display-align' ) || 'before';
    var width = parseFloat(textArea.getAttribute( 'width' ));
    if ( isNaN(width) || width<0 )
        width = -1;
    var height = parseFloat(textArea.getAttribute( 'height' ));
    if ( isNaN(height) || height<0 )
        height = -1;
    var gg = textArea.nextElementSibling;
    if ( !gg || gg.localName!='g' )
        return 0;
    var g3 = gg.firstElementChild;
    if ( g3 )
        gg.removeChild( g3 );
    for ( var i=0; i<textProps.length; i++ ) {
        var av = textArea.getAttribute( textProps[i] );
        if ( av!==null && av!=='' )
            textAttr[ textProps[i] ] = av;
    }
    gg.setAttribute( 'transform', textArea.getAttribute( 'transform' ) || '' );
    g3 = jSignage._createElement( 'g', textAttr );
    (futureParent || gg).appendChild( g3 );

    for ( telem=textArea.firstElementChild; telem; telem=telem.nextElementSibling )
        if ( telem.localName=='tspan' || telem.localName=='tbreak' )
            break;
    tidx = 0;
    textContent = telem && telem.localName=='tspan' ? telem.textContent : '\n';

    while ( telem ) {   // Loop over the lines
        var maxFontSize = -1, t2=null, text=null, bbox, wrapped=false;
        if ( telem.localName=='tspan' ) {
            text = document.createElementNS( jSignage.svgNS, 'text' );
            g3.appendChild( text );
            t2 = telem.cloneNode(false);
            text.appendChild( t2 );
        }
        var lineBreaker = new LineBreaker();
        var rollback = {
            t2: t2,
            t2Content: '',
            lineBreaker: new LineBreaker(),
            telem: telem,
            textContent: textContent,
            tidx: tidx,
            sol: true,
            maxFontSize: maxFontSize
        };
  
        while ( !wrapped ) {   // Loop over the tspans
            if ( telem ) {
                if ( width<0 ) {
                    while ( rollback.sol && tidx < textContent.length ) {
                        if ( textContent.charAt(tidx)==' ' || lookupClass( textContent.charAt(tidx) )==16 )
                            ++tidx;
                        else
                            rollback.sol = false;
                    }
                    mandatoryBreak.lastIndex = tidx;
                    var ex = mandatoryBreak.exec( textContent );
                    if ( ex ) {
                        breakIdx = mandatoryBreak.lastIndex;
                        lineBreaker.action = '!';
                    } else {
                        breakIdx = textContent.length;
                    }
                } else {
                    breakIdx =  lineBreaker.findBrk( textContent, tidx );
                }
                if ( breakIdx > tidx ) {
                    var fs = parseFloat( telem.getAttribute( 'font-size' ) ), breakIdx;
                    if ( isNaN(fs) || fs<0 )
                        fs = fontSize;
                    if ( fs>=0 && ( maxFontSize<0 || fs>maxFontSize ) )
                        maxFontSize = fs;
                }
            }
            if ( !telem || breakIdx<textContent.length ) {
                if ( telem )
                    t2.textContent += textContent.substring( tidx, lineBreaker.trailingSpace===null ? breakIdx : breakIdx-1 );
                bbox = text.getBBox();
                if ( width>=0 && bbox.width > width-2 ) {
                    if ( rollback.t2 ) for ( var tt=rollback.t2.nextElementSibling; tt; tt=tt.nextElementSibling )
                        text.removeChild( tt );
                    t2 = rollback.t2;
                    if ( t2 )
                        t2.textContent = rollback.t2Content;
                    lineBreaker = rollback.lineBreaker;
                    telem = rollback.telem;
                    textContent = rollback.textContent;
                    tidx = rollback.tidx;
                    maxFontSize = rollback.maxFontSize;
                    if ( rollback.sol ) {
                        if ( ++lineBreaker.panicLevel==3 ) {
                            if ( t2 )
                                text.removeChild( t2 );
                            if ( futureParent ) {
                                futureParent.removeChild( g3 );
                                gg.appendChild( g3 );
                            }
                            return y;
                        }
                    } else {
                        wrapped = true;
                    }
                } else {
                    if ( !telem || lineBreaker.action=='!' ) {
                        wrapped = true;
                        tidx = breakIdx;
                    } else {
                        rollback.t2 = t2;
                        rollback.t2Content = t2.textContent;
                        rollback.lineBreaker = lineBreaker.dup();
                        rollback.telem = telem;
                        rollback.textContent = textContent;
                        rollback.tidx = breakIdx;
                        rollback.maxFontSize = maxFontSize;
                        rollback.sol = false;
                        if ( lineBreaker.trailingSpace!==null && breakIdx==0 )
                            t2.previousElementSibling.textContent += lineBreaker.trailingSpace;
                        if ( lineBreaker.trailingSpace===null || breakIdx==0 ) {
                            if ( lineBreaker.beforeChar!='\xAD' )
                                t2.textContent += lineBreaker.beforeChar;
                        } else if ( lineBreaker.beforeChar=='\xAD' ) {
                            t2.textContent += lineBreaker.trailingSpace;
                        } else {
                            t2.textContent += lineBreaker.trailingSpace + lineBreaker.beforeChar;
                        }
                        tidx = breakIdx+1;
                    }
                }
            } else {
                if ( lineBreaker.action=='!' )
                    wrapped = true;
                if ( t2 )
                    t2.textContent += textContent.substring( tidx, lineBreaker.trailingSpace===null ? breakIdx : breakIdx-1 );
                tidx = textContent.length;
            }
            if ( telem && tidx >= textContent.length ) {
                for ( telem=telem.nextElementSibling; telem; telem=telem.nextElementSibling )
                    if ( ( telem.localName=='tspan' && telem.textContent.length>0 ) || telem.localName=='tbreak' )
                        break;
                if ( telem ) {
                    if ( telem.localName=='tspan' ) {
                        t2 = telem.cloneNode(false);
                        text.appendChild( t2 );
                        textContent = telem.textContent;
                    } else {
                        t2 = null;
                        textContent = '\n';
                    }
                } else {
                    t2 = null;
                    textContent = '';
                }
                tidx = 0;
            }
        }
        var prevY = y;
        y += lineIncrement>=0 ? lineIncrement : maxFontSize>=0 ? maxFontSize*1.1 : bbox.height*1.1;
        if ( height>=0 && y>height ) {
            g3.removeChild( text );
            y = prevY;
            break;
        }
        if ( text ) {
            text.setAttribute( 'y', y );
            if ( width>=0 ) {
                text.setAttribute( 'x', textAlign=='end' ? width-1 : textAlign=='center' ? width/2 : 1 );
                text.setAttribute( 'text-anchor', textAlign=='end' ? 'end' : textAlign=='center' ? 'middle' : 'start' );
            } else {
                text.setAttribute( 'x', 0 );
                text.setAttribute( 'text-anchor', 'start' );
                bbox = text.getBBox();
                if ( bbox.width > x )
                    x = bbox.width;
            }
        }
    }
    if ( futureParent )
        futureParent.removeChild( g3 );
    if ( height>=0 ) {
        if ( displayAlign=='after' )
            g3.setAttribute( 'transform', 'translate(0,'+ (height-y) +')' );
        else if ( displayAlign=='center' )
            g3.setAttribute( 'transform', 'translate(0,'+ (height-y)/2 +')' );
    }
    if ( futureParent )
        gg.appendChild( g3 );
    return width>=0 ? y : x+2;
}

var mediaViewportAttr = [ 'x', 'y', 'width', 'height' ];

function createXHTMLObject( width, height, type, data, params ) {
    var object = document.createElementNS( jSignage.xhtmlNS, 'object' );
    if ( !isNaN(width) )
        object.setAttribute( 'width', width );
    if ( !isNaN(height) )
        object.setAttribute( 'height', height );
    if ( type )
        object.setAttribute( 'type', type );
    if ( data )
        object.setAttribute( 'data', data );
    for ( var name in params ) {
        var param = document.createElementNS( jSignage.xhtmlNS, 'param' );
        param.setAttribute( 'name', name );
        param.setAttribute( 'value', params[name] );
        object.appendChild( param );
    }
    return object;
}

function media_error( timingElement, media ) {
    jSignage.endLayerAt( timingElement );
}

function media_ended( timingElement, media ) {
    if ( timingElement.getAttribute( 'dur' )=='media' )
        jSignage.endLayerAt( timingElement );
}

function media_dur( timingElement, media, dur ) {
    jSignage.setLayerMediaDur( timingElement, dur );
}

function realizeMedia( timingElement, media ) {
    var name = media.localName;
    var g = document.createElementNS( jSignage.svgNS, 'g' ), i, v;
    var audioLevel = parseFloat( media.getAttribute( 'audio-level' ) );
    var src = media.getAttributeNS( jSignage.xlinkNS, 'href' );
    var ext = /.([^.]+)$/.exec( src );
    if ( ext ) ext = ext[1];
    if ( name=='audio' ) {
        if ( jSignage.features.HTML5Audio && jSignage.features.HTML5Audio[ext] ) {
            var audio = new Audio( src );
            g.appendChild( audio );
            if ( !isNaN(audioLevel) )
                audio.volume = audioLevel;
            audio.addEventListener( 'error', function() { timingElement, media_error( media ); }, false);
            audio.addEventListener( 'ended', function() { timingElement, media_ended( media ); }, false);
            audio.addEventListener( 'durationchange', function() { media_dur( timingElement, media, audio.duration ); }, false);
            audio.play();
        } else if ( jSignage.features.QuickTime ) {
            var params = {
                kioskmode: 'true',
                controller: 'false',
                autoplay: 'true',
                enablejavascript: 'true',
                postdomevents: 'true'
            };
            if ( !isNaN(audioLevel) )
                params.volume = audioLevel*100;
            if ( autoRepeat )
                params.loop = 'true';
            var movie = createXHTMLObject( width, height, 'video/quicktime', src, params );
            movie.addEventListener( 'qt_error', function() { media_error( timingElement, media ); }, false);
            movie.addEventListener( 'qt_ended', function() { media_ended( timingElement, media ); }, false);
            movie.addEventListener( 'qt_durationchange', function() { media_dur( timingElement, media, movie.GetDuration()/movie.GetTimeScale() ); }, false);
            g.appendChild( movie );
        }
    } else {
        v = media.getAttribute( 'opacity' );
        if ( v!==null && v!=='' )
            g.setAttribute( 'opacity', v );
        var width = parseFloat( media.getAttribute( 'width' ) );
        var height = parseFloat( media.getAttribute( 'height' ) );
        var autoRepeat = media.getAttribute( 'repeatCount' ) || media.getAttribute( 'repeatCount' );
        var viewportFill = media.getAttribute( 'viewport-fill' );
        if ( jSignage.features.MSIE ) {
            var x = parseFloat( media.getAttribute( 'x' ) );
            var y = parseFloat( media.getAttribute( 'y' ) );
            if ( isNaN(x) ) x=0;
            if ( isNaN(y) ) y=0;
            if ( isNaN(width) ) width=640;
            if ( isNaN(height) ) height=360;
            var u = Math.min(width,height) / 90;
            g.setAttribute( 'transform', 'translate('+x+','+y+')' );
            g.appendChild( jSignage._createElement( 'rect', {
                fill: viewportFill || 'black',
                stroke: 'none',
                width: width,
                height: height
            }));
            g.appendChild( jSignage._createElement( 'circle', {
                fill: '#808080',
                'fill-opacity': 0.5,
                stroke: '#C0C0C0',
                'stroke-width': u,
                cx: width/2,
                cy: height/2,
                r: 15*u
            }));
            g.appendChild( jSignage._createElement( 'polygon', {
                fill: '#C0C0C0',
                stroke: 'none',
                points: [
                    width/2-u*5, height/2-u*10,
                    width/2+u*10, height/2,
                    width/2-u*5, height/2+u*10
                ].join( ' ' )
            }));
            g.appendChild( jSignage._createElement( 'path', {
                fill: 'none',
                stroke: '#C0C0C0',
                'stroke-width': u,
                d: new jSignage.pathData()
                    .moveTo( width/2 - u*40, height/2 - u*25 )
                    .lineTo( width/2 + u*40, height/2 - u*25 )
                    .lineTo( width/2 + u*40, height/2 + u*25 )
                    .lineTo( width/2 - u*40, height/2 + u*25 )
                    .close()
                    .moveTo( width/2, height/2 - u*25 )
                    .lineTo( width/2-u*10, height/2 - u*40 )
                    .moveTo( width/2, height/2 - u*25 )
                    .lineTo( width/2+u*10, height/2 - u*40 )
                    .toString()
            }));
            media_dur( timingElement, media, 5 );
        } else {
            if ( viewportFill!==null && viewportFill!=='' ) {
                var bg = jSignage._createElement( 'rect', { fill: viewportFill, stroke: 'none' } );
                for ( i=0; i<mediaViewportAttr.length; i++ ) {
                    v = media.getAttribute( mediaViewportAttr[i] );
                    if ( v!==null && v!=='' )
                        bg.setAttribute( mediaViewportAttr[i], v );
                }
                g.appendChild( bg );
            }
            var fo = document.createElementNS( jSignage.svgNS, 'foreignObject' );
            for ( i=0; i<mediaViewportAttr.length; i++ ) {
                v = media.getAttribute( mediaViewportAttr[i] );
                if ( v!==null && v!=='' )
                    fo.setAttribute( mediaViewportAttr[i], v );
            }
            g.appendChild( fo );
            var body = document.createElementNS( jSignage.xhtmlNS, 'body' );
            body.setAttribute( 'style', 'margin: 0' );
            fo.appendChild( body );
            if ( name=='animation' ) {
                var iframe = document.createElementNS( jSignage.xhtmlNS, 'iframe' );
                if ( !isNaN(width) )
                    iframe.width = width;
                if ( !isNaN(height) )
                    iframe.height = height;
                iframe.frameBorder = '0';
                iframe.scrolling = 'no';
                iframe.src = src;
                body.appendChild( iframe );
            } else if ( name=='video' ) {
                if ( !jSignage.features.QuickTime && !jSignage.features.WMPlayer && jSignage.features.HTML5Video && !jSignage.features.HTML5Video[ext] && jSignage.features.HTML5Video.webm ) {
                    src += '.webm';
                    ext = 'webm';
                }            
                if ( jSignage.features.HTML5Video && jSignage.features.HTML5Video[ext] ) {
                    var video = document.createElementNS( jSignage.xhtmlNS, 'video' );
                    if ( !isNaN(width) )
                        video.width = width;
                    if ( !isNaN(height) )
                        video.height = height;
                    if ( !isNaN(audioLevel) )
                        video.volume = audioLevel;
                    video.loop = !!autoRepeat;
                    video.controls = false;
                    video.autoplay = true;
                    video.src = src;
                    video.addEventListener( 'error', function() { media_error( timingElement, media ); }, false );
                    video.addEventListener( 'ended', function() { media_ended( timingElement, media ); }, false);
                    video.addEventListener( 'durationchange', function() { media_dur( timingElement, media, video.duration ); }, false);
                    body.appendChild( video );
                } else if ( jSignage.features.QuickTime ) {
                    var params = {
                        kioskmode: 'true',
                        controller: 'false',
                        autoplay: 'true',
                        enablejavascript: 'true',
                        postdomevents: 'true',
                        scale: media.getAttribute( 'preserveAspectRatio' )=='none' ? 'tofit' : 'aspect'
                    };            
                    if ( !isNaN(audioLevel) )
                        params.volume = audioLevel*100;
                    if ( autoRepeat )
                        params.loop = 'true';
                    var movie = createXHTMLObject( width, height, 'video/quicktime', src, params );
                    movie.addEventListener( 'qt_error', function() { media_error( timingElement, media ); }, false);
                    movie.addEventListener( 'qt_ended', function() { media_ended( timingElement, media ); }, false);
                    movie.addEventListener( 'qt_durationchange', function() { media_dur( timingElement, media, movie.GetDuration()/movie.GetTimeScale() ); }, false);
                    body.appendChild( movie );
                } else if ( jSignage.features.WMPlayer ) {
                    var params = {
                        uiMode : 'none',
                        autoStart: 'true',
                        stretchToFit: 'true',
                        sendPlayStateChangeEvents: 'true'
                    };
                    if ( !isNaN(audioLevel) )
                        params.volume = audioLevel*100;
                    if ( autoRepeat )
                        params.loop = 'true';
                    var movie = createXHTMLObject( width, height, 'application/x-ms-wmp', src, params );
                    movie.addEventListener( 'Error', function() { media_error( timingElement, media ); }, false );
                    movie.addEventListener( 'MediaError', function() { media_error( timingElement, media ); }, false );
                    movie.addEventListener( 'EndOfStream', function() { media_ended( timingElement, media ); }, false);
                    movie.addEventListener( 'OpenStateChange', function() {
                        if ( movie.openState==13 )
                            media_dur( timingElement, media, movie.currentMedia.duration );
                    }, false);
                    body.appendChild( movie );
                }
            }
        }
    }
    media.parentNode.insertBefore( g, media.nextElementSibling );
}

function unrealizeMedia( media ) {
    var fo = media.nextElementSibling;
    if ( fo && fo.localName=='g' )
        media.parentNode.removeChild( fo );
}

jSignage.extend({

    g: function( args ) {
        var layer = jSignage.customLayer( 'group', args, null, function( width, height, x, y, bbw, bbh, parent ) {
            for ( var child=jSignage.getG2(this).firstElementChild; child!=null; child=child.nextElementSibling )
                if ( child.localName!='set' && child.localName!='animate' )
                    jSignage._calcLayout( child, width, height, 0, parent );
        });
        var attr = { };
        jSignage.copyProps( args, attr, shapeProps );
        jSignage.setAttributes( layer.g2(), attr );
        return layer;
    },

    textArea: function( attr, layerType, postLayoutCallback ) {
        var textAreaAttr = { 'text-align': 'center', 'display-align': 'center', fill: 'black' }, layer;
        jSignage.copyProps( attr, textAreaAttr, textAreaProps );
        var textArea = jSignage._createElement( 'textArea', textAreaAttr );
        if ( jSignage.features.textArea && ( !attr || !attr.noTextArea ) ) {
            if ( layerType || attr && ( attr.fontSize==='max' || attr.frame ) ) {
                layer = jSignage.customLayer( layerType || 'textArea', attr, null, function( width, height, x, y, bbw, bbh, parent ) {
                    textArea.setAttribute( 'width', width );
                    textArea.setAttribute( 'height', height );
                    if ( attr && attr.fontSize==='max' ) {
                        textArea.setAttribute( 'font-size', height );
                        textArea.setAttribute( 'line-increment', height/1.2 );
                    }
                    if ( postLayoutCallback )
                        postLayoutCallback.call( this, textArea, width, height, x, y, bbw, bbh, parent );
                });
                layer.g2().appendChild( textArea );
            } else {
                jSignage.setViewportAttr( textArea, attr );
                jSignage.addSetForTiming( textArea, attr );
                layer = jSignage( textArea );
            }
        } else {
            textArea.setAttribute( 'display', 'none' );
            layer = jSignage.customLayer( layerType || 'textArea', attr, null, function( width, height, x, y, bbw, bbh, parent ) {
                textArea.setAttribute( 'width', width );
                textArea.setAttribute( 'height', height );
                if ( attr && attr.fontSize==='max' ) {
                    textArea.setAttribute( 'font-size', height );
                    textArea.setAttribute( 'line-increment', height/1.2 );
                }
                if ( postLayoutCallback )
                    postLayoutCallback.call( this, textArea, width, height, x, y, bbw, bbh, parent );
                layoutTextInAnArea( this, parent );
            });
            var g2 = layer.g2();
            g2.appendChild( textArea );
            g2.appendChild( jSignage._createElement( 'g' ) );
        }
        return layer;
    },

    getGG: function( textArea ) {
        if ( jSignage.features.textArea )
            return textArea;
        var gg = textArea.nextElementSibling;
        if ( !gg || gg.localName!='g' )
            return null;
        return gg;
    },

    getTextAreaHeight: function( textArea, futureParent ) {
        var textHeight = 0;
        var oldHeight = textArea.getAttribute( 'height' );
        textArea.setAttribute( 'height', 'auto' );
        if ( jSignage.features.textArea ) {
            if ( futureParent ) {
                var oldParent = textArea.parentNode, oldPlace = textArea.nextElementSibling;
                futureParent.appendChild( textArea );
            }
            var bbox = textArea.getBBox();
            if ( bbox )
                textHeight = bbox.height;
            if ( futureParent ) {
                futureParent.removeChild( textArea );
                if ( oldParent )
                    oldParent.insertBefore( textArea, oldPlace );
            }
        } else {
            textHeight = layoutTextInAnArea( textArea.parentNode, futureParent );
        }
        textArea.setAttribute( 'height', oldHeight );
        return textHeight;
    },

    getTextAreaWidth: function( textArea, futureParent ) {
        var textWidth = 0;
        var oldWidth = textArea.getAttribute( 'width' );
        textArea.setAttribute( 'width', 'auto' );
        if ( jSignage.features.textArea ) {
            if ( futureParent ) {
                var oldParent = textArea.parentNode, oldPlace = textArea.nextElementSibling;
                futureParent.appendChild( textArea );
            }
            var bbox = textArea.getBBox();
            if ( bbox )
                textWidth = bbox.width;
            if ( futureParent ) {
                futureParent.removeChild( textArea );
                if ( oldParent )
                    oldParent.insertBefore( textArea, oldPlace );
            }
        } else {
            textWidth = layoutTextInAnArea( textArea.parentNode, futureParent );
        }
        textArea.setAttribute( 'width', oldWidth );
        return textWidth;
    },

    getPercent: function( val, def ) {
        if ( def===undefined )
            def=0;
        if ( val===undefined || val===null )
            return def;
        val = val+'';
        var r = parseFloat( val );
        if ( isNaN(r) )
            return def;
        if ( val.charAt(val.length-1)=='%' )
            r /= 100;
        return r;
    },

    _appendStops: function( gradient, stops ) {
        for ( var i=0; i<stops.length; i++ ) {
            var s = stops[i];
            var stop = jSignage._createElement( 'stop', { offset: s.offset, 'stop-color': s.color } );
            if ( 'opacity' in s )
                stop.setAttribute( 'stop-opacity', s.opacity );
            gradient.appendChild( stop );
        }
    },

    _linearGradient: function( args ) {
        var gradient = jSignage._createElement( 'linearGradient', {
            gradientUnits: args.gradientUnits || 'userSpaceOnUse',
            x1: args.x1 || 0,
            y1: args.y1 || 0,
            x2: args.x2 || 0,
            y2: args.y2 || 0
        } );
        gradient.id = args.id || jSignage.guuid();
        jSignage._appendStops( gradient, args.stops || [ ] );
        return gradient;
    },

    linearGradient: function( args ) {
        return jSignage( jSignage._linearGradient( args ) );
    },

    _radialGradient: function( args ) {
        var gradient = jSignage._createElement( 'radialGradient', {
            gradientUnits: args.gradientUnits || 'userSpaceOnUse',
            cx: args.cx || 0,
            cy: args.cy || 0,
            r: args.r || 0
        });
        gradient.id = args.id || jSignage.guuid();
        jSignage._appendStops( gradient, args.stops || [ ] );
        return gradient;
    },

    radialGradient: function( args ) {
        return jSignage( jSignage._radialGradient( args ) );
    },

    _solidColor: function( color, opacity ) {
        if ( opacity===undefined ) opacity = 1;
        var solidColor = jSignage._createElement( 'solidColor', { 'solid-color': color, 'solid-opacity': opacity } );
        solidColor.id = jSignage.guuid();
        return solidColor;
    },

    solidColor: function( color, opacity ) {
        return jSignage( jSignage._solidColor( color, opacity ) );
    },

    _makeShape: function( name, attr, args ) {
        jSignage.copyProps( args, attr, shapeProps );
        var elem = jSignage._createElement( name, attr );
        elem.id = args && args.id ? args.id : jSignage.guuid();
        return jSignage( elem );
    },

    _findSMILContainer: function( elem ) {
        for( ancestor=elem; ancestor!=null; ancestor=ancestor.parentNode ) {
            var real = jSignage.getRealMediaTarget(ancestor);
            if ( jSignage.isLayer( real ) )
                return jSignage.getTimingElement( real );
        }
        return null;
    },

    _addAnimate: function( target, name, attributeName, args, args2 ) {
        var attr = { }, trigger;
        if ( args.values ) attr.values = args.values.join( ';' );
        if ( args.keyTimes ) attr.keyTimes = args.keyTimes.join( ';' );
        if ( args.keySplines ) attr.keySplines = args.keySplines.join( ';' );
        if ( attributeName )
            attr.attributeName = attributeName;
        jSignage.copyProps( args, attr, animateProps );
        if ( args2 ) for ( var key in args2 ) attr[key] = args2[key];
        if ( args.begin=='indefinite' ) {
            attr.begin = 'indefinite';
        } else {
            var timingElement = jSignage._findSMILContainer( target );
            if ( timingElement )
                attr.begin = jSignage.triggerWithOffset( timingElement.id+'.begin', jSignage.durInSeconds( attr.begin, 0 ) );
            else
                attr.begin = args.begin || 'indefinite';
        }
        jSignage.svgAnimation( target, name, attr );
    },

    rect: function( args ) {
        var attr = {
            x: args.x || 0,
            y: args.y || 0,
            width: args.width || 0,
            height: args.height || 0
        };
        if ( args.rx ) attr.rx=args.rx;
        if ( args.ry ) attr.ry=args.ry;
        return jSignage._makeShape( 'rect', attr, args );
    },

    circle: function( args ) {
        return jSignage._makeShape( 'circle', {
            cx: args.cx || 0,
            cy: args.cy || 0,
            r: args.r || 0
        }, args );
    },

    ellipse: function( args ) {
        return jSignage._makeShape( 'ellipse', {
            cx: args.cx || 0,
            cy: args.cy || 0,
            rx: args.rx || 0,
            ry: args.ry || 0
        }, args );
    },

    line: function( args ) {
        return jSignage._makeShape( 'line', {
            x1: args.x1 || 0,
            y1: args.y1 || 0,
            x2: args.x2 || 0,
            y2: args.y2 || 0
        }, args );
    },

    polyline: function( args ) {
        return jSignage._makeShape( 'polyline', {
            points: args.points && args.points.join( ' ' ) || ''
        }, args );
    },

    polygon: function( args ) {
        return jSignage._makeShape( 'polygon', {
            points: args.points && args.points.join( ' ' ) || ''
        }, args );
    },

    path: function( args ) {
        var attr = {
            d: args.d || ''
        };
        if ( args.pathLength!==undefined )
            attr.pathLength = args.pathLength;
        return jSignage._makeShape( 'path', attr, args );
    },

    _mkanti: function( shape, corners, rx, ry, x, y, width, height ) {
        var anti = [], da = [], i;
        if ( shape=='round' ) {
            i = 0;
            if ( !corners || corners[i]=='topLeft' ) {
                da.push( new jSignage.pathData().moveTo( x, y+ry ).arcTo( rx, ry, 0, 0, 1, x+rx, y ).lineTo( x, y ).close() );
                ++i;
            }
            if ( !corners || corners[i]=='topRight' ) {
                da.push( new jSignage.pathData().moveTo( x+width-rx, y ).arcTo( rx, ry, 0, 0, 1, x+width, y+ry ).lineTo( x+width, y ).close() );
                ++i;
            }
            if ( !corners || corners[i]=='bottomRight' ) {
                da.push( new jSignage.pathData().moveTo( x+width, y+height-ry ).arcTo( rx, ry, 0, 0, 1, x+width-rx, y+height ).lineTo( x+width, y+height ).close() );
                ++i;
            }
            if ( !corners || corners[i]=='bottomLeft' )
                da.push( new jSignage.pathData().moveTo( x+rx, y+height ).arcTo( rx, ry, 0, 0, 1, x, y+height-ry ).lineTo( x, y+height ).close() );
        } else if ( shape=='snip' ) {
            i = 0;
            if ( !corners || corners[i]=='topLeft' ) {
                da.push( new jSignage.pathData().moveTo( x, y+ry ).lineTo( x+rx, y ).lineTo( x, y ).close() );
                ++i;
            }
            if ( !corners || corners[i]=='topRight' ) {
                da.push( new jSignage.pathData().moveTo( x+width-rx, y ).lineTo( x+width, y+ry ).lineTo( x+width, y ).close() );
                ++i;
            }
            if ( !corners || corners[i]=='bottomRight' ) {
                da.push( new jSignage.pathData().moveTo( x+width, y+height-ry ).lineTo( x+width-rx, y+height ).lineTo( x+width, y+height ).close() );
                ++i;
            }
            if ( !corners || corners[i]=='bottomLeft' )
                da.push( new jSignage.pathData().moveTo( x+rx, y+height ).lineTo( x, y+height-ry ).lineTo( x, y+height ).close() );
        }
        for ( i=0; i<da.length; i++ )
            anti.push( jSignage._createElement( 'path', { d: da[i].toString() } ) );
        return anti;
    },

    _mksoft: function( shape, corners, rx, ry, x, y, width, height, thickness, colorIn, colorOut, opacityIn, opacityOut, nocorner ) {
        var g = jSignage._createElement( 'g', {
            transform: 'translate('+x+','+y+')',
            stroke: 'none'
        });
        if ( shape=='square' ) {
            shape = 'round';
            corners = [ ];
        }
        var xtl, ytl, xtr, ytr, xbr, ybr, xbl, ybl, i=0;
        if ( !corners || corners[i]=='topLeft' ) { xtl = rx; ytl = ry; ++i; } else xtl = ytl = nocorner;
        if ( !corners || corners[i]=='topRight' ) { xtr = rx; ytr = ry; ++i; } else xtr = ytr = nocorner;
        if ( !corners || corners[i]=='bottomRight' ) { xbr = rx; ybr = ry; ++i; } else xbr = ybr = nocorner;
        if ( !corners || corners[i]=='bottomLeft' ) { xbl = rx; ybl = ry; ++i; } else xbl = ybl = nocorner;

        var tp = thickness*0.05;

        function line( x1, y1, x2, y2, gx1, gy1, gx2, gy2 ) {
            var gr = jSignage._linearGradient({ x1: gx1, y1: gy1, x2: gx2, y2: gy2, stops: [
                { offset: 0, color: colorIn, opacity: 0 },
                { offset: 0, color: colorIn, opacity: opacityIn },
                { offset: 1, color: colorOut, opacity: opacityOut }
            ]});
            g.appendChild( gr );
            g.appendChild( jSignage._createElement( 'line', { x1: x1, y1: y1, x2: x2, y2: y2, fill: 'none', 'stroke-width': thickness*1.1, stroke: 'url(#'+gr.id+')' } ) );
        }

        function quad( x1, y1, x2, y2, x3, y3, x4, y4, gx1, gy1, gx2, gy2 ) {
            var gr = jSignage._linearGradient({ x1: gx1, y1: gy1, x2: gx2, y2: gy2, stops: [
                { offset: 0, color: colorIn, opacity: 0 },
                { offset: 0, color: colorIn, opacity: opacityIn },
                { offset: 1, color: colorOut, opacity: opacityOut }
            ]});
            g.appendChild( gr );
            g.appendChild( jSignage._createElement( 'path', {
                d: 'M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2 + 'L' + x3 + ' ' + y3 + 'L' + x4 + ' ' + y4 + 'Z',
                stroke: 'none',
                fill: 'url(#'+gr.id+')'
            } ) );
        }

        function arc( tx, ty, sx, sy, rxi, ryi, rxo, ryo ) {
            if ( rxo<=0 || ryo<=0 )
                return;
            var r = ( rxo+ryo)/2, gr;
            if ( r <= thickness ) {
                gr = jSignage._radialGradient({ cx: 0, cy: 0, r: thickness, stops: [
                    { offset: 0, color: colorIn, opacity: opacityIn },
                    { offset: 1, color: colorOut, opacity: opacityOut }
                ]});
            } else {
                gr = jSignage._radialGradient({ cx: 0, cy: 0, r: r, stops: [
                    { offset: 0, color: colorIn, opacity: 0 },
                    { offset: (r-thickness)/r, color: colorIn, opacity: 0 },
                    { offset: (r-thickness)/r, color: colorIn, opacity: opacityIn },
                    { offset: 1, color: colorOut, opacity: opacityOut }
                ]});
            }
            g.appendChild( gr );
            var d;
            if ( rxi < rxo && ryi < ryo ) {
                d  = 'M ' + rxi + ' 0 L ' + rxo + ' 0';
                d += 'A ' + rxo + ' ' + ryo + ' 0 0 1 0 ' + ryo;
                d += 'L 0 ' + ryi;
                d += 'A ' + rxi + ' ' + ryi + ' 0 0 0 ' + rxi + ' 0';
                d += 'Z';
            } else {
                d  = 'M 0 0 L ' + Math.max(rxi,rxo)*1.05 + ' 0 ' + Math.max(rxi,rxo)*1.05 + ' ' + Math.max( ryi-ryo, 0 );
                d += 'A ' + (rxo+Math.max(rxi,rxo)*.05) + ' ' + (ryo+Math.max(ryi,ryo)*.05) + ' 0 0 1 ' + Math.max( rxi-rxo, 0 ) + '  ' + Math.max(ryi,ryo)*1.05;
                d += 'L 0 ' + Math.max(ryi,ryo)*1.05;
                d += 'Z';
            }
            g.appendChild( jSignage._createElement( 'path', {
                transform: 'matrix(' + sx + ' 0 0 ' + sy + ' ' + tx + ' ' + ty + ')',
                d:  d,
                stroke: 'none',
                fill: 'url(#'+gr.id+')'
            } ) );
        }
        
        function trix( rx, ry ) {
            if ( rx==0 && ry==0 )
                return 0;
            var t2 = (ry*ry)/(rx*rx);
            return rx - thickness*( -Math.sqrt(t2/(1+t2 )) + ( 1 - Math.sqrt(1/(1 +t2)) )*rx/ry );
        }

        var xpx = jSignage.getDevicePixelSize( false ) / 2 , ypx = jSignage.getDevicePixelSize( true ) / 2;
        if ( shape=='round' ) {
            var xth = thickness / 2, yth = thickness / 2;
            var XTL = xtl ? Math.max( xtl, thickness*1.05 ) : 0, YTL = ytl ? Math.max( ytl, thickness*1.05 ) : 0;
            var XTR = xtr ? Math.max( xtr, thickness*1.05 ) : 0, YTR = ytr ? Math.max( ytr, thickness*1.05 ) : 0;
            var XBL = xbl ? Math.max( xbl, thickness*1.05 ) : 0, YBL = ybl ? Math.max( ybl, thickness*1.05 ) : 0;
            var XBR = xbr ? Math.max( xbr, thickness*1.05 ) : 0, YBR = ybr ? Math.max( ybr, thickness*1.05 ) : 0;
            arc( XTL, YTL, -1, -1, XTL, YTL, xtl, ytl );
            line( XTL-xpx, yth, width-XTR+xpx, yth, 0, thickness, 0, 0 );
            arc( width-XTR, YTR, 1, -1, XTR, YTR, xtr, ytr );
            line( width-xth, YTR-ypx, width-xth, height-YBR+ypx, width-thickness, 0, width, 0 );
            arc( width-XBR, height-YBR, 1, 1, XBR, YBR, xbr, ybr );
            line( width-XBR+xpx, height-yth, XBL-xpx, height-yth, 0, height-thickness, 0, height );
            arc( XBL, height-YBL, -1, 1, XBL, YBL, xbl, ybl );
            line( xth, height-YBL+ypx, xth, YTL-ypx, thickness, 0, 0, 0 );
        } else if ( shape=='snip' ) {
            var xth = thickness*1.05, yth = thickness*1.05, trx=trix(rx,ry)-rx;
            var n = Math.sqrt(trx*trx+thickness*thickness) / Math.sqrt(rx*rx+ry*ry), rxn=rx*n, ryn=ry*n;
            var ixtl = Math.max( trix( xtl, ytl ), thickness+tp ), iytl = Math.max( trix( ytl, xtl ), thickness+tp );
            var ixtr = Math.max( trix( xtr, ytr ), thickness+tp ), iytr = Math.max( trix( ytr, xtr ), thickness+tp );
            var ixbl = Math.max( trix( xbl, ybl ), thickness+tp ), iybl = Math.max( trix( ybl, xbl ), thickness+tp );
            var ixbr = Math.max( trix( xbr, ybr ), thickness+tp ), iybr = Math.max( trix( ybr, xbr ), thickness+tp );
            quad( -tp, ytl, thickness+tp, iytl, ixtl, thickness+tp, xtl, -tp, xtl+rxn, ryn, xtl, 0 );
            quad( xtl-xpx, -tp, width-xtr+xpx, -tp, width-ixtr+xpx, thickness+tp, ixtl-xpx, thickness+tp, xtl, thickness, xtl, 0 );
            quad( width-xtr, -tp, width-ixtr, thickness+tp, width-thickness-tp, iytr, width+tp, ytr, width-rxn, ytr+ryn, width, ytr );
            quad( width-thickness-tp, iytr-ypx, width+tp, ytr-ypx, width+tp, height-ybr+ypx, width-thickness-tp, height-iybr+ypx, width-thickness, ytr, width, ytr );
            quad( width+tp, height-ybr, width-thickness-tp, height-iybr, width-ixbr, height-thickness-tp, width-xbr, height+tp, width-xbr-rxn, height-ryn, width-xbr, height );
            quad( width-ixbr+xpx, height-thickness-tp, width-xbr+xpx, height+tp, xbl-xpx, height+tp, ixbl-xpx, height-thickness-tp, xbl, height-thickness, xbl, height );
            quad( xbl, height+tp, ixbl, height-thickness-tp, thickness+tp, height-iybl, -tp, height-ybl, rxn, height-ybl-ryn, 0, height-ybl );
            quad( thickness+tp, height-iybl+ypx, -tp, height-ybl+ypx, -tp, ytl-ypx, thickness+tp, iytl-ypx, thickness, ytl, 0, ytl );
        }
        return g;
    },

    _anyMedia: function( name, attr ) {
        var media = jSignage._createElement( name ), layer = null;
        media.setAttributeNS( jSignage.xlinkNS, "xlink:href", attr.href );
        if ( attr.mediaAlign || attr.mediaFit ) {
            var preserveAspectRatio;
            var mediaFit = attr.mediaFit || 'meet';
            if ( mediaFit=='fill' ) {
                preserveAspectRatio = 'none';
            } else {
                preserveAspectRatio = mediaAlignToPAR[attr.mediaAlign || 'center'] || 'xMidYMid';
                if ( mediaFit=='slice' )
                    preserveAspectRatio += ' slice';
            }
            media.setAttribute( 'preserveAspectRatio', preserveAspectRatio );
        }
        var layer = null, layerFit = attr.layerFit || 'none';
        if ( attr.frame || ( name!='image' && !jSignage.features[name] ) ) {
            var layer = jSignage._createElement( 'g' );
            layer.setAttributeNS( jSignage.spxNS, 'layer-type', 'media' );
            jSignage.setViewportAttr( layer, attr );
            if ( name!='image' && !jSignage.features[name] ) {
                jSignage.addSetForTiming( layer, attr, true, true );
                var timingElement = jSignage.getTimingElement( layer );
                jSignage.beginEvent( timingElement, function() {
                    realizeMedia( timingElement, media );
                });
                jSignage.endEvent( timingElement, function() {
                    unrealizeMedia( media );
                });
                if ( !attr.frame ) {
                    jSignage.postLayoutCallback( layer, function( width, height ) {
                        media.setAttribute( 'width', width );
                        media.setAttribute( 'height', height );
                    });
                }
            } else if ( name=='image' ) {
                jSignage.addSetForTiming( layer, attr, true );
            } else {
                jSignage.setTimingAttr( media, attr, true );
                media.id = jSignage.guuid();
            }
            jSignage.addFrame( layer, attr, null, media );
            layer = jSignage( layer );
        } else {
            jSignage.setViewportAttr( media, attr );
            if ( name=='image' )
                jSignage.addSetForTiming( media, attr );
            else
                jSignage.setTimingAttr( media, attr, true );
            layer = jSignage(media);
        }
        if ( layerFit!='none' && window.Image ) {
            var layerAlign = attr.layerAlign || 'center';
            var chainedCallback = jSignage.postLayoutCallback( layer[0], function( width, height, x, y, bbw, bbh, parent ) {
                var img = new Image(), elem = this, tx = 0, ty = 0;
                img.src = attr.href;
                img.onload = function() {
                    var img_ratio = img.width/img.height, layer_ratio = width/height;
                    if ( ( layerFit=='horizontal' || layerFit=='both' ) && img_ratio < layer_ratio ) {
                        var new_width = height * img_ratio;
                        if ( layerAlign=='topRight' || layerAlign=='midRight' || layerAlign=='bottomRight' )
                            tx = width - new_width;
                        else if ( layerAlign!='topLeft' && layerAlign!='midLeft' && layerAlign!='bottomLeft' )
                            tx = ( width - new_width ) /2;
                        elem.setAttributeNS( null, 'width', new_width );
                        width = new_width;
                    }
                    if ( ( layerFit=='vertical' || layerFit=='both' ) && img_ratio > layer_ratio ) {
                        var new_height = width / img_ratio;
                        if ( layerAlign=='bottomLeft' || layerAlign=='bottomMid' || layerAlign=='bottomRight' )
                            ty = height - new_height;
                        else if ( layerAlign!='topLeft' && layerAlign!='topMid' && layerAlign!='topRight' )
                            ty = ( height - new_height ) / 2;
                        elem.setAttributeNS( null, 'height', new_height );
                        height = new_height;
                    }
                    if ( tx || ty )
                        elem.setAttribute( 'transform', 'translate(' + tx + ',' + ty + ') ' + elem.getAttribute( 'transform' ) );
                    if ( chainedCallback )
                        chainedCallback.call( elem, width, height, x+tx, y+ty, bbw, bbh, parent );
                };
                img.onerror = function() {
                    if ( chainedCallback )
                        chainedCallback.call( elem, width, height, x, y, bbw, bbh, parent );
                };
            });
        }
        return layer;
    },

    image: function( attr ) { return jSignage._anyMedia( "image", attr ); },

    video: function( attr ) { return jSignage._anyMedia( "video", attr ); },

    audio: function( attr ) { return jSignage._anyMedia( "audio", attr ); },

    animation: function( attr ) { return jSignage._anyMedia( "animation", attr ); },

    media: function( attr ) {
        if ( !('href' in attr ) )
            return jSignage.animation( attr );
        var lastDotPos = attr.href.lastIndexOf( '.' );
        if ( lastDotPos < 0 )
            return jSignage.animation( attr );
        var type = extensionToType[ attr.href.substring( lastDotPos+1 ).toLowerCase() ];
        if ( type===0 )
            return jSignage.image( attr );
        else if ( type===1 )
            return jSignage.video( attr );
        else if ( type===2 )
            return jSignage.audio( attr );
        else if ( type===3 )
            return jSignage.animation( attr );
        return jSignage.animation( attr );
    },

    tspan: function( text, attr ) {
        return new jSignage._textAccu().tspan( text, attr );
    },

    tbreak: function( attr ) {
        return new jSignage._textAccu().tbreak( attr );
    },

    _textAccu: function() {
    },

    clone: function( elem, dataAndEvents, deepDataAndEvents ) {
        return elem.cloneNode(true);
    }
});

jSignage._textAccu.prototype = new Array();

jSignage.extend( jSignage._textAccu.prototype, {
    tspan: function( text, attr ) {
        var obj = { };
        if ( attr )
            for ( var x in attr )
                obj[x] = attr[x];
        obj.text = text;
        this.push( obj );
        return this;
    },

    tbreak: function( attr ) {
        return this.tspan( '\n', attr );
    }
});

jSignage.fn.extend({
    eachMedia: function( callback ) {
        return this.each( function() {
            var media = jSignage.getRealMediaTarget( this );
            if ( jSignage._isTextAreaLayer( media.getAttributeNS( $.spxNS, 'layer-type' ) ) ) {
                media = jSignage.getG2( media );
                if ( media.localName=='g' ) {
                    for ( var x=media.firstElementChild; x;  x=x.nextElementSibling ) {
                        if ( x.localName=='textArea' || x.localName=='text' ) {
                            media = x;
                            break;
                        }
                    }
                }
            }
            callback.call(media);
        } );
    },

	text: function( text ) {
		if ( jSignage.isFunction(text) ) {
			return this.each(function(i) {
				var self = jSignage( this );
				self.text( text.call(this, i, self.text()) );
			});
		}

		if ( text!==undefined ) {
            var first = true;

            function addSpan( textElem, t, withBreaks ) {
                if ( jSignage.type(t)==="object" ) {
                    var tspanAttr = { }, text = '';
                    jSignage.copyProps( t, tspanAttr, tspanProps );
                    if ( t.text!==undefined )
                        text = ''+t.text;
                    if ( text.length==0 ) {
                        var tspan = jSignage._createElement( 'tspan', tspanAttr );
                        if ( t.id && first ) {
                            tspan.id = t.id;
                            first = false;
                        }
                        textElem.appendChild( tspan );
                    } else {
                        for ( var pos=0; pos < text.length; ) {
                            var newLine = text.indexOf( '\n', pos );
                            if ( newLine<0 || !withBreaks )
                                newLine = text.length;
                            if ( newLine > pos ) {
                                var tspan = jSignage._createElement( 'tspan', tspanAttr );
                                if ( t.id && first ) {
                                    tspan.id = t.id;
                                    first = false;
                                }
                                tspan.textContent = text.substring( pos, newLine );
                                textElem.appendChild( tspan );
                            }
                            if ( newLine < text.length ) {
                                var tbreak = jSignage._createElement( 'tbreak', tspanAttr );
                                if ( t.id && first ) {
                                    tbreak.id = t.id;
                                    first = false;
                                }
                                textElem.appendChild( tbreak );
                            }
                            pos = newLine+1;
                        }
                    }
                } else {
                    if ( typeof t != 'string' )
                        t = '' + t;
                    for ( var pos=0; pos < t.length; ) {
                        var newLine = t.indexOf( '\n', pos );
                        if ( newLine<0 || !withBreaks )
                            newLine = t.length;
                        if ( newLine > pos ) {
                            var tspan = jSignage._createElement( 'tspan' );
                            tspan.textContent = t.substring( pos, newLine );
                            textElem.appendChild( tspan );
                        }
                        if ( newLine < t.length ) {
                            var tbreak = jSignage._createElement( 'tbreak' );
                            textElem.appendChild( tbreak );
                        }
                        pos = newLine+1;
                    }
                }
            }

            return this.eachMedia( function() {		
		        if ( this.localName=='text' || this.localName=='textArea' ) {
		            for ( var x=this.firstElementChild; x; x=x.nextElementSibling )
		                if ( x.localName=='tspan' || x.localName=='tbreak' )
		                    this.removeChild( x );
                    if ( ( jSignage.type(text)==="object" && ( text.constructor===jSignage._textAccu || text.constructor===Array ) ) || jSignage.isArray( text ) ) {
                        for ( var i=0; i<text.length; i++ )
                            addSpan( this, text[i], this.localName=='textArea' );
                    } else {
                        addSpan( this, text, this.localName=='textArea' );
                    }
                    if ( !jSignage.features.textArea && jSignage.isInRenderingTree(this) )
                        layoutTextInAnArea( this.parentNode, null );
                } else {
                    this.textContent = text;
                }
            });
        }

		return jSignage.text( this );
	},

    ref: function() {
        return 'url(#' + this[0].id + ')';
    },

    animateColor: function( attributeName, args ) {
        var target = this[0];
        var parentName = this[0] && this[0].localName;
        if ( args===undefined ) {
            args = attributeName;
            if ( parentName==='solidColor' )
                attributeName = 'solid-color';
            else if ( parentName==='stop' || parentName==='linearGradient' || parentName==='radialGradient' )
                attributeName = 'stop-color';
            else if ( parentName==='text' || parentName==='textArea' || parentName==='tspan' )
                attributeName = 'fill';
            else
                attributeName = 'color';
        } else if ( parentName==='linearGradient' || parentName==='radialGradient' ) {
            var idx = 0;
            for ( var child = this[0].firstElementChild; child; child=child.nextElementSibling ) {
                if ( child.localName=='stop' ) {
                    target = child;
                    if ( ++idx > attributeName )
                        break;
                }
            }
            attributeName = 'stop-color';
        }
        jSignage._addAnimate( target, 'animateColor', attributeName, args );
        return this;
    },

    animateOpacity: function( attributeName, args ) {
        var target = this[0];
        if ( args===undefined ) {
            var parentName = this[0] && this[0].localName;
            args = attributeName;
            if ( parentName==='solidColor' )
                attributeName = 'solid-opacity';
            else if ( parentName==='stop' || parentName==='linearGradient' || parentName==='radialGradient' )
                attributeName = 'stop-opacity';
            else if ( parentName==='text' || parentName==='textArea' || parentName==='tspan' )
                attributeName = 'fill-opacity';
            else
                attributeName = 'opacity';
        } else if ( attributeName=='fill' ) {
            attributeName = 'fill-opacity';
        } else if ( attributeName=='stroke' ) {
            attributeName = 'stroke-opacity';
        } else {
            var parentName = this[0] && this[0].localName;
            if ( parentName==='linearGradient' || parentName==='radialGradient' ) {
                var idx = 0;
                for ( var child = this[0].firstElementChild; child; child=child.nextElementSibling ) {
                    if ( child.localName=='stop' ) {
                        target = child;
                        if ( ++idx > attributeName )
                            break;
                    }
                }
                attributeName = 'stop-opacity';
            }
        }
        jSignage._addAnimate( target, 'animate', attributeName, args );
        return this;
    },

    animateZoom: function( args ) {
        return this;
    },

    animateMotion: function( args ) {
        var attr = { };
        if ( args.path ) attr.path = args.path;
        if ( args.keyPoints ) attr.keyPoints = args.keyPoint.join( ';' );
        if ( args.rotate ) attr.rotate = args.rotate;
        jSignage._addAnimate( this[0], 'animateMotion', null, args, attr );
        return this;
    }
});

})();

// Basic transitions and effects

(function(){

var slideDirections = [ 'rightToLeft', 'leftToRight', 'bottomToTop', 'topToBottom' ];

function slidePostLayout( direction, reverse, begin, dur, inner, width, height ) {
    var x0=0, y0=0, x1=0, y1=0;
    if ( direction=='random' )
        direction = jSignage.randomChoice( slideDirections );
    if ( reverse ) {
        if ( direction=='rightToLeft' )
            x1 = -width;
        else if ( direction=='leftToRight' )
            x1 = width;
        else if ( direction=='bottomToTop' )
            y1 = -height;
        else if ( direction=='topToBottom' )
            y1 = height;
    } else {
        if ( direction=='rightToLeft' )
            x0 = width;
        else if ( direction=='leftToRight' )
            x0 = -width;
        else if ( direction=='bottomToTop' )
            y0 = height;
        else if ( direction=='topToBottom' )
            y0 = -height;
    }
    var clipPath = jSignage._createElement( "clipPath" );
    clipPath.id = jSignage.guuid();
    clipPath.appendChild( jSignage._createElement( "rect", { width: width, height: height } ) );
    this.appendChild( clipPath );
    jSignage.svgAnimation( this, 'set', {
        attributeName: 'clip-path',
        to: 'url(#'+clipPath.id+')',
        fill: reverse ? 'freeze' : 'remove',
        begin: begin,
        dur: dur
    });
    jSignage.svgAnimation( this, 'animateTransform', {
        attributeName: 'transform',
        additive: 'sum',
        type: 'translate',
        from: x0+','+y0,
        to: x1+','+y1,
        begin: begin,
        dur: dur,
        fill: reverse ? 'freeze' : 'remove',
        href: '#'+inner.id
    });
}

var flyDirections = slideDirections;

function flyPostLayout( direction, acceleration, reverse, begin, dur, inner, width, height, x, y, bbw, bbh ) {
    var dx = 0, dy = 0;
    if ( direction=='random' )
        direction = jSignage.randomChoice( flyDirections );
    if ( ( !reverse && direction=='leftToRight' ) || ( reverse && direction=='rightToLeft' ) )
        dx = -x-width;
    else if ( ( !reverse && direction=='rightToLeft' ) || ( reverse && direction=='leftToRight' ) )
        dx = bbw-x;
    else if ( ( !reverse && direction=='topToBottom' ) || ( reverse && direction=='bottomToTop' ) )
        dy = -y-height;
    else if ( ( !reverse && direction=='bottomToTop' ) || ( reverse && direction=='topToBottom' ) )
        dy = bbh-y;
    var clipPath = jSignage._createElement( "clipPath" );
    clipPath.id = jSignage.guuid();
    clipPath.appendChild( jSignage._createElement( "rect", { x: -x, y: -y, width: bbw, height: bbh } ) );
    this.appendChild( clipPath );
    jSignage.svgAnimation( this, 'set', {
        attributeName: 'clip-path',
        to: 'url(#'+clipPath.id+')',
        fill: reverse ? 'freeze' : 'remove',
        begin: begin,
        dur: dur
    });   
    jSignage.svgAnimation( this, 'animateTransform', {
        attributeName: 'transform',
        additive: 'sum',
        type: 'translate',
        from: reverse ? '0,0' : dx+','+dy,
        to: reverse ? dx+','+dy : '0,0',
        calcMode: 'spline',
        keySplines: reverse ? (1-1/acceleration)+',0,1,'+(1/acceleration) : '0,'+(1-1/acceleration)+','+(1/acceleration)+',1',
        begin: begin,
        dur: dur,
        fill: reverse ? 'freeze' : 'remove',
        href: '#'+inner.id
    });
}

var wipeTypes = [ 'bar', 'box', 'barnDoor', 'iris' ];
var wipeBarSubtypes = slideDirections;
var wipeBoxSubtypes = [ 'topRight', 'bottomRight', 'bottomLeft', 'topCenter', 'rightCenter', 'bottomCenter', 'leftCenter', 'topLeft' ];
var wipeBarndoorSubtypes = [ 'horizontal', 'vertical' ];
var wipeIrisSubtypes = [ 'rectangle' ];

function wipePostLayout( type, subType, reverse, begin, dur, width, height ) {
    var L0=0, T0=0, R0=width, B0=height;
    if ( type=='random' )
        type = jSignage.randomChoice( wipeTypes );
    if ( type=='bar' ) {
        if ( subType=='random' )
            subType = jSignage.randomChoice( wipeBarSubtypes );
        if ( subType=='rightToLeft' )
            L0 = width;
        else if ( subType=='topToBottom' )
            B0 = 0;
        else if ( subType=='bottomToTop' )
            T0 = height;
        else  if ( subType=='leftToRight' )
            R0 = 0;
    } else if ( type=='box' ) {
        if ( subType=='random' )
            subType = jSignage.randomChoice( wipeBoxSubtypes );
        if ( subType=='topRight' ) {
            L0 = width;
            B0 = 0;
        } else if ( subType=='bottomRight' ) {
            L0 = width;
            T0 = height;
        } else if ( subType=='bottomLeft' ) {
            R0 = 0;
            T0 = height;
        } else if ( subType=='topCenter' ) {
            L0 = R0 = width/2;
            B0 = 0;
        } else if ( subType=='rightCenter' ) {
            L0 = width;
            T0 = B0 = height/2;
        } else if ( subType=='bottomCenter' ) {
            L0 = R0 = width/2;
            T0 = height;
        } else if ( subType=='leftCenter' ) {
            R0 = 0;
            B0 = T0 = height/2;
        } else if ( subType=='topLeft' ) {
            R0 = 0;
            B0 = 0;
        }
    } else if ( type=='barnDoor' ) {
        if ( subType=='random' )
            subType = jSignage.randomChoice( wipeBarndoorSubtypes );
        if ( subType=='horizontal' )
            T0 = B0 = height/2;
        else  if ( subType=='vertical' )
            L0 = R0 = width/2;
    } else if ( type=='iris' ) {
        L0 = R0 = width/2;
        T0 = B0 = height/2;
    }
    var clipPath = jSignage._createElement( "clipPath" );
    clipPath.id = jSignage.guuid();
    var clipRect = jSignage._createElement( "rect", { x: 0, y: 0, width: width, height: height } );
    if ( L0!=0 )
        jSignage.svgAnimation( clipRect, 'animate', {
            attributeName: 'x',
            from: reverse ? 0 : L0,
            to: reverse ? L0 : 0,
            begin: begin,
            dur: dur
        });
    if ( T0!=0 )
        jSignage.svgAnimation( clipRect, 'animate', {
            attributeName: 'y',
            from: reverse ? 0 : T0,
            to: reverse ? T0 : 0,
            begin: begin,
            dur: dur
        });
    if ( R0-L0!=width )
        jSignage.svgAnimation( clipRect, 'animate', {
            attributeName: 'width',
            from: reverse ? width : R0-L0,
            to: reverse ? R0-L0 : width,
            begin: begin,
            dur: dur
        });
    if ( B0-T0!=height )
        jSignage.svgAnimation( clipRect, 'animate', {
            attributeName: 'height',
            from: reverse ? height : B0-T0,
            to: reverse ? B0-T0 : height,
            begin: begin,
            dur: dur
        });
    clipPath.appendChild( clipRect );
    this.appendChild( clipPath );
    jSignage.svgAnimation( this, 'set', {
        attributeName: 'clip-path',
        to: 'url(#'+clipPath.id+')',
        begin: begin,
        dur: dur
    });
}

function pagePostLayout( out, trigger, dur, width, height ) {
    jSignage.svgAnimation( this, 'animate', {
        attributeName: 'opacity',
        from: out ? '1' : '0',
        to: out ? '0' : '1',
        begin: trigger,
        dur: dur
    });
    jSignage.svgAnimation( this, 'animateTransform', {
        attributeName: 'transform',
        type: 'translate',
        additive: 'sum',
        values: (width/2)+','+(height/2)+';'+(width/2)+','+(height/2),
        begin: trigger,
        dur: dur
    });
    jSignage.svgAnimation( this, 'animateTransform', {
        attributeName: 'transform',
        type: 'scale',
        additive: 'sum',
        values: out ? '1;0.8' : '0.8;1',
        begin: trigger,
        dur: dur
    });
    jSignage.svgAnimation( this, 'animateTransform', {
        attributeName: 'transform',
        type: 'translate',
        additive: 'sum',
        values: (-width/2)+','+(-height/2)+';'+(-width/2)+','+(-height/2),
        begin: trigger,
        dur: dur
    });
}

var pivotOrientations = [ 'horizontal', 'vertical' ];

function pivotPostLayout( orientation, out, trigger, delay, dur, inner, width, height ) {
    if ( orientation=='random' )
        orientation = jSignage.randomChoice( pivotOrientations );
    jSignage.svgAnimation( this, 'animateTransform', {
        attributeName: 'transform',
        type: 'translate',
        additive: 'sum',
        values: (width/2)+','+(height/2)+';'+(width/2)+','+(height/2),
        begin: trigger,
        dur: dur
    });
    var attr = {
        attributeName: 'transform',
        type: 'scale',
        additive: 'sum',
        begin: trigger,
        dur: dur
    };
    var zero = orientation=='vertical' ? '1,0' : '0,1';
    if ( out ) {
        attr.values = '1,1;'+zero;
    } else if ( delay ) {
        attr.values = zero+';'+zero+';1,1';
        attr.keyTimes = '0;'+delay+';1';
    } else {
        attr.values = zero+';1,1';
    }
    jSignage.svgAnimation( this, 'animateTransform', attr );
    jSignage.svgAnimation( this, 'animateTransform', {
        attributeName: 'transform',
        type: 'translate',
        additive: 'sum',
        values: (-width/2)+','+(-height/2)+';'+(-width/2)+','+(-height/2),
        begin: trigger,
        dur: dur
    });
    if ( delay ) {
        jSignage.svgAnimation( this, 'set', {
            attributeName: 'display',
            to: 'none',
            begin: trigger,
            dur: delay*dur
        });
    }
}

var cubeDirections = [ 'leftToRight', 'rightToLeft', 'topToBottom', 'bottomToTop' ];

function cubePostLayout( direction, out, trigger, dur, inner, width, height ) {
    if ( direction=='random' )
        direction = jSignage.randomChoice( cubeDirections );
    var s0, s1, t0, t1;
    if ( out ) {
        s0 = '1,1';
        if ( direction=='leftToRight' || direction=='rightToLeft' )
            s1 = '0,1';
        else
            s1 = '1,0';
        t0 = '0,0';
        if ( direction=='leftToRight' )
            t1 = width+',0';
        else if ( direction=='topToBottom' )
            t1 = '0,'+height;
        else
            t1 = '0,0';
    } else {
        s1 = '1,1';
        if ( direction=='leftToRight' || direction=='rightToLeft' )
            s0 = '0,1';
        else
            s0 = '1,0';
        t1 = '0,0';
        if ( direction=='rightToLeft' )
            t0 = width+',0';
        else if ( direction=='bottomToTop' )
            t0 = '0,'+height;
        else
            t0 = '0,0';
    }
    if ( t0!=t1 ) {
        jSignage.svgAnimation( this, 'animateTransform', {
            attributeName: 'transform',
            type: 'translate',
            additive: 'sum',
            values: t0+';'+t1,
            calcMode: 'spline',
            keyTimes: '0;1',
            keySplines: '0.5 0 0.5 1',
            begin: trigger,
            dur: dur
        });
    }
    jSignage.svgAnimation( this, 'animateTransform', {
        attributeName: 'transform',
        type: 'scale',
        additive: 'sum',
        values: s0+';'+s1,
        calcMode: 'spline',
        keyTimes: '0;1',
        keySplines: '0.5 0 0.5 1',
        begin: trigger,
        dur: dur
    });
}

function zoomPostLayout( factor, keepZooming, out, trigger, dur, inner, width, height ) {
    if ( !out || !keepZooming ) {
        jSignage.svgAnimation( this, 'animateTransform', {
            attributeName: 'transform',
            type: 'translate',
            additive: 'sum',
            values: (width/2)+','+(height/2)+';'+(width/2)+','+(height/2),
            begin: trigger,
            dur: keepZooming && !out ? 'indefinite' : dur
        });
        if ( keepZooming && !out )
            jSignage.svgAnimation( this, 'animateTransform', {
                attributeName: 'transform',
                type: 'scale',
                additive: 'sum',
                from: factor,
                to: factor+(1-factor)*3600/dur,
                begin: trigger,
                dur: '3600'
            });
        else
            jSignage.svgAnimation( this, 'animateTransform', {
                attributeName: 'transform',
                type: 'scale',
                additive: 'sum',
                from: out ? '1' : factor,
                to: out ? factor : '1',
                begin: trigger,
                dur: dur
            });        
        jSignage.svgAnimation( this, 'animateTransform', {
            attributeName: 'transform',
            type: 'translate',
            additive: 'sum',
            values: (-width/2)+','+(-height/2)+';'+(-width/2)+','+(-height/2),
            begin: trigger,
            dur: keepZooming && !out ? 'indefinite' : dur
        });
    }
    jSignage.svgAnimation( this, 'animate', {
        attributeName: 'opacity',
        from: out ? '1' : '0',
        to: out ? '0' : '1',
        begin: trigger,
        dur: dur
    });
};

var transitionsList = [ 'crossFade', 'slide', 'push', 'wipe', 'flip', 'cubeFace' ];

jSignage.extend({

    random: function( args ) {
        return function() {
            return jSignage[jSignage.randomChoice(transitionsList)]( args );
        }
    },

    crossFade: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 1 );
        return {
            durIn: dur,
            durExit: dur,
            wrapIn: function( trigger ) {
                jSignage.svgAnimation( this, 'animate', {
                    attributeName: 'opacity',
                    from: '0',
                    to: '1',
                    begin: trigger,
                    dur: dur
                });
            }
        };
    },

    fade: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 1 );
        if ( args && args.color ) return {
            durIn: dur,
            durOut: dur,
            wrapIn : function( trigger, inner, width, height ) {
                var rect = jSignage._createElement( 'rect', {
                    width: width,
                    height: height,
                    stroke: 'none',
                    fill: args.color
                } );
                jSignage.svgAnimation( rect, 'animate', {
                    attributeName: 'fill-opacity',
                    from: '1',
                    to: '0',
                    begin: trigger,
                    dur: dur,
                    fill: 'freeze'
                });
                this.appendChild( rect );
            },
            wrapOut: function( trigger, inner, width, height ) {
                var rect = jSignage._createElement( 'rect', {
                    width: width,
                    height: height,
                    stroke: 'none',
                    fill: args.color,
                    'fill-opacity': 0
                } );
                jSignage.svgAnimation( rect, 'animate', {
                    attributeName: 'fill-opacity',
                    from: '0',
                    to: '1',
                    dur: dur,
                    begin: trigger,
                    fill: 'freeze'
                });
                this.appendChild( rect );
            }
        };
        else return {
            durIn: dur,
            durOut: dur,
            wrapIn : function( trigger, inner, width, height ) {
                jSignage.svgAnimation( this, 'animate', {
                    attributeName: 'opacity',
                    from: '0',
                    to: '1',
                    begin: trigger,
                    dur: dur
                });
            },
            wrapOut: function( trigger, inner ) {
                jSignage.svgAnimation( this, 'animate', {
                    attributeName: 'opacity',
                    from: '1',
                    to: '0',
                    begin: trigger,
                    dur: dur
                });
            }
        };
    },

    slide: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.5 );
        var direction = args && args.direction || 'random';
        return {
            durExit: dur,
            durIn: dur,
            wrapIn: function( trigger, inner, width, height ) {
                slidePostLayout.call( this, direction, false, trigger, dur, inner, width, height );
            }
        };
    },

    push: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.5 );
        var direction = args && args.direction || 'random';
        var actualdir = direction=='random' ? jSignage.randomChoice( slideDirections ) : direction;
        return {
            durExit: dur,
            durIn: dur,
            wrapExit: function( trigger, inner, width, height ) {
                if ( direction=='random' )
                    actualdir = jSignage.randomChoice( slideDirections );
                slidePostLayout.call( this, actualdir, true, trigger, dur, inner, width, height );
            },
            wrapIn: function( trigger, inner, width, height ) {
                slidePostLayout.call( this, actualdir, false, trigger, dur, inner, width, height );
            }
        };
    },

    wipe: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.5 );
        var type = args && args.type || 'random';
        var subType = args && args.subType || 'random';
        return {
            durExit: dur,
            durIn: dur,
            wrapIn: function( trigger, inner, width, height ) {
                wipePostLayout.call( this, type, subType, false, trigger, dur, width, height );
            }
        };
    },

    page: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.375 );
        var d1 = dur*2/3, d2 = d1, t2 = dur/3;
        return {
            durExit: d1,
            durIn: dur,
            wrapExit: function( trigger ) {
                jSignage.svgAnimation( this, 'animate', {
                    attributeName: 'opacity',
                    from: '1',
                    to: '0',
                    fill: 'freeze',
                    begin: trigger,
                    dur: d1
                });
            },
            wrapIn: function( trigger, inner, width, height ) {               
                jSignage.svgAnimation( this, 'set', {
                    attributeName: 'opacity',
                    to: '0',
                    begin: trigger,
                    dur: t2
                });
                pagePostLayout.call( this, false, jSignage.triggerWithOffset(trigger,t2), d2, width, height );
            }
        };
    },

    flip: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.5 );
        var orientation = args && args.orientation || 'random';
        var actualOrientation = orientation=='random' ? jSignage.randomChoice( pivotOrientations ) : orientation;
        return {
            durExit: dur/2,
            durIn: dur,
            wrapExit: function( trigger, inner, width, height ) {
                if ( orientation=='random' )  
                    actualOrientation = jSignage.randomChoice( pivotOrientations );
                pivotPostLayout.call( this, actualOrientation, true, trigger, 0, dur/2, inner, width, height );
            },
            wrapIn: function( trigger, inner, width, height ) {
                pivotPostLayout.call( this, actualOrientation, false, trigger, 0.5, dur, inner, width, height );
            }
        };
    },

    cubeFace: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.5 );
        var direction = args && args.direction || 'random';
        var actualDirection = direction=='random' ? jSignage.randomChoice( cubeDirections ) : direction;
        return {
            durExit: dur,
            durIn: dur,
            wrapExit: function( trigger, inner, width, height ) {
                if ( direction=='random' )  
                    actualDirection = jSignage.randomChoice( cubeDirections );
                cubePostLayout.call( this, actualDirection, true, trigger, dur, inner, width, height );
            },
            wrapIn: function( trigger, inner, width, height ) {
                cubePostLayout.call( this, actualDirection, false, trigger, dur, inner, width, height );
            }
        };
    },

    zoom: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 1 );
        var factorIn = 1/(1+jSignage.getPercent( args && args.factorIn, 0.2 ));
        var factorOut = 1+jSignage.getPercent( args && args.factorOut, 0.2 );
        var keepZooming = args && args.keepZooming || false;
        return {
            durOut: dur,
            durIn: dur,
            wrapIn: function( trigger, inner, width, height ) {
                zoomPostLayout.call( this, factorIn, keepZooming, false, trigger, dur, inner, width, height );
            },
            wrapOut: function( trigger, inner, width, height ) {
                zoomPostLayout.call( this, factorOut, keepZooming, true, trigger, dur, inner, width, height );
            }
        };
    }
});

jSignage.fn.extend({

    audioFadeIn: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 3 );
        return this.effectIn( function( trigger ) {
            jSignage.svgAnimation( this, 'animate', {
                attributeName: 'audio-level',
                from: '0',
                to: '1',
                begin: trigger,
                dur: dur
            });
        });
    },

    audioFadeOut: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 3 );
        return this.effectOut( function( trigger ) {
            jSignage.svgAnimation( this, 'animate', {
                attributeName: 'audio-level',
                from: '1',
                to: '0',
                begin: trigger,
                dur: dur
            });
        });
    },

    fadeIn: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 1 );
        return this.effectIn( function( trigger ) {
            jSignage.svgAnimation( this, 'animate', {
                attributeName: 'opacity',
                from: '0',
                to: '1',
                begin: trigger,
                dur: dur
            });
        });
    },

    fadeOut: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 1 );
        return this.effectOut( dur, function( trigger ) {
            jSignage.svgAnimation( this, 'animate', {
                attributeName: 'opacity',
                from: '1',
                to: '0',
                begin: trigger,
                dur: dur
            });
        });
    },

    blink: function( args ) {
        var offset = jSignage.durInSeconds( args && args.offset, 0);
        var dur = jSignage.durInSeconds( args && args.dur, 0.5 );
        var repeatInterval = jSignage.repeatInterval( args, dur );
        var repeatCount = jSignage.repeatCount( args );
        var repeatDur = jSignage.repeatDur( args );
        return this.effectIn( function( trigger ) {
            attr = {
                attributeName: 'opacity',
                calcMode: 'discrete',
                values: '0.001;1',
                keyTimes: '0;'+(dur/repeatInterval),
                begin: jSignage.triggerWithOffset( trigger, offset ),
                dur: repeatInterval
            };
            if ( repeatCount!=1 )
                attr.repeatCount = repeatCount;
            if ( repeatDur!=0 )
                attr.repeatDur = repeatDur;
            jSignage.svgAnimation( this, 'animate', attr );
        });
    },

    nudge: function( args ) {
        if ( !args ) args = { };
        var offset = jSignage.durInSeconds( args.offset, 0);
        var dur = jSignage.durInSeconds( args.dur, 0.5 );
        var repeatInterval = jSignage.repeatInterval( args, dur );
        var repeatCount = jSignage.repeatCount( args );
        var repeatDur = jSignage.repeatDur( args );
        var nudgeX = ''+(args.nudgeX || 0), nudgeY = ''+(args.nudgeY || 0), nudgeZ = ''+(args.nudgeZ || 0), nX, nY, nZ;
        var nX = parseFloat( nudgeX );
        if ( isNaN(nX) ) nX = 0;
        var relX = nudgeX.indexOf('%') >= 0;
        var nY = parseFloat( nudgeY );
        if ( isNaN(nY) ) nY = 0;
        var relY = nudgeY.indexOf('%') >= 0;
        var nZ = parseFloat( nudgeZ );
        if ( isNaN(nZ) ) nZ = 0;
        var relZ = true;
        var t = dur/repeatInterval;

        return this.effectIn( function( trigger, inner, width, height, left, top ) {
            var begin = jSignage.triggerWithOffset( trigger, offset );
            if ( nX!=0 || nY!=0 ) {
                var mX = relX ? nX*width/100 : nX;
                var mY = relY ? nY*height/100 : nY;
                attr = {
                    attributeName: 'transform',
                    type: 'translate',
                    additive: 'sum',
                    values: '0,0;'+mX+','+mY+';0,0;0,0',
                    keyTimes: '0;'+(t/2)+';'+t+';1',
                    begin: begin,
                    dur: repeatInterval
                };
                if ( repeatCount!=1 )
                    attr.repeatCount = repeatCount;
                if ( repeatDur!=0 )
                    attr.repeatDur = repeatDur;
                jSignage.svgAnimation( this, 'animateTransform', attr );
            }
            if ( nZ!=0 ) {
                var mZ = 1+nZ/100;
                var a1 = {
                    attributeName: 'transform',
                    type: 'translate',
                    additive: 'sum',
                    values: (-width/2)+','+(-height/2)+';'+(-width/2)+','+(-height/2),
                    begin: begin,
                    dur: repeatInterval
                };
                var animateTransform = {
                    attributeName: 'transform',
                    type: 'scale',
                    additive: 'sum',
                    values: '1;'+mZ+';1;1',
                    keyTimes: '0;'+(t/2)+';'+t+';1',
                    begin: begin,
                    dur: repeatInterval
                };
                var a2 = {
                    attributeName: 'transform',
                    type: 'translate',
                    additive: 'sum',
                    values: (width/2)+','+(height/2)+';'+(width/2)+','+(height/2),
                    begin: begin,
                    dur: repeatInterval
                };
                if ( repeatCount!=1 ) {
                    a1.repeatCount = repeatCount;
                    animateTransform.repeatCount = repeatCount;
                    a2.repeatCount = repeatCount;
                }
                if ( repeatDur!=0 ) {
                    a1.repeatDur = repeatDur;
                    animateTransform.repeatDur = repeatDur;
                    a2.repeatDur = repeatDur;
                }
                jSignage.svgAnimation( this, 'animateTransform', a2 );
                jSignage.svgAnimation( this, 'animateTransform', animateTransform );
                jSignage.svgAnimation( this, 'animateTransform', a1 );
            }
        });
    },

    slideIn: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.5 );
        var direction = args && args.direction || 'random';
        return this.effectIn( function( trigger, inner, width, height ) {
            slidePostLayout.call( this, direction, false, trigger, dur, inner, width, height );
        });
    },

    slideOut: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.5 );
        var direction = args && args.direction || 'random';
        return this.effectOut( dur, function( trigger, inner, width, height ) {
            slidePostLayout.call( this, direction, true, trigger, dur, inner, width, height );
        });
    },

    wipeIn: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.5 );
        var type = args && args.type || 'random';
        var subType = args && args.subType || '';
        return this.effectIn( function( trigger, inner, width, height ) {
            wipePostLayout.call( this, type, subType, false, trigger, dur, width, height );
        });
    },

    wipeOut: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.5 );
        var type = args && args.type || 'random';
        var subType = args && args.subType || '';
        if ( type=='bar' ) {
            if ( subType=='rightToLeft' )
                subType='leftToRight';
            else if ( subType=='topToBottom' )
                subType='bottomToTop';
            else if ( subType=='bottomToTop' )
                subType='topToBottom';
            else
                subType='rightToLeft';
        }
        return this.effectOut( dur, function( trigger, inner, width, height ) {
            wipePostLayout.call( this, type, subType, true, trigger, dur, width, height );
        });
    },

    flyIn: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.5 );
        var direction = args && args.direction || 'random';
        var acceleration = args && args.acceleration || '3';
        return this.effectIn( function( trigger, inner, width, height, x, y, bbw, bbh ) {
            flyPostLayout.call( this, direction, acceleration, false, trigger, dur, inner, width, height, x, y, bbw, bbh );
        });
    },

    flyOut: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.5 );
        var direction = args && args.direction || 'random';
        var acceleration = args && args.acceleration || '3';
        return this.effectOut( dur, function( trigger, inner, width, height, x, y, bbw, bbh ) {
            flyPostLayout.call( this, direction, acceleration, true, trigger, dur, inner, width, height, x, y, bbw, bbh );
        });
    },

    pageIn: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.25 );
        return this.effectIn( function( trigger, inner, width, height ) {
            pagePostLayout.call( this, false, trigger, dur, width, height );
        });
    },

    pageOut: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.25 );
        return this.effectOut( dur, function( trigger, inner, width, height ) {
            pagePostLayout.call( this, true, trigger, dur, width, height );
        });
    },
    
    pivotIn: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.5 );
        var orientation = args && args.orientation || 'random';
        return this.effectIn( function( trigger, inner, width, height, x, y, bbw, bbh ) {
            pivotPostLayout.call( this, orientation, false, trigger, 0, dur, inner, width, height );
        });
    },

    pivotOut: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.5 );
        var orientation = args && args.orientation || 'random';
        return this.effectOut( dur, function( trigger, inner, width, height, x, y, bbw, bbh ) {
            pivotPostLayout.call( this, orientation, true, trigger, 0, trigger, inner, width, height );
        });
    },

    cubeFaceIn: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.5 );
        var direction = args && args.direction || 'random';
        return this.effectIn( function( trigger, inner, width, height, x, y, bbw, bbh ) {
            cubePostLayout.call( this, direction, false, trigger, dur, inner, width, height );
        });
    },

    cubeFaceOut: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.5 );
        var direction = args && args.direction || 'random';
        return this.effectOut( dur, function( trigger, inner, width, height, x, y, bbw, bbh ) {
            cubePostLayout.call( this, direction, true, trigger, dur, inner, width, height );
        });
    },

    zoomIn: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 1 );
        var factor = 1/(1+jSignage.getPercent( args && args.factor, 0.2 ));
        return this.effectIn( function( trigger, inner, width, height, x, y, bbw, bbh ) {
            zoomPostLayout.call( this, factor, false, false, trigger, dur, inner, width, height );
        });
    },

    zoomOut: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.5 );
        var factor = 1+jSignage.getPercent( args && args.factor, 0.2 );
        return this.effectOut( dur, function( trigger, inner, width, height, x, y, bbw, bbh ) {
            zoomPostLayout.call( this, factor, false, true, trigger, dur, inner, width, height );
        });
    }
});

})();


// News, playlists and tickers

(function(){

function removeWithTimeout( parent, timeout ) {
    var children = arguments;
    jSignage.setTimeout( function() {
        for ( var i=2; i<children.length; i++ )
            parent.removeChild( children[i] );
    }, timeout );
}

function multi_page_switch( multiPageElement, page, trans, timingElement, gap, delayedOut, endEventHandler ) {
    var removePrevAfter = 0, startNextAt = gap;
    var prev = multiPageElement.lastElementChild, realPage = page;
    if ( prev && ( prev.localName=='set' || prev.localName=='animate' ) )
        prev = null;

    // Add in and out effects on next page

    if ( !page )
        page = jSignage.g()[0];
    timingElement = jSignage.setFillFreeze( page, true );

    if ( trans ) {
        if ( jSignage.isFunction(trans) )
            trans = trans();
        if ( delayedOut ) {
            if ( prev )
                startNextAt += trans.durOut || 0;
            removePrevAfter += trans.durOut || 0;
        }
        if ( trans.durExit )
            removePrevAfter += trans.durExit + gap;
        if ( trans.wrapIn && realPage ) {
            page = jSignage.wrapInNewElement( page, function( timeBase, inner, width, height, x, y, bbw, bbh ) {
                trans.wrapIn.call( this, timingElement.id+'.begin', inner, width, height, x, y, bbw, bbh );
            } );
        }
        if ( trans.durOut && trans.wrapOut && realPage ) {
            page = jSignage.wrapInNewElement( page, function( timeBase, inner, width, height, x, y, bbw, bbh ) {
                trans.wrapOut.call( this, delayedOut ? timingElement.id+'.end' : timingElement.id+'.end'+'-'+trans.durOut, inner, width, height, x, y, bbw, bbh );
            } );
        }
        if ( prev && trans.wrapExit && multiPageElement.wrapExitParams ) {
            multiPageElement.wrapExitParams[0] = timingElement.id+'.begin';
            trans.wrapExit.apply( prev, multiPageElement.wrapExitParams );
        }
        if ( jSignage.timeline && !trans.wrapExit )
            removePrevAfter += 0.250;
    }

    if ( realPage ) {
        // Prepare next page for an exit effect just in case
        page = jSignage.wrapInNewElement( page, function( timeBase, inner, width, height, x, y, bbw, bbh ) {
            multiPageElement.wrapExitParams = [ null, inner, width, height, x, y, bbw, bbh ];
        } );
    } else {
        multiPageElement.wrapExitParams = null;
    }

    if ( prev ) {
        if ( removePrevAfter <= 0 )
            multiPageElement.removeChild( prev );
        else
            removeWithTimeout( multiPageElement, removePrevAfter*1000, prev );
    }

    if ( endEventHandler && realPage )
        jSignage.endEventOnce( timingElement, endEventHandler );
    jSignage.addAndKick( multiPageElement, page, timingElement, startNextAt );
}

function new_slide( ctx, index, slideshowG2, slideShowTiming ) {
    var newSlide = null;

    if ( ctx.data && ctx.data.length && index==ctx.data.length )
        index = !ctx.looping || ( ctx.loopCount>0 && --ctx.loopCount==0 ) ? -1 : 0;

    if ( index==0 && ctx.iterating )
        ctx.iterating.call( ctx, ctx.iteration++ );

    if ( index>=0 && ctx.data && ctx.data.length )
        newSlide = ctx.renderToSVG ? ctx.renderToSVG.call( ctx.data[index], index, ctx.data[index] ) : ctx.data[index];

    if ( !newSlide || !newSlide.jsignage || newSlide.length < 1 ) {
        ctx.active = false;
        multi_page_switch( slideshowG2, null, ctx.defaultTransition, null, jSignage.durInSeconds( ctx.defaultGap, 0 ), ctx.delayedOut, null );
        ctx.layer.hide();
        return;
    }

    var slide = newSlide[0];
    var timingElement = jSignage.getTimingElement( jSignage.getRealMediaTarget( slide ) );
    if ( ctx.minimumSlideDur )
        timingElement.setAttribute( 'min', ctx.minimumSlideDur );
    if ( ctx.maximumSlideDur )
        timingElement.setAttribute( 'max', ctx.maximumSlideDur );
    if ( ctx.defaultSlideDur && timingElement.getAttribute('dur')=='indefinite' && !timingElement.getAttribute('end') )
        timingElement.setAttribute( 'dur', ctx.defaultSlideDur );

    multi_page_switch(
        slideshowG2,
        slide,
        newSlide.transition || ctx.defaultTransition,
        timingElement,
        jSignage.durInSeconds( newSlide.gap || ctx.defaultGap, 0 ),
        ctx.delayedOut,
        function() {
            new_slide( ctx, index+1, slideshowG2, slideShowTiming );
        }
    );
}

function new_crawl( ctx, index, crawlerG2, bbw, bbh ) {

    while ( true ) {
        var newCrawl = null;

        if ( ctx.data && ctx.data.length && index==ctx.data.length )
            index = !ctx.looping || ( ctx.loopCount>0 && --ctx.loopCount==0 ) ? -1 : 0;

        if ( index==0 && ctx.iterating )
            ctx.iterating.call( ctx, ctx.iteration++ );

        if ( index>=0 && ctx.data && ctx.data.length )
            newCrawl = ctx.renderToSVG ? ctx.renderToSVG.call( ctx.data[index], index, ctx.data[index], bbw, bbh ) : ctx.data[index];

        if ( !newCrawl || !newCrawl.jsignage || newCrawl.length < 1 ) {
            ctx.idleing = true;
            ctx.idleStart = jSignage.getCurrentTime();
            if ( crawlerG2.lastElementChild.localName=='clipPath' ) {
                ctx.active = false;
                ctx.layer.hide();
            }
            return;
        }

        var crawl = newCrawl[0];
        var timingElement = jSignage.getTimingElement( crawl );
        var bbox = jSignage.getBBox( crawl, crawlerG2 );
        if ( bbox.height>0 && bbox.width>0 )
            break;
        ++index;
    }
    var scale_factor = ctx.vertical ? bbw/bbox.width : bbh/bbox.height;
    if ( bbox.auto && scale_factor!=1 ) {
        // Text, in particular, does not scale linearly because of hinting, so do it again with the final scale factor.
        crawl.setAttribute( 'transform', 'scale(' + scale_factor +')' );
        bbox = jSignage.getBBox( crawl, crawlerG2 );
        scale_factor = ctx.vertical ? bbw/bbox.width : bbh/bbox.height;
    }

    var h, vbh, w, cloneDistance, crawlDistance, scaleTransform;
    if ( ctx.vertical ) {
        w = bbw;
        vbh = bbh;
        h = bbox.height*scale_factor;
        scaleTransform = "translate("+(bbw-w)/2+",0) scale("+scale_factor+") translate("+(-bbox.x)+","+(-bbox.y)+")";
        cloneDistance = h;
        crawlDistance = bbh + h;
    } else {
        vbh = h = bbh;
        w = bbox.width*scale_factor;
        scaleTransform = "scale("+scale_factor+") translate("+(-bbox.x)+","+(-bbox.y)+")";
        cloneDistance = w;
        crawlDistance = bbw + w;
    }
    crawl.setAttribute( "transform", scaleTransform );
    var unitsPerSecond = vbh * ctx.speed;
    if ( ctx.smooth )
        unitsPerSecond = jSignage.smoothMotion( unitsPerSecond, ctx.deviceRefreshRate, ctx.devicePixelSize );
    var crawlDur = crawlDistance/unitsPerSecond;
    var delay=(cloneDistance+ctx.spacing*vbh)/unitsPerSecond;
    var attr = {
        attributeName: 'transform',
        type: 'translate',
        additive: 'sum',
        begin: 'indefinite',
        fill: 'freeze',
        dur: crawlDur
    };
    if ( ctx.vertical ) {
        if ( ctx.leftToRight ) {
            attr.from = '0,-'+cloneDistance/scale_factor;
            attr.by = '0,'+crawlDistance/scale_factor;
        } else {
            attr.from = '0,'+bbh/scale_factor;
            attr.by = '0,-'+crawlDistance/scale_factor;
        }
    } else {
        if ( ctx.leftToRight ) {
            attr.from = '-'+cloneDistance/scale_factor+',0';
            attr.by = ''+crawlDistance/scale_factor+',0';
        } else {
            attr.from = bbw/scale_factor+',0';
            attr.by = '-'+crawlDistance/scale_factor+',0';
        }
    }
    var anim = jSignage.svgAnimation( crawl, 'animateTransform', attr );
    timingElement.setAttribute( 'begin', 'indefinite' );   
    jSignage.addInnerLayerOwnSize( crawlerG2, crawl, bbox.width, bbox.height );
    jSignage.beginLayerAt( timingElement );
    jSignage.beginAnimation( anim, 0, function() {
        crawlerG2.removeChild( crawl );
        if ( crawlerG2.lastElementChild.localName=='clipPath' ) {
            ctx.active = false;
            ctx.layer.hide();
        }
    });
    jSignage.setTimeout( function() {
        new_crawl( ctx, index+1, crawlerG2, bbw, bbh );
    }, delay*1000 );
    ctx.idleing = false;
}

function playlistElementToSVG( index, element ) {
    var media;
    if ( typeof(element)=="string" ) {
        media = jSignage.media({ href: element });
    } else {
        var attr = { href: element.href };
        if ( 'dur' in element )
            attr.dur = element.dur;
        media = jSignage.media( attr );
        if ( element.transition )
            media.transition = element.transition;
    }
    return media;
}

function table_next( ctx, order ) {
    var secondary = false;
    if ( order=='rightToLeft' ) {
        if ( ctx.col > 0 ) {
            ctx.col--;
        } else {
            ctx.col = ctx.columns-1;
            secondary = true;
        }
    } else if ( order=='topToBottom' ) {
        if ( ctx.row+1 < ctx.rows ) {
            ctx.row++;
        } else {
            ctx.row = 0;
            secondary = true;
        }
    } else if ( order=='bottomToTop' ) {
        if ( ctx.row > 0 ) {
            ctx.row--;
        } else {
            ctx.row = ctx.rows-1;
            secondary = true;
        }
    } else {
        if ( ctx.col+1 < ctx.columns ) {
            ctx.col++;
        } else {
            ctx.col = 0;
            secondary = true;
        }
    }
    return secondary;
}

function table_cells( ctx, g, width, height ) {
    var delay=0;
    while ( true ) {
        var d = null, layer = null;
        if ( ctx.data ) {
            if ( ctx.data2D ) {
                if ( ctx.primaryOrder=='leftToRight' || ctx.primaryOrder=='rightToLeft' ) {
                    if ( ctx.row < ctx.data.length )
                        d = ctx.data[ctx.row][ctx.col];
                    else
                        return;
                } else {
                    if ( ctx.col < ctx.data.length )
                        d = ctx.data[ctx.col][ctx.row];
                    else
                        return;
                }
            } else if ( ctx.idx < ctx.data.length ) {
                d = ctx.data[ctx.idx];
            } else {
                return;
            }
        }
        if ( d && d.jsignage ) {
            layer = d;
        } else if ( ctx.renderToSVG && ( !ctx.data2D || d ) ) {
            if ( ctx.primaryOrder=='leftToRight' || ctx.primaryOrder=='rightToLeft' )
                layer = ctx.renderToSVG.call( d, ctx.col, ctx.row, d );
            else
                layer = ctx.renderToSVG.call( d, ctx.row, ctx.col, d );
        }
        if ( layer && layer.jsignage && layer[0] ) {
            var x = (ctx.col*width)/ctx.columns, y = (ctx.row*height)/ctx.rows;
            var w = width/ctx.columns, h = height/ctx.rows, padx = 0, pady = 0;
            if ( ctx.columnPaddingRel )
                padx = w*ctx.columnPadding/100;
            else
                padx = ctx.columnPadding;
            if ( ctx.rowPaddingRel )
                pady = h*ctx.rowPadding/100;
            else
                pady = ctx.rowPadding;
            var pad = ctx.cellPaddingRel ? (width>height ? width : height)*ctx.cellPadding/100 : ctx.cellPadding;
            padx += pad;
            pady += pad;
            jSignage.kickInnerLayer( g, width, height, layer[0], x+padx/2, y+pady/2, w-padx, h-pady );
        }
        ctx.idx++;
        if ( table_next( ctx, ctx.primaryOrder ) ) {
            if ( table_next( ctx, ctx.secondaryOrder ) )
                return;
            if ( ctx.secondaryDelay ) {
                delay = ctx.delay+ctx.secondaryDelay;
                break;
            }
        }
        if ( ctx.delay ) {
            delay = ctx.delay;
            break;
        }
    }
    if ( delay ) {
        jSignage.setTimeout( function() {
            table_cells( ctx, g, width, height );
        }, delay*1000 );
    }
}

var slideshowProps = [ 'data', 'renderToSVG', 'defaultTransition', 'defaultGap', 'delayedOut', 'minimumSlideDur', 'maximumSlideDur', 'defaultSlideDur', 'iterating' ];
var crawlerProps = [ 'data', 'renderToSVG', 'iterating' ];
var tableProps = [ 'data', 'rows', 'columns', 'primaryOrder', 'secondaryOrder', 'delay', 'secondaryDelay', 'cellPadding', 'columnPadding', 'rowPadding', 'renderToSVG' ];
var textProps = [ 'fontFamily', 'fontSize', 'fontStyle', 'fontWeight', 'fontVariant', 'fill', 'direction', 'unicodeBidi' ];
var fitTextFactorsCoarse = [ 1.5, 2, 3, 4, 6, 8, 12, 16 ];
var fitTextFactorsFine = [ 1.25, 4/3, 1.5, 2, 2.5, 3, 4, 6, 8, 10, 12, 16 ];
var scrollingTextAreaArgs = [ 'lines', 'lineDur', 'scrollDur', 'fontFamily', 'fontStyle', 'fontWeight', 'fontVariant', 'fill', 'direction', 'unicodeBidi', 'textAlign' ];
var textAreaArgs = [ 'begin', 'min', 'max', 'top', 'bottom', 'left', 'right', 'width', 'height', 'viewBox', 'transform', 'fontFamily', 'fontStyle', 'fontWeight', 'fontVariant', 'fill', 'direction', 'unicodeBidi', 'textAlign' ];

jSignage.pathData = function() {
    this.d = '';
};

jSignage.pathData.prototype = {
    toString: function() {
        return this.d;
    },

    moveTo: function( x, y ) {
        this.d += 'M'+x+' '+y;
        return this;
    },

    close: function() {
        this.d += 'Z';
        return this;
    },
    
    cmd: function( c, n, args ) {
        this.d += c;
        for ( var i=0; i+n<=args.length; i+=n )
            for ( var j=0; j<n; j++ )
                this.d += ' '+args[i+j];
    },

    lineTo: function() { this.cmd( 'L', 2, arguments ); return this; },
    curveTo: function() { this.cmd( 'C', 6, arguments ); return this; },
    smoothCurveTo: function() { this.cmd( 'S', 4, arguments ); return this; },
    quadTo: function() { this.cmd( 'Q', 4, arguments ); return this; },
    smoothQuadTo: function() { this.cmd( 'T', 2, arguments ); return this; },
    arcTo: function() { this.cmd( 'A', 7, arguments ); return this; }
};

jSignage.extend({

    shuffle: function( src, num ) {
        if ( num===undefined )
            num = src.length;
        var dst = new Array, j;
        if ( num > 0 ) {
            dst[0] = src[0];
            for ( var i=1; i<num; i++ ) {
                j = Math.floor( Math.random()*(i+1) );
                dst[i] = dst[j];
                dst[j] = src[i];
            }
        }
        return dst;
    },

    randomChoice: function( array ) {
        return array[ Math.floor( Math.random()*array.length ) ];
    },

    // Note: root is jSignage.getRealMediaTarget(this[0]) !
    kickInnerLayer: function( root, width, height, layer, x, y, w, h, anchor ) {
        var cell = jSignage.getRealMediaTarget( layer );
        cell.setAttributeNS( jSignage.spxNS, 'left', x );
        cell.setAttributeNS( jSignage.spxNS, 'top', y );
        cell.setAttributeNS( jSignage.spxNS, 'width', w );
        cell.setAttributeNS( jSignage.spxNS, 'height', h );
        cell.setAttributeNS( jSignage.spxNS, 'bottom', '' );
        cell.setAttributeNS( jSignage.spxNS, 'right', '' );
        var timingElement = jSignage.getTimingElement( cell );
        var offset = jSignage.durInSeconds( timingElement.getAttribute( 'begin' ), 0 );
        if ( anchor!==undefined )
            timingElement.setAttribute( 'begin', anchor+offset );
        else
            timingElement.setAttribute( 'begin', 'indefinite' );
        var action = jSignage.scheduleLayerAbsolute( timingElement );
        var g2 = jSignage.getG2(root);
        jSignage._calcLayout( layer, width, height, 0, g2 );
        g2.appendChild( layer );
        if ( action )
            jSignage.timeline.schedule( action );
        if ( anchor===undefined )
            jSignage.beginLayerAt( timingElement, offset );
    },

    // Note: root is jSignage.getRealMediaTarget(this[0]) !
    addInnerLayerOwnSize: function( root, layer, layerWidth, layerHeight ) {
        var child = jSignage.getRealMediaTarget( layer );
        var timingElement = jSignage.getTimingElement( child );
        var action = jSignage.scheduleLayer( root, timingElement );
        var g2 = jSignage.getG2(root);
        jSignage._calcLayout( layer, layerWidth, layerHeight, true, g2 );
        g2.appendChild( layer );
        if ( action )
            jSignage.timeline.schedule( action );
    },

    slideshow: function( args, args2 ) {
        var ctx = { };
        if ( args )
            jSignage.copyProps( args, ctx, slideshowProps );
        if ( args2 )
            jSignage.copyProps( args2, ctx, slideshowProps );
        if ( args )
            jSignage.setLoopingInfo( args, ctx );
        ctx.iteration = 0;
        var layer = jSignage.customLayer( 'slideshow', args, ctx );
        ctx.layer = layer;
        var slideShowTiming = jSignage.getTimingElement( layer[0] );
        var g2 = jSignage.getG2( layer[0] );
        layer.beginEvent( function() {
            ctx.active = true;
            if ( ctx.looping )
                ctx.loopCount = ctx.reloadLoopCount;
            new_slide( ctx, 0, g2, slideShowTiming );
        });
        layer.pushData = function() {
            if ( !ctx.data || !ctx.active )
                ctx.data = [];
            ctx.data = ctx.data.concat.apply( ctx.data, arguments );
            if ( !ctx.active && ctx.data && ctx.data.length ) {
                ctx.active = true;
                layer.show();
            }
        };
        return layer;
    },

    playlist: function( args ) {
        var args2 = {
            renderToSVG: playlistElementToSVG
        };
        args2.defaultSlideDur = args.defaultDur || 5;
        if ( 'minimumDur' in args )
          args2.minimumSlideDur = args.minimumDur;
        if ( 'maximumDur' in args )
          args2.maximumSlideDur = args.maximumDur;
        return jSignage.slideshow( args, args2 );
    },

    textBar: function( args ) {
        var argsSTA = { };
        jSignage.copyProps( args, argsSTA, scrollingTextAreaArgs );
        var argsSS = {
            renderToSVG: function( index, element ) {
                var text = args.renderToText ? args.renderToText.call( element, index, element ) : element;
                return jSignage.scrollingTextArea( argsSTA ).text( text );
            },
            defaultTransition: args.transition || jSignage.push({ direction: 'bottomToTop' })
        };
        return jSignage.slideshow( args, argsSS );        
    },

    crawler: function( args, args2 ) {
        var svg = document.documentElement;
        var ctx = {
            vertical: args && ( args.direction=='bottomToTop' || args.direction=='topToBottom' ),
            leftToRight: args && ( args.direction=='leftToRight' || args.direction=='topToBottom' ),
            devicePixelSize: 1,
            deviceRefreshRate: svg.getDeviceRefreshRate && svg.getDeviceRefreshRate() || 60,
            speed: 1,
            smooth: args && 'smooth' in args ? args.smooth : true,
            spacing: 0.2
        };
        if ( args )
            jSignage.copyProps( args, ctx, crawlerProps );
        if ( args2 )
            jSignage.copyProps( args2, ctx, crawlerProps );
        ctx.devicePixelSize = jSignage.getDevicePixelSize( ctx.vertical );
        var speed = parseFloat( args2 && args2.speed || args.speed );
        if ( !isNaN(speed) && speed>0 )
            ctx.speed = speed/100;
        var spacing = parseFloat( args2 && 'spacing' in args2 ? args2.spacing : args && args.spacing );
        if ( !isNaN(spacing) && spacing>=0 )
            ctx.spacing = spacing/100;
        if ( args )
            jSignage.setLoopingInfo( args, ctx );
        ctx.iteration = 0;
        var crawlerG2 = null, crawlerWidth = null, crawlerHeight = null;
        var layer = jSignage.customLayer( 'crawler', args, ctx, function( width, height ) {
            crawlerG2 = this;
            crawlerWidth = width;
            crawlerHeight = height;
            jSignage.setClipRect( crawlerG2, 0, 0, crawlerWidth, crawlerHeight );
            layer.beginEvent( function() {
                ctx.active = true;
                ctx.idleing = false;
                if ( ctx.looping )
                    ctx.loopCount = ctx.reloadLoopCount;
                new_crawl( ctx, 0, crawlerG2, crawlerWidth, crawlerHeight );
             } );
        } );
        ctx.layer = layer;
        var crawlerTiming = jSignage.getTimingElement( layer[0] );

        layer.pushData = function() {
            if ( !ctx.data || !ctx.active || ctx.idleing )
                ctx.data = [];
            ctx.data = ctx.data.concat.apply( ctx.data, arguments );
            if ( ctx.data && ctx.data.length ) {
                if ( !ctx.active ) {
                    ctx.active = true;
                    ctx.idleing = false;
                    layer.show();
                } else if ( ctx.idleing ) {
                    if ( ctx.looping )
                        ctx.loopCount = ctx.reloadLoopCount;
                    new_crawl( ctx, 0, crawlerG2, crawlerWidth, crawlerHeight );
                }
            }
        };

        layer.active = function() {
            return ctx.active;
        };

        layer.idleTime = function() {
            return ctx.active && ctx.idleing ? 1000*(jSignage.getCurrentTime() - ctx.idleStart) : 0;
        };

        return layer;
    },

    textTicker: function( args ) {
        var baseLine = parseFloat(''+args.baseLine);
        var vertical = args.direction=='topToBottom' || args.direction=='bottomToTop';
        var fontSizeFactor = isNaN(baseLine) ? vertical ? 0.9 : 0.7 : 1 - baseLine/100;
        var lines = vertical ? args.lines || 5 : 1;

        var textAreaAttr = {
            displayAlign: 'before',
            textAlign : vertical && args.textAlign || 'start'
        };

        jSignage.copyProps( args, textAreaAttr, textProps );

        return jSignage.crawler( args, {
            spacing: ( 'spacing' in args ? args.spacing : 50 ) / lines,
            speed: ( args.speed || 100 ) / lines,
            renderToSVG: function( index, element, width, height ) {
                var text = args.renderToText ? args.renderToText.call( element, index, element ) : element;
                if ( vertical ) {
                    textAreaAttr.width = width;
                    textAreaAttr.height = 'auto';
                    textAreaAttr.lineIncrement = height / lines;
                    textAreaAttr.fontSize = textAreaAttr.lineIncrement * fontSizeFactor;
                } else {
                    textAreaAttr.width = 'auto';
                    textAreaAttr.height = height;
                    textAreaAttr.fontSize = height * fontSizeFactor;
                }
                var layer = jSignage.textArea( textAreaAttr ).text( text );
                if ( vertical )
                    layer[0].setAttributeNS( null, 'width', width );
                return layer;
            }
        } );
    },

    mediaCrawler: function( args ) {
        return jSignage.crawler( args, {
            renderToSVG: function( index, element ) {
                return jSignage.media({
                    href: args.renderToURI ? args.renderToURI.call( element, index, element ) : element,
                    width: args.mediaWidth || 160,
                    height: args.mediaHeight || 90
                });
            }
        } );
    },

    table: function( args, args2 ) {
        var ctx = {
            data: null,
            rows: 1,
            columns: 1,
            delay: 0,
            secondaryDelay: 0,
            cellPadding: 0,
            cellPaddingRel: false,
            columnPadding: 0,
            columnPaddingRel: false,
            rowPadding: 0,
            rowPaddingRel: false,
            renderToSVG: null,
            data2D: false,
            idx: 0
        };
        jSignage.copyProps( args, ctx, tableProps );
        if ( args2 )
            jSignage.copyProps( args2, ctx, tableProps );
        if ( !ctx.primaryOrder )
            ctx.primaryOrder = ctx.columns==1 && ctx.rows>1 ? 'topToBottom' : 'leftToRight';
        if ( !ctx.secondaryOrder )
            ctx.secondaryOrder = ctx.primaryOrder=='leftToRight' || ctx.primaryOrder=='rightToLeft' ? 'topToBottom' : 'leftToRight';
        if ( ctx.data && jSignage.isArray(ctx.data) && ctx.data.length>0 && jSignage.isArray(ctx.data[0]) )
            ctx.data2D = true;
        if ( !ctx.rows || ctx.rows < 1 )
            ctx.rows = 1;
        if ( !ctx.columns || ctx.columns < 1 )
            ctx.columns = 1;
        if ( ctx.primaryOrder=='rightToLeft' || ctx.secondaryOrder=='rightToLeft' )
            ctx.col = ctx.columns-1;
        else
            ctx.col = 0;
        if ( ctx.primaryOrder=='bottomToTop' || ctx.secondaryOrder=='bottomToTop' )
            ctx.row = ctx.rows-1;
        else
            ctx.row = 0;
        if ( ctx.cellPadding ) {
            var spec = ''+ctx.cellPadding;
            ctx.cellPadding = parseFloat(spec);
            if ( spec.charAt(spec.length-1)=='%' )
                ctx.cellPaddingRel = true;
            if ( isNaN(ctx.cellPadding) || ctx.cellPadding<0 )
                ctx.cellPadding = 0;
        }
        if ( ctx.columnPadding ) {
            var spec = ''+ctx.columnPadding;
            ctx.columnPadding = parseFloat(spec);
            if ( spec.charAt(spec.length-1)=='%' )
                ctx.columnPaddingRel = true;
            if ( isNaN(ctx.columnPadding) || ctx.columnPadding<0 )
                ctx.columnPadding = 0;
        }
        if ( ctx.rowPadding ) {
            var spec = ''+ctx.rowPadding;
            ctx.rowPadding = parseFloat(spec);
            if ( spec.charAt(spec.length-1)=='%' )
                ctx.rowPaddingRel = true;
            if ( isNaN(ctx.rowPadding) || ctx.rowPadding<0 )
                ctx.rowPadding = 0;
        }
        var layer = jSignage.customLayer( 'table', args, null, function( width, height ) {
            var tableElement = this;
            layer.beginEvent( function() {
                table_cells( ctx, tableElement, width, height );
            });
        });
        return layer;
    },

    fitTextArea: function( args ) {
        var factors = fitTextFactorsFine;

        if ( args && 'factors' in args ) {
            if ( args.factors=='fine' )
                factors = fitTextFactorsFine;
            else if ( args.factors=='coarse' )
                factors = fitTextFactorsCoarse;
            else if ( jSignage.isArray(args.factors) )
                factors = args.factors;
        }

        var layer = jSignage.textArea( args, 'fitTextArea', function( textArea, width, height, x, y, bbw, bbh, parent ) {
            var textHeight = jSignage.getTextAreaHeight( textArea, parent ), i, f = 1;
            for ( i=0; i<factors.length && textHeight > height*f; i++ ) {
                f = factors[i];
                textArea.setAttribute( 'transform', 'scale('+(1/f)+')' );
                textArea.setAttribute( 'width', width*f );                
                textHeight = jSignage.getTextAreaHeight( textArea, parent )
            }
            textArea.setAttribute( 'height', height*f );
        });
        return layer;
    },

    headlineTextArea: function( args ) {
        var scaleMethod = args && args.scaleMethod;
        var layer = jSignage.textArea( args, 'headlineTextArea', function( textArea, width, height, x, y, bbw, bbh, parent ) {
            textArea.setAttribute( 'font-size', height );
            textArea.setAttribute( 'line-increment', height/1.2 );
            var w = jSignage.getTextAreaWidth( textArea, parent );
            if ( w <= 0 )
                return;
            var f = width / w;
            if ( f  < 1 ) {
                if ( scaleMethod==='uniform' ) {
                    textArea.setAttribute( 'transform', 'scale('+f+')' );
                    textArea.setAttribute( 'height', height/f );
                } else {
                    textArea.setAttribute( 'transform', 'scale('+f+',1)' );
                }
                w = jSignage.getTextAreaWidth( textArea, parent );
                f = width / w * 0.99;
                if ( scaleMethod==='uniform' ) {
                    textArea.setAttribute( 'transform', 'scale('+f+')' );
                    textArea.setAttribute( 'height', height/f );
                } else {
                    textArea.setAttribute( 'transform', 'scale('+f+',1)' );
                }
                textArea.setAttribute( 'width', width/f );
            }
        });
        return layer;
    },

    scrollingTextArea: function( args ) {
        var repeatDur, repeatCount;
        if ( args ) {
            repeatDur = args.repeatDur!==undefined ? args.repeatDur : args.dur;
            repeatCount = args.repeatCount;
        }
        var lines = args && args.lines || 1;
        var lineDur = jSignage.durInSeconds( args && args.lineDur, 1.5 )
        var scrollDur = jSignage.durInSeconds( args && args.scrollDur, 0.5 )
        var args2 = {
            dur: 'indefinite'
        };
        jSignage.copyProps( args, args2, textAreaArgs );

        var layer = jSignage.textArea( args2, 'scrollingTextArea', function( textArea, width, height, x, y, bbw, bbh, parent ) {
            var lineIncrement = height/lines;
            textArea.setAttribute( 'line-increment', lineIncrement );
            textArea.setAttribute( 'font-size', lineIncrement/1.2 );
            var offset = -lineIncrement*0.21;
            var h = jSignage.getTextAreaHeight( textArea, parent );
            textArea.setAttribute( 'height', 'auto' );
            var totalLines = Math.round( h / lineIncrement );
            var totalDur = lines * lineDur;
            if ( totalLines > lines )
                totalDur += (totalLines-lines)*(scrollDur+lineDur);
            var values = [ '0,'+offset ];
            var keyTimes = [ 0 ];
            for ( var i=lines; i<totalLines; i++ ) {
                values.push( '0,'+(-lineIncrement*(i-lines)+offset) );
                keyTimes.push( (lineDur*i+scrollDur*(i-lines))/totalDur );
                values.push( '0,'+(-lineIncrement*(i+1-lines)+offset) );
                keyTimes.push( (lineDur*i+scrollDur*(i-lines+1))/totalDur );
            }
            if ( totalLines > lines )
                values.push( '0,'+(-lineIncrement*(totalLines-lines)+offset) );
            else
                values.push( '0,'+offset );
            keyTimes.push( 1 );
            var motion = {
                attributeName: 'transform',
                type: 'translate',
                additive: 'sum',
                values: values.join(';'),
                keyTimes: keyTimes.join(';'),
                dur: totalDur,
                begin: timingElement.id+'.begin',
                fill: 'freeze'
            };
            if ( repeatCount!==undefined )
                motion.repeatCount = repeatCount;
            if ( repeatDur !==undefined )
                motion.repeatDur = repeatDur;
            var gg = jSignage.getGG( textArea );
            var id = gg.id
            if ( !id )
                gg.id = id = jSignage.guuid();
            motion.href = '#'+id;
            jSignage.svgAnimation( this, 'animateTransform', motion, function() {
                layer.end();
            });
            jSignage.setClipRect( this, 0, 0, width, height );
        });
        var timingElement = jSignage.getTimingElement( jSignage.getRealMediaTarget( layer[0] ) );
        return layer;
    },
    
    smoothMotion: function( unitsPerSecond, deviceRefreshRate, devicePixelSize ) {
        var pixelsPerRefresh = unitsPerSecond/deviceRefreshRate*devicePixelSize;
        if ( pixelsPerRefresh > 0.5 )
            pixelsPerRefresh = Math.ceil( pixelsPerRefresh );
        else
            pixelsPerRefresh = 1 / Math.floor( 1/pixelsPerRefresh );
        return pixelsPerRefresh*deviceRefreshRate/devicePixelSize;
    },

    pingPongTextArea: function( args ) {
        var direction = args && args.direction || 'rightToLeft';
        var horizontal = direction!='topToBottom' && direction!='bottomToTop';
        var speed = parseFloat( ''+(args && args.speed) );
        if ( isNaN(speed) ) speed = 1; else speed /= 100;
        var backSpeed = parseFloat( ''+(args && args.backSpeed) );
        if ( isNaN(backSpeed) ) backSpeed = speed; else backSpeed /= 100;
        var delay = jSignage.durInSeconds( args && args.delay, 0.5 );
        var backDelay = jSignage.durInSeconds( args && args.backDelay, delay );
        var smooth = args && 'smooth' in args ? args.smooth : true;
        var scrollBack = args && args.scrollBack || false;
        var svg = document.documentElement;
        var deviceRefreshRate = svg.getDeviceRefreshRate && svg.getDeviceRefreshRate() || 60;
        var devicePixelSize = jSignage.getDevicePixelSize( !horizontal );

        var layer = jSignage.textArea( args, 'pingPongTextArea', function( textArea, width, height, x, y, bbw, bbh, parent ) {
            var bbox = (horizontal ? jSignage.getTextAreaWidth : jSignage.getTextAreaHeight)( textArea, parent );
            var dist = horizontal ? bbox-width : bbox-height;
            if ( dist > 0 ) {
                // Add some margin for text layout errors.
                var plus = devicePixelSize*2;
                dist += plus;

                var x1=0, y1=0, x2=0, y2=0;
                if ( direction=='leftToRight' )
                    x1 = -dist;
                else if ( direction=='topToBottom' )
                    y1 = -dist;
                else if ( direction=='bottomToTop' )
                    y2 = -dist;
                else
                    x2 = -dist;

                var unitsPerSecond = height*speed;
                if ( smooth )
                    unitsPerSecond = jSignage.smoothMotion( unitsPerSecond, deviceRefreshRate, devicePixelSize );
                var forwardDur = dist/unitsPerSecond, backwardDur;
                if ( speed==backSpeed ) {
                    backwardDur = forwardDur;
                } else {
                    unitsPerSecond = height*backSpeed;
                    if ( smooth )
                        unitsPerSecond = jSignage.smoothMotion( unitsPerSecond, deviceRefreshRate, devicePixelSize );
                    backwardDur = dist/unitsPerSecond;
                }

                var values = [ x1+' '+y1 ], keyTimes = [ 0 ], dur = 0;
                if ( delay ) {
                    values.push( +x1+' '+y1 );
                    keyTimes.push( dur += delay );
                }
                values.push( x2+' '+y2 );
                keyTimes.push( dur += forwardDur );
                if ( backDelay ) {
                    values.push( x2+' '+y2 );
                    keyTimes.push( dur += backDelay );
                }
                if ( scrollBack ) {
                    values.push( x1+' '+y1 );
                    keyTimes.push( dur += backwardDur );
                }
                for ( var i=0; i<keyTimes.length; i++ )
                    keyTimes[i] /= dur;

                var timingElement = jSignage.getTimingElement( layer[0] );
                var gg = jSignage.getGG( textArea );
                var id = gg.id
                if ( !id )
                    gg.id = id = jSignage.guuid();
                jSignage.svgAnimation( this, 'animateTransform', {
                    attributeName: 'transform',
                    type: 'translate',
                    additive: 'sum',
                    values: values.join( ';' ),
                    keyTimes: keyTimes.join( ';' ),
                    begin: timingElement.id+'.begin',
                    dur: dur,
                    repeatCount: 'indefinite',
                    href: '#'+id
                });
                if ( horizontal )
                    textArea.setAttribute( 'width', bbox+plus );
                else
                    textArea.setAttribute( 'height', bbox+plus );
                if ( horizontal )
                    jSignage.setClipRect( this, 0, -height, width, 3*height );
                else
                    jSignage.setClipRect( this, -width, 0, 3*width, height );
            } else {
                if ( horizontal )
                    textArea.setAttribute( 'width', width );
                else
                    textArea.setAttribute( 'height', height );
            }
        });
        return layer;
    },

    multiPage: function( args ) {
        var obj = jSignage.customLayer( 'multiPage', args );
        obj.currentPageTimingElement = null;

        obj.switchPage = function( layer, transition ) {
            var trans = transition || args.defaultTransition || null;
            if ( obj.currentPageTimingElement ) {
                jSignage.endLayerAt( obj.currentPageTimingElement );
                obj.currentPageTimingElement = null;
            }
            if ( layer && layer.jsignage && layer.length>0 ) {
                var timingElement = jSignage.getTimingElement( jSignage.getRealMediaTarget( layer[0] ) );
                obj.currentPageTimingElement = timingElement;
                multi_page_switch( obj.g2(), layer[0], trans, obj.currentPageTimingElement, 0, false, args.pageEnded ? function() {
                    // Check the page was not ended as a result of calling .switchPage()
                    if ( timingElement==obj.currentPageTimingElement )
                        args.pageEnded.call( obj );
                } : null );
            } else {
                multi_page_switch( obj.g2(), null, trans, null, 0, false, null );
            }
        }
        return obj;
    },

    widgetClass: jSignage.subclass(
        function( args ) {
            this.overlay = null;    // Handle to overlay rect that captures all pointer events
            this.attach = null;     // Handle to parent group element where graphic elements are attached
            this.dragging = false;
        }, {

        postLayout: function( g, width, height ) {
            jSignage.setClipRect( g, 0, 0, width, height );
            this.attach = jSignage._createElement( 'g' );
            this.overlay = jSignage._createElement( 'rect', {
                width: width,
                height: height,
                fill: 'none',
                stroke: 'none',
                'pointer-events': 'fill'
            });
            g.appendChild( this.attach );
            g.appendChild( this.overlay );        
            var obj=this;

            var drag = obj.dragStart || obj.drag || obj.dragStop;

            if ( obj.mouseDown || drag ) {
                obj.overlay.addEventListener( 'mousedown', function(ev) {
                    var click = jSignage.getLocalCoord( obj.overlay, ev.clientX, ev.clientY );
                    if ( obj.mouseDown )
                        obj.mouseDown( ev, click.x, click.y );
                    if ( ev.button==0 ) {
                        obj.dragging = true;
                        obj.dragX = click.x;
                        obj.dragY = click.y;
                        if ( obj.dragStart )
                            obj.dragStart( ev, click.x, click.y );
                    }    
                });
            }

            if ( obj.mouseUp || drag ) {
                obj.overlay.addEventListener( 'mouseup', function(ev) {
                    var click = jSignage.getLocalCoord( obj.overlay, ev.clientX, ev.clientY );
                    if ( obj.mouseUp )
                        obj.mouseUp( ev, click.x, click.y );
                    if ( ev.button==0 && obj.dragging ) {
                        obj.dragging = false;
                        if ( obj.dragStop )
                            obj.dragStop( ev, click.x, click.y );
                    }
                });
            }

            if ( obj.mouseOut || drag ) {
                obj.overlay.addEventListener( 'mouseout', function(ev) {
                    if ( obj.mouseOut )
                        obj.mouseOut(ev);
                    if ( obj.dragging ) {
                        obj.dragging = false;
                        if ( obj.dragStop )
                            obj.dragStop( ev, null, null );
                    }
                });
            }

            if ( obj.mouseMove || drag ) {
                obj.overlay.addEventListener( 'mousemove', function(ev) {
                    var click = jSignage.getLocalCoord( obj.overlay, ev.clientX, ev.clientY );
                    if ( obj.mouseMove )
                        obj.mouseMove( ev, click.x, click.y );
                    if ( obj.dragging ) {
                        var rx = click.x-obj.dragX;
                        var ry = click.y-obj.dragY;
                        obj.dragX = click.x;
                        obj.dragY = click.y;
                        if ( obj.drag )
                            obj.drag( rx, ry );
                    }
                });
            }

            if ( obj.mouseClick ) {
                obj.overlay.addEventListener( 'click', function(ev) {
                    var click = jSignage.getLocalCoord( obj.overlay, ev.clientX, ev.clientY );
                    obj.mouseClick( ev, click.x, click.y );
                });
            }
        }
    })
});

jSignage.extend({
    scrollArea: function( args ) {
        return new jSignage.scrollAreaClass( 'scrollArea', args );
    },

    scrollAreaClass: jSignage.subclass(
        jSignage.widgetClass,
        function( args ) {
            this.scrollX = 0;
            this.scrollY = 0;
            this.child = null;
            this.visibleWidth = 0;
            this.visibleHeight = 0;
            this.childWidth = 0;
            this.childHeight = 0;
        }, {

        postLayout: function( g, width, height ) {
            jSignage.widgetClass.prototype.postLayout.call( this, g, width, height );
            this.visibleWidth = width;
            this.visibleHeight = height;
            if ( this.child )
                jSignage.addInnerLayerOwnSize( this.attach, this.child, this.childWidth, this.childHeight )
        },

        add: function( layer ) {
            if ( this.child ) {
                if ( this.child.parentNode )
                    this.child.parentNode.removeChild( child );
                this.child = null;
            }
            if ( !layer.jsignage || !layer[0] )
                return;
            var child = layer[0];
            var bbox = jSignage.getBBox( jSignage.getRealMediaTarget( child ), this.attach );
            if ( !bbox || bbox.width<=0 || bbox.height<=0 )
                return;
            this.child = child;
            this.childWidth = bbox.width;
            this.childHeight = bbox.height;
            if ( this.visibleWidth && this.visibleHeight )
                jSignage.addInnerLayerOwnSize( this.attach, this.child, this.childWidth, this.childHeight );
            return this;
        },

        scrollTo: function( scrollX, scrollY ) {
            if ( scrollX+this.visibleWidth > this.childWidth )
                scrollX = this.childWidth - this.visibleWidth;
            if ( scrollX < 0 )
                scrollX = 0;
            if ( scrollY+this.visibleHeight > this.childHeight )
                scrollY = this.childHeight - this.visibleHeight;
            if ( scrollY < 0 )
                scrollY = 0;
            this.scrollX = scrollX;
            this.scrollY = scrollY;
            jSignage.getRealMediaTarget( this.child ).setAttribute( 'transform', 'translate('+(-scrollX)+','+(-scrollY)+')' );
        },

        drag: function( pixOffsetX, pixOffsetY ) {
            this.scrollTo( this.scrollX-pixOffsetX, this.scrollY-pixOffsetY );
        }
    }),

    carousel: function( args ) {
        if ( !args || !args.data || !args.data.length || !args.renderToSVG )
            return;
        var type = args.type || 'strip';
        if ( type=='strip' )
            return new jSignage.stripCarouselClass( 'carousel', args );
        else if ( type=='wheel' )
            return new jSignage.wheelCarouselClass( 'carousel', args );
        else if ( type=='roller' )
            return new jSignage.rollerCarouselClass( 'carousel', args );
        else if ( type=='squeeze' )
            return new jSignage.squeezeCarouselClass( 'carousel', args );
        else if ( type=='electron' )
            return new jSignage.electronCarouselClass( 'carousel', args );
        throw "Invalid carousel type: "+type;
    },

    carouselClass: jSignage.subclass(
        jSignage.widgetClass,
        function( args ) {
            this.data = args.data;
            this.renderToSVG = args.renderToSVG;
            this.numVisible = args.numVisible || 3;
            this.pixPosition = 0;   // Pixel position inside the sliding window. 0 means first image is in the center spot.
            this.pixSlide = 0;      // Number of pixel from one slide position to the next.
            this.maxPixPosition = 0;// Max pixel position, i.e. when the list image is in the center spot.
            this.idxToSVG = { };    // Cache of handle to SVG code for each data index
            this.anim = null;       // Handle to running animation or null
            this.animTimeout = null;
            this.slideWidth = 0;    // Vignette nominal width, i.e. when the slide is in the center spot
            this.slideHeight = 0;   // Vignette nominal height
            this.initialSlide = args.initialSlide || 0;
            this.looping = args.looping || false;
            this.spacing = jSignage.getPercent( args.spacing, 0.1 );
            var dir = args.direction || 'leftToRight';
            this.vertical = dir=='topToBottom' || dir=='bottomToTop';
            this.horizontal = !this.vertical;
            this.reverse = dir=='rightToLeft' || dir=='bottomToTop';
        }, {

        setWH : function( width, height ) {
            if ( this.horizontal ) {
                this.width = width;
                this.height = height;
            } else {
                this.width = height;
                this.height = width;
            }
        },

        postLayout: function( g, width, height ) {
            jSignage.widgetClass.prototype.postLayout.call( this, g, width, height );
            var self = this;
            this.beginEvent( function() {
                self.pixPosition = self.pixSlide * self.initialSlide;
                self._place( self.firstVisibleIdxR( self.pixPosition ), self.lastVisibleIdxR( self.pixPosition ) );
            });
        },

        next: function() {
            this._land( 1 );
        },

        previous: function() {
            this._land( -1 );
        },

        dragStop: function() {
            this._land( 0 );
        },

        drag: function( pixOffsetX, pixOffsetY ) {
            this._cancelAnimation();
            var offset = this.horizontal ? pixOffsetX : pixOffsetY;
            if ( this.reverse )
                offset = -offset;
            var newPixPosition = this.pixPosition - offset;
            if ( !this.looping ) {
                if ( newPixPosition < 0 )
                    newPixPosition = 0;
                else if ( newPixPosition > this.maxPixPosition )
                    newPixPosition = this.maxPixPosition;
            }
            this.pixPosition = newPixPosition;
            var idxFirst = this.firstVisibleIdxR( this.pixPosition );
            var idxLast = this.lastVisibleIdxR( this.pixPosition );
            this._place( idxFirst, idxLast );
            this._reap( idxFirst, idxLast );
        },

        _startAnimation: function( anim, removeAfter ) {        
            this.anim = anim;
            if ( jSignage.isArray( this.anim ) )
                for ( var i=0; i<this.anim.length; i++ )
                    jSignage.beginAnimation( this.anim[i] );
            else
                jSignage.beginAnimation( this.anim );
            if ( this.animTimeout ) {
                jSignage.clearTimeout( this.animTimeout );
                this.animTimeout = null;
            }
            var obj = this;
            this.animTimeout = jSignage.setTimeout( function() {
                obj._cancelAnimation();
                obj._reap( obj.firstVisibleIdxR( obj.pixPosition ), obj.lastVisibleIdxR( obj.pixPosition ) );
            }, removeAfter*1000 );
        },

        _cancelAnimation: function() {
            if ( this.anim ) {
                if ( jSignage.isArray( this.anim ) )
                    for ( var i=0; i<this.anim.length; i++ )
                        jSignage.removeAnimation( this.anim[i] );
                else
                    jSignage.removeAnimation( this.anim );
                if ( this.animTimeout ) {
                    jSignage.clearTimeout( this.animTimeout );
                    this.animTimeout = null;
                }
                this.anim = null;
            }
        },

        _reap: function( idxLeft, idxRight ) {
            for ( var i in this.idxToSVG ) if ( i<idxLeft || i>idxRight ) {
                if ( this.idxToSVG[i] )
                    this.attach.removeChild( this.idxToSVG[i] );
                delete this.idxToSVG[i];
            }
        },

        _placeSlide: function( i, cx, cy, sx, sy, opacity, zOrder ) {
            if ( this.idxToSVG[i]===undefined ) {
                var idx;
                if ( this.looping ) {
                    idx = i % this.data.length;
                    if ( idx < 0 )
                        idx += this.data.length
                } else {
                    idx = i;
                }
                var layer = this.renderToSVG.call( this.data[idx], idx, this.data[idx] );
                if ( layer && layer.jsignage && layer[0] ) {
                    var gt = jSignage._createElement( 'g' );
                    gt.id = jSignage.guuid();
                    this.attach.appendChild( gt );
                    var gs = jSignage._createElement( 'g' );
                    gs.id = jSignage.guuid();
                    gt.appendChild( gs );
                    if ( this.horizontal )
                        jSignage.kickInnerLayer( gs, this.width, this.height, layer[0], -this.slideWidth/2, -this.slideHeight/2, this.slideWidth, this.slideHeight, jSignage.getCurrentTime() );
                    else
                        jSignage.kickInnerLayer( gs, this.height, this.width, layer[0], -this.slideHeight/2, -this.slideWidth/2, this.slideHeight, this.slideWidth, jSignage.getCurrentTime() );
                    this.idxToSVG[i] = gt;
                } else {
                    this.idxToSVG[i] = null;
                }
            }
            var s = this.idxToSVG[i];
            if ( s ) {
                var next = s.nextElementSibling;
                if ( next ) {
                    var zn = parseFloat( next.getAttributeNS( jSignage.spxNS, 'zOrder' ) );
                    if ( zOrder > zn ) {
                        for ( var ib = next.nextElementSibling; ib; ib=ib.nextElementSibling )
                            if ( parseFloat( ib.getAttributeNS( jSignage.spxNS, 'zOrder' ) ) >= zOrder )
                                break;
                        this.attach.insertBefore( s, ib );
                    }
                }
                var prev = s.previousElementSibling;
                if ( prev ) {
                    var zp = parseFloat( prev.getAttributeNS( jSignage.spxNS, 'zOrder' ) );
                    if ( zOrder < zp ) {
                        for ( var ib = prev; ib.previousElementSibling; ib=ib.previousElementSibling )
                            if ( parseFloat( ib.previousElementSibling.getAttributeNS( jSignage.spxNS, 'zOrder' ) ) <= zOrder )
                                break;                               
                        this.attach.insertBefore( s, ib );
                    }
                }
                if ( this.reverse )
                    cx = this.width - cx;                
                if ( this.vertical ) { var t = cx; cx = cy; cy = t; t = sx; sx = sy; sy = t; }
                s.setAttribute( 'transform', 'translate('+cx+','+cy+')' );
                s.firstElementChild.setAttribute( 'transform', 'scale('+sx+','+sy+')' );
                s.setAttribute( 'opacity', opacity );
                s.setAttributeNS( jSignage.spxNS, 'zOrder', zOrder );
            }
        },

        _land: function( slideOffset ) {
            this._cancelAnimation();
            var dur = 0.5;
            var left = this.clipIdx( Math.round( this.pixPosition/this.pixSlide ) + slideOffset );
            var oldPixPosition = this.pixPosition;
            this.pixPosition = left * this.pixSlide;
            if ( this._anim ) {
                var oldIdxFirst = this.firstVisibleIdxR( oldPixPosition ), oldIdxLast = this.lastVisibleIdxR( oldPixPosition );
                var newIdxFirst = this.firstVisibleIdxR( this.pixPosition ), newIdxLast = this.lastVisibleIdxR( this.pixPosition );
                var idxFirst = Math.min( oldIdxFirst, newIdxFirst ), idxLast = Math.max( oldIdxLast, newIdxLast );
                this._place( idxFirst, idxLast );
                this._startAnimation( this._anim( oldPixPosition, this.pixPosition, idxFirst, idxLast, dur ), dur );
            } else {
                var idxFirst = this.firstVisibleIdxR( this.pixPosition ), idxLast = this.lastVisibleIdxR( this.pixPosition );
                this._place( idxFirst, idxLast );
                this._reap( idxFirst, idxLast );
            }
        },

        firstVisibleIdxR: function( pixPosition ) {
            return this.clipIdx( this.firstVisibleIdx( pixPosition ) );
        },

        lastVisibleIdxR: function( pixPosition ) {
            return this.clipIdx( this.lastVisibleIdx( pixPosition ) );
        },
        
        clipIdx: function( idx ) {
            if ( !this.looping ) {
                if ( idx < 0 )
                    idx = 0;
                else if ( idx > this.data.length-1 )
                    idx = this.data.length-1;
            }
            return idx;
        },

        animTranslate: function( oldX, oldY, newX, newY, dur, target ) {
            var tx, ty;
            if ( this.horizontal ) {
                tx = oldX-newX;
                ty = oldY-newY;
                if ( this.reverse )
                    tx = -tx;
            } else {
                tx = oldY-newY;
                ty = oldX-newX;
                if ( this.reverse )
                    ty = -ty;
            }
            return jSignage.svgAnimation( target!==undefined ? this.idxToSVG[target] : this.attach, 'animateTransform', {
                attributeName: 'transform',
                type: 'translate',
                additive: 'sum',
                begin: 'indefinite',
                dur: dur,
                from: tx+','+ty,
                to: '0,0'
            });
        },

        animScale: function( oldSX, oldSY, newSX, newSY, dur, target ) {
            var sx, sy;
            if ( this.horizontal ) {
                sx = oldSX/newSX;
                sy = oldSY/newSY;
            } else {
                sx = oldSY/newSY;
                sy = oldSX/newSX;
            }
            return jSignage.svgAnimation( target!==undefined ? this.idxToSVG[target].firstElementChild : this.attach, 'animateTransform', {
                attributeName: 'transform',
                type: 'scale',
                additive: 'sum',
                begin: 'indefinite',
                dur: dur,
                from: sx+','+sy,
                to: '1,1'
            });
        },

        mouseClick: function( ev, x, y ) {
            if ( this.vertical ) {
                var t = x;
                x = y;
                y = t;
            }
            if ( this.reverse )
                x = this.width - x;
            if ( this.clickAt )
                this.clickAt( x, y );
        }
    }),
});

jSignage.extend({

    stripCarouselClass: jSignage.subclass(
        jSignage.carouselClass,
        function( args ) {
            this.margin = 0;
        }, {

        postLayout: function( g, width, height ) {
            this.setWH( width, height );
            this.margin = Math.min( this.width, this.height ) * this.spacing;
            this.pixSlide = this.width / this.numVisible;
            this.maxPixPosition = this.pixSlide * ( this.data.length - this.numVisible );
            this.slideWidth = this.pixSlide-this.margin*2;
            this.slideHeight = this.height;
            jSignage.carouselClass.prototype.postLayout.call( this, g, width, height );
        },

        firstVisibleIdx: function( pixPosition ) {
            return Math.floor( (pixPosition+this.margin) / this.pixSlide );
        },

        lastVisibleIdx: function( pixPosition ) {
            return Math.floor( (pixPosition+this.pixSlide*this.numVisible-this.margin) / this.pixSlide );
        },

        _anim: function( oldPixPosition, newPixPosition, idxFirst, idxLast, dur ) {
            return this.animTranslate( -oldPixPosition, 0, -newPixPosition, 0, dur );
        },

        _place: function( idxLeft, idxRight ) {
            for ( var i = idxLeft; i<=idxRight; i++ )
                this._placeSlide( i, this.pixSlide*i - this.pixPosition + this.margin + this.slideWidth/2, this.slideHeight/2, 1, 1, 1, 0 );
        }/*,

        clickAt: function( x, y ) {
            x += this.pixPosition;
            var choice = Math.floor( x / this.pixSlide );
            if ( y >= this.margin && y < this.margin+this.slideHeight && x >= this.pixSlide*choice+this.margin && x < this.pixSlide*choice+this.margin+this.slideWidth ) {
                alert( 'Click on #'+choice );
            }
        }*/
    }),

    rollerCarouselClass: jSignage.subclass(
        jSignage.carouselClass,
        function( args ) {
            this.delta = 0;
            this.r = 0;
            this.margin = 0;
        }, {

        postLayout: function( g, width, height ) {
            this.setWH( width, height );
            this.delta = Math.PI / this.numVisible;
            this.margin = this.delta * ( 1 - this.spacing/2 );
            this.r = this.width / 2;
            this.pixSlide = this.r * this.delta;
            this.maxPixPosition = this.pixSlide * ( this.data.length-1 );
            this.slideWidth = this.r * 2 * Math.sin( this.delta/2-this.margin );
            this.slideHeight = this.height;
            jSignage.carouselClass.prototype.postLayout.call( this, g, width, height );
        },

        firstVisibleIdx: function( pixPosition ) {
            return Math.ceil( ( pixPosition / this.r - Math.PI/2 ) / this.delta );
        },

        lastVisibleIdx: function( pixPosition ) {
            return Math.floor( ( pixPosition / this.r + Math.PI/2 ) / this.delta );
        },

        _place: function( idxFirst, idxLast ) {
            for ( var i=idxFirst; i<=idxLast; i++ ) {
                var teta = i*this.delta - this.pixPosition/this.r;
                var x0 = Math.sin( teta-this.delta/2+this.margin ) * this.r;
                var x1 = Math.sin( teta+this.delta/2-this.margin ) * this.r;
                this._placeSlide( i, this.width/2+(x1+x0)/2, this.height/2, (x1-x0)/this.slideWidth, 1, 1, Math.cos(teta) );
            }
        },

        _anim: function( oldPixPosition, newPixPosition, idxFirst, idxLast, dur ) {
            var anim = [];
            for ( var i=idxFirst; i<=idxLast; i++ ) if ( this.idxToSVG[i] ) {
                var teta0 = i*this.delta-oldPixPosition/this.r;
                var teta1 = i*this.delta-newPixPosition/this.r;
                var u0 = Math.sin( teta0-this.delta/2+this.margin );
                var v0 = Math.sin( teta0+this.delta/2-this.margin );
                var u1 = Math.sin( teta1-this.delta/2+this.margin );
                var v1 = Math.sin( teta1+this.delta/2-this.margin );
                anim.push( this.animScale( v0-u0, 1, v1-u1, 1, dur, i ) );
                anim.push( this.animTranslate( (v0+u0)*this.r/2, 0, (v1+u1)*this.r/2, 0, dur, i ) );
            }
            return anim;
        }
    }),

    squeezeCarouselClass: jSignage.subclass(
        jSignage.carouselClass,
        function( args ) {
            this.ratio = args.ratio || 1.8;
            this.C = 0;
            this.margin = 0;
        }, {

        _h: function( x ) {
            var h = Math.abs(x) + this.C / 2 * x * x;
            return x >= 0 ? h : -h;
        },

        _x: function( h ) {
            var x = ( Math.sqrt( 1 + 2 * this.C * Math.abs(h) ) - 1 ) / this.C;
            return h >= 0 ? x : -x;
        },

        postLayout: function( g, width, height ) {
            this.setWH( width, height );
            this.C = (2/this.width)*(1/this.ratio-1);
            this.pixSlide = 2 / this.numVisible * this._x( this.width/2 );
            this.margin = this.pixSlide * this.spacing / 2;
            this.maxPixPosition = this.pixSlide * ( this.data.length-1 );
            this.slideWidth = this._h(this.pixSlide/2-this.margin) * 2;
            this.slideHeight = this.height;
            jSignage.carouselClass.prototype.postLayout.call( this, g, width, height );
        },

        firstVisibleIdx: function( pixPosition ) {
            return Math.floor( (pixPosition-this.pixSlide*(this.numVisible-1)/2) / this.pixSlide );
        },

        lastVisibleIdx: function( pixPosition ) {
            return Math.ceil( (pixPosition+this.pixSlide*(this.numVisible-1)/2) / this.pixSlide );
        },

        _place: function( idxFirst, idxLast ) {
            for ( var i=idxFirst; i<=idxLast; i++ ) {
                var x = i*this.pixSlide - this.pixPosition;
                var h0 = this._h( x - this.pixSlide/2 + this.margin );
                var h1 = this._h( x + this.pixSlide/2 - this.margin );
                this._placeSlide( i, this.width/2+(h1+h0)/2, this.height/2, (h1-h0)/this.slideWidth, 1, 1, 0 );
            }
        },

        _anim: function( oldPixPosition, newPixPosition, idxFirst, idxLast, dur ) {
            var anim = [];
            for ( var i=idxFirst; i<=idxLast; i++ ) if ( this.idxToSVG[i] ) {
                var x0 = i*this.pixSlide - oldPixPosition;
                var x1 = i*this.pixSlide - newPixPosition;
                var u0 = this._h( x0 - this.pixSlide/2 + this.margin );
                var v0 = this._h( x0 + this.pixSlide/2 - this.margin );
                var u1 = this._h( x1 - this.pixSlide/2 + this.margin );
                var v1 = this._h( x1 + this.pixSlide/2 - this.margin );
                anim.push( this.animScale( v0-u0, 1, v1-u1, 1, dur, i ) );
                anim.push( this.animTranslate( (v0+u0)/2, 0, (v1+u1)/2, 0, dur, i ) );
            }
            return anim;
        }
    }),

    wheelCarouselClass: jSignage.subclass(
        jSignage.carouselClass,
        function( args ) {
            this.r = 0;
            this.delta = 0;
        }, {

        postLayout: function( g, width, height ) {
            this.setWH( width, height );
            this.slideHeight = this.height;
            this.delta = Math.PI / ( this.numVisible - 1 );
            var C = 2 * Math.sin( this.delta/2 ) * ( 1 - this.spacing/2 );
            this.r = this.width / ( 2 + C/2 );
            this.slideWidth = C * this.r;
            this.pixSlide = this.r * this.delta;
            this.maxPixPosition = this.pixSlide * ( this.data.length -1 );
            jSignage.carouselClass.prototype.postLayout.call( this, g, width, height );
        },

        firstVisibleIdx: function( pixPosition ) {
            return Math.ceil( ( pixPosition / this.r - 1.7 ) / this.delta );
        },

        lastVisibleIdx: function( pixPosition ) {
            return Math.floor( ( pixPosition / this.r + 1.7 ) / this.delta );
        },

        _place: function( idxFirst, idxLast ) {
            for ( var i = idxFirst; i<=idxLast; i++ ) {
                var teta = i*this.delta-this.pixPosition/this.r;
                var depth = Math.cos( teta );
                var z = (1+depth)/2;
                this._placeSlide( i, this.width/2+Math.sin( teta )*this.r, this.height/2, z, z, 1, depth );
            }
        },

        _anim: function( oldPixPosition, newPixPosition, idxFirst, idxLast, dur ) {
            var anim = [];
            for ( var i=idxFirst; i<=idxLast; i++ ) if ( this.idxToSVG[i] ) {
                var teta0 = i*this.delta-oldPixPosition/this.r;
                var teta1 = i*this.delta-newPixPosition/this.r;
                var s0 = 1+Math.cos(teta0), s1 = 1+Math.cos(teta1);
                anim.push( this.animScale( s0, s0, s1, s1, dur, i ) );
                anim.push( this.animTranslate( this.r*Math.sin(teta0), 0, this.r*Math.sin(teta1), 0, dur, i ) );
            }
            return anim;
        }
    }),

    electronCarouselClass: jSignage.subclass(
        jSignage.carouselClass,
        function( args ) {
            this.r = 0;
            this.r2 = 0;
        }, {

        postLayout: function( g, width, height ) {
            this.setWH( width, height );
            this.slideHeight = this.height * ( 0.5 - this.spacing/2 );
            this.r2 = this.height/2 - this.slideHeight / 2;
            this.delta = 2 * Math.PI / this.data.length;
            this.r = this.width / ( 2 * ( 1 + Math.sin( this.delta/2 ) ) );
            this.slideWidth = 2 * Math.sin( this.delta/2 ) * this.r * ( 1 - this.spacing );
            this.pixSlide = this.r * this.delta;
            this.maxPixPosition = this.pixSlide * ( this.data.length -1 );
            jSignage.carouselClass.prototype.postLayout.call( this, g, width, height );
        },

        firstVisibleIdx: function( pixPosition ) {
            return 0;
        },

        lastVisibleIdx: function( pixPosition ) {
            return this.data.length-1;
        },

        _place: function( idxFirst, idxLast ) {
            for ( var i = idxFirst; i<=idxLast; i++ ) {
                var teta = i*this.delta-this.pixPosition/this.r;
                var x = Math.sin( teta ) * this.r;
                var y = Math.cos( teta ) * this.r2;
                this._placeSlide( i, this.width/2+x, this.height/2+y, 1, 1, 1, y );
            }
        },

        _anim: function( oldPixPosition, newPixPosition, idxFirst, idxLast, dur ) {
            var anim = [];
            for ( var i=idxFirst; i<=idxLast; i++ ) if ( this.idxToSVG[i] ) {
                var teta0 = i*this.delta-oldPixPosition/this.r;
                var teta1 = i*this.delta-newPixPosition/this.r;
                var d = new jSignage.pathData, x, y;
                var xx = this.r*Math.sin(teta1);
                var yy = this.r2*Math.cos(teta1);
                var x = this.r*Math.sin(teta0)-xx;
                var y = this.r2*Math.cos(teta0)-yy;
                if ( this.reverse ) x = -x;
                if ( this.vertical ) { var t = x; x = y; y = t; }
                d.moveTo( x, y );
                for ( var j = 1; j < 10; j++ ) {
                    var teta = teta0+(teta1-teta0)*j/10;
                    x = this.r*Math.sin(teta)-xx;
                    y = this.r2*Math.cos(teta)-yy;
                    if ( this.reverse ) x = -x;
                    if ( this.vertical ) { var t = x; x = y; y = t; }
                    d.lineTo( x, y );
                }
                d.lineTo( 0, 0 );
                anim.push( jSignage.svgAnimation( this.idxToSVG[i], 'animateMotion', {
                    begin: 'indefinite',
                    dur: dur,
                    path: d
                }));
            }
            return anim;
        }
    })
});

var htmlColorKeywords = {
    black: '#000000', green: '#008000', silver: '#C0C0C0', lime: '#00FF00',
    gray: '#808080', olive: '#808000', white: '#FFFFFF', yellow: '#FFFF00',
    maroon: '#800000', navy: '#000080', red: '#FF0000', blue: '#0000FF',
    purple: '#800080', teal: '#008080', fuchsia: '#FF00FF', aqua: '#00FFFF'
};

var reHexColor1 = /^#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])$/;
var reHexColor2 = /^#([a-fA-F0-9][a-fA-F0-9])([a-fA-F0-9][a-fA-F0-9])([a-fA-F0-9][a-fA-F0-9])$/;
var reRGBColor1 = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/;
var reRGBColor2 = /^rgb\(\s*([+-]?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)%\s*,\s*([+-]?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)%\s*,\s*([+-]?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)%\s*\)$/;

function hex2dec( h ) {
    var d = 0, i, c, x;
    for ( i=0; i<h.length; i++ ) {
        c = h.charCodeAt( i );
        x = ( c>=48 && c<=57 ) ? c-48 : ( c>=65 && c<=70 ) ? c-65+10 : ( c>=97 && c<=102 ) ? c-97+10 : 0;
        d = d*16+x;
    }
    return d;
}

jSignage.extend({
    popup: function( layer, args ) {
        if ( !layer || !layer.jsignage || !layer.length )
            return;
        var dimming = jSignage.getPercent( args && args.dimming, 0.5 );
        var popupDur = jSignage.durInSeconds( args && args.popupDur, 0 );
        var popoutDur = jSignage.durInSeconds( args && args.popoutDur, 0 );
        var svg = document.documentElement;
        var viewBox = svg.getRectTrait ? svg.getRectTrait( 'viewBox' ) : svg.viewBox.baseVal;
        var dimmer = jSignage._createElement( 'rect', {
            width: viewBox.width,
            height: viewBox.height,
            stroke: 'none',
            fill: '#808080',
            'fill-opacity': 1-dimming
        });
        svg.appendChild( dimmer );
        if ( popupDur > 0 )
            jSignage.beginAnimation( jSignage.svgAnimation( dimmer, 'animate', {
                attributeName: 'fill-opacity',
                from: '0',
                to: 1-dimming,
                dur: popupDur
            }));
        var media = jSignage.getRealMediaTarget( layer[0] );
        var timingElement = jSignage.getTimingElement( media );
        jSignage.endEventOnce( timingElement, function() {
            svg.removeChild( layer[0] );
            if ( popoutDur ) {
                jSignage.beginAnimation( jSignage.svgAnimation( dimmer, 'animate', {
                    attributeName: 'fill-opacity',
                    from: 1-dimming,
                    to: '0',
                    fill: 'freeze',
                    dur: popoutDur
                }), 0, function() {
                    svg.removeChild( dimmer );
                });
            } else {
                svg.removeChild( dimmer );
            }
        });
        jSignage.addAndKick( svg, layer[0], timingElement, popupDur );
        var bbox = jSignage.getBBox( media, null );
        if ( bbox && bbox.height>0 && bbox.width>0 )
            layer[0].setAttribute( 'transform', 'translate('+(viewBox.width-bbox.width)/2+','+(viewBox.height-bbox.height)/2+')' );
    },

    uiStyle: 'manzana', uiColor: '#4080FF',

    _shadeCache: { },

    rgb: function( r, g, b ) {
        return 'rgb('+Math.floor(r)+','+Math.floor(g)+','+Math.floor(b)+')';
    },

    colorToRGB: function( color ) {
        if ( color in htmlColorKeywords )
            color = htmlColorKeywords[color];
        var m = reHexColor2.exec( color );
        if ( m ) {
            return {
                red: hex2dec( m[1] ),
                green: hex2dec( m[2] ),
                blue: hex2dec( m[3] )
            };
        }
        m = reHexColor1.exec( color );
        if ( m ) {
            var r = hex2dec(m[1]), g = hex2dec(m[2]), b = hex2dec(m[3]);
            return {
                red: r*16+r,
                green: g*16+g,
                blue: b*16+b
            };
        }
        m = reRGBColor1.exec( color );
        if ( m ) {
            var r = parseFloat(m[1]), g = parseFloat(m[2]), b=parseFloat(m[3]);
            return {
                red: isNan(r) || r<0 ? 0 : r>255 ? 255: r,
                green: isNan(g) || g<0 ? 0 : g>255 ? 255: g,
                blue: isNan(b) || b<0 ? 0 : b>255 ? 255: b
            };
        }
        m = reRGBColor2.exec( color );
        if ( m ) {
            var r = parseFloat(m[1]), g = parseFloat(m[2]), b=parseFloat(m[3]);
            return {
                red: isNan(r) || r<0 ? 0 : r>100 ? 255: r*2.55,
                green: isNan(g) || g<0 ? 0 : g>100 ? 255: g*2.55,
                blue: isNan(b) || b<0 ? 0 : b>100 ? 255: b*2.55
            };
        }        
        var g = document.createElementNS( jSignage.svgNS, 'g' );
        g.setAttribute( 'fill', color );                   
        if ( g.getRGBColorTrait ) {
            return g.getRGBColorTrait( 'fill' );
        }
        try {
            var pv = g.getPresentationAttribute('fill').rgbColor;
            return {
                red: pv.red.getFloatValue( CSSPrimitiveValue.CSS_NUMBER ),
                green: pv.green.getFloatValue( CSSPrimitiveValue.CSS_NUMBER ),
                blue: pv.blue.getFloatValue( CSSPrimitiveValue.CSS_NUMBER )
            };
        } catch( e ) {
        }
        return { red: 0, green: 0, blue: 0 };
    },

    shades: function( color ) {
        if ( color in jSignage._shadeCache )
            return jSignage._shadeCache[color];
        var rgb = jSignage.colorToRGB( color );
        return jSignage._shadeCache[color] = {
            normal: color,
            darker: jSignage.rgb( rgb.red*0.75+32, rgb.green*0.75+32, rgb.blue*0.75+32 ),
            lighter: jSignage.rgb( rgb.red*0.5+128, rgb.green*0.5+128, rgb.blue*0.5+128 )
        };
    },

    progressWheel: function( args ) {
        var style = args && args.style || jSignage.uiStyle;
        var barCount=12, innerRadius, outerRadius, barWidth, lineCap, color='white';
        if ( style=='manzana' ) {
            innerRadius=0.5;
            outerRadius=0.9;
            barWidth=0.15;
            lineCap='round';
        } else if ( style=='round' ) {
            innerRadius = 0.8;
            outerRadius = 0.8;
            barWidth = 0.25;
            lineCap='round';
        } else if ( style=='square' ) {
            innerRadius = 0.7;
            outerRadius = 0.95;
            barWidth = 0.25;
            lineCap='butt';
        }
        barCount = args && args.barCount || barCount;
        innerRadius = jSignage.getPercent( args && args.innerRadius ) || innerRadius;
        outerRadius = jSignage.getPercent( args && args.outerRadius ) || outerRadius;
        barWidth = jSignage.getPercent( args && args.barWidth ) || barWidth;
        lineCap = args && args.lineCap || lineCap;
        color = args && args.color || 'white';
        var layer = jSignage.customLayer( 'progressWheel', args, null, function( width, height ) {
            var timingId = jSignage.getTimingElement( layer[0] ).id;
            var cx = width/2, cy = height/2, radius = Math.min( cx, cy );
            var ro = outerRadius*radius, ri = innerRadius*radius;
            jSignage.setAttributes( this, {
                stroke: color,
                'stroke-opacity': '0.3',
                'stroke-width': barWidth*radius,
                'stroke-linecap': lineCap
            });
            for ( var a=0; a<360; a+=360/barCount ) {
                var cos = Math.cos( a*Math.PI/180 ), sin = Math.sin( a*Math.PI/180 );
                var line = jSignage._createElement( 'line', {
                    x1: cx+ri*sin,
                    y1: cy-ri*cos,
                    x2: cx+ro*sin,
                    y2: cy-ro*cos
                });
                jSignage.svgAnimation( line, 'animate', {
                    attributeName: 'stroke-opacity',
                    begin: timingId+'.begin+'+(a/360),
                    dur: '1',
                    repeatCount: 'indefinite',
                    values: '1;0.3;0.3',
                    keyTimes: '0;0.5;1'
                });
                this.appendChild( line );
            }
        });
        return layer;
    },

    progressBar: function( args ) {
        var style = args && args.style || jSignage.uiStyle;
        var color = args && args.color || jSignage.uiColor;
        var shades = jSignage.shades( color );

        var layer = jSignage.customLayer( 'progressBar', args, null, function( width, height ) {
            var gradient;
            if ( style=='manzana' ) {
                gradient = jSignage._linearGradient({ x1: 0, y1: 0, x2: 0, y2: height, stops: [
                    { offset: 0, color: shades.lighter },
                    { offset: 0.5, color: shades.normal },
                    { offset: 0.5, color: shades.darker },
                    { offset: 1, color: shades.darker }
                ]});
            } else {
                gradient = jSignage._linearGradient({ x1: 0, y1: 0, x2: width, y2: 0, stops: [
                    { offset: 0, color: shades.normal },
                    { offset: 1, color: shades.lighter }
                ]});
            }
            this.appendChild( gradient );
            var r = style=='square' ? 0 : height*0.15;
            var bar = jSignage._createElement( 'rect', {
                width: layer.progress*width,
                height: height,
                fill: 'url(#'+gradient.id+')',
                stroke: 'none',
                rx: r,
                ry: r
            });
            layer.barElem = bar;
            layer.barWidth = width;
            this.appendChild( bar );
            if ( style=='square' || style=='round' ) {
                this.appendChild( jSignage._createElement( 'rect', {
                    width: width,
                    height: height,
                    fill: 'none',
                    stroke: shades.lighter,
                    'stroke-width': height*0.05,
                    rx: r,
                    ry: r
                }));
            }
        });
        layer.progress = 0;
        layer.setProgress = function( progress ) {
            progress = jSignage.getPercent( progress );
            if ( progress < 0 )
                progress = 0;
            if ( progress > 1 )
                progress = 1;
            this.progress = progress;
            if ( this.barElem )
                this.barElem.setAttribute( 'width', progress*this.barWidth );
        };
        return layer;
    },

    pushButton: function( args, child ) {
        args.frame = {
            uiStyle: args && args.style || jSignage.uiStyle,
            backColor: args && args.color,
            corners: args && args.direction,
            padding: '15%'
        };
        var layer = jSignage.g( args );
        if ( child!==undefined ) {
            if ( typeof child === "string" ) {
                targs = { fontSize: 'max', fill: 'white' };
                jSignage.copyProps( args, targs, textProps );
                child = jSignage.textArea( targs ).text( child );
            }
            layer.add( child );
        }
        return layer;
    }
});

})();

// Ajax

(function() {

var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rhash = /#.*$/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
	rinput = /^(?:color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /(?:^file|^widget|\-extension):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rquery = /\?/,
	rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
	rselectTextarea = /^(?:select|textarea)/i,
	rspacesAjax = /\s+/,
	rts = /([?&])_=[^&]*/,
	rucHeaders = /(^|\-)([a-z])/g,
	rucHeadersFunc = function( _, $1, $2 ) {
		return $1 + $2.toUpperCase();
	},
	rurl = /^([\w\+\.\-]+:)\/\/([^\/?#:]*)(?::(\d+))?/;

var ajaxLocation = document.documentURI || window.location && window.location.href || document.location && document.location.href || 'http:///';
var ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() );

function buildParams( prefix, obj, traditional, add ) {
	if ( jSignage.isArray( obj ) && obj.length ) {
		jSignage.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) )
				add( prefix, v );
			else
				buildParams( prefix + "[" + ( typeof v === "object" || jSignage.isArray(v) ? i : "" ) + "]", v, traditional, add );
		});
	} else if ( !traditional && obj != null && typeof obj === "object" ) {
		if ( jSignage.isArray( obj ) || jSignage.isEmptyObject( obj ) )
			add( prefix, "" );
		else
			for ( var name in obj )
				buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
	} else {
		add( prefix, obj );
	}
}

// Chain conversions given the request and the original response
function ajaxConvert( s, response ) {

	// Apply the dataFilter if provided
	if ( s.dataFilter )
		response = s.dataFilter( response, s.dataType );

	var dataTypes = s.dataTypes,
		converters = {},
		i,
		key,
		length = dataTypes.length,
		tmp,
		// Current and previous dataTypes
		current = dataTypes[ 0 ],
		prev,
		// Conversion expression
		conversion,
		// Conversion function
		conv,
		// Conversion functions (transitive conversion)
		conv1,
		conv2;

	// For each dataType in the chain
	for( i = 1; i < length; i++ ) {

		// Create converters map
		// with lowercased keys
		if ( i === 1 ) {
			for( key in s.converters ) {
				if( typeof key === "string" ) {
					converters[ key.toLowerCase() ] = s.converters[ key ];
				}
			}
		}

		// Get the dataTypes
		prev = current;
		current = dataTypes[ i ];

		// If current is auto dataType, update it to prev
		if( current === "*" ) {
			current = prev;
		// If no auto and dataTypes are actually different
		} else if ( prev !== "*" && prev !== current ) {

			// Get the converter
			conversion = prev + " " + current;
			conv = converters[ conversion ] || converters[ "* " + current ];

			// If there is no direct converter, search transitively
			if ( !conv ) {
				conv2 = undefined;
				for( conv1 in converters ) {
					tmp = conv1.split( " " );
					if ( tmp[ 0 ] === prev || tmp[ 0 ] === "*" ) {
						conv2 = converters[ tmp[1] + " " + current ];
						if ( conv2 ) {
							conv1 = converters[ conv1 ];
							if ( conv1 === true ) {
								conv = conv2;
							} else if ( conv2 === true ) {
								conv = conv1;
							}
							break;
						}
					}
				}
			}
			// If we found no converter, dispatch an error
			if ( !( conv || conv2 ) ) {
				jSignage.error( "No conversion from " + conversion.replace(" "," to ") );
			}
			// If found converter is not an equivalence
			if ( conv !== true ) {
				// Convert with 1 or 2 converters accordingly
				response = conv ? conv( response ) : conv2( conv1(response) );
			}
		}
	}
	return response;
}

jSignage.extend({
	getScript: function( url, callback ) {
		return jSignage.get( url, undefined, callback, "script" );
	},

	getJSON: function( url, data, callback ) {
		return jSignage.get( url, data, callback, "json" );
	},
	
	ajaxSetup: function ( target, settings ) {
		if ( !settings ) {
			settings = target;
			target = jSignage.extend( true, jSignage.ajaxSettings, settings );
		} else {
			jSignage.extend( true, target, jSignage.ajaxSettings, settings );
		}
		for( var field in { context: 1, url: 1 } ) {
			if ( field in settings ) {
				target[ field ] = settings[ field ];
			} else if( field in jSignage.ajaxSettings ) {
				target[ field ] = jSignage.ajaxSettings[ field ];
			}
		}
		return target;
	},

	ajaxSettings: {
		url: ajaxLocation,
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		type: "GET",
		contentType: "application/x-www-form-urlencoded",
		processData: true,
		async: true,

		accepts: {
			xml: "application/xml, text/xml",
			html: "text/html",
			svg: "image/svg+xml",
			text: "text/plain",
			rss: "application/rss+xml, text/rss+xml, application/xml, text/xml",
			json: "application/json, text/javascript",
			"*": "*/*"
		},

		contents: {
			svg: /svg/,
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText"
		},

		converters: {
			"* text": window.String,
			"text html": true,
			"text svg": true,
			"text json": jSignage.parseJSON,
			"text xml": jSignage.parseXML
		}
	}
});

jSignage.each( [ "get", "post" ], function( i, method ) {
	jSignage[ method ] = function( url, data, callback, type ) {
		// shift arguments if data argument was omitted
		if ( jSignage.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jSignage.ajax({
			type: method,
			url: url,
			data: data,
			success: callback,
			dataType: type
		});
	};
} );

var jsc = 1, jsre = /(\=)\?(&|$)|()\?\?()/i;

// Default jsonp settings
jSignage.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		return jSignage.expando + "_" + ( jsc++ );
	}
});

// Ajax with XMLHttpRequest

if ( jSignage.features.XMLHTTPRequest ) {
var
	prefilters = {},
	transports = {};

// Base "constructor" for jSignage.ajaxPrefilter and jSignage.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		if ( jSignage.isFunction( func ) ) {
			var dataTypes = dataTypeExpression.toLowerCase().split( rspacesAjax ),
				i = 0,
				length = dataTypes.length,
				dataType,
				list,
				placeBefore;

			// For each dataType in the dataTypeExpression
			for(; i < length; i++ ) {
				dataType = dataTypes[ i ];
				// We control if we're asked to add before
				// any existing element
				placeBefore = /^\+/.test( dataType );
				if ( placeBefore ) {
					dataType = dataType.substr( 1 ) || "*";
				}
				list = structure[ dataType ] = structure[ dataType ] || [];
				// then we add to the structure accordingly
				list[ placeBefore ? "unshift" : "push" ]( func );
			}
		}
	};
}

//Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR,
		dataType /* internal */, inspected /* internal */ ) {

	dataType = dataType || options.dataTypes[ 0 ];
	inspected = inspected || {};

	inspected[ dataType ] = true;

	var list = structure[ dataType ],
		i = 0,
		length = list ? list.length : 0,
		executeOnly = ( structure === prefilters ),
		selection;

	for(; i < length && ( executeOnly || !selection ); i++ ) {
		selection = list[ i ]( options, originalOptions, jqXHR );
		// If we got redirected to another dataType
		// we try there if executing only and not done already
		if ( typeof selection === "string" ) {
			if ( !executeOnly || inspected[ selection ] ) {
				selection = undefined;
			} else {
				options.dataTypes.unshift( selection );
				selection = inspectPrefiltersOrTransports(
						structure, options, originalOptions, jqXHR, selection, inspected );
			}
		}
	}
	// If we're only executing or nothing was selected
	// we try the catchall dataType if not done already
	if ( ( executeOnly || !selection ) && !inspected[ "*" ] ) {
		selection = inspectPrefiltersOrTransports(
				structure, options, originalOptions, jqXHR, "*", inspected );
	}
	// unnecessary when only executing (prefilters)
	// but it'll be ignored by the caller in that case
	return selection;
}

// Attach a bunch of functions for handling common AJAX events
jSignage.each( "ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split( " " ), function( i, o ){
	jSignage.fn[ o ] = function( f ){
		return this.bind( o, f );
	};
} );

jSignage.extend({

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var // Create the final options object
			s = jSignage.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events
			// It's the callbackContext if one was provided in the options
			// and if it's a DOM node or a jQuery collection
			globalEventContext = callbackContext !== s &&
				( callbackContext.nodeType || callbackContext instanceof jSignage ) ?
						jSignage( callbackContext ) : jSignage.event,
			// Deferreds
			deferred = jSignage.Deferred(),
			completeDeferred = jSignage._Deferred(),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// ifModified key
			ifModifiedKey,
			// Headers (they are sent all at once)
			requestHeaders = {},
			// Response headers
			responseHeadersString,
			responseHeaders,
			// transport
			transport,
			// timeout handle
			timeoutTimer,
			// Cross-domain detection vars
			parts,
			// The jqXHR state
			state = 0,
			// Loop variable
			i,
			// Fake xhr
			jqXHR = {

				readyState: 0,

				// Caches the header
				setRequestHeader: function( name, value ) {
					if ( !state ) {
						requestHeaders[ name.toLowerCase().replace( rucHeaders, rucHeadersFunc ) ] = value;
					}
					return this;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match === undefined ? null : match;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					statusText = statusText || "abort";
					if ( transport ) {
						transport.abort( statusText );
					}
					done( 0, statusText );
					return this;
				}
			};

		// Callback for when everything is done
		// It is defined here because jslint complains if it is declared
		// at the end of the function (which would be more logical and readable)
		function done( status, statusText, responses, headers ) {

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status ? 4 : 0;

			var isSuccess,
				success,
				error,
				response = responses ? ajaxHandleResponses( s, jqXHR, responses ) : undefined,
				lastModified,
				etag;

			// If successful, handle type chaining
			if ( status >= 200 && status < 300 || status === 304 ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {

					if ( ( lastModified = jqXHR.getResponseHeader( "Last-Modified" ) ) ) {
						jSignage.lastModified[ ifModifiedKey ] = lastModified;
					}
					if ( ( etag = jqXHR.getResponseHeader( "Etag" ) ) ) {
						jSignage.etag[ ifModifiedKey ] = etag;
					}
				}

				// If not modified
				if ( status === 304 ) {

					statusText = "notmodified";
					isSuccess = true;

				// If we have data
				} else {

					try {
						success = ajaxConvert( s, response );
						statusText = "success";
						isSuccess = true;
					} catch(e) {
						// We have a parsererror
						statusText = "parsererror";
						error = e;
					}
				}
			} else {
				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if( !statusText || status ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = statusText;

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			// Complete
			completeDeferred.resolveWith( callbackContext, [ jqXHR, statusText ] );

		}

		// Attach deferreds
		deferred.promise( jqXHR );
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;
		jqXHR.complete = completeDeferred.done;

		// Status-dependent callbacks
		jqXHR.statusCode = function( map ) {
			if ( map ) {
				var tmp;
				if ( state < 2 ) {
					for( tmp in map ) {
						statusCode[ tmp ] = [ statusCode[tmp], map[tmp] ];
					}
				} else {
					tmp = map[ jqXHR.status ];
					jqXHR.then( tmp, tmp );
				}
			}
			return this;
		};

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
		// We also use the url parameter if available
		s.url = ( ( url || s.url ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Extract dataTypes list
		s.dataTypes = jSignage.trim( s.dataType || "*" ).toLowerCase().split( rspacesAjax );

		// Determine if a cross-domain request is in order
		if ( !s.crossDomain ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] != ajaxLocParts[ 1 ] || parts[ 2 ] != ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? 80 : 443 ) ) !=
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? 80 : 443 ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jSignage.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefiler, stop there
		if ( state === 2 ) {
			return false;
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.data;
			}

			// Get ifModifiedKey before adding the anti-cache parameter
			ifModifiedKey = s.url;

			// Add anti-cache in url if needed
			if ( s.cache === false ) {

				var ts = jSignage.now(),
					// try replacing _= if it is there
					ret = s.url.replace( rts, "$1_=" + ts );

				// if nothing was replaced, add timestamp to the end
				s.url = ret + ( (ret === s.url ) ? ( rquery.test( s.url ) ? "&" : "?" ) + "_=" + ts : "" );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			requestHeaders[ "Content-Type" ] = s.contentType;
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			ifModifiedKey = ifModifiedKey || s.url;
			if ( jSignage.lastModified[ ifModifiedKey ] ) {
				requestHeaders[ "If-Modified-Since" ] = jSignage.lastModified[ ifModifiedKey ];
			}
			if ( jSignage.etag[ ifModifiedKey ] ) {
				requestHeaders[ "If-None-Match" ] = jSignage.etag[ ifModifiedKey ];
			}
		}

		// Set the Accepts header for the server, depending on the dataType
		requestHeaders.Accept = s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
			s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", */*; q=0.01" : "" ) :
			s.accepts[ "*" ];

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
				// Abort if not done already
				jqXHR.abort();
				return false;

		}

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout( function(){
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch (e) {
				// Propagate exception as error if not done
				if ( status < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					jSignage.error( e );
				}
			}
		}

		return jqXHR;
	},

	// Serialize an array of form elements or a set of
	// key/values into a query string
	param: function( a, traditional ) {
		var s = [],
			add = function( key, value ) {
				// If value is a function, invoke it and return its value
				value = jSignage.isFunction( value ) ? value() : value;
				s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
			};

		// Set traditional to true for jQuery <= 1.3.2 behavior.
		if ( traditional === undefined ) {
			traditional = jSignage.ajaxSettings.traditional;
		}

		// If an array was passed in, assume that it is an array of form elements.
		if ( jSignage.isArray( a ) || ( a.jSignage && !jSignage.isPlainObject( a ) ) ) {
			// Serialize the form elements
			jSignage.each( a, function() {
				add( this.name, this.value );
			} );

		} else {
			// If traditional, encode the "old" way (the way 1.3.2 or older
			// did it), otherwise encode params recursively.
			for ( var prefix in a ) {
				buildParams( prefix, a[ prefix ], traditional, add );
			}
		}

		// Return the resulting serialization
		return s.join( "&" ).replace( r20, "+" );
	}
});

// This is still on the jQuery object... for now
// Want to move this to jSignage.ajax some day
jSignage.extend({

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {}

});

/* Handles responses to an ajax request:
 * - sets all responseXXX fields accordingly
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var contents = s.contents,
		dataTypes = s.dataTypes,
		responseFields = s.responseFields,
		ct,
		type,
		finalDataType,
		firstDataType;

	// Fill responseXXX fields
	for( type in responseFields ) {
		if ( type in responses ) {
			jqXHR[ responseFields[type] ] = responses[ type ];
		}
	}

	// Remove auto dataType and get content-type in the process
	while( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "content-type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

// Detect, normalize options and install callbacks for jsonp requests
jSignage.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var dataIsString = ( typeof s.data === "string" );

	if ( s.dataTypes[ 0 ] === "jsonp" ||
		originalSettings.jsonpCallback ||
		originalSettings.jsonp != null ||
		s.jsonp !== false && ( jsre.test( s.url ) ||
				dataIsString && jsre.test( s.data ) ) ) {

		var responseContainer,
			jsonpCallback = s.jsonpCallback =
				jSignage.isFunction( s.jsonpCallback ) ? s.jsonpCallback() : s.jsonpCallback,
			previous = window[ jsonpCallback ],
			url = s.url,
			data = s.data,
			replace = "$1" + jsonpCallback + "$2",
			cleanUp = function() {
				// Set callback back to previous value
				window[ jsonpCallback ] = previous;
				// Call if it was a function and we have a response
				if ( responseContainer && jSignage.isFunction( previous ) ) {
					window[ jsonpCallback ]( responseContainer[ 0 ] );
				}
			};

		if ( s.jsonp !== false ) {
			url = url.replace( jsre, replace );
			if ( s.url === url ) {
				if ( dataIsString ) {
					data = data.replace( jsre, replace );
				}
				if ( s.data === data ) {
					// Add callback manually
					url += (/\?/.test( url ) ? "&" : "?") + s.jsonp + "=" + jsonpCallback;
				}
			}
		}

		s.url = url;
		s.data = data;

		// Install callback
		window[ jsonpCallback ] = function( response ) {
			responseContainer = [ response ];
		};

		// Install cleanUp function
		jqXHR.then( cleanUp, cleanUp );

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jSignage.error( jsonpCallback + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Delegate to script
		return "script";
	}
} );




// Install script dataType
jSignage.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /javascript|ecmascript/
	},
	converters: {
		"text script": function( text ) {
			jSignage.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and global
jSignage.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
		s.global = false;
	}
} );

// Bind script tag hack transport
jSignage.ajaxTransport( "script", function(s) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {

		var script,
			head = document.head || document.getElementsByTagName( "head" )[0] || document.documentElement;

		return {

			send: function( _, callback ) {

				script = document.createElement( "script" );

				script.async = "async";

				if ( s.scriptCharset ) {
					script.charset = s.scriptCharset;
				}

				script.src = s.url;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function( _, isAbort ) {

					if ( !script.readyState || /loaded|complete/.test( script.readyState ) ) {

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;

						// Remove the script
						if ( head && script.parentNode ) {
							head.removeChild( script );
						}

						// Dereference the script
						script = undefined;

						// Callback if not abort
						if ( !isAbort ) {
							callback( 200, "success" );
						}
					}
				};
				// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
				// This arises when a base node is used (#2709 and #4378).
				head.insertBefore( script, head.firstChild );
			},

			abort: function() {
				if ( script ) {
					script.onload( 0, 1 );
				}
			}
		};
	}
} );




var // #5280: next active xhr id and list of active xhrs' callbacks
	xhrId = jSignage.now(),
	xhrCallbacks;

// Functions to create xhrs
function createStandardXHR() {
	try {
		return new window.XMLHttpRequest();
	} catch( e ) {}
}

function createActiveXHR() {
	try {
		return new window.ActiveXObject( "Microsoft.XMLHTTP" );
	} catch( e ) {}
}

// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jSignage.ajaxSettings.xhr = window.ActiveXObject ?
	/* Microsoft failed to properly
	 * implement the XMLHttpRequest in IE7 (can't request local files),
	 * so we use the ActiveXObject when it is available
	 * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
	 * we need a fallback.
	 */
	function() {
		return !this.isLocal && createStandardXHR() || createActiveXHR();
	} :
	// For all other browsers, use the standard XMLHttpRequest object
	createStandardXHR;

jSignage.ajaxTransport(function( s ) {

	var callback;

	return {
		send: function( headers, complete ) {

			// Get a new xhr
			var xhr = s.xhr(),
				handle,
				i;

			// Open the socket
			// Passing null username, generates a login popup on Opera (#2865)
			if ( s.username ) {
				xhr.open( s.type, s.url, s.async, s.username, s.password );
			} else {
				xhr.open( s.type, s.url, s.async );
			}

			// Apply custom fields if provided
			if ( s.xhrFields ) {
				for ( i in s.xhrFields ) {
					xhr[ i ] = s.xhrFields[ i ];
				}
			}

			// Override mime type if needed
			if ( s.mimeType && xhr.overrideMimeType ) {
				xhr.overrideMimeType( s.mimeType );
			}

			// Requested-With header
			// Not set for crossDomain requests with no content
			// (see why at http://trac.dojotoolkit.org/ticket/9486)
			// Won't change header if already provided
			if ( !( s.crossDomain && !s.hasContent ) && !headers["X-Requested-With"] ) {
				headers[ "X-Requested-With" ] = "XMLHttpRequest";
			}

			// Need an extra try/catch for cross domain requests in Firefox 3
			try {
				for ( i in headers ) {
					xhr.setRequestHeader( i, headers[ i ] );
				}
			} catch( _ ) {}

			// Do send the request
			// This may raise an exception which is actually
			// handled in jSignage.ajax (so no try/catch here)
			xhr.send( ( s.hasContent && s.data ) || null );

			// Listener
			callback = function( _, isAbort ) {

				var status,
					statusText,
					responseHeaders,
					responses,
					xml;

				// Firefox throws exceptions when accessing properties
				// of an xhr when a network error occured
				// http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
				try {

					// Was never called and is aborted or complete
					if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

						// Only called once
						callback = undefined;

						// Do not keep as active anymore
						if ( handle ) {
							xhr.onreadystatechange = jSignage.noop;
							delete xhrCallbacks[ handle ];
						}

						// If it's an abort
						if ( isAbort ) {
							// Abort it manually if needed
							if ( xhr.readyState !== 4 ) {
								xhr.abort();
							}
						} else {
							status = xhr.status;
							responseHeaders = xhr.getAllResponseHeaders();
							responses = {};
							xml = xhr.responseXML;

							// Construct response list
							if ( xml && xml.documentElement /* #4958 */ ) {
								responses.xml = xml;
							}
							responses.text = xhr.responseText;

							// Firefox throws an exception when accessing
							// statusText for faulty cross-domain requests
							try {
								statusText = xhr.statusText;
							} catch( e ) {
								// We normalize with Webkit giving an empty statusText
								statusText = "";
							}

							// Filter status for non standard behaviors

							// If the request is local and we have data: assume a success
							// (success with no data won't get notified, that's the best we
							// can do given current implementations)
							if ( !status && s.isLocal && !s.crossDomain ) {
								status = responses.text ? 200 : 404;
							// IE - #1450: sometimes returns 1223 when it should be 204
							} else if ( status === 1223 ) {
								status = 204;
							}
						}
					}
				} catch( firefoxAccessException ) {
					if ( !isAbort ) {
						complete( -1, firefoxAccessException );
					}
				}

				// Call complete if needed
				if ( responses ) {
					complete( status, statusText, responses, responseHeaders );
				}
			};

			// if we're in sync mode or it's in cache
			// and has been retrieved directly (IE6 & IE7)
			// we need to manually fire the callback
			if ( !s.async || xhr.readyState === 4 ) {
				callback();
			} else {
				// Create the active xhrs callbacks list if needed
				// and attach the unload handler
				if ( !xhrCallbacks ) {
					xhrCallbacks = {};
				}
				// Add to list of active xhrs callbacks
				handle = xhrId++;
				xhr.onreadystatechange = xhrCallbacks[ handle ] = callback;
			}
		},

		abort: function() {
			if ( callback ) {
				callback(0,1);
			}
		}
	};
});

// Ajax with getURL

} else {

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses2( s, status ) {

	var contents = s.contents,
		dataTypes = s.dataTypes,
		ct,
		type,
		finalDataType,
		firstDataType;

	// Remove auto dataType and get content-type in the process
	while( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined )
			ct = s.mimeType || status.contentType;
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ]=='text' ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		if ( !dataTypes[ 0 ] || s.converters[ "text " + dataTypes[0] ] )
			finalDataType = 'text';
		else
			firstDataType = 'text';
		finalDataType = finalDataType || firstDataType;
	}

	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] )
			dataTypes.unshift( finalDataType );
		return status.content;
	}
}

jSignage.extend({
	// Serialize an array of form elements or a set of key/values into a query string
	param: function( a, traditional ) {
		var s = [],
			add = function( key, value ) {
				// If value is a function, invoke it and return its value
				value = jSignage.isFunction( value ) ? value() : value;
				s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
			};
		if ( traditional === undefined )
			traditional = jSignage.ajaxSettings.traditional;

		// If an array was passed in, assume that it is an array of form elements.
		if ( jSignage.isArray( a ) || ( a.jsignage && !jSignage.isPlainObject( a ) ) ) {
			jSignage.each( a, function() {
				add( this.name, this.value );
			} );
		} else {
			for ( var prefix in a )
				buildParams( prefix, a[ prefix ], traditional, add );
		}

		// Return the resulting serialization
		return s.join( "&" ).replace( r20, "+" );
	},

    ajax: function( url, options ) {
		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}
		// Force options to be an object
		options = options || {};
		var s = jSignage.ajaxSetup( {}, options );
		if ( !s.async )
		    jSignage.error( "jSignage dows not support synchronous ajax requests" );
		var callbackContext = s.context || s;
		s.url = ( ( url || s.url ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );
		s.dataTypes = jSignage.trim( s.dataType || "*" ).toLowerCase().split( rspacesAjax );
        // Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" )
			s.data = jSignage.param( s.data, s.traditional );
			
    	var dataIsString = ( typeof s.data === "string" ), jsonp = false;

    	if ( s.dataTypes[ 0 ] === "jsonp" || ( s.dataTypes[ 0 ] === "json" && ( options.jsonpCallback || options.jsonp != null || s.jsonp !== false && ( jsre.test( s.url ) || dataIsString && jsre.test( s.data ) ) ) ) ) {
    		var responseContainer,
    		    jsonpCallback = s.jsonpCallback = jSignage.isFunction( s.jsonpCallback ) ? s.jsonpCallback() : s.jsonpCallback,
			    previous = window[ jsonpCallback ],
			    url = s.url,
			    data = s.data,
			    replace = "$1" + jsonpCallback + "$2";

		    if ( s.jsonp !== false ) {
			    url = url.replace( jsre, replace );
			    if ( s.url === url ) {
				    if ( dataIsString ) {
					    data = data.replace( jsre, replace );
				    }
				    if ( s.data === data ) {
					    // Add callback manually
					    url += (/\?/.test( url ) ? "&" : "?") + s.jsonp + "=" + jsonpCallback;
				    }
			    }
		    }
		    s.url = url;
		    s.data = data;

		    // Install callback
		    window[ jsonpCallback ] = function( response ) {
			    responseContainer = [ response ];
		    };

    		// force json dataType
	    	s.dataTypes[ 0 ] = "json";
	    	jsonp = true;
	    }

		// Uppercase the type
		s.type = s.type.toUpperCase();
		if ( s.type!='GET' && s.type!='POST' )
		    jSignage.error( "jSignage only supports GET and POST ajax requests" );
		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );
		// More options handling for requests with no content
		if ( !s.hasContent ) {
			// If data is available, append data to url
			if ( s.data )
				s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.data;
			// Add anti-cache in url if needed
			if ( s.cache === false ) {
				var ts = jSignage.now(),
					// try replacing _= if it is there
					ret = s.url.replace( rts, "$1_=" + ts );
				// if nothing was replaced, add timestamp to the end
				s.url = ret + ( (ret === s.url ) ? ( rquery.test( s.url ) ? "&" : "?" ) + "_=" + ts : "" );
			}
		}
		var postType = 'text/plain';
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType )
			postType = s.contentType;
		var timeoutTimer = null, timedOut = false;

		var getURLCallback = function( status ) {
		    var statusText, error, isSuccess = false, success;
		    if ( status===false ) {
		        status = {
		            success: false,
		            contentType: '',
		            content: ''
		        };
		        timedOut = true;
		        statusText = "timeout";
		    } else if ( timedOut ) {
		        // We timed out already, discard response.
		        return;
		    } else {
		        if ( timeoutTimer )
		            jSignage.clearTimeout( timeoutTimer );
		    }
		    if ( status.success ) {
		        if ( jsonp ) {
	                try {
	                    new Function( status.content )();
	                } catch( e ) {
				        error = e;
	                }
	                if ( responseContainer ) {
	                    success = responseContainer[0];
	                    isSuccess = true;
	                } else {
				        statusText = "error";
	                }
		        } else {
			        try {
				        success = ajaxConvert( s, ajaxHandleResponses2( s, status ) );
				        isSuccess = true;
			        } catch(e) {
				        // We have a parsererror
				        statusText = "parsererror";
				        error = e;
			        }
			    }
			} else {
			    statusText = "error";
			}
	        if ( isSuccess ) {
	            if ( s.success )
	                s.success.call( callbackContext, success, statusText, status );
            } else {
                if ( s.error )
                    s.error.call( callbackContext, status, statusText, error || statusText );
            }
            if ( s.complete )
                s.complete.call( callbackContext, status, statusText );
	        if ( jsonp ) {
			    // Set callback back to previous value
			    window[ jsonpCallback ] = previous;
			    // Call if it was a function and we have a response
			    if ( responseContainer && jSignage.isFunction( previous ) ) {
				    window[ jsonpCallback ]( responseContainer[0] );
			    }
			}
		};

        if ( s.async && s.timeout > 0 )
			timeoutTimer = jSignage.setTimeout( function() { getURLCallback( false ); }, s.timeout );
        if ( s.type=='GET' )
            getURL( s.url, getURLCallback );
        else if ( s.type=='POST' )
            postURL( s.url, s.data, getURLCallback, postType );
    }
});

}

})();

// Replacement operators

(function() {

var constructors = [
    'audio', 'video', 'image', 'animation', 'media', 'textArea', 'g', 'playlist', 'slideshow', 'textBar', 'crawler', 'textTicker',
    'mediaCrawler', 'headlineTextArea', 'fitTextArea', 'pingPongTextArea', 'scrollingTextArea', 'table', 'popup', 'pushButton',
    'progressBar', 'progressWheel', 'carousel'
];

var layoutAttributes = [ 'left', 'top', 'right', 'bottom', 'width', 'height' ];

jSignage.fn.replace = function( ctor, args ) {
    this.each( function() {
        if ( !args ) args = { };
        if ( this.id!=null )
            args.id = this.id;
        var layer = jSignage[ctor].call( null, args )[0];
        var width = this.getAttributeNS( null, 'width' );
        var height =  this.getAttributeNS( null, 'height' );
        var parent = this.parentNode, before = this.nextElementSibling
        parent.removeChild( this );
        if ( width!=null && width!='' && height!=null && height!='' ) {
            var transform = this.getAttribute( 'transform' );
            var x = this.getAttribute( 'x' );
            var y = this.getAttribute( 'y' );
            if ( ( x!=null && x!='' ) || ( y!=null && y!='' ) ) {
                var t = 'translate(' + ( x || '0' ) + ' ' + ( y || '0' ) + ')';
                if ( transform )
                    transform += ' ';
                transform += t;
            }
            var g = jSignage._createElement( 'g', { transform: transform, width: width, height: height } );
            parent.insertBefore( g, before );
            jSignage.add( g, layer );
        } else {
            for ( var i=0; i<layoutAttributes.length; i++ ) {
                var a = layoutAttributes[i];
                var v = this.getAttributeNS( jSignage.spxNS, a );
                if ( v!=null && v!='' )
                    args[a] = v;
            }
            jSignage.add( parent, layer, null, before );
        }
    });
}

function defineReplace( ctor ) {
    jSignage.fn[ctor] = function( args ) {
        this.replace( ctor, args );
    }
}

for ( var i=0; i<constructors.length; i++ )
    defineReplace( constructors[i] );

// Canned layers constructor

function uncanEffect( layer, effect, args_modifier ) {
    if ( typeof(effect)=='string' ) {
        return layer[effect].call( layer );
    } else if ( typeof(effect)=='object' && effect.effect ) {
        var method =  layer[effect.effect];
        if ( method && typeof(method)=='function' ) {
            if ( 'args' in effect ) {
                var args = uncanObject( effect.args, args_modifier );
                if ( jSignage.isArray(args) )
                    return method.apply( layer, args );
                else
                    return method.call( layer, args );
            } else {
                return method.call( layer );
            }
        }
    }
    return layer;
}

function uncanObject( json, args_modifier ) {
    if ( typeof(json)=='object' ) {
        if ( jSignage.isArray(json) ) {
            for ( var i=0; i<json.length; i++ )
                json[i] = uncanObject( json[i], args_modifier );
        } else {
            var ctor = json.ctor;
            if ( ctor ) {
                var ctor = jSignage[ctor];
                if ( !ctor || typeof(ctor)!='function' )
                    return null;
                if ( 'args' in json ) {
                    var args = uncanObject( json.args, args_modifier );
                    if ( jSignage.isArray( args ) )
                        return ctor.apply( jSignage, args ) || null;
                    else
                        return ctor.call( jSignage, json.args ) || null;
                }
                return ctor.call( jSignage ) || null;
            } else if ( args_modifier ) {
                for ( var key in json )
                    json[key] = args_modifier( key, json[key] );
            }
        }
    }
    return json;
}

jSignage.extend({
    uncan: function( json, text_modifier, args_modifier ) {
        if ( json && typeof(json)=='object' ) {
            if ( jSignage.isArray(json) ) {
                if ( json.length==0 )
                    return null;
                if ( json.length==1 )
                    return jSignage.uncan( json[0], text_modifier, args_modifier );
                var elems = [];
                for ( var i=0; i<json.length; i++ ) {
                    var j = jSignage.uncan( json[i], text_modifier, args_modifier );
                    if ( j && j[0] )
                        elems.push( j[0] );
                }
                return jSignage( elems );
            } else {
                if ( !json.ctor )
                    return null;
                var layer = uncanObject( json, args_modifier );
                if ( !layer || !layer.jsignage )
                    return null;
                if ( json.fillFreeze )
                    layer.setFillFreeze();
                if ( json.initialVisibility )
                    layer.setInitialVisibility();
                if ( json.changeNumber )
                    jSignage.getRealMediaTarget(layer[0]).setAttributeNS( jSignage.spxNS, 'changeNumber', json.changeNumber );
                if ( json.effectIn ) {
                    if ( jSignage.isArray( json.effectIn ) ) {
                        for ( var i=0; i<json.effectIn.length; i++ )
                            layer = uncanEffect( layer, json.effectIn[i], args_modifier );
                    } else {
                        layer = uncanEffect( layer, json.effectIn, args_modifier );
                    }
                }
                if ( json.effectOut ) {
                    if ( jSignage.isArray( json.effectOut ) ) {
                        for ( var i=0; i<json.effectOut.length; i++ )
                            layer = uncanEffect( layer, json.effectOut[i], args_modifier );
                    } else {
                        layer = uncanEffect( layer, json.effectOut, args_modifier );
                    }
                }
                if ( 'textContent' in json ) {
                    var text = uncanObject( json.textContent );
                    if ( text_modifier || args_modifier ) {
                        if ( !jSignage.isArray(text) )
                            text = [ text ];
                        for ( var i=0; i<text.length; i++ ) {
                            if (  typeof(text[i])=='object' && 'text' in text[i] ) {
                                if ( text_modifier )
                                    text[i].text = text_modifier( text[i].text );
                                if ( args_modifier )
                                    for ( var key in args )
                                        if ( key!='text' )
                                            args[key] = args_modifier( key, args[key] );
                            } else {
                                if ( text_modifier )
                                    text = text_modifier( text );
                            }
                        }
                    }
                    layer.text( text );
                }
                if ( json.children ) {
                    var children = jSignage.uncan( json.children, text_modifier, args_modifier );
                    if ( children )
                        layer.add( children );
                }
                return layer;
            }
        }
        return null;
    }
});

})();
