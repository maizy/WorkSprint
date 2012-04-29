if (!window.Worksprint) { window.Worksprint = {}; }
if (!window.Worksprint.Clock) {

/**
 * Clock
 *
 *  - countdown clocks
 *  - timer
 *
 *  In API Seconds presents as Number (floor round).
 *
 * @author Nikita <nikita@maizy.ru>
 * @license GPLv3
 * @copyright dev.maizy.ru
 *
 *
 * Events:
 *
 *   begin
 *   pause
 *   finish
 *
 */
window.Worksprint.Clock = (function() {

    var CLOCK_STATE = {
        pause: 'pause',
        runnig: 'runnig'
    };

    var c = function Worksprint_Clock(opts) {
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

        this._everyNsecondsEvents = {};

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

    /**
     *
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

        return this;
    };



    // -------------------------------------------

    c.prototype.getTotalSeconds = function() {
        var totalSec = this._totalSeconds;

        if (_.isUndefined(totalSec) && this.isPaused()) {
            return undefined;
        } else if (_.isUndefined(totalSec)) {
            totalSec = 0;
        }

        if (this.isPaused()) {
            return totalSec;
        } else {
            return totalSec + Math.floor( (Date.now() - _.last(this._periods).start) / 1000 );
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

    // -------------------------------------------
    // Getters, Setters


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

    c.STATE = CLOCK_STATE;

    return c;
})();
}