function Influence(){
  this.ajax_method = 'GET';
}
Influence.prototype = {   //获取数据，重新画表
  call_sync_ajax_request:function(url, method, callback){
    $.ajax({
      url: url,
      type: method,
      dataType: 'json',
      async: false,
      success:callback
    });
  },
  Draw_influence:function(data){

	var item_x = data.time_line;
  var item_y = data.influence;
	var conclusion = data.description;

	document.getElementById('saysth').innerHTML = conclusion[0];
	document.getElementById('sayimportant').innerHTML = conclusion[1];
	var dataFixed = [];
	for(i=0;i<item_y.length;i++){
		dataFixed.push(parseFloat(item_y[i].toFixed(2)));
	}
	// var line_chart_dates = [];
	// var line_chart_tomorrow = new Date();
 //    for(var i=0;i<7;i++){
 //      var today = new Date(line_chart_tomorrow-24*60*60*1000*(7-i));
 //      line_chart_dates[i] = today.getFullYear()+"-"+((today.getMonth()+1)<10?"0":"")+(today.getMonth()+1)+"-"+((today.getDate())<10?"0":"")+(today.getDate());
 //    }
    var myChart = echarts.init(document.getElementById('influence_chart')); 
    //console.log(dataFixed);
    var option = {

      tooltip : {
          trigger: 'axis'
      },
      
      toolbox: {
          show : true,
          feature : {
              mark : {show: true},
              dataView : {show: true, readOnly: false},
              magicType : {show: true, type: ['line', 'bar']},
              restore : {show: true},
              saveAsImage : {show: true}
          }
      },
      calculable : false,
      xAxis : [
          {
              type : 'category',
              boundaryGap : true,
              data : item_x
          }
      ],
      yAxis : [
          {
              type : 'value',
              axisLabel : {
                  formatter: '{value} '
              }
          }
      ],
      series : [
          {
              type:'line',
              data:dataFixed,
              markPoint : {
                  data : [
                      {type : 'max', name: '最大值'},
                      {type : 'min', name: '最小值'}
                  ]
              },
              markLine : {
                  data : [
                      {type : 'average', name: '平均值'}
                  ]
              }
          }
          
      ]
    };
        // 为echarts对象加载数据 
        myChart.setOption(option); 
  },

 Draw_get_top_weibo1:function(data){
  var div_name = 'influence_weibo1';
  Draw_get_top_weibo(data, div_name);
  // mid_list1 =[];
  // for(var i=0;i<data.length;i++){
  //   mid_list1.push(data[i][0])
  //   console.log(mid_list);
  // }
  
},
 Draw_get_top_weibo2:function(data){
  var div_name = 'influence_weibo2';
  Draw_get_top_weibo(data, div_name);

},
 Draw_get_top_weibo3:function(data){
  var div_name = 'influence_weibo3';
  Draw_get_top_weibo(data, div_name);
},
 Draw_get_top_weibo4:function(data){
  var div_name = 'influence_weibo4';
  Draw_get_top_weibo(data, div_name);
},
Draw_pie_all0:function(data){
  
    $('#all_re_conclusion').empty();
    var html = '';
    html += '该类用户共有<span style="color:red">'+data.total_number+'</span>人，';
    html += '平均影响力为<span style="color:red">'+data.influence.toFixed(2)+'</span>';
    $('#all_re_conclusion').append(html);
    var div_name = ['re_user_domain_all','re_user_topic_all','re_user_geo_all'];
    Draw_pie(data.domian, div_name[0]);
    Draw_pie(data.geo, div_name[2]);
    Draw_pie(data.topic, div_name[1]);
    var data_set = [];
    data_set.push(data.in_portrait);
    data_set.push(data.out_portrait);
    Influence_motal(data_set, 're_user_in_all', 're_user_out_all', 're_three_pie_all', 're_user_content_all')

    
  },
  Draw_pie_all1:function(data){
    var div_name = ['cmt_user_domain_all','cmt_user_topic_all','cmt_user_geo_all'];
    $('#all_cmt_conclusion').empty();
    var html = '';
    html += '该类用户共有<span style="color:red">'+data.total_number+'</span>人，';
    html += '平均影响力为<span style="color:red">'+data.influence.toFixed(2)+'</span>';
    $('#all_cmt_conclusion').append(html);
    Draw_pie(data.domian, div_name[0]);
    Draw_pie(data.topic, div_name[1]);
    Draw_pie(data.geo, div_name[2]);
    var data_set = [];
    data_set.push(data.in_portrait);
    data_set.push(data.out_portrait);
    Influence_motal(data_set, 'cmt_user_in_all', 'cmt_user_out_all', 'cmt_three_pie_all', 'cmt_user_content_all')
  },

  Draw_basic_influence:function(data){
    $('#influence_conclusion_c').empty();
    var html='';
    html += '该用户<span style="color:red">'+data[0][0]+'</span>。';
    if(data[0][1] != ''){
      //html += data[0][1]+'，'+data[0][2]+'，';
      html += '<span style="color:red">'+data[0][1]+'</span>';
    }
    if(data[1][0] != ''){
      html += '属于<span style="color:red">'+data[1][0]+'</span>。';
    }
    if(data[0][3]!= ''){
      html += data[0][3]+'，'+data[0][4]+'，'+'<span style="color:red">'+data[1][1]+'</span>。';
    }
    if(data[0][5]!= ''){
      html += data[0][5]+'，'+data[0][6]+'，'+'<span style="color:red">'+data[1][2]+'</span>。';
    }
    if(data[0][7]!= ''){
      html += data[0][7]+'，'+data[0][8]+'，'+'<span style="color:red">'+data[1][3]+'</span>。';
    }
    $('#influence_conclusion_c').append(html);  
  },
  
  Draw_user_influence_detail:function(data){
    $('#influence_table').empty();
    var html = '';
    html += '<table class="table table-striped table-bordered bootstrap-datatable datatable responsive" style="font-size:14px;">';
    html += '<tr><th rowspan="2" style="text-align:center;vertical-align:middle;">&nbsp;类别</th>';
    html += '<th colspan="4" style="text-align:center;">转发情况<u id="retweet_distribution" style="font-size:12px;color:#555555;margin-left:20px;cursor: pointer">查看详情</u></th>';
    html += '<th colspan="4" style="text-align:center;">评论情况<u id="comment_distribution" style="font-size:12px;color:#555555;margin-left:20px;cursor: pointer">查看详情</u></th></tr>';
    html += '<tr><th style="text-align:center">转发总数</th><th style="text-align:center">平均数</th><th style="text-align:center">最高数</th><th style="text-align:center">爆发度</th>';
    html += '<th style="text-align:center">评论总数</th><th style="text-align:center">平均数</th><th style="text-align:center">最高数</th><th style="text-align:center">爆发度</th></tr>';
    html += '<tr><th style="text-align:center">原创微博 ('+data['origin_weibo_number']+')</th>';
    html += '<th style="text-align:center">'+data['origin_weibo_retweeted_total_number']+'</th>';
    html += '<th style="text-align:center">'+data['origin_weibo_retweeted_average_number'].toFixed(2)+'</th>';
    html += '<th style="text-align:center">'+data['origin_weibo_retweeted_top_number']+'</th>';
    html += '<th style="text-align:center">'+data['origin_weibo_retweeted_brust_average'].toFixed(2)+'</th>';
    html += '<th style="text-align:center">'+data['origin_weibo_comment_total_number']+'</th>';
    html += '<th style="text-align:center">'+data['origin_weibo_comment_average_number'].toFixed(2)+'</th>';
    html += '<th style="text-align:center">'+data['origin_weibo_comment_top_number']+'</th>';
    html += '<th style="text-align:center">'+data['origin_weibo_comment_brust_average'].toFixed(2)+'</th>';
    html += '</tr>';
    html += '<tr><th style="text-align:center">转发微博 ('+data['retweeted_weibo_number']+')</th>';
    html += '<th style="text-align:center">'+data['retweeted_weibo_retweeted_total_number']+'</th>';
    html += '<th style="text-align:center">'+data['retweeted_weibo_retweeted_average_number'].toFixed(2)+'</th>';
    html += '<th style="text-align:center">'+data['retweeted_weibo_retweeted_top_number']+'</th>';
    html += '<th style="text-align:center">'+data['retweeted_weibo_retweeted_brust_average'].toFixed(2)+'</th>';
    html += '<th style="text-align:center">'+data['retweeted_weibo_comment_total_number']+'</th>';
    html += '<th style="text-align:center">'+data['retweeted_weibo_comment_average_number'].toFixed(2)+'</th>';
    html += '<th style="text-align:center">'+data['retweeted_weibo_comment_top_number']+'</th>';
    html += '<th style="text-align:center">'+data['retweeted_weibo_comment_brust_average'].toFixed(2)+'</th>';
    html += '</tr>';
    html += '</table>';
    $('#influence_table').append(html);

    var html_index='';
    html_index +=  data['order_count'] + '/' +data['total_count'] ;
    //console.log(html_index);
    $('#influence_index').append(html_index);
  },

  Influence_tag_vector:function(data){
    var tag_vector = []
    tag_vector.push('影响力类型');
    tag_vector.push(data);
    global_tag_vector.push(tag_vector); 
  },

  Single_users_influence_re:function(data){
    Influence_motal(data.influence_users, 're_user_in', 're_user_out', 're_three_pie', 're_user_content');
    $('#re_conclusion').empty();
    var html = '该类用户的平均影响力为'+data.influence_distribution.influence;
    $('#re_conclusion').append(html);
    Draw_pie(data.influence_distribution.topic, 're_user_topic');
    Draw_pie(data.influence_distribution.domian, 're_user_domain');
    Draw_pie(data.influence_distribution.geo, 're_user_geo');
  },

  Draw_conclusion:function(data){
    $('#influence_conclusion_all').empty();
    var html = '';
    html += '该用户<span style="color:red">'+ data[0] +'</span>。';
    if(data[1][0]!= ''){
      html += '属于<span style="color:red">'+ data[1][0] +'</span>，';
    };
    if(data[1][1]!= ''){
      html +='<span style="color:red">'+ data[1][1] +'</span>，';
    };
    if(data[1][2]!= ''){
      html +='是<span style="color:red">'+ data[1][2] +'</span>，';
    };
    if(data[1][3]!= ''){
      html +='<span style="color:red">'+ data[1][3] +'</span>，';
    };
    if(data[2] != ''){
      html+= '所影响的领域为';
      var domain_len = data[2].length
      for(var i = 0; i<domain_len-1;i++){
       html += '<span style="color:red">'+ data[2][i]+'</span>、';
       }
      html +='<span style="color:red">'+ data[2][domain_len-1] +'</span>。';
    }
    if(data[3] != ''){
      html+= '影响的话题有';
      var topic_len = data[3].length
      for(var i = 0; i<topic_len-1;i++){
        html += '<span style="color:red">'+ data[3][i]+'</span>、';
      }
       html +='<span style="color:red">'+ data[3][topic_len-1] +'</span>。';
    }
    $('#influence_conclusion_all').append(html);
  },

  Single_users_influence_cmt:function(data){
    Influence_motal(data.influence_users, 'cmt_user_in','cmt_user_out', 'cmt_three_pie', 'cmt_user_content');
    $('#cmt_conclusion').empty();
    var html = '该类用户的平均影响力为'+data.influence_distribution.influence;
    $('#cmt_conclusion').append(html);
    Draw_pie(data.influence_distribution.topic, 'cmt_user_topic');
    Draw_pie(data.influence_distribution.domian, 'cmt_user_domain');
    Draw_pie(data.influence_distribution.geo, 'cmt_user_geo');  
  }
}

  function Influence_motal(data, div_name_in, div_name_out, del_div, del_div_attr){         
    $('#'+div_name_in).empty();

    var html = '';
    //html += '<hr style="margin-top:-10px;">';
    html += '<h4>已入库用户('+data[0].length+')</h4><p style="text-align:left;padding: 0px 10px;width:800px;">';
    if (data[0].length == 0){
      //$('#'+del_div).append('<h4>test</h4>');
      $('#'+del_div).remove();
      $('#'+del_div_attr).css("height", "auto");
      $('#'+del_div_attr).css("overflow-y", "auto");
    }else{
      for (i=0;i<data[0].length;i++){
       var img_src = ''
       if (data[0][i][0] == 'unknown'){
       img_src = 'http://tp2.sinaimg.cn/1878376757/50/0/1';
       }else{
        img_src = data[0][i][0];
       };
       var user_name = '';
       if (data[0][i][1] == 'unknown'){
        user_name = '未知';
       }else{
         user_name = data[0][i][1];
       }
        var user_id = data[0][i][2];
      html += '<span><a target="_blank" href="/index/personal/?uid=' + user_id +'" title="' + user_name +'">';
      html += '<img class="small-photo shadow-5" style="margin:10px 0px 0px 25px;" src="' + img_src + '" title="' + user_name +'">';
      html += '</a></span>';
      }
    }

    html += '</p>';
    $('#'+div_name_in).append(html);

    $('#'+div_name_out).empty();
    var html2 = '';
    html2 += '<hr><h4>未入库用户('+data[1].length+')</h4><p style="text-align:left;padding: 0px 10px;width:800px;">';
    if (data[1].length == 0){
    }else{
      for (i=0;i<data[1].length;i++){
        var img_src = ''
        if (data[1][i][0] == 'unknown'){
          img_src = 'http://tp2.sinaimg.cn/1878376757/50/0/1';
        }else{
          img_src = data[1][i][0];
        };
        var user_name = '';
        if (data[1][i][1] == 'unknown'){
          user_name = '未知';
        }else{
          user_name = data[1][i][1];
        }
        var user_id_out = data[1][i][2];
        html2 += '<span><a target="_blank" href="http://weibo.com/u/' + user_id_out +'" title="' + user_name +'">';
        html2 += '<img class="small-photo shadow-5" style="margin:10px 0px 0px 25px;" src="' + img_src + '" title="' + user_name +'">';
        html2 += '</a></span>';
      }
    }
    html2 += '</p>';
    $('#'+div_name_out).append(html2);
  }

 function Draw_pie(data, div_name){
    if (data.length == 0){
      $('#'+div_name).empty();
      $('#'+div_name).append('<h4 style="margin-top:50%;margin-left:41%;font-size:14px;">暂无数据</h4>');
    }else{
      var myChart = {};
      myChart = echarts.init(document.getElementById(div_name));
      //var data = {'type1':11,'type2':20,'type3':29,'type4':30,'type5':10};
      var data_list = [];
      var data_dict = {};
      for (var i=0; i<data.length; i++){
        data_dict.value = data[i][1].toFixed(2);
        data_dict.name = data[i][0];
        data_list.push(data_dict);
        data_dict = {};
      }
      var option = {
        tooltip : {
          trigger: 'item',
          formatter: "{a} <br/>{b} : {c} ({d}%)"
        },

        calculable : true,
        series : [
        {
          name:'访问来源',
          type:'pie',
          radius : '35%',
          center: ['50%', '45%'],
          itemStyle : {
            normal : {
              label : {
                show : true
              },
              labelLine : {
                show : true,
                length : 100
              }
            },
            emphasis : {
              label : {
                show : false,
                position : 'left',
                textStyle : {
                  fontSize : '14',
                  fontWeight : 'bold'
                }
              }
            }
          },
          data:data_list
        }
        ]
      }; 
      myChart.setOption(option);
    }             
  }

