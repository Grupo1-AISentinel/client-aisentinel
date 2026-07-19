import ApiSection from './ApiSection.jsx';
import { authEndpoints, authGroups, groupAuthEndpoints } from '../../data/endpoints.auth.js';

const AuthApiSection = () => (
  <ApiSection
    title="Auth API"
    basePath="/api/v1"
    service="server-auth-aisentinel"
    orm="Sequelize · PostgreSQL"
    description="Ciclo de vida del usuario: registro, verificación, login, JWT, 2FA TOTP y endpoints internos."
    endpoints={authEndpoints}
    groups={authGroups}
    groupFn={groupAuthEndpoints}
  />
);

export default AuthApiSection;
