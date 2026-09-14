const fixed = new URLSearchParams(location.search).get("build") === "fixed";
document.querySelector("#build-label").textContent = fixed
  ? "REPAIRED BUILD"
  : "SEEDED DEFECT";
const key = `fieldnotes-${fixed ? "fixed" : "defect"}`;
let notes = JSON.parse(localStorage.getItem(key) || "[]");
function render() {
  const list = document.querySelector("#notes");
  list.replaceChildren();
  document.querySelector("#empty").hidden = notes.length > 0;
  for (const text of notes) {
    const card = document.createElement("article");
    card.dataset.testid = "note";
    card.textContent = text;
    list.append(card);
  }
}
document.querySelector("#note-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.querySelector("#note-input");
  const value = input.value.trim();
  const status = document.querySelector("#note-status");
  if (!value) {
    status.textContent = "Write a note before saving.";
    return;
  }
  notes.push(value);
  // Seeded defect: the original build updates the screen but omits durable storage.
  if (fixed) localStorage.setItem(key, JSON.stringify(notes));
  input.value = "";
  status.textContent = "Note saved.";
  render();
});
render();
