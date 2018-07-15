// pages/applynote/internship/internship2.js
var SERVERURL = getApp().globalData.SERVERURL;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    internshipList:[],
    identifyList:[],
    prevSubmitData: {},
    loadinghidden: true,
    haveTwo: false,
    file1_is_new: false,
    file2_is_new: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    console.log('option: ', options);
    let item = JSON.parse(options.data);
    var file1 = 'internshipList[0]';
    var file2 = 'identifyList[0]';
    that.setData({
      prevSubmitData: item,
      [file1]: 'https://evenif.top/image_files/'+options.file1,
      [file2]: 'https://evenif.top/image_files/'+options.file2,
      user_modified_formdata: options.user_modified,
      haveTwo: true
    });
    console.log('show tha page data: ', that.data)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },

  /**
   * 获取图片管理器
   */
  chooseImage: function (e) {
    var buttonID = e.currentTarget.id;
    var that = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        console.log('chooseImage res--->', res)
        var tempFilePaths = res.tempFilePaths;
        var tempFiles = res.tempFiles;
        switch (buttonID) {
          case '1':
            that.setData({
              internshipList: tempFilePaths,
              internshipFiles: tempFiles
            });
            break;
          case '2':
            that.setData({
              identifyList: tempFilePaths,
              identifyFiles: tempFiles
            });
            break;
        }
        if (that.data.identifyList.length > 0 && that.data.internshipList.length >0){
          that.setData({
            haveTwo: true
          });
        } else {
          that.setData({
            haveTwo: false
          });
        }
      }
    });
  },
  /**
   * 预览图片
   */
  ylimg: function (e) {
    var imageID = e.currentTarget.id;
    var that = this;
    switch(imageID) {
      case '1':
        wx.previewImage({
          current: e.target.dataset.src,
          urls: this.data.internshipList // 需要预览的图片http链接列表
        });
        break;
      case '2':
        wx.previewImage({
          current: e.target.dataset.src,
          urls: this.data.identifyList // 需要预览的图片http链接列表
        });
        break;
    }
  },
  /**
   * 取消图片
   */
  cancelImg: function (data) {
    var that = this;
    var cancelID = data.currentTarget.id;
    switch (cancelID) {
      case '1':
        that.data.internshipList.splice(data.currentTarget.dataset.index, 1);
        that.setData(
          {
            file1_is_new: true,
            internshipList: that.data.internshipList,
            haveTwo: false
          }
        );
        break;
      case '2':
        that.data.identifyList.splice(data.currentTarget.dataset.index, 1);
        that.setData(
          {
            file2_is_new: true,
            identifyList: that.data.identifyList,
            haveTwo: false
          }
        );
        break;
    }
    
  },

  /**
   * 表单提交
   */
  formSubmit: function(e) {
    var that = this;
    that.setData({
      loadinghidden: false
    });
    console.log('formsubmit-->', e)
    console.log('prev submit data: ', that.data.prevSubmitData)
    console.log('user was modified the form data: ', that.data.user_modified_formdata)
    console.log('internshipList is new: ', that.data.file1_is_new)
    console.log('identifyList is new: ', that.data.file2_is_new)

    var file1path = null;
    var file2path = null;
    if(that.data.file1_is_new) {
      file1path = that.data.internshipList[0];
      that.uploadUserFile('INTERNSHIP_CERTIFICATE', file1path);
      if (that.data.file2_is_new) {
        file2path = that.data.identifyList[0];
        that.uploadUserFile('GUARDIAN_ID_CARD', file2path);
      }
    }
    that.submitUserFormdata(that.data.prevSubmitData);
  },
  /**
   * 上传文件
   */
  uploadUserFile: function(fileType, filePath) {
    var that = this;
    wx.uploadFile({
      url: SERVERURL + '/student/update_file_upload',
      filePath: filePath,
      name: 'file',
      formData: {
        id: that.data.prevSubmitData.id,
        wechatId: that.data.prevSubmitData.wechatId,
        fileType: fileType
      },
      header: {
        'content-type': 'multipart/form-data'
      },
      success: function (res) {
        console.log('success res-->', res)
        var returnData = JSON.parse(res.data);
        console.log('return data: ', returnData)
        if (returnData.state === 'SUCCEED') {
          console.log('success.data.message: ', returnData.message)
        } else {
          console.log('fail.data.message: ', returnData.message)
          that.setData({
            loadinghidden: true
          });
          wx.showModal({
            title: '失败',
            content: returnData.message,
            showCancel: false,
          });
        }
      },
      fail: function (res) {
        console.log('fail res-->', res.errMsg)
        that.setData({
          loadinghidden: true
        });
        wx.showModal({
          title: '服务器错误',
          content: res.errMsg,
          showCancel: false,
        })
      }
    });
  },
  /**
   * 提交表单
   */
  submitUserFormdata: function (data) {
    var that = this;
    wx.request({
      url: SERVERURL + '/student/update_internships_note_for_leave',
      data: data,
      header: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      dataType: 'json',
      success: function (res) {
        console.log('success res-->', res)
        if (res.data.state === 'SUCCEED') {
          console.log('success.data.message: ', res.data.message)
          that.setData({
            loadinghidden: true
          });
          wx.showModal({
            title: '成功',
            content: res.data.message,
            showCancel: false,
            success: function(res) {
              if(res.confirm) {
                wx.navigateBack({
                  delta: 4
                });
              }
            }
          });
        } else {
          console.log('fail.data.message: ', res.data.message)
          that.setData({
            loadinghidden: true
          });
          wx.showModal({
            title: '失败',
            content: res.data.message,
            showCancel: false,
          });
        }
      },
      fail: function (res) {
        console.log('fail res-->', res.errMsg)
        that.setData({
          loadinghidden: true
        });
        wx.showModal({
          title: '服务器错误',
          content: res.errMsg,
          showCancel: false,
        })
      }
    });
  }
})