function Draw_get_top_weibo(data,div_name){
  var html = '';
  $('#'+div_name).empty();
    if(data[0][3]==''){
        html += "<div style='width:100%;height:100px;'>用户在昨天未发布任何微博</div>";
    }else{
      html += '<div id="weibo_list" class="weibo_list weibo_list_height scrolls tang-scrollpanel" style="margin:0;">';
      html += '<div id="content_control_height" class="tang-scrollpanel-wrapper" style="margin:0;">';
      html += '<div class="tang-scrollpanel-content" style="margin:0;">';
      html += '<ul>';
      for(var i=0;i<data.length;i++){
        s = (i+1).toString();
        var weibo = data[i]
        var mid = weibo[0];
        var uid = weibo[9];
        var name = weibo[10];
        var date = weibo[5];
        var text = weibo[3];
        var geo = weibo[4];
        var reposts_count = weibo[1];
        var comments_count = weibo[2];
        var weibo_link = weibo[7];
        var user_link = weibo[8];
        var profile_image_url = 'http://tp2.sinaimg.cn/1878376757/50/0/1';
        var repost_tree_link = 'http://219.224.135.60:8080/show_graph/' + mid;
        if (geo==''){
           geo = '未知';
        }
        var user_link = 'http://weibo.com/u/' + uid;
        html += '<li class="item">';
        html += '<div class="weibo_detail" style="width:1000px">';
        html += '<p style="text-align:left;margin-bottom:0;">' +s + '、昵称:<a class="undlin" target="_blank" href="' + user_link  + '">' + name + '</a>(' + geo + ')&nbsp;&nbsp;发布内容：&nbsp;&nbsp;' + text + '</p>';
        html += '<div class="weibo_info"style="width:100%">';
        html += '<div class="weibo_pz">';
        html += '<div id="topweibo_mid" class="hidden">'+mid+'</div>';
        html += '<a class="retweet_count" href="javascript:;" target="_blank">转发数(' + reposts_count + ')</a>&nbsp;&nbsp;|&nbsp;&nbsp;';
        html += '<a class="comment_count" href="javascript:;" target="_blank">评论数(' + comments_count + ')</a></div>';
        html += '<div class="m">';
        html += '<u>' + date + '</u>&nbsp;-&nbsp;';
        html += '<a target="_blank" href="' + weibo_link + '">微博</a>&nbsp;-&nbsp;';
        html += '<a target="_blank" href="' + user_link + '">用户</a>&nbsp;-&nbsp;';
        html += '<a target="_blank" href="' + repost_tree_link + '">转发树</a>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
        html += '</li>';
            }
                                    
    html += '<div id="TANGRAM_54__slider" class="tang-ui tang-slider tang-slider-vtl" style="height: 100%;">';
    html += '<div id="TANGRAM_56__view" class="tang-view" style="width: 6px;">';
    html += '<div class="tang-content"><div id="TANGRAM_56__inner" class="tang-inner"><div id="TANGRAM_56__process" class="tang-process tang-process-undefined" style="height: 0px;"></div></div></div>';
    html += '<a id="TANGRAM_56__knob" href="javascript:;" class="tang-knob" style="top: 0%; left: 0px;"></a></div>';
    html += '<div class="tang-corner tang-start" id="TANGRAM_54__arrowTop"></div><div class="tang-corner tang-last" id="TANGRAM_54__arrowBottom"></div></div>';

    html += '</ul>';
    html += '</div>';
    html += '</div>';
    html += '</div>';   
    }
      $('#'+div_name).append(html);
  }

