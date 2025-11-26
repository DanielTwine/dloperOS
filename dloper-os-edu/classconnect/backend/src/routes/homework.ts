import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { Role, SubmissionStatus } from '@prisma/client';

const homeworkRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', { preHandler: fastify.authenticate }, async (request) => {
    const user = request.user;

    if (user.role === Role.STUDENT) {
      const homework = await fastify.prisma.homework.findMany({
        where: { class: { enrolments: { some: { studentId: user.id } } } },
        include: { class: true },
        orderBy: { dueDate: 'asc' },
      });
      return { homework };
    }

    const homework = await fastify.prisma.homework.findMany({
      where: { class: { teacherId: user.id } },
      include: { class: true },
      orderBy: { dueDate: 'asc' },
    });
    return { homework };
  });

  const createSchema = z.object({
    classId: z.number(),
    title: z.string().min(2),
    description: z.string().min(2),
    dueDate: z.string(),
  });

  fastify.post('/create', { preHandler: fastify.authenticate }, async (request, reply) => {
    const user = request.user;
    if (user.role === Role.STUDENT) {
      return reply.code(403).send({ error: 'Teachers/Admin only' });
    }

    const parsed = createSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid payload', details: parsed.error.issues });
    }

    const { classId, title, description, dueDate } = parsed.data;
    const homework = await fastify.prisma.homework.create({
      data: {
        classId,
        title,
        description,
        dueDate: new Date(dueDate),
        assignedById: user.id,
      },
    });
    return { homework };
  });

  const submitSchema = z.object({
    homeworkId: z.number(),
    content: z.string().optional(),
  });

  fastify.post('/submit', { preHandler: fastify.authenticate }, async (request, reply) => {
    const user = request.user;
    if (user.role !== Role.STUDENT) {
      return reply.code(403).send({ error: 'Students only' });
    }

    const parsed = submitSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid payload', details: parsed.error.issues });
    }

    const { homeworkId } = parsed.data;
    const submission = await fastify.prisma.homeworkSubmission.upsert({
      where: { homeworkId_studentId: { homeworkId, studentId: user.id } },
      update: {
        status: SubmissionStatus.SUBMITTED,
        submittedAt: new Date(),
      },
      create: {
        homeworkId,
        studentId: user.id,
        status: SubmissionStatus.SUBMITTED,
        submittedAt: new Date(),
      },
    });
    return { submission };
  });
};

export default homeworkRoutes;
