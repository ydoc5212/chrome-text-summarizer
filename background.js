// Placeholder for your Gemini API key - Now fetched from storage
// const GEMINI_API_KEY = "YOUR_API_KEY_HERE"; // IMPORTANT: Replace with your actual key
const GEMINI_API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent"; // Check for the correct endpoint

const DEFAULT_PROMPT = "Summarize the following text:"; // Define default prompt

// Function to get API key from storage
async function getApiKey() {
    return new Promise((resolve) => {
        chrome.storage.local.get(["geminiApiKey"], (result) => {
            resolve(result.geminiApiKey);
        });
    });
}

// Function to get Custom Prompt from sync storage
async function getCustomPrompt() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(["customPrompt"], (result) => {
            resolve(result.customPrompt || DEFAULT_PROMPT);
        });
    });
}

// Function to call the Gemini API
async function summarizeTextWithGemini(text) {
    const apiKey = await getApiKey();
    const customPrompt = await getCustomPrompt(); // Get the custom or default prompt

    if (!apiKey) {
        console.error(
            "Gemini API key not found in chrome.storage.local. Please set it."
        );
        // Instruct user on how to set it via console (for development)
        console.info(
            'To set the API key, open the service worker console and run: `chrome.storage.local.set({ geminiApiKey: "YOUR_KEY_HERE" }, () => { console.log("API Key Saved!"); });`'
        );
        return Promise.resolve(
            "API Key not configured. Please set it via the service worker console."
        );
    }

    // Basic safety check for text length (adjust as needed)
    if (!text || text.trim().length < 10) {
        return Promise.resolve("Selected text is too short for summarization.");
    }

    // Prepare the request body for Gemini API
    // Consult the Gemini API documentation for the exact format
    const requestBody = {
        contents: [
            {
                parts: [
                    {
                        text: `${customPrompt}\n\n${text}`,
                    },
                ],
            },
        ],
        // Add generationConfig if needed (e.g., temperature, max output tokens)
        // generationConfig: {
        //   temperature: 0.7,
        //   maxOutputTokens: 250,
        // }
    };

    console.log("Sending request to Gemini API...");

    try {
        const response = await fetch(
            `${GEMINI_API_URL}?key=${apiKey}`, // Use the fetched key
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            }
        );

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("Gemini API Error Response:", errorBody);
            throw new Error(
                `API request failed with status ${response.status}: ${response.statusText}`
            );
        }

        const data = await response.json();
        console.log("Received response from Gemini API:", data);

        // Extract the summary from the response
        // Adjust this based on the actual Gemini API response structure
        // Example assumes response.candidates[0].content.parts[0].text contains the summary
        if (
            data.candidates &&
            data.candidates[0] &&
            data.candidates[0].content &&
            data.candidates[0].content.parts &&
            data.candidates[0].content.parts[0]
        ) {
            return data.candidates[0].content.parts[0].text.trim();
        } else {
            console.error("Unexpected API response structure:", data);
            return "Could not extract summary from API response.";
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return `Error during summarization: ${error.message}`;
    }
}

// Create Context Menu on Installation
chrome.runtime.onInstalled.addListener(() => {
    // Remove old menu item if it exists, in case the title changes
    chrome.contextMenus.remove("summarizeSelection", () => {
        // Check for an error during removal (e.g., item didn't exist)
        if (chrome.runtime.lastError) {
            // Optionally log that the item wasn't found, but don't treat it as a fatal error
            console.log("Previous menu item not found, creating new one.");
        } else {
            // Log successful removal if needed
            // console.log("Previous menu item removed.");
        }

        // Always attempt to create the new context menu item
        chrome.contextMenus.create({
            id: "summarizeSelection",
            title: "AI Text Summarizer", // Simplified title
            contexts: ["selection"],
        });
        console.log("Context menu created/updated.");
    });
});

// Listener for Context Menu Click
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "summarizeSelection" && info.selectionText) {
        const selectedText = info.selectionText;
        console.log("Selected Text:", selectedText);

        // Ensure side panel is available before attempting to open
        if (tab && tab.id) {
            try {
                await chrome.sidePanel.open({ tabId: tab.id });
                console.log("Side panel opened for tab:", tab.id);
            } catch (error) {
                console.error("Error opening side panel:", error);
                // Fallback or alternative action could be added here if needed
            }
        } else {
            console.error(
                "Cannot open side panel, tab information is missing."
            );
            return; // Exit if we can't open the panel
        }

        // Store selected text and indicate loading state
        chrome.storage.local.set(
            {
                selectedText: selectedText,
                summaryText: "Summarizing...",
                isLoading: true,
                error: null,
            },
            () => {
                console.log("Selected text stored, starting summarization.");
                // Call the API function
                summarizeTextWithGemini(selectedText)
                    .then((summary) => {
                        console.log("Summary Received:", summary);
                        // Store the result
                        chrome.storage.local.set(
                            {
                                summaryText: summary,
                                isLoading: false,
                            },
                            () => {
                                console.log("Summary stored.");
                                // Side panel should already be open
                            }
                        );
                    })
                    .catch((error) => {
                        console.error("Summarization failed:", error);
                        chrome.storage.local.set(
                            {
                                summaryText: "Failed to summarize.",
                                isLoading: false,
                                error:
                                    error.message ||
                                    "An unknown error occurred.",
                            },
                            () => {
                                console.log("Error state stored.");
                            }
                        );
                    });
            }
        );
    }
});
