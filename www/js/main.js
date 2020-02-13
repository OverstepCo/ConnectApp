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
      url: 'pages/home.html',
      on: {
        pageInit: function(e, page) {
          // do something when page initialized
          //loadMainPage();
        },
        pageBeforeRemove: function(e, page) {

        },
      },
      keepAlive: true,
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

          $$("#update-user-info").click(function() {
            //Set the users data the order for the function is bio,tag,pic,password,firstName ,lastName
            setUserData({
              bio: $$('#bio').val(),
              tagline: $$('#tagline').val(),
              firstName: $$('#first-name').val(),
              lastName: $$('#last-name').val(),
              profilePic: $$('#profile-pic-input')[0].files[0],
            });
          })

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
              $$('#members-list-skeleton').hide();
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

          $$('#welcome-button').click(function() {

            var bio = $$('#bio').val();
            var tagline = $$('#tagline').val();
            var picture = $$('#profile-pic-input')[0].files[0];

            if (!bio || !tagline || !picture) {
              showToast("Please fill in all fields to continue.");
              return;
            }
            setUserData({
                bio: bio,
                tagline: tagline,
                profilePic: picture,
              },
              function() {
                console.log("NEXT SCREEN");
                loadMainPage();
              });
          });
        },
        pageBeforeRemove: function(e, page) {
          app.progressbar.hide();
        },
      }
    },

  ],
});

var $$ = Dom7;
var mainView = app.views.create('.view-main', {
  url: '/home/',
});
var events = [];

// TODO: check for premium user
if (true) {
  //set theme color
  var storedThemeColor = localStorage.getItem("themeColor");
  var color = storedThemeColor != null ? storedThemeColor : 'blue';
  document.documentElement.classList.add('color-theme-' + color);

  var toggle = localStorage.getItem("darkMode") == "true" ? true : false;
  toggleDarkMode(toggle);
}

let fcmToken;

var getToken = function() {
  FirebasePlugin.getToken(function(token) {
    log("Got FCM token: " + token)
    fcmToken = token;
    FirebasePlugin.subscribe("my_topic", function() {
      log("Subscribed to topic");
    }, function(error) {
      logError("Failed to subscribe to topic", error);
    });
  }, function(error) {
    logError("Failed to get FCM token", error);
  });
};


function loadMainPage() { //Chacks to make sure we have loaded the users data then and loads the main page

  //If we have loaded the user and they have valid data load the main page else loadUserData
  if (User && User.school != null && User.tagline != '') {

    //If we are not on the main page navigate to it before loading the data// NOTE: Beware infinte loops
    if (mainView.router.currentRoute.path != "/home/") {
      console.log("Not on main page");
      mainView.once("pageBeforeIn", function(event, page) {
        loadMainPage();
      });
      mainView.router.navigate('/home/', {
        clearPreviousHistory: true, // Makes sure we cant go back to previous pages
      });
    } else { //We are on the main page so load tha data
      console.log("loading main page data");

      //Set the users profile icon
      $$("#profile-icon").html('<div class="profile-pic-icon" style="background-image: url(' + User.profilePic + ')"></div>');

      $$('#subscribed-chats').html(''); //clear

      var userChats = [];
      //If the user is subscribed to any chats load them
      if (User.chats.length > 0) {
        //For every chat room the current user is subscribed to load it into the html
        for (var i = 0; i < User.chats.length; i++) {
          var roomName = User.chats[i].split(",")[0];
          var roomSchool = User.chats[i].split(",")[1];
          userChats.push(roomName); //Add the chats id to the userChats array
          loadSubscribedChat(roomName, roomSchool);
        }
      } else { //The user isnt subsribed to any chat so show the message
        $$('#subscribed-chats-skeleton').hide();
        $$('#subscribed-chats').append('<p class="text-align-center">You aren\'t subscribed to any chats. <a href="#" onclick="$$(\'.unsubscribed\').click();" class="link">Click here</a> to join a new one.</p>');
      }

      $$('#school-group-chats').html(''); //clear

      //Load all the chats in the users current school that they are not subscribed to
      db.collection("school").doc(User.school).collection("chats").get().then(function(querySnapshot) {

        //Foreach chat room in the school
        querySnapshot.forEach(function(doc) {
          //Check to see if the user is subscribed to this chat if not add it to the UI
          if (userChats.length > 0 && userChats.indexOf(doc.id) != -1) {
            console.log("User is already subscribed to " + doc.id);
          } else { //User is not subsribed to this chat so add it to the unsubscribed chats html
            var ul = document.getElementById("school-group-chats");
            var li = document.createElement('li')
            li.innerHTML = '<a onclick="(previewChat(\'' + doc.id + '\',\'' + User.school + '\'))"  href="#" class="item-link item-content">' +
              '<div class="item-inner"><div class="item-title-row"><div class="item-title">' + doc.get("name") +
              '</div><div class="item-after">' + doc.get("numberOfMembers") +
              ' Members</div></div><div class="item-text">' + doc.get("description") + '</div></div></a>';
            ul.appendChild(li);
          }
        });

        //If no group chats are found add create chat text
        if ($$('#school-group-chats').html() == "") {
          $$('#school-group-chats').append('<p class="text-align-center">No unsubscribed chats found. <a href="/new-chat-screen/" class="link">Click here</a> to create a new chat.</p>');
        }

        //Hide skeleton
        $$('#school-group-chats-skeleton').hide();
      });

      //Load the events in the current school
      db.collection("school").doc(User.school).collection("event").get().then(function(querySnapshot) {
        //Date format options
        var options = {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
        };

        //Remove old swiper
        app.swiper.destroy('.swiper-container');
        $$('.event-slide').remove();

        //Foreach event in the current school
        querySnapshot.forEach(function(doc) {
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
          //Setup event html
          var newEvent = document.createElement('div');
          var date = new Date(doc.get("time"));
          newEvent.classList.add("swiper-slide");
          newEvent.classList.add("event-slide");
          newEvent.innerHTML = '<div class="slide-content event-pic-' + doc.id + '" onclick="openCard(' + (events.length - 1) + ')"><div class="event-description">' +
            '<h1>' + doc.get("name") + '</h1>' +
            '<p>' + date.toLocaleString('en-us', options) + '</p>' +
            '</div></div>';

          //Add event html to the swiper
          swiper.appendChild(newEvent);

          //Get the event's picture and set it
          storageRef.child('event-pictures').child(doc.id).getDownloadURL().then(function(url) {
            $$(".event-pic-" + doc.id).css("background-image", ("url(" + url + ")"));
          }).catch(function(error) {
            console.error(error.message);
          });
        });

        //Hide skeletons
        $$('#skeleton-event').hide();

        //Start event swiper
        app.swiper.create('.swiper-container');
      });

      //Load the users attending this school
      db.collection("school").doc(User.school).collection("users").get().then(function(querySnapshot) {

        //Clear old list
        $$("#members-list").html("");

        //Foreach user in the current school
        querySnapshot.forEach(function(doc) {
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

        $$('#members-list-skeleton').hide();

        //Create user searchbar
        var searchbar = app.searchbar.create({
          el: '#school-searchbar',
          searchContainer: '#members-list',
          searchIn: '.item-inner',
        });

      });
    }
  } else {
    loadUserData();
  }
}

function loadSubscribedChat(chatroomName, chatroomSchool) {

  //Get the chats data and add it to eh html
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

        //Listens to the chat room for any new messages.// TODO: maybe remove this
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
    $$('#subscribed-chats-skeleton').hide();
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

// QUESTION: Is this needed/used
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