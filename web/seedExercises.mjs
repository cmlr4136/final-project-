const BASE = "http://localhost:8080";

function stripHtml(html) {
  return html?.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim() || null;
}

async function getToken() {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@example.com", password: "admin" }),
  });
  const data = await res.json();
  return data.token;
}

async function fetchWger() {
  let url = "https://wger.de/api/v2/exerciseinfo/?format=json&language=2&limit=100";
  const exercises = [];

  while (url) {
    console.log("Fetching:", url);
    const res = await fetch(url);
    const data = await res.json();

    for (const ex of data.results) {
      const translation = ex.translations?.find((t) => t.language === 2);
      const name = translation?.name?.trim();
      if (!name) continue;

      exercises.push({
        name,
        muscleGroup: ex.category?.name ?? "General",
        equipment: ex.equipment?.[0]?.name ?? null,
        notes: stripHtml(translation?.description),
      });
    }

    url = data.next;
  }

  return exercises;
}

async function seedToBackend(token, exercises) {
  let count = 0;
  for (const ex of exercises) {
    const res = await fetch(`${BASE}/api/exercises`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(ex),
    });

    if (res.ok) {
      count++;
      console.log(`Added: ${ex.name}`);
    } else {
      console.log(`Failed: ${ex.name} (${res.status})`);
    }
  }
  console.log(`Done. Added ${count} exercises.`);
}

const token = await getToken();
const exercises = await fetchWger();
console.log(`Fetched ${exercises.length} exercises from wger`);
await seedToBackend(token, exercises);