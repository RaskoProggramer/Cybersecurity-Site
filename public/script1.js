document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Modal elements
  const modal = document.getElementById('incidentModal');
  const openBtn = document.querySelector('.report-incident');
  const closeBtn = document.getElementById('closeModal');
  const form = document.getElementById('incident-form');
  const successMsg = document.getElementById('success');
  const errorMsg = document.getElementById('error');

  // Open modal
  if (openBtn && modal) {
    openBtn.addEventListener('click', () => {
      modal.style.display = 'flex';
    });
  }

  // Close modal
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  // Close when clicking outside content
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('✅ Incident report submitted successfully!');
    form.reset();
    modal.style.display = 'none';
  });

async function fetchBulletData() {
  const bullets = document.getElementById("news-bullets");
  bullets.innerHTML = ""; // clear "Loading..." placeholder

  const endpoints = {
    training: "https://api.rss2json.com/v1/api.json?rss_url=https://www.sans.org/feeds/news",
    archive: "https://api.rss2json.com/v1/api.json?rss_url=https://www.cisa.gov/news-events/rss",
    awareness: "https://api.rss2json.com/v1/api.json?rss_url=https://www.cisa.gov/news-events/cybersecurity-advisories/alerts/alerts-rss-feed.xml"
  };

  try {
    const [trainRes, archRes, awareRes] = await Promise.all([
      fetch(endpoints.training),
      fetch(endpoints.archive),
      fetch(endpoints.awareness)
    ]);

    const [trainJson, archJson, awareJson] = await Promise.all([
      trainRes.json(),
      archRes.json(),
      awareRes.json()
    ]);

    const upcoming = trainJson.items?.[0]?.title || "No upcoming SANS events found";
    const past = archJson.items?.[0]?.title || "No recent CISA events found";
    const campaign = awareJson.items?.[0]?.title || "Secure Our World campaign resources available";

    function addBullet(label, text) {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${label}</strong> – ${text}`;
      bullets.appendChild(li);
    }

    addBullet("Upcoming cybersecurity training sessions", upcoming);
    addBullet("Archive of past events", past);
    addBullet("Cybersecurity awareness month campaigns", campaign);
  } catch (err) {
    console.error(err);
    bullets.innerHTML = "<li>⚠️ Unable to load real-time updates at the moment.</li>";
  }
}

// Fetch on page load
fetchBulletData();
});
