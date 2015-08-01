'use strict';

var DEV = false;

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
   * TODO
   */
  function StructuredDataView() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    /** master data */
    var _items;

    var _rows;

    function getLength() {
      return _rows.length;
    }
    function getItem(i) {
      return _rows[i];
    }
    function getItemMetadata() /* i */{
      return null;
    }

    function setItems(items) {
      _items = items;

      _rows = _genRows(items);
      if (DEV) console.log('RESULT:', JSON.stringify(_rows));
      if (DEV) console.log('============================');
    }

    function getItems() {
      return _items;
    }

    function _genRows(item) {
      var isObjInObj = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
      var acc = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

      if (DEV) console.log('called:', item);
      var i, len;
      if ($.isArray(item)) {
        for (i = 0, len = item.length; i < len; i++) {
          _genRows(item[i], false, acc);
        }
      } else {
        var hasArray = false; // Preserve not boolean but string of Array property name
        if (!isObjInObj) {
          if (DEV) console.log('push:', JSON.stringify(item) + ' to ' + JSON.stringify(_rows));
          acc.push(item);
        }

        for (i in item) {
          var val = item[i];
          if ($.isArray(val)) {
            if (hasArray) {
              throw new TypeError('Arguments cannot have multiple children at same depth: `' + hasArray + '` and `' + i + '`');
            } else {
              hasArray = i;
            }
          }
          if (typeof val === 'object') _genRows(val, true, acc);
        }
      }
      return acc;
    }

    $.extend(this, {
      // data provider methods
      getLength: getLength,
      getItem: getItem,
      getItemMetadata: getItemMetadata,

      // methods
      setItems: setItems,
      getItems: getItems

      // events
    });
  }
})(jQuery);