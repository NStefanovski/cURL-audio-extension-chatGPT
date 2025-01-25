# CURL Downloader for ChatGPT Audio

A Chrome Extension (Manifest V3) that lets you **paste** the _Copy as cURL_ command from ChatGPT’s Network tab and **download** the resulting audio file (or any other protected resource) using the same headers, cookies, and authorization tokens.

---

## Why This Extension?

When you click the **speaker icon** in ChatGPT, the page often makes a **synthesize** request (e.g., `.../backend-api/synthesize?message_id=...`). This request is authenticated with a **Bearer token** and **cookies**. If you want to **download** that `.aac` file or replicate the request, you normally have to capture all the required headers. This extension does it **automatically**:  
1. **Copy** the request as cURL from ChatGPT’s DevTools.  
2. **Paste** it into the extension’s popup.  
3. **Download** the file immediately.

---

## Key Use Case: ChatGPT’s “Text-to-Speech” Audio

1. **Open ChatGPT** in your browser.  
2. **Open DevTools** (F12 or Right-click → “Inspect”). Go to the **Network** tab.  
3. **Click** the little speaker icon on a ChatGPT conversation turn (this triggers the text-to-speech audio request).  
4. You’ll see a request like:  
https://chatgpt.com/backend-api/synthesize?message_id=...&conversation_id=...&voice=ember&format=aac

1. **Right-click** that request → **Copy** → **Copy as cURL**.  
2. **Open** this extension’s **popup** and **paste** the entire cURL command (including headers such as `authorization: Bearer ...`, `cookie: ...`, etc.).  
3. **Click** “Download.” The extension uses those same credentials to fetch the `.aac` file and saves it locally.

---

## Installation

1. **Download** or **clone** this repository.  
2. In Chrome, go to `chrome://extensions`.  
3. Enable **Developer Mode** (toggle in top-right corner).  
4. Click **Load Unpacked** → select the folder with `manifest.json`, `popup.html`, `popup.js`, and `background.js`.  
5. The extension icon (e.g., “CURL Downloader for ChatGPT Audio”) appears in your toolbar.

---

## Usage

1. **In ChatGPT**: Turn on DevTools → Network tab → Press the **speaker** icon next to a conversation turn.  
2. You’ll see a request for `...synthesize?message_id=...&conversation_id=...`.  
3. **Right-click** it → **Copy** → **Copy as cURL**.  
4. **Click** the extension icon → a popup appears with a textarea.  
5. **Paste** the entire cURL command (including all headers).  
6. Click **Download**. The extension:
- Parses the URL, method, headers (authorization, cookies, etc.).  
- Sends them to the background service worker.  
- Issues the identical request.  
- **Triggers** a file download (typically named `downloaded_file.aac`).

### Example cURL

curl 'https://chatgpt.com/backend-api/synthesize?message_id=123-abc&conversation_id=xyz&voice=ember&format=aac'
-H 'authorization: Bearer eyJhbGciOiJS...'
-H 'cookie: session=abcd1234...'
-H 'sec-ch-ua: "Google Chrome";v="109"'
...

When pasted, the extension replicates each header exactly, so ChatGPT’s server sees you as authenticated.

---

## Security Considerations

- This extension **uses** your Bearer token and cookies only in memory during the request. No data is stored or transmitted to third parties.  
- Still, be careful with tokens—**any** extension can read them if you paste them. This is for personal use only.

---

## License

MIT License. This is **not** an official OpenAI/ChatGPT tool—just a user utility. Use at your own risk.

---

### Author

Created by [Nik Stefanovski / nstefanovski Handle].  
For questions, open an issue or submit a pull request.