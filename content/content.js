(function() {
  if (window.__job_autocomplete_loaded) return;
  window.__job_autocomplete_loaded = true;

  let activeDropdown = null;
  let activeInput = null;
  let selectedSuggestionIndex = -1;
  let suggestionItems = [];

  const KEYWORDS = {
    fullName: ['fullname', 'full name', 'your name', 'name', 'applicant name', 'candidate name', 'display name'],
    firstName: ['firstname', 'first name', 'fname', 'first_name', 'given name'],
    lastName: ['lastname', 'last name', 'lname', 'last_name', 'family name', 'surname'],
    email: ['email', 'e-mail', 'mail', 'address'],
    phone: ['phone', 'tel', 'mobile', 'contact', 'cell', 'telephone', 'number'],
    phoneDeviceType: ['phone device type', 'device type', 'phone type'],
    phoneCountryCode: ['country / territory phone code', 'country code', 'phone code', 'dialing code'],
    addressLine1: ['address line 1', 'address 1', 'street address', 'address'],
    addressLine2: ['address line 2', 'address 2', 'apt', 'suite', 'unit'],
    locationCity: ['city', 'town', 'location', 'municipality'],
    locationState: ['state', 'province', 'region', 'territory'],
    locationCountry: ['country', 'nation'],
    locationZip: ['zip', 'postal', 'zipcode', 'zip code', 'postal code'],
    website: ['website', 'portfolio', 'homepage', 'personal site', 'url', 'blog', 'link'],
    degree: ['degree', 'education degree', 'major', 'program', 'course', 'study', 'qualification'],
    school: ['school', 'university', 'college', 'alma mater', 'institution', 'educator'],
    gradYear: ['grad', 'graduation', 'grad year', 'year of graduation', 'completed in', 'end year', 'to'],
    jobTitle: ['job title', 'title', 'role', 'position', 'current title', 'most recent title', 'designation', 'job name', 'work title', 'job'],
    company: ['company', 'employer', 'organization', 'most recent company', 'workplace'],
    startDate: ['from', 'start date', 'start', 'began'],
    endDate: ['to', 'end date', 'end', 'completed'],
    location: ['location', 'city', 'where'],
    certName: ['certification', 'cert name', 'certificate'],
    certIssue: ['issued date', 'issue date', 'obtained'],
    certExp: ['expiration date', 'expiry date', 'valid until'],
    langName: ['language', 'tongue'],
    langVerbal: ['verbal', 'spoken', 'speaking'],
    langWriting: ['writing', 'written'],
    skills: ['skills', 'technologies', 'expertise'],
    summary: ['summary', 'bio', 'about me', 'headline', 'pitch', 'background']
  };

  const SHADOW_STYLE = `
    .autofill-container { background: rgba(15, 23, 42, 0.96) !important; backdrop-filter: blur(10px) !important; border: 1px solid rgba(99, 102, 241, 0.4) !important; border-radius: 12px !important; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5) !important; width: 280px !important; display: flex !important; flex-direction: column !important; overflow: hidden !important; animation: popIn 0.15s cubic-bezier(0.34, 1.56, 0.64, 1) !important; color: #f8fafc !important; font-family: 'Inter', system-ui, sans-serif !important; text-align: left !important; }
    @keyframes popIn { from { opacity: 0; transform: scale(0.95) translateY(-5px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    .dropdown-header { padding: 10px 12px !important; background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%) !important; border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important; display: flex !important; align-items: center !important; gap: 8px !important; }
    .logo { width: 18px !important; height: 18px !important; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%) !important; border-radius: 4px !important; display: flex !important; align-items: center !important; justify-content: center !important; font-weight: 700 !important; font-size: 11px !important; color: #fff !important; }
    .header-title { font-size: 11px !important; font-weight: 600 !important; color: #94a3b8 !important; text-transform: uppercase !important; letter-spacing: 0.05em !important; flex: 1 !important; }
    .badge { font-size: 9px !important; background: rgba(99, 102, 241, 0.2) !important; color: #818cf8 !important; padding: 1px 5px !important; border-radius: 10px !important; font-weight: 500 !important; }
    .suggestions-list, .all-fields-content { max-height: 180px !important; overflow-y: auto !important; padding: 6px !important; display: flex !important; flex-direction: column !important; gap: 4px !important; }
    ::-webkit-scrollbar { width: 4px !important; }
    ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1) !important; border-radius: 2px !important; }
    .suggestion-item { padding: 6px 10px !important; border-radius: 6px !important; cursor: pointer !important; display: flex !important; flex-direction: column !important; gap: 2px !important; transition: all 0.1s ease !important; border: 1px solid transparent !important; }
    .suggestion-item:hover, .suggestion-item.selected { background: rgba(99, 102, 241, 0.15) !important; border-color: rgba(99, 102, 241, 0.3) !important; box-shadow: 0 0 8px rgba(99, 102, 241, 0.2) !important; }
    .field-label { font-size: 9px !important; color: #818cf8 !important; font-weight: 600 !important; text-transform: uppercase !important; }
    .field-value { font-size: 12px !important; color: #e2e8f0 !important; font-weight: 500 !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; }
    .all-fields-trigger { padding: 8px 12px !important; font-size: 11px !important; color: #94a3b8 !important; cursor: pointer !important; display: flex !important; justify-content: space-between !important; background: rgba(255,255,255,0.02) !important; border-top: 1px solid rgba(255,255,255,0.05) !important; }
    .all-fields-trigger:hover { background: rgba(255,255,255,0.05) !important; color: #f8fafc !important; }
    .all-fields-content { display: none !important; background: rgba(0,0,0,0.2) !important; border-top: 1px solid rgba(255,255,255,0.05) !important; }
    .all-fields-content.show { display: flex !important; }
    .dropdown-footer { padding: 6px 12px !important; background: rgba(0,0,0,0.3) !important; border-top: 1px solid rgba(255,255,255,0.05) !important; font-size: 9px !important; color: #64748b !important; display: flex !important; justify-content: space-between !important; }
  `;

  document.addEventListener('focusin', (e) => {
    const target = e.target;
    if (isFillableInput(target)) handleInputFocus(target);
  });
  document.addEventListener('mousedown', (e) => {
    if (!activeDropdown) return;
    if (e.target.id === 'job-autocomplete-shadow-host' || e.target === activeInput) return;
    removeDropdown();
  });

  function isFillableInput(el) {
    if (!el) return false;
    const tagName = el.tagName;
    if (tagName === 'TEXTAREA') return true;
    if (tagName === 'INPUT') {
      const type = (el.type || 'text').toLowerCase();
      const ignoredTypes = ['checkbox', 'radio', 'submit', 'button', 'file', 'hidden', 'image', 'reset'];
      return !ignoredTypes.includes(type);
    }
    return el.contentEditable === 'true';
  }

  function handleInputFocus(input) {
    activeInput = input;
    chrome.storage.sync.get(['job_profile', 'extensionEnabled'], (result) => {
      if (result.extensionEnabled === false || !result.job_profile) return;
      const suggestions = getMatchingSuggestions(input, result.job_profile);
      showDropdown(input, suggestions, result.job_profile);
    });
  }

  function handleKeyDown(e) {
    if (!activeDropdown) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); navigateSuggestions(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); navigateSuggestions(-1); }
    else if (e.key === 'Enter') {
      if (selectedSuggestionIndex >= 0 && suggestionItems[selectedSuggestionIndex]) {
        e.preventDefault(); suggestionItems[selectedSuggestionIndex].click();
      }
    } else if (e.key === 'Escape') removeDropdown();
  }

  function navigateSuggestions(dir) {
    if (!suggestionItems.length) return;
    if (selectedSuggestionIndex >= 0) suggestionItems[selectedSuggestionIndex].classList.remove('selected');
    selectedSuggestionIndex += dir;
    if (selectedSuggestionIndex >= suggestionItems.length) selectedSuggestionIndex = 0;
    if (selectedSuggestionIndex < 0) selectedSuggestionIndex = suggestionItems.length - 1;
    suggestionItems[selectedSuggestionIndex].classList.add('selected');
    suggestionItems[selectedSuggestionIndex].scrollIntoView({ block: 'nearest' });
  }

  function getFieldHeuristics(input) {
    const id = (input.id || '').toLowerCase();
    const name = (input.name || '').toLowerCase();
    const placeholder = (input.placeholder || '').toLowerCase();
    const autocomplete = (input.getAttribute('autocomplete') || '').toLowerCase();
    const ariaLabel = (input.getAttribute('aria-label') || '').toLowerCase();
    const type = (input.type || '').toLowerCase();
    
    let labelText = '';
    
    const ariaLabelledBy = input.getAttribute('aria-labelledby');
    if (ariaLabelledBy) {
      const el = document.getElementById(ariaLabelledBy);
      if (el) labelText = el.textContent.toLowerCase();
    }
    
    if (!labelText && input.id) {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label) labelText = label.textContent.toLowerCase();
    }
    
    if (!labelText) {
      const parentLabel = input.closest('label');
      if (parentLabel) labelText = parentLabel.textContent.toLowerCase();
    }
    
    // Aggressive Fallback: Grab text from nearest parent container
    if (!labelText) {
      let parent = input.parentElement;
      for (let i = 0; i < 4 && parent; i++) {
        const text = parent.textContent.trim().toLowerCase();
        if (text && text.length < 150) { 
          // If the text inside this container is reasonably short, assume it represents the field label
          labelText = text; 
          break; 
        }
        parent = parent.parentElement;
      }
    }

    if (!labelText && input.previousElementSibling) {
      const prevText = input.previousElementSibling.textContent.trim().toLowerCase();
      if (prevText.length < 100) labelText = prevText;
    }
    
    return { id, name, placeholder, autocomplete, ariaLabel, type, labelText };
  }

  function scoreHeuristics(kwKey, h) {
    let score = 0;
    const keywords = KEYWORDS[kwKey] || [];
    keywords.forEach(kw => {
      // We check if the text matches anywhere. The aggressive fallback means labelText might be "job title *"
      if (h.id.includes(kw)) score += 30;
      if (h.name.includes(kw)) score += 30;
      if (h.placeholder.includes(kw)) score += 20;
      if (h.ariaLabel.includes(kw)) score += 40;
      if (h.labelText.includes(kw)) score += 50;
      if (h.autocomplete.includes(kw)) score += 50;
    });

    if (kwKey === 'firstName' && (h.id.includes('last') || h.name.includes('last') || h.labelText.includes('last'))) score -= 80;
    if (kwKey === 'lastName' && (h.id.includes('first') || h.name.includes('first') || h.labelText.includes('first'))) score -= 80;
    
    return score;
  }

  function getMatchingSuggestions(input, p) {
    const h = getFieldHeuristics(input);
    const suggestions = [];

    const addSugg = (label, value, score) => {
      if (value && score > 0) suggestions.push({ label, value, score });
    };

    // Simple fields
    const simple = [
      { key: 'fullName', lbl: 'Full Name' }, { key: 'firstName', lbl: 'First Name' }, { key: 'lastName', lbl: 'Last Name' },
      { key: 'email', lbl: 'Email' }, { key: 'phone', lbl: 'Phone' }, { key: 'phoneDeviceType', lbl: 'Phone Type' }, { key: 'phoneCountryCode', lbl: 'Country Code' },
      { key: 'addressLine1', lbl: 'Address 1' }, { key: 'addressLine2', lbl: 'Address 2' }, { key: 'locationCity', lbl: 'City' }, { key: 'locationState', lbl: 'State' },
      { key: 'locationZip', lbl: 'Zip' }, { key: 'locationCountry', lbl: 'Country' }, { key: 'skills', lbl: 'Skills' }, { key: 'summary', lbl: 'Summary' }
    ];
    simple.forEach(s => addSugg(s.lbl, p[s.key], scoreHeuristics(s.key, h)));

    // Arrays
    (p.websites || []).forEach(w => addSugg('Website', w.url, scoreHeuristics('website', h)));
    
    (p.experience || []).forEach((e, i) => {
      addSugg(`Exp ${i+1} Title`, e.title, scoreHeuristics('jobTitle', h));
      addSugg(`Exp ${i+1} Company`, e.company, scoreHeuristics('company', h));
      addSugg(`Exp ${i+1} Location`, e.location, scoreHeuristics('location', h));
      addSugg(`Exp ${i+1} Start`, e.startDate, scoreHeuristics('startDate', h));
      addSugg(`Exp ${i+1} End`, e.endDate, scoreHeuristics('endDate', h));
    });

    (p.education || []).forEach((e, i) => {
      addSugg(`Edu ${i+1} School`, e.school, scoreHeuristics('school', h));
      addSugg(`Edu ${i+1} Degree`, e.degree, scoreHeuristics('degree', h));
      addSugg(`Edu ${i+1} Grad`, e.gradYear, scoreHeuristics('gradYear', h));
    });

    (p.certifications || []).forEach((c, i) => {
      addSugg(`Cert ${i+1} Name`, c.name, scoreHeuristics('certName', h));
      addSugg(`Cert ${i+1} Issue`, c.issueDate, scoreHeuristics('certIssue', h));
      addSugg(`Cert ${i+1} Exp`, c.expDate, scoreHeuristics('certExp', h));
    });

    (p.languages || []).forEach((l, i) => {
      addSugg(`Lang ${i+1}`, l.language, scoreHeuristics('langName', h));
      addSugg(`Lang ${i+1} Verbal`, l.verbal, scoreHeuristics('langVerbal', h));
      addSugg(`Lang ${i+1} Writing`, l.writing, scoreHeuristics('langWriting', h));
    });

    (p.customFields || []).forEach(cf => {
      const lowerLabel = (cf.label || '').toLowerCase();
      let s = 0;
      if (h.labelText.includes(lowerLabel)) s += 60;
      if (h.placeholder.includes(lowerLabel)) s += 30;
      addSugg(`Custom: ${cf.label}`, cf.value, s);
    });

    // Deduplicate array pushes if needed, but array sort does it well
    return suggestions.sort((a, b) => b.score - a.score);
  }

  function showDropdown(input, suggestions, p) {
    removeDropdown();
    const host = document.createElement('div');
    host.id = 'job-autocomplete-shadow-host';
    const rect = input.getBoundingClientRect();
    host.style.position = 'absolute';
    host.style.left = `${rect.left + window.scrollX}px`;
    host.style.top = `${rect.bottom + window.scrollY + 6}px`;
    host.style.width = `${Math.max(280, rect.width)}px`;
    host.style.zIndex = '2147483647';
    
    const shadow = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = SHADOW_STYLE;
    shadow.appendChild(style);

    const container = document.createElement('div');
    container.className = 'autofill-container';
    
    const header = document.createElement('div');
    header.className = 'dropdown-header';
    header.innerHTML = `
        <div class="logo">J</div><div class="header-title">Suggestions</div><div class="badge">${suggestions.length ? 'Matches' : 'Profile'}</div>
    `;
    container.appendChild(header);

    const list = document.createElement('div');
    list.className = 'suggestions-list';
    suggestionItems = [];
    selectedSuggestionIndex = -1;

    if (suggestions.length > 0) {
      suggestions.slice(0, 5).forEach((s) => {
        const item = createItem(s.label, s.value, input);
        list.appendChild(item); suggestionItems.push(item);
      });
    } else {
      list.innerHTML = `<div style="padding:8px 12px;font-size:11px;color:#64748b;font-style:italic;">No smart matches. Expand all fields below.</div>`;
    }
    container.appendChild(list);

    const trigger = document.createElement('div');
    trigger.className = 'all-fields-trigger';
    trigger.innerHTML = `<span>Browse all fields</span> <span>⚡</span>`;
    
    const allFieldsContent = document.createElement('div');
    allFieldsContent.className = 'all-fields-content';
    
    const allFields = [];
    Object.keys(p).forEach(k => {
      if (typeof p[k] === 'string' && p[k]) allFields.push({ label: k, value: p[k] });
      else if (Array.isArray(p[k])) {
        p[k].forEach((obj, idx) => {
          Object.keys(obj).forEach(subK => {
            if (obj[subK]) allFields.push({ label: `${k} ${idx+1} ${subK}`, value: obj[subK] });
          });
        });
      }
    });

    allFields.forEach(f => {
      const item = createItem(f.label, f.value, input);
      allFieldsContent.appendChild(item); suggestionItems.push(item);
    });

    trigger.addEventListener('click', () => {
      const isShown = allFieldsContent.classList.toggle('show');
      trigger.querySelector('span:last-child').textContent = isShown ? '▼' : '⚡';
      adjustPosition(input, host);
    });

    container.appendChild(trigger);
    container.appendChild(allFieldsContent);
    
    const footer = document.createElement('div');
    footer.className = 'dropdown-footer';
    footer.innerHTML = `<span>↑↓ Navigate</span><span>Enter to fill</span>`;
    container.appendChild(footer);

    shadow.appendChild(container);
    document.body.appendChild(host);
    activeDropdown = host;
    input.addEventListener('keydown', handleKeyDown);
    adjustPosition(input, host);
  }

  function createItem(label, value, input) {
    const item = document.createElement('div');
    item.className = 'suggestion-item';
    item.innerHTML = `<div class="field-label">${escapeHtml(label)}</div><div class="field-value" title="${escapeHtml(value)}">${escapeHtml(value)}</div>`;
    item.addEventListener('mousedown', (e) => {
      e.preventDefault(); fillInputField(input, value); removeDropdown();
    });
    return item;
  }

  function fillInputField(input, value) {
    input.focus();
    const setterInput = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
    const setterText = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
    if (input.tagName === 'TEXTAREA' && setterText) setterText.call(input, value);
    else if (input.tagName === 'INPUT' && setterInput) setterInput.call(input, value);
    else input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    setTimeout(() => input.dispatchEvent(new Event('blur', { bubbles: true })), 50);
  }

  function adjustPosition(input, host) {
    const rect = input.getBoundingClientRect();
    const dropdownHeight = host.offsetHeight || 250;
    let top = rect.bottom + window.scrollY + 6;
    if (rect.bottom + dropdownHeight > window.innerHeight && rect.top - dropdownHeight > 0) {
      top = rect.top + window.scrollY - dropdownHeight - 6;
    }
    host.style.top = `${top}px`;
    host.style.left = `${rect.left + window.scrollX}px`;
  }

  function removeDropdown() {
    if (activeInput) activeInput.removeEventListener('keydown', handleKeyDown);
    if (activeDropdown) { activeDropdown.remove(); activeDropdown = null; }
    selectedSuggestionIndex = -1;
    suggestionItems = [];
  }

  function escapeHtml(str) {
    return (str||'').toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
})();
