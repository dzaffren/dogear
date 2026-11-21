// An MCP client for the e2e tests. It calls the app's tools through Atlassian's MCP server,
// as an agent does, with the login that `npm run e2e:mcp-login` saved (D15).
import { readFileSync, writeFileSync } from 'node:fs';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const APP_ID = readFileSync('manifest.yml', 'utf8').match(/ari:cloud:ecosystem::app\/([0-9a-f-]+)/)[1];
export const MCP_URL = `https://mcp.atlassian.com/forge/${APP_ID}`;
export const REDIRECT_URL = 'http://localhost:4752/callback';

// In the development environment, each tool name ends in this.
const TOOL_SUFFIX = '_development';

const STATE = 'e2e/.auth/mcp.json';

const read = () => {
  try {
    return JSON.parse(readFileSync(STATE, 'utf8'));
  } catch {
    return {};
  }
};

const write = (part) => writeFileSync(STATE, JSON.stringify({ ...read(), ...part }, null, 2));

// The SDK registers the client, keeps the tokens and refreshes them through this provider.
// A test gets no redirect handler, so an expired login fails with the fix in the message.
export const authProvider = (onRedirect) => ({
  get redirectUrl() {
    return REDIRECT_URL;
  },
  get clientMetadata() {
    return {
      client_name: 'Stand Note e2e tests',
      redirect_uris: [REDIRECT_URL],
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      token_endpoint_auth_method: 'none',
    };
  },
  clientInformation: () => read().clientInformation,
  saveClientInformation: (clientInformation) => write({ clientInformation }),
  tokens: () => read().tokens,
  saveTokens: (tokens) => write({ tokens }),
  saveCodeVerifier: (codeVerifier) => write({ codeVerifier }),
  codeVerifier: () => read().codeVerifier,
  redirectToAuthorization: (url) => {
    if (!onRedirect) throw new Error('The MCP login expired. Run npm run e2e:mcp-login.');
    onRedirect(url);
  },
});

// Calls one tool and returns the text of its reply.
export const callTool = async (name, args) => {
  const client = new Client({ name: 'stand-note-e2e', version: '1.0.0' });
  await client.connect(new StreamableHTTPClientTransport(new URL(MCP_URL), { authProvider: authProvider() }));
  try {
    const result = await client.callTool({ name: name + TOOL_SUFFIX, arguments: args });
    return result.content.map((part) => part.text).join('\n');
  } finally {
    await client.close();
  }
};
