(function () {
  if (window.__job_autocomplete_loaded) return;
  window.__job_autocomplete_loaded = true;

  let activeDropdown = null;
  let activeInput = null;
  let selectedSuggestionIndex = -1;
  let suggestionItems = [];

  // EXPANDED KEYWORDS WITH REGEX-FRIENDLY PATTERNS
  const KEYWORDS = {
    fullName: ['fullname', 'full name', 'your name', 'name', 'applicant name', 'candidate name', 'display name', 'legal name', 'complete name'],
    firstName: ['firstname', 'first name', 'fname', 'first_name', 'given name', 'forename'],
    lastName: ['lastname', 'last name', 'lname', 'last_name', 'family name', 'surname', 'sur name'],
    email: ['email', 'e-mail', 'mail', 'email address', 'electronic mail', 'contact email'],
    phone: ['phone', 'tel', 'mobile', 'contact', 'cell', 'telephone', 'number', 'phone number', 'contact number', 'mobile number'],
    phoneDeviceType: ['phone device type', 'device type', 'phone type', 'mobile type'],
    phoneCountryCode: ['country code', 'phone code', 'dialing code', 'country / territory', 'country phone', 'area code'],
    addressLine1: ['address line 1', 'address 1', 'street address', 'address', 'street', 'home address', 'mailing address'],
    addressLine2: ['address line 2', 'address 2', 'apt', 'suite', 'unit', 'apartment', 'building'],
    locationCity: ['city', 'town', 'location', 'municipality', 'locale'],
    locationState: ['state', 'province', 'region', 'territory', 'state/province'],
    locationCountry: ['country', 'nation', 'nationality'],
    locationZip: ['zip', 'postal', 'zipcode', 'zip code', 'postal code', 'postcode', 'pin code'],

    // WEBSITE/SOCIAL - Enhanced
    website: ['website', 'portfolio', 'homepage', 'personal site', 'url', 'blog', 'link', 'web address', 'personal website', 'online portfolio'],
    linkedin: ['linkedin', 'linked in', 'linkedin profile', 'linkedin url'],
    github: ['github', 'git hub', 'github profile', 'github username'],
    twitter: ['twitter', 'x profile', 'twitter handle'],

    // EDUCATION - Enhanced
    degree: ['degree', 'education degree', 'major', 'program', 'course', 'study', 'qualification', 'field of study', 'area of study', 'discipline'],
    school: ['school', 'university', 'college', 'alma mater', 'institution', 'educator', 'educational institution'],
    gradYear: ['grad', 'graduation', 'grad year', 'year of graduation', 'completed in', 'end year', 'to', 'graduation date', 'year completed'],
    gpa: ['gpa', 'grade point', 'grade point average', 'cgpa', 'grades'],

    // EXPERIENCE - Heavily Enhanced for Workday/ATS
    jobTitle: [
      'job title', 'title', 'role', 'position', 'current title', 'most recent title',
      'designation', 'job name', 'work title', 'job', 'position title', 'role title',
      'job role', 'current role', 'current position', 'position name', 'current job',
      'employment title', 'professional title', 'occupation'
    ],
    company: ['company', 'employer', 'organization', 'most recent company', 'workplace', 'company name', 'employer name', 'organisation', 'business'],
    startDate: ['from', 'start date', 'start', 'began', 'begin date', 'started', 'employment start', 'joined'],
    endDate: ['to', 'end date', 'end', 'completed', 'ended', 'employment end', 'left', 'until'],
    currentlyWorking: ['currently work', 'present', 'current', 'still working', 'to present'],
    location: ['location', 'city', 'where', 'work location', 'job location'],

    // CERTIFICATIONS
    certName: ['certification', 'cert name', 'certificate', 'certification name', 'credential'],
    certIssue: ['issued date', 'issue date', 'obtained', 'date issued', 'received'],
    certExp: ['expiration date', 'expiry date', 'valid until', 'expires', 'expiration'],
    certIssuer: ['issuing organization', 'issuer', 'issued by', 'certifying body'],

    // LANGUAGES
    langName: ['language', 'tongue', 'spoken language'],
    langVerbal: ['verbal', 'spoken', 'speaking', 'proficiency', 'oral'],
    langWriting: ['writing', 'written', 'literacy'],
    langReading: ['reading', 'comprehension'],

    // SKILLS
    skills: ['skills', 'technologies', 'expertise', 'technical skills', 'competencies', 'abilities'],

    // BIO/SUMMARY - Enhanced
    summary: ['summary', 'bio', 'about me', 'headline', 'pitch', 'background', 'professional summary', 'career summary', 'profile', 'about you', 'describe yourself'],
    coverLetter: ['cover letter', 'motivation', 'why', 'interest', 'message', 'additional information', 'tell us about yourself'],

    // WORKDAY/ATS SPECIFIC FIELDS
    referral: ['referral', 'referred by', 'how did you hear', 'source'],
    gender: ['gender', 'sex'],
    ethnicity: ['ethnicity', 'race', 'demographic'],
    veteran: ['veteran', 'military'],
    disability: ['disability', 'disabled'],
    sponsorship: ['sponsorship', 'work authorization', 'visa', 'require sponsorship', 'legally authorized'],
    clearance: ['clearance', 'security clearance'],
    salary: ['salary', 'compensation', 'expected salary', 'current salary', 'pay'],
    noticePeriod: ['notice period', 'availability', 'available to start', 'start date', 'when can you start'],

    // RESUME/CV UPLOAD (for detection, not filling)
    resume: ['resume', 'cv', 'curriculum vitae', 'upload resume', 'attach resume'],
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
    // Workday/modern ATS often use contenteditable divs
    return el.contentEditable === 'true' || el.getAttribute('role') === 'textbox';
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

  // ENHANCED: Strip special characters and asterisks for better matching
  function cleanText(text) {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/\*/g, '') // Remove asterisks (required field markers)
      .replace(/[^\w\s]/g, ' ') // Remove special chars except word chars and spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  function getFieldHeuristics(input) {
    const id = cleanText(input.id || '');
    const name = cleanText(input.name || '');
    const placeholder = cleanText(input.placeholder || '');
    const autocomplete = cleanText(input.getAttribute('autocomplete') || '');
    const ariaLabel = cleanText(input.getAttribute('aria-label') || '');
    const type = (input.type || '').toLowerCase();
    const dataField = cleanText(input.getAttribute('data-automation-id') || ''); // Workday specific
    const dataUicontrol = cleanText(input.getAttribute('data-uicontrol') || '');

    let labelText = '';

    // Check aria-labelledby
    const ariaLabelledBy = input.getAttribute('aria-labelledby');
    if (ariaLabelledBy) {
      const el = document.getElementById(ariaLabelledBy);
      if (el) labelText = cleanText(el.textContent);
    }

    // Check for <label for="...">
    if (!labelText && input.id) {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label) labelText = cleanText(label.textContent);
    }

    // Check parent label
    if (!labelText) {
      const parentLabel = input.closest('label');
      if (parentLabel) labelText = cleanText(parentLabel.textContent);
    }

    // AGGRESSIVE FALLBACK: Walk up the DOM tree
    if (!labelText) {
      let parent = input.parentElement;
      for (let i = 0; i < 5 && parent; i++) {
        const text = cleanText(parent.textContent);
        // Only use if reasonably short (not entire form text)
        if (text && text.length > 0 && text.length < 200) {
          labelText = text;
          break;
        }
        parent = parent.parentElement;
      }
    }

    // Check previous sibling (common pattern: <div>Label</div><input>)
    if (!labelText && input.previousElementSibling) {
      const prevText = cleanText(input.previousElementSibling.textContent);
      if (prevText.length < 150) labelText = prevText;
    }

    // Workday/ATS: Check for nearby text nodes
    if (!labelText) {
      const parentWithText = input.closest('[data-automation-label], [data-label], .form-group, .field-wrapper, .input-wrapper');
      if (parentWithText) {
        labelText = cleanText(parentWithText.textContent);
      }
    }

    return { id, name, placeholder, autocomplete, ariaLabel, type, labelText, dataField, dataUicontrol };
  }

  // ENHANCED: Regex-based fuzzy matching with word boundaries
  function scoreHeuristics(kwKey, h) {
    let score = 0;
    const keywords = KEYWORDS[kwKey] || [];

    keywords.forEach(kw => {
      const kwRegex = new RegExp(`\\b${kw.replace(/\s+/g, '\\s*')}\\b`, 'i');

      // Direct matches (higher weight)
      if (kwRegex.test(h.id)) score += 40;
      if (kwRegex.test(h.name)) score += 40;
      if (kwRegex.test(h.dataField)) score += 50; // Workday automation IDs
      if (kwRegex.test(h.dataUicontrol)) score += 45;
      if (kwRegex.test(h.ariaLabel)) score += 50;
      if (kwRegex.test(h.autocomplete)) score += 60;

      // Fuzzy matches (lower weight)
      if (kwRegex.test(h.placeholder)) score += 25;
      if (kwRegex.test(h.labelText)) score += 55;

      // Partial substring fallback (lowest weight)
      if (h.id.includes(kw)) score += 10;
      if (h.name.includes(kw)) score += 10;
      if (h.labelText.includes(kw)) score += 15;
    });

    // NEGATIVE SCORING: Prevent mismatches
    if (kwKey === 'firstName') {
      if (/\blast\b/i.test(h.labelText + h.id + h.name)) score -= 100;
    }
    if (kwKey === 'lastName') {
      if (/\bfirst\b/i.test(h.labelText + h.id + h.name)) score -= 100;
    }

    // Bonus for exact keyword in autocomplete attribute
    if (h.autocomplete && KEYWORDS[kwKey].includes(h.autocomplete)) {
      score += 100;
    }

    return score;
  }

  function getMatchingSuggestions(input, p) {
    const h = getFieldHeuristics(input);
    const suggestions = [];

    const addSugg = (label, value, score) => {
      if (value && score > 0) {
        // Prevent duplicates
        const exists = suggestions.find(s => s.value === value && s.label === label);
        if (!exists) suggestions.push({ label, value, score });
      }
    };

    // Simple string fields from root level
    const simpleFields = [
      { key: 'fullName', lbl: 'Full Name' },
      { key: 'firstName', lbl: 'First Name' },
      { key: 'lastName', lbl: 'Last Name' },
      { key: 'email', lbl: 'Email' },
      { key: 'phone', lbl: 'Phone' },
      { key: 'phoneDeviceType', lbl: 'Phone Type' },
      { key: 'phoneCountryCode', lbl: 'Country Code' },
      { key: 'addressLine1', lbl: 'Address Line 1' },
      { key: 'addressLine2', lbl: 'Address Line 2' },
      { key: 'locationCity', lbl: 'City' },
      { key: 'locationState', lbl: 'State' },
      { key: 'locationZip', lbl: 'ZIP Code' },
      { key: 'locationCountry', lbl: 'Country' },
      { key: 'skills', lbl: 'Skills' },
      { key: 'summary', lbl: 'Summary' },
    ];

    simpleFields.forEach(field => {
      if (p[field.key]) {
        addSugg(field.lbl, p[field.key], scoreHeuristics(field.key, h));
      }
    });

    // WEBSITES
    (p.websites || []).forEach((w, i) => {
      if (w.url) {
        const label = i === 0 ? 'Website' : `Website ${i + 1}`;
        addSugg(label, w.url, scoreHeuristics('website', h));
      }
    });

    // EXPERIENCE - with proper scoring for each field
    (p.experience || []).forEach((exp, i) => {
      const prefix = i === 0 ? '' : ` #${i + 1}`;

      if (exp.title) {
        addSugg(`Job Title${prefix}`, exp.title, scoreHeuristics('jobTitle', h));
      }
      if (exp.company) {
        addSugg(`Company${prefix}`, exp.company, scoreHeuristics('company', h));
      }
      if (exp.location) {
        addSugg(`Work Location${prefix}`, exp.location, scoreHeuristics('location', h));
      }
      if (exp.startDate) {
        addSugg(`Start Date${prefix}`, exp.startDate, scoreHeuristics('startDate', h));
      }
      if (exp.endDate) {
        addSugg(`End Date${prefix}`, exp.endDate, scoreHeuristics('endDate', h));
      }
    });

    // EDUCATION
    (p.education || []).forEach((edu, i) => {
      const prefix = i === 0 ? '' : ` #${i + 1}`;

      if (edu.school) {
        addSugg(`School${prefix}`, edu.school, scoreHeuristics('school', h));
      }
      if (edu.degree) {
        addSugg(`Degree${prefix}`, edu.degree, scoreHeuristics('degree', h));
      }
      if (edu.gradYear) {
        addSugg(`Grad Year${prefix}`, edu.gradYear, scoreHeuristics('gradYear', h));
      }
    });

    // CERTIFICATIONS
    (p.certifications || []).forEach((cert, i) => {
      const prefix = i === 0 ? '' : ` #${i + 1}`;

      if (cert.name) {
        addSugg(`Certification${prefix}`, cert.name, scoreHeuristics('certName', h));
      }
      if (cert.issueDate) {
        addSugg(`Cert Issue Date${prefix}`, cert.issueDate, scoreHeuristics('certIssue', h));
      }
      if (cert.expDate) {
        addSugg(`Cert Expiry${prefix}`, cert.expDate, scoreHeuristics('certExp', h));
      }
    });

    // LANGUAGES
    (p.languages || []).forEach((lang, i) => {
      const prefix = i === 0 ? '' : ` #${i + 1}`;

      if (lang.language) {
        addSugg(`Language${prefix}`, lang.language, scoreHeuristics('langName', h));
      }
      if (lang.verbal) {
        addSugg(`Verbal Proficiency${prefix}`, lang.verbal, scoreHeuristics('langVerbal', h));
      }
      if (lang.writing) {
        addSugg(`Writing Proficiency${prefix}`, lang.writing, scoreHeuristics('langWriting', h));
      }
    });

    // CUSTOM FIELDS (highest priority for exact matches)
    (p.customFields || []).forEach(cf => {
      if (!cf.label || !cf.value) return;
      const lowerLabel = cleanText(cf.label);
      let customScore = 0;

      // Check if field label text contains custom field label
      if (h.labelText && h.labelText.includes(lowerLabel)) customScore += 80;
      if (h.placeholder && h.placeholder.includes(lowerLabel)) customScore += 40;
      if (h.name && h.name.includes(lowerLabel)) customScore += 30;

      addSugg(cf.label, cf.value, customScore);
    });

    // Sort by score (highest first)
    return suggestions.sort((a, b) => b.score - a.score);
  }

  // Helper: Flatten nested profile structure
  // Helper: Flatten nested profile structure AND extract array data
  function flattenProfile(p) {
    const flat = {};

    // Direct string properties
    Object.keys(p).forEach(k => {
      if (typeof p[k] === 'string') flat[k] = p[k];
    });

    // Handle arrays - extract ALL fields from array items
    if (Array.isArray(p.websites)) {
      p.websites.forEach((w, i) => {
        if (w.url) flat[`website${i > 0 ? i + 1 : ''}`] = w.url;
      });
    }

    if (Array.isArray(p.experience)) {
      p.experience.forEach((exp, i) => {
        const prefix = i > 0 ? ` ${i + 1}` : '';
        if (exp.title) flat[`jobTitle${prefix}`] = exp.title;
        if (exp.company) flat[`company${prefix}`] = exp.company;
        if (exp.location) flat[`location${prefix}`] = exp.location;
        if (exp.startDate) flat[`startDate${prefix}`] = exp.startDate;
        if (exp.endDate) flat[`endDate${prefix}`] = exp.endDate;
      });
    }

    if (Array.isArray(p.education)) {
      p.education.forEach((edu, i) => {
        const prefix = i > 0 ? ` ${i + 1}` : '';
        if (edu.school) flat[`school${prefix}`] = edu.school;
        if (edu.degree) flat[`degree${prefix}`] = edu.degree;
        if (edu.gradYear) flat[`gradYear${prefix}`] = edu.gradYear;
      });
    }

    if (Array.isArray(p.certifications)) {
      p.certifications.forEach((cert, i) => {
        const prefix = i > 0 ? ` ${i + 1}` : '';
        if (cert.name) flat[`certName${prefix}`] = cert.name;
        if (cert.issueDate) flat[`certIssue${prefix}`] = cert.issueDate;
        if (cert.expDate) flat[`certExp${prefix}`] = cert.expDate;
      });
    }

    if (Array.isArray(p.languages)) {
      p.languages.forEach((lang, i) => {
        const prefix = i > 0 ? ` ${i + 1}` : '';
        if (lang.language) flat[`langName${prefix}`] = lang.language;
        if (lang.verbal) flat[`langVerbal${prefix}`] = lang.verbal;
        if (lang.writing) flat[`langWriting${prefix}`] = lang.writing;
      });
    }

    // Keep customFields as array for special handling
    if (Array.isArray(p.customFields)) {
      flat.customFields = p.customFields;
    }

    return flat;
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

    // Header
    const header = document.createElement('div');
    header.className = 'dropdown-header';
    header.innerHTML = `
    <div class="logo">J</div>
    <div class="header-title">Suggestions</div>
    <div class="badge">${suggestions.length ? 'Smart' : 'All'}</div>
  `;
    container.appendChild(header);

    // Suggestions List (Smart Matches)
    const list = document.createElement('div');
    list.className = 'suggestions-list';
    suggestionItems = [];
    selectedSuggestionIndex = -1;

    if (suggestions.length > 0) {
      // Show top 5 smart suggestions
      suggestions.slice(0, 5).forEach((s) => {
        const item = createItem(s.label, s.value, input);
        list.appendChild(item);
        suggestionItems.push(item);
      });
    } else {
      list.innerHTML = `<div style="padding:8px 12px;font-size:11px;color:#64748b;font-style:italic;">No smart matches. Browse all fields below.</div>`;
    }
    container.appendChild(list);

    // "Browse All Fields" Trigger Button
    const trigger = document.createElement('div');
    trigger.className = 'all-fields-trigger';
    trigger.innerHTML = `<span>Browse all fields</span> <span>⚡</span>`;

    // "Browse All Fields" Content (Expandable)
    const allFieldsContent = document.createElement('div');
    allFieldsContent.className = 'all-fields-content';

    const allFields = [];

    // Add all simple string fields
    Object.keys(p).forEach(k => {
      if (typeof p[k] === 'string' && p[k]) {
        allFields.push({ label: k, value: p[k] });
      }
    });

    // Add WEBSITES
    (p.websites || []).forEach((w, i) => {
      if (w.url) {
        allFields.push({ label: `Website ${i + 1}`, value: w.url });
      }
    });

    // Add EXPERIENCE fields
    (p.experience || []).forEach((exp, i) => {
      const n = i + 1;
      if (exp.title) allFields.push({ label: `Experience ${n} - Title`, value: exp.title });
      if (exp.company) allFields.push({ label: `Experience ${n} - Company`, value: exp.company });
      if (exp.location) allFields.push({ label: `Experience ${n} - Location`, value: exp.location });
      if (exp.startDate) allFields.push({ label: `Experience ${n} - Start`, value: exp.startDate });
      if (exp.endDate) allFields.push({ label: `Experience ${n} - End`, value: exp.endDate });
    });

    // Add EDUCATION fields
    (p.education || []).forEach((edu, i) => {
      const n = i + 1;
      if (edu.school) allFields.push({ label: `Education ${n} - School`, value: edu.school });
      if (edu.degree) allFields.push({ label: `Education ${n} - Degree`, value: edu.degree });
      if (edu.gradYear) allFields.push({ label: `Education ${n} - Grad Year`, value: edu.gradYear });
    });

    // Add CERTIFICATIONS fields
    (p.certifications || []).forEach((cert, i) => {
      const n = i + 1;
      if (cert.name) allFields.push({ label: `Cert ${n} - Name`, value: cert.name });
      if (cert.issueDate) allFields.push({ label: `Cert ${n} - Issued`, value: cert.issueDate });
      if (cert.expDate) allFields.push({ label: `Cert ${n} - Expires`, value: cert.expDate });
    });

    // Add LANGUAGES fields
    (p.languages || []).forEach((lang, i) => {
      const n = i + 1;
      if (lang.language) allFields.push({ label: `Language ${n}`, value: lang.language });
      if (lang.verbal) allFields.push({ label: `Language ${n} - Verbal`, value: lang.verbal });
      if (lang.writing) allFields.push({ label: `Language ${n} - Writing`, value: lang.writing });
    });

    // Add CUSTOM FIELDS
    (p.customFields || []).forEach(cf => {
      if (cf.label && cf.value) {
        allFields.push({ label: `Custom: ${cf.label}`, value: cf.value });
      }
    });

    // Create items for all fields
    allFields.forEach(f => {
      const item = createItem(f.label, f.value, input);
      allFieldsContent.appendChild(item);
      suggestionItems.push(item);
    });

    // Toggle expand/collapse
    trigger.addEventListener('click', () => {
      const isShown = allFieldsContent.classList.toggle('show');
      trigger.querySelector('span:last-child').textContent = isShown ? '▼' : '⚡';
      // Adjust position after expanding
      setTimeout(() => adjustPosition(input, host), 10);
    });

    container.appendChild(trigger);
    container.appendChild(allFieldsContent);

    // Footer
    const footer = document.createElement('div');
    footer.className = 'dropdown-footer';
    footer.innerHTML = `<span>↑↓ Navigate</span><span>Enter to fill</span>`;
    container.appendChild(footer);

    shadow.appendChild(container);
    document.body.appendChild(host);
    activeDropdown = host;

    // Attach keyboard navigation
    input.addEventListener('keydown', handleKeyDown);

    // Adjust position after render
    setTimeout(() => adjustPosition(input, host), 10);
  }
  function createItem(label, value, input) {
    const item = document.createElement('div');
    item.className = 'suggestion-item';
    const displayValue = value.length > 50 ? value.substring(0, 47) + '...' : value;
    item.innerHTML = `<div class="field-label">${escapeHtml(label)}</div><div class="field-value" title="${escapeHtml(value)}">${escapeHtml(displayValue)}</div>`;
    item.addEventListener('mousedown', (e) => {
      e.preventDefault();
      fillInputField(input, value);
      removeDropdown();
    });
    return item;
  }

  function fillInputField(input, value) {
    input.focus();

    // For React/Vue/Angular inputs - trigger native setters
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
    const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;

    if (input.tagName === 'TEXTAREA' && nativeTextAreaValueSetter) {
      nativeTextAreaValueSetter.call(input, value);
    } else if (input.tagName === 'INPUT' && nativeInputValueSetter) {
      nativeInputValueSetter.call(input, value);
    } else if (input.contentEditable === 'true') {
      // For contenteditable divs (Workday)
      input.textContent = value;
    } else {
      input.value = value;
    }

    // Trigger all possible events for framework detection
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));

    // Workday-specific events
    input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));

    setTimeout(() => {
      input.dispatchEvent(new Event('blur', { bubbles: true }));
    }, 100);
  }

  function adjustPosition(input, host) {
    const rect = input.getBoundingClientRect();
    const dropdownHeight = host.offsetHeight || 300;
    let top = rect.bottom + window.scrollY + 6;

    // Flip dropdown above input if not enough space below
    if (rect.bottom + dropdownHeight > window.innerHeight && rect.top - dropdownHeight > 0) {
      top = rect.top + window.scrollY - dropdownHeight - 6;
    }

    host.style.top = `${top}px`;
    host.style.left = `${rect.left + window.scrollX}px`;
  }

  function removeDropdown() {
    if (activeInput) activeInput.removeEventListener('keydown', handleKeyDown);
    if (activeDropdown) {
      activeDropdown.remove();
      activeDropdown = null;
    }
    selectedSuggestionIndex = -1;
    suggestionItems = [];
  }

  function escapeHtml(str) {
    return (str || '').toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();