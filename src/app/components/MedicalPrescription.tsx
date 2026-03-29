import { useState } from 'react';
import {
  Heart,
  Phone,
  MapPin,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Pill,
  Stethoscope,
  Thermometer,
  Wind,
  Droplets,
  ShieldAlert,
  Activity,
  Clock,
  Search,
  BookOpen,
  ImageOff,
} from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────

interface Ailment {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  borderColor: string;
  symptoms: string[];
  immediateSteps: string[];
  doNot: string[];
  medicines: Medicine[];
  whenToStop: string;
  callEmergency: boolean;
  illustrationSrc: string;
  illustrationAlt: string;
}

interface Medicine {
  name: string;
  dosage: string;
  note: string;
  otc: boolean;
}

interface Hospital {
  name: string;
  distance: string;
  phone: string;
  emergency: boolean;
}

const AILMENTS: Ailment[] = [
  {
    id: 'motion-sickness',
    name: 'Motion Sickness / Nausea',
    icon: Wind,
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-900/20',
    borderColor: 'border-teal-200 dark:border-teal-800',
    illustrationSrc: '/medical/motion_sickness.png',
    illustrationAlt:
      'Illustration showing how to relieve motion sickness: sit forward, deep breathing, sip water',
    symptoms: ['Nausea', 'Dizziness', 'Cold sweats', 'Pale skin', 'Vomiting urge'],
    immediateSteps: [
      'Sit facing forward, near a window if possible',
      'Focus on a distant stationary object',
      'Take slow, deep breaths — breathe in for 4 sec, hold 4 sec, out 4 sec',
      'Sip cold water slowly (do not gulp)',
      'Loosen tight clothing – collar, belt, waistband',
      'Avoid reading, looking at phone screen',
    ],
    doNot: ['Eat heavy or oily food', 'Read or use a phone', 'Sit facing backward'],
    medicines: [
      {
        name: 'Domperidone 10 mg',
        dosage: '1 tablet before meals',
        note: 'Take only if prescribed; do not drive after',
        otc: false,
      },
      {
        name: 'Ginger candy / ginger tea',
        dosage: 'As needed',
        note: 'Natural remedy — safe for all ages',
        otc: true,
      },
      {
        name: 'Dramamine (Dimenhydrinate)',
        dosage: '50 mg, 30 min before journey',
        note: 'May cause drowsiness',
        otc: true,
      },
    ],
    whenToStop:
      'Alight at the next station if you vomit repeatedly or feel faint. Seek station medical room.',
    callEmergency: false,
  },
  {
    id: 'chest-pain',
    name: 'Chest Pain / Cardiac Emergency',
    icon: Heart,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/25',
    borderColor: 'border-red-300 dark:border-red-700',
    illustrationSrc: '/medical/chest_pain.png',
    illustrationAlt:
      'Illustration showing cardiac emergency steps: alert staff, keep seated, give aspirin, CPR if needed',
    symptoms: [
      'Pressure or tightness in chest',
      'Pain radiating to arm or jaw',
      'Shortness of breath',
      'Cold sweat',
      'Light-headedness',
    ],
    immediateSteps: [
      '🚨 CALL 112 IMMEDIATELY or alert train staff',
      'Ask nearby passenger to help and notify the train guard',
      'Sit the patient down, do NOT let them walk around',
      'Loosen all tight clothing around the chest and neck',
      'If patient is conscious and not allergic — give Aspirin 325 mg (chew, do not swallow whole)',
      'Stay calm and reassure the patient until help arrives',
      'If patient becomes unresponsive — start CPR (30 chest compressions, 2 rescue breaths)',
    ],
    doNot: ['Leave the patient alone', 'Give food or water', 'Delay calling emergency services'],
    medicines: [
      {
        name: 'Aspirin 325 mg',
        dosage: 'Chew 1 tablet immediately',
        note: 'Only if not allergic to Aspirin & patient is conscious',
        otc: true,
      },
      {
        name: 'Sorbitrate (if prescribed)',
        dosage: 'Under the tongue as per prescription',
        note: 'Only if patient has known heart condition and carries it',
        otc: false,
      },
    ],
    whenToStop: '🚨 Stop at the VERY NEXT STATION. Alert train staff NOW.',
    callEmergency: true,
  },
  {
    id: 'breathing',
    name: 'Breathing Difficulty / Asthma',
    icon: Wind,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    illustrationSrc: '/medical/asthma.png',
    illustrationAlt:
      'Illustration showing asthma management: sit upright, use inhaler correctly, pursed lip breathing',
    symptoms: [
      'Wheezing',
      'Shortness of breath',
      'Chest tightness',
      'Rapid shallow breathing',
      'Lips turning blue',
    ],
    immediateSteps: [
      'Sit the person upright — do not lay them flat',
      'Move to a well-ventilated area, away from crowds',
      'If patient has an inhaler, help them use it (2 puffs, shake well first)',
      'Encourage slow, controlled breathing — breathe in through nose, out through pursed lips',
      'Loosen collar, tie, or anything tight around neck/chest',
      'Alert train guard and request emergency stop if no improvement within 5 min',
    ],
    doNot: [
      'Lay the patient flat',
      'Give water to someone struggling to breathe',
      'Delay using the inhaler',
    ],
    medicines: [
      {
        name: 'Salbutamol Inhaler (Asthalin)',
        dosage: '2 puffs every 4–6 hours as needed',
        note: "Patient's own prescription – shake before use",
        otc: false,
      },
      {
        name: 'Levocetrizine 5 mg',
        dosage: '1 tablet for allergic reaction trigger',
        note: 'For mild allergic-induced wheezing only',
        otc: true,
      },
    ],
    whenToStop:
      'Exit at next station if lips turn blue or patient cannot speak in full sentences. Call 112.',
    callEmergency: true,
  },
  {
    id: 'fainting',
    name: 'Fainting / Loss of Consciousness',
    icon: Activity,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    illustrationSrc: '/medical/fainting.png',
    illustrationAlt:
      'Illustration showing fainting first aid: lay flat with legs elevated, tilt head to check breathing, CPR if needed',
    symptoms: [
      'Sudden slumping or collapsing',
      'Unresponsive to voice/touch',
      'Pale or ashen skin',
      'Limpness',
    ],
    immediateSteps: [
      '🚨 Alert the train guard immediately — use the emergency chain/button',
      'Lay the person on their back if safe to do so',
      'Elevate legs 6–12 inches above heart level (unless injury suspected)',
      'Check breathing — if not breathing, start CPR',
      'Loosen tight clothing, ensure fresh air flow',
      'Do NOT give anything by mouth to an unconscious person',
      'If conscious after recovery: give sips of water and a small sweet if diabetic',
    ],
    doNot: [
      'Slap or shake the person',
      'Give water/food while unconscious',
      'Leave them unattended',
    ],
    medicines: [
      {
        name: 'Sugar / Glucose-D',
        dosage: 'Only after patient is fully conscious',
        note: 'Useful if fainting is due to low blood sugar',
        otc: true,
      },
      {
        name: 'ORS Sachet',
        dosage: 'After consciousness — may be due to dehydration',
        note: 'Dissolve in water, sip slowly',
        otc: true,
      },
    ],
    whenToStop: '🚨 Pull emergency chain / alert staff. Exit at next station with patient.',
    callEmergency: true,
  },
  {
    id: 'dehydration',
    name: 'Dehydration / Heat Exhaustion',
    icon: Droplets,
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    illustrationSrc: '/medical/dehydration.png',
    illustrationAlt:
      'Illustration showing dehydration treatment: move to cool area, mix ORS, apply cool cloth',
    symptoms: [
      'Dry mouth and excessive thirst',
      'Headache',
      'Dark urine / no urge to urinate',
      'Dizziness when standing',
      'Muscle cramps',
    ],
    immediateSteps: [
      'Move patient to a cooler, shaded area',
      'Give plenty of water or ORS — sip slowly every few minutes',
      'Apply cool, wet cloth to forehead, neck, and wrists',
      'Have the person sit or lie down; avoid standing',
      'Remove excess clothing or accessories',
      'Monitor pulse rate — if irregular, alert staff',
    ],
    doNot: [
      'Give caffeinated drinks (tea, coffee, cola)',
      'Give alcohol',
      'Leave in direct sunlight or near doors',
    ],
    medicines: [
      {
        name: 'ORS (Oral Rehydration Salts)',
        dosage: '1 sachet in 1L water; 250ml every 15 min',
        note: 'Best first-line treatment for dehydration',
        otc: true,
      },
      {
        name: 'Electral Powder',
        dosage: 'Dissolved in 1L water, sip over 1–2 hours',
        note: 'Replenishes lost electrolytes',
        otc: true,
      },
    ],
    whenToStop:
      'If patient is confused, has stopped sweating despite heat, or has rapid heartbeat, exit at next station.',
    callEmergency: false,
  },
  {
    id: 'fever',
    name: 'High Fever / Heat Stroke',
    icon: Thermometer,
    color: 'text-red-500 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    illustrationSrc: '/medical/fever.png',
    illustrationAlt:
      'Illustration showing fever management: thermometer reading, cooling down with cloth and fan, paracetamol with water',
    symptoms: [
      'Body temperature above 38.5°C',
      'Profuse sweating or absence of sweat',
      'Confusion or strange behaviour',
      'Hot, red skin',
      'Rapid heartbeat',
    ],
    immediateSteps: [
      'Move patient to coolest part of the train',
      'Remove extra clothing, fan the patient',
      'Apply wet cloth to forehead, neck and underarms',
      'Give paracetamol tablet if available and patient is conscious',
      'Encourage small sips of cool water',
      'Monitor for confusion or loss of awareness — alert staff immediately',
    ],
    doNot: [
      'Use ice-cold water on very young or elderly',
      'Give aspirin to children under 16',
      'Leave patient unattended',
    ],
    medicines: [
      {
        name: 'Paracetamol (Crocin) 500 mg',
        dosage: '1–2 tablets every 6 hours with water',
        note: 'Safe, widely available — do not exceed 4g/day',
        otc: true,
      },
      {
        name: 'Ibuprofen 400 mg',
        dosage: '1 tablet with food every 8 hours',
        note: 'Avoid if patient has acidity or kidney issues',
        otc: true,
      },
    ],
    whenToStop:
      'Exit at next major station if patient becomes confused, has a seizure, or is unresponsive.',
    callEmergency: false,
  },
  {
    id: 'anxiety',
    name: 'Panic Attack / Anxiety',
    icon: ShieldAlert,
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    borderColor: 'border-violet-200 dark:border-violet-800',
    illustrationSrc: '/medical/panic_attack.png',
    illustrationAlt:
      'Illustration showing panic attack management: box breathing technique, 5-4-3-2-1 grounding, calm support',
    symptoms: [
      'Sudden intense fear',
      'Racing heart',
      'Shortness of breath',
      'Trembling or shaking',
      'Feeling of doom or unreality',
    ],
    immediateSteps: [
      'Stay calm — speak gently and reassure the person: "You are safe, this will pass"',
      'Guide breathing: breathe in through nose for 4 sec, hold 4 sec, out through mouth for 6 sec',
      'Offer the person a distraction — talk about something neutral',
      'Let them sit, do not crowd around them',
      'Try the "5-4-3-2-1" technique: name 5 things you see, 4 you hear, 3 you can touch, 2 you smell, 1 you taste',
      'Offer water in small sips',
    ],
    doNot: [
      'Tell them to "calm down" or "just relax"',
      'Make them feel embarrassed',
      'Force them to stand or move',
    ],
    medicines: [
      {
        name: 'Propranolol 10 mg (if prescribed)',
        dosage: "As per doctor's advice only",
        note: 'Not to be given without prescription',
        otc: false,
      },
      {
        name: 'Calming essential oil (lavender)',
        dosage: 'Inhale from palms — a few drops',
        note: 'Natural calming method, safe and OTC',
        otc: true,
      },
    ],
    whenToStop:
      'Usually resolves within 10–20 min. Exit if person has fainted or their condition worsens.',
    callEmergency: false,
  },
];

