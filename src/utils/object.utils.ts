export function isKeyOfObject<T extends object>(
  key: string | number | symbol,
  obj: T,
): key is keyof T {
  return key in obj;
}

export function extractJson(content: string) {
  const regex = /\{(?:[^{}]|{[^{}]*})*\}/g;
  const match = content.match(regex);

  if (match) {
    // If we get back pure text it can have invalid carriage returns
    return match[0].replace(/"([^"]*)"/g, (match) =>
      match.replace(/\n/g, '\\n'),
    );
  } else {
    return '';
  }
}
