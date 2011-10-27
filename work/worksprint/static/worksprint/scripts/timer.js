if (!window.Worksprint) { window.Worksprint = {}; }
if (!window.Worksprint.Timer) {
window.Worksprint.Timer = (function() {

    var STATES = {
        pause: 'pause',
        brk: 'break',
        play: 'play'
    };

    var BUTTONS = {
        play: { label: 'Play'},
        rewind: { label: '<<'},
        stop: { label: 'Stop'},
        interupt: { label: '\''}
    };

    var t = function(opts) {
        var self = this;

        this._opts = $.extend(
            //def opts
            {
                wrapClass: 'timer',
                state: STATES.pause
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


    /**
     * Init
     */
    t.prototype.init = function() {
        var self = this;
        var opts = this._opts;

        this._$wrap = $('div.'+opts.wrapClass+':first');

        window.console && console.debug && console.debug(this._$wrap, 'this._$wrap');

        this._initButtons();
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
    t.prototype._refreshButtons = function() {
        var self = this;

        var state = this.getState();

        var enabledButtons = [];

        switch (state) {
            case STATES.pause:
                enabledButtons.push('play');

                break;

            case STATES.play:
                enabledButtons.push(['rewind', 'stop', 'interupt']);

                break;

            case STATES.brk:
                enabledButtons.push('rewind');

                break;
        }

        $.each(BUTTONS, function(code, button) {
            var enable = _.indexOf(enabledButtons, code) !== -1;
            self._buttons[code].prop('disabled', !enable);
        });
    };

    // -------------------------------------------


    // -------------------------------------------

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