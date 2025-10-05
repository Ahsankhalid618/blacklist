"use client";

import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Treemap,
  Sector,
} from "recharts";
import { TopicDistribution as TopicDistributionType } from "../../types/publication";
import { stringToColor } from "../../lib/publicationUtils";

interface TopicDistributionProps {
  data: TopicDistributionType[];
  className?: string;
  onTopicClick?: (topic: string) => void;
}

export default function TopicDistribution({
  data,
  className = "",
  onTopicClick,
}: TopicDistributionProps) {
  const [chartType, setChartType] = useState<"pie" | "treemap">("treemap");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Sort data by count (descending)
  const sortedData = [...data].sort((a, b) => b.count - a.count);

  // Limit to top 20 topics for better visualization
  const topData = sortedData.slice(0, 20);

  // Generate colors for topics
  const getTopicColor = (topic: string) => {
    return stringToColor(topic);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: { active: boolean, payload: any }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-card p-3 text-sm">
          <p className="font-medium text-white">{data.topic}</p>
          <p className="text-blue-300">{`${data.count} publications`}</p>
          <p className="text-gray-300">{`${(
            (data.count /
              sortedData.reduce((sum, item) => sum + item.count, 0)) *
            100
          ).toFixed(1)}% of total`}</p>
        </div>
      );
    }
    return null;
  };

  // Custom active shape for pie chart
  const renderActiveShape = (props: {
    cx: number;
    cy: number;
    innerRadius: number;
    outerRadius: number;
    startAngle: number;
    endAngle: number;
    fill: string;
    payload: any;
    value: number;
  }) => {
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      value,
    } = props;

    return (
      <g>
        <text
          x={cx}
          y={cy}
          dy={-20}
          textAnchor="middle"
          fill="#fff"
          className="text-lg font-medium"
        >
          {payload.topic}
        </text>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#38bdf8">
          {value} publications
        </text>
        <text
          x={cx}
          y={cy}
          dy={25}
          textAnchor="middle"
          fill="#aaa"
          fontSize={12}
        >
          Click to explore
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.8}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 10}
          outerRadius={outerRadius + 15}
          fill={fill}
          opacity={0.3}
        />
      </g>
    );
  };

  // Handle pie sector click
  const handlePieClick = (data: any, index: number) => {
    setActiveIndex(index);
    if (onTopicClick) {
      onTopicClick(data.topic);
    }
  };

  // Custom treemap content
  const CustomTreemapContent = ({
    root,
    depth,
    x,
    y,
    width,
    height,
    index,
    colors,
    name,
    value,
  }: any) => {
    return (
      <g
        onClick={() => onTopicClick && onTopicClick(name)}
        style={{ cursor: "pointer" }}
      >
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: getTopicColor(name),
            stroke: "#fff",
            strokeWidth: 1,
            strokeOpacity: 0.2,
            opacity: 0.8,
          }}
        />
        {width > 50 && height > 30 ? (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2 - 8}
              textAnchor="middle"
              fill="#fff"
              fontSize={12}
              fontWeight={500}
            >
              {name}
            </text>
            <text
              x={x + width / 2}
              y={y + height / 2 + 10}
              textAnchor="middle"
              fill="#fff"
              fontSize={10}
              opacity={0.7}
            >
              {value}
            </text>
          </>
        ) : null}
      </g>
    );
  };

  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h3 className="text-xl font-bold mb-2 sm:mb-0">Topic Distribution</h3>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-800 rounded-lg overflow-hidden">
            <button
              className={`px-3 py-1 text-sm ${
                chartType === "treemap"
                  ? "bg-blue-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setChartType("treemap")}
            >
              Treemap
            </button>
            <button
              className={`px-3 py-1 text-sm ${
                chartType === "pie"
                  ? "bg-blue-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setChartType("pie")}
            >
              Pie
            </button>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "pie" ? (
            <PieChart>
              <Pie
                activeIndex={activeIndex !== null ? activeIndex : undefined}
                activeShape={renderActiveShape}
                data={topData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="count"
                nameKey="topic"
                onClick={handlePieClick}
                isAnimationActive={true}
              >
                {topData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getTopicColor(entry.topic)}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
          ) : (
            <Treemap
              data={topData}
              dataKey="count"
              nameKey="topic"
              aspectRatio={1}
              stroke="#fff"
              isAnimationActive={true}
              content={<CustomTreemapContent />}
            >
              <Tooltip content={<CustomTooltip />} />
            </Treemap>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-sm text-gray-400">
        <p>
          Distribution of research topics across all publications. Showing top{" "}
          {topData.length} topics.
        </p>
        {onTopicClick && (
          <p className="mt-1">
            Click on a topic to explore related publications.
          </p>
        )}
      </div>
    </div>
  );
}
