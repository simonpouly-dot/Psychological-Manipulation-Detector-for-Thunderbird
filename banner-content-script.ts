let bannerElement: HTMLElement | null = null;

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

  scoreRow.appendChild(scoreLabel);
  scoreRow.appendChild(scoreValue);
  scoreSection.appendChild(scoreRow);

  const progressTrack = document.createElement('div');
  progressTrack.className = 'panel-progress-track';
  const progressBar = document.createElement('div');
  progressBar.className = 'panel-progress-bar';
  progressBar.style.width = `${score}%`;
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
    count.textContent = String(technique.keywords.length);

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

function showBanner(techniques: { name: string; keywords: string[] }[], totalKeywords: number) {
  const panel = createPanel(techniques, totalKeywords);
  document.body.appendChild(panel);
}

browser.runtime.onMessage.addListener((
  message: { action: string; techniques: { name: string; keywords: string[] }[]; totalKeywords: number },
  _sender: browser.runtime.MessageSender,
  sendResponse: (response: { success: boolean }) => void
) => {
  if (message.action === 'showBanner') {
    showBanner(message.techniques, message.totalKeywords);
  } else if (message.action === 'hideBanner') {
    removeBanner();
  }
  sendResponse({ success: true });
  return true;
});

window.addEventListener('load', () => {
  console.log('Keyword Banner content script loaded');
});
