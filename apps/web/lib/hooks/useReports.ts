import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type Period = "daily" | "weekly" | "monthly" | "yearly" | "custom";

export type PeriodReport = {
  clinicName: string;
  date?: string;
  month?: string;
  year?: string | number;
  weekStart?: string;
  weekEnd?: string;
  startDate?: string;
  endDate?: string;
  totalAppointments: number;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
  byDoctor: Record<string, { totalAppointments: number; completed: number; revenue: number }>;
  estimatedRevenue: number;
};

type PeriodParams = {
  period: Period;
  date?: string;
  month?: string;
  year?: string;
  startDate?: string;
  endDate?: string;
};

export function usePeriodReport() {
  return useMutation({
    mutationFn: async ({ period, ...query }: PeriodParams) => {
      const { data } = await api.get("/reports/" + period, {
        params: { ...query, format: "json" },
      });
      return data.data.report as PeriodReport;
    },
  });
}

export function useDownloadReport() {
  return useMutation({
    // 🟢 Fix: Added `filename` to the expected parameters
    mutationFn: async ({
      period,
      format,
      filename,
      ...query
    }: PeriodParams & { format: "pdf" | "excel"; filename?: string }) => {
      const res = await api.get("/reports/" + period, {
        params: { ...query, format },
        responseType: "blob",
      });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      
      // 🟢 Fix: Use the dynamic filename if provided, otherwise fallback to default
      a.download = filename || ("report." + (format === "pdf" ? "pdf" : "xlsx"));
      
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    },
  });
}

export type DailyDashboard = {
  clinicName: string;
  date: string;
  totalPatients: number;
  totalAppointments: number;
  newPatients: number;
  returningPatients: number;
  statusBreakdown: Record<string, number>;
  doctorWise: Record<string, { totalAppointments: number; completed: number; waiting: number }>;
  queueSummary: {
    doctorName: string;
    currentToken: number;
    lastTokenIssued: number;
    status: string;
  }[];
};

export function useDailyDashboard(date?: string) {
  return useQuery<DailyDashboard>({
    queryKey: ["clinic", "analytics", "daily", date ?? "today"],
    queryFn: async () =>
      (await api.get("/analytics/daily-dashboard", { params: date ? { date } : {} })).data.data
        .dashboard,
  });
}

export type GrowthTrendPoint = {
  period: string;
  newPatients: number;
  returningPatients: number;
  totalPatients: number;
  totalAppointments: number;
  doctorWise: Record<string, number>;
};

export type GrowthReport = {
  clinicName: string;
  granularity: string;
  startDate: string;
  endDate: string;
  trend: GrowthTrendPoint[];
  summary: {
    currentPeriodPatients: number;
    previousPeriodPatients: number;
    growthRatePercent: number;
  };
};

export function useGrowthReport() {
  return useMutation({
    mutationFn: async (params: {
      granularity: "daily" | "weekly" | "monthly" | "yearly";
      startDate: string;
      endDate: string;
    }) => (await api.get("/analytics/growth", { params })).data.data.analytics as GrowthReport,
  });
}