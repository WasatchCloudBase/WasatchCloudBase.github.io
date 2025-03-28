'use strict';
// Radar Map page
const initialLocation = [40.47, -111.88]   // Set initial location to Point of the Mountain
const initialZoom = 9                      // Set initial zoom to level 9 (most of Utah shown)
var apiData = {};
var map = {};
var mapFrames = [];
var lastPastFramePosition = -1;
var radarLayers = [];
var optionKind = 'radar'; // can be 'radar' or 'satellite'
var optionTileSize = 256; // can be 256 or 512.
var optionColorScheme = 2; // from 0 to 8. Check the https://rainviewer.com/api/color-schemes.html for additional information
var optionSmoothData = 1; // 0 - not smooth, 1 - smooth
var optionSnowColors = 1; // 0 - do not show snow colors, 1 - show snow colors
var animationPosition = 0;
var animationTimer = false;
var loadingTilesCount = 0;
var loadedTilesCount = 0;
var mapInitialized = false;

// Build radar map whenn navigating to Radar Map page
async function populateRadarMap() {

    // Initialize the underlying map if this is the first call during this browser session
    if (!mapInitialized) {

        // Set map height based on the window size (leaving room for top menu and bottom buttons)
        document.getElementById('radarmap').height = window.screen.height - 100

        // Show 'loading' image
        document.getElementById('Loading Image').style.display = 'block' 

        // Set Leaflet initial map center and zoom level
        map = L.map('radarmap').setView(initialLocation, initialZoom);

        // Define map tiles source
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attributions: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
        }).addTo(map);    
        
        // Hide 'loading' image
        document.getElementById('Loading Image').style.display = 'none' 

        // Set status that map has been initialized for this browser session
        mapInitialized = true
    }

    //Load all available radar map frames from RainViewer API
    var apiRequest = new XMLHttpRequest();
    apiRequest.open("GET", "https://api.rainviewer.com/public/weather-maps.json", true);
    apiRequest.onload = function(e) {
        // store the API response for re-use purposes in memory
        apiData = JSON.parse(apiRequest.response);
        initialize(apiData, optionKind);

        // Start animation
        play()

    };
    apiRequest.send();

}

// Initialize internal data from the API response and options
function initialize(api, kind) {

    // remove all already added tiled layers
    for (var i in radarLayers) {
        map.removeLayer(radarLayers[i]);
    }
    mapFrames = [];
    radarLayers = [];
    animationPosition = 0;

    if (!api) {
        return;
    }
    if (kind == 'satellite' && api.satellite && api.satellite.infrared) {
        mapFrames = api.satellite.infrared;

        lastPastFramePosition = api.satellite.infrared.length - 1;
        showFrame(lastPastFramePosition, true);
    }
    else if (api.radar && api.radar.past) {
        mapFrames = api.radar.past;
        if (api.radar.nowcast) {
            mapFrames = mapFrames.concat(api.radar.nowcast);
        }

        // show the last "past" frame
        lastPastFramePosition = api.radar.past.length - 1;
        showFrame(lastPastFramePosition, true);
    }
}

// Check availability and show particular frame position from the timestamps list
function showFrame(nextPosition, force) {

    var preloadingDirection = nextPosition - animationPosition > 0 ? 1 : -1;
    changeRadarPosition(nextPosition, false, force);

    // preload next next frame (typically, +1 frame) to prevent blinking animation at first loop
    changeRadarPosition(nextPosition + preloadingDirection, true);
}

