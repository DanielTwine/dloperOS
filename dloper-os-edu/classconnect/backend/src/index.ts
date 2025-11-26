import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import dotenv from 'dotenv';
import authPlugin from './plugins/auth';
import prismaPlugin from './plugins/prisma';
import authRoutes from './routes/auth';
import classesRoutes from './routes/classes';
import timetableRoutes from './routes/timetable';
import homeworkRoutes from './routes/homework';
import setupRoutes from './routes/setup';
import { Role } from '@prisma/client';

dotenv.config();

const server = Fastify({ logger: true });

server.register(cors, { origin: '*' });
server.register(sensible);
server.register(authPlugin);
server.register(prismaPlugin);

server.get('/health', async () => ({ status: 'ok' }));

server.register(authRoutes, { prefix: '/auth' });
server.register(classesRoutes, { prefix: '/classes' });
server.register(timetableRoutes, { prefix: '/timetable' });
server.register(homeworkRoutes, { prefix: '/homework' });
server.register(setupRoutes, { prefix: '/setup' });

server.get('/dashboard', { preHandler: server.authenticate }, async (request) => {
  const user = request.user;
  const [classCount, homeworkCount, behaviourCount] = await Promise.all([
    server.prisma.class.count({ where: { schoolId: user.schoolId } }),
    server.prisma.homework.count({ where: { class: { schoolId: user.schoolId } } }),
    server.prisma.behaviourEvent.count({ where: { schoolId: user.schoolId } }),
  ]);

  const todaysEntries = await server.prisma.timetableEntry.findMany({
    where: { dayOfWeek: new Date().getDay(), class: { schoolId: user.schoolId } },
    include: { class: true },
  });

  return {
    user,
    stats: {
      classes: classCount,
      homework: homeworkCount,
      behaviourEvents: behaviourCount,
      timetableToday: todaysEntries,
    },
  };
});

const start = async () => {
  const port = Number(process.env.PORT || 4000);
  const host = '0.0.0.0';
  try {
    await server.listen({ port, host });
    server.log.info(`Server running on ${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
