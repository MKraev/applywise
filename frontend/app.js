function openApplication(application = null) {
  elements.appForm.reset();
  elements.formError.textContent = "";
  elements.appId.value = application?.id ?? "";
  elements.appTitle.textContent = application ? "Edit application" : "Add an application";
  elements.formEyebrow.textContent = application ? "YOUR OPPORTUNITY" : "A NEW POSSIBILITY";
  elements.saveButton.textContent = application ? "Save changes" : "Save application";
  elements.deleteButton.classList.toggle("is-hidden", !application);
  elements.company.value = application?.company ?? "";
  elements.role.value = application?.role ?? "";
  elements.location.value = application?.location ?? "";
  elements.workStyle.value = application?.workStyle ?? "";
  elements.dateApplied.value = application?.dateApplied ?? localDate();
  elements.status.value = application?.status ?? "Applied";
  elements.followUp.value = application?.followUp ?? "";
  elements.salary.value = application?.salary ?? "";
  elements.description.value = application?.description ?? "";
  elements.notes.value = application?.notes ?? "";
  elements.jobUrl.value = application?.url ?? "";
  updateMatchPreview();
  elements.appModal.showModal();
  elements.company.focus();
}

function updateMatchPreview() {
  const temporary = { description: elements.description.value };
  const match = getMatch(temporary);
  if (!elements.description.value.trim()) {
    elements.matchPreview.textContent = skills.length
      ? "Paste a job description to compare your strengths."
      : "Add your skills in the sidebar to see a fit signal.";
    return;
  }
  if (!skills.length) {
    elements.matchPreview.textContent = "Job description added. Add your skills to see a fit signal.";
    return;
  }
  const aligned = match.matched.slice(0, 3).join(", ");
  const notFound = match.missing.slice(0, 2).join(", ");
  elements.matchPreview.textContent = `${match.score}% fit signal · ${match.matched.length} of ${skills.length} skills found${aligned ? ` (${aligned})` : ""}${notFound ? ` · Explore: ${notFound}` : ""}`;
}

