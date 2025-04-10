let jobElements = [];
let extractedYears = {};
let isScanning = false;
let lastUrl = window.location.href;

function extractYOE(text) {
  const patterns = [
    /(\d+)\s*(?:-|to)\s*(\d+)\s*(?:years|yrs|yr|year)(?:\s+of\s+experience|\s+exp|\s+experience|\s+work\s+experience)?/i,
    /(\d+)\+\s*(?:years|yrs|yr|year)(?:\s+of\s+experience|\s+exp|\s+experience|\s+work\s+experience)?/i,
    /(?:minimum|min|at least)\s+(\d+)\s*(?:years|yrs|yr|year)(?:\s+of\s+experience|\s+exp|\s+experience|\s+work\s+experience)?/i,
    /(?:less\s+than|under|maximum|max)\s+(\d+)\s*(?:years|yrs|yr|year)/i,
    /\((\d+)\)\s*(?:years|yrs|yr|year)/i, //number in parentheses
    /(\d+)\s*(?:years|yrs|yr|year)/i, //other cases, number followed by years
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      // Check if this is a "less than" pattern
      if (
        match[0].toLowerCase().includes("less than") ||
        match[0].toLowerCase().includes("under") ||
        match[0].toLowerCase().includes("maximum") ||
        match[0].toLowerCase().includes("max")
      ) {
        // For "less than X years", set min=0, max=X
        return {
          min: 0,
          max: parseInt(match[1]),
          display: `<${match[1]} years`,
        };
      } else if (match[2]) {
        // Range like "3-5 years"
        return {
          min: parseInt(match[1]),
          max: parseInt(match[2]),
          display: `${match[1]}-${match[2]} years`,
        };
      } else if (match[0].includes("+")) {
        // "5+ years"
        return {
          min: parseInt(match[1]),
          max: parseInt(match[1]),
          display: `${match[1]}+ years`,
        };
      } else {
        // Simple "5 years"
        return {
          min: parseInt(match[1]),
          max: parseInt(match[1]),
          display: `${match[1]} years`,
        };
      }
    }
  }

  return {
    min: -1,
    max: -1,
    display: "?",
  };
}

function extractSponsorship(text) {
  const restrictionPatterns = [
    // Citizenship patterns
    /U\.?S\.? citizens?(?:hip)?/i,
    /citizens? of the United States/i,
    /must be a U\.?S\.? citizens?/i,
    /only U\.?S\.? citizens/i,

    // Clearance patterns
    /security clearance/i,
    /(?:top\s+)?secret clearance/i,
    /clearance required/i,
    /(?:TS|SCI|DoD|DOD|Secret)[\s/]*clearance/i,

    // No sponsorship patterns
    /no sponsorship/i,
    /not (?:able|willing) to sponsor/i,
    /cannot (?:provide|offer) sponsorship/i,
    /not sponsor/i,
    /no H1B/i,
  ];

  // Check if any pattern matches
  for (const pattern of restrictionPatterns) {
    if (pattern.test(text)) {
      return "No Sponsor";
    }
  }

  return null;
}

function initialize() {
  // Get search result jobs
  jobElements = Array.from(
    document.querySelectorAll("[class*='jobs-search-']")
  ).filter(
    (element) =>
      element.classList.contains("job-card-container") ||
      element.classList.contains("job-card-list")
  );
  console.log("number of jobs loaded", jobElements.length);
  if (jobElements.length === 0) {
    isScanning = false;
    return;
  }

  // All job cards in the page (including recommendation sections)
  const allJobCards = document.querySelectorAll(
    ".job-card-container, .job-card-list"
  );

  allJobCards.forEach((jobElement) => {
    jobElement.addEventListener("click", () => {
      if (!isScanning) {
        isScanning = true;
        setTimeout(() => {
          const jobDescription = document.querySelector(".jobs-description");
          if (jobDescription) {
            const descriptionText = jobDescription.textContent;

            // Extract YOE
            const yoeData = extractYOE(descriptionText);

            // Check for sponsorship restriction
            const sponsorRestriction = extractSponsorship(descriptionText);

            if (yoeData) {
              const jobId =
                jobElement.getAttribute("data-job-id") ||
                jobElement.getAttribute("id") ||
                Math.random().toString(36).substring(2, 15);
              extractedYears[jobId] = {
                yoe: yoeData,
                sponsorRestriction: sponsorRestriction,
              };

              // display badges
              displayBadges(jobElement, yoeData, sponsorRestriction);
            }
          }
        }, 1500);
        isScanning = false;
      }
    });
  });
}

