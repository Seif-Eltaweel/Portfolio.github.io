/**
 * admin.js — Admin panel logic
 */
import { DataStore } from './projects.js';

/* ── Helpers ──────────────────────────────────────────────── */
function $(sel, ctx = document) { return ctx.querySelector(sel); }
function $$(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }
function esc(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }

let editingProjectId = null;
let editingSkillId   = null;
let editingExperienceId = null;
let editingCourseId  = null;

/* ── Toast ────────────────────────────────────────────────── */
function toast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${type === 'success' ? '✅' : '❌'}</span> ${esc(msg)}`;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3200);
}

/* ── Auth Gate ────────────────────────────────────────────── */
function initAuth() {
  const gate    = $('#auth-gate');
  const panel   = $('#admin-panel');
  const authBtn = $('#auth-submit');
  const authErr = $('#auth-error');

  function unlock() {
    gate.style.display  = 'none';
    panel.style.display = 'block';
    loadAll();
  }

  // Check if already authenticated this session
  if (sessionStorage.getItem('portfolio_admin_auth') === 'true') {
    unlock();
    return;
  }

  authBtn.addEventListener('click', () => {
    const pw = $('#auth-password').value;
    if (DataStore.checkPassword(pw)) {
      sessionStorage.setItem('portfolio_admin_auth', 'true');
      unlock();
    } else {
      authErr.textContent = '❌ Incorrect password. Try again.';
      $('#auth-password').value = '';
      $('#auth-password').focus();
    }
  });

  $('#auth-password').addEventListener('keydown', e => {
    if (e.key === 'Enter') authBtn.click();
  });
}

/* ── Tab Navigation ───────────────────────────────────────── */
function initTabs() {
  $$('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.admin-tab').forEach(t => t.classList.remove('active'));
      $$('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      $(`#tab-${tab.dataset.tab}`).classList.add('active');
    });
  });
}

/* ── Load All Data ────────────────────────────────────────── */
function loadAll() {
  renderProjectList();
  renderSkillList();
  renderExperienceList();
  renderCourseList();
  loadMeta();
}

/* ══════════════════════════════════════════════════════════
   PROJECTS
══════════════════════════════════════════════════════════ */
function renderProjectList() {
  const list     = $('#project-list');
  const projects = DataStore.getProjects();

  if (projects.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">📂</div><p>No projects yet. Add your first one!</p></div>`;
    return;
  }

  list.innerHTML = projects.map(p => `
    <div class="admin-item" data-id="${esc(p.id)}">
      <div class="admin-item-icon">${esc(p.emoji || '🚀')}</div>
      <div class="admin-item-info">
        <div class="admin-item-title">${esc(p.title)}</div>
        <div class="admin-item-meta">
          ${p.difficulty ? `<span class="mini-tag" style="color:#ffc107;">${esc(p.difficulty)}</span>` : ''}
          ${(p.tags || []).slice(0, 3).map(t => `<span class="mini-tag">${esc(t)}</span>`).join('')}
        </div>
      </div>
      <div class="admin-item-actions">
        <button class="action-btn edit-btn" data-id="${esc(p.id)}" title="Edit">✏️</button>
        <button class="action-btn del-btn"  data-id="${esc(p.id)}" title="Delete">🗑️</button>
      </div>
    </div>
  `).join('');

  $$('.edit-btn', list).forEach(btn => {
    btn.addEventListener('click', () => openProjectForm(btn.dataset.id));
  });
  $$('.del-btn', list).forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Delete this project?')) {
        DataStore.deleteProject(btn.dataset.id);
        toast('Project deleted');
        renderProjectList();
      }
    });
  });
}

