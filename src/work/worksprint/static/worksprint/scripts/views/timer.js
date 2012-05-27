/**
 *
 * Constructor Opts:
 *  - wrapSelector: {String}
 *
 * Events
 *  - button-[code] ($button)
 *  - button (code, $button)
 *
 * @author Nikita <nikita@maizy.ru>
 * @license GPLv3
 * @copyright dev.maizy.ru, 2012
 */
ns('Worksprint.View', 'Timer', (function() {


    var BUTTONS = {
        play: { label: 'Run'},
        stop: { label: 'Stop'},
        interrupt: { label: 'Interrupted'},
        undo: { label: 'Oops (undo)'}
    };

    var vt = function Worksprint_View_Timer(opts) {

        var self = this;

        this._opts = _.extend(
            //def opts
            {
                wrapSelector: '.timer'
            },
            opts || {});

        /** @type {jQuery} */
        this._$wrap = undefined;

        /** @type {jQuery} */
        this._$dialMinutes = undefined;

        /** @type {jQuery} */
        this._$dialSeconds = undefined;

        /** @type {jQuery} */
        this._$dialDivider = undefined;

        this._$helpMessageWrap = undefined;

        /** @type {jQuery} */
        this._$interrupts = undefined;

        /** @type {Object} - {code: {jQuery}, ...} */
        this._buttons = {};

        /** @type {Worksprint.Gear.Timer} */
        this._timerGear = undefined;

        $(_.bind(this.init, this));
    };

    vt.prototype.init = function() {
        var self = this;

        this._$wrap = $(this._opts.wrapSelector);

        this._$dialMinutes = $('.minutes', this._$wrap);
        this._$dialSeconds = $('.seconds', this._$wrap);
        this._$dialDivider = $('.divider', this._$wrap);

        this._$interrupts = $('.interrupts', this._$wrap);
        this._$helpMessageWrap = $('.help_message', this._$wrap);;

        this._initButtons();

    };


    // -------------------------------------------

    /**
     *
     * @param {Worksprint.Gear.Timer} timer
     * @return {Worksprint.View.Timer}
     */
    vt.prototype.setTimerGear = function(timer) {
        this._timerGear = timer;
        return this;
    };

    /**
     * @return {Worksprint.View.Timer|undefined}
     */
    vt.prototype.getTimerGear = function() {
        return this._timerGear;
    };

    // -------------------------------------------


    vt.prototype.updateButtons = function() {

        var timer = this.getTimerGear();
        if (!timer) {
            return;
        }

        var STATES = Worksprint.Gear.Timer.STATES;
        var state = timer.getState();

        var enabledButtons = [];
        switch (state) {

            case STATES.notwork:
                enabledButtons.push('play');

                break;

            case STATES.work:
                enabledButtons.push('undo', 'stop', 'interrupt');

                break;

            case STATES.brk:
                enabledButtons.push('undo', 'stop');

                break;
        }

        _.each(BUTTONS, function(button, code) {
            if (!_.isUndefined(this._buttons[code])) {
                var enable = _.contains(enabledButtons, code);
                this._buttons[code].prop('disabled', !enable);
            }
        }, this);
    };

    vt.prototype.updateInterrupts = function() {
        var timer = this.getTimerGear();
        if (!timer) {
            return;
        }
        this._$interrupts.text(_.pad('', timer.getInterruptCounter(), "'"));
    };

    vt.prototype.updateDial = function() {
        var timer = this.getTimerGear();
        if (!timer) {
            return;
        }

        var seconds, minutes, visDiv, period;

        if (!timer.isCountdown()) {
            period = timer.getSeconds();
        } else {
            period = timer.getTimerCountdownSeconds();
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

    vt.prototype.updateHelpMessage = function() {
        var self = this;
        var timer = this.getTimerGear();
        if (!timer) {
            return;
        }

        var STATES = Worksprint.Gear.Timer.STATES;
        switch (timer.getState()) {

            case STATES.notwork:
                this.setHelpMessage('Press Run when start working.');
                break;

            case STATES.work:
                this.setHelpMessage('Now work hard. Don\'t forget to push the Interrupt button when it happens.');
                break;

            case STATES.brk:
                var breakTime = timer.getTimerCountdownSeconds();
                var mes = 'Have a rest';
                if (breakTime) {
                    mes += ' for ' + periodFormat(breakTime, ' ');
                }
                mes += '.';
                this.setHelpMessage(mes);
                break;

            default:
                this.setHelpMessage(undefined);
                break;
        }
    };


    vt.prototype.update = function() {
        this.updateButtons();
        this.updateDial();
        this.updateInterrupts();
        this.updateHelpMessage();
    };

    vt.prototype.setHelpMessage = function(message) {
        var self = this;
        var $wrap = this._$helpMessageWrap;
        if (_.isUndefined(message)) {
            $wrap.hide().clean();
        } else {
            $wrap.show().text(message);
        }
    };
    // -------------------------------------------

    /**
     * @return {jQuery}
     */
    vt.prototype._initButtons = function() {
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
                $(self).triggerHandler('button-'+code, [$btn]);
                $(self).triggerHandler('button', [code, $btn]);
            });

            $btnLi.append($btn);
            $butList.append($btnLi);

            this._buttons[code] = $btn;
        }, this);

        $butWrap.append($butList);

        return $butWrap;
    };

    vt.BUTTONS = BUTTONS;

    return vt;
})());