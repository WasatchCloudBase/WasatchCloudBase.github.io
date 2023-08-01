'use strict';
// Build site maps and site data
(async () => {
    
    // Retrieve map data in JSON format from Google sheets API
    // Maintain map data here:  https://docs.google.com/spreadsheets/d/1nBEJuTCWkUidSFKQjBjcJgKeteC_oy8LqL2P7uhGyLQ/edit#gid=1983117904
    var map_data_url = "https://sheets.googleapis.com/v4/spreadsheets/1nBEJuTCWkUidSFKQjBjcJgKeteC_oy8LqL2P7uhGyLQ/values/Maps/?alt=json" +
        "&key=AIzaSyDSro1lDdAQsNEZq06IxwjOlQQP1tip-fs"
    var response = await fetch(map_data_url)
    var mapRawJSON = await response.json()
    if (mapRawJSON) {
        // Convert first row (headers) to JSON keys
        mapData = setJSONKeys(mapRawJSON.values)
        // Build drop-down for each map and display first map
        for (let i=0; i<mapData.length; i++) {
            try {

                // Clone prototype map DIV to add map to map page
                let cloned_map = document.getElementById(`prototype-map`).cloneNode(true)
                //Rename parent and children IDs from prototype clone to new map
                let mapHeader = mapData[i].MapID
                cloned_map.id = mapHeader
                cloned_map.children[0].id = mapHeader + `-name`
                cloned_map.children[1].id = mapHeader + `-container`
                cloned_map.children[1].children[0].id = mapHeader + `-image`
                cloned_map.children[1].children[1].id = mapHeader + `-prototype-site`
                cloned_map.children[1].children[1].children[0].id = mapHeader + `-prototype-site-name`
                cloned_map.children[1].children[1].children[1].id = mapHeader + `-prototype-site-reading`
                cloned_map.children[1].children[1].children[1].children[0].id = mapHeader + `-prototype-site-wdir`
                cloned_map.children[1].children[1].children[1].children[1].id = mapHeader + `-prototype-site-wind`
                cloned_map.children[1].children[1].children[1].children[2].id = mapHeader + `-prototype-site-gust`
                cloned_map.children[1].children[1].children[2].id = mapHeader + `-prototype-site-time`
                //Add new site to page
                document.getElementById(`Map View`).appendChild(cloned_map)
                // Update map name
                document.getElementById(mapHeader + `-name`).innerText = mapData[i].MapName

                // Tranform image link to embed URL and display image
                /* Not currently using Google drive images; these are not caching and impacting page load time.
                   Instead, using images in git repository (images directory)
                let map_image_link_start = mapData[i].MapImage.search('/d/')+3
                let map_image_link_end = mapData[i].MapImage.indexOf('/', map_image_link_start)
                let map_image_link = mapData[i].MapImage.substring(map_image_link_start, map_image_link_end)
                let map_image_file = 'https://drive.google.com/uc?export=view&id=' + map_image_link
                */
                let map_image_file = 'prod/images/' + mapHeader + '.png'
                document.getElementById(mapHeader + `-image`).src = map_image_file

                // Clone prototype map menu item to add map to drop down
                let cloned_map_menu = document.getElementById(`MapMenu-prototype`).cloneNode(true)
                // Add new map menu item to drop down
                document.getElementById(`MapMenu`).appendChild(cloned_map_menu)
                // Rename cloned ID, name, and onclick event for new map menu item
                cloned_map_menu.id = 'MapMenu-' + mapHeader
                document.getElementById('MapMenu-' + mapHeader).innerText = mapData[i].MapName
                document.getElementById('MapMenu-' + mapHeader).setAttribute("onclick", `toggleMap('${mapHeader}')`)

                // Clone site list prototype DIV for each map region (so site list only shows for selected region)
                let cloned_region = document.getElementById(`region-prototype-site-list`).cloneNode(true)
                // Rename parent and children IDs from prototype clone to new region
                cloned_region.id = mapHeader + `-site-list`
                cloned_region.children[0].id = mapHeader + `-prototype-site-list-site`
                cloned_region.children[0].children[0].id = mapHeader + `-prototype-site-list-site-left-block`
                cloned_region.children[0].children[0].children[0].id = mapHeader + `-prototype-site-list-site-name`
                cloned_region.children[0].children[0].children[1].id = mapHeader + `-prototype-site-list-site-alt`
                cloned_region.children[0].children[1].id = mapHeader + `-prototype-site-list-site-pressure-block`
                cloned_region.children[0].children[1].children[0].id = mapHeader + `-prototype-site-list-site-pressure-text`
                cloned_region.children[0].children[1].children[1].id = mapHeader + `-prototype-site-list-site-pressure-zone`
                cloned_region.children[0].children[2].id = mapHeader + `-prototype-site-list-site-right-block`
                cloned_region.children[0].children[2].children[0].id = mapHeader + `-prototype-site-list-site-time`
                cloned_region.children[0].children[2].children[1].id = mapHeader + `-prototype-site-list-site-wdir`
                cloned_region.children[0].children[2].children[2].id = mapHeader + `-prototype-site-list-site-wind`
                cloned_region.children[0].children[2].children[3].id = mapHeader + `-prototype-site-list-site-gust`

                // Add new prototype list site to page
                document.getElementById(`Site List`).appendChild(cloned_region)

                // If currentMap isn't available from a prior session, use first map loaded to display
                if ( !currentMap || currentMap === 'null' ) { currentMap = mapHeader }

                // Hide prototype menu drop down item
                document.getElementById('MapMenu-' + mapHeader).classList.remove('collapse')

            } catch (error) { 
                console.log('Map build error: ' + error + ' for map: ' + mapData[i].MapID)
            }
        }
    }    

    // Display map and map list
    toggleMap (currentMap)

    // Retrieve site data in JSON format from Google sheets API
    // Maintain site data here:  https://docs.google.com/spreadsheets/d/1nBEJuTCWkUidSFKQjBjcJgKeteC_oy8LqL2P7uhGyLQ/edit#gid=0
    var site_data_url = "https://sheets.googleapis.com/v4/spreadsheets/1nBEJuTCWkUidSFKQjBjcJgKeteC_oy8LqL2P7uhGyLQ/values/Sites/?alt=json" +
        "&key=AIzaSyDSro1lDdAQsNEZq06IxwjOlQQP1tip-fs"
    var response = await fetch(site_data_url)
    var siteRawJSON = await response.json()
    if (siteRawJSON) {
        // Convert first row (headers) to JSON keys
        siteData = setJSONKeys(siteRawJSON.values)

        // Build each site on site map and add to readings query
        for (let i=0; i<siteData.length; i++) {
            try {

                // Set site map (region) and IDs
                let siteMap = siteData[i].SiteMap
                let siteID = siteData[i].SiteID

                // Clone prototype site DIV to add site to site map
                let cloned_site = document.getElementById(siteMap + `-prototype-site`).cloneNode(true)
                //Rename parent and children IDs from prototype clone to new site
                let siteHeader = siteMap + `-` + siteID
                cloned_site.id = siteHeader
                cloned_site.children[0].id = siteHeader + `-name`
                cloned_site.children[1].id = siteHeader + `-reading`
                cloned_site.children[1].children[0].id = siteHeader + `-wdir`
                cloned_site.children[1].children[1].id = siteHeader + `-wind`
                cloned_site.children[1].children[2].id = siteHeader + `-gust`
                cloned_site.children[2].id = siteHeader + `-time`
                //Add new site to page
                document.getElementById(siteMap + `-container`).appendChild(cloned_site)
                // Position new site on map
                document.getElementById(siteHeader).style.top = siteData[i].SiteMapTopPct + `%` 
                document.getElementById(siteHeader).style.left = siteData[i].SiteMapLeftPct + `%`
                // Update site name
                document.getElementById(siteHeader + `-name`).innerText = siteData[i].SiteName
                // Update onclick event for site details
                document.getElementById(siteHeader).setAttribute("onclick", `siteDetail('${siteID}')`)

                // Display new site on map
                document.getElementById(siteHeader).style.display = 'block'

                // Clone site list prototype DIV to add site to site list page
                let cloned_site_list_site = document.getElementById(siteMap + `-prototype-site-list-site`).cloneNode(true)

                //Rename parent and children IDs from prototype clone to new site on site list page
                cloned_site_list_site.id = siteID + `-site-list`
                cloned_site_list_site.children[0].id = siteID + `-site-list-left-block`
                cloned_site_list_site.children[0].children[0].id = siteID + `-site-list-name`
                cloned_site_list_site.children[0].children[1].id = siteID + `-site-list-alt`
                cloned_site_list_site.children[1].id = siteID + `-site-list-pressure-block`
                cloned_site_list_site.children[1].children[0].id = siteID + `-site-list-pressure-text`
                cloned_site_list_site.children[1].children[1].id = siteID + `-site-list-pressure-zone`
                cloned_site_list_site.children[2].id = siteID + `-site-list-right-block`
                cloned_site_list_site.children[2].children[0].id = siteID + `-site-list-time`
                cloned_site_list_site.children[2].children[1].id = siteID + `-site-list-wdir`
                cloned_site_list_site.children[2].children[2].id = siteID + `-site-list-wind`
                cloned_site_list_site.children[2].children[3].id = siteID + `-site-list-gust`

                //Add new site to site list page
                document.getElementById(siteMap + `-site-list`).appendChild(cloned_site_list_site)
                // Update site name
                document.getElementById(siteID + `-site-list-name`).innerText = siteData[i].SiteName
                // Update onclick event for site details
                document.getElementById(siteID + `-site-list` ).setAttribute("onclick", `siteDetail('${siteID}')`)
                // Set altitude units
                var alt_units = ``
                if ( siteData[i].ReadingsAlt === 'Stn down' ) {
                    document.getElementById(siteHeader + `-time`).innerText = 'Stn down'    
                } else { alt_units = ` ft` }
                // Update altitude
                document.getElementById(siteID + `-site-list-alt`).innerText = siteData[i].ReadingsAlt + alt_units

                // Add site Mesonet API call for readings if station is not null
                if ( siteData[i].ReadingsSource === 'Mesonet' && siteData[i].ReadingsStation ) {
                    siteReadingsURL = siteReadingsURL + `&stid=` + siteData[i].ReadingsStation 
                }

                // Build listing of CUASA stations to query below by station (API requires one call per station)
                if ( siteData[i].ReadingsSource === 'CUASA' && siteData[i].ReadingsStation ) {
                    // Add site to array if it doesn't already exist in the array
                    if (!CUASASites.includes(siteData[i].ReadingsStation)) {
                        CUASASites.push(siteData[i].ReadingsStation)
                    }
                }

            } catch (error) { 
                console.log('Site forecast reading error: ' + error + ' for site: ' + siteData[i].SiteID)
            }
        }
    }

    // Hide prototypes after clones are done
    // Not using .style.display to show site notes because it changes formatting
    for (let i=0; i<mapData.length; i++) {
        try {
            // Remove d-flex class, which uses !important and overrides the display style
            document.getElementById(mapData[i].MapID + `-prototype-site-list-site`).classList.remove("d-flex")
            document.getElementById(mapData[i].MapID + `-prototype-site-list-site`).style.display = 'none'
        } catch (error) { 
            console.log('Hide prototype error: ' + error + ' for map: ' + mapData[i].MapID)
        }
    }

    // Complete the URL for Mesonet API for readings
    siteReadingsURL = siteReadingsURL +
        `&recent=420&vars=air_temp,altimeter,wind_direction,wind_gust,wind_speed&units=english,speed|mph,temp|F&obtimezone=local&timeformat=%-I:%M%20%p&` + 
        `token=ef3b9f4584b64e6da12d8688f19d9f4a`  //0030ed6480a4440eb29ec23ff37fe159`

    // Get station readings using Mesonet API
    var response = await fetch(siteReadingsURL)
    var rawReadingsData = await response.json()
    if (rawReadingsData) {
        try {
            // Extract all of the stations readings from the raw file and show the current reading for each station
            for (let i=0; i<rawReadingsData.STATION.length; i++) {
                try {
                    //Objects below use JSON.parse(JSON.stringify()) to fully (deep) copy the data
                    //Otherwise, a shallow copy causes the slice on observations to reduce the original data set,
                    //which doesn't leave enough readings for hourly pressure history

                    // Create object of pressure history observations for each station
                    pressureReadingsData[i] = JSON.parse(JSON.stringify(rawReadingsData.STATION[i].OBSERVATIONS))
                    pressureReadingsData[i].stid = JSON.parse(JSON.stringify(rawReadingsData.STATION[i].STID))

                    // Create object of last 10 observations for each station and update on site map (used for current wind readings and wind history)
                    readingsData[i] = JSON.parse(JSON.stringify(rawReadingsData.STATION[i].OBSERVATIONS))
                    readingsData[i].stid = JSON.parse(JSON.stringify(rawReadingsData.STATION[i].STID))
                    var readingsCount = 10
                    for (let key in readingsData[i]) {
                        readingsData[i][key] = readingsData[i][key].slice(-readingsCount)
                    }

                    // Populate current readings
                    showCurrentReadings(readingsData[i])

                } catch (error) { 
                    console.log('Station reading error: ' + error + ' for station: ' + rawReadingsData.STATION[i].STID)
                }
            }
        } catch (error) { 
            console.log('Readings Data error: ' + error + ' for length of: ' + JSON.stringify(rawReadingsData.STATION))
            console.log('URL used for request:')
            console.log(siteReadingsURL)
        }
    }

    // Get station readings for each CUASA site using Sierra Gliding CUASA station API (one call per station)
    for (let i = 0; i < CUASASites.length; i++) {

        // Construct CUASA API reading call
        // Call format:   https://sierragliding.us/api/station/<station_id>/data?start=<start_timestamp>&end=<end_timestamp>&sample=<interval_seconds>
        // Example call:  https://sierragliding.us/api/station/1069/data?start=1686012560.231&end=1686012620.231&sample=1
        let readingEnd = nowTimeStamp / 1000                        // API call expects timestamp in seconds (milliseconds after the decimal point)
        let readingInterval = 5 * 60                                // Setting a 5 minute interval for history readings
        let readingStart = readingEnd - ( readingInterval * 10 )    // Offset readingStart to be 10 readings earlier than readingEnd
        let CUASASiteReadingsURL = `https://sierragliding.us/api/station/` + CUASASites[i] + `/data?start=` + readingStart + `&end=` + readingEnd + `&sample=` + readingInterval

        // Make CORS call to get CUASA API data and process results
        try {
            doCORSRequest({method: 'GET', url: CUASASiteReadingsURL, data: ""}, function processResponse(result) {
                let rawCUASAReadingsData = JSON.parse(result)

                // Create a JSON object in Mesonet format
                let MesoNetReadings = {
                    "air_temp_set_1": [],
                    "altimeter_set_1": [],
                    "date_time": [],
                    "stid": CUASASites[i],
                    "wind_direction_set_1": [],
                    "wind_gust_set_1": [],
                    "wind_speed_set_1": [] 
                }

                // Read the 10 most recent CUASA readings (sometimes 11 are returned from the API call)
                var MesoNetIndex = 0
                for (let j=(rawCUASAReadingsData.length-10); j<rawCUASAReadingsData.length; j++) {
                    try {
                        // Convert date to "9:00 AM" format
                        // Multipying by 1000 since the UNIX timestamp is in seconds and Javascript timestamp uses milliseconds
                        const rawDate = new Date(rawCUASAReadingsData[j].timestamp * 1000)
                        let hour = rawDate.getHours()
                        let minutes = String(rawDate.getMinutes()).padStart(2, "0")
                        let ampm = ` AM`
                        if (hour >= 12) { ampm = ` PM` }
                        if (hour > 12) { hour = hour - 12 }
                        let formattedTime = `${hour}:${minutes}${ampm}`

                        // Add CUASA readings data to Mesonet object
                        MesoNetReadings.date_time[MesoNetIndex] = formattedTime
                        MesoNetReadings.wind_direction_set_1[MesoNetIndex] = rawCUASAReadingsData[j].wind_direction_avg
                        MesoNetReadings.wind_gust_set_1[MesoNetIndex] = rawCUASAReadingsData[j].windspeed_max
                        MesoNetReadings.wind_speed_set_1[MesoNetIndex] = rawCUASAReadingsData[j].windspeed_avg
                        MesoNetIndex = MesoNetIndex + 1

                    } catch (error) { 
                        console.log('CUASA API station processing error: ' + error + ' for station: ' + rawCUASAReadingsData[j].ID)
                    }
                }

                // Create new station in readings object and display current readings
                if (rawCUASAReadingsData.length > 0) {
                    let newReadingsIndex = readingsData.length // Values start at 0, so this is the next unused index value
                    readingsData[newReadingsIndex] = MesoNetReadings
                    showCurrentReadings(readingsData[newReadingsIndex])
                }

            })
        } catch (error) { 
            console.log('CUASA API station reading error: ' + error + ' for station: ' + CUASASites[i])
        }
    }

    // If reload occurred and current page is site details, then load the details
    if ( currentDiv === 'Site Details' ) {
        siteDetailContent(currentSite)
    // Otherwise, hide 'loading' image
    } else {
        document.getElementById('Loading Image').style.display = 'none' 
    }

})();

