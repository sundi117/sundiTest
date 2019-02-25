var closeWinCheck = "N"; 
var checkShowFun;
var ccCwid = 0;
var isChangeChapter = 'init';
var $cc_url = decodeURI(GetQueryString("contrUrl") , "UTF-8");
var $starting_url;
//对参数进行解密
var courseId=GetQueryString("courseId");
var courseName=decodeURI(GetQueryString("courseName") , "UTF-8");
$('#courseId').val(courseId);
$('#courseName').html(courseName);
$('#courseName').attr({
	"title": courseName
});
if(268 < Number($('#courseName').width())) {
	$('#courseName').css({
		"width": "300px"
	});
}

$(document).attr("title",courseName+"课程学习");
//加载课时章节树
loadChapterUnitTree($('#courseId').val());

//获取url路径中的参数
function GetQueryString(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	var r = window.location.search.substr(1).match(reg);
	if(r != null) return unescape(r[2]);
	return null;
}

//返回按钮
function goBack(){
	window.location.href = document.referrer;
}

//右侧信息栏效果
$(document).ready(function() {
	window.onbeforeunload = function(e) {
    	console.log("保存学习记录成功");
    	totalSave('exit');
    	return "saveLearningProgress";
    };
	//右侧信息栏内容的高度等于窗口的高度
	 var heightContent;
     heightContent = $(window).height() - $('.information-content-top').outerHeight();
     $('.information-content-main').css("height", heightContent);
	//点击/滑过事件
    $('.buttons ul li ').click(function () {
        $(this).addClass('select-bgc').siblings().removeClass('select-bgc');
        $(".information ").css({
            'transform': 'translateX(-370px)',
            'transition': 'all 1s ease 0s',
        });
    });
    //关闭操作
    $('.information-content-top i ').click(function () {
        $(".information ").css({
            'transform': 'translateX(0px)',
            'transition': 'all 1s ease 0s',
        });
        $('.buttons ul li ').removeClass('select-bgc');
    });
	//切换内容
	$('.buttons ul li ').click(function() {
		var index = $(this).index();
		$(".information-content ").eq(index).show().siblings().hide();
	});
	//保存学习记录
	$('#totalSaveBtn').click(function() {
		$('#totalSaveBtn').unbind();
		totalSave('exit');
	});
	//保存并且退出
	$('#totalSaveAndExitBtn').click(function() {
		$('#totalSaveAndExitBtn').unbind();
		totalSave('exit');
		checkShowFun = setInterval('closeTheWindow()', 1000);
	});
});

function closeTheWindow() {
	if("Y" == closeWinCheck) {
		clearInterval(checkShowFun);
		window.close();	
	}
}
$(document).ready(function () {
	//目录/笔记/讨论 tab栏切换
	$(".videotab li").on("click", function() {
		var index = $(this).index();
		var tabclass = ".tab" + parseInt(index + 1);
		$(tabclass).show().siblings().hide();
		$(this).addClass("active-color").siblings().removeClass("active-color");
	});
});

