import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import { FastifyPluginAsync } from 'fastify';
import { Role } from '@prisma/client';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: any;
  }
  interface FastifyRequest {
    user: {
      id: number;
      role: Role;
      schoolId: number;
      email: string;
    };
  }
}

const authPlugin: FastifyPluginAsync = fp(async (fastify) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    fastify.log.warn('JWT_SECRET not set; using insecure default');
  }

  fastify.register(jwt, {
    secret: secret || 'changeme',
  });

  fastify.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });
});

export default authPlugin;
