/**
 * http://github.com/keik/slick-structured-dataview
 * @license MIT
 */
"use strict";var DEV=false;(function($){"use strict";$.extend(true,window,{Slick:{Data:{StructuredDataView:StructuredDataView}}});function StructuredDataView(){var _items=[];var _rows=[];var onRowsChanged=new Slick.Event;function getLength(){return _rows.length}function getItem(_x4,_x5){var _again=true;_function:while(_again){var i=_x4,colId=_x5;item=v=key=nested=undefined;_again=false;if(colId!=null){var item=typeof i==="number"?getItem(i):i,v=item&&item[colId];if(v==null){for(var key in item){if(item.hasOwnProperty(key)){var nested=item[key];if(typeof nested==="object"){_x4=nested;_x5=colId;_again=true;continue _function}}}return null}return item}return _rows[i]||null}}function getParent(i,colId){return getItem(5,"col1").children}function getValue(i,colId){return getItem(i,colId)!=null?getItem(i,colId)[colId]:""}function getItemMetadata(){return{}}function setItems(items){_items=items;_rows=_genRowsFromItems(_items);_refresh()}function getItems(){return _items}function insertItem(row,colId){_insert(row,colId,false)}function appendItem(row,colId){console.log(1);_insert(row,colId,true)}function _insert(row,colId,isAppend){var clicked=0;var newItem={x:1,y:2,col2:3,col3:4,children:[{col4:5},{col4:"5-2"}]};var array=getParent(row,colId);array.splice(clicked+(isAppend?1:0),0,newItem);_refresh()}function _refresh(){_rows=_genRowsFromItems(_items);onRowsChanged.notify()}function _genRowsFromItems(item){var acc=arguments.length<=1||arguments[1]===undefined?[]:arguments[1];var isObjInObj=arguments.length<=2||arguments[2]===undefined?false:arguments[2];var isFirstChild=arguments.length<=3||arguments[3]===undefined?false:arguments[3];var i,len;if($.isArray(item)){var parent=acc.length-1;for(i=0,len=item.length;i<len;i++){_genRowsFromItems(item[i],acc,false,i===0,parent)}}else{var hasArray=false;if(acc.length===0||!isObjInObj&&!isFirstChild){acc.push(item)}for(var key in item){if(item.hasOwnProperty(key)){var val=item[key];if($.isArray(val)){if(hasArray){throw new TypeError("Arguments cannot have multiple children at same depth: `"+hasArray+"` and `"+key+"`")}else{hasArray=key}_genRowsFromItems(val,acc,false)}else if(typeof val==="object")_genRowsFromItems(val,acc,true)}}}return acc}function _getRowspan(row,colId){function _getGeneration(item){if(item==null){return null}var depth=0;_dive(item);function _dive(item){var hasArrayOrObj=false;if(typeof item!=="object")return;for(var key in item){if(item.hasOwnProperty(key)){var val=item[key];if(typeof val==="object"){hasArrayOrObj=true;if($.isArray(val)){for(var i=0,len=val.length;i<len;i++){_dive(val[i])}}else{_dive(val)}}}}if(!hasArrayOrObj){depth++}}return depth}return _getGeneration(getItem(row,colId))}function syncGridCellCssStyles(grid,key){function _createCssRules(){var uid=grid.getContainerNode().className.match(/(?: |^)slickgrid_\d+(?!\w)/)[0],v=_measureVCellPaddingAndBorder();var rules=[".hidden {visibility: hidden;}"];var maxrow=30;for(var i=0;i<maxrow;i++){rules.push("."+uid+" .h"+i+" {margin: 0; font-size: inherit; height:"+(i*(v.height+v.heightDiff)-v.heightDiff)+"px;}")}var styleEl=$('<style type="text/css" rel="stylesheet" />').appendTo($("head"))[0];if(styleEl.styleSheet){styleEl.styleSheet.cssText=rules.join(" ")}else{styleEl.appendChild(document.createTextNode(rules.join(" ")))}}function _measureVCellPaddingAndBorder(){var v=["borderTopWidth","borderBottomWidth","paddingTop","paddingBottom"],$canvas=$(grid.getCanvasNode()),$r=$('<div class="slick-row" />').appendTo($canvas),$el=$('<div class="slick-cell" id="" style="visibility:hidden">-</div>').appendTo($r);var height,heightDiff=0;height=parseFloat($el.css("height"));$.each(v,function(n,val){heightDiff+=parseFloat($el.css(val))||0});$r.remove();return{height:height,heightDiff:heightDiff}}function _structuredDataExtractor(item,columnDef){return String(StructuredDataView.prototype.getValue.apply(null,[item,columnDef.id]))}function _genCssHashFromRows(){var cssHash={},columns=grid.getColumns();for(var i=0,I=_rows.length;i<I;i++){for(var j=0,J=columns.length;j<J;j++){cssHash[i]=cssHash[i]||{};var columnId=columns[j].id;var rowspan=_getRowspan(i,columnId);cssHash[i][columnId]=rowspan!=null?"h"+rowspan:"hidden"}}return cssHash}function _styleUpdate(){var cssHash=_genCssHashFromRows();grid.setCellCssStyles(key,cssHash)}this.onRowsChanged.subscribe(_styleUpdate);grid.getOptions().dataItemColumnValueExtractor=_structuredDataExtractor;_createCssRules(grid);_styleUpdate()}$.extend(this,{getLength:getLength,getItem:getItem,getItemMetadata:getItemMetadata,getParent:getParent,getValue:getValue,setItems:setItems,getItems:getItems,insertItem:insertItem,appendItem:appendItem,syncGridCellCssStyles:syncGridCellCssStyles,onRowsChanged:onRowsChanged});this.constructor.prototype.getValue=getValue}})(jQuery);