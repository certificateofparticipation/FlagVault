/*
When an API request is made to the attempt url, the extension will read the body and headers of the request.
It will take the headers and send a request getting all challenges.
It will then cancel the request and send a discord message via a webhook.
 */
let challengeID;
let submission;

async function returnEarly(details) {
    let webhookObject = await browser.storage.local.get("webhook");
    let targetObject = await browser.storage.local.get("target");
    if (Object.keys(webhookObject).length <= 0 && Object.keys(targetObject).length <= 0) {
        return true
    }
    if (details.url !== targetObject.target + "/api/v1/challenges/attempt") {
        return true
    }
    let enabledObject = await browser.storage.local.get("enabled");
    if (enabledObject && !enabledObject.enabled) {
        return true
    }
    return false
}

async function getRequestBody(details) {
    if (await returnEarly(details)) {
        return
    }

    let bodyObject = JSON.parse(new TextDecoder("utf-8").decode(details.requestBody.raw[0].bytes));
    challengeID = bodyObject.challenge_id
    submission = bodyObject.submission
}

async function getRequestHeaders(details) {
    if (await returnEarly(details)) {
        return
    }
    let webhookObject = await browser.storage.local.get("webhook");
    let targetObject = await browser.storage.local.get("target");

    // ----- fetches the challenge name ------
    console.log("Making request for all challenges...")

    const fetchHeaders = new Headers();
    details.requestHeaders.forEach((value, key) => {
        fetchHeaders.append(key, value);
    });

    let rawChallenges = await fetch(targetObject.target + "/api/v1/challenges", {
        method: "GET",
        headers: fetchHeaders,
    })

    let challenges = JSON.parse(await rawChallenges.text())
    console.log("Received response to request!")

    let challengeName;
    for (let challenge of challenges.data) {
        if (challenge.id === challengeID) {
            challengeName = challenge.name
        }
    }
    console.log("Identified challenge name: " + challengeName)

    // ----- sends discord message ------
    console.log("Sending discord message...")

    await fetch(webhookObject.webhook, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            content: 'Somebody made a submission!',
            embeds: [
                {
                    title: "Challenge Name: " + challengeName,
                    description: submission,
                }
            ]
        }),
    })

    console.log("Done! Cancelling submission request.")
    return { cancel: true };
}

browser.webRequest.onBeforeRequest.addListener(
    getRequestBody,
    { urls: ["<all_urls>"] },
    ["blocking", "requestBody"]
);

browser.webRequest.onBeforeSendHeaders.addListener(
    getRequestHeaders,
    { urls: ["<all_urls>"] },
    ["blocking", "requestHeaders"]
);