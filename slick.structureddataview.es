/**
 * http://github.com/keik/slick-structured-dataview
 * @license MIT
 */

/* globals Slick, jsoon */

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
    let _items = [],
        _$$items;

    /** internal rows data */
    let _rows = [];

    let onRowsChanged = new Slick.Event();

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
        let item = (typeof i === 'number' ? getItem(i) : i),
            v = item && item[colId];

        if (v == null) {
          for (let key in item) {
            if (item.hasOwnProperty(key)) {
              let nested = item[key];
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

    /**
     * Return value of cell pointed at `i` and `colId`.
     * When specified positions are out of range, return `null`
     * @public
     * @param {Number|Object} i row index or row item
     * @param {String} columnDef column defination
     * @return {String|Number|null} value
     */
    function getValue (i, columnDef) {
      return getItem(i, columnDef.id) != null ? getItem(i, columnDef.id)[columnDef.field] : '';
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
      _$$items = window._$$items = jsoon(_items);
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

    function insertRow (row, colId) {
      _insert(row, colId, false);
    }

    function appendRow (row, colId) {
      _insert(row, colId, true);
    }

    function _insert (row, colId, isAppend) {
      let $$item = _$$items.find(getItem(row, colId)),
          $$parent = $$item.parent();

      // find parent not array object, that item belongs
      while (!$.isArray($$item.parent()[0])) {
        $$item = $$item.parent();
      }
      let item = $$item[0];

      // find parent and index, to insert new item
      while (!$.isArray($$parent[0])) {
        $$parent = $$parent.parent();
      }
      let parent = $$parent[0];

      function reset (obj) {
        for (let k in obj) {
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
      let newItem = reset(JSON.parse(JSON.stringify(parent[index])));
      parent.splice(index + (isAppend ? 1 : 0), 0, newItem);
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
      let i, len;

      if ($.isArray(item)) {
        let parent = acc.length - 1;

        for (i = 0, len = item.length; i < len; i++) {
          _genRowsFromItems(item[i], acc, false, i === 0, parent);
        }
      } else {
        let hasArray = false; // Preserve not boolean but string of Array property name

        if (acc.length === 0 /* root */ || (!isObjInObj && !isFirstChild)) {
          acc.push(item);
        }

        for (let key in item) {
          if (item.hasOwnProperty(key)) {
            let val = item[key];

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

        let depth = 0;
        _dive(item);

        function _dive (item) {
          let hasArrayOrObj = false;

          if (typeof item !== 'object') return;

          for (let key in item) {
            if (item.hasOwnProperty(key)) {
              let val = item[key];

              if (typeof val === 'object') {
                hasArrayOrObj = true;
                if ($.isArray(val)) {
                  for (let i = 0, len = val.length; i < len; i++) {
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
        let uid = grid.getContainerNode().className.match(/(?: |^)slickgrid_\d+(?!\w)/)[0],
            v = _measureVCellPaddingAndBorder();

        let rules = ['.hidden {visibility: hidden;}'];

        let maxrow = 30; // TODO to be intelligent
        for (let i = 0; i < maxrow; i++) {
          rules.push('.' + uid + ' .h' + i + ' {margin: 0; font-size: inherit; height:' + (i * (v.height + v.heightDiff) - v.heightDiff) + 'px;}');
        }

        let styleEl = $('<style type="text/css" rel="stylesheet" />').appendTo($('head'))[0];
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

        let v = ['borderTopWidth', 'borderBottomWidth', 'paddingTop', 'paddingBottom'],
            $canvas = $(grid.getCanvasNode()),
            $r = $('<div class="slick-row" />').appendTo($canvas),
            $el = $('<div class="slick-cell" id="" style="visibility:hidden">-</div>').appendTo($r);

        let height,
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
      function _genCssHashFromRows () {
        let cssHash = {},
            columns = grid.getColumns();

        for (let i = 0, I = _rows.length; i < I; i++) {
          for (let j = 0, J = columns.length; j < J; j++) {
            cssHash[i] = cssHash[i] || {};
            let columnId = columns[j].id;
            let rowspan = _getRowspan(i, columnId);
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
        let cssHash = _genCssHashFromRows();

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
      getValue,
      setItems,
      getItems,
      insertRow,
      appendRow,
      syncGridCellCssStyles,


      // events
      onRowsChanged
    });

    // `getValue` is useful for `structuredDataExtractor`
    this.constructor.prototype.getValue = getValue;

  } // StructuredDataView

}(jQuery));
