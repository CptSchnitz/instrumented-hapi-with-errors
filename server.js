'use strict';

const api = require('@opentelemetry/api');
require('./tracer')('example-hapi-server');
const Boom = require('@hapi/boom')

const Hapi = require('@hapi/hapi');

const PORT = 8081;
const server = Hapi.server({
  port: PORT,
  host: 'localhost',
});

async function setUp() {
  server.route([
    {
      method: 'GET',
      path: '/error',
      handler: (req, h) => {
        throw new Error();
      },
    },
    {
      method: 'GET',
      path: '/boom',
      handler: (req, h) => {
        throw Boom.notFound('foo')
      },
    },
  ]);

  server.ext('onRequest', async (request, h) => {
    console.log('No-op Hapi lifecycle extension method');
    const syntheticDelay = 50;
    await new Promise((r) => setTimeout(r, syntheticDelay));
    return h.continue;
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
  console.log(`Listening on http://localhost:${PORT}`);
}


setUp();
process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});
