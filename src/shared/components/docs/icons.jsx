// Sistema de iconos SVG inline para AISentinel Docs.
// Evitamos dependencias externas para tener control total de estilo y peso.

const baseProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const DocsIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5v-18z" />
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
  </svg>
);

export const ApiIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M8 9l-4 3 4 3" />
    <path d="M16 9l4 3-4 3" />
    <line x1="14" y1="5" x2="10" y2="19" />
  </svg>
);

export const LayersIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

export const DataIcon = (props) => (
  <svg {...baseProps} {...props}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v6c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
    <path d="M3 11v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6" />
  </svg>
);

export const SocketIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M4 12a8 8 0 0 1 8-8" />
    <path d="M4 12a8 8 0 0 0 8 8" />
    <path d="M8 12a4 4 0 0 1 4-4" />
    <path d="M8 12a4 4 0 0 0 4 4" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);

export const FlowIcon = (props) => (
  <svg {...baseProps} {...props}>
    <rect x="3" y="3" width="6" height="6" rx="1" />
    <rect x="15" y="3" width="6" height="6" rx="1" />
    <rect x="9" y="15" width="6" height="6" rx="1" />
    <path d="M9 6h6" />
    <path d="M6 9v3a3 3 0 0 0 3 3" />
    <path d="M18 9v3a3 3 0 0 1-3 3" />
  </svg>
);

