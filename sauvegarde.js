(() => {
  const btnExporter = document.getElementById("btn-exporter");
  const inputImport = document.getElementById("fichier-import");

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

    // On ne garde que les appareils qui ont les champs nécessaires
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
  });
})();
