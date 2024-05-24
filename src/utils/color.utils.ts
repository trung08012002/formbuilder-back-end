export const randomHexColorCode = () => {
  const n = Math.floor(Math.random() * (0xffffff - 0x7f7f7f) + 0x7f7f7f)
    .toString(16)
    .padStart(6, '0');
  return `#${n.slice(0, 6)}`;
};
