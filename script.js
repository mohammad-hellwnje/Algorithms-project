document.addEventListener("DOMContentLoaded", () => {
    const rooms = ["Room A", "Room B", "Room C"];
    let schedules = loadSchedulesFromStorage();
    const meetingForm = document.getElementById("meeting-form");

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

        const meeting = { name: meetingName, start: startTime, end: endTime };
        const assignedRoom = cspAssignRoomCSP(meeting, schedules, rooms);  // استخدم خوارزمية CSP

        if (assignedRoom) {
            alert(`Meeting "${meetingName}" scheduled in ${assignedRoom}.`);
            // إضافة الاجتماع فقط بعد تخصيص الغرفة بنجاح
            schedules[assignedRoom].push(meeting);
            schedules[assignedRoom].sort((a, b) => a.start.localeCompare(b.start));
            saveSchedulesToStorage(schedules);
            renderRoomSchedule(assignedRoom);
        } else {
            alert("No available rooms for the specified time.");
        }

        meetingForm.reset();
    });

    // خوارزمية CSP لتخصيص الغرف
    function cspAssignRoomCSP(meeting, schedules, rooms) {
        const availableRooms = rooms.filter(room => isRoomAvailable(room, meeting, schedules));

        if (availableRooms.length > 0) {
            const room = availableRooms[0];  // تخصيص أول غرفة متاحة
            return room;  // فقط إرجاع الغرفة المتاحة دون إضافة الاجتماع هنا
        }

        return null;
    }

    function isRoomAvailable(room, meeting, schedules) {
        const meetingStart = new Date(`1970-01-01T${meeting.start}:00`);
        const meetingEnd = new Date(`1970-01-01T${meeting.end}:00`);

        return schedules[room].every(scheduledMeeting => {
            const scheduledStart = new Date(`1970-01-01T${scheduledMeeting.start}:00`);
            const scheduledEnd = new Date(`1970-01-01T${scheduledMeeting.end}:00`);

            return meetingEnd <= scheduledStart || meetingStart >= scheduledEnd;
        });
    }

    function renderRoomSchedule(room) {
        const roomElement = document.querySelector(`[data-name="${room}"] .schedule`);
        roomElement.innerHTML = "";

        if (!schedules[room] || schedules[room].length === 0) {
            roomElement.innerHTML = "<li>No meetings scheduled</li>";
            return;
        }

        schedules[room].forEach((meeting) => {
            if (!meeting || !meeting.name || !meeting.start || !meeting.end) {
                return;
            }

            const li = document.createElement("li");
            li.textContent = `${meeting.name} (${meeting.start} - ${meeting.end})`;

            const cancelButton = document.createElement("button");
            cancelButton.textContent = "Cancel";
            cancelButton.classList.add("cancel-button");
            cancelButton.addEventListener("click", () => {
                cancelMeeting(room, meeting);
            });

            li.appendChild(cancelButton);
            roomElement.appendChild(li);
        });
    }

    function cancelMeeting(room, meeting) {
        schedules[room] = schedules[room].filter(
            (m) => m.start !== meeting.start || m.end !== meeting.end
        );

        saveSchedulesToStorage(schedules);
        renderRoomSchedule(room);
        alert(`Meeting "${meeting.name}" has been canceled.`);
    }

    function loadSchedulesFromStorage() {
        const storedSchedules = localStorage.getItem("schedules");
        let parsedSchedules = { "Room A": [], "Room B": [], "Room C": [] };

        if (storedSchedules) {
            parsedSchedules = JSON.parse(storedSchedules);

            rooms.forEach(room => {
                if (!parsedSchedules[room]) {
                    parsedSchedules[room] = [];
                }
            });
        }

        return parsedSchedules;
    }

    function saveSchedulesToStorage(schedules) {
        localStorage.setItem("schedules", JSON.stringify(schedules));
    }

    rooms.forEach(renderRoomSchedule);
});
