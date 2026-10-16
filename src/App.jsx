import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const TOOLS = [
  { id: 'json', name: 'JSON Studio', description: 'Format, validate, explore, and compare JSON documents.', category: 'Data', icon: 'braces' },
  { id: 'encoding', name: 'Encoding Toolkit', description: 'Encode and decode Base64 or URL-safe text.', category: 'Data', icon: 'code' },
  { id: 'password', name: 'Password Generator', description: 'Generate strong passwords with secure randomness.', category: 'Security', icon: 'key' },
  { id: 'uuid', name: 'UUID Generator', description: 'Create one or a batch of unique version 4 identifiers.', category: 'Security', icon: 'hash' },
  { id: 'text', name: 'Text & Regex Lab', description: 'Analyze writing and test regular expressions safely.', category: 'Text', icon: 'type' },
  { id: 'timestamp', name: 'Timestamp Converter', description: 'Convert Unix timestamps and local date/time values.', category: 'Date & Time', icon: 'clock' },
  { id: 'api', name: 'API Request Tester', description: 'Send and inspect HTTP requests directly from your browser.', category: 'Network', icon: 'globe' },
  { id: 'snippets', name: 'Code Snippet Library', description: 'Keep reusable code snippets organized on this device.', category: 'Workspace', icon: 'file' },
];

const SAMPLE_JSON = `{
  "project": "DevToolbox",
  "version": 1,
  "private": true,
  "features": ["format", "compare", "build"],
  "settings": { "theme": "dark", "localOnly": true }
}`;
const STORAGE = {
  theme: 'devtoolbox.theme',
  favorites: 'devtoolbox.favorites',
  recents: 'devtoolbox.recents',
  snippets: 'devtoolbox.snippets',
  apiHistory: 'devtoolbox.apiHistory',
};

function readStored(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch (error) {
    console.error(`Unable to read ${key} from local storage.`, error);
    return fallback;
  }
}

