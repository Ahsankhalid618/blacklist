'use client';

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { ResearchGap } from '../../types/publication';

interface ResearchGapsProps {
  data: ResearchGap[];
  className?: string;
  onGapClick?: (gap: ResearchGap) => void;
}

export default function ResearchGaps({ 
  data, 
  className = '',
  onGapClick 
}: ResearchGapsProps) {
  // Group gaps by severity for visualization
  const severityGroups = [
    { name: 'Critical Gaps', range: [0.8, 1.0], color: '#ef4444' },
    { name: 'Significant Gaps', range: [0.6, 0.8], color: '#f97316' },
    { name: 'Moderate Gaps', range: [0.4, 0.6], color: '#eab308' },
    { name: 'Minor Gaps', range: [0.0, 0.4], color: '#22c55e' }
  ];
  
  // Prepare data for visualization
  const chartData = data.map((gap, index) => ({
    x: index % 10, // Position on x-axis (for visual spread)
    y: Math.floor(index / 10), // Position on y-axis (for visual spread)
    z: gap.severity * 100, // Size based on severity
    gap // Original gap data
  }));
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { gap: ResearchGap } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload.gap;
      return (
        <div className="glass-card p-4 max-w-xs">
          <h4 className="font-bold mb-1">{data.topic}</h4>
          <p className="text-sm mb-2">{data.description}</p>
          <div className="mb-2">
            <span className="text-xs text-gray-400">Severity:</span>
            <div className="w-full h-2 bg-gray-700 rounded-full mt-1">
              <div 
                className="h-full rounded-full" 
                style={{ 
                  width: `${data.severity * 100}%`,
                  backgroundColor: getSeverityColor(data.severity)
                }}
              ></div>
            </div>
          </div>
          {data.relatedTopics.length > 0 && (
            <div>
              <span className="text-xs text-gray-400">Related topics:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.relatedTopics.map((topic: string, i: number) => (
                  <span 
                    key={i}
                    className="inline-block px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full text-xs"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
          {onGapClick && (
            <p className="text-xs mt-2 text-blue-300">Click to explore this research gap</p>
          )}
        </div>
      );
    }
    return null;
  };
  
  // Get color based on severity
  const getSeverityColor = (severity: number) => {
    const group = severityGroups.find(
      g => severity >= g.range[0] && severity < g.range[1]
    );
    return group ? group.color : '#22c55e';
  };
  
  // Handle bubble click
  const handleBubbleClick = (data: { gap: ResearchGap }) => {
    if (onGapClick) {
      onGapClick(data.gap);
    }
  };
  
  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">Research Gap Analysis</h3>
        <p className="text-sm text-gray-400">
          Visualization of under-researched areas in space biology. Bubble size represents gap severity.
        </p>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis 
              type="number" 
              dataKey="x" 
              name="Position" 
              tick={false} 
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name="Position" 
              tick={false}
              axisLine={false}
              tickLine={false}
            />
            <ZAxis 
              type="number" 
              dataKey="z" 
              range={[40, 120]} 
              name="Severity" 
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              formatter={(value: string, entry: { color?: string }, index: number) => {
                const group = severityGroups[index];
                return (
                  <span style={{ color: group?.color || '#fff' }}>
                    {group?.name || value}
                  </span>
                );
              }}
              iconType="circle"
            />
            <Scatter 
              name="Research Gaps" 
              data={chartData} 
              onClick={handleBubbleClick}
              cursor="pointer"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getSeverityColor(entry.gap.severity)}
                  opacity={0.8}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-6">
        <h4 className="font-medium mb-2">Top Research Gaps</h4>
        <div className="space-y-3">
          {data.slice(0, 3).map((gap, index) => (
            <div 
              key={index} 
              className="glass-card p-3 hover:bg-white/5 cursor-pointer transition-colors"
              onClick={() => onGapClick && onGapClick(gap)}
            >
              <div className="flex items-center justify-between mb-1">
                <h5 className="font-medium">{gap.topic}</h5>
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: getSeverityColor(gap.severity) }}
                ></div>
              </div>
              <p className="text-sm text-gray-300 line-clamp-2">{gap.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}