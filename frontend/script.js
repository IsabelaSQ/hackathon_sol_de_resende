// Dados iniciais
let falhas = 0;
let operacionais = 6;
let manutencao = 1;
const totalMaquinas = 6;
let entropiaChart; // Variável para guardar o gráfico

// ==========================================
// DESAFIO 1: DARK MODE COM LOCALSTORAGE
// ==========================================
const themeToggleBtn = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme');

// Se o usuário já tinha escolhido dark mode antes, aplica ao carregar
if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i> Modo Claro';
}

themeToggleBtn.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    
    if (theme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i> Modo Escuro';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i> Modo Claro';
    }
});

// ==========================================
// DESAFIO 2: GRÁFICO DE ENTROPIA (CHART.JS)
// ==========================================
function initChart() {
    const ctx = document.getElementById('entropiaChart').getContext('2d');
    entropiaChart = new Chart(ctx, {
        type: 'doughnut', // Gráfico de rosca/pizza
        data: {
            labels: ['Falha', 'Operacional', 'Manutenção'],
            datasets: [{
                data: [falhas, operacionais, manutencao],
                backgroundColor: ['#e02424', '#faca15', '#057a55'], // Cores: Vermelho, Amarelo, Verde
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: 'var(--text-main)' } }
            }
        }
    });
}

// Atualiza o gráfico com os novos números
function updateChart() {
    entropiaChart.data.datasets[0].data = [falhas, operacionais, manutencao];
    entropiaChart.update();
}

// ==========================================
// LÓGICA DAS MÁQUINAS (HTML Dinâmico e Botões)
// ==========================================
const grid = document.getElementById('machine-container');

function renderMachines() {
    for (let i = 0; i < totalMaquinas; i++) {
        const card = document.createElement('div');
        card.className = 'machine-card';
        card.innerHTML = `
            <div class="machine-card-header">
                <div>
                    <div class="machine-id">Maquina ${i + 1}</div>
                    <div class="machine-name">Torno Mecanico O3A</div>
                </div>
                <div class="status-badge" data-status="operando">
                    Operando <span class="status-dot dot-green"></span>
                </div>
            </div>
            <button class="btn-simular" onclick="toggleStatus(this)">Simular Falha</button>
        `;
        grid.appendChild(card);
    }
}

function toggleStatus(button) {
    const card = button.closest('.machine-card');
    const badge = card.querySelector('.status-badge');
    const isEmFalha = badge.getAttribute('data-status') === 'falha';

    if (!isEmFalha) {
        badge.innerHTML = 'Falha <span class="status-dot dot-red"></span>';
        badge.setAttribute('data-status', 'falha');
        badge.style.color = 'var(--red-text)';
        badge.style.borderColor = 'var(--red-border)';
        
        button.innerText = "Resolver Falha";
        button.style.backgroundColor = 'var(--red-bg)';
        
        falhas++;
        operacionais--;
    } else {
        badge.innerHTML = 'Operando <span class="status-dot dot-green"></span>';
        badge.setAttribute('data-status', 'operando');
        badge.style.color = 'var(--text-main)';
        badge.style.borderColor = 'var(--border-color)';
        
        button.innerText = "Simular Falha";
        button.style.backgroundColor = 'var(--bg-color)';
        
        falhas--;
        operacionais++;
    }

    document.getElementById('count-falha').innerText = falhas;
    document.getElementById('count-operacional').innerText = operacionais;
    document.getElementById('badge-total').innerText = operacionais;
    
    updateChart();
}

renderMachines();
initChart();