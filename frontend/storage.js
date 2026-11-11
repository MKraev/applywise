const APPLICATIONS_KEY = "applywise.applications.v1";
const SKILLS_KEY = "applywise.skills.v1";
const STATUS_ORDER = ["Applied", "Screening", "Interview", "Offer", "Rejected"];
const LOGO_COLORS = [
  ["#edf1f8", "#667997"],
  ["#f7eee7", "#a17a5c"],
  ["#eaf2ed", "#64816c"],
  ["#f2edf7", "#826f9d"],
  ["#f8efed", "#a8736a"],
  ["#edf3f3", "#608183"],
];

const elements = {
  activeCount: document.querySelector("#active-count"),
  activeCaption: document.querySelector("#active-caption"),
  interviewCount: document.querySelector("#interview-count"),
  followUpCount: document.querySelector("#follow-up-count"),
  followUpCaption: document.querySelector("#follow-up-caption"),
  bestMatchScore: document.querySelector("#best-match-score"),
  bestMatchCaption: document.querySelector("#best-match-caption"),
  navCount: document.querySelector("#nav-application-count"),
  profileSkillCount: document.querySelector("#profile-skill-count"),
  profileSkillPreview: document.querySelector("#profile-skill-preview"),
  pipeline: document.querySelector("#pipeline-strip"),
  recentApplications: document.querySelector("#recent-applications"),
  recentEmpty: document.querySelector("#recent-empty"),
  allApplications: document.querySelector("#all-applications"),
  allEmpty: document.querySelector("#all-empty"),
  allEmptyTitle: document.querySelector("#all-empty strong"),
  allEmptyText: document.querySelector("#all-empty p"),
  allEmptyAdd: document.querySelector("#all-empty-add"),
  upNextList: document.querySelector("#up-next-list"),
  upNextEmpty: document.querySelector("#up-next-empty"),
  search: document.querySelector("#application-search"),
  statusFilter: document.querySelector("#status-filter"),
  appModal: document.querySelector("#application-modal"),
  appForm: document.querySelector("#application-form"),
  appId: document.querySelector("#application-id"),
  company: document.querySelector("#company-input"),
  role: document.querySelector("#role-input"),
  location: document.querySelector("#location-input"),
  workStyle: document.querySelector("#work-style-input"),
  dateApplied: document.querySelector("#date-applied-input"),
  status: document.querySelector("#status-input"),
  followUp: document.querySelector("#follow-up-input"),
  salary: document.querySelector("#salary-input"),
  description: document.querySelector("#description-input"),
  notes: document.querySelector("#notes-input"),
  jobUrl: document.querySelector("#job-url-input"),
  matchPreview: document.querySelector("#match-preview-text"),
  appTitle: document.querySelector("#application-modal-title"),
  formEyebrow: document.querySelector("#form-eyebrow"),
  saveButton: document.querySelector("#save-application-button"),
  deleteButton: document.querySelector("#delete-application-button"),
  formError: document.querySelector("#form-error"),
  skillsModal: document.querySelector("#skills-modal"),
  skillsForm: document.querySelector("#skills-form"),
  skillsInput: document.querySelector("#skills-input"),
  skillsError: document.querySelector("#skills-error"),
  insightHeading: document.querySelector("#insight-role-heading"),
  insightBestRole: document.querySelector("#insight-best-role"),
  insightSkills: document.querySelector("#insight-skills"),
  insightRolesCount: document.querySelector("#insight-roles-count"),
  roleInsightList: document.querySelector("#role-insight-list"),
  insightsEmpty: document.querySelector("#insights-empty"),
  toast: document.querySelector("#toast"),
  today: document.querySelector("#today-label"),
  crumb: document.querySelector("#page-crumb"),
  aboutModal: document.querySelector("#about-modal"),
};

let applications = readList(APPLICATIONS_KEY);
let skills = readSkills();
let toastTimer;

function readList(key) {
  try {
    const value = localStorage.getItem(key);
    if (!value) return [];
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) throw new TypeError("Saved application data is not a list.");
    return parsed.filter((item) => item && typeof item === "object" && item.id);
  } catch (error) {
    console.error(`Could not read ${key} from local storage.`, error);
    return [];
  }
}

function readSkills() {
  try {
    const value = localStorage.getItem(SKILLS_KEY);
    if (!value) return [];
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) throw new TypeError("Saved skills are not a list.");
    return parsed.filter((skill) => typeof skill === "string" && skill.trim());
  } catch (error) {
    console.error(`Could not read ${SKILLS_KEY} from local storage.`, error);
    return [];
  }
}

function persist() {
  try {
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(applications));
    localStorage.setItem(SKILLS_KEY, JSON.stringify(skills));
    return true;
  } catch (error) {
    console.error("Could not save Applywise data to local storage.", error);
    showToast("Couldn’t save just now. Check your browser storage settings.");
    return false;
  }
}

