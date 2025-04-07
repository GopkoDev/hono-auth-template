export const generateMailPin = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
