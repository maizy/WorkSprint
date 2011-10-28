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
 */
window.Worksprint.Timer = (function() {

    var STATES = {
        notwork: 'notwork',
        brk: 'break',
        work: 'work'
    };

    var BUTTONS = {
        play: { label: 'Play'},
        stop: { label: 'Stop'},
        interupt: { label: '\''},
        rewind: { label: '<<'}
    };

    var t = function(opts) {
        var self = this;

        this._opts = $.extend(
            //def opts
            {
                wrapClass: 'timer',
                state: STATES.notwork
            },
            opts || {});

        this._$wrap = undefined;
        this._buttons = {};

        this._state = this._opts.state;

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
        var self = this;
        var opts = this._opts;

        this._$wrap = $('div.'+opts.wrapClass+':first');

        window.console && console.debug && console.debug(this._$wrap, 'this._$wrap');

        this._initButtons();
        this._bindButtonsTransitions();

        this._refreshButtons();


    };

    /**
     *
     */
    t.prototype._initButtons = function() {
        var self = this;
        var $butWrap = $('div.buttons');
        var $butList = $('<ul/>');
        $.each(BUTTONS, function(code, setup) {
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

            self._buttons[code] = $btn;
        });

        $butWrap.append($butList);

        return $butWrap;
    };

    /**
     *
     */
    t.prototype._bindButtonsTransitions = function() {
        var self = this;

        $(self).bind('push-button-play', function() {
            self._setState(STATES.work);
        });

        $(self).bind('push-button-rewind', function() {
            var curState = self.getState();
            if (curState == STATES.brk) {
                self._setState(STATES.work);
            } else {
                self._setState(STATES.notwork);
            }
        });

        $(self).bind('push-button-stop', function() {
            self._setState(STATES.brk);
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
                enabledButtons.push('rewind', 'stop', 'interupt');

                break;

            case STATES.brk:
                enabledButtons.push('rewind');

                break;
        }

        $.each(BUTTONS, function(code, button) {
            var enable = _.contains(enabledButtons, code);
            self._buttons[code].prop('disabled', !enable);
        });
    };

    // -------------------------------------------
    // states

    t.prototype._setState = function(state) {
        var self = this;

        if (_.contains(STATES, state)) {
            var prevState = this.getState();
            $(this).triggerHandler('change-state', [prevState, state]);

            this._state = state;
            self._refreshButtons();
        }
    };

    // -------------------------------------------
    // getters, setters


    /**
     * Current state
     */
    t.prototype.getState = function() {
        var self = this;
        return this._state;
    };





    return t;

})();
}