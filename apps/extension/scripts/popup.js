document.addEventListener('DOMContentLoaded', () => {
    const autofillBtn = document.getElementById('autofillBtn');
    const titleInput = document.getElementById('reportTitle');
    const contentInput = document.getElementById('reportContent');
    const statusDiv = document.getElementById('status');

    // Load saved previous text from local storage for convenience
    chrome.storage.local.get(['savedTitle', 'savedContent'], (data) => {
        if (data.savedTitle) titleInput.value = data.savedTitle;
        if (data.savedContent) contentInput.value = data.savedContent;
    });

    // Save inputs as the user types
    const saveToStorage = () => {
        chrome.storage.local.set({
            savedTitle: titleInput.value,
            savedContent: contentInput.value
        });
    };

    titleInput.addEventListener('input', saveToStorage);
    contentInput.addEventListener('input', saveToStorage);

    autofillBtn.addEventListener('click', async () => {
        const title = titleInput.value;
        const content = contentInput.value;

        if (!title && !content) {
            alert('Please paste a title or content first.');
            return;
        }

        // Get the current active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (tab) {
            // Execute the autofill script on the active tab
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['scripts/content.js']
            }, () => {
                // After injecting the content script, send the data via message
                chrome.tabs.sendMessage(tab.id, {
                    action: "autofill",
                    data: { title, content }
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('Error sending message:', chrome.runtime.lastError);
                        alert('Could not autofill. Make sure you are on a compatible web page (not a Chrome settings page).');
                    } else if (response && response.success) {
                        statusDiv.style.display = 'block';
                        setTimeout(() => {
                            statusDiv.style.display = 'none';
                        }, 3000);
                    } else {
                        alert('Could not find compatible input fields on this page.\\nTry clicking into the text box first.');
                    }
                });
            });
        }
    });
});
