///////Events//////
var finishedLoadingMessages = false;
var eventListener;
var rsvpd;

function addNewEvent() { //Gets the data we need from the ui and posts it to the server may eventually merrge this with addSchoolEvent()
  var name = document.getElementById("newEventName").value;
  var imageUrl = "media/stock/event_pattern.jpg"; //TODO get this from the new event page
  var day = document.getElementById("newEventDay").value;
  var time = document.getElementById("newEventTime").value;
  var location = document.getElementById("newEventLocation").value;
  var description = document.getElementById("newEventDescription").value;
  var guests = null; //TODO store on server as an array
  addSchoolEvent(name, imageUrl, day, time, location, description, guests);
}

function createNewEvent() {
  app.progressbar.show(localStorage.getItem("themeColor"));

  var name = document.getElementById("event-name").value;
  var time = document.getElementById("event-time").value;
  var location = document.getElementById("event-location").value;
  var description = document.getElementById("event-description").innerHTML;
  addSchoolEvent(name, time, location, description, '');
}

function addSchoolEvent(name, time, location, description, guests) { //Adds a event to the school database with the provided data
  db.collection("school").doc(User.school).collection("event").add({
    name: name,
    time,
    location,
    description,
    guests,
    owner: User.uid
  }).catch(function(error) {
    showError(error);
  }).then(function(doc) {
    var pic = document.getElementById('event-pic').files[0];
    storageRef.child('event-pictures').child(doc.id).put(pic).then(function(snapshot) {
      app.progressbar.hide();
      loadUserData();
      var toastBottom = app.toast.create({
        text: 'Your event was created!',
        closeTimeout: 2000,
      });
      toastBottom.open();
    });
  });
}

var card = document.getElementById("expandable-card");
var cardName = document.getElementById("expandable-card-name");
var cardDescription = document.getElementById("expandable-card-description");
var cardMedia = document.getElementById("expandable-card-media");
var cardContent = document.getElementById("expandable-card-content");
var button = document.getElementById("rsvp");

function openCard(eventIndex) {
  setupEventChat(events[eventIndex].eventID);
  cardName.innerHTML = events[eventIndex].name;
  cardMedia.style.backgroundImage = "url(" + events[eventIndex].image + ")";
  cardDescription.innerHTML = events[eventIndex].description;
  card.style.display = "inherit";
  console.log("waa");
  button.setAttribute("onclick", "rsvp(" + eventIndex + ")");

  //Loads the users attending this event
  db.collection("school").doc(User.school).collection("event").doc(events[eventIndex].eventID).collection("users").get().then(function(querySnapshot) {
    var membersList = document.getElementById('attendees');
    //Remove all children
    while (membersList.firstChild) {
      membersList.removeChild(membersList.firstChild);
    }
    //ForEach user in the event
    querySnapshot.forEach(function(doc) {
      //check to see if the id matches the current user. Thes set the state of the rsvp button accordingly
      if (!rsvpd) {
        if (doc.id == User.uid) {
          console.log("user is rsvpd");
          rsvpd = true;
          document.getElementById("rsvp").innerHTML = "un-rsvp";
        } else {
          document.getElementById("rsvp").innerHTML = "rsvp";
          console.log("user is not rsvpd");
          rsvpd = false;
        }
      }
      //Then create a icon for the user attending the event
      getUserData(doc.id, function(user) {
        var a = document.createElement('div');
        a.classList.add("attendee");
        a.onclick = function() {
          loadUserpage(user.uid);
        };
        a.innerHTML =
          '<p class="profile-pic-icon" style="background-image: url(' + user.picURL + ')" ></p>' +
          '<p>' + user.username + '</p>';
        membersList.appendChild(a);
      });
    });
  });
  setTimeout(showCard, 5);
}

function closeCard() {
  app.messages.clear()
  app.messages.destroy('.event-messages')
  finishedLoadingMessages = false;
  eventListener(); //This is for closing the unfinished event chat real time update
  cardContent.classList.add("card-content-closed")
  cardMedia.classList.add("card-media-closed")
  setTimeout(hideCard, 500)
}

