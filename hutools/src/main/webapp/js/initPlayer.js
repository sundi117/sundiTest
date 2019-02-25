//****************************** START - 初始化播放器相关数据 ******************************//
/* GetAttemptState Map */
var asMap = new JHashMap();
/* Initialize Map */
var initMap = new JHashMap();
/* GetParam Map */
var paraMap = new JHashMap();
/* user info */
var userMap = new JHashMap();

/* 获得播放课件frame */
var mfr = document.getElementById('mainFrame');
/* 获得播放课件frame的win对象 */
var mfw = $("#mainFrame")[0].contentWindow;
/* 获得播放课件Mp4的对象 */
var myPlayer = videojs('theMp4Video');
/* 保存进入学习时间 */
var startTime;
/* 当前学习的章节ID */
var initCwcId = 0;
/* 保存学习的课件ID */
var saveCwId = 0;
/* 保存学习的章节ID */
var saveCwcId = 0;
/* 初始化学习的章节ID */
var initCwId = 0;
/* 学习状态 */
var stuStatus = 3;
/* 当前学习的课件类型 */
var courseWareType;
/* 初始化课件播放信息 */
var initPlayerPageInfo;
/* 初始化学习进度 */
var initLearningProgress;
/* 获取课件播放服务器地址 */
var contentUrl;
/* 判断点击保存学习记录的位置 */
var theBtnSave = 0;
/* Mp4课件播放进度保存 */
var $currentTime = 0;
// 初始化学习轨迹
function initRecordParam(){
	startTime = '';
	initCwcId = 0;
	saveCwId = 0;
	saveCwcId = 0;
	stuStatus = 3;
}

function initPlayerInfo(cwId_){
	//切换章节之后保存前一个课件的总学习记录
	if(0 != initCwId && cwId_ != initCwId){
		//MP4课件播放是否结束判断 -- 这个为了避免监听ended事件时重复执行问题
		$isEnd = true;
		// 保存最后一次学习章节轨迹
		saveLearningRecord(initCwId,initCwcId,saveCwcId,'exit');
		initRecordParam();
		//发送行为轨迹 - 切换课件
	}
	var data_ = {};
	data_.cwId = cwId_;
	$.ajax({
		type : "POST",
		url : $cc_url + "/playerController/initPlayerPage.do",
		data : data_,
		dataType: 'json',
		xhrFields: {
			withCredentials: true
		},
		//允许跨域
		crossDomain: true,
		success : function(result) {
			var Data = result.responseData;
			startTime = Data.initStartTime;
			var zNodes;
			for ( var key in Data) {
				if('courseWare' == key){
					initPlayerPageInfo = Data[key];
				}if('learningProgress' == key){
					initLearningProgress = Data[key];
				}
			}
			if(undefined == initPlayerPageInfo){
				parent.layer.msg('当前点击章节没有可学习的内容请点击其他章节进行学习！', {
					skin: 'layui-layer-lan',
					icon:2,
					title: '提醒'
				});
			}else{
				//发送行为轨迹 - 开始学习
				sendLessonTrajectory(cwId_,"attempted");
				// cwType（1：标准课件；2：非标课件）
				if('scorm' == courseWareType && initCwId != cwId_){
					mfw.pageUnload('exit');
				}else if('mp4' == courseWareType && initCwId != cwId_){
					myPlayer.pause();
				}
				if(1 == initPlayerPageInfo.cwType){
					courseWareType = 'scorm';
					// 初始化chapterTree
					initChapterTree(cwId_);
					// 显示播放页面
					$("#errorFrameDiv").hide();
					$("#MP4Player").hide();
					$("#scormPlayer").show();
					$Resize.init($('#mainFrame'));
					$("#directory").hide();
					$("#chapterTreeDiv").show();
				}else if(2 == initPlayerPageInfo.cwType){
					courseWareType = 'mp4';
					// 初始化Mp4课件所需信息
					initMp4Player(cwId_);
				}
				//重置课件ID 
				initCwId = cwId_;
			}
		}
	});
}
// ****************************** END - 初始化播放器相关数据  ******************************//

