import {promptGPT3Prompting, checkAPIKey} from './gpt3.js';

function setIcon() {
    chrome.storage.sync.get('APIKEY', function (items) {
        // Check that the API key exists
        if (typeof items.APIKEY == 'undefined') {
            // run your script from here
            chrome.action.setIcon({path: "icons/icon16.png"})
        }
    });
}

function createContextMenu() {
    // if the context menu already exists, erase it
    chrome.contextMenus.removeAll();
    // create a new context menu
    chrome.contextMenus.create({
        id: 'GPT-BusinessEmail',
        title: 'Magic rewrite',
        documentUrlPatterns: ["https://*/*", "http://*/*", "file:///*"],
        contexts: ["selection", "page", "frame"]
    });
}

// LISTENER DECLARATION

chrome.runtime.onInstalled.addListener(function () {
    setIcon();
    createContextMenu()
});

// listen for a signal to refresh the context menu
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.text === "checkAPIKey") {
        (async () => {
            await checkAPIKey(message.apiKey);
        })();
        return
    }
    if (message.text === "launchGPT") {
        // get the tab from the sender
        const tab = sender.tab;
        console.log('launch GPT from', tab);
        chrome.storage.sync.get('APIKEY', function (items) {
            if (typeof items.APIKEY !== 'undefined') {
                (async () => {
                    await promptGPT3Prompting(message.prompt, items, tab);
                })();
            }
        });
        return
    }
    console.log("Received unknown message in background thread:" + message);
});


chrome.contextMenus.onClicked.addListener((info, tabs) => {

    // may be undefined
    let prompt = {};
    let promptText = "Could you please expand on #TEXT#";
    promptText = promptText.replaceAll('#TEXT#', info.selectionText);
    prompt["prompt"] = promptText;
    prompt["max_tokens"] = 1024;
    prompt["temperature"] = 0.1;// Use the right one
    prompt["model"] = "text-davinci-003";

    // replace the selected text in the prompt
    chrome.storage.sync.get('APIKEY', function (items) {
        if (typeof items.APIKEY !== 'undefined') {
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {message: 'showPopUp'});
            });
            (async () => {
                await promptGPT3Prompting(prompt, items, tabs)
            })();
        } else {
            chrome.tabs.sendMessage(tabs.id, 'APIKEY not found. Click on the GPT-prompter icon to set it.');
            console.log('Error: No API key found.');
        }
    })
});


