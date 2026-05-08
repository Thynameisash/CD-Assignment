import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar';

const STEPS = [
  {
    key: 'budget',
    title: "What's your budget?",
    type: 'budget',
  },
  {
    key: 'useCase',
    title: 'What will you mainly use the car for?',
    type: 'cards',
    options: [
      { value: 'city', label: 'City', icon: '🏙️' },
      { value: 'highway', label: 'Highway', icon: '🛣️' },
      { value: 'offroad', label: 'Off-road', icon: '🏔️' },
      { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
    ],
  },
  {
    key: 'fuelPreference',
    title: 'Any fuel preference?',
    type: 'cards',
    options: [
      { value: 'petrol', label: 'Petrol', icon: '⛽' },
      { value: 'diesel', label: 'Diesel', icon: '🛢️' },
      { value: 'electric', label: 'Electric', icon: '⚡' },
      { value: 'hybrid', label: 'Hybrid', icon: '🔋' },
      { value: 'no_preference', label: 'No Preference', icon: '🤷' },
    ],
  },
  {
    key: 'seatingNeed',
    title: 'How many seats do you need?',
    type: 'cards',
    options: [
      { value: 2, label: '2 Seats', icon: '🚗' },
      { value: 4, label: '4 Seats', icon: '🚙' },
      { value: 5, label: '5 Seats', icon: '🚘' },
      { value: 7, label: '7 Seats', icon: '🚐' },
      { value: 8, label: '8 Seats', icon: '🚌' },
    ],
  },
  {
    key: 'topPriority',
    title: "What's your top priority?",
    type: 'cards',
    options: [
      { value: 'safety', label: 'Safety', icon: '🛡️' },
      { value: 'mileage', label: 'Mileage', icon: '⛽' },
      { value: 'performance', label: 'Performance', icon: '🏎️' },
      { value: 'value', label: 'Value', icon: '💰' },
    ],
  },
];

const INITIAL_ANSWERS = {
  budget: '',
  budgetMode: 'flexible',
  useCase: [],
  fuelPreference: [],
  seatingNeed: [],
  topPriority: [],
};

export default function Quiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(INITIAL_ANSWERS);
  const navigate = useNavigate();

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const canProceed = () => {
    const val = answers[current.key];
    if (current.key === 'budget') return Number(val) >= 1000;
    return Array.isArray(val) ? val.length > 0 : val !== '';
  };

  const handleSelect = (key, value) => {
    setAnswers((prev) => {
      const cur = prev[key];
      if (Array.isArray(cur)) {
        return {
          ...prev,
          [key]: cur.includes(value)
            ? cur.filter((v) => v !== value)
            : [...cur, value],
        };
      }
      return { ...prev, [key]: value };
    });
  };

  const handleNext = () => {
    if (isLast) {
      const prefs = {
        ...answers,
        budget: Number(answers.budget),
      };
      navigate('/results', { state: { prefs } });
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <ProgressBar current={step + 1} total={STEPS.length} />

      <h2 className="mb-6 text-xl font-semibold text-gray-900">{current.title}</h2>

      {/* Budget step */}
      {current.type === 'budget' && (
        <div className="space-y-5">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              type="number"
              min="1000"
              step="1000"
              placeholder="e.g. 35000"
              value={answers.budget}
              onChange={(e) => handleSelect('budget', e.target.value)}
              className="w-full rounded-lg border border-border bg-white py-2.5 pl-7 pr-3 text-sm text-gray-900 outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-200"
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-xs font-medium text-gray-500 mb-1">Budget mode</legend>
            {[
              { value: 'flexible', label: 'Flexible', desc: 'Show me options ±$3K of my budget' },
              { value: 'strict', label: 'Strict', desc: 'Only show cars within my budget' },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                  answers.budgetMode === opt.value
                    ? 'border-primary-400 bg-primary-50'
                    : 'border-border hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="budgetMode"
                  value={opt.value}
                  checked={answers.budgetMode === opt.value}
                  onChange={() => handleSelect('budgetMode', opt.value)}
                  className="mt-0.5 accent-primary-600"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">{opt.label}</span>
                  <p className="text-xs text-gray-500">{opt.desc}</p>
                </div>
              </label>
            ))}
          </fieldset>
        </div>
      )}

      {/* Card selection steps */}
      {current.type === 'cards' && (
        <div className="grid grid-cols-2 gap-3">
          {current.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(current.key, opt.value)}
              className={`flex flex-col items-center gap-1.5 rounded-lg border p-4 text-sm font-medium transition-colors ${
                (Array.isArray(answers[current.key]) ? answers[current.key].includes(opt.value) : answers[current.key] === opt.value)
                  ? 'border-primary-400 bg-primary-50 text-primary-700'
                  : 'border-border text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={step === 0}
          className="text-sm font-medium text-gray-500 disabled:invisible hover:text-gray-700"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className="rounded-lg bg-primary-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLast ? 'Get My Recommendations' : 'Next →'}
        </button>
      </div>
    </div>
  );
}
