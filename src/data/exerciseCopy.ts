import { ExerciseDefinition, UILanguage } from '../types';

const sv: Record<string, { description: string; technique: string[]; focus: string[] }> = {
  swing: {
    description: 'En ballistisk höftfällning där höften driver kettlebellen i stället för armarna.',
    technique: ['Fäll i höften i stället för att göra en squat.', 'Håll kettlebellen nära kroppen i baksvingen.', 'Sträck höften kraftfullt och stå långt utan att luta bakåt.', 'Låt armarna guida kettlebellen i stället för att lyfta den.'],
    focus: ['Höft', 'Säte', 'Kondition']
  },
  clean: {
    description: 'För kettlebellen från svingbanan till en kontrollerad rack-position.',
    technique: ['Håll kettlebellen nära kroppen.', 'För handen runt kettlebellen så att den inte slår över handleden.', 'Avsluta i en stabil och tyst rack-position.', 'Använd höftkraft i stället för att curla vikten.'],
    focus: ['Höft', 'Rack', 'Grepp']
  },
  snatch: {
    description: 'En enarms ballistisk rörelse från baksvingen till låst position över huvudet.',
    technique: ['Driv rörelsen från höften.', 'Håll kettlebellen nära kroppen på vägen upp.', 'För handen mjukt igenom i toppen.', 'Avsluta med revbenen nere och armbågen låst.'],
    focus: ['Höft', 'Axlar', 'Kondition']
  },
  'high-pull': {
    description: 'En svingvariant med ett snabbt armbågsdrag samtidigt som höftdrivet behålls.',
    technique: ['Börja med en stark sving.', 'Dra armbågen bakåt i stället för rakt upp.', 'Håll handleden neutral.', 'Gå mjukt tillbaka in i baksvingen.'],
    focus: ['Höft', 'Övre rygg', 'Kondition']
  },
  'strict-press': {
    description: 'En strikt press över huvudet från rack utan hjälp från benen.',
    technique: ['Spänn bålen innan pressen.', 'Håll underarmen vertikal från rack-positionen.', 'Pressa runt huvudet och avsluta staplat över kroppen.', 'Undvik sidoböjning och bakåtlutning.'],
    focus: ['Axlar', 'Triceps', 'Bål']
  },
  'push-press': {
    description: 'En press över huvudet som får hjälp av en kort dip och explosiv benkraft.',
    technique: ['Dippa rakt ned med upprätt överkropp.', 'Driv kraft genom golvet.', 'Överför benkraften till kettlebellen.', 'Avsluta stabilt över huvudet.'],
    focus: ['Axlar', 'Benkraft', 'Power']
  },
  row: {
    description: 'En rodd i höftfälld position för styrka i övre rygg och lats.',
    technique: ['Fäll i höften och håll ryggen lång.', 'Dra armbågen mot höften.', 'Håll axeln borta från örat.', 'Kontrollera vägen ned.'],
    focus: ['Övre rygg', 'Lats', 'Grepp']
  },
  deadlift: {
    description: 'En grundläggande kettlebell-höftfällning från golvet.',
    technique: ['Placera kettlebellen mellan fötterna.', 'Skjut höften bakåt med neutral rygg.', 'Greppa med raka armar.', 'Stå upp genom att trycka golvet ifrån dig och sträcka höften.'],
    focus: ['Höft', 'Säte', 'Baksida lår']
  },
  'goblet-squat': {
    description: 'En frontbelastad squat med kettlebellen nära bröstet.',
    technique: ['Håll kettlebellen nära bröstet.', 'Sätt dig ned mellan höfterna.', 'Behåll hela foten i golvet.', 'Res dig utan att tappa bålpositionen.'],
    focus: ['Framsida lår', 'Säte', 'Bål']
  },
  'front-squat': {
    description: 'En squat med kettlebellen i rack-position.',
    technique: ['Sätt en stabil rack-position före nedgången.', 'Spänn bålen.', 'Låt knäna följa tårnas riktning.', 'Res dig med kettlebellen nära kroppen.'],
    focus: ['Framsida lår', 'Säte', 'Rack']
  },
  'reverse-lunge': {
    description: 'Ett kontrollerat bakåtutfall som kan belastas i rack- eller suitcase-position.',
    technique: ['Ta ett tillräckligt långt steg bakåt.', 'Behåll främre foten i golvet.', 'Sänk kroppen kontrollerat.', 'Driv genom främre benet tillbaka till start.'],
    focus: ['Säte', 'Framsida lår', 'Balans']
  },
  thruster: {
    description: 'En squat som går direkt över i en press över huvudet.',
    technique: ['Håll kettlebellen stabil genom squaten.', 'Accelerera när du reser dig.', 'Använd benkraften för att starta pressen.', 'Avsluta stabilt över huvudet före nästa repetition.'],
    focus: ['Ben', 'Axlar', 'Kondition']
  },
  halo: {
    description: 'En kontrollerad cirkel runt huvudet för axelrörlighet och bålstabilitet.',
    technique: ['Håll revbenen nere.', 'Rör kettlebellen långsamt runt huvudet.', 'Håll den nära utan att slå i huvudet.', 'Växla riktning jämnt.'],
    focus: ['Axlar', 'Övre rygg', 'Bål']
  },
  'suitcase-hold': {
    description: 'Ett statiskt ensidigt håll som tränar grepp och motstånd mot sidoböjning.',
    technique: ['Stå långt.', 'Håll axlarna jämna.', 'Luta inte bort från kettlebellen.', 'Andas lugnt med stabil bål.'],
    focus: ['Grepp', 'Sneda bukmuskler', 'Hållning']
  },
  'rack-hold': {
    description: 'Ett statiskt rack-håll för hållning, andning och bålstyrka.',
    technique: ['Håll underarmen nära kroppen.', 'Undvik onödig greppspänning.', 'Håll revben staplade över bäckenet.', 'Andas utan att tappa positionen.'],
    focus: ['Rack', 'Bål', 'Andning']
  }
};

export function localizedExerciseCopy(exercise: ExerciseDefinition, language: UILanguage) {
  if (language === 'sv' && sv[exercise.id]) return sv[exercise.id];
  if (language === 'sv') {
    const categoryFocus = {
      Ballistic: 'Ballistisk',
      Strength: 'Styrka',
      Legs: 'Ben',
      Core: 'Bål'
    }[exercise.category];
    return {
      description: 'Egen kettlebellövning.',
      technique: ['Arbeta kontrollerat och avsluta setet om tekniken försämras.'],
      focus: [categoryFocus]
    };
  }
  return {
    description: exercise.description ?? 'Custom kettlebell exercise.',
    technique: exercise.technique ?? ['Move with control and stop the set when technique breaks down.'],
    focus: exercise.focus ?? [exercise.category]
  };
}
