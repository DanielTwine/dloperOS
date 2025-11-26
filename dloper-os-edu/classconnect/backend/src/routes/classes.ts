import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { Role } from '@prisma/client';
import crypto from 'crypto';

const classesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', { preHandler: fastify.authenticate }, async (request) => {
    const user = request.user;

    if (user.role === Role.TEACHER || user.role === Role.ADMIN) {
      const classes = await fastify.prisma.class.findMany({
        where: { teacherId: user.id },
        include: { school: true, enrolments: true },
      });
      return { classes };
    }

    const classes = await fastify.prisma.class.findMany({
      where: { enrolments: { some: { studentId: user.id } } },
      include: { school: true },
    });
    return { classes };
  });

  const createClassSchema = z.object({
    name: z.string().min(2),
    schoolId: z.number(),
  });

  fastify.post('/create', { preHandler: fastify.authenticate }, async (request, reply) => {
    const user = request.user;
    if (user.role === Role.STUDENT) {
      return reply.code(403).send({ error: 'Teachers/Admin only' });
    }

    const parsed = createClassSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid payload', details: parsed.error.issues });
    }
    const { name, schoolId } = parsed.data;

    const code = crypto.randomBytes(3).toString('hex');
    const newClass = await fastify.prisma.class.create({
      data: {
        name,
        code,
        schoolId,
        teacherId: user.id,
      },
    });
    return { class: newClass };
  });
};

export default classesRoutes;
