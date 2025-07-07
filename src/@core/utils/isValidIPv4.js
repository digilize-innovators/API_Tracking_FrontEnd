const isValidIPv4 = (ip) => {
  if (typeof ip !== "string") return false;
  const parts = ip.split(".");
  if (parts.length !== 4) return false;

  return parts.every((part) => {
    const num = Number(part);
    return (
      part === String(num) &&
      num >= 0 &&
      num <= 255
    );
  });
};
export default isValidIPv4  