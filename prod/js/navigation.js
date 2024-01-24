'use strict';
// Navigation handling for all pages

// Navigation globals
let currentDiv = 'Sites - List'
document.getElementById('current-div').innerHTML = currentDiv
let currentLoc = 'Salt Lake City'
document.getElementById('current-loc').innerHTML = currentLoc
let currentSite = ''            // Set in sites.js
let mapData = ''                // Populated from Google docs in sites.js
let currentMap = ''             // Set in sites.js
let returnToPage = currentDiv   // Sets page to return to from site detail

// Reload the page when switching focus back to the page  if more than 5 minutes have passed since last reload
window.onfocus = function() {
    var checkDateTime = new Date()
    var ElapsedTime = ( checkDateTime - now ) / ( 1000  * 60 )  //convert milliseconds to minutes
    if ( ElapsedTime >= 5 ) { location.reload() }
}

// On page load, fetch stored data from from local storage (if it exists)
// Note that siteDetail(currentSite) function is called at the end of the sites.js async function to repopulate page
// based on local storage data values
if ( window.localStorage.getItem('currentMap') )    { currentMap = window.localStorage.getItem('currentMap') }
if ( window.localStorage.getItem('currentSite') )   { currentSite = window.localStorage.getItem('currentSite') }
if ( window.localStorage.getItem('returnToPage') )  { returnToPage = window.localStorage.getItem('returnToPage') }
if ( window.localStorage.getItem('currentDiv') )    { currentDiv = window.localStorage.getItem('currentDiv') } 

// Update local storage if browser stored old naming conversion used for currentDiv
if (currentDiv === 'Site List')     { currentDiv = 'Sites - List'}
if (currentDiv === 'Map View')      { currentDiv = 'Sites - Map'}

// Display current page after local storage load (or default page if there wasn't local storage)
toggleDiv(currentDiv)

// Store current navigation in local storage for use after reload
function storeNavSettings() {
    window.localStorage.setItem('currentDiv', currentDiv)
    window.localStorage.setItem('currentMap', currentMap)
    window.localStorage.setItem('currentSite', currentSite)
    window.localStorage.setItem('returnToPage', returnToPage)
}

// Store navigation when browser reload button is used
window.onbeforeunload = function() {
    storeNavSettings()
}

// Store navigation when page refresh button is used
function reload() {
    storeNavSettings()
    history.scrollRestoration = 'manual'
    location.reload()
}

// Handle page menu navigation
function toggleDiv(newDiv) {

    // Stop radar map animation if navigating from radar map
    if ( currentDiv === 'Radar Map') { 
        stop() 
    }

    // Hide prior page and show new page
    document.getElementById(currentDiv).style.display = 'none'
    currentDiv = newDiv
    document.getElementById(currentDiv).scrollTop = 0
    document.getElementById('current-div').innerHTML = currentDiv
    document.getElementById(currentDiv).style.display = 'block'

    // Hide or display site region drop down based on selected DIV
    if ( newDiv === 'Sites - Map' || newDiv === 'Sites - List' ) { document.getElementById('Site Map Select').style.display = 'block' } 
    else { document.getElementById('Site Map Select').style.display = 'none' }

    // Hide or display return-to-prior-page and site guide buttons based on selected DIV
    if ( newDiv === 'Site Details' ) {
        document.getElementById('Site Details buttons').style.display = 'block'
        document.getElementById('forecastTableContainer').scrollLeft = 0
    } else {
        document.getElementById('Site Details buttons').style.display = 'none'
        // Update the returnToPage to current page
        returnToPage = newDiv 
    }

    // Hide the help pop up (in case it was visible)
    document.getElementById(`Forecast Help Info`).style.display = 'none'

    // Store navigation settings after navigating to a new page
    storeNavSettings()

    // Call functions to populate new pages where load is deferred to reduce bandwidth requirements
    if ( newDiv === 'Soaring Forecast' )      { populateSoaringForecast() } 
    else if ( newDiv === 'Weather Forecast' ) { populateWeatherForecast() }
    else if ( newDiv === 'Weather Maps' )     { populateWeatherMaps()     }
    else if ( newDiv === 'Weather Cams' )     { populateWeatherCams()     }
    else if ( newDiv === 'Radar Map' )        { populateRadarMap()        }
}

function siteDetail(site) {
    currentSite = site
    toggleDiv('Site Details')
    siteDetailContent(site)
}

function returnFromSiteDetail() {
    // Hide the help pop up (in case it was visible)
    document.getElementById(`Forecast Help Info`).style.display = 'none'

    // Navigate back
    toggleDiv(returnToPage)
}

// Handle drop down lists
window.onclick = function(event) {
    if (!event.target.matches('.btn-menu')) {
        const menu = document.getElementById('menu')
        if (menu.classList.contains('show')) menu.classList.remove('show')
    }
    if (!event.target.matches('.btn-LocMenu')) {
        const LocMenu = document.getElementById('LocMenu')
        if (LocMenu.classList.contains('show')) LocMenu.classList.remove('show')
    }
    if (!event.target.matches('.btn-MapMenu')) {
        const MapMenu = document.getElementById('MapMenu')
        if (MapMenu.classList.contains('show')) MapMenu.classList.remove('show')
    }
}

function menu() { document.getElementById('menu').classList.toggle('show') }
function LocMenu() { document.getElementById('LocMenu').classList.toggle('show') }
function MapMenu() { document.getElementById('MapMenu').classList.toggle('show') }

// Update site map and site list as selected region is changed
function toggleMap(newMap) {
    // Hide previous map
    document.getElementById(currentMap).style.display = 'none'
    // Set new map name
    document.getElementById('current-map').innerText = document.getElementById(`${newMap}-name`).innerText
    // Display new map
    document.getElementById(newMap).style.display = 'block'
    // Update site list page
    document.getElementById(currentMap + `-site-list`).style.display = 'none'
    document.getElementById(newMap + `-site-list`).style.display = 'block'
    currentMap = newMap
    // Store navigation settings after navigating to a new map
    storeNavSettings()
}

// Handle click to display forecast help info (clicked on forecast table row headings)
function helpInfo(infoType) {
    document.getElementById(`Forecast Help Info`).style.display = 'block'

    // Find help topic in the arry
    for (let i=0; i<helpTopics.length; i++) {
        try {
            if ( helpTopics[i][1].HelpTopicID === infoType ) {
                document.getElementById(`forecast-help-topic`).innerHTML = helpTopics[i][1].HelpTitle
                document.getElementById(`forecast-help-text`).innerText = helpTopics[i][1].HelpText
            }
        } catch (error) { 
            console.log('Help processing and display error: ' + error + ' for help topic: ' + infoType)
        }
    }
}

// Handle click to close help pop up on forecast table
function closeHelpInfo() {
    document.getElementById(`Forecast Help Info`).style.display = 'none'
}