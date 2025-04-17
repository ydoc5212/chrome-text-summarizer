document.addEventListener("DOMContentLoaded", () => {
    const apiKeyInput = document.getElementById("api-key");
    const saveButton = document.getElementById("save-button");
    const statusDiv = document.getElementById("status");

    // Function to save the API key
    function saveOptions() {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            chrome.storage.local.set({ geminiApiKey: apiKey }, () => {
                // Update status to let user know options were saved.
                statusDiv.textContent = "API Key saved.";
                statusDiv.style.color = "green";
                console.log("API Key saved.");
                setTimeout(() => {
                    statusDiv.textContent = "";
                }, 2000); // Clear message after 2 seconds
            });
        } else {
            // Handle case where key is empty if needed
            statusDiv.textContent = "Please enter an API Key.";
            statusDiv.style.color = "red";
            console.log("Attempted to save empty API Key.");
            setTimeout(() => {
                statusDiv.textContent = "";
            }, 2000);
        }
    }

    // Function to restore the saved API key when the options page loads
    function restoreOptions() {
        chrome.storage.local.get(["geminiApiKey"], (result) => {
            if (result.geminiApiKey) {
                apiKeyInput.value = result.geminiApiKey;
                console.log("Loaded existing API key.");
            } else {
                console.log("No API key found in storage.");
            }
        });
    }

    // Add event listeners
    saveButton.addEventListener("click", saveOptions);
    restoreOptions(); // Load existing options when the page loads
});
