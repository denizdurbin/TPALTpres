import { defineConfig } from 'astro/config';
import mermaid from 'astro-mermaid';

const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
const owner = process.env.GITHUB_REPOSITORY_OWNER;


export default defineConfig({
  site: owner ? `https://${owner}.github.io` : undefined,
  base: repo ? `/${repo}` : undefined,
  integrations: [
    mermaid({
      theme: 'dark',
      autoTheme: false,
      enableLog: false,
    }),
  ],
});