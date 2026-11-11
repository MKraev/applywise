function applicationRow(application, full = false) {
  const match = getMatch(application);
  const date = formatDate(application.dateApplied);
  const followUp = formatDate(application.followUp);
  const link = safeJobUrl(application.url);
  const company = escapeHtml(application.company);
  const role = escapeHtml(application.role);
  const subtitle = [application.company, application.location].filter(Boolean).map(escapeHtml).join(" · ");
  const fit = match
    ? `<span class="fit-dot"></span>${match.score}%`
    : '<span class="fit-unscored">—</span>';
  return `<tr data-edit-id="${escapeHtml(application.id)}" tabindex="0" aria-label="Edit ${role} at ${company}">
    <td><div class="company-cell">
      <span class="company-logo" style="${logoStyle(application.company)}">${escapeHtml(companyInitial(application.company))}</span>
      <span class="company-role"><strong>${role}</strong><span>${subtitle}</span></span>
    </div></td>
    <td><span class="status-pill ${statusClass(application.status)}">${escapeHtml(application.status)}</span></td>
    <td>${date}</td>
    ${full ? `<td>${followUp}${application.followUp && application.followUp < localDate() ? ' <span class="overdue-label">Due</span>' : ""}</td>` : ""}
    <td class="fit-cell ${match ? "" : "fit-unscored"}">${fit}</td>
    <td>${link ? `<a class="row-action row-link" href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${role} job link" title="Open job link" data-stop-row>↗</a>` : ""}<button class="row-action" type="button" aria-label="Edit ${role} at ${company}" title="Edit application">···</button></td>
  </tr>`;
}

function renderSummary() {
  const active = applications.filter((application) => application.status !== "Rejected").length;
  const interviews = applications.filter((application) => application.status === "Interview").length;
  const due = getDueFollowUps();
  const topMatch = getScoredApplications()[0];
  elements.activeCount.textContent = active;
  elements.activeCaption.textContent = `${applications.length} total ${applications.length === 1 ? "application" : "applications"}`;
  elements.interviewCount.textContent = interviews;
  elements.followUpCount.textContent = due.length;
  elements.followUpCaption.textContent = due.length ? "due this week" : "on your radar";
  elements.bestMatchScore.textContent = topMatch ? `${topMatch.match.score}%` : "—";
  elements.bestMatchCaption.textContent = topMatch
    ? `${topMatch.application.role} · ${topMatch.application.company}`
    : skills.length ? "add job descriptions to compare" : "add skills and a job description";
  elements.navCount.textContent = applications.length;
}

function renderPipeline() {
  elements.pipeline.innerHTML = STATUS_ORDER.map((status) => {
    const count = applications.filter((application) => application.status === status).length;
    return `<div class="pipeline-stage"><span class="pipeline-dot dot-${status.toLowerCase()}"></span><strong>${count}</strong><span>${status === "Rejected" ? "Closed" : escapeHtml(status)}</span></div>`;
  }).join("");
}

function renderRecent() {
  const sorted = [...applications].sort((a, b) => (b.dateApplied || "").localeCompare(a.dateApplied || ""));
  const recent = sorted.slice(0, 5);
  elements.recentApplications.innerHTML = recent.map((application) => applicationRow(application)).join("");
  elements.recentEmpty.classList.toggle("is-empty-visible", recent.length === 0);
  elements.recentApplications.closest(".application-table").style.display = recent.length ? "" : "none";
  elements.pipeline.style.display = applications.length ? "" : "none";
}

function renderAllApplications() {
  const query = elements.search.value.trim().toLowerCase();
  const status = elements.statusFilter.value;
  const matching = [...applications]
    .filter((application) => status === "all" || application.status === status)
    .filter((application) => `${application.company} ${application.role} ${application.location}`.toLowerCase().includes(query))
    .sort((a, b) => (b.dateApplied || "").localeCompare(a.dateApplied || ""));
  elements.allApplications.innerHTML = matching.map((application) => applicationRow(application, true)).join("");
  const noResults = matching.length === 0;
  elements.allEmpty.classList.toggle("is-empty-visible", noResults);
  elements.allApplications.closest(".application-table").style.display = noResults ? "none" : "";
  const hasNoApplications = applications.length === 0;
  elements.allEmptyTitle.textContent = hasNoApplications ? "Your tracker is ready when you are." : "No applications match that search.";
  elements.allEmptyText.textContent = hasNoApplications
    ? "Add a role you’ve applied for and keep the important details close."
    : "Try a different keyword or clear the status filter.";
  elements.allEmptyAdd.classList.toggle("is-hidden", !hasNoApplications);
}

function renderUpNext() {
  const due = getDueFollowUps().slice(0, 4);
  elements.upNextList.innerHTML = due.map((application) => {
    const date = parseDate(application.followUp);
    const isOverdue = application.followUp < localDate();
    const day = isOverdue ? "!" : date.getDate();
    const month = isOverdue ? "overdue" : new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
    return `<div class="up-next-item" data-edit-id="${escapeHtml(application.id)}" tabindex="0" role="button" aria-label="Open follow-up for ${escapeHtml(application.role)}">
      <span class="up-next-date"><strong>${day}</strong><span>${month}</span></span>
      <span class="up-next-copy"><strong>${escapeHtml(application.company)} · ${escapeHtml(application.role)}</strong><span>${isOverdue ? "Follow-up is overdue" : `Follow up ${formatDate(application.followUp, { month: "short", day: "numeric" })}`}</span></span>
    </div>`;
  }).join("");
  elements.upNextEmpty.style.display = due.length ? "none" : "flex";
}

function renderProfile() {
  elements.profileSkillCount.textContent = `${skills.length} ${skills.length === 1 ? "skill" : "skills"} added`;
  elements.profileSkillPreview.textContent = skills.slice(0, 4).join(" · ") + (skills.length > 4 ? " +" : "");
  elements.insightSkills.innerHTML = skills.length
    ? skills.map((skill) => `<span class="skill-chip">${escapeHtml(skill)}</span>`).join("")
    : '<div class="skills-empty">Add a few strengths to get started.</div>';
}

function renderInsights() {
  const scored = getScoredApplications();
  const top = scored[0];
  elements.insightRolesCount.textContent = `${scored.length} ${scored.length === 1 ? "role" : "roles"} scored`;
  if (!top) {
    elements.insightHeading.textContent = "Your role match";
    elements.insightBestRole.innerHTML = `<div class="best-role-empty"><span>✦</span><span>${skills.length ? "Add a job description to one of your applications to see your top alignment." : "Add your skills, then a job description, to see your top alignment."}</span></div>`;
  } else {
    elements.insightHeading.textContent = top.application.role || "Your role match";
    const match = top.match;
    const missing = match.missing.slice(0, 3);
    const matchedText = `${match.matched.length} of ${skills.length} profile ${skills.length === 1 ? "skill" : "skills"} found`;
    elements.insightBestRole.innerHTML = `<div class="best-role-summary">
      <div class="score-ring" style="--score:${match.score}%"><strong>${match.score}%</strong></div>
      <div class="best-role-copy"><strong>${escapeHtml(top.application.role)} · ${escapeHtml(top.application.company)}</strong><span>${escapeHtml(top.application.status)}${top.application.location ? ` · ${escapeHtml(top.application.location)}` : ""}</span></div>
    </div>
    <div class="match-breakdown"><span><strong>${match.matched.length}</strong> strengths aligned</span><span>${missing.length ? `<strong>${missing.length}</strong> to explore` : "All strengths found"}</span><span>${matchedText}</span></div>`;
  }
  elements.roleInsightList.innerHTML = scored.map(({ application, match }) => `<div class="role-insight-row" data-edit-id="${escapeHtml(application.id)}" tabindex="0" role="button" aria-label="Edit ${escapeHtml(application.role)} at ${escapeHtml(application.company)}">
    <div class="role-insight-name"><strong>${escapeHtml(application.role)}</strong><span>${escapeHtml(application.company)} · ${escapeHtml(application.status)}</span></div>
    <div class="progress-track" aria-label="${match.score}% skill match"><div class="progress-fill" style="width:${match.score}%"></div></div>
    <span class="role-insight-score">${match.score}%</span>
  </div>`).join("");
  elements.insightsEmpty.classList.toggle("is-empty-visible", scored.length === 0);
  elements.roleInsightList.style.display = scored.length ? "" : "none";
}

function render() {
  renderSummary();
  renderPipeline();
  renderRecent();
  renderAllApplications();
  renderUpNext();
  renderProfile();
  renderInsights();
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 2800);
}

