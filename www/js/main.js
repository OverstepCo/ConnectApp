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
      options: {
  animate: false,
},
    },
    // login page
    {
      path: '/login-screen/',
      url: 'pages/login.html',
      options: {
  animate: false,
},
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
    },
    // welcome page
    {
      path: '/welcome-page/',
      url: 'pages/welcome.html',
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



function loadMainPage() { //Loads all the data on the main page
  //Loads the chats that the user is subscribed to.////TODO: listen and display realtime updates
  console.log(User.Chats); //TODO get the chats fromthis instead of firebase

  db.collection("users").doc(User.uid).collection("chats").get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
      console.log("docID: " + doc.id);

      //this loop runs once for every chat room the current user is subscribed to
      db.collection("school").doc(doc.get("school") + "").collection("chats").doc(doc.id).get().then(function(chat) {
        console.log("chatName: " + chat.get("name"));

        db.collection("school").doc(doc.get("school") + "").collection("chats").doc(doc.id).collection("messages").orderBy("timestamp", "desc").limit(1).get().then(function(messages) {
          messages.forEach(function(message) { ///This lop runs once for the latest message in the chat room.
            var ls = document.getElementById("subscribed-chats");
            var li = document.createElement('li');
            li.innerHTML = '<a onclick="(loadChat(\'' + doc.id + '\',\'' + doc.get("school") + '\'))" class="item-link item-content no-chevron">\
                 <div class="item-inner">\
                   <div class="item-title-row">\
                     <div class="item-title">' + chat.get("name") + '</div>\
                     <div class="item-after">' + '12:14' + '</div>\
                   </div>\
                   <div class="item-text"><b>' + message.get("userID") + ': </b>' + message.get("text") + '</div>\
                 </div>\
               </a>';
            ls.appendChild(li);


            listener = db.collection("school").doc(doc.get("school") + "").collection("chats").doc(doc.id).collection("messages").orderBy("timestamp", "asc")
              .onSnapshot(function(snapshot) { //Listens to the chat room for any new messages.
                  snapshot.docChanges().forEach(function(change) {
                    if (change.type === "added") {
                      console.log(change.doc.get("text"));
                      ////
                    }
                  });
                  var skeleton = document.getElementById('subscribed-chats-skeleton');
                  skeleton.parentNode.removeChild(skeleton);
                  //...
                },
                function(error) {
                  //...
                });
          });
        });
      });
    });
  });
  //Loads all the chats in the users current school//// TODO:  only load the chats that the user is not subbscribed to
  db.collection("school").doc(User.school).collection("chats").get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
      //this loop runs once for every chat room in the school
      var ul = document.getElementById("school-group-chats");
      var li = document.createElement('li')
      li.innerHTML = '<a onclick="(previewChat(\'' + doc.id + '\',\'' + User.school + '\'))"  href="#" class="item-link item-content">\
         <div class="item-inner">\
           <div class="item-title-row">\
             <div class="item-title">' + doc.get("name") + '</div>\
           </div>\
           <div class="item-subtitle">' + doc.get("numberOfMembers") + ' Members</div>\
           <div class="item-text">' + doc.get("description") + '</div>\
         </div>\
       </a>';
      ul.appendChild(li);
      //if any of these dont exist in the database they return null or undefined
    });
    var skeleton = document.getElementById('school-group-chats-skeleton');
    skeleton.parentNode.removeChild(skeleton);
  });

  //////////Loads the events in the current school
  db.collection("school").doc(User.school).collection("event").get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
      //this loop runs once for every event in the current school
      addEventToPage(doc.get("name"), doc.get("image"), doc.get("day"), doc.get("time"), doc.get("location"), doc.get("description"), doc.get("guests"));
    });
  });
}

//android back button navigation
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
  document.addEventListener("backbutton", onBackKeyDown, false);
}

function onBackKeyDown() {
  // Handle the back button
  self.app.views.main.router.back();
}
