// 測式系統執行時間類 ----------------------------------------------------------------------------------------------------------------------------------
var getRunTime = {
	start:0,
	end:0,
	allTime:0,
	showTestTime:true, // 是否顯示程式執行時間
	view:true,
	// 開始計算時間
	startRun:function(){
		this.renew(); // 還原預設
		this.start = new Date().getTime();
	},
	// 結束計算時間 : ( 指定容器 )
	endRun:function(obj){
		this.end = end = new Date().getTime();
		this.allTime = (this.end - this.start) / 1000;
		obj.find('#testMsg').remove(); // 清除
		
		// 如果檢視測式時間為true時
		if(this.view) obj.prepend('<div id="testMsg">共執行'+this.allTime+'秒</div>');
		// 否則就回傳測式時間
		else return this.allTime; // 返回操作時間
	},
	renew:function(){
		this.start=0;
		this.end=0;
		this.Time=0;
	}
};
var jTest  = function(set){
	//this.init(set);
};
jTest.prototype = getRunTime;