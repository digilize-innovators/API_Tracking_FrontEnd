// utils/sorting.js

// Supports nested keys like "user.name" or "items[0].price"
export const getValueByPath = (obj, path) => {
  return path.split('.').reduce((acc, part) => {
    const match = part.match(/^(\w+)\[(\d+)\]$/);
    if (match) {
      const [, arrayKey, index] = match;
      return acc?.[arrayKey]?.[parseInt(index, 10)];
    }
    return acc?.[part];
  }, obj);
};

// Main sorting function
export const sortData = (data, path, direction = 'asc') => {
  return [...data].sort((a, b) => {
    if (isDateField(path)) {
      return sortByDate(a[path], b[path], direction);
    }
    return sortByValue(a, b, path, direction);
  });
};

// You can customize which fields are treated as dates
const isDateField = (path) => {
  const dateFields = ['updated_at', 'created_at', 'timestamp']; // Extend as needed
  return dateFields.includes(path);
};

const sortByDate = (dateA, dateB, direction) => {
  const timeA = new Date(dateA).getTime();
  const timeB = new Date(dateB).getTime();
  return direction === 'asc' ? timeA - timeB : timeB - timeA;
};

const sortByValue = (a, b, path, direction) => {
  const aValue = getValueByPath(a, path);
  const bValue = getValueByPath(b, path);

  if (aValue === bValue) return 0;
  if (aValue == null) return 1;
  if (bValue == null) return -1;

  return (aValue > bValue ? 1 : -1) * (direction === 'asc' ? 1 : -1);
};
