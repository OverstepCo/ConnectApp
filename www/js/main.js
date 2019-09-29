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
      on: {
        pageAfterIn: function test(e, page) {
          // do something after page gets into the view
        },
        pageInit: function(e, page) {
          // do something when page initialized
          if (localStorage.getItem("darkMode") == "true")
            document.getElementById("toggle-darkmode").checked = true;

        },
      },
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

          ///load the school members into the things

          db.collection("school").doc(User.school).collection("users").get().then(function(querySnapshot) {
            var membersList = document.getElementById("new-chat-members-list");
            querySnapshot.forEach(function(doc) {
              //This loop runs once for every user in the current school
              getUserData(doc.id, function(user) {
                console.log(user.username + "woooooo");
                var l = document.createElement('div');
                l.innerHTML = '<a href="#" onclick="addChip(this)" class="item-link no-chevron" data-uid="' + user.uid + '" data-checked="0" data-name="' + user.username + '"data-pic="' + user.picURL + '" data-checked="0">' +
                  '<li class="item-content">' +
                  '<div class="item-media">' +
                  '<div class="li-profile-pic" style="background-image: url(' + user.picURL + ')"></div>' +
                  '</div>' +
                  '<div class="item-inner">' + user.username + '</div>' +
                  '<div id="right" class="right"></div>' +
                  '</li>' +
                  '</a>';
                membersList.appendChild(l);
              });

              //var skeleton = document.getElementById('members-list-skeleton');
              //  skeleton.parentNode.removeChild(skeleton);
            });
          });



          /*<a href="#" onclick="addChip(this)" class="item-link no-chevron" data-uid="test" data-checked="0" data-name="Krombopulos Mike"
            data-pic="https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/dd/dd09204def1578ac0edc13b5ffc1df4b6730f4bd_full.jpg" data-checked="0">
            <li class="item-content">
              <div class="item-media">
                <div class="li-profile-pic" style="background-image: url('https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/dd/dd09204def1578ac0edc13b5ffc1df4b6730f4bd_full.jpg')"></div>
              </div>
              <div class="item-inner">Krombopulos Mike</div>
              <div id="right" class="right"></div>
            </li>
          </a>*/

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
        pageBeforeRemove: function(e, page) {
          app.progressbar.hide();
        },
      }
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


//set theme color
var storedThemeColor = localStorage.getItem("themeColor");
var color = storedThemeColor != null ? storedThemeColor : 'red';
document.documentElement.classList.add('color-theme-' + color);

var toggle = localStorage.getItem("darkMode") == "true" ? true : false;
toggleDarkMode(toggle);

