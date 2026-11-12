const participantSelect = document.getElementById("participant-name");
const participantStatus = document.getElementById("participant-status");
const participantLink = document.getElementById("participant-app");

function readCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  const csv = text.replace(/^\uFEFF/, "");

  for (let index = 0; index < csv.length; index++) {
    const character = csv[index];
    if (character === '"') {
      if (quoted && csv[index + 1] === '"') {
        field += '"';
        index++;
      } else {
        quoted = !quoted;
      }
    } else if (!quoted && (character === "," || character === "\n" || character === "\r")) {
      row.push(field.trim());
      field = "";
      if (character !== ",") {
        rows.push(row);
        row = [];
        if (character === "\r" && csv[index + 1] === "\n") index++;
      }
    } else {
      field += character;
    }
  }

  if (quoted) throw new Error("Unclosed CSV field");
  row.push(field.trim());
  rows.push(row);
  return rows.filter(fields => fields.some(Boolean));
}

function readParticipants(text) {
  const [header, ...rows] = readCsv(text);
  if (header?.map(value => value.toLowerCase()).join(",") !== "name,app url") {
    throw new Error("Expected Name and App URL columns");
  }

  const participants = [];
  for (const [name, link] of rows) {
    if (!name || !link) continue;
    const url = URL.canParse(link) ? new URL(link) : null;
    if (url && (url.protocol === "https:" || url.protocol === "http:")) {
      participants.push({ name, url: url.href });
    }
  }
  return participants.sort((a, b) => a.name.localeCompare(b.name));
}

async function populateParticipants() {
  try {
    const response = await fetch("./participant-apps.csv");
    if (!response.ok) throw new Error("Roster unavailable");
    const participants = readParticipants(await response.text());

    participants.forEach(({ name }, index) => {
      participantSelect.add(new Option(name, String(index)));
    });
    participantSelect.disabled = participants.length === 0;
    if (!participants.length) participantStatus.textContent = "Participant app links will appear here once added.";

    participantSelect.addEventListener("change", () => {
      const participant = participants[participantSelect.value];
      if (participant) {
        participantLink.href = participant.url;
        participantLink.textContent = `Open app for ${participant.name} ↗`;
        participantLink.hidden = false;
      } else {
        participantLink.hidden = true;
        participantLink.removeAttribute("href");
        participantLink.textContent = "";
      }
    });
  } catch {
    participantStatus.textContent = "Participant app links couldn’t load. Try refreshing the page.";
  }
}

populateParticipants();
