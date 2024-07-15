'use strict';
// Metadata for all pages

// Globals
const now = new Date()
const date = new Intl.DateTimeFormat('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'}).format(now)
const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const wwGrn = '#20c997'     // Bootstrap teal
const wwYlw = '#ffc107'     // Bootstrap yellow (warning)
const wwOrg = '#fd7e14'     // Bootstrap orange
const wwRed = '#dc3545'     // Bootstrap red (danger)
const wwBlue = '#0d6efd'    // Bootstrap blue (primary)
const wwCyan = '#0dcaf0'    // Bootstrap cyan (info)

// Set initial defaults
var fiveDayForecastURL = 'https://api.weather.gov/gridpoints/SLC/99,162/forecast'
var TFRDetails = ''
var WeatherStreetImage = 1
var GraphForecastURL = 'https://graphical.weather.gov/images/slc/'
var graphicImageMinimum = 2             // 9am default image; uppdated in soaring.js
var graphicSurfaceWindImage = 2         // 9am default image; uppdated in soaring.js
var graphicSurfaceGustImage = 2         // 9am default image; uppdated in soaring.js
var graphicCloudCoverImage = 2          // 9am default image; uppdated in soaring.js
var graphicPrecipitationImage = 2       // 9am default image; uppdated in soaring.js
var siteData = []                       // Populated from Google docs in sites.js
var siteReadingsURL             = `https://api.mesowest.net/v2/station/latest?`      // The rest of the URL is built in sites.js
var siteHistoryReadingsURLStart = `https://api.mesowest.net/v2/station/timeseries?`  // The rest of the URL is built in sites.js
var CUASASites = []                 // Populated in sites.js
var readingsData = []               // Populated using API call in sites.js
var pressureReadingsData = []       // Populated using API call in sites.js
var liftParams = {}, maxTempF, soundingData = {}  // Defaults for decoded skew-T
var sunrise_hour = ''
var sunset_hour = ''
var weatherCodes = ''
var helpTopics = ''

// Forecast thermal lift parameters (the default values below are overridden with values from Google sheet)
// These allow changes for glider sink rate, surface disorganization, etc., to better match other models (e.g., XCSkies)
var thermalLapseRate          = 9.8     // Standard thermal lapse rate (DALR) is 9.8 degrees C/1k m; higher lapse rate results in lower top of lift and lower thermal speed at higher altitudes
var thermalVelocityConstant   = 5.6     // Theoretical standard is 5.6; lower constant results in lower thermal speeds at all altitutdes
var thermalTriggerTempDiff    = 3       // Difference in air (2m) and ground temp to trigger thermals; higher number results in weaker starting conditions for thermals
var thermalRampDistance       = 500     // Height (in m) from the surface below which thermals are weaker because they are not yet organized
var thermalRampStartPct       = 50      // Initial reduction (in %) of forecasted thermal strength near the surface due to disorganized thermals
var cloudbaseLapseRatesDiff   = 125     // Difference in DALR and dew point lapse rates (in m / degrees C) used to calculate cloudbase
var thermalGliderSinkRate     = 1.5     // Glider sink rate to reduce thermal velocity and top of lift
                                        // NOTE:  thermalGliderSinkRate is not currently utilized
;

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

// Get lift parameter constants for forecast
(async () => {
    // Retrieve lift parameters from Google sheets API
    // Maintain lift parameters here:  https://docs.google.com/spreadsheets/d/1nBEJuTCWkUidSFKQjBjcJgKeteC_oy8LqL2P7uhGyLQ/edit#gid=2126129603
    var lift_parameters_url = "https://sheets.googleapis.com/v4/spreadsheets/1nBEJuTCWkUidSFKQjBjcJgKeteC_oy8LqL2P7uhGyLQ/values/LiftParameters/?alt=json" +
        "&key=AIzaSyDSro1lDdAQsNEZq06IxwjOlQQP1tip-fs"
    var response = await fetch(lift_parameters_url)
    var LiftParametersRawJSON = await response.json()
    if (LiftParametersRawJSON) {
        // Convert first row (headers) to JSON keys
        var liftParameters = setJSONKeys(LiftParametersRawJSON.values)

        // Update values for lift parameters
        thermalLapseRate        = Number(liftParameters[0].Value)
        thermalVelocityConstant = Number(liftParameters[1].Value)
        thermalTriggerTempDiff  = Number(liftParameters[2].Value)
        thermalRampDistance     = Number(liftParameters[3].Value)
        thermalRampStartPct     = Number(liftParameters[4].Value)
        cloudbaseLapseRatesDiff = Number(liftParameters[5].Value)
        thermalGliderSinkRate   = Number(liftParameters[6].Value)
    }
})();

// Build array of weather codes and images for forecast
(async () => {
    // Retrieve weathercode table and image names in JSON format from Google sheets API
    // Maintain weather code data here:  https://docs.google.com/spreadsheets/d/1nBEJuTCWkUidSFKQjBjcJgKeteC_oy8LqL2P7uhGyLQ/edit#gid=626521820
    var weatherCode_data_url = "https://sheets.googleapis.com/v4/spreadsheets/1nBEJuTCWkUidSFKQjBjcJgKeteC_oy8LqL2P7uhGyLQ/values/WeatherCodes/?alt=json" +
        "&key=AIzaSyDSro1lDdAQsNEZq06IxwjOlQQP1tip-fs"
    var response = await fetch(weatherCode_data_url)
    var weatherCodeRawJSON = await response.json()
    if (weatherCodeRawJSON) {
        // Convert first row (headers) to JSON keys
        var weatherCodeData = setJSONKeys(weatherCodeRawJSON.values)

        // Build array of weather codes and images
        weatherCodes = Object.entries(weatherCodeData)
    }
})();

// Load forecast help info
(async () => {
    // Retrieve forecast help data in JSON format from Google sheets API
    // Maintain forecast help data here:  https://docs.google.com/spreadsheets/d/1nBEJuTCWkUidSFKQjBjcJgKeteC_oy8LqL2P7uhGyLQ/edit#gid=2058004785
    var help_data_url = "https://sheets.googleapis.com/v4/spreadsheets/1nBEJuTCWkUidSFKQjBjcJgKeteC_oy8LqL2P7uhGyLQ/values/HelpInfo/?alt=json" +
        "&key=AIzaSyDSro1lDdAQsNEZq06IxwjOlQQP1tip-fs"
    var response = await fetch(help_data_url)
    var helpRawJSON = await response.json()
    if (helpRawJSON) {

        // Convert first row (headers) to JSON keys
        var helpData = setJSONKeys(helpRawJSON.values)

        // Build and populate each link div
        for (let i=0; i<helpData.length; i++) {
            try {
                // Build array of help topic titles and text
                helpTopics = Object.entries(helpData)
            } catch (error) { 
                console.log('Help build error: ' + error + ' for help topic: ' + helpData[i].helpTopicID)
            }
        }
    }
})();

// Process CORS requests to external sites via proxy server
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

// Convert first row of fetched data to JSON keys
function setJSONKeys (arr) {
    const keys = Object.keys(arr[0]).map(i => arr[0][i])
    let result = arr.map(obj => {
        var replacedObj = {}
        const oriKeys = Object.keys(obj)
        for (let i = 0; i < keys.length; i++) {
            replacedObj[keys[i]] = obj[oriKeys[i]]
        }
        return replacedObj
    })
    // Remove row 0 (headers)
    let removedHeaders = result.shift()
    return result
}