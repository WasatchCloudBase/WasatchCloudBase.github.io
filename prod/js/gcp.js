'use strict';
// GCP WIND MAP IMAGE
(async () => {
    const gcpImageURL = 'https://storage.googleapis.com/wasatch-wind-static/wind-map-save.png';
    const imageMetaUrl = 'https://storage.googleapis.com/storage/v1/b/wasatch-wind-static/o/wind-map-save.png';
    const response = await fetch(imageMetaUrl);
    const data = await response.json();
    let gcpImageTime = new Date(data.timeCreated);
    gcpImageTime = gcpImageTime.toLocaleString('en-US', {hour: 'numeric', minute: '2-digit'}).toLowerCase();
    document.getElementById('wind-map-timestamp').innerHTML = gcpImageTime;
    document.getElementById('surface-wind-map').src = gcpImageURL;
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
            document.getElementById(`aloft-${i}`).style.backgroundColor = getWindColor('Aloft', aloftData.Spds[alts[i]])
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
        console.log(error) }
})();

function getLiftParams(temp, data, position = 0, raobSlope, raobYInt, params = {}) {
    const tempC = (temp - 32) * 5 / 9
    const surfaceAlt_m = 1289
    const dalrSlope = -101.6 // Metric equivalent to -5.4 F / 1,000' (1000/3.28084 & 3deg C) = 101.6
    const dalrYInt = surfaceAlt_m - (dalrSlope * tempC)
    // Find height of -3 index first (thermal index is -3)
    while (data[position].Temp_c - ((data[position].Altitude_m - dalrYInt) / dalrSlope) < -3) position++
    let interpolateX1 = data[position].Temp_c
    let interpolateY1 = data[position].Altitude_m
    let interpolateX2 = data[position - 1].Temp_c
    let interpolateY2 = data[position - 1].Altitude_m
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
    interpolateX2 = data[position - 1].Temp_c
    interpolateY2 = data[position - 1].Altitude_m
    if (interpolateX1 !== interpolateX2) {
        raobSlope = (interpolateY1 - interpolateY2) / (interpolateX1 - interpolateX2)
        raobYInt = interpolateY1 - (raobSlope * interpolateX1)
        params.tol = ((dalrSlope * raobYInt) - (raobSlope * dalrYInt)) / (dalrSlope - raobSlope)
    }
    else params.tol = (interpolateX1 * dalrSlope) + dalrYInt
    params.tolTemp = (params.tol - dalrYInt) / dalrSlope
    document.getElementById('user-tol').innerHTML = Math.round(params.tol * 3.28084).toLocaleString()
    return params
};
