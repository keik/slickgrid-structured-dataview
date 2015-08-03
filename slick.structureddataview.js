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
      },
      Extractor: {
        structuredDataExtractor
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

    var onRowCountChanged = new Slick.Event(),
        onRowsChanged = new Slick.Event();

    /**
     * Return rows length.
     * @public
     * @return {Number} rows length
     */
    function getLength () {
      return _rows.length;
    }

    /**
     * Return a item at index `i`
     * @public
     * @param {Number} i index
     * @returns {Object} item
     */
    function getItem (i) {
      return _rows[i];
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

      if (DEV) console.log('RESULT:', JSON.stringify(_rows));
      if (DEV) console.log('============================');

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

    function _refresh () {
      onRowsChanged.notify();
      onRowCountChanged.notify();
    }

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
      if (DEV) console.log('called:', item, isObjInObj ? 'isObjInObj' : '', isFirstChild ? 'isFirstChild' : '');
      var i, len;

      if ($.isArray(item)) {
        var parent = acc.length - 1;

        for (i = 0, len = item.length; i < len; i++) {
          _genRowsFromItems(item[i], acc, false, i === 0, parent);
        }
      } else {
        var hasArray = false; // Preserve not boolean but string of Array property name

        if (acc.length === 0 /* root */ || (!isObjInObj && !isFirstChild)) {
          if (DEV) console.log('push  :', JSON.stringify(item) + ' to ' + JSON.stringify(acc));
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
     * @param {String} col col index
     * @returns {Number} rowspan
     */
    function _getRowspan (row, col) {

      var item = _rows[row];

      function _findRoot (item, col) {
        var target = item[col];

        if (target == null) {
          for (var key in item) {
            if (item.hasOwnProperty(key)) {
              var val = item[key];

              if (typeof val === 'object') {
                return _findRoot(val, col);
              }
            }
          }
        } else {
          return item;
        }
        return null;
      } // _findRoot

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

      return _getGeneration(_findRoot(item, col));
    }


    /**
     * Synchronize grid style.
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
      function _createCssRules (grid) {

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

        // create style rules
        var uid = grid.getContainerNode().className.match(/(?: |^)slickgrid_\d+(?!\w)/)[0],
            v = _measureVCellPaddingAndBorder();

        var rules = ['.hidden {visibility: hidden;}'];

        var maxrow = 30; // TODO to be intelligent
        for (var i = 0; i < maxrow; i++) {
          rules.push('.' + uid + ' .h' + i + ' {height:' + (i * (v.height + v.heightDiff) - v.heightDiff) + 'px;}');
        }

        var styleEl = $('<style type="text/css" rel="stylesheet" />').appendTo($('head'))[0];
        if (styleEl.styleSheet) { // IE
          styleEl.styleSheet.cssText = rules.join(' ');
        } else {
          styleEl.appendChild(document.createTextNode(rules.join(' ')));
        }
      }

      function update () {
        var cssHash = _genCssHashFromRows(_rows, grid.getColumns());
        grid.setCellCssStyles(key, cssHash);
      }

      this.onRowsChanged.subscribe(update);
      this.onRowCountChanged.subscribe(update);

      _createCssRules(grid);
      update();
    }

    /**
     * Generate CSS Hash from rows.
     * This CSS styles are for rowspan representation.
     * @private
     * @param {Array} rows rows
     * @param {Array.<Object>} columns columun definations
     * @return {Object} hash of style rules
     */
    function _genCssHashFromRows (rows, columns) {
      var cssHash = {};

      for (var i = 0, I = rows.length; i < I; i++) {
        for (var j = 0, J = columns.length; j < J; j++) {
          cssHash[i] = cssHash[i] || {};
          var columnId = columns[j].id;
          var rowspan = _getRowspan(i, columnId);
          cssHash[i][columnId] = rowspan != null ? 'h' + rowspan : 'hidden';
        }
      }
      return cssHash;
    }

    $.extend(this, {
      // data provider methods
      getLength,
      getItem,
      getItemMetadata,

      // methods
      setItems,
      getItems,
      syncGridCellCssStyles,

      // events
      onRowsChanged,
      onRowCountChanged
    });
  } // StructuredDataView

  /**
   * SlickGrid formatter for StructuredDataView
   * @param {Object} item a row item
   * @param {Object} columnDef column defination
   * @returns {String} value
   */
  function structuredDataExtractor (item, columnDef) {

    function findValue (item, columnDef) {

      var v = item[columnDef.field];

      if (v == null) {
        for (var key in item) {
          if (item.hasOwnProperty(key)) {
            var nested = item[key];

            if (typeof nested === 'object') {
              return findValue(nested, columnDef);
            }
          }
        }
      } else if (typeof v === 'object') {
        // not want to enter...
        return item;
      }
      return v != null ? v : '';

    }

    return String(findValue(item, columnDef));
  }

}(jQuery));
