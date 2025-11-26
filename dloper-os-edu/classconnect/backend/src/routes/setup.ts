import { FastifyPluginAsync } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { Role } from '@prisma/client';

const setupRoutes: FastifyPluginAsync = async (fastify) => {
  const setupSchema = z.object({
    schoolName: z.string().min(2),
    schoolDomain: z.string().optional(),
    adminEmail: z.string().email(),
    adminPassword: z.string().min(6),
    adminName: z.string().min(2),
  });

  fastify.post('/school', async (request, reply) => {
    const parsed = setupSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid payload', details: parsed.error.issues });
    }
    const { schoolName, schoolDomain, adminEmail, adminPassword, adminName } = parsed.data;

    const hasAdmin = await fastify.prisma.user.findFirst({ where: { role: Role.ADMIN } });
    if (hasAdmin) {
      return reply.code(400).send({ error: 'Already provisioned' });
    }

    const school = await fastify.prisma.school.create({ data: { name: schoolName, domain: schoolDomain || null } });
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const admin = await fastify.prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: adminName,
        role: Role.ADMIN,
        schoolId: school.id,
      },
      select: { id: true, email: true, name: true, role: true, schoolId: true },
    });

    const token = fastify.jwt.sign(admin);
    return { school, admin, token };
  });
};

export default setupRoutes;
