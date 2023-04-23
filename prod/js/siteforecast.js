'use strict';

// Forecast table keys
const tableID           = document.getElementById("forecastTable")
const tableRows         = tableID.getElementsByTagName(`tr`)
const rowDate           = tableRows[0]
const rowTime           = tableRows[1]
const rowWeatherCode    = tableRows[2]
const rowCloudCover     = tableRows[3]
const rowCloudCoverLow  = tableRows[4]
const rowCloudCoverMid  = tableRows[5]
const rowCloudCoverHigh = tableRows[6]
const rowCAPE           = tableRows[7]
const rowLI             = tableRows[8]
const rowPressureZone   = tableRows[9]
const rowWind500        = tableRows[10]
const rowWind550        = tableRows[11]
const rowWind600        = tableRows[12]
const rowWind650        = tableRows[13]
const rowWind700        = tableRows[14]
const rowWind750        = tableRows[15]
const rowWind800        = tableRows[16]
const rowWind850        = tableRows[17]
const rowWind900        = tableRows[18]
const rowWind80m        = tableRows[19]
const rowWind10m        = tableRows[20]
const rowTemp2m         = tableRows[21]
var forecastTableBuilt = false  /* Only build the table data cells the first time the function is called */

// Get forecast data for site
async function siteForecast(site) {

    // If there was a previous site forecast, delete all of the previous cells except for column 0 (prototype cells).
    // This approach is taken to prevent any issues if different forecasts have a different number of hourly forecasts
    // or if the days cover a different number of hourly forecast (colspan for the header).
    // It also ensure no leftover data is displayed.
    var rows = tableID.rows
    for (var i = 0; i < rows.length; i++) {
        var cells = rows[i].cells
        for (var j = cells.length - 1; j > 0; j--) {
            rows[i].deleteCell(j);  // delete the cell
        }
    }

    // Un-hide all wind rows in case a previous forecast hid those below surface + 80m
    rowWind900.style.visibility = `visible`
    rowWind850.style.visibility = `visible`
    rowWind800.style.visibility = `visible`
    rowWind750.style.visibility = `visible`
    rowWind700.style.visibility = `visible`
    rowWind650.style.visibility = `visible`
    rowWind600.style.visibility = `visible`
    rowWind550.style.visibility = `visible`
    rowWind500.style.visibility = `visible`

    // Find site data for the selected site
    var detailSiteData = siteData.find(item => item.SiteID === site)

    // Update forecast location info
    document.getElementById(`site-details-forecast-alt`).innerHTML = null
    document.getElementById(`site-details-forecast-note`).innerHTML = null
    if ( detailSiteData.ForecastNote ) { document.getElementById(`site-details-forecast-note`).innerHTML = ' (forecast for zone including ' + detailSiteData.ForecastNote + ')' }
    
    // Build forecast URL for site lat/lon to get HRRR data from api.open-meteo.com
    // Data structure of output is documented in example_files/api_open-meteo_data_structure
    var forecast_url = "https://api.open-meteo.com/v1/gfs?" + 
    "latitude=" + detailSiteData.ForecastLat +
    "&longitude=" + detailSiteData.ForecastLon + 
    "&hourly=temperature_2m,relativehumidity_2m,pressure_msl,surface_pressure," +
    "precipitation,precipitation_probability,weathercode,cloudcover,cloudcover_low,cloudcover_mid,cloudcover_high,cape,lifted_index," +
    "windspeed_10m,windspeed_80m,winddirection_10m,winddirection_80m,windgusts_10m," +
    "temperature_900hPa,temperature_850hPa,temperature_800hPa,temperature_750hPa,temperature_700hPa,temperature_650hPa,temperature_600hPa,temperature_550hPa,temperature_500hPa," +
    "dewpoint_900hPa,dewpoint_850hPa,dewpoint_800hPa,dewpoint_750hPa,dewpoint_700hPa,dewpoint_650hPa,dewpoint_600hPa,dewpoint_550hPa,dewpoint_500hPa," +
    "windspeed_900hPa,windspeed_850hPa,windspeed_800hPa,windspeed_750hPa,windspeed_700hPa,windspeed_650hPa,windspeed_600hPa,windspeed_550hPa,windspeed_500hPa," +
    "winddirection_900hPa,winddirection_850hPa,winddirection_800hPa,winddirection_750hPa,winddirection_700hPa,winddirection_650hPa,winddirection_600hPa,winddirection_550hPa,winddirection_500hPa," +
    "vertical_velocity_900hPa,vertical_velocity_850hPa,vertical_velocity_800hPa,vertical_velocity_750hPa,vertical_velocity_700hPa,vertical_velocity_650hPa,vertical_velocity_600hPa,vertical_velocity_550hPa,vertical_velocity_500hPa," +
    "geopotential_height_900hPa,geopotential_height_850hPa,geopotential_height_800hPa,geopotential_height_750hPa,geopotential_height_700hPa,geopotential_height_650hPa,geopotential_height_600hPa,geopotential_height_550hPa,geopotential_height_500hPa" +
    "&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timezone=America%2FDenver"

    var height_900_sum = 0
    var height_850_sum = 0
    var height_800_sum = 0
    var height_750_sum = 0
    var height_700_sum = 0
    var height_650_sum = 0
    var height_600_sum = 0
    var height_550_sum = 0
    var height_500_sum = 0
    var forecastCount = 0
    var previousDate = ``
    var previousDateStart = ``
    var surfaceAlt = ``

    var response = await fetch(forecast_url)
    var forecastData = await response.json()
    if (forecastData) {
        try {

            // Add elevation being returned by forecast to check against requested site altitude
            surfaceAlt = Math.round(forecastData.elevation * 3.28084) // converts meters to feet
            document.getElementById(`site-details-forecast-alt`).innerHTML = surfaceAlt.toLocaleString() + `&nbsp;ft`

            // Process each hourly forecast
            for (let i=0; i<forecastData.hourly.time.length; i++) {
                try {

                    // Format date and time
                    const fullDateTime = new Date(forecastData.hourly.time[i].substring(0,16))
                    const dayOfWeek = daysOfWeek[fullDateTime.getDay()]
                    const monthName = monthNames[fullDateTime.getMonth()]
                    const dayOfMonth = fullDateTime.getDate()
                    const formattedDate = `${dayOfWeek}, ${monthName} ${dayOfMonth}`
                    var formattedHour = fullDateTime.getHours().toString()

                    // Only include forecasts between sunrise and sunset (converting sunset to 24 hour format) and are not more than 1 hour old
                    var relativeForecastTime = ( fullDateTime - now ) / 3600000  //converting milliseconds to hours       
                    if ( formattedHour >= sunrise_hour-1 && formattedHour <= sunset_hour + 13 && relativeForecastTime >= -1 ) {
                        forecastCount = forecastCount + 1

                        // Convert 24 hour format to 12 hour format
                        if ( formattedHour > 12 ) { formattedHour = formattedHour - 12 }

                        // Create a new column (e.g., cell for each row) to store the current hourly forecast
                        // (only create on the first call; otherwise reset the column span for headers)
                        for (let rowi=0; rowi<tableRows.length; rowi++) {
                            var tableData = document.createElement(`td`)
                            tableData.id = tableRows[rowi].id + '-' + i
                            tableRows[rowi].appendChild(tableData)
                        }

                        // Populate cells with hourly forecast
                        rowTime             .childNodes[forecastCount].innerText = formattedHour
                        rowWeatherCode      .childNodes[forecastCount].innerHTML = `<img src="prod/images/weather/` +
                            weatherCodes[forecastData.hourly.weathercode[i]][1].Image + `.png" width="80">`
                        rowCloudCover       .childNodes[forecastCount].innerText = forecastData.hourly.cloudcover[i] + "%"
                        rowCloudCoverLow    .childNodes[forecastCount].innerText = forecastData.hourly.cloudcover_low[i] + "%"
                        rowCloudCoverMid    .childNodes[forecastCount].innerText = forecastData.hourly.cloudcover_mid[i] + "%"
                        rowCloudCoverHigh   .childNodes[forecastCount].innerText = forecastData.hourly.cloudcover_high[i] + "%"
                        rowCAPE             .childNodes[forecastCount].innerText = forecastData.hourly.cape[i]
                        rowLI               .childNodes[forecastCount].innerText = forecastData.hourly.lifted_index[i]
                        rowPressureZone     .childNodes[forecastCount].innerText = forecastData.hourly.pressure_msl[i]
                        rowTemp2m           .childNodes[forecastCount].innerText = Math.round(forecastData.hourly.temperature_2m[i]) + `\u00B0`

                        // Build and populate wind forecast values at each pressure level (and surface levels)
                        var fullWindDisplay = ''
                        // 500 hPa
                        fullWindDisplay = buildWindDisplay(forecastData.hourly.windspeed_500hPa[i], forecastData.hourly.winddirection_500hPa[i], 0, detailSiteData.SiteType)
                        rowWind500      .childNodes[forecastCount].innerHTML = fullWindDisplay.windDisplay
                        rowWind500      .childNodes[forecastCount].getElementsByClassName("rotatedWindDir")[0].style.transform = fullWindDisplay.windDirTransform
                        // 550 hPa
                        fullWindDisplay = buildWindDisplay(forecastData.hourly.windspeed_550hPa[i], forecastData.hourly.winddirection_550hPa[i], 0, detailSiteData.SiteType)
                        rowWind550      .childNodes[forecastCount].innerHTML = fullWindDisplay.windDisplay
                        rowWind550      .childNodes[forecastCount].getElementsByClassName("rotatedWindDir")[0].style.transform = fullWindDisplay.windDirTransform
                        // 600 hPa
                        fullWindDisplay = buildWindDisplay(forecastData.hourly.windspeed_600hPa[i], forecastData.hourly.winddirection_600hPa[i], 0, detailSiteData.SiteType)
                        rowWind600      .childNodes[forecastCount].innerHTML = fullWindDisplay.windDisplay
                        rowWind600      .childNodes[forecastCount].getElementsByClassName("rotatedWindDir")[0].style.transform = fullWindDisplay.windDirTransform
                        // 650 hPa
                        fullWindDisplay = buildWindDisplay(forecastData.hourly.windspeed_650hPa[i], forecastData.hourly.winddirection_650hPa[i], 0, detailSiteData.SiteType)
                        rowWind650      .childNodes[forecastCount].innerHTML = fullWindDisplay.windDisplay
                        rowWind650      .childNodes[forecastCount].getElementsByClassName("rotatedWindDir")[0].style.transform = fullWindDisplay.windDirTransform
                        // 700 hPa
                        fullWindDisplay = buildWindDisplay(forecastData.hourly.windspeed_700hPa[i], forecastData.hourly.winddirection_700hPa[i], 0, detailSiteData.SiteType)
                        rowWind700      .childNodes[forecastCount].innerHTML = fullWindDisplay.windDisplay
                        rowWind700      .childNodes[forecastCount].getElementsByClassName("rotatedWindDir")[0].style.transform = fullWindDisplay.windDirTransform
                        // 750 hPa
                        fullWindDisplay = buildWindDisplay(forecastData.hourly.windspeed_750hPa[i], forecastData.hourly.winddirection_750hPa[i], 0, detailSiteData.SiteType)
                        rowWind750      .childNodes[forecastCount].innerHTML = fullWindDisplay.windDisplay
                        rowWind750      .childNodes[forecastCount].getElementsByClassName("rotatedWindDir")[0].style.transform = fullWindDisplay.windDirTransform
                        // 800 hPa
                        fullWindDisplay = buildWindDisplay(forecastData.hourly.windspeed_800hPa[i], forecastData.hourly.winddirection_800hPa[i], 0, detailSiteData.SiteType)
                        rowWind800      .childNodes[forecastCount].innerHTML = fullWindDisplay.windDisplay
                        rowWind800      .childNodes[forecastCount].getElementsByClassName("rotatedWindDir")[0].style.transform = fullWindDisplay.windDirTransform
                        // 850 hPa
                        fullWindDisplay = buildWindDisplay(forecastData.hourly.windspeed_850hPa[i], forecastData.hourly.winddirection_850hPa[i], 0, detailSiteData.SiteType)
                        rowWind850      .childNodes[forecastCount].innerHTML = fullWindDisplay.windDisplay
                        rowWind850      .childNodes[forecastCount].getElementsByClassName("rotatedWindDir")[0].style.transform = fullWindDisplay.windDirTransform
                        // 900 hPa
                        fullWindDisplay = buildWindDisplay(forecastData.hourly.windspeed_900hPa[i], forecastData.hourly.winddirection_900hPa[i], 0, detailSiteData.SiteType)
                        rowWind900      .childNodes[forecastCount].innerHTML = fullWindDisplay.windDisplay
                        rowWind900      .childNodes[forecastCount].getElementsByClassName("rotatedWindDir")[0].style.transform = fullWindDisplay.windDirTransform
                        // 80m above surface
                        fullWindDisplay = buildWindDisplay(forecastData.hourly.windspeed_80m[i], forecastData.hourly.winddirection_80m[i], 0, detailSiteData.SiteType)
                        rowWind80m      .childNodes[forecastCount].innerHTML = fullWindDisplay.windDisplay
                        rowWind80m      .childNodes[forecastCount].getElementsByClassName("rotatedWindDir")[0].style.transform = fullWindDisplay.windDirTransform
                        // 10m above surface
                        fullWindDisplay = buildWindDisplay(forecastData.hourly.windspeed_10m[i], forecastData.hourly.winddirection_10m[i], 0, detailSiteData.SiteType)
                        rowWind10m      .childNodes[forecastCount].innerHTML = fullWindDisplay.windDisplay
                        rowWind10m      .childNodes[forecastCount].getElementsByClassName("rotatedWindDir")[0].style.transform = fullWindDisplay.windDirTransform

                        // If date is the same as the prior column, merge the cells
                        if ( formattedDate === previousDate ) {
                            rowDate.childNodes[previousDateStart].colSpan = rowDate.childNodes[previousDateStart].colSpan + 1
                            rowDate.childNodes[forecastCount].style.display = `none`
                        } else
                        {
                            rowDate.childNodes[forecastCount].innerText = formattedDate
                            previousDateStart = forecastCount
                            previousDate = formattedDate
                        }

                        // Add up the geopotential height for each pressure (will be used to calculate an average below)
                        height_900_sum = height_900_sum + Number(forecastData.hourly.geopotential_height_900hPa[i])
                        height_850_sum = height_850_sum + Number(forecastData.hourly.geopotential_height_850hPa[i])
                        height_800_sum = height_800_sum + Number(forecastData.hourly.geopotential_height_800hPa[i])
                        height_750_sum = height_750_sum + Number(forecastData.hourly.geopotential_height_750hPa[i])
                        height_700_sum = height_700_sum + Number(forecastData.hourly.geopotential_height_700hPa[i])
                        height_650_sum = height_650_sum + Number(forecastData.hourly.geopotential_height_650hPa[i])
                        height_600_sum = height_600_sum + Number(forecastData.hourly.geopotential_height_600hPa[i])
                        height_550_sum = height_550_sum + Number(forecastData.hourly.geopotential_height_550hPa[i])
                        height_500_sum = height_500_sum + Number(forecastData.hourly.geopotential_height_500hPa[i])
                    }
                } catch (error) { 
                    console.log('Eror: ' + error + ' processing hourly forecast data for time: ' + forecastData.hourly.time[i])
                }
            }

            // Calculate average geopotential heights rounded to the nearest 100 ft
            var wind500Alt = Math.round((height_500_sum / forecastCount)/100)*100
            var wind550Alt = Math.round((height_550_sum / forecastCount)/100)*100
            var wind600Alt = Math.round((height_600_sum / forecastCount)/100)*100
            var wind650Alt = Math.round((height_650_sum / forecastCount)/100)*100
            var wind700Alt = Math.round((height_700_sum / forecastCount)/100)*100
            var wind750Alt = Math.round((height_750_sum / forecastCount)/100)*100
            var wind800Alt = Math.round((height_800_sum / forecastCount)/100)*100
            var wind850Alt = Math.round((height_850_sum / forecastCount)/100)*100
            var wind900Alt = Math.round((height_900_sum / forecastCount)/100)*100
            
            // Display average geopotential heights as row headers (and displayed with commas)
            rowWind500      .childNodes[0].innerText = wind500Alt.toLocaleString()
            rowWind550      .childNodes[0].innerText = wind550Alt.toLocaleString()
            rowWind600      .childNodes[0].innerText = wind600Alt.toLocaleString()
            rowWind650      .childNodes[0].innerText = wind650Alt.toLocaleString()
            rowWind700      .childNodes[0].innerText = wind700Alt.toLocaleString()
            rowWind750      .childNodes[0].innerText = wind750Alt.toLocaleString()
            rowWind800      .childNodes[0].innerText = wind800Alt.toLocaleString()
            rowWind850      .childNodes[0].innerText = wind850Alt.toLocaleString()
            rowWind900      .childNodes[0].innerText = wind900Alt.toLocaleString()

            // Hide wind reading rows where the altitude is less than surface + 80m
            var surfaceAlt80m =  (forecastData.elevation + 80) * 3.28084  // converts meters to feet
            if ( wind900Alt <= surfaceAlt80m ) { rowWind900.style.visibility = `collapse` }
            if ( wind850Alt <= surfaceAlt80m ) { rowWind850.style.visibility = `collapse` }
            if ( wind800Alt <= surfaceAlt80m ) { rowWind800.style.visibility = `collapse` }
            if ( wind750Alt <= surfaceAlt80m ) { rowWind750.style.visibility = `collapse` }
            if ( wind700Alt <= surfaceAlt80m ) { rowWind700.style.visibility = `collapse` }
            if ( wind650Alt <= surfaceAlt80m ) { rowWind650.style.visibility = `collapse` }
            if ( wind600Alt <= surfaceAlt80m ) { rowWind600.style.visibility = `collapse` }
            if ( wind550Alt <= surfaceAlt80m ) { rowWind550.style.visibility = `collapse` }
            if ( wind500Alt <= surfaceAlt80m ) { rowWind500.style.visibility = `collapse` }

        } catch (error) { 
            console.log('Error processing forecastData: ' + error )
        }
    }
}

