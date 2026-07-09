// Consistent API response envelope.
export function ok(res, data, meta) {
  return res.json({ success: true, data, ...(meta ? { meta } : {}) });
}

export function created(res, data) {
  return res.status(201).json({ success: true, data });
}

export function fail(res, status, message, code) {
  return res.status(status).json({ success: false, error: { message, code } });
}
