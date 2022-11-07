'use strict';
// Globals
const now = new Date()
const date = new Intl.DateTimeFormat('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'}).format(now)
const wwGrn = '#20c997' // Bootstrap teal
const wwYlw = '#ffc107' // Bootstrap yellow (warning)
const wwOrg = '#fd7e14' // Bootstrap orange
const wwRed = '#dc3545' // Bootstrap red (danger)

// Set default initial page
let currentDiv = 'Weather Stations'
document.getElementById('current-div').innerHTML = currentDiv
let currentDay = 'Today'
document.getElementById('current-day').innerHTML = currentDay
let currentLoc = 'Salt Lake City'
document.getElementById('current-loc').innerHTML = currentLoc
let day3ForecastURL = 'https://api.weather.gov/gridpoints/SLC/97,175/forecast'
let TFRDetails = ''
let WeatherStreetImage = 1

// Set defaults for decoded skew-T
let liftParams = {}, maxTempF, soundingData = {}

window.onclick = function(event) {
    if (!event.target.matches('.btn-menu')) {
        const menu = document.getElementById('menu')
        if (menu.classList.contains('show')) menu.classList.remove('show')
    }
    if (!event.target.matches('.btn-DayMenu')) {
        const DayMenu = document.getElementById('DayMenu')
        if (DayMenu.classList.contains('show')) DayMenu.classList.remove('show')
    }
    if (!event.target.matches('.btn-LocMenu')) {
        const LocMenu = document.getElementById('LocMenu')
        if (LocMenu.classList.contains('show')) LocMenu.classList.remove('show')
    }
}

function menu() { document.getElementById('menu').classList.toggle('show') }

function DayMenu() { document.getElementById('DayMenu').classList.toggle('show') }

function LocMenu() { document.getElementById('LocMenu').classList.toggle('show') }

function reload() {
    history.scrollRestoration = 'manual'
    location.reload()
}

function toggleDiv(newDiv) {
    document.getElementById(currentDiv).style.display = 'none'
    currentDiv = newDiv
    document.getElementById(currentDiv).scrollTop = 0
    document.getElementById('current-div').innerHTML = currentDiv
    document.getElementById(currentDiv).style.display = 'block'
}

function toggleDay(newDay) {
    var currentDay = newDay
    document.getElementById('current-day').innerHTML = currentDay
    
    // Determine windgram directory based on day selected
    var windgram_url_dir = 'https://flymarshall.com/ut-4k/OUT'
    if (currentDay === 'Today + 1') {windgram_url_dir = windgram_url_dir + '+1'}
    if (currentDay === 'Today + 2') {windgram_url_dir = windgram_url_dir + '+2'}
    windgram_url_dir = windgram_url_dir + '/FCST/windgrams/'
    // Change windgram images
    var windgram_url = windgram_url_dir + 'Crawford_windgram.png'
    document.getElementById('Crawford_windgram_href').href = windgram_url
    document.getElementById('Crawford_windgram_src').src = windgram_url
    windgram_url = windgram_url_dir + 'FrancisPeak_windgram.png'
    document.getElementById('FrancisPeak_windgram_href').href = windgram_url
    document.getElementById('FrancisPeak_windgram_src').src = windgram_url
    windgram_url = windgram_url_dir + 'TheV_windgram.png'
    document.getElementById('TheV_windgram_href').href = windgram_url
    document.getElementById('TheV_windgram_src').src = windgram_url
    windgram_url = windgram_url_dir + 'Grandeur_windgram.png'
    document.getElementById('Grandeur_windgram_href').href = windgram_url
    document.getElementById('Grandeur_windgram_src').src = windgram_url
    windgram_url = windgram_url_dir + 'Cherry_windgram.png'
    document.getElementById('Cherry_windgram_href').href = windgram_url
    document.getElementById('Cherry_windgram_src').src = windgram_url
    windgram_url = windgram_url_dir + 'PointoftheMountainSS_windgram.png'
    document.getElementById('PointoftheMountainSS_windgram_href').href = windgram_url
    document.getElementById('PointoftheMountainSS_windgram_src').src = windgram_url
    windgram_url = windgram_url_dir + 'Inspo_windgram.png'
    document.getElementById('Inspo_windgram_href').href = windgram_url
    document.getElementById('Inspo_windgram_src').src = windgram_url
    windgram_url = windgram_url_dir + 'Cove_windgram.png'
    document.getElementById('Cove_windgram_href').href = windgram_url
    document.getElementById('Cove_windgram_src').src = windgram_url
    windgram_url = windgram_url_dir + 'MonroePeak_windgram.png'
    document.getElementById('MonroePeak_windgram_href').href = windgram_url
    document.getElementById('MonroePeak_windgram_src').src = windgram_url
}

