const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function nonceStr(length = 32) {
  var chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  var str = "";
  for (var i = 0; i < length; i++) {
    str = str + chars[parseInt(Math.random() * (chars.length))];
  }
  return str;
}

module.exports = {
  formatTime: formatTime,
  getNonceStr: nonceStr
}
