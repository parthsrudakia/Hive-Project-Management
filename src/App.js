
import { useState, useEffect, useRef } from "react";

// ── Storage helpers ──────────────────────────────────────────────────────────
const STORAGE_KEY = "hiveboard_data";

const defaultData = {
  users: [
    { id: "Admin",   password: "admin123",  name: "Admin",        role: "admin"  },
    { id: "Hive001", password: "hive001",   name: "Member 001",   role: "member" },
    { id: "Hive002", password: "hive002",   name: "Member 002",   role: "member" },
    { id: "Hive003", password: "hive003",   name: "Member 003",   role: "member" },
  ],
  tasks: [],
  nextTaskId: 1,
};

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultData;
}

function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

// ── Icons (inline SVG) ───────────────────────────────────────────────────────
const Icon = {
  Hexagon: () => (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <polygon points="13,2 23,7.5 23,18.5 13,24 3,18.5 3,7.5" stroke="#1A1916" strokeWidth="1.5" fill="none"/>
      <polygon points="13,7 19,10.5 19,15.5 13,19 7,15.5 7,10.5" fill="#1A1916" opacity=".12"/>
    </svg>
  ),
  Task: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="3" width="14" height="2" rx="1"/><rect x="1" y="7" width="14" height="2" rx="1"/><rect x="1" y="11" width="8" height="2" rx="1"/></svg>,
  Done: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M13.5 4.5L6.5 11.5L2.5 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>,
  Clock: () => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M7 4v3l2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>,
  Urgent: () => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M7 1L13 12H1L7 1Z" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round"/><rect x="6.3" y="5" width="1.4" height="4" rx=".7"/><circle cx="7" cy="10.5" r=".8"/></svg>,
  Comment: () => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M2 2h10a1 1 0 011 1v6a1 1 0 01-1 1H5L2 12V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round"/></svg>,
  Logout: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M10 8H3M7 5L3 8l4 3M9 3h3a1 1 0 011 1v8a1 1 0 01-1 1H9" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Plus: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  User: () => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><circle cx="7" cy="5" r="3" stroke="currentColor" strokeWidth="1.3" fill="none"/><path d="M1 13c0-3.3 2.7-5 6-5s6 1.7 6 5" stroke="currentColor" strokeWidth="1.3" fill="none"/></svg>,
  Key: () => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><circle cx="5.5" cy="5.5" r="3.5" stroke="currentColor" strokeWidth="1.3" fill="none"/><path d="M8.5 8.5L13 13M10 11l1.5-1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  Eye: () => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M1 7s2.5-4.5 6-4.5S13 7 13 7s-2.5 4.5-6 4.5S1 7 1 7z" stroke="currentColor" strokeWidth="1.3" fill="none"/><circle cx="7" cy="7" r="1.8" stroke="currentColor" strokeWidth="1.3" fill="none"/></svg>,
  EyeOff: () => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M1 1l12 12M5.5 5.6A1.8 1.8 0 009.3 9M3 3.8C2 4.7 1.3 5.9 1 7c.8 3 3.6 4.5 6 4.5 1.2 0 2.4-.4 3.4-1M6.5 2.6C6.7 2.5 6.8 2.5 7 2.5c3.5 0 6 4.5 6 4.5s-.4.7-1.2 1.6" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round"/></svg>,
  Overview: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" fill="none"/><rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" fill="none"/><rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" fill="none"/><rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" fill="none"/></svg>,
  Edit: () => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round"/><path d="M8 4l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  UserPlus: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="6" cy="5" r="3" stroke="currentColor" strokeWidth="1.4" fill="none"/><path d="M1 14c0-3.3 2.2-5 5-5s5 1.7 5 5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round"/><path d="M12 6v4M10 8h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  Trash: () => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M2 4h10M5 4V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4M6 6.5v4M8 6.5v4M3 4l.8 7.2a1 1 0 001 .8h4.4a1 1 0 001-.8L11 4" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

const STATUS_COLORS = {
  incomplete: { bg: "#FDF2F2", border: "#EDD5D5", text: "#C0392B", dot: "#C0392B" },
  "in progress": { bg: "#F2F5FD", border: "#D5DEF0", text: "#1A4A7A", dot: "#1A4A7A" },
  done: { bg: "#F2FAF6", border: "#D5EDE3", text: "#27664A", dot: "#27664A" },
};

const STATUS_LABELS = ["incomplete", "in progress", "done"];

// ── CSS ──────────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Inter:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #FAFAF8;
    --surface: #FFFFFF;
    --surface2: #F5F4F0;
    --surface3: #EDECE8;
    --border: #E8E6E0;
    --border2: #D4D0C8;
    --text: #1A1916;
    --text2: #6B6860;
    --text3: #A8A49C;
    --accent: #1A1916;
    --accent2: #3D3A34;
    --accent-dim: rgba(26,25,22,.06);
    --danger: #C0392B;
    --danger-dim: rgba(192,57,43,.08);
    --success: #27664A;
    --success-dim: rgba(39,102,74,.08);
    --warning: #8B6914;
    --warning-dim: rgba(139,105,20,.08);
    --info: #1A4A7A;
    --info-dim: rgba(26,74,122,.08);
    --radius: 6px;
    --radius2: 10px;
  }

  body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; font-size: 14px; }

  input, textarea, select {
    font-family: 'Inter', sans-serif;
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text);
    border-radius: var(--radius);
    padding: 10px 14px;
    font-size: 13px;
    width: 100%;
    outline: none;
    transition: border-color .2s, box-shadow .2s;
    -webkit-appearance: none;
  }
  input:focus, textarea:focus, select:focus { border-color: var(--text); box-shadow: 0 0 0 3px rgba(26,25,22,.07); }
  input::placeholder, textarea::placeholder { color: var(--text3); }
  textarea { resize: vertical; min-height: 80px; line-height: 1.6; }
  select { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236B6860' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px; cursor: pointer; }
  select option { background: #fff; }

  button {
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    cursor: pointer;
    border: none;
    border-radius: var(--radius);
    transition: all .18s;
    font-size: 13px;
    letter-spacing: .01em;
  }
  button:active { transform: scale(.98); }

  .btn-primary {
    background: var(--accent);
    color: #fff;
    padding: 10px 20px;
    font-weight: 500;
  }
  .btn-primary:hover { background: var(--accent2); }

  .btn-ghost {
    background: transparent;
    color: var(--text2);
    padding: 9px 16px;
    border: 1px solid var(--border);
  }
  .btn-ghost:hover { border-color: var(--border2); color: var(--text); background: var(--surface2); }

  .btn-danger {
    background: var(--danger-dim);
    color: var(--danger);
    padding: 9px 16px;
    border: 1px solid rgba(192,57,43,.18);
  }
  .btn-danger:hover { background: rgba(192,57,43,.14); }

  label { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: .07em; color: var(--text2); display: block; margin-bottom: 6px; text-transform: uppercase; }

  .field { margin-bottom: 18px; }

  .scrollbar::-webkit-scrollbar { width: 4px; }
  .scrollbar::-webkit-scrollbar-track { background: transparent; }
  .scrollbar::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }

  @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideIn { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }
  .fadein { animation: fadeIn .22s ease both; }
  .slidein { animation: slideIn .2s ease both; }

  /* checkbox */
  .check-pill {
    display: flex; align-items: center; gap: 10px;
    cursor: pointer; user-select: none;
    font-family: 'Inter', sans-serif; font-size: 13px; color: var(--text2);
  }
  .check-pill input { display:none; }
  .check-box {
    width: 18px; height: 18px; border-radius: 4px;
    border: 1.5px solid var(--border2); background: var(--surface);
    display: flex; align-items: center; justify-content: center;
    transition: all .15s; flex-shrink: 0;
  }
  .check-pill input:checked ~ .check-box { background: var(--accent); border-color: var(--accent); }
  .check-pill input:checked ~ span { color: var(--text); }

  /* tag */
  .tag {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 9px; border-radius: 4px;
    font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 500;
    letter-spacing: .03em;
  }
  .tag-urgent { background: var(--danger-dim); color: var(--danger); border: 1px solid rgba(192,57,43,.18); }

  /* modal backdrop */
  .modal-backdrop {
    position: fixed; inset: 0; background: rgba(26,25,22,.5);
    display: flex; align-items: center; justify-content: center;
    z-index: 100; padding: 20px;
    backdrop-filter: blur(6px);
  }
  .modal {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius2); padding: 32px;
    width: 100%; max-width: 520px; max-height: 88vh; overflow-y: auto;
    animation: fadeIn .2s ease;
    box-shadow: 0 20px 60px rgba(26,25,22,.12);
  }
  .modal-title {
    font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 600;
    margin-bottom: 24px; display: flex; align-items: center; gap: 10px;
    letter-spacing: -.01em;
  }

  /* nav item */
  .nav-pill {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 14px; border-radius: var(--radius);
    cursor: pointer; transition: all .15s;
    font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 400;
    color: var(--text2); background: transparent;
  }
  .nav-pill:hover { background: var(--surface2); color: var(--text); }
  .nav-pill.active { background: var(--accent-dim); color: var(--text); font-weight: 500; }

  /* task card */
  .task-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius2); padding: 20px 22px;
    transition: border-color .2s, box-shadow .2s;
    cursor: pointer;
  }
  .task-card:hover { border-color: var(--border2); box-shadow: 0 4px 16px rgba(26,25,22,.06); }
  .task-card.urgent { border-left: 2px solid var(--danger); }

  .status-pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 10px; border-radius: 4px;
    font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 500;
    cursor: pointer; transition: all .15s;
    letter-spacing: .02em;
  }
  .status-dot { width: 6px; height: 6px; border-radius: 50%; }

  .member-chip {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 4px; padding: 3px 9px;
    font-family: 'Inter', monospace; font-size: 11px; color: var(--text2);
    font-weight: 500;
  }

  .comment-bubble {
    background: var(--surface2); border-radius: var(--radius);
    padding: 12px 14px; margin-bottom: 10px;
    border-left: 2px solid var(--border2);
  }
  .comment-meta { font-size: 11px; color: var(--text3); margin-bottom: 5px; font-family: 'Inter', sans-serif; font-weight: 500; }
  .comment-text { font-size: 13px; color: var(--text2); line-height: 1.6; }

  /* login */
  .login-wrap {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: var(--bg);
    background-image: radial-gradient(ellipse 70% 50% at 50% -10%, rgba(26,25,22,.04), transparent);
  }
  .login-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius2); padding: 44px 40px;
    width: 100%; max-width: 380px;
    animation: fadeIn .3s ease;
    box-shadow: 0 8px 40px rgba(26,25,22,.08);
  }

  .divider { height: 1px; background: var(--border); margin: 22px 0; }

  .overview-stat {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius2); padding: 20px 24px;
    text-align: left;
  }
  .overview-stat-num {
    font-family: 'Cormorant Garamond', serif; font-size: 38px; font-weight: 500;
    color: var(--text); line-height: 1;
  }
  .overview-stat-label {
    font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 500;
    color: var(--text3); text-transform: uppercase; letter-spacing: .08em; margin-top: 6px;
  }

  .progress-bar-bg { background: var(--surface2); border-radius: 99px; height: 3px; overflow: hidden; }
  .progress-bar-fill { height: 100%; border-radius: 99px; background: var(--text); transition: width .4s ease; }

  /* password input wrapper */
  .pw-wrap { position: relative; }
  .pw-wrap input { padding-right: 40px; }
  .pw-eye { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: transparent; color: var(--text3); padding: 0; display: flex; }
  .pw-eye:hover { color: var(--text); }

  /* empty state */
  .empty { text-align: center; padding: 70px 20px; color: var(--text3); }
  .empty-icon { font-size: 36px; margin-bottom: 14px; }
  .empty-label { font-family: 'Cormorant Garamond', serif; font-size: 18px; font-style: italic; color: var(--text2); }

  /* scrollable list */
  .scroll-list { overflow-y: auto; max-height: calc(100vh - 200px); padding-right: 4px; }

  .page-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 28px; gap: 16px;
  }
  .page-title {
    font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 600;
    letter-spacing: -.02em; line-height: 1.2;
  }
  .page-title em { font-style: italic; }
  .subtitle { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 400; color: var(--text3); margin-top: 4px; }

  /* grid helpers */
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
  @media (max-width: 640px) { .grid-4 { grid-template-columns: 1fr 1fr; } .grid-2 { grid-template-columns: 1fr; } }

  .flex { display: flex; }
  .flex-col { display: flex; flex-direction: column; }
  .items-center { align-items: center; }
  .justify-between { justify-content: space-between; }
  .gap-8 { gap: 8px; }
  .gap-12 { gap: 12px; }
  .gap-16 { gap: 16px; }
  .flex-1 { flex: 1; }
  .text-sm { font-size: 12px; color: var(--text3); }
  .text-mono { font-family: 'Inter', monospace; }
  .font-syne { font-family: 'Cormorant Garamond', serif; }
  .font-bold { font-weight: 600; }
  .mb-4 { margin-bottom: 4px; }
  .mb-8 { margin-bottom: 8px; }
  .mb-12 { margin-bottom: 12px; }
  .mb-16 { margin-bottom: 16px; }
  .mt-8 { margin-top: 8px; }
  .mt-12 { margin-top: 12px; }
  .w-full { width: 100%; }
  .flex-wrap { flex-wrap: wrap; }

  /* sidebar layout */
  .app-layout { display: flex; min-height: 100vh; }
  .sidebar {
    width: 230px; min-height: 100vh; flex-shrink: 0;
    background: var(--surface); border-right: 1px solid var(--border);
    display: flex; flex-direction: column; padding: 28px 16px;
    position: sticky; top: 0; height: 100vh; overflow-y: auto;
  }
  .sidebar-logo { display: flex; align-items: center; gap: 8px; margin-bottom: 36px; padding: 0 6px; }
  .sidebar-logo-text { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 600; color: var(--text); letter-spacing: -.01em; }
  .sidebar-logo-sub { font-size: 10px; color: var(--text3); font-family: 'Inter', sans-serif; letter-spacing: .03em; }
  .sidebar-section { font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: var(--text3); padding: 0 14px; margin-bottom: 6px; margin-top: 22px; }
  .main-content { flex: 1; padding: 40px 40px 48px; overflow-x: hidden; background: var(--bg); }
  .sidebar-bottom { margin-top: auto; padding-top: 20px; border-top: 1px solid var(--border); }

  @media (max-width: 768px) {
    .sidebar { width: 60px; padding: 16px 8px; }
    .sidebar-logo-text, .sidebar-logo-sub, .nav-pill span, .sidebar-section { display: none; }
    .nav-pill { padding: 10px; justify-content: center; }
    .main-content { padding: 24px 18px; }
    .sidebar-logo { justify-content: center; }
  }
