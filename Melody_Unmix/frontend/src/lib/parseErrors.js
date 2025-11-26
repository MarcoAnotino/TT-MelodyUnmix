// src/lib/parseErrors.js
export function parseDRFError(error) {
    const data = error?.response?.data || {};
    const fieldErrors = {};
    let general = "";
  
    for (const k of Object.keys(data)) {
      const v = data[k];
      if (Array.isArray(v)) {
        if (k === "non_field_errors" || k === "detail") general = v.join(" ");
        else fieldErrors[k] = v.join(" ");
      } else if (typeof v === "string") {
        if (k === "non_field_errors" || k === "detail") general = v;
        else fieldErrors[k] = v;
      }
    }
  
    if (!general && !Object.keys(fieldErrors).length) {
      general = error?.message || "Ocurrió un error.";
    }
    return { fieldErrors, general };
  }
  