export const ConfigIcon = (props) => (
  <svg {...baseProps} {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export const ArchitectureIcon = (props) => (
  <svg {...baseProps} {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

export const SearchIcon = (props) => (
  <svg {...baseProps} {...props}>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const CloseIcon = (props) => (
  <svg {...baseProps} {...props}>
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </svg>
);

export const ChevronDownIcon = (props) => (
  <svg {...baseProps} {...props}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const ChevronRightIcon = (props) => (
  <svg {...baseProps} {...props}>
    <polyline points="9 6 15 12 9 18" />
  </svg>
);

export const ChevronLeftIcon = (props) => (
  <svg {...baseProps} {...props}>
    <polyline points="15 6 9 12 15 18" />
  </svg>
);

export const ArrowRightIcon = (props) => (
  <svg {...baseProps} {...props}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export const ArrowUpIcon = (props) => (
  <svg {...baseProps} {...props}>
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

export const ArrowDownIcon = (props) => (
  <svg {...baseProps} {...props}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="5 12 12 19 19 12" />
  </svg>
);

export const ArrowRightLeftIcon = (props) => (
  <svg {...baseProps} {...props}>
    <polyline points="17 11 21 7 17 3" />
    <line x1="21" y1="7" x2="9" y2="7" />
    <polyline points="7 21 3 17 7 13" />
    <line x1="3" y1="17" x2="15" y2="17" />
  </svg>
);

export const CopyIcon = (props) => (
  <svg {...baseProps} {...props}>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export const CheckIcon = (props) => (
  <svg {...baseProps} {...props}>
    <polyline points="4 12 10 18 20 6" />
  </svg>
);

export const HashIcon = (props) => (
  <svg {...baseProps} {...props}>
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="14" y2="21" />
  </svg>
);

export const LockIcon = (props) => (
  <svg {...baseProps} {...props}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

export const ShieldIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z" />
  </svg>
);

export const ZapIcon = (props) => (
  <svg {...baseProps} {...props}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export const TerminalIcon = (props) => (
  <svg {...baseProps} {...props}>
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

export const InfoIcon = (props) => (
  <svg {...baseProps} {...props}>
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="11" x2="12" y2="16" />
    <circle cx="12" cy="8" r="0.5" fill="currentColor" />
  </svg>
);

export const WarningIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M10.29 3.86l-8.18 14.5A2 2 0 0 0 3.84 21h16.32a2 2 0 0 0 1.73-2.64l-8.18-14.5a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <circle cx="12" cy="17" r="0.5" fill="currentColor" />
  </svg>
);

export const ErrorIcon = (props) => (
  <svg {...baseProps} {...props}>
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <circle cx="12" cy="16" r="0.5" fill="currentColor" />
  </svg>
);

export const SuccessIcon = (props) => (
  <svg {...baseProps} {...props}>
    <circle cx="12" cy="12" r="9" />
    <polyline points="8 12 11 15 16 9" />
  </svg>
);

export const DatabaseIcon = (props) => (
  <svg {...baseProps} {...props}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v6c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
    <path d="M3 11v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6" />
  </svg>
);

export const ServerIcon = (props) => (
  <svg {...baseProps} {...props}>
    <rect x="3" y="3" width="18" height="7" rx="1" />
    <rect x="3" y="14" width="18" height="7" rx="1" />
    <line x1="7" y1="6.5" x2="7" y2="6.5" />
    <line x1="7" y1="17.5" x2="7" y2="17.5" />
  </svg>
);

export const BrainIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M9 3a3 3 0 0 0-3 3v1a3 3 0 0 0-2 5 3 3 0 0 0 1 5 3 3 0 0 0 1 4 3 3 0 0 0 6 0V3" />
    <path d="M15 3a3 3 0 0 1 3 3v1a3 3 0 0 1 2 5 3 3 0 0 1-1 5 3 3 0 0 1-1 4 3 3 0 0 1-6 0V3" />
  </svg>
);

export const FilterIcon = (props) => (
  <svg {...baseProps} {...props}>
    <polygon points="3 4 21 4 14 12.5 14 19 10 21 10 12.5 3 4" />
  </svg>
);

export const PlusIcon = (props) => (
  <svg {...baseProps} {...props}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const ActivityIcon = (props) => (
  <svg {...baseProps} {...props}>
    <polyline points="3 12 7 12 10 5 14 19 17 12 21 12" />
  </svg>
);

export const CpuIcon = (props) => (
  <svg {...baseProps} {...props}>
    <rect x="5" y="5" width="14" height="14" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="2" x2="9" y2="5" />
    <line x1="15" y1="2" x2="15" y2="5" />
    <line x1="9" y1="19" x2="9" y2="22" />
    <line x1="15" y1="19" x2="15" y2="22" />
    <line x1="2" y1="9" x2="5" y2="9" />
    <line x1="2" y1="15" x2="5" y2="15" />
    <line x1="19" y1="9" x2="22" y2="9" />
    <line x1="19" y1="15" x2="22" y2="15" />
  </svg>
);

export const CameraIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M3 7h3l2-3h8l2 3h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

export const ClockIcon = (props) => (
  <svg {...baseProps} {...props}>
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 15 14" />
  </svg>
);

export const ListIcon = (props) => (
  <svg {...baseProps} {...props}>
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <circle cx="4" cy="6" r="0.5" fill="currentColor" />
    <circle cx="4" cy="12" r="0.5" fill="currentColor" />
    <circle cx="4" cy="18" r="0.5" fill="currentColor" />
  </svg>
);

export const NetworkIcon = (props) => (
  <svg {...baseProps} {...props}>
    <circle cx="12" cy="5" r="2" />
    <circle cx="5" cy="19" r="2" />
    <circle cx="19" cy="19" r="2" />
    <line x1="12" y1="7" x2="5" y2="17" />
    <line x1="12" y1="7" x2="19" y2="17" />
    <line x1="5" y1="19" x2="19" y2="19" />
  </svg>
);

export const RocketIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M4 20l4-4" />
    <path d="M9 15s2-1 5 0 5 0 5 0l-3 3s-1 2-5 0-5 0-5 0z" />
    <path d="M15 9l-1.5-1.5" />
    <path d="M19 5l-1.5 1.5" />
    <path d="M14 4l1 1" />
  </svg>
);

export const LinkIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
    <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
  </svg>
);

export const Link2Icon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M9 17H7a5 5 0 0 1 0-10h2" />
    <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

export const PlayIcon = (props) => (
  <svg {...baseProps} {...props}>
    <polygon points="6 4 20 12 6 20 6 4" fill="currentColor" />
  </svg>
);

export const SparkleIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M12 2l1.5 5L18 8.5 13.5 10 12 15l-1.5-5L6 8.5 10.5 7 12 2z" />
  </svg>
);
