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

var events = [];
// create searchbar
var searchbar = app.searchbar.create({
  el: '#school-searchbar',
  searchContainer: '#members-list',
  searchIn: '.item-inner',
});

function loadMainPage() { //Loads all the data on the main page
  //Loads the chats that the user is subscribed to.////TODO: listen and display realtime updates

  //This loop runs once for every chat room the current user is subscribed to
  if (User.chats != null) {
    for (var i = 0; i < User.chats.length; i++) {
      var roomName = User.chats[i].split(",")[0];
      var roomSchool = User.chats[i].split(",")[1];
      loadSubscribedChat(roomName, roomSchool);
    }
  } else {
    console.log("this user isnt subscribed to any chats");
    // TODO: Display that the user isnt subscribed to any chats
  }
  var userChats = [];
  if (User.chats != null) {
    for (var i = 0; i < User.chats.length; i++) {
      userChats.push(User.chats[i].split(",")[0]);
    }
  }
  //Loads all the chats in the users current school//// TODO:  only load the chats that the user is not subbscribed to
  db.collection("school").doc(User.school).collection("chats").get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
      if (userChats.length > 0 && userChats.indexOf(doc.id) != -1) {
        console.log("User is already subscribed to " + doc.id);
      } else {
        //this loop runs once for every chat room in the school
        var ul = document.getElementById("school-group-chats");
        var li = document.createElement('li')
        li.innerHTML = '<a onclick="(previewChat(\'' + doc.id + '\',\'' + User.school + '\'))"  href="#" class="item-link item-content">\
         <div class="item-inner">\
           <div class="item-title-row">\
             <div class="item-title">' + doc.get("name") + '</div>\
             <div class="item-after">' + doc.get("memberIDs").length + ' Members</div>\
           </div>\
           <div class="item-text">' + doc.get("description") + '</div>\
         </div>\
       </a>';
        ul.appendChild(li);
        //if any of these dont exist in the database they return null or undefined
      }
    });
    var skeleton = document.getElementById('school-group-chats-skeleton');
    skeleton.parentNode.removeChild(skeleton);
  });

  //////////Loads the events in the current school
  db.collection("school").doc(User.school).collection("event").get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
      /*
      db.collection("school").doc(newSchoolID).update({
        usersIDs: firebase.firestore.FieldValue.arrayRemove("" + User.uid),
        usersNames: firebase.firestore.FieldValue.arrayRemove("" + User.firstName + " " + User.lastName)
      });
      db.collection("school").doc(newSchoolID).update({
        usersIDs: firebase.firestore.FieldValue.arrayUnion("" + User.uid),
        usersNames: firebase.firestore.FieldValue.arrayUnion("" + User.firstName + " " + User.lastName)
      });*/
      var event = {eventID:doc.id, name:doc.get("name"), image:doc.get("image"), day:doc.get("day"), time:doc.get("time"), location:doc.get("location"), description:doc.get("description"), guests:doc.get("guests")};
      events.push(event);
      var swiper = document.getElementById('event-swiper');
      var newEvent = document.createElement('div');
      newEvent.classList.add("swiper-slide");
      newEvent.innerHTML = '<div class="slide-content"  style="background-image: url(' + doc.get("image") + ')"  onclick="openCard(' + (events.length - 1) + ')"><div class="event-description">' +
            '<h1>' + doc.get("name") + '</h1>' +
            '<p>' + doc.get("day") + ', March 20</p>' +
          '</div></div>';

      swiper.appendChild(newEvent);
      //this loop runs once for every event in the current school
    });
    app.swiper.create('.swiper-container');
  });
  //////////////Loads the users attending this school
  db.collection("school").doc(User.school).collection("users").get().then(function(querySnapshot) {
    var membersList = document.getElementById("members-list");
    querySnapshot.forEach(function(doc) {
      //This loop runs once for every user in the current school
      console.log("username: " + doc.get("name"));
        var a = document.createElement('a');
        a.classList.add("item-link");
        a.classList.add("no-chevron");
        a.innerHTML='<li class="item-content"><div class="item-media">' +
          ' <i class="material-icons gradient-icon">person</i></div>' +
          '<div class="item-inner">' + doc.get("name") + '</div></li>';
        membersList.appendChild(a);
    });
    var skeleton = document.getElementById('members-list-skeleton');
    skeleton.parentNode.removeChild(skeleton);
  });

}

//android back button navigation
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
  document.addEventListener("backbutton", onBackKeyDown, false);
}


function loadSubscribedChat(chatroomName, chatroomSchool) {
  //console.log("chatName: " + chatroomName + " chatroomSchool: " + chatroomSchool +
    //" whattts wrong with this javvva its alll aysncronusss not even a goat would want to drink ayschnonus coffee");

  db.collection("school").doc(chatroomSchool).collection("chats").doc(chatroomName).collection("messages").orderBy("timestamp", "desc").limit(1).get().then(function(messages) {
    messages.forEach(function(message) { ///This lop runs once for the latest message in the chat room.
      var ls = document.getElementById("subscribed-chats");
      var li = document.createElement('li');
      li.innerHTML = '<a onclick="(loadChat(\'' + chatroomName + '\',\'' + chatroomSchool + '\'))" class="item-link item-content no-chevron">\
             <div class="item-inner" id=\'' + chatroomName + chatroomSchool + '\' >\
               <div class="item-title-row">\
                 <div class="item-title">' + chatroomName + '</div>\
                 <div class="item-after">' + '12:14' + '</div>\
               </div>\
               <div class="item-text"><b>' + message.get("name") + ': </b>' + message.get("text") + '</div>\
             </div>\
           </a>';
      ls.appendChild(li);
      var skeleton = document.getElementById('subscribed-chats-skeleton');
      skeleton.parentNode.removeChild(skeleton);
      listener = db.collection("school").doc(chatroomSchool + "").collection("chats").doc(chatroomName).collection("messages").orderBy("timestamp", "asc")
        .onSnapshot(function(snapshot) { //Listens to the chat room for any new messages.
            snapshot.docChanges().forEach(function(change) {
              if (change.type === "added") {
                //console.log(change.doc.get("text"));
                // TODO: change the text on the preveiw
                var htmlToUpdate = document.getElementById(chatroomName + chatroomSchool + "");
                htmlToUpdate.innerHTML = '<div class="item-title-row">\
                  <div class="item-title">' + chatroomName + '</div>\
                  <div class="item-after">' + '12:14' + '</div>\
                </div>\
                <div class="item-text"><b>' + message.get("name") + ': </b>' + message.get("text") + '</div>\
                ';
              }
            });

            //...
          },
          function(error) {
            //...
          });
    });
  }).catch(function(error) {
    console.error("Error loading chat: ", error);
  });
}

function onBackKeyDown() {
  // Handle the back button
  self.app.views.main.router.back();
}
