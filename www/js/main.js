var $$ = Dom7;
//Setup for framework7
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
      pageAfterIn: function test(e, page) {
        // TODO: //Check to see if the userData is valid if so loadMainPage() else loadUserData()

      },

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
          document.getElementById('profile-pic').style.backgroundImage = "url('" + User.profilePic + "')";
          document.getElementById('profile-name').innerHTML = User.firstName + " " + User.lastName;
          document.getElementById('profile-tagline').innerHTML = User.tagline;
          document.getElementById('profile-bio').innerHTML = User.bio;

        },
        pageBeforeRemove: function(e, page) {

        },
      },
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
      on: {
        pageInit: function(e, page) {
          document.getElementById("update-user-info").addEventListener('click', function() {
            app.dialog.password('For security stuff', 'Enter your password', function(password) {
              // TODO: validate user password
              app.dialog.close();
              var picFile = document.getElementById('profile-pic-input').files[0];
              var t = document.getElementById("tagline").value;
              var b = document.getElementById("bio").value;
              var p = null; // TODO: Put the password here
              var nameF = document.getElementById("first-name").value;
              var nameL = document.getElementById("last-name").value;
              //Set the users data the order for the function is bio,tag,pic,password,firstName ,lastName
              setUsersData(b, t, picFile, null, nameF, nameL);
              //editUserData();
            });
          });

          // do something when page initialized
          document.getElementById('profile-pic-preview').style.backgroundImage = "url('" + User.profilePic + "')";
          document.getElementById('first-name').value = User.firstName;
          document.getElementById('last-name').value = User.lastName;
          document.getElementById('tagline').value = User.tagline;
          document.getElementById('bio').value = User.bio;

        },
      },
    },
    // edit new event page
    {
      path: '/new-event-screen/',
      url: 'pages/new_event.html',
      on: {
        pageInit: function(e, page) {
          // do something when page initialized
          var searchbar = app.searchbar.create({
            el: '#new-event-searchbar',
            searchContainer: '#new-event-members-list',
            searchIn: '.item-inner',
          });

          ///load the school members into the things

          db.collection("school").doc(User.school).collection("users").get().then(function(querySnapshot) {
            var membersList = document.getElementById("new-event-members-list");
            querySnapshot.forEach(function(doc) {
              //This loop runs once for every user in the current school
              getUserData(doc.id, function(user) {
                console.log("found user" + user.username + "in school");
                var l = document.createElement('div');
                l.innerHTML = '<a href="#" onclick="addChip(this)" class="item-link no-chevron" data-uid="' + user.uid + '" data-checked="0" data-name="' + user.username + '"data-pic="' + user.picURL + '" data-checked="0">' +
                  '<li class="item-content" style="padding-right: 16px">' +
                  '<div class="item-media">' +
                  '<div class="li-profile-pic" style="background-image: url(' + user.picURL + ')"></div>' +
                  '</div>' +
                  '<div class="item-inner">' + user.username + '</div>' +
                  '<div id="right" class="right"></div>' +
                  '</li>' +
                  '</a>';
                membersList.appendChild(l);
              });
            });
          });
        },
      }
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

          ///load the school members into list that selects users to invite
          db.collection("school").doc(User.school).collection("users").get().then(function(querySnapshot) {
            var membersList = document.getElementById("new-chat-members-list");
            querySnapshot.forEach(function(doc) {
              //This loop runs once for every user in the current school
              getUserData(doc.id, function(user) {
                console.log(user.username + "woooooo");
                var l = document.createElement('div');
                l.innerHTML = '<a href="#" onclick="addChip(this)" class="item-link no-chevron" data-uid="' + user.uid + '" data-checked="0" data-name="' + user.username + '"data-pic="' + user.picURL + '" data-checked="0">' +
                  '<li class="item-content" style="padding-right: 16px">' +
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
          app.progressbar.hide();
        },
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

// TODO: check for premium user
if (false) {
  //set theme color
  var storedThemeColor = localStorage.getItem("themeColor");
  var color = storedThemeColor != null ? storedThemeColor : 'red';
  document.documentElement.classList.add('color-theme-' + color);

  var toggle = localStorage.getItem("darkMode") == "true" ? true : false;
  toggleDarkMode(toggle);
}

function loadMainPage() { //Loads all the data on the main page//// TODO: make sure to cean all leftover data
  //Loads the chats that the user is subscribed to.////TODO: listen and display realtime updates
  //Note the html of the main page is sometimes not immedeatly accesable due to it not being loaded.////this may be fixed
  console.log(User);

  if (true) // run this after loading the user //Not neededmostlikly
  {
    //Set the users profile icon
    document.getElementById("profile-icon").innerHTML = '<div class="profile-pic-icon" style="background-image: url(' + User.profilePic + ')"></div>';

    //This loop runs once for every chat room the current user is subscribed to
    if (User.chats != null) {
      for (var i = 0; i < User.chats.length; i++) {
        var roomName = User.chats[i].split(",")[0];
        var roomSchool = User.chats[i].split(",")[1];
        loadSubscribedChat(roomName, roomSchool);
      }
    } else {
      console.log("this user isnt subscribed to any chats. this should be displayed on the main page");
      // TODO: Display that the user isnt subscribed to any chats
    }
    var userChats = [];
    if (User.chats != null) {
      for (var i = 0; i < User.chats.length; i++) {
        userChats.push(User.chats[i].split(",")[0]);
      }
    }
    //Loads all the chats in the users current school that they are not subscribed to
    db.collection("school").doc(User.school).collection("chats").get().then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
        if (userChats.length > 0 && userChats.indexOf(doc.id) != -1) {
          console.log("User is already subscribed to " + doc.id);
        } else {
          //this loop runs once for every chat room in the school
          var ul = document.getElementById("school-group-chats");
          var li = document.createElement('li')
          li.innerHTML = '<a onclick="(previewChat(\'' + doc.id + '\',\'' + User.school + '\'))"  href="#" class="item-link item-content">' +
            '<div class="item-inner"><div class="item-title-row"><div class="item-title">' + doc.get("name") +
            '</div><div class="item-after">' + doc.get("numberOfMembers") +
            ' Members</div></div><div class="item-text">' + doc.get("description") + '</div></div></a>';
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
        //this loop runs once for every event in the current school
        var event = {
          eventID: doc.id,
          name: doc.get("name"),
          time: doc.get("time"),
          location: doc.get("location"),
          description: doc.get("description"),
          guests: doc.get("guests")
        };
        events.push(event);
        var swiper = document.getElementById('event-swiper');
        var newEvent = document.createElement('div');
        var date = new Date(doc.get("time"));
        newEvent.classList.add("swiper-slide");
        newEvent.innerHTML = '<div class="slide-content"  style="background-image: url(' + "test" + ')"  onclick="openCard(' + (events.length - 1) + ')"><div class="event-description">' +
          '<h1>' + doc.get("name") + '</h1>' +
          '<p>' + date.toString() + '</p>' +
          '</div></div>';

        swiper.appendChild(newEvent);
      });
      app.swiper.create('.swiper-container');
      document.getElementById("skeleton-event").remove();
    });

    //////////////Loads the users attending this school
    db.collection("school").doc(User.school).collection("users").get().then(function(querySnapshot) {
      //  var membersList = document.getElementById("members-list");
      querySnapshot.forEach(function(doc) {
        //This loop runs once for every user in the current school
        getUserData(doc.id, function(user) {
          var membersList = document.getElementById("members-list");
          var a = document.createElement('a');
          a.classList.add("item-link");
          a.classList.add("no-chevron");
          a.onclick = function() {
            loadUserpage(doc.id);
          };
          a.innerHTML = '<li class="item-content"><div class="item-media">' +
            '<div class="profile-pic-icon" style="background-image: url(' + user.picURL +
            ')"></div> </div>' +
            '<div class="item-inner">' + user.username + '</div></li>';
          membersList.appendChild(a);
        });
      });
      var skeleton = document.getElementById('members-list-skeleton');
      skeleton.parentNode.removeChild(skeleton);
    });

  }

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
  console.log("loading " + userID);
  if (userID in loadedUsers) {
    console.log("found user in array");
    callback(loadedUsers[userID]);
  } else {
    var profilePic = "";

    // Create a reference to the file we want to download
    var profilePictureRef = storageRef.child('profile-pictures').child(userID);

    // Get the download URL
    profilePictureRef.getDownloadURL().then(function(url) {
      profilePic = url;
    }).catch(function(error) {
      profilePic = "https://www.keypointintelligence.com/img/anonymous.png";
    }).then(function() {
      db.collection("users").doc(userID).get().then(function(userData) {
        loadedUsers[userID] = {
          uid: userID,
          username: userData.get("firstName") + " " + userData.get("lastName"),
          firstName: userData.get("firstName"),
          lastName: userData.get("lastName"),
          tagline: userData.get("tagline"),
          bio: userData.get("bio"),
          picURL: profilePic,
        };
        //console.log("loaded user: " + userID);
        callback(loadedUsers[userID]);
      });
    });
  }
}

// TODO: turn this into an async function
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

function loadUserpage(uid) {
  //if the uid is the same as the Users id then load the users page else load the preveiw page of the user with uid
  if (uid == User.uid) {
    app.panel.close();
    self.app.views.main.router.navigate('/profile-screen/');
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

function loadSubscribedChat(chatroomName, chatroomSchool) {
  //console.log("chatName: " + chatroomName + " chatroomSchool: " + chatroomSchool +
  db.collection("school").doc(chatroomSchool).collection("chats").doc(chatroomName).collection("messages").orderBy("timestamp", "desc").limit(1).get().then(function(messages) {
    messages.forEach(function(message) { ///This lop runs once for the latest message in the chat room.
      console.log(message.data());
      getUserData(message.get("userID"), function(user) {
        var ls = document.getElementById("subscribed-chats");
        var li = document.createElement('li');
        li.innerHTML = '<a onclick="(loadChat(\'' + chatroomName + '\',\'' + chatroomSchool + '\'))" class="item-link item-content no-chevron">' +
          '<div class="item-inner" id=\'' + chatroomName + chatroomSchool + '\' >' +
          '<div class="item-title-row">' +
          '<div class="item-title">' + chatroomName + '</div>' +
          '<div class="item-after">' + formatTimeStamp(message.get("timestamp").toDate()) + '</div></div>' +
          '<div class="item-text"><b>' + message.get("name") + ': </b>' + message.get("text") + '</div></div></a>';
        ls.appendChild(li);

        //Listens to the chat room for any new messages.
        listener = db.collection("school").doc(chatroomSchool + "").collection("chats").doc(chatroomName).collection("messages").orderBy("timestamp", "asc")
          .onSnapshot(function(snapshot) {
            snapshot.docChanges().forEach(function(change) {
              getUserData(change.doc.get("uid"), function(user) {
                if (change.type === "added") {
                  //console.log(change.doc.get("text"));
                  // TODO: change the text on the preveiw
                  var htmlToUpdate = document.getElementById(chatroomName + chatroomSchool + "");
                  htmlToUpdate.innerHTML = '<div class="item-title-row"><div class="item-title">' + chatroomName +
                    '</div><div class="item-after">' + formatTimeStamp(message.get("timestamp").toDate()) + '</div></div><div class="item-text"><b>' +
                    message.get("name") + ': </b>' + message.get("text") + '</div>';
                }
              });
            });
          });
      });
    });
  }).then(function() {
    var skeleton = document.getElementById('subscribed-chats-skeleton');
    if (skeleton)
      skeleton.parentNode.removeChild(skeleton);
  });
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
          '<div class="item-media"><div class="profile-pic-icon" style="background-image: url(' + user.picURL +
          ')"></div></div>' +
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

//android back button navigation
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
  document.addEventListener("backbutton", onBackKeyDown, false);
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

function formatTimeStamp(time) {

  //make sure a date object is passed in.
  if (time.constructor != Date) return timeSince(time);
  var today = new Date();

  var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var seconds = (today - time.getTime()) / 1000;

  //0 to 59s
  if (seconds < 60) {
    return "now";
  }

  //15s to 60min
  if (seconds < 3600) {
    return Math.round(seconds / 60) + " min";
  }

  //1hr to today
  if (time.getDate() === today.getDate() && time.getMonth() === today.getMonth() && time.getFullYear() === today.getFullYear()) {
    var hours = time.getHours();
    var minutes = time.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  //1day to 6days
  if (seconds < 518400) {
    var last = "";
    if (time.getDay() > today.getDay())
      last = "Last ";
    return last + days[time.getDay()];
  }

  //1week to this year
  if (time.getFullYear() === today.getFullYear()) {
    return months[time.getMonth()] + " " + time.getDate();
  }

  //if not this year
  return time.getMonth() + "/" + time.getDate() + "/" + time.getFullYear();
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

function comingSoon() {
  var toastBottom = app.toast.create({
    text: 'This feature is coming soon!',
    closeTimeout: 2000,
  });
  toastBottom.open();
}