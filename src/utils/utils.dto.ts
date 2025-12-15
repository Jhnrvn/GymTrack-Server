export type BuildEmail = {
  to: string;
  subject: string;
  html: string;
  attachments?: { path: string; filename: string; cid: string }[];
};
