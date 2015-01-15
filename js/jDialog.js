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
		title: '',
		width: '300px',
		height: '200px',
		x:0,
		y:0
	},
	isclose:true, // 是否關閉
	jData:{}, // 載入資料
	html:{}, // 內容
	defaultButton:{ // 預設按鈕 : 允許值為
		'submit':{
			value:'確認',
			run:function(){
				alert('submit');
				this.close();
				return true;
			}
		},
		'cancel':{
			value:'取消',
			run:function(){
				this.close();
				return false;
			}
		}
	},
	button:false, // 導入按鈕
	// 初始設定
	init:function(set){
		
		var self = this;
		
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
		
		// 設定寬
		if(set.width!=undefined && set.width!='')
		{
			self.width = set.width;
		}
		
		// 設定高
		if(set.height!=undefined && set.height!='')
		{
			self.height = set.height;
		}
		
		// 設定視窗標題
		if(set.title!=undefined && set.title!='')
		{
			self.title = set.title;
		}
		
		// 設定視窗標題 - 依物件tag
		if(self.dialogObj.prop('title')!=undefined && self.dialogObj.prop('title')!='')
		{
			self.title = self.dialogObj.prop('title');
		}
		
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
		
		self.html = obj.html(); // 取出指定物件原有html
		/**/
		// 產生物件
		var head = "<div class='arcDialogHead'>　"+self.setting.title+"<span class='arcDialogCloseBt'>x</span></div>";
		var body="<div class='arcDialogBody'>"+self.html+"</div>";
		var footer = '';
		if(self.button!==false)
		{
			if(self.button===true)
			{
				//footer="<div class='arcDialogFoot'><div class='arcfrbtn'>確認</div><div class='arcfrbtn'>取消</div></div>";
				footer="<div class='arcDialogFoot'>";
				self.button = self.defaultButton; // 使用預設按鈕
				for(var key in self.button)
				{
					var name = '';
					name = (self.defaultButton[key].value!=undefined && self.defaultButton[key].value!='') ? self.defaultButton[key].value : key ;
					footer += "<div class='arcfrbtn "+key+"'>"+name+"</div>";
				}
				footer+="</div>";
			}
		}
		
		// 取出class tag 值
		var classValue = "class='";
		if(self.objType=='class') classValue+=self.objName;
		classValue+=" arcDialog'";
		
		// 取出id tag 值
		var idValue = "id='";
		if(self.objType=='id') idValue+=self.objName;
		idValue+="'";
		
		var html = "<div "+classValue+" "+idValue+">"+head+body+footer+"</div>";
		
		obj.after(html); // 產生html
		
		obj.remove(); // 移除原物件
		
		// 產生新物件
		obj = self.dialogObj = $(self.objTypeList[self.objType]+self.objName);
		
		obj.find('.arcDialogCloseBt').unbind('click').bind('click', function(){
			self.close();
		});
		
		obj.find('.arcDialogFoot .arcfrbtn').each();
		
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
	show:function(){
		var self = this;
		self.isclose = false;
		self.display();
	},
	// 關閉視窗
	display:function(){
		var self = this;
		
		if(self.isclose) self.dialogObj.hide();
		else self.dialogObj.show();
	}
};
var jDialog = jDialog || function(set){
	this.init(set);
};
jDialog.prototype = jsDialog;