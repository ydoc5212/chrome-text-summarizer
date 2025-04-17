document.addEventListener("DOMContentLoaded", () => {
    const loadingIndicator = document.getElementById("loading-indicator");
    const summaryContent = document.getElementById("summary-content");
    const errorMessage = document.getElementById("error-message");
    const originalTextElement = document.getElementById("original-text");

    // New elements for custom prompt
    const promptInput = document.getElementById("prompt-input");
    const savePromptButton = document.getElementById("save-prompt-button");
    const saveStatus = document.getElementById("save-status");

    // Default prompt
    const DEFAULT_PROMPT = "Summarize the following text:";

    // Function to load the custom prompt
    function loadCustomPrompt() {
        chrome.storage.sync.get(["customPrompt"], (result) => {
            const currentPrompt = result.customPrompt || DEFAULT_PROMPT;
            promptInput.value = currentPrompt;
            console.log("Loaded prompt:", currentPrompt);
        });
    }

    // Function to save the custom prompt
    function saveCustomPrompt() {
        const newPrompt = promptInput.value.trim();
        if (newPrompt) {
            chrome.storage.sync.set({ customPrompt: newPrompt }, () => {
                console.log("Saved prompt:", newPrompt);
                saveStatus.textContent = "Prompt saved!";
                setTimeout(() => {
                    saveStatus.textContent = "";
                }, 2000); // Clear message after 2 seconds
            });
        } else {
            // Handle empty prompt case if needed, maybe revert to default or show error
            saveStatus.textContent = "Prompt cannot be empty.";
            setTimeout(() => {
                saveStatus.textContent = "";
            }, 2000); // Clear message after 2 seconds
        }
    }

    // Add event listener for the save button
    savePromptButton.addEventListener("click", saveCustomPrompt);

    // Load the prompt when the popup opens
    loadCustomPrompt();

    // Function to update the popup UI
    function updatePopup(data) {
        // Update original text display
        if (data.selectedText) {
            originalTextElement.textContent = data.selectedText;
        } else {
            originalTextElement.textContent =
                "(No text selected recently or popup opened directly)";
        }

        // Handle loading state
        if (data.isLoading) {
            loadingIndicator.classList.remove("hidden");
            summaryContent.classList.add("hidden");
            errorMessage.classList.add("hidden");
        } else {
            loadingIndicator.classList.add("hidden");
            // Handle error display
            if (data.error) {
                summaryContent.classList.add("hidden");
                errorMessage.textContent = `Error: ${data.error}`;
                errorMessage.classList.remove("hidden");
            } else {
                // Display summary
                errorMessage.classList.add("hidden");
                summaryContent.textContent =
                    data.summaryText || "(Summary not available yet)";
                summaryContent.classList.remove("hidden");
            }
        }
    }

    // Immediately try to load data from storage when popup opens
    chrome.storage.local.get(
        ["selectedText", "summaryText", "isLoading", "error"],
        (result) => {
            console.log("Popup opened, loaded data:", result);
            updatePopup(result);
        }
    );

    // Listen for changes in storage (e.g., when summary finishes loading)
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === "local") {
            console.log("Storage changed:", changes);
            // We need to fetch all relevant keys again as changes only contains the changed keys
            chrome.storage.local.get(
                ["selectedText", "summaryText", "isLoading", "error"],
                (result) => {
                    console.log(
                        "Updating popup due to storage change:",
                        result
                    );
                    updatePopup(result);
                }
            );
        }
    });

    const apiKeyInput = document.getElementById("popup-api-key");
    const saveButton = document.getElementById("popup-save-key");
    const statusDiv = document.getElementById("popup-status");

    // Function to save the API key (using local storage)
    function saveApiKey() {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            chrome.storage.local.set({ geminiApiKey: apiKey }, () => {
                statusDiv.textContent = "API Key saved.";
                statusDiv.style.color = "green";
                console.log("API Key saved via popup.");
                setTimeout(() => {
                    statusDiv.textContent = "";
                }, 2000); // Clear message after 2 seconds
            });
        } else {
            statusDiv.textContent = "Please enter an API Key.";
            statusDiv.style.color = "red";
            setTimeout(() => {
                statusDiv.textContent = "";
            }, 2000);
        }
    }

    // Function to restore the saved API key when the popup loads
    function restoreApiKey() {
        // Use default value of null to distinguish between unset and empty string
        chrome.storage.local.get({ geminiApiKey: null }, (result) => {
            if (result.geminiApiKey) {
                apiKeyInput.value = result.geminiApiKey;
                console.log("Loaded API key into popup.");
            } else {
                console.log("No API key found in storage (popup).");
                // Optional: Set placeholder or leave empty
                apiKeyInput.placeholder = "Enter API key here";
            }
        });
    }

    // Add event listeners
    saveButton.addEventListener("click", saveApiKey);

    // Load existing options when the page loads
    restoreApiKey();
});
