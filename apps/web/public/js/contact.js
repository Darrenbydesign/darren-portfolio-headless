import { fetchFromStrapi } from "./api.js";

export function setupContactForm() {
  const form = document.getElementById("contact-form");
  const statusEl =
    document.querySelector(".form-status") || document.getElementById("form-status");

  if (!form || !statusEl) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name")?.value.trim() || "";
    const email = document.getElementById("email")?.value.trim() || "";
    const message = document.getElementById("message")?.value.trim() || "";

    try {
      await fetchFromStrapi("/contact-messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            name,
            email,
            message,
          },
        }),
      });

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
    }
  });
}

function setFormStatus(statusEl, message, state) {
  statusEl.textContent = message;
  statusEl.classList.remove("success", "error");
  statusEl.classList.add(state);
}

document.addEventListener("DOMContentLoaded", setupContactForm);
