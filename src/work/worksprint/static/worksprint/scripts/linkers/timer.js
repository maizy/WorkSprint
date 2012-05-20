/**
 *
 * Constructor opts:
 *  - timer
 *  - timerView
 *
 * @author Nikita Kovaliov <nikita@maizy.ru>
 * @license GPLv3
 * @copyright dev.maizy.ru, 2012
 */
ns('Worksprint.Linker', 'Timer', (function() {

    var l = function Worksprint_Linker_Timer(opts) {

        var self = this;

        this._opts = _.extend({}, opts || {});

        this.timer = opts.timer;
        this.timerView = opts.timerView;

        this._currentTask = undefined;
    };

    l.prototype.link = function() {
        var self = this;

        if (!this.timer || !this.timerView) {
            throw 'Unable to link, timer & timerView are required';
        }
        var timer = this.timer;
        var timerView = this.timerView;

        timerView.setTimerGear(timer);

        $(timer).on('change-state', _.bind(timerView.updateButtons, timerView));

        $(timer).on('interrupt-updated', _.bind(timerView.updateInterrupts, timerView));
        $(timer).on('tick', _.bind(timerView.updateDial, timerView));

        $(timer).on('action', _.bind(timerView.update, timerView));

        //proxy to gear methods
        $(timerView).on('button', function (event, code) {
            if (_.contains(['play', 'undo', 'stop'], code)) {
                timer[code]();
            }
        });

        $(timerView).on('button-interrupt',  _.bind(timer.addInterrupt, timer));

        timerView.update();

    };

    return l;
})());