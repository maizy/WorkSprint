/**
 * Timer gear
 *
 * @author Nikita Kovaliov <nikita@maizy.ru>
 * @license GPLv3
 * @copyright dev.maizy.ru, 2012
 *
 * Constructor Opts:
 *   wrapClass: {String} - wrapper id
 *   state: STATES.* - current state
 *   breakTime: {Numeric} - ms
 *   workReminderTime: {Numeric} - ms
 *
 * Events:
 *
 *   action(code) - action with 'code' happens
 *
 *   play()
 *   undo()
 *   stop()
 *   pause()
 *
 *   change-state(prevState, state)
 *   change-state-from-[prevState](state)
 *   change-state-to-[state](prevState)
 *   change-state-from-[prevState]-to-[state]()
 *
 *   interrupt-updated(before, after)
 *   interrupt-add()
 *   interrupt-reset()
 *
 *   after-begin-work()
 *   after-rewind-work()
 *   after-end-work(res) - res: {elapsedTime: {Number}, interrupts: {Number}}
 *   after-rewind-break()
 *   after-end-break()
 */
ns('Worksprint.Gear', 'Timer', (function() {

    var STATES = {
        notwork: 'notwork',
        brk: 'brk',
        work: 'work'
    };


    /**
     * @param opts
     * @constructor
     */
    var t = function Worksprint_Gear_Timer(opts) {

        var self = this;

        this._opts = _.extend(
            //def opts
            {
                state: STATES.notwork,
                breakTime: 60*5,
                workReminderTime: 60*15
            },
            opts || {});

        this._state = this._opts.state;

        this._start = undefined;
        this._offset = 0;
        this._interval = undefined;
        this._countdownFrom = undefined;

        this._interrupts = 0;

        this._lastWorkPeriod = undefined;
        this._lastInterruptCount = undefined;
        this._lastBreakPeriod = undefined;

        $(_.bind(this.init, this));
    };

    /**
     * Init
     */
    t.prototype.init = function() {
        var self = this;
    };

    t.prototype.setInterruptCounter = function(cnt) {
        var self = this;
        var before = this.getInterruptCounter();
        this._interrupts = Math.max(0, cnt);
        $(this).triggerHandler('interrupt-updated', [before, this._interrupts]);
        return this;
    };


    // -------------------------------------------
    // high-level actions (API)

    t.prototype.play = function() {
        var self = this;
        var curState = this.getState();
        if (curState == STATES.notwork) {
            this._beginWork();
        }
        $(this).triggerHandler('play');
        $(this).triggerHandler('action', ['play']);
    };

    t.prototype.undo = function() {
        var self = this;
        var curState = self.getState();
        if (curState == STATES.brk) {
            this._undoBreak();
        } else if (curState == STATES.work) {
            this._undoWork();
        }
        $(this).triggerHandler('undo');
        $(this).triggerHandler('action', ['undo']);

    };

    t.prototype.stop = function() {
        var self = this;
        var curState = self.getState();
        if (curState == STATES.work) {
            this._endWork();
        } else if (curState == STATES.brk) {
            this._endBreak();
        }
        $(this).triggerHandler('stop');
        $(this).triggerHandler('action', ['stop']);
    };

    /**
     *
     * @return {Number} - seconds
     */
    t.prototype.pause = function() {
        var self = this;

        var res = this.getSeconds();
        this._start = undefined;
        if (!_.isUndefined(this._interval)) {
            clearInterval(this._interval);
        }
        this._interval = undefined;

        $(this).triggerHandler('pause');
        $(this).triggerHandler('action', ['pause']);

        return res;
    };

    t.prototype.addInterrupt = function() {
        var self = this;
        this._interrupts += 1;
        window.console && console.debug && console.debug('add interrupt');

        $(this).triggerHandler('interrupt-add');
        $(this).triggerHandler('interrupt-updated', [this._interrupts-1, this._interrupts]);
    };

    t.prototype.resetInterruptCounter = function() {
        var self = this;
        var before = this.getInterruptCounter();
        this._interrupts = 0;

        $(this).triggerHandler('interrupt-reset', [this.getInterruptCounter()]);
        $(this).triggerHandler('interrupt-updated', [before, this._interrupts]);

        return this;
    };


    // -------------------------------------------

    /**
     * Current state
     */
    t.prototype.getState = function() {
        return this._state;
    };

    t.prototype.getSeconds = function() {
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


    t.prototype.getCountdownFrom = function() {
        return this._countdownFrom;
    };


    t.prototype.isCountdown = function() {
        return !_.isUndefined(this.getCountdownFrom());
    };


    /**
     * @return {undefined|Number}
     */
    t.prototype.getTimerCountdownSeconds = function() {
        var self = this;
        var cd = this.getCountdownFrom();
        var ts = this.getSeconds();
        if (!_.isUndefined(ts) && this.isCountdown()) {
            return Math.max(0, cd - ts);
        }

        return undefined;
    };

    t.prototype.getInterruptCounter = function() {
        return this._interrupts;
    };

    // -------------------------------------------
    // low-level actions

    t.prototype._beginWork = function() {
        var self = this;
        window.console && console.debug && console.debug('begin work');

        this._setState(STATES.work);

        this._startTimer();
        this.resetInterruptCounter();

        this._lastWorkPeriod = undefined;
        this._lastInterruptCount = undefined;

        $(this).triggerHandler('after-begin-work');

    };

    t.prototype._undoWork = function() {
        var self = this;
        window.console && console.debug && console.debug('rewind work');

        this._setState(STATES.notwork);

        this.pause();
        this.resetInterruptCounter();

        $(this).triggerHandler('after-rewind-work');

    };

    t.prototype._endWork/* and have a break */ = function() {
        var self = this;
        window.console && console.debug && console.debug('end work');

        this._setState(STATES.brk);

        this._lastWorkPeriod = this.pause();
        this._lastInterruptCount = this.getInterruptCounter();
        this._lastBreakPeriod = undefined;

        this._breakTimeoutId = setTimeout(
            _.bind(this._endBreak, this),
            this._opts.breakTime*1000
        );

        this._startTimer(this._opts.breakTime);


        $(this).triggerHandler('after-end-work', [{
            elapsedTime: this._lastWorkPeriod,
            interrupts: this._lastInterruptCount
        }]);
    };

    /**
     *
     */
    t.prototype._undoBreak /* and continue work sprint*/ = function() {
        var self = this;
        window.console && console.debug && console.debug('rewind break (back to work)');

        this._setState(STATES.work);

        if (!_.isUndefined(this._breakTimeoutId)) {
            clearTimeout(this._breakTimeoutId);
            this._breakTimeoutId = undefined;
        }

        this.pause();

        //restore work params and timer
        this.setInterruptCounter(this._lastInterruptCount);
        this._startTimer(undefined, this._lastWorkPeriod);

        $(this).triggerHandler('after-rewind-break');
    };


    t.prototype._endBreak = function() {
        var self = this;
        window.console && console.debug && console.debug('end break');

        this._setState(STATES.notwork);
        this._lastBreakPeriod = this.pause();
        this.resetInterruptCounter();

        $(this).triggerHandler('after-end-break');
    };





    // -------------------------------------------

    /**
     *
     * @param countdown - in seconds
     * @param offset - in seconds
     */
    t.prototype._startTimer = function(countdown, offset) {
        var self = this;

        this._start = Date.now();
        this._countdownFrom = countdown;

        if (!_.isUndefined(offset) && offset > 0) {
            this._offset = offset;
        } else {
            this._offset = undefined;
        }
        this._interval = setInterval(function() {
            $(self).triggerHandler('tick');
        }, 1000);

    };

    t.prototype._setState = function(state) {
        var self = this;

        if (_.contains(STATES, state)) {
            var prevState = this.getState();
            this._state = state;

            window.console && console.debug && console.debug(
                'change-state from '+prevState+' to '+state);

            $(this).triggerHandler('change-state-from-'+prevState+'-to-'+state);
            $(this).triggerHandler('change-state-to-'+state, [prevState]);
            $(this).triggerHandler('change-state-from-'+prevState, [state]);
            $(this).triggerHandler('change-state', [prevState, state]);
        }
    };

    // -------------------------------------------

    t.STATES = STATES;

    return t;

})());