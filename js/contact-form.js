// /js/contact-form.js
export function initContactForm() {
  const form = document.querySelector(".contact-form");
  if (!form) return;

  const successMessage =
    "Thank you! Your message has been sent to Zenformed. Someone will reach out to you soon.";

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const urlEncodedData = new URLSearchParams();
    formData.forEach((value, key) => {
      urlEncodedData.append(key, value);
    });
    const submitButton = form.querySelector(".contact-button");
    const originalText = submitButton.textContent;

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: urlEncodedData.toString(),
        mode: "cors",
      });

      const isRedirect =
        response.type === "opaqueredirect" ||
        (response.status >= 300 && response.status < 400);

      if (!response.ok && !isRedirect) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      alert(successMessage);
      form.reset();
    } catch (error) {
      console.error("Contact form submission failed", error);

      const isNetworkError =
        error instanceof TypeError ||
        (typeof error.message === "string" &&
          error.message.toLowerCase().includes("fetch"));

      if (isNetworkError) {
        alert(successMessage);
        form.reset();
        return;
      }

      alert(
        "Sorry, there was an error sending your message. Please try again."
      );
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  };

  form.addEventListener("submit", handleSubmit);
}
