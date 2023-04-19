'use strict';
// Globals
const now = new Date()
const date = new Intl.DateTimeFormat('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'}).format(now)
const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const wwGrn = '#20c997' // Bootstrap teal
const wwYlw = '#ffc107' // Bootstrap yellow (warning)
const wwOrg = '#fd7e14' // Bootstrap orange
const wwRed = '#dc3545' // Bootstrap red (danger)

// Set initial defaults
let currentDiv = 'Site List'
document.getElementById('current-div').innerHTML = currentDiv
let currentLoc = 'Salt Lake City'
document.getElementById('current-loc').innerHTML = currentLoc
let day3ForecastURL = 'https://api.weather.gov/gridpoints/SLC/97,175/forecast'
let TFRDetails = ''
let WeatherStreetImage = 1
let currentSite = ''            // Set in sites.js
let mapData = ''                // Populated from Google docs in sites.js
let currentMap = ''             // Set in sites.js
let siteData = []               // Populated from Google docs in sites.js
let siteReadingsURL = `https://api.mesowest.net/v2/station/timeseries?` // The rest of the URL is built in sites.js
let readingsData = []           // Populated using API call in sites.js
let pressureReadingsData = []   // Populated using API call in sites.js
let returnToPage = currentDiv   // Sets page to return to from site detail
let liftParams = {}, maxTempF, soundingData = {}  // Defaults for decoded skew-T
let sunrise_hour = ''
let sunset_hour = ''

// Make CORS requests to external sites via proxy server
function doCORSRequest(options, result) {
    var cors_api_url = 'https://wasatchcloudbase.herokuapp.com/'
    var ServerRequest = new XMLHttpRequest()
    ServerRequest.open(options.method, cors_api_url + options.url)
    ServerRequest.onload = ServerRequest.onerror = function() {
        result(ServerRequest.responseText)
        // Can add to result for debugging:  options.method + ' ' + options.url + '\n' + ServerRequest.status + ' ' + ServerRequest.statusText + '\n\n' +
    }
    ServerRequest.send(options.data);
}

// GET SUNRISE AND SUNSET FOR SLC AIRPORT
(async () => {
    //  example url = 'https://api.sunrise-sunset.org/json?lat=40.7862&lng=-111.9801&date=2022-09-09'
    const ISO_format_today = now.toISOString().substring(0,10)
    const url = `https://api.sunrise-sunset.org/json?lat=40.7862&lng=-111.9801&date=` + ISO_format_today
    const response = await fetch(url)
    const DaylightData = await response.json()
    if (DaylightData) {
        // Get timezone offset (and make negative as offset shows as positive)
        const UTC_Adjustment = - now.getTimezoneOffset() / 60

        // Adjust sunrise for UTC / DST
        let sunrise_hour_digits = DaylightData.results.sunrise.search(`:`)
        sunrise_hour = +DaylightData.results.sunrise.substring(0,sunrise_hour_digits) + UTC_Adjustment
        if (sunrise_hour < 0) { sunrise_hour = (12 + sunrise_hour) } 
        let sunrise = sunrise_hour + DaylightData.results.sunrise.substring(sunrise_hour_digits, sunrise_hour_digits + 3)

        // Adjust sunset for UTC / DST
        let sunset_hour_digits = DaylightData.results.sunset.search(`:`)
        sunset_hour = +DaylightData.results.sunset.substring(0,sunset_hour_digits) + UTC_Adjustment
        if (sunset_hour < 0) { sunset_hour = (12 + sunset_hour) } 
        if (sunset_hour > 12) { sunset_hour = (sunset_hour - 12)}
        let sunset = sunset_hour + DaylightData.results.sunset.substring(sunset_hour_digits, sunset_hour_digits + 3)

        //Update page elements
        document.getElementById(`sunrise_time`).innerText = sunrise + 'am'
        document.getElementById(`sunset_time`).innerText = sunset + 'pm'
    }
})();

// Load prior navigation from local storage (if exists due to hitting reload button)
if ( window.sessionStorage.getItem('currentDiv') ) { 
    toggleDiv( window.sessionStorage.getItem('currentDiv') ) 
}
// If local storage didn't exist, display default page
else { toggleDiv(currentDiv) }

// Load prior map from local storage (if exists due to hitting reload button)
if ( window.sessionStorage.getItem('currentMap') ) { 
    currentMap = window.sessionStorage.getItem('currentMap')
    // Sites.js will display the correct map after the map Divs are created
}

// Load prior returnToPage and site if reload occurred on site detail page
if ( currentDiv === 'Site Details' ) {
    if ( window.sessionStorage.getItem('returnToPage') ) { 
        returnToPage = window.sessionStorage.getItem('returnToPage') 
    }
    if ( window.sessionStorage.getItem('currentSite') ) { 
        currentSite = window.sessionStorage.getItem('currentSite')
    }
    // Note that siteDetail(currentSite) function is called at the end of the sites.js async function to repopulate page

}

// Functions to handle page navigation
function reload() {

    // Store current navigation in local storage for use after reload
    window.sessionStorage.setItem('currentDiv', currentDiv)
    window.sessionStorage.setItem('currentMap', currentMap)
    window.sessionStorage.setItem('currentSite', currentSite)
    window.sessionStorage.setItem('returnToPage', returnToPage)
    history.scrollRestoration = 'manual'
    location.reload()
}

function toggleDiv(newDiv) {
    document.getElementById(currentDiv).style.display = 'none'
    currentDiv = newDiv
    document.getElementById(currentDiv).scrollTop = 0
    document.getElementById('current-div').innerHTML = currentDiv
    document.getElementById(currentDiv).style.display = 'block'

    // Hide or display site region drop down based on selected DIV
    if ( newDiv === 'Map View' || newDiv === 'Site List' ) {
        document.getElementById('Site Map Select').style.display = 'block'
    } 
    else { 
        document.getElementById('Site Map Select').style.display = 'none' 
    }

    // Update the returnToPage unless going to site detail
    if ( newDiv != 'Site Details' ) { returnToPage = newDiv }
}

function siteDetail(site) {
    toggleDiv('Site Details')
    siteDetailContent(site)
};

function returnFromSiteDetail() {
    toggleDiv(returnToPage)
};

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
}