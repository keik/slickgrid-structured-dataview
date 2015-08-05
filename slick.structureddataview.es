/**
 * http://github.com/keik/slick-structured-dataview
 * @license MIT
 */

const DEV = false;

/* globals Slick */

(function ($) {
  'use strict';

  $.extend(true, window, {
    Slick: {
      Data: {
        StructuredDataView
      }
    }
  });

  /**
   * @constructor
   * @param {SlickGrid} grid SlickGrid object
   */
  function StructuredDataView (/* options = {} */) {

    /** master data */
    var _items = [];

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
    function getLength () {
      return _rows.length;
    }

    /**
     * Internal function for `get*` methods.
     * @private
     * @param {String} target getting for
     * @param {Number|Object} i starting row index or row item to find target
     * @param {String} colId columnd ID
     * @param {Array} parentArray parrent array of `i`
     * @returns {Object|Array|String|Number} what you want
     */

    /**
     * Return a item at row index `i`.
     * When `i` is out of range, return `null`.
     * @public
     * @param {Number} i index
     * @param {String} colId column ID
     * @returns {Object|null} item
     */
    function getItem (i, colId) {
      if (colId != null) {

        // `i` can be passed item `Object` type internally.
        var item = (typeof i === 'number' ? getItem(i) : i),
            v = item && item[colId];

        if (v == null) {
          for (var key in item) {
            if (item.hasOwnProperty(key)) {
              var nested = item[key];
              if (typeof nested === 'object') {
                return getItem(nested, colId);
              }
            }
          }
          return null;
        }
        return item;
      }
      return _rows[i] || null;
    }

    // TODO
    function getParent (i, colId) {
      return getItem(5, 'col1').children;
    }

    /**
     * Return value of cell pointed at `i` and `colId`.
     * When specified positions are out of range, return `null`
     * @public
     * @param {Number} i row index
     * @param {String} colId column ID
     * @return {String|Number|null} value
     */
    function getValue (i, colId) {
      return getItem(i, colId) != null ? getItem(i, colId)[colId] : '';
    }

    /**
     * Unused. (but overriding required)
     * @returns {Object} blank object.
     */
    function getItemMetadata (/* i */) {
      return {};
    }

    /**
     * Set items.
     * @public
     * @param {Array.<Object>} items items
     * @returns {undefined} undefined
     */
    function setItems (items) {
      _items = items;
      _rows = _genRowsFromItems(_items);

      _refresh();
    }

    /**
     * Return all items. Usually useless.
     * @public
     * @returns {Array} all items
     */
    function getItems () {
      return _items;
    }

    // ================================================================================
    // Data manipulator

    function insertItem (row, colId) {
      _insert(row, colId, false);
    }

    function appendItem (row, colId) {
      _insert(row, colId, true);
    }

    function _insert (row, colId, isAppend) {
      // TODO
      var clicked = 0;
      var newItem = {x: 1, y: 2, col2: 3, col3: 4, children: [{col4: 5}, {col4: '5-2'}]};

      var array = getParent(row, colId);
      array.splice(clicked + (isAppend ? 1 : 0), 0, newItem);
      _refresh();
    }

    // ========================================
    // Events

    /**
     * Notify changed.
     * @returns {undefined} undefined
     */
    function _refresh () {
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
    function _genRowsFromItems (item, acc = [], isObjInObj = false, isFirstChild = false) {
      var i, len;

      if ($.isArray(item)) {
        var parent = acc.length - 1;

        for (i = 0, len = item.length; i < len; i++) {
          _genRowsFromItems(item[i], acc, false, i === 0, parent);
        }
      } else {
        var hasArray = false; // Preserve not boolean but string of Array property name

        if (acc.length === 0 /* root */ || (!isObjInObj && !isFirstChild)) {
          acc.push(item);
        }

        for (var key in item) {
          if (item.hasOwnProperty(key)) {
            var val = item[key];

            if ($.isArray(val)) {
              if (hasArray) {
                throw new TypeError('Arguments cannot have multiple children at same depth: `' +
                                    hasArray + '` and `' + key + '`');
              } else {
                hasArray = key;
              }
              _genRowsFromItems(val, acc, false);
            } else if (typeof val === 'object')
              _genRowsFromItems(val, acc, true);
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
    function _getRowspan (row, colId) {

      function _getGeneration (item) {
        if (item == null) {
          return null;
        }

        var depth = 0;
        _dive(item);

        function _dive (item) {
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
    function syncGridCellCssStyles (grid, key) {

      /**
       * Create css rules for rowspan.
       * @private
       * @param {SlickGrid} grid SlickGrid object
       * @returns {undefined} undefined
       */
      function _createCssRules () {

        // create style rules
        var uid = grid.getContainerNode().className.match(/(?: |^)slickgrid_\d+(?!\w)/)[0],
            v = _measureVCellPaddingAndBorder();

        var rules = ['.hidden {visibility: hidden;}'];

        var maxrow = 30; // TODO to be intelligent
        for (var i = 0; i < maxrow; i++) {
          rules.push('.' + uid + ' .h' + i + ' {margin: 0; font-size: inherit; height:' + (i * (v.height + v.heightDiff) - v.heightDiff) + 'px;}');
        }

        var styleEl = $('<style type="text/css" rel="stylesheet" />').appendTo($('head'))[0];
        if (styleEl.styleSheet) { // IE
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
      function _measureVCellPaddingAndBorder () {

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

        return {height, heightDiff};
      } // _measureVCellPaddingAndBorder

      /**
       * SlickGrid formatter for StructuredDataView
       * @param {Object} item a row item
       * @param {Object} columnDef column defination
       * @returns {String} value
       */
      function _structuredDataExtractor (item, columnDef) {
        return String(StructuredDataView.prototype.getValue.apply(null, [item, columnDef.id]));
      }

      /**
       * Generate CSS Hash from rows.
       * This CSS styles are for rowspan representation.
       * @private
       * @param {Array} rows rows
       * @param {Array.<Object>} columns columun definations
       * @return {Object} hash of style rules
       */
      function _genCssHashFromRows () {
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
      function _styleUpdate () {
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
      getLength,
      getItem,
      getItemMetadata,

      // methods
      getParent,
      getValue,
      setItems,
      getItems,
      insertItem,
      appendItem,
      syncGridCellCssStyles,


      // events
      onRowsChanged
    });

    // `getValue` is useful for `structuredDataExtractor`
    this.constructor.prototype.getValue = getValue;

  } // StructuredDataView

}(jQuery));
