export const getFormattedDateTime = (): string => {
  const now = new Date();
  return `${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString('en-GB')}`;
}