const EMERGENCY_CONTACTS = [
  { label: 'Medical Emergency', number: '112', color: 'text-red-600', icon: '🆘' },
  { label: 'Ambulance', number: '108', color: 'text-red-500', icon: '🚑' },
  { label: 'Mumbai Metro Help', number: '1800-120-9000', color: 'text-blue-600', icon: '🚇' },
  { label: 'Railway Helpline', number: '139', color: 'text-green-600', icon: '🚂' },
  { label: 'Police', number: '100', color: 'text-slate-600', icon: '🚔' },
  { label: 'Women Safety', number: '1091', color: 'text-pink-600', icon: '👮‍♀️' },
];

const STATION_HOSPITALS: Record<string, Hospital[]> = {
  Dadar: [
    { name: 'Sion Hospital', distance: '1.2 km', phone: '022-2408-7000', emergency: true },
    { name: 'Hinduja Hospital', distance: '2.0 km', phone: '022-2444-9199', emergency: true },
  ],
  Andheri: [
    {
      name: 'Kokilaben Dhirubhai Ambani Hospital',
      distance: '2.3 km',
      phone: '022-4269-6969',
      emergency: true,
    },
    {
      name: 'Criticare Asia Hospital',
      distance: '1.1 km',
      phone: '022-6766-7777',
      emergency: true,
    },
  ],
  Ghatkopar: [
    {
      name: 'Rajawadi Municipal Hospital',
      distance: '0.9 km',
      phone: '022-2510-3801',
      emergency: true,
    },
    {
      name: 'Zen Multispeciality Hospital',
      distance: '2.1 km',
      phone: '022-3919-3919',
      emergency: false,
    },
  ],
  Kurla: [
    {
      name: 'Lokmanya Tilak Municipal Hospital',
      distance: '1.5 km',
      phone: '022-2404-3841',
      emergency: true,
    },
    { name: 'Asian Heart Institute', distance: '3.0 km', phone: '022-6698-6666', emergency: true },
  ],
  BKC: [
    {
      name: 'Bhabha Hospital, Bandra',
      distance: '3.2 km',
      phone: '022-2640-5555',
      emergency: true,
    },
    { name: 'Lilavati Hospital', distance: '3.8 km', phone: '022-2675-1000', emergency: true },
  ],
  default: [
    {
      name: 'Nearest Municipal Hospital',
      distance: 'Contact station staff',
      phone: '112',
      emergency: true,
    },
    { name: 'Emergency Ambulance', distance: 'On call', phone: '108', emergency: true },
  ],
};

