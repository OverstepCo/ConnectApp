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
    // settings page
    {
      path: '/settings-screen/',
      url: 'pages/settings.html',
    },
    // edit profile page
    {
      path: '/edit-profile-screen/',
      url: 'pages/edit_profile.html',
    },
  ],
});


var mainView = app.views.create('.view-main');
var swiper;

//get event swiper

// create searchbar
var searchbar = app.searchbar.create({
  el: '.searchbar',
  searchContainer: '.members-list',
  searchIn: '.item-inner',
});

//next/prev event card
function swipeRight() {
  swiper.slideNext();
}

function swipeLeft() {
  swiper.slidePrev();
}

function updateSwiper() {
  swiper = app.swiper.get('.swiper-container');
}


function testFunction() {
  db.collection("school").doc(User.school).collection("event").get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
      //this loop runs once for every event in the current school
      //addEvent(doc.get("name"), doc.get("image"), doc.get("day"), doc.get("time"), doc.get("location"), doc.get("description"), doc.get("guests"));
      console.log(doc.get("name"));
    });
  });
}