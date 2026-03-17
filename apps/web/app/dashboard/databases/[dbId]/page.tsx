"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/lib/api-client";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Loader2 } from "lucide-react";
import Ttile from "@/components/ttile";
import { format, subDays, subHours } from "date-fns";
// @ts-expect-error: No types for chartjs-plugin-crosshair
import CrosshairPlugin from "chartjs-plugin-crosshair";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  CrosshairPlugin
);

const statCards = [
  { key: "CREATE", label: "Create", color: "#10b981", dot: "bg-emerald-500" },
  { key: "READ", label: "Read", color: "#3b82f6", dot: "bg-blue-500" },
  { key: "UPDATE", label: "Update", color: "#f59e0b", dot: "bg-amber-500" },
  { key: "DELETE", label: "Delete", color: "#ef4444", dot: "bg-red-500" },
];

export default function DatabasePage() {
  const { dbId } = useParams();
  const [timeFrame, setTimeFrame] = useState("24h");

  const {
    data: dbMeta,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["database-meta", dbId],
    queryFn: () => apiClient.database.getMetaById(dbId as string),
    enabled: !!dbId,
  });

  const {
    data: analytics,
    isLoading: isLoadingAnalytics,
    isError: isErrorAnalytics,
    error: analyticsError,
  } = useQuery({
    queryKey: ["database-analytics", dbId, timeFrame],
    queryFn: () => apiClient.database.getAnalytics(dbId as string, timeFrame),
    enabled: !!dbId,
  });

  if (isLoading || isLoadingAnalytics)
    return (
      <>
        <Ttile>Loading Database - NotDatabase</Ttile>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        </div>
      </>
    );

  if (isError || isErrorAnalytics)
    return (
      <>
        <Ttile>Error - NotDatabase</Ttile>
        <div className="p-8">
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-sm text-red-400">
              {((error || analyticsError) as Error).message}
            </p>
          </div>
        </div>
      </>
    );

  const generateTimeBuckets = () => {
    const now = new Date();
    if (timeFrame === "24h") {
      return Array.from({ length: 24 }, (_, i) => {
        const d = subHours(now, 23 - i);
        return format(d, "yyyy-MM-dd HH:00");
      });
    } else if (timeFrame === "3d") {
      return Array.from({ length: 3 }, (_, i) => {
        const d = subDays(now, 2 - i);
        return format(d, "yyyy-MM-dd");
      });
    } else if (timeFrame === "7d") {
      return Array.from({ length: 7 }, (_, i) => {
        const d = subDays(now, 6 - i);
        return format(d, "yyyy-MM-dd");
      });
    }
    return [];
  };

  const timeBuckets = generateTimeBuckets();
  const timeseriesMap = (analytics?.timeseries || []).reduce(
    (acc: any, entry: any) => {
      const key =
        timeFrame === "24h"
          ? format(new Date(entry.time), "yyyy-MM-dd HH:00")
          : format(new Date(entry.time), "yyyy-MM-dd");
      acc[key] = entry;
      return acc;
    },
    {}
  );

  const filledTimeseries = timeBuckets.map((bucket) => {
    const entry = timeseriesMap[bucket];
    return {
      time: bucket,
      CREATE: entry?.CREATE || 0,
      READ: entry?.READ || 0,
      UPDATE: entry?.UPDATE || 0,
      DELETE: entry?.DELETE || 0,
    };
  });

  const chartLabels = filledTimeseries.map((d: any) =>
    timeFrame === "24h"
      ? format(new Date(d.time), "HH:00")
      : format(new Date(d.time), "MMM d")
  );

  const mainChartData = {
    labels: chartLabels,
    datasets: statCards.map((s) => ({
      label: s.label,
      data: filledTimeseries.map((d: any) => d[s.key]),
      borderColor: s.color,
      backgroundColor: s.color + "18",
      fill: true,
      tension: 0.4,
      borderWidth: 1.5,
      pointRadius: 0,
      pointHoverRadius: 4,
    })),
  };

  const mainChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      crosshair: {
        line: { color: "rgba(255,255,255,0.1)", width: 1, dashPattern: [4, 4] },
        sync: { enabled: false },
        zoom: { enabled: false },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#4b5563", font: { size: 11 } },
        border: { display: false },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.04)", drawBorder: false },
        ticks: { color: "#4b5563", font: { size: 11 }, maxTicksLimit: 5 },
        border: { display: false },
      },
    },
    interaction: { mode: "index" as const, intersect: false },
  };

  const miniChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: {
      x: { display: false },
      y: { display: false },
    },
    elements: {
      point: { radius: 0 },
      line: { borderWidth: 1.5, tension: 0.4 },
    },
  };

  return (
    <>
      <Ttile>{dbMeta?.name || "Database"} - NotDatabase</Ttile>
      <div className="p-6 lg:p-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold tracking-tight">{dbMeta.name}</h1>
          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger className="w-28 border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-sm h-9 rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 hours</SelectItem>
              <SelectItem value="3d">3 days</SelectItem>
              <SelectItem value="7d">7 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 col-span-2 lg:col-span-1">
            <p className="text-xs text-gray-500 mb-1">Total events</p>
            <p className="text-2xl font-bold text-white tabular-nums">
              {(analytics?.total || 0).toLocaleString()}
            </p>
          </div>
          {statCards.map((s) => (
            <div
              key={s.key}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-white tabular-nums">
                  {(
                    analytics?.byAction?.[s.key] || 0
                  ).toLocaleString()}
                </p>
                <div className="w-16 h-8">
                  <Line
                    options={miniChartOptions}
                    data={{
                      labels: chartLabels,
                      datasets: [
                        {
                          data: filledTimeseries.map((d: any) => d[s.key]),
                          borderColor: s.color,
                          backgroundColor: "transparent",
                          fill: false,
                        },
                      ],
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-medium text-white">Activity</h2>
            <div className="flex items-center gap-4">
              {statCards.map((s) => (
                <div key={s.key} className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-xs text-gray-500">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-72">
            {analytics?.timeseries && analytics.timeseries.length > 0 ? (
              <Line options={mainChartOptions} data={mainChartData} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-gray-600">No events yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