function choose_dayorweek(url){
}

function click_action(){
  $(".closeList2").off("click").click(function(){
        $("#float-wrap").addClass("hidden");
        $("#re_influence").addClass("hidden");
        $("#cmt_influence").addClass("hidden");
        $("#comment_distribution_content").addClass("hidden");
        $("#retweet_distribution_content").addClass("hidden");
        return false;
      });
      $(".retweet_count").off("click").click(function(){
        $("#float-wrap").removeClass("hidden");
        $("#re_influence").removeClass("hidden");
        var mid = $(this).prev(".hidden").text();
        var influenced_users_url_re = '/attribute/influenced_users/?uid='+parent.personalData.uid+'&date=2013-09-07&style=0&mid='+mid;
        Influence.call_sync_ajax_request(influenced_users_url_re, Influence.ajax_method, Influence.Single_users_influence_re);
        return false;
      });
      $(".comment_count").off("click").click(function(){       
        $("#float-wrap").removeClass("hidden");
        $("#cmt_influence").removeClass("hidden"); 
        var mid = $(this).prev().prev(".hidden").text();
        var influenced_users_url_cmt = '/attribute/influenced_users/?uid='+parent.personalData.uid+'&date=2013-09-07&style=1&mid='+mid;
        Influence.call_sync_ajax_request(influenced_users_url_cmt, Influence.ajax_method, Influence.Single_users_influence_cmt);
        console.log(mid);  
        return false;
      });
      $("#retweet_distribution").off("click").click(function(){
        $("#float-wrap").removeClass("hidden");
        $("#retweet_distribution_content").removeClass("hidden");
        var all_influenced_users_url_style0 = '/attribute/all_influenced_users/?uid='+parent.personalData.uid+'&date=2013-09-07&style=0';
        Influence.call_sync_ajax_request(all_influenced_users_url_style0, Influence.ajax_method, Influence.Draw_pie_all0);
        return false;
      });
      $("#comment_distribution").off("click").click(function(){
        $("#float-wrap").removeClass("hidden");
        $("#comment_distribution_content").removeClass("hidden");
        var all_influenced_users_url_style1 = '/attribute/all_influenced_users/?uid='+parent.personalData.uid +'&date=2013-09-07&style=1';
        Influence.call_sync_ajax_request(all_influenced_users_url_style1, Influence.ajax_method, Influence.Draw_pie_all1);
        return false;
      });

}