function openProjectForm(id = null) {
  editingProjectId = id;
  const modal = $('#project-modal');
  const title = $('#modal-project-title');
  const form  = $('#project-form');

  form.reset();
  // Reset toggles to defaults for new projects
  $('#proj-show-demo').checked   = false;
  $('#proj-show-github').checked = true;
  $('#proj-show-video').checked  = false;

  if (id) {
    const proj = DataStore.getProjects().find(p => p.id === id);
    if (!proj) return;
    title.textContent = 'Edit Project';
    $('#proj-title').value        = proj.title || '';
    $('#proj-description').value  = proj.description || '';
    $('#proj-emoji').value        = proj.emoji || '🚀';
    $('#proj-tags').value         = (proj.tags || []).join(', ');
    $('#proj-imageurl').value     = proj.imageUrl || '';
    $('#proj-demourl').value      = proj.demoUrl || '';
    $('#proj-githuburl').value    = proj.githubUrl || '';
    $('#proj-videourl').value     = proj.videoUrl || '';
    $('#proj-difficulty').value   = proj.difficulty || 'Intermediate';
    $('#proj-show-demo').checked  = proj.showDemo !== false;
    $('#proj-show-github').checked = proj.showGithub !== false;
    $('#proj-show-video').checked = proj.showVideo === true;
    $('#proj-featured').checked   = proj.featured || false;
  } else {
    title.textContent = 'Add New Project';
    $('#proj-emoji').value = '🚀';
    $('#proj-difficulty').value = 'Intermediate';
  }

  modal.classList.add('open');
}

function closeProjectModal() {
  $('#project-modal').classList.remove('open');
  editingProjectId = null;
}

function initProjectForm() {
  $('#add-project-btn').addEventListener('click', () => openProjectForm());
  $('#close-project-modal').addEventListener('click', closeProjectModal);
  $('#cancel-project').addEventListener('click', closeProjectModal);
  $('#project-modal').addEventListener('click', e => {
    if (e.target === $('#project-modal')) closeProjectModal();
  });

  $('#project-form').addEventListener('submit', e => {
    e.preventDefault();
    const data = {
      title:       $('#proj-title').value.trim(),
      description: $('#proj-description').value.trim(),
      emoji:       $('#proj-emoji').value.trim() || '🚀',
      tags:        $('#proj-tags').value.split(',').map(t => t.trim()).filter(Boolean),
      imageUrl:    $('#proj-imageurl').value.trim(),
      demoUrl:     $('#proj-demourl').value.trim(),
      githubUrl:   $('#proj-githuburl').value.trim(),
      videoUrl:    $('#proj-videourl').value.trim(),
      difficulty:  $('#proj-difficulty').value,
      showDemo:    $('#proj-show-demo').checked,
      showGithub:  $('#proj-show-github').checked,
      showVideo:   $('#proj-show-video').checked,
      featured:    $('#proj-featured').checked,
    };

    if (!data.title) { toast('Please enter a project title', 'error'); return; }

    if (editingProjectId) {
      DataStore.updateProject(editingProjectId, data);
      toast('Project updated! ✨');
    } else {
      DataStore.addProject(data);
      toast('Project added! 🚀');
    }
    closeProjectModal();
    renderProjectList();
  });
}

/* ══════════════════════════════════════════════════════════
   SKILLS
══════════════════════════════════════════════════════════ */
function renderSkillList() {
  const list   = $('#skill-list');
  const skills = DataStore.getSkills();

  if (skills.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">⚙️</div><p>No skills yet. Add your first one!</p></div>`;
    return;
  }

  list.innerHTML = skills.map(s => `
    <div class="admin-item" data-id="${esc(s.id)}">
      <div class="admin-item-icon">${esc(s.icon || '⚙️')}</div>
      <div class="admin-item-info">
        <div class="admin-item-title">${esc(s.name)}</div>
        <div class="admin-item-meta"><span class="mini-tag">${esc(s.level || '')}</span></div>
      </div>
      <div class="admin-item-actions">
        <button class="action-btn edit-btn" data-id="${esc(s.id)}" title="Edit">✏️</button>
        <button class="action-btn del-btn"  data-id="${esc(s.id)}" title="Delete">🗑️</button>
      </div>
    </div>
  `).join('');

  $$('.edit-btn', list).forEach(btn => {
    btn.addEventListener('click', () => openSkillForm(btn.dataset.id));
  });
  $$('.del-btn', list).forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Delete this skill?')) {
        DataStore.deleteSkill(btn.dataset.id);
        toast('Skill deleted');
        renderSkillList();
      }
    });
  });
}

function openSkillForm(id = null) {
  editingSkillId = id;
  const modal = $('#skill-modal');
  const title = $('#modal-skill-title');
  const form  = $('#skill-form');
  form.reset();

  if (id) {
    const skill = DataStore.getSkills().find(s => s.id === id);
    if (!skill) return;
    title.textContent = 'Edit Skill';
    $('#skill-name').value  = skill.name  || '';
    $('#skill-icon').value  = skill.icon  || '⚙️';
    $('#skill-level').value = skill.level || 'Intermediate';
  } else {
    title.textContent = 'Add New Skill';
    $('#skill-icon').value  = '⚙️';
    $('#skill-level').value = 'Intermediate';
  }
  modal.classList.add('open');
}

