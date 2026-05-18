// Importações do Firebase v10 (SDK Modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
// SUAS CONFIGURAÇÕES DO FIREBASE (Copie do seu console)
const firebaseConfig = {
  apiKey: "AIzaSyAMedvxuMClE0XLDgQwJ0251S83bhye8aU",
  authDomain: "emprenteira.firebaseapp.com",
  projectId: "emprenteira",
  storageBucket: "emprenteira.firebasestorage.app",
  messagingSenderId: "990309679524",
  appId: "1:990309679524:web:a57f8cb3480458ecad0131"
};

// Inicialização de APIs
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Seletores Estruturais da DOM
const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const listaProjetos = document.getElementById('lista-projetos');

// Seletores do Modal de Ação
const projectModal = document.getElementById('project-modal');
const projectForm = document.getElementById('project-form');
const closeModalBtn = document.getElementById('close-modal');
const modalTitle = document.getElementById('modal-title');

/* ==========================================================================
   1. GERENCIADOR DE ESTADO DE AUTENTICAÇÃO (Garante fluxo correto de telas)
   ========================================================================== */
onAuthStateChanged(auth, (user) => {
    if (user) {
        // PERFEITO: Remove o container de login de vista e ativa a dashboard
        loginScreen.style.setProperty('display', 'none', 'important');
        dashboardScreen.style.display = 'block';
        escutarBancoProjetos(); // Inicializa leitura em tempo real
    } else {
        // DESLOGADO: Retorna e foca apenas na visualização do login box
        dashboardScreen.style.display = 'none';
        loginScreen.style.setProperty('display', 'flex', 'important');
        listaProjetos.innerHTML = '';
    }
});

// Ação de Login manual
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    loginError.innerText = "Verificando...";

    signInWithEmailAndPassword(auth, email, pass)
        .then(() => loginError.innerText = "")
        .catch(err => loginError.innerText = "Acesso negado. Credenciais inválidas.");
});

// Ação de Logout
document.getElementById('btn-sair').addEventListener('click', () => signOut(auth));


/* ==========================================================================
   2. OPERAÇÃO DO CRUD: LEITURA EM TEMPO REAL (READ)
   ========================================================================== */
function escutarBancoProjetos() {
    onSnapshot(collection(db, "projetos"), (snapshot) => {
        listaProjetos.innerHTML = '';
        
        if (snapshot.empty) {
            listaProjetos.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1;">Nenhuma obra registrada no sistema da engenharia.</p>';
            return;
        }

        snapshot.forEach((docSnap) => {
            const item = docSnap.data();
            const id = docSnap.id;

            // Tratamento interno das anotações estruturadas no array
            let notasContidasHtml = '';
            if (item.anotacoes && item.anotacoes.length > 0) {
                // Exibe das notas mais recentes para as mais antigas
                [...item.anotacoes].reverse().forEach(notaStr => {
                    const divisor = notaStr.split(' - ');
                    const dataNota = divisor.length > 1 ? divisor[0] : '';
                    const corpoNota = divisor.length > 1 ? divisor[1] : notaStr;
                    notasContidasHtml += `
                        <div class="note-row">
                            <span class="note-time">${dataNota}</span>
                            <p>${corpoNota}</p>
                        </div>
                    `;
                });
            } else {
                notasContidasHtml = '<p style="color: #555; font-size: 0.8rem;">Sem relatórios diários anexados.</p>';
            }

            // Construção e injeção do card técnico
            const card = document.createElement('div');
            card.className = 'project-card-dash';
            card.innerHTML = `
                <div class="card-meta">
                    <h3>${item.nome}</h3>
                    <span class="tag">${item.tipo}</span>
                </div>
                <div class="progress-wrapper">
                    <div class="progress-info">
                        <span>Avanço Físico</span>
                        <span style="color: var(--accent-color); font-weight:600;">${item.progresso}%</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" style="width: ${item.progresso}%;"></div>
                    </div>
                </div>
                <h4 style="font-size:0.8rem; text-transform:uppercase; letter-spacing:1px; margin-bottom:10px; color: var(--text-muted);">Diário de Obras</h4>
                <div class="notes-box">
                    ${notasContidasHtml}
                </div>
                <div class="card-actions">
                    <button class="btn-action-edit" data-id="${id}"><i class="fa-solid fa-sliders"></i> Gerenciar</button>
                    <button class="btn-action-del" data-id="${id}"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            `;
            listaProjetos.appendChild(card);
        });

        vincularEventosCard();
    });
}


