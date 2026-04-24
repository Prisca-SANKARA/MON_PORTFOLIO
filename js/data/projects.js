const projectsData = {
  fr: [
    {
      id: "saas-veille",
      title: "Plateforme SaaS de Veille IT",
      subtitle: "Détection des menaces émergentes",
      description: "Mise en place d'une cellule de veille et détection des menaces ciblant l'entreprise. Architecture SaaS multi-tenant avec isolation complète par client.",
      category: "devsecops",
      tags: ["Docker", "Keycloak", "Supabase", "n8n", "Spring Boot", "Angular"],
      github: "https://github.com/Prisca-SANKARA",
      demo: "",
      detail: "pages/saas-veille.html",
      company: "Arcashield Cybersecurity",
      status: "En cours",
      statusColor: "#e63946",
      emoji: "🔐",
      image: ""
      
    },
    {
  id: "taskflow",
  title: "TaskFlow",
  subtitle: "Task Manager full-stack",
  description: "Application de gestion de tâches avec authentification Supabase, dashboard analytique en temps réel, graphiques interactifs, priorités, catégories, deadlines et déploiement continu sur Netlify.",
  category: "fullstack",
  tags: ["React", "Supabase", "Tailwind CSS", "PostgreSQL", "Netlify"],
  github: "https://github.com/Prisca-SANKARA/taskflow-app",
  demo: "https://taskflow-prisca.netlify.app",
  detail: "pages/taskflow.html",
  company: "Projet personnel",
  status: "Terminé",
  statusColor: "🟢#1d9e75",
  emoji: "📋",
  image: "images/taskflow-preview.png"
},

    {
      id: "agenda",
      title: "Agenda Collaboratif",
      subtitle: "Outil temps réel",
      description: "Application web collaborative de gestion d'événements et réunions en temps réel avec synchronisation instantanée entre utilisateurs.",
      category: "fullstack",
      tags: ["Angular", "Spring Boot", "WebSockets", "FullCalendar", "MySQL"],
      github: "https://github.com/Prisca-SANKARA",
      demo: "",
      detail: "pages/agenda.html",
      company: "Box Africa",
      status: "Terminé",
      statusColor: "#1d9e75",
      emoji: "📅",
      image: ""
    },
    {
      id: "fasoartisans",
      title: "FasoArtisans.bf",
      subtitle: "Plateforme artisans burkinabè",
      description: "Plateforme digitale permettant aux artisans du Burkina Faso d'être visibles en ligne — couturiers, tisserands, maroquiniers. Modèle freemium.",
      category: "fullstack",
      tags: ["Next.js", "Supabase", "CinetPay", "Tailwind CSS"],
      github: "https://github.com/Prisca-SANKARA",
      demo: "",
      detail: "pages/fasoartisans.html",
      company: "Projet entrepreneurial 🇧🇫",
      status: "En développement",
      statusColor: "#378add",
      emoji: "🎨",
      image: ""
    },
    {
      id: "portfolio",
      title: "Portfolio Personnel",
      subtitle: "Ce site web",
      description: "Portfolio personnel moderne avec animations, mode sombre/clair, switch de langue FR/EN, particles.js et design responsive.",
      category: "frontend",
      tags: ["HTML5", "CSS3", "JavaScript", "Particles.js", "Typed.js"],
      github: "https://github.com/Prisca-SANKARA",
      demo: "#",
      detail: "pages/portfolio.html",
      company: "Projet personnel",
      status: "Terminé",
      statusColor: "#1d9e75",
      emoji: "💼",
      image: ""
    },
    {
      id: "vitrine",
      title: "Sites Vitrines",
      subtitle: "Série WordPress / HTML",
      description: "Série de sites vitrines professionnels pour artisans et petites entreprises. Design moderne, responsive, optimisé SEO.",
      category: "frontend",
      tags: ["WordPress", "HTML5", "CSS3", "JavaScript", "SEO"],
      github: "https://github.com/Prisca-SANKARA",
      demo: "",
      detail: "pages/vitrine.html",
      company: "Freelance",
      status: "À venir",
      statusColor: "#9aa3b8",
      emoji: "🌐",
      image: ""
    },
    {
      id: "rest-api",
      title: "REST API + JWT Auth",
      subtitle: "API sécurisée full-stack",
      description: "API REST complète avec authentification JWT (access + refresh token), CRUD, pagination, rate limiting et documentation Swagger.",
      category: "backend",
      tags: ["Spring Boot", "PostgreSQL", "Docker", "JWT", "Swagger"],
      github: "https://github.com/Prisca-SANKARA",
      demo: "",
      detail: "pages/rest-api.html",
      company: "Projet personnel",
      status: "À venir",
      statusColor: "#9aa3b8",
      emoji: "⚙️",
      image: ""
    },
    {
      id: "dashboard",
      title: "Security Dashboard",
      subtitle: "Monitoring temps réel",
      description: "Tableau de bord temps réel pour visualiser logs de sécurité, alertes et métriques système. Automatisations n8n intégrées.",
      category: "devsecops",
      tags: ["Angular", "n8n", "Supabase", "Chart.js", "WebSockets"],
      github: "https://github.com/Prisca-SANKARA",
      demo: "",
      detail: "pages/dashboard.html",
      company: "Projet personnel",
      status: "À venir",
      statusColor: "#9aa3b8",
      emoji: "📊",
      image: ""
    }
  ],
  en: [
    {
      id: "saas-veille",
      title: "IT Threat Intelligence SaaS",
      subtitle: "Emerging threat detection",
      description: "Building a threat intelligence unit for detecting emerging threats targeting the company. Multi-tenant SaaS architecture with full client isolation.",
      category: "devsecops",
      tags: ["Docker", "Keycloak", "Supabase", "n8n", "Spring Boot", "Angular"],
      github: "https://github.com/Prisca-SANKARA",
      demo: "",
      detail: "pages/saas-veille.html",
      company: "Arcashield Cybersecurity",
      status: "In progress",
      statusColor: "#e63946",
      emoji: "🔐",
      image: ""
    },
    {
      id: "agenda",
      title: "Collaborative Agenda",
      subtitle: "Real-time scheduling tool",
      description: "Real-time collaborative web application for managing events and meetings with instant synchronization between users.",
      category: "fullstack",
      tags: ["Angular", "Spring Boot", "WebSockets", "FullCalendar", "MySQL"],
      github: "https://github.com/Prisca-SANKARA",
      demo: "",
      detail: "pages/agenda.html",
      company: "Box Africa",
      status: "Completed",
      statusColor: "#1d9e75",
      emoji: "📅",
      image: ""
    },
    {
      id: "fasoartisans",
      title: "FasoArtisans.bf",
      subtitle: "Burkina Faso artisan platform",
      description: "Digital platform for Burkina Faso artisans to gain online visibility — tailors, weavers, leatherworkers. Freemium model.",
      category: "fullstack",
      tags: ["Next.js", "Supabase", "CinetPay", "Tailwind CSS"],
      github: "https://github.com/Prisca-SANKARA",
      demo: "",
      detail: "pages/fasoartisans.html",
      company: "Entrepreneurial project 🇧🇫",
      status: "In development",
      statusColor: "#378add",
      emoji: "🎨",
      image: ""
    },
    {
      id: "portfolio",
      title: "Personal Portfolio",
      subtitle: "This website",
      description: "Modern personal portfolio with animations, dark/light mode, FR/EN language switch, particles.js and responsive design.",
      category: "frontend",
      tags: ["HTML5", "CSS3", "JavaScript", "Particles.js", "Typed.js"],
      github: "https://github.com/Prisca-SANKARA",
      demo: "#",
      detail: "pages/portfolio.html",
      company: "Personal project",
      status: "Completed",
      statusColor: "#1d9e75",
      emoji: "💼",
      image: ""
    },
    {
      id: "vitrine",
      title: "Showcase Websites",
      subtitle: "WordPress / HTML series",
      description: "Series of professional showcase websites for artisans and small businesses. Modern, responsive, SEO optimized.",
      category: "frontend",
      tags: ["WordPress", "HTML5", "CSS3", "JavaScript", "SEO"],
      github: "https://github.com/Prisca-SANKARA",
      demo: "",
      detail: "pages/vitrine.html",
      company: "Freelance",
      status: "Coming soon",
      statusColor: "#9aa3b8",
      emoji: "🌐",
      image: ""
    },
    {
      id: "rest-api",
      title: "REST API + JWT Auth",
      subtitle: "Secure full-stack API",
      description: "Complete REST API with JWT authentication (access + refresh token), CRUD, pagination, rate limiting and Swagger documentation.",
      category: "backend",
      tags: ["Spring Boot", "PostgreSQL", "Docker", "JWT", "Swagger"],
      github: "https://github.com/Prisca-SANKARA",
      demo: "",
      detail: "pages/rest-api.html",
      company: "Personal project",
      status: "Coming soon",
      statusColor: "#9aa3b8",
      emoji: "⚙️",
      image: ""
    },
    {
      id: "dashboard",
      title: "Security Dashboard",
      subtitle: "Real-time monitoring",
      description: "Real-time dashboard for visualizing security logs, alerts and system metrics. Integrated n8n automations.",
      category: "devsecops",
      tags: ["Angular", "n8n", "Supabase", "Chart.js", "WebSockets"],
      github: "https://github.com/Prisca-SANKARA",
      demo: "",
      detail: "pages/dashboard.html",
      company: "Personal project",
      status: "Coming soon",
      statusColor: "#9aa3b8",
      emoji: "📊",
      image: ""
    }
  ]
};

