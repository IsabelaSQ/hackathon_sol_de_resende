// Dados iniciais
let falhas = 0;
let operacionais = 0;
let manutencao = 0;
let myChart;

// Lista de máquinas exatas
const maquinasData = [];

// ==========================================
// MODO NOTURNO (DARK MODE)
// ==========================================
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const themeText = document.getElementById('theme-text');

function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun'); 
        themeText.innerText = 'Modo Claro';
    } else {
        document.body.classList.remove('dark-theme');
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon'); 
        themeText.innerText = 'Modo Noturno';
    }
}

const savedTheme = localStorage.getItem('theme');
if (savedTheme) { applyTheme(savedTheme); } 
else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) { applyTheme('dark'); }

themeToggleBtn.addEventListener('click', () => {
    let currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    let newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    if (myChart) {
        myChart.options.plugins.legend.labels.color = newTheme === 'dark' ? '#f3f4f6' : '#111827';
        myChart.update();
    }
});


// ==========================================
// 1. RENDERIZAR MÁQUINAS DINAMICAMENTE
// ==========================================
const grid = document.getElementById('machine-container');

function renderMachines() {
    grid.innerHTML = ''; 

    maquinasData.forEach((maquina, index) => {
        const card = document.createElement('div');
        card.className = 'machine-card';
        card.setAttribute('data-machine-index', index); 
        
        let badgeHTML = '';
        
        // Textos e classes padrão dos botões
        let btnFalhaText = 'Simular Falha';
        let btnFalhaClass = 'btn-simular';
        
        let btnManutText = 'Entrar Manut.';
        let btnManutClass = 'btn-manutencao';
        let manutDisabled = '';

        if (maquina.status === 'operando') {
            badgeHTML = `<div class="status-badge" data-status="operando">Operando <span class="status-dot dot-green"></span></div>`;
        } else if (maquina.status === 'manutencao') {
            badgeHTML = `<div class="status-badge" data-status="manutencao">Manutenção <span class="status-dot dot-yellow"></span></div>`;
            btnManutText = 'Sair da Manut.';
            btnManutClass = 'btn-manutencao active-manutencao';
        } else if (maquina.status === 'falha') {
            badgeHTML = `<div class="status-badge" data-status="falha" style="color:var(--red-text); border-color:var(--red-border);">Falha <span class="status-dot dot-red"></span></div>`;
            btnFalhaText = 'Resolver Falha';
            btnFalhaClass = 'btn-simular active-falha';
            
            // Se estiver quebrado, desabilita o botão de manutenção
            manutDisabled = 'disabled';
            btnManutClass += ' btn-disabled';
        }

        card.innerHTML = `
            <div class="machine-card-header">
                <div>
                    <div class="machine-id">${maquina.id}</div>
                    <div class="machine-name">${maquina.nome}</div>
                </div>
                ${badgeHTML}
            </div>
            <div class="card-actions">
                <button class="${btnFalhaClass}" onclick="toggleStatus(this)">${btnFalhaText}</button>
                <button class="${btnManutClass}" ${manutDisabled} onclick="toggleManutencao(this)">${btnManutText}</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ==========================================
// 2. LÓGICA DO BOTÃO "MANUTENÇÃO"
// ==========================================
function toggleManutencao(btnManut) {
    const card = btnManut.closest('.machine-card');
    const machineIndex = card.getAttribute('data-machine-index');
    const maquina = maquinasData[machineIndex];
    const badge = card.querySelector('.status-badge');
    
    // Trava de segurança: Se a máquina está em falha, a manutenção é proibida.
    if (maquina.status === 'falha') return;

    if (maquina.status === 'operando') {
        // ENTRAR EM MANUTENÇÃO
        operacionais--;
        manutencao++;
        maquina.status = 'manutencao';
        maquina.statusOriginal = 'manutencao'; // Atualiza o "estado base" da máquina

        badge.innerHTML = 'Manutenção <span class="status-dot dot-yellow"></span>';
        badge.setAttribute('data-status', 'manutencao');
        badge.style.color = 'var(--text-main)';
        badge.style.borderColor = 'var(--border-color)';
        
        btnManut.innerText = 'Sair da Manut.';
        btnManut.classList.add('active-manutencao');
        
    } else if (maquina.status === 'manutencao') {
        // SAIR DA MANUTENÇÃO E VOLTAR A OPERAR
        manutencao--;
        operacionais++;
        maquina.status = 'operando';
        maquina.statusOriginal = 'operando'; 

        badge.innerHTML = 'Operando <span class="status-dot dot-green"></span>';
        badge.setAttribute('data-status', 'operando');
        badge.style.color = 'var(--text-main)';
        badge.style.borderColor = 'var(--border-color)';
        
        btnManut.innerText = 'Entrar Manut.';
        btnManut.classList.remove('active-manutencao');
    }

    atualizarPainel();
}

// ==========================================
// 3. LÓGICA DO BOTÃO "FALHA"
// ==========================================
function toggleStatus(btnFalha) {
    const card = btnFalha.closest('.machine-card');
    const machineIndex = card.getAttribute('data-machine-index');
    const maquina = maquinasData[machineIndex];
    const badge = card.querySelector('.status-badge');
    const btnManut = card.querySelector('.btn-manutencao'); // Seleciona o botão vizinho

    if (maquina.status !== 'falha') {
        // --- LIGAR FALHA ---
        if (maquina.status === 'operando') operacionais--;
        if (maquina.status === 'manutencao') manutencao--;
        
        falhas++;
        maquina.statusOriginal = maquina.status; // Lembra se estava operando ou em manutenção
        maquina.status = 'falha';

        badge.innerHTML = 'Falha <span class="status-dot dot-red"></span>';
        badge.setAttribute('data-status', 'falha');
        badge.style.color = 'var(--red-text)';
        badge.style.borderColor = 'var(--red-border)';
        
        btnFalha.innerText = "Resolver Falha";
        btnFalha.classList.add('active-falha');

        // Desabilita o botão de manutenção
        btnManut.disabled = true;
        btnManut.classList.add('btn-disabled');
        
    } else {
        // --- DESLIGAR FALHA (Restaurar) ---
        falhas--;
        maquina.status = maquina.statusOriginal;
        
        if (maquina.status === 'operando') operacionais++;
        if (maquina.status === 'manutencao') manutencao++;

        if (maquina.status === 'operando') {
            badge.innerHTML = 'Operando <span class="status-dot dot-green"></span>';
            badge.setAttribute('data-status', 'operando');
        } else if (maquina.status === 'manutencao') {
            badge.innerHTML = 'Manutenção <span class="status-dot dot-yellow"></span>';
            badge.setAttribute('data-status', 'manutencao');
        }
        
        badge.style.color = 'var(--text-main)';
        badge.style.borderColor = 'var(--border-color)';
        
        btnFalha.innerText = "Simular Falha";
        btnFalha.classList.remove('active-falha');
        
        // Reativa o botão de manutenção
        btnManut.disabled = false;
        btnManut.classList.remove('btn-disabled');
    }

    atualizarPainel();
}

// ==========================================
// 4. INICIALIZAR E ATUALIZAR GRÁFICO E PAINEL
// ==========================================
function initChart() {
    const ctx = document.getElementById('statusChart').getContext('2d');
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Falha', 'Operacional', 'Manutenção'],
            datasets: [{
                data: [falhas, operacionais, manutencao],
                backgroundColor: ['#e02424', '#31c48d', '#faca15'], 
                borderWidth: 0,
                cutout: '60%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { 
                        padding: 20, 
                        font: { family: 'Inter', size: 14 },
                        color: document.body.classList.contains('dark-theme') ? '#f3f4f6' : '#111827' 
                    }
                }
            }
        }
    });
}

function atualizarPainel() {
    document.getElementById('count-falha').innerText = falhas;
    document.getElementById('count-operacional').innerText = operacionais;
    document.getElementById('count-manutencao').innerText = manutencao;
    
    myChart.data.datasets[0].data = [falhas, operacionais, manutencao];
    myChart.update();
}

// ==========================================
// NOVA FUNÇÃO: BUSCAR MÁQUINAS NA BASE DE DADOS
// ==========================================
async function carregarMaquinas() {
    try {
        // Atenção ao caminho: ajusta se o ficheiro PHP estiver numa pasta diferente
        // Exemplo: se o JS está dentro de 'analisesFrontEnd', usamos '../api_maquinas.php' para recuar uma pasta
        const resposta = await fetch('../includes/api_maquinas.php');
        const dados = await resposta.json();

        if (dados.erro) {
            console.error(dados.erro);
            return;
        }

        // Mapear os dados que vêm do PHP/SQL para o formato que o nosso JS já usa
        maquinasData = dados.map(maq => {
            // A base de dados envia 'Operando', 'Falha', 'Manutenção'
            // O nosso CSS/JS precisa de 'operando', 'falha', 'manutencao'
            let statusNormalizado = maq.status_operacional.toLowerCase();
            if (statusNormalizado === 'manutenção') statusNormalizado = 'manutencao';

            return {
                id: "Máquina " + maq.id_numerico,
                nome: maq.nome_equipamento,
                status: statusNormalizado,
                statusOriginal: statusNormalizado
            };
        });

        // Recalcular os contadores baseados na base de dados real
        falhas = maquinasData.filter(m => m.status === 'falha').length;
        operacionais = maquinasData.filter(m => m.status === 'operando').length;
        manutencao = maquinasData.filter(m => m.status === 'manutencao').length;

        // Mandar desenhar as máquinas no ecrã e atualizar os números/gráfico
        renderMachines();
        atualizarPainel();

    } catch (erro) {
        console.error("Erro de comunicação com o servidor:", erro);
    }
}

/* MANTÉM TODAS AS OUTRAS FUNÇÕES AQUI NO MEIO:
   - applyTheme(), event listener do Modo Noturno
   - renderMachines()
   - toggleManutencao()
   - toggleStatus()
   - initChart()
   - atualizarPainel()
*/

// ==========================================
// INICIALIZAR O SISTEMA
// ==========================================
// Removemos a chamada antiga renderMachines() daqui do fundo
initChart();
carregarMaquinas(); // Agora isto inicia o processo todo!