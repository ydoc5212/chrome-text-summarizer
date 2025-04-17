# Privacy Policy for AI Text Summarizer Chrome Extension

**Last Updated:** April 17, 2025

This Privacy Policy describes how the AI Text Summarizer Chrome Extension ("the Extension") handles your information.

## Information We Collect

The Extension processes the following information:

1.  **Selected Text:** When you use the Extension to summarize text, the specific text content you select on a webpage is sent to the Google Gemini API for processing.
2.  **Custom Prompt:** If you customize the prompt used for summarization, that prompt text is saved using Chrome's storage (`chrome.storage.sync`) so it can be reused in future sessions.
3.  **API Key:** Your Google Gemini API key is stored locally on your device using Chrome's storage (`chrome.storage.local`) to authenticate your requests to the Gemini API.

## How We Use Information

*   **Selected Text and Custom Prompt:** This information is sent directly to the Google Gemini API solely for the purpose of generating the text summary you requested. The Extension itself does not store this selected text or the generated summaries after the summarization process is complete and displayed.
*   **API Key:** Your API key is used only to authenticate your requests with the Google Gemini API. It is stored locally and is not transmitted anywhere else.

## Information Storage

*   **Selected Text/Summaries:** Not stored persistently by the Extension.
*   **Custom Prompt:** Stored using `chrome.storage.sync`, which may sync across your logged-in Chrome browsers.
*   **API Key:** Stored using `chrome.storage.local` only on the device where you save it.

## Third-Party Services

The Extension relies on the Google Gemini API to provide its core summarization functionality. Information sent to the Google Gemini API (selected text, prompt, API key) is subject to Google's Privacy Policy. We recommend reviewing Google's policy for details on how they handle data.

## Data Sharing

We do not share your API key, custom prompt, or selected text with any third parties other than Google for the purpose of generating summaries as described above.

## Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy in the extension's repository or description.

## Contact Us

If you have any questions about this Privacy Policy, please open an issue on our GitHub repository:
[https://github.com/ydoc5212/chrome-text-summarizer/issues](https://github.com/ydoc5212/chrome-text-summarizer/issues) 