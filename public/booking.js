const candidate =
  new URLSearchParams(location.search).get("build") === "candidate";
document.querySelector("#build-label").textContent = candidate
  ? "CANDIDATE BUILD"
  : "BASELINE BUILD";
document.querySelector("#sold-out").disabled = candidate;
const key = `harbour-bookings-${candidate ? "candidate" : "baseline"}`;
let bookings = JSON.parse(localStorage.getItem(key) || "[]");

function render() {
  const list = document.querySelector("#bookings");
  list.replaceChildren();
  document.querySelector("#empty").hidden = bookings.length > 0;
  for (const booking of bookings) {
    const card = document.createElement("article");
    card.dataset.testid = "booking";
    card.textContent = `${booking.name} · ${booking.time === "10:00" ? "10:00 AM" : "11:00 AM"}`;
    list.append(card);
  }
}

document.querySelector("#booking-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.querySelector("#customer-name").value.trim();
  const time = document.querySelector("#appointment-time").value;
  const status = document.querySelector("#booking-status");
  if (!name) {
    status.textContent = "Enter the customer name.";
    return;
  }
  if (!time) {
    status.textContent = "Choose an available time.";
    return;
  }
  bookings.push({ name, time });
  if (candidate) localStorage.setItem(key, JSON.stringify(bookings));
  status.textContent = "Booking confirmed.";
  render();
});

render();