// ****************************** START - 初始化课件章节树  ******************************//

// 判断是否切换章节，如果切换章节则要保存之前的学习轨迹
function changeChapter(cwId,cwcId){
	if(0 == initCwcId){
		initCwcId = cwcId;
		saveCwcId = initCwcId;
		return 'init';
	}else if(cwcId == initCwcId){
		return 'same';
	}else{
		saveCwcId = initCwcId;
		initCwcId = cwcId;
		return 'save';
	}
}

function initChapterTree(cwId_){
	// 自动加载dom对象的ID
	$zTree.treeId = "chapterTree";
	// 启用chkbox/radio
	$zTree.check.enable = false;
	// 设置不可点击节点
	$zTree.isOpenClick = true;
	// 设置访问URL
	// $zTree.async.enable = false;
	$zTree.async.url = $cc_url + "/playerController/initChapterTree.do";
	$zTree.async.xhrFields= {
		withCredentials: true
	};
	//允许跨域
	$zTree.async.crossDomain=true;

	// 传递课件章节ID参数
	$zTree.async.otherParam = {'cwId':cwId_};
	// 设置是否启用简单json数据格式
	$zTree.data.simpleData.enable = true;
	// 数据处理
	$zTree.filter_ = function(treeId, parentNode, responseData) {
		var zNodes = responseData.responseData;
		if(zNodes){
			for (var i = 0; i < zNodes.length; i++) {
				//超出长度后则显示15长度后面忽略
				if(15 < zNodes[i]["title"].length){
					zNodes[i]["name"] = zNodes[i]["title"].substr(0,25)+"...";
				}else{
					zNodes[i]["name"] = zNodes[i]["title"];	
				}
				zNodes[i]["open"] = true;
				zNodes[i]["parentId"]=zNodes[i]["parent_id"];
				if (0 < zNodes[i]["childCount"]) {
					zNodes[i]["isParent"] = true;
					zNodes[i]["iconSkin"] = "parent";
					if(15 < zNodes[i]["title"].length){
						zNodes[i]["name"] = zNodes[i]["title"].substr(0,15)+"...";
					}else{
						zNodes[i]["name"] = zNodes[i]["title"];	
					}
				} else {
					zNodes[i]["isParent"] = false;
					zNodes[i]["iconSkin"] = "leaf";
				}
			}
		};
		return zNodes;
	}
	// 传参 父节点ID、子章节数量
	$zTree.async.autoParam.push("parent_id");
	$zTree.async.autoParam.push("childCount");
	$zTree.openPath = true;
	// 绑定点击事件，点击左侧某个章节之后修改课件的地址
	$zTree.callback.onClick = function (treeId, parentNode, responseData) {
		//如果切换章节并且点击学习则退出之前学习的章节
		if(cwId_ != initCwId){
			mfw.pageUnload('exit');
		}
		var cwcIdByNow = responseData.id;
		var startingUrl = responseData.starting_url;
		var saveCwId = cwId_;
		if(startingUrl){
			localStorage.setItem("cId",cwcIdByNow);
			$starting_url = startingUrl;
			// 判断是否切换章节
			var changeStatus = changeChapter(saveCwId,cwcIdByNow);
			if('init' == changeStatus){
				mfr.src = "player/player_iframe.html";
				// 调用保存学习轨迹方法（此方法是用来初始化记录用户轨迹方法）
				// param : 课件Id，课件章节Id，学习状态（如果是初始化记录值为：init）
				saveLearningRecord(saveCwId,initCwcId,saveCwcId,'init');
			}else if('same' == changeStatus){
				parent.layer.msg('您正在学习当前章节！', {
					skin: 'layui-layer-lan',
					icon:2,
					title: '提醒',
					time:2000
				});
			}else{
				mfw.pageUnload('save');
				mfr.src = "player/player_iframe.html";
				// 调用保存学习轨迹方法（此方法是用来初始化记录用户轨迹方法）
				// param : 课件Id，课件章节Id，学习状态（如果是初始化记录值为：init）
				saveLearningRecord(saveCwId,initCwcId,saveCwcId,'save');
			}
		}else{
			parent.layer.msg('当前点击章节没有可学习的内容请点击其他章节进行学习！', {
				skin: 'layui-layer-lan',
				icon:2,
				title: '提醒',
				time:2000
			});
		}
	}
	$zTree.onLoadEnd=function(){
		var treeObj = $.fn.zTree.getZTreeObj("chapterTree");
		var treeNodes=treeObj.getNodes();
		var initId;
		// 判断是否学过课件中的课程，从前一次学习的课件章节开始学习。
		if(undefined != initLearningProgress){
			if(0 != initLearningProgress.lastUpdCwcId && undefined != initLearningProgress.lastUpdCwcId){
				initId = initLearningProgress.lastUpdCwcId;
				var nodes = treeObj.getNodesByParam("id",initId , null);
				treeObj.selectNode(nodes[0]);
				treeObj.setting.callback.onClick(null, treeObj.setting.treeId, nodes[0]);
			}
		}else{
			if(undefined != treeNodes){
				//循环寻找节点中第一个出现的有播放地址的章节
				$.each(treeNodes,function(index,item){
					//判断第一个节点是否存在播放地址
					if(undefined != item.starting_url){
						treeObj.selectNode(item);
						treeObj.setting.callback.onClick(null, treeObj.setting.treeId, item);
						return false;
					}else{
						//方法循环寻找第一个有播放地址的章节
						var node = initTreeNote(item);
						treeObj.selectNode(node);
						treeObj.setting.callback.onClick(null, treeObj.setting.treeId,node);
						return false;
					}
				});
			}
		}
	}
	// 加载
	$zTree.init();
	
}

