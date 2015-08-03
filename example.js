/* global Slick */
(function () {
  'use strict';

  var grid;
  var dataView;

  $(function () {
    // create StructuredDataView object
    dataView = window.dataView = new Slick.Data.StructuredDataView(grid);

    // set DataView to SlickGrid
    grid = window.grid = new Slick.Grid('#myGrid', dataView, columns, options);

    // apply rowspan styles
    dataView.syncGridCellCssStyles(grid, 'rowspan');

    // event on row count changed
    dataView.onRowCountChanged.subscribe(function () {
      grid.updateRowCount();
      grid.render();
    });

    // event on row changed
    dataView.onRowsChanged.subscribe(function () {
      grid.invalidate();
      grid.render();
    });

    // manipulate data via StructuredDataView
    dataView.setItems(data);
  });

  var options = {
    editable: true,
    enableColumnReorder: false,
    dataItemColumnValueExtractor: Slick.Extractor.structuredDataExtractor
  };

  var columns = window.columns = [

    /* eslint no-multi-spaces:[0] object-curly-spacing:[0] */
    {id: 'col1', name: 'col1', field: 'col1'},
    {id: 'col2', name: 'col2', field: 'col2'},
    {id: 'col3', name: 'col3', field: 'col3'},
    {id: 'col4', name: 'col4', field: 'col4'}
  ];

  var data = window.data = [];
  for (var i = 0; i < 1000; i++) {
    data.push(
      {col1: i, children: [{col2: i + '-1', data: {col3: 'this is ' + i + '-1', children: [{col4: i + '-1-1'},
                                                                                           {col4: i + '-1-2'}]}},
                           {col2: i + '-2', col3: 'this is ' + i + '-2', children: [{col4: i + '-2-1'},
                                                                                   {col4: i + '-2-2'},
                                                                                   {col4: i + '-2-3'}]}]});
  }

}());
