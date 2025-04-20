document.addEventListener("DOMContentLoaded", () => {
    const originalTextDiv = document.getElementById("original-text-content");
    const summaryDiv = document.getElementById("summary-content");
    const promptInput = document.getElementById("prompt-input");
    const summarizeButton = document.getElementById("summarize-button");
    const promptSaveStatus = document.getElementById("prompt-save-status");

    const params = new URLSearchParams(window.location.search);
    const originalTextEncoded = params.get("original");
    let originalText = "(Original text not provided)";
    const DEFAULT_PROMPT = "Summarize the following text:"; // Match default in background.js

    // Display Original Text
    if (originalTextEncoded) {
        try {
            originalText = decodeURIComponent(originalTextEncoded);
            originalTextDiv.textContent = originalText;
        } catch (e) {
            console.error("Error decoding original text:", e);
            originalTextDiv.textContent = "(Error decoding original text)";
            originalTextDiv.classList.add("error");
            summaryDiv.textContent =
                "(Cannot proceed without valid original text)";
            summaryDiv.classList.add("error");
            summarizeButton.disabled = true; // Disable button if text is invalid
            promptInput.disabled = true;
            return; // Stop
        }
    } else {
        originalTextDiv.textContent = originalText; // Display default message
        summaryDiv.textContent = "(Cannot fetch summary without original text)";
        summaryDiv.classList.add("error");
        summarizeButton.disabled = true; // Disable button if no text
        promptInput.disabled = true;
        return; // Stop
    }

    // Fetch and display the current prompt
    chrome.storage.sync.get(["customPrompt"], (result) => {
        promptInput.value = result.customPrompt || DEFAULT_PROMPT;
    });

    // Prompt Confirmation
    summaryDiv.textContent = "Loading prompt..."; // Initial status
    summaryDiv.classList.remove("error");

    // --- Handle Summarize Button Click ---
    summarizeButton.addEventListener("click", () => {
        const currentPrompt = promptInput.value.trim();
        const textToSummarize = originalText; // Already decoded and validated

        // Disable button during processing
        summarizeButton.disabled = true;
        promptInput.disabled = true;
        summaryDiv.textContent = "Saving prompt and fetching summary...";
        summaryDiv.classList.remove("error");
        promptSaveStatus.textContent = ""; // Clear previous status

        // 1. Save the potentially edited prompt
        if (currentPrompt) {
            chrome.storage.sync.set({ customPrompt: currentPrompt }, () => {
                console.log("Saved prompt from new tab page:", currentPrompt);
                promptSaveStatus.textContent = "Prompt saved!";
                setTimeout(() => {
                    promptSaveStatus.textContent = "";
                }, 2000);

                // 2. Request summary from background script (after saving)
                chrome.runtime.sendMessage(
                    { action: "getSummary", textToSummarize: textToSummarize },
                    handleBackgroundResponse
                );
            });
        } else {
            // Handle empty prompt case - maybe revert to default or show error?
            // For now, show an error and don't proceed.
            summaryDiv.textContent = "Prompt cannot be empty.";
            summaryDiv.classList.add("error");
            summarizeButton.disabled = false; // Re-enable button
            promptInput.disabled = false;
        }
    });

    // --- Function to handle response from background script ---
    function handleBackgroundResponse(response) {
        if (chrome.runtime.lastError) {
            console.error(
                "Error sending/receiving message:",
                chrome.runtime.lastError
            );
            summaryDiv.textContent = `Error communicating with background: ${chrome.runtime.lastError.message}`;
            summaryDiv.classList.add("error");
        } else if (response && response.error) {
            console.error("Error from background:", response.error);
            summaryDiv.textContent = `Error: ${response.error}`;
            summaryDiv.classList.add("error");
        } else if (response && response.result) {
            summaryDiv.textContent = response.result;
            summaryDiv.classList.remove("error");
        } else {
            console.error("Unexpected response:", response);
            summaryDiv.textContent = "Received an unexpected response.";
            summaryDiv.classList.add("error");
        }
        // Re-enable button and prompt input after completion or error
        summarizeButton.disabled = false;
        promptInput.disabled = false;
    }
});
