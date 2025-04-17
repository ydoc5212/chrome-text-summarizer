document.addEventListener("DOMContentLoaded", () => {
    const loadingIndicator = document.getElementById("loading-indicator");
    const summaryContent = document.getElementById("summary-content");
    const errorMessage = document.getElementById("error-message");
    const originalTextElement = document.getElementById("original-text");

    // New elements for custom prompt
    const promptInput = document.getElementById("prompt-input");
    const saveStatus = document.getElementById("save-status");

    // Default prompt
    const DEFAULT_PROMPT = "Summarize the following text:";
    let saveTimeout;

    // --- Debounce Utility ---
    function debounce(func, delay) {
        let debounceTimer;
        return function () {
            const context = this;
            const args = arguments;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(context, args), delay);
        };
    }
    // ------------------------

    // Function to load the custom prompt
    function loadCustomPrompt() {
        chrome.storage.sync.get(["customPrompt"], (result) => {
            const currentPrompt = result.customPrompt || DEFAULT_PROMPT;
            promptInput.value = currentPrompt;
            console.log("Loaded prompt into sidepanel:", currentPrompt);
        });
    }

    // Function to save the custom prompt (modified for debounce)
    function saveCustomPrompt() {
        const newPrompt = promptInput.value.trim();
        if (newPrompt) {
            // Indicate saving is happening
            saveStatus.textContent = "Saving...";
            saveStatus.style.color = "orange";
            chrome.storage.sync.set({ customPrompt: newPrompt }, () => {
                console.log("Saved prompt from sidepanel:", newPrompt);
                // Update status on successful save
                saveStatus.textContent = "Prompt saved!";
                saveStatus.style.color = "green";
                // Clear the 'saved' message after a delay
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(() => {
                    saveStatus.textContent = "";
                }, 2000);
            });
        } else {
            // Optional: Handle empty prompt case differently if needed
            // For now, just clear status if user deletes everything
            saveStatus.textContent = "";
            clearTimeout(saveTimeout); // Clear any pending timeout
        }
    }

    // Create a debounced version of the save function
    const debouncedSave = debounce(saveCustomPrompt, 300); // 300ms delay

    // Remove event listener for the save button (it's gone)
    // savePromptButton.addEventListener("click", saveCustomPrompt);

    // Add input event listener to the textarea
    promptInput.addEventListener("input", debouncedSave);

    // Load the prompt when the side panel opens
    loadCustomPrompt();

    // Function to update the side panel UI (identical to popup logic)
    function updatePanel(data) {
        // Update original text display
        if (data.selectedText) {
            originalTextElement.textContent = data.selectedText;
        } else {
            originalTextElement.textContent =
                "(Select text on a page and right-click to summarize)";
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
                const summaryText =
                    data.summaryText || "(Summary not available yet)";

                // --- BEGIN Markdown List Parsing ---
                const lines = summaryText.split("\n");
                const isBulletedList = lines.some(
                    (line) =>
                        line.trim().startsWith("*") ||
                        line.trim().startsWith("-") ||
                        line.trim().startsWith("+")
                );

                summaryContent.innerHTML = ""; // Clear previous content

                // Function to convert markdown bold to HTML strong
                function convertMarkdownBoldToHtml(text) {
                    // Replace occurrences of **text** with <strong>text</strong>
                    // Using a non-greedy match (.*?) to handle multiple bolds per line
                    return text.replace(
                        /\*\*(.*?)\*\*/g,
                        "<strong>$1</strong>"
                    );
                }

                if (isBulletedList) {
                    const ul = document.createElement("ul");
                    lines.forEach((line) => {
                        const trimmedLine = line.trim();
                        if (
                            trimmedLine.startsWith("*") ||
                            trimmedLine.startsWith("-") ||
                            trimmedLine.startsWith("+")
                        ) {
                            const li = document.createElement("li");
                            // Remove the bullet character and leading/trailing spaces
                            const itemText = trimmedLine.substring(1).trim();
                            li.innerHTML = convertMarkdownBoldToHtml(itemText); // Use innerHTML after conversion
                            if (li.textContent) {
                                // Avoid adding empty list items
                                ul.appendChild(li);
                            }
                        } else if (trimmedLine) {
                            // Handle lines without bullets (e.g., headers or paragraphs between bullets)
                            // Append as a paragraph or separate list item depending on desired behavior
                            // Simple approach: Treat as separate paragraph outside the list
                            const p = document.createElement("p");
                            p.innerHTML =
                                convertMarkdownBoldToHtml(trimmedLine); // Use innerHTML after conversion
                            summaryContent.appendChild(p);
                            // Alternatively, add as a list item without bullet styling:
                            // const li = document.createElement('li');
                            // li.textContent = trimmedLine;
                            // li.style.listStyleType = 'none'; // Optional: remove bullet point appearance
                            // ul.appendChild(li);
                        }
                    });
                    if (ul.hasChildNodes()) {
                        // Only append the list if it has items
                        summaryContent.appendChild(ul);
                    }
                } else {
                    // If not a bulleted list, just display the plain text (perhaps wrapped in a paragraph)
                    const p = document.createElement("p");
                    p.innerHTML = convertMarkdownBoldToHtml(summaryText); // Use innerHTML after conversion
                    summaryContent.appendChild(p);
                }
                // --- END Markdown List Parsing ---

                summaryContent.classList.remove("hidden");
            }
        }
    }

    // Immediately try to load data from storage when side panel opens
    chrome.storage.local.get(
        ["selectedText", "summaryText", "isLoading", "error"],
        (result) => {
            console.log("Side panel opened, loaded data:", result);
            updatePanel(result);
        }
    );

    // Listen for changes in storage (e.g., when summary finishes loading)
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === "local") {
            console.log("Storage changed (sidepanel listener):", changes);
            // We need to fetch all relevant keys again as changes only contains the changed keys
            chrome.storage.local.get(
                ["selectedText", "summaryText", "isLoading", "error"],
                (result) => {
                    console.log(
                        "Updating side panel due to storage change:",
                        result
                    );
                    updatePanel(result);
                }
            );
        }
    });
});
