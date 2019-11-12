/////User Data/////

var email;
var password;
var firstName;
var lastName;
var err;

function signUp() { //signs up a new user
  app.progressbar.show(localStorage.getItem("themeColor"));

  email = document.getElementById("email").value;
  password = document.getElementById("newpword").value;
  firstName = document.getElementById("firstName").value;
  lastName = document.getElementById("lastName").value;
  err = document.getElementById("newerrmsg");
  err.innerHTML = "";

  console.log(firstName);
  if (firstName == "" || lastName == "") {
    app.progressbar.hide();
    err.innerHTML = "Oops! The first or last name field is empty.";
    return;
  }

  firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
    app.progressbar.hide();
    err.innerHTML = "Oops! " + error.message;
    return;
  }).then(function() {
    db.collection("users").doc(uid).set({
      firstName: firstName,
      lastName: lastName,
      school: "null"
    }).catch(function(error) {
      app.progressbar.hide();
      err.innerHTML = "Oops! " + error.message;
      return;
    }).then(function() {
      app.progressbar.hide();
      self.app.views.main.router.navigate('/welcome-page/');
    });
  });
}

function signIn() { //Signs in a user
  app.progressbar.show(localStorage.getItem("themeColor"));
  var username = document.getElementById("uname").value;
  var password = document.getElementById("pword").value;
  var err = document.getElementById("errmsg");
  err.innerHTML = "";
  firebase.auth().signInWithEmailAndPassword(username, password).catch(function(error) {
    app.progressbar.hide();
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log("Failed to login: " + error.message);
    err.innerHTML = "Oops! " + error.message;
  }).then(function() {
    app.progressbar.hide();
  });
}

function signOut() { //Signs out the user
  firebase.auth().signOut().then(function() {
    // Sign-out successful.
  }).catch(function(error) {
    console.log("Failed to sign out: " + error.message);
  });
}

function loadUserData() {
  console.log("load user data");
  User = {
    uid: uid,
    firstName: user.get("firstName"),
    lastName: user.get("lastName"),
    school: user.get("school"),
    fullName: function() {
      return "" + this.firstName + " " + this.lastName;
    },
    chats: db.collection("users").doc(uid).collection("chats").get()
  }
}

//Edits the users profile data.
function editUserData() {

  app.progressbar.show(localStorage.getItem("themeColor"));

  var updatedUserInfo = false;
  var updatedUserPic = false;
  var updatedUserPassword = false;
  var pageName = app.views.main.router.url;

  var errorMessage = document.getElementById("error-message");
  errorMessage.innerHTML = "";

  db.collection("users").doc(User.uid).update({
    //firstName: document.getElementById("firstName").value,
    //lastName: document.getElementById("lastName").value,
    tagline: document.getElementById("tagline").value,
    bio: document.getElementById("bio").value,

  }).then(function() {
    updatedUserInfo = true;
    if (updatedUserPic) {
      if (pageName == "/welcome-page/") {
        self.app.views.main.router.navigate('/school-search-page/');
      }

      app.progressbar.hide();
      app.toast.show({
        text: 'User info sucessfully updated!',
        closeTimeout: 2000,
      });
    }

  }).catch(function(error) {
    errorMessage.innerHTML += "Oops! " + error;
    console.error("Error updating user data: ", error);
    app.progressbar.hide();
  });


  var file = document.getElementById('profile-pic').files[0];
  var profilePictureRef = storageRef.child('profile-pictures').child(User.uid);
  profilePictureRef.put(file).then(function(snapshot) {
    updatedUserPic = true;
    if (updatedUserInfo) {

      if (pageName == "/welcome-page/") {
        self.app.views.main.router.navigate('/school-search-page/');
      }

      app.progressbar.hide();
      app.toast.show({
        text: 'User info sucessfully updated!',
        closeTimeout: 2000,
      });
    }
  }).catch(function(error) {
    app.progressbar.hide();
    errorMessage += "Oops! " + error;
  });




  var newPassword = document.getElementById("password");
  if (newPassword) {
    var user = firebase.auth().currentUser;
    user.updatePassword(newPassword.value).then(function() {
      // Update successful.
      console.log("updated password");
    }).catch(function(error) {
      // An error happened.
      app.progressbar.hide();

      console.log("Failed to update password", error);
    });
  }

}

