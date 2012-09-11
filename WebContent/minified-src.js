/*
 * Minified.js - All that you for your web application, less than 4kb
 * 
 * Public Domain. Use, modify and distribute it any way you like. No attribution required.
 *
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 * 
 * Contains code based on https://github.com/douglascrockford/JSON-js (also Public Domain).
 */

/*
 * When you read this code, please keep in mind that it is optimized to produce small and gzip'able code
 * after being minimized using Closure (http://closure-compiler.appspot.com). Run-time performance and readability
 * should be acceptable, but are not a primary concern.
 */

// ==ClosureCompiler==
// @output_file_name minified.js
// @compilation_level ADVANCED_OPTIMIZATIONS
// ==/ClosureCompiler==

// @condblock topleveldollar
window['$'] =
// @condend
	
window['MINI'] = (function() {
	var backslashB = '\\b';
	var undef;

	/**
	 * @id ie7compatibility
	 * @module 9
	 * @configurable yes
	 * @name Backward-Compatibility for IE7 and similar browsers
	 * The difference between IE7 and IE8 compatibility that IE7 provides neither native selector support (querySelectorAll) nor native JSON.
	 * Disabling IE6 and IE7 will not only make Minified smaller, but give you full CSS selectors and complete JSON support. 
	 */
    // @condblock ucode
	var STRING_SUBSTITUTIONS = {    // table of character substitutions
            '\t': '\\t',
            '\r': '\\r',
            '\n': '\\n',
            '"' : '\\"',
            '\\': '\\\\'
        };
    // @condend

	/**
	 * @id ie6compatibility
	 * @requires ie7compatibility 
	 * @module 9
	 * @configurable yes
	 * @name Backward-Compatibility for IE6 and similar browsers
	 * The only difference for Minified between IE6 and IE7 is the lack of a native XmlHttpRequest in IE6 which makes the library a tiny 
	 * little bit larger.
	 */

	//// 0. COMMON MODULE ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	function isType(s,o) {
		return typeof s == o;
	}
	function isString(s) {
		return isType(s, 'string');
	}
	function isFunction(f) {
		return isType(f, 'function');
	}
	function isObject(f) {
		return isType(f, 'object');
	}
	function isList(v) {
		return v && v.length != null && !isString(v) && !v.data; // substr to test for string, data for Text node
	}
	function each(list, cb) {
		if (isList(list))
			for (var i = 0, len = list.length; i < len; i++)
				cb(list[i], i);
		else
			for (var n in list)
				if (list.hasOwnProperty(n))
					cb(n, list[n]);
		return list;
	}
	function filter(list, filterFunc) {
		var r = []; 
		each(list, function(node,index) {
			if (!filterFunc||filterFunc(node,index))
				r.push(node);
		});
		return r;
	}
	function collect(list, collectFunc, result) {
		result = result || [];
		each(list, function(item, index) {
			if (isList(item = collectFunc(item, index))) // extreme variable reusing: item is now the callback result
				each(item, function(rr) { result.push(rr); });
			else if (list != item)
				result.push(item);
		});
		return result;
	}

    /**
     * @id tostring
     * @dependency yes
     */
	function toString(s) { // wrapper for Closure optimization
		return String(s!=null ? s : '');
	}

    /**
     * @id getnamecomponents
     * @dependency yes
     * helper for set and get; if starts with $, rewrite as CSS style
     */
	function getNameComponents(name) {
		return name.replace(/^\$/, 'style.').split('.');
	}

    /**
     * @id now
     * @dependency yes
     */
    function now() {
    	return new Date().getTime();
    }
	
	/**
	 * @id dollar
	 * @module 1
	 * @requires dollarraw addelementlistfuncsstart
	 * @name MINI()
	 * @syntax MINI(selector)
	 * @syntax MINI(selector, context)
	 * @syntax MINI(function)
	 * @shortcut $(selector) - Enabled by default, but can be disabled in the builder.
	 * Uses a CSS-like selector to create an list containing all elements that fulfill the filter conditions. This is the most central function in Minified. The returned 
	 * list has a number of functions to work with the list elements.
	 *
	 * As a special shortcut, if you pass a function to MINI(), it will be registered using MINI.ready() to be executed when the DOM model is complete.
	 *
	 * The name of this function is MINI(), but by default Minified also creates an alias "$" for it, which should be more convenient and also familiar for most users.
	 *
	 * @example A simple selector to find an element by id.
	 * <pre>
	 * var l1 = $('#myElementId');
	 * </pre>
     * 	 
	 * @example You can also pass a reference to an DOM node to the function to receive a list containing only this node:
	 * <pre>
	 * var l2 = $(document.getElementById('myElementId')); 
	 * </pre>
     * 	 
	 * @example Lists will be copied:
	 * <pre>
	 * var l2 = $([elementA, elementB, elementC]); 
	 * </pre>
     * 	 
	 * @example A simple selector to find all elements with the given class.
	 * <pre>
	 * var l3 = $('.myClass');
	 * </pre>
     * 	 
	 * @example A selector to find all elements with the given name.
	 * <pre>
	 * var l4 = $('input'); // finds all input elements
	 * </pre>
     * 	 
	 * @example A selector to find all elements with the given name and class.
	 * <pre>
	 * var l5 = $('input.myRadio'); // finds all input elements wit
	 * </pre>
     * 	 
	 * @example A selector to find all elements that are descendants of the given element.
	 * <pre>
	 * var l6 = $('#myForm input'); // finds all input elements that are in the element with the id myForm
	 * </pre>
     * 	 
	 * @example A selector to find all elements with one of the given classes:
	 * <pre>
	 * var l7 = $('.a, .b'); // finds all elements that have either the class a or class b
	 * </pre>
     * 	 
	 * @example A selector that finds all elements that are descendants of the element myDivision, are inside a .myForm class and are input elements:
	 * <pre>
	 * var l8 = $('#myDivision .myForm input'); 
	 * </pre>
     * 	 
	 * @example Using contexts to make it easier to specify ancestors:
	 * <pre>
	 * var l9 = $('.myRadio', '#formA, #formB, #formC');  // same as $('#formA .myRadio, #formB .myRadio, #formC .myRadio')
	 * </pre>
     * 	 
	 * @example Using one of the list functions, set(), on the list, and set the element's text color. '$' at the beginning of the property name is short for 'style.' and thus
	 *               sets a CSS value.
	 * <pre>
	 * $('#myElementId').set('$color', 'red');
	 * </pre>
     *
	 * @example Most functions return the list you invoked them on, allowing you to chain them:
	 * <pre>
	 * $('#myForm .myRadio').addClass('uncheckedRadio')
	 *                               .set('checked', true)
	 *                               .on('click', function() {
	 *                                     $(this).toggleClass('uncheckedRadio');
	 *                                });
	 * </pre>
	 * 
	 * @example Using $() as a MINI.ready() shortcut:
	 * <pre>
	 * $(function() {
	 *   // work with the DOM tree
	 * });
	 * </pre>
	 * 
	 * @param selector a simple, CSS-like selector for the elements. It supports '#id' (lookup by id), '.class' (lookup by class),
	 *             'element' (lookup by elements) and 'element.class' (combined class and element). Use commas to combine several selectors.
	 *             You can also separate two (or more) selectors by space to find elements which are descendants of the previous selectors.
	 *             For example, use 'div' to find all div elements, '.header' to find all elements containing a class name called 'header', and
	 *             'a.popup' for all a elements with the class 'popup'. To find all elements with 'header' or 'footer' class names, 
	 *             write '.header, .footer'. To find all divs elements below the element with the id 'main', use '#main div'.
	 *             You can also use a DOM node as selector, it will be returned as a single-element list.  
	 *             If you pass a list, a shallow copy of the list will be returned.
	 *             If you pass a function, it will be registered using MINI.ready().
	 * @param context optional an optional selector, DOM node or list of DOM nodes which specifies one or more common ancestor nodes for the selection. 
	 *             The returned list contains only descendants of the context nodes, all others will be filtered out. 
	 * @return the array-like object containing the content specified by the selector. The returned object is guaranteed to
	 *             have a property 'length', specifying the number of elements, and allows you to access elements with numbered properties, as in 
	 *             regular arrays (e.g. list[2] for the second elements). Other Array functions are not guaranteed to be available, but you can use the filter()
	 *             function to get a list that is guaranteed to extend Array.
	 *             Please note that duplicates (e.g. created using the comma-syntax or several context nodes) will not be removed. If the selector was a list, 
	 *             the existing order will be kept. If the selector was a simple selector, the elements are in document order. If you combined several selectors 
	 *             using commas, only the individual results of the selectors will keep the document order, but will then be joined to a single list. This list will, 
	 *             as a whole, not be in document order anymore. The array returned has several convenience functions listed below:
	 */
	function MINI(selector, context) { 
		return isFunction(selector) ? ready(selector) : new M(dollarRaw(selector, context));
	}
	
	/**
	 * @id debug
	 * @module 8
	 * @configurable no
	 * @name Debugging Support
	 */
	function error(msg) {
		if (window.console) console.log(msg);
		throw Exception("MINI debug error: " + msg);
	}
    // @cond debug MINI['debug'] = true;
	
    /**
     * @stop
     */

    
    //// 1. SELECTOR MODULE ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * @id dollarraw
     * @requires 
     * @dependency yes
     */
    function dollarRaw(selector, context) { 
		var doc = document, list = [];
		var parent, steps, dotPos, mainSelector, subSelectors;
		var elements, regexpFilter, prop, className, elementName, reg;

		if (!selector) 
		    return list;

		if (context != null) { // context set?
			if ((context = dollarRaw(context)).length != 1) { // if not exactly one node, iterate through all and concat
				each(context, function(ci) {
					each(dollarRaw(selector, ci), function(l) {
						list.push(l);
					});
				});
				return list; 
			}
			parent = context[0];
		}
		
		function filterElements(retList) {
			if (!parent)
				return retList;
			return filter(retList, function(node,a) {
				a = node;
				while (a) {
					if (a.parentNode === parent)
						return 1;
					a = a.parentNode;
				}
				// fall through to return undef
			});
		}
		if (selector.nodeType || selector === window) 
		    return filterElements([selector]); 
		if (isList(selector)) {
			(function flattenList(l) {
				if (isList(l))
					each(l, flattenList);
				else
					list.push(l);
			})(selector);
		    return filterElements(list);
		}

		// @condblock ie7compatibility
		if ((subSelectors = selector.split(/\s*,\s*/)).length>1) {
			each(subSelectors, function(ssi) {
				each(dollarRaw(ssi, parent), function(aj) {
					list.push(aj);
				});
			});
			return list; 
		}

		if ((steps = selector.split(/\s+/)).length > 1)
			return dollarRaw(steps.slice(1).join(' '), dollarRaw(steps[0], parent));

		if (/^#/.test(mainSelector = steps[0]))
			return (elements=doc.getElementById(mainSelector.substr(1))) ? filterElements([elements]) : []; 

		// @cond debug if (/\s/.test(mainSelector)) error("Selector has invalid format, please check for whitespace.");
		// @cond debug if (/[ :\[\]]/.test(mainSelector)) error("Only simple selectors with ids, classes and element names are allowed.");

		parent = parent || doc;
		
		if ((dotPos = mainSelector.indexOf('.')) < 0)
		    elementName = mainSelector;
		else {
			elementName = mainSelector.substr(0, dotPos);  // element name only set of dotPos > 0
			className = mainSelector.substr(dotPos+1);     
		}
	
		if (className && parent.getElementsByClassName) { // not all browsers support getElementsByClassName
			elements = parent.getElementsByClassName(className); 
			regexpFilter = elementName;
			prop = 'nodeName';
		} 
		else { // also fallback for getElementsByClassName (slow!)
			elements = parent.getElementsByTagName(elementName || '*'); 
			regexpFilter = className;
			prop = 'className';
		}
		
		if (regexpFilter) {
			reg = new RegExp(backslashB +  regexpFilter + backslashB, 'i'); 
			each(elements, function(l) {
				if(reg.test(l[prop])) 
					list.push(l); 
			});
			return list;
		}
		return elements;
		// @condend
		
		// @cond !ie7compatibility return (parent || doc).querySelectorAll(mainSelector);
	};
	
	/**
	 * @stop
	 */
    
    /**
     * @id addelementlistfuncsstart
     * @requires addelementlistfuncend
     * @dependency yes
     */
	function M(list) {
		var len = this['length'] = list.length;
		for (var i = 0; i < len; i++)
			this[i] = list[i];
		
		/**
		 * @id listraw
		 * @module 1
		 * @requires dollar
		 * @name list.raw
		 * @syntax raw
		 * Returns the creation object of this list, either an Array, a NodeList or another MINI list. 
		 * This is mostly useful after calling filter(), as only then it is guaranteed to be an Array.
		 * @example
		 * <pre>
		 * $($('.myElement').filter().raw.slice(1, 3)).addClass('secondOrThird'); 
		 * </pre>
		 */
		this['raw'] = list;
		
		/**
		 * @id listlength
		 * @module 1
		 * @requires dollar
		 * @name list.length
		 * @syntax length
		 * Contains the number of elements in the list.
		 * 
		 * @example
		 * <pre>
		 * var list = $('input');
		 * var myValues = {};
		 * for (var i = 0; i < list.length; i++)
		 *    myValues[list[i].name] = list[i].value;
		 * </pre>
		 */
		// empty, always defined above
		

	    /**
	     * @id addelementlistfuncend
	     * @dependency yes
	     */
	}
	var proto = M.prototype;
	
    /**
     * @id each
     * @module 1
     * @requires dollar
     * @configurable yes
     * @name list.each()
     * @syntax each(callback)
     * Invokes the given function once for each item in the list with the item as first parameter and the zero-based index as second.
     *
     * @example This goes through all h2 elements of the class 'section' and changes their content:
     * <pre>
     * $('h2.section').each(function(item, index) {
     *     item.innerHTML = 'Section ' + index + ': ' + item.innerHTML;
     * });
     * </pre>
     *
     * @param callback the callback function(item, index) to invoke.
     * @return the list
     */
	proto['each'] = function (callback) {
		each(this.raw, callback); // use list, as a real Array may be faster
		return this;
	};
	
	/**
	 * @id filter
	 * @module 1
	 * @requires dollar
	 * @configurable yes
	 * @name list.filter()
	 * @syntax filter(filterFunc)
	 * Creates a new list that contains only those items approved by the given function. The function is called once for each item. 
	 * If it returns true, the item is in the returned list, otherwise it will be removed.
	 * This function also guarantees that the returned list is always based on an Array and thus its raw property has access to all
	 * Array functions.
	 *
	 * @example Creates a list of all unchecked checkboxes.
	 * <pre>
	 * var list = $('input').filter(function(item) {
	 *     return item.getAttribute('type') == 'checkbox' && item.checked;
	 * });
	 * </pre>
	 * 
	 * @example Converts a list to an Array-based list and uses the function Array.slice() to select only the second and third elements. Note that the Array returned by slice()
	 *               is a new Array object and does not contain addClass(), so the new Array must be converted to a MINI list using $() first.
	 * <pre>
	 * $($('.myElement').filter().raw.slice(1, 3)).addClass('secondOrThird'); 
	 * </pre>
	 *
	 * @param filterFunc optional the callback function(item, index) to invoke for each item with the item as first argument and the 0-based index as second argument.  
	 *        If the function returns false for an item, it is not included in the resulting list. If you omit the callback (or use null), filter() returns a new Array-based list that is a shallow copy
	 *        of the original.
	 * @return the new list, always guaranteed to be based on Array and always a new instance
	 */
	proto['filter'] = function(filterFunc) {
	    return new M(filter(this.raw, filterFunc));
	};
	
	/** 
     * @id collect 
     * @module 1 
     * @requires dollar 
     * @configurable yes 
     * @name list.collect() 
     * @syntax collect(collectFunc) 
     * @syntax collect(collectFunc, resultList) 
     * Creates a new list from the current list with the help of the given callback function. 
     * The callback is invoked once for each element of the current 
     * list. The callback results will be appended either to the given resultList, or to 
     * a new array. The callback can return 
     * <ul> 
     * <li>An array or another list-like object whose elements will be appended to the result array as single elements.</li> 
     * <li>A regular object which will be appended to the list</li> 
     * <li>null (or undefined), which means that no object will be added to the list. 
     * If you need to add null or modified to the result list, put it into a single-element array.</li> 
     * </ul> 
     * 
     * @example Goes through input elements. If they are text inputs, their value will be added to the list: 
     * <pre> 
     * var texts = $('input').collect(function(input) { 
     * if (input.getAttribute('type') != null || input.getAttribute('type') == 'text') // text is default, so check for null 
     *     return input.value; 
     * else 
     *     return null; // ignore 
     * }); 
     * </pre> 
     * 
     * @example Creates a list of all children of the selected list. 
     * <pre> 
     * var childList = $('.mySections').collect(function(node) { 
     * return node.childNodes; // adds a while list of nodes 
     * }); 
     * </pre> 
     * 
     * @example Goes through selected input elements. For each hit, the innerHTML is added twice, once in lower case and once in upper case: 
     * <pre> 
     * var elements = $('input.myTexts').collect(function(item) { 
     *     return [item.innerHTML.toLowerCase(), item.innerHTML.toUpperCase()]; 
     * }); 
     * </pre> 
     * 
     * @param collectFunc the callback function(item, index) to invoke for each item with the item as first argument and the 
     * 0-based index as second argument. 
     * If the function returns a list, its elements will be added to the result list. Other objects will also be added. Nulls 
     * will be ignored and not added. 
     * @param resultList optional if given, an array to append the elements to. collect() will use push() to add them. 
     * If omitted, a new array-based list will be created. 
     * @return the new list. If resultList has been omitted, the result is guaranteed to be based 
     * on Array and always a new instance 
     */ 
	proto['collect'] = function(collectFunc, resultList) { 
    	 return new M(collect(this.raw, collectFunc, resultList)); 
     };
	
	/**
	 * @id listremove
	 * @module 1
	 * @requires dollar
	 * @configurable yes
	 * @name list.remove()
	 * @syntax remove()
	 * Removes all nodes of the list from the DOM tree.
	 * 
	 * @example Removes the element with the id 'myContainer', including all children, from the DOM tree.
	 * <pre>
	 * $('#myContainer').remove(); 
	 * </pre>
	 */
     proto['remove'] = function() {
    	var list = this.raw;
		for (var j = list.length-1; j >= 0; j--) // go backward - NodeList may shrink when elements are removed!
			this.raw[j].parentNode.removeChild(this.raw[j]);
	};
	
	/**
	 * @id set
	 * @module 1
	 * @requires dollar getnamecomponents
	 * @configurable yes
	 * @name list.set()
	 * @syntax MINI(selector).set(name, value)
	 * @syntax MINI(selector).set(properties)
	 * @syntax MINI(selector).set(name, value, defaultFunction)
	 * @syntax MINI(selector).set(properties, undefined, defaultFunction)
	 * @syntax MINI(selector).set(properties, undefined, defaultFunction, defaultPrefix)
	 * Modifies the list's DOM elements or objects by setting their properties and/or attributes. set() has also special support for 
	 * setting an element's CSS style. You can either supply a single name and value to set only one property, or you
	 * can provide a map of properties to set.
	 * More complex operations can be accomplished by supplying a function as value. It will then be called for each element that will
	 * be set.
	 * 
	 * @example Unchecking checkboxes:
	 * <pre>
	 * $('input.checkbox').set('checked', false);
	 * </pre>
	 * 
	 * @example Changing the text of the next sibling:
	 * <pre>
	 * $('input.checkbox').set('nextSibling.innerHTML', 'New Text');
	 * </pre>
	 * 
	 * @example Changing styles:
	 * <pre>
	 * $('.bigText').set('$font-size', 'x-large');
	 * </pre>
	 * 
	 * @example Changing attributes:
	 * <pre>
	 * $('a.someLinks').set('@href', 'http://www.example.com/');
	 * </pre>
	 * 
	 * @example Changing attribute of the parent node:
	 * <pre>
	 * $('a.someLinks').set('parentNode.@title', 'Links');
	 * </pre>
	 * 
	 * @example Using a map to change several properties:
	 * <pre>
	 * $('input.checkbox').set({checked: false,
	 *                          'nextSibling.innerHTML': 'New Text',
	 *                          'parentNode.@title': 'Check this'});
	 * </pre>
	 * 
	 * @example When specifying CSS styles in maps, use underscores instead of dashes in the names to avoid quoting:
	 * <pre>
	 * $('.importantText').set({$fontSize: 'x-large',
	 *                          $color: 'black',
	 *                          $backgroundColor: 'red'});
	 * </pre>
	 * 
	 * @example You can specify a function as value to modify a value instead of just setting it:
	 * <pre>
	 * $('h2').set('innerHTML', function(oldValue, index) { 
	 * 		return 'Chapter ' + index + ': ' + oldValue.toUpperCase(); 
	 * });
	 * </pre>
	 * 
	 * @param name the name of a single property or attribute to modify. If prefixed with '@', it is treated as a DOM element's attribute. 
	 *                     If it contains one or more dots ('.'), the set() will traverse the properties of those names.
	 *                     A dollar ('$') prefix is a shortcut for 'style.'.
	 *                     In order to stay compatible with Internet Explorer 7 and earlier, you should not set the attributes '@class' and '@style'. Instead
	 *                     set the property 'className' instead of '@class' and set styles using the '$' syntax.
	 * 
	 * @param value the value to set. If it is a function, the function will be invoked for each list element to evaluate the value. 
	 * The function is called with with the old value as first argument and the index in the list as second.
	 * The third value is the function itself.
	 * If value is null and name specified an attribute, the value will be ignored.
	 * @param properties a map containing names as keys and the values to set as map values. See above for the syntax.
	 * @param defaultFunction optional if set and no function is provided as value, this function will be invoked for each list element 
	 *                                 and property to determine the value. The function is called with with the old value as first 
	 *                                 argument and the index in the list as second. The third value is the new value specified
	 *                                 in the set() call.
	 * @return the list
	 */
	proto['set'] = function (name, value, defaultFunction) {
		var self = this;
		// @cond debug if (name == null) error("First argument must be set!");
		if (value === undef) 
			each(name, function(n,v) { self.set(n, v, defaultFunction); });
		else {
			// @cond debug if (!/string/i.test(typeof name)) error('If second argument is given, the first one must be a string specifying the property name");
			var components = getNameComponents(name), len = components.length-1;
			var lastName = components[len].replace(/^@/, '');
			var f = isFunction(value) ? value : defaultFunction;
			self.each( 
				function(obj, c) {
					for (var i = 0; i < len; i++)
						obj = obj[components[i]];
					var newValue = f ? f(lastName == components[len] ? obj[lastName] : obj.getAttribute(lastName), c, value) : value;
					if (lastName == components[len])
						obj[lastName] = newValue;
					else if (newValue != null)  
						obj.setAttribute(lastName, newValue);
				});
		}
		return self;
	};
	
	/**
	 * @id append
	 * @module 1
	 * @requires set
	 * @configurable yes
	 * @name append()
	 * @syntax MINI(selector).append(name, value)
	 * @syntax MINI(selector).append(properties)
	 * Appends strings to properties or attributes of list items. append() works mostly like set() and supports the same syntax for properties, but instead of
	 * overwriting the old values, it reads the old value, converts it to a string and then appends the given value.
	 * 
	 * @example Add a link after each h2 headline:
	 * <pre>
	 * $('h2').append('outerHTML', '<a href="#toc">Table of Content</a>');
	 * </pre>
	 *
	 * @param name the name of a single property or attribute to modify. If prefixed with '@', it is treated as a DOM element's attribute. 
	 *                     If it contains one or more dots ('.'), the set() will traverse the properties of those names.
	 *                     A dollar ('$') prefix is a shortcut for 'style.'.
	 * @param value the value to append. It will be converted to a string before appending it. 
	 *                    If it is a function, the function will be invoked for each list element to evaluate the value, exactly like a in set(). Please note that the function's
	 *                    return value will not be appended, but will overwrite the existing value.
	 * @param properties a map containing names as keys and the values to append as map values. See above for the syntax.
	 * @return the list
	 */
	proto['append'] = function (name, value) { return this.set(name, value, function(oldValue, idx, newValue) { return toString(oldValue) + newValue;});};

	/**
	 * @id prepend
	 * @module 1
	 * @requires set
	 * @configurable yes
	 * @name prepend()
	 * @syntax MINI(selector).prepend(name, value)
	 * @syntax MINI(selector).prepend(properties)
	 * Prepends strings to properties or attributes of list items. prepend() works mostly like set() and supports the same syntax for properties, but instead of
	 * overwriting the old values, it reads the old value, converts it to a string and then prepends the given value.
	 * 
	 * @example Put a horizontal ruler in front of each h2 headline:
	 * <pre>
	 * $('h2').prepend('outerHTML', '<hr />');
	 * </pre>
	 *
	 * @param name the name of a single property or attribute to modify. If prefixed with '@', it is treated as a DOM element's attribute. 
	 *                     If it contains one or more dots ('.'), the set() will traverse the properties of those names.
	 *                     A dollar ('$') prefix is a shortcut for 'style.'.
	 * @param value the value to prepend. It will be converted to a string before prepending it. 
	 *                    If it is a function, the function will be invoked for each list element to evaluate the value, exactly like a in set(). Please note that the function's
	 *                    return value will not be prepended, but will overwrite the existing value.
	 * @param properties a map containing names as keys and the values to prepend as map values. See above for the syntax.
	 * @return the list
	 */
	proto['prepend'] = function (name, value) { return this.set(name, value, function(oldValue, idx, newValue) { return newValue + toString(oldValue);});};

	
	/**
	 * @id listadd
	 * @module 2
	 * @requires dollar
	 * @configurable yes
	 * @name list.add()
	 * @syntax MINI(selector).add(text)
	 * @syntax MINI(selector).add(callbackFunction)
	 * @syntax MINI(selector).add(elementContent)
	 * Adds the given node(s) as content to the list elements as additional nodes. If a string has been given, it will be added as text node to all elements.
	 * If you pass an element or a list, it will be added <strong>only to the first element of the list</strong>. In order to add elements
	 * to several list items, you need to pass a factory function(element, index) thats creates new instances for each item. 
	 * The function will be invoked for each element and may return either a string for a text node, a simple HTML element or a list containing both. 
	 *
	 * 
	 *
	 * @example Using the following HTML:
	 * <pre>
	 * &lt;div id="comments">Here is some text.&lt;br/>&lt;/div>
	 * </pre> 
	 * Add a text to the given 'comment' div:
	 * <pre>
	 * $('#comments').add('Some additional text.');
	 * </pre>
	 * This results in:
	 * <pre>
	 * &lt;div id="comments">Here is some text.&lt;br/>&lt;Some additional text./div>
	 * </pre> 
	 *
	 * @example Using the following HTML: 
	 * <pre>
	 * &lt;ul id="myList">
	 *   &lt;li>First list entry&lt;/li>
	 *   &lt;li>Second list entry&lt;/li>
	 * &lt;/ul>
	 * </pre>
	 * The following Javascript adds an element to the list:
	 * <pre>
	 * $('#myList').add(EE('li', 'My extra point');
	 * </pre>
	 * This results in
	 * <pre>
	 * &lt;ul id="myList">
	 *   &lt;li>First list entry&lt;/li>
	 *   &lt;li>Second list entry&lt;/li>
	 *   &lt;li>My extra point&lt;/li>
	 * &lt;/ul>
	 * </pre>
	 *
	 * @example Use a list to add several elements at once:
	 * <pre>
	 * $('#comments').add([EE('br'), 'Some text', EE('span', {'className': 'highlight'}, 'Some highlighted text')]);
	 * </pre>
	 *
	 * @example If you need to add an element or a list to more than one element, you need to provide a factory function:
	 * <pre>
	 * $('.chapter').add(function(e, index) { return EE('div', 'Scroll down for the next chapter.'); });
	 * </pre>
	 *
	 * @param text a text to add as text node of the list elements
	 * @param callbackFunction a function that will be invoked for each list element to determine its content. The function can return either a string for a text node,
	 *              an HTML element or a list containing strings and/or HTML elements.
	 * @param elementContent content to add <strong>only to the first element</strong> of the list. The content can be a string for a text node,
	 *              an HTML element or a list containing strings and/or HTML elements.
	 * @return the current list
	 */
	proto['add'] = function (children, addFunction) {
		return this.each(function(e, index) {
			var lastAdded;
			(function appendChildren(c) {
				if (isList(c))
					each(c, appendChildren);
				else if (c != null) {   // must check null, as 0 is a valid parameter 
					var n = c.nodeType ? c : document.createTextNode(c);
					if (lastAdded)
						lastAdded.parentNode.insertBefore(n, lastAdded.nextSibling);
					else if (addFunction)
						addFunction(n, e); 
					else
						e.appendChild(n);
					lastAdded = n;
				}
			})(isFunction(children) ? children(e, index) : (children == null || children.nodeType || isList(children)) && index ? null : children);
		});
	};

	
	/**
	 * @id listfill
	 * @module 2
	 * @requires dollar
	 * @configurable yes
	 * @name list.fill()
	 * @syntax MINI(selector).fill()
	 * @syntax MINI(selector).fill(text)
	 * @syntax MINI(selector).fill(callbackFunction)
	 * @syntax MINI(selector).fill(elementContent)
	 * Sets the content of the list elements, replacing old content. If a string has been given, it will be added as text node to all elements.
	 * If you pass an element or a list, it will be added <strong>only to the first element of the list</strong>. In order to add elements
	 * to several list items, you need to pass a factory function(element, index) thats creates new instances for each item. 
	 * The function will be invoked for each element and may return either a string for a text node, a simple HTML element or a list containing both. 
	 *
	 * Call fill() without arguments to remove all children from a node.
	 * 
	 * @example Using the following HTML:
	 * <pre>
	 * &lt;div id="status">Done&lt;/div>
	 * </pre> 
	 * fill() with a simple string replaces the element's content with the text:
	 * <pre>
	 * $('#status').fill('Please Wait..');
	 * </pre>
	 * Results in:
	 * <pre>
	 * &lt;div id="status">Please Wait..&lt;/div>
	 * </pre> 
	 *
	 * @example Pass an element to replace the old content with that. Note that an element can only be added to the first match:
	 * <pre>
	 * $('#status').fill(EE('span', {'className': 'bold'}, 'Please Wait...'));
	 * </pre>
	 * With the previous example's HTML, this would create this:
	 * <pre>
	 * &lt;div id="status">&lt;span class='bold'>Please Wait..&lt;/span>&lt;/div>
	 * </pre> 
	 *
	 * @example You can also pass a list of elements and texts:
	 * <pre>
	 * $('#status').fill(['Here', EE('br'), 'are', EE('br'), 'four', EE('br'), 'lines.]);
	 * </pre>
	 *
	 * @example Or a complete structure built using EE:
	 * <pre>
	 * $('#myListContainer').fill([EE('h2', 'My List'), EE('ol', [EE('li', 'First Item'), EE('li', 'Second Item'), EE('li', 'Third Item')])]);
	 * </pre>
	 *
	 * @example If you need to add your list to more than one element, you must add a factory function that re-creates
	 *              the list for every instance:
	 * <pre>
	 * $('.listContainers').fill(function(e, index) { return [EE('h2', 'List Number '+index), EE('ol', [EE('li', 'First Item'), EE('li', 'Second Item'), EE('li', 'Third Item')])]});
	 * </pre>
	 *
	 * @example fill() without arguments deletes the content of the list elements:
	 * <pre>
	 * $('.listContainers').fill();
	 * </pre>
	 *
	 * @param text a text to set as text node of the list elements
	 * @param callbackFunction a factory function(element, index) that will be invoked for each list element to determine its content. The function can return either a string for a text node,
	 *              an HTML element or a list containing strings and/or HTML elements. As parameters it receives the current list element and its 0-based index.
	 * @param elementContent content to add <strong>only to the first element</strong> of the list. The content can be a string for a text node,
	 *              an HTML element or a list containing strings and/or HTML elements. Note that if you use a HTML node or an array here, it will only be added once to
	 *              this list's first match.
	 * @return the current list
	 */
	proto['fill'] = function (children) {
		this.each(function(e) { MINI(e.childNodes).remove(); });
		return this.add(children);
	};

	/**
	 * @id listaddbefore
	 * @module 2
	 * @requires dollar
	 * @configurable yes
	 * @name list.addBefore()
	 * @syntax MINI(selector).addBefore(text)
	 * @syntax MINI(selector).addBefore(callbackFunction)
	 * @syntax MINI(selector).addBefore(elementContent)
	 * Inserts the given text or element(s) as sibling in front of each element of this list. If a string has been given, it will be added as text node.
	 * If you pass an element or a list, it will be inserted <strong>only in front of the first element of the list</strong>. In order to add elements
	 * to several list items, you need to pass a factory function(element, index) thats creates new instances for each item. 
	 * The function will be invoked for each element and may return either a string for a text node, a simple HTML element or a list containing both. 
	 *
	 * @example Using the following HTML:
	 * <pre>
	 * &lt;div>
	 *   <div id="mainText">Here is some text</div>
	 * &lt;/div>
	 * </pre>  
	 * addBefore() adds text in front of the selected list items.
	 * <pre>
	 * $('#mainText').addBefore('COMMENT');
	 * </pre>
	 * This results in:
	 * <pre>
	 * &lt;div>
	 *   COMMENT
	 *   <div id="mainText">Here is some text</div>
	 * &lt;/div>
	 * </pre>  
	 *
	 * @example You can also pass an element, but note that a node can only be added once to the first list item, even if the list has more than one item:
	 * <pre>
	 * $('#mainText').addBefore(EE('span', {'className': 'important'}, 'WARNING'));
	 * </pre>
	 * With the previous example's HTML, this would create this:
	 * <pre>
	 * &lt;div>
	 *   &lt;span class="important">WARNING&lt;/span>
	 *   <div id="mainText">Here is some text</div>
	 * &lt;/div>
	 * </pre> 
	 *
	 * @example Lists of elements and nodes are possible as well. Like nodes, it will only be added to the first list item.
	 * <pre>
	 * $('#status').addBefore([EE('hr'), 'WARNING']);
	 * </pre>
	 *
	 * @example If you need to add your list to more than one list item, you must add a factory function that re-creates
	 *              the list for every instance:
	 * <pre>
	 * $('.textSnippets').addBefore(function(e, index) { return [EE('hr'), 'WARNING']; });
	 * </pre>
	 *
	 * @param text a text to insert as text node in front of the list elements
	 * @param callbackFunction a factory function(element, index) that will be invoked for each list element to determine its content. The function can return either a string for a text node,
	 *              an HTML element or a list containing strings and/or HTML elements. As parameters it receives the current list element and its 0-based index.
	 * @param elementContent content to insert in front of <strong>the first element</strong> of the list. The content can be a string for a text node,
	 *              an HTML element or a list containing strings and/or HTML elements. Note that if you use a HTML node or an array here, it will only be added once to
	 *              this list's first match.
	 * @return the current list
	 */
	proto['addBefore'] = function (children) {
		return this.add(children, function(newNode, refNode) { refNode.parentNode.insertBefore(newNode, refNode); });
	};
	
	/**
	 * @id listaddafter
	 * @module 2
	 * @requires dollar
	 * @configurable yes
	 * @name list.addAfter()
	 * @syntax MINI(selector).addAfter(text)
	 * @syntax MINI(selector).addAfter(callbackFunction)
	 * @syntax MINI(selector).addAfter(elementContent)
	 * Inserts the given text or element(s) as sibling after each element of this list. If a string has been given, it will be added as text node.
	 * If you pass an element or a list, it will be inserted <strong>only after of the first element of the list</strong>. In order to add elements
	 * to several list items, you need to pass a factory function(element, index) thats creates new instances for each item. 
	 * The function will be invoked for each element and may return either a string for a text node, a simple HTML element or a list containing both. 
	 *
	 * @example Using the following HTML:
	 * <pre>
	 * &lt;div>
	 *   <div id="mainText">Here is some text</div>
	 * &lt;/div>
	 * </pre>   
	 * Use addAfter() with a simple string to add a text node.
	 * <pre>
	 * $('#mainText').addAfter('Disclaimer: bla bla bla');
	 * </pre>
	 * This results in the following HTML:
	 * <pre>
	 * &lt;div>
	 *   <div id="mainText">Here is some text</div>
	 *   Disclaimer: bla bla bla
	 * &lt;/div>
	 * </pre>   
	 *
	 * @example You can also pass an element, but note that a node can only be added once to the first list item, even if the list has more than one item:
	 * <pre>
	 * $('#mainText').addAfter(EE('span', {'className': 'disclaimer'}, 'Disclaimer: bla bla bla'));
	 * </pre>
	 * With the previous example's HTML, this would create this:
	 * <pre>
	 * &lt;div>
	 *   <div id="mainText">Disclaimer: bla bla bla</div>
	 *   &lt;span class="disclaimer">WARNING&lt;/span>
	 * &lt;/div>
	 * </pre> 
	 *
	 * @example Lists of elements and nodes are possible as well. Like nodes, it will only be added to the first list item.
	 * <pre>
	 * $('#status').addAfter([EE('hr'), 'Disclaimer']);
	 * </pre>
	 *
	 * @example If you need to add your list to more than one list item, you must add a factory function that re-creates
	 *              the list for every instance:
	 * <pre>
	 * $('.textSnippets').addAfter(function(e, index) { return [EE('hr'), 'Disclaimer']; });
	 * </pre>
	 *
	 * @param text a text to insert as sibling text node after of the list elements
	 * @param callbackFunction a factory function(element, index) that will be invoked for each list element to determine its content. The function can return either a string for a text node,
	 *              an HTML element or a list containing strings and/or HTML elements. As parameters it receives the current list element and its 0-based index.
	 * @param elementContent content to insert <strong>only after the first element</strong> of the list. The content can be a string for a text node,
	 *              an HTML element or a list containing strings and/or HTML elements. Note that if you use a HTML node or an array here, it will only be added once to
	 *              this list's first match.
	 * @return the current list
	 */
	proto['addAfter'] = function (children) {
		return this.add(children, function(newNode, refNode) { refNode.parentNode.insertBefore(newNode, refNode.nextSibling); });
	};
	
	/**
	 * @id listaddfront
	 * @module 2
	 * @requires dollar
	 * @configurable yes
	 * @name list.addFront()
	 * @syntax MINI(selector).addFront(text)
	 * @syntax MINI(selector).addFront(callbackFunction)
	 * @syntax MINI(selector).addFront(elementContent)
	 * Adds the given node(s) as content to the list elements as additional nodes. Unlike add(), the new nodes will be the first children of the list items.
	 * If a string has been given, it will be added as text node to all elements.
	 * If you pass an element or a list, it will be added <strong>only to the first element of the list</strong>. In order to add elements
	 * to several list items, you need to pass a factory function(element, index) thats creates new instances for each item. 
	 * The function will be invoked for each element and may return either a string for a text node, a simple HTML element or a list containing both. 
	 *
	 * @example Using the following HTML:
	 * <pre>
	 * &lt;div id="comments">Here is some text.&lt;br/>&lt;/div>
	 * </pre> 
	 * Add a text to the given 'comment' div:
	 * <pre>
	 * $('#comments').addFront('Some additional text. ');
	 * </pre>
	 * This results in:
	 * <pre>
	 * &lt;div id="comments">Some additional text.Here is some text.&lt;br/>&lt;/div>
	 * </pre> 
	 *
	 * @example Using the following HTML: 
	 * <pre>
	 * &lt;ul id="myList">
	 *   &lt;li>First list entry&lt;/li>
	 *   &lt;li>Second list entry&lt;/li>
	 * &lt;/ul>
	 * </pre>
	 * The following Javascript adds an element to the list:
	 * <pre>
	 * $('#myList').addFront(EE('li', 'My extra point'));
	 * </pre>
	 * This results in
	 * <pre>
	 * &lt;ul id="myList">
	 *   &lt;li>My extra point&lt;/li>
	 *   &lt;li>First list entry&lt;/li>
	 *   &lt;li>Second list entry&lt;/li>
	 * &lt;/ul>
	 * </pre>
	 *
	 * @example Use a list to add several elements at once:
	 * <pre>
	 * $('#comments').addFront([EE('br'), 'Some text', EE('span', {'className': 'highlight'}, 'Some highlighted text')]);
	 * </pre>
	 *
	 * @example If you need to add an element or a list to more than one element, you need to provide a factory function:
	 * <pre>
	 * $('.chapter').addFront(function(e, index) { return EE('div', 'Scroll down for the next chapter.'); });
	 * </pre>
	 *
	 * @param text a text to add as text node of the list elements
	 * @param callbackFunction a function that will be invoked for each list element to determine its content. The function can return either a string for a text node,
	 *              an HTML element or a list containing strings and/or HTML elements.
	 * @param elementContent content to add <strong>only to the first element</strong> of the list. The content can be a string for a text node,
	 *              an HTML element or a list containing strings and/or HTML elements.
	 * @return the current list
	 */
	proto['addFront'] = function (children) {
		return this.add(children, function(newNode, refNode) { refNode.insertBefore(newNode, refNode.firstChild); });
	};
	
	/**
	 * @id listreplace
	 * @module 2
	 * @requires dollar
	 * @configurable yes
	 * @name list.replace()
	 * @syntax MINI(selector).replace(text)
	 * @syntax MINI(selector).replace(callbackFunction)
	 * @syntax MINI(selector).replace(elementContent)
	 * Replaces the list items with the the given node(s) in the DOM tree. 
	 * If a string has been given, each list item will be replaced with a new text node containing the string.
	 * If you pass an element or a list, it will replace <strong>only the first element of the list</strong>. In order to replace 
	 * several list items with content more complex than a string, you need to pass a factory function(element, index) thats creates new instances for each item. 
	 * The function will be invoked for each element and may return either a string for a text node, a simple HTML element or a list containing both. 
	 *
	 * @example Using the following HTML:
	 * <pre>
	 * &lt;div id="comments">
	 *    &lt;div id="commentOne">My old comment.&lt;/div>
	 * &lt;/div>
	 * </pre> 
	 * Replaces the div 'commentOne':
	 * <pre>
	 * $('#commentOne').replace('Some new comment.');
	 * </pre>
	 * This results in:
	 * <pre>
	 * &lt;div id="comments">
	 *    Some new comment.
	 * &lt;/div>
	 * </pre> 
	 * Please note that not only the text has changed, but the whole &lt;div> has been replaced. If you only want to replace the element's text content
	 * you should use fill() instead of replace().
	 *
	 * @example Using the following HTML: 
	 * <pre>
	 * &lt;ul id="myList">
	 *   &lt;li>First list entry&lt;/li>
	 *   &lt;li>Second list entry&lt;/li>
	 * &lt;/ul>
	 * </pre>
	 * The following JavaScript will replace <strong>only the first &lt;li> element</strong>:
	 * <pre>
	 * $('#myList li').replace(EE('li', 'My extra point'));
	 * </pre>
	 * This results in
	 * <pre>
	 * &lt;ul id="myList">
	 *   &lt;li>My extra point&lt;/li>
	 *   &lt;li>Second list entry&lt;/li>
	 * &lt;/ul>
	 * </pre>
	 *
	 * @example If you need to replace several elements at once, you need to provide a factory function
	 * <pre>
	 * $('#myList li').replace(function(e, index) { return EE('li', 'My extra point'); });
	 * </pre>
	 * With the previous HTML would result in:
	 * <pre>
	 * &lt;ul id="myList">
	 *   &lt;li>My extra point&lt;/li>
	 *   &lt;li>My extra point&lt;/li>
	 * &lt;/ul>
	 * </pre>
	 *
	 * @example Use a list to add several elements at once:
	 * <pre>
	 * $('#myList li').replace(function(e, index) { return [EE('li', 'Extra point 1'), EE('li', 'Extra point 2')]; });
	 * </pre>
	 * Now every original &lt;li> element is replaced with two elements:
	 * <pre>
	 * &lt;ul id="myList">
	 *   &lt;li>Extra point 1&lt;/li>
	 *   &lt;li>Extra point 2&lt;/li>
	 *   &lt;li>Extra point 1&lt;/li>
	 *   &lt;li>Extra point 2&lt;/li>
	 * &lt;/ul>
	 * </pre>
	 *
	 * @param text a text for the text nodes that replace the list elements
	 * @param callbackFunction a function that will be invoked for each list element to determine its content. The function can return either a string for a text node,
	 *              an HTML element or a list containing strings and/or HTML elements.
	 * @param elementContent content to replace <strong>only to the first element</strong> of the list with. The content can be a string for a text node,
	 *              an HTML element or a list containing strings and/or HTML elements.
	 * @return the current list
	 */
	proto['replace'] = function (children) {
		return this.add(children, function(newNode, refNode) { refNode.parentNode.replaceChild(newNode, refNode); });
	};

	
	/**
	 * @id listanimate
	 * @module 7
	 * @requires loop dollar getnamecomponents tostring
	 * @configurable yes
	 * @name list.animate()
	 * @syntax MINI(selector).animate(properties)
	 * @syntax MINI(selector).animate(properties, durationMs)
	 * @syntax MINI(selector).animate(properties, durationMs, linearity)
	 * @syntax MINI(selector).animate(properties, durationMs, linearity, callback)
	 * @shortcut $(selector).animate(properties, durationMs, linearity, callback) - Enabled by default, but can be disabled in the builder.
	 * Animates the items of the list by modifying their properties and attributes. animate() can work with numbers, strings that contain exactly one
	 * number and which may also contain units or other text, and with colors in the CSS notations 'rgb(r,g,b)', '#rrggbb' or '#rgb'.
	 *
	 * When you invoke the function, it will first read all old values from the object and extract their numbers and colors. These start values will be compared to 
	 * the destination values that have been specified in the given properties. Then animate() will create a background task using MINI.loop() that will update the 
	 * specified properties in frequent intervals so that they transition to their destination values.
	 *
	 * The start values will be read using the elements' style properties. Therefore it is important that you either set the start values directly in the elements'
	 * style attribute, or set them yourself before you start the animation. Styles inherited from CSS definitions will not provide correct start values!
	 *
	 * You can define the kind of transition using the 'linearity' parameter. If you omit it or pass 0, animate's default algorithm will cause a smooth transition
	 * from the start value to the end value. If you pass 1, the transition will be linear, with a sudden start and end of the animation. Any value between 0 and 1 
	 * is also allowed and will give you a transition that is 'somewhat smooth'. 
	 *
	 * If the start value of a property is a string containing a number, animate() will always ignore all the surrounding text and use the destination value as a template 
	 * for the value to write. This can cause problems if you mix units in CSS. For example, if the start value is '10%' and you specify an end value of '20px', animate
	 * will do an animation from '10px' to '20px'. It is not able to convert units. 
	 *
	 * animate() does not only support strings with units, but any string containing exactly one number. This allows you, among other things, with IE-specific CSS properties.
	 * For example, you can transition from a start value 'alpha(opacity = 0)' to 'alpha(opacity = 100)'. 
	 *
	 * When you animate colors, animate() is able to convert between the three notations rgb(r,g,b), #rrggbb or #rgb. You can use them interchangeably, but you can not 
	 * use color names such as 'red'.
	 *
	 * To allow more complex animation, animate() allows you to add a callback which will be called when the animation has finished. You can also specify a delay
	 * to create timelines.
	 *
	 * @example Move an element. Note that you need to set the initial value for styles, unless they have been explicitly set
	 * for the HTML element using the style attribute before or you set it earlier with an earlier set() or animate() invocation.
	 * <pre>
	 * $('#myMovingDiv').set({$left: '0px', $top: '0px'})                // start values
	 *                  .animate({$left: '50px', $top: '100px'}, 1000);  // animation
	 * </pre>
	 * 
	 * @example Change the color of an element:
	 * <pre>
	 * $('#myBlushingDiv').set({$backgroundColor: '#000000'})
	 *                    .animate({$backgroundColor: '#ff0000'}, 1000);
	 * </pre>
	 *
	 * @example Chained animation using callbacks. The element is first moved to the position 200/0, then to 200/200, and finally to 100/100.
	 * <pre>
	 * $('#myMovingDiv').set({$left: '0px', $top: '0px'})
	 *                  .animate({$left: '200px', $top: '0px'}, 600, 0, function(list) {
	 *         list.animate({$left: '200px', $top: '200px'}, 800, 0, function(list) {
	 *                list.animate({$left: '100px', $top: '100px'}, 400);
	 *         });
	 * });
	 * </pre>
	 *
	 * @example Does same as the previous example, but implemented using delays:
	 * <pre>
	 * $('#myMovingDiv').set({$left: '0px', $top: '0px'})
	 *                  .animate({$left: '200px', $top: '0px'}, 600)
	 *                  .animate({$left: '200px', $top: '200px'}, 800, 0, null, 600)
	 *                  .animate({$left: '100px', $top: '100px'}, 400), 0, null, 600+800);
	 * </pre>
	 *
	 * @example Three block race to the position 500px with delayed start:
	 * <pre>
	 * $('#racingDiv1').set({$left: '0px'}).animate({$left: '500px'}, 750, 0, null, 250); // waits 250ms, then needs 750ms
	 * $('#racingDiv2').set({$left: '0px'}).animate({$left: '500px'}, 900, 1);            // starts immediately, linear motion, then needs 900ms
	 * $('#racingDiv3').set({$left: '0px'}).animate({$left: '500px'}, 500, 0, null, 300); // waits 200ms, then needs 500ms
	 * </pre>
	 *
	 * @param list a list of objects
	 * @param properties a property map describing the end values of the corresponding properties. The names can use the
	 *                   MINI.set syntax ('@' prefix for attributes, '$' for styles). Values must be either numbers, numbers with
	 *                   units (e.g. "2 px") or colors ('rgb(r,g,b)', '#rrggbb' or '#rgb'). The properties will be set 
	 *                   for all elements of the list.
	 * @param durationMs optional the duration of the animation in milliseconds. Default: 500ms;
	 * @param linearity optional defines whether the animation should be linear (1), very smooth (0) or something between. Default: 0.
	 * @param callback optional if given, this function(list) will be invoked the list as parameter when the animation finished
	 * @param delayMs optional if set, the animation will be delayed by the given time in milliseconds. Default: 0;
	 * @return the list
	 */
	proto['animate'] = function (properties, durationMs, linearity, callback, delayMs) {
		// @cond debug if (!properties || typeof properties == 'string') error('First parameter must be a map of properties (e.g. "{top: 0, left: 0}") ');
		// @cond debug if (linearity < 0 || linearity > 1) error('Third parameter must be at least 0 and not larger than 1.');
		// @cond debug if (callback || typeof callback == 'function') error('Fourth is optional, but if set it must be a callback function.');
		// @cond debug var colorRegexp = /^(rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|#\w{3}|#\w{6})\s*$/i;
		function toNumWithoutUnit(v) {
			return parseFloat(toString(v).replace(/[^\d.-]/g, ''));
		}
		function replaceValue(originalValue, newNumber) {
			return toString(originalValue).replace(/-?[\d.]+/, newNumber);
		}
		var self = this;
		var initState = []; // for each item contains a map {s:{}, e:{}, o} s/e are property name -> startValue of start/end. The item is in o.
		if (delayMs)
			window.setTimeout(function(){self['animate'](properties, durationMs, linearity, callback);}, delayMs);
		else {
			durationMs = durationMs || 500;
			linearity = linearity || 0;
			
			self.each(function(li) {
				var p = {o:MINI(li), s:{}, e:{}, u:{}}; 
				each(properties, function(name) {
					var dest = properties[name];
					var components = getNameComponents(name);
					var len = components.length-1;
					var lastName = components[len].replace(/^@/, '');
					var a = li;
					for (var j = 0; j < len; j++) 
						a = a[components[j]];
					p.s[name] = ((lastName != components[len]) ? a.getAttribute(lastName) : a[lastName]) || 0;
					p.e[name] = /^[+-]=/.test(dest) ?
						replaceValue(dest.substr(2), toNumWithoutUnit(p.s[name]) + toNumWithoutUnit(dest.replace(/\+?=/, ''))) 
						: dest;
					// @cond debug if (!colorRegexp.test(dest) && isNan(toNumWithoutUnit(dest))) error('End value of "'+name+'" is neither color nor number: ' + toString(dest));
					// @cond debug if (!colorRegexp.test(p.s[name]) && isNan(toNumWithoutUnit(p.s[name]))) error('Start value of "'+name+'" is neither color nor number: ' + toString(p.s[name]));
					// @cond debug if (colorRegexp.test(dest) && !colorRegexp.test(p.s[name])) error('End value of "'+name+'" looks like a color, but start value does not: ' + toString(p.s[name]));
					// @cond debug if (colorRegexp.test(p.s[name]) && !colorRegexp.test(dest)) error('Start value of "'+name+'" looks like a color, but end value does not: ' + toString(dest));
				});
				initState.push(p);
			});
					
			loop(function(timePassedMs, stop) {
				function getColorComponent(colorCode, index) {
					return (/^#/.test(colorCode)) ?
						parseInt(colorCode.length > 6 ? colorCode.substr(1+index*2, 2) : ((colorCode=colorCode.charAt(1+index))+colorCode), 16)
						:
						parseInt(colorCode.replace(/[^\d,]+/g, '').split(',')[index]);
				}

				function interpolate(startValue, endValue) {
					var d = endValue - startValue;
					return startValue +  timePassedMs/durationMs * (linearity * d + (1-linearity) * timePassedMs/durationMs * (3*d - 2*d*timePassedMs/durationMs)); 
				}
				
				if (timePassedMs >= durationMs || timePassedMs < 0) {
					each(initState, function(isi) { // set destination values
						isi.o.set(isi.e);
					});
					stop();
					if (callback) 
						callback(self.raw);
				}
				else
					each(initState, function(isi) {
						each(isi.s, function(name, start) {
							var newValue= 'rgb(', end=isi.e[name];
							if (/^#|rgb\(/.test(end)) { // color in format '#rgb' or '#rrggbb' or 'rgb(r,g,b)'?
								for (var i = 0; i < 3; i++) 
									newValue += Math.round(interpolate(getColorComponent(start, i), getColorComponent(end, i))) + (i < 2 ? ',' : ')');
							}
							else 
								newValue = replaceValue(end, interpolate(toNumWithoutUnit(start), toNumWithoutUnit(end)));
							isi.o.set(name, newValue);
						});
					});
				});
			}
			return self;		
		};

	
		/**
		 * @id liston
		 * @module 5
		 * @requires dollar
		 * @configurable yes
		 * @name list.on()
		 * @syntax MINI(selector).on(el, name, handler)
		 * @shortcut $(selector).on(el, name, handler) - Enabled by default, but can be disabled in the builder.
		 * Registers the function as event handler for all items in the list.
		 * 
		 * All handlers get a the original event object and minified's compatibility event object as arguments, and 'this' set to the source element
		 * of the event (e.g. the button that has been clicked). The original event object the is object given to the event or obtained 
		 * from 'window.event'. The compatibility event object has the following properties:
		 * <ul>
		 * <li><code>keyCode</code> - the key code, if it was a key press. Will return event.keyCode if set, otherwise event.which. This should work in practically all browsers. 
		 *                                              See http://unixpapa.com/js/key.html for key code tables.</li>
		 * <li><code>rightClick</code> - true if the right mouse button has been clicked, false otherwise. Works browser-independently.</li>
		 * <li><code>wheelDir</code> - for mouse wheel or scroll events, the direction (1 for up or -1 for down)</li>
		 * <li><code>pageX</code> - the page coordinate of the event
		 * <li><code>pageY</code> - the page coordinate of the event
		 * </ul>
		 * Unless the handler returns 'true', the event will not be propagated to other handlers.
		 * 
		 * @example Adds a simple click handler to a button. Event objects are ignored.
		 * <pre>
		 * $('#myButton').on('click', function() {
		 *    window.alert('Button clicked!');
		 * });
		 * </pre>
		 *
		 * @example Adds a handler to all divs that paints their background color to red when clicked.
		 * <pre>
		 * $('div').on('click', function() {
		 *    this.style.backgroundColor = 'red';    // 'this' contains the element that caused the event
		 * });
		 * </pre>
		 *
		 * @example Adds an handler for mousedown events to a canvas:
		 * <pre>
		 * var ctx = $$('#myCanvas').getContext('2d');                      // get a canvas context
		 * $('#myCanvas').on('mousedown', function(evt, extraInfo) {  // add handler for mouse down events
		 *     if (extraInfo.rightButton)                                            // right mouse button paints white, all other black
		 *         ctx.fillStyle = "white";
		 *     else
		 *         ctx.fillStyle = "black";
		 *     ctx.fillRect(evt.clientX, evt.clientY, 1, 1);                     // paints a pixel at the cursor position
		 * });
		 * </pre>
		 *
		 * @param name the name of the event, e.g. 'click'. Case-sensitive. The 'on' prefix in front of the name must not used.
		 * @param handler the function(event, extraEvent) to invoke when the event has been triggered. The handler gets the original event object as
		 *                first parameter and the compatibility object as second. 'this' is the element that caused the event.
		 *                Unless the handler returns true, all further processing of the event will be stopped. 
		 *                Minified will not use directly add this handler to the element, but create a wrapper that will eventually invoke it. The wrapper 
		 *                is added to the handler in a property called 'MINI'.
		 * @return the list
		 */
		proto['on'] = function (name, handler) {
			// @cond debug if (!(name && handler)) error("Both parameters to on() are required!"); 
			// @cond debug if (/^on/i.test(name)) error("The event name looks invalid. Don't use an 'on' prefix (e.g. use 'click', not 'onclick'"); 
			return this.each(function(el) {
				handler['MINI'] = handler['MINI'] || function(e) {
					e = e || window.event;
					var l = document.documentElement, b = document.body;
					// @cond debug try {
					if (!handler.call(e.target, e, { 
							keyCode: e.keyCode || e.which, // http://unixpapa.com/js/key.html
							rightClick: e.which ? (e.which == 3) : (e.button == 2),
							pageX: l.scrollLeft + b.scrollLeft + e.clientX,
							pageY: l.scrollTop + b.scrollTop + e.clientY,
							wheelDir: (e.detail < 0 || e.wheelDelta > 0) ? 1 : -1
					})) {
						if (e.preventDefault) // W3C DOM2 event cancelling
							e.preventDefault();
						if (e.stopPropagation) // cancel bubble for W3C DOM
							e.stopPropagation();
						e.returnValue = false; // cancel for IE
						e.cancelBubble = true; // cancel bubble for IE
					}
					// @cond debug } catch (ex) { error("Error in event handler \""+name+"\": "+ex); }
				};
				if (el.addEventListener)
					el.addEventListener(name, handler['MINI'], true); // W3C DOM
				else 
					el.attachEvent('on'+name, handler['MINI']);  // IE < 9 version
			});
		};
		
	/**
	 * @id listoff
	 * @module 5
	 * @requires dollar liston
	 * @configurable yes
	 * @name list.off()
	 * @syntax MINI.off(element, name, handler)
	 * Removes the event handler. The call will be ignored if the given handler has not registered using on().
	 * 
	 * @example Adds a handler to an element
	 * <pre>
	 * function myEventHandler() {
	 *    this.style.backgroundColor = 'red';    // 'this' contains the element that caused the event
	 * }
	 * $('#myElement').on('click', myEventHandler);     // add event handler
	 *
	 * window.setInterval(function() {                      // after 5s, remove event handler
	 *    $('#myElement').off('click', myEventHandler);
	 * }, 5000);
	 * </pre>
	 * 
	 * @param name the name of the event (see on)
	 * @param handler the handler to unregister, as given to on(). It must be a handler that has previously been registered using
	 *                on().
     * @return the list
     */
	proto['off'] = function (name, handler) {
		// @cond debug if (!name || !name.substr) error("No name given or name not a string.");
		// @cond debug if (!handler || !handler['MINI']) error("No handler given or handler invalid.");
	   	return this.each(function(el) {
			if (el.addEventListener)
				el.removeEventListener(name, handler['MINI'], true); // W3C DOM
			else 
				el.detachEvent('on'+name, handler['MINI']);  // IE < 9 version
	   	});
	};
	
	/**
	 * @id listoffset
	 * @module 1
	 * @requires dollar
	 * @configurable yes
	 * @name list.offset()
	 * @syntax MINI(selector).offset()
	 * @shortcut $(selector).offset() - Enabled by default, unless disabled with "Disable $ and $$" option
	 * Returns the pixel page coordinates of the list's first element. Page coordinates are the pixel coordinates within the document, with 0/0 being the upper left corner, independent of the user's
	 * current view (which depends on the user's current scroll position and zoom level).
	 *
	 * @example Displays the position of the element with the id 'myElement' in the element 'resultElement':
	 * <pre>
	 * var pos = $('#myElement').offset();
	 * $('#resultElement').set('innerHTML', '#myElement's position is left=' + pos.left + ' top=' + pos.top);
	 * </pre>
	 *
	 * @param element the element whose coordinates should be determined
	 * @return an object containing pixel coordinates in two properties 'left' and 'top'
	 */
	proto['offset'] = function() {
		var elem = this.raw[0];
		var dest = {left: 0, top: 0};
		while (elem) {
			dest.left += elem.offsetLeft;
			dest.top += elem.offsetTop;
			elem = elem.offsetParent;
		}
		return dest;
     };

    /**
     * @id createclassnameregexp
     * @dependency yes
     */
    function createClassNameRegExp(className) {
        return new RegExp(backslashB + className + backslashB);
    }
    
    /**
     * @id removeclassregexp
     * @dependency yes
     */
	function removeClassRegExp(el, reg) {
		return el.className.replace(reg, '').replace(/^\s+|\s+$/g, '').replace(/\s\s+/g, ' ');
	}
    
	/**
	 * @id listhasclass
	 * @module 1
	 * @requires dollar createclassnameregexp
	 * @configurable yes
	 * @name list.hasClass()
	 * @syntax hasClass(className)
	 * Checks whether any element in the list of nodes has a class with the given name. Returns the first node if found, or undefined if not found.
	 *
	 * @example Checks whether the element 'myElement' the class 'myClass'. If yes, it sets the text color to red.
	 * <pre>
	 * if($('#myElement').hasClass('myClass'))
	 *     $('#myElement').set('$color', 'red');
	 * </pre>
	 *
	 * @param className the name to find 
	 * @return the first element found with the class name, or undefined if not found
	 */
	proto['hasClass'] = function(className) {
		var list = this.raw;
        var reg = createClassNameRegExp(className); 
        for (var i = 0; i < list.length; i++)
        	if (reg.test(list[i].className||''))
           		return list[i];
        // fall through if no match!
    };

    /**
     * @id listremoveclass
     * @module 1
     * @requires dollar createclassnameregexp removeclassregexp
     * @configurable yes
	 * @name list.removeClass()
     * @syntax removeClass(className)
     * Removes the given class from all elements of the list. Elements that do not have the class will be ignored.
     * 
     * @example Remove the class 'myClass' from all divs that have the class 'sector':
     * <pre>
     * $('div.sector').removeClass('myClass');
     * </pre>
     * @param className the name to remove
     */
    proto['removeClass'] = function removeClass(className) {
        var reg = createClassNameRegExp(className);
        return this.each(function(li) {
        	li.className = removeClassRegExp(li, reg);
        });
    };

    /**
     * @id listaddclass
     * @module 1
     * @requires dollar listremoveclass
     * @configurable yes
	 * @name list.addClass()
     * @syntax addClass(className)
     * Adds the given class name to all elements to the list. If the element already had that class, it will be removed and then
     * added again so that the new class is always the last.
     * 
     * @example Add the class 'myClass' to all divs that have the class 'sector':
     * <pre>
     * $('div.sector').addClass('myClass');
     * </pre>
     * 
     * @example Combine addClass() with removeClass() to replace a class:
     * <pre>
     * $('#myLabel').removeClass('highlighted').addClass('selectable');
     * </pre>
     * 
     * @param className the name to add
     */
    proto['addClass'] = function(className) {
        this['removeClass'](className);
        return this.each(function(li) {
            if (li.className)
                li.className += ' ' + className;
            else
                li.className = className;
        });
    };

    /**
     * @id listtoggleclass
     * @module 1
     * @requires dollar createclassnameregexp removeclassregexp
     * @configurable yes
	 * @name list.toggleClass()
     * @syntax toggleClass(className)
     * Checks for all elements of the list whether they have the given class. If yes, it will be removed. Otherwise it will be added.
     * 
     * @example Toggle the class 'myClass' in 'someElement':
     * <pre>
     * $('#someElement').toggleClass('selected');
     * </pre>
     * 
     * @param className the name to toggle
     */
    proto['toggleClass'] = function(className) {
        var reg = createClassNameRegExp(className);
        return this.each(function(li) {
        	var cn = li.className;
        	li.className = cn ? (reg.test(cn) ? removeClassRegExp(li, reg) : (cn + ' ' + className)) : className;
        });
    };
    
    /**
	 * @id dollardollar
	 * @module 1
	 * @requires dollarraw
	 * @configurable yes
	 * @name MINI.$$()
	 * @syntax MINI.$$(selector)
	 * @shortcut $$(selector) - Enabled by default, but can be disabled in the builder.
	 * Returns an DOM object containing the first match of the given selector, or undefined if no match. $$ allows you to easily access
	 * an element directly. It is the equivalent to writing "$(selector)[0]".
	 *
	 * @example Select the checkbox 'myCheckbox':
	 * <pre>
	 * $$('#myCheckbox').selected = true;
	 * </pre>
	 * 
	 * @param selector a simple, CSS-like selector for the element. Uses the syntax described in MINI. The most common
	 *                 parameter for this function is the id selector with the syntax "#id".
	 * @return a DOM object of the first match, or undefined if the selector did not return at least one match
	 */
    function $$(selector) {
		return dollarRaw(selector)[0];
	}
	MINI['$$'] = $$;

   /**
     * @stop
     */
		
	//// 2. ELEMENT MODULE ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * @id el
	 * @module 2
	 * @requires dollardollar tostring set
	 * @configurable yes
	 * @name el()
	 * @syntax MINI.el(name)
	 * @syntax MINI.el(name, attributes)
	 * @syntax MINI.el(name, children)
	 * @syntax MINI.el(name, attributes, children)
	 * @shortcul EE(name, attributes, children)
	 * Creates a new HTML element, optionally with attributes and children, and returns a list containing the DOM HTMLElement.
	 * Typically the return value is inserted into the DOM tree using add() or a similar function. 
	 *
	 * By default, Minified creates a shortcut called EE for this function.
	 *
	 * The function is namespace-aware and will create XHTML nodes if called in an XHTML document.
	 * 
	 * @example Creating a simple &lt;span> element with some text:
	 * <pre>
	 * var mySpan = EE('span', 'Hello World'); 
	 * </pre>
	 * creates this:
	 * <pre>
	 *  &lt;span>Hello World&lt;/span> 
	 * </pre>
	 * @example Creating a &lt;span> element with style, some text, and append it to the element with the id 'greetingsDiv':
	 * <pre>
	 * $('greetingsDiv').add(EE('span', {'@title': 'Greetings'}, 'Hello World')); 
	 * </pre>
	 * creates this:
	 * <pre>
	 *  &lt;span title="Greetings">Hello World&lt;/span> 
	 * </pre>
	 * 
	 * @example The function always returns a MINI list with a single element. You can directly use it, for example,
	 *          to add an event handler.
	 * <pre>
	 * var myDiv =EE('div', 'Hello World');
	 * myDiv.on('click', function() { window.alert('Clicked!'); }); 
	 * </pre>
	 * 
	 * @example Creating a &lt;form> element with two text fields, labels and a submit button:
	 * <pre>
	 * var myForm = EE('form', {'@method': 'post'}, [
	 *     EE('label', {'@for': 'nameInput'}, 'Name:'),
	 *     EE('input', {'@id': 'nameInput', '@type': 'input'}),
	 *     EE('br'),
	 *     EE('label', {'@for': 'ageInput'}, 'Age:'),
	 *     EE('input', {'@id': 'ageInput', '@type': 'input'}),
	 *     EE('br'),
	 *     EE('input', {'@type': 'submit, '@value': 'Join'})
	 * ]); 
	 * </pre>
	 * results in (newlines and indentation added for readability):
	 * <pre>
	 * 	&lt;form method="post>
	 *     &lt;label for="nameInput">Name:&lt;/label>
	 *     &lt;input id="nameInput" type="input"/>
	 *     &lt;br/>
	 *     &lt;label for="ageInput"/>Age:&lt;/label>
	 *     &lt;input id="ageInput" type="input"/>
	 *     &lt;br/>
	 *     &lt;input value="Join" type="submit"/>
	 *  &lt;/form>
	 * </pre>
	 * 
	 * @example Null attributes often come handy when you don't always need a particular attribute. Attributes with null values will be ignored:
	 * <pre>
	 * var myInput = EE('input', {'@id': 'myCheckbox', '@type': 'checkbox', '@checked': shouldBeChecked() ? 'checked' : null});
	 * </pre>
	 * 
	 * @example You can set styles directly using a $ prefix for the name:
	 * <pre>
	 * var myStylesSpan = EE('span', {$color: "red", $fontWeight: "bold"}, "I'm styled");
	 * </pre>
	 * 
	 * @example Modify an existing element by specifying it instead of the name. Attributes will be added,
	 *          if children are specified the old ones will be replaced.
	 * <pre>
	 * EE(myOldSpan, {'@title':'Some text', $color: "red"}, "The new text");
	 * </pre>
	 * 
	 * @param e the element name to create (e.g. 'div')
	 * @param attributes optional an object which contains a map of attributes and other values. The syntax is exactly like set(): Attribute values are prefixed with '@',
	 *                   CSS styles with '$' and regular properties can be set without prefix.
	 *                   If the attribute value is null, the attribute will omitted (styles and properties can be set to null). 
	 *                   In order to stay compatible with Internet Explorer 7 and earlier, you should not set the attributes '@class' and '@style'. Instead
	 *                   set the property 'className' instead of '@class' and set styles using the '$' syntax.
	 * @param children optional  an element or a list of elements to add as children. Strings will be converted as text nodes. Lists can be 
	 *                         nested and will then automatically be flattened. Null elements in lists will be ignored. 
	 *                         The syntax is exactly like fill().
	 * @return a list containing the DOM HTMLElement that has been created or modified as only element
	 */
	MINI['el'] = function(e, attributes, children) {
		// @cond debug if (!e) error("el() requires the element name."); 
		// @cond debug if (/:/.test(e)) error("The element name can not create a colon (':'). In XML/XHTML documents, all elements are automatically in the document's namespace.");
		var nu = document.documentElement.namespaceURI; // to check whether doc is XHTML
		var list = MINI(e = e.nodeType ? e : nu ? document.createElementNS(nu, e) : document.createElement(e));
		return  (isList(attributes) || !isObject(attributes)) ? list.add(attributes) : list.set(attributes).add(children); 
	};
		
	
	//// 3. HTTP REQUEST MODULE ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	/**
	* @id request
	* @module 3
	* @requires tostring 
	* @configurable yes
	* @name request()
	* @syntax MINI.request(method, url)
	* @syntax MINI.request(method, url, data)
	* @syntax MINI.request(method, url, data, onSuccess)
	* @syntax MINI.request(method, url, data, onSuccess, onFailure)
	* @syntax MINI.request(method, url, data, onSuccess, onFailure, headers)
	* @syntax MINI.request(method, url, data, onSuccess, onFailure, headers, username, password)
	* Initiates a HTTP request (using XmlHTTPRequest) to the given URL. When the request finished, either the onSuccess or the onFailure function
	* will be invoked.
	* 
	* @example Invoke a REST web service and parse the resulting document using JSON:
	* <pre>
	* MINI.request('get', 'http://service.example.com/weather', {zipcode: 90210}, function(txt) {
	*     var json = MINI.parseJSON(txt);
	*     $('#weatherResult').fill('Today's forecast is is: ' + json.today.forecast);
	* }, function() {
	*     $('#weatherResult').fill('The weather service was not available.');
	* });
	* </pre>
	* 
	* @example Send a JSON object to a REST web service:
	* <pre>
	* var myRequest = {         // create a request object that can be serialized via JSON
	*      request: 'register',
	*      entries: [
	* {name: 'Joe',
	*      	job: 'Plumber'
	* }]};
	* 
	* function failureHandler() {
	*   $('#registrationResult').fill('Registration failed');
	* }
	*
	* MINI.request('post', 'http://service.example.com/directory', 
	*     MINI.toJSON(myRequest), function(txt) {
	*       if (txt == 'OK')
	*            $('#registrationResult').fill('Registration succeeded');
	*       else
	*            failureHandler();
	* }, failureHandler);
	* </pre>
	* 
	* @param method the HTTP method, e.g. 'get', 'post' or 'head' (rule of thumb: use 'post' for requests that change data on the server, and 'get' to only request data). Not case sensitive.
	* @param url the server URL to request. May be a relative URL (relative to the document) or an absolute URL. Note that unless you do something 
	*             fancy on the server (keyword to google:  Access-Control-Allow-Origin), you can only call URLs on the server your script originates from.
	* @param data optional data to send in the request, either as POST body or as URL parameters. It can be either a map of 
	*             parameters (all HTTP methods), a string (all methods) or a DOM document ('post' only). If the method is 'post', it will be 
	*             sent as body, otherwise appended to the URL. In order to send several parameters with the same name, use an array of values
	*             in the map. Use null as value for a parameter without value.
	* @param onSuccess optional this function will be called when the request has been finished successfully and had the HTTP status 200. Its first argument 
	*                  is the text sent by the server.
	*                  You can add an optional second argument, which will contain the XML sent by the server, if there was any.
	* @param onFailure optional this function will be called if the request failed. The first argument is the HTTP status (never 200; 0 if no HTTP request took place), 
	*                  the second a status text (or null, if the browser threw an exception) and the third the returned text, if there was 
	*                  any (the exception as string if the browser threw it).
	* @param headers optional a map of HTTP headers to add to the request. Note that the you should use the proper capitalization of the
	*                header 'Content-Type', if you set it, because otherwise it may be overwritten.
	* @param username optional username to be used for HTTP authentication, together with the password parameter
	* @param password optional password for HTTP authentication
	* @return the XmlHTTPRequest object, after its send() method has been called. You may use this to gather additional information, such as the request's state.
	*/
	MINI['request'] = function (method, url, data, onSuccess, onFailure, headers, username, password) {
		// @cond debug if (!method) error("request() requires a HTTP method as first argument.");
		// @cond debug if (!url) error("request() requires a url as second argument.");
		// @cond debug if (onSuccess && typeof onSuccess != 'function') error("request()'s fourth argument is optional, but if it is set, it must be a function.");
		// @cond debug if (onFailure && typeof onFailure != 'function') error("request()'s fifth argument is optional, but if it is set, it must be a function.");
		// @cond debug if (username && !password) error("If the user name is set (7th argument), you must also provide a password as 8th argument.");		method = method.toUpperCase();
		var xhr, s = [],
				body = data,
				ContentType = 'Content-Type',
				callbackCalled = 0;
		try {
			//@condblock ie6compatibility
			xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Msxml2.XMLHTTP.3.0");
			//@condend
			// @cond !ie6compatibility xhr = new XMLHttpRequest();
			if (data != null) {
				headers = headers || {};
				if (!isString(data) && !data.nodeType) { // if data is parameter map...
					each(data, function processParam(paramName, paramValue) {
						if (isList(paramValue))
							each(paramValue, function(v) {processParam(paramName, v);});
						else
							s.push(encodeURIComponent(paramName) + ((paramValue != null) ?  '=' + encodeURIComponent(paramValue) : ''));
					});
					body = s.join('&');
				}
				if (!/post/i.test(method)) {
					url += '?' + body;
					body = null;
				}
				else if (!data.nodeType && !headers[ContentType])
					headers[ContentType] = isString(data) ?  'text/plain; charset="UTF-8"' : 'application/x-www-form-urlencoded';
			}
			
			xhr.open(method, url, true, username, password);
			each(headers, function(hdrName, hdrValue) {
				xhr.setRequestHeader(hdrName, hdrValue);
			});

			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4 && !callbackCalled++) {
					if (xhr.status == 200) {
						if (onSuccess)
							onSuccess(xhr.responseText, xhr.responseXML);
					}
					else if (onFailure)
						onFailure(xhr.status, xhr.statusText, xhr.responseText);
				}
			};
			
			xhr.send(body);
			return xhr;
		}
		catch (e) {
			if (onFailure && !callbackCalled) 
				onFailure(0, null, toString(e));
		}
	};
	/**
	 * @stop
	 */  
	
	
	//// 4. JSON MODULE ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/*
	 * JSON Module. Uses browser built-ins or json.org implementation if available. Otherwise its own implementation,
	 * based on public domain implementation http://www.JSON.org/json2.js / http://www.JSON.org/js.html.
	 * Simplified code, made variables local, removed all side-effects (especially new properties for String, Date and Number).
	 */
    
    /**
	 * @id ucode
	 * @dependency
     */
    // @condblock ie7compatibility
    function ucode(a) {
        return STRING_SUBSTITUTIONS[a] ||  ('\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4));
    }
    // @condend

	/**
    * @id tojson
    * @module 4
    * @requires tostring ucode 
    * @configurable yes
    * @name toJSON()
    * @syntax MINI.toJSON(value)
    * Converts the given value into a JSON string. The value may be a map-like object, an array, a string, number, date, boolean or null.
    * If JSON.stringify is defined (built-in in some browsers), it will be used; otherwise MINI's own implementation.
    * 
    * The following types are supported by the built-in implementation:
    * <ul>
    *   <li>Objects (direct properties will be serialized)</li>
    *   <li>Arrays</li>
    *   <li>Strings</li>
    *   <li>Numbers</li>
    *   <li>Boolean</li>
    *   <li>null</li>
    * </ul>
    * Any other types in your value, especially Dates, should be converted into Strings by you.
    *
    * @example Convert an object into a JSON object:
    * <pre>
    * var myObj = {name: 'Fruits', roles: ['apple', 'banana', 'orange']};
    * var jsonString = MINI.toJSON(myObj);
    * </pre>
    * 
    * @param value the value (map-like object, array, string, number, date, boolean or null)
    * @return the JSON string
    */
    // @condblock ie7compatibility
    MINI['toJSON'] = (window.JSON && JSON.stringify) || function toJSON(value) {
		var ctor = value && value.constructor;

		if (isString(value) || ctor == String)
			return '"' + value.replace(/[\\\"\x00-\x1f\x22\x5c]/g, ucode) + '"' ;
		if (isList(value)) 
			return '[' + collect(value, function(vi) { return toJSON(vi); }).join() + ']';
		if (isObject(value) && ctor != Number && ctor != Boolean)
			return '{' + collect(value, function(k, n) { return toJSON(k) + ':' + toJSON(n); }).join() + '}';
		if (value == null)
			return 'null';
		return toString(value);
	};
    // @condend
    // @cond !ie7compatibility MINI['toJSON'] = (window.JSON && JSON.stringify);
    
	/**
	* @id parsejson
	* @module 4
	* @requires tostring ucode
	* @configurable yes
	* @name parseJSON()
	* @syntax MINI.parseJSON(text)
	* Parses a string containing JSON and returns the de-serialized object.
	* If JSON.parse is defined (built-in in some browsers), it will be used; otherwise MINI's own implementation.
	*
	* @example Parsing a JSON string:
	* <pre>
	* var jsonString = "{name: 'Fruits', roles: ['apple', 'banana', 'orange']}";
	* var myObj = MINI.parseJSON(jsonString);
	* </pre>
	*
	* @param text the JSON string
	* @return the resulting JavaScript object. Undefined if not valid.
	*/
    // @condblock ie7compatibility
    MINI['parseJSON'] = (window.JSON && JSON.parse) || function (text) {
    	text = toString(text).replace(/[\u0000\u00ad\u0600-\uffff]/g, ucode);

        if (/^[\],:{}\s]*$/                  // dont remove, tests required for security reasons!
				.test(text.replace(/\\(["\\\/bfnrt]|u[\da-fA-F]{4})/g, '@')
						  .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(\.\d*)?([eE][+\-]?\d+)?/g, ']')
						  .replace(/(^|:|,)(\s*\[)+/g, ''))) 
        	return eval('(' + text + ')');
        // fall through if not valid
        // @cond debug error('Can not parse JSON string. Aborting for security reasons.');
    };
    // @condend
    // @cond !ie7compatibility MINI['parseJSON'] = JSON && JSON.parse;
    /**
	 * @stop
	 */  
    
    
    //// 5. EVENT MODULE ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    
	/**
    * @id ready
    * @module 5
    * @requires 
    * @configurable yes
    * @name ready()
    * @syntax MINI.ready(handler)
    * Registers a handler to be called as soon as the HTML has been fully loaded (but not necessarily images and other elements).
    * On older browsers, it is the same as 'window.onload'. 
    *
    * @example Register an handler that sets some text in an element:
    * <pre>
    * MINI.ready(function() {
    *   $$('#someElement').innerHTML = 'ready() called';
    * });
    * </pre>
    *
    * @param handler the function to be called when the HTML is ready
    */
    function ready(handler) {
    	// @cond debug if (typeof handler != 'function') error("First argument must be a function");
    	if (DOMREADY_HANDLER) // if DOM ready, call immediately
			DOMREADY_HANDLER.push(handler);
		else
			window.setTimeout(handler, 0);
    };
    MINI['ready'] = ready;
    
    // Two-level implementation for domready events
    var DOMREADY_HANDLER = [];
    var DOMREADY_OLD_ONLOAD = window.onload;
    function triggerDomReady() {
    	each(DOMREADY_HANDLER, function(e) {e();});
    	DOMREADY_HANDLER = null;
    }

    window.onload = function() {
      triggerDomReady();
      if (DOMREADY_OLD_ONLOAD)
    	  DOMREADY_OLD_ONLOAD();
    };
    if (document.addEventListener)
    	document.addEventListener("DOMContentLoaded", triggerDomReady, false);
    
    
    /**
     * @stop
     */
    
    
    //// 6. COOKIE MODULE ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
	/**
     * @id setcookie
     * @module 6
     * @requires now
     * @configurable yes
     * @name setCookie()
     * @syntax MINI.setCookie(name, value)
     * @syntax MINI.setCookie(name, value, dateOrDays)
     * @syntax MINI.setCookie(name, value, dateOrDays, path)
     * @syntax MINI.setCookie(name, value, dateOrDays, path, domain)
     * Creates a cookie with the given name and value, optional expiration date, path and domain. If there is an an existing cookie
     * of the same name, will be overwritten with the new value and settings.
     *
     * @example Reads the existing cookie 'numberOfVisits', increases the number and stores it:
     * <pre>
     * var visits = MINI.getCookie('numberOfVisits');
     * MINI.setCookie('numberOfVisits', 
     *                      visits ? (parseInt(visits) + 1) : 1,         // if cookie not set, start with 1
     *                      365);                                              // store for 365 days
     * </pre>
     * 
     * @param name the name of the cookie. This should be ideally an alphanumeric name, as it will not be escaped by MINI and this
     *             guarantees compatibility with all systems.
     *             If it contains a '=', it is guaranteed not to work, because it breaks the cookie syntax. 
     * @param value the value of the cookie. All characters except alphanumeric and "*@-_+./" will be escaped using the 
     *              JavaScript escape() function and thus can be used, unless you set the optional dontEscape parameter.
     * @param dateOrDays optional specifies when the cookie expires. Can be either a Date object or a number that specifies the
     *                   amount of days. If not set, the cookie has a session lifetime, which means it will be deleted as soon as the
     *                   browser has been closes.
     * @param path optional if set, the cookie will be restricted to documents in the given certain path. Otherwise it is valid
     *                       for the whole domain. This is rarely needed.
     * @param domain optional if set, you use it to specify the domain (e.g. example.com) which can read the cookie. If you don't set it,
     *               the domain which hosts the current document is used. This parameter is rarely used, because there are only very
     *               few use cases in which this makes sense.
     * @param dontEscape optional if set, the cookie value is not escaped. Note that without escaping you can not use every possible
     *                    character (e.g. ";" will break the cookie), but it may be needed for interoperability with systems that need
     *                    some non-alphanumeric characters unescaped or use a different escaping algorithm.
     */
    function setCookie(name, value, dateOrDays, path, domain, dontEscape) {
		// @cond debug if (!name) error('Cookie name must be set!');
		// @cond debug if (/[^\w\d-_%]/.test(name)) error('Cookie name must not contain non-alphanumeric characters other than underscore and minus. Please escape them using encodeURIComponent().');
    	document.cookie = name + '=' + (dontEscape ? value : escape(value)) + 
    	    (dateOrDays ? (dateOrDays.getDay ? dateOrDays: new Date(now() + dateOrDays * 24 * 3600000)) : '') + 
    		'; path=' + (path ? escapeURI(path) : '/') + (domain ? ('; domain=' + escape(domain)) : '');
    }
    MINI['setCookie'] = setCookie;
    
    /**
     * @id getcookie
     * @module 6
     * @requires
     * @configurable yes
     * @name getCookie()
     * @syntax MINI.getCookie(name)
     * @syntax MINI.getCookie(name, dontUnescape)
     * Tries to find the cookie with the given name and returns it.
     *
     * @example Reads the existing cookie 'numberOfVisits' and displays the number in the element 'myCounter':
     * <pre>
     * var visits = MINI.getCookie('numberOfVisits');
     * if (!visits)    // check whether cookie set. Null if not
     *     $('#myCounter').set('innerHML', 'Your first visit.');
     * else
     *     $('#myCounter').set('innerHTML', 'Visit No ' + visits);
     * </pre>
     *  
     * @param name the name of the cookie. Should consist of alphanumeric characters, percentage, minus and underscore only, as it will not be escaped. 
     *             You may want to escape the name using encodeURIComponent() for all other characters.
     * @param dontUnescape optional if set and true, the value will be returned unescaped (use this only if the value has been encoded
     *                     in a special way, and not with the JavaScript encode() method)
     * @return the value of the cookie, or null if not found. Depending on the dontUnescape parameter, it may be unescape or not.
     */
    MINI['getCookie'] = function(name, dontUnescape) {
    	// @cond debug if (!name) error('Cookie name must be set!');
    	// @cond debug if (/[^\w\d-_%]/.test(name)) error('Cookie name must not contain non-alphanumeric characters other than underscore and minus. Please escape them using encodeURIComponent().');
    	var regexp, match = (regexp = RegExp('(^|;) *'+name+'=([^;]*)').exec(document.cookie)) && regexp[2];
    	return dontUnescape ? match : match && unescape(match);
    };

    /**
     * @id deletecookie
     * @module 6
     * @requires
     * @configurable yes
     * @name deleteCookie()
     * @syntax MINI.deleteCookie(name)
     * Deletes the cookie with the given name. If the cookie does not exist, it does nothing.
     *
     * @example Deletes the cookie "numberOfVisits":
     * <pre>
     * MINI.deleteCookie('numberOfVisits');
     * </pre>
     *
     * @param the cookie's name
     */
    MINI['deleteCookie'] = function(name) {
    	setCookie(name, '', -1);
    };
 
 	/**
 	 * @stop
 	 */
 

    //// 8. ANIMATION MODULE ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    /**
     * @id animationhandlers
     * @dependency
     */
	var ANIMATION_HANDLERS = []; // global list of {c: <callback function>, t: <timestamp>, s:<stop function>} currenetly active
	var REQUEST_ANIMATION_FRAME = function(callback) {
		window.setTimeout(callback, 33); // 30 fps as fallback
	};
	each(['msR', 'webkitR', 'mozR', 'r'], function(n) { 
		REQUEST_ANIMATION_FRAME = window[n+'equestAnimationFrame'] || REQUEST_ANIMATION_FRAME;
	});

	/**
	* @id loop
	* @module 7
	* @requires now animationhandlers
	* @configurable yes
	* @name loop()
	* @syntax MINI.loop(paintCallback)
	* @syntax MINI.loop(paintCallback, element)
	* Use this function to run an animation loop. In modern browser that support requestAnimationFrame, the given callback is invoked as often 
	* as the browser is ready for a new animation frame. The frequency is determined by the browser and may vary depending on factors such as the time needed to render the current page.
	* the screen's framerate and whether the page is currently shown to the user (page is the current tab, browser window not minimized etc). 
	* In older browsers, the callback function will be invoked every 33 milliseconds.
	* To stop a running animation loop, either invoke the function that is returned or the function given as second parameter to the callback.
	*
	* @example A animates a div by moving it in a circle.
	* <pre>
	*   var myDiv = $$('#myAnimatedDiv');
	*   var rotationsPerMs = 1000;               // one rotation per second
	*   var maxRadius = 100;
	*   var d = 3000;                                 // duration in ms
	*   MINI.loop(function(t, stopFunc) {
	*     if (t > d) {                                   // time is up: call stopFunc()!
	*       stopFunc();
	*       return;
	*     }
	* 
	*     var a = 2 * Math.PI * t / d;                          // angular position
	*     var r = maxRadius*sin(t / d * Math.PI);           // radius changes from 0 to 1 back to 0 during the animatio
	*     myDiv.style.left = (r * Math.cos(a) + ' px';
	*     myDiv.style.top = (r * Math.sin(a) + ' px';
	*   });
	* </pre>
	*
	* @param paintCallback a callback function(timestamp, stopFunc) to invoke for painting. Parameters given to callback:
	* <ul>
	*            <li>timestamp - number of miliseconds since animation start</li>
	*            <li>stopFunc - call this function() to stop the currently running animation</li>
	* </ul>
	* @return a function() that, when you invoke it, stops the currently running animation.
	*/
    function loop(paintCallback) { 
        var entry = {c: paintCallback, t: now()};
        var stopFunc = function() {
    		for (var i = 0; i < ANIMATION_HANDLERS.length; i++) // don't use each here, list may be modified during run!!
    			if (ANIMATION_HANDLERS[i] === entry) 
    				ANIMATION_HANDLERS.splice(i--, 1);
        }; 
        entry.s = stopFunc;
        
        if (ANIMATION_HANDLERS.push(entry) < 2) { // if first handler.. 
			(function raFunc() {
				for (var j = 0; j < ANIMATION_HANDLERS.length; j++) // don't use each here, list may be modified during run!!
					ANIMATION_HANDLERS[j].c(Math.max(0, now() - ANIMATION_HANDLERS[j].t), ANIMATION_HANDLERS[j].s); 
				if (ANIMATION_HANDLERS.length) // check len now, in case the callback invoked stopFunc() 
					REQUEST_ANIMATION_FRAME(raFunc); 
			})(); 
        } 
        return stopFunc; 
    };
    MINI['loop'] = loop;
    

	/**
	 @stop
	 */
	return MINI;
})();


/**
 * @id topleveldollar
 * @module 8
 * @requires dollar
 * @configurable yes
 * @name $() (shortcut for MINI() )
 * @syntax $(selector)
 * Shortcut for MINI().
 * @example MINI() and $() are interchangeable:
 * <pre>
 * $('.myClass').set('$display', 'none');
 * </pre>
 * @param selector the selector (see MINI())
 * @return the result list (see MINI())
 */
// implementation moved to top

/**
 * @id topleveldollardollar
 * @module 8
 * @requires dollardollar topleveldollar
 * @configurable yes
 * @name $$() (shortcut for MINI.$$() )
 * @syntax $$(selector)
 * Shortcut for MINI.$$().
 * @example MINI.$$() and $$() are interchangeable:
 * <pre>
 * $$('#myCheckbox').checked = false;
 * </pre>
 * @param selector the selector (see MINI.$$())
 * @return the resulting element (see MINI.$$())
 */
window['$$'] = $['$$'];

/**
 * @id toplevelee
 * @module 8
 * @requires el topleveldollar
 * @configurable yes
 * @name EE() (shortcut for MINI.el() )
 * @syntax EE(selector)
 * Shortcut for MINI.el().
 * @example MINI.el() and EL() are interchangeable:
 * <pre>
 * $('#myDiv').add(EE('span', 'This is a text'));
 * </pre>
 * @param selector the selector (see MINI.$$())
 * @return the resulting element (see MINI.$$())
 */
window['EE'] = $['el'];
/**
 * @stop 
 */



