// 資料控制類 ----------------------------------------------------------------------------------------------------------------------------------
var jsData = {
	totalRow:1, // 全部資料筆數
	pageShowNb:20, // 每頁顯示多少筆資料
	totalPage:1, // 全部頁數
	nowPage:1, // 目前頁碼
	startPage:0, // 初始瀏覽頁碼
	maxShow:100, // 允許最大顯示筆數
	showPageLink:5, // 每次顯示多少筆翻頁連結數
	data:[], // 放置資料的容器
	getList:{}, // 取出清單 id:{edtype:'hidden', type:'number', edtable:false, view:false},
	listNb:0, // 顯示資料數量
	dataKey:'', // 主鍵值 : 用來變更資料用
	// 格式化設定
	init:function(set){
		var self = this;
		if(set.data!=undefined) self.data = set.data;
		if(set.dataKey!=undefined) self.dataKey = set.dataKey;
		if(set.getList!=undefined) self.getList = set.getList;
		if(set.totalRow!=undefined) self.totalRow = set.totalRow;
		if(set.pageShowNb!=undefined) self.pageShowNb = set.pageShowNb;
		if(set.showPageLink!=undefined) self.showPageLink = set.showPageLink;
		
		// 所有頁數
		self.totalPage = Math.ceil(self.totalRow/self.pageShowNb);
		if(self.totalPage<0) self.totalPage = 1; // 至少一頁
		
		for(var i in self.getList)
		{
			self.listNb++;
		}
		
		// 顯示翻頁連結設定
		if(self.showPageLink<5) self.showPageLink=5; // 至少5筆
		if((self.showPageLink%2)==0) self.showPageLink--; // 需為積數
		if(self.showPageLink>9) self.showPageLink=9; // 最多顯示9筆
	},
	// 讀取表格資料
	loadData:function(){
		
	},
	// 建立翻頁工具列
	createFlipPageBar:function(){
		var self = this;
		
		// 如果在不在第一頁 : 給予向上翻頁功能
		var flipPageBar = '';
		
		// 產生翻頁選單
		flipPageBar += "<a href='javascript:void(0)' id='first'>第一頁</a><a href='javascript:void(0)' id='prev'>上一頁</a>";
		// 計算頁數中心值
		var nnr = Math.floor(self.showPageLink/2)+1; 
		
		// 取出翻頁連結-開始連結頁碼
		var spage = (self.nowPage<=nnr) ? 1 : self.nowPage-nnr+1 ;
		
		// 取出翻頁連結-結束連結頁碼
		var stpage = ((spage+self.showPageLink-1)>self.totalPage) ? self.totalPage : spage + self.showPageLink - 1 ;
		
		// 當目前頁面+顯示連結清單頁面-1  < 每頁需顯示翻頁連結數  (時 -->) 開始頁面 = 全部頁數 - 每頁需顯示頁數 +1
		if((self.totalPage-(self.nowPage-nnr))<self.showPageLink) spage = self.totalPage - self.showPageLink + 1;
		
		// 開始頁碼不得小於1
		if(spage<=0) spage=1; 
		
		// 產生翻頁連結清單
		for(var i=spage; i<=stpage; i++)
		{
			var ishover = (i==self.nowPage)? 'hover' : '' ;
			flipPageBar += "<a href='javascript:void(0)' class='page "+ishover+"' page='"+i+"'>"+i+"</a>";
		}
		
		// 不在最後一頁時 : 給予向下翻頁功能
		flipPageBar +="<a href='javascript:void(0)' id='next'>下一頁</a><a href='javascript:void(0)' id='last'>最後一頁</a>";
		
		return flipPageBar;
	},
	// 設定翻頁參數
	setFliePageData:function(data){
		var self = this;
	},
	// 取得翻頁設定
	getFliePageSet:function(){
		var self = this;
		return {
			totalRow:self.totalRow,
			totalPage:self.totalPage,
			pageShowNb:slef.pageShowNb,
			nowPage:self.nowPage
		};
	},
	// 設定[翻頁連結]點擊作業
	setFlipPageClick:function(level,obj){
		
		var self = this;
		
		self.checkFlipPageStatus(obj);// 檢查翻頁按鈕 狀態
		
		// 取出所有翻頁按鈕
		obj.find('.flipPageBox').find('a').each(function(i){
			// 綁定點擊作業
			$(this).unbind('click').bind('click', function(){
				
				// 下一頁
				if($(this).attr('class')=='next')
				{
					self.nowPage++;
				}
				// 上一頁
				else if($(this).attr('class')=='prev')
				{
					self.nowPage--;
				}
				// 第一頁
				else if($(this).attr('class')=='first')
				{
					self.nowPage = 1;
				}
				// 最後一頁
				else if($(this).attr('class')=='last')
				{
					self.nowPage = self.totalPage;
				}
				// 不作業
				else if($(this).attr('class')=='normal')
				{
					return false;
				}
				// 指定頁數翻頁
				else
				{
					self.nowPage = $(this).attr('page');
				}
				
				// 最小頁數為第一頁
				if(self.nowPage<1) self.nowPage = 1;
				// 最大頁數等同總頁數
				if(self.nowPage>self.totalPage) self.nowPage = self.totalPage;
				// 開始資料筆數 = (目前頁數-1)*每頁顯示資料筆數
				self.startPage = (self.nowPage-1)*self.pageShowNb;
				
				obj.find('.page').removeClass('hover');
				obj.find('.page[page='+self.nowPage+']').addClass('hover');
				self.checkFlipPageStatus(obj);// 檢查翻頁按鈕 狀態
				
				if(level.isTable) level.tableToGrid();
				else level.createTable(); // 重新取得活動清單
				
			});
		});
	},
	// 檢查翻頁按鈕 狀態
	checkFlipPageStatus:function(obj){
		var self = this;
		var prevclass = (self.nowPage!=1) ? "prev" : 'normal' ; 
		var firstclass = (self.nowPage!=1) ? "first" : 'normal' ;
		var nextclass = (self.nowPage!=self.totalPage) ? 'next' : "normal";
		var lastclass = (self.nowPage!=self.totalPage) ? 'last' : "normal";
		obj.find('#prev').attr('class',prevclass);
		obj.find('#first').attr('class',firstclass);
		obj.find('#next').attr('class',nextclass);
		obj.find('#last').attr('class',lastclass);
	},
	// 取得物件 
	getObjFormData:function(){
		
	},
	// 表單驗證 --外接???
	validation : function(obj)
	{
		
	}
};
var jData = function(set){
	this.init(set);
};
jData.prototype = jsData; 