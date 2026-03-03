import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ── Portfolio endpoints ─────────────────────────

export const getPortfolioSummary = async () => {
    const response = await apiClient.get('/portfolio/summary');
    return response.data;
};

export const getCBOM = async () => {
    const response = await apiClient.get('/portfolio/cbom');
    return response.data;
};

// ── Scenario simulation ─────────────────────────

export const postScenario = async (crqcYear, migrationStartYear) => {
    const response = await apiClient.post('/portfolio/scenario', {
        crqc_year: crqcYear,
        migration_start_year: migrationStartYear,
    });
    return response.data;
};

// ── Narrative ───────────────────────────────────

export const getNarrative = async (hostname) => {
    const response = await apiClient.get(`/portfolio/narrative/${encodeURIComponent(hostname)}`);
    return response.data;
};

// ── Certificate Transparency logs ───────────────

export const getCertLogs = async (hostname) => {
    const response = await apiClient.get(`/portfolio/cbom/${encodeURIComponent(hostname)}/certlogs`);
    return response.data;
};

export const scanAsset = async (hostname) => {
    const response = await apiClient.get(`/portfolio/scan/${encodeURIComponent(hostname)}`);
    return response.data;
};

// ── Reports ─────────────────────────────────────

export const downloadBoardBrief = async () => {
    const response = await apiClient.get('/reports/board-brief', {
        responseType: 'blob',
    });
    // Trigger browser download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Q-Guardian_Board_Brief.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
