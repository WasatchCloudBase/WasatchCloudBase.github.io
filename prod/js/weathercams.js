'use strict';
// Weather cams page

// Populate Weather Cam images when navigating to Weather Cams page
// These aren't loaded until this page is accessed to bandwidth needs
async function populateWeatherCams() {

    // Show 'loading' image
    document.getElementById('Loading Image').style.display = 'block' 

    // Retrieve weather cam data in JSON format from Google sheets API
    // Maintain weath cam data here:  https://docs.google.com/spreadsheets/d/1nBEJuTCWkUidSFKQjBjcJgKeteC_oy8LqL2P7uhGyLQ/edit#gid=0
    var weather_cam_data_url = "https://sheets.googleapis.com/v4/spreadsheets/1nBEJuTCWkUidSFKQjBjcJgKeteC_oy8LqL2P7uhGyLQ/values/WeatherCams/?alt=json" +
        "&key=AIzaSyDSro1lDdAQsNEZq06IxwjOlQQP1tip-fs"
    var response = await fetch(weather_cam_data_url)
    var weatherCamRawJSON = await response.json()
    if (weatherCamRawJSON) {

        // Convert first row (headers) to JSON keys
        var weatherCamData = setJSONKeys(weatherCamRawJSON.values)

        // Build and populate each weather cam div
        for (let i=0; i<weatherCamData.length; i++) {
            try {

                // Clone prototype weather cam DIV
                let cloned_weather_cam = document.getElementById(`prototype-weather-cam`).cloneNode(true)

                //Rename parent and children IDs from prototype clone to new site
                let weatherCamID = weatherCamData[i].WeatherCamID
                cloned_weather_cam.id = weatherCamID + `-weather-cam`
                cloned_weather_cam.children[0].id = weatherCamID + `-weather-cam-name`
                cloned_weather_cam.children[1].id = weatherCamID + `-weather-cam-href`
                cloned_weather_cam.children[1].children[0].id = weatherCamID + `-weather-cam-img`

                //Add new site to page under weather cam category
                document.getElementById(weatherCamData[i].WeatherCamCategory + `-weather-cams`).appendChild(cloned_weather_cam)

                // Update weather cam data
                document.getElementById(weatherCamID + `-weather-cam-name`).innerHTML = weatherCamData[i].WeatherCamName
                document.getElementById(weatherCamID + `-weather-cam-href`).href = weatherCamData[i].WeatherCamLinkURL
                if (weatherCamData[i].WeatherCamLImageURL) {
                    document.getElementById(weatherCamID + `-weather-cam-img`).src = weatherCamData[i].WeatherCamLImageURL
                } else {
                    document.getElementById(weatherCamID + `-weather-cam-img`).src = weatherCamData[i].WeatherCamLinkURL
                }

                // Display new weather cam unless parameter set to hide
                if (weatherCamData[i].HideWeatherCam != 'Yes') {
                    document.getElementById(weatherCamID + `-weather-cam`).style.display = 'block'
                }

            } catch (error) { 
                console.log('Weather cam build error: ' + error + ' for weather cam: ' + weatherCamData[i].weatherCamID)
            }
        }
    }
    // Hide 'loading' image
    document.getElementById('Loading Image').style.display = 'none'

}