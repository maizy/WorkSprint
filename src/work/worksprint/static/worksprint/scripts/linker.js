if (!window.Worksprint) { window.Worksprint = {}; }
if (!window.Worksprint.Linker) {

/**
 * @author Nikita Kovaliov <nikita@maizy.ru>
 * @license GPLv3
 */
window.Worksprint.Linker = (function() {

    var l = function(opts) {

        var self = this;

        this._opts = _.extend({}, opts || {});

        this.timer = opts.timer;
        this.resultTable = opts.resultTable;

        this._currentTask = undefined;
    };

    l.prototype.link = function() {
        var self = this;

        if (!this.timer || !this.resultTable) {
            throw 'Unable to link, timer & resultTable are required';
        }
        var timer = this.timer;
        var rTable = this.resultTable;


        $(timer).bind('after-begin-work', _.bind(function() {
            this._currentTask = {
                begin: new Date(),
                end: undefined,
                elapsedTime: undefined,
                interrupts: 0
            };

            this._currentTask.id = rTable.addOrUpdateRow(this._currentTask);

        }, this));


        $(timer).bind('after-end-work', _.bind(function(res) {
            this._currentTask = _.extend(this._currentTask, {
                end: new Date(),
                elapsedTime: res.elapsedTime,
                interrupts: res.interrupts
            });

            rTable.addOrUpdateRow(this._currentTask);
        }, this));


        $(timer).bind('interrupt', _.bind(function(res) {
            this._currentTask = _.extend(this._currentTask, {
                interrupts: timer.getInterruptCounter()
            });

            rTable.addOrUpdateRow(this._currentTask);
        }, this));


        $(timer).bind('after-rewind-work', _.bind(function(res) {
            rTable.removeRow(this._currentTask.id);
            this._currentTask = undefined;
        }, this));
    };

    return l;
})();
}