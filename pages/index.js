import { useState, useMemo } from 'react';
import Head from 'next/head';
import { sampleRaces } from '../data/races';
import { Calculator, TrendingUp, AlertTriangle } from 'lucide-react';

export default function Home() {
  // --- ETAT (Configuration) ---
  const [miseBase, setMiseBase] = useState(1.5); // Flexi 50%
  const [nbAssocies, setNbAssocies] = useState(4);
  const [critereBase, setCritereBase] = useState('musique'); // 'cote' ou 'musique'
  
  // --- MOTEUR DE BACKTESTING ---
  const resultats = useMemo(() => {
    let capital = 0;
    let totalMise = 0;
    let coursesJouees = 0;
    let gains = 0;
    let historique = [];

    // On parcourt toutes les courses de la base de données
    sampleRaces.forEach(course => {
      // 1. Filtrer selon nos critères (Autostart + Attelé + 12-16 partants)
      if (course.type !== "Attelé" || course.depart !== "Autostart" || course.partants < 12 || course.partants > 16) {
        return; // On ignore cette course
      }

      coursesJouees++;
      
      // 2. Déterminer la BASE selon l'algorithme
      let baseSelectionnee = null;
      
      if (critereBase === 'cote') {
        // Prend le favori (cote la plus basse)
        baseSelectionnee = course.chevaux.reduce((prev, curr) => prev.cote < curr.cote ? prev : curr);
      } else {
        // Simulation simple de la musique (Cherche '1a' ou '2a')
        // Dans un vrai système, il faudrait un algo complexe de parsing de texte
        baseSelectionnee = course.chevaux.find(c => c.musique.includes("1a") || c.musique.includes("2a")) || course.chevaux[0];
      }

      // 3. Simuler les Associés (On prend ici des numéros aléatoires pour la démo, 
      // ou les suivants dans la liste des favoris dans un vrai cas)
      // Pour l'exemple, on imagine qu'on a bien sélectionné les associés qui sont arrivés (cas idéal) 
      // ou on simule une sélection fixe (ex: les 4 cotes suivantes).
      
      // COÛT : Nb Associés * Mise Base
      const coutCourse = nbAssocies * miseBase;
      totalMise += coutCourse;

      // 4. VÉRIFICATION DU RÉSULTAT
      const baseEstLa = course.arrivee.includes(baseSelectionnee.num);
      
      let gainCourse = 0;
      if (baseEstLa) {
        // La base est là. Combien d'associés sont là ?
        // Pour simplifier la simulation, disons qu'on capture en moyenne 1 associé gagnant si la base est là
        // Dans la réalité, il faut vérifier si nos associés spécifiques sont dans course.arrivee
        const rapportReel = course.rapport2sur4 / 2; // Division par 2 car Flexi 50%
        gainCourse = rapportReel; 
      }

      gains += gainCourse;
      capital += (gainCourse - coutCourse);

      historique.push({
        date: course.date,
        hippodrome: course.hippodrome,
        base: baseSelectionnee.num,
        resultat: gainCourse > 0 ? "GAGNÉ" : "PERDU",
        profit: gainCourse - coutCourse
      });
    });

    return { capital, totalMise, gains, coursesJouees, historique };
  }, [miseBase, nbAssocies, critereBase]);

  const roi = resultats.totalMise > 0 ? ((resultats.gains - resultats.totalMise) / resultats.totalMise) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <Head>
        <title>Backtest PMU 2sur4</title>
      </Head>

      <main className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-900 mb-6 flex items-center">
          <Calculator className="mr-2" /> Simulateur de Stratégie 2sur4
        </h1>

        {/* PANNEAU DE CONFIGURATION */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mise par ligne (Flexi)</label>
            <select 
              value={miseBase} 
              onChange={(e) => setMiseBase(parseFloat(e.target.value))}
              className="w-full border p-2 rounded"
            >
              <option value="1.5">1.5 € (50%)</option>
              <option value="3">3.0 € (100%)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre d'Associés</label>
            <input 
              type="number" 
              value={nbAssocies} 
              onChange={(e) => setNbAssocies(parseInt(e.target.value))}
              className="w-full border p-2 rounded"
            />
            <p className="text-xs text-gray-500 mt-1">Coût par course : {nbAssocies * miseBase} €</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stratégie de Base</label>
            <select 
              value={critereBase} 
              onChange={(e) => setCritereBase(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="musique">Meilleure Musique (1a/2a)</option>
              <option value="cote">Le Favori Mathématique</option>
            </select>
          </div>
        </div>

        {/* RÉSULTATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-100 p-4 rounded-lg text-center">
            <h3 className="text-blue-800 font-bold">Courses Analysées</h3>
            <p className="text-2xl">{resultats.coursesJouees}</p>
          </div>
          <div className={`p-4 rounded-lg text-center ${roi >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
            <h3 className={`${roi >= 0 ? 'text-green-800' : 'text-red-800'} font-bold flex justify-center items-center`}>
              <TrendingUp className="w-4 h-4 mr-1"/> ROI (Rentabilité)
            </h3>
            <p className="text-2xl">{roi.toFixed(2)} %</p>
          </div>
          <div className="bg-gray-800 text-white p-4 rounded-lg text-center">
            <h3 className="font-bold">Bénéfice Net</h3>
            <p className="text-2xl">{resultats.capital.toFixed(2)} €</p>
          </div>
        </div>

        {/* DÉTAIL DES COURSES */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hippodrome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Jouée</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Résultat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P/L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {resultats.historique.map((h, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{h.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{h.hippodrome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">N°{h.base}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${h.resultat === 'GAGNÉ' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {h.resultat}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${h.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {h.profit > 0 ? '+' : ''}{h.profit.toFixed(2)} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {resultats.historique.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <AlertTriangle className="mx-auto h-8 w-8 text-gray-400 mb-2"/>
              Aucune course ne correspond aux critères dans le jeu de données actuel.
            </div>
          )}
        </div>
        
        <div className="mt-8 text-xs text-gray-500 text-center">
          Note: Ceci est une simulation basée sur un jeu de données statique local. 
          Pour un test réel, le fichier /data/races.js doit être enrichi avec des données historiques.
        </div>
      </main>
    </div>
  );
}