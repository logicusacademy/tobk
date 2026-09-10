// ===========================================================
// LOGICUS ACADEMY — TOBK Quiz Engine
// Mesin kuis interaktif yang dipakai di semua halaman tryout.
// Setiap halaman kuis mendefinisikan `QUIZ_DATA` sebelum memuat file ini.
// ===========================================================

document.addEventListener('DOMContentLoaded', () => {
    if (typeof QUIZ_DATA === 'undefined') return;
    initQuiz(QUIZ_DATA);
});

function initQuiz(data) {
    const root = document.getElementById('quiz-root');
    if (!root) return;

    const state = {
        index: 0,
        correct: 0,
        wrong: 0,
        answered: false,
        selected: null,
        userAnswers: new Array(data.questions.length).fill(null)
    };

    renderStart();

    // ---------- SCREENS ----------

    function renderStart() {
        root.innerHTML = `
            <div class="quiz-start" data-reveal>
                <span class="quiz-level-tag">${data.levelTag || 'TKA Matematika SMP'}</span>
                <h1>${data.title}</h1>
                <p class="quiz-subtitle">${data.subtitle}</p>
                <div class="quiz-meta-row">
                    <div class="quiz-meta-item"><i class="fa-solid fa-list-ol"></i> ${data.questions.length} soal</div>
                    <div class="quiz-meta-item"><i class="fa-regular fa-clock"></i> &plusmn; ${Math.round(data.questions.length * 1.5)} menit</div>
                    <div class="quiz-meta-item"><i class="fa-solid fa-layer-group"></i> L1&ndash;L3</div>
                </div>
                <button class="btn btn-primary btn-lg" id="btn-start">Mulai Tryout <i class="fa-solid fa-arrow-right"></i></button>
            </div>
        `;
        document.getElementById('btn-start').addEventListener('click', () => {
            state.index = 0;
            state.correct = 0;
            state.wrong = 0;
            renderQuestion();
        });
        markVisible();
    }

    function renderQuestion() {
        const q = data.questions[state.index];
        const total = data.questions.length;
        const progressPct = Math.round((state.index / total) * 100);
        state.answered = false;
        state.selected = null;

        root.innerHTML = `
            <div class="quiz-header-bar">
                <div class="quiz-progress-track"><div class="quiz-progress-fill" style="width:${progressPct}%"></div></div>
                <div class="quiz-score-row">
                    <span>Soal <strong>${state.index + 1}</strong> / ${total}</span>
                    <span class="quiz-score-live"><i class="fa-solid fa-check score-correct"></i> ${state.correct} &nbsp; <i class="fa-solid fa-xmark score-wrong"></i> ${state.wrong}</span>
                </div>
            </div>
            <div class="quiz-card" data-reveal>
                <span class="quiz-tag-level">${q.level}</span>
                <p class="quiz-question">${q.question}</p>
                <div class="quiz-options" id="quiz-options">
                    ${q.options.map((opt, i) => `
                        <button class="quiz-option" data-index="${i}">
                            <span class="quiz-option-letter">${String.fromCharCode(65 + i)}</span>
                            <span class="quiz-option-text">${opt}</span>
                        </button>
                    `).join('')}
                </div>
                <div class="quiz-feedback" id="quiz-feedback" hidden></div>
                <button class="btn btn-primary btn-lg quiz-next-btn" id="btn-next" hidden>
                    ${state.index === total - 1 ? 'Lihat Hasil' : 'Lanjut'} <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        `;

        document.querySelectorAll('.quiz-option').forEach(btn => {
            btn.addEventListener('click', () => selectAnswer(parseInt(btn.dataset.index)));
        });
        document.getElementById('btn-next').addEventListener('click', () => {
            state.index++;
            if (state.index >= total) {
                renderResult();
            } else {
                renderQuestion();
            }
        });
        markVisible();
    }

    function selectAnswer(i) {
        if (state.answered) return;
        state.answered = true;
        state.selected = i;
        const q = data.questions[state.index];
        const isCorrect = i === q.correctIndex;
        state.userAnswers[state.index] = i;

        if (isCorrect) state.correct++; else state.wrong++;

        document.querySelectorAll('.quiz-option').forEach((btn, idx) => {
            btn.classList.add('is-disabled');
            if (idx === q.correctIndex) btn.classList.add('is-correct');
            if (idx === i && !isCorrect) btn.classList.add('is-wrong');
        });

        const fb = document.getElementById('quiz-feedback');
        fb.hidden = false;
        fb.className = 'quiz-feedback ' + (isCorrect ? 'is-correct-fb' : 'is-wrong-fb');
        fb.innerHTML = `
            <i class="fa-solid ${isCorrect ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>
            <div>
                <p class="quiz-feedback-title">${isCorrect ? 'Benar!' : 'Belum tepat'}</p>
                <p class="quiz-feedback-text">${q.explanation}</p>
            </div>
        `;
        document.getElementById('btn-next').hidden = false;
        fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function renderResult() {
        const total = data.questions.length;
        const pct = Math.round((state.correct / total) * 100);
        let tier, tierClass;
        if (pct >= 80) { tier = 'Sangat Baik'; tierClass = 'tier-great'; }
        else if (pct >= 60) { tier = 'Cukup Baik'; tierClass = 'tier-good'; }
        else { tier = 'Perlu Latihan Lagi'; tierClass = 'tier-retry'; }

        root.innerHTML = `
            <div class="quiz-result" data-reveal>
                <div class="quiz-result-ring ${tierClass}">
                    <span class="quiz-result-pct">${pct}%</span>
                </div>
                <h2>${tier}</h2>
                <p class="quiz-result-sub">Kamu menjawab benar <strong>${state.correct}</strong> dari <strong>${total}</strong> soal.</p>
                <div class="quiz-result-stats">
                    <div class="quiz-result-stat"><span class="stat-num stat-correct">${state.correct}</span><span class="stat-label">Benar</span></div>
                    <div class="quiz-result-stat"><span class="stat-num stat-wrong">${state.wrong}</span><span class="stat-label">Salah</span></div>
                    <div class="quiz-result-stat"><span class="stat-num">${total}</span><span class="stat-label">Total Soal</span></div>
                </div>
                <div class="quiz-result-actions">
                    <button class="btn btn-primary btn-lg" id="btn-retry">Ulangi Latihan <i class="fa-solid fa-rotate-right"></i></button>
                    <a href="index.html" class="btn btn-outline btn-lg">Kembali ke Daftar Tryout</a>
                </div>
            </div>
        `;
        document.getElementById('btn-retry').addEventListener('click', renderStart);
        markVisible();
    }

    function markVisible() {
        document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-visible'));
    }
}
