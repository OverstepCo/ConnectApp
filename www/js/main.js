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


/////User Data/////
function signUp() { //signs up a new user
  app.preloader.show();

  var email = document.getElementById("email").value;
  var password = document.getElementById("newpword").value;
  var err = document.getElementById("newerrmsg");
  err.innerHTML = "";

  firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
    app.preloader.hide();

    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log("Failed to sign up: " + errorMessage);
    err.innerHTML = "Error: " + errorMessage;

  });
}

function signIn() { //Signs in a user
  app.preloader.show();
  var username = document.getElementById("uname").value;
  var password = document.getElementById("pword").value;
  var err = document.getElementById("errmsg");
  err.innerHTML = "";
  firebase.auth().signInWithEmailAndPassword(username, password).catch(function(error) {
    app.preloader.hide();
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log("Failed to login: " + error.message);
    err.innerHTML = "Error: " + error.message;
  });
  console.log(app.views.main.router.url);
}

function signOut() { //Signs out the user
  firebase.auth().signOut().then(function() {
    // Sign-out successful.
  }).catch(function(error) {
    console.log("Failed to sign out: " + error.message);
  });
}

function editUserData(firstName, LastName, profilePicUrl) { //Edits the users profile data.

}
///////////

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

//////Chats/////
function loadSchoolChats() { //Loads all the chats in the users current school//TODO clear the currently loaded chats if there are any
  db.collection("school").doc(User.school).collection("chats").get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
      //this loop runs once for every chat room in the school
      var ls = document.getElementById("school-group-chats");
      var li = document.createElement('li')
      li.innerHTML = '<a onclick="(previewChat(\'' + doc.id + ', ' + User.school + '\'))"  href="#" class="item-link item-content">\
        <div class="item-inner">\
          <div class="item-title-row">\
            <div class="item-title">' + doc.get("name") + '</div>\
          </div>\
          <div class="item-subtitle">' + doc.get("numberOfMembers") + ' Members</div>\
          <div class="item-text">' + doc.get("description") + '</div>\
        </div>\
      </a>';
      ls.appendChild(li);
      //if any of these dont exist in the database they return null or undefined
    });
    var skeleton = document.getElementById('school-group-chats-skeleton');
    skeleton.parentNode.removeChild(skeleton);
  });
}

function loadSubscribedChats() { //Loads the chats that the user is subscribed to.
  db.collection("users").doc(User.uid).collection("chats").get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
      //this loop runs once for every chat room the current user is subscribed to
      db.collection("school").doc(doc.get("school") + "").collection("chats").doc(doc.id).get().then(function(chat) {
        db.collection("school").doc(doc.get("school") + "").collection("chats").doc(doc.id).collection("messages").orderBy("timestamp", "desc").limit(1).get().then(function(messages) {
          messages.forEach(function(message) { ///This lop runs once for each message in the chat room.
            var ls = document.getElementById("subscribed-chats");
            var li = document.createElement('li');
            li.innerHTML = '<a onclick="(loadChat(\'' + doc.id + ',' + doc.get("school") + '\'))" class="item-link item-content no-chevron">\
                <div class="item-inner">\
                  <div class="item-title-row">\
                    <div class="item-title">' + chat.get("name") + '</div>\
                    <div class="item-after">' + '12:14' + '</div>\
                  </div>\
                  <div class="item-text"><b>' + message.get("userID") + ': </b>' + message.get("text") + '</div>\
                </div>\
              </a>';
            ls.appendChild(li);
          });
        });
      });
    });
  });
  var skeleton = document.getElementById('subscribed-chats-skeleton');
  skeleton.parentNode.removeChild(skeleton);
}

function subscribeToChat(chatID, chatSchool) { //Subscribes the user to the specified chat.//TODO get the chat school variable dynamicly.
  console.log("subscribing to chat")
  db.collection("users").doc(User.uid).collection("chats").doc(chatID).set({
    school: chatSchool
  });
}

function unsubscribeFromChat(chatID, chatSchool) { //Unsubscribes the user from the specified chat.
  db.collection("users").doc(User.uid).collection("chats").doc(chatID).update({
    school: firebase.firestore.FieldValue.delete()
  });
  db.collection("users").doc(User.uid).collection("chats").doc(chatID).delete().then(function() {
    console.log("successfully unsubscribed from chat");
  }).catch(function(error) {
    console.error("Error removing document: ", error);
  });;
}

function loadChat(chatID, chatSchool) {
  console.log("chatID:" + chatID + " school:" + chatSchool);
  self.app.views.main.router.navigate('/chat-screen/');
  console.log(app.views.main.router.url);
  document.getElementById("group-name").innerinnerHTML = "GROUP NAME";
}

function previewChat(chatID, chatSchool) {
  console.log("chatID:" + chatID + " school:" + chatSchool);
  self.app.views.main.router.navigate('/preview-chat-screen/');
}

function addMessage(school, chatID, message) { //Adds a message to the specified chatroom.
  db.collection("school").doc(school).collection("chats").doc(chatID).collection("messages").add({
      userID: User.uid,
      profilePicUrl: "https://lh4.googleusercontent.com/-bDz3d4hCLzA/AAAAAAAAAAI/AAAAAAAAAEk/xwohCLOzw7c/photo.jpg", //TODO change this to the users profile pic
      text: message, //document.getElementById("messagebar").value, //not sure if this is the best way to do this
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(function(docRef) {
      console.log("Document written with ID: ", docRef.id);
    })
    .catch(function(error) {
      console.error("Error adding document: ", error);
    });
}
////////////////