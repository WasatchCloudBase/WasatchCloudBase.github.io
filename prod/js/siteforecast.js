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
const rowWind10m        = tableRows[24]
const rowDateThermal    = tableRows[25]
const rowTimeThermal    = tableRows[26]
const rowVVel500        = tableRows[27]
const rowVVel550        = tableRows[28]
const rowVVel600        = tableRows[29]
const rowVVel650        = tableRows[30]
const rowVVel700        = tableRows[31]
const rowVVel750        = tableRows[32]
const rowVVel800        = tableRows[33]
const rowVVel850        = tableRows[34]
const rowVVel900        = tableRows[35]
const rowVVel950        = tableRows[36]
const topOfLift         = tableRows[37]
const cloudBase         = tableRows[38]
const rowPressureZone   = tableRows[39]
var forecastTableBuilt = false  /* Only build the table data cells the first time the function is called */

// Global variables for top of lift and cloudbase for each hourly forecast
var topOfLiftAlt = ``
var cloudBaseAlt = ``

// Get forecast data for site
async function siteForecast(site) {

    // Show 'loading' image
    document.getElementById('Loading Image').style.display = 'block' 

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
    "&hourly=temperature_2m,relativehumidity_2m,dewpoint_2m,pressure_msl,surface_pressure," +
    "precipitation,precipitation_probability,weathercode,cloudcover,cloudcover_low,cloudcover_mid,cloudcover_high,cape,lifted_index," +
    "windspeed_10m,windspeed_80m,winddirection_10m,windgusts_10m," +
    "temperature_950hPa,temperature_900hPa,temperature_850hPa,temperature_800hPa,temperature_750hPa,temperature_700hPa,temperature_650hPa,temperature_600hPa,temperature_550hPa,temperature_500hPa," +
    "dewpoint_950hPa,dewpoint_900hPa,dewpoint_850hPa,dewpoint_800hPa,dewpoint_750hPa,dewpoint_700hPa,dewpoint_650hPa,dewpoint_600hPa,dewpoint_550hPa,dewpoint_500hPa," +
    "windspeed_950hPa,windspeed_900hPa,windspeed_850hPa,windspeed_800hPa,windspeed_750hPa,windspeed_700hPa,windspeed_650hPa,windspeed_600hPa,windspeed_550hPa,windspeed_500hPa," +
    "winddirection_950hPa,winddirection_900hPa,winddirection_850hPa,winddirection_800hPa,winddirection_750hPa,winddirection_700hPa,winddirection_650hPa,winddirection_600hPa,winddirection_550hPa,winddirection_500hPa," +
    "geopotential_height_950hPa,geopotential_height_900hPa,geopotential_height_850hPa,geopotential_height_800hPa,geopotential_height_750hPa,geopotential_height_700hPa,geopotential_height_650hPa,geopotential_height_600hPa,geopotential_height_550hPa,geopotential_height_500hPa" +
    "&current_weather=true&windspeed_unit=mph&precipitation_unit=inch&timezone=America%2FDenver"

    var height_950_min = 99999
    var height_900_min = 99999
    var height_850_min = 99999
    var height_800_min = 99999
    var height_750_min = 99999
    var height_700_min = 99999
    var height_650_min = 99999
    var height_600_min = 99999
    var height_550_min = 99999
    var height_500_min = 99999
    var forecastCount = 0
    var previousDate = ``
    var previousDateStart = ``
    var surfaceAlt = ``
    var surfaceAlt10m = ``

    var response = await fetch(forecast_url)
    var forecastData = await response.json()
    if (forecastData) {
        try {

            // Calculate forecast altitude (to display) and altitude + 10m to filter winds/lift aloft
            surfaceAlt = Math.round( mToFt(forecastData.elevation) )
            surfaceAlt10m = Math.round( mToFt(forecastData.elevation + 10) )
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
                        var weatherCodeValue = updateWeatherCode (forecastData.hourly.weathercode[i], forecastData.hourly.cloudcover[i], forecastData.hourly.precipitation_probability[i], forecastData.hourly.temperature_2m[i])
                        rowWeatherCode.childNodes[forecastCount].innerHTML = `<img src="prod/images/weather/` + weatherCodes[weatherCodeValue][1].Image + `.png" width="80">`

                        // Set value and color for CAPE
                        var CAPEvalue = (forecastData.hourly.cape[i]>0) ? forecastData.hourly.cape[i] : ''
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

                        // Calculate pressure zone based on converting Surface Pressure to sea level
                        // Note:  This uses forecasted temp, which can create too much variation and inaccurate readings for higher altitudes.
                        //        May be better to find out how to do this using standard conditions.
                        // Altimeter setting = Station Pressure * [ 1 - ( .0065*Alt / [Temp + .0065*Alt + 273.15] ) ] ^-5.257
                        // Station pressure in hPa (aka mb), Alt in m, Temp in C, result is in hPa (so also dividing by 33.863887 to convert to inHG)
                        const forecastAltiSetting = forecastData.hourly.surface_pressure[i] * 
                            (1-((.0065*forecastData.elevation)/(forecastData.hourly.temperature_2m[i] + (.0065*forecastData.elevation) + 273.15)))**(-5.257) / 33.863887
                        const forecastTempC = Math.round(forecastData.hourly.temperature_2m[i])
                        var forecastPressureZone = calculateZone(forecastAltiSetting, tempCtoF(forecastTempC))  // forecastZone uses temp in F; API provided temp is in C
                        const forecastPressureZoneColor = getZoneColor(forecastPressureZone)
                        forecastPressureZone = forecastPressureZone===0 ? '&#9471;' : (forecastPressureZone==='LoP') ? 'LoP' : `&#1010${forecastPressureZone+1}`
                        rowPressureZone.childNodes[forecastCount].innerHTML = forecastPressureZone
                        rowPressureZone.childNodes[forecastCount].style.fontWeight = "bold";
                        rowPressureZone.childNodes[forecastCount].style.color = forecastPressureZoneColor

                        // Display cloud cover (display '-' if clouds are 0%)
                        rowCloudCover       .childNodes[forecastCount].innerText = (forecastData.hourly.cloudcover[i]>0) ? forecastData.hourly.cloudcover[i] : ''
                        rowCloudCoverLow    .childNodes[forecastCount].innerText = (forecastData.hourly.cloudcover_low[i]>0) ? forecastData.hourly.cloudcover_low[i] : ''
                        rowCloudCoverMid    .childNodes[forecastCount].innerText = (forecastData.hourly.cloudcover_mid[i]>0) ? forecastData.hourly.cloudcover_mid[i] : ''
                        rowCloudCoverHigh   .childNodes[forecastCount].innerText = (forecastData.hourly.cloudcover_high[i]>0) ? forecastData.hourly.cloudcover_high[i] : ''

                        // Display surface temp and set text color
                        const TempF = Math.round(tempCtoF(forecastData.hourly.temperature_2m[i]))
                        rowTemp2m           .childNodes[forecastCount].innerText = TempF + `\u00B0`
                        rowTemp2m           .childNodes[forecastCount].style.color = getTempColor (TempF)

                        // Display precip probability % and set text color
                        rowPrecipProb       .childNodes[forecastCount].innerText = (forecastData.hourly.precipitation_probability[i]>0) ? forecastData.hourly.precipitation_probability[i] : ''
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
                        fullWindDisplay = buildWindDisplay(forecastData.hourly.windspeed_10m[i], forecastData.hourly.winddirection_10m[i], forecastData.hourly.windgusts_10m[i], detailSiteData.SiteType)
                        rowWind10m      .childNodes[forecastCount].innerHTML = fullWindDisplay.windDisplay
                        rowWind10m      .childNodes[forecastCount].getElementsByClassName("rotatedWindDir")[0].style.transform = fullWindDisplay.windDirTransform

                        // Determine lift (only for altitudes above surface + 10m)
                        var priorThermalDPTemp = Number(forecastData.hourly.temperature_2m[i]) - thermalTriggerTempDiff
                        var thermalObject = {}
                        var priorAlt = 0
                        var aboveTop = ``
                        topOfLiftAlt = ``
                        cloudBaseAlt = ``
                        // Determine lift for 950 hPa level
                        // Note:  getThermalInfo call for all levels except 950hPa include a parameter from the PRIOR pressure level (for prior amb DP temp)
                        if ( !aboveTop ) {
                            thermalObject = getThermalInfo (forecastData.hourly.temperature_950hPa[i], forecastData.hourly.dewpoint_950hPa[i], 
                                    forecastData.hourly.geopotential_height_950hPa[i], priorThermalDPTemp, priorAlt, forecastData.hourly.dewpoint_950hPa[i], surfaceAlt10m)
                            rowVVel950.childNodes[forecastCount].innerText = thermalObject.thermalVelocity
                            rowVVel950.childNodes[forecastCount].style.color = getVVelColor(thermalObject.thermalVelocity)
                            priorThermalDPTemp = thermalObject.thermalDPTemp
                            priorAlt = forecastData.hourly.geopotential_height_950hPa[i]
                            if ( topOfLiftAlt ) {
                                rowVVel950.childNodes[forecastCount].style.borderBottom = rowWind950.childNodes[forecastCount].style.borderBottom = "2px solid teal"
                                aboveTop = true 
                            } 
                        }
                        if ( aboveTop ) { rowVVel950.childNodes[forecastCount].style.backgroundColor = rowWind950.childNodes[forecastCount].style.backgroundColor = "black" } 
                        // Determine lift for 900 hPa level
                        if ( !aboveTop ) {
                            thermalObject = getThermalInfo (forecastData.hourly.temperature_900hPa[i], forecastData.hourly.dewpoint_900hPa[i], 
                                    forecastData.hourly.geopotential_height_900hPa[i], priorThermalDPTemp, priorAlt, forecastData.hourly.dewpoint_950hPa[i], surfaceAlt10m)
                            rowVVel900.childNodes[forecastCount].innerText = thermalObject.thermalVelocity
                            rowVVel900.childNodes[forecastCount].style.color = getVVelColor(thermalObject.thermalVelocity)
                            priorThermalDPTemp = thermalObject.thermalDPTemp
                            priorAlt = forecastData.hourly.geopotential_height_900hPa[i]
                            if ( topOfLiftAlt ) {
                                rowVVel900.childNodes[forecastCount].style.borderBottom = rowWind900.childNodes[forecastCount].style.borderBottom = "2px solid teal"
                                aboveTop = true 
                            } 
                        }
                        if ( aboveTop ) { rowVVel900.childNodes[forecastCount].style.backgroundColor = rowWind900.childNodes[forecastCount].style.backgroundColor = "black" } 
                        // Determine lift for 850 hPa level
                        if ( !aboveTop ) {
                            thermalObject = getThermalInfo (forecastData.hourly.temperature_850hPa[i], forecastData.hourly.dewpoint_850hPa[i], 
                                    forecastData.hourly.geopotential_height_850hPa[i], priorThermalDPTemp, priorAlt, forecastData.hourly.dewpoint_900hPa[i], surfaceAlt10m)
                            rowVVel850.childNodes[forecastCount].innerText = thermalObject.thermalVelocity
                            rowVVel850.childNodes[forecastCount].style.color = getVVelColor(thermalObject.thermalVelocity)
                            priorThermalDPTemp = thermalObject.thermalDPTemp
                            priorAlt = forecastData.hourly.geopotential_height_850hPa[i]
                            if ( topOfLiftAlt ) {
                                rowVVel850.childNodes[forecastCount].style.borderBottom = rowWind850.childNodes[forecastCount].style.borderBottom = "2px solid teal"
                                aboveTop = true 
                            } 
                        }
                        if ( aboveTop ) { rowVVel850.childNodes[forecastCount].style.backgroundColor = rowWind850.childNodes[forecastCount].style.backgroundColor = "black" } 
                        // Determine lift for 800 hPa level
                        if ( !aboveTop ) {
                            thermalObject = getThermalInfo (forecastData.hourly.temperature_800hPa[i], forecastData.hourly.dewpoint_800hPa[i], 
                                    forecastData.hourly.geopotential_height_800hPa[i], priorThermalDPTemp, priorAlt, forecastData.hourly.dewpoint_850hPa[i], surfaceAlt10m)
                            rowVVel800.childNodes[forecastCount].innerText = thermalObject.thermalVelocity
                            rowVVel800.childNodes[forecastCount].style.color = getVVelColor(thermalObject.thermalVelocity)
                            priorThermalDPTemp = thermalObject.thermalDPTemp
                            priorAlt = forecastData.hourly.geopotential_height_800hPa[i]
                            if ( topOfLiftAlt ) {
                                rowVVel800.childNodes[forecastCount].style.borderBottom = rowWind800.childNodes[forecastCount].style.borderBottom = "2px solid teal"
                                aboveTop = true 
                            } 
                        }
                        if ( aboveTop ) { rowVVel800.childNodes[forecastCount].style.backgroundColor = rowWind800.childNodes[forecastCount].style.backgroundColor = "black" } 
                        // Determine lift for 750 hPa level
                        if ( !aboveTop ) {
                            thermalObject = getThermalInfo (forecastData.hourly.temperature_750hPa[i], forecastData.hourly.dewpoint_750hPa[i], 
                                    forecastData.hourly.geopotential_height_750hPa[i], priorThermalDPTemp, priorAlt, forecastData.hourly.dewpoint_800hPa[i], surfaceAlt10m)
                            rowVVel750.childNodes[forecastCount].innerText = thermalObject.thermalVelocity
                            rowVVel750.childNodes[forecastCount].style.color = getVVelColor(thermalObject.thermalVelocity)
                            priorThermalDPTemp = thermalObject.thermalDPTemp
                            priorAlt = forecastData.hourly.geopotential_height_750hPa[i]
                            if ( topOfLiftAlt ) {
                                rowVVel750.childNodes[forecastCount].style.borderBottom = rowWind750.childNodes[forecastCount].style.borderBottom = "2px solid teal"
                                aboveTop = true 
                            } 
                        }
                        if ( aboveTop ) { rowVVel750.childNodes[forecastCount].style.backgroundColor = rowWind750.childNodes[forecastCount].style.backgroundColor = "black" } 
                        // Determine lift for 700 hPa level
                        if ( !aboveTop ) {
                            thermalObject = getThermalInfo (forecastData.hourly.temperature_700hPa[i], forecastData.hourly.dewpoint_700hPa[i], 
                                    forecastData.hourly.geopotential_height_700hPa[i], priorThermalDPTemp, priorAlt, forecastData.hourly.dewpoint_750hPa[i], surfaceAlt10m)
                            rowVVel700.childNodes[forecastCount].innerText = thermalObject.thermalVelocity
                            rowVVel700.childNodes[forecastCount].style.color = getVVelColor(thermalObject.thermalVelocity)
                            priorThermalDPTemp = thermalObject.thermalDPTemp
                            priorAlt = forecastData.hourly.geopotential_height_700hPa[i]
                            if ( topOfLiftAlt ) {
                                rowVVel700.childNodes[forecastCount].style.borderBottom = rowWind700.childNodes[forecastCount].style.borderBottom = "2px solid teal"
                                aboveTop = true 
                            } 
                        }
                        if ( aboveTop ) { rowVVel700.childNodes[forecastCount].style.backgroundColor = rowWind700.childNodes[forecastCount].style.backgroundColor = "black" } 
                        // Determine lift for 650 hPa level
                        if ( !aboveTop ) {
                            thermalObject = getThermalInfo (forecastData.hourly.temperature_650hPa[i], forecastData.hourly.dewpoint_650hPa[i], 
                                    forecastData.hourly.geopotential_height_650hPa[i], priorThermalDPTemp, priorAlt, forecastData.hourly.dewpoint_700hPa[i], surfaceAlt10m)
                            rowVVel650.childNodes[forecastCount].innerText = thermalObject.thermalVelocity
                            rowVVel650.childNodes[forecastCount].style.color = getVVelColor(thermalObject.thermalVelocity)
                            priorThermalDPTemp = thermalObject.thermalDPTemp
                            priorAlt = forecastData.hourly.geopotential_height_650hPa[i]
                            if ( topOfLiftAlt ) {
                                rowVVel650.childNodes[forecastCount].style.borderBottom = rowWind650.childNodes[forecastCount].style.borderBottom = "2px solid teal"
                                aboveTop = true 
                            } 
                        }
                        if ( aboveTop ) { rowVVel650.childNodes[forecastCount].style.backgroundColor = rowWind650.childNodes[forecastCount].style.backgroundColor = "black" } 
                        // Determine lift for 600 hPa level
                        if ( !aboveTop ) {
                            thermalObject = getThermalInfo (forecastData.hourly.temperature_600hPa[i], forecastData.hourly.dewpoint_600hPa[i], 
                                    forecastData.hourly.geopotential_height_600hPa[i], priorThermalDPTemp, priorAlt, forecastData.hourly.dewpoint_650hPa[i], surfaceAlt10m)
                            rowVVel600.childNodes[forecastCount].innerText = thermalObject.thermalVelocity
                            rowVVel600.childNodes[forecastCount].style.color = getVVelColor(thermalObject.thermalVelocity)
                            priorThermalDPTemp = thermalObject.thermalDPTemp
                            priorAlt = forecastData.hourly.geopotential_height_600hPa[i]
                            if ( topOfLiftAlt ) {
                                rowVVel600.childNodes[forecastCount].style.borderBottom = rowWind600.childNodes[forecastCount].style.borderBottom = "2px solid teal"
                                aboveTop = true 
                            } 
                        }
                        if ( aboveTop ) { rowVVel600.childNodes[forecastCount].style.backgroundColor = rowWind600.childNodes[forecastCount].style.backgroundColor = "black" } 
                        // Determine lift for 550 hPa level
                        if ( !aboveTop ) {
                            thermalObject = getThermalInfo (forecastData.hourly.temperature_550hPa[i], forecastData.hourly.dewpoint_550hPa[i], 
                                    forecastData.hourly.geopotential_height_550hPa[i], priorThermalDPTemp, priorAlt, forecastData.hourly.dewpoint_600hPa[i], surfaceAlt10m)
                            rowVVel550.childNodes[forecastCount].innerText = thermalObject.thermalVelocity
                            rowVVel550.childNodes[forecastCount].style.color = getVVelColor(thermalObject.thermalVelocity)
                            priorThermalDPTemp = thermalObject.thermalDPTemp
                            priorAlt = forecastData.hourly.geopotential_height_550hPa[i]
                            if ( topOfLiftAlt ) {
                                rowVVel550.childNodes[forecastCount].style.borderBottom = rowWind550.childNodes[forecastCount].style.borderBottom = "2px solid teal"
                                aboveTop = true 
                            } 
                        }
                        if ( aboveTop ) { rowVVel550.childNodes[forecastCount].style.backgroundColor = rowWind550.childNodes[forecastCount].style.backgroundColor = "black" } 
                        // Determine lift for 500 hPa level
                        if ( !aboveTop ) {
                            thermalObject = getThermalInfo (forecastData.hourly.temperature_500hPa[i], forecastData.hourly.dewpoint_500hPa[i], 
                                    forecastData.hourly.geopotential_height_500hPa[i], priorThermalDPTemp, priorAlt, forecastData.hourly.dewpoint_550hPa[i], surfaceAlt10m)
                            rowVVel500.childNodes[forecastCount].innerText = thermalObject.thermalVelocity
                            rowVVel500.childNodes[forecastCount].style.color = getVVelColor(thermalObject.thermalVelocity)
                            priorThermalDPTemp = thermalObject.thermalDPTemp
                            priorAlt = forecastData.hourly.geopotential_height_500hPa[i]
                            if ( topOfLiftAlt ) {
                                rowVVel500.childNodes[forecastCount].style.borderBottom = rowWind500.childNodes[forecastCount].style.borderBottom = "2px solid teal"
                                aboveTop = true 
                            } 
                        }
                        if ( aboveTop ) { rowVVel500.childNodes[forecastCount].style.backgroundColor = rowWind500.childNodes[forecastCount].style.backgroundColor = "black" } 

                        // Display top of lift (rounded to nearest 100 feet)
                        if ( topOfLiftAlt > surfaceAlt10m ) {topOfLift.childNodes[forecastCount].innerText = Math.round(topOfLiftAlt/100)*100/1000 + 'k ft'}
                        // Check if there was still lift at the top of the forecast range, and display a rocket ship
                        else if (thermalObject.thermalVelocity > 0 ) {topOfLift.childNodes[forecastCount].innerHTML = `<img src="prod/images/rocket-3432.png" width="60">`}
                        // Otherwise, there is no lift, and display a sled ride
                        else {  topOfLift.childNodes[forecastCount].innerHTML = `<img src="prod/images/sledride.png" width="80">`
                                topOfLift.childNodes[forecastCount].style.backgroundColor = "black"
                        }

                        
                        // If cloudbase not reached during thermal strength calcs at each pressure level, then calculate forecasted cloudbase
                        // based on surface temperature and dew point gap and standard lapse rate
                        if (!(cloudBaseAlt > 0)) {
                            cloudBaseAlt = mToFt( ( ( forecastData.hourly.temperature_2m[i] - forecastData.hourly.dewpoint_2m[i] ) * cloudbaseLapseRatesDiff ) + ftToM(surfaceAlt) )
                        }
                        // Display cloudbase (if present)
                        if (cloudBaseAlt > 0) {
                            cloudBase.childNodes[forecastCount].innerText = Math.round(cloudBaseAlt/100)*100/1000 + 'k ft'
                        }

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

                        // Update the min geopotential height for each pressure (used to determine which levels to display)
                        height_950_min = Math.min(height_950_min, Number(forecastData.hourly.geopotential_height_950hPa[i]))
                        height_900_min = Math.min(height_900_min, Number(forecastData.hourly.geopotential_height_900hPa[i]))
                        height_850_min = Math.min(height_850_min, Number(forecastData.hourly.geopotential_height_850hPa[i]))
                        height_800_min = Math.min(height_800_min, Number(forecastData.hourly.geopotential_height_800hPa[i]))
                        height_750_min = Math.min(height_750_min, Number(forecastData.hourly.geopotential_height_750hPa[i]))
                        height_700_min = Math.min(height_700_min, Number(forecastData.hourly.geopotential_height_700hPa[i]))
                        height_650_min = Math.min(height_650_min, Number(forecastData.hourly.geopotential_height_650hPa[i]))
                        height_600_min = Math.min(height_600_min, Number(forecastData.hourly.geopotential_height_600hPa[i]))
                        height_550_min = Math.min(height_550_min, Number(forecastData.hourly.geopotential_height_550hPa[i]))
                        height_500_min = Math.min(height_500_min, Number(forecastData.hourly.geopotential_height_500hPa[i]))
                    }
                } catch (error) { 
                    console.log('Eror: ' + error + ' processing hourly forecast data for time: ' + forecastData.hourly.time[i])
                }
            }
          
            // Display geopotential heights as row headers for wind and vvel (and displayed with commas)
            rowWind500.childNodes[0].innerText = rowVVel500.childNodes[0].innerText = Math.round(height_500_min/1000) + 'k ft'
            rowWind550.childNodes[0].innerText = rowVVel550.childNodes[0].innerText = Math.round(height_550_min/1000) + 'k ft'
            rowWind600.childNodes[0].innerText = rowVVel600.childNodes[0].innerText = Math.round(height_600_min/1000) + 'k ft'
            rowWind650.childNodes[0].innerText = rowVVel650.childNodes[0].innerText = Math.round(height_650_min/1000) + 'k ft'
            rowWind700.childNodes[0].innerText = rowVVel700.childNodes[0].innerText = Math.round(height_700_min/1000) + 'k ft'
            rowWind750.childNodes[0].innerText = rowVVel750.childNodes[0].innerText = Math.round(height_750_min/1000) + 'k ft'
            rowWind800.childNodes[0].innerText = rowVVel800.childNodes[0].innerText = Math.round(height_800_min/1000) + 'k ft'
            rowWind850.childNodes[0].innerText = rowVVel850.childNodes[0].innerText = Math.round(height_850_min/1000) + 'k ft'
            rowWind900.childNodes[0].innerText = rowVVel900.childNodes[0].innerText = Math.round(height_900_min/1000) + 'k ft'
            rowWind950.childNodes[0].innerText = rowVVel950.childNodes[0].innerText = Math.round(height_950_min/1000) + 'k ft'

            // Hide wind and vvel reading rows where the min pressure altitude is less than surface + 10m
            if ( height_950_min <= surfaceAlt10m ) { rowWind950.style.display = rowVVel950.style.display = `none` }
            if ( height_900_min <= surfaceAlt10m ) { rowWind900.style.display = rowVVel900.style.display = `none` }
            if ( height_850_min <= surfaceAlt10m ) { rowWind850.style.display = rowVVel850.style.display = `none` }
            if ( height_800_min <= surfaceAlt10m ) { rowWind800.style.display = rowVVel800.style.display = `none` }
            if ( height_750_min <= surfaceAlt10m ) { rowWind750.style.display = rowVVel750.style.display = `none` }
            if ( height_700_min <= surfaceAlt10m ) { rowWind700.style.display = rowVVel700.style.display = `none` }
            if ( height_650_min <= surfaceAlt10m ) { rowWind650.style.display = rowVVel650.style.display = `none` }
            if ( height_600_min <= surfaceAlt10m ) { rowWind600.style.display = rowVVel600.style.display = `none` }
            if ( height_550_min <= surfaceAlt10m ) { rowWind550.style.display = rowVVel550.style.display = `none` }
            if ( height_500_min <= surfaceAlt10m ) { rowWind500.style.display = rowVVel500.style.display = `none` }

        } catch (error) { 
            console.log('Error processing forecastData: ' + error )
        }
    }

    // Hide pressure zone forecast row, as forecast isn't very accurate
    rowPressureZone.style.display = 'none'

    // Hide 'loading' image
    document.getElementById('Loading Image').style.display = 'none' 

}

