// ==UserScript==
// @name         ZSH网络远程教育脚本
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  没什么可说的，就是避免形式主义方便老百姓
// @author       Wangshengsheng
// @match     https://sia.sinopec.com/secure/player/coursevideo.html?courseId=*&contrUrl=https://sia.sinopec.com*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    alert("脚本已生效");


    $("#totalSaveBtn").after("<li id='wssBtn'>一键立马学完</li>");
    var wssBtn = $("#wssBtn");
    wssBtn.on("click", function test() {
        alert("点击继续");
        //  alert("courseId:"+courseId );
        //  alert(" $cc_url:"+ $cc_url );
        loadChapterUnitTreeForWSS(courseId);


        alert("执行结束");
    });


    //格式化时间格式
    function dateFtt(fmt, date) { //author: meizz
        var o = {
            "M+": date.getMonth() + 1,     //月份
            "d+": date.getDate(),     //日
            "h+": date.getHours(),     //小时
            "m+": date.getMinutes(),     //分
            "s+": date.getSeconds(),     //秒
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度
            "S": date.getMilliseconds()    //毫秒
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }


    //按照该章节的多少来设置学习时长，避免章节很多若设置起始时长过大则导致数据库报错的情况
    function changeStartTimeTo(unitsLength) {
        var beishu = 3;
        if (unitsLength > 10) {
            beishu = 2;
        } else {
            beishu = 3;
        }

        var tWss = new Date();
        tWss.setTime(tWss.getTime() - 1000 * 60 * 60 * beishu);
        var tFormatted = dateFtt("yyyy-MM-dd hh:mm:ss", tWss);
        startTime = tFormatted;
        //     alert("startTime:"+startTime +"    执行");
        console.info("startTime:" + startTime + "    执行");

        return startTime;
    }


    //获取本课程里面的所有章节的cwId
    function loadChapterUnitTreeForWSS(courseId) {
        console.info("课程ID courseId:" + courseId);

        var firstCwId = "0";
        var theChanged = 'N';
        var formData = {};
        formData.courseId = courseId;
        formData.isIssue = 1;
        //  $("#course-item-list").children().remove();;
        $.ajax({
            type: "POST",
            url: $cc_url + "/chapterUnitController/loadChapterUnitTreeForVideo.do",
            dataType: 'json',
            data: formData,
            xhrFields: {
                withCredentials: true
            },
            //允许跨域
            crossDomain: true,
            success: function (data, status) {
                //   console.info("status:"+status);
                //   console.info("data:"+JSON.stringify(data));   //已验证，可得到data
                //    var dataNew = JSON.stringify(data) ;

                var chapterListArr = data.responseData.chapterList;
                //console.info("chapterListArr:"+   JSON.stringify(  chapterListArr ));

                var unitsWSS = chapterListArr[0].units;
                // console.info("units:"+   JSON.stringify(  unitsWSS ));
                //  console.info("length:"+   JSON.stringify(  unitsWSS.length  ));

                //创建修改后需要存入数据库的时间
                var startTimeNew = changeStartTimeTo(unitsWSS.length);
                startTime = startTimeNew;


                //获取子节点
                //  var treeObj = $.fn.zTree.getZTreeObj("chapterTree");
                //  var treeNodes=treeObj.getNodes();
                //  console.info("treeNodes:"+   JSON.stringify(  treeNodes ));
                //	$zTree.async.otherParam = {'cwId':cwId_};


                //循环每一章
                $.each(unitsWSS, function (index, unit) {

                    var $cwIdTemp = unit.objectId;
                    //   alert( "index:"+index+"$cwId:"+$cwIdTemp );

                    var dataForInitCwcId = {};
                    dataForInitCwcId.cwId = $cwIdTemp;


                    var chapteNameWSS = unit.chapteName;

                    //获取每一章下面的每一节
                    $.ajax({
                        type: "post",
                        url: $cc_url + "/playerController/initChapterTree.do",
                        dataType: "json",
                        data: {'cwId': $cwIdTemp},
                        success: function (result) {
                            console.info("result:" + JSON.stringify(result));

                            var nodeArr = result.responseData;


                            $.each(nodeArr, function (i, item) {

                                alert("startTime: " + startTime);
                                saveLearningRecord($cwIdTemp, item.id, item.id, 'save');

                                //  alert(  "第一章课时"+ (index+1) + ":" +chapteNameWSS+"  cwId:"+$cwIdTemp + " 第"+ (i+1)  +"小节:"+item.title +" initCwcId："+ item.id) ;

                                console.info("第一章课时" + (index + 1) + ":" + chapteNameWSS + "  cwId:" + $cwIdTemp + " 第" + (i + 1) + "小节:" + item.title + " initCwcId：" + item.id);

                            });


                        }
                    });


                    /*
                    $.ajax({
                        type : "post",
                        url : $cc_url + "/playerController/initMp4ChapterInfo.do",
                        data : dataForInitCwcId,
                        dataType : "json",
                        xhrFields: {
                            withCredentials: true
                        },
                        //允许跨域
                        crossDomain: true,
                        success : function(result) {

                            console.info(  "课程:"+ chapteNameWSS + "小节:"+( index+1)+"  cwId:"+$cwIdTemp +  "  initCwcId:"+    result.responseData[0].id  );

                        }
                    }) ;
                    */


                });


            }
        });
    }

    //获取每章节的规定时长（暂无用）
    window.setTimeout(function () {
        var $time = $('.vjs-remaining-time-display').text();
        //   alert($time ) ;
    }, 3000);

})();