function toggleWindChart(div) {
    const element = document.getElementById(div)
    if (element.style.display==='' || element.style.display==='none') {
        element.style.display = 'block'
        if (div.includes('Forecast')) {
            document.getElementById(`${div}-toggle`).innerHTML = '&#8212;' //Extended dash
        } else {
            document.getElementById(`${div}-toggle`).innerHTML = '&#8211;' //Medium dash
        }
    }
    else {
        element.style.display = 'none'
        if (div.includes('Forecast')) {
            document.getElementById(`${div}-toggle`).innerHTML = 'fcst'
        } else {
            document.getElementById(`${div}-toggle`).innerHTML = '+'
        }
    }
}

// Set wind speed font and bar colors
function getWindColor(stid, windSpeed) {
    // Set color threasholds based on site type
    if (stid === 'Aloft') {
        var ylwLim = 12  // Using mountain site speeds for winds aloft readings
        var orgLim = 20
        var redLim = 26
    } else if (MountainSites.includes(stid)) {
        var ylwLim = 12
        var orgLim = 20
        var redLim = 26
    } else if (SoaringSites.includes(stid)) {
        var ylwLim = 19
        var orgLim = 26
        var redLim = 32
    } else {
        var ylwLim = 15
        var orgLim = 23
        var redLim = 30
    }

    // Return color based on wind speed
    if (windSpeed < ylwLim) {return wwGrn}
    else if (windSpeed < orgLim) {return wwYlw}
    else if (windSpeed < redLim) {return wwOrg}
    else if (windSpeed >= redLim) {return wwRed}
    else /* Handle calm winds */ {return wwGrn}
}

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
        let sunrise_hour = +DaylightData.results.sunrise.substring(0,sunrise_hour_digits) + UTC_Adjustment
        if (sunrise_hour < 0) { sunrise_hour = (12 + sunrise_hour) } 
        let sunrise = sunrise_hour + DaylightData.results.sunrise.substring(sunrise_hour_digits, sunrise_hour_digits + 3)

        // Adjust sunset for UTC / DST
        let sunset_hour_digits = DaylightData.results.sunset.search(`:`)
        let sunset_hour = +DaylightData.results.sunset.substring(0,sunset_hour_digits) + UTC_Adjustment
        if (sunset_hour < 0) { sunset_hour = (12 + sunset_hour) } 
        if (sunset_hour > 12) { sunset_hour = (sunset_hour - 12)}
        let sunset = sunset_hour + DaylightData.results.sunset.substring(sunset_hour_digits, sunset_hour_digits + 3)

        //Update page elements
        document.getElementById(`sunrise_time`).innerText = sunrise + 'am'
        document.getElementById(`sunset_time`).innerText = sunset + 'pm'
    }
})();

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
        let position = noaaData.properties.periods[0].isDaytime ? 0 : 1
        for (let i=1; i<4; i++) {
            document.getElementById(`forecast-day${i}-day`).innerHTML = noaaData.properties.periods[position].name
            document.getElementById(`forecast-day${i}-txt`).innerHTML = noaaData.properties.periods[position].detailedForecast
            document.getElementById(`forecast-day${i}-img`).src = noaaData.properties.periods[position].icon
            position += 2
        }
    }
}
// Make call for initial 3 day forecast on load
(async () => {
    get3DayForecast()
})();
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

