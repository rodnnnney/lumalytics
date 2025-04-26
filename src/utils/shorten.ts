export const shortenString = (str: string, maxLength: number) => {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength) + '...' + str.substring(str.length - maxLength);
};