function renderProjects(lang = 'fr') {
  const grid = document.getElementById('portfolioGrid');
  if (!grid) return;
  const data = projectsData[lang];

  grid.innerHTML = data.map(p => {
    const isCompleted = p.status === 'Terminé' || p.status === 'Completed'
    const hasImage = p.image && p.image !== ''

    const imageBlock = isCompleted && hasImage
      ? `<div class="project-image-wrapper has-img">
           <img src="${p.image}" alt="${p.title}" class="project-screenshot" loading="lazy"/>
           <div class="project-img-overlay"></div>
           <span class="project-status-badge" style="color:${p.statusColor};border-color:${p.statusColor};background:${p.statusColor}22;">${p.status}</span>
         </div>`
      : `<div class="project-image-wrapper">
           <div class="project-emoji">${p.emoji}</div>
           <span class="project-status-badge" style="color:${p.statusColor};border-color:${p.statusColor};background:${p.statusColor}22;">${p.status}</span>
         </div>`

    return `
      <div class="project-card ${p.category}" data-category="${p.category}">
        ${imageBlock}
        <div class="project-content">
          <div class="project-company">${p.company}</div>
          <h3 class="project-title">${p.title}</h3>
          <p class="project-subtitle-text">${p.subtitle}</p>
          <p class="project-description">${p.description}</p>
          <div class="project-tags">
            ${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}
          </div>
          <div class="project-links">
            <a href="${p.detail}" class="btn-project btn-detail">
              <i class="fas fa-eye"></i> ${lang === 'fr' ? 'Détails' : 'Details'}
            </a>
            <a href="${p.github}" target="_blank" class="btn-project btn-github">
              <i class="fab fa-github"></i> Code
            </a>
            ${p.demo && p.demo !== '' ? `<a href="${p.demo}" target="_blank" class="btn-project btn-demo"><i class="fas fa-external-link-alt"></i> Demo</a>` : ''}
          </div>
        </div>
      </div>
    `
  }).join('')

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      const filter = btn.getAttribute('data-filter')
      document.querySelectorAll('.project-card').forEach(card => {
        card.style.display = (filter === 'all' || card.classList.contains(filter)) ? 'flex' : 'none'
      })
    })
  })
}

  // Filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      document.querySelectorAll('.project-card').forEach(card => {
        card.style.display = (filter === 'all' || card.classList.contains(filter)) ? 'flex' : 'none';
      });
    });
  });


