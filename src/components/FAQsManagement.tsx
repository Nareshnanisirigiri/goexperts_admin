import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit, Trash2, ChevronDown, ChevronUp, ToggleLeft, ToggleRight, Search, MessageCircle, CheckCircle, HelpCircle, DollarSign, Users, Briefcase, User, Folder, Zap, AlertCircle, CheckCircle2, LayoutGrid, Rocket } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';
import { AdminRichTextEditor } from './common/AdminRichTextEditor';

interface FAQ {
    _id: string;
    question: string;
    answer: string;
    category: string;
    sort_order: number;
    is_active: boolean;
}

const CATEGORIES = ['General', 'Payments', 'Freelancers', 'Clients', 'Account', 'Projects', 'Gigs'];

export function FAQsManagement() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
    const [form, setForm] = useState({ question: '', answer: '', category: 'General', sort_order: 0 });
    const [saving, setSaving] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    const fetchFAQs = async () => {
        try {
            setLoading(true);
            const res = await api.get('/cms/faqs');
            setFaqs(res.data.faqs || []);
        } catch {
            toast.error('Failed to load FAQs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchFAQs(); }, []);

    const resetForm = () => {
        setForm({ question: '', answer: '', category: 'General', sort_order: 0 });
        setEditingFAQ(null);
        setShowForm(false);
    };

    const openAdd = () => {
        setForm({ question: '', answer: '', category: 'General', sort_order: 0 });
        setEditingFAQ(null);
        setShowForm(true);
    };

    const handleEdit = (faq: FAQ) => {
        setEditingFAQ(faq);
        setForm({ question: faq.question, answer: faq.answer, category: faq.category, sort_order: faq.sort_order });
        setShowForm(true);
    };

    const handleSubmit = async () => {
        if (!form.question.trim() || !form.answer.trim()) {
            toast.error('Question and answer are required');
            return;
        }
        setSaving(true);
        try {
            if (editingFAQ) {
                await api.put(`/cms/faqs/${editingFAQ._id}`, form);
                toast.success('FAQ updated!');
            } else {
                await api.post('/cms/faqs', form);
                toast.success('FAQ created!');
            }
            fetchFAQs();
            resetForm();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to save FAQ');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/cms/faqs/${id}`);
            toast.success('FAQ deleted');
            fetchFAQs();
            setDeleteTargetId(null);
        } catch {
            toast.error('Failed to delete FAQ');
        }
    };

    const handleToggle = async (id: string) => {
        try {
            await api.patch(`/cms/faqs/${id}/toggle`);
            fetchFAQs();
        } catch {
            toast.error('Failed to toggle FAQ');
        }
    };

    const filtered = faqs.filter(f =>
        f.question.toLowerCase().includes(search.toLowerCase()) ||
        f.category.toLowerCase().includes(search.toLowerCase())
    );

    const getCategoryBadge = (category: string) => {
        switch (category) {
            case 'General':
                return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20';
            case 'Payments':
                return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
            case 'Freelancers':
                return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20';
            case 'Clients':
                return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
            case 'Account':
                return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20';
            case 'Projects':
                return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
            case 'Gigs':
                return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20';
            case 'StartupIdeas':
            case 'Startup Ideas':
                return 'bg-orange-500/10 text-orange-600 dark:text-orange-450 border border-orange-500/20';
            default:
                return 'bg-gray-500/10 text-gray-650 dark:text-gray-400 border border-gray-500/20';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'General':
                return <HelpCircle className="w-3.5 h-3.5" />;
            case 'Payments':
                return <DollarSign className="w-3.5 h-3.5" />;
            case 'Freelancers':
                return <Users className="w-3.5 h-3.5" />;
            case 'Clients':
                return <Briefcase className="w-3.5 h-3.5" />;
            case 'Account':
                return <User className="w-3.5 h-3.5" />;
            case 'Projects':
                return <Folder className="w-3.5 h-3.5" />;
            case 'Gigs':
                return <Zap className="w-3.5 h-3.5" />;
            case 'StartupIdeas':
            case 'Startup Ideas':
                return <Rocket className="w-3.5 h-3.5" />;
            default:
                return <HelpCircle className="w-3.5 h-3.5" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-[#262626] pb-5">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#044071] dark:text-white tracking-tight flex items-center gap-2">
                        <MessageCircle className="w-8 h-8 text-[#F24C20]" />
                        FAQ Management
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage, categorize, and update frequently asked questions shown on the website</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={openAdd}
                    className="w-fit px-6 h-12 bg-[#F24C20] hover:bg-[#E23C10] text-white rounded-full font-bold shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 ml-auto mr-2"
                >
                    <Plus className="w-5 h-5" />
                    Add FAQ
                </motion.button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total FAQs', value: faqs.length, gradient: 'from-blue-500/20 to-indigo-500/5', border: 'border-blue-500/20', text: 'text-blue-500', icon: <HelpCircle className="w-6 h-6 text-blue-500" /> },
                    { label: 'Active FAQs', value: faqs.filter(f => f.is_active).length, gradient: 'from-emerald-500/20 to-teal-500/5', border: 'border-emerald-500/20', text: 'text-emerald-500', icon: <CheckCircle className="w-6 h-6 text-emerald-500" /> },
                    { label: 'Categories', value: [...new Set(faqs.map(f => f.category))].length, gradient: 'from-orange-500/20 to-red-500/5', border: 'border-orange-500/20', text: 'text-orange-500', icon: <Zap className="w-6 h-6 text-orange-500" /> },
                ].map(s => (
                    <motion.div 
                        key={s.label} 
                        whileHover={{ y: -4, scale: 1.02 }}
                        className={`bg-gradient-to-br ${s.gradient} ${s.border} border dark:bg-[#1a1a1a]/40 backdrop-blur-md rounded-2xl p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300`}
                    >
                        <div>
                            <div className="text-3xl font-extrabold tracking-tight dark:text-white text-gray-900">{s.value}</div>
                            <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1">{s.label}</div>
                        </div>
                        <div className="p-3 bg-white dark:bg-[#262626] rounded-xl shadow-inner">
                            {s.icon}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Create/Edit Panel */}
                <div className="xl:col-span-12">
                    <AnimatePresence mode="wait">
                        {showForm ? (
                            <motion.div
                                key="form-open"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="bg-white/85 dark:bg-[#1a1a1a]/85 backdrop-blur-md rounded-2xl border border-orange-500/20 p-6 shadow-xl"
                            >
                                <div className="mb-6 border-b border-gray-100 dark:border-[#262626] pb-3">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-[#F24C20]/10 flex items-center justify-center text-[#F24C20]">
                                            {editingFAQ ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                        </div>
                                        {editingFAQ ? 'Edit FAQ Details' : 'Create New FAQ'}
                                    </h2>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs" style={{ marginLeft: '40px', marginTop: '12px' }}>
                                        Add clear, helpful answers to help users navigate and solve common platform issues quickly.
                                    </p>
                                </div>
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-650 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Question *</label>
                                        <input
                                            type="text"
                                            value={form.question}
                                            onChange={e => setForm({ ...form, question: e.target.value })}
                                            placeholder="e.g. How do I get paid?"
                                            className="w-full h-16 px-6 rounded-2xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#262626] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#F24C20] text-gray-950 dark:text-white transition-all duration-200 hover:border-gray-300 dark:hover:border-neutral-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-650 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Answer *</label>
                                        <div className="prose-editor faq-editor rounded-xl border border-gray-200 dark:border-[#262626] overflow-hidden bg-gray-50/50 dark:bg-[#0f0f0f]/50">
                                            <AdminRichTextEditor
                                                key={editingFAQ ? editingFAQ._id : 'new'}
                                                value={form.answer}
                                                onChange={(answer) => setForm({ ...form, answer })}
                                                placeholder="Detailed answer goes here..."
                                                minHeight={200}
                                                toolbarPreset="full"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-650 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Category</label>
                                            <select
                                                value={form.category}
                                                onChange={e => setForm({ ...form, category: e.target.value })}
                                                className="w-full h-16 px-6 rounded-2xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#262626] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#F24C20] text-gray-950 dark:text-white transition-all duration-200 hover:border-gray-300 dark:hover:border-neutral-700"
                                            >
                                                {CATEGORIES.map(c => <option key={c} className="bg-white dark:bg-[#1a1a1a]">{c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-650 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Sort Order</label>
                                            <input
                                                type="number"
                                                value={form.sort_order}
                                                onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })}
                                                className="w-full h-16 px-6 rounded-2xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#262626] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#F24C20] text-gray-950 dark:text-white transition-all duration-200 hover:border-gray-300 dark:hover:border-neutral-700"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-end gap-3 pt-3">
                                        <motion.button 
                                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                            onClick={resetForm} 
                                            className="w-[130px] h-12 flex items-center justify-center gap-2 rounded-2xl border border-gray-200 dark:border-[#262626] text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-[#262626] transition-all"
                                        >
                                            Cancel
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                            onClick={handleSubmit}
                                            disabled={saving}
                                            className="w-[130px] h-12 flex items-center justify-center gap-2 bg-[#F24C20] hover:bg-[#E23C10] disabled:opacity-60 text-white rounded-2xl font-bold shadow-lg shadow-orange-500/10 transition-all"
                                        >
                                            {saving ? 'Saving...' : <><CheckCircle className="w-5 h-5" /> {editingFAQ ? 'Update' : 'Create'}</>}
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="banner-closed"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={openAdd}
                                className="relative overflow-hidden bg-white/80 dark:bg-[#1a1a1a]/80 border border-orange-500/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 group animate-none cursor-pointer transition-all duration-300 shadow-sm max-w-3xl"
                            >
                                <div className="absolute right-0 top-0 -translate-y-12 translate-x-12 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-orange-500/20 transition-all duration-500" />
                                <div>
                                    <h2 className="text-lg font-bold text-[#F24C20] dark:text-white flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-[#F24C20]" />
                                        Create New FAQ
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md" style={{ marginLeft: '28px', marginTop: '10px' }}>Add clear, helpful answers to help users navigate and solve common platform issues quickly.</p>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={(e) => { e.stopPropagation(); openAdd(); }}
                                    className="w-fit px-6 h-12 bg-[#F24C20] hover:bg-[#E23C10] text-white rounded-full font-bold shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 ml-auto mr-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add FAQ
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* List Panel */}
                <div className="xl:col-span-12 space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" style={{ left: '18px' }} />
                        <input
                            type="text"
                            placeholder="Search FAQs by question or category..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full h-16 rounded-2xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#1a1a1a] pr-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#F24C20] text-gray-950 dark:text-white transition-all duration-200"
                            style={{ paddingLeft: '44px' }}
                        />
                    </div>

                    {/* FAQ List */}
                    {loading ? (
                        <div className="text-center py-16 text-gray-400">Loading FAQs...</div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#262626] shadow-sm flex flex-col items-center justify-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-[#262626] flex items-center justify-center">
                                <MessageCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {search ? 'No matches found' : 'No FAQs yet'}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{search ? 'Try adjusting your search keywords.' : 'Get started by creating your first FAQ.'}</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map((faq, index) => (
                                <motion.div
                                    key={faq._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.04 }}
                                    className={`bg-white dark:bg-[#1a1a1a] rounded-2xl border ${
                                        expandedId === faq._id 
                                            ? 'border-[#F24C20] dark:border-[#F24C20] shadow-[0_0_20px_rgba(242,76,32,0.05)]' 
                                            : faq.is_active 
                                                ? 'border-gray-200 dark:border-[#262626] hover:border-gray-300 dark:hover:border-gray-700' 
                                                : 'border-gray-100 dark:border-[#1a1a1a] opacity-65'
                                    } overflow-hidden transition-all duration-350`}
                                >
                                    <div
                                        className="flex items-center justify-between gap-4 p-5 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-[#262626]/30 transition-all duration-200"
                                        onClick={() => setExpandedId(expandedId === faq._id ? null : faq._id)}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2.5 mb-2 flex-wrap ml-8">
                                                <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${getCategoryBadge(faq.category)}`}>
                                                    {getCategoryIcon(faq.category)}
                                                    {faq.category}
                                                </span>
                                                {!faq.is_active && (
                                                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-555 font-semibold border border-gray-200 dark:border-gray-700">
                                                        <AlertCircle className="w-3.5 h-3.5" />
                                                        Inactive
                                                    </span>
                                                )}
                                                <span className="text-xs text-gray-400 dark:text-gray-550 ml-auto mr-2 font-medium">
                                                    Order: #{faq.sort_order}
                                                </span>
                                            </div>
                                            <p className="font-bold text-base text-gray-900 dark:text-white group-hover:text-[#F24C20] transition-colors leading-snug ml-8">{faq.question}</p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                                            <motion.button 
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleToggle(faq._id)} 
                                                className={`p-2 rounded-xl transition-all border ${
                                                    faq.is_active 
                                                        ? 'border-green-500/20 hover:bg-green-50 dark:hover:bg-green-500/10' 
                                                        : 'border-gray-300 dark:border-gray-700 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-650'
                                                }`}
                                                title={faq.is_active ? 'Deactivate FAQ' : 'Activate FAQ'}
                                            >
                                                {faq.is_active
                                                    ? <ToggleRight className="w-5 h-5 text-green-500" />
                                                    : <ToggleLeft className="w-5 h-5 text-white" />}
                                            </motion.button>
                                            <motion.button 
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleEdit(faq)} 
                                                className="p-2 border border-blue-500/20 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"
                                                title="Edit FAQ"
                                            >
                                                <Edit className="w-4.5 h-4.5 text-blue-500" />
                                            </motion.button>
                                            <motion.button 
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setDeleteTargetId(faq._id)} 
                                                className="p-2 border border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                                                title="Delete FAQ"
                                            >
                                                <Trash2 className="w-4.5 h-4.5 text-red-500" />
                                            </motion.button>
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                                {expandedId === faq._id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                            </div>
                                        </div>
                                    </div>
                                    <AnimatePresence>
                                        {expandedId === faq._id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="px-5 pb-6 border-t border-gray-100 dark:border-[#262626] bg-gray-50/30 dark:bg-[#0f0f0f]/10"
                                            >
                                                <div
                                                    className="prose max-w-none pt-5 ml-8 leading-relaxed text-gray-655 dark:prose-invert dark:text-gray-350 text-sm font-medium"
                                                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirm Modal */}
            {deleteTargetId && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md rounded-2xl border border-red-500/20 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-xl p-6 shadow-2xl"
                    >
                        <div className="flex items-center gap-3 mb-4 text-red-500">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                                <Trash2 className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete FAQ</h3>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                            Are you sure you want to delete this FAQ? This action cannot be undone and it will be permanently removed from the public website.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteTargetId(null)}
                                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-[#262626] text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteTargetId)}
                                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg shadow-red-600/15 transition-colors"
                            >
                                Delete FAQ
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
