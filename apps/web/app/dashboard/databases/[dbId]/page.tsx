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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Activity, Plus, Eye, Edit, Trash2, Loader2 } from "lucide-react";
import Ttile from "@/components/ttile";

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

  return (
    <>
      <Ttile>{dbMeta?.name || "Database"} - NotDatabase</Ttile>
      <div className="p-8">
        <h1 className="text-2xl font-semibold mb-6">{dbMeta.name}</h1>

        {/* Analytics Section */}
        <div className="mb-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
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
          </div>

          {/* Timeseries Chart */}
          {analytics?.timeseries && analytics.timeseries.length > 0 && (
            <Card className="border-gray-100/20 bg-transparent">
              <CardHeader>
                <CardTitle className="text-lg font-medium">
                  Event Activity Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-80">
                  <LineChart data={analytics.timeseries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="time"
                      tickFormatter={formatTimeLabel}
                      stroke="#9ca3af"
                      fontSize={12}
                    />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <ChartTooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-white">
                              <div className="font-medium mb-2">
                                {formatTimeLabel(label)}
                              </div>
                              {payload.map((entry: any, index: number) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  <span className="text-gray-300">
                                    {entry.name}:
                                  </span>
                                  <span className="font-medium">
                                    {entry.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="CREATE"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="READ"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="UPDATE"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="DELETE"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
