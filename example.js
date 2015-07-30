var grid;
var dataView;

(function () {

  var options = {
    editable: true,
    enableColumnReorder: false
  };

  var columns = window.columns = [
    {id: 'id', name: 'id', field: 'id'},
    {id: 'col1', name: 'col1', field: 'col1'},
    {id: 'col2', name: 'col2', field: 'col2'},
    {id: 'col2-1', name: 'col2-1', field: 'col2-1'},
    {id: 'col2-2', name: 'col2-2', field: 'col2-2'},
    {id: 'col3', name: 'col3', field: 'col3'},
    {id: 'col3-1', name: 'col3-1', field: 'col3-1'},
    {id: 'col3-2', name: 'col3-2', field: 'col3-2'},
    {id: 'col3-2-1', name: 'col3-2-1', field: 'col3-2-1'},
    {id: 'col3-2-2', name: 'col3-2-2', field: 'col3-2-2'}
  ];

  var data = window.data = [];

  for (var i = 0; i < 1000; i++) {
    data.push(
      {
        id: 'id-' + i,
        'col1': 'col1 (' + i + ')',
        'col2': [
          {'col2-1': 'col2-1 (' + i + ')'},
          {'col2-2': 'col2-2 (' + i + ')'}],
        'col3': {'col3-1': 'col3-1 (' + i + ')',
                 'col3-2': [
                   {'col3-2-1': 'col3-2-1 (' + i + ')'},
                   {'col3-2-2': 'col3-2-2 (' + i + ')'}]}});
  }

  $(function () {

    dataView = new Slick.Data.StructuredDataView();
    dataView.setItems(data);
    grid = new Slick.Grid('#myGrid', dataView, columns, options);
  });


}());
