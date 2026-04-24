const experiencesData = {
  fr: [
    { type:"work", title:"Stagiaire PFE — Cybersécurité", company:"Arcashield Cybersecurity", location:"Casablanca, Maroc", period:"Mars 2026 — Août 2026", duration:"6 mois", current:true, description:"Mise en place d'une cellule de veille et détection des menaces émergentes ciblant l'entreprise.", highlights:["Conception d'une plateforme SaaS multi-tenant","Intégration Docker · Keycloak · Supabase · n8n","Veille active sur les menaces émergentes","Documentation technique complète"] },
    { type:"work", title:"Stagiaire — Développement Web", company:"Switch Maker", location:"Ouagadougou, Burkina Faso 🇧🇫", period:"2025", duration:"2 mois", current:false, description:"Développement d'une application web collaborative et modélisation UML.", highlights:["Création d'un agenda collaboratif (Angular + Spring Boot)","Modélisation UML complète","Documentation technique"] },
    { type:"work", title:"Stagiaire — Transformation Digitale", company:"Box Africa", location:"Ouagadougou, Burkina Faso 🇧🇫", period:"Juillet — Octobre 2024", duration:"3 mois", current:false, description:"Contribution à des projets de digitalisation dans une entreprise IT africaine de référence.", highlights:["Développement web sous WordPress","Mise en place Windows Server","Présentations devant la Direction Générale","Production de contenus audiovisuels"] },
    { type:"education", title:"Cycle Ingénieur Informatique — 5ème année", company:"Institut Polytechnique Privé de Casablanca", location:"Casablanca, Maroc", period:"2021 — 2025", duration:"Bac+5", current:false, description:"Cursus d'ingénierie informatique — génie logiciel, cloud et cybersécurité.", highlights:["Génie logiciel & architecture","Cloud computing & DevOps","Cybersécurité & réseaux","Projet de fin d'études (PFE)"] },
    { type:"education", title:"Baccalauréat Scientifique — Mention", company:"Collège Saint Jean Baptiste de la Salle", location:"Burkina Faso 🇧🇫", period:"2021", duration:"", current:false, description:"Baccalauréat scientifique obtenu avec mention.", highlights:["Club d'arts oratoires","Chorale"] }
  ],
  en: [
    { type:"work", title:"PFE Intern — Cybersecurity", company:"Arcashield Cybersecurity", location:"Casablanca, Morocco", period:"March 2026 — August 2026", duration:"6 months", current:true, description:"Building a threat intelligence and emerging threat detection unit targeting the company.", highlights:["Multi-tenant SaaS platform design","Docker · Keycloak · Supabase · n8n integration","Active threat intelligence monitoring","Full technical documentation"] },
    { type:"work", title:"Web Development Intern", company:"Switch Maker", location:"Ouagadougou, Burkina Faso 🇧🇫", period:"2025", duration:"2 months", current:false, description:"Development of a collaborative web application and UML modeling.", highlights:["Built collaborative agenda (Angular + Spring Boot)","Full UML modeling","Technical documentation"] },
    { type:"work", title:"Digital Transformation Intern", company:"Box Africa", location:"Ouagadougou, Burkina Faso 🇧🇫", period:"July — October 2024", duration:"3 months", current:false, description:"Contributed to digitalization projects at a leading African IT company.", highlights:["WordPress web development","Windows Server setup","Technical presentations to C-level executives","Digital content production"] },
    { type:"education", title:"Computer Engineering — 5th year", company:"Institut Polytechnique Privé de Casablanca", location:"Casablanca, Morocco", period:"2021 — 2025", duration:"Master's level", current:false, description:"Computer engineering with focus on software engineering, cloud and cybersecurity.", highlights:["Software engineering & architecture","Cloud computing & DevOps","Cybersecurity & networks","Final year project (PFE)"] },
    { type:"education", title:"Scientific Baccalaureate — With Honors", company:"Collège Saint Jean Baptiste de la Salle", location:"Burkina Faso 🇧🇫", period:"2021", duration:"", current:false, description:"Scientific baccalaureate with honors.", highlights:["Oratory arts club","Choir"] }
  ]
};

function renderExperiences(lang = 'fr') {
  const timeline = document.getElementById('timeline');
  if (!timeline) return;
  timeline.innerHTML = experiencesData[lang].map((exp, i) => `
    <div class="timeline-item ${i % 2 === 0 ? 'left' : 'right'}" data-aos="fade-up">
      <div class="timeline-content">
        <div class="timeline-badges">
          <span class="tl-badge ${exp.type === 'work' ? 'badge-work' : 'badge-edu'}">
            ${exp.type === 'work' ? (lang==='fr'?'💼 Expérience':'💼 Experience') : (lang==='fr'?'🎓 Formation':'🎓 Education')}
          </span>
          ${exp.current ? `<span class="tl-badge badge-current">${lang==='fr'?'● En cours':'● Current'}</span>` : ''}
        </div>
        <h3 class="tl-title">${exp.title}</h3>
        <div class="tl-company">${exp.company}</div>
        <div class="tl-meta">
          <span><i class="fas fa-map-marker-alt"></i> ${exp.location}</span>
          <span><i class="fas fa-calendar-alt"></i> ${exp.period}${exp.duration ? ' · '+exp.duration : ''}</span>
        </div>
        <p class="tl-desc">${exp.description}</p>
        <ul class="tl-highlights">
          ${exp.highlights.map(h => `<li><span class="tl-arrow">▸</span>${h}</li>`).join('')}
        </ul>
      </div>
    </div>
  `).join('');
}