function loadMainPage() { //Loads all the data on the main page
  //Loads the chats that the user is subscribed to.////TODO: listen and display realtime updates
  //addFreind("waaa");
  console.log(User);
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
             <div class="item-after">' + doc.get("numberOfMembers") + "" + ' Members</div>\
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
    //  var membersList = document.getElementById("members-list");
    querySnapshot.forEach(function(doc) {
      //This loop runs once for every user in the current school
      getUserData(doc.id, function(user) {
        var membersList = document.getElementById("members-list");
        //console.log("username: " + doc.get("name"));
        var a = document.createElement('a');
        a.classList.add("item-link");
        a.classList.add("no-chevron");
        a.onclick = function() {
          loadUserpage(doc.id);
        };
        a.innerHTML = '<li class="item-content"><div class="item-media">' +
          ' <i class="material-icons gradient-icon">person</i></div>' +
          '<div class="item-inner">' + user.username + '</div></li>';
        membersList.appendChild(a);
      });
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
      console.log(message.data());
      getUserData(message.get("userID"), function(user) {
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
                getUserData(change.get("uid"), function(user) {
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
              });
              //...
            },
            function(error) {
              //...
            });
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

function loadUserpage(uid) {
  //if the uid is the same as the Users id then load the users page else load the preveiw page of the user with uid
  if (uid == User.uid) {
    self.app.views.main.router.navigate('/profile-screen/');
    document.getElementById('profile-pic').style.backgroundImage = User.profilePic;
    document.getElementById('profile-name').innerHTML = User.fullName;
    document.getElementById('profile-tagline').innerHTML = User.fullName;
    document.getElementById('profile-bio').innerHTML = User.fullName;
  } else {
    var profilePreview = document.createElement('div');

    profilePreview.classList.add("profile-preview");
    profilePreview.id = "profile-preview";

    profilePreview.addEventListener("click", function() {
      //closePreview();
    });

    getUserData(uid, function(user) {
      profilePreview.innerHTML = '<div id="profile-preview-card" class="profile-preview-card"><div class="profile-pic" style="background-image: url(' + user.picURL +
        ')"></div><h2>' + user.username + '</h2><h4>' + user.tagline + '</h4>' +
        '<p>' + user.bio + '</p> <div class="row"> <a class="button button-round" onclick="addFreind(\'' + uid + '\')">Add Friend</a><a class="button button-round" onclick="closePreview()">Close</a></div></div>';
    });

    document.body.appendChild(profilePreview);
  }
}

function closePreview() {
  var el = document.getElementById("profile-preview");
  document.getElementById("profile-preview-card").classList.add("hidden");
  setTimeout(function() {
    el.parentNode.removeChild(el);
  }, 400);
}

var freindsList;

function loadFriends() {
  //////////////Loads the current users feinds
  db.collection("users").doc(User.uid).collection("friends").get().then(function(querySnapshot) {
    freindsList = document.getElementById('friends');
    //Remove all children
    while (freindsList.firstChild) {
      freindsList.removeChild(freindsList.firstChild);
    }
    querySnapshot.forEach(function(doc) {
      //This loop runs once for every  freind of the user
      console.log("username: " + doc.get("name"));

      getUserData(doc.id, function(user) {
        var a = document.createElement('a');
        a.classList.add("item-link");
        a.classList.add("no-chevron");
        a.onclick = function() {
          loadUserpage(doc.id);
        }
        console.log(user);
        a.innerHTML =
          '<li class="item-content">' +
          '<div class="item-media"><i class="material-icons">person</i></div>' +
          '<div class="item-inner">' + user.username + '</div>' +
          '</li>';

        freindsList.appendChild(a);
      });
      /*
         var a = document.createElement('a');
         a.classList.add("item-link");
         a.classList.add("no-chevron");
         a.onclick = function() {
           loadUserpage(doc.id);
         }
         a.innerHTML =
           '<li class="item-content">' +
           '<div class="item-media"><i class="material-icons">person</i></div>' +
           '<div class="item-inner">' + doc.get("name") + '</div>' +
           '</li>';

         freindsList.appendChild(a);*/
    });
  });
}

function addFreind(uid) {
  db.collection("users").doc(User.uid).collection("friends").doc(uid).set({
    name: "this will not be needed later on"
  }).then(function() {
    console.log("Added friend");
  });

}
var loadedUsers = {};

function getUserData(userID, callback) {
  //If we have already loaded this users data then return it else load it from the database
  if (userID in loadedUsers) {
    console.log("found user in array");
    callback(loadedUsers[userID]);
  } else {
    var profilePic = "data:image/jpeg;base64,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";
    db.collection("users").doc(userID).get().then(function(userData) {
      loadedUsers[userID] = {
        uid: userID,
        username: userData.get("firstName") + " " + userData.get("lastName"),
        tagline: userData.get("tagline"),
        bio: userData.get("bio"),
        picURL: getProfilePicUrl(userID),
      };
      console.log("loaded user: " + userID);
      callback(loadedUsers[userID]);
    });
  }
}

function getProfilePicUrl(uid) {

  // Create a reference to the file we want to download
  var profilePictureRef = storageRef.child('profile-pictures').child(uid);

  // Get the download URL
  profilePictureRef.getDownloadURL().then(function(url) {
    return url;
  }).catch(function(error) {
    return "";
  });
}

function setThemeColor(color) {
  var oldThemeColor = localStorage.getItem("themeColor");
  document.documentElement.classList.remove('color-theme-' + oldThemeColor);
  document.documentElement.classList.add('color-theme-' + color);
  localStorage.setItem("themeColor", color);
}

function toggleDarkMode(toggle) {
  if (toggle) {
    document.documentElement.classList.add('theme-dark');
    localStorage.setItem("darkMode", "true");
  } else {
    document.documentElement.classList.remove('theme-dark');
    localStorage.setItem("darkMode", "false");
  }
}

function setDarkMode() {

  var toggle = document.getElementById("toggle-darkmode").checked;

  if (toggle) {
    document.documentElement.classList.add('theme-dark');
    localStorage.setItem("darkMode", "true");
  } else {
    document.documentElement.classList.remove('theme-dark');
    localStorage.setItem("darkMode", "false");
  }
}
