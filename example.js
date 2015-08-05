/* global Slick */
(function () {
  'use strict';

  var grid;
  var dataView;

  $(function () {
    // create StructuredDataView object
    dataView = window.dataView = new Slick.Data.StructuredDataView();

    // set DataView to SlickGrid
    grid = window.grid = new Slick.Grid('#myGrid', dataView, columns, options);
    grid.registerPlugin(new Slick.Plugins.ColGroup());

    // apply rowspan styles
    dataView.syncGridCellCssStyles(grid, 'rowspan');

    // event on row changed
    dataView.onRowsChanged.subscribe(function () {
      grid.invalidate();
    });

    grid.onClick.subscribe(function (e, args) {
      console.log('oncl', args);
    });

    grid.onContextMenu.subscribe(function (e, args, b) {
      console.log('conte', e, args, b);
      e.preventDefault();

      var cell = grid.getCellFromEvent(e);
      grid.gotoCell(cell.row, cell.cell);

      var $menu = $('#context-menu')
            .toggleClass('open', true)
            .data({row: cell.row, cell: cell.cell}) // preserve evented pos
            .css({position: 'absolute', top: e.pageY, left: e.pageX});

      $(document).one('click', function () {
        $menu.toggleClass('open', false);
      });
    });

    // manipulate data via StructuredDataView
    dataView.setItems(data);
    $('#context-menu').on('click', 'a', onClickContextMenu);
  });

  function onClickContextMenu (e) {
    var $menu = $(e.delegateTarget),
        data = $menu.data(),
        row = data.row,
        cell = data.cell;

    switch (this.id) {
    case 'edit-cell':
      grid.editActiveCell();
      break;
    case 'insert-row-above':
      dataView.insertItem(row, cell);
      break;
    case 'insert-row-below':
      dataView.appendItem(row, cell);
      break;
    case 'remove-row':
      break;
    default:
    }
  }

  var options = {
    autoEdit: false,
    editable: true,
    enableColumnReorder: false
  };

  var columns = window.columns = [

    /* eslint no-multi-spaces:[0] object-curly-spacing:[0] */
    {id: 'col1', name: 'col1', field: 'col1', group: 'g1', editor: Slick.Editors.Text},
    {id: 'col2', name: 'col2', field: 'col2', group: 'g1', editor: Slick.Editors.Text},
    {id: 'col3', name: 'col3', field: 'col3', group: 'g2', editor: Slick.Editors.Text},
    {id: 'col4', name: 'col4', field: 'col4', group: 'g2', editor: Slick.Editors.Text}
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
