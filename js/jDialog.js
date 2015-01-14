// 跳視窗類 ----------------------------------------------------------------------------------------------------------------------------------
var jsDialog =  jsDialog || {
	setting:{ // 基本設定
		title: false,
		width: 0,
		height: 0,
		x:0,
		y:0
	},
	close:true, // 是否關閉
	typeMode:['alert','window'], // 允許視窗類別模式
	type:'alert', // 目前視窗類別
	data:{}, // 是否顯示程式執行時間
	// 初始設定
	init:function(set){
		
	},
	// 
	objname:function(){
		
	}
};
var jDialog = jDialog || function(set){
	this.init(set);
};
jDialog.prototype = jsDialog;