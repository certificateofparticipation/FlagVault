const webhookInput = document.getElementById("webhook");
const targetInput = document.getElementById("target");
const enabledInput = document.getElementById("enabled");
const usernameInput = document.getElementById("username");

const form = document.getElementById("form");
const body = document.querySelector("body");

const status = document.getElementById("status");

function standardizeInput(input) {
    if (input === "") {
        return undefined
    }
    return input.trim()
}

async function saveWebhook(event) {
    event.preventDefault();
    let webhook = standardizeInput(webhookInput.value);
    let target = standardizeInput(targetInput.value);
    target = (target.startsWith("https://") ? target : ("https://" + target))
    target = (target.endsWith("/") ? target.slice(0, -1) : target);
    let enabled = enabledInput.checked;
    let username = standardizeInput(usernameInput.value);

    await browser.storage.local.set({
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

    body.style.background = "green";
    setTimeout(() => {
        body.style.background = "white";
    }, 1000);
}

async function prefillOption() {
    let webhook = await browser.storage.local.get("webhook");
    if (Object.keys(webhook).length > 0) {
        webhookInput.value = webhook.webhook;
    }

    let target = await browser.storage.local.get("target");
    if (Object.keys(target).length > 0) {
        targetInput.value = target.target;
    }

    let enabled = await browser.storage.local.get("enabled");
    if (Object.keys(enabled).length > 0) {
        enabledInput.checked = enabled.enabled;
    }

    let username = await browser.storage.local.get("username");
    if (Object.keys(username).length > 0) {
        usernameInput.value = username.username;
    }
}

async function changeStatus() {
    let webhookObject = await browser.storage.local.get("webhook");
    let targetObject = await browser.storage.local.get("target");
    if (Object.keys(webhookObject).length <= 0 || Object.keys(targetObject).length <= 0) {
        status.innerText = "Status: Disabled";
        return
    }
    let enabledObject = await browser.storage.local.get("enabled");
    if (Object.keys(enabledObject).length <= 0 && !enabledObject.enabled) {
        status.innerText = "Status: Disabled";
        return
    }
    status.innerText = "Status: Enabled";
}

form.addEventListener("submit", saveWebhook);
document.addEventListener('DOMContentLoaded', prefillOption);
document.addEventListener('DOMContentLoaded', changeStatus);