const webhookInput = document.getElementById("webhook");
const targetInput = document.getElementById("target");
const enabledInput = document.getElementById("enabled");

const form = document.getElementById("form");
const body = document.querySelector("body");


async function saveWebhook(event) {
    event.preventDefault();
    let webhook = webhookInput.value;
    let target1 = (targetInput.value.startsWith("https://") ? targetInput.value : ("https://" + targetInput.value))
    let target = (target1.endsWith("/") ? target1.slice(0, -1) : target1);
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
    if (webhook !== undefined) {
        webhookInput.value = webhook.webhook;
    }

    let target = await browser.storage.local.get("target");
    if (target !== undefined) {
        targetInput.value = target.target;
    }

    let enabled = await browser.storage.local.get("enabled");
    if (enabled !== undefined) {
        enabledInput.checked = enabled.enabled;
    }
}

form.addEventListener("submit", saveWebhook);
document.addEventListener('DOMContentLoaded', prefillOption);