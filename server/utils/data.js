export function parseJsonOrValue(value, defaultValue) {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }
  
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      // not valid JSON, return as is (could be simple value)
      return value;
    }
  }
  return value;
}
