async function getStorage(item) {
    let object = await browser.storage.local.get(item);
    if (Object.keys(object).length > 0) {
        return object[item]
    } else {
        return undefined;
    }
}

async function shouldHook() {
    let webhook = await getStorage("webhook")
    let target = await getStorage("target");
    if (webhook == null || target == null) {
        return false
    }
    if (document.location.hostname !== target) {
        return false
    }
    let challengeWindow = document.getElementById("challenge-window")
    if (challengeWindow == null) {
        return false
    }

    return await getStorage("enabled");
}

function getReminder() {
    let rowDiv = document.createElement("div");
    rowDiv.classList.add("row");
    rowDiv.id = "flagvault";
    rowDiv.style.marginTop = "1.25rem"

    let wrapperDiv = document.createElement("div");
    wrapperDiv.classList.add("col-12");
    wrapperDiv.style.display = "flex";
    wrapperDiv.style.flexDirection = "column";
    wrapperDiv.style.justifyContent = "center";
    wrapperDiv.style.alignItems = "center";
    wrapperDiv.style.background = "#FF5555"
    wrapperDiv.style.padding = "1rem";
    rowDiv.appendChild(wrapperDiv);

    let p = document.createElement("p");
    p.innerHTML = "FlagVault extension active! Submissions will not count.";
    p.style.fontWeight = "bold";
    p.style.marginBottom = "0";
    p.style.color = "#FFFFFF"
    wrapperDiv.appendChild(p);

    return rowDiv
}

function getChallengeID() {
    const modalDialog = document.querySelector("div.modal-dialog");
    if (modalDialog) {
        const data = modalDialog.getAttribute("x-init")
        const match = data.match(/id\s*=\s*(\d+)/);

        if (match) {
            return parseInt(match[1], 10)
        }
    }
}

async function getSession() {
}

async function getChallengeDetails() {
}

async function sendDiscordDetails(details, submission) {
    const webhook = await getStorage("webhook")
    const username = await getStorage("username")

    await fetch(webhook, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            embeds: [
                {
                    title: details.name,
                    description: "`" + submission + "`",
                    timestamp: new Date().toISOString(),
                    author: {
                        name: (username != null) ? username + " submitted:" : "Unknown user submitted:",
                    },
                    footer: {
                        text: "Worth " + details.value + " points, " + details.solves + " solves at submission",
                    }
                }
            ]
        }),
    })
}

async function submitAttempt(submission) {
    getSession()
}

function addListener() {
    const submitButton = document.getElementById("challenge-submit");
    const challengeDiv = document.getElementById("challenge");
    const challengeInput = document.getElementById("challenge-input");

    if (submitButton && challengeDiv && challengeInput) {
        submitButton.removeAttribute("@click.debounce.500ms")
        submitButton.innerHTML = "Attempt"
        submitButton.style.fontWeight = "bold";
        submitButton.addEventListener("click", (event) => {
            event.stopImmediatePropagation();
            event.preventDefault();
            submitAttempt(challengeInput.innerText);
        });

        let hasReminder = false
        for (let element of submitButton.children) {
            if (element.id === "flagvault") {
                hasReminder = true
            }
        }
        if (!hasReminder) {
            challengeDiv.appendChild(getReminder());
        }


    }
}

document.addEventListener("DOMContentLoaded", async () => {
    let enable = await shouldHook()
    if (!enable) {
        return
    }

    let challengeWindow = document.getElementById("challenge-window")
    new MutationObserver(() => {
        if (challengeWindow.style.display !== "block") {
            return
        }
        addListener()
    }).observe(challengeWindow, {attributes: true, attributeFilter: ["style"]});
})