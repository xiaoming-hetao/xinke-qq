var record_url = "friendsChatLog"; //获取聊天记录
var delRecord_url = "friendsChatLogDelete"; //删除聊天记录
//从登录界面获取用户名
alert("?123".substring(1));
function getQueryVariable(variable) {
  // window.location.search获取页面的url地址(从问号开始，包括问号)
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  }
}
var username = decodeURI(getQueryVariable("username")); //获取url中用户名的值
$("#myself").text(username);

$("#friends_list").on("click", ".friends_name", function () {
  var friends_name = $(this).attr("id"); //获取好友名字
  $("#my_friends").html(friends_name);
  $("#friends_chat").empty();

  //获取聊天记录
  var date = new Date();

  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  if (month < 10) {
    month = "0" + month;
  }
  if (day < 10) {
    day = "0" + day;
  }
  var time = year + "-" + month + "-" + day;

  var data = JSON.stringify({ name: username, friends_name: friends_name, updatetime: time });

  return $.ajax({
    type: "post",
    dataType: "json",
    data: data,
    contentType: "application/json;charset=utf-8",
    url: record_url,
    success: function (res) {
      $.each(res, function (index, item) {
        if (item.towhere == friends_name) {
          //发给朋友的信息显示在右边
          if (item.message != "空" && item.filename == "空") {
            //如果是文字信息照常显示
            var console = document.getElementById("friends_chat");
            var p = document.createElement("p");
            var span = document.createElement("span");
            p.style.wordWrap = "break-word";

            span.innerHTML = item.updatetime;
            p.innerHTML = item.message;
            console.appendChild(span);
            console.appendChild(p);
            $("#friends_chat").find("span").eq(index).css({
              display: "block",
              "max-width": "70px",
              "text-align": "center",
              "font-size": "10px",
              margin: "8px auto",
              padding: "5px",
              "border-radius": "3px"
            });
            $("#friends_chat").find("p").eq(index).css({
              "background-color": "#5fb878",
              "max-width": "120px",
              "margin-left": "300px",
              "margin-top": "8px",
              padding: "5px",
              "overflow-y": "auto",
              "border-radius": "3px"
            });
            console.scrollTop = console.Height;
          }
          if (item.message == "空" && item.filename != "空") {
            var console = document.getElementById("friends_chat");
            var p = document.createElement("p");
            var span = document.createElement("span");
            p.style.wordWrap = "break-word";

            span.innerHTML = item.updatetime;
            p.innerHTML = "文件：" + item.filename + " " + item.url;
            console.appendChild(span);
            console.appendChild(p);
            $("#friends_chat").find("span").eq(index).css({
              display: "block",
              "max-width": "70px",
              "text-align": "center",
              "font-size": "10px",
              margin: "8px auto",
              padding: "5px",
              "border-radius": "3px"
            });
            $("#friends_chat").find("p").eq(index).css({
              "background-color": "#5fb878",
              "max-width": "120px",
              "margin-left": "300px",
              "margin-top": "8px",
              padding: "5px",
              "overflow-y": "auto",
              "border-radius": "3px"
            });
          }
        }
        if (item.towhere == username) {
          //朋友发给自己的信息显示在右边
          if (item.message != "空" && item.filename == "空") {
            var console = document.getElementById("friends_chat");
            var p = document.createElement("p");
            var span = document.createElement("span");
            p.style.wordWrap = "break-word";

            span.innerHTML = item.updatetime;
            p.innerHTML = item.message;
            console.appendChild(span);
            console.appendChild(p);
            $("#friends_chat").find("span").eq(index).css({
              display: "block",
              "font-size": "10px",
              "text-align": "center",
              "max-width": "70px",
              margin: "8px auto",
              padding: "5px",
              "border-radius": "3px"
            });
            $("#friends_chat").find("p").eq(index).css({
              "background-color": "#f2f2f2",
              "max-width": "120px",
              "margin-top": "8px",
              padding: "5px",
              "overflow-y": "auto",
              "border-radius": "3px"
            });
            console.scrollTop = console.Height;
          }
          if (item.message == "空" && item.filename != "空") {
            var console = document.getElementById("friends_chat");
            var p = document.createElement("p");
            var span = document.createElement("span");
            p.style.wordWrap = "break-word";

            span.innerHTML = item.updatetime;
            p.innerHTML = "文件：" + item.filename + " " + item.url;
            console.appendChild(span);
            console.appendChild(p);
            $("#friends_chat").find("span").eq(index).css({
              display: "block",
              "font-size": "10px",
              "text-align": "center",
              "max-width": "70px",
              margin: "8px auto",
              padding: "5px",
              "border-radius": "3px"
            });
            $("#friends_chat").find("p").eq(index).css({
              "background-color": "#f2f2f2",
              "max-width": "120px",
              "margin-top": "8px",
              padding: "5px",
              "overflow-y": "auto",
              "border-radius": "3px"
            });
          }
        }
      });
    }
  });
});
//删除聊天记录
$("#friends_list").on("click", ".del_record", function () {
  var friends_name = $(this).attr("id"); //获取当前要删除的好友的名字
  var del_data = JSON.stringify({ name: username, friends_name: friends_name });
  layer.confirm("确定要删除吗？", { title: "删除聊天记录" }, function (index) {
    $.ajax({
      type: "post",
      dataType: "json",
      data: del_data,
      contentType: "application/json;charset=utf-8",
      url: delRecord_url,
      success: function (res) {
        layer.msg("删除成功", { icon: 1, time: 2000 }, function () {
          layer.close(index);
          $("#friends_chat").empty();
        });
      }
    });
  });
});
