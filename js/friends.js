layui.use(['element','form','layer','laytpl'],function(){
	var element = layui.element;
	var form = layui.form;
	var layer = layui.layer;
	var laytpl = layui.laytpl;

	/*数据接口*/
    var friends_url = 'friendList'; //好友列表
    var newFriends_url = 'friendApply';  //好友申请
    var delFriends_url = 'friendDelete';  //删除好友
    var handleFriends_url = 'friendsHandle';  //处理好友申请
    var addFriends_url = 'friendsAdd';  //添加好友
    

	//从登录界面获取用户名
	function getQueryVariable(variable){
		var query = window.location.search.substring(1);
		var vars = query.split("&");
		for (var i=0;i<vars.length;i++) {
			var pair = vars[i].split("=");
			if(pair[0] == variable){return pair[1];}
		}

	}
    var username = decodeURI(getQueryVariable('username'));//获取url中用户名的值
    $('#myself').text(username);

	//获取好友列表
	function getFriendslist(url){
		var data = JSON.stringify({"name":username});
		return $.ajax({
			type: 'post',
			dataType: 'json',
			data: data,
			contentType: 'application/json;charset=utf-8',
			url: url,
			success:function(res){
				var getFriends_Tpl = $('#friends_Tpl').html();
				laytpl(getFriends_Tpl).render(res,function(html){
					$('#friends_list').html(html);
				});
			}
		})
	}
	setInterval(function(){
		getFriendslist(friends_url);
	},4000);
	
	
	//获取好友申请
	function getNewfriends(url){
		var data = JSON.stringify({"name":username});
		return $.ajax({
			type: 'post',
			dataType: 'json',
			data: data,
			contentType: 'application/json;charset=utf-8',
			url: url,
			success:function(res){
				var getNewfriends_Tpl = $('#newfriends_Tpl').html();
				laytpl(getNewfriends_Tpl).render(res,function(html){
					$('#new_friends').html(html);
				});
			}
		})
	}
	setInterval(function(){
		getNewfriends(newFriends_url);
	},4000);
	

	//删除好友
	$('#friends_list').on('click','.del_friends',function(){
		var friends_name = $(this).attr('id');//获取当前要删除的好友的名字
		var del_data = JSON.stringify({"name":username,"friends_name":friends_name});
		layer.confirm('确定要删除吗？',{title:'删除好友'},function(index){
			$.ajax({
				type: 'post',
				dataType: 'json',
				data: del_data,
				contentType: 'application/json;charset=utf-8',
				url: delFriends_url,
				success:function(res){
					layer.msg('删除成功',{icon:1,time:2000},function(){
						layer.close(index);
						$('#my_friends').html('单聊');
    					$('#friends_chat').empty();
						getFriendslist(friends_url);
						
					});
				}
			})
		});
	});

	//同意好友申请
	$('#new_friends').on('click','.agree',function(){
		var friends_name = $(this).attr('id');//获取当前所选好友申请的id属性（好友名字）
		var status = 1;
		var agree_data = JSON.stringify({"friends_name":friends_name,"code":status,"name":username});

		layer.confirm('确定要同意吗？',{title:'同意好友申请'},function(index){
			$.ajax({
				type: 'post',
				dataType: 'json',
				data: agree_data,
				contentType: 'application/json;charset=utf-8',
				url: handleFriends_url,
				success:function(res){
					layer.msg('已同意该好友申请',{icon:1,time:2000},function(){
						layer.close(index);
						getNewfriends(newFriends_url);
						getFriendslist(friends_url);
					});
				}
			})
		});
	});

	//拒绝好友申请
	$('#new_friends').on('click','.refuse',function(){
		var friends_name = $(this).attr('id');//获取当前所选好友申请的id属性（好友名字）
		var status = 0;
		var refuse_data = JSON.stringify({"friends_name":friends_name,"code":status,"name":username});

		layer.confirm('确定要拒绝吗？',{title:'拒绝好友申请'},function(index){
			$.ajax({
				type: 'post',
				dataType: 'json',
				data: refuse_data,
				contentType: 'application/json;charset=utf-8',
				url: handleFriends_url,
				success:function(res){
					layer.msg('已拒绝该好友申请',{icon:1,time:2000},function(){
						layer.close(index);
						getNewfriends(newFriends_url);
					});
				}
			})
		});
	});

	//添加好友
	$('#add_friends').on('click','.add',function(){
	
		var index = layer.open({
			type: 1,
			skin: 'layui-layer-lan',
			area: ['400px','260px'],
			title: '添加好友',
			content: $('#window'),
			btn: ['添加','取消'],
			yes:function(index,layero){
				var friends_name = $('#window_friends').val();
				var data = JSON.stringify({"friends_name":friends_name,"name":username});
				$.ajax({
					type: 'post',
					dataType: 'json',
					data: data,
					contentType: 'application/json;charset=utf-8',
					url: addFriends_url,
					success:function(res){
						if(res.code==1){
							layer.msg('添加成功,请等待对方通过',{icon:1,time:2000},function(){
								layer.close(index);
							});
						}
						else if(res.code==0){
							layer.msg('已添加该好友',{time:2000},function(){
								//layer.close(index);
							});
						}
						else if(res.code==2){
							layer.msg('已向该用户发送好友申请,请等待对方通过',{time:2000},function(){
								//layer.close(index);
							});
						}
						else{
							layer.msg('该用户不存在',{icon:2,time:2000},function(){
								//layer.close(index);
							});
						}

					}
				})
			}
		});
	});
});