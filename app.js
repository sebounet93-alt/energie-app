const CLE_STOCKAGE = "energie-appareils";

// ----- Calculs (même logique que la version PowerShell) -----

function energieAnnuelleKwh(a) {
  return a.watts * a.heures * a.jours / 1000;
}

function coutAnnuel(a) {
  const kwh = energieAnnuelleKwh(a);
  const prix = a.prixHc != null
    ? a.partHc * a.prixHc + (1 - a.partHc) * a.prix
    : a.prix;
  return kwh * prix;
}

// ----- Stockage sur le téléphone -----

function chargerAppareils() {
  return JSON.parse(localStorage.getItem(CLE_STOCKAGE) || "[]");
}

function sauverAppareils(liste) {
  localStorage.setItem(CLE_STOCKAGE, JSON.stringify(liste));
}

// ----- Affichage -----

const euro = (n) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

function montrer(id) {
  document.querySelectorAll(".vue").forEach((v) => (v.hidden = v.id !== id));
  window.scrollTo(0, 0);
}

function afficherAccueil() {
  const appareils = chargerAppareils();
  const total = appareils.reduce((s, a) => s + coutAnnuel(a), 0);

  document.getElementById("total").textContent = euro(total);
  document.getElementById("mensuel").textContent = `soit ${euro(total / 12)} par mois`;

  const liste = document.getElementById("liste");
  liste.innerHTML = "";

  if (appareils.length === 0) {
    liste.innerHTML = `<p class="vide">Aucun appareil. Appuie sur + pour commencer.</p>`;
  }

  appareils.forEach((a, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <div class="nom"></div>
        <div class="info">${a.watts} W · ${a.heures} h par jour</div>
      </div>
      <div class="cout">${euro(coutAnnuel(a))}</div>`;
    li.querySelector(".nom").textContent = a.nom;
    li.addEventListener("click", () => afficherResultat(i));
    liste.appendChild(li);
  });

  montrer("accueil");
}

let indexCourant = null;

function afficherResultat(index) {
  const a = chargerAppareils()[index];
  if (!a) return afficherAccueil();

  indexCourant = index;
  const annuel = coutAnnuel(a);
  const kwh = energieAnnuelleKwh(a);

  document.getElementById("res-nom").textContent = a.nom;
  document.getElementById("res-annuel").textContent = euro(annuel);
  document.getElementById("res-mensuel").textContent = `soit ${euro(annuel / 12)} par mois`;

  const details = document.getElementById("res-details");
  details.innerHTML = `
    <div><span>Consommation</span><span>${kwh.toFixed(1)} kWh/an</span></div>
    <div><span>Puissance</span><span>${a.watts} W</span></div>
    <div><span>Utilisation</span><span>${a.heures} h/jour, ${a.jours} j/an</span></div>
    <div><span>Prix du kWh</span><span>${a.prixHc != null ? "Heures pleines / creuses" : a.prix.toFixed(4) + " €"}</span></div>`;

  montrer("resultat");
}

// ----- Événements -----

document.getElementById("btn-ajouter").addEventListener("click", () => {
  document.getElementById("formulaire").reset();
  document.getElementById("champs-hc").hidden = true;
  montrer("ajout");
});

document.getElementById("case-hc").addEventListener("change", (e) => {
  document.getElementById("champs-hc").hidden = !e.target.checked;
});

document.getElementById("formulaire").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const hc = document.getElementById("case-hc").checked;

  const appareil = {
    nom: f.get("nom"),
    watts: Number(f.get("watts")),
    heures: Number(f.get("heures")),
    jours: Number(f.get("jours")),
    prix: Number(f.get("prix")),
    prixHc: hc ? Number(f.get("prixHc")) : null,
    partHc: hc ? Number(f.get("partHc")) / 100 : 0,
  };

  const liste = chargerAppareils();
  liste.push(appareil);
  sauverAppareils(liste);
  afficherResultat(liste.length - 1);
});

document.getElementById("btn-supprimer").addEventListener("click", () => {
  if (!confirm("Supprimer cet appareil ?")) return;
  const liste = chargerAppareils();
  liste.splice(indexCourant, 1);
  sauverAppareils(liste);
  afficherAccueil();
});

document.querySelectorAll("[data-aller]").forEach((b) =>
  b.addEventListener("click", () => afficherAccueil())
);

afficherAccueil();
