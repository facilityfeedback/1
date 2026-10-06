/* Supabase client + helpers for facility feedback */
(function (global) {
  const SUPABASE_URL = 'https://wsnuleddniakgiajyifq.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_-hc-gAPVpbHbM_jpG75tnQ_lGAlcuDD';
  const SESSION_KEY = 'rsgFacilityAdminSession_v1';

  let client = null;

  function getClient() {
    if (client) return client;
    if (!global.supabase || !SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
    client = global.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return client;
  }

  function rowToFacility(row) {
    if (!row) return null;
    return {
      id: row.id,
      typeCode: row.type_code,
      typeName: row.type_name,
      name: row.name,
      property: row.property || '',
      location: row.location || '',
      building: row.building || '',
      floor: row.floor || '',
      zone: row.zone || '',
      notes: row.notes || '',
      active: row.active !== false,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  function getSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (!s || !s.token) return null;
      if (s.expiresAt && new Date(s.expiresAt).getTime() < Date.now()) {
        clearSession();
        return null;
      }
      return s;
    } catch (_) {
      return null;
    }
  }

  function saveSession(s) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function requireToken() {
    const s = getSession();
    if (!s || !s.token) throw new Error('Please sign in again');
    return s.token;
  }

  async function login(username, password) {
    const sb = getClient();
    if (!sb) throw new Error('Supabase is not configured');
    const { data, error } = await sb.rpc('admin_login', {
      p_username: username,
      p_password: password
    });
    if (error) throw error;
    if (!data || !data.ok) throw new Error((data && data.error) || 'Login failed');
    const session = {
      token: data.token,
      username: data.username,
      displayName: data.display_name || data.username,
      expiresAt: data.expires_at
    };
    saveSession(session);
    return session;
  }

  async function verifySession() {
    const s = getSession();
    if (!s) return null;
    const sb = getClient();
    if (!sb) return null;
    const { data, error } = await sb.rpc('admin_verify_session', { p_token: s.token });
    if (error || !data || !data.ok) {
      clearSession();
      return null;
    }
    const next = {
      token: s.token,
      username: data.username,
      displayName: data.display_name || data.username,
      expiresAt: data.expires_at
    };
    saveSession(next);
    return next;
  }

  async function logout() {
    const s = getSession();
    const sb = getClient();
    if (s && sb) {
      try { await sb.rpc('admin_logout', { p_token: s.token }); } catch (_) {}
    }
    clearSession();
  }

  async function changePassword(currentPassword, newPassword) {
    const sb = getClient();
    if (!sb) throw new Error('Supabase is not configured');
    const token = requireToken();
    const { data, error } = await sb.rpc('admin_change_password', {
      p_token: token,
      p_current_password: currentPassword,
      p_new_password: newPassword
    });
    if (error) throw error;
    if (!data || !data.ok) throw new Error((data && data.error) || 'Could not change password');
    return true;
  }

  async function listFacilities() {
    const sb = getClient();
    if (!sb) throw new Error('Supabase is not configured');
    const { data, error } = await sb
      .from('facilities')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(rowToFacility);
  }

  async function getFacility(id) {
    const sb = getClient();
    if (!sb || !id) return null;
    const { data, error } = await sb
      .from('facilities')
      .select('*')
      .eq('id', String(id).toUpperCase())
      .maybeSingle();
    if (error) throw error;
    return rowToFacility(data);
  }

  async function createFacility(input) {
    const sb = getClient();
    if (!sb) throw new Error('Supabase is not configured');
    const token = requireToken();
    const { data, error } = await sb.rpc('admin_create_facility', {
      p_token: token,
      p_type_code: input.typeCode,
      p_name: input.name || '',
      p_property: input.property || null,
      p_location: input.location || null,
      p_building: input.building || null,
      p_floor: input.floor || null,
      p_zone: input.zone || null,
      p_notes: input.notes || null
    });
    if (error) throw error;
    return rowToFacility(data);
  }

  async function deleteFacility(id) {
    const sb = getClient();
    if (!sb) throw new Error('Supabase is not configured');
    const token = requireToken();
    const { data, error } = await sb.rpc('admin_delete_facility', {
      p_token: token,
      p_id: id
    });
    if (error) throw error;
    if (data && data.ok === false) throw new Error(data.error || 'Delete failed');
  }

  async function upsertFacility(facility) {
    const sb = getClient();
    if (!sb) throw new Error('Supabase is not configured');
    const token = requireToken();
    const { data, error } = await sb.rpc('admin_upsert_facility', {
      p_token: token,
      p_id: facility.id,
      p_type_code: facility.typeCode,
      p_type_name: facility.typeName || facility.typeCode,
      p_name: facility.name,
      p_property: facility.property || null,
      p_location: facility.location || null,
      p_building: facility.building || null,
      p_floor: facility.floor || null,
      p_zone: facility.zone || null,
      p_notes: facility.notes || null,
      p_active: facility.active !== false
    });
    if (error) throw error;
    return rowToFacility(data);
  }

  async function updateFacility(facility) {
    return upsertFacility(facility);
  }

  function rowToResponse(row) {
    if (!row) return null;
    return {
      id: row.id,
      createdAt: row.created_at,
      facilityId: row.facility_id,
      facilityType: row.facility_type,
      facilityTypeName: row.facility_type_name,
      facilityName: row.facility_name,
      property: row.property || '',
      location: row.location || '',
      building: row.building || '',
      floor: row.floor || '',
      zone: row.zone || '',
      source: row.source || 'web',
      rating: row.rating,
      issues: Array.isArray(row.issues) ? row.issues : (row.issues || []),
      comment: row.comment || '',
      submittedAt: row.submitted_at || row.created_at
    };
  }

  async function listResponses(opts) {
    const sb = getClient();
    if (!sb) throw new Error('Supabase is not configured');
    const token = requireToken();
    const options = opts || {};
    const { data, error } = await sb.rpc('admin_list_responses', {
      p_token: token,
      p_limit: options.limit == null ? 2000 : options.limit,
      p_days: options.days == null ? null : options.days,
      p_facility_id: options.facilityId || null
    });
    if (error) throw error;
    return (data || []).map(rowToResponse);
  }

  async function submitFeedback(payload) {
    const sb = getClient();
    if (!sb) throw new Error('Supabase is not configured');
    const row = {
      facility_id: payload.facilityId,
      facility_type: payload.facilityType || null,
      facility_type_name: payload.facilityTypeName || null,
      facility_name: payload.facilityName || null,
      property: payload.property || null,
      location: payload.location || null,
      building: payload.building || null,
      floor: payload.floor || null,
      zone: payload.zone || null,
      source: payload.source || 'web',
      rating: payload.rating,
      issues: payload.issues || [],
      comment: payload.comment || null,
      user_agent: payload.userAgent || null,
      page_url: payload.pageUrl || null,
      submitted_at: payload.submittedAt || new Date().toISOString(),
      raw_payload: payload
    };
    const { error } = await sb.from('facility_feedback_responses').insert(row);
    if (error) throw error;
  }

  global.FacilitySupabase = {
    SUPABASE_URL,
    getClient,
    getSession,
    clearSession,
    login,
    logout,
    verifySession,
    changePassword,
    listFacilities,
    getFacility,
    createFacility,
    upsertFacility,
    updateFacility,
    deleteFacility,
    listResponses,
    submitFeedback
  };
})(window);
