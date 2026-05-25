export const genUsername = (): string => {
  const usernamePrefix = 'user-';
  const randomChars = Math.random().toString(36).slice(2);
  const username = usernamePrefix + randomChars;
  return username;
};

export const genSlug = (title: string): string => {
  const slug = title
    .toLowerCase()
    .trim()
    // remove characters that are not letters, numbers, spaces or hyphens
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  // generate a short random suffix (6 characters)
  const randomChars = Math.random().toString(36).slice(2, 8);

  // ensure the slug is URI friendly
  const slugUri = encodeURIComponent(slug);
  const uniqueSlug = `${slugUri}-${randomChars}`;

  return uniqueSlug;
};
