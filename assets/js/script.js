/*==================================================
GG PROJECT - script.js
Autor: Maicon Silveira
Revisão: correções de bugs — ver comentários "// FIX"
====================================================*/

/* FIX: como o <script> agora carrega com "defer" no HTML, o DOM já está
   pronto quando este arquivo roda — não precisa mais envolver tudo em
   DOMContentLoaded. Isso corrige o problema de document.querySelector
   retornando null (o site praticamente não funcionava antes disso). */

/*=========================================
HEADER AO ROLAR
=========================================*/
const header = document.querySelector("header");

window.addEventListener("scroll", () => {
  if (window.scrollY > 80) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

/*=========================================
BOTÃO VOLTAR AO TOPO
=========================================*/
const backTop = document.querySelector(".back-top");

window.addEventListener("scroll", () => {
  if (window.scrollY > 450) {
    backTop.classList.add("show");
  } else {
    backTop.classList.remove("show");
  }
});

/*=========================================
SCROLL SUAVE
=========================================*/
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const destino = document.querySelector(this.getAttribute("href"));
    if (destino) {
      destino.scrollIntoView({ behavior: "smooth" });
    }
  });
});

/*=========================================
MENU ATIVO (destaca o link da seção visível)
=========================================*/
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("nav ul li a");

window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 150;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href") === "#" + current) {
      link.classList.add("active");
    }
  });
});

/*=========================================
REVELAÇÃO DOS ELEMENTOS AO ROLAR
=========================================*/
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll(".fade-up").forEach(el => {
  observer.observe(el);
});

/* FIX: removi o hover de .service-card feito por JS (mouseenter/mouseleave
   setando card.style.transform) porque ele duplicava — e às vezes competia
   com — o hover que o CSS já faz em ".service-card:hover". Deixar só no CSS
   evita flicker e é mais performático. */

/*=========================================
ANIMAÇÃO DOS NÚMEROS
=========================================*/
const counters = document.querySelectorAll(".stat-box h2");
const speed = 70;

const contador = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const numero = entry.target;
      const alvo = numero.innerText.replace(/\D/g, '');
      if (alvo === "") return;

      numero.dataset.original = numero.innerText;
      let count = 0;
      numero.innerText = "0";

      const atualizar = () => {
        const incremento = Math.ceil(alvo / speed);
        count += incremento;
        if (count < alvo) {
          numero.innerText = count;
          requestAnimationFrame(atualizar);
        } else {
          numero.innerText = numero.dataset.original;
        }
      };
      atualizar();
      contador.unobserve(numero);
    }
  });
});

counters.forEach(counter => {
  contador.observe(counter);
});

/*==================================================
MENU MOBILE
==================================================*/
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("nav");

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    nav.classList.toggle("active");
    menuToggle.classList.toggle("open");
  });

  // FIX: permite abrir o menu pelo teclado (acessibilidade), já que o
  // elemento tem role="button" e tabindex="0" no HTML.
  menuToggle.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      menuToggle.click();
    }
  });

  document.querySelectorAll("nav a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("active");
      menuToggle.classList.remove("open");
    });
  });
}

/*==================================================
FORMULÁRIO DE CONTATO
==================================================*/
const formulario = document.querySelector("#form-contato");

if (formulario) {
  formulario.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = formulario.querySelector('input[name="nome"]');
    const email = formulario.querySelector('input[name="email"]');
    const mensagem = formulario.querySelector('textarea[name="mensagem"]');
    const botao = formulario.querySelector('button[type="submit"]');

    if (nome.value.trim() === "") {
      alert("Informe seu nome.");
      nome.focus();
      return;
    }
    if (email.value.trim() === "") {
      alert("Informe seu e-mail.");
      email.focus();
      return;
    }
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValido.test(email.value)) {
      alert("Digite um e-mail válido.");
      email.focus();
      return;
    }
    if (mensagem.value.trim().length < 10) {
      alert("Descreva melhor seu projeto.");
      mensagem.focus();
      return;
    }

    /* FIX: antes o formulário só mostrava um alert() de sucesso e não
       enviava os dados a lugar nenhum — todo pedido de orçamento era
       perdido. Agora ele realmente envia via fetch.

       IMPORTANTE: troque a URL abaixo por um endpoint real. Duas opções
       simples e gratuitas para começar:
         1) Formspree (https://formspree.io) — crie um form e troque a URL
            por algo como "https://formspree.io/f/SEU_ID_AQUI"
         2) Web3Forms (https://web3forms.com) — similar, sem precisar de
            backend próprio.
       Se preferir, também dá pra apontar para um backend próprio (PHP,
       Node, etc.) que envie o e-mail para gg.agro@gmail.com. */
    const ENDPOINT_FORMULARIO = "https://formspree.io/f/xbgjrnjb";

    try {
      botao.disabled = true;
      botao.textContent = "Enviando...";

      const resposta = await fetch(ENDPOINT_FORMULARIO, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: new FormData(formulario)
      });

      if (resposta.ok) {
        alert("Mensagem enviada com sucesso! Em breve entraremos em contato.");
        formulario.reset();
      } else {
        alert("Não foi possível enviar agora. Tente novamente ou fale pelo WhatsApp.");
      }
    } catch (erro) {
      alert("Não foi possível enviar agora. Tente novamente ou fale pelo WhatsApp.");
    } finally {
      botao.disabled = false;
      botao.textContent = "Solicitar orçamento";
    }
  });
}

/*==================================================
PARALLAX HERO
==================================================*/
const hero = document.querySelector(".hero");
window.addEventListener("scroll", () => {
  if (hero) {
    hero.style.backgroundPositionY = window.scrollY * 0.45 + "px";
  }
});

/*==================================================
BOTÕES (efeito de subir no hover)
==================================================*/
const botoes = document.querySelectorAll(".btn-primary, .btn-header");
botoes.forEach(btn => {
  btn.addEventListener("mouseenter", () => {
    btn.style.transform = "translateY(-4px)";
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "translateY(0px)";
  });
});

/*==================================================
DELAY ESCALONADO NAS ANIMAÇÕES
==================================================*/
const elementos = document.querySelectorAll(
  ".service-card,.mission-card,.project,.client-card,.partner,.contact-card,.stat-box"
);
elementos.forEach((el, index) => {
  el.style.transitionDelay = (index * 0.05) + "s";
});

/*==================================================
PRELOAD DAS IMAGENS
==================================================*/
window.addEventListener("load", () => {
  document.querySelectorAll("img").forEach(img => {
    const imagem = new Image();
    imagem.src = img.src;
  });
});

/*==================================================
ANO AUTOMÁTICO NO RODAPÉ
==================================================*/
const ano = document.querySelector(".current-year");
if (ano) {
  ano.textContent = new Date().getFullYear();
}

/*==================================================
FIM DO SCRIPT
==================================================*/