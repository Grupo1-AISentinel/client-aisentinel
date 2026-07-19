import ApiSection from './ApiSection.jsx';
import {
  pyimageEndpoints,
  pyimageGroups,
  groupPyimageEndpoints,
} from '../../data/endpoints.pyimage.js';

const PyimageApiSection = () => (
  <ApiSection
    title="Pyimage API"
    basePath="/"
    service="server-pyimage-aisentinel"
    orm="FastAPI · ChromaDB"
    description="Servicio de visión por computadora: detección de personas (YOLO26), reconocimiento facial (InsightFace) y validación de uniformes (DINOv2)."
    endpoints={pyimageEndpoints}
    groups={pyimageGroups}
    groupFn={groupPyimageEndpoints}
  />
);

export default PyimageApiSection;