function previewPic(event) {
  document.getElementById('profile-pic-preview').style.backgroundImage = "url(" + URL.createObjectURL(event.target.files[0]) + ")";
  document.getElementById('profile-pic-icon').innerHTML = "edit";

  console.log("url(" + URL.createObjectURL(event.target.files[0]) + ")");
};


var progressbarPercent = 0;

function setProgressbar(percent) {

  if (progressbarPercent == 0) app.progressbar.show(0, localStorage.getItem("themeColor"));

  progressbarPercent += percent;

  console.log("progress: " + progressbarPercent + "%");

  if (progressbarPercent >= 100) {
    app.progressbar.hide();
    progressbarPercent = 0;
    console.log("Progressbar Complete!");
    return;
  }

  app.progressbar.show(progressbarPercent, localStorage.getItem("themeColor"));

}

function changeSchool(newSchoolID) {
  console.log(User);
  var oldSchool = User.school;
  db.collection("users").doc(User.uid).update({
      school: newSchoolID
    })
    .then(function() {
      //Removes the user from the old school
      db.collection("school").doc(oldSchool).collection("users").doc(User.uid).delete().then(function() {
        console.log("Document successfully deleted! Document id: " + oldSchool);
        self.app.views.main.router.navigate('/home/', {
          reloadCurrent: true,
          ignoreCache: true,
        });
      }).catch(function(error) {
        console.error("Error removing document: ", error);
      });
      //Adds the user to the new school
      db.collection("school").doc(newSchoolID).collection("users").doc(User.uid).set({
          name: "" + User.firstName + " " + User.lastName
        })
        .then(function() {
          console.log(" successfully added user to school");
        })
        .catch(function(error) {
          console.error("Error adding user to school: ", error);
        });


      loadMainPage();
      console.log("user school successfully updated!");
      //TODO add user to user array

    })
    .catch(function(error) {
      console.error("Error updating user school: ", error);
    });

}

function searchSchools() { //Loads the schools from the database
  app.progressbar.show(localStorage.getItem("themeColor"));

  var query = document.getElementById("school-zip").value;
  var schoolsList = document.getElementById("schools-list");
  var foundSchools = false;

  //check for a valid zip code before search
  if (isNaN(query)) {
    schoolsList.innerHTML = '<div class="text-align-center">Please enter a valid zip code</div>';
    app.progressbar.hide();
    return;
  } else {
    var zip = parseInt(query);
  }

  schoolsList.innerHTML = "";

  //search database for schools with given zip code
  var schools = db.collection("school").where("zip", "==", zip);
  schools.get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) { // add results to page
      foundSchools = true;
      var li = document.createElement('li');
      li.classList.add("card-block");
      li.innerHTML = '<h3>' + doc.get("name") +
        '</h3><div class="school-attributes"><p>' +
        doc.get("address") + ' ' + doc.get("city") + ', ' + doc.get("state") +
        '</p><p>' + doc.get("level") + ' School</p></div>' +
        '<button onclick="changeSchool(\'' + doc.id + '\')" class="button" style="width: auto">Select this School</button>';
      schoolsList.appendChild(li);

    });
  }).catch(function(error) {
    schoolsList.innerHTML += '<div class="text-align-center">Oops! ' + error + '</div>';
    app.progressbar.hide();
  }).then(function() {
    schoolsList.innerHTML += '<div class="text-align-center">Don\'t see your school?</div><div class="display-flex justify-content-center"><a class="text-align-center" href="/new-school-page/">Add a new school</a></div>';
    app.progressbar.hide();
  });
}

function createNewSchool() {
  db.collection("school").add({
    address: document.getElementById("school-address").value,
    city: document.getElementById("school-city").value,
    level: document.getElementById("school-level").value,
    name: document.getElementById("school-name").value,
    phone: document.getElementById("school-phone").value,
    state: document.getElementById("school-state").value,
    website: document.getElementById("school-website").value,
    zip: Number(document.getElementById("school-zip").value),
  }).then(function(docRef) {
    console.log("Added a new school to the server with ID: ", docRef.id);
    changeSchool(docRef.id);
  }).catch(function(error) {
    console.error("Error adding school: ", error);
    document.getElementById("newerrmsg").innerHTML = "Oops! " + error;
  });
}