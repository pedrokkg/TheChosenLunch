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
            <!-- O prato é inserido aqui limpo, sem o evento de clique antigo -->
            <div class="dia-comida">${refeicoesParaSemana[index]}</div>
        `;
        
        gridDias.appendChild(card);
    });

    areaCardapio.classList.remove('escondido');
});

// Nova lógica de ligar/desligar edição na própria tela
function alternarModoEdicao() {
    modoEdicao = !modoEdicao;
    const camposComida = document.querySelectorAll('.dia-comida');

    if (modoEdicao) {
        btnEditar.innerText = '✅ Concluir Edição';
        btnEditar.style.backgroundColor = '#2a9d8f'; 
        gridDias.classList.add('modo-edicao'); 
        
        // Ativa a digitação em todos os dias
        camposComida.forEach(campo => {
            campo.setAttribute('contenteditable', 'true');
        });
    } else {
        btnEditar.innerText = '✏️ Editar Cardápio';
        btnEditar.style.backgroundColor = ''; 
        gridDias.classList.remove('modo-edicao');
        
        // Desativa a digitação e limpa espaços vazios
        camposComida.forEach(campo => {
            campo.removeAttribute('contenteditable');
            if(campo.innerText.trim() === "") {
                campo.innerText = "Receita não definida"; // Previne que o dia fique vazio se apagar tudo
            }
        });
    }
}

btnEditar.addEventListener('click', alternarModoEdicao);

// Impressão
btnImprimir.addEventListener('click', () => {
    if (modoEdicao) alternarModoEdicao(); // Desliga a edição antes de imprimir
    window.print();
});

// Exportar pro WhatsApp
btnWhatsapp.addEventListener('click', async () => {
    if (modoEdicao) alternarModoEdicao(); // Desliga a edição antes de gerar imagem

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