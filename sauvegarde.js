(() => {
  const CLE_SAUVEGARDE = "energie-derniere-sauvegarde";
  const JOURS_RAPPEL = 30;

  const btnExporter = document.getElementById("btn-exporter");
  const inputImport = document.getElementById("fichier-import");

  // ----- Rappel de sauvegarde -----

  function afficherRappel() {
    document.getElementById("rappel-sauvegarde")?.remove();

    if (document.getElementById("accueil").hidden) return;
    if (chargerAppareils().length === 0) return;

    const derniere = localStorage.getItem(CLE_SAUVEGARDE);
    let message = null;

    if (!derniere) {
      message = "Tu n'as encore jamais exporté tes données.";
    } else {
      const jours = (Date.now() - new Date(derniere).getTime()) / 86400000;
      if (jours > JOURS_RAPPEL) {
        message = `Ta dernière sauvegarde date du ${new Date(derniere).toLocaleDateString("fr-FR")}.`;
      }
    }

    if (!message) return;

    const bloc = document.createElement("div");
    bloc.id = "rappel-sauvegarde";
    bloc.className = "rappel";
    bloc.innerHTML = `<p></p><button type="button">Exporter maintenant</button>`;
    bloc.querySelector("p").textContent = message + " Garde une copie de tes appareils.";
    bloc.querySelector("button").addEventListener("click", () => btnExporter.click());

    document.querySelector(".titre-liste").before(bloc);
  }

  // ----- Export -----

  btnExporter.addEventListener("click", () => {
    const donnees = {
      version: 1,
      date: new Date().toISOString(),
      appareils: chargerAppareils(),
      prixKwh: localStorage.getItem(CLE_PRIX),
    };

    const blob = new Blob([JSON.stringify(donnees, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const lien = document.createElement("a");
    lien.href = url;
    lien.download = `energie-calc-${new Date().toISOString().slice(0, 10)}.json`;
@'
(() => {
  const CLE_SAUVEGARDE = "energie-derniere-sauvegarde";
  const JOURS_RAPPEL = 30;

  const btnExporter = document.getElementById("btn-exporter");
  const inputImport = document.getElementById("fichier-import");

  // ----- Rappel de sauvegarde -----

  function afficherRappel() {
    document.getElementById("rappel-sauvegarde")?.remove();

    if (document.getElementById("accueil").hidden) return;
    if (chargerAppareils().length === 0) return;

    const derniere = localStorage.getItem(CLE_SAUVEGARDE);
    let message = null;

    if (!derniere) {
      message = "Tu n'as encore jamais exporté tes données.";
    } else {
      const jours = (Date.now() - new Date(derniere).getTime()) / 86400000;
      if (jours > JOURS_RAPPEL) {
        message = `Ta dernière sauvegarde date du ${new Date(derniere).toLocaleDateString("fr-FR")}.`;
      }
    }

    if (!message) return;

    const bloc = document.createElement("div");
    bloc.id = "rappel-sauvegarde";
    bloc.className = "rappel";
    bloc.innerHTML = `<p></p><button type="button">Exporter maintenant</button>`;
    bloc.querySelector("p").textContent = message + " Garde une copie de tes appareils.";
    bloc.querySelector("button").addEventListener("click", () => btnExporter.click());

    document.querySelector(".titre-liste").before(bloc);
  }

  // ----- Export -----

  btnExporter.addEventListener("click", () => {
    const donnees = {
      version: 1,
      date: new Date().toISOString(),
      appareils: chargerAppareils(),
      prixKwh: localStorage.getItem(CLE_PRIX),
    };

    const blob = new Blob([JSON.stringify(donnees, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const lien = document.createElement("a");
    lien.href = url;
    lien.download = `energie-calc-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(lien);
    lien.click();
    lien.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    localStorage.setItem(CLE_SAUVEGARDE, new Date().toISOString());
    afficherRappel();
  });

  // ----- Import -----

  inputImport.addEventListener("change", async (e) => {
    const fichier = e.target.files[0];
    e.target.value = "";
    if (!fichier) return;

    let donnees;
    try {
      donnees = JSON.parse(await fichier.text());
    } catch {
      alert("Ce fichier est illisible.");
      return;
    }

    if (!donnees || !Array.isArray(donnees.appareils)) {
      alert("Ce fichier n'est pas une sauvegarde Energie Calc.");
      return;
    }

    const valides = donnees.appareils.filter((a) =>
      a && typeof a.nom === "string" &&
      Number.isFinite(a.watts) && Number.isFinite(a.heures) &&
      Number.isFinite(a.jours) && Number.isFinite(a.prix)
    );

    const actuels = chargerAppareils().length;
    const message = `Remplacer les ${actuels} appareil(s) actuels par les ${valides.length} appareil(s) du fichier ?`;
    if (!confirm(message)) return;

    sauverAppareils(valides.map((a) => ({ ...a, id: a.id || crypto.randomUUID() })));
    if (donnees.prixKwh) localStorage.setItem(CLE_PRIX, donnees.prixKwh);

    alert(`${valides.length} appareil(s) importé(s).`);
    route();
    afficherRappel();
  });

  // Vérifie le rappel à l'ouverture et à chaque changement d'écran
  window.addEventListener("hashchange", afficherRappel);
  afficherRappel();
})();