// IIFE ASYNC Utah Weather Alerts (hidden if none)
(async () => {
    // const url = 'https://wasatchcloudbase.github.io/example_files/noaa_alerts_utah.json'
    const url = 'https://api.weather.gov/alerts/active?area=UT'
    const response = await fetch(url)
    const AlertData = await response.json()
    let EachAlert = []
    for (let i=0; i<AlertData.features.length; i++) {
        EachAlert = AlertData.features[i].properties
        if (i==0) {
            // Populate first alert
            document.getElementById('UtahWeatherAlerts').style.display = 'block'
            document.getElementById('AlertEvent').innerText = EachAlert.event
            document.getElementById('AlertHeadline').innerText = EachAlert.headline
            document.getElementById('AlertAreaDesc').innerText = EachAlert.areaDesc
        } 
        else {
            // Clone division for additional alerts (as needed)
            let cloned_alert = document.getElementById('AlertDiv').cloneNode(true)
            //Rename parent and children IDs
            cloned_alert.id = 'AlertDiv' + i
            cloned_alert.children[0].id = 'AlertEvent' + i
            cloned_alert.children[1].id = 'AlertHeadline' + i
            cloned_alert.children[2].id = 'AlertAreaDesc' + i
            //Add clone to page
            document.getElementById('AlertGroupDiv').appendChild(cloned_alert)
            //Populate additional alert
            document.getElementById(`AlertDiv${i}`).style.display = 'block'
            document.getElementById(`AlertEvent${i}`).innerText = EachAlert.event
            document.getElementById(`AlertHeadline${i}`).innerText = EachAlert.headline
            document.getElementById(`AlertAreaDesc${i}`).innerText = EachAlert.areaDesc
        }
    }
})();

// IIFE ASYNC Get SLC Forecast Discussion text
(async () => {
    const url = 'https://forecast.weather.gov/product.php?site=NWS&issuedby=SLC&product=AFD&format=txt&version=1&glossary=0'
    const response = await fetch(url)
    const ForecastDiscussionText = await response.text()
    if (ForecastDiscussionText) {
        let CleanText = ForecastDiscussionText.replace(/[\n\r]/g, " ")
        let date_position_start = CleanText.search("National Weather Service Salt Lake City UT")+43
        let date_position_end = CleanText.indexOf(".", date_position_start)-1
        let synopsis_position_start = CleanText.search(".SYNOPSIS.")+12
        // Look for start of DISCUSSION section if SHORT TERM section is missing 
        let synopsis_position_end = CleanText.indexOf(".SHORT TERM", synopsis_position_start)-4 
        if (synopsis_position_end < 0) {
            synopsis_position_end = CleanText.indexOf(".DISCUSSION", synopsis_position_start)-4 
        }
        let aviation_position_start = CleanText.search(".AVIATION")+19
        let aviation_position_end = CleanText.search("REST OF UTAH AND SOUTHWEST WYOMING.")-1
        document.getElementById("forecast-discussion-date").innerText = CleanText.substring(date_position_start, date_position_end)
        document.getElementById("forecast-discussion-synopsis").innerText = CleanText.substring(synopsis_position_start, synopsis_position_end)
        document.getElementById("forecast-discussion-aviation").innerText = CleanText.substring(aviation_position_start, aviation_position_end)
    }
})();

// IIFE ASYNC Get morning SkewT
(async () => {
    const date = now.toLocaleString('en-US', {year: 'numeric', month: '2-digit', day: '2-digit'}).split('/')
    const url = `https://climate.cod.edu/data/raob/KSLC/skewt/KSLC.skewt.${date[2]}${date[0]}${date[1]}.12.gif`
    document.getElementById('skew-t-img').src = url
    document.getElementById('skew-t-href').href = url  
})();

// IIFE ASYNC Get graphical forecast images
(async () => {
    const url = 'https://graphical.weather.gov/images/slc/'
    const timeStr = (now.getHours()>18 || now.getHours()<7) ? 5 : 1
    const nextDay = now.getHours()>18 ? `( ${new Date(now.setHours(now.getHours()+24)).toLocaleString('en-us', {weekday: 'short'})} )` : null
    document.getElementById('sky-next-day').innerHTML = nextDay
    for (let i=0; i<4; i++) {
        document.getElementById(`graphical-sky-${i}`).src = `${url}Sky${timeStr+i}_slc.png`
        document.getElementById(`graphical-wx-${i}`).src = `${url}Wx${timeStr+i}_slc.png`
    }
})();

