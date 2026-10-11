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
        <div><span>Économie par an</span><strong id="sim-eco"></strong></div>
      </div>`;

    section.querySelector(".carte-resultat").after(bloc);

    const range = bloc.querySelector("#sim-range");
    const actuel = coutAnnuel(a);

    const mettreAJour = () => {
      const h = Number(range.value);
      const simule = coutAnnuel({ ...a, heures: h });
      const economie = actuel - simule;

      bloc.querySelector("#sim-h").textContent = h;
      bloc.querySelector("#sim-cout").textContent = euro(simule);
      bloc.querySelector("#sim-eco").textContent = economie >= 0
        ? euro(economie)
        : "surcoût de " + euro(-economie);
    };

    range.addEventListener("input", mettreAJour);
    mettreAJour();
  }

  setInterval(afficherSimulation, 300);
  afficherSimulation();
})();
