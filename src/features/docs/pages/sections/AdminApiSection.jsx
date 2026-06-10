import ApiSection from './ApiSection.jsx';
import { adminEndpoints, adminGroups, groupAdminEndpoints } from '../../data/endpoints.admin.js';

const AdminApiSection = () => (
  <ApiSection
    title="Admin API"
    basePath="/AISentinelAdmin/v1"
    service="server-admin-aisentinel"
    orm="Mongoose · MongoDB"
    description="Backend principal: dominio completo, proxy HTTP hacia Pyimage, eventos en tiempo real, scheduler de reportes, alertas."
    endpoints={adminEndpoints}
    groups={adminGroups}
    groupFn={groupAdminEndpoints}
  />
);

export default AdminApiSection;
