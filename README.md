# Chrome Extension: LinkedIn YOE Filter + Sponsorship Badge

Tired of clicking on "entry level" jobs only to find they require 4+ years of experience?  
Or reading through the whole job description just to find out they don't accept international candidates?  



## ✅ What It Does

This Chrome extension enhances your experience on LinkedIn's job search by:

- 🏷️ **Adding a YOE badge** to each job listing showing the required years of experience.
- 🚫 **Adding a "No Sponsor" badge** to jobs that require U.S. citizenship/clearance or will not provide visa sponsorship.
- ⚡ **Filtering jobs** by your max YOE — hide listings that require more experience than you have.


## 🛠 How It Works

- Works on LinkedIn's job search page (e.g. `linkedin.com/jobs/search/...`).
- Click on a job to analyze it individually, or press **"Scan Jobs"** in the extension popup to analyze everything visible.
  - **Important:** LinkedIn loads jobs lazily — if you want to scan *all* jobs with one click, just scroll to the bottom of the list first, then hit “Scan Jobs”.
- After scanning, you should see badges for each posting, use the slider in the popup to hide jobs above your experience level.



## ⚠️ Limitations

- **YOE and sponsorship detection is regex-based**, and since job descriptions are written in free-form text, it's around 95% (at least) accurate in practice.
- If a job description mentions multiple experience levels (e.g. “3 years of React, 5 years of Java”), the extension currently picks up the first one it finds — which may not always reflect the main requirement.
- I considered using an AI model for better accuracy, but it felt like overkill and potentially costly to deploy for a lightweight Chrome Extension. Feel free to fork the repo and explore more robust & performant parsing logic or add your own features!


## 📸 Screenshots

<table>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/3ed186f7-d0b2-4fcf-aa4a-bd01ce8fb486" width="350"/></td>
    <td><img src="https://github.com/user-attachments/assets/d709de43-ea37-4ca0-b0db-b25476c8a0a7" width="200"/></td>
  </tr>
</table>

## 📄 License

MIT