// Get latest readings and add to both map and site list pages
function showCurrentReadings(data) {
    try {

        // Find all sites that match the station being processed
        // (multiple sites can use the same station for actual readings)
        var matchingSites = siteData.filter(item => item.ReadingsStation === data.stid) 

        // Process readings for each matching site
        for (let i=0; i<matchingSites.length; i++) {

            // Define current map page and site list headings
            var currentSiteData = matchingSites[i]
            var siteMapHeading = `${currentSiteData.SiteMap}-${currentSiteData.SiteID}`
            var siteListHeading = currentSiteData.SiteID + '-site-list'

            // Show latest reading time
            var siteTime = data.date_time[data.date_time.length-1].toLowerCase()
            if (siteTime) {
                document.getElementById(siteMapHeading + `-time`).innerHTML = siteTime
                document.getElementById(siteListHeading + `-time`).innerHTML = siteTime
            }

            // Show latest wind speed (or calm) and set color based on speed and type of site
            var currentWind = 0
            if (data.wind_speed_set_1) {
                currentWind = data.wind_speed_set_1[data.wind_speed_set_1.length-1]
                if (Math.round(currentWind) >= 1) { currentWind = Math.round(currentWind) }
                else { currentWind = '<span class="fs-3 fw-normal">Calm</span>'}
                var siteWindColor = windColor(currentWind, currentSiteData.SiteType)
                document.getElementById(siteMapHeading + `-wind`).innerHTML = currentWind
                document.getElementById(siteListHeading + `-wind`).innerHTML = currentWind
                document.getElementById(siteMapHeading + `-wind`).style.color = siteWindColor
                document.getElementById(siteListHeading + `-wind`).style.color = siteWindColor
            }

            // Show wind gust speed (hidden if missing)
            var currentGust = 0
            if (data.wind_gust_set_1) {
                currentGust = data.wind_gust_set_1[data.wind_gust_set_1.length-1]
                if (Math.round(currentGust) >= 1) { 
                    currentGust = Math.round(currentGust)
                    document.getElementById(siteMapHeading + `-gust`).innerText = `g` + currentGust
                    document.getElementById(siteMapHeading + `-gust`).style.color = windColor(currentGust, currentSite.SiteType)
                    document.getElementById(siteMapHeading + `-gust`).style.display = 'block'
                    document.getElementById(siteListHeading + `-gust`).innerText = `g` + currentGust
                    document.getElementById(siteListHeading + `-gust`).style.color = windColor(currentGust, currentSite.SiteType)
                }
                else { 
                    document.getElementById(siteMapHeading + `-gust`).innerText = ``
                    document.getElementById(siteListHeading + `-gust`).innerText = ``
                    document.getElementById(siteMapHeading + `-gust`).style.display = 'none' 
                }
            }
            
            // Show wind direction
            if (data.wind_direction_set_1) {
                var currentWindDir = data.wind_direction_set_1[data.wind_direction_set_1.length-1]
                var currentWindImage = '&nbsp;'
                var currentWindDirRotation = 0
                if (currentWindDir >= 0) { 
                    currentWindDirRotation = currentWindDir + 90
                    currentWindImage = '&#10148;' }
                // Only display wind direction if there is wind or gust; otherwise display space (null causes incorrect spacing on page)
                document.getElementById(siteMapHeading + `-wdir`).innerHTML = `&nbsp;`
                document.getElementById(siteListHeading + `-wdir`).innerHTML = `&nbsp;`
                if ( Math.round(currentWind) >= 1 || Math.round(currentGust) >= 1 ) {
                    document.getElementById(siteMapHeading + `-wdir`).innerHTML = currentWindImage
                    document.getElementById(siteMapHeading + `-wdir`).style.transform = `rotate(${currentWindDirRotation}deg)`
                    document.getElementById(siteListHeading + `-wdir`).innerHTML = currentWindImage
                    document.getElementById(siteListHeading + `-wdir`).style.transform = `rotate(${currentWindDirRotation}deg)`
                }

            }

            // Show pressure zone for airport sites only
            document.getElementById(siteListHeading + `-pressure-zone`).innerHTML = ''
            if ( currentSiteData.SiteType === `Airport` ) {
                const latestAlti = parseFloat(data.altimeter_set_1.slice(-1)).toFixed(2)
                const latestTemp = Math.round(data.air_temp_set_1.slice(-1))
                var latestZone = calculateZone(latestAlti, latestTemp)
                const latestZoneColor = getZoneColor(latestZone)
                latestZone = latestZone===0 ? '&#9471;' : (latestZone==='LoP') ? 'LoP' : `&#1010${latestZone+1}`
                document.getElementById(siteListHeading + `-pressure-text`).innerHTML = `Zone`
                document.getElementById(siteListHeading + `-pressure-zone`).innerHTML = latestZone
                document.getElementById(siteListHeading + `-pressure-zone`).style.color = latestZoneColor
            }
        }
    } catch (error) { 
        console.log('Error in showCurrentReadings: ' + error + ' for: ' + siteMapHeading)
    }
}