`;

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function isOverdue(deadline) {
  if (!deadline) return false;
  return new Date(deadline) < new Date() && new Date(deadline).toDateString() !== new Date().toDateString();
}

// ── Password input ────────────────────────────────────────────────────────────
function PasswordInput({ value, onChange, placeholder = "Password" }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pw-wrap">
      <input type={show ? "text" : "password"} value={value} onChange={onChange} placeholder={placeholder} />
      <button className="pw-eye" type="button" onClick={() => setShow(s => !s)}>
        {show ? <Icon.EyeOff /> : <Icon.Eye />}
      </button>
    </div>
  );
}

// ── Status Pill ───────────────────────────────────────────────────────────────
function StatusPill({ status, onClick, readonly }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.incomplete;
  return (
    <span
      className="status-pill"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
      onClick={readonly ? undefined : onClick}
      title={readonly ? "" : "Click to change"}
    >
      <span className="status-dot" style={{ background: c.dot }} />
      {status}
    </span>
  );
}

// ── Task Detail Modal ─────────────────────────────────────────────────────────
function TaskModal({ task, currentUser, onClose, onUpdateStatus, onAddComment }) {
  const [comment, setComment] = useState("");
  const [cycleing, setCycleing] = useState(false);

  function cycleStatus() {
    const idx = STATUS_LABELS.indexOf(task.status);
    const next = STATUS_LABELS[(idx + 1) % STATUS_LABELS.length];
    onUpdateStatus(task.id, next);
    setCycleing(true);
    setTimeout(() => setCycleing(false), 300);
  }

  function submitComment() {
    if (!comment.trim()) return;
    onAddComment(task.id, comment.trim());
    setComment("");
  }

  const isAdmin = currentUser.role === "admin";
  const canChangeStatus = !isAdmin;

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal scrollbar fadein">
        <div className="flex items-center justify-between mb-16">
          <div className="modal-title" style={{ margin: 0 }}>
            {task.urgent && <span className="tag tag-urgent"><Icon.Urgent /> Urgent</span>}
            <span style={{ flex: 1 }}>{task.title}</span>
          </div>
          <button className="btn-ghost" style={{ padding: "6px 12px" }} onClick={onClose}>✕</button>
        </div>

        <div className="flex items-center gap-8 flex-wrap mb-16">
          <StatusPill status={task.status} onClick={canChangeStatus ? cycleStatus : undefined} readonly={isAdmin} />
          <span className="member-chip"><Icon.User /> {task.assignedTo}</span>
          {task.deadline && (
            <span className="member-chip" style={{ color: isOverdue(task.deadline) ? "var(--danger)" : "var(--text2)" }}>
              <Icon.Clock /> {formatDate(task.deadline)}{isOverdue(task.deadline) ? " · overdue" : ""}
            </span>
          )}
        </div>

        {!isAdmin && (
          <div className="mb-16">
            <label>Change Status</label>
            <div className="flex gap-8 flex-wrap">
              {STATUS_LABELS.map(s => (
                <button
                  key={s}
                  onClick={() => onUpdateStatus(task.id, s)}
                  style={{
                    padding: "7px 14px", borderRadius: "99px",
                    background: task.status === s ? STATUS_COLORS[s].bg : "var(--surface2)",
                    color: task.status === s ? STATUS_COLORS[s].text : "var(--text3)",
                    border: `1.5px solid ${task.status === s ? STATUS_COLORS[s].border : "var(--border)"}`,
                    fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer",
                  }}
                >{s}</button>
              ))}
            </div>
          </div>
        )}

        {task.description && (
          <div className="mb-16">
            <label>Description</label>
            <div style={{ background: "var(--surface2)", borderRadius: 8, padding: "12px 14px", fontSize: 13, color: "var(--text2)", lineHeight: 1.7 }}>
              {task.description}
            </div>
          </div>
        )}

        <div className="divider" />

        <div className="mb-12">
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon.Comment /> Comments ({task.comments.length})</label>
          {task.comments.length === 0 && <div style={{ color: "var(--text3)", fontSize: 12, padding: "8px 0" }}>No comments yet.</div>}
          {task.comments.map((c, i) => (
            <div className="comment-bubble" key={i}>
              <div className="comment-meta">{c.author} · {new Date(c.at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
              <div className="comment-text">{c.text}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-8">
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Add a comment..."
            style={{ minHeight: 60, flex: 1 }}
            onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) submitComment(); }}
          />
          <button className="btn-primary" style={{ alignSelf: "flex-end" }} onClick={submitComment}>Send</button>
        </div>
        <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>Ctrl+Enter to send</div>
      </div>
    </div>
  );
}

// ── Create Task Modal ─────────────────────────────────────────────────────────
function CreateTaskModal({ members, lockedTo, onClose, onCreate }) {
  const [form, setForm] = useState({ title: "", description: "", deadline: "", urgent: false, assignedTo: lockedTo?.id || members[0]?.id || "" });
  const [err, setErr] = useState("");

  function submit() {
    if (!form.title.trim()) { setErr("Task title is required."); return; }
    onCreate({ ...form, title: form.title.trim(), description: form.description.trim() });
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal scrollbar fadein">
        <div className="modal-title">
          <Icon.Plus /> New Task
        </div>

        {lockedTo && (
          <div style={{ background: "var(--accent-dim)", border: "1.5px solid rgba(245,166,35,.25)", borderRadius: 10, padding: "10px 14px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <Icon.User />
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 600 }}>Assigning to <span style={{ color: "var(--accent)" }}>{lockedTo.name}</span></span>
            <span className="member-chip" style={{ marginLeft: "auto" }}>{lockedTo.id}</span>
          </div>
        )}

        <div className="field">
          <label>Task Title *</label>
          <input placeholder="What needs to be done?" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
        </div>

        <div className="field">
          <label>Description</label>
          <textarea placeholder="Add details, context, instructions..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>

        <div className={lockedTo ? "" : "grid-2"}>
          <div className="field">
            <label>Deadline (optional)</label>
            <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
          </div>
          {!lockedTo && (
            <div className="field">
              <label>Assign To *</label>
              <select value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}>
                {members.map(m => <option key={m.id} value={m.id}>{m.name} ({m.id})</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="field">
          <label className="check-pill">
            <input type="checkbox" checked={form.urgent} onChange={e => setForm(f => ({ ...f, urgent: e.target.checked }))} />
            <span className="check-box"><Icon.Urgent /></span>
            <span>Mark as Urgent</span>
          </label>
        </div>

        {err && <div style={{ color: "var(--danger)", fontSize: 12, marginBottom: 14, fontFamily: "'Syne', sans-serif" }}>{err}</div>}

        <div className="flex gap-8" style={{ justifyContent: "flex-end" }}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit}>Create Task</button>
        </div>
      </div>
    </div>
  );
}

// ── Reset Password Modal ──────────────────────────────────────────────────────
function ResetPasswordModal({ users, onClose, onReset }) {
  const [sel, setSel] = useState(users[0]?.id || "");
  const [pw, setPw] = useState("");
  const [done, setDone] = useState(false);

  function submit() {
    if (!pw.trim()) return;
    onReset(sel, pw.trim());
    setDone(true);
    setPw("");
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fadein">
        <div className="modal-title"><Icon.Key /> Reset Password</div>

        <div className="field">
          <label>Select Member</label>
          <select value={sel} onChange={e => { setSel(e.target.value); setDone(false); }}>
            {users.map(u => <option key={u.id} value={u.id}>{u.id} · {u.name}</option>)}
          </select>
        </div>

        <div className="field">
          <label>New Password</label>
          <PasswordInput value={pw} onChange={e => { setPw(e.target.value); setDone(false); }} placeholder="Enter new password" />
        </div>

        {done && <div style={{ color: "var(--success)", fontSize: 12, marginBottom: 14, fontFamily: "'Syne', sans-serif" }}>✓ Password updated for {sel}</div>}

        <div className="flex gap-8" style={{ justifyContent: "flex-end" }}>
          <button className="btn-ghost" onClick={onClose}>Close</button>
          <button className="btn-primary" onClick={submit}>Update Password</button>
        </div>
      </div>
    </div>
  );
}

// ── Task Card ─────────────────────────────────────────────────────────────────
function TaskCard({ task, members = [], onClick }) {
  const memberName = members.find(m => m.id === task.assignedTo)?.name || task.assignedTo;
  const c = STATUS_COLORS[task.status];
  return (
    <div className={`task-card fadein ${task.urgent ? "urgent" : ""}`} onClick={onClick} style={{ marginBottom: 12 }}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-8 flex-wrap">
          <StatusPill status={task.status} readonly />
          {task.urgent && <span className="tag tag-urgent"><Icon.Urgent /> Urgent</span>}
        </div>
        <span className="text-sm" style={{ fontSize: 11 }}>#{task.id}</span>
      </div>

      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 6, lineHeight: 1.4 }}>
        {task.title}
      </div>

      {task.description && (
        <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {task.description}
        </div>
      )}

      <div className="flex items-center justify-between" style={{ marginTop: 10 }}>
        <div className="flex items-center gap-8">
          <span className="member-chip"><Icon.User /> {memberName}</span>
          {task.comments.length > 0 && (
            <span className="member-chip"><Icon.Comment /> {task.comments.length}</span>
          )}
        </div>
        {task.deadline && (
          <span style={{ fontSize: 11, fontFamily: "'Inter', sans-serif", color: isOverdue(task.deadline) ? "var(--danger)" : "var(--text3)" }}>
            <Icon.Clock /> {formatDate(task.deadline)}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Admin Overview ────────────────────────────────────────────────────────────
function AdminOverview({ tasks, members }) {
  const all = tasks;
  const done = all.filter(t => t.status === "done").length;
  const inprog = all.filter(t => t.status === "in progress").length;
  const incomplete = all.filter(t => t.status === "incomplete").length;
  const urgent = all.filter(t => t.urgent).length;

  return (
    <div className="fadein">
      <div className="page-header">
        <div>
          <div className="page-title"><em>Overview</em></div>
          <div className="subtitle">{all.length} total tasks across all members</div>
        </div>
      </div>

      <div className="grid-4 mb-16">
        {[
          { label: "Total", num: all.length, color: "var(--text)" },
          { label: "Done", num: done, color: "var(--success)" },
          { label: "In Progress", num: inprog, color: "var(--info)" },
          { label: "Urgent", num: urgent, color: "var(--danger)" },
        ].map(s => (
          <div className="overview-stat" key={s.label}>
            <div className="overview-stat-num" style={{ color: s.color }}>{s.num}</div>
            <div className="overview-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 14, color: "var(--text2)", textTransform: "uppercase", letterSpacing: ".06em" }}>
        Per Member
      </div>

      {members.map(m => {
        const mt = tasks.filter(t => t.assignedTo === m.id);
        const md = mt.filter(t => t.status === "done").length;
        const pct = mt.length ? Math.round((md / mt.length) * 100) : 0;
        return (
          <div key={m.id} style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 12, padding: "16px 20px", marginBottom: 10 }}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-8">
                <span className="member-chip"><Icon.User /> {m.id}</span>
                <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 13 }}>{m.name}</span>
              </div>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--text3)" }}>{md}/{mt.length} done · {pct}%</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex gap-8 flex-wrap mt-8">
              {STATUS_LABELS.map(s => {
                const cnt = mt.filter(t => t.status === s).length;
                if (!cnt) return null;
                const c = STATUS_COLORS[s];
                return (
                  <span key={s} className="tag" style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
                    {cnt} {s}
                  </span>
                );
              })}
              {mt.filter(t => t.urgent).length > 0 && (
                <span className="tag tag-urgent"><Icon.Urgent /> {mt.filter(t => t.urgent).length} urgent</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Add Member Modal ──────────────────────────────────────────────────────────
function AddMemberModal({ existingUsers, onClose, onAdd }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [added, setAdded] = useState(null);

  // Compute next Hive ID automatically
  const nextId = (() => {
    const nums = existingUsers
      .map(u => u.id.match(/^Hive(\d+)$/i)?.[1])
      .filter(Boolean)
      .map(Number);
    const next = nums.length ? Math.max(...nums) + 1 : 1;
    return `Hive${String(next).padStart(3, "0")}`;
  })();

  function submit() {
    if (!name.trim()) { setErr("Display name is required."); return; }
    if (!password.trim()) { setErr("Password is required."); return; }
    const newMember = {
      id: nextId,
      password: password.trim(),
      name: name.trim(),
      role: "member",
    };
    onAdd(newMember);
    setAdded(newMember);
    setName(""); setPassword(""); setErr("");
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fadein">
        <div className="modal-title"><Icon.UserPlus /> Add New Member</div>

        <div style={{
          background: "var(--accent-dim)", border: "1.5px solid rgba(245,166,35,.25)",
          borderRadius: 10, padding: "10px 14px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".08em" }}>Auto ID</span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, fontWeight: 500, color: "var(--accent)" }}>{nextId}</span>
          <span style={{ fontSize: 11, color: "var(--text3)", marginLeft: "auto" }}>assigned automatically</span>
        </div>

        <div className="field">
          <label>Display Name *</label>
          <input
            placeholder="e.g. Alex Johnson"
            value={name}
            onChange={e => { setName(e.target.value); setErr(""); setAdded(null); }}
            autoFocus
          />
        </div>

        <div className="field">
          <label>Password *</label>
          <PasswordInput
            value={password}
            onChange={e => { setPassword(e.target.value); setErr(""); setAdded(null); }}
            placeholder="Set a password for this member"
          />
        </div>

        {err && <div style={{ color: "var(--danger)", fontSize: 12, marginBottom: 14, fontFamily: "'Syne', sans-serif" }}>{err}</div>}

        {added && (
          <div style={{ color: "var(--success)", fontSize: 12, marginBottom: 14, fontFamily: "'Syne', sans-serif", lineHeight: 1.7 }}>
            ✓ <strong>{added.name}</strong> added as <strong>{added.id}</strong>. They can now log in.
          </div>
        )}

        <div className="flex gap-8" style={{ justifyContent: "flex-end" }}>
          <button className="btn-ghost" onClick={onClose}>Close</button>
          <button className="btn-primary" onClick={submit}>Add Member</button>
        </div>
      </div>
    </div>
  );
}

// ── Rename Members Modal ──────────────────────────────────────────────────────
function RenameMembersModal({ users, onClose, onRename }) {
  const [names, setNames] = useState(() =>
    Object.fromEntries(users.map(u => [u.id, u.name]))
  );
  const [saved, setSaved] = useState(false);

  function submit() {
    const trimmed = Object.fromEntries(
      Object.entries(names).map(([id, n]) => [id, n.trim() || id])
    );
    onRename(trimmed);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fadein">
        <div className="modal-title"><Icon.Edit /> Rename Members</div>

        {users.map(u => (
          <div className="field" key={u.id}>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="member-chip" style={{ marginBottom: 0 }}>{u.id}</span>
              Display Name
            </label>
            <input
              value={names[u.id]}
              onChange={e => { setNames(n => ({ ...n, [u.id]: e.target.value })); setSaved(false); }}
              placeholder={u.id}
            />
          </div>
        ))}

        {saved && (
          <div style={{ color: "var(--success)", fontSize: 12, marginBottom: 14, fontFamily: "'Syne', sans-serif" }}>
            ✓ Names updated successfully
          </div>
        )}

        <div className="flex gap-8" style={{ justifyContent: "flex-end" }}>
          <button className="btn-ghost" onClick={onClose}>Close</button>
          <button className="btn-primary" onClick={submit}>Save Names</button>
        </div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [data, setData] = useState(() => loadData());
  const [currentUser, setCurrentUser] = useState(null);
  const [loginId, setLoginId] = useState("");
  const [loginPw, setLoginPw] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [page, setPage] = useState("tasks");
  const [showCreate, setShowCreate] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterMember, setFilterMember] = useState("all");

  useEffect(() => { saveData(data); }, [data]);

  function login() {
    const user = data.users.find(u => u.id === loginId && u.password === loginPw);
    if (!user) { setLoginErr("Invalid ID or password."); return; }
    setCurrentUser(user);
    setLoginId(""); setLoginPw(""); setLoginErr("");
    setPage(user.role === "admin" ? "overview" : "tasks");
  }

  function logout() { setCurrentUser(null); setPage("tasks"); }

  function createTask(form) {
    const task = {
      id: data.nextTaskId,
      title: form.title,
      description: form.description,
      deadline: form.deadline,
      urgent: form.urgent,
      assignedTo: form.assignedTo,
      status: "incomplete",
      comments: [],
      createdAt: new Date().toISOString(),
    };
    setData(d => ({ ...d, tasks: [task, ...d.tasks], nextTaskId: d.nextTaskId + 1 }));
    setShowCreate(false);
  }

  function updateStatus(taskId, status) {
    setData(d => ({ ...d, tasks: d.tasks.map(t => t.id === taskId ? { ...t, status } : t) }));
    if (selectedTask?.id === taskId) setSelectedTask(t => ({ ...t, status }));
  }

  function addComment(taskId, text) {
    const comment = { author: currentUser.id, text, at: new Date().toISOString() };
    setData(d => ({ ...d, tasks: d.tasks.map(t => t.id === taskId ? { ...t, comments: [...t.comments, comment] } : t) }));
    if (selectedTask?.id === taskId) setSelectedTask(t => ({ ...t, comments: [...t.comments, comment] }));
  }

  function resetPassword(userId, pw) {
    setData(d => ({ ...d, users: d.users.map(u => u.id === userId ? { ...u, password: pw } : u) }));
    setCurrentUser(cu => cu?.id === userId ? { ...cu, password: pw } : cu);
  }

  function renameMembers(nameMap) {
    setData(d => ({ ...d, users: d.users.map(u => nameMap[u.id] !== undefined ? { ...u, name: nameMap[u.id] } : u) }));
  }

  function addMember(newMember) {
    setData(d => ({ ...d, users: [...d.users, newMember] }));
  }

  function clearDoneTasks() {
    setData(d => ({ ...d, tasks: d.tasks.filter(t => t.status !== "done") }));
  }

  // ── Login Screen ─────────────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="login-wrap">
          <div className="login-card">
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600, letterSpacing: "-.01em" }}>Hive <em style={{ fontStyle: "italic" }}>Inc.</em></div>
            </div>

            <div className="divider" />

            <div className="field mt-12">
              <label>Access ID</label>
              <input
                placeholder="Admin / Hive001 / Hive002..."
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
                onKeyDown={e => e.key === "Enter" && login()}
              />
            </div>

            <div className="field">
              <label>Password</label>
              <PasswordInput value={loginPw} onChange={e => setLoginPw(e.target.value)} />
            </div>

            {loginErr && <div style={{ color: "var(--danger)", fontSize: 12, marginBottom: 14, fontFamily: "'Inter', sans-serif" }}>{loginErr}</div>}

            <button className="btn-primary w-full" style={{ padding: "12px", borderRadius: 6 }} onClick={login}>Sign In</button>


          </div>
        </div>
      </>
    );
  }

  const isAdmin = currentUser.role === "admin";
  const members = data.users.filter(u => u.role === "member");

  // tasks visible to this user
  let visibleTasks = isAdmin
    ? (filterMember === "all" ? data.tasks : data.tasks.filter(t => t.assignedTo === filterMember))
    : data.tasks.filter(t => t.assignedTo === currentUser.id);

  // Sort: urgent first, then by creation
  visibleTasks = [...visibleTasks].sort((a, b) => {
    if (a.urgent && !b.urgent) return -1;
    if (!a.urgent && b.urgent) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const navItems = isAdmin
    ? [
        { id: "overview", label: "Overview", icon: <Icon.Overview /> },
        { id: "tasks", label: "All Tasks", icon: <Icon.Task /> },
      ]
    : [
        { id: "tasks", label: "My Tasks", icon: <Icon.Task /> },
      ];

  return (
    <>
      <style>{STYLES}</style>

      <div className="app-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <Icon.Hexagon />
            <div>
              <div className="sidebar-logo-text">Hive<em style={{fontStyle:"italic"}}>Board</em></div>
              <div className="sidebar-logo-sub">Task Manager</div>
            </div>
          </div>

          <div className="sidebar-section">Navigation</div>
          {navItems.map(n => (
            <div key={n.id} className={`nav-pill ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
              {n.icon} <span>{n.label}</span>
            </div>
          ))}

          {isAdmin && (
            <>
              <div className="sidebar-section">Admin</div>
              <div className="nav-pill" onClick={() => setShowReset(true)}>
                <Icon.Key /> <span>Reset Password</span>
              </div>
              <div className="nav-pill" onClick={() => setShowRename(true)}>
                <Icon.Edit /> <span>Rename Members</span>
              </div>
              <div className="nav-pill" onClick={() => setShowAddMember(true)}>
                <Icon.UserPlus /> <span>Add Member</span>
              </div>
            </>
          )}

          <div className="sidebar-bottom">
            <div style={{ padding: "0 8px", marginBottom: 10 }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 15 }}>{currentUser.name || currentUser.id}</div>
              <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "'Inter', sans-serif" }}>{currentUser.id}</div>
            </div>
            <div className="nav-pill" onClick={logout}><Icon.Logout /> <span>Sign Out</span></div>
          </div>
        </aside>

        {/* Main */}
        <main className="main-content scrollbar">

          {/* Overview (admin only) */}
          {page === "overview" && isAdmin && (
            <AdminOverview tasks={data.tasks} members={members} />
          )}

          {/* Tasks Page */}
          {page === "tasks" && (
            <div className="fadein">
              <div className="page-header">
                <div>
                  <div className="page-title">{isAdmin ? <>All <em>Tasks</em></> : <>My <em>Tasks</em></>}</div>
                  <div className="subtitle">{visibleTasks.length} task{visibleTasks.length !== 1 ? "s" : ""}</div>
                </div>
                <div className="flex gap-8 items-center">
                  {isAdmin && data.tasks.some(t => t.status === "done") && (
                    <button className="btn-danger" style={{ display: "flex", alignItems: "center", gap: 6 }} onClick={clearDoneTasks}>
                      <Icon.Trash /> Clear Completed
                    </button>
                  )}
                  <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 6 }} onClick={() => setShowCreate(true)}>
                    <Icon.Plus /> New Task
                  </button>
                </div>
              </div>

              {/* Member filter (admin) */}
              {isAdmin && (
                <div className="flex gap-8 flex-wrap mb-16">
                  {[{ id: "all", name: "All Members" }, ...members].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setFilterMember(m.id)}
                      style={{
                        padding: "7px 14px", borderRadius: 99, cursor: "pointer",
                        fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 12,
                        background: filterMember === m.id ? "var(--accent-dim)" : "var(--surface2)",
                        color: filterMember === m.id ? "var(--accent)" : "var(--text3)",
                        border: `1.5px solid ${filterMember === m.id ? "var(--accent)" : "var(--border)"}`,
                        transition: "all .15s",
                      }}
                    >{m.id === "all" ? "All Members" : `${m.name} · ${m.id}`}</button>
                  ))}
                </div>
              )}

              {visibleTasks.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">🪐</div>
                  <div className="empty-label">No tasks {isAdmin ? "yet — create one!" : "assigned to you yet."}</div>
                </div>
              ) : (
                visibleTasks.map(t => (
                  <TaskCard key={t.id} task={t} members={members} onClick={() => setSelectedTask(t)} />
                ))
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateTaskModal
          members={data.users.filter(u => u.role === "member")}
          lockedTo={!isAdmin ? currentUser : null}
          onClose={() => setShowCreate(false)}
          onCreate={createTask}
          key={JSON.stringify(data.users.map(u => u.name))}
        />
      )}

      {showReset && (
        <ResetPasswordModal
          users={data.users}
          onClose={() => setShowReset(false)}
          onReset={resetPassword}
        />
      )}

      {showRename && (
        <RenameMembersModal
          users={data.users.filter(u => u.role === "member")}
          onClose={() => setShowRename(false)}
          onRename={renameMembers}
        />
      )}

      {showAddMember && (
        <AddMemberModal
          existingUsers={data.users}
          onClose={() => setShowAddMember(false)}
          onAdd={addMember}
        />
      )}

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          currentUser={currentUser}
          onClose={() => setSelectedTask(null)}
          onUpdateStatus={updateStatus}
          onAddComment={addComment}
        />
      )}
    </>
  );
}
