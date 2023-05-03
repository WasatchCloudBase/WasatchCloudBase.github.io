'use strict';

// Forecast table keys
const tableID           = document.getElementById("forecastTable")
const tableRows         = tableID.getElementsByTagName(`tr`)
const rowDate           = tableRows[0]
const rowTime           = tableRows[1]
const rowWeatherCode    = tableRows[2]
const rowPrecipProb     = tableRows[3]
const rowTemp2m         = tableRows[4]
const rowCloudCover     = tableRows[5]
const rowCloudCoverLow  = tableRows[6]
const rowCloudCoverMid  = tableRows[7]
const rowCloudCoverHigh = tableRows[8]
const rowCAPE           = tableRows[9]
const rowLI             = tableRows[10]
const rowKI             = tableRows[11]
const rowDateWind       = tableRows[12]
const rowTimeWind       = tableRows[13]
const rowWind500        = tableRows[14]
const rowWind550        = tableRows[15]
const rowWind600        = tableRows[16]
const rowWind650        = tableRows[17]
const rowWind700        = tableRows[18]
const rowWind750        = tableRows[19]
const rowWind800        = tableRows[20]
const rowWind850        = tableRows[21]
const rowWind900        = tableRows[22]
const rowWind950        = tableRows[23]
const rowWind80m        = tableRows[24]
const rowWind10m        = tableRows[25]
const rowDateThermal    = tableRows[26]
const rowTimeThermal    = tableRows[27]
const rowVVel500        = tableRows[28]
const rowVVel550        = tableRows[29]
const rowVVel600        = tableRows[30]
const rowVVel650        = tableRows[31]
const rowVVel700        = tableRows[32]
const rowVVel750        = tableRows[33]
const rowVVel800        = tableRows[34]
const rowVVel850        = tableRows[35]
const rowVVel900        = tableRows[36]
const rowVVel950        = tableRows[37]
const rowPressureZone   = tableRows[38]
var forecastTableBuilt = false  /* Only build the table data cells the first time the function is called */

