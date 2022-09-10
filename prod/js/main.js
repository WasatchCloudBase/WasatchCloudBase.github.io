'use strict';
// Globals
const now = new Date()
const date = new Intl.DateTimeFormat('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'}).format(now)
const wwGrn = '#20c997' // Bootstrap teal
const wwYlw = '#ffc107' // Bootstrap yellow (warning)
const wwOrg = '#fd7e14' // Bootstrap orange
const wwRed = '#dc3545' // Bootstrap red (danger)
const surfaceAlt = 4229/1000 // KSLC elevation adjusted to d3 y-axis scale
const dalr = 5.4 // Dry Adiabatic Lapse Rate in °F/1000' (equivalent to 3°C)
const dalrSlope = -1/dalr
const clientWidth = document.documentElement.clientWidth
const visibleScreenWidth = clientWidth>1080 ? clientWidth*0.6 : clientWidth*0.89
const visibleScreenHeight = visibleScreenWidth*0.679
const margin = {
    top: visibleScreenHeight*0.05,
    right: visibleScreenWidth*0.05,
    bottom: visibleScreenHeight*0.05,
    left: visibleScreenWidth*0.05
}
const width = visibleScreenWidth-margin.left-margin.right
const height = visibleScreenHeight-margin.top-margin.bottom
const svg = d3.select('#skew-t-d3')
    .append('svg')
    .attr('class', 'svgbg')
    .attr('width', width+margin.left+margin.right)
    .attr('height', height+margin.top+margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)
const x = d3.scaleLinear().range([-10, width]).domain([-10, 110])
const y = d3.scaleLinear().range([height, 0]).domain([surfaceAlt, 18])
let raobData = {}
let currentDiv = 'Weather Stations'
document.getElementById('current-div').innerHTML = currentDiv
let currentDay = 'Today'
document.getElementById('current-day').innerHTML = currentDay

window.onclick = function(event) {
    if (!event.target.matches('.btn-menu')) {
        const menu = document.getElementById('menu')
        if (menu.classList.contains('show')) menu.classList.remove('show')
    }
    if (!event.target.matches('.btn-DayMenu')) {
        const DayMenu = document.getElementById('DayMenu')
        if (DayMenu.classList.contains('show')) DayMenu.classList.remove('show')
    }
}

function menu() { document.getElementById('menu').classList.toggle('show') }

