"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { YearlyStats } from "../../types/publication";

interface TimelineChartProps {
  data: YearlyStats[];
  className?: string;
}

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

export default function TimelineChart({
  data,
  className = "",
}: TimelineChartProps) {
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  const [showTopics, setShowTopics] = useState(false);

  // Get all unique topics from the data
  const allTopics = Array.from(
    new Set(
      data.flatMap((yearData) => yearData.topTopics.map((topic) => topic.topic))
    )
  );

  // Get top 5 topics overall
  const topTopics = allTopics
    .map((topic) => ({
      topic,
      totalCount: data.reduce((sum, yearData) => {
        const topicData = yearData.topTopics.find((t) => t.topic === topic);
        return sum + (topicData ? topicData.count : 0);
      }, 0),
    }))
    .sort((a, b) => b.totalCount - a.totalCount)
    .slice(0, 5)
    .map((t) => t.topic);

  // Generate colors for topics
  const topicColors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#0088fe",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#a4de6c",
    "#d0ed57",
  ];

  const getTopicColor = (topic: string) => {
    const index = topTopics.indexOf(topic);
    return index >= 0 ? topicColors[index % topicColors.length] : "#cccccc";
  };

  // Custom tooltip
  const CustomTooltip = ({ 
    active, 
    payload, 
    label 
  }: { 
    active?: boolean; 
    payload?: TooltipPayload[]; 
    label?: string | number;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 text-sm">
          <p className="font-medium text-white">{`Year: ${label}`}</p>
          {payload.map((entry: TooltipPayload, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h3 className="text-xl font-bold mb-2 sm:mb-0">
          Publications Timeline
        </h3>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-800 rounded-lg overflow-hidden">
            <button
              className={`px-3 py-1 text-sm ${
                chartType === "bar"
                  ? "bg-blue-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setChartType("bar")}
            >
              Bar
            </button>
            <button
              className={`px-3 py-1 text-sm ${
                chartType === "line"
                  ? "bg-blue-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setChartType("line")}
            >
              Line
            </button>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showTopics"
              checked={showTopics}
              onChange={() => setShowTopics(!showTopics)}
              className="mr-2"
            />
            <label htmlFor="showTopics" className="text-sm">
              Show topics
            </label>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "bar" ? (
            <BarChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis
                dataKey="year"
                stroke="#aaa"
                tick={{ fill: "#aaa" }}
                tickLine={{ stroke: "#aaa" }}
              />
              <YAxis
                stroke="#aaa"
                tick={{ fill: "#aaa" }}
                tickLine={{ stroke: "#aaa" }}
                label={{
                  value: "Publications",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#aaa",
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="publicationCount"
                name="Publications"
                fill="#38bdf8"
                radius={[4, 4, 0, 0]}
              />

              {showTopics &&
                topTopics.map((topic, index) => (
                  <Bar
                    key={topic}
                    dataKey={(entry) => {
                        const topicData: { topic: string; count: number } | undefined = entry.topTopics.find(
                        (t: { topic: string; count: number }) => t.topic === topic
                        );
                      return topicData ? topicData.count : 0;
                    }}
                    name={topic}
                    stackId="topics"
                    fill={topicColors[index % topicColors.length]}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
            </BarChart>
          ) : (
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis
                dataKey="year"
                stroke="#aaa"
                tick={{ fill: "#aaa" }}
                tickLine={{ stroke: "#aaa" }}
              />
              <YAxis
                stroke="#aaa"
                tick={{ fill: "#aaa" }}
                tickLine={{ stroke: "#aaa" }}
                label={{
                  value: "Publications",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#aaa",
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="publicationCount"
                name="Publications"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />

              {showTopics &&
                topTopics.map((topic, index) => (
                  <Line
                    key={topic}
                    type="monotone"
                    dataKey={(entry) => {
                        const topicData: { topic: string; count: number } | undefined = entry.topTopics.find(
                        (t: { topic: string; count: number }) => t.topic === topic
                        );
                      return topicData ? topicData.count : 0;
                    }}
                    name={topic}
                    stroke={topicColors[index % topicColors.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-sm text-gray-400">
        <p>
          Publication count by year.{" "}
          {showTopics && "Showing top 5 research topics over time."}
        </p>
      </div>
    </div>
  );
}