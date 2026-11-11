function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function normalizeText(value) {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9+#]+/g, " ").trim();
}

function getMatch(application) {
  const description = normalizeText(application.description);
  if (!description || skills.length === 0) return null;
  const matched = skills.filter((skill) => {
    const phrase = normalizeText(skill);
    if (!phrase) return false;
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(?:^| )${escaped}(?: |$)`).test(description);
  });
  const missing = skills.filter((skill) => !matched.includes(skill));
  return {
    score: Math.round((matched.length / skills.length) * 100),
    matched,
    missing,
  };
}

function getScoredApplications() {
  return applications
    .map((application) => ({ application, match: getMatch(application) }))
    .filter((item) => item.match)
    .sort((a, b) => b.match.score - a.match.score);
}

function localDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value, options = { month: "short", day: "numeric" }) {
  const date = parseDate(value);
  return date ? new Intl.DateTimeFormat("en-US", options).format(date) : "—";
}

function getDueFollowUps() {
  const today = parseDate(localDate());
  const end = new Date(today);
  end.setDate(end.getDate() + 7);
  const endString = localDate(end);
  return applications
    .filter((application) => application.followUp && application.status !== "Rejected")
    .filter((application) => application.followUp <= endString)
    .sort((a, b) => a.followUp.localeCompare(b.followUp));
}

function statusClass(status) {
  return `status-${String(status ?? "").toLowerCase()}`;
}

function companyInitial(company) {
  return [...String(company ?? "").trim()][0]?.toUpperCase() || "?";
}

function logoStyle(company) {
  const sum = [...String(company ?? "")].reduce((total, character) => total + character.charCodeAt(0), 0);
  const [background, foreground] = LOGO_COLORS[sum % LOGO_COLORS.length];
  return `background:${background};color:${foreground}`;
}

function safeJobUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

