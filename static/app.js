const scenes = [
  { title: 'Солнце бьёт по Фотосистеме II', text: 'Фотон видимого света взаимодействует с одной из молекул хлорофилла светособирающего комплекса Фотосистемы II и выбивает электроны магния. Электроны вылетают из ловушки Фотосистемы II. Это как мяч, который пнул игрок: он полетел дальше. Но на месте мяча осталась «дыра» — её нужно заполнить.', eq: '', active: ['ps2'], cls: 'step-1' },
  { title: 'Заполнение «дыры» — расщепление воды', text: 'Ферменты растения катализируют расщепление молекулы воды, чтобы вернуть электроны на место. Вода расщепляется на протоны и электроны, а побочный продукт — кислород — выделяется в воздух. Протоны H⁺ пока копятся внутри тилакоида: они пригодятся позже.', eq: '2H₂O → O₂ + 4H⁺ + 4e⁻', active: ['ps2', 'oec'], cls: 'step-2' },
  { title: 'Турбина — АТФ-синтаза', text: 'Электроны магния передаются по ЭТЦ и попадают на Фотосистему II.', eq: '', active: ['pq', 'b6f', 'pc'], cls: 'step-3' },
  { title: 'Солнце бьёт по Фотосистеме I', text: 'Свет снова подбрасывает электрон вверх по энергии. Теперь этот электрон нужен для создания ещё одного источника энергии — НАДФ·Н.', eq: '', active: ['ps1', 'pc', 'fd'], cls: 'step-4' },
  { title: 'Создание батарейки — НАДФ·Н', text: 'Электроны доходят до конечного акцептора НАДФ⁺. Для восстановления НАДФ⁺ до НАДФ·Н нужны два электрона. Также НАДФ⁺ из стромы поглощает один H⁺.', eq: 'НАДФ⁺ + 2e⁻ + H⁺ → НАДФ·Н', active: ['fd', 'fnr'], cls: 'step-5' },
  { title: 'Турбина — синтез АТФ', text: 'Внутри тилакоида накопилось много протонов. Они хотят в строму, поэтому проходят через турбину АТФ-синтазы. Поток помогает «чеканить» АТФ — энергомонету клетки.', eq: 'АДФ + Фᵢ → АТФ', active: ['atpase', 'b6f'], cls: 'step-6' },
  { title: 'Итог световой фазы', text: 'Свет и вода превратились в два носителя энергии — АТФ и НАДФ·Н. Они пойдут в цикл Кальвина, где из углекислого газа соберётся глюкоза. Кислород уходит наружу.', eq: 'свет + H₂O + НАДФ⁺ + АДФ + Фᵢ → АТФ + НАДФ·Н + O₂', active: ['ps2', 'oec', 'pq', 'b6f', 'pc', 'ps1', 'fd', 'fnr', 'atpase'], cls: 'overview' }
];

const info = {
  ps2: ['ФОТОСИСТЕМА II', 'ФСII', 'Ловит свет и отдаёт электрон в цепочку переносчиков.', 'P680 → P680⁺ + e⁻'], oec: ['БЕЛКОВЫЙ КОМПЛЕКС', 'OEC — расщепитель воды', 'Забирает электроны из воды и возвращает их в ФСII.', '2H₂O → O₂ + 4H⁺ + 4e⁻'], pq: ['ПЕРЕНОСЧИК', 'PQ — курьер', 'Забирает электроны и протоны, чтобы отвезти их к насосу.', 'PQ + 2e⁻ + 2H⁺'], b6f: ['НАСОС', 'Цитохром b6f', 'Использует энергию электрона, чтобы качать протоны в просвет.', 'H⁺: строма → просвет'], pc: ['ПЕРЕНОСЧИК', 'PC — курьер', 'Передаёт электрон от насоса к Фотосистеме I.', ''], ps1: ['ФОТОСИСТЕМА I', 'ФСI', 'Снова поднимает энергию электрона с помощью света.', 'P700 → P700⁺ + e⁻'], fd: ['ПЕРЕНОСЧИК', 'Ферредоксин', 'Принимает энергичный электрон от ФСI.', ''], fnr: ['ФЕРМЕНТ', 'FNR — сборщик', 'Собирает из электронов и протона заряженный НАДФ·Н.', 'НАДФ⁺ + 2e⁻ + H⁺ → НАДФ·Н'], atpase: ['ТУРБИНА', 'АТФ-синтаза', 'Пропускает протоны вниз и использует поток для создания АТФ.', 'АДФ + Фᵢ → АТФ']
};
let current = 0, playing = true, timer;
const $ = (s) => document.querySelector(s);
const model = $('#model');
const slider = $('#stageSlider');

