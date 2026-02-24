// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "autofill") {
        const { title, content } = request.data;
        let success = false;

        // 1. Heuristic approach: Find the largest textarea or editor for content
        const textareas = Array.from(document.querySelectorAll('textarea'));

        let targetContentArea = null;
        if (textareas.length > 0) {
            // Assume the largest or first textarea is the main content body
            // We sort by height/area if there are multiple, or just take the most relevant looking one
            textareas.sort((a, b) => (b.offsetHeight * b.offsetWidth) - (a.offsetHeight * a.offsetWidth));
            targetContentArea = textareas[0];
        }

        // 2. Heuristic approach: Find input for title
        const inputs = Array.from(document.querySelectorAll('input[type="text"]'));
        let targetTitleInput = null;

        // Find inputs that might be titles (name/id contains 'title', 'subject', etc)
        const possibleTitles = inputs.filter(input => {
            const id = (input.id || '').toLowerCase();
            const name = (input.name || '').toLowerCase();
            const placeholder = (input.placeholder || '').toLowerCase();
            return id.includes('title') || name.includes('title') || placeholder.includes('title') ||
                id.includes('subject') || name.includes('subject') || placeholder.includes('subject');
        });

        if (possibleTitles.length > 0) {
            targetTitleInput = possibleTitles[0];
        } else if (inputs.length > 0) {
            // Fallback: take the first text input available if nothing explicitly matches 'title'
            targetTitleInput = inputs[0];
        }

        // Apply values and trigger React/Vue synthetic events
        const triggerInputEvent = (element, value) => {
            if (!element) return;

            // Set value
            element.value = value;

            // Dispatch standard events so SPAs register the change
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));

            // React 15/16/17 hack for controlled inputs
            const tracker = element._valueTracker;
            if (tracker) {
                tracker.setValue(value);
            }
        };

        if (title && targetTitleInput) {
            triggerInputEvent(targetTitleInput, title);
            success = true;
        }

        if (content && targetContentArea) {
            triggerInputEvent(targetContentArea, content);
            success = true;
        }

        // NOTE: Strictly no auto-submit logic here as per requirements.
        console.log("[Submission Assistant] Autofill complete. User must manually submit.");

        sendResponse({ success });
    }
    return true; // Keep message channel open for async response
});