// Populate all details for selected site detail
function siteDetailContent(site) {

    // Update global currentSite to use on reload
    currentSite = site

    // Find site data for the selected site
    var detailSiteData = siteData.find(item => item.SiteID === site)

    try {
        // Override standard page heading
        document.getElementById(`current-div`).innerHTML = detailSiteData.SiteName

        // Update return button text
        document.getElementById(`site-details-return`).innerHTML = 'Back to ' + returnToPage

        // Update site guide link (if one exists, otherwise hide)
        document.getElementById(`site-details-guide-link`).style.display = 'none'
        document.getElementById(`site-details-guide-spacer`).style.display = 'none'
        if ( detailSiteData.SiteGuideURL ) {
            document.getElementById(`site-details-guide`).innerHTML = detailSiteData.SiteName + ' Site Guide'
            document.getElementById(`site-details-guide-link`).href = detailSiteData.SiteGuideURL
            document.getElementById(`site-details-guide-spacer`).style.display = 'block'
            document.getElementById(`site-details-guide-link`).style.display = 'block'
        }

        // Update history wind readings location info
        document.getElementById(`site-details-readings-alt`).innerHTML = detailSiteData.ReadingsAlt + '&nbsp;ft'
        document.getElementById(`site-details-readings-note`).innerHTML = null
        if ( detailSiteData.ReadingsNote ) { document.getElementById(`site-details-readings-note`).innerHTML = ' (station at ' + detailSiteData.ReadingsNote + ')' }
        
        // Set full history URL link
        if ( detailSiteData.ReadingsSource === 'CUASA' ) {
            document.getElementById(`site-details-history-href`).href = 
                `http://sierragliding.us/cuasa/#station=${detailSiteData.ReadingsStation}`
        } else if ( detailSiteData.ReadingsSource === 'Mesonet' ) {
            document.getElementById(`site-details-history-href`).href = 
                `https://www.wrh.noaa.gov/mesowest/timeseries.php?sid=${detailSiteData.ReadingsStation}&table=1&banner=off`
        }

        // Clear any prior wind readings
        for (let i=0; i<10; i++) {
            document.getElementById(`site-details-history-time-${i}`).innerHTML = null
            document.getElementById(`site-details-history-wind-${i}`).innerHTML = null
            document.getElementById(`site-details-history-wdir-${i}`).innerHTML = null
            document.getElementById(`site-details-history-gust-${i}`).innerHTML = null
            document.getElementById(`site-details-history-wbar-${i}`).style.height = `0px`
            document.getElementById(`site-details-history-gbar-${i}`).style.height = `0px`
        }

        // Find site observations in readingsData array for the selected site
        var siteReadingsData = {}
        for (let i=0; i<readingsData.length; i++) {
            if ( readingsData[i].stid === detailSiteData.ReadingsStation ) { 
                siteReadingsData = readingsData[i] 
            }
        }
        // Populate history wind readings
        if ( siteReadingsData.date_time ) {
            for (let i=0; i<siteReadingsData.date_time.length; i++) {

                // Remove trailing characters (am/pm) and show reading time
                var siteTime = siteReadingsData.date_time[i].toLowerCase()
                var site_time_space_position = siteTime.search(" ")
                siteTime = siteTime.substring(0,site_time_space_position)
                if (siteTime) { document.getElementById(`site-details-history-time-${i}`).innerHTML = siteTime }

                // Show wind speed (or calm) and set color based on speed and type of site
                var readingWind = 0
                if (siteReadingsData.wind_speed_set_1) {
                    readingWind = siteReadingsData.wind_speed_set_1[i]
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

                // Show wind gust speed (hidden if missing)
                var readingGust = 0
                if (siteReadingsData.wind_gust_set_1) {
                    readingGust = siteReadingsData.wind_gust_set_1[i]
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

                // Show wind direction
                if (siteReadingsData.wind_direction_set_1) {
                    var readingWindDir = siteReadingsData.wind_direction_set_1[i]
                    var readingWindImage = '&nbsp;'
                    var readingWindDirRotation = 0
                    if (readingWindDir >= 0) { 
                        readingWindDirRotation = readingWindDir + 90
                        readingWindImage = '&#10148;' 
                    }
                    // Only display wind direction if there is wind or gust; otherwise display space (null causes incorrect spacing on page)
                    document.getElementById(`site-details-history-wdir-${i}`).innerHTML = `&nbsp;`
                    if ( Math.round(readingWind) >= 1 || Math.round(readingGust) >= 1 ) {
                        document.getElementById(`site-details-history-wdir-${i}`).innerHTML = readingWindImage
                        document.getElementById(`site-details-history-wdir-${i}`).style.transform = `rotate(${readingWindDirRotation}deg)`
                    }
                }

            }

            // Hide remaining history DIVs if fewer than 10 readings
            for (let i=siteReadingsData.date_time.length; i<10; i++) {
                document.getElementById(`site-details-history-reading-${i}`).style.display = 'none'
            }

            // Show pressure zone for airport sites only
            if ( detailSiteData.SiteType === `Airport` ) {
                // Show pressure history DIV
                document.getElementById(`site-details-pressure-title`).style.display = 'block'
                document.getElementById(`site-details-pressure-block`).style.display = 'block'
                document.getElementById(`site-details-pressure-info`).style.display = 'block'

                // Update link to full history URL
                document.getElementById(`site-details-pressure-href`).href = 
                `https://www.wrh.noaa.gov/mesowest/timeseries.php?sid=${detailSiteData.ReadingsStation}&table=1&banner=off`

                // Find site pressure observations in pressureReadingsData array for the selected site
                var pressureSiteReadingsData = {}
                for (let i=0; i<pressureReadingsData.length; i++) {
                    if ( pressureReadingsData[i].stid === detailSiteData.ReadingsStation ) { 
                        pressureSiteReadingsData = pressureReadingsData[i] 
                    }
                }

                if (pressureSiteReadingsData.altimeter_set_1) {
                    // Create arrays to store hourly pressure readings to be displayed (hourly; not every pressure reading is displayed)
                    var time=[], alti=[], temp=[]

                    // Read each pressure reading and add pressure readings hourly to the array based on the minutes specified in the site info
                    for (let i=0; i<pressureSiteReadingsData.date_time.length; i++) {
                        if ( parseInt(pressureSiteReadingsData.date_time[i].slice(-5,-3),10) === parseInt(detailSiteData.PressureZoneReadingTime, 10) )
                        {
                            time.push(pressureSiteReadingsData.date_time[i].toLowerCase().replace(/:\d{2}/g, ''))
                            temp.push(`${Math.round(pressureSiteReadingsData.air_temp_set_1[i])}&deg;`)
                            alti.push(pressureSiteReadingsData.altimeter_set_1[i].toFixed(2))
                        }
                    }

                    // Limit to last 6 entries in arrays
                    time = time.slice(-6)
                    temp = temp.slice(-6)
                    alti = alti.slice(-6)

                    // Find height for bar chart
                    const min = Math.min(...alti)
                    const max = Math.max(...alti)
                    const barHeight = alti.map(d => `${(((d-min)*80)/(max-min))+10}px`)

                    for (let i=0; i<6; i++) {
                        var zDigit = calculateZone( parseFloat(alti[i]), parseInt(temp[i]) )
                        document.getElementById(`site-details-alti-${i}`).innerHTML = alti[i]
                        document.getElementById(`site-details-altibar-${i}`).style.height = barHeight[i]
                        document.getElementById(`site-details-temp-${i}`).innerHTML = temp[i]
                        document.getElementById(`site-details-zone-${i}`).style.color = getZoneColor(zDigit)
                        zDigit = zDigit===0 ? '&#9471;' : (zDigit==='LoP') ? 'LoP' : `&#1010${zDigit+1}`
                        document.getElementById(`site-details-zone-${i}`).innerHTML = zDigit
                        document.getElementById(`site-details-alti-time-${i}`).innerHTML = time[i]
                    }
                }
            } else {
                document.getElementById(`site-details-pressure-title`).style.display = 'none'
                document.getElementById(`site-details-pressure-block`).style.display = 'none'
                document.getElementById(`site-details-pressure-info`).style.display = 'none'
            }
        }

        // Build site forecast
        siteForecast(site)

    } catch (error) { 
        console.log('Error processing detailed content for site: ' + site + ' creating error: ' + error)
    }    
}

// Convert first row to JSON keys
function setJSONKeys (arr) {
    const keys = Object.keys(arr[0]).map(i => arr[0][i])
    let result = arr.map(obj => {
        var replacedObj = {}
        const oriKeys = Object.keys(obj)
        for (let i = 0; i < keys.length; i++) {
            replacedObj[keys[i]] = obj[oriKeys[i]]
        }
        return replacedObj
    })
    // Remove row 0 (headers)
    let removedHeaders = result.shift()
    return result
}

function calculateZone(alti, temp, currentZones = []) {
    const zoneSlope = [0.05, 0.12, 0.19, 0.33, 0.47, 0.54, 0.62, -1]
    const zoneIntercept = [29.91, 30.01, 30.11, 30.27, 30.43, 30.53, 30.65, 100]
    for (let i=0; i<zoneSlope.length; i++) currentZones.push(Math.round((zoneSlope[i]/-110*temp+zoneIntercept[i])*100)/100)
    const zone = currentZones.findIndex(d => d >= alti)
    // Only return numeric zones between 0 and 7
    if ( zone >= 0 && zone <= 7 ) { return zone }
    else { return null }
}

// Set wind speed font and bar colors
function windColor(windSpeed, siteType) {
    // Set color threasholds based on site type
    if (siteType === 'Aloft') {
        var ylwLim = 12  // Using mountain site speeds for winds aloft readings
        var orgLim = 18
        var redLim = 24
    } else if (siteType === 'Mountain') {
        var ylwLim = 12
        var orgLim = 18
        var redLim = 24
    } else if (siteType === 'Soaring') {
        var ylwLim = 20
        var orgLim = 25
        var redLim = 30
    } else {
        var ylwLim = 14
        var orgLim = 22
        var redLim = 28
    }
    // Return color based on wind speed
    if (windSpeed < ylwLim) {return wwGrn}
    else if (windSpeed < orgLim) {return wwYlw}
    else if (windSpeed < redLim) {return wwOrg}
    else if (windSpeed >= redLim) {return wwRed}
    else /* Handle calm winds */ {return wwGrn}
}

// Set zone color
function getZoneColor(zone) {
    if (zone===0 || zone===7) {return wwRed}
    else if (zone===1 || zone===6) {return wwOrg}
    else if (zone===2 || zone===5) {return wwYlw}
    else {return wwGrn}
}