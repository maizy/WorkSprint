/**
 * @author Nikita <nikita@maizy.ru>
 * @license GPLv3
 * @copyright dev.maizy.ru, 2012
 */
ns('Worksprint.View', 'ResultTable', (function() {

    var _COLS = {
        id: {label: '#'},
        begin: {label: 'Begin'},
        end: {label: 'End'},
        elapsedTime: {label: 'Elapsed time'},
        breakTime: {label: 'Break time'},
        interrupts: {label: 'Interrupts'}
        //,name: {label: 'Task'}
        //,actions: {label: ''}
    };


    var r = function Worksprint_View_ResultTable(opts) {

        var self = this;

        this._opts = _.extend(
            //def opts
            {
                wrapClass: 'results'
            },
            opts || {});

        this._rowCnt = 0;
        this._rows = {};

        this._$wrap = undefined;
        this._$table = undefined;

        $(_.bind(this.init, this));
    };

    r.prototype.init = function() {
        var self = this;

        this._$wrap = $('.results:first');

    };

    /**
     *
     * @param {Object} row
     *
     * row keys:
     *  id - {Number}
     *  begin - {Date|undefined}
     *  end - {Date|undefined}
     *  elapsedTime - {Number|undefined} - if undef use =end-begin
     *  interrupts - {Number}
     *  name - {string|undefined}
     *
     *  previousId - {Number} //TODO
     *
     */
    r.prototype.addOrUpdateRow = function(row) {

        var self = this;

        row = row || {};
        row = _.extend({}, row); //copy

        if (_.isUndefined(row.id)) {
            this._rowCnt++;
            row.id = this._rowCnt;
        }

        this._rows[row.id] = row;


        // format params

        var elTime = row.elapsedTime;
        var dF = 'mmm d HH:MM';

        if (_.isUndefined(elTime)
            && !_.isUndefined(row.end)
            && !_.isUndefined(row.begin)
            )
        {
            elTime = (row.end - row.begin) / 1000;
        }

        var beginF, endF, elTimeF, idF;

        if (_.isDate(row.begin)) {
            beginF = dateFormat(row.begin, dF);
        }

        if (_.isDate(row.end)) {
            endF = dateFormat(row.end, dF);
        }
        elTimeF = periodFormat(elTime);
        idF = _.pad(row.id, 2, '0');


        // update DOM

        if (_.isUndefined(this._$table)) {
            this._createTable();
        }
        var $tBody = $('tbody:first', this._$table);

        var $row = $('tr.row_'+ row.id, $tBody);
        if ($row.length == 0) {
            $row = $('<tr></tr>').addClass('row_'+row.id);
            _.each(_COLS, function(setup, code) {
                var $td = $('<td></td>').addClass('col_'+code);
                $row.append($td);
            });

            $tBody.append($row);
        }

        $('td.col_id', $row).text(idF);
        $('td.col_name', $row).text(row.name);
        $('td.col_elapsedTime', $row).text(elTimeF);
        $('td.col_begin', $row).text(beginF);
        $('td.col_end', $row).text(endF);
        $('td.col_interrupts', $row).text(row.interrupts);

        return row.id;
    };

    r.prototype.removeRow = function(rowId) {
        if (!_.isUndefined(this._rows[rowId])) {
            delete this._rows[rowId];
            $('tr.row_'+rowId).remove();
        }

    };

    r.prototype._createTable = function() {
        var self = this;

        var $t = $('<table><caption>Results</caption><thead><tr class="header"></tr></thead><tbody></tbody></table>');

        var $head = $('thead tr.header', $t);
        _.each(_COLS, function(config, code) {
            var $th = $('<th></th>')
                      .addClass('col_'+code)
                      .text(config.label);
            $head.append($th);
        });

        this._$wrap.append($t);
        this._$table = $t;
        return $t;
    };


    return r;
})());