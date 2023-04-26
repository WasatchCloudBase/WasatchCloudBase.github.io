'use strict';

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

// Get any Utah Weather Alerts (hidden if none)
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
})();

// Get SLC Forecast Discussion text
(async () => {
    const url = 'https://forecast.weather.gov/product.php?site=NWS&issuedby=SLC&product=AFD&format=txt&version=1&glossary=0'
    const response = await fetch(url)
    const ForecastDiscussionText = await response.text()
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
})();

// Get morning SkewT
(async () => {
    const date = now.toLocaleString('en-US', {year: 'numeric', month: '2-digit', day: '2-digit'}).split('/')
    const url = `https://climate.cod.edu/data/raob/KSLC/skewt/KSLC.skewt.${date[2]}${date[0]}${date[1]}.12.gif`
    document.getElementById('skew-t-img').src = url
    document.getElementById('skew-t-href').href = url  
})();

// Get graphical forecast images
(async () => {
    const url = 'https://graphical.weather.gov/images/slc/'
    const forecastDate = new Date()
    const timeStr = (forecastDate.getHours()>18 || forecastDate.getHours()<7) ? 5 : 1
    const nextDay = forecastDate.getHours()>18 ? `( ${new Date(forecastDate.setHours(forecastDate.getHours()+24)).toLocaleString('en-us', {weekday: 'short'})} )` : null
    document.getElementById('sky-next-day').innerHTML = nextDay
    for (let i=0; i<4; i++) {
        document.getElementById(`graphical-sky-${i}`).src = `${url}Sky${timeStr+i}_slc.png`
        document.getElementById(`graphical-wx-${i}`).src = `${url}Wx${timeStr+i}_slc.png`
    }
})();

// Get surface forecast graphics
(async () => {
    if (now.getHours()>=6 && now.getHours()<=14) {
        const offset = now.getTimezoneOffset()/60===6 ? '3 pm' : '2 pm'
        document.getElementById('graphical-wind-time').innerHTML = offset
        document.getElementById('graphical-wind-img').src = 'https://graphical.weather.gov/images/slc/WindSpd3_slc.png'
        document.getElementById('graphical-gust-img').src = 'https://graphical.weather.gov/images/slc/WindGust3_slc.png'
        document.getElementById('graphical-wind-div').style.display = 'block'        
    }
})();

// Get Soaring Forecast text
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

// Get any TFRs for Utah (hidden if none)
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
                        // Clear notice that there no active TFRs
                        document.getElementById('TFRNotice').innerText = ''
                    } else {
                        // Clone division for additional TFR
                        let cloned_TFR = document.getElementById('TFRDiv').cloneNode(true)
                        // Get NOTAM # to identify new DIV clone
                        var NOTAM = EachTFR.notam.replace(/\D/g, "")
                        // Rename parent and children IDs
                        cloned_TFR.id = 'TFRDiv' + NOTAM
                        cloned_TFR.children[0].id = 'TFRNotam' + NOTAM
                        cloned_TFR.children[1].id = 'TFRDate' + NOTAM
                        cloned_TFR.children[2].id = 'TFRType' + NOTAM
                        cloned_TFR.children[3].id = 'TFRDescription' + NOTAM
                        cloned_TFR.children[4].id = 'DashSeparator' + NOTAM
                        // Add clone to page
                        document.getElementById('TFRGroupDiv').appendChild(cloned_TFR)
                        // Populate additional TFR data
                        document.getElementById(`TFRNotam${NOTAM}`).innerText = EachTFR.notam
                        document.getElementById(`TFRDate${NOTAM}`).innerText = EachTFR.date
                        document.getElementById(`TFRType${NOTAM}`).innerText = EachTFR.type
                        // Get TFR detailed description, create new DIV, and display results
                        doCORSRequest({method: 'GET', url: EachTFR.links.xml, data: ""}, function processResponse(result) {
                            let xmlDoc = xmlparser.parseFromString(result, 'text/xml')
                            // Get NOTAM #
                            var NOTAM = xmlDoc.getElementsByTagName('txtLocalName')[0].childNodes[0].nodeValue.replace(/\D/g, "")
                            document.getElementById(`TFRDescription${NOTAM}`).innerText = xmlDoc.getElementsByTagName('txtDescrUSNS')[0].childNodes[0].nodeValue
                        })
                    }
                    TFRCount = TFRCount + 1
                }
            }
        
        }    
    })
})();

