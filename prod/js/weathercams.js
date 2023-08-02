'use strict';
// Weather cams page

// Populate Weather Cam images when navigating to Weather Cams page
// These could be populated directly in the HTML, but this approach reduced bandwidth needs by 
// preventing making the additional calls unless the weather cams page is accessed
async function populateWeatherCams() {

    // Show 'loading' image
    document.getElementById('Loading Image').style.display = 'block' 

    // Update cam images
    document.getElementById('UofUWest').src =           `https://meso1.chpc.utah.edu/station_cameras/wbbw_cam/wbbw_cam_current.jpg`
    document.getElementById('UofUSouth').src =          `https://meso1.chpc.utah.edu/station_cameras/wbbs_cam/wbbs_cam_current.jpg`
    document.getElementById('SSaltLakeEast').src =      `http://wwc.instacam.com/instacamimg/STHSL/STHSL_l.jpg`
    document.getElementById('MillcreekSE').src =        `http://wa7xhome.ddns.net:5895/Latest12.jpg`
    document.getElementById('CottonwoodSW').src =       `http://wwc.instacam.com/instacamimg/SLTWK/SLTWK_l.jpg`
    document.getElementById('WestValleyEast').src =     `https://meso1.chpc.utah.edu/station_cameras/armstrong_cam/armstrong_cam_current.jpg`
    document.getElementById('DaybreakWest').src =       `https://www.wrh.noaa.gov/images/slc/camera/latest/darrenS.latest.jpg`
    document.getElementById('DaybreakEast').src =       `https://www.wrh.noaa.gov/images/slc/camera/latest/darren2.latest.jpg`
    document.getElementById('DraperWest').src =         `http://wwc.instacam.com/instacamimg/DRPRJ/DRPRJ_l.jpg`
    document.getElementById('BYUNE').src =              `http://lswebcam.byu.edu/mjpg/LSB`
    document.getElementById('UtahLakeNW').src =         `https://video.nest.com/embedded/live/NAfKWt0IIe?autoplay=1`

    // Hide 'loading' image
    document.getElementById('Loading Image').style.display = 'none'

}