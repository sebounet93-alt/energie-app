(() => {
  const section = document.getElementById("resultat");
  const zoneCout = document.getElementById("res-annuel");

  function afficherSimulation() {
    const a = chargerAppareils().find((x) => x.id === idCourant);
    let bloc = document.getElementById("simulation");

    if (!a) {
      if (bloc) bloc.remove();
      return;
    }

    if (!bloc) {
      bloc = document.createElement("div");
      bloc.id = "simulation";
      bloc.className = "simulation";
      section.querySelector(".carte-resultat").after(bloc);
    }

    const actuel = coutAnnuel(a);

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

    const range = bloc.querySelector("#sim-range");

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

  // Se déclenche à chaque affichage d'un appareil
  new MutationObserver(() => {
    if (!section.hidden) afficherSimulation();
  }).observe(zoneCout, { childList: true });
})();
