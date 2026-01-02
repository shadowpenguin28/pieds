import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
                        refresh: refreshToken,
                    });

                    const { access } = response.data;
                    localStorage.setItem('access_token', access);
                    originalRequest.headers.Authorization = `Bearer ${access}`;

                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh failed, clear tokens
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/login';
                }
            }
        }

        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    login: (email, password) => api.post('/auth/login/', { email, password }),
    registerPatient: (data) => api.post('/auth/register/patient/', data),
    registerDoctor: (data) => api.post('/auth/register/doctor/', data),
    registerProvider: (data) => api.post('/auth/register/provider/', data),
    refreshToken: (refresh) => api.post('/auth/token/refresh/', { refresh }),
};

// Wallet APIs
export const walletAPI = {
    getBalance: () => api.get('/wallet/'),
    topUp: (amount) => api.post('/wallet/topup/', { amount }),
    getTransactions: () => api.get('/wallet/transactions/'),
    payForAppointment: (appointmentId) => api.post(`/wallet/appointments/${appointmentId}/pay/`),
    refundAppointment: (appointmentId) => api.post(`/wallet/appointments/${appointmentId}/refund/`),
};

// Appointment APIs
export const appointmentAPI = {
    list: () => api.get('/appointments/'),
    create: (data) => api.post('/appointments/', data),
    get: (id) => api.get(`/appointments/${id}/`),
    start: (id) => api.post(`/appointments/${id}/start/`),
    complete: (id) => api.post(`/appointments/${id}/complete/`),
    cancel: (id) => api.post(`/appointments/${id}/cancel/`),
    getQueue: (doctorId) => api.get(`/appointments/queue/doctor/${doctorId}/`),
    getWaitTime: (id) => api.get(`/appointments/${id}/wait-time/`),
};

// Journey APIs
export const journeyAPI = {
    list: () => api.get('/journeys/'),
    get: (id) => api.get(`/journeys/${id}/`),
    create: (data) => api.post('/journeys/', data),
    createStep: (data) => api.post('/journeys/steps/', data),
    requestAccess: (patientAbhaId, purpose) => api.post('/journeys/request-access/', { patient_abha_id: patientAbhaId, purpose }),
    getConsents: () => api.get('/journeys/my-consents/'),
    respondConsent: (consentId, status) => api.post(`/journeys/consent/${consentId}/respond/`, { status }),
    getByAbha: (abhaId) => api.get(`/journeys/by-abha/${abhaId}/`),
};

// QR APIs
export const qrAPI = {
    getQRData: () => api.get('/auth/patients/me/qr-data/'),
    getQRImage: () => api.get('/auth/patients/me/qr-code/', { responseType: 'blob' }),
    scanQR: (qrData) => api.post('/auth/patients/qr-scan/', { qr_data: qrData }),
};

// Doctor APIs
export const doctorAPI = {
    list: () => api.get('/auth/doctors/'),
};

// Report APIs
export const reportAPI = {
    upload: (stepId, file, data = null) => {
        const formData = new FormData();
        formData.append('file', file);
        if (data) formData.append('data', JSON.stringify(data));
        return api.post(`/journeys/steps/${stepId}/report/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    download: (stepId) => api.get(`/journeys/steps/${stepId}/report/download/`),
};

// Profile APIs
export const profileAPI = {
    get: () => api.get('/auth/profile/'),
    update: (data) => api.patch('/auth/profile/', data),
    changePassword: (currentPassword, newPassword) =>
        api.post('/auth/profile/change-password/', { current_password: currentPassword, new_password: newPassword }),
};

// Organization APIs (for providers)
export const organizationAPI = {
    getDoctors: () => api.get('/auth/organization/doctors/'),
    addDoctor: (data) => api.post('/auth/organization/doctors/', data),
    removeDoctor: (doctorId) => api.delete('/auth/organization/doctors/', { data: { doctor_id: doctorId } }),
};

export default api;
