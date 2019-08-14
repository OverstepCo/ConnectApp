///////Events//////
var finishedLoadingMessages = false;


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
  }).then(function() {
    console.log("Added a new event to the server");
  });
}

function createNewEvent() {
  var name = document.getElementById("event-name").value;
  var day = document.getElementById("event-day").value;
  var time = document.getElementById("event-time").value;
  var location = document.getElementById("event-location").value;
  var description = document.getElementById("event-description").value;
  var image = document.getElementById("event-image"),
    style = image.currentStyle || window.getComputedStyle(image, false),
    bi = style.backgroundImage.slice(4, -1).replace(/"/g, "");
  addSchoolEvent(name, bi, day, time, location, description, '');
}

var card = document.getElementById("expandable-card");
var cardName = document.getElementById("expandable-card-name");
var cardDescription = document.getElementById("expandable-card-description");
var cardMedia = document.getElementById("expandable-card-media");
var cardContent = document.getElementById("expandable-card-content");

function openCard(eventIndex) {
  setupEventChat(events[eventIndex].eventID);
  cardName.innerHTML = events[eventIndex].name;
  cardMedia.style.backgroundImage = "url(" + events[eventIndex].image + ")";
  cardDescription.innerHTML = events[eventIndex].description;
  card.style.display = "inherit";
  setTimeout(showCard, 5);
}

function closeCard() {
  app.messages.clear()
  app.messages.destroy('.event-messages')
  finishedLoadingMessages = false;


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

var eventMessageBtn = document.getElementById("event-send-link");

function setupEventChat(eventID) {
  eventMessageBtn.setAttribute("onClick", "sendEventMessage('" + eventID + "')");
  var messagesArray = [];
  var lastTimestamp;
  //Gets all the messages from the chat room and adds them to the local messaging system
  db.collection("school").doc(User.school).collection("event").doc(eventID).collection("messages").orderBy("timestamp", "desc").limit(20).get().then(function(snapshot) {
    snapshot.docChanges().forEach(function(change) {
      if (lastTimestamp && (lastTimestamp.getTime() - change.doc.get("timestamp").toDate().getTime()) > 86400000) {
        var difference = (lastTimestamp.getTime() - change.doc.get("timestamp").toDate().getTime());
        var timestampString;

        //if this week
        if ((lastTimestamp.getDay() - change.doc.get("timestamp").toDate().getDay()) >= 0) {
          var now = new Date();
          var today = now.getDay();

          //if today
          if (today == lastTimestamp.getDay()) {
            timestampString = "Today, ";

            //if another day this week
          } else {
            var daysArray = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            timestamp = daysArray[lastTimestamp.getDay()] + ", ";
          }

          //if not this week
        } else {
          var monthsArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
          timestampString = monthsArray[lastTimestamp.getMonth()] + " " + (lastTimestamp.getDate() + 1) + ", ";
        }
        var hour = lastTimestamp.getHours();
        timestampString += (hour < 12 || hour === 24) ? (hour + ":" + lastTimestamp.getMinutes() + " AM") : ((hour - 12) + ":" + lastTimestamp.getMinutes() + " PM");
        messagesArray.unshift({
          text: timestampString,
          isTitle: true,
        });
      }

      messagesArray.unshift({
        text: change.doc.get("text"),
        isTitle: change.doc.get("isTitle"),
        type: 'received',
        avatar: "https://proxy.duckduckgo.com/iu/?u=http%3A%2F%2Fimages.complex.com%2Fcomplex%2Fimage%2Fupload%2Fc_limit%2Cw_680%2Ffl_lossy%2Cpg_1%2Cq_auto%2Fe28brreh7mlxhbeegozo.jpg&f=1", //TODO get user picture
        header: ("<b>" + change.doc.get("name") + "</b>  " + timeSince(change.doc.get("timestamp").toDate())),
      });

      lastTimestamp = change.doc.get("timestamp").toDate();

    });

  }).then(function() {
    addListener(messagesArray, eventID);
  });




}


function sendEventMessage(eventID) {
  // Init Messagebar
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
      name: User.fullName(),
      profilePicUrl: "https://lh4.googleusercontent.com/-bDz3d4hCLzA/AAAAAAAAAAI/AAAAAAAAAEk/xwohCLOzw7c/photo.jpg", //TODO change this to the users profile pic
      text: text, //document.getElementById("messagebar").value, //not sure if this is the best way to do this
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(function(docRef) {
      console.log("Document written with ID: ", docRef.id);
    })
    .catch(function(error) {
      console.error("Error adding document: ", error);
    });
}

function addListener(messagesArray, eventID) {

  messages = app.messages.create({ //Some rules and stuff
    el: '.event-messages',
    messages: messagesArray,
  });

  //Adds a listener for any new chat messages
  listener = db.collection("school").doc(User.school).collection("event").doc(eventID).collection("messages").orderBy("timestamp", "asc")
    .onSnapshot(function(snapshot) { //Listens to the chat room for any new messages.
      //if (finishedLoadingMessages) {
      snapshot.docChanges().forEach(function(change) {
        if (change.type != "added") {
          console.log(change.doc.get("text"));
          messages.addMessage({
            text: change.doc.get("text"),
            isTitle: change.doc.get("isTitle"),
            type: (change.doc.get("userID") != User.uid) ? 'received' : 'sent',
            name: change.doc.get("name"),
            avatar: "https://proxy.duckduckgo.com/iu/?u=http%3A%2F%2Fimages.complex.com%2Fcomplex%2Fimage%2Fupload%2Fc_limit%2Cw_680%2Ffl_lossy%2Cpg_1%2Cq_auto%2Fe28brreh7mlxhbeegozo.jpg&f=1" //TODO get user picture
          });
        }
      });
      //}
      finishedLoadingMessages = true;
    });
}