function closeSkillModal() {
  $('#skill-modal').classList.remove('open');
  editingSkillId = null;
}

function initSkillForm() {
  $('#add-skill-btn').addEventListener('click', () => openSkillForm());
  $('#close-skill-modal').addEventListener('click', closeSkillModal);
  $('#cancel-skill').addEventListener('click', closeSkillModal);
  $('#skill-modal').addEventListener('click', e => {
    if (e.target === $('#skill-modal')) closeSkillModal();
  });

  $('#skill-form').addEventListener('submit', e => {
    e.preventDefault();
    const data = {
      name:  $('#skill-name').value.trim(),
      icon:  $('#skill-icon').value.trim() || '⚙️',
      level: $('#skill-level').value,
    };
    if (!data.name) { toast('Please enter a skill name', 'error'); return; }

    if (editingSkillId) {
      DataStore.updateSkill(editingSkillId, data);
      toast('Skill updated! ✨');
    } else {
      DataStore.addSkill(data);
      toast('Skill added! ⚙️');
    }
    closeSkillModal();
    renderSkillList();
  });
}

/* ══════════════════════════════════════════════════════════
   COURSES
══════════════════════════════════════════════════════════ */
function renderCourseList() {
  const list    = $('#course-list');
  const courses = DataStore.getCourses();

  if (courses.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">📚</div><p>No courses yet. Add your first one!</p></div>`;
    return;
  }

  list.innerHTML = courses.map(c => `
    <div class="admin-item" data-id="${esc(c.id)}">
      <div class="admin-item-icon">${esc(c.icon || '📚')}</div>
      <div class="admin-item-info">
        <div class="admin-item-title">${esc(c.title)}</div>
        <div class="admin-item-meta">
          <span class="mini-tag">${esc(c.provider || '')}</span>
          <span class="mini-tag" style="color:var(--text-muted);">${esc(c.date || '')}</span>
        </div>
      </div>
      <div class="admin-item-actions">
        <button class="action-btn edit-btn" data-id="${esc(c.id)}" title="Edit">✏️</button>
        <button class="action-btn del-btn"  data-id="${esc(c.id)}" title="Delete">🗑️</button>
      </div>
    </div>
  `).join('');

  $$('.edit-btn', list).forEach(btn => {
    btn.addEventListener('click', () => openCourseForm(btn.dataset.id));
  });
  $$('.del-btn', list).forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Delete this course?')) {
        DataStore.deleteCourse(btn.dataset.id);
        toast('Course deleted');
        renderCourseList();
      }
    });
  });
}

function openCourseForm(id = null) {
  editingCourseId = id;
  const modal = $('#course-modal');
  const title = $('#modal-course-title');
  const form  = $('#course-form');
  form.reset();

  if (id) {
    const course = DataStore.getCourses().find(c => c.id === id);
    if (!course) return;
    title.textContent = 'Edit Course';
    $('#course-title').value       = course.title       || '';
    $('#course-provider').value    = course.provider    || '';
    $('#course-description').value = course.description || '';
    $('#course-icon').value        = course.icon        || '📚';
    $('#course-date').value        = course.date        || '';
    $('#course-url').value         = course.url         || '';
  } else {
    title.textContent = 'Add New Course';
    $('#course-icon').value = '📚';
  }
  modal.classList.add('open');
}

function closeCourseModal() {
  $('#course-modal').classList.remove('open');
  editingCourseId = null;
}

function initCourseForm() {
  $('#add-course-btn').addEventListener('click', () => openCourseForm());
  $('#close-course-modal').addEventListener('click', closeCourseModal);
  $('#cancel-course').addEventListener('click', closeCourseModal);
  $('#course-modal').addEventListener('click', e => {
    if (e.target === $('#course-modal')) closeCourseModal();
  });

  $('#course-form').addEventListener('submit', e => {
    e.preventDefault();
    const data = {
      title:       $('#course-title').value.trim(),
      provider:    $('#course-provider').value.trim(),
      description: $('#course-description').value.trim(),
      icon:        $('#course-icon').value.trim() || '📚',
      date:        $('#course-date').value.trim(),
      url:         $('#course-url').value.trim(),
    };
    if (!data.title) { toast('Please enter a course title', 'error'); return; }

    if (editingCourseId) {
      DataStore.updateCourse(editingCourseId, data);
      toast('Course updated! ✨');
    } else {
      DataStore.addCourse(data);
      toast('Course added! 📚');
    }
    closeCourseModal();
    renderCourseList();
  });
}