/* ==========================================================================
   3. OPERAÇÃO DO CRUD: SALVAR / ATUALIZAR (CREATE & UPDATE)
   ========================================================================== */
projectForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('project-id').value;
    const nomeVal = document.getElementById('proj-nome').value;
    const tipoVal = document.getElementById('proj-tipo').value;
    const progressoVal = parseInt(document.getElementById('proj-progresso').value, 10);
    const novaNotaText = document.getElementById('proj-nota').value.trim();

    try {
        if (id) {
            // Cenário UPDATE
            const docRef = doc(db, "projetos", id);
            const dadosAtualizados = {
                nome: nomeVal,
                tipo: tipoVal,
                progresso: progressoVal
            };

            // Se o funcionário escreveu uma nova anotação, adiciona de forma incremental (arrayUnion)
            if (novaNotaText !== "") {
                const dataAtual = new Date().toLocaleDateString('pt-BR');
                dadosAtualizados.anotacoes = arrayUnion(`${dataAtual} - ${novaNotaText}`);
            }

            await updateDoc(docRef, dadosAtualizados);
        } else {
            // Cenário CREATE
            const novoDocumento = {
                nome: nomeVal,
                tipo: tipoVal,
                progresso: progressoVal,
                anotacoes: []
            };

            if (novaNotaText !== "") {
                const dataAtual = new Date().toLocaleDateString('pt-BR');
                novoDocumento.anotacoes.push(`${dataAtual} - ${novaNotaText}`);
            }

            await addDoc(collection(db, "projetos"), novoDocumento);
        }
        fecharModal();
    } catch (err) {
        alert("Erro operacional ao gravar dados: " + err.message);
    }
});


/* ==========================================================================
   4. OPERAÇÃO DO CRUD: EXCLUSÃO DE DADOS (DELETE)
   ========================================================================== */
function vincularEventosCard() {
    // Mapeamento de cliques do botão Excluir
    document.querySelectorAll('.btn-action-del').forEach(btn => {
        btn.onclick = async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if (confirm("Alerta Crítico: Deseja apagar permanentemente este registro de obra no sistema?")) {
                await deleteDoc(doc(db, "projetos", id));
            }
        };
    });

    // Mapeamento de cliques do botão Editar (Carrega os dados atuais da tela no modal)
    document.querySelectorAll('.btn-action-edit').forEach(btn => {
        btn.onclick = (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const cardPai = e.currentTarget.closest('.project-card-dash');
            
            document.getElementById('project-id').value = id;
            document.getElementById('proj-nome').value = cardPai.querySelector('h3').innerText;
            document.getElementById('proj-tipo').value = cardPai.querySelector('.tag').innerText;
            document.getElementById('proj-progresso').value = parseInt(cardPai.querySelector('.progress-info span:last-child').innerText, 10);
            document.getElementById('proj-nota').value = ''; // Limpa o campo de texto para aceitar nova anotação independente

            modalTitle.innerText = "Atualizar Status da Obra";
            projectModal.style.display = 'flex';
        };
    });
}


/* ==========================================================================
   CONTROLES DO MODAL (INTERFACE COMPLEMENTAR)
   ========================================================================== */
document.getElementById('btn-novo-projeto').onclick = () => {
    projectForm.reset();
    document.getElementById('project-id').value = '';
    modalTitle.innerText = "Cadastrar Novo Empreendimento";
    projectModal.style.display = 'flex';
};

const fecharModal = () => projectModal.style.display = 'none';
closeModalBtn.onclick = fecharModal;
window.onclick = (e) => { if (e.target == projectModal) fecharModal(); };