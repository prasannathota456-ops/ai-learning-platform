
const API_BASE_URL =
  "https://ai-learning-platform-1-2vma.onrender.com/api";

async function request(path, { method = "POST", body } = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers:
        body !== undefined
          ? { "Content-Type": "application/json" }
          : {},
      ...(body !== undefined
        ? { body: JSON.stringify(body) }
        : {}),
    });
  } catch (error) {
    console.error("API connection error:", error);

    throw new Error(
      "Unable to reach the server. Please check your internet connection and try again.",
      { cause: error }
    );
  }

  let data;

  try {
    data = await response.json();
  } catch {
    data = {
      success: false,
      message: `The server returned an invalid response (HTTP ${response.status}).`,
    };
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        `Request failed (HTTP ${response.status}).`
    );
  }

  return { response, data };
}

// Register
export const registerUser = (user) =>
  request("/auth/register", { body: user });

// Login
export const loginUser = (credentials) =>
  request("/auth/login", { body: credentials });

// Reset password
export const resetPassword = (passwordDetails) =>
  request("/auth/reset-password", { body: passwordDetails });

// Generate lesson
export const generateLesson = (lessonRequest) =>
  request("/learn", { body: lessonRequest });

// Generate quiz
export const generateQuiz = (quizRequest) =>
  request("/quiz", { body: quizRequest });

// Get lessons
export const getLessons = () =>
  request("/lessons", { method: "GET" });

// Delete lesson
export const deleteLesson = (lessonId) =>
  request(`/lessons/${encodeURIComponent(lessonId)}`, {
    method: "DELETE",
  });
