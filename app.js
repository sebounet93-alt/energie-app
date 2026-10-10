const CLE_STOCKAGE = "energie-appareils";

// ----- Calculs -----

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

// ----- Stockage -----

function chargerAppareils() {
  const liste = JSON.parse(localStorage.getItem(CLE_STOCKAGE) || "[]");
  // Attribue un identifiant aux anciens appareils qui n'en ont pas
  let modifie = false;
  liste.forEach((a) => {
    if (!a.id) {
      a.id = crypto.randomUUID();
      modifie = true;
    }
  });
  if (modifie) sauverAppareils(liste);
  return liste;
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

  appareils.forEach((a) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <div class="nom"></div>
        <div class="info">${a.watts} W · ${a.heures} h par jour</div>
      </div>
      <div class="cout">${euro(coutAnnuel(a))}</div>`;
    li.querySelector(".nom").textContent = a.nom;
    li.addEventListener("click", () => afficherResultat(a.id));
    liste.appendChild(li);
  });

  montrer("accueil");
}

let idCourant = null;

function afficherResultat(id) {
  const a = chargerAppareils().find((x) => x.id === id);
  if (!a) return afficherAccueil();

  idCourant = id;
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

// ----- Formulaire (ajout et modification) -----

function remplirFormulaire(a) {
  const f = document.getElementById("formulaire");
  f.reset();
  document.getElementById("titre-ajout").textContent = a ? "Modifier l'appareil" : "Nouvel appareil";

  if (a) {
    f.nom.value = a.nom;
    f.watts.value = a.watts;
    f.heures.value = a.heures;
    f.jours.value = a.jours;
    f.prix.value = a.prix;
    const hc = a.prixHc != null;
    document.getElementById("case-hc").checked = hc;
    document.getElementById("champs-hc").hidden = !hc;
    if (hc) {
      f.prixHc.value = a.prixHc;
      f.partHc.value = Math.round(a.partHc * 100);
    }
  } else {
    document.getElementById("champs-hc").hidden = true;
  }
}

// ----- Événements -----

document.getElementById("btn-ajouter").addEventListener("click", () => {
  idCourant = null;
  remplirFormulaire(null);
  montrer("ajout");
});

document.getElementById("btn-modifier").addEventListener("click", () => {
  const a = chargerAppareils().find((x) => x.id === idCourant);
  if (!a) return afficherAccueil();
  remplirFormulaire(a);
  montrer("ajout");
});

document.getElementById("case-hc").addEventListener("change", (e) => {
  document.getElementById("champs-hc").hidden = !e.target.checked;
});

document.getElementById("formulaire").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const hc = document.getElementById("case-hc").checked;

  const donnees = {
    nom: f.get("nom"),
    watts: Number(f.get("watts")),
    heures: Number(f.get("heures")),
    jours: Number(f.get("jours")),
    prix: Number(f.get("prix")),
    prixHc: hc ? Number(f.get("prixHc")) : null,
    partHc: hc ? Number(f.get("partHc")) / 100 : 0,
  };

  const liste = chargerAppareils();
  let id = idCourant;

  if (id) {
    // Modification : on remplace l'appareil ayant cet identifiant
    const i = liste.findIndex((x) => x.id === id);
    liste[i] = { id, ...donnees };
  } else {
    // Ajout : nouvel identifiant
    id = crypto.randomUUID();
    liste.push({ id, ...donnees });
  }

  sauverAppareils(liste);
  afficherResultat(id);
});

document.getElementById("btn-supprimer").addEventListener("click", () => {
  if (!confirm("Supprimer cet appareil ?")) return;
  const liste = chargerAppareils().filter((x) => x.id !== idCourant);
  sauverAppareils(liste);
  afficherAccueil();
});

document.querySelectorAll("[data-aller]").forEach((b) =>
  b.addEventListener("click", () => afficherAccueil())
);

afficherAccueil();