function collectApplication() {
  const url = elements.jobUrl.value.trim();
  if (url && !safeJobUrl(url)) {
    elements.formError.textContent = "Please use a valid http or https job link.";
    elements.jobUrl.focus();
    return null;
  }
  const existing = applications.find((application) => application.id === elements.appId.value);
  return {
    id: existing?.id ?? crypto.randomUUID(),
    company: elements.company.value.trim(),
    role: elements.role.value.trim(),
    location: elements.location.value.trim(),
    workStyle: elements.workStyle.value,
    dateApplied: elements.dateApplied.value || localDate(),
    status: elements.status.value,
    followUp: elements.followUp.value,
    salary: elements.salary.value.trim(),
    description: elements.description.value.trim(),
    notes: elements.notes.value.trim(),
    url,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function saveApplication(event) {
  event.preventDefault();
  elements.formError.textContent = "";
  if (!elements.appForm.reportValidity()) return;
  const application = collectApplication();
  if (!application) return;
  const previous = applications;
  const index = applications.findIndex((item) => item.id === application.id);
  applications = index >= 0
    ? applications.map((item) => item.id === application.id ? application : item)
    : [application, ...applications];
  if (!persist()) {
    applications = previous;
    return;
  }
  elements.appModal.close();
  render();
  showToast(index >= 0 ? "Your application has been updated." : "Application added. You’ve got this.");
}

function deleteCurrentApplication() {
  const application = applications.find((item) => item.id === elements.appId.value);
  if (!application) return;
  if (!window.confirm(`Delete ${application.role} at ${application.company}? This can’t be undone.`)) return;
  const previous = applications;
  applications = applications.filter((item) => item.id !== application.id);
  if (!persist()) {
    applications = previous;
    return;
  }
  elements.appModal.close();
  render();
  showToast("Application deleted.");
}

function openSkills() {
  elements.skillsInput.value = skills.join(", ");
  elements.skillsError.textContent = "";
  elements.skillsModal.showModal();
  elements.skillsInput.focus();
}

function saveSkills(event) {
  event.preventDefault();
  const nextSkills = [...new Set(elements.skillsInput.value
    .split(/[,;\n]/)
    .map((skill) => skill.trim())
    .filter(Boolean)
    .map((skill) => skill.slice(0, 45)))].slice(0, 30);
  const previous = skills;
  skills = nextSkills;
  if (!persist()) {
    skills = previous;
    return;
  }
  elements.skillsModal.close();
  render();
  updateMatchPreview();
  showToast(skills.length ? "Your strengths are up to date." : "Your skills have been cleared.");
}

function changeView(name) {
  const viewNames = ["overview", "applications", "insights"];
  if (!viewNames.includes(name)) return;
  document.querySelectorAll(".page-view").forEach((view) => view.classList.toggle("is-visible", view.id === `${name}-view`));
  document.querySelectorAll(".nav-link").forEach((link) => link.classList.toggle("is-active", link.dataset.view === name));
  const title = name === "overview" ? "Overview" : name === "applications" ? "Applications" : "Fit insights";
  elements.crumb.textContent = title;
  document.title = `${title} · Applywise`;
  if (name === "applications") elements.search.focus({ preventScroll: true });
}

function setupEvents() {
  document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => changeView(button.dataset.view)));
  document.querySelectorAll("[data-go-view]").forEach((button) => button.addEventListener("click", () => changeView(button.dataset.goView)));
  document.querySelectorAll("[data-add-application], #add-application-button").forEach((button) => button.addEventListener("click", () => openApplication()));
  document.querySelectorAll("#edit-skills-button, #avatar-edit-button, #insights-edit-skills, #insights-edit-skills-link").forEach((button) => button.addEventListener("click", openSkills));
  document.querySelector("#help-button").addEventListener("click", () => elements.aboutModal.showModal());
  elements.appForm.addEventListener("submit", saveApplication);
  elements.deleteButton.addEventListener("click", deleteCurrentApplication);
  elements.description.addEventListener("input", updateMatchPreview);
  elements.skillsForm.addEventListener("submit", saveSkills);
  elements.search.addEventListener("input", renderAllApplications);
  elements.statusFilter.addEventListener("change", renderAllApplications);

  document.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", () => elements.appModal.close()));
  document.querySelectorAll("[data-close-skills]").forEach((button) => button.addEventListener("click", () => elements.skillsModal.close()));
  document.querySelectorAll("[data-close-about]").forEach((button) => button.addEventListener("click", () => elements.aboutModal.close()));

  for (const table of [elements.recentApplications, elements.allApplications]) {
    table.addEventListener("click", (event) => {
      if (event.target.closest("[data-stop-row]")) return;
      const row = event.target.closest("[data-edit-id]");
      if (row) openApplication(applications.find((application) => application.id === row.dataset.editId));
    });
    table.addEventListener("keydown", (event) => {
      const row = event.target.closest("tr[data-edit-id]");
      if (row && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        openApplication(applications.find((application) => application.id === row.dataset.editId));
      }
    });
  }

  document.querySelectorAll("#up-next-list, #role-insight-list").forEach((list) => {
    list.addEventListener("click", (event) => {
      const row = event.target.closest("[data-edit-id]");
      if (row) openApplication(applications.find((application) => application.id === row.dataset.editId));
    });
    list.addEventListener("keydown", (event) => {
      const row = event.target.closest("[data-edit-id]");
      if (row && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        openApplication(applications.find((application) => application.id === row.dataset.editId));
      }
    });
  });

  [elements.appModal, elements.skillsModal, elements.aboutModal].forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  });

  window.addEventListener("storage", (event) => {
    if (event.key === APPLICATIONS_KEY || event.key === SKILLS_KEY) {
      applications = readList(APPLICATIONS_KEY);
      skills = readSkills();
      render();
      showToast("Your workspace was updated in another tab.");
    }
  });
}

function initialize() {
  elements.today.textContent = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());
  setupEvents();
  render();
}

initialize();
