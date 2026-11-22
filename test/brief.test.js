import { describe, expect, it } from 'vitest';
import { countKey, hasEnough, parseBrief, sourceLine, ticketText } from '../src/lib/brief';

// PAY-163 of scenario 1, as Jira's REST API v2 gives it: no description, one comment by
// Hafiz Omar and one status move. The history comes newest first.
const pay163 = (fields = {}, histories = []) => ({
  key: 'PAY-163',
  fields: {
    summary: 'Send a receipt email after a refund',
    status: { name: 'In Progress' },
    assignee: { displayName: 'Hafiz Omar' },
    description: null,
    issuelinks: [],
    ...fields,
  },
  changelog: {
    histories: [
      ...histories,
      {
        created: '2026-11-23T09:00:00.000+0800',
        author: { displayName: 'Hafiz Omar' },
        items: [{ field: 'status', fromString: 'To Do', toString: 'In Progress' }],
      },
    ],
  },
});
const hafizComment = {
  author: { displayName: 'Hafiz Omar' },
  created: '2026-11-24T10:00:00.000+0800',
  body: 'Receipt template is merged. The mail queue worker is next. Branch feat/pay-163-receipt.',
};
const comment = (day, body) => ({ author: { displayName: 'Nurul Huda' }, created: `2026-11-${day}T10:00:00.000+0800`, body });

describe('ticketText', () => {
  it('gives the head, the comment and the status move of PAY-163', () => {
    const { text, counts, newestCommentAt } = ticketText(pay163(), [hafizComment], []);
    expect(text).toContain('PAY-163: Send a receipt email after a refund');
    expect(text).toContain('Status: In Progress. Assignee: Hafiz Omar.');
    expect(text).toContain(`2026-11-24 Hafiz Omar: ${hafizComment.body}`);
    expect(text).toContain('2026-11-23 Hafiz Omar moved the status from To Do to In Progress.');
    expect(counts).toEqual({ description: false, comments: 1, changes: 1, links: 0 });
    expect(newestCommentAt).toBe('2026-11-24T10:00:00.000+0800');
  });

  it('says Unassigned for a ticket with no assignee', () => {
    expect(ticketText(pay163({ assignee: null }), [hafizComment], []).text).toContain('Assignee: Unassigned.');
  });

  it('cuts the description at 4,000 characters and each comment at 1,000', () => {
    const { text } = ticketText(pay163({ description: 'd'.repeat(5000) }), [comment('25', 'c'.repeat(1500))], []);
    expect(text).toContain(`${'d'.repeat(4000)}\n`);
    expect(text).not.toContain('d'.repeat(4001));
    expect(text).toContain(`Nurul Huda: ${'c'.repeat(1000)}\n`);
    expect(text).not.toContain('c'.repeat(1001));
  });

  it('puts the comments oldest first, from the newest-first answer of Jira', () => {
    const { text, newestCommentAt } = ticketText(pay163(), [comment('26', 'Second'), comment('25', 'First')], []);
    expect(text.indexOf('First')).toBeLessThan(text.indexOf('Second'));
    expect(newestCommentAt).toBe('2026-11-26T10:00:00.000+0800');
  });

  it('keeps only the status and assignee moves of the history, oldest first', () => {
    const issue = pay163({}, [
      {
        created: '2026-11-25T09:00:00.000+0800',
        author: { displayName: 'Nurul Huda' },
        items: [
          { field: 'assignee', fromString: 'Hafiz Omar', toString: 'Aisyah Rahman' },
          { field: 'description', fromString: 'old', toString: 'new' },
        ],
      },
    ]);
    const { text, counts } = ticketText(issue, [], []);
    expect(text).toContain('2026-11-25 Nurul Huda moved the assignee from Hafiz Omar to Aisyah Rahman.');
    expect(text).not.toContain('description from');
    expect(text.indexOf('To Do')).toBeLessThan(text.indexOf('Aisyah Rahman.'));
    expect(counts.changes).toBe(2);
  });

  it('names an empty side of a move as none', () => {
    const issue = pay163({}, [
      { created: '2026-11-25T09:00:00.000+0800', author: { displayName: 'Nurul Huda' }, items: [{ field: 'assignee', fromString: null, toString: 'Aisyah Rahman' }] },
    ]);
    expect(ticketText(issue, [], []).text).toContain('moved the assignee from none to Aisyah Rahman.');
  });

  it('lists the issue links and the web links', () => {
    const issue = pay163({
      issuelinks: [
        { type: { outward: 'blocks' }, outwardIssue: { key: 'PAY-170', fields: { summary: 'Rotate the webhook secret', status: { name: 'To Do' } } } },
        { type: { inward: 'is blocked by' }, inwardIssue: { key: 'PAY-142', fields: { summary: 'Add refund endpoint', status: { name: 'Done' } } } },
      ],
    });
    const web = [{ object: { title: 'Receipt design', url: 'https://example.sharepoint.com/receipt' } }];
    const { text, counts } = ticketText(issue, [], web);
    expect(text).toContain('blocks PAY-170 "Rotate the webhook secret" (To Do)');
    expect(text).toContain('is blocked by PAY-142 "Add refund endpoint" (Done)');
    expect(text).toContain('Receipt design: https://example.sharepoint.com/receipt');
    expect(counts.links).toBe(3);
  });
});

