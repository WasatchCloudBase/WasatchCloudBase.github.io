'use strict';
// Globals
const wwGrn = '#20c997' // Bootstrap teal
const wwYlw = '#ffc107' // Bootstrap yellow (warning)
const wwOrg = '#fd7e14' // Bootstrap orange
const wwRed = '#dc3545' // Bootstrap red (danger)

// Set defaults
let currentDiv = 'Enter New Flight'
document.getElementById('current-div').innerHTML = currentDiv
let user_name = 'Mike'
document.getElementById('user_name').innerHTML = user_name

// Set flight log entry default date
let today = new Date();
let day = today.getDate(); // typeof = number
let month = ('0' + (today.getMonth()+1)).slice(-2) // typeof = number
let year = today.getFullYear(); // typeof = number
let currentDate = `${year}-${month}-${day}`; // typeof = string;
document.getElementById('flightDate').value = currentDate;

function menu() { document.getElementById('menu').classList.toggle('show') }

function reload() {
    history.scrollRestoration = 'manual'
    location.reload()
}

function runcode() {
    document.getElementById('flightLocationLabel').innerText = 'CODE RAN';
}


function toggleDiv(newDiv) {
    document.getElementById('menu').classList.toggle('show')
    document.getElementById(currentDiv).style.display = 'none'
    currentDiv = newDiv
    document.getElementById(currentDiv).scrollTop = 0
    document.getElementById('current-div').innerHTML = currentDiv
    document.getElementById(currentDiv).style.display = 'block'
}

// Make CORS requests to external sites via proxy server
function doCORSRequest(options, result) {
    var cors_api_url = 'https://wasatchcloudbase.herokuapp.com/'
    var ServerRequest = new XMLHttpRequest()
    ServerRequest.open(options.method, cors_api_url + options.url)
    ServerRequest.onload = ServerRequest.onerror = function() {
        result(ServerRequest.responseText)
        // Can add to result for debugging:  options.method + ' ' + options.url + '\n' + ServerRequest.status + ' ' + ServerRequest.statusText + '\n\n' +
    }
    ServerRequest.send(options.data);
}

// Set defaults for flight log entry
(async () => {
    
})();