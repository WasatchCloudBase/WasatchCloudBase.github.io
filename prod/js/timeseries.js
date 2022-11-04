'use strict';

// Set number of history readings based on site reading frequency
const FastStations = ['KSLC', 'UTOLY', 'FPS', 'REY', 'IFF', 'CEN', 'BBN', 'KPVU', 'UTORM', 'SND', 'PC198', 'UTBU1']
const SlowStations = ['AMB', 'SIGU1', 'BYCU1', 'KHIF'] 
const FastStationCount = 12 // 5-10 minute updates; show 1-2 hour history
const SlowStationCount = 5  // Hourly updates; show 5 hour history
const MediumStationCount = 9 // 10-30 minute updates; show last 9 readings (~2-4 hour history)

// Determine mountain and soaring sites for wind speed color thresholds
const MountainSites = ['REY', 'IFF', 'AMB', 'OGP', 'SND', 'SIGU1', 'UTBU1', 'BYCU1']
const SoaringSites = ['FPS', 'HF012', 'UCC45', 'PC198']

// Identify airport stations to show pressure zone readings
const AirportStations = ['KSLC', 'KRIF', 'KPVU', 'KHIF']

// Build time series station info, forecast URLs, and cloned divs
// Central Wasatch
BuildStationInfo('KSLC', 'SLC Airport', '4,226', '40.7862', '-111.9801')
BuildStationInfo('UTOLY', 'Olympus Cove', '4,972', '40.6826', '-111.7973')
BuildStationInfo('KU42', 'Airport 2', '4,596', '40.61960', '-111.99016')
BuildStationInfo('HF012', 'POTM North', '6,194', '40.47191', '-111.88297')
BuildStationInfo('FPS', 'POTM South', '5,202', '40.45689', '-111.90483')
BuildStationInfo('REY', 'Reynolds Peak', '9,400', '40.662117', '-111.646764')
BuildStationInfo('IFF', 'Cardiff Peak', '10,059', '40.5950', '-111.6519')
BuildStationInfo('AMB', 'Alta Mt Baldy', '11,066', '40.5677', '-111.6374')
// Northern Wasatch
BuildStationInfo('KHIF', 'Hill AFB', '4,783', '41.11112', '-111.96229')
BuildStationInfo('CEN', 'Centerville', '4,231', '40.94968', '-111.891629')
BuildStationInfo('BBN', 'Bountiful Bench', '4,950', '40.89089', '-111.850578')
BuildStationInfo('OGP', 'Mount Ogden', '9,570', '41.200', '-111.881')
BuildStationInfo('UCC45', 'Randolph', '6,282', '41.67074', '-111.17445')
// Southern Wasatch
BuildStationInfo('KPVU', 'Provo Airport', '4,498', '40.21667', '-111.71667')
BuildStationInfo('UTORM', 'Orem', '4,650', '40.31925', '-111.7267')
BuildStationInfo('SND', 'Sundance', '8,250', '40.368386', '-111.593964')
// Central Utah
BuildStationInfo('KRIF', 'Richfield Airport', '5,318', '38.73411', '-112.10158')
BuildStationInfo('SIGU1', 'Signal Peak (Cove)', '8,767', '38.633428', '-112.060653')
BuildStationInfo('PC198', 'Poverty Ridge', '6,844', '38.49699', '-112.21683')
BuildStationInfo('UTBU1', 'Beaver Mt (Tushars)', '10,007', '38.28609', '-112.36122')
BuildStationInfo('BYCU1', 'Bryce Canyon', '7,855', '37.641667', '-112.172222')    

// Determine number of history readings based on station reading speed
function getHistoryReadingCount(stid) {
    var readingCount = 0
    if (FastStations.includes(stid)) {readingCount = FastStationCount} 
    else if (SlowStations.includes(stid)) {readingCount = SlowStationCount} 
    else {readingCount = MediumStationCount}
    return readingCount
}

// IIFE ASYNC CALL FUNCTION TO GET TIME SERIES DATA
(async () => {
    // Initial call on page load
    var TimeSeriesCall = await getTimeSeries()
    // Interval call to refresh station data
    const interval_in_seconds = 30
    const interval_in_milliseconds = interval_in_seconds*1000
    setInterval(ReloadTimeSeries, interval_in_milliseconds)
})();

