var contentUrl = document.location.protocol + '//' + window.location.hostname+'/secure/';
//****************************** START - 定时器 ******************************//
var c=0;
	var t;
	function timedCount(){
		t=setTimeout("timedCount()",1000);
		document.getElementById('txt').innerHTML=c;
		c=c+1;
	}
	function stopCount(){
		clearTimeout(t);
	}
//****************************** END - 定时器 ******************************//

//****************************** START - 初始化播放器相关数据 ******************************//
	/* 结束的时间 */
	var edTime;
	/* 正在播放的时间 */
	var ingTime;
	/* 播放信息 */
	var playInfo;
	/* 当前暂停的时间 */
	var currentTime;
	/* 总时长 */
	var durationTime;
	/* 已结束 */
	var $isEnd = true;
	/* 显示错误信息页面 */
	var ef = document.getElementById('errorFrame');
	
	function initMp4Player(cwId_){
		/* 初始化课件ID */
		saveCwId = cwId_;
		var data_ = {};
		data_.cwId = cwId_;
		var initMp4PlayerPageInfo;
		$.ajax({
			type : "post",
			url : $cc_url + "/playerController/initMp4ChapterInfo.do",
			data : data_,
			dataType : "json",
			xhrFields: {
				withCredentials: true
			},
			//允许跨域
			crossDomain: true,
			success : function(result) {
				var Data = result.responseData;
				var zNodes;
				for ( var key in Data) {
					if('0' == key){
						initMp4PlayerPageInfo = Data[key];
					}
				}
				if(undefined != initMp4PlayerPageInfo && '' != initMp4PlayerPageInfo.id){
					var fileUrl = initMp4PlayerPageInfo.starting_url;
					var fileType = fileUrl.substring(fileUrl.lastIndexOf('.') + 1);
					fileType.toLowerCase();
					fileType = fileType.toLowerCase();
					if('mp4' == fileType){
						$("#scormPlayer").hide();
						$("#chapterTreeDiv").hide();
						var existsStatus = checkFileIsExists(contentUrl + fileUrl);
						if("isExists" == existsStatus){
							$("#errorFrameDiv").hide();
							$("#MP4Player").show();
							$Resize.init($('#theMp4Video'));
							$("#directory").show();
							initCwcId = initMp4PlayerPageInfo.id;
							saveCwcId = initMp4PlayerPageInfo.id;
							videojs("theMp4Video").ready(function(){
								myPlayer = this;
								if('' != initMp4PlayerPageInfo.starting_url && undefined != initMp4PlayerPageInfo.starting_url){
									saveLearningRecord(saveCwId,initCwcId,saveCwcId,'init');
									var startUrl = initMp4PlayerPageInfo.starting_url;
									myPlayer.src(contentUrl + startUrl);
									if(undefined != initLearningProgress){
										if(undefined != initLearningProgress.currentTime && '' != initLearningProgress.currentTime){
											var videoObj = document.getElementById(myPlayer.el_.firstChild.id);
											videoObj.addEventListener('loadedmetadata',function(){
												videoObj.currentTime = initLearningProgress.currentTime;
											}, false);
										}
									}
									myPlayer.play();
								}else{
									layer.msg('当前学习课件没有可播放的内容！', {
										skin: 'layui-layer-lan',
										icon:2,
										title: '提醒'
									});
								}
							});
						}else{
							$("#errorFrameDiv").show();
							ef.src = "player/404.html";
						}
					}else{
						courseWareType = 'scorm';
						// 初始化chapterTree
						initChapterTree(cwId_);
						// 显示播放页面
						$("#MP4Player").hide();
						$("#scormPlayer").show();
						$("#directory").hide();
						$("#chapterTreeDiv").show();
					}
				}else{
						layer.msg('当前学习课件没有可播放的内容！', {
							skin: 'layui-layer-lan',
							icon:2,
							title: '提醒'
						});
				}
			}	
		});
		
		//当鼠标拖动进度条时触发事件
//		myPlayer.on("seeking",function(){
//			ingTime = myPlayer.currentTime();
//			durationTime = myPlayer.duration();
//			sendLessonTrajectory(cwId_,"progressed");
//		});
		myPlayer.on("timeupdate", function(){  
			ingTime = myPlayer.currentTime();
			$currentTime = myPlayer.currentTime();
		});
		myPlayer.on('ended', function () {
			if(0 != initCwcId){
				if (myPlayer.duration() != 0 && myPlayer.currentTime() === myPlayer.duration() && $isEnd) {
					$isEnd = false;
					$currentTime = myPlayer.currentTime();
					$currentTime = 0;
					//播放完成之后切换课时并且刷新目录
					changeHours();
				}
			}
		});
		//保存学习记录按钮执行保存操作
		$("#exitBtn").click(function(){
			saveLearningRecord(saveCwId,initCwcId,saveCwcId,'save');
		});
	}
// ****************************** END - 初始化播放器相关数据 ******************************//