// ─── Illustration component ────────────────────────────────────────────────────

function IllustrationPanel({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
        <ImageOff className="w-8 h-8 opacity-40" />
        <p className="text-xs">Illustration unavailable</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <p className="text-xs text-slate-500 dark:text-slate-400" style={{ fontWeight: 600 }}>
          Visual Step-by-Step Guide
        </p>
      </div>
      <img
        src={src}
        alt={alt}
        onError={() => setFailed(true)}
        className="w-full object-contain max-h-72"
        style={{ display: 'block' }}
      />
    </div>
  );
}

// ─── AilmentCard ──────────────────────────────────────────────────────────────

function AilmentCard({
  ailment,
  isOpen,
  onToggle,
}: {
  ailment: Ailment;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const Icon = ailment.icon;

  return (
    <div className={`rounded-xl border ${ailment.borderColor} overflow-hidden transition-all`}>
      {/* Header */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-4 ${ailment.bg} hover:opacity-90 transition-opacity text-left`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center ${ailment.bg} border ${ailment.borderColor}`}
          >
            <Icon className={`w-5 h-5 ${ailment.color}`} />
          </div>
          <div>
            <p className={`text-sm ${ailment.color}`} style={{ fontWeight: 700 }}>
              {ailment.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {ailment.symptoms.slice(0, 2).join(' · ')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {ailment.callEmergency && (
            <span
              className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-[10px]"
              style={{ fontWeight: 700 }}
            >
              ⚠ CALL 112
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div className="bg-white dark:bg-slate-900 p-5 space-y-5">
          {/* ── Illustration ── */}
          <IllustrationPanel src={ailment.illustrationSrc} alt={ailment.illustrationAlt} />

          {/* Symptoms */}
          <div>
            <p
              className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2"
              style={{ fontWeight: 600 }}
            >
              Symptoms
            </p>
            <div className="flex flex-wrap gap-2">
              {ailment.symptoms.map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-300"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Immediate steps */}
          <div>
            <p
              className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2"
              style={{ fontWeight: 600 }}
            >
              ✅ Immediate Steps
            </p>
            <ol className="space-y-2">
              {ailment.immediateSteps.map((step, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <span
                    className="w-5 h-5 flex-shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[10px] flex items-center justify-center mt-0.5"
                    style={{ fontWeight: 700 }}
                  >
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Do Not */}
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-3">
            <p className="text-xs text-red-700 dark:text-red-400 mb-2" style={{ fontWeight: 700 }}>
              ❌ Do NOT
            </p>
            <ul className="space-y-1">
              {ailment.doNot.map((d, i) => (
                <li
                  key={i}
                  className="text-xs text-red-600 dark:text-red-400 flex items-start gap-1.5"
                >
                  <span className="mt-0.5 flex-shrink-0">•</span> {d}
                </li>
              ))}
            </ul>
          </div>

          {/* Medicines */}
          <div>
            <p
              className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5"
              style={{ fontWeight: 600 }}
            >
              <Pill className="w-3.5 h-3.5" /> Medicines
            </p>
            <div className="space-y-2">
              {ailment.medicines.map((med, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 flex items-start gap-3"
                >
                  <div
                    className={`mt-0.5 px-1.5 py-0.5 rounded text-[9px] flex-shrink-0 ${med.otc ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'}`}
                    style={{ fontWeight: 700 }}
                  >
                    {med.otc ? 'OTC' : 'Rx'}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-sm text-slate-800 dark:text-slate-200"
                      style={{ fontWeight: 600 }}
                    >
                      {med.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {med.dosage}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 italic">
                      {med.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* When to stop */}
          <div
            className={`rounded-lg p-3 ${ailment.callEmergency ? 'bg-red-50 dark:bg-red-900/25 border border-red-200 dark:border-red-700' : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'}`}
          >
            <p
              className={`text-xs ${ailment.callEmergency ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'}`}
              style={{ fontWeight: 700 }}
            >
              🚉 When to Deboard / Escalate
            </p>
            <p
              className={`text-xs mt-1 ${ailment.callEmergency ? 'text-red-600 dark:text-red-300' : 'text-amber-600 dark:text-amber-300'}`}
            >
              {ailment.whenToStop}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface MedicalPrescriptionProps {
  selectedStation: string | null;
}

export function MedicalPrescription({ selectedStation }: MedicalPrescriptionProps) {
  const [openAilment, setOpenAilment] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<'guide' | 'contacts' | 'hospitals'>('guide');

  const filteredAilments = AILMENTS.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.symptoms.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const hospitals = selectedStation
    ? (STATION_HOSPITALS[selectedStation] ?? STATION_HOSPITALS['default'])
    : STATION_HOSPITALS['default'];

  return (
    <div className="space-y-5">
      {/* Top banner */}
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0a0a0a]/90 p-5 text-slate-900 dark:text-white flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
          <Stethoscope className="w-7 h-7 text-current" />
        </div>
        <div>
          <h3 className="text-base font-semibold">In-Journey Medical Guide</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Illustrated first-aid guidance, safe OTC medicines &amp; emergency contacts for
            passengers travelling on Mumbai Metro &amp; Railway.
          </p>
          <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5 font-medium">
            ⚠ This is general guidance only. Always consult a qualified doctor. In emergencies, call
            112 immediately.
          </p>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 w-fit">
        {(
          [
            { id: 'guide', label: 'Ailment Guide', icon: BookOpen },
            { id: 'contacts', label: 'Emergency Contacts', icon: Phone },
            { id: 'hospitals', label: 'Nearby Hospitals', icon: MapPin },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-all ${
                activeSection === tab.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              style={{ fontWeight: activeSection === tab.id ? 600 : 400 }}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Ailment Guide ── */}
      {activeSection === 'guide' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ailment or symptom (e.g. nausea, chest pain)…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-700 transition-all"
            />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-green-400" />
              OTC — Over-the-counter, no prescription needed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-400" />
              Rx — Requires prescription
            </span>
          </div>

          {/* Ailment cards */}
          <div className="space-y-3">
            {filteredAilments.length === 0 ? (
              <div className="text-center py-12 text-slate-400 dark:text-slate-600">
                <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No ailments match your search. Try different keywords.</p>
              </div>
            ) : (
              filteredAilments.map((ailment) => (
                <AilmentCard
                  key={ailment.id}
                  ailment={ailment}
                  isOpen={openAilment === ailment.id}
                  onToggle={() =>
                    setOpenAilment((prev) => (prev === ailment.id ? null : ailment.id))
                  }
                />
              ))
            )}
          </div>

          {/* Disclaimer */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 text-xs text-slate-500 dark:text-slate-400">
            <p style={{ fontWeight: 600 }}>⚕ Medical Disclaimer</p>
            <p className="mt-1">
              The guidance provided here is for general informational purposes and basic first-aid
              reference only. It is not a substitute for professional medical advice, diagnosis, or
              treatment. Always seek the advice of your physician or qualified health provider. In
              life-threatening situations, call <strong>112</strong> immediately.
            </p>
          </div>
        </div>
      )}

      {/* ── Emergency Contacts ── */}
      {activeSection === 'contacts' && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tap a number to call from any mobile network.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EMERGENCY_CONTACTS.map((c) => (
              <a
                key={c.label}
                href={`tel:${c.number}`}
                className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-rose-300 dark:hover:border-rose-700 hover:shadow-md transition-all group"
              >
                <span className="text-2xl">{c.icon}</span>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm text-slate-700 dark:text-slate-200"
                    style={{ fontWeight: 600 }}
                  >
                    {c.label}
                  </p>
                  <p className={`text-lg ${c.color} mt-0.5`} style={{ fontWeight: 700 }}>
                    {c.number}
                  </p>
                </div>
                <Phone className="w-4 h-4 text-slate-300 group-hover:text-rose-500 transition-colors flex-shrink-0" />
              </a>
            ))}
          </div>

          {/* CPR Quick Reference with illustration */}
          <div className="rounded-xl border-2 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 p-5 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-red-500 animate-pulse" />
              <p className="text-sm text-red-700 dark:text-red-300" style={{ fontWeight: 700 }}>
                Quick CPR Reference
              </p>
            </div>

            {/* CPR Illustration */}
            <div className="mb-4 rounded-xl overflow-hidden border border-red-200 dark:border-red-700 bg-white dark:bg-slate-900">
              <img
                src="/medical/cpr.png"
                alt="CPR step-by-step visual guide: Check and call 112, 30 chest compressions, 2 rescue breaths"
                className="w-full object-contain max-h-64"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                {
                  step: '1',
                  title: 'Check & Call',
                  desc: 'Check unresponsive. Call 112.',
                  color: 'bg-red-100 dark:bg-red-900/40',
                },
                {
                  step: '2',
                  title: 'Chest Compressions',
                  desc: '30 compressions, hard & fast (100–120/min)',
                  color: 'bg-red-100 dark:bg-red-900/40',
                },
                {
                  step: '3',
                  title: 'Rescue Breaths',
                  desc: '2 breaths, tilt head back, seal mouth',
                  color: 'bg-red-100 dark:bg-red-900/40',
                },
              ].map((s) => (
                <div key={s.step} className={`rounded-lg p-3 ${s.color}`}>
                  <div
                    className="w-7 h-7 rounded-full bg-red-500 text-white text-sm flex items-center justify-center mx-auto mb-2"
                    style={{ fontWeight: 700 }}
                  >
                    {s.step}
                  </div>
                  <p className="text-xs text-red-700 dark:text-red-300" style={{ fontWeight: 700 }}>
                    {s.title}
                  </p>
                  <p className="text-[10px] text-red-600 dark:text-red-400 mt-1">{s.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-red-500 dark:text-red-400 mt-3 text-center">
              Continue 30:2 cycles until help arrives or the person recovers.
            </p>
          </div>
        </div>
      )}

      {/* ── Nearby Hospitals ── */}
      {activeSection === 'hospitals' && (
        <div className="space-y-4">
          {selectedStation ? (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <MapPin className="w-4 h-4 text-rose-500" />
              Hospitals near{' '}
              <span className="text-slate-800 dark:text-white ml-1" style={{ fontWeight: 600 }}>
                {selectedStation}
              </span>{' '}
              station
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              Select a station from the sidebar to see nearby hospitals
            </div>
          )}

          <div className="space-y-3">
            {hospitals.map((h, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md transition-all"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${h.emergency ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}
                >
                  <Heart className={`w-5 h-5 ${h.emergency ? 'text-red-500' : 'text-blue-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm text-slate-800 dark:text-slate-200"
                    style={{ fontWeight: 600 }}
                  >
                    {h.name}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {h.distance}
                    </span>
                    {h.emergency && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400"
                        style={{ fontWeight: 700 }}
                      >
                        24/7 Emergency
                      </span>
                    )}
                  </div>
                </div>
                <a
                  href={`tel:${h.phone}`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors text-xs flex-shrink-0"
                  style={{ fontWeight: 600 }}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{h.phone}</span>
                </a>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
            <p
              className="text-sm text-blue-700 dark:text-blue-300 mb-2"
              style={{ fontWeight: 700 }}
            >
              💡 Tips for Medical Emergencies in Transit
            </p>
            <ul className="space-y-1.5 text-xs text-blue-600 dark:text-blue-400">
              <li>
                • Alert the <span style={{ fontWeight: 600 }}>Train Guard</span> — use the intercom
                button in the coach
              </li>
              <li>
                • Every Mumbai Metro station has a{' '}
                <span style={{ fontWeight: 600 }}>First Aid Room</span> on the concourse level
              </li>
              <li>
                • Station staff are trained in{' '}
                <span style={{ fontWeight: 600 }}>basic first-aid and CPR</span>
              </li>
              <li>
                • The <span style={{ fontWeight: 600 }}>Emergency chain</span> (red handle) stops
                the train — use only in life-threatening situations
              </li>
              <li>
                • Always carry a list of your{' '}
                <span style={{ fontWeight: 600 }}>medications and allergies</span> when travelling
              </li>
            </ul>
          </div>

          {/* On-board reminder */}
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-4 flex gap-3 items-start">
            <Clock className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <div>
              <p
                className="text-sm text-emerald-700 dark:text-emerald-300"
                style={{ fontWeight: 700 }}
              >
                On-Board Medical Kit
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                All Mumbai Metro trains carry a <strong>basic first-aid kit</strong> including
                bandages, antiseptic wipes, ORS sachets and a blood pressure monitor. Ask the guard
                for access.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
