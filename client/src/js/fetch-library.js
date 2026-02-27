export async function fetchListings(filters, page, pageSize, sort) {
  try {
    const response = await fetch("/api/listings", {
      method: "GET",
      body: {
        filters: filters,
        page: page,
        pageSize: pageSize,
        sort: sort,
      },
    });
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Error fetching listings:", error);
  }
}
