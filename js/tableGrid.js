
// 表格控制類 ----------------------------------------------------------------------------------------------------------------------------------
var gridTable = gridTable || {
	test:{}, // 繼承-程式執行時間類
	tData:{}, // 繼承-資料控管類
	tableObj:{}, // 指定table物件
	columns:{}, // 表單控制設定
	gridError:[], // 錯誤訊息
	isCreateTable:false, // 是否已產生表格物件
	isTable:false, // 物件或物件內 是否有Table
	edtable:false,// 編輯表單類別
	onEdit:false, // 是否正在編輯中
	edIndex:0, // 目前編輯行數ID
	edRowIndex:0, // 目前編輯列數ID
	edKeyId:0,// 目前編輯列的KEY值
	inlineEditRun:false, // 是否已在行編輯中
	tbodyHtml:'', // 
	theadHtml:'', // 
	tfootHtml:'', //  
	tempValue:{}, // 暫存用值
	// 設定gridTable
	init:function(setting){
		var self = this;
		var stringObj = false;
		
		self.importJs("js/jTest.js")	// 載入執行時間測式JS
		self.importJs("js/jDialog.js");	// 載入跳出視窗類JS
		self.importJs("js/jData.js");	// 載入資料處理類JS
		
		self.test = new jTest(); // 載入
		
		// 檢查指定顯示容器 - 如果只輸入字串
		if(typeof(setting.obj)=='string')
		{
			stringObj = true;
			setting.obj = $(setting.obj);
		}
		
		// 取得指定顯示容器
		if(setting.obj==undefined)
		{
			self.gridError.push("未指定表格容器!!");
			return false;
		}
		else self.tableObj = setting.obj;
		
		if(setting.edtable!=undefined) self.edtable = setting.edtable;
		
		// 是否開啟測式
		if(setting.test!=undefined) self.test.showTestTime = setting.test; 
		
		
		// 如果指定物件本身為表格 或內含表格
		self.isTable = (self.tableObj.is('table'));
		var haveTable = (self.tableObj.find('table').length>0);
		
		if(haveTable)
		{
			slef.isTable = true;
			self.tableObj = self.tableObj.find('table').eq(0);
		}
		
		// 如果已有表格 - 依原本表格
		
		// 載入[資料/翻頁]設定
		if(setting.data!=undefined)
		{
			self.tData = new jData(setting.data); // 取得表格資料
		}
		else
		{
			self.gridError.push("未指定任何表格資料!!");
			return false;
		}
			
		// 設定所有資料對應
		if(setting.columns!=undefined)
		{
			self.columns = setting.columns;
		}
		
		if( (self.gridError.length-1) < 0 ) 
		{
			if(self.isTable || haveTable)
			{
				self.tableToGrid(); // 一般表格轉資料GRID
			}else{
				// 確定設定無錯誤時 - 產生TABLE
				self.createTable(); // 建立資料GRID
			}
		}
		// 如果設定有錯誤 - 停止產生錯誤訊息
		else
		{
			var errorMsg = self.gridError.join("\n");
			alert(errorMsg);
			return false;
		}
		
	},
	// 載入JS
	importJs:function(jsFilePath){
		var js = document.createElement("script");
		js.type = "text/javascript";
		js.src = jsFilePath;
		$('head').append(js);
	},
	// TABLE轉GRID
	tableToGrid:function(){
		var self = this;
		
		// 如果有設定取出測式時間  ################################
		if(self.test.showTestTime && self.test!=undefined) self.test.startRun(self.tableObj); 
		
		if(!self.isCreateTable)
		{
			// 是否有thead
			var haveThead = self.tableObj.find('thead').length>0;
			// 是否有tbody
			var haveTbody = self.tableObj.find('tbody').length>0;
			// 是否有tfoot
			var haveTfoot = self.tableObj.find('tfoot').length>0;
			var isID,objType;
			isID = (self.tableObj.attr('id')!='');
			
			// 物件是ID 還是 class
			var objType = (isID) ? 'id' : 'class';
			// 取得物件名稱
			var objTypeName = self.tableObj.attr(objType);
			// 物件類別前置碼
			var objTypeCode = (objType == 'id') ? '#' : '.' ;
			//清空目前物件類別
			self.tableObj.attr(objType, '');
			
			// 如果沒有THEAD
			if(!haveThead)
			{
				// 表格第一個TR放入THEAD
				self.tableObj.find('tbody').before('<thead></thead>');
				self.tableObj.find('thead').html(self.tableObj.find('tr').eq(0));
			}
			
			if(haveTfoot)
			{
				self.tfootHtml = self.tableObj.find('tfoot').html();
			}
			// 將表單置入新容器
			self.tableObj.wrap("<div "+objType+"='"+objTypeName+"'><div id='arc_dataGrid'></div></div>");
			
			// 重新定義物件
			self.tableObj = $(objTypeCode+objTypeName);
			
			// 取資料長度
			self.tData.totalRow = self.tableObj.find('table tbody tr').length;
			self.tData.totalPage = Math.ceil(self.tData.totalRow/self.tData.pageShowNb);
			self.tData.listNb = self.tableObj.find('table tbody tr').find('td').length;
		}
		
		var tableTr = self.tableObj.find('table tbody tr');
		tableTr.hide();
		var j=0;
		
		var startnb = (self.tData.nowPage-1) * self.tData.pageShowNb; // 開始筆數
		var overnb = self.tData.pageShowNb * self.tData.nowPage; //最後筆數
		
		for(var i=startnb; i<overnb; i++)
		{
			tableTr.eq(i).show();
			j++;
			if(j == self.tData.pageShowNb) break;
		}
		
		self.tableTrEvenBkChange(); // 資料表格間隔變色
		
		if(self.tData.totalPage>1)
		{
			var flipPageBar = self.tData.createFlipPageBar();
			self.tableObj.find('tfoot').remove();
			var oldtfoot = (self.tfootHtml!='') ? self.tfootHtml : '' ;
			self.tableObj.find('tbody').eq(0).after("<tfoot>"+oldtfoot+"<tr><td colspan='"+self.tData.listNb+"' class='flipPageBox'><span>"+flipPageBar+"</span></td></tr></tfoot>");
		}
		else
		{
			self.tableObj.find('tbody :last-child td').attr('style','border-bottom:0px;');
		}
		// 設定[翻頁連結]點擊作業
		self.tData.setFlipPageClick(self, self.tableObj); 
		
		// 檢查是否已建立TABLE - 如果沒有就變有
		if(!self.isCreateTable) self.isCreateTable = true; // [標示為]已產生表格物件
		
		
		// 如果有設定 - 取出程式測式時間
		if(self.test.showTestTime && self.test!=undefined) self.test.endRun(self.tableObj); // 結束測式 ############################## 
		//alert('end trun');
	},
	// 由外部資料建立table物件
	createTable:function(){
		
		var self = this;
		
		// 如果有設定取出測式時間  ################################
		if(self.test.showTestTime && self.test!=undefined) self.test.startRun(self.tableObj); 
		
		// 如果資料筆數為空或0時不產生表格物件
		if(self.tData.totalRow==0 || self.tData.totalRow==undefined) return false; 
		
		// 如果已建立表單 - 清空物件表單資料 #########
		if(self.isCreateTable)
		{
			self.tableObj.find('tbody, tfoot').remove();
		}
		
		var table = '<table width="100%" cellspacing="0">', // 新表格物件 - 如果已建立TABLE 時沒用到
			thead = '<thead>', // 建立 THEAD 物件 - 如果已建立 TABLE 時沒用到
			tbody = '<tbody>', // 建立 TBODY
			tfoot = '<tfoot>'; // 建立 TFOOT
		
		var j = 0; // 計算已取出資料清單數
		var rundata = self.tData.data; // 已載入資料清單
		
		// 開始產生表格
		for(var i = (self.tData.startPage); i<self.tData.totalRow; i++)
		{
			// 是否是第一次執行
			var startRun = (j==0); 
			// 建立 THEAD
			var _head = (startRun && !self.isCreateTable) ? '<tr>' : undefined ; // THEAD
			
			// 如果有指定 dataKey
			if(self.tData.dataKey!=undefined) key_id = "list_id='"+rundata[i][self.tData.dataKey]+"'";
			
			// 建立資料清單
			var _body = '<tr '+key_id+'>'; 
			
			// 截入表格資料清單
			for(var tableName in rundata[i])
			{
				// 建立 THEAD TH - 只會建立一組
				if(startRun)
				{
					// 如果指定清單內有指定 且 未建立過TABLE
					if(self.tData.getList[tableName]!=undefined && !self.isCreateTable)
					{
						// 如果有指定變更THEAD TH 文字內容 - 預設為取出OBJECT 的KEY值
						var _thTitle = (self.columns[tableName]!=undefined && self.columns[tableName].title!=undefined) ? self.columns[tableName].title : tableName;
						var _thWidth = (self.columns[tableName]!=undefined && self.columns[tableName].width!=undefined) ? "width='"+self.columns[tableName].width+"'" : '';
						// 變更CSS用的變數
						var listClass='';
						// 如果檢視為FALSE時 - 隱藏TH
						if(self.tData.getList[tableName].view===false) listClass+=' hide';
						// 產生THEAD TH內容
						_head += "<th class='"+listClass+"' tableName='"+tableName+"' "+_thWidth+" >"+_thTitle+"</th>";
					}
				}
				
				// 建立 TBODY TD 清單
				if(self.tData.getList[tableName]!=undefined)
				{
					// 變更CSS用的變數
					var listClass='';
					// 如果檢視為FALSE時 - 隱藏TD
					if(self.tData.getList[tableName].view===false) listClass+=' hide';
					// 產生TBODY TD內容
					_body += "<td class='"+listClass+"'>"+rundata[i][tableName]+"</td>";
				}
			}
			
			if(startRun) thead+=_head+'</tr>';
			if(_body!=undefined) tbody+=_body+'</tr>';
			// 取出清單計數
			j++;
			// 如果取出清單數 - 已等同每頁顯示筆數 - 離開迴圈
			if( j==self.tData.pageShowNb ) break; // 到達取出指定筆數後離開
		}
		thead +='</thead>';
		tbody +='</tbody>';
		
		// 如果全部的頁數大於1才產生下方連結
		if(self.tData.totalPage>1)
		{
			var flipPageBar = self.tData.createFlipPageBar();
			tfoot += "<tr><td colspan='"+self.tData.listNb+"' class='flipPageBox'><span>"+flipPageBar+"</span></td></tr></tfoot>";
		}
		else
		{
			self.tableObj.find('tbody :last-child td').attr('style','border-bottom:0px;');
		}
		table = (!self.isCreateTable) ? '<div id="arc_dataGrid">'+table+thead+tbody+tfoot+'</table></div>' : tbody+tfoot ;
		
		//alert(table); // 檢查已產生的TABLE HTML
		
		// 更新資料清單
		if(!self.isCreateTable) self.tableObj.html(table); // 如果還未建立過TABLE - 產生整個TABLE
		else self.tableObj.find('thead').after(table); // 如果已建立過TABLE - 更新TBODY - 及TFOOT 翻頁連結
		
		self.tableTrEvenBkChange(); // 資料表格間隔變色
		
		// 檢查 已放入容器的TABLE HTML
		//if(!self.isCreateTable) alert(table);
		//else alert(self.tableObj.html());
		
		// 產生表單STYLE
		if(!self.isCreateTable) self.createTableCss(); 
		
		// 依表單編輯設定 - 產生不同作業
		if(self.onEdit==false)
		{
			// 設定Td點擊作業
			if((self.edtable==true || self.edtable=='tdEdit')) self.setTdClick();
			
			// 設定inlineEdit 
			if(self.edtable=='inlineEdit')
			{
				// 產生TH管理格
				if(self.inlineEditRun==false)
				{
					self.tableObj.find('thead tr').append("<th width='80'>管理</th>");
					self.inlineEditRun = true;
				}
				// 產生編輯按鈕
				self.tableObj.find('tbody tr').append("<td style='text-align:center;'><input type='button' value='編輯' class='arcOnlineEdit arcfrbtn' /><input type='button' value='刪除' class='arcOnlineDel arcfrbtn' /><input type='button' value='儲存' class='arcOnlineSave arcfrbtn arcFromHide' /><input type='button' value='取消' class='arcOnlineCancel arcfrbtn arcFromHide'/></td>");
				self.setOnlineEditButtonClick();
			}
			
		}
		
		// 設定[翻頁連結]點擊作業
		self.tData.setFlipPageClick(self, self.tableObj); 
		
		// 檢查是否已建立TABLE - 如果沒有就變有
		if(!self.isCreateTable) self.isCreateTable = true; // [標示為]已產生表格物件
		
		// 如果有設定 - 取出程式測式時間
		if(self.test.showTestTime && self.test!=undefined) self.test.endRun(self.tableObj); // 結束測式 ############################## 
	},
	// TR 表格間隔變色
	tableTrEvenBkChange:function(){
		var self = this;
		self.tableObj.find('table tbody').removeClass('evenbk');
		self.tableObj.find('table tbody tr:odd').addClass('evenbk');
	},
	// TR 點擊作業
	setTrClick:function(){
		var self = this;
		var obj = self.tableObj;
		
		obj.find('tbody tr').unbind('click').bind('click',function(){
			alert($(this).attr('list_id'));
		});
	},
	// TD 點擊作業
	setTdClick:function(){
		var self = this;
		var obj = self.tableObj;
		
		obj.find('tbody tr td').unbind('click').bind('click',function(){
			if(self.onEdit===true) return false;
			var data = {};
			var mobj = $(this).parent(); // 取得所屬行物件
			self.edIndex = obj.find('tbody tr') .index(mobj); // 取得目前編輯清單列流水號
			self.edRowIndex = obj.find('tbody tr').eq(self.edIndex).find('td').index(this); // 取得行流水號
			data.name = obj.find('thead th').eq(self.edRowIndex).attr('tableName'); // 取得資料表名稱
			data.type = self.tData.getList[data.name].edtype; // 取得表單類別
			self.edKeyId = mobj.attr('list_id'); // 取得
			self.tdToEdit($(this), data); // 開始編輯表單
		});
	},
	// 在線管理按鈕點擊作業
	setOnlineEditButtonClick : function(){
		var self = this;
		var obj = self.tableObj;
		
		// 編輯按鈕
		obj.find('tbody .arcOnlineEdit').unbind('click').bind('click',function(){
			if(self.onEdit===true) return false; // #######應該要改成 - 如果編輯ID不同 - 詢問是否要存儲 - 或取消儲存
			var data = {};
			var mobj = $(this).parents('tr'); // 取得所屬行物件
			self.edIndex = obj.find('tbody tr').index(mobj); // 取得目前編輯清單列流水號
			self.edKeyId = mobj.attr('list_id'); // 取得目前資料KEYID
			self.toOnlineEdit(self.edIndex);
			// // 開始編輯表單
		});
		
		// 取消按鈕
		obj.find('tbody .arcOnlineCancel').unbind('click').bind('click',function(){
			// 還原清單值
			var bkobj = $(this).parents('tr');
			for(var key in self.tempValue.html)
			{
				bkobj.find('td:visible').eq(key).html(self.tempValue.html[key]);
			}
			
			// 還原編輯按鈕
			bkobj.find('input').show();
			bkobj.find('.arcFromHide').hide();
			
			self.edIndex = 0; // 還原編輯值
			self.edKeyId = 0;// 還原編輯KEYID
			self.onEdit = false; // 取消
			self.tempValue={}; // 清空暫存值
		});
		
		// 儲存按鈕
		obj.find('tbody .arcOnlineSave').unbind('click').bind('click',function(){
			var savedata = self.tData.getFormValue($(this).parents('tr'));
			// self.tData.viewObj(savedata);return false;
			alert('isSave'); // 先跑AJAX儲存後 - 看結果後再另外處理
		});
		
		// 刪除按鈕
		obj.find('tbody .arcOnlineDel').unbind('click').bind('click',function(){
			var check = confirm('是否刪除該筆資料!!!');
			if(check)
			{
				alert('已刪除!!!'); // 刪除後依頁數重新取得資料
			}else return false;
		});
		
	},
	// 開始在線編輯
	toOnlineEdit:function(index){
		var self = this;
		var obj = self.tableObj;
		var rObj = obj.find('tbody tr:eq('+index+') td:visible');
		var rLength = rObj.length;
		
		rObj.find('input').hide();
		rObj.find('.arcFromHide').show();
		
		// td表格內容變更為表單
		rObj.each(function(e){
			var data = {};
			if(e!=(rLength-1))
			{
				data.name = obj.find('thead th:visible').eq(e).attr('tableName'); // 取得資料表名稱
				data.type = self.tData.getList[data.name].edtype; // 取得表單類別
				self.tdToEdit($(this), data);
			}
		});
	},
	// 產生編輯物件
	tdToEdit:function(obj, data){
		var self = this;
		
		// td編輯
		if(self.edtable===true || self.edtable==='tdEdit')
		{
			self.tempValue.html = obj.html(); // 記錄TD目前內容
			self.tempValue.text = obj.text(); // 記錄目前值
			data.value = self.tempValue.text; // 輸入值
			self.tempValue.input = self.createInput(data); // 產生表單
			obj.html(self.tempValue.input); // 載入表單
		}
		
		// 行編輯
		if(self.edtable==='inlineEdit')
		{
			if(self.tempValue.html===undefined || typeof(self.tempValue.html)!='object') self.tempValue.html = [];
			if(self.tempValue.text===undefined || typeof(self.tempValue.text)!='object') self.tempValue.text = [];
			self.tempValue.html.push(obj.html()); // 記錄TD目前內容
			self.tempValue.text.push(obj.text()); // 記錄目前值
			
			// 如果被禁止編輯 - 不產生編輯表單物件
			if(self.tData.getList[data.name].edtable!==false)
			{
				var lh = self.tempValue.html.length-1;
				data.value = self.tempValue.text[lh]; // 輸入值
				self.tempValue.input = self.createInput(data); // 產生表單
				obj.html(self.tempValue.input); // 載入表單
			}
		}
		
		// 選取新增的表單
		var edObj = obj.find('input,textarea,select');
		if(self.onEdit===false) self.onEdit = true; // 變更為編輯狀態
		
		if(self.edtable===true || self.edtable==='tdEdit')
		{
			edObj.focus();
			// 當取消選取表單時 - 檢查
			edObj.blur(function(){
				self.onEdit = false;
				// 如果值沒變
				if($(this).val()==self.tempValue.text)
				{
					obj.html(self.tempValue.html); // 返回原本的html值
					self.tempValue = {};
					return false;
				}
				// 如果值變了
				else
				{
					alert('change AND save newVale='+$(this).val());
					obj.html($(this).val());
				}
			});
		}
		
	},
	// 結束編輯
	endEdit:function(){
		
	},
	// 產生表單物件name, type, value, list, tags
	createInput:function(data){
		var self = this;
		var input = '';
		
		switch(data.type)
		{
			case 'text': case 'hiddd': case 'radio': case 'checkbox': case 'submit': case 'botton': case 'image': case 'file': case 'password':
				input = "<input name='"+data.name+"' type='"+data.type+"' value='"+data.value+"' />";
			break;
			
			case 'textarea':
				input = "<textarea name='"+data.name+"' >"+data.value+"</textarea>";
			break;
			
			case 'select':
				if(data.list!=undefined && typeof(data.list)=='object')
				{
					input = "<select name='"+data.name+"'>";
					for(var key in data.list)
					{
						var selected = (key==value) ? 'selected' : '' ;
						input += "<option value='"+key+"' "+selected+">"+data.list[key]+"</option>";
					}
					input += "</select>";
				}else return false;
				
			break;
			
			default:
				return false;
			break;
		}
		
		return input;
		
	},
	// 產生預設的CSS
	createTableCss:function(boxIdName)
	{// @@@@@@@@@@@@@@@未更新
		var defaultStyle ='<style class="arc_dataGrid">#arc_dataGrid tr:first-child th:first-child{border-top-left-radius:3px;overflow:hidden;}#arc_dataGrid tr:first-child th:last-child{border-top-right-radius:3px;overflow:hidden;}#arc_dataGrid tfoot tr:last-child td:first-child{border-bottom-left-radius:3px;overflow:hidden;}#arc_dataGrid tfoot tr:last-child td:last-child{border-bottom-right-radius:3px;overflow:hidden;}#arc_dataGrid a{text-decoration:none;}#arc_dataGrid .flipPageBox{text-align:center;}#arc_dataGrid .flipPageBox a{border:1px solid #ddd; margin:0 0 0 5px; padding: 2px 5px 2px 5px;display:inline-block; border-radius:3px;overflow:hidden;}#arc_dataGrid .flipPageBox a:hover,#arc_dataGrid .hover{background:#333;color:#fff;}#arc_dataGrid table th{font-size:14px;}#arc_dataGrid table td{font-size:13px;}#arc_dataGrid tr th:first-child,#arc_dataGrid tr td:first-child{border-left:1px solid #ccc;}#arc_dataGrid tr th,#arc_dataGrid tr td{padding:5px;border-right:1px solid #ccc;}#arc_dataGrid tr th{background:#eee;border-bottom:1px solid #ccc;}#arc_dataGrid thead tr th:hover{color:#666;}#arc_dataGrid table tr:last-child td{border-bottom:1px solid #ccc;}#arc_dataGrid thead tr:first-child th{border-top:1px solid #ccc;}#arc_dataGrid tbody tr:hover td{color:#fff; background: #3af;}#arc_dataGrid tbody tr:nth-child(even){background: #eee;}#arc_dataGrid tfoot td{background:#eee;}#arc_dataGrid a.normal,#arc_dataGrid a.normal:hover{color:#aaa;border:1px solid #eee;background:#fff;cursor:text;}#arc_dataGrid .hide{display:none;}</style>';
		
		// 頁面還沒有宣告任何[資料表格樣式]前
		//if($('head style[class=arc_dataGrid]').text()=='' || $('head style[class=arc_dataGrid]')==undefined) $('head').prepend(defaultStyle);
	}
};
var tableGrid = tableGrid || function(set){
	this.init(set);
};
tableGrid.prototype = gridTable;
