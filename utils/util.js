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

const setLastRead = () => {
  const pages = getCurrentPages()
  const url = pages[pages.length - 1].route
  wx.setStorage({
    key: 'lastRead',
    data: '/' + url,
  })
}

const getLastRead = (obj, origin) => {
  const url = wx.getStorageSync('lastRead')
  return url ? url : origin
}

module.exports = {
  formatTime: formatTime,
  setLastRead: setLastRead,
  getLastRead: getLastRead
}
