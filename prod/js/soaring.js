'use strict';
// Soaring forecast page

// Get morning SkewT
(async () => {
    const date = now.toLocaleString('en-US', {year: 'numeric', month: '2-digit', day: '2-digit'}).split('/')
   // original source:  const url = `https://climate.cod.edu/data/raob/KSLC/skewt/KSLC.skewt.${date[2]}${date[0]}${date[1]}.12.gif`
    const url = `http://weather.rap.ucar.edu/upper/displayUpper.php?img=KSLC.png&endDate=-1&endTime=-1&duration=0`
    document.getElementById('skew-t-img').src = url
    document.getElementById('skew-t-href').href = url             
})();

// Populate Soaring Forecast data when navigating to Soaring Forecast page
async function populateSoaringForecast() {

    // Show 'loading' image
    document.getElementById('Loading Image').style.display = 'block' 

    // Get today's graphical forecast (wind, gust, cloud cover, and precipitation)
    let forecastDate = new Date()
    let forecastHour = forecastDate.getHours()

    // Set the initial image to the first available image based on time (past images aren't available)
    // Images start with 0 at 3am, 1 at 6am, 2 at 9am, etc.; default is 2 (9am)
    // Since past images aren't available, using graphicImageMinimum to track the minimum available images when user uses back button
    if (forecastHour >  9 && forecastHour <= 12) {                          //  9am - 12pm; start with 12pm image (3)
        graphicSurfaceWindImage = graphicSurfaceGustImage = graphicCloudCoverImage = graphicPrecipitationImage = graphicImageMinimum = 3}
    if (forecastHour > 12 && forecastHour <= 15) {                          // 12pm -  3pm; start with  3pm image (4)
        graphicSurfaceWindImage = graphicSurfaceGustImage = graphicCloudCoverImage = graphicPrecipitationImage = graphicImageMinimum = 4}
    if (forecastHour > 15 && forecastHour <= 18) {                          //  3pm -  6pm; start with  6pm image (5)
        graphicSurfaceWindImage = graphicSurfaceGustImage = graphicCloudCoverImage = graphicPrecipitationImage = graphicImageMinimum = 5}
    if (forecastHour > 18                      ) {                          //  6pm -  9pm; start with  9am image next day (10)
        graphicSurfaceWindImage = graphicSurfaceGustImage = graphicCloudCoverImage = graphicPrecipitationImage = graphicImageMinimum = 10}
    document.getElementById(`surface-wind-graphic`).src = `${GraphForecastURL}WindSpd${graphicSurfaceWindImage}_slc.png`
    document.getElementById(`surface-gust-graphic`).src = `${GraphForecastURL}WindGust${graphicSurfaceGustImage}_slc.png`
    document.getElementById(`cloud-cover-graphic`).src = `${GraphForecastURL}Sky${graphicCloudCoverImage}_slc.png`
    document.getElementById(`precipitation-graphic`).src = `${GraphForecastURL}Wx${graphicPrecipitationImage}_slc.png`

    // Get Soaring Forecast text
    const soaringForecastURL = 'https://forecast.weather.gov/product.php?site=SLC&issuedby=SLC&product=SRG&format=TXT&version=1&glossary=0'
    const response = await fetch(soaringForecastURL)
    const SoaringForecastText = await response.text()
    if (SoaringForecastText) {
        let ContentStart = SoaringForecastText.search("DATE..")
        let ContentEnd = SoaringForecastText.indexOf("THIS", ContentStart) - 2
        let ContentText = SoaringForecastText.substring(ContentStart, ContentEnd) 
        document.getElementById("soaring-forecast").innerText = ContentText
    }

    // Get any TFRs for Utah (hidden if none)
    const TFRURL = 'cloudbase_tfr_api_call'
    const xmlparser = new DOMParser()
    doCORSRequest({method: 'GET', url: TFRURL, data: ""}, function processResponse(result) {
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

    // GCP WIND ALOFT FORECAST
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

    // GCP SOARING FORECAST
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
        console.log('max temp URL build error: ' + error) 
    }

    // Hide 'loading' image
    document.getElementById('Loading Image').style.display = 'none' 

}

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

// Update Graphical forecast images based on forward/back buttons
function GraphicalForecastNext(forecast_type) {
    if (forecast_type == 'surface-wind-graphic' && graphicSurfaceWindImage < 20) {
        graphicSurfaceWindImage = graphicSurfaceWindImage + 1
        document.getElementById(`surface-wind-graphic`).src = `${GraphForecastURL}WindSpd${graphicSurfaceWindImage}_slc.png`
    }
    if (forecast_type == 'surface-gust-graphic' && graphicSurfaceGustImage < 20) {
        graphicSurfaceGustImage = graphicSurfaceGustImage + 1
        document.getElementById(`surface-gust-graphic`).src = `${GraphForecastURL}WindGust${graphicSurfaceGustImage}_slc.png`
    }
    if (forecast_type == 'cloud-cover-graphic' && graphicCloudCoverImage < 20) {
        graphicCloudCoverImage = graphicCloudCoverImage + 1
        document.getElementById(`cloud-cover-graphic`).src = `${GraphForecastURL}Sky${graphicCloudCoverImage}_slc.png`
    }
    if (forecast_type == 'precipitation-graphic' && graphicPrecipitationImage < 20) {
        graphicPrecipitationImage = graphicPrecipitationImage + 1
        document.getElementById(`precipitation-graphic`).src = `${GraphForecastURL}Wx${graphicPrecipitationImage}_slc.png`
    }
}
function GraphicalForecastBack(forecast_type) {
    // Only select previous image if there is one available (current image > minimum image)
    if (forecast_type == 'surface-wind-graphic' && graphicSurfaceWindImage > graphicImageMinimum) {
        graphicSurfaceWindImage = graphicSurfaceWindImage - 1
        document.getElementById(`surface-wind-graphic`).src = `${GraphForecastURL}WindSpd${graphicSurfaceWindImage}_slc.png`
    }
    if (forecast_type == 'surface-gust-graphic' && graphicSurfaceGustImage > graphicImageMinimum) {
        graphicSurfaceGustImage = graphicSurfaceGustImage - 1
        document.getElementById(`surface-gust-graphic`).src = `${GraphForecastURL}WindGust${graphicSurfaceGustImage}_slc.png`
    }
    if (forecast_type == 'cloud-cover-graphic' && graphicCloudCoverImage > graphicImageMinimum) {
        graphicCloudCoverImage = graphicCloudCoverImage - 1
        document.getElementById(`cloud-cover-graphic`).src = `${GraphForecastURL}Sky${graphicCloudCoverImage}_slc.png`
    }
    if (forecast_type == 'precipitation-graphic' && graphicPrecipitationImage > graphicImageMinimum) {
        graphicPrecipitationImage = graphicPrecipitationImage - 1
        document.getElementById(`precipitation-graphic`).src = `${GraphForecastURL}Wx${graphicPrecipitationImage}_slc.png`
    }
}