// Function to reload TimeSeries DIV values based on interval refresh
async function ReloadTimeSeries() {
    var TimeSeriesIntervalCall = await getTimeSeries()
};

// Function to populate station info, build URLs for forecast plotter image and click-through, and clone reading reading/pressure DIVs
function BuildStationInfo (StationID, StationName, StationElevation, StationLatitude, StationLongitude) {
    document.getElementById(StationID + `-Name`).innerText = StationName
    document.getElementById(StationID + `-Elevation`).innerText = StationElevation + ' ft'
    document.getElementById(StationID + `-Forecast-URL`).href = 'https://forecast.weather.gov/MapClick.php?w0=t&w3=sfcwind&w4=sky&w5=pop&w7=rain&AheadHour=0&Submit=Submit&&FcstType=graphical&textField1=' + StationLatitude + '&textField2=' + StationLongitude + '&site=all&menu=1'
    document.getElementById(StationID + `-Forecast-Image`).src = 'https://forecast.weather.gov/meteograms/Plotter.php?lat=' + StationLatitude + '&lon=' + StationLongitude + '&wfo=SLC&zcode=UTZ003&gset=30&gdiff=10&unit=0&tinfo=MY7&ahour=0&pcmd=10001110101000000000000000000000000000000000000000000000000&lg=en&indu=1!1!1!&dd=&bw=&hrspan=48&pqpfhr=6&psnwhr=6'
    // Set number of history readings based on station reading speed
    var readingCount = getHistoryReadingCount(StationID)
    // Clone history reading div
    for (let i=1; i<readingCount; i++) {
        let cloned_reading = document.getElementById(`${StationID}-reading-0`).cloneNode(true)
        //Rename parent and children IDs
        cloned_reading.id = `${StationID}-reading-` + i
        cloned_reading.children[0].id = `${StationID}-gust-` + i
        cloned_reading.children[1].id = `${StationID}-gbar-` + i
        cloned_reading.children[2].id = `${StationID}-break-` + i
        cloned_reading.children[3].id = `${StationID}-wbar-` + i
        cloned_reading.children[4].id = `${StationID}-wind-` + i
        cloned_reading.children[5].id = `${StationID}-wdir-` + i
        cloned_reading.children[6].id = `${StationID}-time-` + i
        //Add clone to page
        document.getElementById(`${StationID}-reading-main`).appendChild(cloned_reading)
    } 
    // Clone airport pressure reading div
    if (AirportStations.includes(StationID)) {
        for (let i=1; i<6; i++) {
            let cloned_reading = document.getElementById(`${StationID}-pressure-0`).cloneNode(true)
            //Rename parent and children IDs
            cloned_reading.id = `${StationID}-pressure-` + i
            cloned_reading.children[0].id = `${StationID}-alti-` + i
            cloned_reading.children[1].id = `${StationID}-altibar-` + i
            cloned_reading.children[2].id = `${StationID}-temp-` + i
            cloned_reading.children[3].id = `${StationID}-zone-` + i
            cloned_reading.children[4].id = `${StationID}-alti-time-` + i
            //Add clone to page
            document.getElementById(`${StationID}-pressure-main`).appendChild(cloned_reading)
        } 
    }
}

// Function to get TimeSeries data from Mesonet API
// MESONET PRIVATE API FOR TIME SERIES: https://developers.synopticdata.com/mesonet
async function getTimeSeries() {
    // Get Mesowest readings
    var url = `https://api.mesowest.net/v2/station/timeseries?` +
        // Central Wasatch
        `&stid=KSLC` + 
        `&stid=UTOLY` + 
        `&stid=KU42` + 
        `&stid=HF012` + 
        `&stid=FPS` + 
        `&stid=REY` + 
        `&stid=IFF` + 
        `&stid=AMB` +
        // Northern Wasatch
        `&stid=KHIF` +
        `&stid=CEN` +
        `&stid=BBN` + 
        `&stid=OGP` +
        `&stid=UCC45` +
        // Southern Wasatch
        `&stid=KPVU` +
        `&stid=UTORM` +
        `&stid=SND` + 
        // Central Utah
        `&stid=KRIF` + 
        `&stid=SIGU1` +
        `&stid=PC198` +
        `&stid=UTBU1` +
        `&stid=BYCU1` +
        `&recent=420&vars=air_temp,altimeter,wind_direction,wind_gust,wind_speed&units=english,speed|mph,temp|F&obtimezone=local&timeformat=%-I:%M%20%p&` + 
        `token=0030ed6480a4440eb29ec23ff37fe159`
    var response = await fetch(url)
    var tsData = await response.json()
    if (tsData) {
        let stations = []
        for (let i=0; i<tsData.STATION.length; i++) {
            try {
                // Get pressure readings for each airport station
                if (AirportStations.includes(tsData.STATION[i].STID)) AltiTempZone(tsData.STATION[i].STID, tsData.STATION[i].OBSERVATIONS)
                // Get observations for all stations
                stations[i] = tsData.STATION[i].OBSERVATIONS
                stations[i].stid = tsData.STATION[i].STID
                windChart(stations[i])
            } catch (error) { 
//                console.log('Station reading error: ' + error)
//                console.log('For station ID: ' + tsData.STATION[i].STID) 
//                console.log(tsData.STATION[i].OBSERVATIONS) 
            }
        }
    }
};

