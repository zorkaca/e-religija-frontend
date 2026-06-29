export interface WeddingChecklistItem {
  text: string;
  required: boolean;
}

export const WEDDING_CHECKLISTS: Record<string, WeddingChecklistItem[]> = {
  pravoslavlje: [
    { text: 'Lična karta / pasoš mladenca i mladenke', required: true },
    { text: 'Krsni list (izvadak, ne stariji od 6 mjeseci)', required: true },
    { text: 'Potvrda o civilnom vjenčanju', required: true },
    { text: 'Potvrda o završenom tečaju za brak', required: true },
    { text: 'Zaručnički ispit kod župnika (najmanje 3 mjeseca prije)', required: true },
    { text: 'Otpusnica / dopuštenje za vjenčanje (ako se vjenčavate izvan svoje župe)', required: false },
    { text: 'Imena kumova (svjedoka)', required: true },
    { text: 'Dogovor oko crkvene muzike i fotografisanja', required: false }
  ],
  katolicanstvo: [
    { text: 'Lična karta / pasoš mladenca i mladenke', required: true },
    { text: 'Krsni list sa upisom krizme i slobodnog bračnog statusa', required: true },
    { text: 'Potvrda o civilnom vjenčanju (obavezno prije crkvenog u BiH)', required: true },
    { text: 'Potvrda o završenom tečaju za brak', required: true },
    { text: 'Zaručnički ispit u župi boravka', required: true },
    { text: 'Otpusnica za vjenčanje (ako se vjenčavate u drugoj župi)', required: false },
    { text: 'Imena kumova', required: true },
    { text: 'Rok za objavu bannsa (provjeriti sa župom)', required: true }
  ],
  islam: [
    { text: 'Lična karta / pasoš mladenca i mladenke', required: true },
    { text: 'Potvrda o civilnom braku (ako je primjenjivo)', required: false },
    { text: 'Svjedoci za nikah (obično dva muškarca)', required: true },
    { text: 'Mahar / dowry dogovor (prema islamskoj tradiciji)', required: true },
    { text: 'Dogovor sa imamom oko termina i mjesta (džamija ili drugi prostor)', required: true },
    { text: 'Potvrda o slobodnom bračnom statusu', required: true },
    { text: 'Prisustvo staratelja (velija) gdje je propisano', required: false }
  ]
};

export function getWeddingChecklist(religionCode?: string): WeddingChecklistItem[] {
  if (!religionCode) {
    return WEDDING_CHECKLISTS['pravoslavlje'];
  }

  return WEDDING_CHECKLISTS[religionCode] ?? WEDDING_CHECKLISTS['pravoslavlje'];
}
