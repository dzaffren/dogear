import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PROPERTY_KEY } from '../src/lib/note';

const KIT = 'docs/design/logo/kit';
const APP_ID = readFileSync('manifest.yml', 'utf8').match(/ari:cloud:ecosystem::app\/([0-9a-f-]+)/)[1];

// The rule lines of a text: each "- " item, with its line breaks and indents made one space.
const rules = (text) =>
  text
    .split(/\n\s*- /)
    .slice(1)
    .map((item) => item.split(/\n\s*\n/)[0].replace(/\s+/g, ' ').trim());
const oneLine = (text) => text.replace(/\s+/g, ' ');

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

  it('is the name of the MCP server in the guide, and the README has no old word', () => {
    expect(readFileSync('GUIDE.md', 'utf8')).toContain(`claude mcp add --transport http dogear https://mcp.atlassian.com/forge/${APP_ID}`);
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

describe("the judge's material", () => {
  it('has the MIT licence that package.json names', () => {
    expect(JSON.parse(readFileSync('package.json', 'utf8')).license).toBe('MIT');
    const licence = readFileSync('LICENSE', 'utf8');
    expect(licence).toMatch(/^MIT License/);
    expect(licence).toContain('Permission is hereby granted, free of charge');
  });

  it('has a skill file that an agent loads, which names the two tools (D36)', () => {
    const skill = readFileSync('skills/dogear/SKILL.md', 'utf8');
    expect(skill).toMatch(/^---\nname: dogear\ndescription: .+\n---\n/);
    expect(skill).toContain('get-dogear');
    expect(skill).toContain('save-dogear');
    expect(rules(skill).length).toBe(5);
  });

  it('has a guide with three parts and the text of one ticket (D35)', () => {
    const guide = readFileSync('GUIDE.md', 'utf8');
    for (const heading of ['## 1. Install', '## 2. Try it in two minutes', '## 3. Connect a coding agent', '## If a step fails']) {
      expect(guide).toContain(heading);
    }
    expect(guide).toContain('Summary: Refund fails on a partial capture');
    expect(oneLine(guide)).toContain('Branch: `fix/partial-capture-refund`');
    expect(guide).toContain('skills/dogear/SKILL.md');
  });

  it('gives the same rule lines in the guide as in the skill file', () => {
    const guide = oneLine(readFileSync('GUIDE.md', 'utf8'));
    for (const rule of rules(readFileSync('skills/dogear/SKILL.md', 'utf8'))) expect(guide).toContain(rule);
  });

  it('is linked from the top of the README, and the rule text has one home', () => {
    const readme = readFileSync('README.md', 'utf8');
    expect(readme.split('<!-- zuko:start')[0]).toContain('(GUIDE.md)');
    expect(readme).toContain('(skills/dogear/SKILL.md)');
    expect(readme).not.toContain('Take the ticket key from the branch name');
  });

  it('has a privacy policy that names what the app stores, and where to ask', () => {
    const privacy = readFileSync('PRIVACY.md', 'utf8');
    expect(privacy).toContain(`\`${PROPERTY_KEY}\``);
    for (const text of ['account ID', 'Forge LLM', 'key-value store', 'https://github.com/dzaffren/dogear/issues']) expect(privacy).toContain(text);
  });

  it('has a script for the production deploy', () => {
    const { scripts } = JSON.parse(readFileSync('package.json', 'utf8'));
    expect(scripts['deploy:prod']).toBe(scripts.deploy.replace('-e development', '-e production'));
  });
});
