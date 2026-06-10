export const authEndpoints = [
  {
    method: 'POST',
    path: '/api/v1/auth/register',
    auth: 'JWT (ADMIN_ROLE)',
    roles: ['ADMIN_ROLE'],
    description: 'Registra un nuevo usuario. Solo accesible para ADMIN.',
    body: [
      { name: 'studentName', type: 'string', required: true, description: 'Nombre del usuario.' },
      { name: 'studentSurname', type: 'string', required: true, description: 'Apellido.' },
      {
        name: 'email',
        type: 'string',
        required: true,
        description: 'Email único, formato válido.',
      },
      { name: 'password', type: 'string', required: true, description: 'Mínimo 8 caracteres.' },
      { name: 'phone', type: 'string', required: false, description: 'Teléfono (opcional).' },
      {
        name: 'role',
        type: 'string',
        required: false,
        description: 'ADMIN_ROLE o COORDINATOR_ROLE.',
      },
    ],
    responses: {
      201: {
        description: 'Usuario creado. Email de verificación enviado.',
        example: {
          success: true,
          user: { id: 'uuid', email: 'u@kinal.edu.gt', role: 'COORDINATOR_ROLE' },
        },
      },
      400: { description: 'Datos inválidos.' },
      401: { description: 'Token JWT ausente o inválido.' },
      403: { description: 'No es ADMIN.' },
      409: { description: 'Email ya registrado.' },
    },
    usedBy: ['client-aisentinel/src/features/coordinators/...'],
  },
  {
    method: 'POST',
    path: '/api/v1/auth/login',
    auth: 'Público',
    rateLimit: 'authRateLimit',
    description: 'Inicia sesión. Devuelve JWT o challenge 2FA.',
    body: [
      { name: 'email', type: 'string', required: true, description: 'Email.' },
      { name: 'password', type: 'string', required: true, description: 'Password.' },
    ],
    responses: {
      200: {
        description: 'Login exitoso.',
        example: {
          token: 'eyJ...',
          user: { id: 'uuid', role: 'ADMIN_ROLE', twoFactorEnabled: false },
        },
      },
      202: { description: 'Requiere 2FA.', example: { requires2FA: true, tempToken: 'eyJ...' } },
      400: { description: 'Datos incompletos.' },
      401: { description: 'Credenciales inválidas.' },
      403: { description: 'Cuenta no verificada o deshabilitada.' },
    },
    usedBy: ['client-aisentinel/src/features/auth/pages/LoginPage.jsx'],
  },
  {
    method: 'POST',
    path: '/api/v1/auth/verify-email',
    auth: 'Público',
    rateLimit: 'requestLimit',
    description: 'Confirma el email usando el token recibido por correo.',
    body: [
      { name: 'token', type: 'string', required: true, description: 'Token de verificación.' },
    ],
    responses: {
      200: { description: 'Email verificado.' },
      400: { description: 'Token inválido o expirado.' },
    },
  },
  {
    method: 'POST',
    path: '/api/v1/auth/resend-verification',
    auth: 'Público',
    rateLimit: 'authRateLimit',
    description: 'Reenvía el email de verificación.',
    body: [{ name: 'email', type: 'string', required: true, description: 'Email registrado.' }],
    responses: {
      200: { description: 'Email reenviado (siempre 200 para no filtrar existencia).' },
      400: { description: 'Email mal formado.' },
    },
  },
  {
    method: 'POST',
    path: '/api/v1/auth/forgot-password',
    auth: 'Público',
    rateLimit: 'authRateLimit',
    description: 'Solicita email de recuperación de contraseña.',
    body: [{ name: 'email', type: 'string', required: true, description: 'Email registrado.' }],
    responses: {
      200: { description: 'Si el email existe, se envía el correo.' },
    },
  },
  {
    method: 'POST',
    path: '/api/v1/auth/reset-password',
    auth: 'Público',
    rateLimit: 'authRateLimit',
    description: 'Restablece la contraseña con el token del email.',
    body: [
      { name: 'token', type: 'string', required: true, description: 'Token del email.' },
      {
        name: 'newPassword',
        type: 'string',
        required: true,
        description: 'Nueva contraseña (mín. 8).',
      },
    ],
    responses: {
      200: { description: 'Contraseña actualizada.' },
      400: { description: 'Token inválido o contraseña débil.' },
    },
    usedBy: ['client-aisentinel/src/features/auth/pages/ResetPasswordPage.jsx'],
  },
  {
    method: 'GET',
    path: '/api/v1/auth/profile',
    auth: 'JWT',
    description: 'Perfil del usuario autenticado.',
    responses: {
      200: {
        description: 'Perfil.',
        example: { success: true, user: { id: 'uuid', email: '...', role: 'ADMIN_ROLE' } },
      },
      401: { description: 'Sin token.' },
    },
    usedBy: ['client-aisentinel/src/features/profile/pages/ProfilePage.jsx'],
  },
  {
    method: 'POST',
    path: '/api/v1/auth/profile/by-id',
    auth: 'Público (gated por requestLimit)',
    rateLimit: 'requestLimit',
    description: 'Lookup de perfil por id (uso interno del admin).',
    body: [{ name: 'id', type: 'string', required: true, description: 'UUID del usuario.' }],
    responses: {
      200: { description: 'Perfil reducido.' },
      404: { description: 'No encontrado.' },
    },
  },
  {
    method: 'POST',
    path: '/api/v1/auth/verify-2fa',
    auth: 'Público (rate limited)',
    rateLimit: 'authRateLimit',
    description: 'Verifica TOTP o recovery code y emite el JWT final.',
    body: [
      {
        name: 'tempToken',
        type: 'string',
        required: true,
        description: 'Token temporal del login.',
      },
      {
        name: 'code',
        type: 'string',
        required: true,
        description: 'TOTP de 6 dígitos o recovery code.',
      },
    ],
    responses: {
      200: { description: 'Código válido, retorna JWT.', example: { token: 'eyJ...' } },
      401: { description: 'Código inválido.' },
    },
    usedBy: ['client-aisentinel/src/features/auth/pages/TwoFactorPage.jsx'],
  },
  {
    method: 'PUT',
    path: '/api/v1/users/:userId/role',
    auth: 'JWT (ADMIN_ROLE)',
    roles: ['ADMIN_ROLE'],
    description: 'Actualiza el rol de un usuario.',
    pathParams: [{ name: 'userId', type: 'uuid', required: true, description: 'UUID.' }],
    body: [{ name: 'role', type: 'string', required: true, description: 'Nombre del rol.' }],
    responses: {
      200: { description: 'Rol actualizado.' },
      404: { description: 'Usuario o rol no encontrado.' },
    },
  },
  {
    method: 'GET',
    path: '/api/v1/users/:userId/roles',
    auth: 'JWT (ADMIN_ROLE)',
    roles: ['ADMIN_ROLE'],
    description: 'Roles de un usuario.',
    pathParams: [{ name: 'userId', type: 'uuid', required: true, description: 'UUID.' }],
    responses: { 200: { description: 'Roles.', example: { roles: ['ADMIN_ROLE'] } } },
  },
  {
    method: 'GET',
    path: '/api/v1/users/by-role/:roleName',
    auth: 'JWT (ADMIN_ROLE)',
    roles: ['ADMIN_ROLE'],
    description: 'Usuarios con un rol específico.',
    pathParams: [
      {
        name: 'roleName',
        type: 'string',
        required: true,
        description: 'ADMIN_ROLE o COORDINATOR_ROLE.',
      },
    ],
    responses: { 200: { description: 'Array de usuarios.' } },
  },
  {
    method: 'POST',
    path: '/api/v1/two-factor/setup',
    auth: 'JWT',
    description: 'Inicia el setup de 2FA. Retorna secret y otpauthUrl.',
    responses: {
      200: {
        description: 'Setup iniciado.',
        example: { secret: 'JBSWY3DPEHPK3PXP', otpauthUrl: 'otpauth://...' },
      },
      401: { description: 'Sin token.' },
    },
    usedBy: ['client-aisentinel/src/features/profile/services/twoFactorService.js'],
  },
  {
    method: 'GET',
    path: '/api/v1/two-factor/setup/qr',
    auth: 'JWT',
    description: 'Imagen PNG del QR para Google Authenticator.',
    responses: { 200: { description: 'PNG del QR.' } },
  },
  {
    method: 'POST',
    path: '/api/v1/two-factor/verify-and-enable',
    auth: 'JWT',
    description: 'Verifica el primer TOTP y activa 2FA.',
    body: [{ name: 'code', type: 'string', required: true, description: 'TOTP de 6 dígitos.' }],
    responses: {
      200: { description: '2FA habilitado.', example: { recoveryCodes: ['XXXX-XXXX', '...'] } },
      400: { description: 'Código inválido.' },
    },
  },
  {
    method: 'POST',
    path: '/api/v1/two-factor/disable',
    auth: 'JWT',
    description: 'Desactiva 2FA (requiere password actual).',
    body: [{ name: 'password', type: 'string', required: true, description: 'Password actual.' }],
    responses: {
      200: { description: '2FA desactivado.' },
      401: { description: 'Password incorrecto.' },
    },
  },
  {
    method: 'GET',
    path: '/api/v1/two-factor/status',
    auth: 'JWT',
    description: 'Estado de 2FA del usuario.',
    responses: {
      200: { description: 'Estado.', example: { enabled: true, recoveryCodesLeft: 8 } },
    },
  },
  {
    method: 'POST',
    path: '/api/v1/two-factor/recovery-codes',
    auth: 'JWT',
    rateLimit: 'requestLimit',
    description: 'Regenera códigos de recuperación (invalida los anteriores).',
    responses: {
      200: { description: 'Nuevos códigos.', example: { recoveryCodes: ['XXXX-XXXX'] } },
    },
  },
  {
    method: 'POST',
    path: '/api/v1/internal/users',
    auth: 'x-internal-token',
    description: 'Crea usuario servicio-a-servicio (admin → auth).',
    body: [
      { name: 'email', type: 'string', required: true, description: 'Email.' },
      { name: 'password', type: 'string', required: true, description: 'Password o hash.' },
      {
        name: 'role',
        type: 'string',
        required: true,
        description: 'ADMIN_ROLE o COORDINATOR_ROLE.',
      },
      { name: 'studentName', type: 'string', required: true, description: 'Nombre.' },
      { name: 'studentSurname', type: 'string', required: true, description: 'Apellido.' },
    ],
    responses: {
      201: { description: 'Usuario creado.' },
      401: { description: 'Token interno inválido.' },
    },
    usedBy: ['server-admin-aisentinel/src/coordinator/coordinator.controller.js#createCoordinator'],
  },
  {
    method: 'GET',
    path: '/api/v1/internal/users/by-email',
    auth: 'x-internal-token',
    description: 'Busca usuario por email (admin ↔ auth).',
    query: [{ name: 'email', type: 'string', required: true, description: 'Email.' }],
    responses: {
      200: { description: 'Usuario encontrado.' },
      404: { description: 'No existe.' },
    },
  },
  {
    method: 'DELETE',
    path: '/api/v1/internal/users/:userId',
    auth: 'x-internal-token',
    description: 'Elimina usuario (cascada desde admin).',
    pathParams: [{ name: 'userId', type: 'uuid', required: true, description: 'UUID.' }],
    responses: {
      200: { description: 'Eliminado.' },
      401: { description: 'Token inválido.' },
    },
  },
];

export const authGroups = [
  { id: 'auth', title: 'Autenticación', description: 'Login, registro, verificación, reset.' },
  { id: 'users', title: 'Usuarios y roles', description: 'Gestión de usuarios y roles.' },
  { id: 'two-factor', title: '2FA', description: 'TOTP y códigos de recuperación.' },
  { id: 'internal', title: 'API interna', description: 'Servicio-a-servicio (admin ↔ auth).' },
];

export const groupAuthEndpoints = (endpoints) => {
  const grouped = authGroups.map((g) => ({ ...g, endpoints: [] }));
  endpoints.forEach((ep) => {
    const p = ep.path;
    let id = 'auth';
    if (p.includes('/users')) id = 'users';
    else if (p.includes('/two-factor')) id = 'two-factor';
    else if (p.includes('/internal')) id = 'internal';
    grouped.find((g) => g.id === id)?.endpoints.push(ep);
  });
  return grouped;
};
