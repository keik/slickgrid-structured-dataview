assert = chai.assert;

var dataView;

describe('slick-structured-dataview', function () {

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
        {id: '1', children: [{id: '1-1', children: [{id: '1-1-1'}]}]},
        {id: '2', children: [{id: '2-1'}]}];
      assert.doesNotThrow(function () {
        dataView.setItems(items);
      }, TypeError);
    });
    it('should set structured Items 2', function () {
      var items = [
        {id: '1', children: [{id: '1-1', data: {name: '1-1 content', children: [{id: '1-1-1'},
                                                                                {id: '1-1-2'}]}}]},
        {id: '2', children: [{id: 2-1}]}];
      assert.doesNotThrow(function () {
        dataView.setItems(items);
      }, TypeError);
    });
    it('should not set structured Object which has multiple children at same depth', function () {
      var items = [
        {id: '1', name: 'name1', children: [{id: '1-1 (1)'},
                                            {id: '1-2 (1)'}],
         children2: [{id: '1-1 (2)'}, // Bad structure
                     {id: '1-2 (2)'},
                     {id: '1-3 (2)'}]}
      ];
      assert.throws(function () {
        dataView.setItems(items);
      }, TypeError);
    });

  });

  describe('getItem', function () {
    it('should return properly value 1', function () {
      var items = [
        {id: '1'}
      ];
      dataView.setItems(items);
      assert.equal(dataView.getLength(), 1);
      assert.equal(dataView.getItem(0), items[0]);
    });
    it('should return properly value 2', function () {
      var items = [
        {id: '1'},
        {id: '2'}
      ];
      dataView.setItems(items);
      assert.equal(dataView.getLength(), 2);
      assert.equal(dataView.getItem(0), items[0]);
      assert.equal(dataView.getItem(1), items[1]);
    });
    it('should return properly value 3', function () {
      var items = [
        {id: '1', children: [{id: '1-1'}]}
      ];
      dataView.setItems(items);
      assert.equal(dataView.getLength(), 1);
      assert.equal(dataView.getItem(0), items[0]);
    });
    it('should return properly value 4', function () {
      var items = [
        {id: '1', children: [{id: '1-1'},
                             {id: '1-2'}]}
      ];
      dataView.setItems(items);
      assert.equal(dataView.getLength(), 2);
      assert.equal(dataView.getItem(0), items[0]);
      assert.equal(dataView.getItem(1), items[0].children[1]);
    });
    it('should return properly value 5', function () {
      var items = [
        {id: '1', children: [{id: '1-1'},
                             {id: '1-2'}]},
        {id: '2', children: [{id: '2-1'},
                             {id: '2-2'}]}
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
        {id: '1', children: [{id: '1-1', children: [{id: '1-1-1'}]},
                             {id: '1-2'}]},
        {id: '2', children: [{id: '2-1'},
                             {id: '2-2'}]}
      ];
      dataView.setItems(items);
      assert.equal(dataView.getLength(), 4);
      assert.equal(dataView.getItem(0), items[0]);
      assert.equal(dataView.getItem(1), items[0].children[1]);
      assert.equal(dataView.getItem(2), items[1]);
      assert.equal(dataView.getItem(3), items[1].children[1]);
    });
    it('should return properly value 7', function () {
      var items = [
        {id: '1', data: {msg: 'this is 1-1'}}
      ];
      dataView.setItems(items);
      assert.equal(dataView.getLength(), 1);
      assert.equal(dataView.getItem(0), items[0]);
    });
    it('should return properly value 8', function () {
      var items = [
        {id: '1', data: {msg: 'this is 1-1', children: [{id: '1-1'},
                                                        {id: '1-2'}]}}
      ];
      dataView.setItems(items);
      assert.equal(dataView.getLength(), 2);
      assert.equal(dataView.getItem(0), items[0]);
      assert.equal(dataView.getItem(1), items[0].data.children[1]);
    });
    it('should return properly value 9', function () {
      var items = [
        {id: '1', children: [{id: '1-1', data: {msg: 'this is 1-1', children:[{id: '1-1-1'},
                                                                              {id: '1-1-2'}]}},
                             {id: '1-2'}]}
      ];
      dataView.setItems(items);
      assert.equal(dataView.getLength(), 3);
      assert.equal(dataView.getItem(0), items[0]);
      assert.equal(dataView.getItem(1), items[0].children[0].data.children[1]);
      assert.equal(dataView.getItem(2), items[0].children[1]);
    });
    it('should return properly value 10', function () {
      var items = [
        {id: '1', children: [{id: '1-1', data: {msg: 'this is 1-1'}},
                             {id: '1-2', data: {msg: 'this is 1-2'}}]},
        {id: '2', children: [{id: '2-1', data: {msg: 'this is 2-1', children:[{id: '2-1-1'},
                                                                              {id: '2-1-2'}]}},
                             {id: '2-2'}]}
      ];
      dataView.setItems(items);
      assert.equal(dataView.getLength(), 5);
      assert.equal(dataView.getItem(0), items[0]);
      assert.equal(dataView.getItem(1), items[0].children[1]);
      assert.equal(dataView.getItem(2), items[1]);
      assert.equal(dataView.getItem(3), items[1].children[0].data.children[1]);
      assert.equal(dataView.getItem(4), items[1].children[1]);
    });
  });
});
