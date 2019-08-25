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
      on: {
        pageAfterIn: function test(e, page) {
          // do something after page gets into the view
        },
        pageInit: function(e, page) {
          // do something when page initialized
          loadFriends();

        },
        pageBeforeRemove: function(e, page) {

        },
      }
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
    {
      path: '/new-school-page/',
      url: 'pages/new_school.html',
    },
    // welcome page
    {
      path: '/welcome-page/',
      url: 'pages/welcome.html',
      on: {
        pageAfterIn: function test(e, page) {
          // do something after page gets into the view
        },
        pageInit: function(e, page) {
          // do something when page initialized
          setupColorPalette();

        },
      },
    }
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
  //addFreind("waaa");
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
  //Loads all the chats in the users current school/
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
             <div class="item-after">' + doc.get("memberIDs").length + "" + ' Members</div>\
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

      var event = {
        eventID: doc.id,
        name: doc.get("name"),
        image: doc.get("image"),
        day: doc.get("day"),
        time: doc.get("time"),
        location: doc.get("location"),
        description: doc.get("description"),
        guests: doc.get("guests")
      };
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
      //console.log("username: " + doc.get("name"));
      var a = document.createElement('a');
      a.classList.add("item-link");
      a.classList.add("no-chevron");
      a.innerHTML = '<li class="item-content"><div class="item-media">' +
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

function timeSince(time) {

  switch (typeof time) {
    case 'number':
      break;
    case 'string':
      time = +new Date(time);
      break;
    case 'object':
      if (time.constructor === Date) time = time.getTime();
      break;
    default:
      time = +new Date();
  }
  var time_formats = [
    [60, 'seconds', 1],
    [120, '1 minute ago', '1 minute from now'],
    [3600, 'minutes', 60],
    [7200, '1 hour ago', '1 hour from now'],
    [86400, 'hours', 3600],
    [172800, 'Yesterday', 'Tomorrow'],
    [604800, 'days', 86400],
    [1209600, 'Last week', 'Next week'],
    [2419200, 'weeks', 604800],
    [4838400, 'Last month', 'Next month'],
    [29030400, 'months', 2419200],
    [58060800, 'Last year', 'Next year'],
    [2903040000, 'years', 29030400],
  ];
  var seconds = (+new Date() - time) / 1000,
    token = 'ago',
    list_choice = 1;

  if (seconds == 0) {
    return 'Just now'
  }
  if (seconds < 0) {
    seconds = Math.abs(seconds);
    token = 'from now';
    list_choice = 2;
  }
  var i = 0,
    format;
  while (format = time_formats[i++])
    if (seconds < format[0]) {
      if (typeof format[2] == 'string')
        return format[list_choice];
      else
        return Math.floor(seconds / format[2]) + ' ' + format[1] + ' ' + token;
    }
  return time;
}

function loadFriends() {
  //////////////Loads the current users feinds
  db.collection("Users").doc(User.uid).collection("friends").get().then(function(querySnapshot) {
    var freindsList = document.getElementById('friends');
    //Remove all children
    while (freindsList.firstChild) {
      freindsList.removeChild(freindsList.firstChild);
    }
    querySnapshot.forEach(function(doc) {
      //This loop runs once for every user in the event
      console.log("username: " + doc.get("name"));
      var a = document.createElement('div');
      a.classList.add("attendee");
      a.innerHTML = '< a href = "#" class = "item-link no-chevron" > ' +
        '<li class="item-content">' +
        '<div class="item-media"><i class="material-icons">person</i></div>' +
        '<div class="item-inner">' + doc.get("name") + '</div>' +
        '</li>' +
        '</a>';

      freindsList.appendChild(a);
    });
  });
}

function addFreind(uid) {
  db.collection("users").doc(User.uid).collection("friends").doc(uid).set({
    name: "TODO" + ' ' + "Add User name here"
  }).then(function() {
    console.log("Added friend");
  });

}