var Influence = new Influence();
var influence_url = '/attribute/influence_trend/?uid='+parent.personalData.uid ;
var div_name2=['re_user_domain', 're_user_geo','re_user_topic', 'cmt_user_domain', 'cmt_user_geo', 'cmt_user_topic']
Influence.call_sync_ajax_request(influence_url, Influence.ajax_method, Influence.Draw_influence);


$('input[name="choose_module"]').click(function(){             
  var index = $('input[name="choose_module"]:checked').val();
  console.log(index);
  if(index == 1){
    Influence.call_sync_ajax_request(influence_url, Influence.ajax_method, Influence.Draw_influence);
  }
  else{
    Influence.call_sync_ajax_request(influence_url, Influence.ajax_method, Influence.Draw_influence);    
  }
})

var basic_influence_url = '/attribute/current_influence_comment/?uid='+parent.personalData.uid+'&date=2013-09-07';
Influence.call_sync_ajax_request(basic_influence_url, Influence.ajax_method, Influence.Draw_basic_influence);

var user_influence_detail_url = '/attribute/user_influence_detail/?uid='+parent.personalData.uid+'&date=2013-09-07';
Influence.call_sync_ajax_request(user_influence_detail_url, Influence.ajax_method, Influence.Draw_user_influence_detail);


