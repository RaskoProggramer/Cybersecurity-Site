fetch("/api/threats")
    .then(response => response.json())
    .then(data => {
       const tbody = document.querySelector("#threat-feed tbody");
    tbody.innerHTML = "";
    data.forEach(t => {
      tbody.innerHTML += `
        <tr>
          <td>${t.id}</td>
          <td>${t.title}</td>
          <td>${t.severity}</td>
          <td>${t.time}</td>
        </tr>
      `;
    });
  });

fetch("/api/bulletins")
    .then(response => response.json())
    .then(data => {
        const bulletinList = document.getElementById('bulletins');
        bulletinList.innerHTML = `
            <h3>Week of: ${data.weekOf}</h3>
            <ul>
                ${data.headlines.map(article => `
                    <li>
                        <a href="${article.url}" target="_blank" class="bulletin-link">
                            ${article.title}
                        </a> 
                        <span class="bulletin-meta">
                            - ${article.source} (Published: ${new Date(article.publishedAt).toLocaleDateString()})
                        </span>
                    </li>
                `).join('')}
            </ul>
        `;
    })
    .catch(error => {
        console.error('Error fetching bulletins:', error);
    });
