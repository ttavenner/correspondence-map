'use strict'

/*
* Define Map
*/

// Create the map and set the basic boundaries
var tileURL = 'http://{s}.tiles.mapbox.com/v3/ttavenner.e7ef536d/{z}/{x}/{y}.png'
var zoom = (window.innerWidth < 500) ? 2 : (window.innerWidth < 1050) ? 3 : 4
var map = L.map('map').setView([40.5624608,-40.1166736], zoom)

L.tileLayer(tileURL, {
    attribution: 'Map data &copy DPLA',
    maxZoom: 20
}).addTo(map)


/*
* Create Data Layers
*/

// Generate an array of point objects with counts for adding markers
var points = data.rows.reduce((p, c) => {
  var newArr = []
  var pos = -1

  // Add the sent location to the point array
  if (c.hasOwnProperty('sent_point') && !(typeof c.sent_point === "undefined")) {
    pos = p.map((e) => {return e.name}).lastIndexOf(c.sentlocation)

    if (pos != -1) {
      //if (typeof p[pos].point === "undefined") { console.log(p[pos])}
      if (!isNaN(c.cleanDate)) {
        p[pos].lowerYear = Math.max(Math.min(p[pos].lowerYear, c.cleanDate.getFullYear()), data.minYear)
        p[pos].upperYear = Math.min(Math.max(p[pos].upperYear, c.cleanDate.getFullYear()), data.maxYear)
        p[pos].countWithDate++
      }
      else {
        p[pos].countNoDate++
      }
    }
    else {
      newArr.push({
        name: c.sentlocation,
        point: c.sent_point,
        lowerYear: isNaN(c.cleanDate) ? data.minYear : Math.max(c.cleanDate.getFullYear(), data.minYear),
        upperYear: isNaN(c.cleanDate) ? data.maxYear : Math.min(c.cleanDate.getFullYear(), data.maxYear),
        countWithDate: isNaN(c.cleanDate) ? 0 : 1,
        countNoDate: isNaN(c.cleanDate) ? 1 : 0
      })
    }
  }

  // Add the received location to the point array
  if (c.hasOwnProperty('receive_point') && !(typeof c.receive_point === "undefined")) {
    pos = p.map((e) => {return e.name}).lastIndexOf(c.receivedlocation)

    if (pos != -1) {
      if (!isNaN(c.cleanDate)) {
        p[pos].lowerYear = Math.max(Math.min(p[pos].lowerYear, c.cleanDate.getFullYear()), data.minYear)
        p[pos].upperYear = Math.min(Math.max(p[pos].upperYear, c.cleanDate.getFullYear()), data.maxYear)
        p[pos].countWithDate++
      }
      else {
        p[pos].countNoDate++
      }
    }
    else {
      newArr.push({
        name: c.receivedlocation,
        point: c.receive_point,
        lowerYear: isNaN(c.cleanDate) ? data.minYear : Math.max(c.cleanDate.getFullYear(), data.minYear),
        upperYear: isNaN(c.cleanDate) ? data.maxYear : Math.min(c.cleanDate.getFullYear(), data.maxYear),
        countWithDate: isNaN(c.cleanDate) ? 0 : 1,
        countNoDate: isNaN(c.cleanDate) ? 1 : 0
      })
    }
  }

  return p.concat(newArr)
}, [])


// Generate an array of line objects with counts for displaying markers
var lines = data.rows.reduce((p, c) => {
  var pos = -1

  if (c.hasOwnProperty('line_name')) {

    pos = p.map((e) => {return e.name}).lastIndexOf(c.line_name)

    if (pos != -1) {
      if (!isNaN(c.cleanDate)) {
        p[pos].lowerYear = Math.max(Math.min(p[pos].lowerYear, c.cleanDate.getFullYear()), data.minYear)
        p[pos].upperYear = Math.min(Math.max(p[pos].upperYear, c.cleanDate.getFullYear()), data.maxYear)
        p[pos].countWithDate++
      }
      else {
        p[pos].countNoDate++
      }
      return p
    }
    else {
      return p.concat({
        name: c.line_name,
        line: c.line,
        lowerYear: isNaN(c.cleanDate) ? data.minYear : Math.max(c.cleanDate.getFullYear(), data.minYear),
        upperYear: isNaN(c.cleanDate) ? data.maxYear : Math.min(c.cleanDate.getFullYear(), data.maxYear),
        countWithDate: isNaN(c.cleanDate) ? 0 : 1,
        countNoDate: isNaN(c.cleanDate) ? 1 : 0
      })
    }
  }
  else {
    return p
  }
}, [])


