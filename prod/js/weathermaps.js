'use strict';
// Weather Maps page

// Populate Weather Map images when navigating to Weather Maps page
// These could be populated directly in the HTML, but this approach reduced bandwidth needs by 
// preventing making the additional calls unless the map page is accessed
async function populateWeatherMaps() {

    // Show 'loading' image
    document.getElementById('Loading Image').style.display = 'block' 

    // Update map images
    document.getElementById('cloudandprecipmap').src =  `https://sirocco.accuweather.com/sat_mosaic_640x480_public/rs/isarUT_.gif`
    document.getElementById('satellitemap').src =       `https://cdn.star.nesdis.noaa.gov/GOES17/ABI/SECTOR/psw/GEOCOLOR/GOES17-PSW-GEOCOLOR-600x600.gif`
    document.getElementById('jetstreammap').src =       `https://s.w-x.co/staticmaps/wu/wu/jetstream1200_cur/conus/animate.png`

    // Hide 'loading' image
    document.getElementById('Loading Image').style.display = 'none' 

}