document.addEventListener("DOMContentLoaded", () => {
    const meetingForm = document.getElementById("meeting-form");
    const rooms = document.querySelectorAll(".room");
    const character = document.getElementById("character");
    const characterStartX = character.getBoundingClientRect().left;

    // استرجاع الاجتماعات المحفوظة من localStorage عند تحميل الصفحة
    rooms.forEach((room, index) => {
        const schedule = room.querySelector(".schedule");
        const roomMeetings = JSON.parse(localStorage.getItem(`room${index}`)) || [];

        if (roomMeetings.length > 0) {
            schedule.innerHTML = ""; // إزالة "No meetings scheduled" إذا كان هناك اجتماعات
            roomMeetings.forEach(meetingData => {
                const newMeeting = createMeetingElement(meetingData.name, meetingData.start, meetingData.end, schedule, index);
                schedule.appendChild(newMeeting);
            });
        }
    });

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

        for (const [index, room] of rooms.entries()) {
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

                const newMeeting = createMeetingElement(meetingName, startTime, endTime, schedule, index);

                if (meetings.length === 1 && meetings[0].textContent.includes("No meetings scheduled")) {
                    schedule.innerHTML = ""; // إزالة "No meetings scheduled"
                }
                schedule.appendChild(newMeeting);

                // حفظ الاجتماع في localStorage
                saveMeetingToLocalStorage(index, meetingName, startTime, endTime);

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

    // دالة لإنشاء عنصر الاجتماع
    function createMeetingElement(meetingName, startTime, endTime, schedule, roomIndex) {
        const newMeeting = document.createElement("li");
        newMeeting.textContent = `${meetingName} (${startTime} - ${endTime})`;
        newMeeting.setAttribute("data-time", `${startTime}-${endTime}`);
        
        const cancelButton = document.createElement("button");
        cancelButton.textContent = "Cancel";
        cancelButton.addEventListener("click", () => {
            newMeeting.remove();
            removeMeetingFromLocalStorage(roomIndex, startTime, endTime);
            if (!schedule.querySelector("li")) {
                schedule.innerHTML = "<li>No meetings scheduled</li>";
            }
        });

        newMeeting.appendChild(cancelButton);
        return newMeeting;
    }

    // دالة لحفظ الاجتماع في localStorage
    function saveMeetingToLocalStorage(roomIndex, meetingName, startTime, endTime) {
        const roomMeetings = JSON.parse(localStorage.getItem(`room${roomIndex}`)) || [];
        roomMeetings.push({ name: meetingName, start: startTime, end: endTime });
        localStorage.setItem(`room${roomIndex}`, JSON.stringify(roomMeetings));
    }

    // دالة لإزالة الاجتماع من localStorage
    function removeMeetingFromLocalStorage(roomIndex, startTime, endTime) {
        const roomMeetings = JSON.parse(localStorage.getItem(`room${roomIndex}`)) || [];
        const updatedMeetings = roomMeetings.filter(
            meeting => !(meeting.start === startTime && meeting.end === endTime)
        );
        localStorage.setItem(`room${roomIndex}`, JSON.stringify(updatedMeetings));
    }
});
