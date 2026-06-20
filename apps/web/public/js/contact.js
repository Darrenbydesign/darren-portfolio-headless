export function setupContactForm() {
  const form = document.getElementById("contact-form");
  const statusEl =
    document.querySelector(".form-status") || document.getElementById("form-status");

  if (!form || !statusEl) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitButton = form.querySelector('button[type="submit"]');

    if (!form.reportValidity()) return;

    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = true;
    }

    setFormStatus(statusEl, "Sending message...", "pending");

    try {
      const body = new URLSearchParams();
      new FormData(form).forEach((value, key) => {
        if (typeof value === "string") body.append(key, value);
      });

      const response = await fetch("/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      if (!response.ok) throw new Error(`Form submission failed: ${response.status}`);

      setFormStatus(
        statusEl,
        "Message sent successfully! I'll get back to you soon.",
        "success",
      );
      form.reset();
    } catch (error) {
      console.error("Error sending message:", error);
      setFormStatus(
        statusEl,
        "Error sending message. Please try again.",
        "error",
      );
    } finally {
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = false;
      }
    }
  });
}

function setFormStatus(statusEl, message, state) {
  statusEl.textContent = message;
  statusEl.classList.remove("success", "error", "pending");
  statusEl.classList.add(state);
}

document.addEventListener("DOMContentLoaded", setupContactForm);