// Determine weather code based on value and, if it shows as cloudy, then based on cloud coverage %
function updateWeatherCode (originalWeatherCode, cloudCover, precipProbability, temperature) {
    var updatedWeatherCode = originalWeatherCode

    // Make sure there is a valid weather code
    if ( !Number(updatedWeatherCode) ) { updatedWeatherCode = 0 }

    // Update the weather code based on the cloud %
    if (    originalWeatherCode === 0 ||                                // Sunny
            originalWeatherCode === 1 ||                                // Clouds dissolving
            originalWeatherCode === 2 ||                                // Skies unchanged
            originalWeatherCode === 3 ) {                               // Clouds forming
        if ( cloudCover < 25 ) { updatedWeatherCode = 0 }               // Change to sunny
        else if ( cloudCover < 75 ) { updatedWeatherCode = 1 }          // Change to display as partly cloudy
        else if ( cloudCover >= 75 ) { updatedWeatherCode = 3 }         // Change to display as cloudy
    }

    // Update the weather code based on the precip % and rain vs. snow based on temp
    if (    originalWeatherCode === 0 ||                                // Sunny
            originalWeatherCode === 1 ||                                // Clouds dissolving
            originalWeatherCode === 2 ||                                // Skies unchanged
            originalWeatherCode === 3 ) {                               // Clouds forming
        if ( precipProbability < 30 ) {  }                              // No change
        else if ( precipProbability < 70 ) { 
            if ( temperature <= 0 ) { updatedWeatherCode = 85 }        // Change to display as light snow (note that forecast temp is in C)
            else { updatedWeatherCode = 60 }                            // Change to display as light rain
        }
        else if ( precipProbability >= 70 ) {
            if ( temperature <= 0 ) { updatedWeatherCode = 73 }        // Change to display as snow (note that forecast temp is in C)
            else { updatedWeatherCode = 62 }                            // Change to display as rain
        }
    }

    return updatedWeatherCode
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

function getTempColor ( temp ) {
    if (temp <= 32)         {return wwBlue }
    else if (temp < 60 )    {return wwCyan}
    else if (temp < 80 )    {return wwGrn}
    else if (temp < 90 )    {return wwYlw}
    else if (temp < 100 )   {return wwOrg}
    else if (temp >= 100 )  {return wwRed}
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
    return ( (temp850-temp500) + tempFtoC(td850) - (temp700-td700) )
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

function tempCtoF ( tempC ) {
    return ( tempC * 1.8 ) + 32
}

function mToFt ( distance ) {
    return ( distance * 3.28084 )
}

function ftToM ( distance ) {
    return ( distance / 3.28084 )
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
            windDisplay = windDisplay + '&nbsp;<span style="color: ' + windColorDisplay + ';">' + Math.round(windSpeed) + '</span>'
        } else { 
            windDisplay = windDisplay + '<span class="fs-3 fw-normal">Calm</span>'
        }
    }    

    // Determine wind gust speed (hidden if missing)
    if (windGust) {
        var gustColorDisplay = windColor(windGust, siteType)
        if (Math.round(windGust) >= 1) { 
            windDisplay = windDisplay + /* &nbsp; */ '<span id="${displaySpanID}" style="color: ' + gustColorDisplay + ';">g' + Math.round(windGust) + '</span>'
        }
    }
    return { windDisplay, windDirTransform }
}

