
layui.use(['laytpl'],function() {

    var laytpl = layui.laytpl;


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


//从登录界面获取用户名
    function getQueryVariable(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (pair[0] == variable) {
                return pair[1];
            }
        }

    }

    var username = decodeURI(getQueryVariable('username'));//获取url中用户名的值
    $('#myself').text(username);

    /*获取信息发送与接收时间*/
    function getChattime() {
        var date = new Date();

        var hours = date.getHours();
        var minutes = date.getMinutes();
        if (hours < 10) {
            hours = '0' + hours;
        }
        if (minutes < 10) {
            minutes = '0' + minutes;
        }
        var time = hours + ":" + minutes;

        return time;
    }

//收发信息
    var websocket = null;
//刷新页面时请求好友列表
    getNewfriends('friendApply');
    getFriendslist('friendList');

//判断当前浏览器是否支持WebSocket
    function connect() {
        if ('WebSocket' in window) {
            websocket = new WebSocket('ws://106.54.251.66:8080/websocket/' + username);
        }
        else {
            layer.msg('您的浏览器并不支持WebSocket，请更换浏览器！', {icon: 2, time: 3000});
        }


        //连接发生错误的回调方法
        websocket.onerror = function () {
            layer.msg('WebSocket连接发生错误！', {icon: 2, time: 3000});

        };

        //连接成功建立的回调方法
        websocket.onopen = function () {
            console.log("WebSocket连接成功");

        }

        //接收到消息的回调方法
        websocket.onmessage = function (message) {
            //（信息）字符串切割
            var str = message.data; //后台发来的信息格式:群聊:from:lpc:message:123
            var arr1 = str.split(':');
            var arr2 = arr1[0];//切割群聊/单聊
            var arr3 = arr1[2];//谁发来的
            var arr4 = arr1[4];//信息
            if (arr2 == '群聊') {        //群聊信息
                var console = document.getElementById('group_chat');
                var p = document.createElement('p');
                var span = document.createElement('span');

                //接收内容
                p.setAttribute('id', 'myp');//给p标签加样式（index.css）
                p.innerHTML = arr3 + ":" + arr4;

                //接收时间
                var time = getChattime();

                span.setAttribute('id', 'myspan');//给span标签加样式（index.css）
                span.innerHTML = time;

                console.appendChild(span);
                console.appendChild(p);
                console.scrollTop = console.scrollHeight;
            }else if (arr2 == '系统') {
                setTimeout(function(){getNewfriends('friendApply')},1000);
                setTimeout(function(){getFriendslist('friendList')},1000);
                if (arr1[1] == '添加好友') {
                    alert('您收到了一条好友请求');
                }
                if(arr1[1]=='拒绝'){
                    alert('对方拒绝了您的好友请求');
                }
                if(arr1[1]=='同意'){
                    alert('对方接受了您的好友请求');
                }
            } else {   //单聊信息
                $('#my_friends').html(arr3);
                var console = document.getElementById('friends_chat');
                var p = document.createElement('p');
                var span = document.createElement('span');
                //接收内容
                p.setAttribute("id", "myp");//给p标签加样式
                p.innerHTML = arr4;

                //接收时间
                var time = getChattime();

                span.setAttribute('id', 'myspan');
                span.innerHTML = time;

                console.appendChild(span);
                console.appendChild(p);
                console.scrollTop = console.scrollHeight;
            }

        }

        //连接关闭的回调方法
        websocket.onclose = function () {
            $('#group_textarea').onkeydown = null;
            $('#friends_textarea').onkeydown = null;
            console.log("WebSocket连接已关闭");
        }

        //监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
        window.onbeforeunload = function () {
            closeWebSocket();
        }


    };
    connect();
//回车发送信息
    $('#group_textarea').onkeydown = function (event) {
        if (event.keyCode == 13) {
            if ($('#group_textarea').val() != '') {
                sendGroupMessage();
            }
        }
    };
    $('#friends_textarea').onkeydown = function (event) {
        if (event.keyCode == 13) {
            if ($('#friends_textarea').val() != '') {
                sendMessage();
            }
        }
    };


//单聊		    
    function sendMessage() {
        var name = $('#my_friends').html();
        if ($('#friends_textarea').val() != '') {
            //获取要发送的信息
            var msg = $('#friends_textarea').val();
            msg = "{\"To\":\"" + name + "\",\"msg\":\"" + msg + "\"}";
            if (msg != '') {
                websocket.send(msg);
                $('#friends_textarea').val('');//点击发送后，清空输入框内容

                //var arr = msg.split(':');
                var data = jQuery.parseJSON(msg);
                showMessage(data.msg);
            }

        }
    }

    $('#sendTofriends').on('click', function () {
        sendMessage();
    });


//群聊
    function sendGroupMessage() {
        var name = $('#group_friends').html();
        if ($('#group_textarea').val() != '') {
            //获取要发送的信息
            var msg = $('#group_textarea').val();
            msg = "{\"To\":\"" + name + "\",\"msg\":\"" + msg + "\"}";
            if (msg != '') {
                websocket.send(msg);
                $('#group_textarea').val('');//点击发送后，清空输入框内容
                var data = jQuery.parseJSON(msg);
                showGroupMessage(data.msg);
            }
        }
    }

    $('#sendTogroup').on('click', function () {
        sendGroupMessage();
    });


    function showMessage(message) {
        //$('#my_friends').html(name);//发送信息后，好友接受界面的单聊文字变为发送信息的好友的名字

        var console = document.getElementById('friends_chat');

        var p = document.createElement('p');
        var span = document.createElement('span');

        //发送内容
        p.setAttribute('id', 'myp');
        p.style['background-color'] = '#5fb878';
        p.style['margin-left'] = '300px';

        p.innerHTML = message;

        //发送时间
        var time = getChattime();

        span.setAttribute('id', 'myspan');
        span.innerHTML = time;

        console.appendChild(span);
        console.appendChild(p);

        console.scrollTop = console.scrollHeight;

    }

    function showGroupMessage(message) {
        var console = document.getElementById('group_chat');
        var p = document.createElement('p');
        var span = document.createElement('span');

        //发送内容
        p.setAttribute('id', 'myp');
        p.style['background-color'] = '#5fb878';
        p.style['margin-left'] = '300px';

        p.innerHTML = message;

        //发送时间
        var time = getChattime();

        span.setAttribute('id', 'myspan');
        span.innerHTML = time;

        console.appendChild(span);
        console.appendChild(p);

        console.scrollTop = console.scrollHeight;

    }
});