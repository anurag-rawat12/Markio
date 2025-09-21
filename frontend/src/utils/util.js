export const getInitials = (fullName, fallback = 'T') => {
  if (!fullName) return fallback;
  return fullName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
};