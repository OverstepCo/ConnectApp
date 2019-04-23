var $$ = Dom7;

var app = new Framework7({
  root: '#app',
  name: 'My App',
  id: 'com.myapp.test',
  panel: {
    swipe: 'both',
    swipeOnlyClose: true,
    swipeActiveArea: 30,
  },
  navbar: {
    hideOnPageScroll: false,
  },
  routes: [
    // Index page
    {
      path: '/home/',
      url: 'index.html',
    },
    // profile page
    {
      path: '/profile-screen/',
      url: 'pages/profile.html',
    },
    // signup page
    {
      path: '/signup-screen/',
      url: 'pages/signup.html',
    },
    // login page
    {
      path: '/login-screen/',
      url: 'pages/login.html',
    },
    // chat page
    {
      path: '/chat-screen/',
      url: 'pages/chat.html',
    },
  ],
});


var mainView = app.views.create('.view-main');

// create searchbar
var searchbar = app.searchbar.create({
  el: '.searchbar',
  searchContainer: '.members-list',
  searchIn: '.item-inner',
});
