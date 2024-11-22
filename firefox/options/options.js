const webhookInput = document.getElementById("webhook");
const targetInput = document.getElementById("target");
const submissionInput = document.getElementById("submission");
const enabledInput = document.getElementById("enabled");
const usernameInput = document.getElementById("username");
const nameInput = document.getElementById("name");

const form = document.getElementById("form");

const submitButton = document.getElementById("submit");

function standardizeInput(input) {
    if (input === "") {
        return undefined
    }
    return input.trim()
}

async function getStorage(item) {
    const object = await browser.storage.local.get(item);
    if (Object.keys(object).length > 0) {
        return object[item]
    } else {
        return undefined;
    }
}

async function saveData(event) {
    event.preventDefault();
    const webhook = standardizeInput(webhookInput.value);
    const target = standardizeInput(targetInput.value);
    const submission = standardizeInput(submissionInput.value);
    const enabled = enabledInput.checked;
    const username = standardizeInput(usernameInput.value);
    const name = standardizeInput(nameInput.value);

    await browser.storage.local.set({
        webhook: webhook,
        target: target,
        submission: submission,
        enabled: enabled,
        username: username,
        name: name,
    });

    console.log("Webhook saved successfully as " + webhook);
    console.log("Target website saved successfully as " + target);
    console.log("Submission Field Name saved successfully as " + submission);
    console.log("Extension enabled status saved successfully as " + enabled);
    console.log("Username saved successfully as " + username);
    console.log("Challenge Field Name saved successfully as " + name);

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

    const submission = await getStorage("submission");
    if (submission != null) {
        submissionInput.value = submission;
    }

    const enabled = await getStorage("enabled");
    if (enabled != null) {
        enabledInput.checked = enabled;
    }

    const username = await getStorage("username");
    if (username != null) {
        usernameInput.value = username;
    }

    const name = await getStorage("name");
    if (name != null) {
        nameInput.value = name;
    }
}

async function changeStatus() {
    async function getStatus() {
        const webhook = await getStorage("webhook")
        const target = await getStorage("target");
        const submission = await getStorage("submission");
        if (webhook == null || target == null || submission == null) {
            return false
        }
        return await getStorage("enabled")
    }
    const status = await getStatus()
    submitButton.innerHTML = (status ? "Save | Status: Enabled" : "Save | Status: Disabled")
}

form.addEventListener("submit", saveData);
document.addEventListener('DOMContentLoaded', prefillOption);
document.addEventListener('DOMContentLoaded', changeStatus);