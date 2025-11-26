import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { Role } from '@prisma/client';

const timetableRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/today', { preHandler: fastify.authenticate }, async (request) => {
    const user = request.user;
    const today = new Date();
    const day = today.getDay();

    const entries = await fastify.prisma.timetableEntry.findMany({
      where: {
        dayOfWeek: day,
        ...(user.role === Role.STUDENT
          ? { class: { enrolments: { some: { studentId: user.id } } } }
          : { class: { teacherId: user.id } }),
      },
      include: { class: true },
      orderBy: { startsAt: 'asc' },
    });

    return { entries };
  });

  const addSchema = z.object({
    classId: z.number(),
    dayOfWeek: z.number().min(0).max(6),
    startsAt: z.string(),
    endsAt: z.string(),
    room: z.string().optional(),
  });

  fastify.post('/add', { preHandler: fastify.authenticate }, async (request, reply) => {
    const user = request.user;
    if (user.role === Role.STUDENT) {
      return reply.code(403).send({ error: 'Teachers/Admin only' });
    }
    const parsed = addSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid payload', details: parsed.error.issues });
    }
    const { classId, dayOfWeek, startsAt, endsAt, room } = parsed.data;

    const entry = await fastify.prisma.timetableEntry.create({
      data: {
        classId,
        dayOfWeek,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        room: room || null,
      },
    });

    return { entry };
  });
};

export default timetableRoutes;
