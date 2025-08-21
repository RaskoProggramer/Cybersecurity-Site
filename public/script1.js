document.addEventListener('DOMContentLoaded', () => {
  console.log('CyberSP website loaded successfully!');

  // Smooth scrolling for anchor links
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

  // Incident Modal Logic
  const modal = document.getElementById('incidentModal');
  const openBtn = document.querySelector('.report-incident');
  const closeBtn = document.getElementById('closeModal');
  const form = document.getElementById('incidentForm');

  // Open modal
  openBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
  });

  // Close modal
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Close on outside click
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
});
