(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * https://github.com/keik/slickgrid-structured-dataview
 * (c) keik
 * @license MIT
 */

'use strict';

var _slickStructurededitorsEs = require('./slick.structurededitors.es');

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
function StructuredDataView() /* options = {} */{

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
  function getItemMetadata() /* i */{
    return {};
  }

  /**
   * Set items.
   * @public
   * @param {Array.<Object>} items items
   * @returns {undefined} undefined
   */
  function setItems(items) {
    _items = items;
    _rows = _genRowsFromItems(_items);
    _$$items = window._$$items = jsoon(_items);
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
   * @return {undefined} undefined
   */
  function insertRow(row, colId) {
    _insert(row, colId, false);
  }

  /**
   * Append a new Row to specified position. (same as `insertRow` after specified position)
   * @public
   * @param {Number} row row index
   * @param {String} colId column id
   * @return {undefined} undefined
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
   * @return {undefined} undefined
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
   * @return {undefined} undefined
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
   * @returns {undefined} undefined
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
   * @return {undefined} undefined
   */
  function syncGridCellCssStyles(grid, key) {

    /**
     * Create css rules for rowspan.
     * @private
     * @param {SlickGrid} grid SlickGrid object
     * @returns {undefined} undefined
     */
    function _createCssRules() {

      // create style rules
      var uid = grid.getContainerNode().className.match(/(?: |^)slickgrid_\d+(?!\w)/)[0],
          v = _measureVCellPaddingAndBorder();

      var rules = ['.hidden {visibility: hidden;}'];

      var maxrow = 30; // TODO to be intelligent
      for (var i = 0; i < maxrow; i++) {
        rules.push('.' + uid + ' .h' + i + ' {margin: 0; font-size: inherit; height:' + (i * (v.height + v.heightDiff) - v.heightDiff) + 'px;}');
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
     * @returns {undefined} undefined
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
     * @return {undefined} undefined
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

},{"./slick.structurededitors.es":2}],2:[function(require,module,exports){
/**
 * https://github.com/keik/slickgrid-structured-dataview
 * (c) keik
 * @license MIT
 */

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

},{}]},{},[1]);
