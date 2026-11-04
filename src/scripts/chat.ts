import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { profile, socials } from '../data/portfolio';
import { recentMessages, type ChatMessage, type ChatEvent, MAX_MESSAGE_CHARS } from '../lib/chat-contract';
import { readSSE } from '../lib/sse';

function setupChat(root: HTMLElement) {
  const find = <T extends Element>(selector: string) => {
    const element = root.querySelector<T>(selector);
    if (!element) throw new Error('Missing chat element');
    return element;
  };
  const form = find<HTMLFormElement>('[data-chat-form]');
  const input = find<HTMLTextAreaElement>('[data-chat-input]');
  const send = find<HTMLButtonElement>('[data-chat-send]');
  const stop = find<HTMLButtonElement>('[data-chat-stop]');
  const reset = find<HTMLButtonElement>('[data-chat-reset]');
  const starters = find<HTMLElement>('[data-chat-starters]');
  const intro = find<HTMLElement>('[data-chat-intro]');
  const thread = find<HTMLElement>('[data-chat-thread]');
  const messages = find<HTMLElement>('[data-chat-messages]');
  const latest = find<HTMLButtonElement>('[data-chat-latest]');
  const status = find<HTMLElement>('[data-chat-compose-status]');
  const notice = find<HTMLElement>('[data-chat-notice]');
  const announcement = find<HTMLElement>('[data-chat-announcement]');
  const template = find<HTMLTemplateElement>('[data-chat-assistant-template]');
  const suggestions = [...root.querySelectorAll<HTMLButtonElement>('[data-chat-question]')];
  const externalLinks = new Set<string>(socials.map(social => new URL(social.url).href));
  let available = false;
  let busy = false;
  let composing = false;
  let compositionEnded = 0;
  let sequence = 0;
  let abort: AbortController | undefined;
  let history: ChatMessage[] = [];
  type Turn = { question: string; element: HTMLElement; body: HTMLElement; content: string; request: ChatMessage[] };
  let failed: Turn | undefined;

  function announce(text: string) { announcement.textContent = text; }
  function showNotice(text: string) { notice.textContent = text; notice.hidden = !text; }
  function controls() {
    input.disabled = !available;
    send.disabled = !available || busy || !input.value.trim();
    send.hidden = busy;
    stop.hidden = !busy;
    reset.disabled = messages.childElementCount === 0;
    for (const suggestion of suggestions) suggestion.disabled = !available || busy;
    status.textContent = busy ? '回答中…' : available ? 'Shift + Enterで改行' : '現在はご利用いただけません';
    root.toggleAttribute('data-busy', busy);
  }
  function resize() { input.style.height = 'auto'; input.style.height = `${Math.min(180, input.scrollHeight)}px`; }
  function atBottom() { return thread.scrollHeight - thread.scrollTop - thread.clientHeight < 64; }
  function scrollDown(force = false) {
    if (force || atBottom()) { thread.scrollTop = thread.scrollHeight; latest.hidden = true; }
    else latest.hidden = false;
  }
  function render(turn: Turn) {
    const follow = atBottom();
    const html = marked.parse(turn.content, { async: false, breaks: true, gfm: true });
    turn.body.innerHTML = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'code', 'pre', 'blockquote'],
      ALLOWED_ATTR: ['href', 'title'], ALLOW_DATA_ATTR: false, ALLOW_ARIA_ATTR: false,
    });
    for (const link of turn.body.querySelectorAll('a')) {
      const href = link.getAttribute('href') ?? '';
      let allowed = false;
      let external = false;
      try {
        const url = new URL(href, location.href);
        allowed = (url.origin === location.origin && url.pathname === '/' && !url.search && ['#career', '#education', '#skills', '#contact'].includes(url.hash)) || url.href === `mailto:${profile.email}` || externalLinks.has(url.href);
        external = url.protocol === 'https:' && url.origin !== location.origin;
      } catch { /* Invalid links remain plain text. */ }
      if (!allowed) link.replaceWith(document.createTextNode(link.textContent ?? ''));
      else if (external) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
    }
    scrollDown(follow);
  }
  function makeTurn(question: string): Turn {
    const user = document.createElement('div');
    user.className = 'chat-message chat-message-user';
    user.setAttribute('aria-label', 'あなたの質問');
    const text = document.createElement('p');
    text.textContent = question;
    user.append(text);
    const element = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
    messages.append(user, element);
    return { question, element, body: element.querySelector<HTMLElement>('[data-answer]')!, content: '', request: recentMessages(history, question) };
  }
  function showActions(turn: Turn) {
    if (!turn.content) return;
    const actions = turn.element.querySelector<HTMLElement>('[data-answer-actions]')!;
    actions.hidden = false;
    const copy = actions.querySelector<HTMLButtonElement>('[data-copy]')!;
    copy.onclick = async () => {
      try {
        await navigator.clipboard.writeText(turn.content);
        copy.querySelector('span:last-child')!.textContent = 'コピーしました';
        announce('回答をコピーしました');
        setTimeout(() => { copy.querySelector('span:last-child')!.textContent = 'コピー'; }, 2000);
      } catch { showNotice('コピーできませんでした。回答の文字を選択してコピーしてください。'); }
    };
  }
  async function run(question: string, retry?: Turn) {
    if (!available || busy || !question.trim()) return;
    const version = ++sequence;
    failed = undefined;
    for (const button of messages.querySelectorAll<HTMLButtonElement>('[data-chat-retry]')) button.disabled = true;
    const turn = retry ?? makeTurn(question);
    turn.content = '';
    turn.body.textContent = '回答を考えています…';
    const note = turn.element.querySelector<HTMLElement>('[data-answer-note]')!;
    note.hidden = true;
    note.replaceChildren();
    turn.element.querySelector<HTMLElement>('[data-answer-actions]')!.hidden = true;
    input.value = '';
    resize();
    starters.hidden = true;
    intro.hidden = true;
    thread.hidden = false;
    busy = true;
    abort = new AbortController();
    controls();
    showNotice('');
    announce('回答を生成しています');
    scrollDown(true);
    let completed = false;
    let pendingFrame = 0;
    const paint = () => { pendingFrame = 0; if (version === sequence) render(turn); };
    try {
      const response = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: turn.request }), signal: abort.signal,
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(error.error ?? '接続できませんでした。もう一度お試しください。');
      }
      if (!response.body) throw new Error('回答を受け取れませんでした。');
      for await (const data of readSSE(response.body)) {
        if (version !== sequence) break;
        const event = JSON.parse(data) as ChatEvent;
        if (event.type === 'delta') {
          turn.content += event.text;
          if (!pendingFrame) pendingFrame = requestAnimationFrame(paint);
        } else if (event.type === 'done') {
          completed = true;
          if (event.truncated) { note.textContent = '回答が長くなったため、ここで区切りました。続きについて質問できます。'; note.hidden = false; }
        } else if (event.type === 'error') throw new Error(event.message);
      }
      if (!completed && version === sequence) throw new Error('回答が途中で途切れました。もう一度お試しください。');
      if (version === sequence) announce('回答が完了しました');
    } catch (error) {
      if (version !== sequence) return;
      if (error instanceof DOMException && error.name === 'AbortError') {
        completed = Boolean(turn.content);
        note.textContent = '回答を停止しました';
        note.hidden = false;
        announce('回答を停止しました');
      } else {
        failed = turn;
        if (!turn.content) turn.body.textContent = '';
        const text = document.createElement('span');
        text.textContent = error instanceof Error ? error.message : '接続できませんでした。もう一度お試しください。';
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'chat-retry'; button.dataset.chatRetry = '';
        button.textContent = 'もう一度試す';
        button.onclick = () => { if (failed === turn) void run(turn.question, turn); };
        note.replaceChildren(text, button); note.hidden = false;
        announce(text.textContent);
      }
    } finally {
      if (pendingFrame) cancelAnimationFrame(pendingFrame);
      if (version === sequence) {
        if (turn.content) { render(turn); showActions(turn); }
        else if (!failed) turn.body.textContent = '';
        if (completed && turn.content) history.push({ role: 'user', content: turn.question }, { role: 'assistant', content: turn.content.slice(0, MAX_MESSAGE_CHARS) });
        busy = false; abort = undefined; controls(); scrollDown();
      }
    }
  }

  form.addEventListener('submit', event => { event.preventDefault(); void run(input.value.trim()); });
  input.addEventListener('input', () => { resize(); controls(); });
  input.addEventListener('compositionstart', () => { composing = true; });
  input.addEventListener('compositionend', () => { composing = false; compositionEnded = performance.now(); });
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing && !composing && performance.now() - compositionEnded > 50) {
      event.preventDefault(); if (!busy) form.requestSubmit();
    }
  });
  stop.addEventListener('click', () => abort?.abort());
  reset.addEventListener('click', () => {
    sequence++; abort?.abort(); abort = undefined; busy = false; history = []; failed = undefined;
    messages.replaceChildren(); thread.hidden = true; latest.hidden = true; starters.hidden = false; intro.hidden = false;
    showNotice(''); input.value = ''; resize(); controls(); input.focus(); announce('新しい会話を始めました');
  });
  latest.addEventListener('click', () => scrollDown(true));
  thread.addEventListener('scroll', () => { if (atBottom()) latest.hidden = true; });
  for (const suggestion of suggestions) suggestion.addEventListener('click', () => { void run(suggestion.dataset.chatQuestion!); });

  fetch('/api/chat/status', { cache: 'no-store' }).then(async response => {
    if (!response.ok) throw new Error('status unavailable');
    const config = await response.json() as { ready: boolean; reason: string };
    available = config.ready;
    if (!available) showNotice(config.reason === 'expired' ? 'AIへの質問受付は終了しました。お仕事のご相談は下のメールからお願いします。' : 'AIの接続を準備しています。お仕事のご相談は下のメールからお願いします。');
  }).catch(() => { showNotice('AIに接続できませんでした。ページを読み直してお試しください。'); }).finally(controls);
}

for (const root of document.querySelectorAll<HTMLElement>('[data-portfolio-chat]')) setupChat(root);
