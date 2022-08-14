async function initCalendar() {
  getData().then((data) => {
    drawCalendarFromData(data);
  });
  let repaintInterval = setInterval(() => {
    getData().then((data) => {
      console.log("repainted");
      drawCalendarFromData(data);
    });
  }, 1000);
}

function getTimeDifference(currentTime, countDownTo) {
  let diff = countDownTo - currentTime;
  let days = Math.floor(diff / (1000 * 60 * 60 * 24));
  let hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  let seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return {
    days,
    hours,
    minutes,
    seconds,
  };
}

function getCountdownString(currentTime, countDownTo) {
  let timeDifference = getTimeDifference(currentTime, countDownTo);
  let timeLeft = timeDifference.hours * 60 + timeDifference.minutes;
  return `<div class="time">${timeLeft}m ${timeDifference.seconds
    .toString()
    .padStart(2, "0")}s</div><div class="description">igjen</div>`;
}

function getCountUpString(currentTime, countDownTo) {
  let timeDifference = getTimeDifference(countDownTo, currentTime);
  if (timeDifference.hours) {
    return `<div class="time">
        ${countDownTo.getHours().toString().padStart(2, "0")}:${countDownTo
      .getMinutes()
      .toString()
      .padStart(2, "0")}
    </div>`;
  }
}

function setClock(now) {
  let nowMarkup = `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
  document.getElementById("clock").innerHTML = nowMarkup;
}

function setDay(day) {
  document.getElementById("day").innerHTML = day;
}

async function drawCalendarFromData(data) {
  let now = new Date();
  setClock(now);
  setDay(data.day);
  let availableEvents = data.events
    .map((event) => ({
      ...event,
      startTimeString: `${now.getFullYear()}-${(now.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}T${
        event.start_time
      }`,
      startTimeDate: new Date(
        `${now.getFullYear()}-${(now.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}T${
          event.start_time
        }`
      ),
      endTimeDate: new Date(
        `${now.getFullYear()}-${(now.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}T${
          event.end_time
        }`
      ),
    }))
    .filter((event) => event.endTimeDate > now);

  let onGoingEvents = availableEvents.filter(
    (event) => event.endTimeDate > now && event.startTimeDate < now
  );
  let upcomingEvents = availableEvents.filter(
    (event) => event.startTimeDate > now
  );
  console.log(now, onGoingEvents, upcomingEvents);
  if (onGoingEvents.length > 0) {
    drawOnGoingEvents(onGoingEvents, now);
  }
  if (upcomingEvents.length > 0) {
    drawUpcomingEvents(upcomingEvents, now);
  }
}

function drawOnGoingEvents(onGoingEvents, now) {
  console.log("hesten min");
  let onGoingEventsMarkup = onGoingEvents.length
    ? `
        <ul class="ongoing-list">
        ${onGoingEvents
          .map((eventData) => {
            return `
            <li> 
                <div class="time-left">${getCountdownString(
                  now,
                  eventData.endTimeDate
                )}</div>
                <div class="event-details">
                    <div class="event-name">${eventData.title}</div>
                    <div class="event-location">${eventData.location}</div>
                </div>


            </li>
        `;
          })
          .join("")}
        </ul>
    `
    : `<ul class="ongoing-list"><li><div class="event-details">
                <div class="event-name">Pause</div>
            </div>
        </li></ul>`;
  console.log(onGoingEventsMarkup);
  let divNode = document.createElement("div");
  divNode.innerHTML = onGoingEventsMarkup;
  document.getElementById("ongoing-events").innerHTML = "";
  document.getElementById("ongoing-events").append(divNode);
}

function drawUpcomingEvents(onGoingEvents, now) {
  let upcomingEventsMarkup = `
    <ul class="upcoming-list">
    ${onGoingEvents
      .map((eventData) => {
        return `
        <li> 
            <div class="time-left">${getCountUpString(
              now,
              eventData.endTimeDate
            )}</div>
            <div class="event-details">
                <div class="event-name">${eventData.title}</div>
                <div class="event-location">${eventData.location}</div>
            </div>


        </li>
    `;
      })
      .join("")}
    </ul>
`;
  let divNode = document.createElement("div");
  divNode.innerHTML = upcomingEventsMarkup;
  document.getElementById("upcoming-events").innerHTML = "";
  document.getElementById("upcoming-events").append(divNode);
}

var dataStore = {};
var fetchDataInterval = undefined;

async function fetchData() {
  let url =
    window.location.href.includes("localhost") ||
    window.location.href.includes("file://") ||
    window.location.href.includes("localhost")
      ? "data.json"
      : "https://api.retromessa.no/api/calendar";
  const data = await fetch(url).then((response) => response.json());
  return window.location.search.includes("sunday") ? data[1] : data[0];
}

async function getData() {
  // interval has not been started
  console.log(fetchDataInterval, dataStore);
  if (!fetchDataInterval || !dataStore) {
    console.log("starting interval");
    dataStore = await fetchData();
    fetchDataInterval = setInterval(async () => {
      dataStore = await fetchData();
      console.log("getting new data");
    }, 30000);
  }
  return dataStore;
}

initCalendar();
