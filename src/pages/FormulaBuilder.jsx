import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FormulaBuilder.css";

const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Biology"];
const LEVELS = ["Easy", "Intermediate", "Advanced"];

// Format: [title, formula, explanation]
const BASE_BANK = {
  Mathematics: [
    ["Area of rectangle", "Area = Length × Breadth", "Multiply length by breadth."],
    ["Perimeter of square", "Perimeter = 4 × Side", "A square has four equal sides."],
    ["Area of triangle", "Area = ½ × Base × Height", "Half the base times the height."],
    ["Area of circle", "Area = π × Radius²", "Pi times the radius squared."],
    ["Circumference of circle", "C = 2 × π × Radius", "Two times pi times radius."],
    ["Simple interest", "SI = P × R × T ÷ 100", "Principal times rate times time divided by 100."],
    ["Average", "Average = Sum ÷ Number", "Divide the sum by the number of values."],
    ["Speed", "Speed = Distance ÷ Time", "Distance divided by time."],
    ["Distance", "Distance = Speed × Time", "Speed times time."],
    ["Pythagorean theorem", "a² + b² = c²", "Used for right-angled triangles."],
    ["Quadratic formula", "x = (-b ± √(b² - 4ac)) ÷ (2a)", "Solves a quadratic equation."],
    ["Percentage", "Percentage = Part ÷ Whole × 100", "Divide the part by the whole and multiply by 100."],
    ["Profit", "Profit = Selling Price - Cost Price", "Selling price minus cost price."],
    ["Loss", "Loss = Cost Price - Selling Price", "Cost price minus selling price."],
    ["Rectangle perimeter", "P = 2 × (Length + Breadth)", "Twice the sum of length and breadth."],
    ["Cube volume", "Volume = Side³", "Cube the side length."],
    ["Cuboid volume", "Volume = Length × Breadth × Height", "Multiply all three dimensions."],
    ["Cylinder volume", "Volume = π × Radius² × Height", "Pi times radius squared times height."],
    ["Probability", "P = Favourable Outcomes ÷ Total Outcomes", "Favourable outcomes divided by total outcomes."],
    ["Slope", "m = (y₂ - y₁) ÷ (x₂ - x₁)", "Change in y divided by change in x."],
    ["Arithmetic sequence", "aₙ = a + (n - 1)d", "Nth term of an arithmetic sequence."],
    ["Combination", "nCr = n! ÷ (r! × (n - r)!)", "Selections where order does not matter."],
    ["Ratio", "Ratio = First Quantity ÷ Second Quantity", "Compare two quantities by division."],
    ["Linear equation", "y = m × x + c", "Slope-intercept form of a line."],
    ["Heron's formula", "Area = √(s × (s-a) × (s-b) × (s-c))", "Area from the three side lengths."]
  ],

  Physics: [
    ["Speed formula", "Speed = Distance ÷ Time", "Distance divided by time."],
    ["Velocity", "Velocity = Displacement ÷ Time", "Displacement divided by time."],
    ["Acceleration", "a = (v - u) ÷ t", "Change in velocity divided by time."],
    ["Force", "F = m × a", "Newton's second law."],
    ["Weight", "Weight = Mass × g", "Mass times gravitational acceleration."],
    ["Work", "Work = Force × Distance", "Force times displacement in its direction."],
    ["Power", "Power = Work ÷ Time", "Work divided by time."],
    ["Kinetic energy", "KE = ½ × Mass × Velocity²", "Half mass times velocity squared."],
    ["Potential energy", "PE = Mass × g × Height", "Mass times gravity times height."],
    ["Momentum", "Momentum = Mass × Velocity", "Mass times velocity."],
    ["Density", "Density = Mass ÷ Volume", "Mass divided by volume."],
    ["Pressure", "Pressure = Force ÷ Area", "Force divided by area."],
    ["Ohm's law", "V = I × R", "Voltage equals current times resistance."],
    ["Electrical power", "P = V × I", "Voltage times current."],
    ["Electrical energy", "E = P × t", "Power times time."],
    ["Current", "I = Q ÷ t", "Charge flowing per unit time."],
    ["Wave speed", "v = Frequency × Wavelength", "Frequency times wavelength."],
    ["Gravitational force", "F = G × m₁ × m₂ ÷ r²", "Newton's universal gravitation law."],
    ["Lens formula", "1/f = 1/v - 1/u", "Thin-lens relation using the chosen sign convention."],
    ["Photon energy", "E = h × f", "Planck's constant times frequency."],
    ["Mass-energy equivalence", "E = m × c²", "Einstein's mass-energy relation."],
    ["Ideal gas law", "P × V = n × R × T", "Pressure times volume equals nRT."],
    ["Torque", "τ = Force × Lever Arm", "Force times perpendicular lever arm."],
    ["Friction", "F = μ × Normal Force", "Friction magnitude equals coefficient times normal force."],
    ["Average acceleration", "a = Δv ÷ Δt", "Change in velocity divided by change in time."]
  ],

  Chemistry: [
    ["Water", "H₂O", "Two hydrogen atoms and one oxygen atom."],
    ["Carbon dioxide", "CO₂", "One carbon atom and two oxygen atoms."],
    ["Oxygen molecule", "O₂", "Two oxygen atoms."],
    ["Ozone", "O₃", "Three oxygen atoms."],
    ["Methane", "CH₄", "One carbon atom and four hydrogen atoms."],
    ["Ammonia", "NH₃", "One nitrogen atom and three hydrogen atoms."],
    ["Sodium chloride", "NaCl", "Sodium chloride is common table salt."],
    ["Hydrochloric acid", "HCl", "Hydrogen chloride in aqueous solution is hydrochloric acid."],
    ["Sulfuric acid", "H₂SO₄", "Two hydrogen, one sulfur and four oxygen atoms."],
    ["Nitric acid", "HNO₃", "Hydrogen, nitrogen and oxygen."],
    ["Sodium hydroxide", "NaOH", "Sodium, oxygen and hydrogen."],
    ["Calcium carbonate", "CaCO₃", "Found in limestone and chalk."],
    ["Sodium bicarbonate", "NaHCO₃", "Common baking soda formula."],
    ["Glucose", "C₆H₁₂O₆", "A simple sugar."],
    ["Ethanol", "C₂H₅OH", "A two-carbon alcohol."],
    ["Acetic acid", "CH₃COOH", "The main acid in vinegar."],
    ["Hydrogen peroxide", "H₂O₂", "Contains two hydrogen and two oxygen atoms."],
    ["Hydrogen combustion", "2H₂ + O₂ → 2H₂O", "Hydrogen reacts with oxygen to form water."],
    ["Neutralisation", "Acid + Base → Salt + Water", "A typical acid-base neutralisation reaction."],
    ["Photosynthesis equation", "6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂", "Overall simplified photosynthesis equation."],
    ["Molarity", "M = Moles ÷ Litres", "Moles of solute divided by solution volume in litres."],
    ["Moles", "Moles = Mass ÷ Molar Mass", "Mass divided by molar mass."],
    ["pH", "pH = -log₁₀[H⁺]", "Negative logarithm of hydrogen-ion concentration."],
    ["Mass percent", "Mass % = Solute Mass ÷ Solution Mass × 100", "Solute mass divided by total solution mass."]
  ],

  Biology: [
    ["Photosynthesis", "Carbon dioxide + Water → Glucose + Oxygen", "Plants use light energy to make food."],
    ["Cellular respiration", "Glucose + Oxygen → Carbon dioxide + Water + Energy", "Cells release energy from glucose."],
    ["Basic cell theory", "Cell → Basic Unit of Life", "Cells are the basic structural and functional units of life."],
    ["DNA", "DNA → Genetic Information", "DNA stores hereditary information."],
    ["RNA", "DNA → RNA", "Transcription produces RNA from a DNA template."],
    ["Protein synthesis", "DNA → RNA → Protein", "The central dogma in simplified form."],
    ["Aerobic respiration", "Glucose + Oxygen → ATP + Carbon dioxide + Water", "Aerobic respiration produces usable cellular energy."],
    ["Anaerobic respiration", "Glucose → Energy + Byproducts", "Energy release without oxygen; products depend on organism."],
    ["Mitosis", "One Cell → Two Daughter Cells", "Mitosis produces two daughter cells."],
    ["Meiosis", "One Diploid Cell → Four Haploid Cells", "Meiosis produces haploid cells after two divisions."],
    ["Osmosis", "Water → Across a Selectively Permeable Membrane", "Net water movement across a selective membrane."],
    ["Diffusion", "High Concentration → Low Concentration", "Particles move down a concentration gradient."],
    ["Transcription", "DNA → mRNA", "Genetic information is copied into messenger RNA."],
    ["Translation", "mRNA → Protein", "Ribosomes use mRNA to build a protein."],
    ["Natural selection", "Variation + Selection → Adaptation", "Helpful inherited traits may become more common."],
    ["Food chain", "Producer → Consumer", "Energy transfers through feeding relationships."],
    ["Pollination", "Pollen → Stigma", "Pollen transfer within a flower species."],
    ["Fertilisation", "Male Gamete + Female Gamete → Zygote", "Fusion of gametes forms a zygote."],
    ["Blood circulation", "Heart → Arteries → Capillaries → Veins", "Blood moves through the circulatory system."],
    ["Homeostasis", "Change → Regulation → Stable Internal Conditions", "Regulatory systems maintain internal balance."],
    ["Water cycle", "Evaporation → Condensation → Precipitation", "A simplified sequence in the water cycle."],
    ["Xylem", "Roots → Xylem → Leaves", "Xylem transports water and minerals in plants."],
    ["ATP", "ADP + Phosphate → ATP", "Energy input can regenerate ATP from ADP and phosphate."],
    ["Ecosystem", "Organisms + Environment → Ecosystem", "Living organisms interact with their environment."]
  ]
};