// GCP WIND ALOFT FORECAST
(async () => {
    //const windAloftURL = 'https://wasatchcloudbase.github.io/example_files/example_wind_aloft.json'
    const windAloftURL = 'https://us-west3-wasatchwind.cloudfunctions.net/wind-aloft-ftp'
    const windAloftResponse = await fetch(windAloftURL)
    const aloftData = await windAloftResponse.json()
    const range = (now.getHours() > 3 && now.getHours() < 13) ? '12' : (now.getHours() > 18 || now.getHours() < 4) ? '24' : '06'
    const link = `https://www.aviationweather.gov/windtemp/data?level=low&fcst=${range}&region=slc&layout=on&date=`
    document.getElementById('wind-aloft-link').setAttribute('href', link)
    const alts = ['6k', '9k', '12k', '18k']
    document.getElementById('aloft-start').innerHTML = aloftData['Start time']
    document.getElementById('aloft-end').innerHTML = aloftData['End time']
    for (let i=0; i<4; i++) {
        let element = document.getElementById(`dir-${i}`)
        let text = (aloftData.Dirs[alts[i]]==='calm') ? '<div class="fs-1 fw-bold">Calm</div>' : '&#10148;'
        element.innerHTML = text
        element.style.transform = `rotate(${aloftData.Dirs[alts[i]]+90}deg)`
        if (aloftData.Dirs[alts[i]]==='calm') document.getElementById(`aloft-${i}`).style.display = 'none'
        else {
            document.getElementById(`aloft-${i}`).style.width = `${aloftData.Spds[alts[i]]*0.6}%`
            document.getElementById(`spd-${i}`).innerHTML = aloftData.Spds[alts[i]]
            document.getElementById(`aloft-${i}`).style.backgroundColor = windColor(aloftData.Spds[alts[i]], 'Aloft')
            document.getElementById(`mph-${i}`).innerHTML = 'mph'
        }
    }
})();

// GCP SOARING FORECAST
(async () => {
    try {
        const maxTempURL = 'https://storage.googleapis.com/wasatch-wind-static/maxtemp.json'
        doCORSRequest({method: 'GET', url: maxTempURL, data: ""}, function processResponse(result) {
            maxTempF = JSON.parse(result).maxtemp
            const soundingURL = 'https://storage.googleapis.com/wasatch-wind-static/raob.json'
            doCORSRequest({method: 'GET', url: soundingURL, data: ""}, function processResponse(result) {
                soundingData = JSON.parse(result)
                if (maxTempF && soundingData) {                
                    liftParams = getLiftParams(maxTempF, soundingData)                
                    decodedSkewTChart(maxTempF, soundingData, liftParams)
                }
            })                
        })
    } catch (error) { 
        console.log('max temp URL build error: ' + error) }
})();

function getLiftParams(temp, data, position = 0, raobSlope, raobYInt, params = {}) {
    try {
        const tempC = (temp - 32) * 5 / 9
        const surfaceAlt_m = 1289
        const dalrSlope = -101.6 // Metric equivalent to -5.4 F / 1,000' (1000/3.28084 & 3deg C) = 101.6
        const dalrYInt = surfaceAlt_m - (dalrSlope * tempC)
        // Find height of -3 index first (thermal index is -3)
        while (data[position].Temp_c - ((data[position].Altitude_m - dalrYInt) / dalrSlope) < -3) position++
        let interpolateX1 = data[position].Temp_c
        let interpolateY1 = data[position].Altitude_m
        let interpolateX2 = 0
        let interpolateY2 = 0
        if (position > 0) {
            interpolateX2 = data[position - 1].Temp_c
            interpolateY2 = data[position - 1].Altitude_m
        }
        if (interpolateX1 !== interpolateX2) {
            raobSlope = (interpolateY1 - interpolateY2) / (interpolateX1 - interpolateX2)
            let raobYInt = interpolateY1 - (raobSlope * interpolateX1)
            const interpolateX = (raobYInt - dalrYInt - (3 * dalrSlope)) / (dalrSlope - raobSlope)
            params.neg3 = interpolateY1 + (interpolateX - interpolateX1) * (interpolateY2 - interpolateY1) / (interpolateX2 - interpolateX1)
        }
        else params.neg3 = (interpolateX1 + 3) * dalrSlope + dalrYInt
        params.neg3Temp = (params.neg3 - dalrYInt) / dalrSlope
        document.getElementById('user-neg3').innerHTML = Math.round(params.neg3 * 3.28084).toLocaleString()
        // Now find top of lift (thermal index is 0)
        while (data[position].Temp_c - ((data[position].Altitude_m - dalrYInt) / dalrSlope) < 0) position++
        interpolateX1 = data[position].Temp_c
        interpolateY1 = data[position].Altitude_m
        interpolateX2 = 0
        interpolateY2 = 0
        if (position > 0) {
            interpolateX2 = data[position - 1].Temp_c
            interpolateY2 = data[position - 1].Altitude_m
        }
        if (interpolateX1 !== interpolateX2) {
            raobSlope = (interpolateY1 - interpolateY2) / (interpolateX1 - interpolateX2)
            raobYInt = interpolateY1 - (raobSlope * interpolateX1)
            params.tol = ((dalrSlope * raobYInt) - (raobSlope * dalrYInt)) / (dalrSlope - raobSlope)
        }
        else params.tol = (interpolateX1 * dalrSlope) + dalrYInt
        params.tolTemp = (params.tol - dalrYInt) / dalrSlope
        document.getElementById('user-tol').innerHTML = Math.round(params.tol * 3.28084).toLocaleString()
        return params
    } catch (error) { 
        console.log('Error: ' + error + ' in getLiftParams for temp: ' + temp + ' and position: ' + position + ' in data: ' + JSON.stringify(data[position]))
    }
};