import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ProgressChartProps {
  sessions: any[];
}

export default function ProgressChart({ sessions }: ProgressChartProps) {
  // Calculate progress data
  const completedSessions = sessions.filter(s => s?.status === 'completed' || s?.status === 'uploaded');

  if (completedSessions.length === 0) {
    return (
      <div className="text-center py-8">
        <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Complete some interviews to see your progress chart</p>
      </div>
    );
  }

  // Sort sessions by date
  const sortedSessions = completedSessions.sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  // Calculate average scores over time
  const scores = sortedSessions.map(session => session?.overallScore || 8.2);
  const latestScore = scores[scores.length - 1];
  const previousScore = scores.length > 1 ? scores[scores.length - 2] : latestScore;

  const trend = latestScore > previousScore ? 'up' : latestScore < previousScore ? 'down' : 'stable';
  const trendValue = Math.abs(latestScore - previousScore).toFixed(1);

  return (
    <div className="space-y-4">
      {/* Trend Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {trend === 'up' && <TrendingUp className="h-5 w-5 text-green-500" />}
          {trend === 'down' && <TrendingDown className="h-5 w-5 text-red-500" />}
          {trend === 'stable' && <Minus className="h-5 w-5 text-gray-500" />}
          <span className="text-sm font-medium">
            {trend === 'up' && `+${trendValue} points`}
            {trend === 'down' && `-${trendValue} points`}
            {trend === 'stable' && 'No change'}
          </span>
        </div>
        <span className="text-sm text-gray-500">
          Latest: {latestScore.toFixed(1)}/10
        </span>
      </div>

      {/* Simple Progress Visualization */}
      <div className="space-y-2">
        {sortedSessions.slice(-5).map((session, index) => (
          <div key={session.id} className="flex items-center space-x-3">
            <div className="w-16 text-xs text-gray-500">
              {new Date(session.created_at).toLocaleDateString()}
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${((session?.overallScore || 8.2) / 10) * 100}%` }}
              />
            </div>
            <div className="w-12 text-xs font-medium text-right">
              {(session?.overallScore || 8.2).toFixed(1)}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {Math.max(...scores).toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">Best Score</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">Average</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {completedSessions.length}
          </div>
          <div className="text-xs text-gray-500">Completed</div>
        </div>
      </div>
    </div>
  );
}
