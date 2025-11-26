import { FastifyPluginAsync } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { Role } from '@prisma/client';

const authRoutes: FastifyPluginAsync = async (fastify) => {
  const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
    role: z.nativeEnum(Role).default(Role.STUDENT),
    schoolId: z.number().optional(),
    schoolName: z.string().optional(),
    schoolDomain: z.string().optional(),
  });

  fastify.post('/register', async (request, reply) => {
    const parse = registerSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.code(400).send({ error: 'Invalid payload', details: parse.error.issues });
    }
    const { email, password, name, role, schoolId, schoolName, schoolDomain } = parse.data;

    const existing = await fastify.prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.code(400).send({ error: 'Email already registered' });
    }

    let schoolIdToUse = schoolId;
    if (!schoolIdToUse) {
      if (!schoolName) {
        return reply.code(400).send({ error: 'schoolId or schoolName required' });
      }
      const school = await fastify.prisma.school.create({
        data: { name: schoolName, domain: schoolDomain || null },
      });
      schoolIdToUse = school.id;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await fastify.prisma.user.create({
      data: { email, passwordHash, name, role, schoolId: schoolIdToUse },
      select: { id: true, email: true, name: true, role: true, schoolId: true },
    });

    const token = fastify.jwt.sign(user);
    return { user, token };
  });

  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });

  fastify.post('/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid payload', details: parsed.error.issues });
    }
    const { email, password } = parsed.data;

    const user = await fastify.prisma.user.findUnique({ where: { email } });
    if (!user) return reply.code(401).send({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return reply.code(401).send({ error: 'Invalid credentials' });

    const payload = { id: user.id, email: user.email, role: user.role, schoolId: user.schoolId };
    const token = fastify.jwt.sign(payload);
    return { token, user: payload };
  });

  fastify.post('/logout', async () => {
    return { success: true };
  });

  fastify.get('/me', { preHandler: fastify.authenticate }, async (request) => {
    const userId = request.user.id;
    const user = await fastify.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, schoolId: true },
    });
    return { user };
  });
};

export default authRoutes;
