import 'dotenv/config';

import { env } from '#/infrastructure/config/env';

const isLocal = env.NODE_ENV === 'dev';

if (isLocal) {
    import('#/main/adapters/local-server.js')
        .then(async ({ startLocalServer }) => {
            await startLocalServer();
        })
        .catch(error => {
            console.error('Failed to start server:', error);
            process.exit(1);
        });
}

export { handler } from '#/main/adapters/lambda';