function buildWindDisplay( windSpeed, windDir, windGust, siteType )
// Returns an object: { windDisplay (format # g#), windDirDisplay (image), windDirTransform (string to send to style.transform for span displaySpanID) }
{
    var windDisplay = ''

    // Determine wind direction
    var windDirRotation = 0
    if (windDir >= 0) { 
        windDirRotation = windDir + 90
        windDisplay = '<span class="rotatedWindDir">&#10148;</span>' 
    }
    var windDirTransform = `rotate(${windDirRotation}deg)`

    // Determine wind speed (or calm) and set color based on speed and type of site
    if (windSpeed) {
        var windColorDisplay = windColor(windSpeed, siteType)
        if (Math.round(windSpeed) >= 1) { 
            windDisplay = windDisplay + '<span style="color: ' + windColorDisplay + ';">' + Math.round(windSpeed) + '</span>'
        } else { 
            windDisplay = windDisplay + '<span class="fs-3 fw-normal">Calm</span>'
        }
    }    

    // Determine wind gust speed (hidden if missing)
    if (windGust) {
        var gustColorDisplay = windColor(windGust, siteType)
        if (Math.round(windGust) >= 1) { 
            windDisplay = windDisplay + '&nbsp;<span id="${displaySpanID}" style="color: ' + gustColorDisplay + ';">g' + Math.round(windGust) + '</span>'
        }
    }
    return { windDisplay, windDirTransform }
}