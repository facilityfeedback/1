/* Supabase client + helpers for facility feedback */
(function (global) {
  const SUPABASE_URL = 'https://wsnuleddniakgiajyifq.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_-hc-gAPVpbHbM_jpG75tnQ_lGAlcuDD';

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

  function facilityToRow(f) {
    return {
      id: f.id,
      type_code: f.typeCode,
      type_name: f.typeName,
      name: f.name,
      property: f.property || null,
      location: f.location || null,
      building: f.building || null,
      floor: f.floor || null,
      zone: f.zone || null,
      notes: f.notes || null,
      active: f.active !== false,
      updated_at: new Date().toISOString()
    };
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

  async function nextFacilityId(typeCode) {
    const sb = getClient();
    if (!sb) throw new Error('Supabase is not configured');
    const prefix = typeCode + '-';
    const { data, error } = await sb
      .from('facilities')
      .select('id')
      .like('id', prefix + '%');
    if (error) throw error;
    let max = 0;
    (data || []).forEach(row => {
      const m = String(row.id).match(/^[A-Z]+-(\d+)$/i);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    });
    return typeCode + '-' + String(max + 1).padStart(3, '0');
  }

  async function createFacility(input) {
    const type = global.FacilityKit && global.FacilityKit.FACILITY_TYPES[input.typeCode];
    if (!type) throw new Error('Unknown facility type');
    const sb = getClient();
    if (!sb) throw new Error('Supabase is not configured');

    const id = await nextFacilityId(type.code);
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
      active: true
    };

    const row = facilityToRow(facility);
    row.created_at = new Date().toISOString();

    const { data, error } = await sb
      .from('facilities')
      .insert(row)
      .select('*')
      .single();
    if (error) throw error;
    return rowToFacility(data);
  }

  async function deleteFacility(id) {
    const sb = getClient();
    if (!sb) throw new Error('Supabase is not configured');
    const { error } = await sb.from('facilities').delete().eq('id', id);
    if (error) throw error;
  }

  async function upsertFacility(facility) {
    const sb = getClient();
    if (!sb) throw new Error('Supabase is not configured');
    const row = facilityToRow(facility);
    if (!row.created_at) row.created_at = facility.createdAt || new Date().toISOString();
    const { data, error } = await sb
      .from('facilities')
      .upsert(row, { onConflict: 'id' })
      .select('*')
      .single();
    if (error) throw error;
    return rowToFacility(data);
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
    listFacilities,
    getFacility,
    createFacility,
    upsertFacility,
    deleteFacility,
    submitFeedback,
    nextFacilityId
  };
})(window);