/* ── EXPERIENCE ───────────────────────────────────────────── */
function renderExperienceList() {
  const list = $('#experience-list');
  if (!list) return;
  const experience = DataStore.getExperience();

  if (experience.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">💼</div><p>No experience listed yet. Add your first one!</p></div>`;
    return;
  }

  list.innerHTML = experience.map(e => `
    <div class="admin-item" data-id="${esc(e.id)}">
      <div class="admin-item-icon">💼</div>
      <div class="admin-item-info">
        <div class="admin-item-title">${esc(e.role)} at ${esc(e.company)}</div>
        <div class="admin-item-meta">
          <span class="mini-tag">${esc(e.period)}</span>
        </div>
      </div>
      <div class="admin-item-actions">
        <button class="action-btn edit-btn" data-id="${esc(e.id)}" title="Edit">✏️</button>
        <button class="action-btn del-btn"  data-id="${esc(e.id)}" title="Delete">🗑️</button>
      </div>
    </div>
  `).join('');

  $$('.edit-btn', list).forEach(btn => {
    btn.addEventListener('click', () => openExperienceForm(btn.dataset.id));
  });
  $$('.del-btn', list).forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Delete this experience item?')) {
        DataStore.deleteExperience(btn.dataset.id);
        toast('Experience item deleted');
        renderExperienceList();
      }
    });
  });
}

function openExperienceForm(id = null) {
  editingExperienceId = id;
  const modal = $('#experience-modal');
  const title = $('#modal-experience-title');
  const form  = $('#experience-form');
  form.reset();

  if (id) {
    const item = DataStore.getExperience().find(e => e.id === id);
    if (!item) return;
    title.textContent = 'Edit Experience';
    $('#exp-period').value      = item.period      || '';
    $('#exp-role').value        = item.role        || '';
    $('#exp-company').value     = item.company     || '';
    $('#exp-description').value = item.description || '';
  } else {
    title.textContent = 'Add New Experience';
  }
  modal.classList.add('open');
}

function closeExperienceModal() {
  $('#experience-modal').classList.remove('open');
  editingExperienceId = null;
}

function initExperienceForm() {
  $('#add-experience-btn')?.addEventListener('click', () => openExperienceForm());
  $('#close-experience-modal')?.addEventListener('click', closeExperienceModal);
  $('#cancel-experience')?.addEventListener('click', closeExperienceModal);
  $('#experience-modal')?.addEventListener('click', e => {
    if (e.target === $('#experience-modal')) closeExperienceModal();
  });

  $('#experience-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = {
      period:      $('#exp-period').value.trim(),
      role:        $('#exp-role').value.trim(),
      company:     $('#exp-company').value.trim(),
      description: $('#exp-description').value.trim(),
    };

    if (!data.period || !data.role || !data.company) {
      toast('Please fill in all required fields (*)', 'error');
      return;
    }

    if (editingExperienceId) {
      DataStore.updateExperience(editingExperienceId, data);
      toast('Experience updated! ✨');
    } else {
      DataStore.addExperience(data);
      toast('Experience added! 💼');
    }
    closeExperienceModal();
    renderExperienceList();
  });
}

