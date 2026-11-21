// Saves the MCP login of the main account for the e2e tests. Run it once, and again when
// the login expires: open the link it prints, sign in as the main account, and approve.
import { createServer } from 'node:http';
import { auth } from '@modelcontextprotocol/sdk/client/auth.js';
import { authProvider, MCP_URL, REDIRECT_URL } from './mcp.js';

const code = new Promise((resolve) => {
  const server = createServer((request, response) => {
    const found = new URL(request.url, REDIRECT_URL).searchParams.get('code');
    response.end(found ? 'Signed in. You can close this tab.' : '');
    if (found) {
      server.close();
      resolve(found);
    }
  }).listen(new URL(REDIRECT_URL).port);
});

const provider = authProvider((url) => console.log(`Open this link and sign in as the main account:\n\n${url}\n`));
if ((await auth(provider, { serverUrl: MCP_URL })) === 'REDIRECT') {
  await auth(provider, { serverUrl: MCP_URL, authorizationCode: await code });
}
console.log('Saved the MCP login to e2e/.auth/mcp.json.');
process.exit(0);