function getThermalInfo ( ambTemp, ambDPTemp, alt, priorThermalDPTemp, priorAlt, priorAmbDPTemp, surfaceAlt10m ) { // All temps in C, altitudes in feet
/* Returns an object: { thermalVelocity (m/s), 
                        thermalDPTemp (deg C) }
    Also updates global variables if reached:
                        cloudBaseAlt (ft, if reached in this altitude range), 
                        topOfLiftAlt (ft, if reached in this range) }                               */

    // Set return and global variables
    var thermalVelocity = 0
    var thermalDPTemp = priorThermalDPTemp  // default to previous if this altitude isn't calculated below
    var thermalCloudBaseAlt = ``
    var topOfLift = ``

    // Don't process if the current pressure level altitude is not above the surface altitute
    if ( Number(alt) <= Number(surfaceAlt10m) ) { 
        return { thermalVelocity, thermalDPTemp, thermalCloudBaseAlt, topOfLift } }

    // Set the effective prior alt to surface if the prior alt is less than surface
    var effectivePriorAlt = priorAlt
    if ( surfaceAlt10m >= priorAlt ) { effectivePriorAlt = surfaceAlt10m }

    // Check if cloudbase is reached before Top of Lift and DALR can't be used to predict thermal strength (ambient temp doesn't exceed the ambient dew point temp)
    if ( ambTemp - ambDPTemp <= 0 ) {
        // Estimate cloudbase based on the ratio of the ambTemp between the prior and current ambDPTemp (very rough estimate and rounded to 100 feet)
        var altRange = alt - priorAlt
        var CurrAmbTDiff = priorAmbDPTemp - ambTemp
        var totalAmbDPDiff = priorAmbDPTemp - ambDPTemp
        thermalCloudBaseAlt = Math.round((priorAlt + (altRange * CurrAmbTDiff / totalAmbDPDiff))/100)*100
    } else {

        // Calculate the thermal dew point temp (Td)
        // Td = T - (DALR * altChange) where DALR is the thermalLapseRate
        thermalDPTemp = priorThermalDPTemp - ( thermalLapseRate * ftToM(alt - effectivePriorAlt) / 1000 )

        // Check if the thermal is no longer rising (thermal dew point doesn't exceed the ambient dew point)
        if ( thermalDPTemp - ambDPTemp <= 0 ) {
            // Estimate top of lift based on the alt where the thermalDPTemp intersected prior to current ambient air DP (very rough estimate and round to 100 feet)
            var altRange = alt - priorAlt
            var thermalDPDiff = Math.max((priorAmbDPTemp - thermalDPTemp), 0)   // There shouldn't be an inversion in a thermal lapse rate, but just in case
            var totalAmbDiff = Math.max((priorAmbDPTemp - ambDPTemp), 0)        // If there is an inversion in the ambient air, set difference to 0
            if ( thermalDPDiff === 0 ) { topOfLiftAlt = priorAlt }
            else { topOfLiftAlt = priorAlt + (altRange * totalAmbDiff / thermalDPDiff) }

        } else {
            // Calculate the thermal velocity (w)
            // w = thermalVelocityConstant * sqrt [ ((1.1)^(thermalDPTemp - ambDPTemp) - 1) / ((1.1)^(ambTemp - ambDPTemp)-1) ]
            // In other words, thermal velocity will increase if the thermal temp and/or dryness is higher, but increase is reduced based on dryness of ambient air.
            thermalVelocity = thermalVelocityConstant * Math.sqrt( ((1.1)**(thermalDPTemp-ambDPTemp)-1) / ((1.1)**(ambTemp-ambDPTemp)-1) )

            // Adjust to reduce thermal strength near the surface (thermals not yet organized)
            const thermalRampTop = surfaceAlt10m + thermalRampDistance
            if ( effectivePriorAlt <= thermalRampTop ) {
                // Determine how much of the thermal ramp goes into the altitude range being predicted
                var pctOfRampInRange = ( thermalRampTop - effectivePriorAlt ) / thermalRampDistance
                if ( isNaN(pctOfRampInRange) ) { pctOfRampInRange = 0 }
                // Determine how much of the altitude range being predicted is affected by the ramp
                var pctOfRangeImpacted = ( thermalRampTop - effectivePriorAlt ) / ( alt - effectivePriorAlt )
                if ( isNaN(pctOfRangeImpacted) ) { pctOfRangeImpacted = 0 }
                // Determine reduction of average thermal strength in this range
                const thermalReductionFactor = ( thermalRampStartPct / 100 ) * pctOfRampInRange * pctOfRangeImpacted
                // Apply to thermal velocity
                thermalVelocity = thermalVelocity * ( 1 - thermalReductionFactor )
            }
        }
    }   

    // Round thermal velocity, or set to '' if not present or zero
    if ( thermalVelocity > 0 ) { thermalVelocity = Math.round ( thermalVelocity * 10 ) / 10 }
    else { thermalVelocity = '' } 
    return { thermalVelocity, thermalDPTemp, thermalCloudBaseAlt, topOfLift }
}