// Display particular frame of animation for the @position
// If preloadOnly parameter is set to true, the frame layer only adds for the tiles preloading purpose
// @param position
// @param preloadOnly
// @param force - display layer immediately
function changeRadarPosition(position, preloadOnly, force) {

    if (mapFrames.length === 0) {
        console.log('Error - no mapFrames found')
    } else {
        while (position >= mapFrames.length) { position -= mapFrames.length }
        while (position < 0) { position += mapFrames.length }
    }

    var currentFrame = mapFrames[animationPosition];
    var nextFrame = mapFrames[position];

    addLayer(nextFrame);

    // Quit if this call is for preloading only by design or some tiles are still loading in background
    if (preloadOnly || (isTilesLoading() && !force)) {
        return;
    }

    animationPosition = position;

    if (radarLayers[currentFrame.path]) {
        radarLayers[currentFrame.path].setOpacity(0);
    }
    radarLayers[nextFrame.path].setOpacity(100);

    // Display if frame is forecast or past radar actuals
    var pastOrForecast = nextFrame.time > Date.now() / 1000 ? ' (forecast)' : '';

    // Display formatted frame time
    var frameDateTime = new Date(nextFrame.time * 1000) 
    var frameHour = frameDateTime.getHours()
    var frameMin = String(frameDateTime.getMinutes()).padStart(2, "0")
    var frameampm = ` am`
    if (frameHour >= 12) { frameampm = ` pm` }
    if (frameHour > 12) { frameHour = frameHour - 12 }
    let frameFormattedTime = `${frameHour}:${frameMin}${frameampm}`
    document.getElementById("timestamp").innerHTML = frameFormattedTime + pastOrForecast

}                     

// Stop the animation
// Check if the animation timeout is set and clear it
function stop() {
    document.getElementById("radarplaystop").innerHTML = 'Play'
    if (animationTimer) {
        clearTimeout(animationTimer);
        animationTimer = false;
        return true;
    }
    return false;
}

function play() {
    document.getElementById("radarplaystop").innerHTML = 'Stop'
    showFrame(animationPosition + 1);
    // Main animation driver. Run this function every 500 ms
    animationTimer = setTimeout(play, 500);
}

function playStop() {
    if (!stop()) {
        play();
    }
}

// Change map options
function setKind(kind) {
    optionKind = kind;
    initialize(apiData, optionKind);
}

function setColors() {
    var e = document.getElementById('colors');
    optionColorScheme = e.options[e.selectedIndex].value;
    initialize(apiData, optionKind);
}

// Animation functions 
// @param path - Path to the XYZ tile
function addLayer(frame) {

    if (!radarLayers[frame.path]) {
        var colorScheme = optionKind == 'satellite' ? 0 : optionColorScheme;
        var smooth = optionKind == 'satellite' ? 0 : optionSmoothData;
        var snow = optionKind == 'satellite' ? 0 : optionSnowColors;

        var source = new L.TileLayer(apiData.host + frame.path + '/' + optionTileSize + '/{z}/{x}/{y}/' + colorScheme + '/' + smooth + '_' + snow + '.png', {
            tileSize: 256,
            opacity: 0.01,
            zIndex: frame.time
        });

        // Track layer loading state to not display the overlay before it completely loads
        source.on('loading', startLoadingTile);
        source.on('load', finishLoadingTile); 
        source.on('remove', finishLoadingTile);

        radarLayers[frame.path] = source;
    }
    if (!map.hasLayer(radarLayers[frame.path])) {
        map.addLayer(radarLayers[frame.path]);
    }
}

// Handle arrow keys for navigation between next / prev frames
document.onkeydown = function (e) {
    e = e || window.event;
    e.preventDefault()
    e.stopImmediatePropagation()
    switch (e.which || e.keyCode) {
        case 37: // left
            stop();
            showFrame(animationPosition - 1, true);
            break;

        case 39: // right
            stop();
            showFrame(animationPosition + 1, true);
            break;

        default:
            return; // exit this handler for other keys
    }
    return false;
    }

function startLoadingTile() {
    loadingTilesCount++;    
}

function finishLoadingTile() {
    // Delayed increase loaded count to prevent changing the layer before it will be replaced by next
    setTimeout(function() { loadedTilesCount++; }, 250);
}

function isTilesLoading() {
    return loadingTilesCount > loadedTilesCount;
}