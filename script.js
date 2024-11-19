document.addEventListener("DOMContentLoaded", () => {
    const meetingForm = document.getElementById("meeting-form");
    const rooms = document.querySelectorAll(".room");
    const character = document.getElementById("character");
    const characterStartX = character.getBoundingClientRect().left;

    meetingForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const meetingName = document.getElementById("meeting-name").value.trim();
        const startTime = document.getElementById("start-time").value;
        const endTime = document.getElementById("end-time").value;

        if (!meetingName || !startTime || !endTime) {
            alert("Please fill in all fields.");
            return;
        }

        if (startTime >= endTime) {
            alert("End time must be after start time.");
            return;
        }

        let roomFound = false;

        for (const room of rooms) {
            const schedule = room.querySelector(".schedule");
            const meetings = schedule.querySelectorAll("li");
            let canSchedule = true;

            meetings.forEach((meeting) => {
                if (meeting.textContent.includes("No meetings scheduled")) return;

                const [meetingStart, meetingEnd] = meeting.getAttribute("data-time").split("-");
                if (
                    (startTime >= meetingStart && startTime < meetingEnd) ||
                    (endTime > meetingStart && endTime <= meetingEnd)
                ) {
                    canSchedule = false;
                }
            });

            if (canSchedule) {
                roomFound = true;

                const newMeeting = document.createElement("li");
                newMeeting.textContent = `${meetingName} (${startTime} - ${endTime})`;
                newMeeting.setAttribute("data-time", `${startTime}-${endTime}`);
                const cancelButton = document.createElement("button");
                cancelButton.textContent = "Cancel";
                cancelButton.addEventListener("click", () => {
                    newMeeting.remove();
                    if (!schedule.querySelector("li")) {
                        schedule.innerHTML = "<li>No meetings scheduled</li>";
                    }
                });
                newMeeting.appendChild(cancelButton);

                if (meetings.length === 1 && meetings[0].textContent.includes("No meetings scheduled")) {
                    schedule.innerHTML = ""; // Remove "No meetings scheduled"
                }
                schedule.appendChild(newMeeting);

                alert(`Meeting "${meetingName}" scheduled in ${room.querySelector("h3").textContent}.`);

                // Move character to room
                const roomRect = room.getBoundingClientRect();
                character.style.left = `${roomRect.left - characterStartX + 20}px`;

                break;
            }
        }

        if (!roomFound) {
            alert("No available rooms for the specified time.");
            // Return character to start position
            character.style.left = "0";
        }

        meetingForm.reset();
    });
});
