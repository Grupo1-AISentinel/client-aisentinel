import { useState } from 'react';
import { CopyIcon, CheckIcon } from './icons.jsx';
import { cn } from '../../utils/cn.js';

const isDigit = (ch) => ch >= '0' && ch <= '9';

const highlightJson = (input) => {
  const tokens = [];
  const push = (type, value) => tokens.push({ type, value });
  let i = 0;
  while (i < input.length) {
    const ch = input[i];
    if (ch === '"') {
      let j = i + 1;
      while (j < input.length && input[j] !== '"') {
        if (input[j] === '\\') j += 2;
        else j += 1;
      }
      const isKey = input[j + 1] === ':';
      push(isKey ? 'key' : 'string', input.slice(i, j + 1));
      i = j + 1;
      continue;
    }
    if (
      (isDigit(ch) || ch === '-' || ch === '+') &&
      (i === 0 || ' \n,:\t['.includes(input[i - 1]))
    ) {
      let j = i;
      while (j < input.length && '0123456789.eE+-'.includes(input[j])) j += 1;
      push('number', input.slice(i, j));
      i = j;
      continue;
    }
    if (input.startsWith('true', i) || input.startsWith('false', i)) {
      const word = input.startsWith('true', i) ? 'true' : 'false';
      push('boolean', word);
      i += word.length;
      continue;
    }
    if (input.startsWith('null', i)) {
      push('null', 'null');
      i += 4;
      continue;
    }
    push('punctuation', ch);
    i += 1;
  }
  return tokens;
};

const highlightBash = (input) => {
  const lines = input.split('\n');
  return lines.flatMap((line, idx) => {
    const out = [];
    if (line.trim().startsWith('#')) {
      out.push({ type: 'comment', value: line });
    } else {
      const trimmed = line.trimStart();
      const indent = line.slice(0, line.length - trimmed.length);
      if (indent) out.push({ type: 'punctuation', value: indent });
      const parts = trimmed.split(/\s+/);
      parts.forEach((part, i) => {
        if (i === 0) out.push({ type: 'command', value: part });
        else if (part.startsWith('-')) out.push({ type: 'flag', value: part });
        else if (part.startsWith('"') || part.startsWith("'"))
          out.push({ type: 'string', value: part });
        else if (part.startsWith('http://') || part.startsWith('https://'))
          out.push({ type: 'url', value: part });
        else if (part.includes('=')) {
          const eqIdx = part.indexOf('=');
          out.push({ type: 'variable', value: part.slice(0, eqIdx) });
          out.push({ type: 'punctuation', value: '=' });
          out.push({ type: 'value', value: part.slice(eqIdx + 1) });
        } else out.push({ type: 'value', value: part });
        if (i < parts.length - 1) out.push({ type: 'punctuation', value: ' ' });
      });
    }
    if (idx < lines.length - 1) out.push({ type: 'punctuation', value: '\n' });
    return out;
  });
};

const highlighters = { json: highlightJson, bash: highlightBash };

const CodeBlock = ({ code, language = 'json', title, className }) => {
  const [copied, setCopied] = useState(false);
  const tokens = highlighters[language] ? highlighters[language](code) : null;
  const colors = tokenColors[language] || {};

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className={cn(
        'relative rounded-md border border-white/10 bg-black/40 overflow-hidden group',
        className
      )}
    >
      {(title || language) && (
        <div className="flex items-center justify-between px-3 py-1 border-b border-white/5 bg-white/[0.02]">
          <span className="text-[10px] font-mono uppercase tracking-widest text-on-surface-dim">
            {title || language}
          </span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300/70">
            {language}
          </span>
        </div>
      )}
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono uppercase tracking-wider text-on-surface-dim hover:text-amber-300 hover:bg-white/10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
        aria-label="Copiar"
      >
        {copied ? (
          <CheckIcon className="w-3 h-3 text-emerald-300" />
        ) : (
          <CopyIcon className="w-3 h-3" />
        )}
        {copied ? 'OK' : 'Copiar'}
      </button>
      <pre className="overflow-x-auto p-3 text-[12px] font-mono leading-relaxed text-on-surface">
        <code>
          {tokens
            ? tokens.map((t, i) => (
                <span key={i} className={colors[t.type] || 'text-on-surface'}>
                  {t.value}
                </span>
              ))
            : code}
        </code>
      </pre>
    </div>
  );
};

const tokenColors = {
  json: {
    key: 'text-sky-300',
    string: 'text-emerald-300',
    number: 'text-amber-300',
    boolean: 'text-violet-300',
    null: 'text-rose-300',
    punctuation: 'text-on-surface-dim',
  },
  bash: {
    comment: 'text-on-surface-dim italic',
    command: 'text-emerald-300',
    flag: 'text-amber-300',
    string: 'text-rose-300',
    url: 'text-sky-300',
    variable: 'text-violet-300',
    value: 'text-amber-300',
    punctuation: 'text-on-surface-dim',
  },
};

export default CodeBlock;
