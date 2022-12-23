// GENERAL FUNCTIONS


function toggleSaveKeyButton() {
    //display the element with id 'apikey' and the 'saveKey' button
    if (document.getElementById('apikey').style.display === 'none') {
        document.getElementById('apikey').style.display = 'block';
        document.getElementById('saveKey').style.display = 'block';
        document.getElementById('deleteKey').style.display = 'block';
        document.getElementById('linktoAPI').style.display = 'block';
        document.getElementById('showKey').innerHTML = 'Hide API';
    } else {
        document.getElementById('apikey').style.display = 'none';
        document.getElementById('saveKey').style.display = 'none';
        document.getElementById('deleteKey').style.display = 'none';
        document.getElementById('linktoAPI').style.display = 'none';
        document.getElementById('showKey').innerHTML = 'Show API';
    }
}

function hideSaveKey() {
    //hide the element with id 'apikey' and the 'saveKey' button
    document.getElementById('apikey').style.display = 'none';
    document.getElementById('saveKey').style.display = 'none';
    document.getElementById('deleteKey').style.display = 'none';
    document.getElementById('linktoAPI').style.display = 'none';
    document.getElementById('showKey').style.display = 'block';
}

function onSaveKey() {
    //send a message to background.js to check the API key
    chrome.runtime.sendMessage({text: "checkAPIKey", apiKey: document.getElementById('apikey').value});
}

function Temp() {
    document.getElementById("temp").value = document.getElementById("temperature").value;
}


function Token() {
    document.getElementById("token").value = document.getElementById("maxtoken").value;
}

function onDeleteKey() {
    //send a message to background.js to delete the API key
    chrome.storage.sync.remove('APIKEY');
    // take the value of the input and erase it
    document.getElementById('apikey').value = 'API KEY deleted!';
    setTimeout(function () {
        document.getElementById('apikey').value = "";
    }, 2000);
}

//add Listenere to deleteKey button
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('maxtoken').addEventListener('mousemove', Token, false)
    document.getElementById('saveKey').addEventListener('click', onSaveKey, false);
    document.getElementById('deleteKey').addEventListener('click', onDeleteKey, false);
    document.getElementById('showKey').addEventListener('click', toggleSaveKeyButton, false);
    document.getElementById('temperature').addEventListener('mousemove', Temp, false)

    const link = document.getElementById('linktoAPI');
    const location = link.href;
    link.onclick = function () {
        chrome.tabs.create({active: true, url: location});
    };
}, false)

function saveKey() {
    // Get a value saved in an input
    const apiKey = document.getElementById('apikey').value;
    // Save it using the Chrome extension storage API
    chrome.storage.sync.set({'APIKEY': apiKey}, function () {
        // Notify that we saved
        console.log('Your API key was saved.');
    });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message === "API key is valid") {
        saveKey(); // if the API key is valid, save it
        chrome.action.setIcon({path: "icons/iconA16.png"})
        // change the value of 'showKey' to 'Successfully saved' for 1 second
        document.getElementById('apikey').value = "API Key is valid!";
        setTimeout(function () {
            hideSaveKey();
        }, 4000);
    } else if (request.message === "API key is invalid") {
        // write in apikey the message 'API key is invalid'
        document.getElementById('apikey').value = "API key is invalid";
        setTimeout(function () {
            document.getElementById('apikey').value = "";
        }, 4000);
    }
});

