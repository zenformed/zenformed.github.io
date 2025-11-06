// /js/contact-form.js
export function initContactForm() {
  const form = document.querySelector(".contact-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const submitButton = form.querySelector(".contact-button");
    const originalText = submitButton.textContent;

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    try {
      await fetch(form.action, {
        method: "POST",
        body: formData,
      });

      alert(
        "Thank you! Your message has been sent to Zenformed. Someone will reach out to you soon."
      );
      form.reset();
    } catch (error) {
      alert(
        "Sorry, there was an error sending your message. Please try again."
      );
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });
}
