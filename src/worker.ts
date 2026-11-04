import { handleChat, type ChatEnv } from './server/chat.ts';
export { ChatQuota } from './server/quota.ts';

interface Env extends ChatEnv { ASSETS: { fetch(request: Request): Promise<Response> }; }

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    if (new URL(request.url).pathname.startsWith('/api/')) return handleChat(request, env);
    return env.ASSETS.fetch(request);
  },
};
