'use strict';

// Forecast table keys
const tableID           = document.getElementById("forecastTable")
const tableRows         = tableID.getElementsByTagName(`tr`)
const rowDate           = tableRows[0]
const rowTime           = tableRows[1]
const rowWeatherCode    = tableRows[2]
const rowCloudCover     = tableRows[3]
const rowCAPE           = tableRows[4]
const rowLI             = tableRows[5]
const rowPressureZone   = tableRows[6]
const rowWind500        = tableRows[7]
const rowWind550        = tableRows[8]
const rowWind600        = tableRows[9]
const rowWind650        = tableRows[10]
const rowWind700        = tableRows[11]
const rowWind750        = tableRows[12]
const rowWind800        = tableRows[13]
const rowWind850        = tableRows[14]
const rowWind900        = tableRows[15]
const rowWind80m        = tableRows[16]
const rowWind10m        = tableRows[17]
const rowTemp2m         = tableRows[18]
var previousDate = ``
var previousDateStart = ``

// Get forecast data for site
async function siteForecast(site) {

    // Find site data for the selected site
    var detailSiteData = siteData.find(item => item.SiteID === site)

    // Update forecast location info
    document.getElementById(`site-details-forecast-alt`).innerHTML = detailSiteData.ForecastAlt + '&nbsp;ft'
    document.getElementById(`site-details-forecast-note`).innerHTML = null
    if ( detailSiteData.ForecastNote ) { document.getElementById(`site-details-forecast-note`).innerHTML = ' (forecast for zone including ' + detailSiteData.ForecastNote + ')' }
    
    // Build forecast URL for site lat/lon to get HRRR data from api.open-meteo.com
    // Data structure of output is documented in example_files/api_open-meteo_data_structure
    var forecast_url = "https://api.open-meteo.com/v1/gfs?" + 
    "latitude=" + detailSiteData.ForecastLat +
    "&longitude=" + detailSiteData.ForecastLon + 
    "&hourly=temperature_2m,relativehumidity_2m,pressure_msl,surface_pressure," +
    "precipitation,precipitation_probability,weathercode,cloudcover,cape,lifted_index," +
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

    var response = await fetch(forecast_url)
    var forecastData = await response.json()
    if (forecastData) {
        try {
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
                    
                    // Only include forecasts between sunrise and sunset (converting sunset to 24 hour format)
                    if ( formattedHour >= sunrise_hour-1 && formattedHour <= sunset_hour + 13 ) {
                        forecastCount = forecastCount + 1

                        // Convert 24 hour format to 12 hour format
                        if ( formattedHour > 12 ) { formattedHour = formattedHour - 12 }

                        // Create a new column (e.g., cell for each row) to store the current hourly forecast
                        for (let rowi=0; rowi<tableRows.length; rowi++) {
                            var tableData = document.createElement(`td`)
                            tableData.id = tableRows[rowi].id + '-' + i
                            tableRows[rowi].appendChild(tableData)
                        }

                        // Build wind forecast values

                        // Populate cells with hourly forecast
                        rowTime         .childNodes[forecastCount].innerText = formattedHour
                        rowWeatherCode  .childNodes[forecastCount].innerText = forecastData.hourly.weathercode[i]
                        rowCloudCover   .childNodes[forecastCount].innerText = forecastData.hourly.cloudcover[i] + "%"
                        rowCAPE         .childNodes[forecastCount].innerText = forecastData.hourly.cape[i]
                        rowLI           .childNodes[forecastCount].innerText = forecastData.hourly.lifted_index[i]
                        rowPressureZone .childNodes[forecastCount].innerText = forecastData.hourly.pressure_msl[i]
                        rowWind500      .childNodes[forecastCount].innerText = forecastData.hourly.windspeed_500hPa[i]
                        rowWind550      .childNodes[forecastCount].innerText = forecastData.hourly.windspeed_550hPa[i]
                        rowWind600      .childNodes[forecastCount].innerText = forecastData.hourly.windspeed_600hPa[i]
                        rowWind650      .childNodes[forecastCount].innerText = forecastData.hourly.windspeed_650hPa[i]
                        rowWind700      .childNodes[forecastCount].innerText = forecastData.hourly.windspeed_700hPa[i]
                        rowWind750      .childNodes[forecastCount].innerText = forecastData.hourly.windspeed_750hPa[i]
                        rowWind800      .childNodes[forecastCount].innerText = forecastData.hourly.windspeed_800hPa[i]
                        rowWind850      .childNodes[forecastCount].innerText = forecastData.hourly.windspeed_850hPa[i] 
                        rowWind900      .childNodes[forecastCount].innerText = forecastData.hourly.windspeed_900hPa[i]
                        rowWind80m      .childNodes[forecastCount].innerText = forecastData.hourly.windspeed_80m[i]
                        rowWind10m      .childNodes[forecastCount].innerText = forecastData.hourly.windspeed_10m[i]
                        rowTemp2m       .childNodes[forecastCount].innerText = Math.round(forecastData.hourly.temperature_2m[i]) + `\u00B0`

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

            // Display average geopotential heights as row headers (rounded to nearest 100 and displayed with commas)
            rowWind500      .childNodes[0].innerText = (Math.round((height_500_sum / forecastCount)/100)*100).toLocaleString("en-US")
            rowWind550      .childNodes[0].innerText = (Math.round((height_550_sum / forecastCount)/100)*100).toLocaleString("en-US")
            rowWind600      .childNodes[0].innerText = (Math.round((height_600_sum / forecastCount)/100)*100).toLocaleString("en-US")
            rowWind650      .childNodes[0].innerText = (Math.round((height_650_sum / forecastCount)/100)*100).toLocaleString("en-US")
            rowWind700      .childNodes[0].innerText = (Math.round((height_700_sum / forecastCount)/100)*100).toLocaleString("en-US")
            rowWind750      .childNodes[0].innerText = (Math.round((height_750_sum / forecastCount)/100)*100).toLocaleString("en-US")
            rowWind800      .childNodes[0].innerText = (Math.round((height_800_sum / forecastCount)/100)*100).toLocaleString("en-US")
            rowWind850      .childNodes[0].innerText = (Math.round((height_850_sum / forecastCount)/100)*100).toLocaleString("en-US")
            rowWind900      .childNodes[0].innerText = (Math.round((height_900_sum / forecastCount)/100)*100).toLocaleString("en-US")

        } catch (error) { 
            console.log('Error processing forecastData: ' + error )
        }
    }
}

async function buildWindDisplay(
    
) {
/*
    // Show wind speed (or calm) and set color based on speed and type of site
    if (siteReadingsData.wind_speed_set_1) {
        var readingWind = siteReadingsData.wind_speed_set_1[i]
        var readingWindDisplay = ''
        if (Math.round(readingWind) >= 1) { readingWindDisplay = Math.round(readingWind) }
        else { readingWindDisplay = '<span class="fs-3 fw-normal">Calm</span>'}
        var siteWindColor = windColor(readingWind, detailSiteData.SiteType)
        document.getElementById(`site-details-history-wind-${i}`).innerHTML = readingWindDisplay
        document.getElementById(`site-details-history-wind-${i}`).style.color = siteWindColor
        document.getElementById(`site-details-history-wbar-${i}`).style.height = `${readingWind * 3}px`
        document.getElementById(`site-details-history-wbar-${i}`).style.backgroundColor = siteWindColor
        document.getElementById(`site-details-history-break-${i}`).style.height = `5px`
        document.getElementById(`site-details-history-reading-${i}`).style.display = 'block'
    }

    // Show wind direction
    if (siteReadingsData.wind_direction_set_1) {
        var readingWindDir = siteReadingsData.wind_direction_set_1[i]
        var readingWindImage = '&nbsp;'
        var readingWindDirRotation = 0
        if (readingWindDir >= 0) { 
            readingWindDirRotation = readingWindDir + 90
            readingWindImage = '&#10148;' }
        document.getElementById(`site-details-history-wdir-${i}`).innerHTML = readingWindImage
        document.getElementById(`site-details-history-wdir-${i}`).style.transform = `rotate(${readingWindDirRotation}deg)`
    }

    // Show wind gust speed (hidden if missing)
    if (siteReadingsData.wind_gust_set_1) {
        var readingGust = siteReadingsData.wind_gust_set_1[i]
        if (Math.round(readingGust) >= 1) { 
            readingGust = Math.round(readingGust)
            var siteGustColor = windColor(readingGust, detailSiteData.SiteType)
            document.getElementById(`site-details-history-gust-${i}`).innerText = `g` + readingGust
            document.getElementById(`site-details-history-gust-${i}`).style.color = siteGustColor
            var readingGustDiff = (readingGust - readingWind)
            document.getElementById(`site-details-history-gbar-${i}`).style.height = `${readingGustDiff * 3}px`
            document.getElementById(`site-details-history-gbar-${i}`).style.backgroundColor = siteGustColor
            document.getElementById(`site-details-history-gust-${i}`).style.display = 'block'
            document.getElementById(`site-details-history-gbar-${i}`).style.display = 'block'
        }
        else { 
            document.getElementById(`site-details-history-gust-${i}`).style.display = 'none' 
            document.getElementById(`site-details-history-gbar-${i}`).style.height = `0px`
            document.getElementById(`site-details-history-gbar-${i}`).style.display = 'none' 
        }
    }
 */                   
}