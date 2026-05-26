import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import customFetch from "../axios/custom";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "intro" | "q1" | "q2" | "q3" | "results" | "skipConfirm";

type Answers = {
  q1?: string;
  q2?: string;
  q3?: string;
};

type StoredQuizState = {
  skippedAt?: number;
  remindEveryVisit?: boolean;
  completedAt?: number;
  results?: string[];
};

type Product = {
  id: string;
  title: string;
  image: string;
  price: number;
};

// ─── Mapping Q1 × Q2 × Q3 → product IDs ─────────────────────────────────────

const MAPPING: Record<string, string[]> = {
  "consultant|mission|classique":    ["18", "3", "9"],
  "consultant|mission|decontracte":  ["1", "6", "12"],
  "consultant|quotidien|classique":  ["3", "10", "8"],
  "consultant|quotidien|decontracte":["2", "6", "9"],
  "manager|cadeau|classique":        ["7", "15", "3"],
  "manager|cadeau|affirme":          ["13", "14", "16"],
  "curieux|demarquer|affirme":       ["13", "14", "16"],
  "curieux|demarquer|classique":     ["15", "18", "8"],
};

const FALLBACK_IDS = ["12", "13", "14"];

function getRecommendedIds(answers: Answers): string[] {
  const key = `${answers.q1}|${answers.q2}|${answers.q3}`;
  return MAPPING[key] ?? FALLBACK_IDS;
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

const STORAGE_KEY = "exalt-quiz";
const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000;

function getStoredState(): StoredQuizState {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function setStoredState(s: StoredQuizState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

function shouldShowQuiz(): boolean {
  const stored = getStoredState();
  const now = Date.now();
  if (stored.completedAt && now - stored.completedAt < THREE_MONTHS_MS) return false;
  if (stored.skippedAt) {
    if (stored.remindEveryVisit) return true;
    if (now - stored.skippedAt < THREE_MONTHS_MS) return false;
  }
  return true;
}

// ─── Questions data ───────────────────────────────────────────────────────────

const QUESTIONS = [
  {
    id: "q1" as const,
    text: "Tu es plutôt...",
    options: [
      { label: "Consultant en mission", value: "consultant" },
      { label: "Manager d'équipe",      value: "manager" },
      { label: "Client / Partenaire eXalt", value: "client" },
      { label: "Curieux de la marque",  value: "curieux" },
    ],
  },
  {
    id: "q2" as const,
    text: "Tu cherches une pièce pour...",
    options: [
      { label: "Le quotidien au bureau",  value: "quotidien" },
      { label: "Une mission client",      value: "mission" },
      { label: "Un événement / cadeau",   value: "cadeau" },
      { label: "Te démarquer",            value: "demarquer" },
    ],
  },
  {
    id: "q3" as const,
    text: "Ton style ?",
    options: [
      { label: "Classique & discret", value: "classique" },
      { label: "Décontracté",         value: "decontracte" },
      { label: "Affirmé / Statement", value: "affirme" },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const QuizPopup = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<Step>("intro");
  const [answers, setAnswers] = useState<Answers>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [emailSent, setEmailSent] = useState(false);
  const [emailValue, setEmailValue] = useState("");

  // Show after 5s if quiz should appear
  useEffect(() => {
    if (!shouldShowQuiz()) return;
    const timer = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const isLoggedIn = !!JSON.parse(localStorage.getItem("user") || "{}").email;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleClose = () => {
    setStep("skipConfirm");
  };

  const handleSkipChoice = (remindEveryVisit: boolean) => {
    setStoredState({ skippedAt: Date.now(), remindEveryVisit });
    setVisible(false);
  };

  const handleStart = () => setStep("q1");

  const handleAnswer = async (questionId: keyof Answers, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (questionId === "q1") { setStep("q2"); return; }
    if (questionId === "q2") { setStep("q3"); return; }

    // Q3 answered → compute results
    const ids = getRecommendedIds(newAnswers);
    try {
      const res = await customFetch.get("/products");
      const all: Product[] = res.data;
      const recommended = ids
        .map((id) => all.find((p) => p.id === id))
        .filter(Boolean) as Product[];
      setProducts(recommended);
    } catch {
      setProducts([]);
    }

    setStoredState({ completedAt: Date.now(), results: ids });
    setStep("results");
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In v1: just show confirmation (no backend email sending)
    setEmailSent(true);
  };

  const handleViewSelection = () => {
    const ids = products.map((p) => p.id).join(",");
    setVisible(false);
    navigate(`/search?recommended=${ids}`);
  };

  const currentQuestionIndex = step === "q1" ? 0 : step === "q2" ? 1 : step === "q3" ? 2 : -1;

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        {/* Close button */}
        {step !== "skipConfirm" && (
          <button
            onClick={handleClose}
            aria-label="Fermer"
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl leading-none z-10"
          >
            ×
          </button>
        )}

        {/* ── INTRO ─────────────────────────────────────────────────────────── */}
        {step === "intro" && (
          <div className="px-8 py-12 text-center">
            <p className="text-sm font-semibold tracking-widest text-secondaryBrown uppercase mb-2">
              Et si on faisait connaissance ?
            </p>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Ton univers en 30 sec
            </h2>
            <p className="text-gray-500 mb-8">
              3 questions, 30 secondes, une sélection rien que pour toi.
            </p>
            <button
              onClick={handleStart}
              className="w-full bg-secondaryBrown text-white py-3 text-base font-medium tracking-wide mb-3 transition hover:opacity-90"
            >
              Commencer
            </button>
            <button
              onClick={handleClose}
              className="text-gray-400 underline text-sm"
            >
              Passer
            </button>
          </div>
        )}

        {/* ── QUESTIONS ─────────────────────────────────────────────────────── */}
        {(step === "q1" || step === "q2" || step === "q3") && (
          <div className="px-8 py-8">
            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Question {currentQuestionIndex + 1} sur 3</span>
                <span>{Math.round(((currentQuestionIndex + 1) / 3) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondaryBrown rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / 3) * 100}%` }}
                />
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {QUESTIONS[currentQuestionIndex].text}
            </h2>

            <div className="space-y-3">
              {QUESTIONS[currentQuestionIndex].options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() =>
                    handleAnswer(
                      QUESTIONS[currentQuestionIndex].id,
                      opt.value
                    )
                  }
                  className="w-full text-left px-5 py-3 border border-gray-200 text-gray-700 text-sm font-medium transition hover:border-secondaryBrown hover:text-secondaryBrown"
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {currentQuestionIndex > 0 && (
              <button
                onClick={() =>
                  setStep(currentQuestionIndex === 1 ? "q1" : "q2")
                }
                className="mt-5 text-sm text-gray-400 hover:text-gray-600"
              >
                ← Question précédente
              </button>
            )}
          </div>
        )}

        {/* ── RESULTS ───────────────────────────────────────────────────────── */}
        {step === "results" && (
          <div className="px-8 py-8">
            <p className="text-xs font-semibold tracking-widest text-secondaryBrown uppercase mb-1">
              Ta sélection eXalt
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              3 pièces faites pour toi
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    setVisible(false);
                    navigate(`/product/${product.id}`);
                  }}
                  className="text-left group"
                >
                  <div className="aspect-square overflow-hidden bg-gray-50 mb-2">
                    <img
                      src={
                        product.image?.startsWith("http") || product.image?.startsWith("/")
                          ? product.image
                          : `/assets/${product.image}`
                      }
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-sm font-medium text-gray-800 leading-tight">
                    {product.title}
                  </p>
                  <p className="text-sm text-secondaryBrown font-semibold mt-0.5">
                    {product.price}€
                  </p>
                </button>
              ))}
            </div>

            <button
              onClick={handleViewSelection}
              className="w-full bg-secondaryBrown text-white py-3 text-sm font-medium tracking-wide transition hover:opacity-90 mb-4"
            >
              Voir ma sélection
            </button>

            {/* Email capture — anonymous users only */}
            {!isLoggedIn && !emailSent && (
              <div className="border-t border-gray-100 pt-5">
                <p className="text-sm text-gray-500 mb-3">
                  Reçois ta sélection par mail pour la retrouver plus tard 👇
                </p>
                <form onSubmit={handleEmailSubmit} className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={emailValue}
                    onChange={(e) => setEmailValue(e.target.value)}
                    placeholder="ton@email.com"
                    className="flex-1 border border-gray-200 px-3 py-2 text-sm outline-none focus:border-secondaryBrown"
                  />
                  <button
                    type="submit"
                    className="bg-secondaryBrown text-white px-4 py-2 text-sm font-medium transition hover:opacity-90"
                  >
                    Envoyer
                  </button>
                </form>
              </div>
            )}

            {!isLoggedIn && emailSent && (
              <p className="text-sm text-green-600 text-center mt-2">
                ✨ Merci ! Ta sélection arrive dans ta boîte mail.
              </p>
            )}
          </div>
        )}

        {/* ── SKIP CONFIRM ──────────────────────────────────────────────────── */}
        {step === "skipConfirm" && (
          <div className="px-8 py-10 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Une dernière chose...
            </h2>
            <p className="text-gray-500 mb-7">
              Veux-tu revoir ce quiz lors de tes prochaines visites ?
            </p>
            <button
              onClick={() => handleSkipChoice(true)}
              className="w-full bg-secondaryBrown text-white py-3 text-sm font-medium tracking-wide transition hover:opacity-90 mb-3"
            >
              Oui, à chaque visite
            </button>
            <button
              onClick={() => handleSkipChoice(false)}
              className="w-full border border-gray-300 text-gray-700 py-3 text-sm font-medium transition hover:border-gray-500"
            >
              Non, me reproposer dans 3 mois
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPopup;
