import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  Filter, 
  Download, 
  Plus, 
  Eye, 
  MessageCircle, 
  Share, 
  Users,
  Calendar,
  Award,
  TrendingUp,
  Search,
  ChevronRight,
  Star
} from "lucide-react";

interface RecruiterProps {
  user: any;
}

export default function Recruiter({ user }: RecruiterProps) {
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddCandidate, setShowAddCandidate] = useState(false);

  // Authentication is handled by withAuth HOC
  // Check if user is a recruiter
  useEffect(() => {
    if (user && user.role !== 'recruiter') {
      toast({
        title: "Access Denied",
        description: "This page is only accessible to recruiters.",
        variant: "destructive",
      });
      return;
    }
  }, [user, toast]);

  const { data: evaluations = [], isLoading: evaluationsLoading, refetch } = useQuery<any[]>({
    queryKey: ["/api/recruiter/evaluations"],
    enabled: !!user && user.role === 'recruiter',
    retry: false,
  });

  const addEvaluationMutation = useMutation({
    mutationFn: async (evaluationData: any) => {
      const response = await apiRequest("POST", "/api/recruiter/evaluations", evaluationData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recruiter/evaluations"] });
      setShowAddCandidate(false);
      toast({
        title: "Candidate Added",
        description: "Candidate evaluation has been created successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add candidate evaluation. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (evaluationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (user?.role !== 'recruiter') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">This page is only accessible to recruiters.</p>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredEvaluations = evaluations.filter((evaluation: any) => {
    const matchesStatus = selectedStatus === "all" || evaluation.status === selectedStatus;
    const matchesSearch = searchTerm === "" || 
      evaluation.candidate?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.candidate?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.position?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shortlisted': return 'bg-green-100 text-green-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'follow_up': return 'bg-yellow-100 text-yellow-800';
      case 'top_pick': return 'bg-purple-100 text-purple-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return 'text-green-600 bg-green-100';
    if (score >= 7.5) return 'text-blue-600 bg-blue-100';
    if (score >= 6.5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const stats = {
    totalCandidates: evaluations.length,
    thisWeek: evaluations.filter((e: any) => {
      const evalDate = new Date(e.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return evalDate > weekAgo;
    }).length,
    avgScore: evaluations.length > 0 
      ? (evaluations.reduce((acc: number, e: any) => acc + (e.session?.overallScore || 8.2), 0) / evaluations.length).toFixed(1)
      : '8.2',
    shortlisted: evaluations.filter((e: any) => e.status === 'shortlisted').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" data-testid="button-back">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-neutral">Candidate Evaluation Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" data-testid="button-export">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Dialog open={showAddCandidate} onOpenChange={setShowAddCandidate}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-blue-800" data-testid="button-add-candidate">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Candidate
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Candidate Evaluation</DialogTitle>
                  </DialogHeader>
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      addEvaluationMutation.mutate({
                        candidateId: formData.get('candidateId'),
                        position: formData.get('position'),
                        status: formData.get('status'),
                        notes: formData.get('notes'),
                        customScore: parseFloat(formData.get('customScore') as string) || undefined,
                      });
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Candidate ID
                      </label>
                      <Input name="candidateId" placeholder="Enter candidate user ID" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Position
                      </label>
                      <Input name="position" placeholder="e.g., Frontend Developer" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <Select name="status" defaultValue="under_review">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="under_review">Under Review</SelectItem>
                          <SelectItem value="shortlisted">Shortlisted</SelectItem>
                          <SelectItem value="follow_up">Follow-up</SelectItem>
                          <SelectItem value="top_pick">Top Pick</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Custom Score (optional)
                      </label>
                      <Input 
                        name="customScore" 
                        type="number" 
                        min="0" 
                        max="10" 
                        step="0.1"
                        placeholder="8.5" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <Textarea name="notes" placeholder="Add evaluation notes..." rows={3} />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <Button type="button" variant="outline" onClick={() => setShowAddCandidate(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={addEvaluationMutation.isPending}>
                        {addEvaluationMutation.isPending ? 'Adding...' : 'Add Candidate'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card data-testid="card-total-candidates">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Candidates</p>
                  <p className="text-2xl font-bold text-neutral">{stats.totalCandidates}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-this-week">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-neutral">{stats.thisWeek}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-avg-score">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Score</p>
                  <p className="text-2xl font-bold text-neutral">{stats.avgScore}/10</p>
                </div>
                <Award className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-shortlisted">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Shortlisted</p>
                  <p className="text-2xl font-bold text-neutral">{stats.shortlisted}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search candidates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                    data-testid="input-search"
                  />
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-48" data-testid="select-status-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="shortlisted">Shortlisted</SelectItem>
                    <SelectItem value="follow_up">Follow-up</SelectItem>
                    <SelectItem value="top_pick">Top Pick</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" data-testid="button-advanced-filters">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Candidates Overview Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {filteredEvaluations.slice(0, 8).map((evaluation: any) => (
            <Card key={evaluation.id} className="hover:shadow-lg transition-shadow duration-300 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-600">
                      {evaluation.candidate?.firstName?.[0]}{evaluation.candidate?.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral">
                      {evaluation.candidate?.firstName} {evaluation.candidate?.lastName}
                    </h4>
                    <p className="text-sm text-gray-600">{evaluation.position}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Overall Score</span>
                    <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                      getScoreColor(evaluation.session?.overallScore || 8.2)
                    }`}>
                      {(evaluation.session?.overallScore || 8.2).toFixed(1)}/10
                    </span>
                  </div>
                  
                  {evaluation.session && (
                    <div className="flex justify-between text-xs text-gray-600 mt-3">
                      <span>Communication: <span className="font-medium text-neutral">
                        {(evaluation.session.speechClarityScore || 8.5).toFixed(1)}
                      </span></span>
                      <span>Confidence: <span className="font-medium text-neutral">
                        {(evaluation.session.confidenceScore || 8.0).toFixed(1)}
                      </span></span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">
                      {new Date(evaluation.createdAt).toLocaleDateString()}
                    </span>
                    <Badge className={`text-xs ${getStatusColor(evaluation.status)}`}>
                      {evaluation.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Comparison Table */}
        <Card data-testid="card-comparison-table">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Detailed Comparison</CardTitle>
              <Button variant="outline" size="sm" data-testid="button-export-pdf">
                <Download className="h-4 w-4 mr-1" />
                Export to PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {filteredEvaluations.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedStatus !== "all" ? 
                    "Try adjusting your filters or search terms." :
                    "Start by adding candidate evaluations to compare their performance."
                  }
                </p>
                <Button onClick={() => setShowAddCandidate(true)} data-testid="button-add-first-candidate">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Candidate
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-neutral">Candidate</th>
                      <th className="text-center py-3 px-4 font-medium text-neutral">Overall</th>
                      <th className="text-center py-3 px-4 font-medium text-neutral">Communication</th>
                      <th className="text-center py-3 px-4 font-medium text-neutral">Confidence</th>
                      <th className="text-center py-3 px-4 font-medium text-neutral">Eye Contact</th>
                      <th className="text-center py-3 px-4 font-medium text-neutral">Position</th>
                      <th className="text-center py-3 px-4 font-medium text-neutral">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-neutral">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvaluations.map((evaluation: any) => (
                      <tr key={evaluation.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-xs font-semibold text-gray-600">
                                {evaluation.candidate?.firstName?.[0]}{evaluation.candidate?.lastName?.[0]}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-neutral">
                                {evaluation.candidate?.firstName} {evaluation.candidate?.lastName}
                              </div>
                              <div className="text-sm text-gray-600">{evaluation.candidate?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                            getScoreColor(evaluation.session?.overallScore || 8.2)
                          }`}>
                            {(evaluation.session?.overallScore || 8.2).toFixed(1)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center text-neutral font-medium">
                          {(evaluation.session?.speechClarityScore || 8.5).toFixed(1)}
                        </td>
                        <td className="py-4 px-4 text-center text-neutral font-medium">
                          {(evaluation.session?.confidenceScore || 8.0).toFixed(1)}
                        </td>
                        <td className="py-4 px-4 text-center text-neutral font-medium">
                          {(evaluation.session?.eyeContactScore || 8.3).toFixed(1)}
                        </td>
                        <td className="py-4 px-4 text-center text-gray-600">
                          {evaluation.position}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Badge className={`text-xs ${getStatusColor(evaluation.status)}`}>
                            {evaluation.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              data-testid={`button-view-${evaluation.id}`}
                              title="View Profile"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              data-testid={`button-note-${evaluation.id}`}
                              title="Add Note"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              data-testid={`button-share-${evaluation.id}`}
                              title="Share"
                            >
                              <Share className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
