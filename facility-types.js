/* Shared facility catalog + registry for feedback + admin pages */
(function (global) {
  const STORAGE_KEY = 'rsgFacilityRegistry_v1';
  const SETTINGS_KEY = 'rsgFacilitySettings_v1';

  const FACILITY_TYPES = {
    PR: {
      code: 'PR',
      name: 'Prayer Room',
      icon: '<path d="M4 20V9l8-5 8 5v11"/><path d="M9 21v-8h6v8"/>',
      improve: ['Cleanliness', 'Odor', 'Wudu Area', 'Prayer Mats', 'Temperature', 'Lighting', 'Supplies', 'Accessibility']
    },
    RES: {
      code: 'RES',
      name: 'Restaurant',
      icon: '<path d="M4 3v7a4 4 0 0 0 4 4h0V21"/><path d="M16 3v18"/><path d="M16 8h3a2 2 0 0 1 0 4h-3"/>',
      improve: ['Food Quality', 'Food Temperature', 'Service', 'Waiting Time', 'Cleanliness', 'Seating', 'Menu Availability', 'Atmosphere']
    },
    CAF: {
      code: 'CAF',
      name: 'Coffee / Café',
      icon: '<path d="M4 8h12v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8z"/><path d="M16 10h2a2.5 2.5 0 0 1 0 5h-2"/><path d="M7 4v2"/><path d="M11 4v2"/>',
      improve: ['Drink Quality', 'Drink Temperature', 'Service', 'Waiting Time', 'Cleanliness', 'Seating', 'Product Availability', 'Atmosphere']
    },
    REC: {
      code: 'REC',
      name: 'Reception',
      icon: '<path d="M3 21h18"/><path d="M5 21V10l7-5 7 5v11"/><path d="M9 21v-6h6v6"/><circle cx="12" cy="11" r="1.2"/>',
      improve: ['Waiting Time', 'Staff Service', 'Information', 'Check-in/out', 'Queue', 'Cleanliness', 'Seating', 'Privacy']
    },
    GYM: {
      code: 'GYM',
      name: 'Gym',
      icon: '<path d="M6 8h12"/><path d="M6 16h12"/><path d="M4 10v4"/><path d="M20 10v4"/><path d="M8 8v8"/><path d="M16 8v8"/>',
      improve: ['Cleanliness', 'Equipment', 'Equipment Availability', 'Temperature', 'Odor', 'Towels', 'Changing Room', 'Water']
    },
    WC: {
      code: 'WC',
      name: 'Restroom',
      icon: '<path d="M8 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/><path d="M16 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/><path d="M6 10h4v10H6z"/><path d="M14 10h4l-1 10h-2z"/>',
      improve: ['Cleanliness', 'Odor', 'Toilet Paper', 'Soap', 'Hand Dryer', 'Water', 'Fixtures', 'Accessibility']
    },
    WALK: {
      code: 'WALK',
      name: 'Walking Path',
      icon: '<circle cx="12" cy="5" r="2"/><path d="M10 22l2-8 2 8"/><path d="M8 12h8"/><path d="M9 16h6"/>',
      improve: ['Cleanliness', 'Lighting', 'Surface Condition', 'Signage', 'Seating', 'Shade', 'Safety', 'Accessibility']
    },
    MR: {
      code: 'MR',
      name: 'Meeting Room',
      icon: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 9h4"/><path d="M7 12h6"/>',
      improve: ['Cleanliness', 'Temperature', 'AV Equipment', 'Wi-Fi', 'Lighting', 'Seating', 'Noise', 'Room Setup']
    },
    ROOM: {
      code: 'ROOM',
      name: 'Hotel Room',
      icon: '<path d="M3 21V10l9-6 9 6v11"/><path d="M9 21v-7h6v7"/><path d="M3 14h18"/>',
      improve: ['Cleanliness', 'Temperature', 'Bed Comfort', 'Bathroom', 'Noise', 'Amenities', 'Maintenance', 'Housekeeping']
    },
    BUG: {
      code: 'BUG',
      name: 'Buggy',
      icon: '<path d="M4 15h12l3-5H8l-2 5z"/><circle cx="8" cy="17" r="2"/><circle cx="15" cy="17" r="2"/><path d="M4 15V9a2 2 0 0 1 2-2h3"/>',
      improve: ['Waiting Time', 'Driver Service', 'Cleanliness', 'Comfort', 'Driving', 'Availability', 'Pick-up Location', 'Vehicle Condition']
    },
    POOL: {
      code: 'POOL',
      name: 'Swimming Pool',
      icon: '<path d="M3 16c2 0 2-1.5 4-1.5S9 16 11 16s2-1.5 4-1.5S17 16 19 16s2-1.5 4-1.5"/><path d="M3 20c2 0 2-1.5 4-1.5S9 20 11 20s2-1.5 4-1.5S17 20 19 20s2-1.5 4-1.5"/><path d="M6 6h8a3 3 0 0 1 3 3v3"/>',
      improve: ['Water Temperature', 'Cleanliness', 'Towels', 'Sunbeds', 'Changing Room', 'Pool Area', 'Service', 'Water Quality']
    },
    SPA: {
      code: 'SPA',
      name: 'Spa / Wellness',
      icon: '<path d="M12 3c2 4 2 7 0 11-2-4-2-7 0-11z"/><path d="M7 10c3 2 5 2 8 0"/><path d="M6 16c4 2 8 2 12 0"/>',
      improve: ['Cleanliness', 'Treatment Quality', 'Staff Service', 'Waiting Time', 'Temperature', 'Odor', 'Privacy', 'Ambience']
    },
    BEACH: {
      code: 'BEACH',
      name: 'Beach',
      icon: '<path d="M3 18c3 0 3-2 6-2s3 2 6 2 3-2 6-2"/><path d="M12 4v6"/><path d="M8 8c2 1 4 1 6 0"/><circle cx="18" cy="7" r="2"/>',
      improve: ['Cleanliness', 'Sunbeds', 'Towels', 'Shade', 'Service', 'Crowding', 'Safety', 'Facilities']
    },
    KIDS: {
      code: 'KIDS',
      name: 'Kids Club',
      icon: '<circle cx="9" cy="7" r="2"/><circle cx="15" cy="7" r="2"/><path d="M6 21v-5a3 3 0 0 1 3-3h0"/><path d="M18 21v-5a3 3 0 0 0-3-3h0"/><path d="M9 13v3"/><path d="M15 13v3"/>',
      improve: ['Cleanliness', 'Staff Service', 'Activities', 'Safety', 'Toys / Equipment', 'Supervision', 'Waiting Time', 'Atmosphere']
    },
    RETAIL: {
      code: 'RETAIL',
      name: 'Retail / Shop',
      icon: '<path d="M4 7h16l-1 13H5L4 7z"/><path d="M8 7V5a4 4 0 0 1 8 0v2"/><path d="M9 11v4"/><path d="M15 11v4"/>',
      improve: ['Product Availability', 'Staff Service', 'Waiting Time', 'Cleanliness', 'Pricing Clarity', 'Queue', 'Atmosphere', 'Opening Hours']
    }
  };

  function defaultSettings() {
    return {
      baseUrl: '', // empty = use current origin + feedback page
      feedbackPath: 'ff.html'
    };
  }

  function loadSettings() {
    try {
      return Object.assign(defaultSettings(), JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'));
    } catch (_) {
      return defaultSettings();
    }
  }

  function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  function loadRegistry() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"facilities":[],"counters":{}}');
      if (!Array.isArray(data.facilities)) data.facilities = [];
      if (!data.counters || typeof data.counters !== 'object') data.counters = {};
      return data;
    } catch (_) {
      return { facilities: [], counters: {} };
    }
  }

  function saveRegistry(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function nextId(typeCode) {
    const reg = loadRegistry();
    const n = (reg.counters[typeCode] || 0) + 1;
    reg.counters[typeCode] = n;
    saveRegistry(reg);
    return typeCode + '-' + String(n).padStart(3, '0');
  }

  function createFacility(input) {
    const type = FACILITY_TYPES[input.typeCode];
    if (!type) throw new Error('Unknown facility type');
    const id = nextId(type.code);
    const facility = {
      id,
      typeCode: type.code,
      typeName: type.name,
      name: (input.name || type.name).trim(),
      property: (input.property || '').trim(),
      location: (input.location || '').trim(),
      building: (input.building || '').trim(),
      floor: (input.floor || '').trim(),
      zone: (input.zone || '').trim(),
      notes: (input.notes || '').trim(),
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const reg = loadRegistry();
    reg.facilities.unshift(facility);
    saveRegistry(reg);
    return facility;
  }

  function updateFacility(id, patch) {
    const reg = loadRegistry();
    const i = reg.facilities.findIndex(f => f.id === id);
    if (i < 0) return null;
    reg.facilities[i] = Object.assign({}, reg.facilities[i], patch, { updatedAt: new Date().toISOString() });
    saveRegistry(reg);
    return reg.facilities[i];
  }

  function deleteFacility(id) {
    const reg = loadRegistry();
    reg.facilities = reg.facilities.filter(f => f.id !== id);
    saveRegistry(reg);
  }

  function getFacility(id) {
    if (!id) return null;
    return loadRegistry().facilities.find(f => f.id.toUpperCase() === String(id).toUpperCase()) || null;
  }

  function resolveFromCode(id) {
    const fac = getFacility(id);
    if (fac) return fac;
    if (!id) return null;
    const prefix = String(id).split('-')[0].toUpperCase();
    const type = FACILITY_TYPES[prefix];
    if (!type) return null;
    return {
      id: String(id).toUpperCase(),
      typeCode: type.code,
      typeName: type.name,
      name: type.name,
      property: '',
      location: '',
      building: '',
      floor: '',
      zone: '',
      notes: '',
      active: true,
      ephemeral: true
    };
  }

  function feedbackBaseUrl() {
    const settings = loadSettings();
    if (settings.baseUrl) return settings.baseUrl.replace(/\/$/, '');
    const path = location.pathname.replace(/[^/]*$/, '') + (settings.feedbackPath || 'ff.html');
    return location.origin + path;
  }

  function urlsFor(facilityId) {
    const base = feedbackBaseUrl();
    const id = encodeURIComponent(facilityId);
    // Pretty path when base is a domain/root (production): /f/PR-001?s=qr
    // Query-string when base is an .html page (local / static hosting)
    const usePretty = !/\.html?($|\?)/i.test(base) && !/ff\.html/i.test(base) && !/facility-feedback/i.test(base);
    if (usePretty) {
      return {
        qr: base + '/f/' + id + '?s=qr',
        nfc: base + '/f/' + id + '?s=nfc'
      };
    }
    const join = base.includes('?') ? '&' : '?';
    return {
      qr: base + join + 'f=' + id + '&s=qr',
      nfc: base + join + 'f=' + id + '&s=nfc'
    };
  }

  function parseFeedbackParams() {
    const params = new URLSearchParams(location.search);
    let f = params.get('f') || params.get('id') || '';
    let s = (params.get('s') || params.get('source') || '').toLowerCase();

    // Support /f/PR-001 path (needs server rewrite to this page)
    const pathMatch = location.pathname.match(/\/f\/([^/]+)\/?$/i);
    if (pathMatch) f = f || pathMatch[1];

    // Support hash form: #/f/PR-001?s=qr
    const hash = (location.hash || '').replace(/^#\/?/, '');
    const m = hash.match(/^f\/([^/?]+)(?:\?(.*))?$/i);
    if (m) {
      f = f || m[1];
      if (m[2]) {
        const hp = new URLSearchParams(m[2]);
        s = s || (hp.get('s') || '').toLowerCase();
      }
    }
    if (s !== 'qr' && s !== 'nfc') s = s || 'web';
    return { facilityId: (f || '').toUpperCase(), source: s };
  }

  function improveOptions(typeCode) {
    const type = FACILITY_TYPES[typeCode];
    return type ? type.improve.slice() : [];
  }

  global.FacilityKit = {
    FACILITY_TYPES,
    STORAGE_KEY,
    loadSettings,
    saveSettings,
    loadRegistry,
    saveRegistry,
    createFacility,
    updateFacility,
    deleteFacility,
    getFacility,
    resolveFromCode,
    urlsFor,
    feedbackBaseUrl,
    parseFeedbackParams,
    improveOptions
  };
})(window);
