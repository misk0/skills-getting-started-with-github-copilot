document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      // Reset activity select (keep placeholder)
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Build participants section (with remove buttons)
        const participants = details.participants || [];
        let participantsHtml = "";
        if (participants.length > 0) {
          participantsHtml = `
            <div class="participants-section">
              <strong>Participants</strong>
              <ul class="participants-list">
                ${participants
                  .map(
                    (p) =>
                      `<li class="participant-item"><span class="participant-email">${p}</span><button class="remove-participant" data-activity="${encodeURIComponent(
                        name
                      )}" data-email="${encodeURIComponent(p)}" aria-label="Remove participant" title="Remove participant">✖</button></li>`
                  )
                  .join("")}
              </ul>
            </div>
          `;
        } else {
          participantsHtml = `
            <div class="participants-section">
              <strong>Participants</strong>
              <p class="no-participants">No participants yet</p>
            </div>
          `;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHtml}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "message success";
        signupForm.reset();
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "message error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "message error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Handle remove participant clicks using event delegation
  activitiesList.addEventListener("click", async (event) => {
    const btn = event.target.closest(".remove-participant");
    if (!btn) return;

    const activity = decodeURIComponent(btn.dataset.activity);
    const email = decodeURIComponent(btn.dataset.email);

    if (!activity || !email) return;

    try {
      const resp = await fetch(
        `/activities/${encodeURIComponent(activity)}/participants?email=${encodeURIComponent(email)}`,
        { method: "DELETE" }
      );

      const res = await resp.json();
      if (resp.ok) {
        messageDiv.textContent = res.message;
        messageDiv.className = "message success";
        fetchActivities();
      } else {
        messageDiv.textContent = res.detail || "Failed to remove participant";
        messageDiv.className = "message error";
      }
    } catch (err) {
      messageDiv.textContent = "Failed to remove participant. Please try again.";
      messageDiv.className = "message error";
      console.error("Error removing participant:", err);
    }

    messageDiv.classList.remove("hidden");
    setTimeout(() => messageDiv.classList.add("hidden"), 5000);
  });

  // Initialize app
  fetchActivities();
});