function buildPhospholipidBilayer() {
  const svgNS = 'http://www.w3.org/2000/svg';
  const layer = document.querySelector('#phospholipidLayer');
  if (!layer) return;
  layer.replaceChildren();

  // У внешнего листка хвосты смотрят внутрь петли, у внутреннего — наружу.
  const addLeaflet = (pathId, normalDirection) => {
    const path = document.querySelector(`#${pathId}`);
    const length = path.getTotalLength();
    for (let distance = 9; distance < length - 9; distance += 22) {
      const point = path.getPointAtLength(distance);
      const before = path.getPointAtLength(Math.max(0, distance - 1));
      const after = path.getPointAtLength(Math.min(length, distance + 1));
      const dx = after.x - before.x;
      const dy = after.y - before.y;
      const magnitude = Math.hypot(dx, dy) || 1;
      // Нормаль вправо от направления контура — это внутренняя сторона U-петли.
      const nx = (-dy / magnitude) * normalDirection;
      const ny = (dx / magnitude) * normalDirection;
      const angle = Math.atan2(ny, nx) * 180 / Math.PI - 90;
      const lipid = document.createElementNS(svgNS, 'use');
      lipid.setAttribute('href', '#phospholipidIcon');
      lipid.setAttribute('transform', `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)}) rotate(${angle.toFixed(2)})`);
      layer.append(lipid);
    }
  };

  addLeaflet('outerLeafletPath', 1);
  addLeaflet('innerLeafletPath', -1);
}

buildPhospholipidBilayer();
function render() {
  const scene = scenes[current];
  model.className = `model textbook-model ${scene.cls}`;
  document.querySelectorAll('.object').forEach(el => el.classList.toggle('active', scene.active.includes(el.dataset.key)));
  const progress = current / (scenes.length - 1) * 100;
  $('#sceneCount').textContent = `Пункт ${current + 1} из ${scenes.length}`;
  $('#stageLabel').textContent = `Пункт ${current + 1} из ${scenes.length}`;
  $('#sceneTitle').textContent = scene.title; $('#sceneText').textContent = scene.text; $('#equation').textContent = scene.eq;
  slider.value = current + 1; slider.style.setProperty('--fill', `${progress}%`);
  $('#previousButton').disabled = current === 0;
  $('#nextButton').textContent = current === scenes.length - 1 ? 'Сначала' : 'Далее';
}
function setStep(n) { current = (n + scenes.length) % scenes.length; render(); }
function stopAutoplay() { playing = false; clearInterval(timer); $('#playButton').textContent = 'Пуск'; }
function startAutoplay() { playing = true; clearInterval(timer); $('#playButton').textContent = 'Пауза'; timer = setInterval(() => { if (current === scenes.length - 1) stopAutoplay(); else setStep(current + 1); }, 5600); }
render(); startAutoplay();
$('#nextButton').onclick = () => setStep(current === 6 ? 0 : current + 1); $('#previousButton').onclick = () => setStep(current - 1);
slider.oninput = () => { stopAutoplay(); setStep(+slider.value - 1); };
$('#playButton').onclick = () => playing ? stopAutoplay() : startAutoplay();
document.querySelectorAll('.object').forEach(el => el.onclick = () => { const d = info[el.dataset.key]; $('#objectType').textContent = d[0]; $('#objectName').textContent = d[1]; $('#objectText').textContent = d[2]; $('#objectEquation').textContent = d[3]; $('#objectCard').hidden = false; });
$('#closeCard').onclick = () => $('#objectCard').hidden = true;
