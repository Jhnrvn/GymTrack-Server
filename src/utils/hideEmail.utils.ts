export const partialHiddenEmail = (email: string): string => {
  // check if email is string and contains @
  if (typeof email !== "string" || !email.includes("@") || !email) return email;

  type emailTuple = [string, string];

  // split email into name and domain
  const splitEmail = email.split("@") as emailTuple;
  const [name, domain] = splitEmail;

  // get the visible and hidden length;
  const visible = Math.floor(name.length / 2);
  const hidden = name.length - visible;

  return `${name.slice(0, visible)}${"*".repeat(hidden)}@${domain}`;
};
