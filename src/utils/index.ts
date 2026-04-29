export const genUsername = (): string => {
  const usernamePrefix = 'user-';
  const randomChars = Math.random().toString(36).slice(2); // Generate a random string of characters
  return usernamePrefix + randomChars;
};
