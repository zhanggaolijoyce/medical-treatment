const TOKEN_KEY = "doctor_token";
const DOCTOR_ID_KEY = "doctor_id";

export function setAuth({ token, doctorId }) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
  if (doctorId) {
    localStorage.setItem(DOCTOR_ID_KEY, String(doctorId));
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getDoctorId() {
  return localStorage.getItem(DOCTOR_ID_KEY);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(DOCTOR_ID_KEY);
}
