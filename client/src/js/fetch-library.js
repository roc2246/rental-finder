import * as utilsLibrary from "./utils-library.js";

export async function fetchListings(filters = {}, page = 1, pageSize = 20, sort = {}) {
  try {
    // build query parameters using URLSearchParams to ensure proper encoding
    const params = utilsLibrary.appendParams(arguments);

    const response = await fetch(`/api/listings?${params.toString()}`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching listings:", error);
    throw error;
  }
}