//加载章节树
function loadChapterUnitTree(courseId) {
	var firstCwId = "0";
	var theChanged = 'N';
	var formData = {};
	formData.courseId = courseId;
	formData.isIssue = 1;
	$("#course-item-list").children().remove();;
	$.ajax({
		type: "POST",
		url: $cc_url+"/chapterUnitController/loadChapterUnitTreeForVideo.do",
		dataType: 'json',
		data: formData,
		xhrFields: {
			withCredentials: true
		},
		//允许跨域
		crossDomain: true,
		success: function(data, status) {
			/*
			"responseCode": "200",
			"responseData": {
			"chapterList": [{
						"chapteName": "管理定律集锦",
						"chapterId": 320355,
						"chapterTempId": "320355",
						"courseId": 189623483,
						"creTime": 1547519814000,
						"creUserId": 1102286,
						"creUserName": "赵姗姗",
						"isDel": 0,
						"isIssue": 1,
						"nodeType": 0,
						"parentId": -1,
						"parentTempId": "-1",
						"sort": 0,
						"units": [{
							"chapteName": "蓝斯登定律：给员工快乐的工作环境",
							"chapterId": 224795,
							"chapterTempId": "224795",
							"courseId": 189623483,
							"creTime": 1547520117000,
							"creUserId": 1102286,
							"creUserName": "赵姗姗",
							"credit": "0.5",
							"cw_hours": "0.5",
							"fileId": "",
							"hcType": 1,
							"isDel": 0,
							"isIssue": 1,
							"nodeType": 2,
							"objectId": 551614158,
							"parentId": 320355,
							"parentTempId": "320355",
							"sort": 2,
							"stuStatus": 2,
							"units": [],
							"updTime": 1547522060000,
							"updUserId": 1102286,
							"updUserName": "赵姗姗",
							"userId": 549079
			*/
			
			
			if(data && data.success) {
				var chapters = data.responseData;
				var studyInfo = chapters.lastStudyInfo;
				var chapterHtml = '';
				var c= 1;
				var $chapterId;
				var $chapterName;
				var $cwId;
				var $hcType;
				$.each(chapters.chapterList,function(index, item) {
					
					
					
					
					
					
					var u= 1, h = 1;
					//加载章
					chapterHtml += '<div class="chapter" style="position: relative">';
					chapterHtml += readChapterUnitHtml(item.nodeType, item,'none',c);
					//加载节
					$.each(item.units, function(index, unit) {
						var k = 1;
						var hourShowType = 'none';
						if(undefined != unit.hcType) {
							hourShowType = unit.hcType;
							//如果记录有学习过的章节信息则播放章节下的课时
							if(undefined != studyInfo.lastStudyId) {
								firstCwId = studyInfo.lastStudyId;
								if(firstCwId == unit.objectId && "1" == unit.hcType) {
									theChanged = 'Y';
									$chapterId = unit.chapterId;
				    				$chapterName = unit.chapteName;
				    				$cwId = firstCwId;
				    				$hcType = unit.hcType
								}
							} else if(theChanged == 'N' && "1" == unit.hcType) {
								theChanged = 'Y';
								$chapterId = unit.chapterId;
			    				$chapterName = unit.chapteName;
			    				$cwId = unit.objectId;
			    				$hcType = unit.hcType
							}
						}
						chapterHtml += '<li>';
						if(unit.nodeType == 1) {
							chapterHtml += readChapterUnitHtml(unit.nodeType, unit, hourShowType, u);
							u++;
						}else{
							chapterHtml += readChapterUnitHtml(unit.nodeType, unit,hourShowType,h);
							h++;
						}
						//加载课时
						$.each(unit.units, function(index, hour) {
							//如果记录有学习过的章节信息则播放章节下的课时
							if(undefined != studyInfo.lastStudyId) {
								firstCwId = studyInfo.lastStudyId;
								if(firstCwId == hour.objectId && "1" == hour.hcType) {
									theChanged = 'Y';
									$chapterId = hour.chapterId;
				    				$chapterName = hour.chapteName;
				    				$cwId = firstCwId;
				    				$hcType = hour.hcType
								}
							} else if(theChanged == 'N' && "1" == hour.hcType) {
								theChanged = 'Y';
								$chapterId = hour.chapterId;
			    				$chapterName = hour.chapteName;
			    				$cwId = hour.objectId;
			    				$hcType = hour.hcType
							}
							chapterHtml += readChapterUnitHtml(hour.nodeType, hour,hour.hcType,k);
							k++;
						});
						chapterHtml+='</li>';
					});
					chapterHtml+='</div>';
					c++;
				});
				$("#course-item-list").append(chapterHtml);
				$(".chapter:not(:first-child) ul").hide();
				if(undefined != $cwId && '' != $cwId && undefined != $hcType && '1' == $hcType) {
					playHour($chapterId, $chapterName, $hcType, $cwId);
				}
			} else {
				layer.alert('加载章节树失败！<br>' + data.responseMessage, {
					icon: 2,
					//图标样式
					title: '警告'
				})
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			layer.msg('访问服务器失败。');
		}
	});
}
//根据type决定加载章或者节的Html
function readChapterUnitHtml(type, chapter,hcType_,number) {
	var str;
	if(type == 0) { //章
		str = readChapterHTML(chapter, number);
	} else if(type == 1) { //小节
		str = readUnitHTML(chapter, number);
	} else { //课时
		str = readHourHTML(chapter,hcType_,number);
	}
	return str;
}

/**
 * 加载章
 * @param chapter 章节课时
 * @returns {String} 拼接好的内容
 */
function readChapterHTML(chapter, number) {
	if(number > 1) {
		var x = 'down';
	} else {
		var x = 'up';
	}
	var str = '<h5 style="width:360px;overflow:hidden;" title="' + chapter.chapteName + '">第 <span class="number">' + number + '</span> 章：' + chapter.chapteName + '<i id=\'i_' + chapter.chapterId + '\' onclick=showChapter(' + chapter.chapterId + ',0) class="glyphicon glyphicon-menu-' + x + ' glyphicon-title fr" style="line-height:46px;position:absolute;right:10.5px;"></i></h5>' +
		'<ul class="glyphicon-title-ul" id=' + chapter.chapterId + '><li>';
	return str;
}

/**
 * 加载节
 * @param chapter 章节课时
 * @returns {String} 拼接好的内容
 */
function readUnitHTML(chapter, number) {
	var str = '<div class="section" style="width:360px;overflow:hidden;" title="' + chapter.chapteName + '">第 <span class="number">' + number + '</span> 节：' + chapter.chapteName +
		'<i id=\'i_' + chapter.chapterId + '\' onclick=showChapter(' + chapter.chapterId + ',1) class="glyphicon glyphicon-menu-up glyphicon-menu-up-1"></i></div>';
	return str;
}

/**
 * 加载课时
 * @param chapter 章节课时
 * @returns {String} 拼接好的内容
 */
function readHourHTML(chapter,hcType_,number) {
	var $circle = "";
	if("1" == hcType_) {
		if(undefined == chapter.stuStatus) {
			$circle = '<i class="circle"></i>';
		} else {
			if("2" == chapter.stuStatus) {
				$circle = '<i class="glyphicon glyphicon-adjust"></i>';
			} else if("1" == chapter.stuStatus) {
				$circle = '<i class="full-circle"></i>';
			} else if("3" == chapter.stuStatus) {
				$circle = '<i class="circle"></i>';
			}
		}
	}
	var str = '<div onclick="playHour(' + chapter.chapterId + ',\'' + chapter.chapteName + '\',\'' + hcType_ + '\',\'' + chapter.objectId + '\')"  class="period" style="cursor:pointer;width:360px;overflow:hidden;" title="' + chapter.chapteName + '" name=' + chapter.parentId + '> 课时' +
		'<span class="number">' + number + '-</span>' + chapter.chapteName + $circle + '</div>';
	return str;
}

function showChapter(id, type) {
	if(type == 0) {
		$("#" + id).toggle();
	} else {
		$("div[name=" + id + "]").toggle();
	}
	if($('#i_' + id).hasClass("glyphicon-menu-up")) {
		$('#i_' + id).removeClass("glyphicon-menu-up").addClass("glyphicon-menu-down");
	} else {
		$('#i_' + id).removeClass("glyphicon-menu-down").addClass("glyphicon-menu-up");
	}
	 if($('#i_'+id).hasClass("glyphicon-menu-up")){
         $('#i_'+id).removeClass("glyphicon-menu-up").addClass("glyphicon-menu-down");
     }else{
         $('#i_'+id).removeClass("glyphicon-menu-down").addClass("glyphicon-menu-up");
     }
}

function  initCourseNote(data){
	$('#noteDiv').children().remove();
	var results = data.responseData.datas;
	for(var i = 0; i < results.length; i++) {
		var str = '<div class="list"><div class="title"><h5>' + results[i].chapteName + '</h5>' +
			'<span class="time"><span class="date">' + new Date(results[i].creTime).pattern("yyyy-MM-dd") + '</span><span class="hour">' + new Date(results[i].creTime).pattern("HH:mm") + '</span></span>' +
			'</div>' +
			'<p title="">' + results[i].noteContent + '</p></div>';
		$('#noteDiv').append(str);
	} 
}
	
//保存笔记 
function saveMyNote(){
	var obj={};
	obj.courseId = $('#courseId').val();
	obj.noteContent = $('#noteContent').val();
	obj.chapterId = $('#chapterId').val();
	obj.chapteName = $('#chapteName').html();
	if(obj.noteContent != '' && obj.noteContent != null && obj.chapterId != null && obj.chapterId != '') {
		$.ajax({
			type: "POST",
			url: $cc_url + "/coursePreviewController/saveMyNoteBycourseId.do",
			data: obj,
			dataType: 'json',
			xhrFields: {
				withCredentials: true
			},
			//允许跨域
			crossDomain: true,
			success: function(result) {
				if(result && result.success && result.responseData) {
					note();
					$('#noteContent').val('');
				} else {
					layer.msg('加载失败！请联系管理员');
				}
			}
		});
	}else{
		layer.msg('笔记为空或者未选择课时,无法保存！');
	}
}

//课程笔记
function note() {
	var courseId = $("#courseId").val();
	var pages = 1;
	var sizes = 5;
	var queryUrl = $cc_url + "/coursePreviewController/queryCourseNoteInfo.do";
	$.ajax({
		url: queryUrl,
		type:'post',
		dataType: 'json',
		data: {courseId : courseId,page:pages,size:sizes},
		xhrFields: {
			withCredentials: true
		},
		//允许跨域
		crossDomain: true,
		success: function(result) {
			if(result && result.success && result.responseData) {
				if(result.responseData.datas != undefined) {
					if(result.responseData.datas.length > 0) {
						initCourseNote(result);
						$.jqPaginator('#page2', {
							totalCounts: result.responseData.totalRecordNums,
							pageSize: 5,
							currentPage: 1,
							visiblePages: 1,
							disableClass: 'disabled',
							first: '<li class="first"><a href="javascript:;">首页</a></li>',
							last: '<li class="last"><a href="javascript:;">尾页</a></li>',
							prev: '<li class="prev"><a href="javascript:;">上一页</a></li>',
							next: '<li class="next"><a href="javascript:;">下一页</a></li>',
							page: '<li class="page"><a href="javascript:;">{{page}}</a></li>',
							onPageChange: function(page, type) {
								if(type == 'change') {
									$.ajax({
										url : queryUrl,
										type:'POST',
										dataType: 'json',
										data : {page : page,size : 5,courseId : courseId},
										cache : false,
										xhrFields: {
						        			withCredentials: true
						        		},
						        		//允许跨域
						        		crossDomain: true,
										success : function(data) {
											initCourseNote(data);
										},
										error : function(html) {
											layer.msg('课程笔记加载失败！请联系管理员',{icon:2,title:'警告'});
										}
									});
								}
							}  
						});
					}
				}
			} else {
				layer.msg('加载失败！请联系管理员',{icon:2,title:'警告'});
			}
		}
	});
}
//发表讨论
function published(){
	var obj={};
	obj.disContent = $('#disContent').val();
	obj.courseId = $('#courseId').val();
	if(obj.disContent != '' && obj.disContent != null) {
		$.ajax({
			url: $cc_url + "/coursePreviewController/saveCourseDiscussById.do",
			type: "POST",
			dataType: 'json',
			data: obj,
			xhrFields: {
    			withCredentials: true
    		},
    		//允许跨域
    		crossDomain: true,
			success: function(result) {
				if(result && result.success && result.responseData) {
					discuss();
					$('#disContent').val('');
				}else{
					layer.msg('加载失败！请联系管理员');	
				}
			}
	});
	}else{
		layer.msg('评论为空,无法发表！');
	}
}

//课程预览讨论
function discuss() {
	var courseId = $("#courseId").val();
	var pages = 1;
	var sizes = 5;
	var queryUrl = $cc_url + "/coursePreviewController/queryCourseDiscussInfo.do";
	$.ajax({
		url: queryUrl,
		type:'POST',
		dataType: 'json',
		data: {courseId : courseId,page:pages,size:sizes},
		xhrFields: {
			withCredentials: true
		},
		//允许跨域
		crossDomain: true,
		success: function(result) {
			if(result && result.success && result.responseData) {
				if(result.responseData.datas != undefined) {
					if(result.responseData.datas.length > 0) {
						initCourseDiscuss(result.responseData.datas);
						$.jqPaginator('#page3', {
							totalCounts: result.responseData.totalRecordNums,
							pageSize: 5,
							currentPage: 1,
							visiblePages: 1,
							disableClass: 'disabled',
							first: '<li class="first"><a href="javascript:;">首页</a></li>',
							last: '<li class="last"><a href="javascript:;">尾页</a></li>',
							prev: '<li class="prev"><a href="javascript:;">上一页</a></li>',
							next: '<li class="next"><a href="javascript:;">下一页</a></li>',
							page: '<li class="page"><a href="javascript:;">{{page}}</a></li>',
							onPageChange: function(page, type) {
								if(type == 'change') {
									$.ajax({
										url : queryUrl,
										type:'post',
										dataType: 'json',
										data : {
											page : page,
											size : 5,
											courseId : courseId
										},
										cache : false,
										xhrFields: {
						        			withCredentials: true
						        		},
						        		//允许跨域
						        		crossDomain: true,
										success : function(data) {
											initCourseDiscuss(data.responseData.datas);
										},
										error : function(html) {
											layer.msg('课程讨论加载失败！请联系管理员',{icon:2,title:'警告'});
										}
									});
								}
							}  
						});
					}
				}
			} else {
				layer.msg('加载失败！请联系管理员',{icon:2,title:'警告'});
			}
		}
	});
}

//点击进入考试
function turnToExam(examId){
	$.ajax({
        url: $cc_url+"/signatureController/getSignatureInfo.do",
        type: "POST",
        data : {'content' : 'test','host' : null},
        async: false,
        xhrFields: {
			withCredentials: true
		},
		//允许跨域
		crossDomain: true,
		success: function(data) {
			if(data != null) {
				var data = $.parseJSON(data);
				var tempData = data.responseData;
				if(null != tempData) {
					var datas = tempData;
					ac_url = datas.ac_url;
					var url = ac_url + "/pages/exam/my_exam.html?examId=" + examId + "&nounExtendLogo=course";
					window.open(url, 'user_exam', "width=" + (window.screen.availWidth - 10) + ",height=" + (window.screen.availHeight - 60) + ",top=0,left=0,toolbar=yes,menubar=yes,scrollbars=yes,resizable=no,location=no,status=yes");
				}
			}
        }
      });
}

function initCourseDiscuss(results){
	$('#discussDiv').html("");
	for(var i = 0; i < results.length; i++) {
		var str = '<div class="item clearfix"><div class="fl imgbox"><img src="../../images/pic_02.png" alt="" height="40" width="40"></div>' +
			'<div class="fl itemcotent"><div><span class="name">' + results[i].userName + '</span><span class="statu">发表于' + new Date(results[i].creTime).pattern("yyyy-MM-dd HH:mm") + '</span></div>' +
			'<p title="' + results[i].disContent + '">' + results[i].disContent + '</p></div></div>';
		$('#discussDiv').append(str);
	} 
}

function updateLastStudy(courseId_,cwId_){
	var data_ = {};
	data_.courseId = courseId_;
	data_.lastStudyId = cwId_;
	$.ajax({
		url : $cc_url + "/courseScoreController/updateCourseScoreLastStudy.do",
		type : "post",
		data : data_,
		dataType: 'json',
		xhrFields: {
			withCredentials: true
		},
		//允许跨域
		crossDomain: true,
		success : function(data) {}
	});
}

function playHour(chapterId,chapteName,hcType_,cwId_){
	$('#chapteName').html(chapteName);
	$('#chapteName').attr({
		"title": chapteName
	});
	if(150 < Number($('#chapteName').width())) {
		$('#chapteName').css({
			"width": "150px"
		})
	}
	$('#chapterId').val(chapterId);
	if("1" == hcType_) {
		updateLastStudy($('#courseId').val(), cwId_);
		initPlayerInfo(cwId_);
	} else if("2" == hcType_) {
		turnToExam(cwId_);
	}
}