if (!window.Worksprint) { window.Worksprint = {}; }
if (!window.Worksprint.Clock) {

/**
 * Clock
 *
 *  - countdown clocks
 *  - timer
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
        run: 'run'
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

        this._interval = undefined;


        this._starts = [];
        this._pauses = [];
        this._countdownEnds = [];

        // -------------------------------------------

        if (_.isUndefined(opts)) {
            opts = [];
        } else {
            opts = _.clone(opts);
        }

        this.setCountdownFrom(opts.countdownFrom);

        if (!_.isUndefined(opts.offset)) {
            this._offset = offset;
        }


    };

    // -------------------------------------------

    /**
     *
     */
    c.prototype.begin = function() {
        var self = this;

        var start = Date.now();
        if (this._offset) {
            start -= this._offset * 1000;
            this._offset = undefined;
        }

        this._start = start;

        $(this).triggerHandler('begin', [this]);
//        this._updateDial();
//        this._interval = setInterval(_.bind(this._updateDial, this), 1000);

    };

    /**
     *
     * @return {Number} - seconds
     */
    c.prototype.pause = function() {
        var self = this;

        var res = this.getSeconds();
        this._start = undefined;
        if (!_.isUndefined(this._interval)) {
            clearInterval(this._interval);
        }
        this._interval = undefined;

//        this._updateDial();

        $(this).triggerHandler('pause', [this]);

        return res;
    };


    // -------------------------------------------

    c.prototype.getSeconds = function() {
        var self = this;
        if (!_.isUndefined(this._start)) {
            var delta = (Date.now() - this._start) / 1000;
            if (!_.isUndefined(this._offset)) {
                delta += this._offset;
            }
            return delta;
        }

        return undefined;
    };

    c.prototype.getLastPeriodSeconds = function() {
        var self = this;

        //TODO
    };


    /**
     * @return {undefined|Number}
     */
    c.prototype.getTimerCountdownSeconds = function() {

        //FIXME

        var cd = this.getCountdownFrom();
        var ts = this.getSeconds();
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