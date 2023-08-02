'use strict';
// Weather Forecast page

// Populate Weather Forecast data when navigating to Weather Forecast page
async function populateWeatherForecast() {

    // Show 'loading' image
    document.getElementById('Loading Image').style.display = 'block' 

    // Make call for initial 3 day forecast on load
    get3DayForecast()

    // Get any Utah Weather Alerts (hidden if none)
    // const url = 'https://wasatchcloudbase.github.io/example_files/noaa_alerts_utah.json'
    const AlertsURL = 'https://api.weather.gov/alerts/active?area=UT'
    const AlertsResponse = await fetch(AlertsURL)
    const AlertData = await AlertsResponse.json()
    let EachAlert = []
    for (let i=0; i<AlertData.features.length; i++) {
        EachAlert = AlertData.features[i].properties
        if (i==0) {
            // Populate first alert
            document.getElementById('UtahWeatherAlerts').style.display = 'block'
            document.getElementById('AlertEvent').innerText = EachAlert.event
            document.getElementById('AlertHeadline').innerText = EachAlert.headline
            document.getElementById('AlertAreaDesc').innerText = EachAlert.areaDesc
            // Clear notice that there no active weather alerts
            document.getElementById('WeatherAlertNotice').innerText = ''
        } 
        else {
            // Clone division for additional alerts (as needed)
            let cloned_alert = document.getElementById('AlertDiv').cloneNode(true)
            // Rename parent and children IDs
            cloned_alert.id = 'AlertDiv' + i
            cloned_alert.children[0].id = 'AlertEvent' + i
            cloned_alert.children[1].id = 'AlertHeadline' + i
            cloned_alert.children[2].id = 'AlertAreaDesc' + i
            // Add clone to page
            document.getElementById('AlertGroupDiv').appendChild(cloned_alert)
            // Populate additional alert(s)
            document.getElementById(`AlertDiv${i}`).style.display = 'block'
            document.getElementById(`AlertEvent${i}`).innerText = EachAlert.event
            document.getElementById(`AlertHeadline${i}`).innerText = EachAlert.headline
            document.getElementById(`AlertAreaDesc${i}`).innerText = EachAlert.areaDesc
        }
    }

    // Get SLC Forecast Discussion text
    const DiscussionURL = 'https://forecast.weather.gov/product.php?site=NWS&issuedby=SLC&product=AFD&format=txt&version=1&glossary=0'
    const DiscussionResponse = await fetch(DiscussionURL)
    const ForecastDiscussionText = await DiscussionResponse.text()
    if (ForecastDiscussionText) {
        let CleanText = ForecastDiscussionText.replace(/[\n\r]/g, " ")
        let date_position_start = CleanText.toUpperCase().search("NATIONAL WEATHER SERVICE SALT LAKE CITY UT")+43
        let date_position_end = CleanText.indexOf(".", date_position_start)-1
        let synopsis_position_start = CleanText.toUpperCase().search(".SYNOPSIS")+12
        let synopsis_position_end = CleanText.indexOf("&&", synopsis_position_start)-2 
        let aviation_position_start = CleanText.toUpperCase().search(".AVIATION")+19  // Skip ..KSLC..
        let aviation_position_end = CleanText.indexOf("&&", aviation_position_start)-2
        let aviation_rest_of_utah_start = CleanText.toUpperCase().indexOf(".REST OF UTAH AND SOUTHWEST WYOMING.", aviation_position_start) + 38
        document.getElementById("forecast-discussion-date").innerText = CleanText.substring(date_position_start, date_position_end)
        document.getElementById("forecast-discussion-synopsis").innerText = CleanText.substring(synopsis_position_start, synopsis_position_end)
        // Separate rest of Utah aviation discussion from SLC (if present)
        if ( aviation_rest_of_utah_start > aviation_position_start ) {
            document.getElementById("forecast-discussion-aviation-utah").innerText = CleanText.substring(aviation_rest_of_utah_start, aviation_position_end)
            aviation_position_end = aviation_rest_of_utah_start - 38
        }
        else { document.getElementById("forecast-discussion-aviation-utah-block").style.display = 'none' }
        document.getElementById("forecast-discussion-aviation").innerText = CleanText.substring(aviation_position_start, aviation_position_end)
    }

    // Get Utah graphical forecast images for cloud cover and precipitation
    const GraphForecastURL = 'https://graphical.weather.gov/images/slc/'
    const forecastDate = new Date()
    const timeStr = (forecastDate.getHours()>18 || forecastDate.getHours()<7) ? 5 : 1
    const nextDay = forecastDate.getHours()>18 ? `( ${new Date(forecastDate.setHours(forecastDate.getHours()+24)).toLocaleString('en-us', {weekday: 'short'})} )` : null
    document.getElementById('sky-next-day').innerHTML = nextDay
    for (let i=0; i<4; i++) {
        document.getElementById(`graphical-sky-${i}`).src = `${GraphForecastURL}Sky${timeStr+i}_slc.png`
        document.getElementById(`graphical-wx-${i}`).src = `${GraphForecastURL}Wx${timeStr+i}_slc.png`
    }

    // Hide 'loading' image
    document.getElementById('Loading Image').style.display = 'none' 
}

