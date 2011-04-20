Element.Events.DOMMouseScroll = {
	onRemove: function(e){console.log('removed event')}
}

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
		events: ['mousemove', 'keydown', 'mousewheel', 'mousedown']

		//DOMMouseScroll is causing a bug in addEventBindings in FireFox.
		//events: ['mousemove', 'keydown', 'DOMMouseScroll', 'mousewheel', 'mousedown']
	},

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
		this.addStateObservers();
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
		this.timeout = setTimeout(this.inactiveUser, this.options.timeout);
	},

	/**
	 * Changes state to inactive and fires the 'onInactive' event.
	 *
	 * @method inactiveUser
	 * @private
	 */
	inactiveUser: function() {
		console.log('inactive');
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
		//key for storage in element
		var eventTypeKey = 'inactivity-timer-' + e.type.toLowerCase();
		console.log(eventTypeKey);
		this.element.removeEvent(e.type, this.element.retrieve(eventTypeKey));

		//empties store. Debugging
		this.element.store(eventTypeKey, null);

		setTimeout(function() {
			var bindingFunction = this.addEventBindings.bindWithEvent(this)
			this.element.store(eventTypeKey, bindingFunction);
			this.element.addEvent(e.type, bindingFunction);
		}.bind(this), this.options.eventTimeoutLength);
		this.reset();
	},

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
			var bindingFunction = this.addEventBindings.bindWithEvent(this)
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
			this.element.removeEvent(eventType, this.element.retrieve(eventType));
		}, this);
		this.state = null;
		clearTimeout(this.timeout);
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
		this.resetTimeout();
		console.log('active');
		this.state = 'active';
		this.fireEvent('onActive');
	},

	/**
	 * Returns passed time since user status updated. For 'active' state it is since the last user interaction. For 'inactive' state it is since the status changed to 'inactive'.
	 *
	 * @method timeSinceStatusChange
	 * @return {Number} Time in ms since user status updated
	 * @public
	 */
	timeSinceStatusChange: function() {
		var now = new Date();
		return now - this.stateChangeTime;
	}
});
