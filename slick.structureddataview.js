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
  function StructuredDataView(options) {
    var _self = this;
    var _items;

    function getLength() {
      return 0;
    }
    function getItem(i) {
      return null;
    }
    function getItemMetadata(i) {
      return null;
    }

    $.extend(this, {
      // methods

      // data provider methods
      'getLength': getLength,
      'getItem': getItem,
      'getItemMetadata': getItemMetadata

      // events
    });
  }

})(jQuery);
