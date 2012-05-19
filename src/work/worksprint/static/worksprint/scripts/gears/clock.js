/**
 * Clock
 *
 *  - countdown clocks
 *  - timer
 *
 *  In API Seconds presents as Number (floor round).
 *
 * @author Nikita Kovaliov <nikita@maizy.ru>
 * @license GPLv3
 * @copyright dev.maizy.ru, 2012
 *
 *
 * Events:
 *
 *   begin
 *   pause
 *   finish
 *
 * @TODO presets
 * @TODO ms
 *
 */
ns('Worksprint.Gear', 'Clock', (function() {

    var CLOCK_STATE = {
        pause: 'pause',
        runnig: 'runnig'
    };

    /**
     * @param opts
     * @constructor
     */
    var c = function Worksprint_Gear_Clock(opts) {
        this._construct(opts);
    };

    c.prototype._construct = function(opts) {
        var self = this;

        /** @type {Date} - last period start date */
        this._start = undefined;

        /** @type {Number} - offset in seconds */
        this._offset = 0;

        /** @type {Number|undefined} - in seconds */
        this._countdownFrom = undefined;


        this._periods = [];
        this._totalSeconds = undefined;
        this._countdownEnds = [];

        this._everyNMsEvents = {};

        this._state = CLOCK_STATE.pause;

        // -------------------------------------------

        opts = _.isUndefined(opts) ? [] : _.clone(opts);

        this.setCountdownFrom(opts.countdownFrom);

        //presets

        //offset
        if (!_.isUndefined(opts.offset)) {
            this._offset = offset;
        }

        //TODO preset periods


    };

    // -------------------------------------------
    // Actions

    /**
     *
     * @return {Worksprint.Clock}
     */
    c.prototype.begin = function() {
        var self = this;

        if (this.isRunning()) {
            this.pause();
        }

        var start = Date.now();

        if (this._offset) {
            start -= this._offset * 1000;
            this._offset = undefined;
        }

        this._start = start;
        this._state = CLOCK_STATE.runnig;

        this._periods.push({start: start});

        $(this).triggerHandler('begin', [this]);

        _.each(this._everyNMsEvents, function(event, eventCode) {
            self._activateEveryNMsEvent(eventCode);
        });

        return this;
    };

    /**
     *
     * @return {Worksprint.Clock}
     */
    c.prototype.pause = function() {
        var self = this;

        if (this.isPaused()) {
            return this;
        }

        var end = Date.now();
        var lastPeriod = _.last(this._periods);
        lastPeriod.end = end;

        var seconds = Math.floor( (lastPeriod.end - lastPeriod.start) / 1000 );
        lastPeriod.seconds = seconds;

        if (_.isUndefined(this._totalSeconds)) {
            this._totalSeconds = 0;
        }
        this._totalSeconds += seconds;

        this._state = CLOCK_STATE.pause;

        $(this).triggerHandler('pause', [this]);

        _.each(this._everyNMsEvents, function(event, eventCode) {
            self._deactivateEveryNMsEvent(eventCode);
        });

        return this;
    };



    // -------------------------------------------
    // State getters


    c.prototype.getTotalSeconds = function() {
        return Math.round(this.getTotalMs() / 1000);
    };


    c.prototype.getTotalMs = function() {
        var self = this;

        //FIXME support ms
        var totalSec = this._totalSeconds;

        if (_.isUndefined(totalSec) && this.isPaused()) {
            return undefined;
        } else if (_.isUndefined(totalSec)) {
            totalSec = 0;
        }

        if (this.isPaused()) {
            return totalSec*1000;
        } else {
            return totalSec*1000 + Date.now() - _.last(this._periods).start;
        }

    };

    c.prototype.getLastPeriodSeconds = function() {
        var self = this;

        //TODO
    };

    /**
     * @return {Array} - [{start:Number, end:Number, seconds:Number}, ...]
     */
    c.prototype.getPeriods = function() {
        return this._periods;
    };


    /**
     * @return {Number}
     */
    c.prototype.getPeriodsAmount = function() {
        return this._periods.length;
    };

    /**
     * @return {undefined|Number}
     */
    c.prototype.getTimerCountdownSeconds = function() {

        //FIXME

        var cd = this.getCountdownFrom();
        var ts = this.getTotalSeconds();
        if (!_.isUndefined(ts) && this.isCountdown()) {
            return Math.max(0, cd - ts);
        }

        return undefined;
    };

    //Events

    /**
     * Add handler for every N miliseconds events.
     *
     * If eventCode exists, it's overwriten, previous
     * events will breaks.
     *
     * For listen event do:
     * $(clock).on(eventCode, function(clock, stepNumber, eventCode) { ... });
     *
     *
     * @param {String} eventCode
     * @param {Number} N - ms
     * @param {Number} startAfterOffset - start fire event after offset, ms
     *
     * @return {Worksprint.Clock} - this
     */
    c.prototype.addEveryNMsEvent = function(eventCode, N, startAfterOffset) {
        var self = this;

        startAfterOffset = !_.isUndefined(startAfterOffset) ? startAfterOffset : 0;

        var events = this._everyNMsEvents;

        //stop and remove event if exists
        if (events[eventCode]) {
            this._deactivateEveryNMsEvent(eventCode);
        }

        this._everyNMsEvents[eventCode] = {
            step: Math.floor(N),
            offset: Math.floor(startAfterOffset)
        };

        if (this.isRunning()) {
            this._activateEveryNMsEvent(eventCode);
        }

        return this;
    };

    c.prototype.addEveryNSecondsEvent = function(eventCode, N, startAfterOffset) {
        return this.addEveryNMsEvent(eventCode, Math.round(N*1000), Math.round(startAfterOffset*1000));
    };

    // -------------------------------------------
    // other Getters, Setters


    c.prototype.getCountdownFrom = function() {
        return this._countdownFrom;
    };


    c.prototype.isCountdown = function() {
        return !_.isUndefined(this.getCountdownFrom());
    };

    c.prototype.isRunning = function() {
        return this._state == CLOCK_STATE.runnig;
    };

    c.prototype.isPaused = function() {
        return this._state == CLOCK_STATE.pause;
    };

    c.prototype.setCountdownFrom = function(seconds) {
        this._countdownFrom = seconds;
        return this;
    };

    c.prototype.withOffset = function(seconds) {
        this._offset = seconds;
        return this;
    };

    // -------------------------------------------
    c.prototype._deactivateEveryNMsEvent = function(eventCode) {
        var self = this;

        var event = this._everyNMsEvents[eventCode];

        if (event && event._nextTimeout) {
            clearTimeout(event._nextTimeout);
            delete event._nextTimeout;
        }

    };

    c.prototype._activateEveryNMsEvent = function (eventCode) {
        var self = this;
        var event = this._everyNMsEvents[eventCode];

        if (event) {
            if (event._nextTimeout) {
                clearTimeout(event._nextTimeout);
            }

            var curTime = this.getTotalMs();
            var floorTime = curTime;
            if (event.offset > floorTime) {
                floorTime = event.offset;
            }
            var stepNumber = Math.floor(floorTime / event.step) + 1;
            var fireAfter = (stepNumber * event.step) - curTime;
            event._nextTimeout = setTimeout(function() {
                $(self).triggerHandler(eventCode, [self, stepNumber, eventCode]);
                self._activateEveryNMsEvent(eventCode);

            }, fireAfter);
            return true;
        }

        return false;
    };


    // -------------------------------------------

    //consts
    c.STATE = CLOCK_STATE;

    return c;
})());