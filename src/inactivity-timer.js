/*
 * jQuery idleTimer plugin
 * version 0.9.100511
 * by Paul Irish. 
 *   http://github.com/paulirish/yui-misc/tree/
 * MIT license
 
 * adapted from YUI idle timer by nzakas:
 *   http://github.com/nzakas/yui-misc/
*/ 



/*
 * Copyright (c) 2009 Nicholas C. Zakas
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */



/**
 * @module inactivity-timer
 */

/**
 * Timer to determine if the user is active or inactive.
 * @class InactivityTimer
 * @constructor
 * @param {Object} config optional The configuration object containing the initial configuration values for the InactivityTimer.
 */
var InactivityTimer = new Class({
	
	/**
	 * Classes that InactivityTimer implements
	 *
	 * @property {Array, String} Implements
	 * @private
	 */
	Implements: [Options, Events],
	
	/**
	 * The object that holds the default configuration.
	 *
	 * @property options
	 * @type Object
	 * @public
	 */
	options: {
		/**
		 * Fired when user is active.
		 *
		 * @event onActive
		 */
		//onActive: function(){},

		/**
		 * Fired when user becomes inactive.
		 *
		 * @event onInactive
		 */
		//onInactive: function(){},

		/**
		 * The element to attach event listeners to listen for user activity.
		 *
		 * @config element
		 * @type Element
		 * @default document
		 */
		element: document,

		/**
		 * Milliseconds of user inactivity until user becomes inactive.
		 *
		 * @config timeout
		 * @type Number
		 * @default 30000
		 */
		timeout: 30000,

		/**
		 * Milliseconds of time when the timer is not listening for user activity after the user was active.
		 *
		 * @config eventTimeoutLength
		 * @type Number
		 * @default 1000
		 */
		eventTimeoutLength: 1000,

		/**
		 * Events to listen to. These events will be attached to the element.
		 *
		 * @config events
		 * @type Array
		 * @default ['mousemove', 'keydown', 'mousewheel', 'mousedown']
		 */
		//DOMMouseScroll is registered as mousemove in Firefox. Don't add it to the Array of events.
		events: ['mousemove', 'keydown', 'mousewheel', 'mousedown']

	},

	/**
	 * State of the user.
	 *
	 * @property state
	 * @private
	 */
	state: null,

	/**
	 * Reference to timeout. Used to clear the timeout.
	 *
	 * @property timeout
	 * @private
	 */
	timeout: null,

	/**
	 * Time of last state change.
	 *
	 * @property stateChangeTime
	 * @private
	 */
	stateChangeTime: null,

	//********************************************
	//Private Methods
	//********************************************

	/** 
	 * Method run when class in initialized. Sets config options and adds state change observers.
	 *
	 * @method initialize
	 * @param {Object} options optional The configuation options.
	 * @private
	 * @return {this}
	 */
	initialize: function(options) {
		this.setOptions(options);
		this.element = this.options.element;

		//DOMMouseScroll fires on mousemove and has a event.type of DOMMouseScroll. If you fix this bug tell me about it.
		this.options.events.erase('DOMMouseScroll');

		this.addStateObservers();
	},

	/**
	 * Resets the timeout.
	 *
	 * @method resetTimeout
	 * @return {void}
	 * @private
	 */
	resetTimeout: function() {
		if(this.timeout) {
			clearTimeout(this.timeout);
		}
		this.timeout = setTimeout(this.inactiveUser.bind(this), this.options.timeout);
	},

	/**
	 * Changes state to inactive and fires the 'onInactive' event.
	 *
	 * @method inactiveUser
	 * @private
	 */
	inactiveUser: function() {
		this.state = 'inactive';
		this.fireEvent('onInactive');
	  },

	/**
	 * Adds the observers to track state changes.
	 *
	 * @method addStateObservers
	 * @private
	 */
	addStateObservers: function() {
		this.addEvent('onActive', function() {
				this.stateChangeTime = new Date();
		});
		this.addEvent('onInactive', function() {
				this.stateChangeTime = new Date();
		});
	  },

	/**
	 * Removes event binding from element then adds is back after config eventTimeoutLength.
	 *
	 * @method addEventBindings
	 * @return {void}
	 * @private
	 */
	addEventBindings: function(e) {
		if(this.options.events.contains(e.type)) {

			//key for storage in element
			var eventTypeKey = 'inactivity-timer-' + e.type.toLowerCase();
			this.element.removeEvent(e.type, this.element.retrieve(eventTypeKey));

			var timeout = setTimeout(function() {
				var bindingFunction = this.addEventBindings.bindWithEvent(this);
				this.element.store(eventTypeKey, bindingFunction);
				this.element.addEvent(e.type, bindingFunction);
			}.bind(this), this.options.eventTimeoutLength);
			
			//Store timeout incase timer is stopped before new event is added onto element.
			this.element.store(eventTypeKey + 'timeout', timeout);
			this.reset();
		}
	},
					  
	//********************************************
	//Public Methods
	//********************************************

	/**
	 * Returns the current state of the user
	 *
	 * @method getState
	 * @return {String} 'active' for and active user and 'inactive' for an inactive user.
	 * @public
	 */
	getState: function() {
		return this.state;
	},

	/**
	 * Starts the timer. Adds listening events to element and initiates timeouts. User goes to 'active'.
	 *
	 * @method start
	 * @return {this}
	 * @public
	 */
	start: function() {
		this.options.events.each(function(eventType) {
			var eventTypeKey = 'inactivity-timer-' + eventType.toLowerCase();
			var bindingFunction = this.addEventBindings.bindWithEvent(this);
			this.element.store(eventTypeKey, bindingFunction);
			this.element.addEvent(eventType, bindingFunction);
		}, this);
		this.reset();
		return this;
	},

	/**
	 * Stops the timer. Removes listening events on element and clears timeouts.
	 *
	 * @method stop
	 * @return {this}
	 * @public
	 */
	stop: function() {
		//TODO: remove event function reference from element store
		this.options.events.each(function(eventType) {
			var eventTypeKey = 'inactivity-timer-' + eventType.toLowerCase();

			//clear timeout of adding an event onto the element.
			clearTimeout(this.element.retrieve(eventTypeKey + 'timeout'));

			this.element.removeEvent(eventType, this.element.retrieve(eventTypeKey));

		}, this);

		clearTimeout(this.timeout);
		this.state = null;
		this.timeout = null;

		// this.element.removeEvents();

		return this;
	},

	/**
	 * Resets timer. Resets timeouts and fires 'onActive' event.
	 *
	 * @return {void}
	 * @method reset
	 * @public
	 */
	reset: function() {
	// TODO: only fire this when the user becomes active
		this.resetTimeout();
		this.state = 'active';
		this.fireEvent('onActive');
	},

	/**
	 * Returns passed time since user state updated. For 'active' state it is since the last was active. For the 'inactive' state it is since the state changed to 'inactive'.
	 *
	 * @method timeSinceStateChange
	 * @return {Number} Time in ms since user state updated
	 * @public
	 */
	timeSinceStateChange: function() {
		// TODO: change this to use its seperate time
		var now = new Date();
		return now - this.stateChangeTime;
	}
});
