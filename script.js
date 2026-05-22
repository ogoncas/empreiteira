/* ==========================================================================
   EFEITO DE ROLAGEM NA BARRA DE NAVEGAÇÃO
   ========================================================================== */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled'); 
    } else {
        navbar.classList.remove('scrolled'); 
    }
});


/* ==========================================================================
   LÓGICA DO MENU MOBILE (HAMBÚRGUER)
   ========================================================================== */
const mobileMenu = document.getElementById('mobile-menu'); 
const navLinks = document.getElementById('nav-links');     
const navItems = document.querySelectorAll('.nav-links a');

function toggleMenu() {
    const isOpen = mobileMenu.classList.toggle('active');
    navLinks.classList.toggle('active');   
    
    // ACESSIBILIDADE: Atualiza o estado do menu para leitores de tela (true/false)
    mobileMenu.setAttribute('aria-expanded', isOpen);
    
    if (navLinks.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto'; 
    }
}

mobileMenu.addEventListener('click', toggleMenu);

// ACESSIBILIDADE: Permite abrir/fechar o menu mobile pressionando "Enter" ou "Espaço" ao focar o botão
mobileMenu.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); // Evita scroll indesejado ao pressionar Espaço
        toggleMenu();
    }
});

navItems.forEach(item => {
    item.addEventListener('click', () => {
        if (navLinks.classList.contains('active')) {
            toggleMenu();
        }
    });
});


/* ==========================================================================
   ANIMAÇÕES DE ENTRADA VIA SCROLL (REVEAL)
   ========================================================================== */
const revealElements = document.querySelectorAll('.reveal');

const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active'); 
            observer.unobserve(entry.target);     
        }
    });
};

const revealOptions = { 
    threshold: 0.05, 
    rootMargin: "0px 0px 50px 0px" 
};

const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

revealElements.forEach(el => revealObserver.observe(el));