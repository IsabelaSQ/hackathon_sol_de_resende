let falhas = 0;
let operacionais = 6;
const totalMaquinas = 6;

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
                <div class="status-badge">
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
    
    const isEmFalha = badge.innerHTML.includes('Falha');

    if (!isEmFalha) {
        badge.innerHTML = 'Falha <span class="status-dot dot-red"></span>';
        badge.style.color = 'var(--red-text)';
        badge.style.borderColor = 'var(--red-border)';
        
        button.innerText = "Resolver Falha"; 
        button.style.backgroundColor = 'var(--red-bg)';
        
        falhas++;
        operacionais--;
    } else {
        badge.innerHTML = 'Operando <span class="status-dot dot-green"></span>';
        badge.style.color = 'var(--text-main)'; 
        badge.style.borderColor = '#e5e7eb';    
        
        button.innerText = "Simular Falha";
        button.style.backgroundColor = 'white'; original
        
       
        falhas--;
        operacionais++;
    }

    document.getElementById('count-falha').innerText = falhas;
    document.getElementById('count-operacional').innerText = operacionais;
    document.getElementById('badge-total').innerText = operacionais;
}

renderMachines();