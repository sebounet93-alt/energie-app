const CLE_STOCKAGE = "energie-appareils";
const CLE_PRIX = "energie-prix-kwh";

// Valeurs indicatives : l'utilisateur doit vérifier sur la plaque signalétique
const MODELES = [
  { nom: "Réfrigérateur", watts: 30, heures: 24, jours: 365 },
  { nom: "Congélateur", watts: 40, heures: 24, jours: 365 },
  { nom: "Box internet", watts: 10, heures: 24, jours: 365 },
  { nom: "Télévision", watts: 100, heures: 3, jours: 365 },
  { nom: "Ordinateur portable", watts: 50, heures: 4, jours: 250 },
  { nom: "Ampoule LED", watts: 10, heures: 5, jours: 365 },
  { nom: "Lave-linge", watts: 2000, heures: 1, jours: 250 },
  { nom: "Sèche-linge", watts: 2500, heures: 1, jours: 100 },
  { nom: "Lave-vaisselle", watts: 1800, heures: 1, jours: 200 },
  { nom: "Four", watts: 2200, heures: 0.5, jours: 100 },
  { nom: "Plaques de cuisson", watts: 2000, heures: 0.5, jours: 300 },
  { nom: "Ballon d'eau chaude", watts: 2000, heures: 3, jours: 365 },
  { nom: "Chauffage électrique", watts: 1500, heures: 8, jours: 180 },
];

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

function chargerPrixKwh() {
  const memorise = localStorage.getItem(CLE_PRIX);
  if (memorise !== null) return Number(memorise);

  const liste = chargerAppareils();
  if (liste.length > 0) return liste[liste.length - 1].prix;

  return 0.2516;
}

function sauverPrixKwh(prix) {
  localStorage.setItem(CLE_PRIX, String(prix));
}

// ----- Affichage -----

const euro = (n) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

function montrer(id) {
  document.querySelectorAll(".vue").forEach((v) => (v.hidden = v.id !== id));
  window.scrollTo(0, 0);
}

function afficherAccueil() {
  const appareils = chargerAppareils().sort((a, b) => coutAnnuel(b) - coutAnnuel(a));
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
    li.addEventListener("click", () => aller(`#/appareil/${a.id}`));
    liste.appendChild(li);
  });

  montrer("accueil");
}

let idCourant = null;

function afficherResultat(a) {
  idCourant = a.id;
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

// ----- Validation -----

const REGLES = {
  nom:     { verifier: (v) => v.trim().length > 0, message: "Donne un nom à l'appareil." },
  watts:   { verifier: (v) => v > 0 && v <= 20000, message: "Entre une puissance entre 1 et 20 000 W." },
  heures:  { verifier: (v) => v >= 0 && v <= 24, message: "Entre un nombre d'heures entre 0 et 24." },
  jours:   { verifier: (v) => v >= 0 && v <= 365, message: "Entre un nombre de jours entre 0 et 365." },
  prix:    { verifier: (v) => v > 0 && v <= 2, message: "Entre un prix du kWh entre 0 et 2 €." },
  prixHc:  { verifier: (v) => v > 0 && v <= 2, message: "Entre un prix HC entre 0 et 2 €." },
  partHc:  { verifier: (v) => v >= 0 && v <= 100, message: "La part en heures creuses doit être entre 0 et 100 %." },
};

function effacerErreurs() {
  document.querySelectorAll(".erreur").forEach((e) => e.remove());
  document.querySelectorAll(".champ-invalide").forEach((c) => c.classList.remove("champ-invalide"));
}

function afficherErreur(champ, message) {
  champ.classList.add("champ-invalide");
  const p = document.createElement("p");
  p.className = "erreur";
  p.textContent = message;
  champ.closest("label").appendChild(p);
}

function valider(f, hc) {
  effacerErreurs();
  let valide = true;

  const champsAVerifier = ["nom", "watts", "heures", "jours", "prix"];
  if (hc) champsAVerifier.push("prixHc", "partHc");

  champsAVerifier.forEach((nom) => {
    const champ = f.elements[nom];
    const brut = champ.value;
    const valeur = nom === "nom" ? brut : Number(brut);
    const ok = brut !== "" && REGLES[nom].verifier(valeur);
    if (!ok) {
      afficherErreur(champ, REGLES[nom].message);
      valide = false;
    }
  });

  return valide;
}

// ----- Liste des modèles (ajout uniquement) -----

const modeleWrap = document.createElement("label");
modeleWrap.textContent = "Modèle type (valeurs indicatives)";

const selectModele = document.createElement("select");
selectModele.name = "modele";
selectModele.className = "modele";
selectModele.innerHTML =
  `<option value="">Choisir un modèle…</option>` +
  MODELES.map((m, i) => `<option value="${i}">${m.nom}</option>`).join("");
modeleWrap.appendChild(selectModele);

document.getElementById("formulaire").prepend(modeleWrap);

selectModele.addEventListener("change", () => {
  const m = MODELES[selectModele.value];
  if (!m) return;
  const f = document.getElementById("formulaire");
  f.nom.value = m.nom;
  f.watts.value = m.watts;
  f.heures.value = m.heures;
  f.jours.value = m.jours;
  effacerErreurs();
});

// ----- Formulaire (ajout et modification) -----

function remplirFormulaire(a) {
  const f = document.getElementById("formulaire");
  f.reset();
  selectModele.value = "";
  effacerErreurs();
  document.getElementById("titre-ajout").textContent = a ? "Modifier l'appareil" : "Nouvel appareil";

  // La liste des modèles ne sert qu'à l'ajout
  modeleWrap.hidden = !!a;

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
    f.prix.value = chargerPrixKwh();
    document.getElementById("champs-hc").hidden = true;
  }
}

