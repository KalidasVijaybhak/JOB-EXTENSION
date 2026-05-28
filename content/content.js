(function () {
  if (window.__job_autocomplete_loaded) return;
  window.__job_autocomplete_loaded = true;

  let activeDropdown = null;
  let activeInput = null;
  let selectedSuggestionIndex = -1;
  let suggestionItems = [];

  // Dock state
  let isDocked = false;
  let dockPanel = null;

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
    linkedin: ['linkedin', 'linked in', 'linkedin profile', 'linkedin url', 'linkedin profile url', 'linkedinprofile'],
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

    // EXPERIENCE DESCRIPTION - covers many ATS field names
    expDescription: [
      'description', 'job description', 'work description', 'role description', 'Role Description',
      'responsibilities', 'key responsibilities', 'primary responsibilities', 'job responsibilities',
      'duties', 'job duties', 'key duties', 'day-to-day', 'day to day', 'daily responsibilities',
      'what did you do', 'describe your role', 'describe your experience', 'describe your responsibilities',
      'achievements', 'accomplishments', 'key achievements', 'contributions',
      'summary of experience', 'experience summary', 'role summary', 'position summary',
      'additional details', 'more details', 'elaborate', 'tell us about your experience',
      'work performed', 'tasks performed', 'scope of work', 'work scope',
      'about this role', 'about your role', 'role details', 'position details',
    ],
  };

  const SHADOW_STYLE = `
    .autofill-container { background: rgba(248,252,255,0.96) !important; backdrop-filter: blur(20px) !important; -webkit-backdrop-filter: blur(20px) !important; border: 1.5px solid rgba(191,219,254,0.9) !important; border-radius: 14px !important; box-shadow: 0 8px 32px rgba(37,99,235,0.16), 0 2px 8px rgba(15,23,42,0.08) !important; width: 288px !important; display: flex !important; flex-direction: column !important; overflow: hidden !important; animation: popIn 0.18s cubic-bezier(0.34,1.56,0.64,1) !important; color: #0f172a !important; font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important; text-align: left !important; }
    @keyframes popIn { from { opacity: 0; transform: scale(0.94) translateY(-6px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    .dropdown-header { padding: 10px 12px !important; background: linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(124,58,237,0.06) 100%) !important; border-bottom: 1px solid rgba(191,219,254,0.7) !important; display: flex !important; align-items: center !important; gap: 8px !important; }
    .logo { width: 20px !important; height: 20px !important; background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%) !important; border-radius: 6px !important; display: flex !important; align-items: center !important; justify-content: center !important; font-weight: 800 !important; font-size: 11px !important; color: #fff !important; box-shadow: 0 2px 8px rgba(37,99,235,0.35) !important; flex-shrink: 0 !important; }
    .header-title { font-size: 10px !important; font-weight: 700 !important; color: #475569 !important; text-transform: uppercase !important; letter-spacing: 0.07em !important; flex: 1 !important; }
    .badge { font-size: 9px !important; background: rgba(37,99,235,0.1) !important; color: #2563eb !important; padding: 2px 7px !important; border-radius: 99px !important; font-weight: 600 !important; border: 1px solid rgba(37,99,235,0.15) !important; }
    .suggestions-list, .all-fields-content { max-height: 180px !important; overflow-y: auto !important; padding: 6px !important; display: flex !important; flex-direction: column !important; gap: 3px !important; }
    ::-webkit-scrollbar { width: 3px !important; }
    ::-webkit-scrollbar-thumb { background: #bfdbfe !important; border-radius: 99px !important; }
    ::-webkit-scrollbar-thumb:hover { background: #60a5fa !important; }
    .suggestion-item { padding: 7px 10px !important; border-radius: 8px !important; cursor: pointer !important; display: flex !important; flex-direction: column !important; gap: 2px !important; transition: all 0.15s ease !important; border: 1px solid transparent !important; }
    .suggestion-item:hover, .suggestion-item.selected { background: rgba(37,99,235,0.07) !important; border-color: rgba(37,99,235,0.2) !important; box-shadow: 0 2px 8px rgba(37,99,235,0.1) !important; }
    .field-label { font-size: 9px !important; color: #2563eb !important; font-weight: 700 !important; text-transform: uppercase !important; letter-spacing: 0.06em !important; }
    .field-value { font-size: 12px !important; color: #0f172a !important; font-weight: 500 !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; }
    .all-fields-trigger { padding: 8px 12px !important; font-size: 11px !important; color: #475569 !important; cursor: pointer !important; display: flex !important; justify-content: space-between !important; align-items: center !important; background: rgba(37,99,235,0.03) !important; border-top: 1px solid rgba(191,219,254,0.6) !important; font-weight: 500 !important; transition: background 0.15s !important; }
    .all-fields-trigger:hover { background: rgba(37,99,235,0.07) !important; color: #2563eb !important; }
    .all-fields-content { display: none !important; background: rgba(37,99,235,0.02) !important; border-top: 1px solid rgba(191,219,254,0.5) !important; }
    .all-fields-content.show { display: flex !important; }
    .dropdown-footer { padding: 7px 12px !important; background: rgba(37,99,235,0.03) !important; border-top: 1px solid rgba(191,219,254,0.6) !important; font-size: 9px !important; color: #94a3b8 !important; display: flex !important; justify-content: space-between !important; align-items: center !important; gap: 6px !important; }
    .btn-close { background: rgba(15,23,42,0.04) !important; border: 1px solid rgba(15,23,42,0.08) !important; color: #94a3b8 !important; cursor: pointer !important; font-size: 12px !important; line-height: 1 !important; padding: 0 !important; margin-left: auto !important; transition: all 0.15s !important; width: 20px !important; height: 20px !important; border-radius: 6px !important; display: flex !important; align-items: center !important; justify-content: center !important; flex-shrink: 0 !important; }
    .btn-close:hover { background: rgba(15,23,42,0.1) !important; color: #0f172a !important; }
    .btn-disable-site { background: rgba(239,68,68,0.07) !important; border: 1px solid rgba(239,68,68,0.2) !important; color: #ef4444 !important; cursor: pointer !important; font-size: 9px !important; font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important; padding: 3px 8px !important; border-radius: 99px !important; white-space: nowrap !important; transition: all 0.15s !important; font-weight: 600 !important; }
    .btn-disable-site:hover { background: rgba(239,68,68,0.15) !important; box-shadow: 0 2px 6px rgba(239,68,68,0.2) !important; }
  `;

  const DOCK_STYLE = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .dock-wrapper { border-radius: 16px; overflow: hidden; box-shadow: 0 16px 56px rgba(37,99,235,0.22), 0 4px 16px rgba(15,23,42,0.12); border: 1.5px solid rgba(191,219,254,0.9); display: flex; flex-direction: column; position: relative; }
    .dock-bar { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(124,58,237,0.07) 100%); background-color: rgba(248,252,255,0.98); border-bottom: 1px solid rgba(191,219,254,0.7); cursor: grab; user-select: none; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
    .dock-bar:active { cursor: grabbing; }
    .dock-dots { color: #bfdbfe; font-size: 14px; flex-shrink: 0; letter-spacing: 1px; line-height: 1; }
    .dock-logo { width: 18px; height: 18px; background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); border-radius: 5px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 10px; color: #fff; box-shadow: 0 2px 6px rgba(37,99,235,0.38); flex-shrink: 0; }
    .dock-title { font-size: 11px; font-weight: 700; background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; flex: 1; font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; white-space: nowrap; overflow: hidden; }
    .dock-close { background: rgba(15,23,42,0.05); border: 1px solid rgba(15,23,42,0.08); color: #94a3b8; cursor: pointer; font-size: 11px; width: 22px; height: 22px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: all 0.15s; line-height: 1; flex-shrink: 0; font-family: inherit; }
    .dock-close:hover { background: #ef4444; color: #fff; border-color: #ef4444; box-shadow: 0 2px 8px rgba(239,68,68,0.3); }
    .dock-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 10; display: none; }
    .dock-iframe { display: block; width: 450px; height: 580px; border: none; background: transparent; }
  `;

  document.addEventListener('focusin', (e) => {
    // composedPath pierces shadow DOM (needed for LinkedIn web components)
    const target = (e.composedPath && e.composedPath()[0]) || e.target;
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
    chrome.storage.sync.get(['job_profile', 'extensionEnabled', 'disabledSites'], (result) => {
      if (result.extensionEnabled === false || !result.job_profile) return;
      const disabledSites = result.disabledSites || [];
      if (disabledSites.includes(window.location.hostname)) return;
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
    const WEBSITE_TYPE_KEYWORD = { linkedin: 'linkedin', github: 'github', x: 'twitter', portfolio: 'website', medium: 'website' };
    const WEBSITE_TYPE_LABEL   = { linkedin: 'LinkedIn', github: 'GitHub', x: 'X / Twitter', portfolio: 'Portfolio', medium: 'Medium' };
    (p.websites || []).forEach((w, i) => {
      if (!w.url) return;
      if (w.type) {
        const kwKey = WEBSITE_TYPE_KEYWORD[w.type] || 'website';
        const lbl   = WEBSITE_TYPE_LABEL[w.type]   || 'Website';
        addSugg(lbl, w.url, scoreHeuristics(kwKey, h));
      } else if (w.label) {
        const cleanedLbl = cleanText(w.label);
        let score = scoreHeuristics('website', h);
        if (h.labelText && h.labelText.includes(cleanedLbl)) score += 80;
        if (h.placeholder && h.placeholder.includes(cleanedLbl)) score += 40;
        if (h.name && h.name.includes(cleanedLbl)) score += 30;
        addSugg(w.label, w.url, score);
      } else {
        addSugg(i === 0 ? 'Website' : `Website ${i + 1}`, w.url, scoreHeuristics('website', h));
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
      if (exp.description) {
        addSugg(`Job Description${prefix}`, exp.description, scoreHeuristics('expDescription', h));
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
      if (!cf.value) return;
      const labelList = cf.labels || (cf.label ? [cf.label] : []);
      if (!labelList.length) return;
      let customScore = 0;
      labelList.forEach(lbl => {
        const cleanedLbl = cleanText(lbl);
        if (!cleanedLbl) return;
        if (h.labelText && h.labelText.includes(cleanedLbl)) customScore = Math.max(customScore, 80);
        if (h.placeholder && h.placeholder.includes(cleanedLbl)) customScore = Math.max(customScore, 40);
        if (h.name && h.name.includes(cleanedLbl)) customScore = Math.max(customScore, 30);
      });
      addSugg(labelList[0], cf.value, customScore);
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
        if (exp.description) flat[`expDescription${prefix}`] = exp.description;
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

  // Returns true if el is inside a position:fixed ancestor (e.g. LinkedIn's modal)
  function isInFixedContainer(el) {
    let node = el.parentElement;
    while (node && node !== document.documentElement) {
      if (window.getComputedStyle(node).position === 'fixed') return true;
      node = node.parentElement;
    }
    return false;
  }

  function showDropdown(input, suggestions, p) {
    removeDropdown();

    const host = document.createElement('div');
    host.id = 'job-autocomplete-shadow-host';
    const rect = input.getBoundingClientRect();
    // Use fixed positioning when the input is inside a fixed container (LinkedIn modal, etc.)
    const useFixed = isInFixedContainer(input);
    host.style.position = useFixed ? 'fixed' : 'absolute';
    host.style.left = `${rect.left + (useFixed ? 0 : window.scrollX)}px`;
    host.style.top = `${rect.bottom + (useFixed ? 0 : window.scrollY) + 6}px`;
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
    <button class="btn-close" title="Close">✕</button>
  `;
    header.querySelector('.btn-close').addEventListener('mousedown', (e) => {
      e.preventDefault();
      removeDropdown();
    });
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

    buildAllFieldsList(p).forEach(f => {
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
    footer.innerHTML = `<span>↑↓ Navigate</span><span>Enter to fill</span><button class="btn-disable-site" title="Stop showing suggestions on this site">Disable for site</button>`;
    footer.querySelector('.btn-disable-site').addEventListener('mousedown', (e) => {
      e.preventDefault();
      const hostname = window.location.hostname;
      chrome.storage.sync.get(['disabledSites'], (result) => {
        const sites = result.disabledSites || [];
        if (!sites.includes(hostname)) sites.push(hostname);
        chrome.storage.sync.set({ disabledSites: sites });
      });
      removeDropdown();
    });
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
    // InputEvent (not plain Event) is needed for LinkedIn/React 16+ synthetic event system
    input.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'a' }));
    input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'a' }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));

    setTimeout(() => {
      input.dispatchEvent(new Event('blur', { bubbles: true }));
    }, 100);
  }

  function adjustPosition(input, host) {
    const rect = input.getBoundingClientRect();
    const dropdownHeight = host.offsetHeight || 300;
    const useFixed = host.style.position === 'fixed';
    const scrollY = useFixed ? 0 : window.scrollY;
    const scrollX = useFixed ? 0 : window.scrollX;
    let top = rect.bottom + scrollY + 6;

    // Flip dropdown above input if not enough space below
    if (rect.bottom + dropdownHeight > window.innerHeight && rect.top - dropdownHeight > 0) {
      top = rect.top + scrollY - dropdownHeight - 6;
    }

    host.style.top = `${top}px`;
    host.style.left = `${rect.left + scrollX}px`;
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

  // ── Shared helper used by dropdown + dock ──────────────────
  function buildAllFieldsList(p) {
    const fields = [];
    Object.keys(p).forEach(k => {
      if (typeof p[k] === 'string' && p[k]) fields.push({ label: k, value: p[k] });
    });
    (p.websites || []).forEach((w, i) => {
      if (w.url) fields.push({ label: `Website ${i + 1}`, value: w.url });
    });
    (p.experience || []).forEach((exp, i) => {
      const n = i + 1;
      if (exp.title) fields.push({ label: `Experience ${n} - Title`, value: exp.title });
      if (exp.company) fields.push({ label: `Experience ${n} - Company`, value: exp.company });
      if (exp.location) fields.push({ label: `Experience ${n} - Location`, value: exp.location });
      if (exp.startDate) fields.push({ label: `Experience ${n} - Start`, value: exp.startDate });
      if (exp.endDate) fields.push({ label: `Experience ${n} - End`, value: exp.endDate });
      if (exp.description) fields.push({ label: `Experience ${n} - Description`, value: exp.description });
    });
    (p.education || []).forEach((edu, i) => {
      const n = i + 1;
      if (edu.school) fields.push({ label: `Education ${n} - School`, value: edu.school });
      if (edu.degree) fields.push({ label: `Education ${n} - Degree`, value: edu.degree });
      if (edu.gradYear) fields.push({ label: `Education ${n} - Grad Year`, value: edu.gradYear });
    });
    (p.certifications || []).forEach((cert, i) => {
      const n = i + 1;
      if (cert.name) fields.push({ label: `Cert ${n} - Name`, value: cert.name });
      if (cert.issueDate) fields.push({ label: `Cert ${n} - Issued`, value: cert.issueDate });
      if (cert.expDate) fields.push({ label: `Cert ${n} - Expires`, value: cert.expDate });
    });
    (p.languages || []).forEach((lang, i) => {
      const n = i + 1;
      if (lang.language) fields.push({ label: `Language ${n}`, value: lang.language });
      if (lang.verbal) fields.push({ label: `Language ${n} - Verbal`, value: lang.verbal });
      if (lang.writing) fields.push({ label: `Language ${n} - Writing`, value: lang.writing });
    });
    (p.customFields || []).forEach(cf => {
      if (!cf.value) return;
      const primaryLabel = (cf.labels && cf.labels[0]) || cf.label || 'Custom';
      fields.push({ label: `Custom: ${primaryLabel}`, value: cf.value });
    });
    return fields;
  }

  // ── Dock panel ─────────────────────────────────────────────
  function showDockPanel(initTop, initRight) {
    if (dockPanel) { dockPanel.remove(); dockPanel = null; }
    isDocked = true;

    const host = document.createElement('div');
    host.id = 'job-dock-host';
    Object.assign(host.style, {
      position: 'fixed',
      top: `${initTop}px`,
      right: `${initRight}px`,
      left: 'auto',
      zIndex: '2147483646',
    });

    const shadow = host.attachShadow({ mode: 'open' });
    const styleEl = document.createElement('style');
    styleEl.textContent = DOCK_STYLE;
    shadow.appendChild(styleEl);

    const wrapper = document.createElement('div');
    wrapper.className = 'dock-wrapper';

    // Drag titlebar
    const bar = document.createElement('div');
    bar.className = 'dock-bar';
    bar.innerHTML = `
      <span class="dock-dots">⠿⠿</span>
      <div class="dock-logo">J</div>
      <div class="dock-title">Job Autocomplete Pro</div>
      <button class="dock-close" title="Close">✕</button>
    `;

    // Transparent overlay — blocks iframe mouse capture while dragging
    const overlay = document.createElement('div');
    overlay.className = 'dock-overlay';

    // Full popup as iframe
    const iframe = document.createElement('iframe');
    iframe.className = 'dock-iframe';
    iframe.src = chrome.runtime.getURL('popup/popup.html');

    wrapper.appendChild(bar);
    wrapper.appendChild(overlay);
    wrapper.appendChild(iframe);
    shadow.appendChild(wrapper);
    document.body.appendChild(host);
    dockPanel = host;

    bar.querySelector('.dock-close').addEventListener('click', closeDock);

    // Drag logic
    let dragging = false, ox = 0, oy = 0;

    const onMove = (e) => {
      if (!dragging) return;
      const newTop = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - oy));
      const newRight = Math.max(0, window.innerWidth - (e.clientX - ox) - host.offsetWidth);
      host.style.top = `${newTop}px`;
      host.style.right = `${newRight}px`;
    };

    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      overlay.style.display = 'none';
      bar.style.cursor = 'grab';
      chrome.storage.local.set({
        dockTop: parseInt(host.style.top) || 70,
        dockRight: parseInt(host.style.right) || 20,
      });
    };

    bar.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('dock-close')) return;
      dragging = true;
      overlay.style.display = 'block';
      const rect = host.getBoundingClientRect();
      ox = e.clientX - rect.left;
      oy = e.clientY - rect.top;
      bar.style.cursor = 'grabbing';
      e.preventDefault();
    });

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  function closeDock() {
    isDocked = false;
    chrome.storage.local.set({ isDocked: false });
    if (dockPanel) { dockPanel.remove(); dockPanel = null; }
  }

  // ── Init: restore dock if it was open ──────────────────────
  chrome.storage.local.get(['isDocked', 'dockTop', 'dockRight'], (r) => {
    if (!r.isDocked) return;
    showDockPanel(r.dockTop || 70, r.dockRight || 20);
  });

  // ── Storage change listener (dock toggle from popup) ──────
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || !('isDocked' in changes)) return;
    if (changes.isDocked.newValue === true) {
      if (isDocked && dockPanel) return;
      chrome.storage.local.get(['dockTop', 'dockRight'], (pos) => {
        showDockPanel(pos.dockTop || 70, pos.dockRight || 20);
      });
    } else {
      closeDock();
    }
  });
})();