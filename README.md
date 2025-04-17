# AI Text Summarizer Chrome Extension

This Chrome extension allows you to quickly summarize selected text on any webpage using the Google Gemini API.

## Features

*   Right-click on selected text to summarize.
*   View the summary and original text in the Chrome side panel.
*   Customize the summarization prompt used by the Gemini API.
*   Configure your Gemini API key securely.

## Setup

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/ydoc5212/chrome-text-summarizer.git
    cd chrome-text-summarizer
    ```

2.  **Load the Extension in Chrome:**
    *   Open Chrome and navigate to `chrome://extensions/`.
    *   Enable "Developer mode" using the toggle in the top right corner.
    *   Click the "Load unpacked" button.
    *   Select the directory where you cloned the repository (`chrome-text-summarizer`).
    *   The "AI Text Summarizer" extension should now appear in your extensions list.

3.  **Configure API Key:**
    *   You need a Google Gemini API key. You can obtain one from the [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   Once you have the key, click the "Details" button for the "AI Text Summarizer" extension on the `chrome://extensions/` page.
    *   Click "Extension options".
    *   Paste your Gemini API key into the input field and click "Save Key".
    *   Alternatively, you can click the extension icon in your Chrome toolbar and enter/save the key there.

## Usage

1.  **Select Text:** Highlight the text you want to summarize on any webpage.
2.  **Right-Click:** Right-click on the selected text.
3.  **Summarize:** Choose "AI Text Summarizer: Summarize Selection" from the context menu.
4.  **View:** The Chrome side panel will open, displaying:
    *   A text area to view/edit the **Prompt** being used.
    *   The generated **Summary**.
    *   The **Original Text** you selected.

5.  **Customize Prompt:**
    *   You can change the text in the "Prompt" text area within the side panel.
    *   Changes are saved automatically shortly after you stop typing.
    *   The saved prompt will be used for future summaries. 