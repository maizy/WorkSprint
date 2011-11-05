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
 *   change-states
 *   change-state-from-[prevState]
 *   change-state-to-[state]
 *   change-state-from-[prevState]-to-[state]
 *
 */
window.Worksprint.Timer = (function() {

    var STATES = {
        notwork: 'notwork',
        brk: 'brk',
        work: 'work'
    };

    var BUTTONS = {
        play: { label: 'Play'},
        stop: { label: 'Stop'},
        interrupt: { label: '\''},
        rewind: { label: 'Undo'}
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
        this._timerInterval = undefined;
        this._timerCountdown = undefined;

        this._interrupts = 0;

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

    };

    t.prototype.rewindWork = function() {
        var self = this;
        window.console && console.debug && console.debug('rewind work');

        this._setState(STATES.notwork);

        this._endTimer();
        this.resetIterruptCounter();

    };

    t.prototype.endWork/* and have a break */ = function() {
        var self = this;
        window.console && console.debug && console.debug('end work');

        this._setState(STATES.brk);

        //_.delay(_.bind(this.endBreak, this), 5000);

        this._endTimer();

        this._startTimer(this._opts.breakTime);
    };

    /**
     *
     * TODO save work sprint timer
     */
    t.prototype.rewindBreak /* and continue work sprint*/ = function() {
        var self = this;
        window.console && console.debug && console.debug('rewind break (back to work)');

        this._setState(STATES.work);

    };

    t.prototype.endBreak = function() {
        var self = this;
        window.console && console.debug && console.debug('end break');

        this._setState(STATES.notwork);
        this._endTimer();
    };

    t.prototype.addInterrupt = function() {
        this._interrupts += 1;
        window.console && console.debug && console.debug('add interrupt');

        $(this).triggerHandler('interrupt', [this.getInterruptCounter()]);
        this._updateIterrupts();
    };

    t.prototype.resetIterruptCounter = function() {
        $(this).triggerHandler('interrupt-reset', [this.getInterruptCounter()]);
        this._interrupts = 0;
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
     */
    t.prototype._startTimer = function(countdown) {
        var self = this;

        this._timerStart = Date.now();
        this._timerCountdown = countdown;
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
            var delta = Date.now() - this._timerStart;
            return delta/1000;
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