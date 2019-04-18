var $$ = Dom7;

var app = new Framework7({
    root: '#app',
    name: 'My App',
    id: 'com.myapp.test',
    panel: {
        swipe: 'both',
        swipeActiveArea: 30,
    },
    navbar: {
        hideOnPageScroll: true,
    },
    routes: [
 // Index page
        {
            path: '/',
            url: './index.html',
            name: 'home',
  },
  // Chat page
        {
            path: '/chat/',
            url: '../pages/chat.html',
            name: 'chat',
  },
        // login page
        {
            path: '/login-screen/',
            url: 'pages/login.html',
  },
  ],
});

var mainView = app.views.create('.view-main');

var loginScreen = app.loginScreen.create({
    content: '<div class="login-screen">...</div>',
    on: {
        opened: function () {
            console.log('Login Screen opened')
        }
    }
})

//loginScreen.open();
