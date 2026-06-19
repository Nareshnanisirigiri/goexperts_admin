import React, { useMemo, useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Rocket, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  FileText, 
  TrendingUp, 
  Users, 
  Target, 
  CheckCircle, 
  XCircle,
  Download,
  Eye,
  DollarSign,
  AlertCircle,
  Clock
} from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const statusStyles: any = {
  pending: "bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/30",
  approved: "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/30",
  rejected: "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30"
};

interface Props {
  ideaId: string;
  onBack: () => void;
}

export function StartupIdeaDetail({ ideaId, onBack }: Props) {
  const [idea, setIdea] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [internalNote, setInternalNote] = useState("");
  const [status, setStatus] = useState("pending");

  useEffect(() => {
    fetchIdeaDetails();
  }, [ideaId]);

  const fetchIdeaDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/startup-ideas/${ideaId}`);
      if (res.data.success) {
        setIdea(res.data.data);
        setStatus(res.data.data.status);
        setInternalNote(res.data.data.internalNotes || "");
      }
    } catch (error) {
      toast.error('Failed to fetch idea details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (nextStatus?: string) => {
    try {
      setSubmitting(true);
      const payload: any = { internalNotes: internalNote };
      if (nextStatus) payload.status = nextStatus;
      
      const res = await api.put(`/admin/startup-ideas/${ideaId}/status`, payload);
      if (res.data.success) {
        toast.success(`Information updated successfully`);
        if (nextStatus) setStatus(nextStatus);
        setIdea(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to update information');
    } finally {
      setSubmitting(false);
    }
  };

  const badgeClass = useMemo(
    () => statusStyles[status] || "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700",
    [status]
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="w-12 h-12 border-4 border-[#F24C20] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">Reviewing Concept Analytics...</p>
      </div>
    );
  }

  if (!idea) return <div className="text-center py-20 text-white">Idea not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white -mt-6 -mx-6 p-6 lg:p-10">
      <div className="mx-auto max-w-7xl">
        {/* Top Navigation */}
        <div className="mb-8">
            <button 
                onClick={onBack}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors group mb-6 font-semibold"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
            </button>

            <div className="flex flex-col gap-5 rounded-[32px] border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#1a1a1a] p-8 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <div>
                <div 
                    className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-700 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20"
                    style={{ borderColor: 'rgba(242, 76, 32, 0.3)' }}
                >
                Admin Panel • Idea Verification
                </div>
                <h1 className="mt-4 text-3xl font-bold sm:text-4xl tracking-tight text-gray-900 dark:text-white">{idea.title}</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-550 dark:text-gray-300 sm:text-base">
                Reviewing the complete startup concept submission, verifying legal compliance, and assessing market visibility.
                </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
                <div className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-bold uppercase tracking-widest ${badgeClass}`}>
                    {status}
                </div>
                <div className="text-xs font-mono text-gray-500 dark:text-gray-400">REF-ID: {idea._id.slice(-8).toUpperCase()}</div>
                <div className="text-xs text-gray-550 dark:text-gray-400">Submitted: {new Date(idea.createdAt).toLocaleDateString()}</div>
            </div>
            </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.7fr,0.95fr]">
          <div className="space-y-8">
            <InfoCard title="Founder & Location Info">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Founder Name" value={idea.creator?.full_name} icon={<User className="w-3.5 h-3.5" />} />
                <Field label="Email Address" value={idea.creator?.email} icon={<Mail className="w-3.5 h-3.5" />} />
                <Field label="Contact Phone" value={idea.creator?.phone_number} icon={<Phone className="w-3.5 h-3.5" />} />
                <Field label="Target Location" value={idea.creator?.location || "Global"} icon={<MapPin className="w-3.5 h-3.5" />} />
                <Field label="User Profile" value={idea.creator?.roles?.join(' & ')} icon={<Users className="w-3.5 h-3.5" />} />
                <Field label="Category" value={idea.category} icon={<Rocket className="w-3.5 h-3.5" />} />
              </div>
            </InfoCard>

            <InfoCard title="Concept Abstract">
                <div className="space-y-6">
                    <Field label="Executive Summary" value={idea.shortDescription} />
                    <div className="rounded-2xl border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#262626] p-6">
                        <div className="text-xs uppercase tracking-widest text-[#F24C20] font-bold mb-3">Detailed Vision</div>
                        <div className="text-sm leading-8 text-gray-800 dark:text-gray-300 whitespace-pre-wrap">{idea.detailedDescription}</div>
                    </div>
                </div>
            </InfoCard>

            <InfoCard title="Problem & Solution Matrix">
              <div className="grid gap-6">
                <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Identified Problem" value={idea.problem} className="border-red-200 dark:border-transparent bg-red-50 dark:bg-red-900/10" />
                    <Field label="Proposed Solution" value={idea.solution} className="border-green-200 dark:border-transparent bg-green-50 dark:bg-green-900/10" />
                </div>
                <Field label="Product Uniqueness (USP)" value={idea.uniqueness} />
                <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Target Audience" value={idea.targetAudience} />
                    <Field label="Market Opportunity" value={idea.marketSize} />
                </div>
                <Field label="Competitor Analysis" value={idea.competitorAnalysis} />
              </div>
            </InfoCard>

            <InfoCard title="Business Execution & Funding">
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-[24px] bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30">
                        <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">Funding Goal</div>
                        <div className="text-3xl font-black text-gray-900 dark:text-white">{idea.fundingAmount || "No Funding Sought"}</div>
                    </div>
                    <Field label="Primary Use of Funds" value={idea.useOfFunds} />
                </div>
                <Field label="Upcoming Milestones" value={idea.milestones} />
              </div>
            </InfoCard>
          </div>

          <div className="space-y-8">
            <InfoCard title="Decisive Action Panel">
              <div className="space-y-6">
                <div>
                  <span className="mb-3 block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Update Current Status</span>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#262626] text-gray-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#F24C20] transition-all appearance-none cursor-pointer"
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-row flex-wrap gap-4 justify-center items-center w-full">
                  <button
                    onClick={() => handleUpdate("approved")}
                    disabled={submitting}
                    className="h-12 flex-1 min-w-[110px] max-w-[150px] px-2.5 flex items-center justify-center gap-1.5 rounded-2xl bg-[#F24C20] hover:bg-[#E23C10] text-xs font-extrabold text-white transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/20 disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Approve Live</span>
                  </button>
                  <button
                    onClick={() => handleUpdate("rejected")}
                    disabled={submitting}
                    className="h-12 flex-1 min-w-[110px] max-w-[150px] px-2.5 flex items-center justify-center gap-1.5 rounded-2xl bg-[#F24C20] hover:bg-[#E23C10] text-xs font-extrabold text-white transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/20 disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    <XCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Reject Idea</span>
                  </button>
                  <button
                    onClick={() => handleUpdate("pending")}
                    disabled={submitting}
                    className="h-12 flex-1 min-w-[140px] max-w-[190px] px-2.5 flex items-center justify-center gap-1.5 rounded-2xl bg-[#F24C20] hover:bg-[#E23C10] text-xs font-extrabold text-white transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/20 disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Return to Pending</span>
                  </button>
                </div>
              </div>
            </InfoCard>

            <InfoCard title="Internal Review Notes">
              <textarea
                rows={6}
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Compose internal review findings here..."
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#262626] text-gray-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#F24C20] transition-all resize-none leading-relaxed"
              />
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => handleUpdate()}
                  disabled={submitting}
                  className="h-12 w-[190px] px-3 flex items-center justify-center gap-1.5 rounded-2xl bg-[#F24C20] hover:bg-[#E23C10] text-xs font-extrabold text-white transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/20 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{submitting ? "Saving..." : "Save Internal Findings"}</span>
                </button>
              </div>
            </InfoCard>

            <InfoCard title="Legal Compliance">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-[#262626] border border-gray-200 dark:border-[#262626]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <ShieldCheck className="w-5 h-5 text-blue-500" />
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">NDA Mandatory</span>
                    </div>
                    <span className={`text-sm font-black uppercase ${idea.ndaRequired === 'Yes' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        {idea.ndaRequired}
                    </span>
                </div>

                {idea.signedNDA ? (
                    <div className="group border border-green-200 dark:border-transparent bg-green-50 dark:bg-green-900/10 rounded-2xl p-5">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-green-500/10 dark:bg-green-500/20 rounded-xl">
                                <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-900 dark:text-white">Signed NDA Document</div>
                                <div className="text-[10px] text-green-600 dark:text-green-400 font-bold tracking-tighter uppercase">Legal Verification Present</div>
                            </div>
                        </div>
                        <a 
                            href={`${api.defaults.baseURL?.replace('/api', '')}${idea.signedNDA}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full h-14 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-xs hover:bg-[#F24C20] dark:hover:bg-[#F24C20] hover:text-white dark:hover:text-white transition-all shadow-md"
                        >
                            <Download className="w-4 h-4" />
                            Inspect Signed PDF
                        </a>
                    </div>
                ) : (
                    <div className="p-6 rounded-2xl bg-gray-50 dark:bg-[#262626] border border-dashed border-gray-200 dark:border-[#262626] text-center">
                        <AlertCircle className="w-8 h-8 text-gray-400 dark:text-gray-550 mx-auto mb-3" />
                        <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">No Signed Document Provided</div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2">The creator has not yet uploaded the required legal paperwork.</p>
                    </div>
                )}
              </div>
            </InfoCard>

            <InfoCard title="Impact Analytics">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#262626] text-center">
                        <Eye className="w-5 h-5 text-blue-500 dark:text-blue-400 mx-auto mb-2" />
                        <div className="text-2xl font-black text-gray-900 dark:text-white">{idea.views || 0}</div>
                        <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Ecosystem Views</div>
                    </div>
                    <div className="p-5 rounded-2xl border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#262626] text-center">
                        <TrendingUp className="w-5 h-5 text-purple-500 dark:text-purple-400 mx-auto mb-2" />
                        <div className="text-2xl font-black text-gray-900 dark:text-white">{idea.contacts?.length || 0}</div>
                        <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Investor Inquiries</div>
                    </div>
                </div>
            </InfoCard>

            {idea.tags && idea.tags.length > 0 && (
                <InfoCard title="Concept Tags">
                    <div className="flex flex-wrap gap-2">
                        {idea.tags.map((tag: string) => (
                        <span key={tag} className="px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-[#262626] border border-gray-200 dark:border-[#262626] text-[10px] font-bold text-gray-650 dark:text-gray-400 uppercase tracking-tighter">
                            {tag}
                        </span>
                        ))}
                    </div>
                </InfoCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, children, className = "" }: any) {
  return (
    <div className={`rounded-[32px] border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#1a1a1a] p-6 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-5 bg-[#F24C20] rounded-full" />
        <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Field({ label, value, icon, className = "" }: any) {
  return (
    <div className={`rounded-2xl border border-gray-100 dark:border-transparent bg-gray-50 dark:bg-[#262626] p-4 transition-all hover:bg-gray-100/50 dark:hover:bg-[#1a1a1a]/50 ${className}`}>
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#F24C20] font-bold mb-2">
        {icon} {label}
      </div>
      <div className="text-sm leading-6 text-gray-900 dark:text-gray-300 font-semibold">{value || "-"}</div>
    </div>
  );
}
