(() => {
  const CONTENT_STORAGE_KEY = 'publishingTabContent';
  const THEME_STORAGE_KEY = 'publishingThemeOverrides';
  const LOGO_STORAGE_KEY = 'publishingSiteLogo';
  const COMPANY_STORAGE_KEY = 'publishingCompanyName';
  const THEME_TOKENS = [
    '--color-background',
    '--color-surface',
    '--color-surface-alt',
    '--color-accent',
    '--color-accent-muted',
    '--color-accent-rgb',
    '--color-text-primary',
    '--color-text-secondary',
    '--shadow-elevated',
    '--page-shade-direction',
    '--page-shade-strength',
    '--page-shade-soft',
    '--page-shade-panel',
    '--tabs-size-scale'
  ];

  const DEFAULT_ACCENT_SHADE = 12; // percentage
  const DEFAULT_SHADOW_ALPHA = 45; // percentage
  const DEFAULT_BACKGROUND_SHADE = 18; // percentage
  const DEFAULT_SHADE_DIRECTION = 'to bottom';
  const DEFAULT_THEME_OVERRIDES = window.PUBLISHING_THEME_OVERRIDES || {};

  const DEFAULT_CONTENT = window.PUBLISHING_TAB_CONTENT || {};

  const loadContentOverrides = () => {
    try {
      const storedValue = window.localStorage?.getItem(CONTENT_STORAGE_KEY);
      return storedValue ? JSON.parse(storedValue) : {};
    } catch (error) {
      console.warn('Unable to load stored overrides.', error);
      return {};
    }
  };

  const saveContentOverrides = (content) => {
    try {
      window.localStorage?.setItem(CONTENT_STORAGE_KEY, JSON.stringify(content));
      return true;
    } catch (error) {
      console.warn('Unable to persist overrides.', error);
      return false;
    }
  };

  const clearContentOverrides = () => {
    try {
      window.localStorage?.removeItem(CONTENT_STORAGE_KEY);
      return true;
    } catch (error) {
      console.warn('Unable to clear stored overrides.', error);
      return false;
    }
  };

  const loadThemeOverrides = () => {
    try {
      const storedValue = window.localStorage?.getItem(THEME_STORAGE_KEY);
      const storedOverrides = storedValue ? JSON.parse(storedValue) : {};
      return { ...DEFAULT_THEME_OVERRIDES, ...storedOverrides };
    } catch (error) {
      console.warn('Unable to load stored theme overrides.', error);
      return { ...DEFAULT_THEME_OVERRIDES };
    }
  };

  const saveThemeOverrides = (theme) => {
    try {
      const payload = { ...theme };
      if (Object.keys(payload).length) {
        window.localStorage?.setItem(THEME_STORAGE_KEY, JSON.stringify(payload));
      } else {
        window.localStorage?.removeItem(THEME_STORAGE_KEY);
      }
      return true;
    } catch (error) {
      console.warn('Unable to persist theme overrides.', error);
      return false;
    }
  };

  const clearThemeOverrides = () => {
    try {
      window.localStorage?.removeItem(THEME_STORAGE_KEY);
      return true;
    } catch (error) {
      console.warn('Unable to clear stored theme overrides.', error);
      return false;
    }
  };

  const loadLogoSettings = () => {
    try {
      const storedValue = window.localStorage?.getItem(LOGO_STORAGE_KEY);
      return storedValue ? JSON.parse(storedValue) : null;
    } catch (error) {
      console.warn('Unable to load stored logo settings.', error);
      return null;
    }
  };

  const saveLogoSettings = (logo) => {
    try {
      if (!logo || (!logo.src && !logo.url)) {
        window.localStorage?.removeItem(LOGO_STORAGE_KEY);
        return true;
      }
      window.localStorage?.setItem(LOGO_STORAGE_KEY, JSON.stringify(logo));
      return true;
    } catch (error) {
      console.warn('Unable to persist logo settings.', error);
      return false;
    }
  };

  const clearLogoSettings = () => {
    try {
      window.localStorage?.removeItem(LOGO_STORAGE_KEY);
      return true;
    } catch (error) {
      console.warn('Unable to clear stored logo settings.', error);
      return false;
    }
  };

  const loadCompanySettings = () => {
    try {
      const storedValue = window.localStorage?.getItem(COMPANY_STORAGE_KEY);
      return storedValue ? JSON.parse(storedValue) : null;
    } catch (error) {
      console.warn('Unable to load stored company settings.', error);
      return null;
    }
  };

  const saveCompanySettings = (company) => {
    try {
      if (!company || !company.name) {
        window.localStorage?.removeItem(COMPANY_STORAGE_KEY);
        return true;
      }
      window.localStorage?.setItem(COMPANY_STORAGE_KEY, JSON.stringify(company));
      return true;
    } catch (error) {
      console.warn('Unable to persist company settings.', error);
      return false;
    }
  };

  const clearCompanySettings = () => {
    try {
      window.localStorage?.removeItem(COMPANY_STORAGE_KEY);
      return true;
    } catch (error) {
      console.warn('Unable to clear stored company settings.', error);
      return false;
    }
  };

  const toFullHex = (value) => {
    if (typeof value !== 'string') {
      return '';
    }

    const trimmed = value.trim();
    if (!trimmed) {
      return '';
    }

    if (/^#([\da-f]{3})$/i.test(trimmed)) {
      return `#${trimmed
        .slice(1)
        .split('')
        .map((char) => char + char)
        .join('')}`.toLowerCase();
    }

    if (/^#([\da-f]{6})$/i.test(trimmed)) {
      return trimmed.toLowerCase();
    }

    const rgbMatch = trimmed.match(/^rgba?\((\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i);
    if (rgbMatch) {
      const [, r, g, b] = rgbMatch;
      const componentToHex = (component) => {
        const parsed = Math.max(0, Math.min(255, Number(component) || 0));
        return parsed.toString(16).padStart(2, '0');
      };
      return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
    }

    return '';
  };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const computeAccentMuted = (hex, alpha = 0.12) => {
    const normalized = toFullHex(hex);
    if (!normalized) {
      return '';
    }

    const bigint = parseInt(normalized.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const computeAccentRgb = (hex) => {
    const normalized = toFullHex(hex);
    if (!normalized) {
      return '';
    }

    const bigint = parseInt(normalized.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
  };

  const computeShadeSoft = (strength) => clamp(Number(strength) / 3, 0, 0.35).toFixed(2);

  const computeShadePanel = (strength) => clamp(Number(strength) * 0.6, 0, 0.45).toFixed(2);

  const extractAlpha = (value) => {
    if (typeof value !== 'string') {
      return null;
    }

    const match = value.trim().match(/rgba?\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/i);
    if (match) {
      const parsed = Number(match[1]);
      if (!Number.isNaN(parsed)) {
        return clamp(parsed, 0, 1);
      }
    }

    return null;
  };

  const buildShadowValue = (alpha) => `0 20px 45px rgba(6, 9, 19, ${alpha.toFixed(2)})`;

  const extractShadowAlpha = (value) => {
    if (typeof value !== 'string') {
      return null;
    }

    const match = value.trim().match(/rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/i);
    if (match) {
      const parsed = Number(match[1]);
      if (!Number.isNaN(parsed)) {
        return clamp(parsed, 0, 1);
      }
    }

    return null;
  };

  const applyThemeOverrides = (overrides = {}) => {
    const root = document.documentElement;
    const merged = { ...overrides };
    if (merged['--color-accent']) {
      if (!merged['--color-accent-muted']) {
        const accentMuted = computeAccentMuted(merged['--color-accent']);
        if (accentMuted) {
          merged['--color-accent-muted'] = accentMuted;
        }
      }
      if (!merged['--color-accent-rgb']) {
        const accentRgb = computeAccentRgb(merged['--color-accent']);
        if (accentRgb) {
          merged['--color-accent-rgb'] = accentRgb;
        }
      }
    }

    if (merged['--page-shade-strength']) {
      const numericStrength = Number(merged['--page-shade-strength']);
      if (!Number.isNaN(numericStrength)) {
        if (!merged['--page-shade-soft']) {
          merged['--page-shade-soft'] = computeShadeSoft(numericStrength);
        }
        if (!merged['--page-shade-panel']) {
          merged['--page-shade-panel'] = computeShadePanel(numericStrength);
        }
      }
    }

    THEME_TOKENS.forEach((token) => {
      const value = merged[token];
      if (value) {
        root.style.setProperty(token, value);
      } else {
        root.style.removeProperty(token);
      }
    });
  };

  const mergeContent = (base = {}, overrides = {}) => {
    const merged = { ...base };
    Object.entries(overrides).forEach(([key, value]) => {
      if (value == null) {
        return;
      }

      const baseValue = base[key];

      if (Array.isArray(value)) {
        merged[key] = value.slice();
        return;
      }

      if (typeof value === 'object' && !Array.isArray(value)) {
        const nextValue = {
          ...(typeof baseValue === 'object' && !Array.isArray(baseValue) ? baseValue : {}),
          ...value
        };

        if (Array.isArray(value.body)) {
          nextValue.body = value.body.slice();
        }

        if (value.contactDetails || baseValue?.contactDetails) {
          nextValue.contactDetails = {
            ...(baseValue?.contactDetails || {}),
            ...(value.contactDetails || {})
          };
        }

        merged[key] = nextValue;
        return;
      }

      merged[key] = value;
    });

    return merged;
  };

  const storedOverrides = loadContentOverrides();
  const originalContent = mergeContent(DEFAULT_CONTENT, storedOverrides);

  const workingCopy = JSON.parse(JSON.stringify(originalContent));

  const tabSelect = document.getElementById('manager-tab');
  const titleInput = document.getElementById('manager-title');
  const tabLabelInput = document.getElementById('manager-tab-label');
  const bodyInput = document.getElementById('manager-body');
  const statusOutput = document.getElementById('manager-status');
  const resetButton = document.getElementById('manager-reset');
  const contactFieldset = document.querySelector('[data-manager-contact]');
  const phoneLabelInput = document.getElementById('manager-phone-label');
  const phoneInput = document.getElementById('manager-phone');
  const emailLabelInput = document.getElementById('manager-email-label');
  const emailInput = document.getElementById('manager-email');
  const subjectInput = document.getElementById('manager-subject');
  const submittingInput = document.getElementById('manager-submitting');
  const successInput = document.getElementById('manager-success');
  const errorInput = document.getElementById('manager-error');
  const outputTarget = document.getElementById('manager-output');
  const formElement = document.getElementById('content-manager-form');
  const clearButton = document.getElementById('manager-clear');
  const themeResetButton = document.getElementById('manager-theme-reset');
  const themeTextInputs = Array.from(document.querySelectorAll('[data-theme-token]'));
  const themePickers = new Map();
  const accentShadeInput = document.getElementById('manager-accent-shade');
  const accentShadeValue = document.getElementById('manager-accent-shade-value');
  const shadowDepthInput = document.getElementById('manager-shadow-depth');
  const shadowDepthValue = document.getElementById('manager-shadow-depth-value');
  const backgroundShadeInput = document.getElementById('manager-background-shade');
  const backgroundShadeValue = document.getElementById('manager-background-shade-value');
  const shadeDirectionButtons = Array.from(document.querySelectorAll('[data-shade-direction]'));
  const tabsScaleInput = document.getElementById('manager-tabs-scale');
  const tabsScaleValue = document.getElementById('manager-tabs-scale-value');
  document.querySelectorAll('[data-theme-picker]').forEach((input) => {
    if (input instanceof HTMLInputElement && input.dataset.themePicker) {
      themePickers.set(input.dataset.themePicker, input);
    }
  });

  let themeOverrides = loadThemeOverrides();
  applyThemeOverrides(themeOverrides);

  const buildFormEndpoint = (email) =>
    email ? `https://formsubmit.co/ajax/${encodeURIComponent(email)}` : '';

  const normaliseContactDetails = (details = {}) => {
    const emailValue = details.emailAddress?.trim() || details.formRecipient?.trim() || '';
    const phoneNumber = details.phoneNumber?.trim() || '';
    const submittingMessage = details.submittingMessage || 'Sending your message…';
    const successMessage = details.successMessage || 'Thank you! We will reply shortly.';
    const errorMessage = details.errorMessage || 'Sorry, something went wrong. Please try again later.';
    const subject = details.subject || 'New inquiry from the Publishing Portfolio contact form';

    return {
      phoneLabel: details.phoneLabel || 'Telefon',
      phoneNumber,
      emailLabel: details.emailLabel || 'E-mail',
      emailAddress: emailValue,
      formRecipient: emailValue,
      formEndpoint: buildFormEndpoint(emailValue),
      submittingMessage,
      successMessage,
      errorMessage,
      subject
    };
  };

  const formatBodyForInput = (body = []) =>
    body
      .map((entry) => {
        if (typeof entry === 'string') {
          return entry;
        }

        if (entry?.type === 'list' && Array.isArray(entry.items)) {
          return entry.items.map((item) => `- ${item}`).join('\n');
        }

        return '';
      })
      .filter(Boolean)
      .join('\n\n');

  const parseInputToBody = (value) => {
    const segments = value
      .split(/\n\s*\n/g)
      .map((segment) => segment.trim())
      .filter(Boolean);

    return segments.map((segment) => {
      const lines = segment
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      const listItems = lines
        .filter((line) => /^[-•]/.test(line))
        .map((line) => line.replace(/^[-•]\s*/, '').trim())
        .filter(Boolean);

      if (listItems.length && listItems.length === lines.length) {
        return { type: 'list', items: listItems };
      }

      return lines.join(' ');
    });
  };

  function renderOutput() {
    const contentExport = `window.PUBLISHING_TAB_CONTENT = ${JSON.stringify(workingCopy, null, 2)};`;
    const hasThemeOverrides = Object.keys(themeOverrides || {}).length > 0;
    const themeExport = hasThemeOverrides
      ? `window.PUBLISHING_THEME_OVERRIDES = ${JSON.stringify(themeOverrides, null, 2)};`
      : '// No theme overrides saved.';
    outputTarget.textContent = `${contentExport}\n\n${themeExport}`;
  }

  const editableThemeTokens = Array.from(
    new Set(
      themeTextInputs
        .map((input) => input.dataset.themeToken)
        .filter(Boolean)
    )
  );

  const getComputedTokenValue = (token) =>
    getComputedStyle(document.documentElement).getPropertyValue(token || '').trim();

  const getThemeValue = (token) => {
    if (!token) {
      return '';
    }

    const override = themeOverrides[token];
    if (override !== undefined && override !== null && `${override}`.trim() !== '') {
      return `${override}`;
    }

    return getComputedTokenValue(token);
  };

  const syncThemeField = (token) => {
    if (!token) {
      return;
    }

    const value = getThemeValue(token);
    const textInput = document.querySelector(`[data-theme-token="${token}"]`);
    if (textInput instanceof HTMLInputElement) {
      textInput.value = value;
    }

    const picker = themePickers.get(token);
    if (picker) {
      const hexValue = toFullHex(value);
      if (hexValue) {
        picker.value = hexValue;
      }
    }
  };

  const updateAccentShadeValue = (percent) => {
    if (accentShadeValue) {
      accentShadeValue.textContent = `${percent}%`;
    }
  };

  const syncAccentShadeControl = () => {
    if (!accentShadeInput) {
      return;
    }

    const stored = themeOverrides['--color-accent-muted'] || getComputedTokenValue('--color-accent-muted');
    const alpha = extractAlpha(stored) ?? DEFAULT_ACCENT_SHADE / 100;
    const percent = Math.round(clamp(alpha, 0, 1) * 100);
    accentShadeInput.value = String(percent);
    updateAccentShadeValue(percent);
  };

  const setActiveShadeDirectionButton = (direction) => {
    shadeDirectionButtons.forEach((button) => {
      const isActive = button.dataset.shadeDirection === direction;
      button.classList.toggle('content-manager__segmented-button--active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  const syncShadeDirectionControl = () => {
    if (!shadeDirectionButtons.length) {
      return;
    }

    const stored =
      themeOverrides['--page-shade-direction'] ||
      getComputedTokenValue('--page-shade-direction') ||
      DEFAULT_SHADE_DIRECTION;
    const direction = stored && stored.trim() ? stored.trim() : DEFAULT_SHADE_DIRECTION;
    setActiveShadeDirectionButton(direction);
  };

  const syncBackgroundShadeControl = () => {
    if (!backgroundShadeInput) {
      return;
    }

    const stored = themeOverrides['--page-shade-strength'] || getComputedTokenValue('--page-shade-strength');
    const numeric = Number(stored);
    const percent = Number.isNaN(numeric)
      ? DEFAULT_BACKGROUND_SHADE
      : Math.round(clamp(numeric, 0, 0.6) * 100);
    backgroundShadeInput.value = String(percent);
    if (backgroundShadeValue) {
      backgroundShadeValue.textContent = `${percent}%`;
    }
  };

  const syncShadowControl = () => {
    if (!shadowDepthInput) {
      return;
    }

    const stored = themeOverrides['--shadow-elevated'] || getComputedTokenValue('--shadow-elevated');
    const alpha = extractShadowAlpha(stored) ?? DEFAULT_SHADOW_ALPHA / 100;
    const percent = Math.round(clamp(alpha, 0, 1) * 100);
    shadowDepthInput.value = String(percent);
    if (shadowDepthValue) {
      shadowDepthValue.textContent = `${percent}%`;
    }
  };

  const syncTabsScaleControl = () => {
    if (!tabsScaleInput) {
      return;
    }

    const stored =
      themeOverrides['--tabs-size-scale'] ||
      getComputedTokenValue('--tabs-size-scale') ||
      '1';
    const numeric = Number(stored);
    const scale = Number.isNaN(numeric) ? 1 : clamp(numeric, 0.85, 1.25);
    const percent = Math.round(scale * 100);
    tabsScaleInput.value = String(percent);
    if (tabsScaleValue) {
      tabsScaleValue.textContent = `${percent}%`;
    }
  };

  const syncThemeFields = () => {
    editableThemeTokens.forEach((token) => {
      syncThemeField(token);
    });
    syncAccentShadeControl();
    syncBackgroundShadeControl();
    syncShadeDirectionControl();
    syncShadowControl();
    syncTabsScaleControl();
  };

  const updateThemeToken = (token, value, options = {}) => {
    if (!token) {
      return false;
    }

    const trimmedValue = typeof value === 'string' ? value.trim() : value;
    if (!trimmedValue && trimmedValue !== 0) {
      delete themeOverrides[token];
      if (token === '--color-accent') {
        delete themeOverrides['--color-accent-muted'];
        delete themeOverrides['--color-accent-rgb'];
      }
      if (token === '--page-shade-strength') {
        delete themeOverrides['--page-shade-soft'];
        delete themeOverrides['--page-shade-panel'];
      }
    } else {
      let storedValue = trimmedValue;
      if (token === '--page-shade-strength') {
        const numericStrength = clamp(Number(trimmedValue), 0, 1);
        storedValue = numericStrength.toFixed(2);
        themeOverrides['--page-shade-soft'] = computeShadeSoft(numericStrength);
        themeOverrides['--page-shade-panel'] = computeShadePanel(numericStrength);
      }

      themeOverrides[token] = storedValue;
      if (token === '--color-accent') {
        const shadePercent = accentShadeInput ? Number(accentShadeInput.value) : DEFAULT_ACCENT_SHADE;
        const alpha = clamp((Number.isNaN(shadePercent) ? DEFAULT_ACCENT_SHADE : shadePercent) / 100, 0, 1);
        const accentMuted = computeAccentMuted(trimmedValue, alpha || DEFAULT_ACCENT_SHADE / 100);
        if (accentMuted) {
          themeOverrides['--color-accent-muted'] = accentMuted;
        }
        const accentRgb = computeAccentRgb(trimmedValue);
        if (accentRgb) {
          themeOverrides['--color-accent-rgb'] = accentRgb;
        }
      }
    }

    applyThemeOverrides(themeOverrides);
    const saved = saveThemeOverrides(themeOverrides);
    syncThemeField(token);
    if (token === '--color-accent') {
      syncThemeField('--color-accent-muted');
      syncAccentShadeControl();
    }
    if (token === '--page-shade-strength') {
      syncBackgroundShadeControl();
    }
    if (token === '--page-shade-direction') {
      syncShadeDirectionControl();
    }
    if (token === '--color-accent-muted') {
      syncAccentShadeControl();
    }
    if (token === '--shadow-elevated') {
      syncShadowControl();
    }
    if (token === '--tabs-size-scale') {
      syncTabsScaleControl();
    }
    renderOutput();
    if (statusOutput && !options.silent) {
      const successMessage = options.message || 'Theme colors updated. Refresh the home page to preview changes.';
      const failureMessage =
        options.failureMessage ||
        'Theme updated for this session, but the browser blocked saving the change.';
      statusOutput.textContent = saved ? successMessage : failureMessage;
    }

    return saved;
  };

  themeTextInputs.forEach((input) => {
    input.addEventListener('input', () => {
      updateThemeToken(input.dataset.themeToken, input.value);
    });
  });

  themePickers.forEach((picker, token) => {
    picker.addEventListener('input', () => {
      const hexValue = toFullHex(picker.value);
      const textInput = document.querySelector(`[data-theme-token="${token}"]`);
      if (textInput instanceof HTMLInputElement && hexValue) {
        textInput.value = hexValue;
      }
      updateThemeToken(token, hexValue || picker.value);
    });
  });

  accentShadeInput?.addEventListener('input', () => {
    const rawValue = Number(accentShadeInput.value);
    const percent = clamp(Number.isNaN(rawValue) ? DEFAULT_ACCENT_SHADE : rawValue, 5, 60);
    accentShadeInput.value = String(percent);
    updateAccentShadeValue(percent);
    const accentColor = getThemeValue('--color-accent');
    const accentMuted = computeAccentMuted(accentColor, clamp(percent / 100, 0, 1));
    if (accentMuted) {
      updateThemeToken('--color-accent-muted', accentMuted, {
        message: 'Accent shading updated. Refresh the home page to preview changes.'
      });
    }
  });

  backgroundShadeInput?.addEventListener('input', () => {
    const rawValue = Number(backgroundShadeInput.value);
    const percent = clamp(Number.isNaN(rawValue) ? DEFAULT_BACKGROUND_SHADE : rawValue, 0, 60);
    backgroundShadeInput.value = String(percent);
    if (backgroundShadeValue) {
      backgroundShadeValue.textContent = `${percent}%`;
    }
    const strength = clamp(percent / 100, 0, 0.6);
    updateThemeToken('--page-shade-strength', strength, {
      message: 'Background shading updated. Refresh the home page to preview changes.'
    });
  });

  const handleShadeDirectionSelection = (direction) => {
    const nextDirection = direction && direction.trim() ? direction.trim() : DEFAULT_SHADE_DIRECTION;
    setActiveShadeDirectionButton(nextDirection);
    updateThemeToken('--page-shade-direction', nextDirection, {
      message: 'Background shading origin updated. Refresh the home page to preview changes.'
    });
  };

  shadeDirectionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      handleShadeDirectionSelection(button.dataset.shadeDirection || DEFAULT_SHADE_DIRECTION);
    });
  });

  shadowDepthInput?.addEventListener('input', () => {
    const rawValue = Number(shadowDepthInput.value);
    const percent = clamp(Number.isNaN(rawValue) ? DEFAULT_SHADOW_ALPHA : rawValue, 0, 70);
    shadowDepthInput.value = String(percent);
    if (shadowDepthValue) {
      shadowDepthValue.textContent = `${percent}%`;
    }
    const alpha = clamp(percent / 100, 0, 1);
    updateThemeToken('--shadow-elevated', buildShadowValue(alpha), {
      message: 'Shadow depth updated. Refresh the home page to preview changes.'
    });
  });

  tabsScaleInput?.addEventListener('input', () => {
    const rawValue = Number(tabsScaleInput.value);
    const percent = clamp(Number.isNaN(rawValue) ? 100 : rawValue, 85, 125);
    tabsScaleInput.value = String(percent);
    if (tabsScaleValue) {
      tabsScaleValue.textContent = `${percent}%`;
    }
    const scale = Math.round(percent) / 100;
    updateThemeToken('--tabs-size-scale', Number(scale.toFixed(2)), {
      message: 'Navigation tabs resized. Refresh the home page to preview changes.'
    });
  });

  themeResetButton?.addEventListener('click', () => {
    themeOverrides = { ...DEFAULT_THEME_OVERRIDES };
    const cleared = clearThemeOverrides();
    applyThemeOverrides(themeOverrides);
    syncThemeFields();
    renderOutput();
    if (statusOutput) {
      statusOutput.textContent = cleared
        ? 'Theme colors reset to the default palette.'
        : 'Theme reset locally, but stored overrides could not be cleared.';
    }
  });

  const syncForm = (tabKey) => {
    const content = workingCopy[tabKey];
    if (!content) {
      titleInput.value = '';
      if (tabLabelInput) {
        tabLabelInput.value = '';
      }
      bodyInput.value = '';
      if (contactFieldset) {
        contactFieldset.hidden = true;
      }
      return;
    }

    titleInput.value = content.title || '';
    if (tabLabelInput) {
      tabLabelInput.value = content.tabLabel || content.title || '';
    }
    bodyInput.value = formatBodyForInput(content.body || []);

    if (contactFieldset) {
      const isContact = tabKey === 'contact';
      contactFieldset.hidden = !isContact;

      if (isContact) {
        const details = normaliseContactDetails(content.contactDetails || {});
        workingCopy[tabKey].contactDetails = JSON.parse(JSON.stringify(details));
        if (phoneLabelInput) {
          phoneLabelInput.value = details.phoneLabel || '';
        }
        phoneInput.value = details.phoneNumber || '';
        if (emailLabelInput) {
          emailLabelInput.value = details.emailLabel || '';
        }
        emailInput.value = details.emailAddress || '';
        if (subjectInput) {
          subjectInput.value = details.subject || '';
        }
        submittingInput.value = details.submittingMessage || '';
        successInput.value = details.successMessage || '';
        errorInput.value = details.errorMessage || '';
      }
    }

    statusOutput.textContent = '';
  };

  const updateWorkingCopy = (tabKey) => {
    const titleValue = titleInput.value.trim();
    const tabLabelValue = tabLabelInput?.value.trim() || '';
    const bodyValue = bodyInput.value.trim();

    if (!titleValue || !bodyValue) {
      statusOutput.textContent = 'Please complete the title and body before updating the configuration.';
      return false;
    }

    const existingContent = workingCopy[tabKey] || {};
    const nextContent = {
      ...existingContent,
      title: titleValue,
      tabLabel: tabLabelValue || titleValue,
      body: parseInputToBody(bodyValue)
    };

    if (tabKey === 'contact') {
      const phoneLabelValue = phoneLabelInput?.value.trim() || '';
      const phoneValue = phoneInput.value.trim();
      const emailLabelValue = emailLabelInput?.value.trim() || '';
      const emailValue = emailInput.value.trim();
      const subjectValue = subjectInput?.value.trim() || '';

      if (!phoneValue || !emailValue) {
        statusOutput.textContent = 'Please provide both the phone number and contact email for the Contact section.';
        return false;
      }

      const submittingMessage = submittingInput.value.trim() || 'Sending your message…';
      const successMessage = successInput.value.trim() || 'Thank you! We will reply shortly.';
      const errorMessage = errorInput.value.trim() || 'Sorry, something went wrong. Please try again later.';

      nextContent.contactDetails = normaliseContactDetails({
        phoneLabel: phoneLabelValue || undefined,
        phoneNumber: phoneValue,
        emailLabel: emailLabelValue || undefined,
        emailAddress: emailValue,
        submittingMessage,
        successMessage,
        errorMessage,
        subject: subjectValue || undefined
      });
    }

    workingCopy[tabKey] = nextContent;
    return true;
  };

  syncThemeFields();

  const logoFileInput = document.getElementById('manager-logo-file');
  const logoUrlInput = document.getElementById('manager-logo-url');
  const logoAltInput = document.getElementById('manager-logo-alt');
  const logoPreview = document.getElementById('manager-logo-preview');
  const logoRemoveButton = document.getElementById('manager-logo-remove');

  let currentLogo = loadLogoSettings();

  const updateLogoPreview = (logo) => {
    if (!logoPreview) {
      return;
    }

    if (!logo || (!logo.src && !logo.url)) {
      logoPreview.innerHTML = '<p class="content-manager__hint">Preview appears here after upload</p>';
      logoPreview.classList.remove('content-manager__logo-preview--has-image');
      return;
    }

    const imgSrc = logo.src || logo.url;
    const imgAlt = logo.alt || 'Site logo';
    logoPreview.innerHTML = `<img src="${imgSrc}" alt="${imgAlt}" />`;
    logoPreview.classList.add('content-manager__logo-preview--has-image');
  };

  const syncLogoForm = () => {
    if (currentLogo) {
      if (logoUrlInput && currentLogo.url) {
        logoUrlInput.value = currentLogo.url;
      }
      if (logoAltInput && currentLogo.alt) {
        logoAltInput.value = currentLogo.alt;
      }
      updateLogoPreview(currentLogo);
    }
  };

  syncLogoForm();

  logoFileInput?.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const MAX_FILE_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      if (statusOutput) {
        statusOutput.textContent = 'Logo file must be 2 MB or smaller.';
      }
      logoFileInput.value = '';
      return;
    }

    const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!ALLOWED_TYPES.includes(file.type)) {
      if (statusOutput) {
        statusOutput.textContent = 'Logo must be PNG, JPG, SVG, or WebP format.';
      }
      logoFileInput.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      currentLogo = {
        src: base64,
        alt: logoAltInput?.value || 'Site logo',
        type: 'upload'
      };

      const saved = saveLogoSettings(currentLogo);
      updateLogoPreview(currentLogo);

      if (logoUrlInput) {
        logoUrlInput.value = '';
      }

      if (statusOutput) {
        statusOutput.textContent = saved
          ? 'Logo uploaded and saved. Refresh the home page to see it.'
          : 'Logo uploaded but could not be saved to storage.';
      }
    };

    reader.onerror = () => {
      if (statusOutput) {
        statusOutput.textContent = 'Failed to read logo file.';
      }
    };

    reader.readAsDataURL(file);
  });

  logoUrlInput?.addEventListener('blur', () => {
    const url = logoUrlInput.value.trim();
    if (!url) {
      return;
    }

    if (!/^https?:\/\/.+\.(png|jpe?g|svg|webp)$/i.test(url)) {
      if (statusOutput) {
        statusOutput.textContent = 'Logo URL must be a valid image link (PNG, JPG, SVG, or WebP).';
      }
      return;
    }

    currentLogo = {
      url,
      alt: logoAltInput?.value || 'Site logo',
      type: 'url'
    };

    const saved = saveLogoSettings(currentLogo);
    updateLogoPreview(currentLogo);

    if (logoFileInput) {
      logoFileInput.value = '';
    }

    if (statusOutput) {
      statusOutput.textContent = saved
        ? 'Logo URL saved. Refresh the home page to see it.'
        : 'Logo URL set but could not be saved to storage.';
    }
  });

  logoAltInput?.addEventListener('blur', () => {
    if (currentLogo) {
      currentLogo.alt = logoAltInput.value.trim() || 'Site logo';
      saveLogoSettings(currentLogo);
      updateLogoPreview(currentLogo);
    }
  });

  logoRemoveButton?.addEventListener('click', () => {
    currentLogo = null;
    const cleared = clearLogoSettings();

    if (logoFileInput) {
      logoFileInput.value = '';
    }
    if (logoUrlInput) {
      logoUrlInput.value = '';
    }
    if (logoAltInput) {
      logoAltInput.value = '';
    }

    updateLogoPreview(null);

    if (statusOutput) {
      statusOutput.textContent = cleared
        ? 'Logo removed. Refresh the home page to see the change.'
        : 'Logo removed locally but could not clear storage.';
    }
  });

  const companyNameInput = document.getElementById('manager-company-name');
  const companyFontSelect = document.getElementById('manager-company-font');
  const companySizeInput = document.getElementById('manager-company-size');
  const companySizeValue = document.getElementById('manager-company-size-value');
  const companyColorInput = document.getElementById('manager-company-color');
  const companyColorSwatch = document.getElementById('manager-company-color-swatch');
  const companyPreview = document.getElementById('manager-company-preview');
  const companyRemoveButton = document.getElementById('manager-company-remove');

  let currentCompany = loadCompanySettings() || {
    name: '',
    font: "'Inter', sans-serif",
    size: '3rem',
    color: '#f5f7ff'
  };

  const updateCompanyPreview = (company) => {
    if (!companyPreview) {
      return;
    }

    if (!company || !company.name) {
      companyPreview.innerHTML = '<p class="content-manager__hint">Preview appears here after entering company name</p>';
      companyPreview.classList.remove('content-manager__company-preview--has-text');
      return;
    }

    const previewText = document.createElement('span');
    previewText.textContent = company.name;
    previewText.style.fontFamily = company.font || "'Inter', sans-serif";
    previewText.style.fontSize = company.size || '3rem';
    previewText.style.color = company.color || '#f5f7ff';
    previewText.style.fontWeight = '700';
    previewText.style.lineHeight = '1.2';

    companyPreview.innerHTML = '';
    companyPreview.appendChild(previewText);
    companyPreview.classList.add('content-manager__company-preview--has-text');
  };

  const syncCompanyForm = () => {
    if (companyNameInput && currentCompany.name) {
      companyNameInput.value = currentCompany.name;
    }
    if (companyFontSelect && currentCompany.font) {
      companyFontSelect.value = currentCompany.font;
    }
    if (companySizeInput && currentCompany.size) {
      const sizeValue = parseFloat(currentCompany.size);
      companySizeInput.value = String(sizeValue);
      if (companySizeValue) {
        companySizeValue.textContent = currentCompany.size;
      }
    }
    if (companyColorInput && currentCompany.color) {
      companyColorInput.value = currentCompany.color;
      const hexValue = toFullHex(currentCompany.color);
      if (companyColorSwatch && hexValue) {
        companyColorSwatch.value = hexValue;
      }
    }
    updateCompanyPreview(currentCompany);
  };

  syncCompanyForm();

  const saveAndUpdateCompany = () => {
    currentCompany.name = companyNameInput?.value.trim() || '';
    currentCompany.font = companyFontSelect?.value || "'Inter', sans-serif";
    currentCompany.size = companySizeInput ? `${companySizeInput.value}rem` : '3rem';
    currentCompany.color = companyColorInput?.value.trim() || '#f5f7ff';

    const saved = saveCompanySettings(currentCompany);
    updateCompanyPreview(currentCompany);

    if (statusOutput) {
      if (currentCompany.name) {
        statusOutput.textContent = saved
          ? 'Company name saved. Refresh the home page to see it.'
          : 'Company name set but could not be saved to storage.';
      }
    }
  };

  companyNameInput?.addEventListener('input', saveAndUpdateCompany);
  companyFontSelect?.addEventListener('change', saveAndUpdateCompany);

  companySizeInput?.addEventListener('input', () => {
    const size = companySizeInput.value;
    if (companySizeValue) {
      companySizeValue.textContent = `${size}rem`;
    }
    saveAndUpdateCompany();
  });

  companyColorInput?.addEventListener('input', () => {
    const color = companyColorInput.value.trim();
    const hexValue = toFullHex(color);
    if (companyColorSwatch && hexValue) {
      companyColorSwatch.value = hexValue;
    }
    saveAndUpdateCompany();
  });

  companyColorSwatch?.addEventListener('input', () => {
    const hexValue = toFullHex(companyColorSwatch.value);
    if (companyColorInput && hexValue) {
      companyColorInput.value = hexValue;
    }
    saveAndUpdateCompany();
  });

  companyRemoveButton?.addEventListener('click', () => {
    currentCompany = {
      name: '',
      font: "'Inter', sans-serif",
      size: '3rem',
      color: '#f5f7ff'
    };
    const cleared = clearCompanySettings();

    if (companyNameInput) {
      companyNameInput.value = '';
    }
    if (companyFontSelect) {
      companyFontSelect.value = "'Inter', sans-serif";
    }
    if (companySizeInput) {
      companySizeInput.value = '3';
    }
    if (companySizeValue) {
      companySizeValue.textContent = '3rem';
    }
    if (companyColorInput) {
      companyColorInput.value = '#f5f7ff';
    }
    if (companyColorSwatch) {
      companyColorSwatch.value = '#f5f7ff';
    }

    updateCompanyPreview(null);

    if (statusOutput) {
      statusOutput.textContent = cleared
        ? 'Company name removed. Refresh the home page to see the change.'
        : 'Company name removed locally but could not clear storage.';
    }
  });

  tabSelect?.addEventListener('change', () => {
    syncForm(tabSelect.value);
  });

  formElement?.addEventListener('submit', (event) => {
    event.preventDefault();
    const tabKey = tabSelect.value;

    if (updateWorkingCopy(tabKey)) {
      if (saveContentOverrides(workingCopy)) {
        originalContent[tabKey] = JSON.parse(JSON.stringify(workingCopy[tabKey] || {}));
        statusOutput.textContent = 'Preview updated. Refresh the home page to see your changes. They are stored only in this browser.';
      } else {
        statusOutput.textContent = 'Preview updated locally, but changes could not be saved for reuse in this browser.';
      }
      renderOutput();
    }
  });

  resetButton?.addEventListener('click', () => {
    const tabKey = tabSelect.value;
    workingCopy[tabKey] = JSON.parse(JSON.stringify(originalContent[tabKey] || {}));
    syncForm(tabKey);
    statusOutput.textContent = 'Form reset to the saved configuration.';
    renderOutput();
  });

  clearButton?.addEventListener('click', () => {
    const contentCleared = clearContentOverrides();
    const themeCleared = clearThemeOverrides();
    const logoCleared = clearLogoSettings();
    const companyCleared = clearCompanySettings();

    if (contentCleared) {
      Object.keys(workingCopy).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(DEFAULT_CONTENT, key)) {
          workingCopy[key] = JSON.parse(JSON.stringify(DEFAULT_CONTENT[key] || {}));
        } else {
          delete workingCopy[key];
        }
      });

      Object.keys(originalContent).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(DEFAULT_CONTENT, key)) {
          originalContent[key] = JSON.parse(JSON.stringify(DEFAULT_CONTENT[key] || {}));
        } else {
          delete originalContent[key];
        }
      });

      Object.keys(DEFAULT_CONTENT).forEach((key) => {
        if (!Object.prototype.hasOwnProperty.call(workingCopy, key)) {
          workingCopy[key] = JSON.parse(JSON.stringify(DEFAULT_CONTENT[key] || {}));
        }
        if (!Object.prototype.hasOwnProperty.call(originalContent, key)) {
          originalContent[key] = JSON.parse(JSON.stringify(DEFAULT_CONTENT[key] || {}));
        }
      });
    }

    if (themeCleared) {
      themeOverrides = { ...DEFAULT_THEME_OVERRIDES };
      applyThemeOverrides(themeOverrides);
      syncThemeFields();
    }

    if (logoCleared) {
      currentLogo = null;
      if (logoFileInput) {
        logoFileInput.value = '';
      }
      if (logoUrlInput) {
        logoUrlInput.value = '';
      }
      if (logoAltInput) {
        logoAltInput.value = '';
      }
      updateLogoPreview(null);
    }

    if (companyCleared) {
      currentCompany = {
        name: '',
        font: "'Inter', sans-serif",
        size: '3rem',
        color: '#f5f7ff'
      };
      if (companyNameInput) {
        companyNameInput.value = '';
      }
      if (companyFontSelect) {
        companyFontSelect.value = "'Inter', sans-serif";
      }
      if (companySizeInput) {
        companySizeInput.value = '3';
      }
      if (companySizeValue) {
        companySizeValue.textContent = '3rem';
      }
      if (companyColorInput) {
        companyColorInput.value = '#f5f7ff';
      }
      if (companyColorSwatch) {
        companyColorSwatch.value = '#f5f7ff';
      }
      updateCompanyPreview(null);
    }

    if (contentCleared || themeCleared || logoCleared || companyCleared) {
      syncForm(tabSelect.value);
      const messageParts = [];
      if (contentCleared) {
        messageParts.push('Content overrides removed');
      }
      if (themeCleared) {
        messageParts.push('Theme overrides cleared');
      }
      if (logoCleared) {
        messageParts.push('Logo cleared');
      }
      if (companyCleared) {
        messageParts.push('Company name cleared');
      }
      statusOutput.textContent = `${messageParts.join(', ')}. The manager now reflects the default configuration.`;
    } else {
      statusOutput.textContent = 'Unable to clear stored changes. Please check your browser permissions.';
    }

    renderOutput();
  });

  if (tabSelect) {
    syncForm(tabSelect.value);
  }

  renderOutput();
})();
