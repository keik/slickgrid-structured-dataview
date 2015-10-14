(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = require('./lib/jsoon');

},{"./lib/jsoon":2}],2:[function(require,module,exports){
/**
 * https://github.com/keik/jsoon
 * @license MIT
 */

/* eslint strict: [0], no-loop-func: [0] */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = jsoon;

var str = JSON.stringify,
    parse = JSON.parse;

var debug = require('debug')('jsoon');

/**
 * Return `jsoon` object which has several methods to query / manipulate / traverse.
 * @param {object|string} json target object to play with
 * @return {jsoon} `jsoon` object which has several methods
 */
function jsoon(json) {
  if (!(this instanceof jsoon)) {

    /* eslint new-cap: [0] */
    return new jsoon(json);
  }

  this._root = json;
  this._paths = [[]];

  // to be array-like
  this.length = 0;
  this.push = this._paths.push;
  this.pop = this._paths.pop;
  this.sort = this._paths.sort;
  this.splice = this._paths.splice;

  var ret = _resolveAll(this._paths, this),
      len = ret.length;

  this.length = len;

  for (var i = 0; i < len; i++) {
    this[i] = ret[i];
  }

  return this;
}

jsoon.fn = jsoon.prototype;

/**
 * Unchainable functions, which is not able to chain methods.
 */
var unchainableFns = {

  /**
   * Return value matched by the jsoon object.
   * @return {*} value
   */
  val: function val() {
    return _resolveAll(this._paths, this);
  }

};

// Merge unchainable prototype functions.
for (var key in unchainableFns) {
  if (unchainableFns.hasOwnProperty(key)) {
    jsoon.fn[key] = unchainableFns[key];
  }
}

/**
 * Chainable functions, which is able to chain methods by returning myself.
 */
var chainableFns = {

  /**
   * Get the root object.
   * @return {jsoon} myself
   */
  root: function root() {
    debug('[#root] from', this._paths);
    return [[]];
  },

  /**
   * Get the parents of current item.
   * @return {jsoon} myself
   */
  parent: function parent() {
    debug('[#parent] of', str(this._paths));

    // clone paths to preserve original
    var ret = parse(str(this._paths));

    for (var i = 0, len = ret.length; i < len; i++) {
      ret[i].pop();
    }

    return ret;
  },

  /**
   * Get the parents of current item.
   * @param {string} key property name which used to filter
   * @return {jsoon} myself
   */
  children: function children() {
    var key = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
    var acc = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

    debug('[#children] of', str(this._paths), 'filtered by', key);

    var keys = undefined,
        kobj = undefined;

    switch (typeof key) {
      case 'object':
        kobj = key;
        break;
      default:
        key = String(key);
        key = key.trim();
        keys = key.split(',');
        break;
    }

    var ret = acc,
        _self = this,
        currentPaths = parse(str(this._paths));

    if (kobj || keys.length === 1) {

      _each(currentPaths, function (path) {
        var v = _resolve(path, _self);

        if (typeof v === 'object') {
          for (var k in v) {
            if (v.hasOwnProperty(k)) {
              // clone to preserve original
              var currentPath = parse(str(path));

              // when `key` specified, filter property
              if (key.length > 0 && k === key || key.length === 0) {
                // add retrieve path
                currentPath.push(k);
                // add results
                ret.push(currentPath);
              }
            }
          }
        }
      });
    } else {
      for (var i = 0, len = keys.length; i < len; i++) {
        this.find(keys[i], acc);
      }
    }

    return ret;
  },

  /**
   * @return {jsoon} myself
   */
  siblings: function siblings() {
    debug('[#siblings] of', str(this._paths));
    // TODO
    return null;
  },

  /**
   * Get the value of matched property at specified `key` recursively.
   * @param {string|object} key property name, or object
   * @return {jsoon} myself
   */
  find: function find() {
    var key = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
    var acc = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

    debug('[#find] for', key, str(this._paths));

    var keys = undefined,
        kobj = undefined;

    switch (typeof key) {
      case 'object':
        kobj = key;
        break;
      default:
        key = String(key);
        key = key.trim();
        keys = key.split(',');
        break;
    }

    var ret = acc,
        _self = this,
        currentPaths = parse(str(this._paths));

    if (kobj || keys.length === 1) {

      _each(currentPaths, function (path) {
        var v = _resolve(path, _self),
            currentPath = parse(str(path));

        _traverse(v, function (k, v, acc) {
          // clone to preserve original
          acc = parse(str(acc));
          // add retrieve path
          acc.push(k);

          if (v === kobj || k === key) {
            // add results
            ret.push(acc);
          }
          return acc;
        }, currentPath);
      });
    } else {
      for (var i = 0, len = keys.length; i < len; i++) {
        this.find(keys[i], acc);
      }
    }

    return ret;
  },

  /**
   * Filter current objects by whether or not to pass specific function test.
   * @param {function} fn test function to filter, invoked per iteration of current objects
   * @returns {array.<object>} filtered object
   */
  filter: function filter(fn) {
    var ret = [],
        _self = this,
        currentPaths = parse(str(this._paths));

    _each(currentPaths, function (path) {
      var v = _resolve(path, _self),
          currentPath = parse(str(path));
      if (fn(v)) ret.push(currentPath);
    }, currentPaths);

    return ret;
  },

  /**
   * Filter children expect for specified index.
   * @param {number} i index
   * @return {jsoon} myself
   */
  eq: function eq(i) {
    debug('[#eq]', i, 'of', str(this._paths));
    return [this._paths[i]];
  },

  /**
   * Alias of `.eq(0)`.
   * @return {jsoon} myself
   */
  first: function first() {
    debug('[#first]');
    return [this._paths[0]];
  },

  /**
   * Alias of `.eq(<last-child>)`.
   * @return {jsoon} myself
   */
  last: function last() {
    debug('[#lst]');
    return [this._paths[this._paths.length - 1]];
  },

  /**
   * @return {jsoon} myself
   */
  keys: function keys() {
    // TODO
    return null;
  }

};

// Merge chainable prototype functions.

var _loop = function (key) {
  if (chainableFns.hasOwnProperty(key)) {
    jsoon.fn[key] = function () {

      var paths = _uniq(chainableFns[key].apply(this, arguments)),
          resolved = _resolveAll(paths, this),
          len = resolved.length;

      // Chainable methods must not have side effect to myself
      // so create a new clone and return one.
      var ret = jsoon(this._root);
      ret._paths = paths;
      ret.length = len;

      for (var i = 0; i < len; i++) {
        ret[i] = resolved[i];
      }

      return ret;
    };
  }
};

for (var key in chainableFns) {
  _loop(key);
}

function _each(paths, fn) {
  debug('   ', '(#_each)', 'for', str(paths));

  for (var i = 0, len = paths.length; i < len; i++) {
    fn(paths[i]);
  }
}

/**
 * @private
 * @param {object} obj start point object to traverse
 * @param {function} fn callback
 * @param {*} acc accumulator
 * @return {undefined} no retruns
 */
function _traverse(obj, fn, acc) {
  debug('   ', '(#_traverse)', 'to', str(obj), 'with', str(acc));
  for (var k in obj) {
    if (obj.hasOwnProperty(k)) {
      var v = obj[k],
          ret = fn(k, v, acc);

      if (typeof v === 'object') {
        _traverse(v, fn, ret);
      }
    }
  }
}

/**
 * Return value in `obj`, which resolved through `path`.
 * @private
 * @param {array.<string>} path path to access to value
 * @param {jsoon} ctx context jsoon object
 * @return {object} resolved value
 */
function _resolve(path, ctx) {
  debug('   ', '(#_resolve)', str(path));
  var ret = ctx._root;

  for (var i = 0, len = path.length; i < len; i++) {
    ret = ret[path[i]];
  }
  return ret;
}

/**
 * Shim for `paths.map(_resolve)`.
 * @private
 * @param {array.<string>} paths collection of paths
 * @param {jsoon} ctx context jsoon object
 * @return {object} no retruns
 */
function _resolveAll(paths, ctx) {
  debug('   ', '(#_resolveAll)', str(paths));

  var len = paths.length,
      ret = [];

  for (var i = 0; i < len; i++) {
    ret.push(_resolve(paths[i], ctx));
  }
  return ret;
}

/**
 * Return duplicate-free array with deeply comparison.
 * (different objects which has same properties are dealt with same object)
 * @private
 * @param {array} array array of paths
 * @returns {array} duplicate-freed array
 */
function _uniq(array) {
  debug('   ', '(#_uniq)', 'with', str(array));
  var ret = [];

  for (var i = 0, I = array.length; i < I; i++) {
    var exist = false;
    var item = array[i];

    var sitem = str(item);
    for (var j = 0, J = ret.length; j < J; j++) {
      if (sitem === str(ret[j])) {
        exist = true;
        break;
      }
    }
    if (!exist) ret.push(item);
  }

  return ret;
}

// export internal function for debug (will be removed in the future)
jsoon._resolve = _resolve;
jsoon._resolveAll = _resolveAll;
jsoon._uniq = _uniq;
module.exports = exports['default'];

},{"debug":3}],3:[function(require,module,exports){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  return ('WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  return JSON.stringify(v);
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage(){
  try {
    return window.localStorage;
  } catch (e) {}
}

},{"./debug":4}],4:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":5}],5:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = '' + str;
  if (str.length > 10000) return;
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],6:[function(require,module,exports){
/**
 * https://github.com/keik/slickgrid-structured-dataview
 * @version v0.5.0
 * @author keik <k4t0.kei@gmail.com>
 * @license MIT
 */

'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _slickStructurededitorsEs = require('./slick.structurededitors.es');

var _jsoon = require('jsoon');

var _jsoon2 = _interopRequireDefault(_jsoon);

$.extend(true, window, {
  Slick: {
    Data: {
      StructuredDataView: StructuredDataView
    },
    Editors: {
      Text: _slickStructurededitorsEs.TextEditor,
      Integer: _slickStructurededitorsEs.IntegerEditor,
      Date: _slickStructurededitorsEs.DateEditor,
      YesNoSelect: _slickStructurededitorsEs.YesNoSelectEditor,
      Checkbox: _slickStructurededitorsEs.CheckboxEditor,
      PercentComplete: _slickStructurededitorsEs.PercentCompleteEditor,
      LongText: _slickStructurededitorsEs.LongTextEditor
    }
  }
});

/**
 * @constructor
 * @param {SlickGrid} grid SlickGrid object
 */
function StructuredDataView() {

  /** master data */
  var _items = [],
      _$$items = undefined;

  /** internal rows data */
  var _rows = [];

  var onRowsChanged = new Slick.Event();

  // ================================================================================
  // Accessors

  /**
   * Return rows length.
   * @public
   * @return {Number} rows length
   */
  function getLength() {
    return _rows.length;
  }

  /**
   * Return a item at row index `i`.
   * When `i` is out of range, return `null`.
   * @public
   * @param {Number} i index
   * @param {String} colId column ID
   * @returns {Object|null} item
   */
  function getItem(_x4, _x5) {
    var _again = true;

    _function: while (_again) {
      var i = _x4,
          colId = _x5;
      item = v = key = nested = undefined;
      _again = false;

      if (colId != null) {

        // `i` can be passed item `Object` type internally.
        var item = typeof i === 'number' ? getItem(i) : i,
            v = item && item[colId];

        if (v == null) {
          for (var key in item) {
            if (item.hasOwnProperty(key)) {
              var nested = item[key];
              if (typeof nested === 'object') {
                _x4 = nested;
                _x5 = colId;
                _again = true;
                continue _function;
              }
            }
          }
          return null;
        }
        return item;
      }
      return _rows[i] || null;
    }
  }

  /**
   * Return value of cell pointed at `i` and `colId`.
   * When specified positions are out of range, return `null`
   * @public
   * @param {Number|Object} i row index or row item
   * @param {String} columnDef column defination
   * @return {String|Number|null} value
   */
  function getValue(i, columnDef) {
    return getItem(i, columnDef.id) != null ? getItem(i, columnDef.id)[columnDef.field] : '';
  }

  /**
   * Unused. (but overriding required)
   * @returns {Object} blank object.
   */
  function getItemMetadata() {
    return {};
  }

  /**
   * Set items.
   * @public
   * @param {Array.<Object>} items items
   */
  function setItems(items) {
    _items = items;
    _rows = _genRowsFromItems(_items);
    _$$items = window._$$items = (0, _jsoon2['default'])(_items);
    _refresh();
  }

  /**
   * Return all items. Usually useless.
   * @public
   * @returns {Array} all items
   */
  function getItems() {
    return _items;
  }

  // ================================================================================
  // Data manipulator

  /**
   * Insert a new Row to specified position. (same as `appendRow` before specified position)
   * @public
   * @param {Number} row row index
   * @param {String} colId column id
   */
  function insertRow(row, colId) {
    _insert(row, colId, false);
  }

  /**
   * Append a new Row to specified position. (same as `insertRow` after specified position)
   * @public
   * @param {Number} row row index
   * @param {String} colId column id
   */
  function appendRow(row, colId) {
    _insert(row, colId, true);
  }

  /**
   * Insert a new Row to specified position.
   * @private
   * @param {Number} row row index
   * @param {String} colId column id
   * @param {Boolean} isAppend flag for append mode
   */
  function _insert(row, colId, isAppend) {
    var $$item = _$$items.find(getItem(row, colId)),
        $$parent = $$item.parent();

    // find parent not array object, that item belongs
    while (!$.isArray($$item.parent()[0])) {
      $$item = $$item.parent();
    }
    var item = $$item[0];

    // find parent and index, to insert new item
    while (!$.isArray($$parent[0])) {
      $$parent = $$parent.parent();
    }
    var parent = $$parent[0];

    function reset(obj) {
      for (var k in obj) {
        if (typeof obj[k] !== 'object') {
          obj[k] = '';
        } else {
          reset(obj[k]);
        }
      }
      return obj;
    }

    var index = parent.indexOf(item);

    // create new item to insert, which have same structure with parent one but blank values
    var newItem = reset(JSON.parse(JSON.stringify(parent[index])));
    parent.splice(index + (isAppend ? 1 : 0), 0, newItem);
    _refresh();
  }

  /**
   * Delete a specified row
   * @public
   * @param {Number} row row index
   * @param {String} colId column id
   * @param {Boolean} isAppend flag for append mode
   */
  function deleteRow(row, colId) {
    var $$item = _$$items.find(getItem(row, colId)),
        $$parent = $$item.parent();

    // find parent not array object, that item belongs
    while (!$.isArray($$item.parent()[0])) {
      $$item = $$item.parent();
    }
    var item = $$item[0];

    // find parent and index, to insert new item
    while (!$.isArray($$parent[0])) {
      $$parent = $$parent.parent();
    }
    var parent = $$parent[0];

    var index = parent.indexOf(item);
    parent.splice(index, 1);

    _refresh();
  }

  // ========================================
  // Events

  /**
   * Notify changed.
   */
  function _refresh() {
    _rows = _genRowsFromItems(_items);
    onRowsChanged.notify();
  }

  // ========================================
  // Data formatting

  /**
   * Generate rows array from items.
   *
   * Rows array will be generated from the item array, like:
   *
   *     [{col1: '1', children: [
   *       {col2: '1-1', data: {col3: 'this is 1-1'}},
   *       {col2: '1-2', data: {col3: 'this is 1-2'}}
   *     ]},
   *     {col1: '2', children: [
   *       {col2: '2-1', data: {col3: 'this is 2-1', children: [
   *         {col4: '2-1-1'},
   *         {col4: '2-1-2'}]}},
   *       {col2: '2-2'}]}];
   *
   * to (indented to clarify):
   *
   *     [
   *       {col1: '1', children: [{col2: '1-1', data: {col3: 'this is 1-1'}}, {col2: '1-2', data: {col3: 'this is 1-2'}}]},
   *                              {col2: '1-2', data: {col3: 'this is 1-2'}},
   *       {col1: '2', children: [{col2: '2-1', data: {col3: 'this is 2-1', children: [{col4: '2-1-1'}, {col4: '2-1-2'}]}}, {col2: '2-2'}]},
   *                                                                                   {col4: '2-1-2'},
   *                                                                                                                        {col2: '2-2'}];
   *
   * @private
   * @param {Array|Object|String|Number} item item to iteration
   * @param {Array} acc accumulator
   * @param {Boolean} isObjInObj internal flag
   * @param {Boolean} isFirstChild iinternal flag
   * @returns {Object} rows
   */
  function _genRowsFromItems(item) {
    var acc = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
    var isObjInObj = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
    var isFirstChild = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

    var i = undefined,
        len = undefined;

    if ($.isArray(item)) {
      var _parent = acc.length - 1;

      for (i = 0, len = item.length; i < len; i++) {
        _genRowsFromItems(item[i], acc, false, i === 0, _parent);
      }
    } else {
      var hasArray = false; // Preserve not boolean but string of Array property name

      if (acc.length === 0 /* root */ || !isObjInObj && !isFirstChild) {
        acc.push(item);
      }

      for (var key in item) {
        if (item.hasOwnProperty(key)) {
          var val = item[key];

          if ($.isArray(val)) {
            if (hasArray) {
              throw new TypeError('Arguments cannot have multiple children at same depth: `' + hasArray + '` and `' + key + '`');
            } else {
              hasArray = key;
            }
            _genRowsFromItems(val, acc, false);
          } else if (typeof val === 'object') _genRowsFromItems(val, acc, true);
        }
      }
    }
    return acc;
  }

  /**
   * Return row span on specific cell.
   * @param {Number} row row index
   * @param {String} colId column ID
   * @returns {Number} rowspan
   */
  function _getRowspan(row, colId) {

    function _getGeneration(item) {
      if (item == null) {
        return null;
      }

      var depth = 0;
      _dive(item);

      function _dive(item) {
        var hasArrayOrObj = false;

        if (typeof item !== 'object') return;

        for (var key in item) {
          if (item.hasOwnProperty(key)) {
            var val = item[key];

            if (typeof val === 'object') {
              hasArrayOrObj = true;
              if ($.isArray(val)) {
                for (var i = 0, len = val.length; i < len; i++) {
                  _dive(val[i]);
                }
              } else {
                _dive(val);
              }
            }
          }
        }

        if (!hasArrayOrObj) {
          depth++;
        }
      } // _dive

      return depth;
    } // _getGeneration

    return _getGeneration(getItem(row, colId));
  }

  // ================================================================================
  // Styles (depend on DOM)

  /**
   * Synchronize grid style.
   * Called Once.
   * @public
   * @param {SlickGrid} grid SlickGrid object
   * @param {String} key key of style rules
   */
  function syncGridCellCssStyles(grid, key) {

    /**
     * Create css rules for rowspan.
     * @private
     * @param {SlickGrid} grid SlickGrid object
     */
    function _createCssRules() {

      // create style rules
      var uid = grid.getContainerNode().className.match(/(?: |^)slickgrid_(\d+)(?!\w)/)[1],
          v = _measureVCellPaddingAndBorder();

      var rules = ['.hidden {visibility: hidden;}'];

      var maxrow = 30; // TODO to be intelligent
      for (var i = 0; i < maxrow; i++) {
        rules.push('.slickgrid_' + uid + ' .h' + i + ' {margin: 0; font-size: inherit; height:' + (i * (v.height + v.heightDiff) - v.heightDiff) + 'px;}');
      }

      var styleEl = $('<style type="text/css" rel="stylesheet" />').appendTo($('head'))[0];
      if (styleEl.styleSheet) {
        // IE
        styleEl.styleSheet.cssText = rules.join(' ');
      } else {
        styleEl.appendChild(document.createTextNode(rules.join(' ')));
      }
    } // _createCssRules

    /**
     * Measure a cell height and horizontal padding. (almost adapted from `measureCellPaddingAndBorder` in slick.grid.js)
     * @private
     * @returns {Object.<number, number>} height of cell, and horizontal padding
     */
    function _measureVCellPaddingAndBorder() {

      var v = ['borderTopWidth', 'borderBottomWidth', 'paddingTop', 'paddingBottom'],
          $canvas = $(grid.getCanvasNode()),
          $r = $('<div class="slick-row" />').appendTo($canvas),
          $el = $('<div class="slick-cell" id="" style="visibility:hidden">-</div>').appendTo($r);

      var height = undefined,
          heightDiff = 0;

      height = parseFloat($el.css('height'));
      $.each(v, function (n, val) {
        heightDiff += parseFloat($el.css(val)) || 0;
      });
      $r.remove();

      return { height: height, heightDiff: heightDiff };
    } // _measureVCellPaddingAndBorder

    /**
     * SlickGrid formatter for StructuredDataView
     * @param {Object} item a row item
     * @param {Object} columnDef column defination
     * @returns {String} value
     */
    function _structuredDataExtractor(item, columnDef) {
      return String(StructuredDataView.prototype.getValue.apply(null, [item, columnDef]));
    }

    /**
     * Generate CSS Hash from rows.
     * This CSS styles are for rowspan representation.
     * @private
     * @param {Array} rows rows
     * @param {Array.<Object>} columns columun definations
     * @return {Object} hash of style rules
     */
    function _genCssHashFromRows() {
      var cssHash = {},
          columns = grid.getColumns();

      for (var i = 0, I = _rows.length; i < I; i++) {
        for (var j = 0, J = columns.length; j < J; j++) {
          cssHash[i] = cssHash[i] || {};
          var columnId = columns[j].id;
          var rowspan = _getRowspan(i, columnId);
          cssHash[i][columnId] = rowspan != null ? 'h' + rowspan : 'hidden';
        }
      }
      return cssHash;
    }

    /**
     * Update CSS rules.
     * @private
     */
    function _styleUpdate() {
      var cssHash = _genCssHashFromRows();

      grid.setCellCssStyles(key, cssHash);
    }

    this.onRowsChanged.subscribe(_styleUpdate);

    // et value extractor
    grid.getOptions().dataItemColumnValueExtractor = _structuredDataExtractor;

    // create style rules defination
    _createCssRules(grid);

    // calculate and apply applicable styles to DOM
    _styleUpdate();
  } // syncGridCellCssStyles

  // ================================================================================
  // Exports

  $.extend(this, {
    // data provider methods
    getLength: getLength,
    getItem: getItem,
    getItemMetadata: getItemMetadata,

    // methods
    getValue: getValue,
    setItems: setItems,
    getItems: getItems,
    insertRow: insertRow,
    appendRow: appendRow,
    deleteRow: deleteRow,
    syncGridCellCssStyles: syncGridCellCssStyles,

    // events
    onRowsChanged: onRowsChanged
  });

  // `getValue` is useful for `structuredDataExtractor`
  this.constructor.prototype.getValue = getValue;
} // StructuredDataView

},{"./slick.structurededitors.es":7,"jsoon":1}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.TextEditor = TextEditor;
exports.IntegerEditor = IntegerEditor;
exports.DateEditor = DateEditor;
exports.YesNoSelectEditor = YesNoSelectEditor;
exports.CheckboxEditor = CheckboxEditor;
exports.PercentCompleteEditor = PercentCompleteEditor;
exports.LongTextEditor = LongTextEditor;

function TextEditor(args) {
  var $input;
  var defaultValue;

  this.init = function () {
    $input = $('<input type=text class="editor-text" />').appendTo(args.container).bind('keydown.nav', function (e) {
      if (e.keyCode === 37 /* LEFT */ || e.keyCode === 39 /* RIGHT */) {
          e.stopImmediatePropagation();
        }
    }).focus().select();
  };

  this.destroy = function () {
    $input.remove();
  };

  this.focus = function () {
    $input.focus();
  };

  this.getValue = function () {
    return $input.val();
  };

  this.setValue = function (val) {
    $input.val(val);
  };

  this.loadValue = function (item) {
    item = args.grid.getData().getItem(item, args.column.field);
    defaultValue = item[args.column.field] || '';
    $input.val(defaultValue);
    $input[0].defaultValue = defaultValue;
    $input.select();
  };

  this.serializeValue = function () {
    return $input.val();
  };

  this.applyValue = function (item, state) {
    item = args.grid.getData().getItem(item, args.column.field);
    item[args.column.field] = state;
  };

  this.isValueChanged = function () {
    return !($input.val() === '' && defaultValue == null) && $input.val() !== defaultValue;
  };

  this.validate = function () {
    if (args.column.validator) {
      var validationResults = args.column.validator($input.val());
      if (!validationResults.valid) {
        return validationResults;
      }
    }

    return {
      valid: true,
      msg: null
    };
  };

  this.init();
}

function IntegerEditor(args) {
  var $input;
  var defaultValue;

  this.init = function () {
    $input = $('<input type=text class="editor-text" />');

    $input.bind('keydown.nav', function (e) {
      if (e.keyCode === 37 /* LEFT */ || e.keyCode === 39 /* RIGHT */) {
          e.stopImmediatePropagation();
        }
    });

    $input.appendTo(args.container);
    $input.focus().select();
  };

  this.destroy = function () {
    $input.remove();
  };

  this.focus = function () {
    $input.focus();
  };

  this.loadValue = function (item) {
    item = args.grid.getData().getItem(item, args.column.field);
    defaultValue = item[args.column.field];
    $input.val(defaultValue);
    $input[0].defaultValue = defaultValue;
    $input.select();
  };

  this.serializeValue = function () {
    return parseInt($input.val(), 10) || 0;
  };

  this.applyValue = function (item, state) {
    item = args.grid.getData().getItem(item, args.column.field);
    item[args.column.field] = state;
  };

  this.isValueChanged = function () {
    return !($input.val() === '' && defaultValue == null) && $input.val() !== defaultValue;
  };

  this.validate = function () {
    if (isNaN($input.val())) {
      return {
        valid: false,
        msg: 'Please enter a valid integer'
      };
    }

    return {
      valid: true,
      msg: null
    };
  };

  this.init();
}

function DateEditor(args) {
  var $input;
  var defaultValue;
  var calendarOpen = false;

  this.init = function () {
    $input = $('<input type=text class="editor-text" />');
    $input.appendTo(args.container);
    $input.focus().select();
    $input.datepicker({
      showOn: 'button',
      buttonImageOnly: true,
      buttonImage: '../images/calendar.gif',
      beforeShow: function beforeShow() {
        calendarOpen = true;
      },
      onClose: function onClose() {
        calendarOpen = false;
      }
    });
    $input.width($input.width() - 18);
  };

  this.destroy = function () {
    $.datepicker.dpDiv.stop(true, true);
    $input.datepicker('hide');
    $input.datepicker('destroy');
    $input.remove();
  };

  this.show = function () {
    if (calendarOpen) {
      $.datepicker.dpDiv.stop(true, true).show();
    }
  };

  this.hide = function () {
    if (calendarOpen) {
      $.datepicker.dpDiv.stop(true, true).hide();
    }
  };

  this.position = function (position) {
    if (!calendarOpen) {
      return;
    }
    $.datepicker.dpDiv.css('top', position.top + 30).css('left', position.left);
  };

  this.focus = function () {
    $input.focus();
  };

  this.loadValue = function (item) {
    item = args.grid.getData().getItem(item, args.column.field);
    defaultValue = item[args.column.field];
    $input.val(defaultValue);
    $input[0].defaultValue = defaultValue;
    $input.select();
  };

  this.serializeValue = function () {
    return $input.val();
  };

  this.applyValue = function (item, state) {
    item = args.grid.getData().getItem(item, args.column.field);
    item[args.column.field] = state;
  };

  this.isValueChanged = function () {
    return !($input.val() === '' && defaultValue == null) && $input.val() !== defaultValue;
  };

  this.validate = function () {
    return {
      valid: true,
      msg: null
    };
  };

  this.init();
}

function YesNoSelectEditor(args) {
  var $select;
  var defaultValue;

  this.init = function () {
    $select = $('<select tabIndex="0" class="editor-yesno"><option value="yes">Yes</option><option value="no">No</option></select>');
    $select.appendTo(args.container);
    $select.focus();
  };

  this.destroy = function () {
    $select.remove();
  };

  this.focus = function () {
    $select.focus();
  };

  this.loadValue = function (item) {
    item = args.grid.getData().getItem(item, args.column.field);
    $select.val((defaultValue = item[args.column.field]) ? 'yes' : 'no');
    $select.select();
  };

  this.serializeValue = function () {
    return $select.val() === 'yes';
  };

  this.applyValue = function (item, state) {
    item = args.grid.getData().getItem(item, args.column.field);
    item[args.column.field] = state;
  };

  this.isValueChanged = function () {
    return $select.val() !== defaultValue;
  };

  this.validate = function () {
    return {
      valid: true,
      msg: null
    };
  };

  this.init();
}

function CheckboxEditor(args) {
  var $select;
  var defaultValue;

  this.init = function () {
    $select = $('<input type=checkbox value="true" class="editor-checkbox" hideFocus>');
    $select.appendTo(args.container);
    $select.focus();
  };

  this.destroy = function () {
    $select.remove();
  };

  this.focus = function () {
    $select.focus();
  };

  this.loadValue = function (item) {
    item = args.grid.getData().getItem(item, args.column.field);
    defaultValue = Boolean(item[args.column.field]);
    if (defaultValue) {
      $select.attr('checked', 'checked');
    } else {
      $select.removeAttr('checked');
    }
  };

  this.serializeValue = function () {
    return Boolean($select.attr('checked'));
  };

  this.applyValue = function (item, state) {
    item = args.grid.getData().getItem(item, args.column.field);
    item[args.column.field] = state;
  };

  this.isValueChanged = function () {
    return this.serializeValue() !== defaultValue;
  };

  this.validate = function () {
    return {
      valid: true,
      msg: null
    };
  };

  this.init();
}

function PercentCompleteEditor(args) {
  var $input, $picker;
  var defaultValue;

  this.init = function () {
    $input = $('<input type=text class="editor-percentcomplete" />');
    $input.width($(args.container).innerWidth() - 25);
    $input.appendTo(args.container);

    $picker = $('<div class="editor-percentcomplete-picker" />').appendTo(args.container);
    $picker.append('<div class="editor-percentcomplete-helper"><div class="editor-percentcomplete-wrapper"><div class="editor-percentcomplete-slider" /><div class="editor-percentcomplete-buttons" /></div></div>');

    $picker.find('.editor-percentcomplete-buttons').append('<button val=0>Not started</button><br/><button val=50>In Progress</button><br/><button val=100>Complete</button>');

    $input.focus().select();

    $picker.find('.editor-percentcomplete-slider').slider({
      orientation: 'vertical',
      range: 'min',
      value: defaultValue,
      slide: function slide(event, ui) {
        $input.val(ui.value);
      }
    });

    $picker.find('.editor-percentcomplete-buttons button').bind('click', function () {
      $input.val($(this).attr('val'));
      $picker.find('.editor-percentcomplete-slider').slider('value', $(this).attr('val'));
    });
  };

  this.destroy = function () {
    $input.remove();
    $picker.remove();
  };

  this.focus = function () {
    $input.focus();
  };

  this.loadValue = function (item) {
    item = args.grid.getData().getItem(item, args.column.field);
    $input.val(defaultValue = item[args.column.field]);
    $input.select();
  };

  this.serializeValue = function () {
    return parseInt($input.val(), 10) || 0;
  };

  this.applyValue = function (item, state) {
    item = args.grid.getData().getItem(item, args.column.field);
    item[args.column.field] = state;
  };

  this.isValueChanged = function () {
    return !($input.val() === '' && defaultValue == null) && (parseInt($input.val(), 10) || 0) !== defaultValue;
  };

  this.validate = function () {
    if (isNaN(parseInt($input.val(), 10))) {
      return {
        valid: false,
        msg: 'Please enter a valid positive number'
      };
    }

    return {
      valid: true,
      msg: null
    };
  };

  this.init();
}

/*
 * An example of a "detached" editor.
 * The UI is added onto document BODY and .position(), .show() and .hide() are implemented.
 * KeyDown events are also handled to provide handling for Tab, Shift-Tab, Esc and Ctrl-Enter.
 */
function LongTextEditor(args) {
  var $input, $wrapper;
  var defaultValue;
  var _self = this;

  this.init = function () {
    var $container = $('body');

    $wrapper = $('<div style="z-index:10000;position:absolute;background:white;padding:5px;border:3px solid gray; -moz-border-radius:10px; border-radius:10px;"/>').appendTo($container);

    $input = $('<textarea hidefocus rows=5 style="backround:white;width:250px;height:80px;border:0;outline:0">').appendTo($wrapper);

    $('<div style="text-align:right"><button>Save</button><button>Cancel</button></div>').appendTo($wrapper);

    $wrapper.find('button:first').bind('click', this.save);
    $wrapper.find('button:last').bind('click', this.cancel);
    $input.bind('keydown', this.handleKeyDown);

    _self.position(args.position);
    $input.focus().select();
  };

  this.handleKeyDown = function (e) {
    if (e.which === 13 /* ENTER */ && e.ctrlKey) {
      _self.save();
    } else if (e.which === 27 /* ESCAPE */) {
        e.preventDefault();
        _self.cancel();
      } else if (e.which === 9 /* TAB */ && e.shiftKey) {
      e.preventDefault();
      args.grid.navigatePrev();
    } else if (e.which === 9 /* TAB */) {
        e.preventDefault();
        args.grid.navigateNext();
      }
  };

  this.save = function () {
    args.commitChanges();
  };

  this.cancel = function () {
    $input.val(defaultValue);
    args.cancelChanges();
  };

  this.hide = function () {
    $wrapper.hide();
  };

  this.show = function () {
    $wrapper.show();
  };

  this.position = function (position) {
    $wrapper.css('top', position.top - 5).css('left', position.left - 5);
  };

  this.destroy = function () {
    $wrapper.remove();
  };

  this.focus = function () {
    $input.focus();
  };

  this.loadValue = function (item) {
    item = args.grid.getData().getItem(item, args.column.field);
    $input.val(defaultValue = item[args.column.field]);
    $input.select();
  };

  this.serializeValue = function () {
    return $input.val();
  };

  this.applyValue = function (item, state) {
    item = args.grid.getData().getItem(item, args.column.field);
    item[args.column.field] = state;
  };

  this.isValueChanged = function () {
    return !($input.val() === '' && defaultValue == null) && $input.val() !== defaultValue;
  };

  this.validate = function () {
    return {
      valid: true,
      msg: null
    };
  };

  this.init();
}

},{}]},{},[6]);
