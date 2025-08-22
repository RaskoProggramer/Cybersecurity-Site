// Get references to the form and the message box
const contactForm = document.getElementById('contact-form');
const messageBox = document.getElementById('message-box');

/**
 * Shows a temporary message box with a specified message and color.
 * @param {string} message The message to display.
 * @param {string} color The Tailwind CSS color class (e.g., 'green').
 */
function showMessage(message, color) {
    messageBox.textContent = message;
    messageBox.style.display = 'block';
    messageBox.className = `bg-${color}-600 text-white p-4 rounded-lg shadow-lg transition-opacity duration-300`;
    setTimeout(() => {
        messageBox.style.display = 'none';
    }, 5000); // Hide after 5 seconds
}

// Add a listener for the form submission
contactForm.addEventListener('submit', function(event) {
    // Prevent the default form submission to avoid page refresh
    event.preventDefault();

    // Simulate a successful form submission
    alert('Form Submitted!');
    showMessage('Your query has been submitted successfully!', 'green');

    // Optionally, clear the form fields
    contactForm.reset();
});
