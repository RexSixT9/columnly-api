export const genUsername = (): string => {
  const usernamePrefix = 'user-';
  const randomChars = Math.random().toString(36).slice(2); // Generate a random string of characters
  return usernamePrefix + randomChars;
};

export const genSlug = (title: string): string => {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '');

  const randomChars = Math.random().toString(36).slice(2, 8); // Generate a random string of characters
  return `${slug}-${randomChars}`;
};
