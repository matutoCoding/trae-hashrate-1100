export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/donors/index',
    'pages/benefits/index',
    'pages/products/index',
    'pages/donor-detail/index',
    'pages/donation-register/index',
    'pages/level-change/index',
    'pages/batch-outbound/index',
    'pages/trace/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#E53935',
    navigationBarTitleText: '血站权益管理',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#E53935',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/donors/index',
        text: '献血者'
      },
      {
        pagePath: 'pages/benefits/index',
        text: '等级权益'
      },
      {
        pagePath: 'pages/products/index',
        text: '血制品'
      }
    ]
  }
})