function AltiTempZone(stationID, data, time=[], alti=[], temp=[]) {
    const latestAlti = parseFloat(data.altimeter_set_1.slice(-1)).toFixed(2)
    const latestTemp = Math.round(data.air_temp_set_1.slice(-1))
    let latestZone = calculateZone(latestAlti, latestTemp)
    const zoneColor = (latestZone===0 || latestZone===7) ? wwRed : (latestZone===1 || latestZone===6) ? wwOrg : (latestZone===2 || latestZone===5) ? wwYlw : wwGrn
    latestZone = latestZone===0 ? '&#9471;' : (latestZone==='LoP') ? 'LoP' : `&#1010${latestZone+1}`
    let StationZoneElementName = stationID + '-zone'
    document.getElementById(StationZoneElementName).innerHTML = latestZone
    document.getElementById(StationZoneElementName).style.color = zoneColor
    for (let i=0; i<data.date_time.length; i++) {
        // Using :00 readings, except for those that don't have :00 readings:
        // :15 readings for Richfield airport
        // :56 readings for Hill Air Force Base
        if ((data.date_time[i].slice(-5,-3)==='00') ||
            (stationID==='KRIF' & (data.date_time[i].slice(-5,-3)==='15')) ||
            (stationID==='KHIF' & (data.date_time[i].slice(-5,-3)==='56')) 
        ){
            time.push(data.date_time[i].toLowerCase().replace(/:\d{2}/g, ''))
            temp.push(`${Math.round(data.air_temp_set_1[i])}&deg;`)
            alti.push(data.altimeter_set_1[i].toFixed(2))
        }
    }
    const hourlyData = {'time':time.slice(-6), 'temp':temp.slice(-6), 'alti':alti.slice(-6)}
    zone(stationID, hourlyData)
}

function calculateZone(alti, temp, currentZones = []) {
    const zoneSlope = [0.05, 0.12, 0.19, 0.33, 0.47, 0.54, 0.62, -1]
    const zoneIntercept = [29.91, 30.01, 30.11, 30.27, 30.43, 30.53, 30.65, 100]
    for (let i=0; i<zoneSlope.length; i++) currentZones.push(Math.round((zoneSlope[i]/-110*temp+zoneIntercept[i])*100)/100)
    const zone = currentZones.findIndex(d => d >= alti)
    return alti===currentZones[3] ? 'LoP' : zone
}

function zone(stationID, data, zDigit=[]) {
    for (let i=0; i<data.alti.length; i++) zDigit.push(calculateZone(parseFloat(data.alti[i]), parseInt(data.temp[i])))
    const zColor = zDigit.map(d => (d===0 || d===7) ? wwRed : (d===1 || d===6) ? wwOrg : (d===2 || d===5) ? wwYlw : wwGrn)
    const zFormatted = zDigit.map(d => d===0 ? '&#9471;' : d==='LoP' ? '<span class="display-3 fw-bold">LoP</span>' : `&#1010${d+1}`)
    const min = Math.min(...data.alti)
    const max = Math.max(...data.alti)
    const barHeight = data.alti.map(d => `${(((d-min)*80)/(max-min))+10}px`)
    for (let i=0; i<6; i++) {
        const element = document.getElementById(stationID + `-zone-${i}`)
        element.innerHTML = zFormatted[i]
        element.style.color = zColor[i]
        document.getElementById(stationID + `-alti-${i}`).innerHTML = data.alti[i]
        document.getElementById(stationID + `-temp-${i}`).innerHTML = data.temp[i]
        document.getElementById(stationID + `-alti-time-${i}`).innerHTML = data.time[i]
        document.getElementById(stationID + `-altibar-${i}`).style.height = barHeight[i]
    }
}

