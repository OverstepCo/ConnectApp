/////User Data/////
function signUp() { //signs up a new user
  app.progressbar.show(localStorage.getItem("themeColor"));

  var email = document.getElementById("email").value;
  var password = document.getElementById("newpword").value;
  var err = document.getElementById("newerrmsg");
  err.innerHTML = "";

  firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
    app.progressbar.hide();

    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log("Failed to sign up: " + errorMessage);
    err.innerHTML = "Oops! " + errorMessage;
  }).then(function() {
    app.progressbar.hide();
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

  var updatedUserInfo;
  var updatedUserPic = false;
  var updatedUserPassword = false;
  var pageName = app.views.main.router.url;

  console.log(pageName);

  var errorMessage = document.getElementById("error-message");
  errorMessage.innerHTML = "";

  db.collection("users").doc(User.uid).update({
    //firstName: document.getElementById("firstName").value,
    //lastName: document.getElementById("lastName").value,
    tagline: document.getElementById("tagline").value,
    bio: document.getElementById("bio").value,

  }).then(function() {
    updatedUserInfo = true;
    if (pageName == "/welcome-page/" && updatedUserPic) {
      self.app.views.main.router.navigate('/school-search-page/');
    }
    app.progressbar.hide();
  }).catch(function(error) {
    errorMessage.innerHTML += "Oops! " + error;
    console.error("Error updating user data: ", error);
    app.progressbar.hide();

  });


  var file = document.getElementById('profile-pic').files[0];
  var profilePictureRef = storageRef.child('profile-pictures').child(User.uid);
  profilePictureRef.put(file).then(function(snapshot) {
    updatedUserPic = true;
    if (pageName == "/welcome-page/" && updatedUserInfo) {
      self.app.views.main.router.navigate('/school-search-page/');
    }
    app.progressbar.hide();
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
        '</div><div class="hairline"></div><div class="school-attributes"><p>' +
        doc.get("address") + ' ' + doc.get("city") + ', ' + doc.get("state") +
        '</p><p>' + doc.get("level") + ' School</p></div>' +
        '<button onclick="changeSchool(\'' + doc.id + '\')" class="button">Select this School</button>';
      schoolsList.appendChild(li);

    });
  }).then(function() {
    schoolsList.innerHTML += '<div class="text-align-center">Don\'t see your school?</div><div class="display-flex justify-content-center"><a class="text-align-center" href="/new-school-page/">Add a new school</a></div>';
  }).catch(function(error) {

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

function wsNext() {
  console.log("hi");
  app.swiper.get('.welcome-swiper').slideNext();
}