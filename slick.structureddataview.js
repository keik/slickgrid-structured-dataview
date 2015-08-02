const DEV = false;

(function ($) {
  'use strict';

  $.extend(true, window, {
    Slick: {
      Data: {
        StructuredDataView
      }
    }
  });

  // TODO: write
  /**
   * @constructor
   */
  function StructuredDataView (/* options = {} */) {

    /** master data */
    var _items,
        _rows;

    function getLength () {
      return _rows.length;
    }
    function getItem (i) {
      return _rows[i];
    }
    function getItemMetadata (/* i */) {
      return {};
    }

    function setItems (items) {
      _items = items;

      _rows = _genRows(items);
      if (DEV) console.log('RESULT:', JSON.stringify(_rows));
      if (DEV) console.log('============================');
    }

    function getItems () {
      return _items;
    }

    function _genRows (item, acc = [], isObjInObj = false, isFirstChild = false) {
      if (DEV) console.log('called:', item, isObjInObj ? 'isObjInObj' : '', isFirstChild ? 'isFirstChild' : '');
      var i, len;

      if ($.isArray(item)) {
        for (i = 0, len = item.length; i < len; i++) {
          _genRows(item[i], acc, false, i === 0);
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
              _genRows(val, acc, false);
            } else if (typeof val === 'object')
              _genRows(val, acc, true);
          }
        }
      }
      return acc;
    }

    $.extend(this, {
      // data provider methods
      getLength,
      getItem,
      getItemMetadata,

      // methods
      setItems,
      getItems

      // events
    });
  }
}(jQuery));
