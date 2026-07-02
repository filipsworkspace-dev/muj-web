fetch("data.json")
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById("items");

    data.forEach(item => {
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <h2>${item.nazev}</h2>
        <p>${item.popis}</p>
        <strong>${item.status}</strong>
      `;

      container.appendChild(card);
    });
  });
