import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FormulaBuilder.css";

const BANK = {
  Easy: [
    ["Mathematics", "Area of rectangle", ["Area", "=", "Length", "×", "Breadth"], "Multiply length by breadth."],
    ["Physics", "Speed formula", ["Speed", "=", "Distance", "÷", "Time"], "Distance divided by time."],
    ["Chemistry", "Formula for water", ["H₂O"], "Two hydrogen atoms and one oxygen atom."],
    ["Mathematics", "Perimeter of square", ["Perimeter", "=", "4", "×", "Side"], "A square has four equal sides."],
    ["Physics", "Force formula", ["Force", "=", "Mass", "×", "Acceleration"], "Newton's second law."],
    ["Chemistry", "Formula for carbon dioxide", ["CO₂"], "One carbon atom and two oxygen atoms."],
    ["Mathematics", "Area of triangle", ["Area", "=", "½", "×", "Base", "×", "Height"], "Half times base times height."],
    ["Biology", "Photosynthesis", ["Carbon dioxide", "+", "Water", "→", "Glucose", "+", "Oxygen"], "Plants use light energy to make food."],
    ["Physics", "Work formula", ["Work", "=", "Force", "×", "Distance"], "Force multiplied by distance."],
    ["Mathematics", "Average formula", ["Average", "=", "Sum", "÷", "Number of values"], "Divide the sum by the number of values."]
  ],
  Intermediate: [
    ["Mathematics", "Area of circle", ["Area", "=", "π", "×", "Radius²"], "Pi times the radius squared."],
    ["Physics", "Kinetic energy", ["KE", "=", "½", "×", "Mass", "×", "Velocity²"], "Half times mass times velocity squared."],
    ["Physics", "Ohm's law", ["V", "=", "I", "×", "R"], "Voltage equals current times resistance."],
    ["Mathematics", "Simple interest", ["SI", "=", "P", "×", "R", "×", "T", "÷", "100"], "Principal times rate times time, divided by 100."],
    ["Chemistry", "Formula for methane", ["CH₄"], "One carbon atom and four hydrogen atoms."],
    ["Biology", "Cellular respiration", ["Glucose", "+", "Oxygen", "→", "Carbon dioxide", "+", "Water", "+", "Energy"], "Cells release energy from glucose."],
    ["Physics", "Electrical power", ["P", "=", "V", "×", "I"], "Voltage times current."],
    ["Mathematics", "Circumference of circle", ["C", "=", "2", "×", "π", "×", "Radius"], "Two times pi times radius."],
    ["Chemistry", "Formula for oxygen", ["O₂"], "Two oxygen atoms form an oxygen molecule."],
    ["Physics", "Potential energy", ["PE", "=", "Mass", "×", "g", "×", "Height"], "Mass times gravity times height."]
  ],
  Advanced: [
    ["Mathematics", "Pythagorean theorem", ["a²", "+", "b²", "=", "c²"], "Used for a right-angled triangle."],
    ["Physics", "Gravitational force", ["F", "=", "G", "×", "m₁", "×", "m₂", "÷", "r²"], "Force between two masses."],
    ["Physics", "Acceleration", ["Acceleration", "=", "(Final velocity - Initial velocity)", "÷", "Time"], "Change in velocity divided by time."],
    ["Mathematics", "Quadratic formula", ["x", "=", "(-b ± √(b² - 4ac))", "÷", "(2a)"], "Used to solve quadratic equations."],
    ["Chemistry", "Formula for ammonia", ["NH₃"], "One nitrogen atom and three hydrogen atoms."],
    ["Biology", "Photosynthesis reactants", ["Carbon dioxide", "+", "Water", "→", "Glucose", "+", "Oxygen"], "Light energy is required for this process."],
    ["Physics", "Momentum", ["Momentum", "=", "Mass", "×", "Velocity"], "Mass times velocity."],
    ["Mathematics", "Simple interest", ["SI", "=", "(P", "×", "R", "×", "T)", "÷", "100"], "P is principal, R is rate, T is time."],
    ["Physics", "Density", ["Density", "=", "Mass", "÷", "Volume"], "Mass divided by volume."],
    ["Chemistry", "Formula for ozone", ["O₃"], "A molecule containing three oxygen atoms."]
  ]
};

const shuffle = (arr) => {
  const result = arr.map((value, index) => ({
    id: `${index}-${value}`,
    value
  }));

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
};