function initTreeNote(item){
	var returnItem;
	//判断传进来的对象是否有播放地址
	if(undefined != item.starting_url){
		returnItem = item;
	}else{
		if(0 < item.childCount){
			//循环寻找子对象中是否有播放地址，没有则用该方法继续钻取接下来的子节点
			$.each(item.children,function(index,child){
				if(undefined != child.starting_url){
					returnItem = child;
					return false;
				}else{
					returnItem = initTreeNote(child);
					return false;
				}
			});
		}
	}
	return returnItem;
}

// ****************************** END - 初始化课件章节树  ******************************//

// 课程章节和课件章节切换
$("#backToCC").on("click",function(){
	$("#chapterTreeDiv").toggle();
	$("#directory").toggle();
	// 将最后一次点击的课件章节转换成要保存的章节Id
	saveCwcId = initCwcId;
});

// 保存学习轨迹
function saveLearningRecord(saveCwId_,initCwcId_,saveCwcId_,doStatus){
	// 区分什么类型的保存学习轨迹 init初始化 save切换章节 exit返回课程章节或者退出该课件
	var execStatus;
	if('exit' == doStatus || 'save' == doStatus){
		execStatus = 'save';
	}else{
		execStatus = 'init';
	}
	
	//下一步Ajax传入的参数
	var data_ = {};
	data_.cwId = saveCwId_;
	data_.initCwcId = initCwcId_;
	data_.cwcId = saveCwcId_;
	data_.excuteStatus = execStatus;
	data_.startLearningTime = startTime;
	data_.stuStatus = stuStatus;
	
	
	
	$.ajax({
		type : "post",
		url : $cc_url + "/learningRecordController/saveLearningRecord.do",
		dataType : "json",
		data : data_,
		sync : false,
		xhrFields: {
			withCredentials: true
		},
		//允许跨域
		crossDomain: true,
		success : function(result) {
		
			
			$('#totalSaveBtn').unbind();
			$('#totalSaveAndExitBtn').unbind();
			$('#totalSaveBtn').click(function () {
	        	totalSave('exit');
	        });
			//保存并且退出
	        $('#totalSaveAndExitBtn').click(function () {
	        	totalSave('exit');
	        	checkShowFun = setInterval('closeTheWindow()',1000);
	        });
			startTime = result.responseData;
			if('exit' == doStatus){
				// 保存总学习记录
				saveLearningProgress(saveCwId_,initCwcId_);
			}
			
			
		}
	});
}

