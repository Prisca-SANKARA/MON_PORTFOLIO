// Compétences / stack technique — regroupées par catégorie, affichées en
// sliders défilants (voir renderSkills). category_fr/category_en et
// info_fr/info_en sont traduits (à la main ici, ou via Firestore ensuite) ;
// "level" est une clé fixe (pas du texte), traduite via LEVEL_LABELS.
const skillsData = {
  fr: [
    { category: 'Langages', name: 'Java', icon: 'fab fa-java', info: 'Java · Orienté objet · Spring Boot', level: 'intermediate', order: 0 },
    { category: 'Langages', name: 'Python', icon: 'fab fa-python', info: 'Scripting · Automatisation · FastAPI', level: 'intermediate', order: 1 },
    { category: 'Langages', name: 'JavaScript', icon: 'fab fa-js-square', info: 'Interfaces modernes · ES6+', level: 'intermediate', order: 2 },
    { category: 'Langages', name: 'TypeScript', icon: 'fas fa-code', info: 'Typage fort · Angular · Scalabilité', level: 'intermediate', order: 3 },
    { category: 'Langages', name: 'HTML5', icon: 'fab fa-html5', info: 'Structure · Sémantique · SEO', level: 'advanced', order: 4 },
    { category: 'Langages', name: 'CSS3', icon: 'fab fa-css3-alt', info: 'Style · Animations · Responsive', level: 'advanced', order: 5 },

    { category: 'Frameworks & Outils', name: 'Spring Boot', icon: 'fas fa-leaf', info: 'REST API · Spring Security · JPA', level: 'intermediate', order: 6 },
    { category: 'Frameworks & Outils', name: 'Angular', icon: 'fab fa-angular', info: 'SPA · Components · RxJS', level: 'intermediate', order: 7 },
    { category: 'Frameworks & Outils', name: 'FastAPI', icon: 'fas fa-bolt', info: 'API Python · Async · Swagger auto', level: 'notions', order: 8 },
    { category: 'Frameworks & Outils', name: 'Next.js', icon: 'fab fa-react', info: 'SSR · Full-stack React · Vercel', level: 'notions', order: 9 },
    { category: 'Frameworks & Outils', name: 'WordPress', icon: 'fab fa-wordpress', info: 'CMS · Sites vitrines · e-commerce', level: 'advanced', order: 10 },
    { category: 'Frameworks & Outils', name: 'n8n', icon: 'fas fa-project-diagram', info: 'Automatisation · Workflows · No-code', level: 'notions', order: 11 },

    { category: 'DevSecOps & Outils', name: 'Docker', icon: 'fab fa-docker', info: 'Conteneurs · Docker Compose · CI/CD', level: 'notions', order: 12 },
    { category: 'DevSecOps & Outils', name: 'Keycloak', icon: 'fas fa-key', info: 'IAM · SSO · Multi-tenant · Realms', level: 'notions', order: 13 },
    { category: 'DevSecOps & Outils', name: 'Supabase', icon: 'fas fa-database', info: 'BaaS · PostgreSQL · Auth · Storage', level: 'notions', order: 14 },
    { category: 'DevSecOps & Outils', name: 'AWS', icon: 'fab fa-aws', info: 'Cloud · EC2 · S3 · Certification en cours', level: 'beginner', order: 15 },
    { category: 'DevSecOps & Outils', name: 'GitHub', icon: 'fab fa-github', info: 'Version control · Branches · Pull requests', level: 'intermediate', order: 16 },
    { category: 'DevSecOps & Outils', name: 'UML', icon: 'fas fa-sitemap', info: 'Modélisation · Séquence · Use Case', level: 'advanced', order: 17 },
    { category: 'DevSecOps & Outils', name: 'MySQL', icon: 'fas fa-table', info: 'SQL · Conception · Requêtes', level: 'intermediate', order: 18 }
  ],
  en: [
    { category: 'Languages', name: 'Java', icon: 'fab fa-java', info: 'Java · Object-oriented · Spring Boot', level: 'intermediate', order: 0 },
    { category: 'Languages', name: 'Python', icon: 'fab fa-python', info: 'Scripting · Automation · FastAPI', level: 'intermediate', order: 1 },
    { category: 'Languages', name: 'JavaScript', icon: 'fab fa-js-square', info: 'Modern interfaces · ES6+', level: 'intermediate', order: 2 },
    { category: 'Languages', name: 'TypeScript', icon: 'fas fa-code', info: 'Strong typing · Angular · Scalability', level: 'intermediate', order: 3 },
    { category: 'Languages', name: 'HTML5', icon: 'fab fa-html5', info: 'Structure · Semantics · SEO', level: 'advanced', order: 4 },
    { category: 'Languages', name: 'CSS3', icon: 'fab fa-css3-alt', info: 'Styling · Animations · Responsive', level: 'advanced', order: 5 },

    { category: 'Frameworks & Tools', name: 'Spring Boot', icon: 'fas fa-leaf', info: 'REST API · Spring Security · JPA', level: 'intermediate', order: 6 },
    { category: 'Frameworks & Tools', name: 'Angular', icon: 'fab fa-angular', info: 'SPA · Components · RxJS', level: 'intermediate', order: 7 },
    { category: 'Frameworks & Tools', name: 'FastAPI', icon: 'fas fa-bolt', info: 'Python API · Async · Auto Swagger', level: 'notions', order: 8 },
    { category: 'Frameworks & Tools', name: 'Next.js', icon: 'fab fa-react', info: 'SSR · Full-stack React · Vercel', level: 'notions', order: 9 },
    { category: 'Frameworks & Tools', name: 'WordPress', icon: 'fab fa-wordpress', info: 'CMS · Showcase sites · e-commerce', level: 'advanced', order: 10 },
    { category: 'Frameworks & Tools', name: 'n8n', icon: 'fas fa-project-diagram', info: 'Automation · Workflows · No-code', level: 'notions', order: 11 },

    { category: 'DevSecOps & Tools', name: 'Docker', icon: 'fab fa-docker', info: 'Containers · Docker Compose · CI/CD', level: 'notions', order: 12 },
    { category: 'DevSecOps & Tools', name: 'Keycloak', icon: 'fas fa-key', info: 'IAM · SSO · Multi-tenant · Realms', level: 'notions', order: 13 },
    { category: 'DevSecOps & Tools', name: 'Supabase', icon: 'fas fa-database', info: 'BaaS · PostgreSQL · Auth · Storage', level: 'notions', order: 14 },
    { category: 'DevSecOps & Tools', name: 'AWS', icon: 'fab fa-aws', info: 'Cloud · EC2 · S3 · Certification in progress', level: 'beginner', order: 15 },
    { category: 'DevSecOps & Tools', name: 'GitHub', icon: 'fab fa-github', info: 'Version control · Branches · Pull requests', level: 'intermediate', order: 16 },
    { category: 'DevSecOps & Tools', name: 'UML', icon: 'fas fa-sitemap', info: 'Modeling · Sequence · Use Case', level: 'advanced', order: 17 },
    { category: 'DevSecOps & Tools', name: 'MySQL', icon: 'fas fa-table', info: 'SQL · Design · Queries', level: 'intermediate', order: 18 }
  ]
};

