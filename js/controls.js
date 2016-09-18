'use strict'

/*
* Control Functions
* Handle the interactive map controls
*/


// Establish some global variables to handle our timeline
var nIntervId, origStart, origEnd, currYear = null
var fromPause = false
var includeNaNDates = false

// Main function called before the map loads.
// Creates the slider control, the play button, and sets the date values

function startControls() {
  startSlider()
  updateDates()
  addEvents()
}


function startSlider() {
  $('#slider').slider(
    {
      range: true,
      min: data.minYear,
      max: data.maxYear,
      step: 1,
      values: [data.minYear, data.maxYear],
      change: function(event, ui) {
          filterMap(ui.values[0], ui.values[1])
          updateDates()
      }
  })
}


function updateDates() {
  if ($('#slider').slider('values', 0) == $('#slider').slider('values', 1)) {
    $('#dates').text($('#slider').slider('values', 0))
  }

  else {
    $('#dates').text($('#slider').slider('values',0) + " - " + $('#slider').slider('values',1))
  }
}


function addEvents() {
  document.getElementById('playButton').addEventListener('click', playTime)
  document.getElementById('pauseButton').addEventListener('click', pauseTime)
  document.getElementById('stopButton').addEventListener('click', stopTime)
  document.getElementById('includeNaN').addEventListener('click', filterNaN)

  $('#buttons span').hover(
    () => { $( this ).addClass('ui-state-hover') },
    () => { $( this ).removeClass('ui-state-hover') }
  )
}


// Starts the play button
function playTime() {
  if (!fromPause) {
    origStart = currYear = $("#slider").slider("values",0)
    origEnd = $("#slider").slider("values",1)
  }

  document.getElementById('playButton').style.display = "none"
  document.getElementById('pauseButton').style.display = "inline-block"

  nIntervId = setInterval(nextTime, 100)
}


// Pauses the play button
function pauseTime() {
  if (origStart && origEnd && !fromPause) {
    document.getElementById('playButton').style.display = "inline-block"
    document.getElementById('pauseButton').style.display = "none"

    fromPause = true

    clearInterval(nIntervId)
  }
}


// Stops the play button
function stopTime() {
  if (origStart && origEnd) {
    clearInterval(nIntervId)

    document.getElementById('playButton').style.display = "inline-block"
    document.getElementById('pauseButton').style.display = "none"

    $("#slider").slider("values",1, origEnd)

    filterMap(origStart, origEnd)

    origStart = origEnd = null
    fromPause = false
  }
}


// Cycle to the next time, while the play button is active.
function nextTime() {
    if (currYear == origEnd) {
      stopTime()
    }

    filterMap(currYear, origEnd)
    currYear += 1
    $("#slider").slider("values",1, currYear)
}

function filterNaN() {
  if (document.getElementById("includeNaN").checked) {
    includeNaNDates = true
  }
  else {
    includeNaNDates = false
  }

  filterMap($("#slider").slider("values",0), $("#slider").slider("values",1))
}