// Create a marker cluster group for the points
// This allows clustering points at different zoom levels
// to keep the map looking tidy
var markers = new L.MarkerClusterGroup({
  showCoverageOnHover: false,
  spiderfyDistanceMultiplier: 3,
  iconCreateFunction: (cluster) => {
    var marks = cluster.getAllChildMarkers()
    var n = marks.reduce((p,c) => {
      return p + c.count
    },0)
    var i = " marker-cluster-"
    i += 10 > n ? "small" : 100 > n ? "medium" : "large"
    return L.divIcon({
      html: '<div><span>' + n + '</span></div>',
      className: "marker-cluster" + i,
      iconSize: new L.Point(40, 40)
    })
  }
})

map.addLayer(markers)

var markerList = createPointMarkers(data.minYear, data.maxYear)
markers.addLayers(markerList)


var mapLines = createLineLayers(data.minYear, data.maxYear)
mapLines.addTo(map)


/*
* Helper Functions
*/

// Generates an array of points, filtered by lowerYear and upperYear
function createPointMarkers(lowerYear, upperYear) {
  var pointMax = Math.max.apply(Math, points.map((p) => { return p.count }))
  var pointColors = ['#410d4f','#a44abc','#16a7e6']
  var pointWeights = [8, 16, 32]
  var pointRanges = [0, Math.floor(pointMax * 0.5), pointMax]
  var pointColor = ''
  var pointWeight = pointWeights[0]

  var filteredPoints = points.filter((p) => {
    if (p.lowerYear >= lowerYear && p.upperYear <= upperYear) {
      p.count = includeNaNDates ? p.countWithDate + p.countNoDate : p.countWithDate
      return p
    }
    else if (includeNaNDates) {
      p.count = p.countNoDate
      return p
    }
  })

  var markerList = []

  var markerList = filteredPoints.map((p) => {
    for (var j = 0; j <  pointRanges.length; j++)
        if (p.count > pointRanges[j] && p.count < pointRanges[j+1]) {
            pointColor = pointColors[j]
            pointWeight = pointWeights[j]
        }

    var letter = p.count == 1 ? "letter" : "letters"
    var letterMarker = L.circleMarker(p.point).setStyle({color: pointColor, radius: pointWeight})

    letterMarker.count = p.count

    var popUp = document.createElement('p')
    popUp.innerHTML = p.name + "<br />" + p.count + " " + letter
    popUp.addEventListener('click', () => {sidebar.getLetters("place", p.name)})

    letterMarker.bindPopup(popUp)
                .on('popupclose', () => {sidebar.toggleInfo('close')})

    return letterMarker
  })

  return markerList
}


// Generates an array of lines, filtered by minYear and maxYear
function createLineLayers(minYear, maxYear) {

  var filteredLines = lines.filter((l) => {
    if (l.lowerYear >= minYear && l.upperYear <= maxYear) {
      l.count = includeNaNDates ? l.countWithDate + l.countNoDate : l.countWithDate
      return l
    }
    else if (includeNaNDates) {
      l.count = l.countNoDate
      return l
    }
  })
  // Setup line and point values used for display
  var lineMax = Math.max.apply(Math, lines.map((l) => { return l.count }))
  var lineColors = ['#410d4f','#a44abc','#16a7e6']
  var lineWeights = [1, 6, 10]
  var lineRanges = [0, Math.floor(lineMax * 0.5), lineMax]
  var lineColor = ''
  var lineWeight = lineWeights[0]

  var mapLines = L.layerGroup()

  for (var i = 0; i < filteredLines.length; i++) {
    for (var j = 0; j <  lineRanges.length; j++)
        if (filteredLines[i].count > lineRanges[j] && filteredLines[i].count < lineRanges[j+1]) {
            lineColor = lineColors[j]
            lineWeight = lineWeights[j]
        }
    var letter = filteredLines[i].count == 1 ? "letter" : "letters"
    var popUp = document.createElement('p')
    popUp.innerHTML = filteredLines[i].name + "<br />" + filteredLines[i].count + " " + letter
    popUp.onclick = () => {sidebar.getLetters("line", filteredLines[i].name)}
    mapLines.addLayer(filteredLines[i].line.setStyle({weight: lineWeight, color: lineColor})
            .bindPopup(popUp)
            .on('popupclose', () => {sidebar.toggleInfo('close')}))
  }

  return mapLines
}


/*
* Layer Filter Functions
*/

// Simple reference function to handle both points and lines
function filterMap(minYear, maxYear) {
  filterLines(minYear, maxYear)
  filterPoints(minYear, maxYear)
}


// Dynamically filters the line layer with a date range
function filterLines(minYear, maxYear) {
    map.removeLayer(mapLines)
    mapLines = createLineLayers(minYear, maxYear)
    mapLines.addTo(map)
}


// Dynamically filters the point layer with a date range
function filterPoints(minYear, maxYear) {
  markers.clearLayers()
  markers.addLayers(createPointMarkers(minYear, maxYear))
  markers.refreshClusters()
}