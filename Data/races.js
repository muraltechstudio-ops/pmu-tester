// C'est un exemple de format de données que ton site va analyser
export const sampleRaces = [
  {
    id: 1,
    date: "2023-10-01",
    hippodrome: "Argentan",
    type: "Attelé",
    depart: "Autostart",
    partants: 14,
    arrivee: [7, 5, 14, 2], // Les 4 premiers
    rapport2sur4: 8.40, // Rapport pour 3€ (donc 4.20€ pour 1.5€)
    chevaux: [
      { num: 7, musique: "1a1a", cote: 3.5, driver: "P. Vercruysse" }, // Notre base théorique
      { num: 5, musique: "2a2a", cote: 7.1 },
      { num: 1, musique: "Da1a", cote: 9.9 },
      { num: 14, musique: "3a3m", cote: 17.0 },
      { num: 2, musique: "4aDa", cote: 16.0 },
      // ... les autres chevaux
    ]
  },
  {
    id: 2,
    date: "2023-10-02",
    hippodrome: "Vincennes",
    type: "Attelé",
    depart: "Autostart",
    partants: 16,
    arrivee: [1, 2, 9, 6],
    rapport2sur4: 5.20,
    chevaux: [
      { num: 9, musique: "1a1a", cote: 2.1 }, // Favori (Base potentielle)
      { num: 1, musique: "0a0a", cote: 45.0 }, // Outsider rentré
      // ...
    ]
  },
  // Tu pourras ajouter des centaines de courses ici
];