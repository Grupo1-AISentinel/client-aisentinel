import { Navigate, useParams } from 'react-router';
import ArchitectureSection from './sections/ArchitectureSection.jsx';
import AuthApiSection from './sections/AuthApiSection.jsx';
import AdminApiSection from './sections/AdminApiSection.jsx';
import PyimageApiSection from './sections/PyimageApiSection.jsx';
import DataModelsSection from './sections/DataModelsSection.jsx';
import SocketEventsSection from './sections/SocketEventsSection.jsx';
import FlowExamplesSection from './sections/FlowExamplesSection.jsx';
import EnvConfigSection from './sections/EnvConfigSection.jsx';
import { DOCS_SECTIONS } from '../docs.constants.js';

const SECTION_COMPONENT = {
  architecture: ArchitectureSection,
  auth: AuthApiSection,
  admin: AdminApiSection,
  pyimage: PyimageApiSection,
  dataModels: DataModelsSection,
  socket: SocketEventsSection,
  flows: FlowExamplesSection,
  env: EnvConfigSection,
};

const DocsPage = () => {
  const { section } = useParams();

  if (!section) {
    return <Navigate to="/docs/architecture" replace />;
  }

  const Section = SECTION_COMPONENT[section];
  if (!Section) {
    return <Navigate to="/docs/architecture" replace />;
  }

  const meta = DOCS_SECTIONS.find((s) => s.id === section);
  return (
    <article className="flex flex-col gap-5">
      {meta && (
        <header className="border-b border-white/10 pb-3">
          <span className="font-mono text-[10px] tracking-[0.2em] text-amber-300/80 uppercase">
            Sección
          </span>
          <h1 className="font-display text-2xl font-bold text-on-surface mt-1">{meta.label}</h1>
        </header>
      )}
      <Section />
    </article>
  );
};

export default DocsPage;