function DayMenu() { document.getElementById('DayMenu').classList.toggle('show') }

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
            document.getElementById(`${div}-toggle`).innerHTML = '&#8212;' //Extended emdash
        } else {
            document.getElementById(`${div}-toggle`).innerHTML = '-'
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

// GET SUNRISE AND SUNSET FOR SLC AIRPORT
(async () => {
    //  example url = 'https://api.sunrise-sunset.org/json?lat=40.7862&lng=-111.9801&date=2022-09-09'
    const ISO_format_today = now.toISOString().substring(0,10)


    document.getElementById(`sunrise_time`).innerText = ISO_format_today



    const url = `https://api.sunrise-sunset.org/json?lat=40.7862&lng=-111.9801&date=` + ISO_format_today


    document.getElementById(`sunrise_time`).innerText = url


    const response = await fetch(url)
    const DaylightData = await response.json()
    if (DaylightData) {


        document.getElementById(`sunrise_time`).innerText = 'Fetched daylight data'



        // Get UTC / DST offset
        const timezone_url = `http://worldtimeapi.org/api/timezone/America/Denver`
        const timezone_response = await fetch(timezone_url)
        const TimeZoneData = await timezone_response.json()


        document.getElementById(`sunrise_time`).innerText = 'Fetched timezone offset'



        let UTC_adjustment_digits = TimeZoneData.utc_offset.search(`:`)
        let UTC_Adjustment = +TimeZoneData.utc_offset.substring(0,UTC_adjustment_digits)

        // Adjust sunrise for UTC / DST
        let sunrise_hour_digits = DaylightData.results.sunrise.search(`:`)
        let sunrise_hour = +DaylightData.results.sunrise.substring(0,sunrise_hour_digits) + UTC_Adjustment
        if (sunrise_hour < 0) { sunrise_hour = (12 + sunrise_hour) } 
        let sunrise = sunrise_hour + DaylightData.results.sunrise.substring(sunrise_hour_digits, sunrise_hour_digits + 3)

        // Adjust sunset for UTC / DST
        let sunset_hour_digits = DaylightData.results.sunset.search(`:`)
        let sunset_hour = +DaylightData.results.sunset.substring(0,sunset_hour_digits) + UTC_Adjustment
        if (sunset_hour < 0) { sunset_hour = (12 + sunset_hour) } 
        let sunset = sunset_hour + DaylightData.results.sunset.substring(sunrise_hour_digits, sunset_hour_digits + 3)

        //Update page elements
        document.getElementById(`sunrise_time`).innerText = sunrise + ' am'
        document.getElementById(`sunset_time`).innerText = sunset + ' pm'
    }
})();

// IIFE ASYNC NOAA PUBLIC API FOR 3 DAY FORECAST
(async () => {
//     const url = 'https://wasatchcloudbase.github.io/example_files/example_noaa_forecast.json'
    const url = 'https://api.weather.gov/gridpoints/SLC/97,175/forecast'
//     const response = await fetch(url, {mode: 'cors'})
    const response = await fetch(url)
    const noaaData = await response.json()
    if (noaaData) {
        let position = noaaData.properties.periods[0].isDaytime ? 0 : 1
        for (let i=1; i<4; i++) {
            document.getElementById(`forecast-day${i}-day`).innerHTML = noaaData.properties.periods[position].name
            document.getElementById(`forecast-day${i}-txt`).innerHTML = noaaData.properties.periods[position].detailedForecast
            document.getElementById(`forecast-day${i}-img`).src = noaaData.properties.periods[position].icon
            position += 2
        }
    }
})();

// IIFE ASYNC Utah Weather Alerts (hidden if none)
(async () => 
    {
    //    const url = 'https://wasatchcloudbase.github.io/example_files/noaa_alerts_utah.json'
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
    }
)();

// IIFE ASYNC Get SLC Forecast Discussion text
(async () => 
    {
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
    }
)();

// IIFE ASYNC Get morning SkewT
(async () =>
    {
        const date = now.toLocaleString('en-US', {year: 'numeric', month: '2-digit', day: '2-digit'}).split('/')
        const url = `https://climate.cod.edu/data/raob/KSLC/skewt/KSLC.skewt.${date[2]}${date[0]}${date[1]}.12.gif`
        document.getElementById('skew-t-img').src = url
        document.getElementById('skew-t-href').href = url
    }
)();

// IIFE ASYNC Get graphical forecast images
(async () =>
    {
        const url = 'https://graphical.weather.gov/images/slc/'
        const timeStr = (now.getHours()>18 || now.getHours()<7) ? 5 : 1
        const nextDay = now.getHours()>18 ? `( ${new Date(now.setHours(now.getHours()+24)).toLocaleString('en-us', {weekday: 'short'})} )` : null
        document.getElementById('sky-next-day').innerHTML = nextDay
        for (let i=0; i<4; i++) {
            document.getElementById(`graphical-sky-${i}`).src = `${url}Sky${timeStr+i}_slc.png`
            document.getElementById(`graphical-wx-${i}`).src = `${url}Wx${timeStr+i}_slc.png`
        }
    }
)();

// IIFE ASYNC Get surface forecast graphics
(async () =>
    {
        if (now.getHours()>=6 && now.getHours()<=14) {
            const offset = now.getTimezoneOffset()/60===6 ? '3 pm' : '2 pm'
            document.getElementById('graphical-wind-time').innerHTML = offset
            document.getElementById('graphical-wind-img').src = 'https://graphical.weather.gov/images/slc/WindSpd3_slc.png'
            document.getElementById('graphical-gust-img').src = 'https://graphical.weather.gov/images/slc/WindGust3_slc.png'
            document.getElementById('graphical-wind-div').style.display = 'block'        
        }
    }
)();

// IIFE ASYNC Get Soaring Forecast text
(async () => 
    {
        const url = 'https://forecast.weather.gov/product.php?site=SLC&issuedby=SLC&product=SRG&format=TXT&version=1&glossary=0'
        const response = await fetch(url)
        const SoaringForecastText = await response.text()
        if (SoaringForecastText) {
            let ContentStart = SoaringForecastText.search("SRGSLC") + 7
            let ContentEnd = SoaringForecastText.indexOf("THIS", ContentStart) - 1
            let ContentText = SoaringForecastText.substring(ContentStart, ContentEnd) 
            document.getElementById("soaring-forecast").innerText = ContentText
        }
    }
)();

// Test URL fetch
// Uncomment to show debugging block
/*
(async () => {

    document.getElementById('URLCheck').style.display = 'block'
    document.getElementById('URLMessage').innerText = 'Starting debugging block';

    const url = "https://wasatchcloudbase.github.io/example_files/tfr_faa_gov_tfr2_list_jsp.html";
    var headers = {}
    document.getElementById('URLMessage').innerText = 'Established URL and headers';

    fetch(url, {
        method : "GET",
        mode: 'cors',
        headers: headers
    })
    .then((response) => {
        if (!response.ok) {
            document.getElementById('URLMessage').innerHTML = response.status + ": " + response.type + ": " + response.statustext;
            throw new Error(response.error)
        }
        document.getElementById('URLMessage').innerHTML = 'Response received - data below';
        document.getElementById('URLResponse').innerHTML = response.json();
    })
    .then(data => {
        document.getElementById('URLMessage').innerHTML = 'Received data';
        document.getElementById('URLResponse').innerHTML = data;
    })
    .catch(function(error) {
        document.getElementById('URLResponse').innerHTML = error + ": " + error.stack;
    });
})();
*/

// IIFE ASYNC Utah TFRs (hidden if none)
/* Currenty commented out due to CORS issues accessing data
(async () => 
    {
        try { 
        //    const url = 'https://wasatchcloudbase.github.io/example_files/tfr_faa_gov_tfr2_list_jsp.html'
            const url = 'https://tfr.faa.gov/tfr2/list.jsp'
            const response = await fetch(url, {
                mode: 'cors',
                method: 'GET',
                cache: 'no-cache',
                credentials: 'same-origin',
                headers: {'Content-Type': 'text/html; charset=windows-1252',}
            } )
            const TFRText = await response.text() // May need to use response.json() instead
        } catch (err) {
            document.getElementById('TFRType').innerText = 'FETCH/PARSING FAILED: ' + err
        }
        if (TFRText) {
            let EachTFR = []
            for (let i=0; i<TFRData.features.length; i++) {
                EachTFR = TFRData.features[i].properties
                if (i==0) {
                // Populate first TFR
                    document.getElementById('UtahTFRs').style.display = 'block'
                    document.getElementById('TFRBeginDate').innerText = EachTFR.BeginDate
                    document.getElementById('TFREndDate').innerText = EachTFR.EndDate
                    document.getElementById('TFRType').innerText = EachTFR.Type
                    document.getElementById('TFRLocation').innerText = EachTFR.Location
                    document.getElementById('TFRReason').innerText = EachTFR.Reason
                } else if (i==1) {
                    // REMEMBER TO REMOVE i==1 and add logic to filter for Utah only
                    // Clone division for additional TFRs (as needed)
                    let cloned_TFR = document.getElementById('TFRDiv').cloneNode(true)
                    //Rename parent and children IDs
                    cloned_TFR.id = 'TFRDiv' + i
                    cloned_TFR.children[0].id = 'TFRBeginDate' + i
                    cloned_TFR.children[1].id = 'TFREndDate' + i
                    cloned_TFR.children[2].id = 'TFRType' + i
                    cloned_TFR.children[3].id = 'TFRLocation' + i
                    cloned_TFR.children[4].id = 'TFRReason' + i
                    //Add clone to page
                    document.getElementById('TFRGroupDiv').appendChild(cloned_TFR)
                    //Populate additional TFR
                    document.getElementById(`TFRDiv${i}`).style.display = 'block'
                    document.getElementById(`TFRBeginDate${i}`).innerText = EachTFR.BeginDate
                    document.getElementById(`TFREndDate${i}`).innerText = EachTFR.EndDate
                    document.getElementById(`TFRType${i}`).innerText = EachTFR.Type
                    document.getElementById(`TFRLocation${i}`).innerText = EachTFR.Location
                    document.getElementById(`TFRReason${i}`).innerText = EachTFR.Reason
                }
            }
        }
    }
)();
*/