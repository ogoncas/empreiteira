import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAMedvxuMClE0XLDgQwJ0251S83bhye8aU",
  authDomain: "emprenteira.firebaseapp.com",
  projectId: "emprenteira",
  storageBucket: "emprenteira.firebasestorage.app",
  messagingSenderId: "990309679524",
  appId: "1:990309679524:web:a57f8cb3480458ecad0131"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const listaProjetos = document.getElementById('lista-projetos');
const projectModal = document.getElementById('project-modal');
const projectForm = document.getElementById('project-form');
const closeModalBtn = document.getElementById('close-modal');
const modalTitle = document.getElementById('modal-title');

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'index.html';
    } else {
        escutarBancoProjetos();
    }
});

document.getElementById('btn-sair').addEventListener('click', () => signOut(auth));

function escutarBancoProjetos() {
    onSnapshot(collection(db, "projetos"), (snapshot) => {
        listaProjetos.innerHTML = '';
        if (snapshot.empty) {
            listaProjetos.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1;">Nenhuma obra registrada no sistema.</p>';
            return;
        }

        snapshot.forEach((docSnap) => {
            const item = docSnap.data();
            const id = docSnap.id;

            let notasContidasHtml = '';
            if (item.anotacoes && item.anotacoes.length > 0) {
                [...item.anotacoes].reverse().forEach(notaStr => {
                    const divisor = notaStr.split(' - ');
                    const dataNota = divisor.length > 1 ? divisor[0] : '';
                    const corpoNota = divisor.length > 1 ? divisor[1] : notaStr;
                    notasContidasHtml += `
                        <div class="note-row">
                            <span class="note-time">${dataNota}</span>
                            <p>${corpoNota}</p>
                        </div>`;
                });
            } else {
                notasContidasHtml = '<p style="color: #555; font-size: 0.8rem;">Sem relatórios diários anexados.</p>';
            }

            const card = document.createElement('div');
            card.className = 'project-card-dash';
            card.innerHTML = `
                <div class="card-meta">
                    <h3>${item.nome}</h3>
                    <span class="tag">${item.tipo} | Cliente: ${item.emailCliente || 'Não atribuído'}</span>
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
                <div class="notes-box">${notasContidasHtml}</div>
                <div class="card-actions">
                    <button class="btn-action-edit" data-id="${id}" data-email="${item.emailCliente || ''}"><i class="fa-solid fa-sliders"></i> Gerenciar</button>
                    <button class="btn-action-del" data-id="${id}"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            `;
            listaProjetos.appendChild(card);
        });
        vincularEventosCard();
    });
}

projectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('project-id').value;
    const nomeVal = document.getElementById('proj-nome').value;
    const tipoVal = document.getElementById('proj-tipo').value;
    const emailClienteVal = document.getElementById('proj-email-cliente').value.trim().toLowerCase();
    const progressoVal = parseInt(document.getElementById('proj-progresso').value, 10);
    const novaNotaText = document.getElementById('proj-nota').value.trim();

    try {
        if (id) {
            const docRef = doc(db, "projetos", id);
            const dadosAtualizados = { nome: nomeVal, tipo: tipoVal, emailCliente: emailClienteVal, progresso: progressoVal };
            if (novaNotaText !== "") {
                const dataAtual = new Date().toLocaleDateString('pt-BR');
                dadosAtualizados.anotacoes = arrayUnion(`${dataAtual} - ${novaNotaText}`);
            }
            await updateDoc(docRef, dadosAtualizados);
        } else {
            const novoDocumento = { nome: nomeVal, tipo: tipoVal, emailCliente: emailClienteVal, progresso: progressoVal, anotacoes: [] };
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

function vincularEventosCard() {
    document.querySelectorAll('.btn-action-del').forEach(btn => {
        btn.onclick = async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if (confirm("Deseja apagar permanentemente este registro de obra?")) {
                await deleteDoc(doc(db, "projetos", id));
            }
        };
    });

    document.querySelectorAll('.btn-action-edit').forEach(btn => {
        btn.onclick = (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const email = e.currentTarget.getAttribute('data-email');
            const cardPai = e.currentTarget.closest('.project-card-dash');
            
            document.getElementById('project-id').value = id;
            document.getElementById('proj-nome').value = cardPai.querySelector('h3').innerText;
            document.getElementById('proj-tipo').value = cardPai.querySelector('.tag').innerText.split(' | ')[0];
            document.getElementById('proj-email-cliente').value = email;
            document.getElementById('proj-progresso').value = parseInt(cardPai.querySelector('.progress-info span:last-child').innerText, 10);
            document.getElementById('proj-nota').value = '';

            modalTitle.innerText = "Atualizar Status da Obra";
            projectModal.style.display = 'flex';
        };
    });
}

document.getElementById('btn-novo-projeto').onclick = () => {
    projectForm.reset();
    document.getElementById('project-id').value = '';
    modalTitle.innerText = "Cadastrar Novo Empreendimento";
    projectModal.style.display = 'flex';
};

const fecharModal = () => projectModal.style.display = 'none';
closeModalBtn.onclick = fecharModal;