// Get forecast data for site
async function siteForecast(site) {

    // Un-hide all wind and vvel rows in case a previous forecast hid those below surface + 10m
    rowWind950.style.display = rowVVel950.style.display = `table-row`
    rowWind900.style.display = rowVVel900.style.display = `table-row`
    rowWind850.style.display = rowVVel850.style.display = `table-row`
    rowWind800.style.display = rowVVel800.style.display = `table-row`
    rowWind750.style.display = rowVVel750.style.display = `table-row`
    rowWind700.style.display = rowVVel700.style.display = `table-row`
    rowWind650.style.display = rowVVel650.style.display = `table-row`
    rowWind600.style.display = rowVVel600.style.display = `table-row`
    rowWind550.style.display = rowVVel550.style.display = `table-row`
    rowWind500.style.display = rowVVel500.style.display = `table-row`

    // If there was a previous site forecast, delete all of the previous cells except for column 0 (prototype cells).
    // This approach is taken to prevent any issues if different forecasts have a different number of hourly forecasts
    // or if the days cover a different number of hourly forecast (colspan for the header).
    // It also ensure no leftover data is displayed.
    var rows = tableID.rows
    for (var i = 0; i < rows.length; i++) {

        // Un-hide and reset header row in case it was updated to group forecasts by date
        rows[i].cells.colSpan = 1
        rows[i].style.display = `table-row`

         // Delete cells after column 0
        var cells = rows[i].cells
        for (var j = cells.length - 1; j > 0; j--) {
            rows[i].deleteCell(j);  // delete the cell
        }
    }

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
    "temperature_950hPa,temperature_900hPa,temperature_850hPa,temperature_800hPa,temperature_750hPa,temperature_700hPa,temperature_650hPa,temperature_600hPa,temperature_550hPa,temperature_500hPa," +
    "dewpoint_950hPa,dewpoint_900hPa,dewpoint_850hPa,dewpoint_800hPa,dewpoint_750hPa,dewpoint_700hPa,dewpoint_650hPa,dewpoint_600hPa,dewpoint_550hPa,dewpoint_500hPa," +
    "windspeed_950hPa,windspeed_900hPa,windspeed_850hPa,windspeed_800hPa,windspeed_750hPa,windspeed_700hPa,windspeed_650hPa,windspeed_600hPa,windspeed_550hPa,windspeed_500hPa," +
    "winddirection_950hPa,winddirection_900hPa,winddirection_850hPa,winddirection_800hPa,winddirection_750hPa,winddirection_700hPa,winddirection_650hPa,winddirection_600hPa,winddirection_550hPa,winddirection_500hPa," +
    "vertical_velocity_950hPa,vertical_velocity_900hPa,vertical_velocity_850hPa,vertical_velocity_800hPa,vertical_velocity_750hPa,vertical_velocity_700hPa,vertical_velocity_650hPa,vertical_velocity_600hPa,vertical_velocity_550hPa,vertical_velocity_500hPa," +
    "geopotential_height_950hPa,geopotential_height_900hPa,geopotential_height_850hPa,geopotential_height_800hPa,geopotential_height_750hPa,geopotential_height_700hPa,geopotential_height_650hPa,geopotential_height_600hPa,geopotential_height_550hPa,geopotential_height_500hPa" +
    "&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timezone=America%2FDenver"

    var height_950_sum = 0
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

                        // Create a new column (e.g., cell for each row) to store the current hourly forecast
                        // (only create on the first call; otherwise reset the column span for headers)
                        for (let rowi=0; rowi<tableRows.length; rowi++) {
                            var tableData = document.createElement(`td`)
                            tableData.id = tableRows[rowi].id + '-' + i
                            tableRows[rowi].appendChild(tableData)
                        }

                        // Convert 24 hour format to 12 hour format and display
                        var DisplayHour = ''
                        if ( formattedHour > 12 ) { DisplayHour = (formattedHour - 12).toString() + 'pm' } 
                        else if ( formattedHour == 12 ) { DisplayHour = formattedHour.toString() + 'pm' } 
                        else { DisplayHour = formattedHour.toString() + 'am' }
                        rowTime.childNodes[forecastCount].innerText = DisplayHour
                        rowTimeThermal.childNodes[forecastCount].innerText = DisplayHour
                        rowTimeWind.childNodes[forecastCount].innerText = DisplayHour

                        // Determine weather code based on value and, if it shows as cloudy, then based on cloud coverage %
                        var weatherCodeValue = forecastData.hourly.weathercode[i]
                        if (    forecastData.hourly.weathercode[i] === 1 || 
                                forecastData.hourly.weathercode[i] === 2 || 
                                forecastData.hourly.weathercode[i] === 3 ) {
                            if ( forecastData.hourly.cloudcover[i] < 25 ) { weatherCodeValue = 0 }      // Sunny
                            else if ( forecastData.hourly.cloudcover[i] > 75 ) { weatherCodeValue = 2 } // Cloudy
                            else { weatherCodeValue = 1 }                                               // Partly cloudy
                        }
                        rowWeatherCode.childNodes[forecastCount].innerHTML = `<img src="prod/images/weather/` + weatherCodes[weatherCodeValue][1].Image + `.png" width="80">`

                        // Set value and color for CAPE
                        var CAPEvalue = forecastData.hourly.cape[i]
                        rowCAPE.childNodes[forecastCount].innerText = CAPEvalue
                        rowCAPE.childNodes[forecastCount].style.color = getCAPEColor(CAPEvalue) 

                        // Set color and value for LI
                        var LIvalue = forecastData.hourly.lifted_index[i]
                        rowLI.childNodes[forecastCount].innerText = Math.round(LIvalue)
                        rowLI.childNodes[forecastCount].style.color = getLIColor(LIvalue)

                        // Set value and color for K-index
                        var KIvalue = getKIndex (parseFloat(forecastData.hourly.temperature_850hPa[i]), parseFloat(forecastData.hourly.temperature_700hPa[i]),
                            parseFloat(forecastData.hourly.temperature_500hPa[i]), parseFloat(forecastData.hourly.dewpoint_850hPa[i]), parseFloat(forecastData.hourly.dewpoint_700hPa[i]))
                        rowKI.childNodes[forecastCount].innerText = Math.round(KIvalue)
                        rowKI.childNodes[forecastCount].style.color = getKIndexColor(KIvalue)

                        // Set color and display vertical velocity at each pressure level
                        rowVVel500.childNodes[forecastCount].innerText = forecastData.hourly.vertical_velocity_500hPa[i]
                        rowVVel500.childNodes[forecastCount].style.color = getVVelColor(forecastData.hourly.vertical_velocity_500hPa[i])
                        rowVVel550.childNodes[forecastCount].innerText = forecastData.hourly.vertical_velocity_550hPa[i]
                        rowVVel550.childNodes[forecastCount].style.color = getVVelColor(forecastData.hourly.vertical_velocity_550hPa[i])
                        rowVVel600.childNodes[forecastCount].innerText = forecastData.hourly.vertical_velocity_600hPa[i]
                        rowVVel600.childNodes[forecastCount].style.color = getVVelColor(forecastData.hourly.vertical_velocity_600hPa[i])
                        rowVVel650.childNodes[forecastCount].innerText = forecastData.hourly.vertical_velocity_650hPa[i]
                        rowVVel650.childNodes[forecastCount].style.color = getVVelColor(forecastData.hourly.vertical_velocity_650hPa[i])
                        rowVVel700.childNodes[forecastCount].innerText = forecastData.hourly.vertical_velocity_700hPa[i]
                        rowVVel700.childNodes[forecastCount].style.color = getVVelColor(forecastData.hourly.vertical_velocity_700hPa[i])
                        rowVVel750.childNodes[forecastCount].innerText = forecastData.hourly.vertical_velocity_750hPa[i]
                        rowVVel750.childNodes[forecastCount].style.color = getVVelColor(forecastData.hourly.vertical_velocity_750hPa[i])
                        rowVVel800.childNodes[forecastCount].innerText = forecastData.hourly.vertical_velocity_800hPa[i]
                        rowVVel800.childNodes[forecastCount].style.color = getVVelColor(forecastData.hourly.vertical_velocity_800hPa[i])
                        rowVVel850.childNodes[forecastCount].innerText = forecastData.hourly.vertical_velocity_850hPa[i]
                        rowVVel850.childNodes[forecastCount].style.color = getVVelColor(forecastData.hourly.vertical_velocity_850hPa[i])
                        rowVVel900.childNodes[forecastCount].innerText = forecastData.hourly.vertical_velocity_900hPa[i]
                        rowVVel900.childNodes[forecastCount].style.color = getVVelColor(forecastData.hourly.vertical_velocity_900hPa[i])
                        rowVVel950.childNodes[forecastCount].innerText = forecastData.hourly.vertical_velocity_950hPa[i]
                        rowVVel950.childNodes[forecastCount].style.color = getVVelColor(forecastData.hourly.vertical_velocity_950hPa[i])

                        // Convert pressure from hPa to inHg and find pressure zone
                        const forecastAlti = parseFloat(forecastData.hourly.pressure_msl[i]).toFixed(2) / 33.863886666667
                        const forecastTemp = Math.round(forecastData.hourly.temperature_2m[i])
                        var forecastZone = calculateZone(forecastAlti, forecastTemp)
                        const forecastZoneColor = getZoneColor(forecastZone)
                        forecastZone = forecastZone===0 ? '&#9471;' : (forecastZone==='LoP') ? 'LoP' : `&#1010${forecastZone+1}`
                        rowPressureZone.childNodes[forecastCount].innerHTML = forecastZone
                        rowPressureZone.childNodes[forecastCount].style.fontWeight = "bold";
                        rowPressureZone.childNodes[forecastCount].style.color = forecastZoneColor

                        // Display cloud cover (display '-' if clouds are 0%)
                        rowCloudCover       .childNodes[forecastCount].innerText = (forecastData.hourly.cloudcover[i]>0) ? forecastData.hourly.cloudcover[i] : '-'
                        rowCloudCoverLow    .childNodes[forecastCount].innerText = (forecastData.hourly.cloudcover_low[i]>0) ? forecastData.hourly.cloudcover_low[i] : '-'
                        rowCloudCoverMid    .childNodes[forecastCount].innerText = (forecastData.hourly.cloudcover_mid[i]>0) ? forecastData.hourly.cloudcover_mid[i] : '-'
                        rowCloudCoverHigh   .childNodes[forecastCount].innerText = (forecastData.hourly.cloudcover_high[i]>0) ? forecastData.hourly.cloudcover_high[i] : '-'

                        // Display surface temp and precip probability %
                        rowTemp2m           .childNodes[forecastCount].innerText = Math.round(forecastData.hourly.temperature_2m[i]) + `\u00B0`
                        rowPrecipProb       .childNodes[forecastCount].innerText = (forecastData.hourly.precipitation_probability[i]>0) ? forecastData.hourly.precipitation_probability[i] : '-'
                        rowPrecipProb       .childNodes[forecastCount].style.color = getPrecipProbColor(forecastData.hourly.precipitation_probability[i])

                        // Build and display wind forecast values at each pressure level (and surface levels)
                        var fullWindDisplay = ''
                        fullWindDisplay = buildWindDisplay(forecastData.hourly.windspeed_500hPa[i], forecastData.hourly.winddirection_500hPa[i], 0, detailSiteData.SiteType)
                        rowWind500      .childNodes[forecastCount].innerHTML = fullWindDisplay.windDisplay
                        rowWind500      .childNodes[forecastCount].getElementsByClassName("rotatedWindDir")[0].style.transform = fullWindDisplay.windDirTransform
                        fullWindDisplay = buildWindDisplay(forecastData.hourly.windspeed_550hPa[i], forecastData.hourly.winddirection_550hPa[i], 0, detailSiteData.SiteType)
                        rowWind550      .childNodes[forecastCount].innerHTML = fullWindDisplay.windDisplay
                        rowWind550      .childNodes[forecastCount].getElementsByClassName("rotatedWindDir")[0].style.transform = fullWindDisplay.windDirTransform
                        fullWindDisplay = buildWindDisplay(forecastData.hourly.windspeed_600hPa[i], forecastData.hourly.winddirection_600hPa[i], 0, detailSiteData.SiteType)
                        rowWind600      .childNodes[forecastCount].innerHTML = fullWindDisplay.windDisplay
                        rowWind600      .childNodes[forecastCount].getElementsByClassName("rotatedWindDir")[0].style.transform = fullWindDisplay.windDirTransform
                        fullWindDisplay = buildWindDisplay(forecastData.hourly.windspeed_650hPa[i], forecastData.hourly.winddirection_650hPa[i], 0, detailSiteData.SiteType)
                        rowWind650      .childNodes[forecastCount].innerHTML = fullWindDisplay.windDisplay
                        rowWind650      .childNodes[forecastCount].getElementsByClassName("rotatedWindDir")[0].style.transform = fullWindDisplay.windDirTransform
                        fullWindDisplay = buildWindDisplay(forecastData.hourly.windspeed_700hPa[i], forecastData.hourly.winddirection_700hPa[i], 0, detailSiteData.SiteType)
                        rowWind700      .childNodes[forecastCount].innerHTML = fullWindDisplay.windDisplay
                        rowWind700      .childNodes[forecastCount].getElementsByClassName("rotatedWindDir")[0].style.transform = fullWindDisplay.windDirTransform
                        fullWindDisplay = buildWindDisplay(forecastData.hourly.windspeed_750hPa[i], forecastData.hourly.winddirection_750hPa[i], 0, detailSiteData.SiteType)
                        rowWind750      .childNodes[forecastCount].innerHTML = fullWindDisplay.windDisplay
                        rowWind750      .childNodes[forecastCount].getElementsByClassName("rotatedWindDir")[0].style.transform = fullWindDisplay.windDirTransform
                        fullWindDisplay = buildWindDisplay(forecastData.hourly.windspeed_800hPa[i], forecastData.hourly.winddirection_800hPa[i], 0, detailSiteData.SiteType)
                        rowWind800      .childNodes[forecastCount].innerHTML = fullWindDisplay.windDisplay
                        rowWind800      .childNodes[forecastCount].getElementsByClassName("rotatedWindDir")[0].style.transform = fullWindDisplay.windDirTransform
                        fullWindDisplay = buildWindDisplay(forecastData.hourly.windspeed_850hPa[i], forecastData.hourly.winddirection_850hPa[i], 0, detailSiteData.SiteType)
                        rowWind850      .childNodes[forecastCount].innerHTML = fullWindDisplay.windDisplay
                        rowWind850      .childNodes[forecastCount].getElementsByClassName("rotatedWindDir")[0].style.transform = fullWindDisplay.windDirTransform
                        fullWindDisplay = buildWindDisplay(forecastData.hourly.windspeed_900hPa[i], forecastData.hourly.winddirection_900hPa[i], 0, detailSiteData.SiteType)
                        rowWind900      .childNodes[forecastCount].innerHTML = fullWindDisplay.windDisplay
                        rowWind900      .childNodes[forecastCount].getElementsByClassName("rotatedWindDir")[0].style.transform = fullWindDisplay.windDirTransform
                        fullWindDisplay = buildWindDisplay(forecastData.hourly.windspeed_950hPa[i], forecastData.hourly.winddirection_950hPa[i], 0, detailSiteData.SiteType)
                        rowWind950      .childNodes[forecastCount].innerHTML = fullWindDisplay.windDisplay
                        rowWind950      .childNodes[forecastCount].getElementsByClassName("rotatedWindDir")[0].style.transform = fullWindDisplay.windDirTransform                        
                        fullWindDisplay = buildWindDisplay(forecastData.hourly.windspeed_80m[i], forecastData.hourly.winddirection_80m[i], 0, detailSiteData.SiteType)
                        rowWind80m      .childNodes[forecastCount].innerHTML = fullWindDisplay.windDisplay
                        rowWind80m      .childNodes[forecastCount].getElementsByClassName("rotatedWindDir")[0].style.transform = fullWindDisplay.windDirTransform
                        fullWindDisplay = buildWindDisplay(forecastData.hourly.windspeed_10m[i], forecastData.hourly.winddirection_10m[i], 0, detailSiteData.SiteType)
                        rowWind10m      .childNodes[forecastCount].innerHTML = fullWindDisplay.windDisplay
                        rowWind10m      .childNodes[forecastCount].getElementsByClassName("rotatedWindDir")[0].style.transform = fullWindDisplay.windDirTransform

                        // If date is the same as the prior column, merge the cells
                        if ( formattedDate === previousDate ) {
                            rowDate.childNodes[previousDateStart].colSpan = rowDate.childNodes[previousDateStart].colSpan + 1
                            rowDate.childNodes[forecastCount].style.display = `none`
                            rowDateThermal.childNodes[previousDateStart].colSpan = rowDateThermal.childNodes[previousDateStart].colSpan + 1
                            rowDateThermal.childNodes[forecastCount].style.display = `none`
                            rowDateWind.childNodes[previousDateStart].colSpan = rowDateWind.childNodes[previousDateStart].colSpan + 1
                            rowDateWind.childNodes[forecastCount].style.display = `none`
                        } else
                        {
                            rowDate.childNodes[forecastCount].innerText = formattedDate
                            rowDateThermal.childNodes[forecastCount].innerText = formattedDate
                            rowDateWind.childNodes[forecastCount].innerText = formattedDate

                            previousDateStart = forecastCount
                            previousDate = formattedDate

                            // Set a distinct border when the date changes for date/time header rows and all data rows
                            for (let rowi=1; rowi<tableRows.length; rowi++) {
                                tableRows[rowi].childNodes[forecastCount-1].style.borderRight = "2px solid yellow"
                            }    
                            // Remove yellow border for date rows only
                            rowDateThermal.childNodes[forecastCount-1].style.borderRight = "2px solid black"
                            rowDateWind.childNodes[forecastCount-1].style.borderRight = "2px solid black"
                        }

                        // Add up the geopotential height for each pressure (will be used to calculate an average below)
                        height_950_sum = height_950_sum + Number(forecastData.hourly.geopotential_height_950hPa[i])
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

            // Calculate average geopotential heights
            var wind500Alt = height_500_sum / forecastCount
            var wind550Alt = height_550_sum / forecastCount
            var wind600Alt = height_600_sum / forecastCount
            var wind650Alt = height_650_sum / forecastCount
            var wind700Alt = height_700_sum / forecastCount
            var wind750Alt = height_750_sum / forecastCount
            var wind800Alt = height_800_sum / forecastCount
            var wind850Alt = height_850_sum / forecastCount
            var wind900Alt = height_900_sum / forecastCount
            var wind950Alt = height_950_sum / forecastCount
          
            // Display average geopotential heights as row headers for wind and vvel (and displayed with commas)
            rowWind500.childNodes[0].innerText = rowVVel500.childNodes[0].innerText = Math.round(wind500Alt/1000) + 'k ft'
            rowWind550.childNodes[0].innerText = rowVVel550.childNodes[0].innerText = Math.round(wind550Alt/1000) + 'k ft'
            rowWind600.childNodes[0].innerText = rowVVel600.childNodes[0].innerText = Math.round(wind600Alt/1000) + 'k ft'
            rowWind650.childNodes[0].innerText = rowVVel650.childNodes[0].innerText = Math.round(wind650Alt/1000) + 'k ft'
            rowWind700.childNodes[0].innerText = rowVVel700.childNodes[0].innerText = Math.round(wind700Alt/1000) + 'k ft'
            rowWind750.childNodes[0].innerText = rowVVel750.childNodes[0].innerText = Math.round(wind750Alt/1000) + 'k ft'
            rowWind800.childNodes[0].innerText = rowVVel800.childNodes[0].innerText = Math.round(wind800Alt/1000) + 'k ft'
            rowWind850.childNodes[0].innerText = rowVVel850.childNodes[0].innerText = Math.round(wind850Alt/1000) + 'k ft'
            rowWind900.childNodes[0].innerText = rowVVel900.childNodes[0].innerText = Math.round(wind900Alt/1000) + 'k ft'
            rowWind950.childNodes[0].innerText = rowVVel950.childNodes[0].innerText = Math.round(wind950Alt/1000) + 'k ft'

            // Hide wind and vvel reading rows where the altitude is less than surface + 10m
            var surfaceAlt10m =  (forecastData.elevation + 10) * 3.28084  // converts meters to feet
            if ( wind950Alt <= surfaceAlt10m ) { rowWind950.style.display = rowVVel950.style.display = `none` }
            if ( wind900Alt <= surfaceAlt10m ) { rowWind900.style.display = rowVVel900.style.display = `none` }
            if ( wind850Alt <= surfaceAlt10m ) { rowWind850.style.display = rowVVel850.style.display = `none` }
            if ( wind800Alt <= surfaceAlt10m ) { rowWind800.style.display = rowVVel800.style.display = `none` }
            if ( wind750Alt <= surfaceAlt10m ) { rowWind750.style.display = rowVVel750.style.display = `none` }
            if ( wind700Alt <= surfaceAlt10m ) { rowWind700.style.display = rowVVel700.style.display = `none` }
            if ( wind650Alt <= surfaceAlt10m ) { rowWind650.style.display = rowVVel650.style.display = `none` }
            if ( wind600Alt <= surfaceAlt10m ) { rowWind600.style.display = rowVVel600.style.display = `none` }
            if ( wind550Alt <= surfaceAlt10m ) { rowWind550.style.display = rowVVel550.style.display = `none` }
            if ( wind500Alt <= surfaceAlt10m ) { rowWind500.style.display = rowVVel500.style.display = `none` }

        } catch (error) { 
            console.log('Error processing forecastData: ' + error )
        }
    }
}

