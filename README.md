# slickgrid-structured-dataview

[SlickGrid](https://github.com/mleibman/SlickGrid) plugin to deal with structured data.

![](https://github.com/keik/slickgrid-structured-dataview/raw/master/screenshots/screenshot.png)


## Usage

Set StructuredDataView to SlickGrid:

```js
// create StructuredDataView object
var dataView = new Slick.Data.StructuredDataView(grid);

// set DataView to SlickGrid
var grid = new Slick.Grid('#myGrid', dataView, columns, options);

// apply rowspan styles
dataView.syncGridCellCssStyles(grid, 'rowspan');
```

Events are fired when data changed so handling them:

```js
// event on row changed
dataView.onRowsChanged.subscribe(function () {
  grid.invalidate();
});
```

And manipulate structured data via StrcturedDataView such like:

```js
// manipulate structured data via StructuredDataView
var data = [
  {col1: '1', children: [{col2: '1-1', col3: 'this is 1-1'},
                         {col2: '1-2', col3: 'this is 1-2'}]},
  {col1: '2', children: [{col2: '2-1', col3: 'this is 2-1', children: [{col4: '2-1-1'},
                                                                       {col4: '2-1-2'}]},
                         {col2: '2-2'}]}];

dataView.setItems(data);
```

## License

MIT (c) keik