/* ══════════════════════════════════════════════════════════
   META / PROFILE SETTINGS
══════════════════════════════════════════════════════════ */
function loadMeta() {
  const meta = DataStore.getMeta();
  $('#meta-name').value     = meta.name     || '';
  $('#meta-role').value     = meta.role     || '';
  $('#meta-bio').value      = meta.bio      || '';
  $('#meta-email').value    = meta.email    || '';
  $('#meta-github').value   = meta.github   || '';
  $('#meta-linkedin').value = meta.linkedin || '';
  $('#meta-twitter').value  = meta.twitter  || '';
  $('#meta-cvurl').value    = meta.cvUrl    || '';
  $('#meta-password').value = meta.password || '';

  // Section visibility checkboxes
  $('#sec-about').checked      = !!(meta.sections && meta.sections.about !== false);
  $('#sec-skills').checked     = !!(meta.sections && meta.sections.skills !== false);
  $('#sec-experience').checked = !!(meta.sections && meta.sections.experience !== false);
  $('#sec-courses').checked    = !!(meta.sections && meta.sections.courses !== false);
  $('#sec-projects').checked   = !!(meta.sections && meta.sections.projects !== false);
  $('#sec-contact').checked    = !!(meta.sections && meta.sections.contact !== false);

  // Tab-contextual headers toggles
  if ($('#toggle-sec-projects'))   $('#toggle-sec-projects').checked   = !!(meta.sections && meta.sections.projects !== false);
  if ($('#toggle-sec-skills'))     $('#toggle-sec-skills').checked     = !!(meta.sections && meta.sections.skills !== false);
  if ($('#toggle-sec-experience')) $('#toggle-sec-experience').checked = !!(meta.sections && meta.sections.experience !== false);
  if ($('#toggle-sec-courses'))    $('#toggle-sec-courses').checked    = !!(meta.sections && meta.sections.courses !== false);
}

function initMetaForm() {
  $('#meta-form').addEventListener('submit', e => {
    e.preventDefault();
    const meta = DataStore.getMeta();
    const updatedSections = {
      about:      $('#sec-about').checked,
      skills:     $('#sec-skills').checked,
      experience: $('#sec-experience').checked,
      courses:    $('#sec-courses').checked,
      projects:   $('#sec-projects').checked,
      contact:    $('#sec-contact').checked,
    };
    DataStore.saveMeta({
      ...meta,
      name:     $('#meta-name').value.trim(),
      role:     $('#meta-role').value.trim(),
      bio:      $('#meta-bio').value.trim(),
      email:    $('#meta-email').value.trim(),
      github:   $('#meta-github').value.trim(),
      linkedin: $('#meta-linkedin').value.trim(),
      twitter:  $('#meta-twitter').value.trim(),
      cvUrl:    $('#meta-cvurl').value.trim(),
      password: $('#meta-password').value.trim() || meta.password,
      sections: updatedSections,
    });

    // Sync contextual toggles
    if ($('#toggle-sec-projects'))   $('#toggle-sec-projects').checked   = updatedSections.projects;
    if ($('#toggle-sec-skills'))     $('#toggle-sec-skills').checked     = updatedSections.skills;
    if ($('#toggle-sec-experience')) $('#toggle-sec-experience').checked = updatedSections.experience;
    if ($('#toggle-sec-courses'))    $('#toggle-sec-courses').checked    = updatedSections.courses;

    toast('Profile settings saved! 🎉');
  });
}

function initSectionToggles() {
  const sections = ['projects', 'skills', 'experience', 'courses'];
  sections.forEach(key => {
    const el = $('#toggle-sec-' + key);
    if (!el) return;
    el.addEventListener('change', () => {
      const meta = DataStore.getMeta();
      meta.sections = meta.sections || {};
      meta.sections[key] = el.checked;
      
      // Sync settings tab checkbox
      const settingsCheckbox = $('#sec-' + key);
      if (settingsCheckbox) settingsCheckbox.checked = el.checked;

      DataStore.saveMeta(meta);
      toast(`${key.charAt(0).toUpperCase() + key.slice(1)} section ${el.checked ? 'published' : 'unpublished'}!`);
    });
  });
}

/* ── Danger Zone ──────────────────────────────────────────── */
function initDanger() {
  $('#reset-all-btn')?.addEventListener('click', () => {
    if (confirm('⚠️ This will RESET ALL data to defaults. Are you sure?')) {
      localStorage.clear();
      sessionStorage.removeItem('portfolio_admin_auth');
      toast('All data reset. Redirecting…');
      setTimeout(() => location.reload(), 1500);
    }
  });

  $('#logout-btn')?.addEventListener('click', () => {
    sessionStorage.removeItem('portfolio_admin_auth');
    location.reload();
  });
}

/* ── Init ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initTabs();
  initProjectForm();
  initSkillForm();
  initExperienceForm();
  initCourseForm();
  initMetaForm();
  initSectionToggles();
  initDanger();
});
