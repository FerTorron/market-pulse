export const SITE = {
  author: 'Fernando Torrón',
  portfolioUrl: 'https://fertorron.vercel.app/',
  repoUrl: 'https://github.com/FerTorron/market-pulse',
} as const;

/** Link to a file in the repository, on GitHub. */
export const repoFile = (path: string, kind: "file" | "folder" = "file") =>
  `${SITE.repoUrl}/${kind === "folder" ? "tree" : "blob"}/main/${path}`;
