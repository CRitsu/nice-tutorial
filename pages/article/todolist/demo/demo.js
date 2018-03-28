
const utils = require('../../../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    items: [],
    completedItems: [],
    value: '',
    startX: 0,
    showCompleted: false,
    theme: {
      backImage: 'http://wx1.sinaimg.cn/mw690/65f02d4egy1fp88e3ge7zj20hs0vkgpt.jpg',
      inputAreaClass: ''
    },
    minHeight: wx.getSystemInfoSync().windowHeight
  },

  showDetail: function(e) {
    console.log(e)
  },

  /**
   * 控制是否显示已完成任务
   */
  switchShowCompleted: function() {
    this.setData({showCompleted: !this.data.showCompleted})
  },

  /**
   * 监听Touch开始
   * 左滑删除动作开始
   */
  touchStart: function(e) {
    // 当只有一个触点时表示左滑动作开始
    if (e.touches.length === 1) {
      this.setData({
        startX: e.touches[0].clientX
      })
    }
  },

  /**
   * 监听Touch移动
   * 左滑删除动作途中
   */
  touchMove: function(e) {
    // 当只有一个触点时处理
    if (e.touches.length === 1) {
      // 获得距离和序号
      const endX = e.touches[0].clientX
      const distance = this.data.startX - endX
      const id = e.currentTarget.dataset.id
      const left = e.currentTarget.dataset.left
      let style = ''
      // left大于0即滑块已经滑开
      if (left > 0) {
        let dis = left + distance
        // dis = dis < 0 ? 0 : dis
        style = 'left:-' + dis + 'px'
      // 滑块尚未滑开
      } else if (distance < 0){
        // 距离小于0让滑块恢复原位
        style = 'left:0'
      } else {
        // 设置CSS样式
        style = 'left:-' + distance + 'px'
      }

      // 维护两个列表这些操作需要对它们同时进行
      let temp = [
        this.data.items.slice(),
        this.data.completedItems.slice()
      ]
      const [items, completedItems] = temp.map(
        (target) => {
          for (let i = 0; i < target.length; i++) {
            if (target[i].id === id) {
              target[i].style = style
            }
          }
          return target
        }
      )
      this.setData({
        items: items,
        completedItems: completedItems
      })
    }
  },

  /**
   * 监听Touch结束
   * 左滑删除动作结束
   */
  touchEnd: function(e) {
    // 依旧是只有一个触点时处理
    if (e.changedTouches.length === 1) {
      // 获得距离和序号
      const endX = e.changedTouches[0].clientX
      const distance = this.data.startX - endX
      const id = e.currentTarget.dataset.id
      const over = 5 * 15
      const end = 8 * 15
      let style = 'transition:all .2s ease-in-out;'
      let left = 0
      if (distance < over) {
        style += 'left:0'
      } else {
        style += 'left:-' + end + 'px'
        left = end
      }
      // 维护两个列表这些操作需要对它们同时进行
      let temp = [
        this.data.items.slice(),
        this.data.completedItems.slice()
      ]
      const [items, completedItems] = temp.map(
        (target) => {
          for (let i = 0; i < target.length; i++) {
            if (target[i].id === id) {
              target[i].style = style
              target[i].left = left
            }
          }
          return target
        }
      )
      this.setData({
        items: items,
        completedItems: completedItems
      })
    }
  },

  /**
   * 添加任务清单
   */
  addItem: function(e) {
    // 获得输入值
    const desc = e.detail.value

    // 未输入的状态不做任何操作
    if (!desc) return;

    // 获得时间戳
    const time = new Date().getTime()
    // 获得当前的任务列表
    let items = this.data.items.slice()
    // 当前无任务列表则初始化为空数组（防止对null操作报错）
    items = items ? items : [];
    // 将当前的任务放入任务列表
    items.push({
      id: String(time), // 以字符串储存方便后面匹配
      desc: desc,
      checked: false // 初始化为未选择
    })
    // 更新UI并清空输入框
    this.setData({
      items: items,
      value: '' // 添加任务之后清空输入框
    })
    // 更新本地储存
    wx.setStorage({
      key: 'items',
      data: items,
    })
  },

  /**
   * 删除任务清单
   */
  deleteItem: function(e) {
    const id = e.currentTarget.dataset.id
    // 同时维护2个列表
    let temp = [
      this.data.items.slice(),
      this.data.completedItems.slice()
    ]
    const [items, completedItems] = temp.map(
      (target) => {
        for (let i = 0; i < target.length; i++) {
          if (target[i].id === id) {
            target.splice(i, 1)
            break
          }
        }
        return target
      }
    )
    // 更新UI
    this.setData({
      items: items,
      completedItems: completedItems
    })
    // 更新本地储存
    wx.setStorage({
      key: 'items',
      data: items,
    })
    wx.setStorage({
      key: 'completedItems',
      data: completedItems,
    })
  },

  /**
   * 复选框选中状态变更处理
   */
  checkboxChange: function(e) {
    console.log(e)
    // 获得状态被改变的checkbox的信息
    const [checked, targets] = [
      e.currentTarget.dataset.checked,
      e.detail.value
    ]
    // 获得任务列表和已完成任务列表
    let [items, completedItems] = [
      this.data.items.slice(),
      this.data.completedItems.slice()
    ]
    let loopItems, item = {}
    // checked为true时即已经选中的元素
    // 此时遍历已完成的任务列表找出消除项
    if (checked) {
      loopItems = this.data.completedItems.slice()
      for (let i = 0; i < loopItems.length; i++) {
        if (targets.indexOf(loopItems[i].id) === -1) {
          item.id = loopItems[i].id
          item.desc = loopItems[i].desc
          item.checked = false
          items.push(item) // 取消选中的元素放到任务列表
          completedItems.splice(i, 1) // 已完成列表中删除该元素
        }
      }
    // checked为false时即未选中的元素
    // 此时targets长度应该为1
    } else {
      if (targets.length === 1) {
        loopItems = this.data.items.slice()
        for (let i = 0; i < loopItems.length; i++) {
          if (loopItems[i].id === targets[0]) {
            item.id = loopItems[i].id
            item.desc = loopItems[i].desc
            item.checked = true
            item.completedTime = String(new Date().getTime())
            items.splice(i, 1)
            completedItems.push(item)
          }
        }
      }
    }

    // 更新UI
    this.setData({
      items: items,
      completedItems: completedItems
    })
    // 更新本地储存
    wx.setStorage({
      key: 'items',
      data: items,
    })
    wx.setStorage({
      key: 'completedItems',
      data: completedItems,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    utils.setLastRead()
    
    let temp = [
      wx.getStorageSync('items'),
      wx.getStorageSync('completedItems')
    ]

    // 处理空值
    let checkNull = (obj) => {
      return obj ? obj : []
    }
    temp = temp.map(checkNull)

    // 初始化任务清单，去除style和left属性，这些属性不需要在加载时保留
    // 同时维护2个列表
    const [items, completedItems] = temp.map(
      (target) => {
        for (let i = 0; i < target.length; i++) {
          target[i].style = ''
          target[i].left = 0
        }
        return target
      }
    )
    this.setData({
      items: items,
      completedItems: completedItems
    })
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
  
  }
})