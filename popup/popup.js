document.addEventListener('DOMContentLoaded', () => {
  // Tabs
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      button.classList.add('active');
      document.getElementById(button.dataset.tab).classList.add('active');
    });
  });

  // UI State
  const extensionToggle = document.getElementById('extension-toggle');
  const statusBadge = document.getElementById('status-badge');
  const toast = document.getElementById('toast');
  const profileForm = document.getElementById('profile-form');

  // Toggle wired after hostname is resolved (see initToggle below)

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }

  // Dynamic Lists Rendering Helpers
  function createCard(containerId, htmlContent) {
    const container = document.getElementById(containerId);
    const card = document.createElement('div');
    card.className = 'dynamic-card';
    card.innerHTML = htmlContent + `<button type="button" class="btn-remove-card" title="Remove">&times;</button>`;
    card.querySelector('.btn-remove-card').addEventListener('click', () => {
      card.remove();
    });
    container.appendChild(card);
    return card;
  }

  function escapeHtml(str) {
    return (str || '').toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  const WEBSITE_DEFAULTS = [
    { type: 'linkedin',  label: 'LinkedIn',   placeholder: 'https://linkedin.com/in/yourprofile' },
    { type: 'portfolio', label: 'Portfolio',  placeholder: 'https://yourportfolio.com' },
    { type: 'x',         label: 'X / Twitter', placeholder: 'https://x.com/yourhandle' },
    { type: 'medium',    label: 'Medium',     placeholder: 'https://medium.com/@yourhandle' },
  ];

  // Add Row Functions
  document.getElementById('btn-add-website').addEventListener('click', () => addWebsite());
  function addWebsite(url = '', type = '', customLabel = '') {
    const meta = WEBSITE_DEFAULTS.find(d => d.type === type);
    const placeholder = meta ? meta.placeholder : 'https://...';
    if (meta) {
      createCard('websites-container', `
        <div class="form-group" style="margin:0">
          <label>${escapeHtml(meta.label)}</label>
          <input type="url" class="site-url" data-type="${escapeHtml(type)}" placeholder="${escapeHtml(placeholder)}" value="${escapeHtml(url)}">
        </div>
      `);
    } else {
      createCard('websites-container', `
        <div class="form-group" style="margin:0">
          <input type="text" class="site-label" placeholder="Label (e.g. GitHub, Dribbble)" value="${escapeHtml(customLabel)}">
          <input type="url" class="site-url" data-type="" placeholder="${escapeHtml(placeholder)}" value="${escapeHtml(url)}" style="margin-top:6px">
        </div>
      `);
    }
  }

  document.getElementById('btn-add-experience').addEventListener('click', () => addExperience());
  function addExperience(data = {}) {
    createCard('experience-container', `
      <div class="grid-2">
        <div class="form-group"><label>Job Title</label><input type="text" class="exp-title" value="${escapeHtml(data.title || '')}"></div>
        <div class="form-group"><label>Company</label><input type="text" class="exp-company" value="${escapeHtml(data.company || '')}"></div>
      </div>
      <div class="form-group"><label>Location</label><input type="text" class="exp-location" value="${escapeHtml(data.location || '')}"></div>
      <div class="grid-2">
        <div class="form-group"><label>Start Date (MM/YYYY)</label><input type="text" class="exp-start" value="${escapeHtml(data.startDate || '')}"></div>
        <div class="form-group"><label>End Date (MM/YYYY)</label><input type="text" class="exp-end" value="${escapeHtml(data.endDate || '')}"></div>
      </div>
      <div class="form-group" style="margin-bottom:0"><label>Description / Responsibilities</label><textarea class="exp-desc" rows="3" placeholder="Describe your role, key responsibilities, achievements...">${escapeHtml(data.description || '')}</textarea></div>
    `);
  }

  document.getElementById('btn-add-education').addEventListener('click', () => addEducation());
  function addEducation(data = {}) {
    createCard('education-container', `
      <div class="form-group"><label>School / University</label><input type="text" class="edu-school" value="${escapeHtml(data.school || '')}"></div>
      <div class="grid-2">
        <div class="form-group"><label>Degree</label><input type="text" class="edu-degree" value="${escapeHtml(data.degree || '')}"></div>
        <div class="form-group"><label>Grad Year</label><input type="text" class="edu-grad" value="${escapeHtml(data.gradYear || '')}"></div>
      </div>
      <div class="grid-2">
        <div class="form-group"><label>CGPA / Grade / Result</label><input type="text" class="edu-cgpa" placeholder="e.g. 8.5 / A / First Class" value="${escapeHtml(data.cgpa || '')}"></div>
        <div class="form-group"><label>Percentage</label><input type="text" class="edu-percentage" placeholder="e.g. 85%" value="${escapeHtml(data.percentage || '')}"></div>
      </div>
    `);
  }

  document.getElementById('btn-add-cert').addEventListener('click', () => addCert());
  function addCert(data = {}) {
    createCard('certs-container', `
      <div class="form-group"><label>Certification Name</label><input type="text" class="cert-name" value="${escapeHtml(data.name || '')}"></div>
      <div class="grid-2">
        <div class="form-group"><label>Issued (MM/YYYY)</label><input type="text" class="cert-issue" value="${escapeHtml(data.issueDate || '')}"></div>
        <div class="form-group"><label>Expires (MM/YYYY)</label><input type="text" class="cert-exp" value="${escapeHtml(data.expDate || '')}"></div>
      </div>
    `);
  }

  document.getElementById('btn-add-language').addEventListener('click', () => addLanguage());
  function addLanguage(data = {}) {
    createCard('languages-container', `
      <div class="form-group"><label>Language</label><input type="text" class="lang-name" value="${escapeHtml(data.language || '')}"></div>
      <div class="grid-2">
        <div class="form-group"><label>Verbal (e.g. Fluent, A1)</label><input type="text" class="lang-verbal" value="${escapeHtml(data.verbal || '')}"></div>
        <div class="form-group"><label>Writing</label><input type="text" class="lang-writing" value="${escapeHtml(data.writing || '')}"></div>
      </div>
    `);
  }

  document.getElementById('btn-add-custom').addEventListener('click', () => addCustomField());
  function addCustomField(label = '', value = '') {
    createCard('custom-fields-container', `
      <div class="grid-2">
        <div class="form-group" style="margin:0"><input type="text" class="custom-key" placeholder="Label (e.g. Notice Period)" value="${escapeHtml(label)}"></div>
        <div class="form-group" style="margin:0"><input type="text" class="custom-value" placeholder="Value (e.g. 30 days)" value="${escapeHtml(value)}"></div>
      </div>
    `);
  }

  // Toggle: per-site when on a real page, global otherwise
  let currentHostname = '';

  function initToggle() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      let hostname = '';
      if (tabs[0] && tabs[0].url) {
        try {
          const h = new URL(tabs[0].url).hostname;
          if (h && !h.startsWith('chrome')) hostname = h;
        } catch (e) {}
      }
      currentHostname = hostname;

      chrome.storage.sync.get(['extensionEnabled', 'disabledSites'], (r) => {
        if (hostname) {
          const siteDisabled = (r.disabledSites || []).includes(hostname);
          extensionToggle.checked = !siteDisabled;
          statusBadge.textContent = siteDisabled ? `Paused on ${hostname}` : `Active on ${hostname}`;
          statusBadge.style.opacity = siteDisabled ? '0.7' : '1';
        } else {
          const globalEnabled = r.extensionEnabled !== false;
          extensionToggle.checked = globalEnabled;
          statusBadge.textContent = globalEnabled ? 'Ready to Autofill' : 'Autofill Paused';
          statusBadge.style.opacity = globalEnabled ? '1' : '0.7';
        }
      });
    });
  }
  initToggle();

  extensionToggle.addEventListener('change', (e) => {
    const isEnabled = e.target.checked;
    if (currentHostname) {
      chrome.storage.sync.get(['disabledSites'], (r) => {
        const sites = r.disabledSites || [];
        const idx = sites.indexOf(currentHostname);
        if (isEnabled && idx >= 0) sites.splice(idx, 1);
        else if (!isEnabled && idx < 0) sites.push(currentHostname);
        chrome.storage.sync.set({ disabledSites: sites }, () => {
          statusBadge.textContent = isEnabled ? `Active on ${currentHostname}` : `Paused on ${currentHostname}`;
          statusBadge.style.opacity = isEnabled ? '1' : '0.7';
        });
      });
    } else {
      chrome.storage.sync.set({ extensionEnabled: isEnabled }, () => {
        statusBadge.textContent = isEnabled ? 'Ready to Autofill' : 'Autofill Paused';
        statusBadge.style.opacity = isEnabled ? '1' : '0.7';
      });
    }
  });

  // Dock button
  const btnDock = document.getElementById('btn-dock');

  function setDockState(docked) {
    if (docked) {
      btnDock.classList.add('active');
      btnDock.title = 'Undock from page';
    } else {
      btnDock.classList.remove('active');
      btnDock.title = 'Dock to page';
    }
  }

  chrome.storage.local.get(['isDocked'], (r) => setDockState(!!r.isDocked));

  btnDock.addEventListener('click', () => {
    chrome.storage.local.get(['isDocked'], (r) => {
      const next = !r.isDocked;
      chrome.storage.local.set({ isDocked: next });
      setDockState(next);
    });
  });

  // Load and Populate
  function loadProfile() {
    chrome.storage.sync.get(['job_profile'], (result) => {
      const p = result.job_profile || {};

      // Simple Fields
      const simple = ['firstName', 'lastName', 'fullName', 'email', 'phone', 'phoneDeviceType', 'phoneCountryCode', 'addressLine1', 'addressLine2', 'locationCity', 'locationState', 'locationZip', 'locationCountry', 'skills', 'summary'];
      simple.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = p[id] || '';
      });

      // Array Fields
      const savedWebsites = p.websites || [];
      const savedByType = {};
      savedWebsites.forEach(w => { if (w.type) savedByType[w.type] = w.url; });
      WEBSITE_DEFAULTS.forEach(d => addWebsite(savedByType[d.type] || '', d.type));
      savedWebsites.filter(w => !w.type || !WEBSITE_DEFAULTS.find(d => d.type === w.type))
                   .forEach(w => addWebsite(w.url, w.type || '', w.label || ''));
      (p.experience || []).forEach(e => addExperience(e));
      (p.education || []).forEach(e => addEducation(e));
      (p.certifications || []).forEach(c => addCert(c));
      (p.languages || []).forEach(l => addLanguage(l));
      (p.customFields || []).forEach(cf => addCustomField(cf.label, cf.value));
    });
  }
  loadProfile();

  // Save Profile
  document.getElementById('btn-save').addEventListener('click', () => {
    const data = {};
    const simple = ['firstName', 'lastName', 'fullName', 'email', 'phone', 'phoneDeviceType', 'phoneCountryCode', 'addressLine1', 'addressLine2', 'locationCity', 'locationState', 'locationZip', 'locationCountry', 'skills', 'summary'];
    simple.forEach(id => {
      const el = document.getElementById(id);
      if (el) data[id] = el.value.trim();
    });

    data.websites = Array.from(document.querySelectorAll('#websites-container .dynamic-card')).map(c => {
      const labelEl = c.querySelector('.site-label');
      return {
        url: c.querySelector('.site-url').value.trim(),
        type: c.querySelector('.site-url').dataset.type || '',
        label: labelEl ? labelEl.value.trim() : ''
      };
    }).filter(w => w.url);
    data.experience = Array.from(document.querySelectorAll('#experience-container .dynamic-card')).map(c => ({
      title: c.querySelector('.exp-title').value.trim(),
      company: c.querySelector('.exp-company').value.trim(),
      location: c.querySelector('.exp-location').value.trim(),
      startDate: c.querySelector('.exp-start').value.trim(),
      endDate: c.querySelector('.exp-end').value.trim(),
      description: c.querySelector('.exp-desc').value.trim()
    })).filter(e => e.title || e.company);

    data.education = Array.from(document.querySelectorAll('#education-container .dynamic-card')).map(c => ({
      school: c.querySelector('.edu-school').value.trim(),
      degree: c.querySelector('.edu-degree').value.trim(),
      gradYear: c.querySelector('.edu-grad').value.trim(),
      cgpa: c.querySelector('.edu-cgpa').value.trim(),
      percentage: c.querySelector('.edu-percentage').value.trim()
    })).filter(e => e.school || e.degree);

    data.certifications = Array.from(document.querySelectorAll('#certs-container .dynamic-card')).map(c => ({
      name: c.querySelector('.cert-name').value.trim(),
      issueDate: c.querySelector('.cert-issue').value.trim(),
      expDate: c.querySelector('.cert-exp').value.trim()
    })).filter(e => e.name);

    data.languages = Array.from(document.querySelectorAll('#languages-container .dynamic-card')).map(c => ({
      language: c.querySelector('.lang-name').value.trim(),
      verbal: c.querySelector('.lang-verbal').value.trim(),
      writing: c.querySelector('.lang-writing').value.trim()
    })).filter(e => e.language);

    data.customFields = Array.from(document.querySelectorAll('#custom-fields-container .dynamic-card')).map(c => ({
      label: c.querySelector('.custom-key').value.trim(),
      value: c.querySelector('.custom-value').value.trim()
    })).filter(e => e.label || e.value);

    chrome.storage.sync.set({ job_profile: data }, () => {
      if (chrome.runtime.lastError) {
        showToast('Error saving: Data too large!');
      } else {
        showToast('Profile saved successfully!');
        console.log('Saved profile:', data); // DEBUG
      }
    });
  });

  document.getElementById('btn-clear').addEventListener('click', () => {
    if (confirm('Clear all data?')) {
      chrome.storage.sync.clear(() => {
        profileForm.reset();
        ['websites', 'experience', 'education', 'certs', 'languages', 'custom-fields'].forEach(id => {
          document.getElementById(id + '-container').innerHTML = '';
        });
        showToast('Data cleared!');
      });
    }
  });

  const importFile = document.getElementById('import-file');
  document.getElementById('btn-import').addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        chrome.storage.sync.set({ job_profile: data }, () => {
          showToast('Imported!');
          setTimeout(() => location.reload(), 500);
        });
      } catch (err) {
        showToast('Invalid JSON');
      }
    };
    reader.readAsText(file);
  });

  document.getElementById('btn-export').addEventListener('click', () => {
    chrome.storage.sync.get(['job_profile'], (res) => {
      const blob = new Blob([JSON.stringify(res.job_profile || {}, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'profile.json';
      a.click();
    });
  });
});