let bannerElement: HTMLElement | null = null;

const SCORE_COLORS: Record<string, { text: string; bar: string }> = {
  'Critique': { text: '#e05252', bar: 'linear-gradient(90deg,#c0392b,#e74c3c)' },
  'Élevé':   { text: '#e07828', bar: 'linear-gradient(90deg,#d35400,#e67e22)' },
  'Modéré':  { text: '#c8a500', bar: 'linear-gradient(90deg,#9a7700,#c9a800)' },
  'Faible':  { text: '#2e9e40', bar: 'linear-gradient(90deg,#1b5e20,#2e7d32)' },
};

function calculateScore(techniques: { name: string; keywords: string[] }[], totalKeywords: number): number {
  const matched = techniques.reduce((sum, t) => sum + t.keywords.length, 0);
  return Math.min(100, Math.round((matched / totalKeywords) * 100));
}

function getDangerLabel(score: number): string {
  if (score >= 76) return 'Critique';
  if (score >= 51) return 'Élevé';
  if (score >= 21) return 'Modéré';
  return 'Faible';
}

function removeBanner() {
  if (bannerElement && bannerElement.parentNode) {
    bannerElement.parentNode.removeChild(bannerElement);
    bannerElement = null;
  }
}

function createPanel(techniques: { name: string; keywords: string[] }[], totalKeywords: number): HTMLElement {
  removeBanner();

  const score = calculateScore(techniques, totalKeywords);
  const label = getDangerLabel(score);
  const colors = SCORE_COLORS[label];

  const panel = document.createElement('div');
  panel.id = 'manipulation-panel';
  panel.className = 'manipulation-panel';

  // Header
  const header = document.createElement('div');
  header.className = 'panel-header';

  const title = document.createElement('div');
  title.className = 'panel-title';
  title.innerHTML = '⚠ ANALYSE DE MANIPULATION';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'panel-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', removeBanner);

  header.appendChild(title);
  header.appendChild(closeBtn);
  panel.appendChild(header);

  // Score section
  const scoreSection = document.createElement('div');
  scoreSection.className = 'panel-score-section';

  const scoreRow = document.createElement('div');
  scoreRow.className = 'panel-score-row';

  const scoreLabel = document.createElement('span');
  scoreLabel.className = 'panel-score-label';
  scoreLabel.textContent = 'SCORE DE DANGER';

  const scoreValue = document.createElement('span');
  scoreValue.className = 'panel-score-value';
  scoreValue.textContent = `${score}/100 — ${label}`;
  scoreValue.style.color = colors.text;

  scoreRow.appendChild(scoreLabel);
  scoreRow.appendChild(scoreValue);
  scoreSection.appendChild(scoreRow);

  const progressTrack = document.createElement('div');
  progressTrack.className = 'panel-progress-track';
  const progressBar = document.createElement('div');
  progressBar.className = 'panel-progress-bar';
  progressBar.style.width = `${score}%`;
  progressBar.style.background = colors.bar;
  progressTrack.appendChild(progressBar);
  scoreSection.appendChild(progressTrack);
  panel.appendChild(scoreSection);

  // Chips
  const chipsContainer = document.createElement('div');
  chipsContainer.className = 'panel-chips';

  techniques.forEach(technique => {
    const chip = document.createElement('div');
    const n = technique.keywords.length;
    const colorClass = n <= 2 ? 'chip-green' : n <= 4 ? 'chip-yellow' : n <= 6 ? 'chip-red' : 'chip-black';
    chip.className = `technique-chip ${colorClass}`;
    chip.title = technique.keywords.join(', ');

    const name = document.createElement('span');
    name.className = 'chip-name';
    name.textContent = technique.name;

    const count = document.createElement('span');
    count.className = 'chip-count';
    count.textContent = String(n);

    const close = document.createElement('button');
    close.className = 'chip-close';
    close.innerHTML = '&times;';
    close.addEventListener('click', () => {
      chip.remove();
      if (chipsContainer.children.length === 0) removeBanner();
    });

    chip.appendChild(name);
    chip.appendChild(count);
    chip.appendChild(close);
    chipsContainer.appendChild(chip);
  });

  panel.appendChild(chipsContainer);
  bannerElement = panel;
  return panel;
}

function highlightKeywords(keywords: string[]) {
  if (keywords.length === 0) return;

  const escaped = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const el = (node as Text).parentElement;
      if (!el) return NodeFilter.FILTER_SKIP;
      if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return NodeFilter.FILTER_SKIP;
      if (el.closest('#manipulation-panel, .safe-notification, .keyword-highlight')) return NodeFilter.FILTER_SKIP;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const textNodes: Text[] = [];
  let node;
  while ((node = walker.nextNode())) textNodes.push(node as Text);

  textNodes.forEach(textNode => {
    const text = textNode.textContent || '';
    if (!regex.test(text)) return;
    regex.lastIndex = 0;

    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
      }
      const mark = document.createElement('mark');
      mark.className = 'keyword-highlight';
      mark.textContent = match[0];
      fragment.appendChild(mark);
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }
    textNode.parentNode!.replaceChild(fragment, textNode);
  });
}

function showBanner(techniques: { name: string; keywords: string[] }[], totalKeywords: number) {
  const panel = createPanel(techniques, totalKeywords);
  document.body.appendChild(panel);

  if (calculateScore(techniques, totalKeywords) > 75) {
    const allKeywords = techniques.reduce((acc: string[], t: { name: string; keywords: string[] }) => acc.concat(t.keywords), []);
    highlightKeywords(allKeywords);
  }
}

function showSafeNotification() {
  removeBanner();

  const pill = document.createElement('div');
  pill.className = 'safe-notification';

  const icon = document.createElement('span');
  icon.className = 'safe-icon';
  icon.textContent = '✓';

  const text = document.createElement('span');
  text.className = 'safe-text';
  text.textContent = 'Aucun danger détecté';

  const close = document.createElement('button');
  close.className = 'safe-close';
  close.innerHTML = '&times;';
  close.addEventListener('click', () => pill.remove());

  pill.appendChild(icon);
  pill.appendChild(text);
  pill.appendChild(close);
  document.body.appendChild(pill);

  bannerElement = pill;
  setTimeout(() => pill.remove(), 4000);
}

browser.runtime.onMessage.addListener((
  message: { action: string; techniques: { name: string; keywords: string[] }[]; totalKeywords: number },
  _sender: browser.runtime.MessageSender,
  sendResponse: (response: { success: boolean }) => void
) => {
  if (message.action === 'showBanner') {
    showBanner(message.techniques, message.totalKeywords);
  } else if (message.action === 'showSafe') {
    showSafeNotification();
  } else if (message.action === 'hideBanner') {
    removeBanner();
  }
  sendResponse({ success: true });
  return true;
});

window.addEventListener('load', () => {
  console.log('Keyword Banner content script loaded');
});
