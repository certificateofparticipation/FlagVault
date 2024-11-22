/*
When an API request is made to the attempt url, the extension will read the body and headers of the request.
It will take the headers and send a request getting all challenges.
It will then cancel the request and send a discord message via a webhook.
 */
let submission;
let name;

async function getStorage(item) {
    const object = await browser.storage.local.get(item);
    if (Object.keys(object).length > 0) {
        return object[item]
    } else {
        return undefined;
    }
}

async function shouldHook(details) {
    const webhook = await getStorage("webhook")
    const target = await getStorage("target");
    const submission = await getStorage("submission");
    if (webhook == null || target == null || submission == null) {
        return false
    }
    if (details.url !== target) {
        return false
    }
    return await getStorage("enabled");
}

async function getRequestBody(details) {
    if (!(await shouldHook(details))) {
        return
    }
    const submissionFieldName = await getStorage("submission");
    const nameFieldName = await getStorage("name");

    let bodyObject = JSON.parse(new TextDecoder("utf-8").decode(details.requestBody.raw[0].bytes));

    submission = bodyObject[submissionFieldName];
    if (nameFieldName == null) {
        name = null
    } else {
        name = bodyObject[nameFieldName]
    }
}

async function getRequestHeaders(details) {
    if (!(await shouldHook(details))) {
        return
    }
    try {
        const webhook = await getStorage("webhook")
        const username = await getStorage("username");

        // ----- sends discord message ------
        console.log("Sending discord message...")

        await fetch(webhook, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                embeds: [
                    {
                        title: (name != null ? name : "Unknown Challenge Name! Please send the actual name..."),
                        description: "`" + submission + "`",
                        timestamp: new Date().toISOString(),
                        author: {
                            name: (username != null ? username + " submitted:" : "Unknown user submitted:")
                        }
                    }
                ]
            }),
        })
        console.log("Done! Cancelling submission request.")
    } finally {
        // while exception will be lost, this is required to guarantee that submissions will be cancelled
        return { cancel: true };
    }
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