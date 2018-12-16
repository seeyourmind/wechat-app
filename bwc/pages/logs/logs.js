//logs.js
const util = require('../../utils/util.js')

Page({
  data: {
    logs: []
  },
  onLoad: function () {
    if (wx.getStorageSync('leavePage') === 'fee') {
      wx.switchTab({
        url: '/pages/parking-fee/parking-fee',
      })
    } else {
      wx.redirectTo({
        url: '/pages/parking-temporary/parking-temporary',
      })
    }
  },
})
