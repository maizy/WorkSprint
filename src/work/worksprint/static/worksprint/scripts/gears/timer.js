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

        /** @type {Worksprint.Gear.Clock} */
        this._workClock = undefined;

        /** @type {Worksprint.Gear.Clock} */
        this._breakClock = undefined;

        /** @type {Worksprint.Gear.Clock} */
        this._currentClock = undefined;



        this._start = undefined;
        this._offset = 0;
        this._countdownFrom = undefined;

        this._interrupts = 0;

        this._lastInterruptCount = undefined;

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
        var clock = this._currentClock;
        if (clock) {
            return clock.getTotalSeconds();
        }

        return undefined;
    };


    t.prototype.getCountdownFrom = function() {
        var clock = this._currentClock;
        if (clock) {
            return clock.getCountdownFrom();
        }

        return undefined;
    };


    t.prototype.isCountdown = function() {
        var clock = this._currentClock;
        return clock && clock.isCountdown();
    };


    /**
     * @return {undefined|Number}
     */
    t.prototype.getTimerCountdownSeconds = function() {
        var clock = this._currentClock;
        if (clock && clock.isCountdown()) {
            return clock.getTimerCountdownSeconds();
        }

        return undefined;
    };

    t.prototype.getInterruptCounter = function() {
        return this._interrupts;
    };

    t.prototype.getBreakTime = function() {
        return this._opts.breakTime;
    };
    // -------------------------------------------
    // low-level actions

    /**
     *
     * (notwork)->Run
     * @private
     */
    t.prototype._beginWork = function() {
        var self = this;
        window.console && console.debug && console.debug('begin work');

        this._setState(STATES.work);


        var clock = new Worksprint.Gear.Clock();

        $(clock).on('timer-tick', _.bind(this._tick, this));
        clock.addEveryNMsEvent('timer-tick', 1000);

        clock.begin();
        this._workClock = clock;
        this._currentClock = clock;
        this._breakClock = undefined;

        //TODO collect all sprints ?

        this.resetInterruptCounter();

        $(this).triggerHandler('after-begin-work');

    };

    /**
     *
     * Run->(work)->Undo
     * @private
     */
    t.prototype._undoWork = function() {
        var self = this;
        window.console && console.debug && console.debug('rewind work');

        this._setState(STATES.notwork);

        if (this._workClock) {
            this._workClock.pause();
            this._workClock = undefined;
            this._currentClock = undefined;
        }

        this.resetInterruptCounter();

        $(this).triggerHandler('after-rewind-work');

    };

    /**
     *
     * Run->(work)->Stop
     * @private
     */
    t.prototype._endWork/* and have a break */ = function() {
        var self = this;
        window.console && console.debug && console.debug('end work');

        this._setState(STATES.brk);

        this._lastInterruptCount = this.getInterruptCounter();

        if (!this._workClock) {
            throw 'Work clock is missing';
        }

        this._workClock.pause();

        var breakTimesMs = this._opts.breakTime*1000;
        var breakClock = new Worksprint.Gear.Clock({
            countdownFrom: breakTimesMs
        });
        $(breakClock).on('timer-tick', _.bind(this._tick, this));
        breakClock.addEveryNMsEvent('timer-tick', 1000);

        //TODO add simple handler events
        //TODO add event for defined time
        breakClock.addEveryNMsEvent('auto-stop', 100, breakTimesMs);
        $(breakClock).on('auto-stop', _.once(_.bind(this._endBreak, this)));

        breakClock.begin();

        this._breakClock = breakClock;
        this._currentClock = breakClock;


        $(this).triggerHandler('after-end-work', [{
            elapsedTime: this._workClock.getTotalSeconds(),
            interrupts: this._lastInterruptCount
        }]);
    };

    /**
     * Stop->(break)->Undo
     */
    t.prototype._undoBreak /* and continue work sprint*/ = function() {
        var self = this;
        window.console && console.debug && console.debug('rewind break (back to work)');

        this._setState(STATES.work);

        if (this._breakClock) {
            this._breakClock.pause();
            this._breakClock = undefined;
            this._currentClock = undefined;
        }

        if (!this._workClock) {
            throw 'Work clock is missing';
        }

        //restore work params and timer
        this.setInterruptCounter(this._lastInterruptCount);
        this._workClock.begin();
        this._currentClock = this._workClock;

        $(this).triggerHandler('after-rewind-break');
    };


    /**
     *
     * Stop->(break)->Stop
     */
    t.prototype._endBreak = function() {
        var self = this;
        window.console && console.debug && console.debug('end break');

        this._setState(STATES.notwork);

        if (!this._breakClock) {
            throw 'Break clock is missing';
        }

        this._breakClock.pause();
        this._currentClock = undefined;
        this.resetInterruptCounter();

        $(this).triggerHandler('after-end-break');
    };





    // -------------------------------------------

    t.prototype._tick = function() {
        $(this).triggerHandler('tick');
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