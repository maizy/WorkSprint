if (!window.TestHelper) {
window.TestHelper = (function() {

    /**
     * TestHelper
     * 
     * @author Nikita Kovaliov <nikita@maizy.ru>
     * @license GPLv3
     * @copyright (c) dev.maizy.ru, 2012
     *
     * @param opts
     * @constructor
     *
     * @require jQuery
     *
     * TODO add Unit test framework support (http://stackoverflow.com/questions/300855)
     */
    var h = function TestHelper(opts) {
        this._construct(opts);
    };

    h.prototype._construct = function(opts) {
        var self = this;

        this._$debugContainer = undefined;

        this._actions = [];

        // -------------------------------------------

        if (_.isUndefined(opts)) {
            opts = [];
        } else {
            opts = _.clone(opts);
        }

        opts.debugContainerId = opts.debugContainerId || 'debugOutput';

        if (_.isUndefined(opts.useConsole)) {
            opts.useConsole = window.console
                && window.console.debug
                && _.isFunction(window.console.debug);
        }

        this.opts = opts;

    };

    /**
     * @param {*}
     */
    h.prototype.debug = function() {
        var args = _.toArray(arguments);
        var $dc = this.getDebugContainer();

        if ($dc.length > 0) {
            $dc
                .append('<br/>')
                .append(_.escapeHTML(args.join(' ')));

        }

        if (this.opts.useConsole) {
            window.console.debug.call(window.console, arguments);
        }
    };

    h.prototype.addAction = function(callback, label) {
        var self = this;

        var $dc = this.getDebugContainer();

        var ind = this._actions.length;

        this._actions[ind] = callback;
        label = label || 'Action';

        if ($dc.length > 0) {
            var $button = $('<button/>').text(label+' {@'+ind+'}').click(callback);
            $dc
                .append('<br/>')
                .append($button);

        }

        if (this.opts.useConsole) {
            window.console.debug('Add action{@'+ind+'}. Call as .action('+ind+')');
        }
    };

    h.prototype.action = function(ind) {
        var self = this;
        if (this._actions[ind]) {
            this._actions[ind].call(null);
        }
        return this;

    };

    /**
     *
     * @return {jQuery}
     */
    h.prototype.getDebugContainer = function() {

        if (_.isUndefined(this._$debugContainer)) {
            this._$debugContainer = $('#'+this.opts.debugContainerId);
        }

        return this._$debugContainer;
    };

    return h;
    
})();
}