document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Utility to create participant list HTML
  function renderParticipants(participants) {
    if (!participants || participants.length === 0) {
      return '<li><em>No participants yet</em></li>';
    }
    return participants.map(email => `<li>${email}</li>`).join('');
  }

  // Render activities with participants
  function renderActivities(activities) {
    const activitiesList = document.getElementById('activities-list');
    activitiesList.innerHTML = '';
    Object.entries(activities).forEach(([name, info]) => {
      const card = document.createElement('div');
      card.className = 'activity-card';
      card.innerHTML = `
        <h4>${name}</h4>
        <p>${info.description}</p>
        <p><strong>Schedule:</strong> ${info.schedule}</p>
        <p><strong>Max Participants:</strong> ${info.max_participants}</p>
        <div class="participants-section">
          <h4>Participants</h4>
          <ul class="participants-list">
            ${renderParticipants(info.participants)}
          </ul>
        </div>
      `;
      activitiesList.appendChild(card);
    });
  }

  // Fetch and render activities
  function loadActivities() {
    fetch('/activities')
      .then(res => res.json())
      .then(data => {
        renderActivities(data);
        populateActivitySelect(data);
      });
  }

  // Populate the activity select dropdown
  function populateActivitySelect(activities) {
    const select = document.getElementById('activity');
    select.innerHTML = '<option value="">-- Select an activity --</option>';
    Object.keys(activities).forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      select.appendChild(option);
    });
  }

  // Handle signup form submission
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
        messageDiv.className = "success";
        signupForm.reset();
        loadActivities(); // Refresh activities to update participants
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initial load
  loadActivities();
});
