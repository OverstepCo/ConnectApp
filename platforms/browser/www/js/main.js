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

 $$('.show-tab-1').on('click', function () {  
            myApp.showTab('#tab-1');  
         });  

function signIn() {
    var username = document.getElementById("uname").value;
    var password = document.getElementById("pword").value;
}