// IIFE ASYNC Get surface forecast graphics
(async () => {
    if (now.getHours()>=6 && now.getHours()<=14) {
        const offset = now.getTimezoneOffset()/60===6 ? '3 pm' : '2 pm'
        document.getElementById('graphical-wind-time').innerHTML = offset
        document.getElementById('graphical-wind-img').src = 'https://graphical.weather.gov/images/slc/WindSpd3_slc.png'
        document.getElementById('graphical-gust-img').src = 'https://graphical.weather.gov/images/slc/WindGust3_slc.png'
        document.getElementById('graphical-wind-div').style.display = 'block'        
    }
})();

// IIFE ASYNC Get Soaring Forecast text
(async () => {
    const url = 'https://forecast.weather.gov/product.php?site=SLC&issuedby=SLC&product=SRG&format=TXT&version=1&glossary=0'
    const response = await fetch(url)
    const SoaringForecastText = await response.text()
    if (SoaringForecastText) {
        let ContentStart = SoaringForecastText.search("DATE..")
        let ContentEnd = SoaringForecastText.indexOf("THIS", ContentStart) - 2
        let ContentText = SoaringForecastText.substring(ContentStart, ContentEnd) 
        document.getElementById("soaring-forecast").innerText = ContentText
    }
})();

// IIFE ASYNC Get TFRs for Utah
(async () => {
    const url = 'cloudbase_tfr_api_call'
    const xmlparser = new DOMParser()
    doCORSRequest({method: 'GET', url: url, data: ""}, function processResponse(result) {
        var TFRData = JSON.parse(result)
        var TFRCount = 0
        if (TFRData) {
            let EachTFR = []
            for (let i=0; i<TFRData.length; i++) {
                EachTFR = TFRData[i]
                if (EachTFR.state === 'UT') {
                    if (TFRCount==0) {
                        // Populate first TFR
                        document.getElementById('UtahTFRs').style.display = 'block'
                        document.getElementById('TFRNotam').innerText = EachTFR.notam
                        document.getElementById('TFRNotam').href = EachTFR.links.details
                        document.getElementById('TFRDate').innerText = EachTFR.date
                        document.getElementById('TFRType').innerText = EachTFR.type
                        // Get TFR detailed description
                        doCORSRequest({method: 'GET', url: EachTFR.links.xml, data: ""}, function processResponse(result) {
                            let xmlDoc = xmlparser.parseFromString(result, 'text/xml')
                            // Add line return formatting
                            document.getElementById('TFRDescription').innerText = xmlDoc.getElementsByTagName('txtDescrUSNS')[0].childNodes[0].nodeValue.replaceAll(`..`, `\r`)
                        })
                    } else {
                        // Clone division for additional TFRs (as needed)
                        let cloned_TFR = document.getElementById('TFRDiv').cloneNode(true)
                        //Rename parent and children IDs
                        cloned_TFR.id = 'TFRDiv' + TFRCount
                        cloned_TFR.children[0].id = 'TFRNotam' + TFRCount
                        cloned_TFR.children[1].id = 'TFRDate' + TFRCount
                        cloned_TFR.children[2].id = 'TFRType' + TFRCount
                        cloned_TFR.children[3].id = 'TFRAirDescription' + TFRCount
                        //Add clone to page
                        document.getElementById('TFRGroupDiv').appendChild(cloned_TFR)
                        //Populate additional TFRs
                        document.getElementById(`TFRDiv${TFRCount}`).style.display = 'block'
                        document.getElementById(`TFRNotam${TFRCount}`).innerText = EachTFR.notam
                        document.getElementById(`TFRDate${TFRCount}`).innerText = EachTFR.date
                        document.getElementById(`TFRType${TFRCount}`).innerText = EachTFR.type
                        // Get TFR detailed description
                        doCORSRequest({method: 'GET', url: EachTFR.links.xml, data: ""}, function processResponse(result) {
                            let xmlDoc = xmlparser.parseFromString(result, 'text/xml')
                            document.getElementById(`TFRDescription${TFRCount}`).innerText = xmlDoc.getElementsByTagName('txtDescrUSNS')[0].childNodes[0].nodeValue
                        })   
                    }
                    TFRCount = TFRCount + 1
                }
            }
        
        }    
    })
})();