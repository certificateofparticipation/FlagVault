const webhookInput = document.getElementById("webhook");
const targetInput = document.getElementById("target");
const enabledInput = document.getElementById("enabled");

const form = document.getElementById("form");
const body = document.querySelector("body");


async function saveWebhook(event) {
    event.preventDefault();
    let webhook = (webhookInput.value === "" ? undefined : webhookInput.value);
    let target;
    if (targetInput.value === "") {
        target = undefined;
    } else {
        let target1 = (targetInput.value.startsWith("https://") ? targetInput.value : ("https://" + targetInput.value))
        target = (target1.endsWith("/") ? target1.slice(0, -1) : target1);
    }
    let enabled = enabledInput.checked;

    await browser.storage.local.set({
        webhook: webhook,
        target: target,
        enabled: enabled
    });

    console.log("Webhook saved successfully as " + webhook);
    console.log("Target website saved successfully as " + target);
    console.log("Extension enabled status saved successfully as " + enabled);


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
}

form.addEventListener("submit", saveWebhook);
document.addEventListener('DOMContentLoaded', prefillOption);