// ----- Navigation -----

function aller(hash, remplacer = false) {
  if (remplacer) {
    history.replaceState(null, "", hash);
    route();
  } else if (location.hash === hash) {
    route();
  } else {
    location.hash = hash;
  }
}

function retour() {
  if (location.hash && location.hash !== "#/accueil") {
    history.back();
  } else {
    aller("#/accueil", true);
  }
}

function route() {
  const [page, id] = location.hash.replace(/^#\/?/, "").split("/");
  const liste = chargerAppareils();

  if (page === "appareil" && id) {
    const a = liste.find((x) => x.id === id);
    if (!a) return aller("#/accueil", true);
    return afficherResultat(a);
  }

  if (page === "ajout") {
    idCourant = null;
    remplirFormulaire(null);
    return montrer("ajout");
  }

  if (page === "modifier" && id) {
    const a = liste.find((x) => x.id === id);
    if (!a) return aller("#/accueil", true);
    idCourant = id;
    remplirFormulaire(a);
    return montrer("ajout");
  }

  afficherAccueil();
}

// ----- Événements -----

document.getElementById("btn-ajouter").addEventListener("click", () => aller("#/ajout"));

document.getElementById("btn-modifier").addEventListener("click", () => {
  aller(`#/modifier/${idCourant}`);
});

document.getElementById("case-hc").addEventListener("change", (e) => {
  document.getElementById("champs-hc").hidden = !e.target.checked;
});

document.getElementById("formulaire").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target;
  const hc = document.getElementById("case-hc").checked;

  if (!valider(f, hc)) return;

  const donnees = {
    nom: f.nom.value.trim(),
    watts: Number(f.watts.value),
    heures: Number(f.heures.value),
    jours: Number(f.jours.value),
    prix: Number(f.prix.value),
    prixHc: hc ? Number(f.prixHc.value) : null,
    partHc: hc ? Number(f.partHc.value) / 100 : 0,
  };

  sauverPrixKwh(donnees.prix);

  const liste = chargerAppareils();
  let id = idCourant;

  if (id) {
    const i = liste.findIndex((x) => x.id === id);
    liste[i] = { id, ...donnees };
  } else {
    id = crypto.randomUUID();
    liste.push({ id, ...donnees });
  }

  sauverAppareils(liste);
  aller(`#/appareil/${id}`, true);
});

document.getElementById("btn-supprimer").addEventListener("click", () => {
  if (!confirm("Supprimer cet appareil ?")) return;
  const liste = chargerAppareils().filter((x) => x.id !== idCourant);
  sauverAppareils(liste);
  retour();
});

document.querySelectorAll("[data-aller]").forEach((b) =>
  b.addEventListener("click", retour)
);

window.addEventListener("hashchange", route);

if (!location.hash) history.replaceState(null, "", "#/accueil");
route();
