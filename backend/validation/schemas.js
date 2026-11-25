const { z } = require('zod');

const ROLES = ['user', 'admin'];
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const emailSchema = z.string().trim().toLowerCase().pipe(z.email().max(150));
// bcrypt only uses the first 72 bytes, so longer passwords are rejected.
const passwordSchema = z.string().min(8).max(72);
const nombreSchema = z.string().trim().min(1).max(100);

const idParams = z.object({
  id: z.coerce.number().int().positive().max(2147483647), // PostgreSQL INTEGER range
});

const loginBody = z.object({
  email: z.string().trim().toLowerCase().min(1).max(150),
  password: z.string().min(1).max(72),
});

const createUserBody = z.object({
  nombre: nombreSchema,
  email: emailSchema,
  password: passwordSchema,
  rol: z.enum(ROLES).default('user'),
});

// An empty password from the edit form means "keep the current password".
const optionalPasswordSchema = z.preprocess(
  (v) => (v === '' || v === null ? undefined : v),
  passwordSchema.optional()
);

const updateUserBody = z
  .object({
    nombre: nombreSchema.optional(),
    email: emailSchema.optional(),
    password: optionalPasswordSchema,
    rol: z.enum(ROLES).optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: 'Debe indicar al menos un campo para actualizar',
  });

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function isRealDate(value) {
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

const jornadaBody = z
  .object({
    horaEntrada: z.string().regex(TIME_REGEX, 'Formato de hora HH:MM'),
    horaSalida: z.string().regex(TIME_REGEX, 'Formato de hora HH:MM'),
    fecha: z
      .string()
      .regex(DATE_REGEX, 'Formato de fecha YYYY-MM-DD')
      .refine(isRealDate, 'Fecha inválida')
      .optional(),
  })
  .refine((data) => toMinutes(data.horaSalida) > toMinutes(data.horaEntrada), {
    message: 'La hora de salida debe ser posterior a la de entrada',
    path: ['horaSalida'],
  });

module.exports = {
  ROLES,
  idParams,
  loginBody,
  createUserBody,
  updateUserBody,
  jornadaBody,
  toMinutes,
};