function getVVelColor ( vvel ) {
    if (vvel < 0) {return 'white'}
    else if (vvel < 3 ) {return wwGrn}
    else if (vvel < 4 ) {return wwYlw}
    else if (vvel < 6 ) {return wwOrg}
    else if (vvel >= 6 ) {return wwRed}
}

function getPrecipProbColor ( precipProb ) {
    if (precipProb < 10) {return wwGrn}
    else if (precipProb < 30 ) {return wwYlw}
    else if (precipProb < 50 ) {return wwOrg}
    else if (precipProb >= 50 ) {return wwRed}
}

function getCAPEColor ( CAPEvalue ) {
/* NEED TO VALIDATE VALUES; XCSkies is very different.
    CAPE below 0: Stable.
    CAPE = 0 to 1000: Marginally unstable.
    CAPE = 1000 to 2500: Moderately unstable.
    CAPE = 2500 to 3500: Very unstable.
    CAPE above 3500-4000: Extremely unstable.
This function uses Lisa V's guidance isntead as below:
*/
    if (CAPEvalue < 300) {return wwGrn}
    else if (CAPEvalue < 600 ) {return wwYlw}
    else if (CAPEvalue < 800) {return wwOrg}
    else if (CAPEvalue >= 800) {return wwRed}
}

function getLIColor ( LIvalue ) {
/*  XCSkies references wikipedia as follows:
    LI 6 or Greater, Very Stable Conditions
    LI Between 1 and 6 : Stable Conditions, Thunderstorms Not Likely
    LI Between 0 and -2 : Slightly Unstable, Thunderstorms Possible, With Lifting Mechanism (i.e., cold front, daytime heating, ...)
    LI Between -2 and -6 : Unstable, Thunderstorms Likely, Some Severe With Lifting Mechanism
    LI Less Than -6: Very Unstable, Severe Thunderstorms Likely With Lifting Mechanism
    For safe and comfortable soaring, a typical rule is that an LI value of anything less than -2 is not going to be a very fun day. 
    Typical ranges of 2 through -2 tend to be good fair weather soaring conditions in areas of higher elevations.                       */
    if (LIvalue > 6) {return 'white'}
    else if (LIvalue > 1 ) {return wwGrn}
    else if (LIvalue > -2 ) {return wwYlw}
    else if (LIvalue > -6 ) {return wwOrg}
    else if (LIvalue <= -6 ) {return wwRed}
}    

