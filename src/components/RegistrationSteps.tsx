import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Plus,
    Eye,
    EyeOff,
    Trash2,
    ArrowRight,
    X,
    Database,
    ChevronDown,
    List,
    Settings2,
    ToggleRight,
    ToggleLeft,
    MousePointerClick,
    ListChecks,
    Type,
    UserPlus,
    CheckCircle2,
    CircleDashed
} from 'lucide-react';


import { toast } from 'sonner';
import api from '../lib/api';
import { Breadcrumb } from './Breadcrumb';

/* ================= TYPES ================= */

interface StepOption {
    value: string;
    label: string;
    icon?: string;
    subtitle?: string;
    emoji?: string;
}

interface RegistrationStep {
    _id: string;
    order: number;
    label: string;
    title: string;
    description: string;
    type: 'single-selection' | 'multi-selection' | 'input' | 'otp-verification' | 'account-creation' | 'subscription-plan';
    module: 'onboarding' | 'project_finder' | 'talent_finder';
    field: string;
    options: StepOption[];
    isActive: boolean;
    applicableRoles: string[];
}

/* ================= PAGE ================= */

interface RegistrationStepsProps {
    onNavigate?: (page: string) => void;
}

export const RegistrationSteps = ({ onNavigate }: RegistrationStepsProps) => {
    const [steps, setSteps] = useState<RegistrationStep[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentStep, setCurrentStep] = useState<Partial<RegistrationStep> | null>(null);

    const [activeModule, setActiveModule] = useState<'onboarding' | 'project_finder' | 'talent_finder'>('onboarding');
    const [activeRoleTab, setActiveRoleTab] = useState<'all' | 'freelancer' | 'client' | 'investor' | 'startup_creator'>('all');
    const [stats, setStats] = useState({ onboarding: 0, project_finder: 0, talent_finder: 0, freelancer: 0, client: 0, investor: 0, startup_creator: 0 });
    
    const fetchSteps = async () => {
        try {
            setLoading(true);
            const res = await api.get('/cms/registration-steps/admin');
            const allSteps: RegistrationStep[] = res.data.data;
            
            // Calculate stats for all sub-roles
            const onboardingSteps = allSteps.filter(s => (s.module || 'onboarding') === 'onboarding');
            
            setStats({
                onboarding: onboardingSteps.length,
                project_finder: allSteps.filter(s => s.module === 'project_finder').length,
                talent_finder: allSteps.filter(s => s.module === 'talent_finder').length,
                freelancer: onboardingSteps.filter(s => !s.applicableRoles?.length || s.applicableRoles.includes('freelancer')).length,
                client: onboardingSteps.filter(s => !s.applicableRoles?.length || s.applicableRoles.includes('client')).length,
                investor: onboardingSteps.filter(s => !s.applicableRoles?.length || s.applicableRoles.includes('investor')).length,
                startup_creator: onboardingSteps.filter(s => !s.applicableRoles?.length || s.applicableRoles.includes('startup_creator')).length
            });

            // Filter for display
            let filtered = allSteps.filter(s => (s.module || 'onboarding') === activeModule);
            
            if (activeModule === 'onboarding' && activeRoleTab !== 'all') {
                filtered = filtered.filter(s => !s.applicableRoles?.length || s.applicableRoles.includes(activeRoleTab));
            }

            setSteps(filtered);
        } catch {
            toast.error('Failed to fetch steps');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSteps();
    }, [activeModule, activeRoleTab]);

    const toggleStatus = async (id: string, active: boolean) => {
        await api.patch(`/cms/registration-steps/${id}/toggle`);
        toast.success(active ? 'Deactivated' : 'Activated');
        fetchSteps();
    };

    const removeStep = async (id: string) => {
        if (!confirm('Delete this step?')) return;
        await api.delete(`/cms/registration-steps/${id}`);
        toast.success('Deleted');
        fetchSteps();
    };

    const saveStep = async () => {
        if (!currentStep?.label || !currentStep?.title || !currentStep?.field) {
            toast.error('Missing required fields');
            return;
        }

        if (currentStep._id) {
            await api.put(`/cms/registration-steps/${currentStep._id}`, currentStep);
        } else {
            const order = steps.length ? Math.max(...steps.map(s => s.order)) + 1 : 1;
            await api.post('/cms/registration-steps', { ...currentStep, order });
        }

        toast.success('Saved');
        setIsEditing(false);
        fetchSteps();
    };

    const resetSteps = async () => {
        if (!confirm(`This will delete ALL ${activeModule.replace('_', ' ')} steps and restore default seed data. Continue?`)) return;
        try {
            setLoading(true);
            await api.post('/cms/registration-steps/reset', { module: activeModule });
            toast.success('Flow reset to defaults');
            fetchSteps();
        } catch {
            toast.error('Failed to reset steps');
            setLoading(false);
        }
    };

    if (isEditing && currentStep) {
        const isSelection = currentStep.type === 'single-selection' || currentStep.type === 'multi-selection';

        return (
            <div className="space-y-6">
                <Breadcrumb
                    items={[
                        { label: 'Site Management', path: 'pages' },
                        { label: 'Registration Flow', path: 'registration-flow' },
                        { label: currentStep._id ? `Edit Step: ${currentStep.label || 'Logic Step'}` : 'Add New Step' }
                    ]}
                    onNavigate={(path) => {
                        if (path === 'registration-flow') {
                            setIsEditing(false);
                        } else {
                            onNavigate?.(path);
                        }
                    }}
                />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-[#262626] pb-5">
                    <div>
                        <h1 className="text-3xl font-bold text-[#044071] dark:text-white mb-2 flex items-center gap-2 font-heading">
                            <Settings2 className="w-8 h-8 text-[#F24C20]" />
                            {currentStep._id ? 'Edit Registration Step' : 'Add Registration Step'}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 font-medium">Configure logic module, field keys, localization, target roles, and selectable choices</p>
                    </div>
                    <button
                        onClick={() => setIsEditing(false)}
                        className="w-fit px-6 rounded-full border border-[#F24C20] text-[#F24C20] dark:text-white hover:bg-[#F24C20] hover:text-white transition-all font-bold ml-auto md:ml-0 active:scale-95 flex items-center justify-center"
                        style={{ height: '40px' }}
                    >
                        ← Back to Steps
                    </button>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-[#121212] rounded-[2.5rem] w-full border border-gray-200/50 dark:border-white/10 shadow-xl overflow-hidden transition-all duration-300"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center px-8 py-5 border-b border-gray-100 dark:border-white/5 bg-white dark:bg-[#1a1a1a]">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-[#F24C20]/10 flex items-center justify-center text-[#F24C20]">
                                <Settings2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-none mb-1 font-heading">Logic Configuration</h2>
                                <p className="text-[11px] text-gray-500 font-medium">Fine-tune this step's behavior</p>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-8 py-8 bg-gray-50/30 dark:bg-[#121212]">
                        <div className={`grid grid-cols-1 ${isSelection ? 'lg:grid-cols-12' : ''} gap-8 items-start`}>
                            {/* GENERAL CONFIGURATION */}
                            <section className={isSelection ? 'lg:col-span-5 space-y-6' : 'space-y-6 max-w-2xl mx-auto w-full'}>
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="p-2 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                        <ListChecks className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <h3 className="text-[13px] font-bold text-gray-900 dark:text-white uppercase tracking-widest opacity-80">General Attributes</h3>
                                </div>

                                <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200/60 dark:border-white/5 rounded-3xl p-6 space-y-6 shadow-sm">
                                    <div className="flex flex-col gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Logic Module</label>
                                            <select
                                                value={currentStep.module || 'onboarding'}
                                                onChange={e => setCurrentStep({ ...currentStep, module: e.target.value as any })}
                                                className="w-full h-16 bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-white/5 rounded-2xl px-6 text-sm focus:outline-none focus:border-[#F24C20] focus:ring-2 focus:ring-[#F24C20]/20 transition-all font-semibold text-gray-900 dark:text-white"
                                            >
                                                <option value="onboarding">User Onboarding Flow</option>
                                                <option value="project_finder">Project Finder Filter</option>
                                                <option value="talent_finder">Talent Finder Flow</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Internal Reference</label>
                                            <input
                                                placeholder="e.g. Account Type"
                                                value={currentStep.label || ''}
                                                onChange={e => setCurrentStep({ ...currentStep, label: e.target.value })}
                                                className="w-full h-16 bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-white/5 rounded-2xl px-6 text-sm focus:outline-none focus:border-[#F24C20] focus:ring-2 focus:ring-[#F24C20]/20 transition-all font-semibold text-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Public Question Title</label>
                                            <input
                                                placeholder="e.g. What brings you here?"
                                                value={currentStep.title || ''}
                                                onChange={e => setCurrentStep({ ...currentStep, title: e.target.value })}
                                                className="w-full h-16 bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-white/5 rounded-2xl px-6 text-sm focus:outline-none focus:border-[#F24C20] focus:ring-2 focus:ring-[#F24C20]/20 transition-all font-semibold text-gray-900 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Description (Optional)</label>
                                        <textarea
                                            placeholder="Add more context for the user..."
                                            value={currentStep.description || ''}
                                            onChange={e => setCurrentStep({ ...currentStep, description: e.target.value })}
                                            style={{ height: '190px' }}
                                            className="w-full bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#F24C20] focus:ring-2 focus:ring-[#F24C20]/20 transition-all resize-none font-medium text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-6 pt-6 border-t border-gray-100 dark:border-white/5">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Database Field Key</label>
                                            <div className="relative group">
                                                <Database className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#F24C20] w-4 h-4 transition-colors" />
                                                <input
                                                    placeholder="e.g. account_type"
                                                    value={currentStep.field || ''}
                                                    onChange={e => setCurrentStep({ ...currentStep, field: e.target.value })}
                                                    className="w-full h-16 bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-mono focus:outline-none focus:border-[#F24C20] focus:ring-2 focus:ring-[#F24C20]/20 transition-all text-gray-900 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Input Type</label>
                                            <div className="relative">
                                                <select
                                                    value={currentStep.type}
                                                    onChange={e => setCurrentStep({ ...currentStep, type: e.target.value as any })}
                                                    className="w-full h-16 bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-white/5 rounded-2xl px-6 text-sm focus:outline-none focus:border-[#F24C20] focus:ring-2 focus:ring-[#F24C20]/20 transition-all appearance-none cursor-pointer font-semibold text-gray-900 dark:text-white"
                                                >
                                                    <option value="single-selection">Single Selection List</option>
                                                    <option value="multi-selection">Multiple Selection List</option>
                                                    <option value="input">Text Input Field</option>
                                                    <option value="otp-verification">OTP Verification</option>
                                                    <option value="account-creation">Account Creation Form</option>
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-white/5">
                                        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Applicable Roles (Empty if all)</label>
                                        <div className="flex flex-wrap gap-2">
                                            {['freelancer', 'client', 'investor', 'startup_creator'].map(role => {
                                                const isSelected = currentStep.applicableRoles?.includes(role);
                                                return (
                                                    <button
                                                        key={role}
                                                        type="button"
                                                        onClick={() => {
                                                            const currentRoles = currentStep.applicableRoles || [];
                                                            const nextRoles = isSelected 
                                                                ? currentRoles.filter((r: string) => r !== role)
                                                                : [...currentRoles, role];
                                                            setCurrentStep({ ...currentStep, applicableRoles: nextRoles });
                                                        }}
                                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border ${
                                                            isSelected 
                                                            ? 'bg-[#F24C20] text-white border-[#F24C20]' 
                                                            : 'bg-gray-50 dark:bg-white/5 text-gray-400 border-gray-200 dark:border-white/10 hover:border-[#F24C20] hover:text-[#F24C20]'
                                                        }`}
                                                    >
                                                        {role.replace('_', ' ').toUpperCase()}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <p className="text-[10px] text-gray-400 italic">If no role is selected, this step will be shown to everyone.</p>
                                    </div>
                                </div>
                            </section>

                            {/* SELECTION OPTIONS */}
                            {isSelection && (
                                <section className="lg:col-span-7 space-y-6">
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                                                <List className="w-4 h-4 text-[#F24C20]" />
                                            </div>
                                            <h3 className="text-[13px] font-bold text-gray-900 dark:text-white uppercase tracking-widest opacity-80">Selectable Choices</h3>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep({ ...currentStep, options: [...(currentStep.options || []), { label: '', value: '', icon: '', subtitle: '' }] })}
                                            className="text-[#F24C20] text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#F24C20] hover:text-white px-5 rounded-xl bg-[#F24C20]/10 border border-[#F24C20]/20 hover:border-[#F24C20] transition-all active:scale-95 w-full"
                                            style={{ height: '40px' }}
                                        >
                                            <Plus className="w-4 h-4" /> ADD CHOICE
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <AnimatePresence>
                                            {currentStep.options?.map((opt: any, idx: number) => (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    key={idx}
                                                    className="bg-white dark:bg-[#1a1a1a] border border-gray-200/60 dark:border-white/5 rounded-3xl p-6 pb-8 group shadow-sm"
                                                    style={{ position: 'relative' }}
                                                >
                                                    <div className="flex flex-col gap-5 relative z-10 pr-12">
                                                        <div className="space-y-1.5 relative">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Display Label</label>
                                                            <input
                                                                placeholder="e.g. Design & Creative"
                                                                value={opt.label || ''}
                                                                onChange={(e) => {
                                                                    const newOptions = [...(currentStep.options || [])];
                                                                    newOptions[idx] = { ...newOptions[idx], label: e.target.value };
                                                                    if (!newOptions[idx].value) newOptions[idx].value = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
                                                                    setCurrentStep({ ...currentStep, options: newOptions });
                                                                }}
                                                                className="w-full bg-gray-50 focus:bg-white dark:bg-[#222] border border-gray-200 dark:border-white/5 rounded-xl p-3 text-sm focus:border-[#F24C20] focus:ring-2 focus:ring-[#F24C20]/20 outline-none transition-all font-semibold text-gray-900 dark:text-white"
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5 relative">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Internal Value ID</label>
                                                            <input
                                                                placeholder="e.g. design"
                                                                value={opt.value || ''}
                                                                onChange={(e) => {
                                                                    const newOptions = [...(currentStep.options || [])];
                                                                    newOptions[idx] = { ...newOptions[idx], value: e.target.value };
                                                                    setCurrentStep({ ...currentStep, options: newOptions });
                                                                }}
                                                                className="w-full bg-gray-50 focus:bg-white dark:bg-[#222] border border-gray-200 dark:border-white/5 rounded-xl p-3 text-sm font-mono text-gray-600 dark:text-gray-400 focus:border-[#F24C20] focus:ring-2 focus:ring-[#F24C20]/20 outline-none transition-all"
                                                            />
                                                        </div>

                                                        <div className="space-y-1.5 relative">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1 flex items-center gap-1.5">
                                                                <Settings2 className="w-3 h-3" /> Icon Name
                                                            </label>
                                                            <input
                                                                placeholder="e.g. Briefcase"
                                                                value={opt.icon || ''}
                                                                onChange={(e) => {
                                                                    const newOptions = [...(currentStep.options || [])];
                                                                    newOptions[idx] = { ...newOptions[idx], icon: e.target.value };
                                                                    setCurrentStep({ ...currentStep, options: newOptions });
                                                                }}
                                                                className="w-full bg-gray-50 focus:bg-white dark:bg-[#222] border border-gray-200 dark:border-white/5 rounded-xl p-3 text-sm focus:border-[#F24C20] focus:ring-2 focus:ring-[#F24C20]/20 outline-none transition-all text-gray-900 dark:text-white"
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5 relative">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Description Hint</label>
                                                            <input
                                                                placeholder="Short subtext..."
                                                                value={opt.subtitle || ''}
                                                                onChange={(e) => {
                                                                    const newOptions = [...(currentStep.options || [])];
                                                                    newOptions[idx] = { ...newOptions[idx], subtitle: e.target.value };
                                                                    setCurrentStep({ ...currentStep, options: newOptions });
                                                                }}
                                                                className="w-full bg-gray-50 focus:bg-white dark:bg-[#222] border border-gray-200 dark:border-white/5 rounded-xl p-3 text-sm focus:border-[#F24C20] focus:ring-2 focus:ring-[#F24C20]/20 outline-none transition-all text-gray-900 dark:text-white"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Delete Button overlaid */}
                                                    <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 20 }}>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newOptions = currentStep.options.filter((_: any, i: number) => i !== idx);
                                                                setCurrentStep({ ...currentStep, options: newOptions });
                                                            }}
                                                            className="w-10 h-10 bg-white dark:bg-[#222] border border-gray-200 dark:border-white/10 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 rounded-full flex items-center justify-center transition-all shadow-sm active:scale-95"
                                                            title="Remove choice"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>

                                        {(!currentStep.options || currentStep.options?.length === 0) && (
                                            <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl bg-white dark:bg-[#1a1a1a]">
                                                <div className="bg-gray-50 dark:bg-[#222] w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-white/5">
                                                    <List className="w-6 h-6 text-gray-400" />
                                                </div>
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Empty Choices</h4>
                                                <p className="text-sm text-gray-500 mt-1 max-w-[250px] mx-auto">Add selectable options for the user to pick from in this step.</p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-5 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#1a1a1a] flex justify-end gap-3 flex-shrink-0 flex-grow-0">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="rounded-2xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#222] font-bold transition-colors text-xs border border-gray-200 dark:border-white/10 flex items-center justify-center active:scale-95"
                            style={{ width: '190px', height: '40px' }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={saveStep}
                            className="bg-[#F24C20] hover:bg-[#d43a12] text-white rounded-2xl font-bold shadow-lg shadow-[#F24C20]/25 active:scale-95 transition-all text-xs flex items-center justify-center gap-2"
                            style={{ width: '190px', height: '40px' }}
                        >
                            <CheckCircle2 className="w-4 h-4" /> Save Changes
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* ================= HERO ================= */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl p-8 text-white"
                style={{
                    background: 'linear-gradient(135deg, #F24C20 0%, #d43a12 50%, #044071 100%)'
                }}
            >
                <div className="absolute inset-0 opacity-20">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"
                    />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex gap-4 items-center">
                        <div className="p-4 rounded-xl bg-white/20">
                            <Settings2 />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold font-heading">Dynamic Logic Flows</h1>
                            <p className="text-white/80 text-sm font-medium">
                                Configure steps for {
                                    activeModule === 'onboarding' ? `Onboarding (Role: ${activeRoleTab.replace('_', ' ').toUpperCase()})` : 
                                    activeModule === 'project_finder' ? 'Project Search Quiz' : 
                                    'Talent Finder Flow'
                                }
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={resetSteps}
                            className="bg-white/10 hover:bg-white/20 text-white px-8 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 border border-white/20 transition-all active:scale-95 text-sm"
                        >
                            <CircleDashed className="w-4 h-4" /> Reset Flow
                        </button>
                        <button
                            onClick={() => {
                                const nextOrder = steps.length ? Math.max(...steps.map(s => s.order)) + 1 : 1;
                                setCurrentStep({
                                    label: '',
                                    title: '',
                                    description: '',
                                    field: '',
                                    type: 'single-selection',
                                    module: activeModule,
                                    options: [],
                                    isActive: true,
                                    applicableRoles: activeRoleTab !== 'all' ? [activeRoleTab] : [],
                                    order: nextOrder
                                });
                                setIsEditing(true);
                            }}
                            className="bg-white text-[#F24C20] px-8 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-white/20 transition-all active:scale-95 text-sm"
                        >
                            <Plus className="w-4 h-4" /> Add Step
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="relative z-10 mt-8 flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2">
                        {[
                            { id: 'onboarding', label: 'Onboarding Flow', count: stats.onboarding, icon: UserPlus },
                            { id: 'project_finder', label: 'Project Finder Filter', count: stats.project_finder, icon: Database },
                            { id: 'talent_finder', label: 'Talent Finder Flow', count: stats.talent_finder, icon: Database }
                        ].map(tab => {
                            const Icon = tab.icon;
                            const isSelected = activeModule === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveModule(tab.id as any);
                                        if (tab.id !== 'onboarding') setActiveRoleTab('all');
                                    }}
                                    className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-all text-xs border ${
                                        isSelected 
                                        ? 'bg-white text-[#F24C20] border-white shadow-xl shadow-black/10' 
                                        : 'bg-black/10 hover:bg-black/20 text-white border-white/10'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] ${isSelected ? 'bg-[#F24C20]/10 text-[#F24C20]' : 'bg-white/10 text-white'}`}>
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Role Sub-tabs for Onboarding */}
                    <AnimatePresence>
                        {activeModule === 'onboarding' && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex flex-wrap gap-2 p-1.5 bg-black/10 rounded-2xl backdrop-blur-md w-fit border border-white/5"
                            >
                                {[
                                    { id: 'all', label: 'All Steps', count: stats.onboarding },
                                    { id: 'freelancer', label: 'Freelancer', count: stats.freelancer },
                                    { id: 'client', label: 'Hire Talent', count: stats.client },
                                    { id: 'investor', label: 'Investor', count: stats.investor },
                                    { id: 'startup_creator', label: 'Startup Creator', count: stats.startup_creator }
                                ].map(sub => (
                                    <button
                                        key={sub.id}
                                        onClick={() => setActiveRoleTab(sub.id as any)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-bold tracking-wide transition-all ${
                                            activeRoleTab === sub.id 
                                            ? 'bg-white/20 text-white border border-white/20' 
                                            : 'text-white/50 hover:text-white'
                                        }`}
                                    >
                                        {sub.label.toUpperCase()} ({sub.count})
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* ================= GRID ================= */}
            {loading ? (
                <div className="h-40 flex items-center justify-center">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {steps.map((step, i) => {
                            const typeIcons: Record<string, any> = {
                                'single-selection': MousePointerClick,
                                'multi-selection': ListChecks,
                                'input': Type,
                                'otp-verification': CircleDashed,
                                'account-creation': UserPlus,
                                'subscription-plan': Database
                            };
                            const TypeIcon = typeIcons[step.type] || CheckCircle2;

                            return (
                                <motion.div
                                    key={step._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="group relative bg-white dark:bg-[#1a1a1a] rounded-3xl p-6 border border-gray-100 dark:border-[#262626] shadow-sm hover:shadow-xl hover:shadow-[#F24C20]/5 transition-all duration-300"
                                >
                                    {/* Header: Order & Status */}
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-gray-500/10 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center justify-center text-sm font-bold text-gray-400 group-hover:bg-[#F24C20] group-hover:text-white transition-colors duration-300">
                                                {step.order}
                                            </div>
                                            <div className="p-2 rounded-xl bg-gray-500/10 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-400">
                                                <TypeIcon className="w-4 h-4" />
                                            </div>
                                        </div>
                                        <span
                                            className={`text-[10px] font-bold px-3 py-1 rounded-full tracking-wider border ${
                                                step.isActive
                                                    ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20'
                                                    : 'bg-gray-500/10 text-gray-500 dark:text-gray-400 border-gray-500/20'
                                            }`}
                                        >
                                            {step.isActive ? 'ACTIVE' : 'DRAFT'}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-[#F24C20] font-black uppercase tracking-widest opacity-80">
                                            {step.label}
                                        </p>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                            {step.title}
                                        </h3>
                                        {step.description && (
                                            <p className="text-sm text-gray-500 line-clamp-2 mt-2 font-medium">
                                                {step.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Type Badge */}
                                    <div className="mt-4 flex items-center gap-2">
                                        <div className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                                                {step.type.replace('-', ' ')}
                                            </span>
                                        </div>
                                        {step.options?.length > 0 && (
                                            <div className="px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20">
                                                <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">
                                                    {step.options.length} OPTIONS
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="flex justify-between items-center mt-8 pt-5 border-t border-gray-50 dark:border-white/5">
                                        <button
                                            onClick={() => {
                                                setCurrentStep(step);
                                                setIsEditing(true);
                                            }}
                                            className="text-blue-500 hover:text-blue-600 text-xs font-bold flex items-center gap-2 transition-colors uppercase tracking-wider"
                                        >
                                            Edit Logic <ArrowRight className="w-3.5 h-3.5" />
                                        </button>

                                        <div className="flex gap-4 items-center">
                                            <button
                                                onClick={() => toggleStatus(step._id, step.isActive)}
                                                className={`p-1 rounded-xl transition-all duration-300 ${step.isActive ? 'text-green-500 hover:scale-110' : 'text-white bg-gray-700 hover:bg-gray-600 hover:scale-110'}`}
                                            >
                                                {step.isActive ? (
                                                    <ToggleRight className="w-7 h-7" />
                                                ) : (
                                                    <ToggleLeft className="w-7 h-7" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => removeStep(step._id)}
                                                className="text-red-500 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
