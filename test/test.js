/* global chai describe it beforeEach afterEach Slick */
/* eslint "no-spaced-func": [0], no-multi-spaces: [0] */
var assert = chai.assert;

var dataView;

describe('slick-structured-dataview', function () {
  'use strict';

  beforeEach(function () {
    dataView = new Slick.Data.StructuredDataView();
  });
  afterEach(function () {
    dataView = null;
  });

  describe('setItems', function () {
    it('should set any Items', function () {
      assert.doesNotThrow(function () {
        dataView.setItems([]);
        dataView.setItems({});
        dataView.setItems(1);
        dataView.setItems('string');
      }, TypeError);
    });
    it('should set structured Items 1', function () {
      var items = [
        {col1: '1', children: [{col2: '1-1', children: [{col3: '1-1-1'}]}]},
        {col1: '2', children: [{col2: '2-1'}]}];

      assert.doesNotThrow(function () {
        dataView.setItems(items);
      }, TypeError);
    });
    it('should set structured Items 2', function () {
      var items = [
        {col1: '1', children: [{col2: '1-1', data: {name: '1-1 content', children: [{col3: '1-1-1'},
                                                                                    {col3: '1-1-2'}]}}]},
        {col1: '2', children: [{col2: '2-1'}]}];

      assert.doesNotThrow(function () {
        dataView.setItems(items);
      }, TypeError);
    });
    it('should not set structured Object which has multiple children at same depth', function () {
      var items = [
        {col1: '1', name: 'name1', children: [{col2: '1-1 (1)'},
                                              {col2: '1-2 (1)'}],
         children2: [{colx: '1-1 (2)'}, // Bad structure
                     {colx: '1-2 (2)'},
                     {colx: '1-3 (2)'}]}];

      assert.throws(function () {
        dataView.setItems(items);
      }, TypeError);
    });
  });

  describe('getItem(i)', function () {
    it('should return properly value 1', function () {
      var items = [
        {col1: '1'}];

      dataView.setItems(items);
      assert.equal(dataView.getLength(), 1);
      assert.equal(dataView.getItem(0), items[0]);
    });
    it('should return properly value 2', function () {
      var items = [
        {col1: '1'},
        {col1: '2'}];

      dataView.setItems(items);
      assert.equal(dataView.getLength(), 2);
      assert.equal(dataView.getItem(0), items[0]);
      assert.equal(dataView.getItem(1), items[1]);
    });
    it('should return properly value 3', function () {
      var items = [
        {col1: '1', children: [{col2: '1-1'}]}];

      dataView.setItems(items);
      assert.equal(dataView.getLength(), 1);
      assert.equal(dataView.getItem(0), items[0]);
    });
    it('should return properly value 4', function () {
      var items = [
        {col1: '1', children: [{col2: '1-1'},
                               {col2: '1-2'}]}];

      dataView.setItems(items);
      assert.equal(dataView.getLength(), 2);
      assert.equal(dataView.getItem(0), items[0]);
      assert.equal(dataView.getItem(1), items[0].children[1]);
    });
    it('should return properly value 5', function () {
      var items = [
        {col1: '1', children: [{col2: '1-1'},
                               {col2: '1-2'}]},
        {col1: '2', children: [{col2: '2-1'},
                               {col2: '2-2'}]}
      ];

      dataView.setItems(items);
      assert.equal(dataView.getLength(), 4);
      assert.equal(dataView.getItem(0), items[0]);
      assert.equal(dataView.getItem(1), items[0].children[1]);
      assert.equal(dataView.getItem(2), items[1]);
      assert.equal(dataView.getItem(3), items[1].children[1]);
    });
    it('should return properly value 6', function () {
      var items = [
        {col1: '1', children: [{col2: '1-1', children: [{col3: '1-1-1'}]},
                               {col2: '1-2'}]},
        {col1: '2', children: [{col2: '2-1'},
                               {col2: '2-2'}]}];

      dataView.setItems(items);
      assert.equal(dataView.getLength(), 4);
      assert.equal(dataView.getItem(0), items[0]);
      assert.equal(dataView.getItem(1), items[0].children[1]);
      assert.equal(dataView.getItem(2), items[1]);
      assert.equal(dataView.getItem(3), items[1].children[1]);
    });
    it('should return properly value 7', function () {
      var items = [
        {col1: '1', data: {col2: 'this is 1-1'}}];

      dataView.setItems(items);
      assert.equal(dataView.getLength(), 1);
      assert.equal(dataView.getItem(0), items[0]);
    });
    it('should return properly value 8', function () {
      var items = [
        {col1: '1', data: {col2: 'this is 1-1', children: [{col3: '1-1'},
                                                           {col3: '1-2'}]}}];

      dataView.setItems(items);
      assert.equal(dataView.getLength(), 2);
      assert.equal(dataView.getItem(0), items[0]);
      assert.equal(dataView.getItem(1), items[0].data.children[1]);
    });
    it('should return properly value 9', function () {
      var items = [
        {col1: '1', children: [{col2: '1-1', data: {col3: 'this is 1-1', children: [{col4: '1-1-1'},
                                                                                    {col4: '1-1-2'}]}},
                               {col2: '1-2'}]}];

      dataView.setItems(items);
      assert.equal(dataView.getLength(), 3);
      assert.equal(dataView.getItem(0), items[0]);
      assert.equal(dataView.getItem(1), items[0].children[0].data.children[1]);
      assert.equal(dataView.getItem(2), items[0].children[1]);
    });
    it('should return properly value 10', function () {
      var items = [
        {col1: '1', children: [{col2: '1-1', data: {col3: 'this is 1-1'}},
                               {col2: '1-2', data: {col3: 'this is 1-2'}}]},
        {col1: '2', children: [{col2: '2-1', data: {col3: 'this is 2-1', children: [{col4: '2-1-1'},
                                                                                    {col4: '2-1-2'}]}},
                               {col2: '2-2'}]}];

      dataView.setItems(items);
      assert.equal(dataView.getLength(), 5);
      assert.equal(dataView.getItem(0), items[0]);
      assert.equal(dataView.getItem(1), items[0].children[1]);
      assert.equal(dataView.getItem(2), items[1]);
      assert.equal(dataView.getItem(3), items[1].children[0].data.children[1]);
      assert.equal(dataView.getItem(4), items[1].children[1]);
    });
  });
  describe('getItem(i, colId)', function () {
    it('should return properly value 1', function () {
      var items = [
        {col1: '1'}];

      dataView.setItems(items);
      assert.equal(dataView.getLength(), 1);
      assert.equal(dataView.getItem(0, 'col1'), items[0]);
      assert.equal(dataView.getItem(0, 'x'), null);
      assert.equal(dataView.getItem(1, 'col1'), null);
    });
    it('should return properly value 2', function () {
      var items = [
        {col1: '1'},
        {col1: '2'}];

      dataView.setItems(items);
      assert.equal(dataView.getLength(), 2);
      assert.equal(dataView.getItem(0, 'col1'), items[0]);
      assert.equal(dataView.getItem(0, 'x'), null);
      assert.equal(dataView.getItem(1, 'col1'), items[1]);
      assert.equal(dataView.getItem(1, 'x'), null);
      assert.equal(dataView.getItem(2, 'col1'), null);
    });
    it('should return properly value 3', function () {
      var items = [
        {col1: '1', children: [{col2: '1-1'}]}];

      dataView.setItems(items);
      assert.equal(dataView.getLength(), 1);
      assert.equal(dataView.getItem(0, 'col1'), items[0]);
      assert.equal(dataView.getItem(0, 'col2'), items[0].children[0]);
      assert.equal(dataView.getItem(0, 'x'), null);
      assert.equal(dataView.getItem(1, 'col1'), null);
    });
    it('should return properly value 4', function () {
      var items = [
        {col1: '1', children: [{col2: '1-1'},
                               {col2: '1-2'}]}];

      dataView.setItems(items);
      assert.equal(dataView.getLength(), 2);
      assert.equal(dataView.getItem(0, 'col1'), items[0]);
      assert.equal(dataView.getItem(0, 'col2'), items[0].children[0]);
      assert.equal(dataView.getItem(0, 'x'), null);
      assert.equal(dataView.getItem(1, 'col2'), items[0].children[1]);
      assert.equal(dataView.getItem(1, 'x'), null);
      assert.equal(dataView.getItem(2, 'col1'), null);
    });
    it('should return properly value 5', function () {
      var items = [
        {col1: '1', children: [{col2: '1-1'},
                               {col2: '1-2'}]},
        {col1: '2', children: [{col2: '2-1'},
                               {col2: '2-2'}]}
      ];

      dataView.setItems(items);
      assert.equal(dataView.getLength(), 4);
      assert.equal(dataView.getItem(0, 'col1'), items[0]);
      assert.equal(dataView.getItem(0, 'col2'), items[0].children[0]);
      assert.equal(dataView.getItem(0, 'x'), null);
      assert.equal(dataView.getItem(1, 'col2'), items[0].children[1]);
      assert.equal(dataView.getItem(1, 'x'), null);
      assert.equal(dataView.getItem(2, 'col1'), items[1]);
      assert.equal(dataView.getItem(2, 'col2'), items[1].children[0]);
      assert.equal(dataView.getItem(2, 'x'), null);
      assert.equal(dataView.getItem(3, 'col2'), items[1].children[1]);
      assert.equal(dataView.getItem(3, 'x'), null);
      assert.equal(dataView.getItem(4, 'col1'), null);
    });
    it('should return properly value 6', function () {
      var items = [
        {col1: '1', children: [{col2: '1-1', children: [{col3: '1-1-1'}]},
                               {col2: '1-2'}]},
        {col1: '2', children: [{col2: '2-1'},
                               {col2: '2-2'}]}];

      dataView.setItems(items);
      assert.equal(dataView.getLength(), 4);
      assert.equal(dataView.getItem(0, 'col1'), items[0]);
      assert.equal(dataView.getItem(0, 'col2'), items[0].children[0]);
      assert.equal(dataView.getItem(0, 'col3'), items[0].children[0].children[0]);
      assert.equal(dataView.getItem(0, 'x'), null);
      assert.equal(dataView.getItem(1, 'col2'), items[0].children[1]);
      assert.equal(dataView.getItem(1, 'x'), null);
      assert.equal(dataView.getItem(2, 'col1'), items[1]);
      assert.equal(dataView.getItem(2, 'col2'), items[1].children[0]);
      assert.equal(dataView.getItem(2, 'x'), null);
      assert.equal(dataView.getItem(3, 'col2'), items[1].children[1]);
      assert.equal(dataView.getItem(3, 'x'), null);
    });
    it('should return properly value 7', function () {
      var items = [
        {col1: '1', data: {col2: 'this is 1-1'}}];

      dataView.setItems(items);
      assert.equal(dataView.getLength(), 1);
      assert.equal(dataView.getItem(0, 'col1'), items[0]);
      assert.equal(dataView.getItem(0, 'col2'), items[0].data);
      assert.equal(dataView.getItem(0, 'x'), null);
    });
    it('should return properly value 8', function () {
      var items = [
        {col1: '1', data: {col2: 'this is 1-1', children: [{col3: '1-1'},
                                                           {col3: '1-2'}]}}];

      dataView.setItems(items);
      assert.equal(dataView.getLength(), 2);
      assert.equal(dataView.getItem(0, 'col1'), items[0]);
      assert.equal(dataView.getItem(0, 'col2'), items[0].data);
      assert.equal(dataView.getItem(0, 'col3'), items[0].data.children[0]);
      assert.equal(dataView.getItem(0, 'x'), null);
      assert.equal(dataView.getItem(1, 'col3'), items[0].data.children[1]);
      assert.equal(dataView.getItem(1, 'x'), null);
    });
    it('should return properly value 9', function () {
      var items = [
        {col1: '1', children: [{col2: '1-1', data: {col3: 'this is 1-1', children: [{col4: '1-1-1'},
                                                                                    {col4: '1-1-2'}]}},
                               {col2: '1-2'}]}];

      dataView.setItems(items);
      assert.equal(dataView.getLength(), 3);
      assert.equal(dataView.getItem(0, 'col1'), items[0]);
      assert.equal(dataView.getItem(0, 'col2'), items[0].children[0]);
      assert.equal(dataView.getItem(0, 'col3'), items[0].children[0].data);
      assert.equal(dataView.getItem(0, 'col4'), items[0].children[0].data.children[0]);
      assert.equal(dataView.getItem(0, 'x'), null);
      assert.equal(dataView.getItem(1, 'col4'), items[0].children[0].data.children[1]);
      assert.equal(dataView.getItem(1, 'x'), null);
    });
    it('should return properly value 10', function () {
      var items = [
        {col1: '1', children: [{col2: '1-1', data: {col3: 'this is 1-1'}},
                               {col2: '1-2', data: {col3: 'this is 1-2'}}]},
        {col1: '2', children: [{col2: '2-1', data: {col3: 'this is 2-1', children: [{col4: '2-1-1'},
                                                                                    {col4: '2-1-2'}]}},
                               {col2: '2-2'}]}];

      dataView.setItems(items);
      assert.equal(dataView.getLength(), 5);
      assert.equal(dataView.getItem(0, 'col1'), items[0]);
      assert.equal(dataView.getItem(0, 'col2'), items[0].children[0]);
      assert.equal(dataView.getItem(0, 'col3'), items[0].children[0].data);
      assert.equal(dataView.getItem(0, 'x'), null);
      assert.equal(dataView.getItem(1, 'col2'), items[0].children[1]);
      assert.equal(dataView.getItem(1, 'col3'), items[0].children[1].data);
      assert.equal(dataView.getItem(1, 'x'), null);
      assert.equal(dataView.getItem(2, 'col1'), items[1]);
      assert.equal(dataView.getItem(2, 'col2'), items[1].children[0]);
      assert.equal(dataView.getItem(2, 'col3'), items[1].children[0].data);
      assert.equal(dataView.getItem(2, 'col4'), items[1].children[0].data.children[0]);
      assert.equal(dataView.getItem(2, 'x'), null);
      assert.equal(dataView.getItem(3, 'col4'), items[1].children[0].data.children[1]);
      assert.equal(dataView.getItem(3, 'x'), null);
      assert.equal(dataView.getItem(4, 'col2'), items[1].children[1]);
      assert.equal(dataView.getItem(4, 'x'), null);
    });
  });

  describe('insertRow', function () {
    it('should insert a new item properly 1', function () {
      var items = [
        {col1: '1', children: [{col2: '1-1', data: {col3: 'this is 1-1'}},
                               {col2: '1-2', data: {col3: 'this is 1-2'}}]},
        {col1: '2', children: [{col2: '2-1', data: {col3: 'this is 2-1', children: [{col4: '2-1-1'},
                                                                                    {col4: '2-1-2'}]}},
                               {col2: '2-2'}]}];

      var expected = [
        {"col1":"1","children":[{"col2":"","data":{"col3":""}},
                                {"col2":"1-1","data":{"col3":"this is 1-1"}},
                                {"col2":"1-2","data":{"col3":"this is 1-2"}}]},
        {"col1":"2","children":[{"col2":"2-1","data":{"col3":"this is 2-1","children":[{"col4":"2-1-1"},
                                                                                       {"col4":"2-1-2"}]}},
                                {"col2":"2-2"}]}];

      dataView.setItems(items);
      dataView.insertRow(0, 'col2');
      assert.equal(JSON.stringify(dataView.getItems()), JSON.stringify(expected));
    });
    it('should insert a new item properly 2', function () {
      var items = [
        {col1: '1', children: [{col2: '1-1', data: {col3: 'this is 1-1'}},
                               {col2: '1-2', data: {col3: 'this is 1-2'}}]},
        {col1: '2', children: [{col2: '2-1', data: {col3: 'this is 2-1', children: [{col4: '2-1-1'},
                                                                                    {col4: '2-1-2'}]}},
                               {col2: '2-2'}]}];

      var expected = [
        {"col1":"1","children":[{"col2":"1-1","data":{"col3":"this is 1-1"}},
                                {"col2":"","data":{"col3":""}},
                                {"col2":"1-2","data":{"col3":"this is 1-2"}}]},
        {"col1":"2","children":[{"col2":"2-1","data":{"col3":"this is 2-1","children":[{"col4":"2-1-1"},
                                                                                       {"col4":"2-1-2"}]}},
                                {"col2":"2-2"}]}];

      dataView.setItems(items);
      dataView.insertRow(1, 'col2');
      assert.equal(JSON.stringify(dataView.getItems()), JSON.stringify(expected));
    });
    it('should insert a new item properly 3', function () {
      var items = [
        {col1: '1', children: [{col2: '1-1', data: {col3: 'this is 1-1'}},
                               {col2: '1-2', data: {col3: 'this is 1-2'}}]},
        {col1: '2', children: [{col2: '2-1', data: {col3: 'this is 2-1', children: [{col4: '2-1-1'},
                                                                                    {col4: '2-1-2'}]}},
                               {col2: '2-2'}]}];

      var expected = [
        {"col1":"1","children":[{"col2":"1-1","data":{"col3":"this is 1-1"}},
                                {"col2":"1-2","data":{"col3":"this is 1-2"}}]},
        {"col1":"2","children":[{"col2":"2-1","data":{"col3":"this is 2-1","children":[{"col4":""},
                                                                                       {"col4":"2-1-1"},
                                                                                       {"col4":"2-1-2"}]}},
                                {"col2":"2-2"}]}];

      dataView.setItems(items);
      dataView.insertRow(2, 'col4');
      assert.equal(JSON.stringify(dataView.getItems()), JSON.stringify(expected));
    });
    it('should insert a new item properly 4', function () {
      var items = [
        {col1: '1', children: [{col2: '1-1', data: {col3: 'this is 1-1'}},
                               {col2: '1-2', data: {col3: 'this is 1-2'}}]},
        {col1: '2', children: [{col2: '2-1', data: {col3: 'this is 2-1', children: [{col4: '2-1-1'},
                                                                                    {col4: '2-1-2'}]}},
                               {col2: '2-2'}]}];

      var expected = [
        {"col1":"1","children":[{"col2":"1-1","data":{"col3":"this is 1-1"}},
                                {"col2":"1-2","data":{"col3":"this is 1-2"}}]},
        {"col1":"2","children":[{"col2":"","data":{"col3":"","children":[{"col4":""},
                                                                         {"col4":""}]}},
                                {"col2":"2-1","data":{"col3":"this is 2-1","children":[{"col4":"2-1-1"},
                                                                                       {"col4":"2-1-2"}]}},
                                {"col2":"2-2"}]}];

      dataView.setItems(items);
      dataView.insertRow(2, 'col3');
      assert.equal(JSON.stringify(dataView.getItems()), JSON.stringify(expected));
    });
    it('should insert a new item properly 5', function () {
      var items = [
        {col1: '1', children: [{col2: '1-1', data: {col3: 'this is 1-1'}},
                               {col2: '1-2', data: {col3: 'this is 1-2'}}]},
        {col1: '2', children: [{col2: '2-1', data: {col3: 'this is 2-1', children: [{col4: '2-1-1'},
                                                                                    {col4: '2-1-2'}]}},
                               {col2: '2-2'}]}];

      var expected = [
        {"col1":"","children":[{"col2":"","data":{"col3":""}},
                               {"col2":"","data":{"col3":""}}]},
        {"col1":"1","children":[{"col2":"1-1","data":{"col3":"this is 1-1"}},
                                {"col2":"1-2","data":{"col3":"this is 1-2"}}]},
        {"col1":"2","children":[{"col2":"2-1","data":{"col3":"this is 2-1","children":[{"col4":"2-1-1"},
                                                                                       {"col4":"2-1-2"}]}},
                                {"col2":"2-2"}]}];

      dataView.setItems(items);
      dataView.insertRow(0, 'col1');
      assert.equal(JSON.stringify(dataView.getItems()), JSON.stringify(expected));
    });
  });

  describe('appendRow', function () {
    it('should insert a new item properly 1', function () {
      var items = [
        {col1: '1', children: [{col2: '1-1', data: {col3: 'this is 1-1'}},
                               {col2: '1-2', data: {col3: 'this is 1-2'}}]},
        {col1: '2', children: [{col2: '2-1', data: {col3: 'this is 2-1', children: [{col4: '2-1-1'},
                                                                                    {col4: '2-1-2'}]}},
                               {col2: '2-2'}]}];

      var expected = [
        {"col1":"1","children":[{"col2":"1-1","data":{"col3":"this is 1-1"}},
                                {"col2":"","data":{"col3":""}},
                                {"col2":"1-2","data":{"col3":"this is 1-2"}}]},
        {"col1":"2","children":[{"col2":"2-1","data":{"col3":"this is 2-1","children":[{"col4":"2-1-1"},
                                                                                       {"col4":"2-1-2"}]}},
                                {"col2":"2-2"}]}];

      dataView.setItems(items);
      dataView.appendRow(0, 'col2');
      assert.equal(JSON.stringify(dataView.getItems()), JSON.stringify(expected));
    });
    it('should insert a new item properly 2', function () {
      var items = [
        {col1: '1', children: [{col2: '1-1', data: {col3: 'this is 1-1'}},
                               {col2: '1-2', data: {col3: 'this is 1-2'}}]},
        {col1: '2', children: [{col2: '2-1', data: {col3: 'this is 2-1', children: [{col4: '2-1-1'},
                                                                                    {col4: '2-1-2'}]}},
                               {col2: '2-2'}]}];

      var expected = [
        {"col1":"1","children":[{"col2":"1-1","data":{"col3":"this is 1-1"}},
                                {"col2":"1-2","data":{"col3":"this is 1-2"}},
                                {"col2":"","data":{"col3":""}}]},
        {"col1":"2","children":[{"col2":"2-1","data":{"col3":"this is 2-1","children":[{"col4":"2-1-1"},
                                                                                       {"col4":"2-1-2"}]}},
                                {"col2":"2-2"}]}];

      dataView.setItems(items);
      dataView.appendRow(1, 'col2');
      assert.equal(JSON.stringify(dataView.getItems()), JSON.stringify(expected));
    });
    it('should insert a new item properly 3', function () {
      var items = [
        {col1: '1', children: [{col2: '1-1', data: {col3: 'this is 1-1'}},
                               {col2: '1-2', data: {col3: 'this is 1-2'}}]},
        {col1: '2', children: [{col2: '2-1', data: {col3: 'this is 2-1', children: [{col4: '2-1-1'},
                                                                                    {col4: '2-1-2'}]}},
                               {col2: '2-2'}]}];

      var expected = [
        {"col1":"1","children":[{"col2":"1-1","data":{"col3":"this is 1-1"}},
                                {"col2":"1-2","data":{"col3":"this is 1-2"}}]},
        {"col1":"2","children":[{"col2":"2-1","data":{"col3":"this is 2-1","children":[{"col4":"2-1-1"},
                                                                                       {"col4":""},
                                                                                       {"col4":"2-1-2"}]}},
                                {"col2":"2-2"}]}];

      dataView.setItems(items);
      dataView.appendRow(2, 'col4');
      assert.equal(JSON.stringify(dataView.getItems()), JSON.stringify(expected));
    });
    it('should insert a new item properly 4', function () {
      var items = [
        {col1: '1', children: [{col2: '1-1', data: {col3: 'this is 1-1'}},
                               {col2: '1-2', data: {col3: 'this is 1-2'}}]},
        {col1: '2', children: [{col2: '2-1', data: {col3: 'this is 2-1', children: [{col4: '2-1-1'},
                                                                                    {col4: '2-1-2'}]}},
                               {col2: '2-2'}]}];


      var expected = [
        {"col1":"1","children":[{"col2":"1-1","data":{"col3":"this is 1-1"}},
                                {"col2":"1-2","data":{"col3":"this is 1-2"}}]},
        {"col1":"2","children":[{"col2":"2-1","data":{"col3":"this is 2-1","children":[{"col4":"2-1-1"},
                                                                                       {"col4":"2-1-2"}]}},
                                {"col2":"","data":{"col3":"","children":[{"col4":""},
                                                                         {"col4":""}]}},
                                {"col2":"2-2"}]}];

      dataView.setItems(items);
      dataView.appendRow(2, 'col3');
      assert.equal(JSON.stringify(dataView.getItems()), JSON.stringify(expected));
    });
    it('should insert a new item properly 5', function () {
      var items = [
        {col1: '1', children: [{col2: '1-1', data: {col3: 'this is 1-1'}},
                               {col2: '1-2', data: {col3: 'this is 1-2'}}]},
        {col1: '2', children: [{col2: '2-1', data: {col3: 'this is 2-1', children: [{col4: '2-1-1'},
                                                                                    {col4: '2-1-2'}]}},
                               {col2: '2-2'}]}];

      var expected = [
        {"col1":"1","children":[{"col2":"1-1","data":{"col3":"this is 1-1"}},
                                {"col2":"1-2","data":{"col3":"this is 1-2"}}]},
        {"col1":"","children":[{"col2":"","data":{"col3":""}},
                               {"col2":"","data":{"col3":""}}]},
        {"col1":"2","children":[{"col2":"2-1","data":{"col3":"this is 2-1","children":[{"col4":"2-1-1"},
                                                                                       {"col4":"2-1-2"}]}},
                                {"col2":"2-2"}]}];

      dataView.setItems(items);
      dataView.appendRow(0, 'col1');
      assert.equal(JSON.stringify(dataView.getItems()), JSON.stringify(expected));
    });
  });

  // TODO pass
  // describe('getParentItem(i, colId)', function () {
  //   it('should return properly value 1', function () {
  //     var items = [
  //       {col1: '1'}];
  //
  //     dataView.setItems(items);
  //     assert.equal(dataView.getLength(), 1);
  //     assert.equal(dataView.getParentArray(0, 'x'), null);
  //     assert.equal(dataView.getParentArray(0, 'col1'), items);
  //   });
  //   it('should return properly value 2', function () {
  //     var items = [
  //       {col1: '1'},
  //       {col1: '2'}];
  //
  //     dataView.setItems(items);
  //     assert.equal(dataView.getLength(), 2);
  //     assert.equal(dataView.getParentArray(0, 'x'), null);
  //     assert.equal(dataView.getParentArray(0, 'col1'), items);
  //     assert.equal(dataView.getParentArray(1, 'x'), null);
  //     assert.equal(dataView.getParentArray(1, 'col1'), items);
  //   });
  //   it('should return properly value 3', function () {
  //     var items = [
  //       {col1: '1', children: [{col2: '1-1'}]}];
  //
  //     dataView.setItems(items);
  //     assert.equal(dataView.getLength(), 1);
  //     assert.equal(dataView.getParentArray(0, 'col2'), items[0].children);
  //   });
  //   it('should return properly value 4', function () {
  //     var items = [
  //       {col1: '1', children: [{col2: '1-1'},
  //                              {col2: '1-2'}]}];
  //
  //     dataView.setItems(items);
  //     assert.equal(dataView.getLength(), 2);
  //     assert.equal(dataView.getParentArray(0, 'x'), null);
  //     assert.notEqual(dataView.getParentArray(0, 'col1'), items[0].children);
  //     assert.equal   (dataView.getParentArray(0, 'col2'), items[0].children);
  //     assert.notEqual(dataView.getParentArray(1, 'col1'), items[0].children);
  //     assert.equal   (dataView.getParentArray(1, 'col2'), items[0].children);
  //   });
  //   it('should return properly value 5', function () {
  //     var items = [
  //       {col1: '1', children: [{col2: '1-1'},
  //                              {col2: '1-2'}]},
  //       {col1: '2', children: [{col2: '2-1'},
  //                              {col2: '2-2'}]}
  //     ];
  //     console.log('=============================================')
  //     dataView.setItems(items);
  //     //assert.equal(dataView.getLength(), 4);
  //     //assert.equal(dataView.getParentArray(0, 'col1'), items);
  //     //assert.equal(dataView.getParentArray(0, 'col2'), items[0].children);
  //     //assert.equal(dataView.getParentArray(1, 'col1'), null);
  //     //assert.equal(dataView.getParentArray(1, 'col2'), items[0].children);
  //     assert.equal(dataView.getParentArray(2, 'col1'), items);
  //     //assert.equal(dataView.getParentArray(2, 'col2'), items[0].children);
  //     //assert.equal(dataView.getParentArray(3, 'col1'), null);
  //     //assert.equal(dataView.getParentArray(3, 'col2'), items[0].children);
  //   });
  //   it('should return properly value 6', function () {
  //     var items = [
  //       {col1: '1', children: [{col2: '1-1', children: [{col3: '1-1-1'}]},
  //                              {col2: '1-2'}]},
  //       {col1: '2', children: [{col2: '2-1'},
  //                              {col2: '2-2'}]}];
  //
  //     dataView.setItems(items);
  //     assert.equal(dataView.getLength(), 4);
  //     assert.equal(dataView.getParentArray(0), items[0]);
  //     assert.equal(dataView.getParentArray(1), items[0].children[1]);
  //     assert.equal(dataView.getParentArray(2), items[1]);
  //     assert.equal(dataView.getParentArray(3), items[1].children[1]);
  //   });
  // });
});
