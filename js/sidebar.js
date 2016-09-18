'use strict'

/*
* Sidebar Functions
* Display detailed letter information in the sidebar
*/

var sidebar = (() => {
  // Turn sidebar on/off depending on current state
  function toggleInfo(action) {
      var sidebar = $('#sidebar')
      var sidebarWidth = sidebar.width()

      if (action == 'open' && !sidebar.hasClass('open')) {
          sidebar.toggleClass('open')
          sidebar.animate({right: 0})
      }
      if (action == 'close' && sidebar.hasClass('open')) {
          sidebar.toggleClass('open')
          sidebar.animate({
              right: -sidebarWidth
          }, 250)
          $('#info').html("")
      }
  }


  // Generate detailed text for letter info and display in sidebar
  function getLetters(type, name) {
      var sentLocation = type == "place" ? name : name.split(" to ")[0]
      var receivedLocation = type == "place" ? name : name.split(" to ")[1]
      var text = ""

      if (type == "place") {
        text = data.rows.reduce((p, c) => {
          if (c.sentlocation == sentLocation || c.receivedlocation == receivedLocation) {

            return p + "<p class='letter'>" +
            "From: " + c.Sender + "<br />" +
            "To: " + c.Recipient + "<br />" +
            "Date: " + c.date + "<br />" +
            c.Title + "<br />" +
            "<a href='" + c.Link + "'>Original Document</a>" +
            "</p>"
          }
          else {
            return p
          }
        },"")
      }

      if (type == "line") {
          text = data.rows.reduce((p, c) => {
              if (c.sentlocation == sentLocation && c.receivedlocation == receivedLocation) {
                return p + "<p class='letter'>" +
                "From: " + c.Sender + "<br />" +
                "To: " + c.Recipient + "<br />" +
                "Date: " + c.date + "<br />" +
                c.Title + "<br />" +
                "<a href='" + c.Link + "'>Original Document</a>" +
                "</p>"
              }
          },"")
      }

      document.getElementById("info").innerHTML = text
      toggleInfo('open')
  }

  return {
    toggleInfo: toggleInfo,
    getLetters: getLetters,
  }
})()