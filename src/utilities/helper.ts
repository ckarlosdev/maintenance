export const getPageNumbers = (
  currentPage: number,
  totalPages: number,
): (number | "...")[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: (number | "...")[] = [];

  const add = (value: number | "...") => {
    // Evita repetir números o "..."
    if (items[items.length - 1] !== value) {
      items.push(value);
    }
  };

  add(1);

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) {
    add("...");
  }

  for (let i = start; i <= end; i++) {
    add(i);
  }

  if (end < totalPages - 1) {
    add("...");
  }

  add(totalPages);

  return items;
};
