var $$ = Dom7;

var app = new Framework7({
  root: '#app',
  name: 'My App',
  id: 'com.myapp.test',
  theme: 'md',
  panel: {
    swipe: 'both',
    swipeOnlyClose: true,
    swipeActiveArea: 30,
  },
  navbar: {
    hideOnPageScroll: false,
  },
  toolbar: {
    showOnPageScrollEnd: true,
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
      on: {
        pageAfterIn: function test(e, page) {
          // do something after page gets into the view
        },
        pageInit: function(e, page) {
          // do something when page initialized
          setupChat();

        },
        pageBeforeRemove: function(e, page) {
          console.log('page before remove');
          listener();
          app.messages.destroy('.messages');
        },
      }
    },
    // preview chat page
    {
      path: '/preview-chat-screen/',
      url: 'pages/preview_chat.html',
    },
    // settings page
    {
      path: '/settings-screen/',
      url: 'pages/settings.html',
    },
    // about page
    {
      path: '/about-screen/',
      url: 'pages/about.html',
    },
    // edit profile page
    {
      path: '/edit-profile-screen/',
      url: 'pages/edit_profile.html',
    },
    // edit new event page
    {
      path: '/new-event-screen/',
      url: 'pages/new_event.html',
    },
    // edit new chat page
    {
      path: '/new-chat-screen/',
      url: 'pages/new_chat.html',
      on: {
        pageAfterIn: function test(e, page) {
          // do something after page gets into the view
        },
        pageInit: function(e, page) {
          // do something when page initialized
          var searchbar = app.searchbar.create({
            el: '#new-chat-searchbar',
            searchContainer: '#new-chat-members-list',
            searchIn: '.item-inner',
          });

        },
        pageBeforeRemove: function(e, page) {},
      }
    },
    // school search page
    {
      path: '/school-search-page/',
      url: 'pages/school_search.html',
      on: {
        pageAfterIn: function test(e, page) {
          // do something after page gets into the view
        },
        pageInit: function(e, page) {
          // do something when page initialized
          loadSchools();

        },
        pageBeforeRemove: function(e, page) {
          console.log('page before remove');
          listener();
          app.messages.destroy('.messages');
        },
      }
    },
  ],
});


var mainView = app.views.create('.view-main');
var swiper;

//get event swiper

// create searchbar
var searchbar = app.searchbar.create({
  el: '#school-searchbar',
  searchContainer: '#members-list',
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

function searchSchools() {
  var zip = document.getElementById("school-zip").value;
  var schoolsList = document.getElementById("schools-list");

  schoolsList.innerHTML = "";
  db.collection("school").where("zip", "==", zip)
    .get()
    .then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {

        var li = document.createElement('li');
        li.classList.add("card-block");
        li.innerHTML = '<div class="title">' + doc.name + '</div>\
        <div class="hairline"></div>\
        <div class="school-attributes">\
        <p>' + doc.address + ' ' + doc.city + ', ' + doc.state + '</p>\
        <p>' + doc.level + ' School</p>\
        </div>\
        <button onclick="changeSchool(\'' + doc.id + '\')" class="button">Select this School</button>';
        schoolsList.appendChild(li);
      });
    })
    .catch(function(error) {
      schoolsList.innerHTML = '<div class="text-center">No schools found.</div>\
      <div class="justify-content-center"><a href="/new-school-screen/">Add your school</a>';
    });
}