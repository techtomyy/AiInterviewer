import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface FeedbackScore {
  overallScore: number;
  speechClarityScore: number;
  eyeContactScore: number;
  contentStructureScore: number;
  confidenceScore: number;
  paceTimingScore: number;
  fillerWordCount: number;
}

interface FeedbackChartProps {
  scores: FeedbackScore;
}

export default function FeedbackChart({ scores }: FeedbackChartProps) {
  const barData = [
    {
      category: 'Speech Clarity',
      score: scores.speechClarityScore,
      color: 'hsl(120, 61%, 34%)'
    },
    {
      category: 'Eye Contact',
      score: scores.eyeContactScore,
      color: 'hsl(203, 88%, 53%)'
    },
    {
      category: 'Content Structure',
      score: scores.contentStructureScore,
      color: 'hsl(35, 100%, 50%)'
    },
    {
      category: 'Confidence',
      score: scores.confidenceScore,
      color: 'hsl(260, 84%, 58%)'
    },
    {
      category: 'Pace & Timing',
      score: scores.paceTimingScore,
      color: 'hsl(340, 75%, 51%)'
    }
  ];

  const pieData = [
    { name: 'Achieved', value: scores.overallScore, color: 'hsl(120, 61%, 34%)' },
    { name: 'Remaining', value: 10 - scores.overallScore, color: 'hsl(0, 0%, 90%)' }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-primary">
            Score: {payload[0].value}/10
          </p>
        </div>
      );
    }
    return null;
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 8) return 'bg-green-100 border-green-200';
    if (score >= 6) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  return (
    <div className="space-y-6">
      {/* Overall Score Circle */}
      <div className="text-center">
        <div className="relative inline-flex items-center justify-center">
          <div className="w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-3xl font-bold text-neutral" data-testid="overall-score">
              {scores.overallScore.toFixed(1)}
            </span>
            <span className="text-sm text-gray-600">/ 10</span>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-neutral mt-4 mb-2">Overall Score</h3>
        <p className="text-sm text-gray-600">
          {scores.overallScore >= 8 ? 'Excellent performance!' :
           scores.overallScore >= 6 ? 'Good job with room for improvement' :
           'Keep practicing to improve your skills'}
        </p>
      </div>

      {/* Detailed Metrics Bar Chart */}
      <div>
        <h4 className="text-lg font-semibold text-neutral mb-4">Performance Breakdown</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="category"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                domain={[0, 10]}
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="score" 
                radius={[4, 4, 0, 0]}
                fill="hsl(203, 88%, 53%)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Score Grid */}
      <div className="grid grid-cols-2 gap-4">
        {barData.map((item, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg border ${getScoreBg(item.score)}`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">{item.category}</span>
              <span className={`text-lg font-bold ${getScoreColor(item.score)}`}>
                {item.score.toFixed(1)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${(item.score / 10) * 100}%`,
                  backgroundColor: item.color
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Filler Words Count */}
      <div className={`p-4 rounded-lg border ${
        scores.fillerWordCount <= 2 ? 'bg-green-50 border-green-200' :
        scores.fillerWordCount <= 5 ? 'bg-yellow-50 border-yellow-200' :
        'bg-red-50 border-red-200'
      }`}>
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-medium text-gray-900">Filler Words</h4>
            <p className="text-sm text-gray-600">
              {scores.fillerWordCount <= 2 ? 'Excellent control' :
               scores.fillerWordCount <= 5 ? 'Could be improved' :
               'Needs attention'}
            </p>
          </div>
          <div className="text-right">
            <span className={`text-2xl font-bold ${
              scores.fillerWordCount <= 2 ? 'text-green-600' :
              scores.fillerWordCount <= 5 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {scores.fillerWordCount}
            </span>
            <p className="text-xs text-gray-600">detected</p>
          </div>
        </div>
      </div>
    </div>
  );
}