function useStoredState(key, fallback, validate = (value) => value) {
  const [value, setValue] = useState(() => {
    const stored = readStored(key, fallback);
    const validated = validate(stored);
    if (JSON.stringify(stored) !== JSON.stringify(validated)) console.error(`Some incompatible data in ${key} was skipped.`);
    return validated;
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Unable to save ${key} to local storage.`, error);
    }
  }, [key, value]);
  return [value, setValue];
}

function Icon({ name, size = 18 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    braces: <><path d="M8 3H6a2 2 0 0 0-2 2v3a2 2 0 0 1-2 2 2 2 0 0 1 2 2v3a2 2 0 0 0 2 2h2M16 3h2a2 2 0 0 1 2 2v3a2 2 0 0 0 2 2 2 2 0 0 0-2 2v3a2 2 0 0 1-2 2h-2" /><path d="m10 8-2 4 2 4m4-8 2 4-2 4" /></>,
    code: <><path d="m8 17-5-5 5-5m8 0 5 5-5 5m-3-12-2 14" /></>,
    key: <><circle cx="8" cy="15" r="5" /><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3" /></>,
    hash: <><path d="M4 9h16M3 15h16M10 3 8 21m8-18-2 18" /></>,
    type: <><path d="M4 7V4h16v3M9 20h6M12 4v16" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    globe: <><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8m-8 4h8" /></>,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></>,
    moon: <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    alert: <><path d="M10.3 3.9 2.5 17.4A1.8 1.8 0 0 0 4 20h16a1.8 1.8 0 0 0 1.5-2.6L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4m0 4h.01" /></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    close: <path d="m18 6-12 12M6 6l12 12" />,
    plus: <path d="M12 5v14m-7-7h14" />,
    trash: <><path d="M3 6h18m-2 0-1 14H6L5 6m3 0V4h8v2m-7 4v6m4-6v6" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5 5 5 5-5m-5 5V3" /></>,
    upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5 5-5 5 5m-5-5v12" /></>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.6 9a7 7 0 0 1 11.6-2L20 12M4 12l2.8 5a7 7 0 0 0 11.6-2" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name] || paths.grid}</svg>;
}

function Button({ children, onClick, variant = 'secondary', disabled, title, type = 'button', className = '' }) {
  return <button type={type} className={`button button-${variant} ${className}`} onClick={onClick} disabled={disabled} title={title}>{children}</button>;
}

function Panel({ children, className = '' }) {
  return <section className={`panel ${className}`}>{children}</section>;
}

function Field({ label, id, hint, children }) {
  return <div className="field"><div className="field-heading"><label htmlFor={id}>{label}</label>{hint && <span>{hint}</span>}</div>{children}</div>;
}

function ToolHeading({ tool }) {
  return <div className="page-heading">
    <div className="eyebrow"><span className="eyebrow-dot" /> {tool.category.toUpperCase()} <span className="eyebrow-divider">/</span> DEVELOPER TOOL</div>
    <h1>{tool.name}</h1><p>{tool.description}</p>
  </div>;
}

function Notice({ message, kind = 'success', onClose }) {
  if (!message) return null;
  return <div className={`notice notice-${kind}`} role={kind === 'error' ? 'alert' : 'status'}><Icon name={kind === 'error' || kind === 'warning' ? 'alert' : 'check'} size={16} /><span>{message}</span>{onClose && <button className="notice-close" onClick={onClose} aria-label="Dismiss message"><Icon name="close" size={15} /></button>}</div>;
}

async function copyText(text) {
  if (!navigator.clipboard?.writeText) throw new Error('Clipboard access is not available. Check browser permissions or use a secure context.');
  await navigator.clipboard.writeText(text);
}

function useToast() {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);
  const showToast = useCallback((message, kind = 'success') => {
    setToast({ message, kind });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3200);
  }, []);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return [toast, showToast, () => setToast(null)];
}

function ToolPage({ tool, children }) {
  return <section aria-labelledby="tool-title" className="tool-page"><ToolHeading tool={tool} />{children}</section>;
}

function JsonTreeNode({ name, value, depth = 0 }) {
  const [open, setOpen] = useState(depth < 2);
  const isArray = Array.isArray(value);
  const isObject = value !== null && typeof value === 'object';
  const entries = isObject ? Object.entries(value) : [];
  if (!isObject) return <div className="tree-line" style={{ '--depth': depth }}><span className="tree-key">{name}</span><span className={`tree-value tree-${value === null ? 'null' : typeof value}`}>{JSON.stringify(value)}</span></div>;
  return <div>
    <button className="tree-line tree-toggle" style={{ '--depth': depth }} onClick={() => setOpen((current) => !current)} aria-expanded={open}>
      <span className="tree-caret">{open ? '⌄' : '›'}</span><span className="tree-key">{name}</span><span className="tree-bracket">{isArray ? '[' : '{'}{entries.length}{isArray ? ']' : '}'}</span>
    </button>
    {open && <div>{entries.map(([key, child], index) => <JsonTreeNode key={`${depth}-${key}-${index}`} name={isArray ? `[${index}]` : key} value={child} depth={depth + 1} />)}</div>}
  </div>;
}

function compareJson(left, right, path = '$', output = []) {
  if (Object.is(left, right)) return output;
  const leftObj = left !== null && typeof left === 'object';
  const rightObj = right !== null && typeof right === 'object';
  if (leftObj && rightObj && Array.isArray(left) === Array.isArray(right)) {
    const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
    keys.forEach((key) => {
      const childPath = Array.isArray(left) ? `${path}[${key}]` : `${path}.${key}`;
      if (!Object.hasOwn(left, key)) output.push({ path: childPath, type: 'added', value: right[key] });
      else if (!Object.hasOwn(right, key)) output.push({ path: childPath, type: 'removed', value: left[key] });
      else compareJson(left[key], right[key], childPath, output);
    });
  } else {
    output.push({ path, type: 'changed', value: right, previous: left });
  }
  return output;
}

function JsonTool({ notify }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [message, setMessage] = useState(null);
  const [treeOpen, setTreeOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareInput, setCompareInput] = useState('');
  const [diff, setDiff] = useState(null);
  let parsed;
  try { if (input.trim()) parsed = JSON.parse(input); } catch { parsed = undefined; }
  const run = (mode) => {
    if (!input.trim()) { setMessage({ kind: 'error', text: 'Paste or enter JSON before running this action.' }); return; }
    try {
      const value = JSON.parse(input);
      if (mode === 'validate') setMessage({ kind: 'success', text: 'Valid JSON. The document can be parsed successfully.' });
      else {
        setOutput(JSON.stringify(value, null, mode === 'format' ? 2 : 0));
        setMessage({ kind: 'success', text: mode === 'format' ? 'JSON formatted with two-space indentation.' : 'JSON minified successfully.' });
      }
    } catch (error) {
      setOutput('');
      setMessage({ kind: 'error', text: `Invalid JSON: ${error.message}` });
    }
  };
  const compare = () => {
    try {
      if (!input.trim() || !compareInput.trim()) throw new Error('Enter valid JSON in both documents to compare them.');
      setDiff(compareJson(JSON.parse(input), JSON.parse(compareInput)));
      setMessage(null);
    } catch (error) { setMessage({ kind: 'error', text: error.message.startsWith('Enter') ? error.message : `Unable to compare: ${error.message}` }); }
  };
  const clear = () => { setInput(''); setOutput(''); setCompareInput(''); setDiff(null); setMessage(null); setTreeOpen(false); };
  const copy = async () => {
    try { if (!output) throw new Error('Format or minify JSON before copying the output.'); await copyText(output); notify('Formatted JSON copied.'); }
    catch (error) { notify(error.message, 'error'); }
  };
  return <ToolPage tool={TOOLS[0]}>
    <Panel className="workbench json-workbench">
      <div className="workbench-toolbar"><span className="toolbar-caption"><span className="live-dot" /> PROCESSED LOCALLY</span><div className="toolbar-actions"><Button onClick={() => { setInput(SAMPLE_JSON); setMessage(null); }}>Load sample</Button><Button onClick={clear}>Clear</Button></div></div>
      <div className="editor-grid">
        <Field label="INPUT JSON" id="json-input" hint={`${input.length} chars`}><textarea id="json-input" className="code-input" value={input} onChange={(event) => { setInput(event.target.value); setMessage(null); }} placeholder={'Paste JSON here…\n\n{ "hello": "world" }'} spellCheck="false" /></Field>
        <Field label="FORMATTED OUTPUT" id="json-output" hint="OUTPUT"><textarea id="json-output" className="code-input output-input" value={output} readOnly placeholder="Your result will appear here…" spellCheck="false" /></Field>
      </div>
      <Notice message={message?.text} kind={message?.kind} />
      <div className="workbench-footer"><span className="footer-hint"><Icon name="shield" size={15} /> No data leaves this device</span><div className="toolbar-actions">
        <Button variant="primary" onClick={() => run('format')}><Icon name="braces" size={16} /> Format</Button><Button onClick={() => run('minify')}>Minify</Button><Button onClick={() => run('validate')}>Validate</Button><Button onClick={copy}><Icon name="copy" size={15} /> Copy</Button>
      </div></div>
    </Panel>
    <div className="json-extras"><Button onClick={() => setTreeOpen((value) => !value)} disabled={parsed === undefined}>{treeOpen ? 'Hide JSON tree' : 'Explore JSON tree'}</Button><Button onClick={() => { setCompareOpen((value) => !value); setDiff(null); }}>{compareOpen ? 'Close comparison' : 'Compare documents'}</Button></div>
    {treeOpen && parsed !== undefined && <Panel className="tree-panel"><div className="section-title"><div><h2>JSON tree</h2><p>Expand and collapse nested values.</p></div></div><div className="json-tree"><JsonTreeNode name="root" value={parsed} /></div></Panel>}
    {compareOpen && <Panel className="compare-panel"><div className="section-title"><div><h2>Compare JSON</h2><p>Differences are listed by JSON path.</p></div><Button onClick={compare} variant="primary">Compare</Button></div>
      <label className="field-heading" htmlFor="compare-json">SECOND DOCUMENT</label><textarea id="compare-json" className="code-input compare-input" value={compareInput} onChange={(event) => setCompareInput(event.target.value)} placeholder="Paste the second JSON document…" spellCheck="false" />
      {diff && <div className="diff-list">{diff.length === 0 ? <div className="empty-state compact"><span className="empty-icon"><Icon name="check" /></span><strong>Documents match</strong><p>No differences found.</p></div> : diff.map((entry) => <div className={`diff-item diff-${entry.type}`} key={entry.path}><span className="diff-type">{entry.type}</span><code>{entry.path}</code><span>{entry.type === 'changed' ? `${JSON.stringify(entry.previous)} → ${JSON.stringify(entry.value)}` : JSON.stringify(entry.value)}</span></div>)}</div>}
    </Panel>}
  </ToolPage>;
}

function EncodingTool({ notify }) {
  const [mode, setMode] = useState('base64');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [message, setMessage] = useState(null);
  const transform = (direction) => {
    if (!input) { setMessage({ kind: 'error', text: 'Enter text to encode or decode.' }); setOutput(''); return; }
    try {
      if (mode === 'base64' && direction === 'encode') {
        const bytes = new TextEncoder().encode(input);
        let binary = '';
        for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
        setOutput(btoa(binary));
      } else if (mode === 'base64') {
        const normalized = input.replace(/\s/g, '');
        if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(normalized)) throw new Error('Invalid Base64 characters or padding. Check the input and try again.');
        const binary = atob(normalized);
        setOutput(new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(binary, (char) => char.charCodeAt(0))));
      } else {
        setOutput(direction === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input.replace(/\+/g, ' ')));
      }
      setMessage({ kind: 'success', text: `${mode === 'base64' ? 'Base64' : 'URL'} ${direction}d successfully.` });
    } catch (error) {
      setOutput('');
      setMessage({ kind: 'error', text: mode === 'base64' && direction === 'decode' ? `Unable to decode input: ${error.message}` : `Unable to decode URL text: ${error.message}` });
    }
  };
  return <ToolPage tool={TOOLS[1]}><Panel className="workbench">
    <div className="workbench-toolbar"><div className="segmented" aria-label="Encoding format"><button className={mode === 'base64' ? 'selected' : ''} onClick={() => { setMode('base64'); setMessage(null); }}>Base64</button><button className={mode === 'url' ? 'selected' : ''} onClick={() => { setMode('url'); setMessage(null); }}>URL</button></div><Button onClick={() => { setInput(''); setOutput(''); setMessage(null); }}>Clear</Button></div>
    <div className="editor-grid"><Field label="INPUT TEXT" id="encoding-input" hint={`${input.length} chars`}><textarea id="encoding-input" className="code-input" value={input} onChange={(event) => { setInput(event.target.value); setMessage(null); }} placeholder="Type or paste text to convert…" spellCheck="false" /></Field><Field label="RESULT" id="encoding-output" hint="OUTPUT"><textarea id="encoding-output" className="code-input output-input" value={output} readOnly placeholder="Your converted text will appear here…" spellCheck="false" /></Field></div>
    <Notice message={message?.text} kind={message?.kind} /><div className="workbench-footer"><span className="footer-hint"><Icon name="shield" size={15} /> UTF-8 aware · Runs locally</span><div className="toolbar-actions"><Button variant="primary" onClick={() => transform('encode')}>Encode</Button><Button onClick={() => transform('decode')}>Decode</Button><Button onClick={async () => { try { if (!output) throw new Error('Convert some text before copying.'); await copyText(output); notify('Output copied.'); } catch (error) { notify(error.message, 'error'); } }}><Icon name="copy" size={15} /> Copy output</Button></div></div>
  </Panel></ToolPage>;
}

const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?/',
};

function secureIndex(max) {
  const limit = Math.floor(256 / max) * max;
  const bytes = new Uint8Array(1);
  do { crypto.getRandomValues(bytes); } while (bytes[0] >= limit);
  return bytes[0] % max;
}

function PasswordTool({ notify }) {
  const [length, setLength] = useState(20);
  const [sets, setSets] = useState({ uppercase: true, lowercase: true, numbers: true, symbols: false });
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const generate = () => {
    const enabled = Object.keys(CHARSETS).filter((key) => sets[key]);
    if (!enabled.length) { setPassword(''); setMessage({ kind: 'error', text: 'Select at least one character set.' }); return; }
    if (!globalThis.crypto?.getRandomValues) { setMessage({ kind: 'error', text: 'Secure random number generation is not supported in this browser.' }); return; }
    const pool = enabled.map((key) => CHARSETS[key]).join('');
    const chars = enabled.map((key) => CHARSETS[key][secureIndex(CHARSETS[key].length)]);
    while (chars.length < length) chars.push(pool[secureIndex(pool.length)]);
    for (let index = chars.length - 1; index > 0; index -= 1) {
      const swap = secureIndex(index + 1);
      [chars[index], chars[swap]] = [chars[swap], chars[index]];
    }
    setPassword(chars.slice(0, length).join(''));
    setMessage({ kind: 'success', text: 'Generated securely. This password is not stored.' });
  };
  const copy = async () => { try { if (!password) throw new Error('Generate a password before copying.'); await copyText(password); notify('Password copied to clipboard.'); } catch (error) { notify(error.message, 'error'); } };
  return <ToolPage tool={TOOLS[2]}><div className="password-layout">
    <Panel className="password-settings"><div className="section-title"><div><h2>Make it yours</h2><p>Choose a length and character sets.</p></div><span className="panel-tag">SECURE</span></div>
      <Field label="PASSWORD LENGTH" id="password-length" hint={`${length} characters`}><input id="password-length" className="range-input" type="range" min="8" max="64" value={length} onChange={(event) => setLength(Number(event.target.value))} /><div className="range-ends"><span>8</span><span>64</span></div></Field>
      <div className="options-title">CHARACTER SETS</div>{Object.entries(CHARSETS).map(([key, chars]) => <label className="option-row" key={key}><span className="option-name">{key[0].toUpperCase() + key.slice(1)} <small>{key === 'uppercase' ? 'A–Z' : key === 'lowercase' ? 'a–z' : key === 'numbers' ? '0–9' : '!@#'}</small></span><input type="checkbox" checked={sets[key]} onChange={() => { setSets((current) => ({ ...current, [key]: !current[key] })); setMessage(null); }} aria-label={`Include ${key}`} /><span className="custom-check"><Icon name="check" size={13} /></span></label>)}
      <p className="privacy-line"><Icon name="shield" size={16} /> Uses cryptographically secure randomness.</p>
    </Panel>
    <Panel className="password-result"><div className="section-title"><div><h2>Your password</h2><p>Generated on this device. Never stored.</p></div></div><output className={`password-display ${password ? 'has-password' : ''}`}>{password || 'Your password will appear here'}</output>
      <div className="password-meta"><span>{password ? `${password.length} characters` : 'Ready when you are'}</span><span className="privacy-chip"><span className="live-dot" /> PRIVATE</span></div><Notice message={message?.text} kind={message?.kind} />
      <div className="toolbar-actions password-actions"><Button variant="primary" onClick={generate}><Icon name="refresh" size={15} /> Generate password</Button><Button onClick={copy} disabled={!password}><Icon name="copy" size={15} /> Copy</Button></div>
      <p className="password-footnote">Never paste passwords into untrusted websites.</p>
    </Panel></div></ToolPage>;
}

function createUuid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function UuidTool({ notify }) {
  const [amount, setAmount] = useState(5);
  const [uuids, setUuids] = useState([]);
  const [message, setMessage] = useState(null);
  const generate = () => {
    if (!globalThis.crypto?.getRandomValues) { setMessage('Secure UUID generation is unavailable in this browser.'); return; }
    setUuids(Array.from({ length: amount }, createUuid));
    setMessage(null);
  };
  const copyAll = async () => { try { if (!uuids.length) throw new Error('Generate UUIDs before copying.'); await copyText(uuids.join('\n')); notify(`${uuids.length} UUID${uuids.length === 1 ? '' : 's'} copied.`); } catch (error) { notify(error.message, 'error'); } };
  return <ToolPage tool={TOOLS[3]}><Panel className="uuid-panel"><div className="section-title"><div><h2>Unique identifiers, on demand</h2><p>Generate cryptographically random UUID version 4 values.</p></div></div>
    <div className="uuid-controls"><Field label="NUMBER TO GENERATE" id="uuid-amount" hint="1–50"><input id="uuid-amount" className="text-control small-control" type="number" min="1" max="50" value={amount} onChange={(event) => setAmount(Math.max(1, Math.min(50, Number(event.target.value) || 1)))} /></Field><div className="toolbar-actions"><Button variant="primary" onClick={generate}><Icon name="refresh" size={15} /> Generate UUIDs</Button><Button onClick={copyAll} disabled={!uuids.length}><Icon name="copy" size={15} /> Copy all</Button></div></div>
    {message && <Notice message={message} kind="error" />}
    <div className="uuid-list">{uuids.length ? uuids.map((id) => <div className="uuid-row" key={id}><code>{id}</code><Button onClick={async () => { try { await copyText(id); notify('UUID copied.'); } catch (error) { notify(error.message, 'error'); } }} title="Copy this UUID"><Icon name="copy" size={15} /></Button></div>) : <div className="empty-state compact"><span className="empty-icon"><Icon name="hash" /></span><strong>No UUIDs yet</strong><p>Choose a quantity and generate a batch.</p></div>}</div>
  </Panel></ToolPage>;
}

function RegexTester({ text }) {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [ranges, setRanges] = useState([]);
  const [status, setStatus] = useState({ kind: 'info', text: 'Enter a pattern to test against your text.' });
  const workerRef = useRef(null);
  useEffect(() => {
    if (workerRef.current) workerRef.current.terminate();
    if (!pattern) { setRanges([]); setStatus({ kind: 'info', text: 'Enter a pattern to test against your text.' }); return undefined; }
    let timeout;
    let worker;
    let workerUrl;
    try {
      const source = `self.onmessage = ({data}) => { try { const flags = [...new Set(data.flags.replace(/g/g, '') + 'g')].join(''); const regex = new RegExp(data.pattern, flags); const matches = []; let match; while ((match = regex.exec(data.text)) !== null) { matches.push({start: match.index, end: match.index + match[0].length, value: match[0]}); if (match[0] === '') regex.lastIndex++; if (matches.length >= 1000) break; } self.postMessage({matches}); } catch (error) { self.postMessage({error: error.message}); } };`;
      workerUrl = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
      worker = new Worker(workerUrl);
      workerRef.current = worker;
      timeout = setTimeout(() => { worker.terminate(); URL.revokeObjectURL(workerUrl); if (workerRef.current === worker) workerRef.current = null; setRanges([]); setStatus({ kind: 'error', text: 'This pattern took too long and was stopped. Try a simpler regular expression.' }); }, 250);
      worker.onmessage = ({ data }) => {
        clearTimeout(timeout);
        worker.terminate();
        URL.revokeObjectURL(workerUrl);
        if (workerRef.current === worker) workerRef.current = null;
        if (data.error) { setRanges([]); setStatus({ kind: 'error', text: `Regex error: ${data.error}` }); }
        else { setRanges(data.matches); setStatus({ kind: data.matches.length ? 'success' : 'info', text: data.matches.length ? `${data.matches.length}${data.matches.length === 1000 ? '+' : ''} match${data.matches.length === 1 ? '' : 'es'} found.` : 'No matches found.' }); }
      };
      worker.onerror = () => { clearTimeout(timeout); worker.terminate(); URL.revokeObjectURL(workerUrl); setStatus({ kind: 'error', text: 'The regex worker could not run this pattern.' }); };
      worker.postMessage({ pattern, flags, text });
    } catch (error) {
      if (workerUrl) URL.revokeObjectURL(workerUrl);
      setStatus({ kind: 'error', text: `Unable to start a safe regex test: ${error.message}` });
    }
    return () => { clearTimeout(timeout); if (worker) worker.terminate(); if (workerUrl) URL.revokeObjectURL(workerUrl); if (workerRef.current === worker) workerRef.current = null; };
  }, [pattern, flags, text]);
  const highlighted = [];
  let cursor = 0;
  ranges.forEach((range, index) => {
    if (range.start > cursor) highlighted.push(<span key={`text-${index}`}>{text.slice(cursor, range.start)}</span>);
    if (range.end > range.start) highlighted.push(<mark key={`match-${index}`}>{text.slice(range.start, range.end)}</mark>);
    cursor = Math.max(cursor, range.end, range.start);
  });
  if (cursor < text.length) highlighted.push(<span key="tail">{text.slice(cursor)}</span>);
  return <Panel className="regex-panel"><div className="section-title"><div><h2>Regex tester</h2><p>Pattern evaluation runs in a stoppable worker to protect the interface.</p></div></div>
    <div className="regex-controls"><Field label="PATTERN" id="regex-pattern"><input id="regex-pattern" className="text-control mono" value={pattern} onChange={(event) => setPattern(event.target.value)} placeholder="e.g. \\b\\w+@\\w+\\.\\w+\\b" /></Field><Field label="FLAGS" id="regex-flags"><input id="regex-flags" className="text-control mono flags-control" value={flags} onChange={(event) => setFlags(event.target.value)} maxLength="8" /></Field></div>
    <Notice message={status.text} kind={status.kind === 'info' ? 'info' : status.kind} /><div className="regex-preview" aria-label="Text with regular expression matches highlighted">{text ? highlighted : <span className="muted">Enter text above to preview matches.</span>}</div>
  </Panel>;
}

function TextTool() {
  const [text, setText] = useState('');
  const words = text.trim() ? text.trim().split(/\s+/u).length : 0;
  const chars = Array.from(text).length;
  const noSpaces = Array.from(text).filter((char) => !/\s/u.test(char)).length;
  const sentences = text.trim() ? (text.match(/[.!?]+(?=\s|$)/gu) || []).length : 0;
  const metrics = [['Words', words, 'Separated by whitespace'], ['Characters', chars, 'Including spaces'], ['Without spaces', noSpaces, 'Whitespace excluded'], ['Sentences', sentences, 'Estimated from punctuation']];
  const minutes = words ? Math.max(1, Math.ceil(words / 200)) : 0;
  return <ToolPage tool={TOOLS[4]}><div className="text-tool"><Panel className="text-editor-panel"><div className="text-editor-header"><div><span className="toolbar-caption"><span className="live-dot" /> LIVE ANALYSIS</span><h2>Your writing, at a glance.</h2></div><Button onClick={() => setText('')} disabled={!text}>Clear text</Button></div><label className="sr-only" htmlFor="text-input">Text to analyze</label><textarea id="text-input" className="text-input" value={text} onChange={(event) => setText(event.target.value)} placeholder="Start typing or paste your text here…" /><div className="text-editor-footer"><span>{chars.toLocaleString()} characters</span><span><Icon name="shield" size={14} /> Analysis stays on your device</span></div></Panel>
    <div className="metrics-grid">{metrics.map(([label, value, detail], index) => <Panel className="metric-card" key={label}><div className="metric-top"><span>{label}</span><span className="metric-icon"><Icon name={['type', 'code', 'braces', 'grid'][index]} size={17} /></span></div><strong>{value.toLocaleString()}</strong><span className="metric-detail">{detail}</span></Panel>)}</div>
    <Panel className="reading-card"><div className="reading-icon"><Icon name="clock" size={18} /></div><div className="reading-copy"><strong>Estimated reading time</strong><span>Based on an average pace of 200 words per minute.</span></div><div className="reading-value"><strong>{minutes}</strong><span>{minutes === 1 ? 'MINUTE' : 'MINUTES'}</span></div></Panel>
    <RegexTester text={text} /></div></ToolPage>;
}

function TimestampTool() {
  const [mode, setMode] = useState('to-date');
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local timezone';
  const convert = () => {
    setError(''); setResult(null);
    if (!input.trim()) { setError('Enter a timestamp or date/time value.'); return; }
    if (mode === 'to-date') {
      const number = Number(input);
      if (!Number.isFinite(number)) { setError('Enter a numeric Unix timestamp.'); return; }
      const milliseconds = Math.abs(number) < 1e11 ? number * 1000 : number;
      const date = new Date(milliseconds);
      if (Number.isNaN(date.getTime())) { setError('This timestamp is outside the supported date range.'); return; }
      setResult({ primary: date.toLocaleString(), iso: date.toISOString(), seconds: Math.floor(date.getTime() / 1000), milliseconds: date.getTime() });
    } else {
      const date = new Date(input);
      if (Number.isNaN(date.getTime())) { setError('Enter a valid date and time.'); return; }
      setResult({ primary: date.toLocaleString(), iso: date.toISOString(), seconds: Math.floor(date.getTime() / 1000), milliseconds: date.getTime() });
    }
  };
  return <ToolPage tool={TOOLS[5]}><Panel className="timestamp-panel"><div className="section-title"><div><h2>Time, translated</h2><p>Results display in your local timezone: <strong>{timezone}</strong></p></div></div>
    <div className="segmented timestamp-switch"><button className={mode === 'to-date' ? 'selected' : ''} onClick={() => { setMode('to-date'); setResult(null); setError(''); }}>Timestamp to date</button><button className={mode === 'to-unix' ? 'selected' : ''} onClick={() => { setMode('to-unix'); setResult(null); setError(''); }}>Date to timestamp</button></div>
    <div className="timestamp-entry"><Field label={mode === 'to-date' ? 'UNIX TIMESTAMP (SECONDS OR MILLISECONDS)' : 'DATE AND TIME'} id="timestamp-input"><input id="timestamp-input" className="text-control mono" value={input} onChange={(event) => { setInput(event.target.value); setError(''); }} placeholder={mode === 'to-date' ? 'e.g. 1729000000 or 1729000000000' : 'e.g. 2026-10-14T13:30:00'} type={mode === 'to-date' ? 'text' : 'datetime-local'} /></Field><Button variant="primary" onClick={convert}>Convert</Button></div>
    {error && <Notice message={error} kind="error" />}{result && <div className="timestamp-results"><div><span>LOCAL DATE & TIME</span><strong>{result.primary}</strong></div><div><span>ISO 8601 (UTC)</span><code>{result.iso}</code></div><div><span>UNIX SECONDS</span><code>{result.seconds}</code></div><div><span>UNIX MILLISECONDS</span><code>{result.milliseconds}</code></div></div>}
  </Panel></ToolPage>;
}

function ApiTool({ notify, history, setHistory }) {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState('{\n  "Accept": "application/json"\n}');
  const [body, setBody] = useState('{\n  \n}');
  const [includeHistory, setIncludeHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const controllerRef = useRef(null);
  useEffect(() => () => controllerRef.current?.abort(), []);
  const send = async () => {
    let target;
    let parsedHeaders;
    let parsedBody;
    try {
      target = new URL(url);
      if (!['http:', 'https:'].includes(target.protocol)) throw new Error('Only HTTP and HTTPS URLs are supported.');
      parsedHeaders = JSON.parse(headers || '{}');
      if (!parsedHeaders || Array.isArray(parsedHeaders) || typeof parsedHeaders !== 'object') throw new Error('Headers must be a JSON object.');
      if (method !== 'GET' && method !== 'DELETE' && body.trim()) parsedBody = JSON.parse(body);
    } catch (error) { notify(`Request not sent: ${error.message}`, 'error'); return; }
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(new DOMException('Request timed out after 30 seconds.', 'TimeoutError')), 30000);
    const started = performance.now();
    setLoading(true); setResponse(null);
    try {
      const requestHeaders = { ...parsedHeaders };
      if (parsedBody !== undefined && !Object.keys(requestHeaders).some((key) => key.toLowerCase() === 'content-type')) requestHeaders['Content-Type'] = 'application/json';
      const result = await fetch(target, { method, headers: requestHeaders, body: parsedBody === undefined ? undefined : JSON.stringify(parsedBody), signal: controller.signal });
      const raw = await result.text();
      let formatted = raw;
      let isJson = false;
      try { formatted = JSON.stringify(JSON.parse(raw), null, 2); isJson = true; } catch { /* Keep non-JSON responses readable as plain text. */ }
      const duration = Math.round(performance.now() - started);
      setResponse({ status: result.status, statusText: result.statusText, duration, headers: [...result.headers.entries()], body: formatted, isJson });
      if (includeHistory) {
        setHistory((current) => [{ id: createUuid(), method, url: target.href, status: result.status, at: new Date().toISOString() }, ...current].slice(0, 10));
      }
    } catch (error) {
      const timedOut = error.name === 'TimeoutError' || (error.name === 'AbortError' && loading && controller.signal.reason?.name === 'TimeoutError');
      if (controller.signal.aborted && !timedOut) notify('Request cancelled.', 'info');
      else setResponse({ error: timedOut ? 'Request timed out after 30 seconds.' : `Request failed: ${error.message || 'Network or CORS error.'} Check the URL, network, and whether the target allows browser requests (CORS).` });
    } finally {
      clearTimeout(timeoutId);
      if (controllerRef.current === controller) controllerRef.current = null;
      setLoading(false);
    }
  };
  const cancel = () => controllerRef.current?.abort();
  return <ToolPage tool={TOOLS[6]}><div className="api-layout"><Panel className="api-request"><div className="section-title"><div><h2>Request</h2><p>Requests are sent directly from your browser to the URL you enter.</p></div></div>
    <div className="request-url"><label className="sr-only" htmlFor="request-method">HTTP method</label><select id="request-method" className="text-control method-select" value={method} onChange={(event) => setMethod(event.target.value)}>{['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((item) => <option key={item}>{item}</option>)}</select><label className="sr-only" htmlFor="request-url">Request URL</label><input id="request-url" className="text-control" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://api.example.com/endpoint" type="url" /><Button variant="primary" onClick={send} disabled={loading}>{loading ? 'Sending…' : 'Send request'}</Button>{loading && <Button onClick={cancel}>Cancel</Button>}</div>
    <Field label="HEADERS (JSON)" id="request-headers" hint="Do not enter sensitive credentials"><textarea id="request-headers" className="code-input request-editor" value={headers} onChange={(event) => setHeaders(event.target.value)} spellCheck="false" /></Field>
    {method !== 'GET' && method !== 'DELETE' && <Field label="JSON BODY" id="request-body"><textarea id="request-body" className="code-input request-editor" value={body} onChange={(event) => setBody(event.target.value)} spellCheck="false" /></Field>}
    <label className="history-toggle"><input type="checkbox" checked={includeHistory} onChange={(event) => setIncludeHistory(event.target.checked)} /><span>Save minimal request history locally (method, URL, status, time only).</span></label>
    <Notice kind="warning" message="Only send credentials to endpoints you trust. Saved history never stores headers or request bodies. Some endpoints block browser requests with CORS." />
  </Panel><Panel className="api-response"><div className="section-title"><div><h2>Response</h2><p>Status, timing, headers, and response body.</p></div>{response && !response.error && <span className={`status-pill ${response.status < 400 ? 'status-good' : 'status-bad'}`}>{response.status} {response.statusText}</span>}</div>
    {response?.error ? <Notice message={response.error} kind="error" /> : response ? <><div className="response-meta"><span>{response.duration} ms</span><span>{response.headers.length} response headers</span></div><details className="response-headers"><summary>Response headers</summary><pre>{response.headers.map(([key, value]) => `${key}: ${value}`).join('\n') || 'No readable headers'}</pre></details><Field label="RESPONSE BODY" id="response-output"><textarea id="response-output" className="code-input response-editor" value={response.body || '(empty response)'} readOnly spellCheck="false" /></Field></> : <div className="empty-state"><span className="empty-icon"><Icon name="globe" /></span><strong>No response yet</strong><p>Enter a URL and send a request to inspect its response.</p></div>}
  </Panel></div>
  {includeHistory && <Panel className="history-panel"><div className="section-title"><div><h2>Local request history</h2><p>History excludes request headers and bodies.</p></div><Button onClick={() => setHistory([])} disabled={!history.length}>Clear history</Button></div>{history.length ? history.map((item) => <div className="history-row" key={item.id}><strong>{item.method}</strong><code>{item.url}</code><span>{item.status}</span><time>{new Date(item.at).toLocaleString()}</time></div>) : <p className="muted">No saved requests.</p>}</Panel>}
  </ToolPage>;
}

const EMPTY_SNIPPET = { title: '', language: 'JavaScript', description: '', tags: '', code: '' };
function validSnippet(item) {
  return item && typeof item === 'object' && typeof item.title === 'string' && item.title.trim().length > 0 && typeof item.code === 'string' && typeof item.description === 'string' && typeof item.language === 'string';
}

function normalizeSnippets(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(validSnippet).map((item) => ({
    ...item,
    id: typeof item.id === 'string' && item.id ? item.id : crypto.randomUUID(),
    tags: Array.isArray(item.tags) ? item.tags.filter((tag) => typeof tag === 'string') : [],
    favorite: Boolean(item.favorite),
  }));
}

function SnippetEditor({ snippet, onSave, onCancel }) {
  const [form, setForm] = useState(snippet || EMPTY_SNIPPET);
  const [error, setError] = useState('');
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event) => {
    event.preventDefault();
    if (!form.title.trim()) { setError('Add a title for this snippet.'); return; }
    if (!form.code.trim()) { setError('Add some code before saving.'); return; }
    onSave({ ...form, id: snippet?.id || createUuid(), title: form.title.trim(), description: form.description.trim(), language: form.language.trim() || 'Plain text', tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean), updatedAt: new Date().toISOString(), favorite: snippet?.favorite || false });
  };
  return <form className="snippet-form" onSubmit={submit}>
    <div className="section-title"><div><h2>{snippet ? 'Edit snippet' : 'New snippet'}</h2><p>Keep secrets and credentials out of saved snippets.</p></div></div>
    <div className="form-grid"><Field label="TITLE" id="snippet-title"><input id="snippet-title" className="text-control" value={form.title} onChange={(event) => update('title', event.target.value)} maxLength="100" /></Field><Field label="LANGUAGE" id="snippet-language"><input id="snippet-language" className="text-control" value={form.language} onChange={(event) => update('language', event.target.value)} /></Field></div>
    <Field label="DESCRIPTION" id="snippet-description"><input id="snippet-description" className="text-control" value={form.description} onChange={(event) => update('description', event.target.value)} maxLength="240" /></Field>
    <Field label="TAGS" id="snippet-tags" hint="comma separated"><input id="snippet-tags" className="text-control" value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags} onChange={(event) => update('tags', event.target.value)} /></Field>
    <Field label="CODE" id="snippet-code"><textarea id="snippet-code" className="code-input snippet-code" value={form.code} onChange={(event) => update('code', event.target.value)} spellCheck="false" /></Field>
    <Notice message={error} kind="error" /><div className="toolbar-actions"><Button type="submit" variant="primary">Save snippet</Button><Button onClick={onCancel}>Cancel</Button></div>
  </form>;
}

function SnippetsTool({ snippets, setSnippets, notify }) {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const fileRef = useRef(null);
  const items = useMemo(() => snippets.filter((item) => `${item.title} ${item.description} ${item.language} ${(item.tags || []).join(' ')} ${item.code}`.toLowerCase().includes(search.toLowerCase())), [snippets, search]);
  const save = (snippet) => {
    setSnippets((current) => current.some((item) => item.id === snippet.id) ? current.map((item) => item.id === snippet.id ? snippet : item) : [snippet, ...current]);
    setEditing(null); notify('Snippet saved locally.');
  };
  const exportSnippets = () => {
    const blob = new Blob([JSON.stringify({ version: 1, snippets }, null, 2)], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href; link.download = 'devtoolbox-snippets.json'; link.click(); URL.revokeObjectURL(href);
  };
  const selectImport = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const imported = Array.isArray(parsed) ? parsed : parsed?.version === 1 && Array.isArray(parsed.snippets) ? parsed.snippets : null;
      if (!imported || !imported.every(validSnippet)) throw new Error('Expected a snippet array or a version 1 DevToolbox export with valid title, code, description, and language fields.');
        const normalized = imported.map((item) => ({ ...item, id: createUuid(), favorite: Boolean(item.favorite), tags: Array.isArray(item.tags) ? item.tags.filter((tag) => typeof tag === 'string') : [] }));
      setImportPreview(normalized);
    } catch (error) { notify(`Import failed: ${error.message}`, 'error'); }
  };
  const mergeImport = () => {
    const incoming = importPreview || [];
    setSnippets((current) => [...incoming, ...current]);
    setImportPreview(null); notify(`${incoming.length} snippet${incoming.length === 1 ? '' : 's'} imported.`);
  };
  return <ToolPage tool={TOOLS[7]}>
    <Panel className="snippet-library"><div className="section-title"><div><h2>Your local library</h2><p>Snippets stay in this browser. Never store passwords, API keys, or secrets.</p></div><Button variant="primary" onClick={() => setEditing(false)}><Icon name="plus" size={15} /> New snippet</Button></div>
      <div className="snippet-toolbar"><div className="search-box"><Icon name="search" size={17} /><input aria-label="Search snippets" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, code, tags…" /></div><div className="toolbar-actions"><Button onClick={() => fileRef.current?.click()}><Icon name="upload" size={15} /> Import JSON</Button><input ref={fileRef} className="sr-only" type="file" accept=".json,application/json" onChange={selectImport} /><Button onClick={exportSnippets} disabled={!snippets.length}><Icon name="download" size={15} /> Export</Button></div></div>
      {!snippets.length ? <div className="empty-state library-empty"><span className="empty-icon"><Icon name="file" /></span><strong>Start your snippet library</strong><p>Save useful code for later. Your first snippet will appear here.</p><Button variant="primary" onClick={() => setEditing(false)}><Icon name="plus" size={15} /> Create a snippet</Button></div> : items.length ? <div className="snippet-grid">{items.map((item) => <article className="snippet-card" key={item.id}><div className="snippet-card-top"><span className="language-pill">{item.language}</span><div className="icon-actions"><button aria-label={item.favorite ? 'Remove favorite' : 'Add favorite'} onClick={() => setSnippets((current) => current.map((snippet) => snippet.id === item.id ? { ...snippet, favorite: !snippet.favorite } : snippet))} className={item.favorite ? 'is-favorite' : ''}><Icon name="star" size={16} /></button><button aria-label="Edit snippet" onClick={() => setEditing(item)}><span aria-hidden="true">✎</span></button><button aria-label="Delete snippet" onClick={() => setConfirming(item)}><Icon name="trash" size={15} /></button></div></div><h3>{item.title}</h3><p className="snippet-description">{item.description || 'No description provided.'}</p><pre className="snippet-preview"><code>{item.code}</code></pre><div className="snippet-card-bottom"><div className="tag-list">{(item.tags || []).map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div><Button onClick={async () => { try { await copyText(item.code); notify('Snippet copied.'); } catch (error) { notify(error.message, 'error'); } }}><Icon name="copy" size={14} /> Copy</Button></div></article>)}</div> : <div className="empty-state"><span className="empty-icon"><Icon name="search" /></span><strong>No matching snippets</strong><p>Try a different title, language, or tag.</p></div>}
    </Panel>
    {editing !== null && <div className="modal-backdrop" role="presentation"><div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="snippet-dialog-title"><h2 id="snippet-dialog-title" className="sr-only">{editing ? 'Edit snippet' : 'Create snippet'}</h2><SnippetEditor key={editing?.id || 'new'} snippet={editing || null} onSave={save} onCancel={() => setEditing(null)} /></div></div>}
    {confirming && <div className="modal-backdrop" role="presentation"><div className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-title"><h2 id="delete-title">Delete this snippet?</h2><p><strong>{confirming.title}</strong> will be removed from this browser. This cannot be undone.</p><div className="toolbar-actions"><Button onClick={() => setConfirming(null)}>Cancel</Button><Button variant="danger" onClick={() => { setSnippets((current) => current.filter((item) => item.id !== confirming.id)); setConfirming(null); notify('Snippet deleted.'); }}>Delete snippet</Button></div></div></div>}
    {importPreview && <div className="modal-backdrop" role="presentation"><div className="confirm-dialog import-dialog" role="dialog" aria-modal="true" aria-labelledby="import-title"><h2 id="import-title">Review import</h2><p>Ready to merge {importPreview.length} snippet{importPreview.length === 1 ? '' : 's'} into your local library. Existing snippets will be kept.</p><ul>{importPreview.slice(0, 6).map((item) => <li key={item.id}><strong>{item.title}</strong><span>{item.language}</span></li>)}</ul>{importPreview.length > 6 && <p>And {importPreview.length - 6} more…</p>}<div className="toolbar-actions"><Button onClick={() => setImportPreview(null)}>Cancel</Button><Button variant="primary" onClick={mergeImport}>Merge snippets</Button></div></div></div>}
  </ToolPage>;
}

function Dashboard({ onOpen, favorites, toggleFavorite, recents }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All tools');
  const categories = ['All tools', ...new Set(TOOLS.map((tool) => tool.category))];
  const filtered = TOOLS.filter((tool) => (category === 'All tools' || tool.category === category) && `${tool.name} ${tool.description} ${tool.category}`.toLowerCase().includes(search.toLowerCase()));
  const favoriteTools = TOOLS.filter((tool) => favorites.includes(tool.id));
  const recentTools = recents.map((id) => TOOLS.find((tool) => tool.id === id)).filter(Boolean);
  return <section className="dashboard">
    <div className="dashboard-hero"><div><div className="eyebrow"><span className="eyebrow-dot" /> DEVELOPER WORKSPACE</div><h1>Tools for the everyday.</h1><p>Small utilities for the details that interrupt a good flow.</p></div></div>
    <div className="dashboard-search-row"><div className="search-box dashboard-search"><Icon name="search" size={18} /><input aria-label="Search tools" placeholder="Find a tool by name or what it does…" value={search} onChange={(event) => setSearch(event.target.value)} /><kbd>⌘ K</kbd></div><span className="private-caption"><Icon name="shield" size={15} /> Private by default</span></div>
    {favoriteTools.length > 0 && !search && category === 'All tools' && <div className="dashboard-shelf"><div className="section-title"><div><h2>Your favorites</h2><p>Tools you’ve pinned for quick access.</p></div></div><div className="mini-tool-row">{favoriteTools.map((tool) => <button className="mini-tool" key={tool.id} onClick={() => onOpen(tool.id)}><Icon name={tool.icon} size={16} /><span>{tool.name}</span><Icon name="chevron" size={14} /></button>)}</div></div>}
    {recentTools.length > 0 && !search && category === 'All tools' && <div className="dashboard-shelf recent-shelf"><div className="section-title"><div><h2>Recently used</h2><p>Pick up where you left off.</p></div></div><div className="mini-tool-row">{recentTools.slice(0, 4).map((tool) => <button className="mini-tool" key={tool.id} onClick={() => onOpen(tool.id)}><Icon name={tool.icon} size={16} /><span>{tool.name}</span><Icon name="chevron" size={14} /></button>)}</div></div>}
    <div className="tools-section"><div className="section-title tools-title"><div><h2>Explore your toolkit</h2><p>{filtered.length} useful tools, ready when you are.</p></div></div><div className="category-filters" role="group" aria-label="Filter tools by category">{categories.map((item) => <button key={item} className={category === item ? 'selected' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div>
      {filtered.length ? <div className="tool-grid">{filtered.map((tool) => <article className="tool-card" key={tool.id}><div className="tool-card-top"><span className="tool-icon"><Icon name={tool.icon} size={20} /></span><button className={`favorite-button ${favorites.includes(tool.id) ? 'is-favorite' : ''}`} aria-label={`${favorites.includes(tool.id) ? 'Remove' : 'Add'} ${tool.name} ${favorites.includes(tool.id) ? 'from' : 'to'} favorites`} onClick={() => toggleFavorite(tool.id)}><Icon name="star" size={17} /></button></div><span className="tool-category">{tool.category}</span><h3>{tool.name}</h3><p>{tool.description}</p><button className="open-tool" onClick={() => onOpen(tool.id)}>Open tool <Icon name="chevron" size={15} /></button></article>)}</div> : <div className="empty-state"><span className="empty-icon"><Icon name="search" /></span><strong>No tools found</strong><p>Try a different search or category.</p><Button onClick={() => { setSearch(''); setCategory('All tools'); }}>Clear filters</Button></div>}
    </div>
    <div className="dashboard-note"><Icon name="shield" size={17} /><span><strong>Built for privacy.</strong> Your input stays in this browser. Nothing is sent anywhere unless you use the API tester to contact a URL you choose.</span></div>
  </section>;
}

function App() {
  const [activeId, setActiveId] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteSearch, setPaletteSearch] = useState('');
  const [theme, setTheme] = useStoredState(STORAGE.theme, 'dark', (value) => value === 'light' ? 'light' : 'dark');
  const [favorites, setFavorites] = useStoredState(STORAGE.favorites, [], (value) => Array.isArray(value) ? [...new Set(value.filter((id) => TOOLS.some((tool) => tool.id === id)))] : []);
  const [recents, setRecents] = useStoredState(STORAGE.recents, [], (value) => Array.isArray(value) ? [...new Set(value.filter((id) => TOOLS.some((tool) => tool.id === id)))].slice(0, 6) : []);
  const [snippets, setSnippets] = useStoredState(STORAGE.snippets, [], normalizeSnippets);
  const [apiHistory, setApiHistory] = useStoredState(STORAGE.apiHistory, [], (value) => Array.isArray(value) ? value.filter((item) => item && typeof item.id === 'string' && typeof item.method === 'string' && typeof item.url === 'string' && typeof item.status === 'number' && typeof item.at === 'string').slice(0, 10) : []);
  const [toast, notify, clearToast] = useToast();
  const activeTool = TOOLS.find((tool) => tool.id === activeId);
  const selectTool = useCallback((id) => {
    setActiveId(id);
    setMobileOpen(false);
    setPaletteOpen(false);
    setPaletteSearch('');
    if (TOOLS.some((tool) => tool.id === id)) setRecents((current) => [id, ...current.filter((item) => item !== id)].slice(0, 6));
  }, [setRecents]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme === 'light' ? 'light' : 'dark';
  }, [theme]);
  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setPaletteOpen((open) => !open); }
      if (event.key === 'Escape') { setPaletteOpen(false); setMobileOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const toggleFavorite = (id) => setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const paletteResults = TOOLS.filter((tool) => `${tool.name} ${tool.description} ${tool.category}`.toLowerCase().includes(paletteSearch.toLowerCase()));
  const renderTool = () => {
    if (!activeTool) return <Dashboard onOpen={selectTool} favorites={favorites} toggleFavorite={toggleFavorite} recents={recents} />;
    switch (activeId) {
      case 'json': return <JsonTool notify={notify} />;
      case 'encoding': return <EncodingTool notify={notify} />;
      case 'password': return <PasswordTool notify={notify} />;
      case 'uuid': return <UuidTool notify={notify} />;
      case 'text': return <TextTool />;
      case 'timestamp': return <TimestampTool />;
      case 'api': return <ApiTool notify={notify} history={apiHistory} setHistory={setApiHistory} />;
      case 'snippets': return <SnippetsTool snippets={snippets} setSnippets={setSnippets} notify={notify} />;
      default: return null;
    }
  };
  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`} aria-label="Main navigation">
      <button className="brand" onClick={() => selectTool('dashboard')} aria-label="DevToolbox dashboard"><span className="brand-mark"><span /><span /><span /><span /></span><span className="brand-name">DevToolbox<span className="brand-period">.</span></span></button>
      <div className="sidebar-label">WORKSPACE</div><nav className="tool-nav" aria-label="Workspace">
        <button className={`nav-item ${!activeTool ? 'active' : ''}`} onClick={() => selectTool('dashboard')} aria-current={!activeTool ? 'page' : undefined}><span className="nav-icon"><Icon name="grid" /></span><span>Dashboard</span></button>
      </nav>
      <div className="sidebar-label nav-section-label">YOUR TOOLKIT</div><nav className="tool-nav" aria-label="Developer tools">
        {TOOLS.map((tool) => <button key={tool.id} className={`nav-item ${activeId === tool.id ? 'active' : ''}`} onClick={() => selectTool(tool.id)} aria-current={activeId === tool.id ? 'page' : undefined}><span className="nav-icon"><Icon name={tool.icon} size={17} /></span><span>{tool.name}</span>{favorites.includes(tool.id) && <span className="nav-star is-favorite" aria-label="Favorite"><Icon name="star" size={12} /></span>}</button>)}
      </nav>
      <div className="sidebar-spacer" /><div className="sidebar-card"><div className="sidebar-card-icon"><Icon name="shield" size={17} /></div><strong>Private by design</strong><p>Your data stays on your device. Always.</p><span className="sidebar-card-link"><span className="live-dot" /> LOCAL PROCESSING</span></div>
      <div className="sidebar-bottom"><span className="sidebar-version"><span className="version-dot" /> YOUR BROWSER · YOUR DATA</span><span className="sidebar-copyright">Made for the craft of building.</span></div>
    </aside>
    {mobileOpen && <button className="mobile-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
    <main className="main-area"><header className="topbar">
      <button className="mobile-menu-button" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)}><Icon name={mobileOpen ? 'close' : 'menu'} /></button>
      <div className="breadcrumbs"><span>Workspace</span><Icon name="chevron" size={14} /><strong>{activeTool?.name || 'Dashboard'}</strong></div>
      <div className="topbar-right"><button className="command-hint" onClick={() => setPaletteOpen(true)} aria-label="Open command palette"><Icon name="search" size={15} /><span>Quick jump</span><kbd>⌘ K</kbd></button><button className="theme-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`} title="Toggle theme"><Icon name={theme === 'light' ? 'moon' : 'sun'} size={17} /></button><span className="local-status"><span className="live-dot" /> LOCAL FIRST</span></div>
    </header>
    <div className="content-area">{renderTool()}</div>
    <footer className="app-footer"><span>DevToolbox <span className="footer-muted">· Thoughtful tools for thoughtful developers.</span></span><span className="footer-local"><span className="live-dot" /> PRIVATE BY DEFAULT</span></footer>
    </main>
    {paletteOpen && <div className="modal-backdrop palette-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setPaletteOpen(false); }}><div className="palette-dialog" role="dialog" aria-modal="true" aria-label="Command palette"><div className="palette-search"><Icon name="search" size={19} /><input autoFocus aria-label="Search commands" placeholder="Search tools…" value={paletteSearch} onChange={(event) => setPaletteSearch(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && paletteResults[0]) selectTool(paletteResults[0].id); }} /><kbd>ESC</kbd></div><div className="palette-list">{paletteResults.length ? paletteResults.map((tool) => <button key={tool.id} onClick={() => selectTool(tool.id)}><span className="tool-icon"><Icon name={tool.icon} size={17} /></span><span><strong>{tool.name}</strong><small>{tool.description}</small></span><Icon name="chevron" size={15} /></button>) : <p className="palette-empty">No tools match that search.</p>}</div></div></div>}
    {toast && <div className={`toast toast-${toast.kind}`} role={toast.kind === 'error' ? 'alert' : 'status'}><Icon name={toast.kind === 'error' ? 'alert' : 'check'} size={16} />{toast.message}<button onClick={clearToast} aria-label="Dismiss notification"><Icon name="close" size={14} /></button></div>}
  </div>;
}

export default App;
