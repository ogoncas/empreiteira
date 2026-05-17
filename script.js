/* ==========================================================================
   EFEITO DE ROLAGEM NA BARRA DE NAVEGAÇÃO
   Adiciona um fundo sólido e sombra ao menu quando o usuário desce a página.
   ========================================================================== */
const navbar = document.getElementById('navbar');

// Escuta o evento de 'scroll' na janela do navegador
window.addEventListener('scroll', () => {
    // Se a rolagem vertical for maior que 50 pixels...
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled'); // Aplica a classe com estilos compactos
    } else {
        navbar.classList.remove('scrolled'); // Remove a classe, voltando ao estado original
    }
});


/* ==========================================================================
   LÓGICA DO MENU MOBILE (HAMBÚRGUER)
   Controla a abertura, fechamento e as animações do menu no celular.
   ========================================================================== */
const mobileMenu = document.getElementById('mobile-menu'); // O botão de 3 linhas
const navLinks = document.getElementById('nav-links');     // O container dos links
const navItems = document.querySelectorAll('.nav-links a');// Todos os links individuais

// Função principal que alterna o estado do menu (Aberto / Fechado)
function toggleMenu() {
    mobileMenu.classList.toggle('active'); // Anima o botão para 'X' ou volta a hambúrguer
    navLinks.classList.toggle('active');   // Desliza o menu na tela ou esconde
    
    // Melhoria de UX: Trava o scroll da página do fundo quando o menu está aberto
    if (navLinks.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto'; // Restaura o scroll
    }
}

// Dispara a função ao clicar no botão hambúrguer
mobileMenu.addEventListener('click', toggleMenu);

// Melhoria de UX: Fecha o menu overlay automaticamente se o usuário clicar em algum link
navItems.forEach(item => {
    item.addEventListener('click', () => {
        // Confirma se o menu está na versão mobile (aberto) antes de agir
        if (navLinks.classList.contains('active')) {
            toggleMenu();
        }
    });
});


/* ==========================================================================
   ANIMAÇÕES DE ENTRADA VIA SCROLL (REVEAL)
   Utiliza a API nativa IntersectionObserver para otimização de performance.
   Ao invés de verificar o scroll a todo momento, o navegador avisa o script
   quando o elemento entra na tela.
   ========================================================================== */

// Seleciona todos os elementos do HTML que possuem a classe 'reveal'
const revealElements = document.querySelectorAll('.reveal');

// Função executada sempre que um elemento monitorado entra ou sai do viewport
const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
        // Se o elemento está visível na tela (isIntersecting)
        if (entry.isIntersecting) {
            entry.target.classList.add('active'); // Adiciona a classe que roda o CSS de fade e transição
            observer.unobserve(entry.target);     // Para de monitorar este elemento para economizar processamento
        }
    });
};

// Configurações de precisão do observador
const revealOptions = { 
    threshold: 0.15, // A animação dispara quando 15% do elemento está visível
    rootMargin: "0px 0px -50px 0px" // Reduz a área de acionamento em 50px do fundo (atrasa um pouco a entrada)
};

// Instancia o IntersectionObserver com a nossa função e configurações
const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

// Solicita que o observador comece a vigiar cada um dos elementos 'reveal'
revealElements.forEach(el => revealObserver.observe(el));