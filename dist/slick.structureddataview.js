/**
 * http://github.com/keik/slick-structured-dataview
 * @license MIT
 */

'use strict';

var DEV = false;

/* globals Slick, jsoon */

(function ($) {
  'use strict';

  $.extend(true, window, {
    Slick: {
      Data: {
        StructuredDataView: StructuredDataView
      }
    }
  });

  /**
   * @constructor
   * @param {SlickGrid} grid SlickGrid object
   */
  function StructuredDataView() /* options = {} */{

    /** master data */
    var _items = [];

    /** internal rows data */
    var _rows = [],
        _$$rows = undefined;

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

    // TODO
    function getParent() /* i, colId */{

      return getItem(5, 'col1').children;
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
      _$$rows = window._$$rows = jsoon(_rows);
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

    function insertItem(row, colId) {
      _insert(row, colId, false);
    }

    function appendItem(row, colId) {
      _insert(row, colId, true);
    }

    function _insert(row, colId, isAppend) {
      var item = getItem(row, colId),
          $$item = _$$rows.find(item),
          $$parent = $$item.parent();

      // find parent and index, to insert new item
      while (!$.isArray($$parent[0])) {
        $$parent = $$parent.parent();
      }

      var parent = $$parent[0];

      var index = 0;
      for (var len = parent.length; index < len; index++) {
        if ($$parent.children(index).find(item).length === 1) break;
      }

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

      // create new item to insert, which have same structure with parent one but blank values
      var newItem = reset(JSON.parse(JSON.stringify(parent[0])));

      parent.splice(index + (isAppend ? 1 : 0), 0, newItem);
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

      var i, len;

      if ($.isArray(item)) {
        var parent = acc.length - 1;

        for (i = 0, len = item.length; i < len; i++) {
          _genRowsFromItems(item[i], acc, false, i === 0, parent);
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

        var height,
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
      getParent: getParent,
      getValue: getValue,
      setItems: setItems,
      getItems: getItems,
      insertItem: insertItem,
      appendItem: appendItem,
      syncGridCellCssStyles: syncGridCellCssStyles,

      // events
      onRowsChanged: onRowsChanged
    });

    // `getValue` is useful for `structuredDataExtractor`
    this.constructor.prototype.getValue = getValue;
  } // StructuredDataView
})(jQuery);