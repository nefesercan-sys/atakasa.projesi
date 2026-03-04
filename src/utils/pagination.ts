export function getPagination(query: URLSearchParams) {
  const page = parseInt(query.get("page") || "1");
  const limit = parseInt(query.get("limit") || "10");

  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
}
