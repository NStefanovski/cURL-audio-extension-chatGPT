// popup.js
document.addEventListener("DOMContentLoaded", () => {
  const curlInput = document.getElementById("curlInput");
  const downloadBtn = document.getElementById("downloadBtn");
  const statusArea = document.getElementById("statusArea");

  downloadBtn.addEventListener("click", async () => {
    statusArea.textContent = "";
    const curlText = curlInput.value.trim();
    if (!curlText) {
      alert("Please paste your cURL command first.");
      return;
    }

    const singleLineCurl = collapseCurlLines(curlText);

    let parsed;
    try {
      parsed = parseCurl(singleLineCurl);
      console.log("Parsed cURL:", parsed);
    } catch (err) {
      console.error("Error parsing cURL:", err);
      alert("Failed to parse cURL. Check console for details.");
      return;
    }

    // Send it to background
    statusArea.textContent = "Sending request to background script...";
    try {
      const response = await chrome.runtime.sendMessage({
        type: "DOWNLOAD_FILE",
        payload: parsed
      });
      if (!response) {
        statusArea.textContent = "No response from background script.";
        return;
      }
      if (!response.success) {
        statusArea.textContent = "Error: " + response.error;
        return;
      }
      // We got base64 data
      const fileDataUrl = response.fileData;
      if (!fileDataUrl) {
        statusArea.textContent = "No file data returned.";
        return;
      }
      // Trigger download
      const a = document.createElement("a");
      a.href = fileDataUrl;
      // We can guess the filename or just do "downloaded_file.aac"
      a.download = "downloaded_file.aac";
      document.body.appendChild(a);
      a.click();
      a.remove();

      statusArea.textContent = "Download complete!";
    } catch (err) {
      console.error("Error in sendMessage:", err);
      statusArea.textContent = "Error in sendMessage. Check console.";
    }
  });
});

/**
 * collapseCurlLines - merges multi-line cURL commands into one line
 */
function collapseCurlLines(curlText) {
  return curlText
    .split("\n")
    .map(line => line.replace(/\\\s*$/, "").trim())
    .join(" ");
}

/**
 * parseCurl:
 *   - Extracts the URL (from `curl '...'`)
 *   - Method (from `-X POST` if present)
 *   - Headers (from `-H 'Key: Value'`)
 *   - Data (from `-d '...'`)
 */
function parseCurl(curlCmd) {
  // 1) URL from curl '...' or curl "..."
  const urlMatch = curlCmd.match(/curl\s+(['"])(.*?)\1/);
  if (!urlMatch) {
    throw new Error("Could not find URL in cURL command.");
  }
  const url = urlMatch[2];

  // 2) Method (default GET)
  let method = "GET";
  const methodMatch = curlCmd.match(/-X\s+(\S+)/i);
  if (methodMatch) {
    method = methodMatch[1].toUpperCase();
  }

  // 3) Headers
  const headers = {};
  const headerRegex = /-H\s+(['"])(.*?)\1/gi; // captures stuff in -H 'header: val'
  let hMatch;
  while ((hMatch = headerRegex.exec(curlCmd)) !== null) {
    // hMatch[2] might be "accept: */*"
    const [k, v] = hMatch[2].split(/:(.*)/);
    if (v !== undefined) {
      headers[k.trim()] = v.trim();
    }
  }

  // 4) Data (-d '...')
  let data = null;
  const dataMatch = curlCmd.match(/-d\s+(['"])([\s\S]+?)\1/);
  if (dataMatch) {
    data = dataMatch[2];
  }

  return { url, method, headers, data };
}