const normalize = (text) =>
  text.toLowerCase().replace(/\s+/g, "").replace(/×/g, "*").replace(/÷/g, "/");

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

  const questions = useMemo(
    () => BANK[level].filter((q) => subject === "All" || q[0] === subject),
    [level, subject]
  );

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
      (q) => nextSubject === "All" || q[0] === nextSubject
    );

    setIndex(0);
    setScore(0);
    setSolved(0);
    setFinished(false);

    if (nextQuestions[0]) {
      loadQuestion(nextQuestions[0]);
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

  function selectPiece(piece) {
    if (done || placed.some((p) => p.id === piece.id)) return;
    setPlaced((old) => [...old, piece]);
  }

  function dropPiece(event, targetIndex = placed.length) {
    event.preventDefault();
    if (done) return;

    const id = event.dataTransfer.getData("pieceId");
    const piece = pieces.find((p) => p.id === id);
    if (!piece) return;

    setPlaced((old) => {
      const next = old.filter((p) => p.id !== id);
      next.splice(Math.min(targetIndex, next.length), 0, piece);
      return next;
    });

  }

  function removePiece(piece) {
    if (done) return;
    setPlaced((old) => old.filter((p) => p.id !== piece.id));
  }

  function checkAnswer() {
    if (done || placed.length === 0 || !current) return;

    const expected = normalize(current[2].join(""));
    const actual = normalize(placed.map((p) => p.value).join(""));

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
    solved >= 10 ? "Formula Master" :
    solved >= 5 ? "Science Star" :
    solved >= 1 ? "Formula Explorer" : "Keep Learning";

  if (finished) {
    return (
      <main className="fb-page">
        <section className="fb-card fb-results">
          <h1>🏆 Challenge Complete!</h1>
          <p>You completed the {level} Formula Builder challenge.</p>
          <h2>{score} Points</h2>
          <p>Correct formulas: {solved}/{questions.length}</p>
          <p>Badge: {badge}</p>
          <button onClick={restart}>Play Again</button>
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
        </section>
      </main>
    );
  }

  if (!current) {
    return (
      <main className="fb-page">
        <h2>No questions available for this selection.</h2>
        <button onClick={() => {
          setSubject("All");
          resetForSelection(level, "All");
        }}>Show All Subjects</button>
      </main>
    );
  }

  return (
    <main className="fb-page">
      <header className="fb-header">
        <button onClick={() => navigate("/dashboard")}>← Dashboard</button>
        <h2>Formula Builder</h2>
        <span>Score: {score}</span>
      </header>

      <section className="fb-card">
        <div className="fb-controls">
          <label>
            Subject
            <select
              value={subject}
              onChange={(e) => {
                const nextSubject = e.target.value;
                setSubject(nextSubject);
                resetForSelection(level, nextSubject);
              }}
            >
              <option>All</option>
              <option>Mathematics</option>
              <option>Physics</option>
              <option>Chemistry</option>
              <option>Biology</option>
            </select>
          </label>

          <label>
            Level
            <select
              value={level}
              onChange={(e) => {
                const nextLevel = e.target.value;
                setLevel(nextLevel);
                resetForSelection(nextLevel, subject);
              }}
            >
              {Object.keys(BANK).map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="fb-stats">
          <span>Question {index + 1}/{questions.length}</span>
          <span>⏱ {time}s</span>
          <span>⭐ {solved} solved</span>
        </div>

        <p className="fb-subject">{current[0]}</p>
        <h1>{current[1]}</h1>
        <p>Drag the pieces into the answer area, or tap them in order.</p>

        <div
          className="fb-answer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => dropPiece(e)}
        >
          {placed.length === 0 && (
            <span className="fb-placeholder">Drop formula pieces here</span>
          )}

          {placed.map((piece, i) => (
            <button
              key={piece.id}
              className="fb-piece fb-placed"
              onClick={() => removePiece(piece)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => dropPiece(e, i)}
              title="Tap to remove"
            >
              {piece.value} ×
            </button>
          ))}
        </div>

        <div className="fb-pieces">
          {pieces.map((piece) => {
            const used = placed.some((p) => p.id === piece.id);

            return (
              <button
                key={piece.id}
                className={`fb-piece ${used ? "fb-used" : ""}`}
                disabled={used || done}
                draggable={!used && !done}
                onDragStart={(e) => {
                  e.dataTransfer.setData("pieceId", piece.id);
                }}
                onClick={() => selectPiece(piece)}
              >
                {piece.value}
              </button>
            );
          })}
        </div>

        <div className="fb-actions">
          <button onClick={checkAnswer} disabled={done || placed.length === 0}>
            Check Formula
          </button>
          <button onClick={() => setPlaced([])} disabled={done}>
            Reset
          </button>
          <button onClick={() => setHint(true)}>Hint</button>
        </div>

        {hint && <p className="fb-hint">Hint: {current[3]}</p>}

        {feedback && (
          <div className={`fb-feedback ${celebrate ? "fb-success" : ""}`}>
            {feedback}
            {celebrate && <div className="fb-confetti">🎉 ✨ 🎊 ⭐ 🎉</div>}
          </div>
        )}

        {done && (
          <section className="fb-explanation">
            <h3>Correct formula</h3>
            <p>{current[2].join(" ")}</p>
            <p>{current[3]}</p>
            <button onClick={nextQuestion}>
              {index + 1 === questions.length ? "View Results" : "Next Formula →"}
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