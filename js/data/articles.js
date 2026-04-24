const articlesData = {
  fr: [
    { id:1, title:"Ce que mon stage au Burkina Faso m'a appris sur la tech en Afrique", excerpt:"Box Africa m'a accueillie comme une famille. Ce que j'y ai appris a changé ma vision du monde et de l'informatique pour toujours.", date:"Avril 2026", readTime:"4 min", category:"Expérience", tag:"🇧🇫 Africa Tech", link:"https://linkedin.com/in/sankara-djamilatou-prisca", emoji:"🌍" },
    { id:2, title:"Pourquoi le DevSecOps est l'avenir de la tech en Afrique", excerpt:"La digitalisation sans sécurité, c'est construire une maison sans serrures. Voici pourquoi le DevSecOps est urgent pour le continent africain.", date:"Avril 2026", readTime:"5 min", category:"Tech", tag:"🔐 DevSecOps", link:"https://linkedin.com/in/sankara-djamilatou-prisca", emoji:"🔐" },
    { id:3, title:"Docker pour les débutants — ce que j'ai compris en stage", excerpt:"Comment j'ai appris à containeriser une application SaaS multi-tenant en contexte professionnel réel, et ce que ça m'a appris sur le DevOps.", date:"Bientôt", readTime:"6 min", category:"Tutoriel", tag:"🐳 Docker", link:"#", emoji:"🐳" }
  ],
  en: [
    { id:1, title:"What my internship in Burkina Faso taught me about African tech", excerpt:"Box Africa welcomed me like a family. What I learned there changed my vision of the world and technology forever.", date:"April 2026", readTime:"4 min", category:"Experience", tag:"🇧🇫 Africa Tech", link:"https://linkedin.com/in/sankara-djamilatou-prisca", emoji:"🌍" },
    { id:2, title:"Why DevSecOps is the future of tech in Africa", excerpt:"Digitalization without security is building a house without locks. Here's why DevSecOps is urgent for the African continent.", date:"April 2026", readTime:"5 min", category:"Tech", tag:"🔐 DevSecOps", link:"https://linkedin.com/in/sankara-djamilatou-prisca", emoji:"🔐" },
    { id:3, title:"Docker for beginners — what I learned during my internship", excerpt:"How I learned to containerize a multi-tenant SaaS application in a real professional context, and what it taught me about DevOps.", date:"Coming soon", readTime:"6 min", category:"Tutorial", tag:"🐳 Docker", link:"#", emoji:"🐳" }
  ]
};

function renderArticles(lang = 'fr') {
  const grid = document.getElementById('articlesGrid');
  if (!grid) return;
  grid.innerHTML = articlesData[lang].map(a => `
    <a href="${a.link}" target="_blank" class="article-card" data-aos="fade-up">
      <div class="article-emoji">${a.emoji}</div>
      <div class="article-content">
        <div class="article-meta">
          <span class="article-tag">${a.tag}</span>
          <span class="article-read">${a.readTime} ${lang==='fr'?'de lecture':'read'}</span>
        </div>
        <h3 class="article-title">${a.title}</h3>
        <p class="article-excerpt">${a.excerpt}</p>
        <div class="article-footer">
          <span class="article-date">${a.date}</span>
          <span class="article-cta">${lang==='fr'?'Lire l\'article':'Read article'} →</span>
        </div>
      </div>
    </a>
  `).join('');
}