function displayBadges(jobElement, yoeData, sponsorRestriction) {
  let yoeBadge = jobElement.querySelector(".yoe-badge");

  if (!yoeBadge) {
    yoeBadge = document.createElement("div");
    yoeBadge.className = "yoe-badge";
    jobElement.appendChild(yoeBadge);
    yoeBadge.textContent = `YOE: ${yoeData.display}`;
  }

  let sponsorBadge = jobElement.querySelector(".sponsor-badge");

  if (sponsorRestriction && !sponsorBadge) {
    const sponsorBadge = document.createElement("div");
    sponsorBadge.className = "sponsor-badge";
    sponsorBadge.textContent = sponsorRestriction;
    jobElement.appendChild(sponsorBadge);
  }
}

function applyFilter(maxYOE) {
  let hiddenCount = 0;

  Object.keys(extractedYears).forEach((jobId) => {
    let jobElement;

    jobElement =
      document.querySelector(`[data-job-id="${jobId}"]`) ||
      document.getElementById(jobId);

    if (!jobElement && !isNaN(parseInt(jobId))) {
      jobElement = jobElements[parseInt(jobId)];
    }

    if (jobElement) {
      const yoeData = extractedYears[jobId].yoe;

      if (yoeData.min > maxYOE) {
        jobElement.style.display = "none";
        jobElement.setAttribute("style", "display: none !important");
        hiddenCount++;
      } else {
        jobElement.style.display = "";
      }
    }
  });

  return hiddenCount;
}

function showOverlay() {
  let overlay = document.getElementById("scanning-overlay");

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "scanning-overlay";
    const message = document.createElement("div");
    message.className = "overlay-message";
    message.textContent = "Scanning jobs in progress...";
    overlay.appendChild(message);

    document.body.appendChild(overlay);
  } else {
    overlay.style.display = "flex";
  }
}

function hideOverlay() {
  const overlay = document.getElementById("scanning-overlay");
  if (overlay) {
    overlay.style.display = "none";
  }
}

function scanAllJobs(index) {
  if (index === 0) {
    showOverlay();
  }

  if (index >= jobElements.length) {
    hideOverlay();
    setTimeout(() => {
      alert("Done scanning for " + index + " jobs.");
    }, 100);
    isScanning = false;
    return;
  }

  try {
    console.log(`Scanning job ${index + 1}/${jobElements.length}`);

    jobElements[index].click();

    // Set a fallback timeout in case this job hangs
    const fallbackTimer = setTimeout(() => {
      console.warn(`Job ${index} timed out, moving to next job`);
      scanAllJobs(index + 1);
    }, 3000);

    setTimeout(() => {
      try {
        clearTimeout(fallbackTimer); // Clear the fallback timer if we proceed normally

        const jobDescription = document.querySelector(".jobs-description");
        if (jobDescription) {
          const descriptionText = jobDescription.textContent;
          const yoeData = extractYOE(descriptionText);
          const sponsorRestriction = extractSponsorship(descriptionText);

          if (yoeData) {
            const jobId =
              jobElements[index].getAttribute("data-job-id") ||
              jobElements[index].getAttribute("id") ||
              index.toString();
            extractedYears[jobId] = {
              yoe: yoeData,
              sponsorRestriction: sponsorRestriction,
            };
            displayBadges(jobElements[index], yoeData, sponsorRestriction);
          }
        } else {
          console.warn(`No job description found for job ${index}`);
        }
      } catch (error) {
        console.error(`Error processing job ${index}:`, error);
      } finally {
        // Always move to the next job, even if there was an error
        setTimeout(() => {
          scanAllJobs(index + 1);
        }, 500);
      }
    }, 1000);
  } catch (error) {
    console.error(`Error clicking job ${index}:`, error);

    setTimeout(() => {
      scanAllJobs(index + 1);
    }, 500);
  }
}

function isJobsSearchPage(url) {
  return url.includes("jobs/collection") || url.includes("jobs/search");
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  const currentUrl = window.location.href;
  if (isJobsSearchPage(currentUrl)) {
    if (request.action === "scanAllJobs") {
      scanAllJobs(0);
      sendResponse({ success: true });
    }

    if (request.action === "applyFilter") {
      if (jobElements.length === 0) {
        initialize();
      }

      const hiddenJobs = applyFilter(request.maxYOE);
      sendResponse({ success: true, hiddenJobs: hiddenJobs });
      return true;
    }
  } else {
    sendResponse({ success: false });
  }
  return true;
});

const observer = new MutationObserver(function () {
  setTimeout(() => {
    initialize();
  }, 3000);
});

observer.observe(document, { subtree: true, childList: true });