function windChart(data) {
    // Reduce the observations (readings) to the last (most recent) based on the station history length
    let length = getHistoryReadingCount(data.stid)
    for (let key in data) data[key] = data[key].slice(-length)
    // Update page with reading data
    time(data.stid, data.date_time)
    wind(data.stid, data.wind_speed_set_1)
    if (data.wind_direction_set_1) wdir(data.stid, data.wind_direction_set_1)
    if (data.wind_gust_set_1) gust(data.stid, data.wind_gust_set_1, data.wind_speed_set_1)
    else { for (let i=0; i<length; i++) { document.getElementById(`${data.stid}-gust-${i}`).innerHTML = '&nbsp;' } }
}

function time(stid, data) {
    document.getElementById(`${stid}-time`).innerHTML = data[data.length-1].toLowerCase()
    data = data.map(d => data.length<11 ? d.toLowerCase().replace(':00', '') : d.toLowerCase().slice(0,-3))
    for (let i=0; i<data.length; i++) {
        document.getElementById(`${stid}-time-${i}`).innerHTML = data[i]
    }
}

function wind(stid, data) {
    try {
        data = data.map(d => Math.round(d)>=1 ? Math.round(d) : d===null ? '&nbsp;' : '<span class="fs-3 fw-normal">Calm</span>')
        const barHeight = data.map(d => d!=='' ? `${d*4}px` : '0px')
        const barColor = data.map(d => getWindColor(stid, d))

        document.getElementById(`${stid}-wind`).innerHTML = typeof data[data.length-1]==='string' ? '<span class="display-5">Calm</span>' : data[data.length-1]
        document.getElementById(`${stid}-wind`).style.color = barColor[data.length-1]

        for (let i=0; i<data.length; i++) {
            document.getElementById(`${stid}-wind-${i}`).innerHTML = data[i]
            document.getElementById(`${stid}-wbar-${i}`).style.height = barHeight[i]
            document.getElementById(`${stid}-wbar-${i}`).style.backgroundColor = barColor[i]
        }
    } catch (error) { 
//        console.log('Station wind data error: ' + error)
//        console.log('For station ID: ' + stid) 
//        console.log(data) 
    }
}

function wdir(stid, data) {
    const wimg = data.map(d => d>0 ? '&#10148;' : '&nbsp;')
    const wdir = data.map(d => d>0 ? `rotate(${d+90}deg)` : '')
    document.getElementById(`${stid}-wdir`).innerHTML = wimg[wimg.length-1]
    document.getElementById(`${stid}-wdir`).style.transform = wdir[wdir.length-1]
    for (let i=0; i<data.length; i++) {
        document.getElementById(`${stid}-wdir-${i}`).innerHTML = wimg[i]
        document.getElementById(`${stid}-wdir-${i}`).style.transform = wdir[i]
    }
}

function gust(stid, data, wind, barHeight=[]) {
    try {
        const barColor = data.map(d => getWindColor(stid, d))
        for (let i=0; i<data.length; i++) barHeight.push(data[i]>=1 ? `${(data[i]-wind[i])*4}px` : '0px')
        data = data.map(d => d>=1 ? `g${Math.round(d)}` : '&nbsp;')
        if (data[data.length-1]!=='&nbsp;') {
            document.getElementById(`${stid}-gust`).innerHTML = data[data.length-1]
            document.getElementById(`${stid}-gust`).style.color = barColor[data.length-1]
            document.getElementById(`${stid}-gust`).style.display = 'block'
        }
        for (let i=0; i<data.length; i++) {
            document.getElementById(`${stid}-gust-${i}`).innerHTML = data[i]
            document.getElementById(`${stid}-gbar-${i}`).style.height = barHeight[i]
            document.getElementById(`${stid}-gbar-${i}`).style.backgroundColor = barColor[i]
            document.getElementById(`${stid}-break-${i}`).style.height = '5px'
        }
    } catch (error) { 
//        console.log('Station wind data error: ' + error)
//        console.log('For station ID: ' + stid) 
//        console.log(data) 
    }
}