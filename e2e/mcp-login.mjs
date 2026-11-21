// Saves the MCP login of the main account for the e2e tests. Run it once, and again when
// the login expires: open the link it prints, sign in as the main account, and approve.
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { auth } from '@modelcontextprotocol/sdk/client/auth.js';
import { authProvider, MCP_URL, REDIRECT_URL } from './mcp.js';

// The SDK asks for each scope that the server lists, Confluence and Compass included.
// Atlassian refused a link with only the Jira scopes: "invalid_request".
const STATE = randomUUID();

const code = new Promise((resolve) => {
  const server = createServer((request, response) => {
    const params = new URL(request.url, REDIRECT_URL).searchParams;
    const found = params.get('state') === STATE && params.get('code');
    response.end(found ? 'Signed in. You can close this tab.' : '');
    if (found) {
      server.close();
      resolve(found);
    }
  }).listen(new URL(REDIRECT_URL).port);
});

const provider = {
  ...authProvider((url) => console.log(`Open this link and sign in as the main account:\n\n${url}\n`)),
  state: () => STATE,
};
if ((await auth(provider, { serverUrl: MCP_URL })) === 'REDIRECT') {
  await auth(provider, { serverUrl: MCP_URL, authorizationCode: await code });
}
console.log('Saved the MCP login to e2e/.auth/mcp.json.');
process.exit(0);
