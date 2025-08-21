fetch("/api/threats")
    .then(response => response.json())
    .then(data => {
       const threatTable = document.getElementById('threat-feed');
        threatTable.innerHTML = `
            <tr>
                <th>CVE ID</th>
                <th>Description</th>
                <th>Source</th>
                <th>Date Published</th>
            </tr>
        `;
        threatTable.innerHTML = `
            <thead>
                <tr>
                    <th>CVE ID</th>
                    <th>Description</th>
                    <th>Source</th>
                    <th>Date Published</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = threatTable.querySelector("tbody");

        data.forEach(threat => {
            const date = new Date(threat.time);
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${threat.id}</td>
                <td>${threat.title}</td>
                <td>${threat.severity}</td>
                <td>${date.toLocaleString("en-GB", {
                    day: "2-digit", month: "short", year: "numeric",
                    hour: "2-digit", minute: "2-digit", hour12: false,
                    timeZone: "Africa/Johannesburg"
                })}</td>
            `;
            threatTable.appendChild(row);
        });
    });

fetch("/api/bulletins")
        .then(response => response.json())
        .then(data => {
            const bulletinList = document.getElementById('bulletins');
            bulletinList.innerHTML = '<h3>Week of: ' + data.weekOf + '</h3><ul>' +
                data.headlines.map(article => 
                    `<li><a href="${article.url}" target="_blank">${article.title}</a> - <em> ${article.source}<em> (Published: ${new Date(article.publishedAt).toLocaleDateString()})</li>.`).join('') + '</ul>';
        })
        .catch(error => {
            console.error('Error fetching bulletins:', error);
        });