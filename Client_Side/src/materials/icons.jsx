import React from 'react';

/* EduManage — Icon set (stroke icons, inherit currentColor) */
const Icon = ({ d, paths, size = 18, fill = 'none', sw = 1.7, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...p}>
    {paths || <path d={d} />}
  </svg>
);

const I = {
  grid: (p) => <Icon {...p} paths={<><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></>} />,
  users: (p) => <Icon {...p} paths={<><path d="M16 19v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="3.2"/><path d="M22 19v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13A4 4 0 0 1 16 11"/></>} />,
  user: (p) => <Icon {...p} paths={<><circle cx="12" cy="8" r="4"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/></>} />,
  teacher: (p) => <Icon {...p} paths={<><path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c0 1 2.7 3 6 3s6-2 6-3v-5"/><path d="M22 10v6"/></>} />,
  faculty: (p) => <Icon {...p} paths={<><path d="M3 21h18"/><path d="M5 21V8l7-4 7 4v13"/><path d="M9 21v-6h6v6"/><path d="M9 11h.01M15 11h.01"/></>} />,
  major: (p) => <Icon {...p} paths={<><path d="M2 7l10-4 10 4-10 4Z"/><path d="M6 9.5V15c0 1.7 2.7 3 6 3s6-1.3 6-3V9.5"/></>} />,
  class: (p) => <Icon {...p} paths={<><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 9h18M8 18v3M16 18v3"/></>} />,
  book: (p) => <Icon {...p} paths={<><path d="M4 4v15a1 1 0 0 0 1 1h14"/><path d="M7 4h11a1 1 0 0 1 1 1v13H8a1 1 0 0 1-1-1Z"/><path d="M7 9h8M7 13h6"/></>} />,
  layers: (p) => <Icon {...p} paths={<><path d="M12 2 2 7l10 5 10-5Z"/><path d="m2 12 10 5 10-5"/><path d="m2 17 10 5 10-5"/></>} />,
  award: (p) => <Icon {...p} paths={<><circle cx="12" cy="9" r="6"/><path d="M8.2 13.5 7 22l5-3 5 3-1.2-8.5"/></>} />,
  check: (p) => <Icon {...p} paths={<><path d="M20 6 9 17l-5-5"/></>} />,
  checkCircle: (p) => <Icon {...p} paths={<><circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/></>} />,
  clock: (p) => <Icon {...p} paths={<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>} />,
  calendar: (p) => <Icon {...p} paths={<><rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/></>} />,
  edit: (p) => <Icon {...p} paths={<><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></>} />,
  trash: (p) => <Icon {...p} paths={<><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/></>} />,
  plus: (p) => <Icon {...p} paths={<><path d="M12 5v14M5 12h14"/></>} />,
  search: (p) => <Icon {...p} paths={<><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></>} />,
  filter: (p) => <Icon {...p} paths={<><path d="M3 5h18l-7 8v6l-4 2v-8Z"/></>} />,
  bell: (p) => <Icon {...p} paths={<><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></>} />,
  moon: (p) => <Icon {...p} paths={<><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/></>} />,
  sun: (p) => <Icon {...p} paths={<><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>} />,
  logout: (p) => <Icon {...p} paths={<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></>} />,
  chevL: (p) => <Icon {...p} paths={<path d="M15 18l-6-6 6-6"/>} />,
  chevR: (p) => <Icon {...p} paths={<path d="M9 18l6-6-6-6"/>} />,
  chevD: (p) => <Icon {...p} paths={<path d="M6 9l6 6 6-6"/>} />,
  x: (p) => <Icon {...p} paths={<path d="M18 6 6 18M6 6l12 12"/>} />,
  mail: (p) => <Icon {...p} paths={<><rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="m3 7 9 6 9-6"/></>} />,
  lock: (p) => <Icon {...p} paths={<><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></>} />,
  unlock: (p) => <Icon {...p} paths={<><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/></>} />,
  eye: (p) => <Icon {...p} paths={<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>} />,
  eyeOff: (p) => <Icon {...p} paths={<><path d="M9.9 4.2A10.9 10.9 0 0 1 12 4c6.5 0 10 7 10 7a18 18 0 0 1-3 3.9M6.6 6.6A18 18 0 0 0 2 11s3.5 7 10 7a10.8 10.8 0 0 0 4.4-.9M3 3l18 18M9.9 9.9a3 3 0 0 0 4.2 4.2"/></>} />,
  globe: (p) => <Icon {...p} paths={<><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></>} />,
  more: (p) => <Icon {...p} paths={<><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></>} />,
  arrowUp: (p) => <Icon {...p} paths={<path d="M12 19V5M5 12l7-7 7 7"/>} />,
  arrowDown: (p) => <Icon {...p} paths={<path d="M12 5v14M19 12l-7 7-7-7"/>} />,
  trendUp: (p) => <Icon {...p} paths={<><path d="M3 17l6-6 4 4 8-8"/><path d="M17 7h4v4"/></>} />,
  download: (p) => <Icon {...p} paths={<><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></>} />,
  clipboard: (p) => <Icon {...p} paths={<><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2H9Z"/><path d="M9 12h6M9 16h4"/></>} />,
  pen: (p) => <Icon {...p} paths={<><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></>} />,
  shield: (p) => <Icon {...p} paths={<><path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6Z"/><path d="m9 12 2 2 4-4"/></>} />,
  settings: (p) => <Icon {...p} paths={<><circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V20a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H4a2 2 0 0 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H10a1.6 1.6 0 0 0 1-1.5V4a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V10a1.6 1.6 0 0 0 1.5 1H20a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"/></>} />,
  spark: (p) => <Icon {...p} paths={<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>} />,
  menu: (p) => <Icon {...p} paths={<path d="M3 6h18M3 12h18M3 18h18"/>} />,
  building: (p) => <Icon {...p} paths={<><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01"/></>} />,
  phone: (p) => <Icon {...p} paths={<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z"/>} />,
  pin: (p) => <Icon {...p} paths={<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>} />,
  idcard: (p) => <Icon {...p} paths={<><rect x="2.5" y="5" width="19" height="14" rx="2"/><circle cx="8" cy="11" r="2"/><path d="M5 16a3 3 0 0 1 6 0M14 9h4M14 12h4M14 15h2"/></>} />,
  cake: (p) => <Icon {...p} paths={<><path d="M4 21h16M5 21v-7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7M4 16c1.5 1.2 3 1.2 4.5 0S11.5 14.8 12 16s3 1.2 4.5 0 3-1.2 3.5 0M12 7V4M12 4l1-1M12 4l-1-1"/></>} />,
  upload: (p) => <Icon {...p} paths={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v13"/></>} />,
  fileText: (p) => <Icon {...p} paths={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M9 13h6M9 17h6M9 9h1"/></>} />,
  command: (p) => <Icon {...p} paths={<path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3Z"/>} />,
  corner: (p) => <Icon {...p} paths={<path d="M9 10 4 15l5 5M4 15h12a4 4 0 0 0 4-4V4"/>} />,
  alert: (p) => <Icon {...p} paths={<><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></>} />,
};

export { I, Icon };