function showCard() {
  cardMedia.classList.remove("card-media-closed")
  cardContent.classList.remove("card-content-closed")
}

function hideCard() {
  card.style.display = "none";
}

function rsvp(eventID) {
  //if the user is not alrady rsvped then rsvp else un-rsvp
  console.log(rsvpd);
  if (!rsvpd) {
    db.collection("school").doc(User.school).collection("event").doc(events[eventID].eventID).collection("users").doc(User.uid).set({
      name: User.firstName + ' ' + User.lastName
    }).then(function() {
      console.log("rsvpd");
      document.getElementById("rsvp").innerHTML = "un-rsvp";
    });
    rsvpd = true;
  } else {
    db.collection("school").doc(User.school).collection("event").doc(events[eventID].eventID).collection("users").doc(User.uid).delete().then(function() {
      console.log("un-rsvpd");
      document.getElementById("rsvp").innerHTML = "rsvp";
      rsvpd = false;
    });
  }
}

var eventMessageBtn = document.getElementById("event-send-link");

function setupEventChat(eventID) {
  eventMessageBtn.setAttribute("onClick", "sendEventMessage('" + eventID + "')");
  eventMessages = []; //Clear the event message array
  //Adds a listener for the event chats this will load all the chat messages asnychronusly
  addListener(eventID);
  console.log("added listener for event chats");
}

function sendEventMessage(eventID) {
  // Init Messagebar////// TODO: do we need to init messagebare every time we send a
  var messagebar = app.messagebar.create({
    el: '.event-messagebar'
  });
  var text = messagebar.getValue().replace(/\n/g, '<br>').trim();
  // return if empty message
  if (!text.length) return;
  // Clear area
  messagebar.clear();
  // Return focus to area
  messagebar.focus();
  //Add message to the server.
  db.collection("school").doc(User.school).collection("event").doc(eventID).collection("messages").add({
    userID: User.uid,
    text: text, //document.getElementById("messagebar").value, //not sure if this is the best way to do this
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(function(docRef) {
    console.log("Sent message: ", docRef.id);
  }).catch(function(error) {
    console.error("Error sending message : ", error);
  });
}

var eventMessages = [];

function addListener(eventID) {

  messages = app.messages.create({ //Some rules and stuff
    el: '.event-messages',
    messages: [],
  });

  //Adds a listener for any new chat messages
  eventListener = db.collection("school").doc(User.school).collection("event").doc(eventID).collection("messages").orderBy("timestamp", "asc")
    .onSnapshot({
      // Listen for document metadata changes
      includeMetadataChanges: true
    }, function(snapshot) { //Listens to the chat room for any new messages.
      //if (finishedLoadingMessages) {
      console.log("listining");
      //ForEach changed message in the document
      snapshot.docChanges().forEach(function(change) {
        //We chekh to see if it is added information or modified information then we check to make sure it is from the server with !snapshot.metadata.hasPendingWrites
        if ((change.type == "added" || change.type === "modified") && !snapshot.metadata.hasPendingWrites) {
          console.log("added new message");
          //Load the user data of the message sender
          getUserData(change.doc.get('userID'), function(user) {
            messages.clear(); //clear framework7's message system
            eventMessages.unshift({ //Add the massage to our array
              text: change.doc.get("text"),
              isTitle: change.doc.get("isTitle"),
              type: 'received',
              avatar: user.picURL, //TODO get user picture
              header: ("<b>" + user.username + "</b>  " + timeSince("" + change.doc.get("timestamp").toDate())),
              timestamp: change.doc.get("timestamp").seconds
            });
            eventMessages.sort((a, b) => a.timestamp - b.timestamp); //Sort our message array by timestamp
            messages.messages = eventMessages.slice(); //Set framework7's messagesArray to a copy of our array
            messages.renderMessages(); //Tell framework7 to render the messages
          });
        }
      });
    });
}

function showToast(msg) {
  app.progressbar.hide();
  app.toast.show({
    text: msg,
    closeTimeout: 2000,
  });
}