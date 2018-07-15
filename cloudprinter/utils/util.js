function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()



  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function getCurDate() {
  var date = new Date(Date.now());
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();

  return year + '-' + month + '-' + day;
}

function getCurTime() {
  var date = new Date(Date.now());
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();

  return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
}

function getSevenDays() {
  var end = new Date(Date.now());
  var start = new Date();
  start.setDate(end.getDate() - 6);

  return [start.Format('yyyy-MM-dd'), end.Format('yyyy-MM-dd')]
}

function getThirtyDays() {
  var end = new Date(Date.now());
  var start = new Date();
  start.setDate(end.getDate() - 29);

  return [start.Format('yyyy-MM-dd'), end.Format('yyyy-MM-dd')]
}

Date.prototype.Format = function (fmt) { //author: meizz 
  var o = {
    "M+": this.getMonth() + 1, //月份 
    "d+": this.getDate(), //日 
    "h+": this.getHours(), //小时 
    "m+": this.getMinutes(), //分 
    "s+": this.getSeconds(), //秒 
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
    "S": this.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}

module.exports = {
  formatTime: formatTime,
  getCurDate: getCurDate,
  getCurTime: getCurTime,
  getSevenDays: getSevenDays,
  getThirtyDays: getThirtyDays
}
