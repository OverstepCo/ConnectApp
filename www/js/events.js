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