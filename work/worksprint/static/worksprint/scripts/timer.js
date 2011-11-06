if (!window.Worksprint) { window.Worksprint = {}; }
if (!window.Worksprint.Timer) {

/**
 * Timer widget js class
 *
 * @author Nikita <nikita@maizy.ru>
 * @license GPLv3
 *
 *
 * Events:
 *
 *   push-button (code, $button) - push any button
 *   push-button-[some] ($button) - push button with code 'some'
 *
 *   change-state
 *   change-state-from-[prevState]
 *   change-state-to-[state]
 *   change-state-from-[prevState]-to-[state]
 *
 *   interrupt
 *   interrupt-reset
 *
 *   after-start-work
 *   after-rewind-work
 *   after-end-work
 *   after-rewind-break
 *   after-end-break
 *
 */
window.Worksprint.Timer = (function() {

    var STATES = {
        notwork: 'notwork',
        brk: 'brk',
        work: 'work'
    };

    var BUTTONS = {
        play: { label: 'Run'},
        stop: { label: 'Stop'},
        interrupt: { label: 'Interrupted'},
        rewind: { label: 'Oops (undo)'}
    };

    var TIMER_STATE = {
        notwork: 'notwork',
        work0: 'work0',
        work25: 'work25',
        work50: 'work50',
        work75: 'work75',
        work90: 'work90',
        brk0:   'brk0',
        brk90:  'brk90'
    };

    var t = function(opts) {

        var self = this;

        this._opts = _.extend(
            //def opts
            {
                wrapClass: 'timer',
                state: STATES.notwork,
                breakTime: 60*5,
                workReminderTime: 60*15
            },
            opts || {});

        this._$wrap = undefined;
        this._buttons = {};

        this._state = this._opts.state;

        this._timerStart = undefined;
        this._timerOffset = 0;
        this._timerInterval = undefined;
        this._timerCountdown = undefined;

        this._breakTimeoutId = undefined;

        this._interrupts = 0;

        this._lastWorkPeriod = undefined;
        this._lastInterruptCount = undefined;
        this._lastBreakPeriod = undefined;

        $(function() {
            self.init();
        });
    };

    // -------------------------------------------
    // init, refresh

    /**
     * Init
     */
    t.prototype.init = function() {
        var opts = this._opts;

        this._$wrap = $('div.'+opts.wrapClass+':first');
        this._$debug = $('div.debug', this._$wrap);

        this._$dialMinutes = $('.minutes', this._$wrap);
        this._$dialSeconds = $('.seconds', this._$wrap);
        this._$dialDivider = $('.divider', this._$wrap);

        this._$interrupts = $('.interrupts', this._$wrap);

        window.console && console.debug && console.debug(this._$wrap, 'this._$wrap');

        this._initButtons();

        $(this).bind('change-state', _.bind(this._refreshButtons, this));
        this._refreshButtons();

        this._bindButtonsTransitions();
        $(this).bind('push-button-interrupt', _.bind(this.addInterrupt, this));

        this._updateDial();
        this._updateIterrupts();
    };

    /**
     *
     */
    t.prototype._initButtons = function() {
        var self = this;
        var $butWrap = $('div.buttons');
        var $butList = $('<ul/>');
        _.each(BUTTONS, function(setup, code) {
            var $btn = $('<button/>');
            var $btnLi = $('<li/>');

            $btn.addClass(code+'_button')
                .text(setup.label)
                .prop('disabled', true);

            $btn.click(function() {
                $(self).triggerHandler('push-button-'+code, [$btn]);
                $(self).triggerHandler('push-button', [code, $btn]);
            });

            $btnLi.append($btn);
            $butList.append($btnLi);

            this._buttons[code] = $btn;
        }, this);

        $butWrap.append($butList);

        return $butWrap;
    };

    /**
     *
     */
    t.prototype._bindButtonsTransitions = function() {

        var self = this;

        $(self).bind('push-button-play', function() {
            var curState = self.getState();
            if (curState == STATES.notwork) {
                self.beginWork();
            }
        });

        $(self).bind('push-button-rewind', function() {
            var curState = self.getState();
            if (curState == STATES.brk) {
                self.rewindBreak();
            } else if (curState == STATES.work) {
                self.rewindWork();
            }
        });

        $(self).bind('push-button-stop', function() {
            var curState = self.getState();
            if (curState == STATES.work) {
                self.endWork();
            } else if (curState == STATES.brk) {
                self.endBreak();
            }
        });
    };




    /**
     *
     */
    t.prototype._refreshButtons = function() {
        var self = this;

        var state = this.getState();

        var enabledButtons = [];

        switch (state) {

            case STATES.notwork:
                enabledButtons.push('play');

                break;

            case STATES.work:
                enabledButtons.push('rewind', 'stop', 'interrupt');

                break;

            case STATES.brk:
                enabledButtons.push('rewind', 'stop');

                break;
        }

        _.each(BUTTONS, function(button, code) {
            var enable = _.contains(enabledButtons, code);
            this._buttons[code].prop('disabled', !enable);
        }, this);
    };

    // -------------------------------------------
    // states

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

     /**
     * Current state
     */
    t.prototype.getState = function() {
        return this._state;
    };

    // -------------------------------------------
    //actions (API)

    t.prototype.beginWork = function() {
        var self = this;
        window.console && console.debug && console.debug('begin work');

        this._setState(STATES.work);

        this._startTimer();
        this.resetIterruptCounter();

        this._lastWorkPeriod = undefined;
        this._lastInterruptCount = undefined;

        $(this).triggerHandler('after-begin-work');

    };

    t.prototype.rewindWork = function() {
        var self = this;
        window.console && console.debug && console.debug('rewind work');

        this._setState(STATES.notwork);

        this._endTimer();
        this.resetIterruptCounter();

        $(this).triggerHandler('after-rewind-work');

    };

    t.prototype.endWork/* and have a break */ = function() {
        var self = this;
        window.console && console.debug && console.debug('end work');

        this._setState(STATES.brk);

        this._lastWorkPeriod = this._endTimer();
        this._lastInterruptCount = this.getInterruptCounter();
        this._lastBreakPeriod = undefined;

        this._breakTimeoutId = setTimeout(
            _.bind(this.endBreak, this),
            this._opts.breakTime*1000
        );

        this._startTimer(this._opts.breakTime);


        $(this).triggerHandler('after-end-work');
    };

    /**
     *
     */
    t.prototype.rewindBreak /* and continue work sprint*/ = function() {
        var self = this;
        window.console && console.debug && console.debug('rewind break (back to work)');

        this._setState(STATES.work);

        if (!_.isUndefined(this._breakTimeoutId)) {
            clearTimeout(this._breakTimeoutId);
            this._breakTimeoutId = undefined;
        }

        this._endTimer();

        //restore work params and timer
        this.setInterruptCounter(this._lastInterruptCount);
        this._startTimer(undefined, this._lastWorkPeriod);

        $(this).triggerHandler('after-rewind-break');
    };


    t.prototype.endBreak = function() {
        var self = this;
        window.console && console.debug && console.debug('end break');

        this._setState(STATES.notwork);
        this._lastBreakPeriod = this._endTimer();
        this.resetIterruptCounter();

        $(this).triggerHandler('after-end-break');
    };


    t.prototype.addInterrupt = function() {
        this._interrupts += 1;
        window.console && console.debug && console.debug('add interrupt');

        $(this).triggerHandler('interrupt', [this.getInterruptCounter()]);
        this._updateIterrupts();
    };


    // -------------------------------------------


    t.prototype.resetIterruptCounter = function() {
        $(this).triggerHandler('interrupt-reset', [this.getInterruptCounter()]);
        this._interrupts = 0;
        this._updateIterrupts();
        return this;
    };

    t.prototype.setInterruptCounter = function(cnt) {
        this._interrupts = Math.max(0, cnt);
        this._updateIterrupts();
        return this;
    };

    t.prototype.getInterruptCounter = function() {
        return this._interrupts;
    };

    t.prototype._updateIterrupts = function() {
        this._$interrupts.text(_.pad('', this.getInterruptCounter(), "'"));
    };



    // -------------------------------------------
    // timer

    /**
     *
     * @param countdown - in seconds
     * @param offset - in seconds
     */
    t.prototype._startTimer = function(countdown, offset) {
        var self = this;

        this._timerStart = Date.now();
        this._timerCountdown = countdown;

        if (!_.isUndefined(offset) && offset > 0) {
            this._timerOffset = offset;
        } else {
            this._timerOffset = undefined;
        }
        this._updateDial();
        this._timerInterval = setInterval(_.bind(this._updateDial, this), 1000);

    };

    t.prototype._updateDial = function() {
        var seconds, minutes, visDiv, period;

        if (!this.isTimerCountdown()) {
            period = this.getTimerSeconds();
        } else {
            period = this.getTimerCountdownSeconds();
        }

        if (_.isUndefined(period)) {
            seconds = 0;
            minutes = 0;
            visDiv = true;

        } else {
            period = Math.round(period);
            seconds = period % 60;
            minutes = Math.floor(period / 60);
            visDiv = period % 2 == 0;
        }


        this._$dialMinutes.text(_.pad(minutes, 2, '0'));
        this._$dialSeconds.text(_.pad(seconds, 2, '0'));
        if (visDiv) {
            this._$dialDivider.removeClass('unvisible');
        } else {
            this._$dialDivider.addClass('unvisible');
        }
    };

    t.prototype.getTimerSeconds = function() {
        var self = this;
        if (!_.isUndefined(this._timerStart)) {
            var delta = (Date.now() - this._timerStart) / 1000;
            if (!_.isUndefined(this._timerOffset)) {
                delta += this._timerOffset;
            }
            return delta;
        }

        return undefined;
    };


    t.prototype.getTimerCountdown = function() {
        return this._timerCountdown;
    };


    t.prototype.isTimerCountdown = function() {
        return !_.isUndefined(this.getTimerCountdown());
    };


    /**
     * @return {undefined|Number}
     */
    t.prototype.getTimerCountdownSeconds = function() {
        var cd = this.getTimerCountdown();
        var ts = this.getTimerSeconds();
        if (!_.isUndefined(ts) && this.isTimerCountdown()) {
            return Math.max(0, cd - ts);
        }

        return undefined;
    };


    /**
     *
     * @return {Number} - seconds
     */
    t.prototype._endTimer = function() {
        var self = this;

        var res = this.getTimerSeconds();
        this._timerStart = undefined;
        if (!_.isUndefined(this._timerInterval)) {
            clearInterval(this._timerInterval);
        }
        this._timerInterval = undefined;

        this._updateDial();

        return res;
    };

    /**
     *
     * @param mode - TIMER_STATE.*
     */
    t.prototype._setTimerMode = function(mode) {
        var self = this;

    };

    // -------------------------------------------

    t.STATES = STATES;
    t.BUTTONS = BUTTONS;
    return t;

})();
}