// 保存课件总章节学习记录
function saveLearningProgress(saveCwId_,initCwcId_){
	$('#totalSaveBtn').unbind();
	$('#totalSaveAndExitBtn').unbind();
	var data_ = {};
	data_.cwId = saveCwId_;
	data_.cwcId = initCwcId_;
	data_.currentTime = $currentTime;
	data_.courseId = $('#courseId').val();
	data_.chapterId = $('#chapterId').val();
	$.ajax({
		type : "post",
		url : $cc_url + "/learningRecordController/saveLearningProgress.do",
		dataType : "json",
		data : data_,
		sync : true,
		xhrFields: {
			withCredentials: true
		},
		//允许跨域
		crossDomain: true,
		success : function(result) {
			closeWinCheck = "Y";
			$currentTime = 0;
			$('#totalSaveBtn').click(function () {
	        	totalSave('exit');
	        });
			//保存并且退出
	        $('#totalSaveAndExitBtn').click(function () {
	        	totalSave('exit');
	        	checkShowFun = setInterval('closeTheWindow()',1000);
	        });
	        if(1 == theBtnSave){
				theBtnSave = 0;
			}
	        //修改学习状态
	        var stuStatus = result.responseData;
	        if((undefined != stuStatus && $saveStatusCId != $('#chapterId').val()) || "" == $hours[$saveStatusCId]){
	        	if("1" == stuStatus) {
	        		$("#stuStatus_"+$saveStatusCId).removeClass().addClass("glyphicon glyphicon-adjust");
				} else if("2" == stuStatus) {
					$("#stuStatus_"+$saveStatusCId).removeClass().addClass("full-circle");
				} else if("3" == stuStatus) {
					$("#stuStatus_"+$saveStatusCId).removeClass().addClass("circle");
				}
	        	$saveStatusCId = $('#chapterId').val();
	        }
		},
		error : function(XMLHttpRequest, textStatus,errorThrown) {
			layer.msg('操作失败！<br>服务器访问异常！', {
				skin : 'layui-layer-lan',
				icon : 2,
				title : '警告'
			});
		}
	});
}

function totalSave(doStatus_){
	if(0 == initCwId){
		layer.msg('请点击学习课时之后再保存学习记录');
	}else{
		theBtnSave = 1;
		saveLearningRecord(initCwId,initCwcId,saveCwcId,doStatus_);
	}
}

function sendLessonTrajectory(cwId_,verb_){
	var data_ = {};
	data_.verb = verb_;
	data_.cwId = cwId_;
	$.ajax({
		type : "post",
		url : $cc_url + "/learningRecordController/sendLessonTrajectory.do",
		dataType : "json",
		data : data_,
		xhrFields: {
			withCredentials: true
		},
		//允许跨域
		crossDomain: true,
		success : function(result) {}
	});
}

function checkFileIsExists(startingUrl_){
	var resultStatus = "";
	var data_ = {};
	data_.startingUrl = startingUrl_;
	$.ajax({
		url : startingUrl_,
		type : "HEAD",
		async : false,
		timeout: 3000,
		//允许跨域
		success : function(data) {
			resultStatus = 'isExists';
		},
		error: function() {
			resultStatus = 'notExists';
		}
	});
	return resultStatus;
}
