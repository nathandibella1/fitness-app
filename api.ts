// lib/api.ts
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function fetchJSON(endpoint: string, method = "GET", body?: any) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}

export type UserProfile = {
  name: string;
  age: number;
  gender: string;
  fitness_goal: string;
  experience_level: string;
  available_days: number;
  equipment: string[];
  diet_type: string;
  allergies: string[];
  meal_pref: string;
  injuries: string[];
  tracking_devices: string[];
};

export type DailyState = {
  week: number;
  day: string;
  last_check_in: {
    mood: string;
    sleep_hours: number;
    soreness: string;
    stress: string;
    workout_completed: string;
  };
  streak: { days: number };
  recent_progress: { weight: string };
};

// Normalise to snake_case keys
function normaliseProfile(p: UserProfile) {
  return {
    name: p.name,
    age: p.age,
    gender: p.gender,
    fitness_goal: p.fitness_goal,
    experience_level: p.experience_level,
    available_days: p.available_days,
    equipment: p.equipment,
    diet_type: p.diet_type,
    allergies: p.allergies,
    meal_pref: p.meal_pref,
    injuries: p.injuries,
    tracking_devices: p.tracking_devices
  };
}

export const api = {
  healthCheck: () => fetchJSON("/health"),
  generateMealPlan: (payload: { user_profile: UserProfile }) =>
    fetchJSON("/api/meal/generate", "POST", { user_profile: normaliseProfile(payload.user_profile) }),
  generateWorkout: (payload: { user_profile: UserProfile; daily_state: DailyState }) =>
    fetchJSON("/api/workout/generate", "POST", {
      user_profile: normaliseProfile(payload.user_profile),
      daily_state: payload.daily_state
    }),
  handlePlateau: (payload: { user_profile: UserProfile; progress_data: any }) =>
    fetchJSON("/api/workout/plateau", "POST", {
      user_profile: normaliseProfile(payload.user_profile),
      progress_data: payload.progress_data
    }),
  chat: (payload: { user_id: string; message: string }) =>
    fetchJSON("/api/chat", "POST", payload)
};
