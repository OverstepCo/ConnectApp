//////Chats/////
function loadSchoolChats() { //Loads all the chats in the users current school//TODO clear the currently loaded chats if there are any
  db.collection("school").doc(User.school).collection("chats").get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
      //this loop runs once for every chat room in the school
      var ls = document.getElementById("school-group-chats");
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
      console.log("docID: " + doc.id);

      //this loop runs once for every chat room the current user is subscribed to
      db.collection("school").doc(doc.get("school") + "").collection("chats").doc(doc.id).get().then(function(chat) {
        console.log("chatName: " + chat.get("name"));

        db.collection("school").doc(doc.get("school") + "").collection("chats").doc(doc.id).collection("messages").orderBy("timestamp", "desc").limit(1).get().then(function(messages) {
          messages.forEach(function(message) { ///This lop runs once for each message in the chat room.
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
            var skeleton = document.getElementById('subscribed-chats-skeleton');
            skeleton.parentNode.removeChild(skeleton);
          });
        });
      });
    });
  });
}

function subscribeToChat() { //Subscribes the user to the specified chat.//TODO get the chat school variable dynamicly.
  console.log("subscribing to chat")
  console.log(currentChat + currentChatSchool);
  db.collection("users").doc(User.uid).collection("chats").doc(currentChat).set({
    school: currentChatSchool
  });
}

function unsubscribeFromChat() { //Unsubscribes the user from the specified chat.
  db.collection("users").doc(User.uid).collection("chats").doc(currentChat).update({
    school: firebase.firestore.FieldValue.delete()
  });
  db.collection("users").doc(User.uid).collection("chats").doc(currentChat).delete().then(function() {
    console.log("successfully unsubscribed from chat");
  }).catch(function(error) {
    console.error("Error removing document: ", error);
  });;
}
var currentChat;
var currentChatSchool;

function loadChat(chatID, chatSchool) {
  console.log("chatID:" + chatID + " school:" + chatSchool);
  currentChat = chatID;
  currentChatSchool = chatSchool
  self.app.views.main.router.navigate('/chat-screen/');
  console.log(app.views.main.router.url);

}

function setupChat() {
  console.log("setting up chat " + currentChatSchool + currentChat);
  var messages = app.messages.create({
    el: '.messages',
    // First message rule
    firstMessageRule: function(message, previousMessage, nextMessage) {
      // Skip if title
      if (message.isTitle) return false;
      /* if:
        - there is no previous message
        - or previous message type (send/received) is different
        - or previous message sender name is different
      */
      if (!previousMessage || previousMessage.type !== message.type || previousMessage.name !== message.name) return true;
      return false;
    },
    // Last message rule
    lastMessageRule: function(message, previousMessage, nextMessage) {
      // Skip if title
      if (message.isTitle) return false;
      /* if:
        - there is no next message
        - or next message type (send/received) is different
        - or next message sender name is different
      */
      if (!nextMessage || nextMessage.type !== message.type || nextMessage.name !== message.name) return true;
      return false;
    },
    // Last message rule
    tailMessageRule: function(message, previousMessage, nextMessage) {
      // Skip if title
      if (message.isTitle) return false;
      /* if (bascially same as lastMessageRule):
        - there is no next message
        - or next message type (send/received) is different
        - or next message sender name is different
      */
      if (!nextMessage || nextMessage.type !== message.type || nextMessage.name !== message.name) return true;
      return false;
    }

  });

  // Init Messagebar
  var messagebar = app.messagebar.create({
    el: '.messagebar'
  });

  // Response flag
  var responseInProgress = false;

  // Send Message
  $$('.send-link').on('click', function() {
    var text = messagebar.getValue().replace(/\n/g, '<br>').trim();
    // return if empty message
    if (!text.length) return;
    // Clear area
    messagebar.clear();
    // Return focus to area
    messagebar.focus();
    // Add message to messages
    messages.addMessage({
      text: text,
    });
    addMessage(currentChatSchool, currentChat, text);
    if (responseInProgress) return;
    // Receive dummy message
    receiveMessage();
  });

  // Dummy response
  var answers = [
    'Yes!',
    'Woo'
  ]
  var people = [{
    name: 'Bob Ross',
    avatar: 'https://cdn.framework7.io/placeholder/people-100x100-9.jpg'
  }];

  function receiveMessage() {
    responseInProgress = true;
    setTimeout(function() {
      // Get random answer and random person
      var answer = answers[Math.floor(Math.random() * answers.length)];
      var person = people[Math.floor(Math.random() * people.length)];
      // Show typing indicator
      messages.showTyping({
        header: person.name + ' is typing',
        avatar: person.avatar
      });

      setTimeout(function() {
        // Add received dummy message
        messages.addMessage({
          text: answer,
          type: 'received',
          name: person.name,
          avatar: person.avatar
        });
        // Hide typing indicator
        messages.hideTyping();
        responseInProgress = false;
      }, 1000);
    }, 1000);
  }

  //  loadChatMessages(currentChat, currentChatSchool);
  db.collection("school").doc(currentChatSchool).collection("chats").doc(currentChat).collection("messages").orderBy("timestamp", "asc").limit(30).get().then(function(messagesDB) {
    messagesDB.forEach(function(message) { ///This lop runs once for each message in the chat room
      messages.addMessage({
        text: message.get("text"),

        type: (message.get("userID") == User.userID) ? 'received' : 'sent',
        name: message.get("userID"),
        avatar: "https://proxy.duckduckgo.com/iu/?u=http%3A%2F%2Fimages.complex.com%2Fcomplex%2Fimage%2Fupload%2Fc_limit%2Cw_680%2Ffl_lossy%2Cpg_1%2Cq_auto%2Fe28brreh7mlxhbeegozo.jpg&f=1" //TODO get user picture
      });
    });
  });


  //document.getElementById("group-name").innerHTML = "whaaa";
  //  messages.addMessage({
  //  text: "helooo",
  //});
}

function previewChat(chatID, chatSchool) {
  console.log("chatID:" + chatID + " school:" + chatSchool);
  currentChat = chatID;
  currentChatSchool = chatSchool;
  self.app.views.main.router.navigate('/preview-chat-screen/');
}

function loadChatMessages(chatID, chatSchool) {



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