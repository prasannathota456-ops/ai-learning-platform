import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import Logout from "./Logout";
import { generateLesson } from "../services/api";

import avatar1 from "../assets/avatars/avatar1.png";
import avatar2 from "../assets/avatars/avatar2.png";
import avatar3 from "../assets/avatars/avatar3.png";
import avatar4 from "../assets/avatars/avatar4.png";
import avatar5 from "../assets/avatars/avatar5.png";
import avatar6 from "../assets/avatars/avatar6.png";
import avatar7 from "../assets/avatars/avatar7.png";
import avatar8 from "../assets/avatars/avatar8.png";
import avatar9 from "../assets/avatars/avatar9.png";
import avatar10 from "../assets/avatars/avatar10.png";
import avatar11 from "../assets/avatars/avatar11.png";
import avatar12 from "../assets/avatars/avatar12.png";
import avatar13 from "../assets/avatars/avatar13.png";
import avatar14 from "../assets/avatars/avatar14.png";
import avatar15 from "../assets/avatars/avatar15.png";
import avatar16 from "../assets/avatars/avatar16.png";

const avatars = [
  avatar1, avatar2, avatar3, avatar4,
  avatar5, avatar6, avatar7, avatar8,
  avatar9, avatar10, avatar11, avatar12,
  avatar13, avatar14, avatar15, avatar16,
];

const languages = [
  { label: "English", value: "en-US" },
  { label: "తెలుగు", value: "te-IN" },
  { label: "हिन्दी", value: "hi-IN" },
];

const getDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getUserStorageKeys = (user) => {
  const userId = String(
    user._id || user.id || user.email || ""
  )
    .trim()
    .toLowerCase();

  if (!userId) return null;

  const safeId = encodeURIComponent(userId);

  return {
    historyKey: `learningHistory_${safeId}`,
    streakKey: `learningStreakDates_${safeId}`,
  };
};