var all_influenced_users_url_style0 = '/attribute/all_influenced_users/?uid='+parent.personalData.uid+'&date=2013-09-07&style=0';
Influence.call_sync_ajax_request(all_influenced_users_url_style0, Influence.ajax_method, Influence.Draw_all_influenced_users_style0);
var all_influenced_users_url_style1 = '/attribute/all_influenced_users/?uid='+parent.personalData.uid+'&date=2013-09-07&style=1';
Influence.call_sync_ajax_request(all_influenced_users_url_style1, Influence.ajax_method, Influence.Draw_all_influenced_users_style1);

var get_top_weibo_url_style0 = '/attribute/get_top_weibo/?uid='+parent.personalData.uid+'&date=2013-09-07&style=0';
Influence.call_sync_ajax_request(get_top_weibo_url_style0, Influence.ajax_method, Influence.Draw_get_top_weibo1);
var get_top_weibo_url_style1 = '/attribute/get_top_weibo/?uid='+parent.personalData.uid+'&date=2013-09-07&style=1';
Influence.call_sync_ajax_request(get_top_weibo_url_style1, Influence.ajax_method, Influence.Draw_get_top_weibo2);
var get_top_weibo_url_style2 = '/attribute/get_top_weibo/?uid='+parent.personalData.uid+'&date=2013-09-07&style=2';
Influence.call_sync_ajax_request(get_top_weibo_url_style2, Influence.ajax_method, Influence.Draw_get_top_weibo3);
var get_top_weibo_url_style3 = '/attribute/get_top_weibo/?uid='+parent.personalData.uid+'&date=2013-09-07&style=3';
Influence.call_sync_ajax_request(get_top_weibo_url_style3, Influence.ajax_method, Influence.Draw_get_top_weibo4);
var influence_tag_url = '/attribute/current_tag_vector/?uid='+parent.personalData.uid+'&date=2013-09-07';
Influence.call_sync_ajax_request(influence_tag_url, Influence.ajax_method, Influence.Influence_tag_vector);
click_action();
var summary_influence_url = '/attribute/summary_influence/?uid='+parent.personalData.uid+'&date=2013-09-07';
Influence.call_sync_ajax_request(summary_influence_url, Influence.ajax_method, Influence.Draw_conclusion);

      