const LEVEL_LABELS = {
  fr: { beginner: 'Débutant', notions: 'Notions', intermediate: 'Intermédiaire', advanced: 'Avancé' },
  en: { beginner: 'Beginner', notions: 'Basics', intermediate: 'Intermediate', advanced: 'Advanced' }
};
const LEVEL_COLORS = { beginner: '#9aa3b8', notions: '#f5c842', intermediate: '#378add', advanced: '#1d9e75' };
const CATEGORY_ICONS = { 'Langages': 'fas fa-code', 'Languages': 'fas fa-code' }; // fallback si catégorie inconnue plus bas

function renderSkills(lang = 'fr') {
  const container = document.getElementById('skillsContainer');
  if (!container) return;
  const items = [...(skillsData[lang] || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const categories = [];
  items.forEach(item => {
    let cat = categories.find(c => c.name === item.category);
    if (!cat) { cat = { name: item.category, items: [] }; categories.push(cat); }
    cat.items.push(item);
  });

  container.innerHTML = categories.map((cat, ci) => {
    const trackClass = ci % 2 === 1 ? 'tech-track tech-track-reverse' : 'tech-track';
    const cardsHtml = cat.items.map(item => `
      <div class="tech-item" data-info="${(item.info || '').replace(/"/g, '&quot;')}" data-level-label="${LEVEL_LABELS[lang]?.[item.level] || item.level}" data-level-key="${item.level}" data-icon="${item.icon}">
        <i class="${item.icon}"></i><span>${item.name}</span>
      </div>`).join('');
    return `
      <div class="tech-category reveal">
        <h3 class="tech-category-title"><i class="${CATEGORY_ICONS[cat.name] || 'fas fa-layer-group'}"></i> ${cat.name}</h3>
        <div class="tech-slider">
          <div class="${trackClass}">${cardsHtml}${cardsHtml}</div>
        </div>
      </div>`;
  }).join('');
}