describe('hasEnough', () => {
  it('is false for a ticket with no description, no comments and no links', () => {
    expect(hasEnough(pay163({ description: '  ' }), [], [])).toBe(false);
  });

  it('is true for a description, a comment or a link', () => {
    expect(hasEnough(pay163({ description: 'Send the receipt.' }), [], [])).toBe(true);
    expect(hasEnough(pay163(), [hafizComment], [])).toBe(true);
    expect(hasEnough(pay163(), [], [{ object: { title: 'Design', url: 'https://example.com' } }])).toBe(true);
    expect(hasEnough(pay163({ issuelinks: [{ type: { outward: 'blocks' }, outwardIssue: { key: 'PAY-170', fields: {} } }] }), [], [])).toBe(true);
  });
});

describe('parseBrief', () => {
  const answer = '{"done": "Receipt template is merged.", "next": "The mail queue worker.", "watchOut": null, "code": "feat/pay-163-receipt"}';
  const brief = { done: 'Receipt template is merged.', next: 'The mail queue worker.', watchOut: null, code: 'feat/pay-163-receipt' };

  it('reads the JSON answer', () => {
    expect(parseBrief(answer)).toEqual(brief);
  });

  it('reads an answer in a code fence, given as a list of parts, as the spike saw', () => {
    expect(parseBrief([{ type: 'text', text: `\`\`\`json\n${answer}\n\`\`\`` }])).toEqual(brief);
  });

  it('cuts a text at 300 characters, and gives null for an empty text', () => {
    const long = JSON.stringify({ done: 'x'.repeat(400), next: '  ', watchOut: null, code: null });
    expect(parseBrief(long)).toEqual({ done: 'x'.repeat(300), next: null, watchOut: null, code: null });
  });

  it('gives null for an answer that is not JSON, misses a key, or has a wrong type', () => {
    expect(parseBrief('I cannot help with that.')).toBeNull();
    expect(parseBrief('{"done": "Merged", "next": null, "watchOut": null}')).toBeNull();
    expect(parseBrief('{"done": 3, "next": null, "watchOut": null, "code": null}')).toBeNull();
    expect(parseBrief('[1, 2]')).toBeNull();
    expect(parseBrief(undefined)).toBeNull();
  });
});

describe('sourceLine', () => {
  const now = '2026-11-26T02:00:00.000Z';

  it('names the comment, the change and the age of the newest comment', () => {
    expect(sourceLine({ description: false, comments: 1, changes: 1, links: 0 }, '2026-11-24T10:00:00.000+0800', now)).toBe(
      'Built by AI from 1 comment and 1 change. Newest comment 2 days ago.'
    );
  });

  it('names each part that the ticket has', () => {
    expect(sourceLine({ description: true, comments: 3, changes: 2, links: 1 }, '2026-11-26T09:55:00.000+0800', now)).toBe(
      'Built by AI from the description, 3 comments, 2 changes and 1 link. Newest comment 5 min ago.'
    );
  });

  it('leaves out the newest comment when the ticket has none', () => {
    expect(sourceLine({ description: true, comments: 0, changes: 0, links: 0 }, null, now)).toBe('Built by AI from the description.');
  });
});

describe('countKey', () => {
  it('gives one key for each UTC day', () => {
    expect(countKey('2026-11-26T15:00:00.000Z')).toBe('briefs:2026-11-26');
    expect(countKey('2026-11-27T00:05:00.000Z')).toBe('briefs:2026-11-27');
  });
});
