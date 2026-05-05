// script.js
const btnGerar = document.getElementById('btn-gerar');
const areaCardapio = document.getElementById('area-cardapio');
const gridDias = document.getElementById('grid-dias');
const btnImprimir = document.getElementById('btn-imprimir');
const btnWhatsapp = document.getElementById('btn-whatsapp');
const btnEditar = document.getElementById('btn-editar');
const periodoSemana = document.getElementById('periodo-semana');

const nomesDias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
let modoEdicao = false; 

function obterDatasDaSemana() {
    const hoje = new Date();
    const diaDaSemana = hoje.getDay(); 
    const diferencaParaSegunda = diaDaSemana === 0 ? 1 : -(diaDaSemana - 1);
    
    const segunda = new Date(hoje);
    segunda.setDate(hoje.getDate() + diferencaParaSegunda);

    const datas = [];
    for (let i = 0; i < 5; i++) {
        const diaAtual = new Date(segunda);
        diaAtual.setDate(segunda.getDate() + i);
        const diaStr = String(diaAtual.getDate()).padStart(2, '0');
        const mesStr = String(diaAtual.getMonth() + 1).padStart(2, '0');
        datas.push(`${diaStr}/${mesStr}`);
    }
    return datas;
}

function pegarAleatorios(array, quantidade) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, quantidade);
}

// Junta todas as categorias para a roleta individual
function obterTodasRefeicoes() {
    return [
        ...refeicoes.frango,
        ...refeicoes.carne,
        ...refeicoes.massa,
        ...refeicoes.outros
    ];
}

btnGerar.addEventListener('click', () => {
    gridDias.innerHTML = '';
    
    if (modoEdicao) alternarModoEdicao();
    
    const datasDaSemana = obterDatasDaSemana();
    periodoSemana.innerText = `${datasDaSemana[0]} até ${datasDaSemana[4]}`;
    
    const massaEscolhida = pegarAleatorios(refeicoes.massa, 1)[0];
    const frangoEscolhido = pegarAleatorios(refeicoes.frango, 1)[0];
    const carneEscolhida = pegarAleatorios(refeicoes.carne, 1)[0];
    const outrosEscolhido = pegarAleatorios(refeicoes.outros, 1)[0];

    const itensRestantesParaOQuintoDia = [
        ...refeicoes.frango.filter(item => item !== frangoEscolhido),
        ...refeicoes.carne.filter(item => item !== carneEscolhida),
        ...refeicoes.outros.filter(item => item !== outrosEscolhido)
    ];
    
    const pratoExtra = pegarAleatorios(itensRestantesParaOQuintoDia, 1)[0];
    const cardapioSelecionado = [massaEscolhida, frangoEscolhido, carneEscolhida, outrosEscolhido, pratoExtra];
    const refeicoesParaSemana = pegarAleatorios(cardapioSelecionado, 5);

    nomesDias.forEach((diaNome, index) => {
        const card = document.createElement('div');
        card.className = 'dia-card';
        
        card.innerHTML = `
            <div class="dia-data">
                <span class="dia-semana">${diaNome}</span>
                <span class="dia-numero">${datasDaSemana[index]}</span>
            </div>
            <div class="dia-comida">${refeicoesParaSemana[index]}</div>
            <!-- Botão da roleta adicionado com a tag para o html2canvas ignorar -->
            <button class="btn-roleta" data-html2canvas-ignore="true" title="Sortear outro prato">🔄</button>
        `;
        
        // --- NOVA LÓGICA DA ROLETA INDIVIDUAL ---
        const btnRoleta = card.querySelector('.btn-roleta');
        const divComida = card.querySelector('.dia-comida');
        
        btnRoleta.addEventListener('click', () => {
            if(modoEdicao) return; // Não roda a roleta se estiver editando o texto
            
            const todas = obterTodasRefeicoes();
            const pratosNaTela = Array.from(document.querySelectorAll('.dia-comida')).map(el => el.innerText);
            
            // Garante que a roleta não vai sortear um prato que já está nos outros dias
            const disponiveis = todas.filter(prato => !pratosNaTela.includes(prato));
            
            if (disponiveis.length > 0) {
                divComida.innerText = pegarAleatorios(disponiveis, 1)[0];
            } else {
                divComida.innerText = pegarAleatorios(todas, 1)[0];
            }
        });

        gridDias.appendChild(card);
    });

    areaCardapio.classList.remove('escondido');
});

function alternarModoEdicao() {
    modoEdicao = !modoEdicao;
    const camposComida = document.querySelectorAll('.dia-comida');
    const botoesRoleta = document.querySelectorAll('.btn-roleta');

    if (modoEdicao) {
        btnEditar.innerText = '✅ Concluir Edição';
        btnEditar.style.backgroundColor = '#2a9d8f'; 
        gridDias.classList.add('modo-edicao'); 
        
        camposComida.forEach(campo => campo.setAttribute('contenteditable', 'true'));
        // Esconde as roletas enquanto edita para não atrapalhar
        botoesRoleta.forEach(btn => btn.style.display = 'none');
    } else {
        btnEditar.innerText = '✏️ Editar Cardápio';
        btnEditar.style.backgroundColor = ''; 
        gridDias.classList.remove('modo-edicao');
        
        camposComida.forEach(campo => {
            campo.removeAttribute('contenteditable');
            if(campo.innerText.trim() === "") campo.innerText = "Receita não definida";
        });
        // Volta a mostrar as roletas
        botoesRoleta.forEach(btn => btn.style.display = 'flex');
    }
}

btnEditar.addEventListener('click', alternarModoEdicao);

btnImprimir.addEventListener('click', () => {
    if (modoEdicao) alternarModoEdicao(); 
    window.print();
});

btnWhatsapp.addEventListener('click', async () => {
    if (modoEdicao) alternarModoEdicao(); 

    const planilha = document.getElementById('planilha-semana');
    const textoOriginal = btnWhatsapp.innerText;
    btnWhatsapp.innerText = '⏳ Gerando imagem...';

    try {
        const canvas = await html2canvas(planilha, { scale: 2, backgroundColor: "#ffffff" }); 
        
        canvas.toBlob(async (blob) => {
            const file = new File([blob], "the-chosen-lunch.png", { type: "image/png" });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'The Chosen Lunch',
                    text: 'Aqui está nosso cardápio desta semana!'
                });
            } else {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'the-chosen-lunch.png';
                a.click();
                URL.revokeObjectURL(url);
                alert("A imagem foi baixada! Você pode anexá-la no WhatsApp Web.");
            }
        });
    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao gerar a imagem.");
    } finally {
        btnWhatsapp.innerText = textoOriginal;
    }
});