function getKIndex ( temp850, temp700, temp500, td850, td700 ) {
/* From Wikipedia:
    K = (T850 - T500) + Td850 - (T700 - Td700)
    T = temp (C) at pressure level
    Td = dew point temp (C) at pressure level
*/
    return ( (tempFtoC(temp850)-tempFtoC(temp500)) + tempFtoC(td850) - (tempFtoC(temp700)-tempFtoC(td700)) )
}

function getKIndexColor ( KIndex ) {
/* From Wikipedia:
    K-index value (in °C)	Thunderstorm Probability            Lisa V's ratings
    Less than 20	        None                                Below -10 is a stable airmass; 10 to +20 is best for soaring
    20 to 25	            Isolated thunderstorms              >20 is likely overdevelopment
    26 to 30	            Widely scattered thunderstorms      >25 is very likely overdevelopment
    31 to 35	            Scattered thunderstorms             >30 will overdevelop
    Above 35	            Numerous thunderstorms
*/
    if (KIndex < -10) {return 'white'}
    else if (KIndex < 20 ) {return wwGrn}
    else if (KIndex < 25 ) {return wwYlw}
    else if (KIndex < 30 ) {return wwOrg}
    else if (KIndex >= 30 ) {return wwRed}
}

function tempFtoC ( tempF ) {
    return ( tempF - 32 ) / 1.8
}

function buildWindDisplay ( windSpeed, windDir, windGust, siteType )
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