// One-time site setup for scenario 4 (D10): a project where the test account can view
// tickets but not edit them. Run it again safely; it skips what already exists.
import { jira, mainAccountId } from './jira.js';

process.loadEnvFile('.env');

export const VIEW_ONLY_PROJECT = 'SNV';
const SCHEME_NAME = 'Stand note view-only scheme';

const me = await mainAccountId();
const user = { type: 'user', parameter: me };
const anyLoggedInUser = { type: 'applicationRole' };

const schemes = (await jira('GET', '/rest/api/3/permissionscheme')).permissionSchemes;
let scheme = schemes.find((s) => s.name === SCHEME_NAME);
if (!scheme) {
  scheme = await jira('POST', '/rest/api/3/permissionscheme', {
    name: SCHEME_NAME,
    description: 'Any logged-in user can view. Only the main account can change tickets. For the stand-note e2e tests.',
    permissions: [
      { holder: anyLoggedInUser, permission: 'BROWSE_PROJECTS' },
      ...['BROWSE_PROJECTS', 'CREATE_ISSUES', 'EDIT_ISSUES', 'DELETE_ISSUES', 'ADMINISTER_PROJECTS'].map(
        (permission) => ({ holder: user, permission })
      ),
    ],
  });
  console.log(`Made the permission scheme ${scheme.id}.`);
}

if (!(await jira('GET', `/rest/api/3/project/${VIEW_ONLY_PROJECT}`))) {
  await jira('POST', '/rest/api/3/project', {
    key: VIEW_ONLY_PROJECT,
    name: 'View-only tests',
    projectTypeKey: 'software',
    projectTemplateKey: 'com.pyxis.greenhopper.jira:gh-simplified-kanban-classic',
    leadAccountId: me,
    assigneeType: 'UNASSIGNED',
  });
  console.log(`Made the project ${VIEW_ONLY_PROJECT}.`);
}

await jira('PUT', `/rest/api/3/project/${VIEW_ONLY_PROJECT}/permissionscheme`, { id: scheme.id });
console.log(`${VIEW_ONLY_PROJECT} uses "${SCHEME_NAME}".`);
