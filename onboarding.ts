const WEIGHT_MAP: Record<string, number> = { oui: 2, parfois: 1.5, non: 1 };

const form = document.getElementById('onboarding-form') as HTMLFormElement;
const confirmation = document.getElementById('confirmation') as HTMLDivElement;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = new FormData(form);

  const weights = {
    autorite:         WEIGHT_MAP[data.get('autorite') as string] ?? 1,
    peur:             WEIGHT_MAP[data.get('peur') as string] ?? 1,
    personnalisation: WEIGHT_MAP[data.get('personnalisation') as string] ?? 1,
    amorcage:         WEIGHT_MAP[data.get('amorcage') as string] ?? 1,
    tentation:        WEIGHT_MAP[data.get('tentation') as string] ?? 1,
  };

  await browser.storage.local.set({ techniqueWeights: weights });

  form.style.display = 'none';
  confirmation.style.display = 'block';
});
