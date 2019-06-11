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

function editUserData() { //Edits the users profile data.
  var firstName = document.getElementById("firstName").value;

  if (firstName != "") {
    db.collection("users").doc(User.uid).update({
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value
      })
      .then(function() {
        console.log("user data successfully updated!");
      })
      .catch(function(error) {
        console.error("Error updating user data: ", error);
      });
  }



  var newPassword = document.getElementById("password").value;
  if (newPassword != '') {
    var user = firebase.auth().currentUser;
    user.updatePassword(newPassword).then(function() {
      // Update successful.
      console.log("updated password");
    }).catch(function(error) {
      // An error happened.
      console.log("Failed to update password", error);
    });
  }
}

function changeSchool(newSchoolID) {
  db.collection("users").doc(User.uid).update({
      school: newSchoolID
    })
    .then(function() {
      self.app.views.main.router.navigate('/home/',
      { reloadCurrent: true, ignoreCache: true,});

      loadSchoolEvents();
      loadSchoolChats();
      loadSubscribedChats();

      console.log("user school successfully updated!");
    })
    .catch(function(error) {
      console.error("Error updating user school: ", error);
    });

}

function searchSchools() { //Loads the schools fromthe database
  console.log("load schools");
  var zip = parseInt(document.getElementById("school-zip").value);
  var schoolsList = document.getElementById("schools-list");
  var foundSchools = false;
  console.log(zip);

  schoolsList.innerHTML = "";
  var schools = db.collection("school").where("zip", "==", zip);
  schools.get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
      foundSchools = true;


              var li = document.createElement('li');
              li.classList.add("card-block");
              li.innerHTML = '<div class="title">' + doc.get("name") +
              '</div><div class="hairline"></div><div class="school-attributes"><p>'
               + doc.get("address") + ' ' + doc.get("city") + ', ' + doc.get("state") +
              '</p><p>' + doc.get("level") + 'School</p></div>' +
              '<button onclick="changeSchool(\'' + doc.id + '\')" class="button">Select this School</button>';
              schoolsList.appendChild(li);

    });
  }).catch(function(error) {
        schoolsList.innerHTML = '<div class="text-center">No schools found.</div>\
        <div class="justify-content-center"><a href="/new-school-screen/">Add your school</a>';
      });
}
///////////