// 3 DAY FORECAST
// Get 3 day forecast based on selection location
//const url = 'https://wasatchcloudbase.github.io/example_files/example_noaa_forecast.json'
async function get3DayForecast() {
    // Clear prior results while loading
    // (a lag sometimes occurs the first time forecasts are queried)
    for (let i=1; i<4; i++) {
        document.getElementById(`forecast-day${i}-day`).innerHTML = 'Loading forecast...'
        document.getElementById(`forecast-day${i}-txt`).innerHTML = ''
        document.getElementById(`forecast-day${i}-img`).src = ''
    }
    var response = await fetch(day3ForecastURL)
    var noaaData = await response.json()
    if (noaaData) {
        try {
            let position = noaaData.properties.periods[0].isDaytime ? 0 : 1
            for (let i=1; i<4; i++) {
                document.getElementById(`forecast-day${i}-day`).innerHTML = noaaData.properties.periods[position].name
                document.getElementById(`forecast-day${i}-txt`).innerHTML = noaaData.properties.periods[position].detailedForecast
                document.getElementById(`forecast-day${i}-img`).src = noaaData.properties.periods[position].icon
                position += 2
            }
        } catch (error) { 
            console.log('3 day forecast error' + error) 
        }
    }
}

// Toggle changes to 3 day forecast location
function toggleLoc(newLoc) {
    var currentLoc = newLoc
    document.getElementById('current-loc').innerHTML = currentLoc
    // Determine forecast based on location selected
    // Can get different location grid points from:  https://api.weather.gov/points/{lat},{lon}
    if (currentLoc === 'Salt Lake City') {
        day3ForecastURL = 'https://api.weather.gov/gridpoints/SLC/97,175/forecast'
    } else if (currentLoc === 'The V') {
        day3ForecastURL = 'https://api.weather.gov/gridpoints/SLC/102,181/forecast'
    } else if (currentLoc === 'Inspo') {
        day3ForecastURL = 'https://api.weather.gov/gridpoints/SLC/106,153/forecast'
    } else if (currentLoc === 'Monroe Peak') {
        day3ForecastURL = 'https://api.weather.gov/gridpoints/SLC/80,75/forecast'
    }
    get3DayForecast()
}

// Update WeatherStreet forecast image based on forward/back buttons
function WeatherStreetNext() {
    if (WeatherStreetImage < 20) { WeatherStreetImage = WeatherStreetImage + 1 }
    var WeatherStreetURL = 'https://weatherstreet.com/gfs_files/gfs_mslp_pcpn_frzn_clouds_us_' + WeatherStreetImage + '.png'
    document.getElementById('WeatherStreetImg').src = WeatherStreetURL
}
function WeatherStreetBack() {
    if (WeatherStreetImage > 1) { WeatherStreetImage = WeatherStreetImage - 1 }
    var WeatherStreetURL = 'https://weatherstreet.com/gfs_files/gfs_mslp_pcpn_frzn_clouds_us_' + WeatherStreetImage + '.png'
    document.getElementById('WeatherStreetImg').src = WeatherStreetURL
}