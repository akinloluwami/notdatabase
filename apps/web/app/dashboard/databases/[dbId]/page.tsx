"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/lib/api-client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Activity, Plus, Eye, Edit, Trash2, Loader2 } from "lucide-react";
import Ttile from "@/components/ttile";
import {
  addDays,
  addHours,
  format,
  subDays,
  subHours,
  isSameDay,
  isSameHour,
} from "date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-400">Loading database...</p>
          </div>
        </div>
      </>
    );
  if (isError || isErrorAnalytics)
    return (
      <>
        <Ttile>Error - NotDatabase</Ttile>
        <div className="p-8 text-red-400">
          {((error || analyticsError) as Error).message}
        </div>
      </>
    );

  const chartConfig = {
    CREATE: {
      label: "CREATE",
      color: "#10b981",
    },
    READ: {
      label: "READ",
      color: "#3b82f6",
    },
    UPDATE: {
      label: "UPDATE",
      color: "#f59e0b",
    },
    DELETE: {
      label: "DELETE",
      color: "#ef4444",
    },
  };

  const formatTimeLabel = (time: string) => {
    if (timeFrame === "24h") {
      return new Date(time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return new Date(time).toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  };

  // Helper to generate time buckets for the selected timeFrame
  const generateTimeBuckets = () => {
    const now = new Date();
    if (timeFrame === "24h") {
      // Last 24 hours, hourly buckets
      return Array.from({ length: 24 }, (_, i) => {
        const d = subHours(now, 23 - i);
        return format(d, "yyyy-MM-dd HH:00");
      });
    } else if (timeFrame === "3d") {
      // Last 3 days, daily buckets
      return Array.from({ length: 3 }, (_, i) => {
        const d = subDays(now, 2 - i);
        return format(d, "yyyy-MM-dd");
      });
    } else if (timeFrame === "7d") {
      // Last 7 days, daily buckets
      return Array.from({ length: 7 }, (_, i) => {
        const d = subDays(now, 6 - i);
        return format(d, "yyyy-MM-dd");
      });
    }
    return [];
  };

  // Map analytics.timeseries to the generated buckets, filling missing with zeroes
  const timeBuckets = generateTimeBuckets();
  const timeseriesMap = (analytics?.timeseries || []).reduce(
    (acc: any, entry: any) => {
      let key;
      if (timeFrame === "24h") {
        key = format(new Date(entry.time), "yyyy-MM-dd HH:00");
      } else {
        key = format(new Date(entry.time), "yyyy-MM-dd");
      }
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

  const chartData = {
    labels: filledTimeseries.map((d: any) => {
      if (timeFrame === "24h") {
        return format(new Date(d.time), "HH:00");
      } else {
        return format(new Date(d.time), "MMM d");
      }
    }),
    datasets: [
      {
        label: "CREATE",
        data: filledTimeseries.map((d: any) => d.CREATE),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: false,
        tension: 0.4,
      },
      {
        label: "READ",
        data: filledTimeseries.map((d: any) => d.READ),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: false,
        tension: 0.4,
      },
      {
        label: "UPDATE",
        data: filledTimeseries.map((d: any) => d.UPDATE),
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        fill: false,
        tension: 0.4,
      },
      {
        label: "DELETE",
        data: filledTimeseries.map((d: any) => d.DELETE),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
        labels: {
          color: "#9ca3af",
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: "#374151",
        },
        ticks: {
          color: "#9ca3af",
        },
      },
      y: {
        grid: {
          color: "#374151",
        },
        ticks: {
          color: "#9ca3af",
        },
      },
    },
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
  };

  return (
    <>
      <Ttile>{dbMeta?.name || "Database"} - NotDatabase</Ttile>
      <div className="p-8 w-full">
        <h1 className="text-2xl font-semibold mb-6">{dbMeta.name}</h1>

        {/* Analytics Section */}
        <div className="mb-8 w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Analytics
            </h2>
            <Select value={timeFrame} onValueChange={setTimeFrame}>
              <SelectTrigger className="w-32 border-gray-100/20 bg-transparent text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="24h">24 Hours</SelectItem>
                <SelectItem value="3d">3 Days</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 w-full">
            {/* Total Events */}
            <Card className="border-gray-100/20 bg-transparent">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Total Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.total || 0}
                </div>
              </CardContent>
            </Card>

            {/* Create Events */}
            <Card className="border-gray-100/20 bg-transparent">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Plus className="h-4 w-4 text-green-400" />
                  CREATE
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.byAction?.CREATE || 0}
                </div>
              </CardContent>
            </Card>

            {/* Read Events */}
            <Card className="border-gray-100/20 bg-transparent">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-400" />
                  READ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.byAction?.READ || 0}
                </div>
              </CardContent>
            </Card>

            {/* Update Events */}
            <Card className="border-gray-100/20 bg-transparent">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Edit className="h-4 w-4 text-yellow-400" />
                  UPDATE
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.byAction?.UPDATE || 0}
                </div>
              </CardContent>
            </Card>

            {/* Delete Events */}
            <Card className="border-gray-100/20 bg-transparent">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-red-400" />
                  DELETE
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.byAction?.DELETE || 0}
                </div>
              </CardContent>
            </Card>

            {/* Timeseries Chart */}
            <Card className="border-gray-100/20 bg-transparent col-span-full">
              <CardHeader>
                <CardTitle className="text-lg font-medium">
                  Event Activity Over Time
                </CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {analytics?.timeseries && analytics.timeseries.length > 0 ? (
                  <Line options={chartOptions} data={chartData} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No database events
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex items-center gap-x-4 rounded-md col-span-full">
              {/* Create Events Card */}
              <Card className="border-gray-100/20 bg-transparent h-64 flex flex-col justify-between w-full">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">
                    Create Events
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center">
                  {filledTimeseries.length > 0 &&
                  filledTimeseries.some((d: any) => d.CREATE > 0) ? (
                    <Line
                      options={{
                        ...chartOptions,
                        plugins: {
                          ...chartOptions.plugins,
                          legend: { display: false },
                        },
                      }}
                      data={{
                        labels: filledTimeseries.map((d: any) => {
                          if (timeFrame === "24h") {
                            return format(new Date(d.time), "HH:00");
                          } else {
                            return format(new Date(d.time), "MMM d");
                          }
                        }),
                        datasets: [
                          {
                            label: "CREATE",
                            data: filledTimeseries.map((d: any) => d.CREATE),
                            borderColor: "#10b981",
                            backgroundColor: "rgba(16, 185, 129, 0.1)",
                            fill: true,
                            tension: 0.4,
                          },
                        ],
                      }}
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      No database events
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Read Events Card */}
              <Card className="border-gray-100/20 bg-transparent h-64 flex flex-col justify-between w-full">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">
                    Read Events
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center">
                  {filledTimeseries.length > 0 &&
                  filledTimeseries.some((d: any) => d.READ > 0) ? (
                    <Line
                      options={{
                        ...chartOptions,
                        plugins: {
                          ...chartOptions.plugins,
                          legend: { display: false },
                        },
                      }}
                      data={{
                        labels: filledTimeseries.map((d: any) => {
                          if (timeFrame === "24h") {
                            return format(new Date(d.time), "HH:00");
                          } else {
                            return format(new Date(d.time), "MMM d");
                          }
                        }),
                        datasets: [
                          {
                            label: "READ",
                            data: filledTimeseries.map((d: any) => d.READ),
                            borderColor: "#3b82f6",
                            backgroundColor: "rgba(59, 130, 246, 0.1)",
                            fill: true,
                            tension: 0.4,
                          },
                        ],
                      }}
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      No database events
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
