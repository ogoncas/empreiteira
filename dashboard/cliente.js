import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

const listaProjetosCliente = document.getElementById('lista-projetos-cliente');
const welcomeMsg = document.getElementById('welcome-msg');

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'index.html';
    } else {
        welcomeMsg.innerText = `Conectado como: ${user.email}. Acompanhe abaixo o status dos seus projetos.`;
        escutarProjetosDoCliente(user.email.toLowerCase());
    }
});

document.getElementById('btn-sair').addEventListener('click', () => signOut(auth));

function escutarProjetosDoCliente(emailCliente) {
    // CRÍTICO: Filtra no banco apenas documentos que pertencem a este e-mail
    const q = query(collection(db, "projetos"), where("emailCliente", "==", emailCliente));

    onSnapshot(q, (snapshot) => {
        listaProjetosCliente.innerHTML = '';
        
        if (snapshot.empty) {
            listaProjetosCliente.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1;">Nenhum projeto associado ao seu e-mail neste momento.</p>';
            return;
        }

        snapshot.forEach((docSnap) => {
            const item = docSnap.data();

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
                notasContidasHtml = '<p style="color: #555; font-size: 0.8rem;">Nenhum relatório diário postado pela engenharia ainda.</p>';
            }

            const card = document.createElement('div');
            card.className = 'project-card-dash';
            card.innerHTML = `
                <div class="card-meta">
                    <h3>${item.nome}</h3>
                    <span class="tag">${item.tipo}</span>
                </div>
                <div class="progress-wrapper">
                    <div class="progress-info">
                        <span>Avanço Físico Realizado</span>
                        <span style="color: var(--accent-color); font-weight:600;">${item.progresso}%</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" style="width: ${item.progresso}%;"></div>
                    </div>
                </div>
                <h4 style="font-size:0.8rem; text-transform:uppercase; letter-spacing:1px; margin-bottom:10px; color: var(--text-muted);">Diário de Evolução da Obra</h4>
                <div class="notes-box">${notasContidasHtml}</div>
            `;
            listaProjetosCliente.appendChild(card);
        });
    });
}