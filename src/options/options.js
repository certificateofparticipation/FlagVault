const webhookInput = document.getElementById("webhook");
const targetInput = document.getElementById("target");
const enabledInput = document.getElementById("enabled");
const usernameInput = document.getElementById("username");

const form = document.getElementById("form");

const submitButton = document.getElementById("submit");

function standardizeInput(input) {
    if (input === "") {
        return undefined
    }
    return input.trim()
}

function getHostname(url) {
    if (!/^https?:\/\//i.test(url)) {
        url = 'http://' + url;
    }
    const parsedUrl = new URL(url);
    return parsedUrl.hostname;
}

async function getStorage(item) {
    const object = await chrome.storage.local.get(item);
    if (Object.keys(object).length > 0) {
        return object[item]
    } else {
        return undefined;
    }
}

async function saveData(event) {
    event.preventDefault();
    const webhook = standardizeInput(webhookInput.value);
    let target = standardizeInput(targetInput.value);
    target = (target == null ? undefined : getHostname(target));
    const enabled = enabledInput.checked;
    const username = standardizeInput(usernameInput.value);

    await chrome.storage.local.set({
        webhook: webhook,
        target: target,
        enabled: enabled,
        username: username,
    });

    console.log("Webhook saved successfully as " + webhook);
    console.log("Target website saved successfully as " + target);
    console.log("Extension enabled status saved successfully as " + enabled);
    console.log("Username saved successfully as " + username);

    changeStatus()
    prefillOption()

    submitButton.style.background = "#00AA00";
    setTimeout(() => {
        submitButton.style.background = "";
    }, 1000)
}

async function prefillOption() {
    const webhook = await getStorage("webhook");
    if (webhook != null) {
        webhookInput.value = webhook;
    }

    const target = await getStorage("target");
    if (target != null) {
        targetInput.value = target;
    }

    const enabled = await getStorage("enabled");
    if (enabled != null) {
        enabledInput.checked = enabled;
    }

    const username = await getStorage("username");
    if (username != null) {
        usernameInput.value = username;
    }
}

async function changeStatus() {
    async function getStatus() {
        const webhook = await getStorage("webhook")
        const target = await getStorage("target");
        if (webhook == null || target == null) {
            return false
        }
        const enabled = await getStorage("enabled")
        if (enabled == null) {
            return false
        }
        return enabled
    }
    const status = await getStatus()
    submitButton.innerHTML = (status ? "Save | Status: Enabled" : "Save | Status: Disabled")
}

form.addEventListener("submit", saveData);
document.addEventListener('DOMContentLoaded', prefillOption);
document.addEventListener('DOMContentLoaded', changeStatus);