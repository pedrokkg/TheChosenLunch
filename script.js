const btnGerar = document.getElementById('btn-gerar');
const areaCardapio = document.getElementById('area-cardapio');
const gridDias = document.getElementById('grid-dias');
const btnImprimir = document.getElementById('btn-imprimir');
const btnWhatsapp = document.getElementById('btn-whatsapp');
const periodoSemana = document.getElementById('periodo-semana');

const nomesDias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

// Função para descobrir as datas de segunda a sexta da semana atual
function obterDatasDaSemana() {
    const hoje = new Date();
    const diaDaSemana = hoje.getDay(); // 0 (Dom) a 6 (Sáb)
    
    // Calcula a diferença para chegar na segunda-feira
    const diferencaParaSegunda = diaDaSemana === 0 ? 1 : -(diaDaSemana - 1);
    
    const segunda = new Date(hoje);
    segunda.setDate(hoje.getDate() + diferencaParaSegunda);

    const datas = [];
    for (let i = 0; i < 5; i++) {
        const diaAtual = new Date(segunda);
        diaAtual.setDate(segunda.getDate() + i);
        
        // Formata para DD/MM
        const diaStr = String(diaAtual.getDate()).padStart(2, '0');
        const mesStr = String(diaAtual.getMonth() + 1).padStart(2, '0');
        datas.push(`${diaStr}/${mesStr}`);
    }
    return datas;
}

// Embaralha o array (garante que as refeições não se repitam nos mesmos dias)
function embaralharArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

btnGerar.addEventListener('click', () => {
    gridDias.innerHTML = '';
    
    const datasDaSemana = obterDatasDaSemana();
    
    // Atualiza o subtítulo com o período (ex: 12/08 a 16/08)
    periodoSemana.innerText = `${datasDaSemana[0]} até ${datasDaSemana[4]}`;
    
    // Pega 5 refeições aleatórias da constante refeicoesPreDefinidas (do data.js)
    const refeicoesEscolhidas = embaralharArray(refeicoesPreDefinidas).slice(0, 5);

    // Gera os cards estilo calendário
    nomesDias.forEach((diaNome, index) => {
        const card = document.createElement('div');
        card.className = 'dia-card';
        
        card.innerHTML = `
            <div class="dia-data">
                <span class="dia-semana">${diaNome}</span>
                <span class="dia-numero">${datasDaSemana[index]}</span>
            </div>
            <div class="dia-comida">${refeicoesEscolhidas[index]}</div>
        `;
        
        gridDias.appendChild(card);
    });

    areaCardapio.classList.remove('escondido');
});

// Impressão
btnImprimir.addEventListener('click', () => window.print());

// Exportar pro WhatsApp via html2canvas
btnWhatsapp.addEventListener('click', async () => {
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