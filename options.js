var apiKeyInput = document.getElementById('apiKeyInput');
var remoteOptionsSelect = document.getElementById('remoteOptionsSelect');
var saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
var saveRemoteOptionBtn = document.getElementById('saveRemoteOptionBtn');
var statusDiv = document.querySelector('.status-div');

restoreOptions();

setEventHandlers();

function setEventHandlers() {
    saveApiKeyBtn.addEventListener('click', function () {
        var apiKey = apiKeyInput.value;
        if (apiKey == "")
            apiKey = null;

        chrome.storage.local.set({
            apiKey: apiKey
        }, function () {
            chrome.runtime.sendMessage({
                action: "setApiKey",
                newApiKey: apiKey
            });
            statusDiv.innerText = 'Your Api Key has been successfully changed!';
        });
    });

    saveRemoteOptionBtn.addEventListener('click', function () {
        var remoteOptionId = remoteOptionsSelect.value;
        if (remoteOptionId != "default") {
            chrome.storage.local.set({
                remoteOptionId: remoteOptionId
            }, function () {
                chrome.runtime.sendMessage({
                    action: "setRemoteOptionId",
                    newRemoteOptionId: remoteOptionId
                });
                statusDiv.innerText = 'Your default remote account has been successfully changed!';
            });
        } else {
            chrome.storage.local.remove('remoteOptionId', function () {
                chrome.runtime.sendMessage({
                    action: "removeRemoteOptionId"
                });
            });
        }

    });
}

function restoreOptions() {
    chrome.storage.local.get(['apiKey', 'remoteOptionId'], function (object) {
        if (object.apiKey != null) {
            apiKeyInput.value = object.apiKey;
            getRemoteOptionsRequest(object.apiKey)
                .then((data) => {
                    setRemoteOptions(data, object.remoteOptionId);
                })
                .catch((err) => {
                });
        }
    });
}

function setRemoteOptions(data, lastRemoteOptionId) {
    var remoteOptionsArray = JSON.parse(data).data;

    remoteOptionsArray.forEach(function (obj) {
        var type = obj.type;
        var username = obj.username;
        var value = obj.remoteOptionId;

        var text = type + " - " + username;

        var option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        remoteOptionsSelect.appendChild(option);
    });

    if (lastRemoteOptionId != null)
        remoteOptionsSelect.value = lastRemoteOptionId;
}

function getRemoteOptionsRequest(apiKey) {
    return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (this.readyState == 4) {
                resolve(this.responseText);
            }
        }
        request.onerror = function () {
            reject(new Error('Request failed!'));
        }
        request.open("POST", "https://offcloud.com/api/remote-account/list?apikey=" + apiKey, true);
        request.send();
    });
}