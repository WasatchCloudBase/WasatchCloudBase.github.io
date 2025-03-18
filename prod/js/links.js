'use strict';
// External hyperlinks page
// Also builds link on FlySkyHy Custom Airspace page

// Build link DIVs and populate link data
(async () => {
    // Retrieve link data in JSON format from Google sheets API
    // Maintain link data here:  https://docs.google.com/spreadsheets/d/1nBEJuTCWkUidSFKQjBjcJgKeteC_oy8LqL2P7uhGyLQ/edit#gid=0
    var link_data_url = "https://sheets.googleapis.com/v4/spreadsheets/1nBEJuTCWkUidSFKQjBjcJgKeteC_oy8LqL2P7uhGyLQ/values/Links/?alt=json" +
        "&key=AIzaSyDSro1lDdAQsNEZq06IxwjOlQQP1tip-fs"
    var response = await fetch(link_data_url)
    var linkRawJSON = await response.json()
    if (linkRawJSON) {

        // Convert first row (headers) to JSON keys
        var linkData = setJSONKeys(linkRawJSON.values)

        // Build and populate each link div
        for (let i=0; i<linkData.length; i++) {
            try {

                // Clone prototype link DIV
                let cloned_link = document.getElementById(`prototype-link-href`).cloneNode(true)

                //Rename parent and children IDs from prototype clone to new site
                let linkID = linkData[i].LinkID
                cloned_link.id = linkID + `-link`
                cloned_link.children[0].id = linkID + `-link-block`
                cloned_link.children[0].children[0].id = linkID + `-link-name`
                cloned_link.children[0].children[1].id = linkID + `-link-description`

                //Add new site to page under link category
                document.getElementById(linkData[i].LinkCategory).appendChild(cloned_link)

                // Update link data
                document.getElementById(linkID + `-link-name`).innerHTML = linkData[i].LinkName
                document.getElementById(linkID + `-link-description`).innerText = linkData[i].LinkDescription
                document.getElementById(linkID + `-link`).href = linkData[i].LinkURL

                // Display new link
                document.getElementById(linkID + `-link-block`).style.display = 'block'

            } catch (error) { 
                console.log('Link build error: ' + error + ' for link: ' + linkData[i].linkID)
            }
        }
    }
})();