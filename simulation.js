(() => {
  const section = document.getElementById("resultat");
  let cleAffichee = null;

  function afficherSimulation() {
    const ancien = document.getElementById("simulation");
    const a = section.hidden ? null : chargerAppareils().find((x) => x.id === idCourant);

    if (!a) {
      if (ancien) ancien.remove();
      cleAffichee = null;
      return;
    }

    // Ne reconstruit le bloc que si l'appareil ou ses valeurs ont changé
    const cle = a.id + JSON.stringify(a);
    if (cle === cleAffichee && ancien) return;
    cleAffichee = cle;

    if (ancien) ancien.remove();

    const bloc = document.createElement("div");
    bloc.id = "simulation";
    bloc.className = "simulation";
    bloc.innerHTML = `
      <h2>Simulation</h2>
      <p class="petit">Modifie la durée d'utilisation pour voir l'effet. Rien n'est enregistré.</p>
      <label class="sim-label">Heures par jour : <strong id="sim-h"></strong> h
        <input type="range" id="sim-range" min="0" max="24" step="0.5" value="${a.heures}">
      </label>
      <div class="sim-resultat">
        <div><span>Coût annuel simulé</span><strong id="sim-cout"></strong></div>
        <div><span>Variation par an</span><strong id="sim-variation"></strong></div>
      </div>`;

    section.querySelector(".carte-resultat").after(bloc);

    const range = bloc.querySelector("#sim-range");
    const actuel = coutAnnuel(a);

    const mettreAJour = () => {
      const h = Number(range.value);
      const simule = coutAnnuel({ ...a, heures: h });
      // Positif = hausse de la facture, négatif = baisse
      const variation = simule - actuel;
      const elVariation = bloc.querySelector("#sim-variation");

      bloc.querySelector("#sim-h").textContent = h;
      bloc.querySelector("#sim-cout").textContent = euro(simule);

      if (Math.abs(variation) < 0.005) {
        elVariation.textContent = euro(0);
        elVariation.className = "";
      } else if (variation < 0) {
        // Baisse de la facture : signe moins, en vert
        elVariation.textContent = "−" + euro(-variation);
        elVariation.className = "";
      } else {
        // Hausse de la facture : signe plus, en rouge
        elVariation.textContent = "+" + euro(variation);
        elVariation.className = "surcout";
      }
    };

    range.addEventListener("input", mettreAJour);
    mettreAJour();
  }

  setInterval(afficherSimulation, 300);
  afficherSimulation();
})();
