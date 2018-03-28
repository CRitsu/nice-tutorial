//index.js
//获取应用实例
const app = getApp()
const faces = require('../../utils/faces.js')
const utils = require('../../utils/util.js')

Page({
  data: {
    logoUrl: 'http://wx4.sinaimg.cn/mw690/65f02d4egy1fp5e6zvox4g21400gydfz.gif',
    description: 'Nice教程，一些有用的教程。',
    minHeight: wx.getSystemInfoSync().windowHeight,
    width: wx.getSystemInfoSync().windowWidth,
    images: faces.default,
    imageSize: {},
    lastRead: ''
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  imageLoad: function(e) {
    // console.log(e)
    const height = e.detail.height
    const width = e.detail.width
    const id = e.currentTarget.id
    let h = height, w = width
    if (this.data.width < w) {
      const ratio = height / width
      w = this.data.width
      h = w * ratio
    }
    let imgSize = this.data.imageSize
    imgSize[id] = {
      height: h,
      width: w
    }
    this.setData({
      imageSize: imgSize
    })
  },
  toTutorial: function() {
    const url = utils.getLastRead(this, '../article/todolist/index')
    wx.navigateTo({
      url: url
    })
  },
  onLoad: function () {
    // ...
  }
})
