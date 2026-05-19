import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    loginError.innerText = "Verificando permissões...";

    signInWithEmailAndPassword(auth, email, pass)
        .then(async (userCredential) => {
            const user = userCredential.user;
            
            // Busca o papel (role) do usuário na coleção 'usuarios' pelo UID
            const userDoc = await getDoc(doc(db, "usuarios", user.uid));
            
            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData.role === 'admin') {
                    window.location.href = 'admin.html';
                } else if (userData.role === 'cliente') {
                    window.location.href = 'cliente.html';
                } else {
                    loginError.innerText = "Usuário sem perfil atribuído.";
                }
            } else {
                loginError.innerText = "Perfil não localizado no banco de dados.";
            }
        })
        .catch(err => {
            loginError.innerText = "Acesso negado. Credenciais inválidas.";
        });
});