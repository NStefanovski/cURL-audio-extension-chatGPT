// background.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "DOWNLOAD_FILE") {
      handleDownloadFile(message.payload, sendResponse);
      return true; // keep the message channel open for async
    }
  });
  
  async function handleDownloadFile(parsed, sendResponse) {
    try {
      const { url, method, headers: headerObj, data } = parsed;
      // Convert our headers object to a real Headers
      const fetchHeaders = new Headers();
      for (const [k, v] of Object.entries(headerObj)) {
        fetchHeaders.set(k, v);
      }
  
      // Perform the fetch with the same headers
      const resp = await fetch(url, {
        method,
        headers: fetchHeaders,
        body: data,
        // Usually cURL sends cookies in the "cookie" header.
        // If you also want to send the user's own Chrome cookies, you'd do credentials: "include".
        // But typically, we rely on the "cookie" header from cURL.
        // credentials: "include",
      });
  
      if (!resp.ok) {
        sendResponse({
          success: false,
          error: `HTTP ${resp.status}: ${resp.statusText}`
        });
        return;
      }
  
      // Convert to blob => base64 data URL
      const blob = await resp.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result; // "data:application/octet-stream;base64,AAAA..."
        sendResponse({
          success: true,
          fileData: base64Data
        });
      };
      reader.readAsDataURL(blob);
  
    } catch (err) {
      sendResponse({
        success: false,
        error: err.toString()
      });
    }
  }
  