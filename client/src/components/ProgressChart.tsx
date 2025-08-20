import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

interface Session {
  id: string;
  createdAt: string;
  overallScore?: number;
  speechClarityScore?: number;
  confidenceScore?: number;
  eyeContactScore?: number;
}

interface ProgressChartProps {
  sessions?: Session[];  // make it optional
}

export default function ProgressChart({ sessions = [] }: ProgressChartProps) {
  const chartData = useMemo(() => {
    if (!sessions || sessions.length === 0) {
      return [
        { date: '2024-01-01', overall: 7.2, speech: 7.0, confidence: 6.8, eyeContact: 7.5 },
        { date: '2024-01-08', overall: 7.8, speech: 7.5, confidence: 7.2, eyeContact: 8.0 },
        { date: '2024-01-15', overall: 8.2, speech: 8.0, confidence: 7.8, eyeContact: 8.5 },
        { date: '2024-01-22', overall: 8.5, speech: 8.3, confidence: 8.2, eyeContact: 8.7 },
      ];
    }

    return sessions
      .filter(session => session.overallScore !== undefined)
      .map(session => ({
        date: new Date(session.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        overall: Number((session.overallScore || 0).toFixed(1)),
        speech: Number((session.speechClarityScore || 0).toFixed(1)),
        confidence: Number((session.confidenceScore || 0).toFixed(1)),
        eyeContact: Number((session.eyeContactScore || 0).toFixed(1)),
        fullDate: session.createdAt
      }))
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())
      .slice(-10);
  }, [sessions]);


  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === 'overall' ? 'Overall Score' :
               entry.dataKey === 'speech' ? 'Speech Clarity' :
               entry.dataKey === 'confidence' ? 'Confidence' :
               'Eye Contact'}: {entry.value}/10
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <LineChart className="w-8 h-8 text-gray-400" />
          </div>
          <p>No progress data available</p>
          <p className="text-sm text-gray-400">Complete more interviews to see your progress</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="overallGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(203, 88%, 53%)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(203, 88%, 53%)" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="speechGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(120, 61%, 34%)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(120, 61%, 34%)" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(35, 100%, 50%)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(35, 100%, 50%)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            domain={[0, 10]}
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="overall"
            stroke="hsl(203, 88%, 53%)"
            fillOpacity={1}
            fill="url(#overallGradient)"
            strokeWidth={3}
          />
          <Line
            type="monotone"
            dataKey="speech"
            stroke="hsl(120, 61%, 34%)"
            strokeWidth={2}
            dot={{ fill: "hsl(120, 61%, 34%)", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "hsl(120, 61%, 34%)", strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="confidence"
            stroke="hsl(35, 100%, 50%)"
            strokeWidth={2}
            dot={{ fill: "hsl(35, 100%, 50%)", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "hsl(35, 100%, 50%)", strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="eyeContact"
            stroke="hsl(260, 84%, 58%)"
            strokeWidth={2}
            dot={{ fill: "hsl(260, 84%, 58%)", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "hsl(260, 84%, 58%)", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="flex justify-center space-x-6 mt-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-primary rounded-full"></div>
          <span className="text-gray-600">Overall Score</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-secondary rounded-full"></div>
          <span className="text-gray-600">Speech Clarity</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-accent rounded-full"></div>
          <span className="text-gray-600">Confidence</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          <span className="text-gray-600">Eye Contact</span>
        </div>
      </div>
    </div>
  );
}