// Remove duplicate formulas across all subjects.
const normalize = (text) =>
  text
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/×/g, "*")
    .replace(/÷/g, "/");

const formulaKey = (formula) => normalize(formula);

const UNIQUE_QUESTIONS = (() => {
  const seen = new Set();
  const result = [];

  SUBJECTS.forEach((subject) => {
    BASE_BANK[subject].forEach(([title, formula, explanation]) => {
      const key = formulaKey(formula);

      if (seen.has(key)) return;

      seen.add(key);
      result.push([subject, title, formula, explanation]);
    });
  });

  return result;
})();

// Each unique formula is assigned to only one level.
const BANK = {
  Easy: [],
  Intermediate: [],
  Advanced: []
};

UNIQUE_QUESTIONS.forEach(([subject, title, formula, explanation], index) => {
  const level = LEVELS[index % LEVELS.length];

  BANK[level].push([
    subject,
    `Build the formula: ${title}`,
    formula.split(" "),
    explanation
  ]);
});

const shuffle = (arr) => {
  const result = arr.map((value, index) => ({
    id: `${index}-${value}-${Math.random()}`,
    value
  }));

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
};

export default function FormulaBuilder() {
  const navigate = useNavigate();

  const [level, setLevel] = useState("Easy");
  const [subject, setSubject] = useState("All");
  const [index, setIndex] = useState(0);
  const [pieces, setPieces] = useState(() => shuffle(BANK.Easy[0][2]));
  const [placed, setPlaced] = useState([]);
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);
  const [time, setTime] = useState(60);
  const [feedback, setFeedback] = useState("");
  const [done, setDone] = useState(false);
  const [finished, setFinished] = useState(false);
  const [hint, setHint] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const questions = useMemo(() => {
    return BANK[level].filter(
      (question) => subject === "All" || question[0] === subject
    );
  }, [level, subject]);

  const current = questions[index] ?? null;

  function loadQuestion(question) {
    if (!question) return;

    setPieces(shuffle(question[2]));
    setPlaced([]);
    setTime(60);
    setFeedback("");
    setDone(false);
    setHint(false);
    setCelebrate(false);
  }

  function resetForSelection(nextLevel, nextSubject) {
    const nextQuestions = BANK[nextLevel].filter(
      (question) =>
        nextSubject === "All" || question[0] === nextSubject
    );

    setIndex(0);
    setScore(0);
    setSolved(0);
    setFinished(false);

    if (nextQuestions[0]) {
      loadQuestion(nextQuestions[0]);
    } else {
      setPlaced([]);
      setPieces([]);
      setFeedback("");
      setDone(false);
      setTime(60);
    }
  }

  useEffect(() => {
    if (done || finished || !current) return;

    const timer = setInterval(() => {
      setTime((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          setDone(true);
          setFeedback(`Time's up! Answer: ${current[2].join(" ")}`);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [index, level, subject, done, finished, current]);

  // Drag a piece from the available pieces into the answer area.
  function dropPiece(event, targetIndex = placed.length) {
    event.preventDefault();

    if (done) return;

    const id = event.dataTransfer.getData("pieceId");
    const piece = pieces.find((item) => item.id === id);

    if (!piece) return;

    setPlaced((old) => {
      const next = old.filter((item) => item.id !== id);

      next.splice(Math.min(targetIndex, next.length), 0, piece);

      return next;
    });
  }

  // Drag a placed piece back to the available pieces area to remove it.
  function returnPieceToBank(event) {
    event.preventDefault();

    if (done) return;

    const id = event.dataTransfer.getData("pieceId");

    setPlaced((old) => old.filter((item) => item.id !== id));
  }

  function checkAnswer() {
    if (done || placed.length === 0 || !current) return;

    const expected = normalize(current[2].join(""));
    const actual = normalize(
      placed.map((item) => item.value).join("")
    );

    if (expected === actual) {
      const points = 10 + time;

      setScore((old) => old + points);
      setSolved((old) => old + 1);
      setFeedback(`Correct formula! +${points} points`);
      setDone(true);
      setCelebrate(true);
    } else {
      setFeedback("Not quite! Rearrange the pieces and try again.");
    }
  }

  function nextQuestion() {
    if (index + 1 >= questions.length) {
      setFinished(true);
      return;
    }

    const next = index + 1;

    setIndex(next);
    loadQuestion(questions[next]);
  }

  function restart() {
    setIndex(0);
    setScore(0);
    setSolved(0);
    setFinished(false);

    if (questions[0]) {
      loadQuestion(questions[0]);
    }
  }

  const badge =
    solved >= 10
      ? "Formula Master"
      : solved >= 5
        ? "Science Star"
        : solved >= 1
          ? "Formula Explorer"
          : "Keep Learning";

  if (finished) {
    return (
      <main className="fb-page">
        <section className="fb-card fb-results">
          <h1>🏆 Challenge Complete!</h1>
          <p>You completed the {level} Formula Builder challenge.</p>
          <h2>{score} Points</h2>
          <p>
            Correct formulas: {solved}/{questions.length}
          </p>
          <p>Badge: {badge}</p>

          <button onClick={restart}>Play Again</button>

          <button onClick={() => navigate("/dashboard")}>
            Dashboard
          </button>
        </section>
      </main>
    );
  }

  if (!current) {
    return (
      <main className="fb-page">
        <section className="fb-card">
          <h2>No questions available for this selection.</h2>

          <button
            onClick={() => {
              setSubject("All");
              resetForSelection(level, "All");
            }}
          >
            Show All Subjects
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="fb-page">
      <header className="fb-header">
        <button onClick={() => navigate("/dashboard")}>
          ← Dashboard
        </button>

        <h2>Formula Builder</h2>

        <span>Score: {score}</span>
      </header>

      <section className="fb-card">
        <div className="fb-controls">
          <label>
            Subject

            <select
              value={subject}
              onChange={(event) => {
                const nextSubject = event.target.value;

                setSubject(nextSubject);
                resetForSelection(level, nextSubject);
              }}
            >
              <option value="All">All Subjects</option>

              {SUBJECTS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            Level

            <select
              value={level}
              onChange={(event) => {
                const nextLevel = event.target.value;

                setLevel(nextLevel);
                resetForSelection(nextLevel, subject);
              }}
            >
              {LEVELS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="fb-stats">
          <span>
            Question {index + 1}/{questions.length}
          </span>

          <span>⏱ {time}s</span>

          <span>⭐ {solved} solved</span>
        </div>

        <p className="fb-subject">{current[0]}</p>

        <h1>{current[1]}</h1>

        <p>
          Drag and drop formula pieces into the answer area.
          Clicking or tapping pieces will not move them.
        </p>

        {/* Answer area: only drag-and-drop is allowed */}
        <div
          className="fb-answer"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => dropPiece(event)}
        >
          {placed.length === 0 && (
            <span className="fb-placeholder">
              Drop formula pieces here
            </span>
          )}

          {placed.map((piece, i) => (
            <button
              key={piece.id}
              type="button"
              className="fb-piece fb-placed"
              draggable={!done}
              disabled={done}
              onDragStart={(event) => {
                event.dataTransfer.setData("pieceId", piece.id);
                event.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => dropPiece(event, i)}
              title="Drag to reorder"
            >
              {piece.value}
            </button>
          ))}
        </div>

        {/* Available pieces: clicking does not add a piece */}
        <div
          className="fb-pieces"
          onDragOver={(event) => event.preventDefault()}
          onDrop={returnPieceToBank}
        >
          {pieces.map((piece) => {
            const used = placed.some(
              (item) => item.id === piece.id
            );

            return (
              <button
                key={piece.id}
                type="button"
                className={`fb-piece ${used ? "fb-used" : ""}`}
                disabled={used || done}
                draggable={!used && !done}
                onDragStart={(event) => {
                  event.dataTransfer.setData("pieceId", piece.id);
                  event.dataTransfer.effectAllowed = "move";
                }}
              >
                {piece.value}
              </button>
            );
          })}
        </div>

        <div className="fb-actions">
          <button
            onClick={checkAnswer}
            disabled={done || placed.length === 0}
          >
            Check Formula
          </button>

          <button
            onClick={() => setPlaced([])}
            disabled={done}
          >
            Reset
          </button>

          <button
            onClick={() => setHint(true)}
            disabled={done}
          >
            Hint
          </button>
        </div>

        {hint && (
          <p className="fb-hint">
            Hint: {current[3]}
          </p>
        )}

        {feedback && (
          <div
            className={`fb-feedback ${
              celebrate ? "fb-success" : ""
            }`}
          >
            {feedback}

            {celebrate && (
              <div className="fb-confetti">
                🎉 ✨ 🎊 ⭐ 🎉
              </div>
            )}
          </div>
        )}

        {done && (
          <section className="fb-explanation">
            <h3>Correct formula</h3>

            <p>{current[2].join(" ")}</p>

            <p>{current[3]}</p>

            <button onClick={nextQuestion}>
              {index + 1 === questions.length
                ? "View Results"
                : "Next Formula →"}
            </button>
          </section>
        )}

        <footer className="fb-footer">
          <span>🏅 Badge: {badge}</span>

          <span>Complete formulas to earn points!</span>
        </footer>
      </section>
    </main>
  );
}