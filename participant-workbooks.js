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
  if (header?.map(value => value.toLowerCase()).join(",") !== "name,workbook url") {
    throw new Error("Expected Name and Workbook URL columns");
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

function setupWorkbookLookup(lookup, participants) {
  const select = lookup.querySelector("select");
  const status = lookup.querySelector("[role='status']");
  const link = lookup.querySelector("[data-workbook-link]");

  participants.forEach(({ name }, index) => {
    select.add(new Option(name, String(index)));
  });
  select.disabled = participants.length === 0;
  if (!participants.length) status.textContent = "Workbook links will appear here once added.";

  select.addEventListener("change", () => {
    const participant = participants[select.value];
    if (participant) {
      link.href = participant.url;
      link.textContent = `Open workbook for ${participant.name} ↗`;
      link.hidden = false;
    } else {
      link.hidden = true;
      link.removeAttribute("href");
      link.textContent = "";
    }
  });
}

async function populateWorkbookLookups() {
  const lookups = document.querySelectorAll("[data-workbook-lookup]");
  try {
    const response = await fetch("./participant-workbooks.csv");
    if (!response.ok) throw new Error("Workbook roster unavailable");
    const participants = readParticipants(await response.text());
    lookups.forEach(lookup => setupWorkbookLookup(lookup, participants));
  } catch {
    lookups.forEach(lookup => {
      lookup.querySelector("[role='status']").textContent = "Workbook links couldn’t load. Try refreshing the page or open the workbook folder.";
    });
  }
}

populateWorkbookLookups();
