export const partialHiddenEmail = (email) => {
  // check if email is string and contains @
  if (typeof email !== "string" || !email.includes("@")) return email;

  // get the email name and domain
  const [name, domain] = email.split("@");

  // get the visible and hidden length;
  const visible = Math.floor(name.length / 2);
  const hidden = name.length - visible;

  return `${name.slice(0, visible)}${"*".repeat(hidden)}@${domain}`;
};
