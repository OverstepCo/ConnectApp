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
//////




///////Events//////
function loadSchoolEvents() {
  db.collection("school").doc(User.school).collection("event").get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
      //this loop runs once for every event in the current school
      addEvent(doc.get("name"), doc.get("image"), doc.get("day"), doc.get("time"), doc.get("location"), doc.get("description"), doc.get("guests"));
    });
  });

}

function addSchoolEvent(name, image, day, time, location, description, guests) { //Adds a event to the school database with the provided data
  db.collection("school").doc(User.school).collection("event").add({
    name: name,
    image,
    day,
    time,
    location,
    description,
    guests,
    owner: User.uid
  });
}

function addEvent(name, image, day, time, location, description, guests) { //Adds an event to the local UI.
  app.swiper.destroy('.swiper-container');
  var swiper = document.getElementById('event-swiper');
  var event = document.createElement('div');
  event.classList.add("swiper-slide");
  event.innerHTML = '<div class="slide-content">\
      <div class="row" style="margin-bottom: 0">\
        <div class="col-33">\
          <div class="slide-image" style="background-image: url(' + image + ');"></div>\
            </div>\
              <div class="col-66">\
                <div class="slide-text">\
                  <h4 class="slide-title">' + name + '</h4>\
                    <p>' + day + '</p>\
                      <p>' + time + ' | ' + location + '</p>\
                        </div>\
                          </div>\
                            </div>\
                              <div class="collapsible">\
                              <div class="collapsible-content">' + description + '</div>\
                              <div style="background-color: white">\
                            <div class="hairline"></div>\
                          </div>\
                        </div>\
                      <div class=" row slide-guests">\
                    <div class="row left" style="display:flex;justify-content: center;align-items: center;">\
                  <div class="col img" style="background-image: url(https://cdn.mos.cms.futurecdn.net/Rmtq8KDLagPDutJTp5ZViE.jpg)"></div>\
                <div class="col img" style="background-image: url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyMQl7f1VtadBUijAqRzqzM0KG0cYEoA5aXeqLmuzUQUJENZHN5A)"></div>\
              <p>+3 more</p>\
            </div>\
          <div class="right"><a class="link collapsible-toggle"><i class="material-icons">expand_more</i></a></div>\
        </div>\
      </div>';

  swiper.appendChild(event);
  app.swiper.create('.swiper-container');

  var collToggle = document.getElementsByClassName("collapsible-toggle");

  collToggle[collToggle.length - 1].addEventListener("click", function() {
    this.classList.toggle("active");
    var coll = this.parentElement.parentElement.previousElementSibling;
    coll.classList.toggle("expanded");
  });
  updateSwiper();

}
////////////////


////////////////