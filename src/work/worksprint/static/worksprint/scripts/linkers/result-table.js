/**
 * @author Nikita Kovaliov <nikita@maizy.ru>
 * @license GPLv3
 * @copyright dev.maizy.ru, 2012
 */
ns('Worksprint.Linker', 'ResultTable', (function() {

    var l = function Worksprint_Linker_ResultTable(opts) {

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


        $(timer).on('after-begin-work', _.bind(function() {
            this._currentTask = {
                begin: new Date(),
                end: undefined,
                elapsedTime: undefined,
                interrupts: 0
            };

            this._currentTask.id = rTable.addOrUpdateRow(this._currentTask);

        }, this));


        $(timer).on('after-end-work', _.bind(function(event, res) {
            if (!this._currentTask) {
                return;
            }
            this._currentTask = _.extend(this._currentTask, {
                end: new Date(),
                elapsedTime: res.elapsedTime,
                interrupts: res.interrupts
            });

            rTable.addOrUpdateRow(this._currentTask);
        }, this));


        $(timer).on('interrupt-updated', _.bind(function(event, before, after) {
            if (!this._currentTask) {
                return;
            }
            this._currentTask = _.extend(this._currentTask, {
                interrupts: after
            });

            rTable.addOrUpdateRow(this._currentTask);
        }, this));


        $(timer).on('after-rewind-work', _.bind(function(event) {
            if (this._currentTask) {
                rTable.removeRow(this._currentTask.id);
            }
            this._currentTask = undefined;
        }, this));
    };

    return l;
})());