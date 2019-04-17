var $$ = Dom7;

var app = new Framework7({
    root: '#app',
    name: 'My App',
    id: 'com.myapp.test',
    routes: [
        /*
        {
            path: '/login/',
            url: 'login.html',
    },
        {
            path: '/signup/',
            url: 'signup.html',
    },
*/
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
