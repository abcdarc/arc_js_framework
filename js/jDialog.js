// 跳出視窗類 ----------------------------------------------------------------------------------------------------------------------------------
var jsDialog =  jsDialog || {
	dialogObj:{}, // 被指定物件
	objType:'id', // 
	objName:'',
	objTypeList:{
		'id':'#',
		'class':'.'
	},
	setting:{ // 基本設定
		title: '　',
		width: '300px',
		height: '200px',
		x:0,
		y:0
	},
	isclose:true, // 是否關閉
	jData:{}, // 載入資料
	html:undefined, // 內容
	modal:false, // 是否顯示背景網 
	isCreate:false, // 是否已建立過 
	parentTagName:'', // 取出所屬物件階層 
	parentObj:{}, // 所屬物件 
	defaultButton:{ // 預設按鈕 : 允許值為
		'submit':{
			value:'確認',
			run:function(self){
				alert('submit');
				self.close();
				return true;
			}
		},
		'cancel':{
			value:'取消',
			run:function(self){
				self.close();
				return false;
			}
		}
	},
	button:false, // 導入按鈕
	// 初始設定
	init:function(set){
		
		var self = this;
		
		if(self.isCreate) return false;
		
		// 指定物件不得為空
		if(set.obj==undefined) return false;
		// 取指定物件
		else
		{
			if(typeof(set.obj)=='object') self.dialogObj = set.obj;
			if(typeof(set.obj)=='string') self.dialogObj = $(set.obj);
			
			self.objType = (self.dialogObj.attr('id')!='') ? 'id' : 'class' ;
			self.objName = self.dialogObj.attr(self.objType);
		}
		
		// 設定背景網屏
		if(set.modal!=undefined)
		{
			self.modal = set.modal;
		}
		
		// 設定寬
		if(set.width!=undefined && set.width!='')
		{
			self.setting.width = set.width;
		}
		
		// 設定高
		if(set.height!=undefined && set.height!='')
		{
			self.setting.height = set.height;
		}
		
		// 設定視窗標題
		if(set.title!=undefined && set.title!='')
		{
			self.setting.title = set.title;
		}
		
		// 設定視窗標題 - 依物件tag
		if(self.dialogObj.prop('title')!=undefined && self.dialogObj.prop('title')!='')
		{
			self.title = self.dialogObj.prop('titleB');
		}
		
		// 設定視窗標題
		if(set.html!=undefined && set.html!='')
		{
			self.html = set.html;
		}
		
		// 設定按鈕
		if(set.button!=undefined )
		{
			self.button = set.button;
		}
		
		// ****** 取視窗呎吋及定位 - 重新定義視窗狀態
		self.createDialog();
		
		// 檢查關閉狀態
		if(set.close!=undefined)
		{
			self.setClose(set.close); 
		}
		
	},
	// 建立視窗
	createDialog:function(){
		var self = this;
		var obj = self.dialogObj;
		
		// 如果未建立 : 
		if(self.isCreate) return false;
		
			if(self.html==undefined) self.html = obj.html(); // 取出指定物件原有html
			
			// 取目前所在階層 : ##########
			self.parentTagName = obj.parent()[0].tagName.toLowerCase();
			if(self.parentTagName=='body') self.parentObj=$(self.parentTagName);
			else self.parentObj = obj.parent();
			
			// 產生物件 
			var modal = '';
			var head = "<div class='arcDialogHead'>"+self.setting.title+"<span class='arcDialogCloseBt'>x</span></div>";
			var body="<div class='arcDialogBody'>"+self.html+"</div>"; // 內容列 
			var footer = "<div class='arcDialogFoot'></div>"; // 下方按鈕列 
			
			if(self.modal) modal="<div class='arcModal'></div>"; // 如果有設定背景網屏
			
			// 取出class tag 值
			var classValue = "class='";
			if(self.objType=='class') classValue+=self.objName;
			classValue+=" arcDialog'";
			
			// 取出id tag 值
			var idValue = "id='";
			if(self.objType=='id') idValue+=self.objName;
			idValue+="'";
			
			var html = modal+"<div "+classValue+" "+idValue+">"+head+body+footer+"</div>";
			
			obj.after(html); // 產生html : 在目前物件後方
			
			obj.remove(); // 移除原物件
			
			// 產生新物件
			obj = self.dialogObj = $(self.objTypeList[self.objType]+self.objName);
			
			// 設定主物件呎吋
			obj.attr('style',"width:"+self.setting.width+";height:"+self.setting.height+";");
			var headHeight = obj.find('.arcDialogHead').outerHeight();
			var footHeight = obj.find('.arcDialogFoot').outerHeight();
			var setHeight = obj.outerHeight() - headHeight - footHeight - 70;
			
			obj.find('.arcDialogBody').attr('style',"height:"+setHeight+"px;");
			
			// 設定關閉按鈕動作
			obj.find('.arcDialogCloseBt').unbind('click').bind('click', function(){
				self.close();
			});
			
			self.isCreate=true; // 設定為已建立
		
		
		// 校正視窗位置 : 置中
		obj.attr('style',obj.attr('style')+"margin: -"+(obj.outerHeight()/2)+"px 0 0 -"+(obj.outerWidth()/2)+"px;");

		
		// 如果有設定按鈕
		if(self.button!==false)
		{
			// 取出預設按鈕
			if(self.button===true)
			{
				self.button = self.defaultButton; // 使用預設按鈕
			}
			
			self.setButton(); // 產生按鈕 及 點擊作業 
		}
		else
		{
			obj.find('.arcDialogFoot').html('');
		}
		
		// 
		
	},
	// 變更內容
	reDialog:function(set){
		var self = this;
		var obj = self.dialogObj;
		
		self.isCreate = false;
		
		if(typeof(set)=='string')
		{
			self.html = set;
			obj.find('.arcDialogBody').html(self.html);
		}
		
		if(typeof(set)=='object')
		{
			// 設定寬
			if(set.width!=undefined && set.width!='')
			{
				self.setting.width = set.width;
			}
			
			// 設定高
			if(set.height!=undefined && set.height!='')
			{
				self.setting.height = set.height;
			}
			
			// 設定視窗標題
			if(set.title!=undefined && set.title!='')
			{
				self.setting.title = set.title;
			}
			
			// 設定視窗內容
			if(set.html!=undefined && set.html!='')
			{
				self.html = set.html;
			}
		
			// 設定按鈕
			if(set.button!=undefined )
			{
				self.button = set.button;
			}
			
			self.createDialog();
		}
	},
	// 產生按鈕 及 點擊作業
	setButton:function(){
		var self = this;
		var obj = self.dialogObj;
		
		// 產生按鈕
		for(var key in self.button)
		{
			var name = '';
			name = ( self.defaultButton[key].value!=undefined && self.defaultButton[key].value!='' ) ? self.defaultButton[key].value : key ;
			obj.find('.arcDialogFoot').append("<div class='arcfrbtn "+key+"' act='"+key+"'>"+name+"</div>");
		}
		
		// 設定按鈕點擊作業
		obj.find('.arcDialogFoot .arcfrbtn').unbind('click').bind('click', function(){
			self.defaultButton[$(this).attr('act')].run(self);
		});
	},
	// 設定關閉狀態 - 並執行
	setClose:function(close_value){
		var self= this;
		self.isclose = close_value;
		self.display();
	},
	// 關閉視窗
	close:function(){
		var self = this;
		self.isclose = true;
		self.display();
	},
	// 顯示視窗
	show:function(set){
		var self = this;
		self.isclose = false;
		if(set==undefined)
		{
			self.display();
		}
		else
		{
			self.reDialog(set);
			self.display();
		}
	},
	// 顯示/關閉 視窗
	display:function(){
		var self = this;
		
		if(self.isclose)
		{
			self.dialogObj.hide();
			if(self.modal) $('.arcModal').hide();
		}
		else
		{
			self.dialogObj.show();
			if(self.modal) $('.arcModal').show();
		}
	}
};
var jDialog = jDialog || function(set){
	this.init(set);
};
jDialog.prototype = jsDialog;