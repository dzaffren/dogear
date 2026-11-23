import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const KIT = 'docs/design/logo/kit';

const files = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)]
  );

// The stored property and the three module keys keep the old word, so that each note and
// each module from before the rename stays (D4, D29). Nobody sees them.
const KEPT = [/PROPERTY_KEY = 'stand-note'/, /^\s*- key: stand-notes?-(panel|page|mcp)$/];

const oldWord = (file) =>
  readFileSync(file, 'utf8')
    .split('\n')
    .filter((line) => /stand[ -]?notes?/i.test(line) && !KEPT.some((kept) => kept.test(line)))
    .map((line) => `${file}: ${line.trim()}`);

describe('the word Dogear', () => {
  it('is in each text of the app, with no "stand note" left', () => {
    expect([...files('src'), 'manifest.yml'].flatMap(oldWord)).toEqual([]);
  });

  it('names the two tools of the agent', () => {
    const manifest = readFileSync('manifest.yml', 'utf8');
    expect(manifest).toMatch(/tools:\n\s+- get-dogear\n\s+- save-dogear\n/);
    expect(manifest).toMatch(/name: Dogear\n/);
  });

  it('is the name of the MCP server in the README', () => {
    const readme = readFileSync('README.md', 'utf8');
    expect(readme).toContain('claude mcp add --transport http dogear https://mcp.atlassian.com/forge/');
    expect(oldWord('README.md')).toEqual([]);
  });
});

describe('the icon in Jira', () => {
  it('is the small symbol, bundled with the app, on the panel and on the tab (D38)', () => {
    const manifest = readFileSync('manifest.yml', 'utf8');
    expect(manifest).toMatch(/title: Dogear\n\s+label: Where the work stands\n\s+icon: resource:icons;dogear\.svg\n/);
    expect(manifest).toMatch(/title: Dogears\n\s+icon: resource:icons;dogear\.svg\n/);
    expect(manifest).toMatch(/- key: icons\n\s+path: static\/icons\n/);
    expect(readFileSync('static/icons/dogear.svg', 'utf8')).toBe(readFileSync(join(KIT, 'svg/dogear-symbol-small.svg'), 'utf8'));
  });
});

describe('the brand kit', () => {
  it('has the symbol, the wordmark and the lockups, as SVG and as PNG', () => {
    const names = ['dogear-symbol', 'dogear-symbol-small', 'dogear-wordmark', 'dogear-logo-horizontal', 'dogear-logo-stacked'];
    const pngs = readdirSync(join(KIT, 'png'));
    for (const name of names) {
      expect(existsSync(join(KIT, 'svg', `${name}.svg`)), `${name}.svg`).toBe(true);
      expect(pngs.some((png) => png.startsWith(`${name}-`)), `${name} as PNG`).toBe(true);
    }
  });

  it('has the app icon for a light and for a dark background, and the Devpost thumbnail', () => {
    for (const file of ['png/dogear-app-icon-light-512.png', 'png/dogear-app-icon-dark-512.png', 'png/devpost-thumbnail.png']) {
      expect(existsSync(join(KIT, file)), file).toBe(true);
    }
  });

  it('has guidelines with the colours, the typeface, the tagline and the name beside Jira', () => {
    const guidelines = readFileSync(join(KIT, 'guidelines.md'), 'utf8');
    for (const text of ['#E55F12', '#231A14', '#FFF6EA', 'Montserrat', 'Mark where you stopped.', 'Dogear for Jira']) {
      expect(guidelines).toContain(text);
    }
  });
});
