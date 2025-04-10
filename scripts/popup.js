document.addEventListener("DOMContentLoaded", function () {
  const slider = document.getElementById("yoeSlider");
  const yoeValue = document.getElementById("yoeValue");
  const applyBtn = document.getElementById("applyFilter");
  const statusDiv = document.getElementById("status");
  const scanBtn = document.getElementById("scanJobs");

  chrome.storage.sync.get("maxYOE", function (data) {
    if (data.maxYOE !== undefined) {
      slider.value = data.maxYOE;
      yoeValue.textContent = data.maxYOE;
    }
  });

  slider.addEventListener("input", function () {
    yoeValue.textContent = this.value;
  });

  applyBtn.addEventListener("click", function () {
    const maxYOE = parseInt(slider.value);

    chrome.storage.sync.set({ maxYOE: maxYOE });

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "applyFilter", maxYOE: maxYOE },
        function (response) {
          if (response && response.success) {
            statusDiv.textContent = `Filter applied! ${response.hiddenJobs} job(s) hidden.`;
          } else {
            statusDiv.textContent =
              "Filter failed. Please navigate to LinkedIn job search page.";
          }
        }
      );
    });
  });

  scanBtn.addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "scanAllJobs" },
        function (response) {
          if (response && response.success) {
            statusDiv.textContent = "Scan started.";
          } else {
            statusDiv.textContent =
              "Could not scan. Please navigate to LinkedIn job search page.";
          }
        }
      );
    });
  });
});