const recordLearningActivity = (user) => {
  const keys = getUserStorageKeys(user);
  if (!keys) return;

  const today = getDateKey();

  try {
    const savedDates = JSON.parse(
      localStorage.getItem(keys.streakKey) || "[]"
    );

    const dates = Array.isArray(savedDates)
      ? savedDates
      : [];

    if (!dates.includes(today)) {
      dates.push(today);

      localStorage.setItem(
        keys.streakKey,
        JSON.stringify(dates)
      );
    }
  } catch (error) {
    console.error("Streak Save Error:", error);
  }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const resumeTopic = location.state?.resumeTopic || "";
  const resumeLesson = location.state?.resumeLesson || null;

  const [topic, setTopic] = useState(resumeTopic);
  const [lesson, setLesson] = useState(resumeLesson);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [language, setLanguage] = useState("en-US");
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const recognitionRef = useRef(null);
  const speechUtteranceRef = useRef(null);

  const savedUser = (() => {
    try {
      return JSON.parse(
        localStorage.getItem("loggedInUser") || "{}"
      );
    } catch {
      return {};
    }
  })();

  const userName = savedUser.name || "Learner";

  const savedAvatar = Number(
    localStorage.getItem("selectedAvatar") || 1
  );

  const userAvatar = avatars[savedAvatar - 1] || avatar1;

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;

        try {
          recognitionRef.current.stop();
        } catch {
          // Recognition may already be stopped.
        }
      }

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      speechUtteranceRef.current = null;
    };
  }, []);

  const saveLearningHistory = (currentTopic, currentLesson) => {
    const keys = getUserStorageKeys(savedUser);

    if (!keys) {
      console.error(
        "User ID or email not found. History was not saved."
      );
      return;
    }

    try {
      const parsed = JSON.parse(
        localStorage.getItem(keys.historyKey) || "[]"
      );

      const oldHistory = Array.isArray(parsed)
        ? parsed
        : [];

      const cleanTopic = currentTopic.trim();

      const existingIndex = oldHistory.findIndex(
        (item) =>
          String(item.topic || item.name || "").toLowerCase() ===
          cleanTopic.toLowerCase()
      );

      let updatedHistory;

      if (existingIndex !== -1) {
        updatedHistory = [...oldHistory];

        const oldItem = oldHistory[existingIndex];

        const isCompleted =
          Number(oldItem.progress || 0) >= 100 ||
          oldItem.status === "Completed";

        updatedHistory[existingIndex] = {
          ...oldItem,
          id: oldItem.id || Date.now(),
          mongoId:
            currentLesson?._id || oldItem.mongoId || null,
          topic: cleanTopic,
          name: cleanTopic,
          lesson: currentLesson,
          progress: isCompleted ? 100 : 50,
          quizScore: oldItem.quizScore ?? null,
          status: isCompleted
            ? "Completed"
            : "In Progress",
          lastUpdated: new Date().toISOString(),
        };
      } else {
        updatedHistory = [
          {
            id: Date.now(),
            mongoId: currentLesson?._id || null,
            topic: cleanTopic,
            name: cleanTopic,
            lesson: currentLesson,
            progress: 50,
            quizScore: null,
            status: "In Progress",
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
          },
          ...oldHistory,
        ];
      }

      localStorage.setItem(
        keys.historyKey,
        JSON.stringify(updatedHistory)
      );
    } catch (err) {
      console.error("History Save Error:", err);
    }
  };

  const startVoiceTyping = () => {
    setVoiceError("");

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError(
        "Voice typing is not supported in this browser. Please try Google Chrome."
      );
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.onend = null;

      try {
        recognitionRef.current.stop();
      } catch {
        // Previous recognition may already be stopped.
      }
    }

    const recognition = new SpeechRecognition();

    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceError("");
    };

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        const recognized =
          event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalText += recognized;
        } else {
          interimText += recognized;
        }
      }

      const recognizedText = finalText || interimText;

      if (recognizedText) {
        setTopic((previous) => {
          const base = previous.trim();

          return base
            ? `${base} ${recognizedText}`
            : recognizedText;
        });
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed") {
        setVoiceError(
          "Microphone permission denied. Allow microphone access in your browser settings."
        );
      } else if (
        event.error !== "no-speech" &&
        event.error !== "aborted"
      ) {
        setVoiceError(`Voice typing error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setIsListening(false);
      setVoiceError(
        "Unable to start the microphone. Please try again."
      );
    }
  };

  const stopVoiceTyping = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Recognition may already be stopped.
      }
    }

    setIsListening(false);
  };

  const stopLessonSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    speechUtteranceRef.current = null;
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const learnTopic = async (event) => {
    event.preventDefault();

    if (!topic.trim()) {
      setError("Please enter or speak a topic first.");
      return;
    }

    if (isListening) {
      stopVoiceTyping();
    }

    setLoading(true);
    setError("");
    setLesson(null);
    stopLessonSpeech();

    try {
      const { response, data } = await generateLesson({
        topic: topic.trim(),
        language,
      });

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to generate lesson."
        );
      }

      setLesson(data);
      recordLearningActivity(savedUser);
      saveLearningHistory(topic, data);
    } catch (err) {
      console.error("Learning Error:", err);

      setError(
        err.message || "Unable to connect to the AI backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const getLessonText = () => {
    if (!lesson) return "";

    const parts = [
      lesson.title || topic,
      lesson.explanation,
      lesson.howItWorks,
      lesson.example,
      ...(Array.isArray(lesson.importantPoints)
        ? lesson.importantPoints
        : []),
      lesson.summary,
    ];

    return parts
      .filter(
        (part) =>
          typeof part === "string" && part.trim()
      )
      .join(". ");
  };

  // SPEECH: Read the lesson in the selected language.
  const speakLesson = () => {
    if (!("speechSynthesis" in window)) {
      setVoiceError(
        "Audio is not supported in this browser. Please use Google Chrome."
      );
      return;
    }

    const text = getLessonText();

    if (!text.trim()) {
      setVoiceError("No lesson text available to read.");
      return;
    }

    const synth = window.speechSynthesis;

    const settings = {
      "en-US": {
        name: "English",
        prefix: "en",
        rate: 0.9,
      },
      "te-IN": {
        name: "Telugu",
        prefix: "te",
        rate: 0.85,
      },
      "hi-IN": {
        name: "Hindi",
        prefix: "hi",
        rate: 0.85,
      },
    };

    const selected = settings[language];

    if (!selected) {
      setVoiceError("Please select a supported language.");
      return;
    }

    // Cancel old audio before starting new audio.
    synth.cancel();

    speechUtteranceRef.current = null;
    setVoiceError("");
    setIsSpeaking(false);
    setIsPaused(false);

    let started = false;
    let finished = false;
    let voicesChangedHandler = null;
    let voiceWaitTimer = null;
    let utterance = null;

    const cleanup = () => {
      if (voicesChangedHandler) {
        synth.removeEventListener(
          "voiceschanged",
          voicesChangedHandler
        );
        voicesChangedHandler = null;
      }

      if (voiceWaitTimer) {
        window.clearTimeout(voiceWaitTimer);
        voiceWaitTimer = null;
      }
    };

    const playLesson = () => {
      if (started || finished) return;

      const voices = synth.getVoices();

      // Prefer a voice matching the selected language.
      const matchingVoice =
        voices.find(
          (voice) =>
            voice.lang.toLowerCase() ===
            language.toLowerCase()
        ) ||
        voices.find((voice) =>
          voice.lang
            .toLowerCase()
            .startsWith(selected.prefix + "-")
        );

      utterance = new SpeechSynthesisUtterance(text);

      utterance.lang = language;
      utterance.rate = selected.rate;
      utterance.pitch = 1;

      // If available, use the selected language's voice.
      // Otherwise, let the browser try its default voice.
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      speechUtteranceRef.current = utterance;

      utterance.onstart = () => {
        started = true;
        setIsSpeaking(true);
        setIsPaused(false);
        setVoiceError("");
        cleanup();
      };

      utterance.onend = () => {
        finished = true;

        if (speechUtteranceRef.current === utterance) {
          speechUtteranceRef.current = null;
          setIsSpeaking(false);
          setIsPaused(false);
        }

        cleanup();
      };

      utterance.onerror = (event) => {
        finished = true;

        const isCurrent =
          speechUtteranceRef.current === utterance;

        if (isCurrent) {
          speechUtteranceRef.current = null;
          setIsSpeaking(false);
          setIsPaused(false);
        }

        cleanup();

        // These errors are normal when audio is stopped
        // or replaced by another utterance.
        if (
          event.error === "interrupted" ||
          event.error === "canceled"
        ) {
          return;
        }

        if (isCurrent) {
          setVoiceError(
            `Unable to play ${selected.name} audio. Check your browser or device speech settings.`
          );
        }

        console.error(
          "Speech playback error:",
          event.error
        );
      };

      synth.speak(utterance);
    };

    const availableVoices = synth.getVoices();

    if (availableVoices.length > 0) {
      // Wait briefly after cancel() so the previous audio
      // doesn't interrupt the new utterance.
      window.setTimeout(() => {
        if (!finished) {
          playLesson();
        }
      }, 150);

      return;
    }

    // Some browsers load their voices asynchronously.
    voicesChangedHandler = () => {
      if (synth.getVoices().length > 0 && !started && !finished) {
        cleanup();
        playLesson();
      }
    };

    synth.addEventListener(
      "voiceschanged",
      voicesChangedHandler
    );

    voiceWaitTimer = window.setTimeout(() => {
      if (started || finished) return;

      cleanup();

      if (synth.getVoices().length > 0) {
        playLesson();
      } else {
        finished = true;

        setIsSpeaking(false);
        setIsPaused(false);

        setVoiceError(
          `No speech voices are available for ${selected.name}. Check your browser or device speech settings.`
        );
      }
    }, 3000);
  };

  const pauseLessonSpeech = () => {
    if (!("speechSynthesis" in window)) return;

    const synth = window.speechSynthesis;

    if (synth.paused) {
      synth.resume();
      setIsPaused(false);
    } else if (synth.speaking) {
      synth.pause();
      setIsPaused(true);
    }
  };

  const startQuiz = () => {
    if (!lesson) {
      setError("Please generate the lesson first.");
      return;
    }

    navigate("/quiz", {
      state: {
        topic: topic.trim(),
        lesson,
        language,
      },
    });
  };

  return (
    <div className="dashboard">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-box">L</div>

          <div>
            <h2>LearnSphere</h2>
            <p>AI Learning</p>
          </div>
        </div>

        <div className="profile">
          <img src={userAvatar} alt="Profile" />
          <h3>{userName}</h3>
          <p>Student</p>
        </div>

        <nav className="sidebar-nav">
          <div
            className="nav active"
            onClick={() => navigate("/dashboard")}
          >
            <span>🏠</span>
            <span>Dashboard</span>
          </div>

          <div
            className="nav"
            onClick={() => navigate("/progress")}
          >
            <span>📈</span>
            <span>Progress</span>
          </div>

          <div
            className="nav"
            onClick={() => navigate("/my-learning")}
          >
            <span>📚</span>
            <span>My Learning</span>
          </div>

          <div
            className="nav"
            onClick={() => navigate("/achievements")}
          >
            <span>🏆</span>
            <span>Achievements</span>
          </div>

          <div
            className="nav"
            onClick={() => navigate("/WordScramble")}
          >
            <span>🎮</span>
            <span>Word Scramble</span>
          </div>

          <div
            className="nav"
            onClick={() => navigate("/FormulaBuilder")}
          >
            <span>🎮</span>
            <span>Formula Builder</span>
          </div>

          <div
            className="nav"
            onClick={() => navigate("/learning-rewards")}
          >
            <span>🎡</span>
            <span>Learning Rewards</span>
          </div>

          <Logout />
        </nav>

        <div className="sidebar-footer">
          <span>✨</span>
          <p>Keep learning. Keep growing.</p>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main">
        <section className="page-header">
          <div>
            <p className="welcome-small">
              PERSONAL LEARNING SPACE
            </p>

            <h1>
              Welcome, <span>{userName}</span>
            </h1>

            <p className="header-subtitle">
              Your next discovery starts here.
            </p>
          </div>

          <div className="header-avatar">
            <img src={userAvatar} alt="Your avatar" />
          </div>
        </section>

        {/* HERO */}
        <section className="hero">
          <div className="hero-orb hero-orb-one" />
          <div className="hero-orb hero-orb-two" />

          <div className="hero-content">
            <p className="hero-label">
              ✦ YOUR PERSONAL AI TUTOR
            </p>

            <h2>
              What do you want
              <br />
              <span>to learn today?</span>
            </h2>

            <p className="hero-text">
              Discover new topics, understand concepts, and learn at
              your own pace with your personal AI tutor.
            </p>

            <div className="hero-benefits">
              <span>✦ Easy explanations</span>
              <span>✦ Practical examples</span>
              <span>✦ Interactive quizzes</span>
            </div>
          </div>

          <div className="hero-decoration" aria-hidden="true">
            ✧
          </div>
        </section>

        {/* LANGUAGE AND TOPIC FORM */}
        <section className="learning-input-panel">
          <div className="input-panel-heading">
            <div className="input-panel-icon">✦</div>

            <div>
              <h2>Start a new lesson</h2>
              <p>
                Type your topic or tell your AI tutor what to teach you.
              </p>
            </div>
          </div>

          <label
            className="language-label"
            htmlFor="lesson-language"
          >
            🌐 Learning language
          </label>

          <select
            id="lesson-language"
            className="language-select"
            value={language}
            onChange={(event) => {
              setLanguage(event.target.value);
              setVoiceError("");
            }}
          >
            {languages.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <form className="topic-form" onSubmit={learnTopic}>
            <input
              type="text"
              placeholder="Enter a topic..."
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              aria-label="Topic you want to learn"
            />

            <button
              type="button"
              className={`mic-button ${
                isListening ? "mic-active" : ""
              }`}
              onClick={
                isListening ? stopVoiceTyping : startVoiceTyping
              }
              aria-label={
                isListening
                  ? "Stop voice typing"
                  : "Start voice typing"
              }
            >
              {isListening ? "⏹ Stop" : "🎙️ Speak"}
            </button>

            <button
              type="submit"
              className="generate-button"
              disabled={loading}
            >
              {loading ? "Generating..." : "✨ Generate Lesson"}
            </button>
          </form>

          <p className="voice-hint">
            {isListening
              ? "🔴 Listening... Speak now. Your words will appear in the topic field."
              : "🎙️ Tap Speak, say your topic, then edit the text or generate your lesson."}
          </p>

          {voiceError && (
            <div className="voice-error" role="status">
              {voiceError}
            </div>
          )}
        </section>

        {error && (
          <div className="error-box" role="alert">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <section className="loading-box">
            <div className="loader" />
            <h3>Your AI tutor is preparing your lesson...</h3>
            <p>
              Creating a lesson about <strong>{topic}</strong>
            </p>
          </section>
        )}

        {/* GENERATED LESSON */}
        {lesson && !loading && (
          <section className="lesson-section">
            <div className="lesson-top">
              <div>
                <p className="lesson-label">
                  ✦ YOUR PERSONALIZED LESSON
                </p>

                <h2>{lesson.title || topic}</h2>

                <p className="lesson-subtitle">
                  Learn the concept step by step.
                </p>
              </div>

              <span className="ai-badge">✦ AI GENERATED</span>
            </div>

            {/* SPEECH CONTROLS */}
            <div className="speech-toolbar">
              <div className="speech-toolbar-info">
                <span className="speech-icon">🔊</span>

                <div>
                  <strong>Listen to your lesson</strong>
                  <p>Listen, pause, resume, or stop the audio.</p>
                </div>
              </div>

              <div className="speech-actions">
                {!isSpeaking ? (
                  <button
                    type="button"
                    className="listen-button"
                    onClick={speakLesson}
                  >
                    ▶ Listen
                  </button>
                ) : (
                  <button
                    type="button"
                    className="listen-button"
                    onClick={pauseLessonSpeech}
                  >
                    {isPaused ? "▶ Resume" : "⏸ Pause"}
                  </button>
                )}

                <button
                  type="button"
                  className="stop-audio-button"
                  onClick={stopLessonSpeech}
                  disabled={!isSpeaking}
                >
                  ■ Stop
                </button>
              </div>
            </div>

            {lesson.explanation && (
              <article className="lesson-card lesson-card-purple">
                <div className="lesson-card-icon">📖</div>

                <div>
                  <span className="lesson-card-eyebrow">
                    UNDERSTAND
                  </span>
                  <h3>Explanation</h3>
                  <p>{lesson.explanation}</p>
                </div>
              </article>
            )}

            {lesson.howItWorks && (
              <article className="lesson-card lesson-card-blue">
                <div className="lesson-card-icon">⚙️</div>

                <div>
                  <span className="lesson-card-eyebrow">
                    STEP BY STEP
                  </span>
                  <h3>How it works</h3>
                  <p>{lesson.howItWorks}</p>
                </div>
              </article>
            )}

            {lesson.example && (
              <article className="lesson-card lesson-card-orange">
                <div className="lesson-card-icon">💡</div>

                <div>
                  <span className="lesson-card-eyebrow">
                    APPLY IT
                  </span>
                  <h3>Real-world example</h3>
                  <p>{lesson.example}</p>
                </div>
              </article>
            )}

            {Array.isArray(lesson.importantPoints) &&
              lesson.importantPoints.length > 0 && (
                <article className="lesson-card lesson-card-green">
                  <div className="lesson-card-icon">✓</div>

                  <div>
                    <span className="lesson-card-eyebrow">
                      REMEMBER THESE
                    </span>
                    <h3>Important points</h3>

                    <ul className="important-points-list">
                      {lesson.importantPoints.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              )}

            {lesson.summary && (
              <article className="lesson-card lesson-card-pink">
                <div className="lesson-card-icon">⭐</div>

                <div>
                  <span className="lesson-card-eyebrow">
                    KEY TAKEAWAY
                  </span>
                  <h3>Lesson summary</h3>
                  <p>{lesson.summary}</p>
                </div>
              </article>
            )}

            {/* QUIZ */}
            <div className="quiz-box">
              <div className="quiz-box-icon">🎯</div>

              <div className="quiz-box-content">
                <p className="quiz-label">
                  YOUR NEXT CHALLENGE
                </p>

                <h2>Ready to test yourself?</h2>

                <p>
                  Check your understanding of <strong>{topic}</strong>{" "}
                  with an interactive quiz.
                </p>
              </div>

              <button
                type="button"
                className="quiz-button"
                onClick={startQuiz}
              >
                Start Quiz →
              </button>
            </div>
          </section>
        )}

        {!lesson && !loading && (
          <section className="empty-lesson">
            <div className="empty-lesson-icon">✧</div>
            <h3>Your next learning adventure awaits</h3>
            <p>
              Choose a language, enter a topic or use your microphone,
              and generate your first lesson.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}