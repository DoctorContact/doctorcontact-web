import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, 
});

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

// ONE shared refresh for the whole app (stops parallel refresh calls from killing each other's token)
let refreshPromise: Promise<string | null> | null = null;

export function refreshSession(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const localRefreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
      { refreshToken: localRefreshToken },
      { withCredentials: true }
    );
    const newAccess = res.data?.data?.accessToken ?? null;
    const newRefresh = res.data?.data?.refreshToken;
    if (newAccess) setAccessToken(newAccess);
    if (newRefresh && typeof window !== "undefined") localStorage.setItem("refreshToken", newRefresh);
    return newAccess;
  })().finally(() => { refreshPromise = null; });
  return refreshPromise;
}

// Request Interceptor
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = "Bearer " + accessToken;
  }
  return config;
});

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/login")
    ) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshSession();
        if (newAccessToken) {
          originalRequest.headers.Authorization = "Bearer " + newAccessToken;
          return api(originalRequest);
        }
      } catch (refreshError: any) {
        const st = refreshError?.response?.status;
        // Logout ONLY when the server says the session is really invalid.
        // Network error / server sleeping (502/503/timeout) must NOT log the user out.
        if (st === 401 || st === 403) return handleLogoutAndRedirect(refreshError);
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 401 && originalRequest.url?.includes("/auth/refresh")) {
         return handleLogoutAndRedirect(error);
    }

    return Promise.reject(error);
  }
);


function handleLogoutAndRedirect(error: any) {
    setAccessToken(null);
    if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        
        const currentPath = window.location.pathname;
        const isPublicRoute = 
          currentPath === "/" ||
          currentPath.match(/^\/(en|bn|hi)\/?$/) ||
          currentPath.includes("/login") || 
          currentPath.includes("/register") || 
          currentPath.includes("/announcements") || 
          currentPath.includes("/doctors") || 
          currentPath.includes("/privacy") || 
          currentPath.includes("/clinics")  ||
          currentPath.includes("/labs")  ||
          currentPath.includes("/ambulances")  || //terms
          currentPath.includes("/terms")  ||
          currentPath.includes("/account-deletion");

        if (!isPublicRoute) {
          window.location.href = "/login";
        }
    }
    return Promise.reject(error);
}

// === User / Profile API Calls (Universal Photo Upload) ===
export const uploadProfilePhoto = async (file: File) => {
  const formData = new FormData();
  formData.append("photo", file); 

  const response = await api.post('/users/me/photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// === Location API Calls ===
export const addSearchLocation = async (locationData: { nameEn: string; nameBn: string; nameHi: string; isActive?: boolean }) => {
  const response = await api.post('/locations', locationData);
  return response.data;
};

export const fetchSearchLocations = async () => {
  try {
    const response = await api.get('/locations');
    return response.data?.data || []; 
  } catch (error) {
    console.error("Failed to fetch locations from API:", error);
    return [];
  }
};

export const fetchAdminLocations = async () => {
  const response = await api.get('/locations/admin');
  return response.data?.data || [];
};

export const toggleSearchLocation = async (id: string, isActive: boolean) => {
  const response = await api.patch(`/locations/${id}/toggle`, { isActive });
  return response.data;
};

export const deleteSearchLocation = async (id: string) => {
  const response = await api.delete(`/locations/${id}`);
  return response.data;
};

// === Admin / Super Admin API Calls ===
export const setFeaturedDoctor = async (
  doctorId: string, 
  isFeatured: boolean, 
  featuredOrder: number = 0
) => {
  const response = await api.patch(`/admin/doctors/${doctorId}/featured`, {
    isFeatured,
    featuredOrder,
  });
  return response.data;
};

export const fetchFeaturedDoctors = async () => {
  const response = await api.get('/admin/doctors/featured');
  return response.data?.data?.doctors || [];
};

export const fetchAllDoctors = async () => {
  try {
    const response = await api.get('/doctors');
    return response.data?.data || [];
  } catch (error) {
    console.error("Failed to fetch all doctors:", error);
    return [];
  }
};

export const fetchLiveDoctors = async () => {
  try {
    const response = await api.get('/doctors/live');
    return response.data?.data || [];
  } catch (error) {
    console.error("Failed to fetch live doctors:", error);
    return [];
  }
};
export const fetchLiveDoctorsCount = async (): Promise<number> => {
  try {
    const response = await api.get('/doctors/live/count');
    return response.data?.data?.count ?? 0;
  } catch (error) {
    console.error("Failed to fetch live doctor count:", error);
    return 0;
  }
};

export const fetchAvailableDoctors = async () => {
  try {
    const response = await api.get('/doctors/available');
    return response.data?.data || [];
  } catch (error) {
    console.error("Failed to fetch available doctors:", error);
    return [];
  }
};

// --- Announcements (Public / Global) ---
export const fetchAnnouncements = async () => {
  try {
    const response = await api.get('/announcements/global');
    const data = response.data?.data?.announcements || response.data?.data || [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return []; 
  }
};



// --- Admin Announcements Management ---
export const fetchAdminAnnouncements = async () => {
  try {
    const response = await api.get('/announcements/admin');
    const data = response.data?.data?.announcements || response.data?.data || [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Failed to fetch admin announcements:", error);
    return [];
  }
};

export const updateAnnouncement = async (id: string, updateData: { title?: string; message?: string; type?: string, isActive?: boolean }) => {
  const response = await api.patch(`/announcements/admin/${id}`, updateData);
  return response.data;
};

export const deleteAnnouncement = async (id: string) => {
  const response = await api.delete(`/announcements/${id}`);
  return response.data;
};

export const deactivateAnnouncement = async (id: string) => {
  const response = await api.patch(`/announcements/${id}/deactivate`);
  return response.data;
};

// --- Notifications ---
export const fetchMyNotifications = async () => {
  try {
    const response = await api.get('/notifications/me');
    const notifs = response.data?.data?.notifications || response.data?.data || [];
    return Array.isArray(notifs) ? notifs : [];
  } catch (error) {
    return []; 
  }
};

// === Admin OTP Balance API ===
export const fetchOtpBalance = async () => {
  try {
    const response = await api.get('/admin/otp-balance');
    return response.data; 
  } catch (error) {
    console.error("Failed to fetch OTP balance:", error);
    throw error;
  }
};