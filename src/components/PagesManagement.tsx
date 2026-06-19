import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit, Trash2, Eye, FileText, CheckCircle, X, Search, Monitor, Smartphone, Globe } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';
import { AdminRichTextEditor } from './common/AdminRichTextEditor';

interface StaticPage {
  _id: string;
  title: string;
  slug: string;
  content: string;
  meta_title: string;
  meta_description: string;
  status: 'published' | 'draft';
  updatedAt: string;
  // Extra fields
  vision?: string;
  vision_icon?: string;
  mission?: string;
  mission_icon?: string;
  mission_points?: string[];
  differentiators?: { label: string; description: string; icon?: string }[];
  responsibilities?: string;
  image1?: string;
  image2?: string;
}

export function PagesManagement() {
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPage, setEditingPage] = useState<StaticPage | null>(null);
  const [form, setForm] = useState<Partial<StaticPage>>({ 
    title: '', slug: '', content: '', meta_title: '', meta_description: '', status: 'published',
    vision: '', vision_icon: 'Target', mission: '', mission_icon: 'Sparkles',
    mission_points: [], differentiators: [], responsibilities: '', image1: '', image2: ''
  });
  const [image1File, setImage1File] = useState<File | null>(null);
  const [image2File, setImage2File] = useState<File | null>(null);
  const [previews, setPreviews] = useState({ image1: '', image2: '' });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  const fetchPages = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cms/pages');
      setPages(res.data.pages || []);
    } catch {
      toast.error('Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPages(); }, []);

  const resetForm = () => {
    setForm({ 
      title: '', slug: '', content: '', meta_title: '', meta_description: '', status: 'published',
      vision: '', vision_icon: 'Target', mission: '', mission_icon: 'Sparkles',
      mission_points: [], differentiators: [], responsibilities: '', image1: '', image2: ''
    });
    setImage1File(null);
    setImage2File(null);
    setPreviews({ image1: '', image2: '' });
    setEditingPage(null);
    setShowForm(false);
  };

  const handleEdit = (page: StaticPage) => {
    setEditingPage(page);
    setForm({ 
      title: page.title, slug: page.slug, content: page.content, 
      meta_title: page.meta_title, meta_description: page.meta_description, status: page.status,
      vision: page.vision || '',
      vision_icon: page.vision_icon || 'Target',
      mission: page.mission || '',
      mission_icon: page.mission_icon || 'Sparkles',
      mission_points: page.mission_points || [],
      differentiators: page.differentiators || [],
      responsibilities: page.responsibilities || '',
      image1: page.image1 || '',
      image2: page.image2 || ''
    });
    setPreviews({ image1: page.image1 || '', image2: page.image2 || '' });
    setShowForm(true);
  };

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    setForm(prev => ({
      ...prev,
      title,
      slug: prev.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    }));
  };

  const handleSubmit = async () => {
    if (!form.title?.trim() || !form.slug?.trim()) {
      toast.error('Title and slug are required');
      return;
    }
    setSaving(true);
    try {
      const data = new FormData();
      Object.keys(form).forEach(key => {
        const val = (form as any)[key];
        if (val !== undefined && key !== 'image1' && key !== 'image2') {
          if (Array.isArray(val) || (typeof val === 'object' && val !== null)) {
            data.append(key, JSON.stringify(val));
          } else {
            data.append(key, val);
          }
        }
      });
      if (image1File) data.append('image1', image1File);
      if (image2File) data.append('image2', image2File);

      if (editingPage) {
        await api.put(`/cms/pages/${editingPage._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Page updated!');
      } else {
        await api.post('/cms/pages', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Page created!');
      }
      fetchPages();
      resetForm();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this page?')) return;
    try {
      await api.delete(`/cms/pages/${id}`);
      toast.success('Page deleted');
      fetchPages();
    } catch {
      toast.error('Failed to delete page');
    }
  };

  const filtered = pages.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#044071] dark:text-white mb-1">Pages Management</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage static pages like About, Terms, Privacy</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-[#F24C20] hover:bg-[#d43a12] text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Page
        </motion.button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-6xl mx-auto bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-200 dark:border-[#262626] p-8 shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-[#262626]">
              <div>
                <h2 className="text-2xl font-bold text-[#044071] dark:text-white">{editingPage ? 'Edit Page' : 'Create New Page'}</h2>
                <p className="text-sm text-gray-500">Fill in the details below to {(editingPage ? 'update the' : 'create a new')} static page.</p>
              </div>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 dark:hover:bg-[#262626] rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Section 1: Page Details */}
              <div className="p-6 rounded-2xl border border-gray-200 dark:border-[#262626] bg-gray-50/50 dark:bg-[#262626]/20 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-4 bg-[#F24C20] rounded-full" />
                  <span className="text-sm font-bold uppercase tracking-wider text-[#044071] dark:text-gray-300">Page Configuration</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Title *</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={e => handleTitleChange(e.target.value)}
                      placeholder="e.g. About Us"
                      className="w-full h-16 px-6 rounded-2xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#262626] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#F24C20] text-gray-950 dark:text-white transition-all duration-200 hover:border-gray-300 dark:hover:border-neutral-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Slug *</label>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={e => setForm({ ...form, slug: e.target.value })}
                      placeholder="e.g. about"
                      className="w-full h-16 px-6 rounded-2xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#262626] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#F24C20] text-gray-950 dark:text-white transition-all duration-200 hover:border-gray-300 dark:hover:border-neutral-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Status</label>
                    <select
                      value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value as any })}
                      className="w-full h-16 px-6 rounded-2xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#262626] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#F24C20] text-gray-950 dark:text-white cursor-pointer transition-all duration-200 hover:border-gray-300 dark:hover:border-neutral-700"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* About Us Specific Fields */}
              {(form.slug?.toLowerCase().trim() === 'about-us' || form.slug?.toLowerCase().trim() === 'about' || form.slug?.toLowerCase().trim() === 'aboutus') && (
                <div className="space-y-6 p-6 rounded-2xl bg-gray-50/50 dark:bg-[#262626]/20 border border-gray-200 dark:border-[#262626]">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-[#262626]">
                    <div className="w-1.5 h-4 bg-[#F24C20] rounded-full" />
                    <span className="text-sm font-bold uppercase tracking-wider text-[#044071] dark:text-gray-300">About Us Structured Content</span>
                  </div>

                  {/* Vision & Mission Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Vision Card */}
                    <div className="p-5 rounded-2xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#1a1a1a]/55 space-y-4 shadow-sm">
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-[#262626]">
                        <div className="w-1.5 h-3 bg-[#F24C20]/80 rounded-full" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#044071] dark:text-gray-300">Vision Settings</span>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Vision Icon (Lucide Name)</label>
                        <input 
                          type="text"
                          value={form.vision_icon}
                          onChange={e => setForm({ ...form, vision_icon: e.target.value })}
                          className="w-full h-16 px-6 rounded-2xl border border-gray-200 dark:border-[#262626] bg-gray-50/50 dark:bg-[#262626] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#F24C20] text-gray-950 dark:text-white transition-all duration-200 hover:border-gray-300 dark:hover:border-neutral-700"
                          placeholder="e.g. Target, Eye, Rocket"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Our Vision Statement</label>
                        <textarea 
                          value={form.vision}
                          onChange={e => setForm({ ...form, vision: e.target.value })}
                          placeholder="e.g. To create a commission-free freelancing environment where talent meets opportunity directly."
                          className="w-full px-6 py-4.5 rounded-2xl border border-gray-200 dark:border-[#262626] bg-gray-50/50 dark:bg-[#262626] focus:outline-none focus:ring-2 focus:ring-[#F24C20] min-h-[130px] text-sm font-semibold resize-none text-gray-950 dark:text-white transition-all duration-200 hover:border-gray-300 dark:hover:border-neutral-700"
                        />
                      </div>
                    </div>

                    {/* Mission Card */}
                    <div className="p-5 rounded-2xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#1a1a1a]/55 space-y-4 shadow-sm">
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-[#262626]">
                        <div className="w-1.5 h-3 bg-[#F24C20]/80 rounded-full" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#044071] dark:text-gray-300">Mission Settings</span>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Mission Icon (Lucide Name)</label>
                        <input 
                          type="text"
                          value={form.mission_icon}
                          onChange={e => setForm({ ...form, mission_icon: e.target.value })}
                          className="w-full h-16 px-6 rounded-2xl border border-gray-200 dark:border-[#262626] bg-gray-50/50 dark:bg-[#262626] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#F24C20] text-gray-950 dark:text-white transition-all duration-200 hover:border-gray-300 dark:hover:border-neutral-700"
                          placeholder="e.g. Sparkles, Zap, Heart"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Our Mission Statement</label>
                        <textarea 
                          value={form.mission}
                          onChange={e => setForm({ ...form, mission: e.target.value })}
                          placeholder="e.g. To empower freelancers with full control over their earnings and help clients hire talent without hidden fees."
                          className="w-full px-6 py-4.5 rounded-2xl border border-gray-200 dark:border-[#262626] bg-gray-50/50 dark:bg-[#262626] focus:outline-none focus:ring-2 focus:ring-[#F24C20] min-h-[130px] text-sm font-semibold resize-none text-gray-950 dark:text-white transition-all duration-200 hover:border-gray-300 dark:hover:border-neutral-700"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bullet Points & Brand Promise Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Mission Points Card */}
                    <div className="p-5 rounded-2xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#1a1a1a]/55 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-[#262626]">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-3 bg-[#F24C20]/80 rounded-full" />
                          <span className="text-xs font-bold uppercase tracking-wider text-[#044071] dark:text-gray-300">Mission Points (Bullet List)</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setForm({ ...form, mission_points: [...(form.mission_points || []), ''] })}
                          className="text-[#F24C20] hover:text-[#d43a12] text-xs font-extrabold hover:bg-[#F24C20]/5 px-2 py-1 rounded transition-colors"
                        >
                          + Add Point
                        </button>
                      </div>

                      {form.mission_points?.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm italic">
                          No mission points added yet. Click "+ Add Point" to begin.
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin">
                          {form.mission_points?.map((point, idx) => (
                            <div key={idx} className="flex gap-2 group">
                              <div className="flex-1 relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#F24C20]" />
                                <input 
                                  value={point}
                                  onChange={e => {
                                    const newPoints = [...(form.mission_points || [])];
                                    newPoints[idx] = e.target.value;
                                    setForm({ ...form, mission_points: newPoints });
                                  }}
                                  className="w-full h-[52px] pl-10 pr-5 rounded-2xl border border-gray-200 dark:border-[#262626] bg-gray-50/50 dark:bg-[#262626] text-gray-950 dark:text-white font-semibold focus:ring-1 focus:ring-[#F24C20] transition-all duration-200 hover:border-gray-300 dark:hover:border-neutral-700"
                                  placeholder="e.g. 100% Commission Free Model"
                                />
                              </div>
                              <button 
                                type="button"
                                onClick={() => setForm({ ...form, mission_points: form.mission_points?.filter((_, i) => i !== idx) })}
                                className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Brand Promise Card */}
                    <div className="p-5 rounded-2xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#1a1a1a]/55 space-y-4 shadow-sm">
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-[#262626]">
                        <div className="w-1.5 h-3 bg-[#F24C20]/80 rounded-full" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#044071] dark:text-gray-300">Brand Promise</span>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Our Promise (Footer CTA Text)</label>
                        <textarea 
                          value={form.responsibilities}
                          onChange={e => setForm({ ...form, responsibilities: e.target.value })}
                          className="w-full px-6 py-4.5 rounded-2xl border border-gray-200 dark:border-[#262626] bg-gray-50/50 dark:bg-[#262626] focus:outline-none focus:ring-2 focus:ring-[#F24C20] min-h-[130px] text-sm font-semibold resize-none text-gray-950 dark:text-white transition-all duration-200 hover:border-gray-300 dark:hover:border-neutral-700"
                          placeholder="e.g. We’re not just a platform—we’re a community where talent meets opportunity without barriers."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Differentiators & Media Section */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Differentiators Card - Spans 2 columns */}
                    <div className="md:col-span-2 p-5 rounded-2xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#1a1a1a]/55 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-[#262626]">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-3 bg-[#F24C20]/80 rounded-full" />
                          <span className="text-xs font-bold uppercase tracking-wider text-[#044071] dark:text-gray-300">Key Differentiators</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setForm({ ...form, differentiators: [...(form.differentiators || []), { label: '', description: '', icon: 'ShieldCheck' }] })}
                          className="text-[#F24C20] hover:text-[#d43a12] text-xs font-extrabold hover:bg-[#F24C20]/5 px-2 py-1 rounded transition-colors"
                        >
                          + Add Differentiator
                        </button>
                      </div>

                      {form.differentiators?.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm italic">
                          No differentiators added yet. Click "+ Add Differentiator" to begin.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
                          {form.differentiators?.map((diff, idx) => (
                            <div key={idx} className="relative p-4 rounded-xl border border-gray-200 dark:border-[#262626] bg-gray-50/30 dark:bg-[#262626]/20 space-y-3 shadow-sm group">
                              <button 
                                type="button"
                                onClick={() => setForm({ ...form, differentiators: form.differentiators?.filter((_, i) => i !== idx) })}
                                className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors md:opacity-0 md:group-hover:opacity-100"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              
                              <div className="grid grid-cols-3 gap-2">
                                <div className="col-span-1">
                                  <label className="block text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500 mb-1">Icon</label>
                                  <input 
                                    value={diff.icon}
                                    onChange={e => {
                                      const newDiffs = [...(form.differentiators || [])];
                                      newDiffs[idx].icon = e.target.value;
                                      setForm({ ...form, differentiators: newDiffs });
                                    }}
                                    className="w-full h-[38px] px-3 rounded-lg border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#262626] text-gray-950 dark:text-white font-semibold focus:ring-1 focus:ring-[#F24C20] text-xs transition-all duration-200 hover:border-gray-300 dark:hover:border-neutral-700"
                                    placeholder="ShieldCheck"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <label className="block text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500 mb-1">Label</label>
                                  <input 
                                    value={diff.label}
                                    onChange={e => {
                                      const newDiffs = [...(form.differentiators || [])];
                                      newDiffs[idx].label = e.target.value;
                                      setForm({ ...form, differentiators: newDiffs });
                                    }}
                                    className="w-full h-[38px] px-3 rounded-lg border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#262626] text-gray-950 dark:text-white font-semibold focus:ring-1 focus:ring-[#F24C20] text-xs transition-all duration-200 hover:border-gray-300 dark:hover:border-neutral-700"
                                    placeholder="e.g. Zero Fees"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500 mb-1">Description</label>
                                <textarea 
                                  value={diff.description}
                                  onChange={e => {
                                    const newDiffs = [...(form.differentiators || [])];
                                    newDiffs[idx].description = e.target.value;
                                    setForm({ ...form, differentiators: newDiffs });
                                  }}
                                  className="w-full px-3.5 py-2 rounded-lg border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#262626] text-gray-950 dark:text-white focus:ring-1 focus:ring-[#F24C20] text-xs min-h-[60px] resize-none transition-all duration-200 hover:border-gray-300 dark:hover:border-neutral-700"
                                  placeholder="Brief description of the differentiator..."
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Media Uploads Card - Spans 1 column */}
                    <div className="p-5 rounded-2xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#1a1a1a]/55 space-y-4 shadow-sm">
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-[#262626]">
                        <div className="w-1.5 h-3 bg-[#F24C20]/80 rounded-full" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#044071] dark:text-gray-300">Featured Media</span>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="relative group">
                          <label className="block text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500 mb-1">About Image 1 (Hero)</label>
                          <div className="relative h-24 w-full rounded-xl border-2 border-dashed border-gray-200 dark:border-[#262626] hover:border-[#F24C20]/30 transition-all overflow-hidden bg-gray-50/50 dark:bg-[#262626]/40 flex flex-col items-center justify-center p-2">
                            {previews.image1 ? (
                              <>
                                <img src={previews.image1.startsWith('blob:') ? previews.image1 : `${import.meta.env.VITE_API_URL}${previews.image1}`} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <span className="text-white text-[10px] font-bold">Change Image</span>
                                </div>
                              </>
                            ) : (
                              <div className="text-center">
                                <Plus className="w-4 h-4 text-gray-400 mx-auto mb-0.5" />
                                <span className="text-[10px] text-gray-500">Upload Hero Image</span>
                              </div>
                            )}
                            <input 
                              type="file" 
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setImage1File(file);
                                  setPreviews(p => ({ ...p, image1: URL.createObjectURL(file) }));
                                }
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </div>
                        </div>

                        <div className="relative group">
                          <label className="block text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500 mb-1">About Image 2 (Side)</label>
                          <div className="relative h-24 w-full rounded-xl border-2 border-dashed border-gray-200 dark:border-[#262626] hover:border-[#F24C20]/30 transition-all overflow-hidden bg-gray-50/50 dark:bg-[#262626]/40 flex flex-col items-center justify-center p-2">
                            {previews.image2 ? (
                              <>
                                <img src={previews.image2.startsWith('blob:') ? previews.image2 : `${import.meta.env.VITE_API_URL}${previews.image2}`} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <span className="text-white text-[10px] font-bold">Change Image</span>
                                </div>
                              </>
                            ) : (
                              <div className="text-center">
                                <Plus className="w-4 h-4 text-gray-400 mx-auto mb-0.5" />
                                <span className="text-[10px] text-gray-500">Upload Side Image</span>
                              </div>
                            )}
                            <input 
                              type="file" 
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setImage2File(file);
                                  setPreviews(p => ({ ...p, image2: URL.createObjectURL(file) }));
                                }
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Section 3: Main Content Editor Card */}
              <div className="p-6 rounded-2xl border border-gray-200 dark:border-[#262626] bg-gray-50/50 dark:bg-[#262626]/20 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-4 bg-[#F24C20] rounded-full" />
                  <span className="text-sm font-bold uppercase tracking-wider text-[#044071] dark:text-gray-300">Main Page Content (Top Hero Area)</span>
                </div>
                <div className="rounded-xl overflow-hidden bg-white dark:bg-[#1a1a1a]">
                  <AdminRichTextEditor
                    value={form.content || ''}
                    onChange={(content) => setForm({ ...form, content })}
                    placeholder="Start writing your page content here..."
                    minHeight={320}
                    toolbarPreset="full"
                  />
                </div>
              </div>

              {/* Section 4: SEO Settings Card with Google Search Preview */}
              <div className="p-6 rounded-2xl border border-gray-200 dark:border-[#262626] bg-gray-50/50 dark:bg-[#262626]/20 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-4 bg-[#F24C20] rounded-full" />
                  <span className="text-sm font-bold uppercase tracking-wider text-[#044071] dark:text-gray-300">Search Engine Optimization (SEO) Settings</span>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* SEO Inputs (Left) */}
                  <div className="lg:col-span-3 space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Meta Title</label>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          (form.meta_title || '').length > 60 
                            ? 'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400' 
                            : (form.meta_title || '').length >= 50 
                              ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' 
                              : 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-gray-400'
                        }`}>
                          {(form.meta_title || '').length} / 60 chars
                        </span>
                      </div>
                      <input
                        type="text"
                        value={form.meta_title || ''}
                        onChange={e => setForm({ ...form, meta_title: e.target.value })}
                        placeholder="e.g. About Us | Go Experts"
                        className="w-full h-16 px-6 rounded-2xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#262626] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#F24C20] text-gray-950 dark:text-white transition-all duration-200 hover:border-gray-300 dark:hover:border-neutral-700"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Meta Description</label>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          (form.meta_description || '').length > 160 
                            ? 'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400' 
                            : (form.meta_description || '').length >= 120 
                              ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' 
                              : 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-gray-400'
                        }`}>
                          {(form.meta_description || '').length} / 160 chars
                        </span>
                      </div>
                      <textarea
                        value={form.meta_description || ''}
                        onChange={e => setForm({ ...form, meta_description: e.target.value })}
                        placeholder="Enter a brief description for search engines..."
                        className="w-full px-6 py-4.5 rounded-2xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#262626] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#F24C20] text-gray-950 dark:text-white min-h-[140px] resize-none transition-all duration-200 hover:border-gray-300 dark:hover:border-neutral-700"
                      />
                    </div>
                  </div>

                  {/* Google Preview (Right) */}
                  <div className="lg:col-span-2 flex flex-col justify-start space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Google Search Preview</label>
                      
                      {/* Desktop / Mobile Toggle */}
                      <div className="flex items-center bg-gray-100 dark:bg-neutral-800 p-0.5 rounded-xl border border-gray-200 dark:border-neutral-700">
                        <button
                          type="button"
                          onClick={() => setPreviewDevice('desktop')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                            previewDevice === 'desktop'
                              ? 'bg-white dark:bg-neutral-700 text-[#044071] dark:text-white shadow-sm'
                              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                          }`}
                        >
                          <Monitor className="w-3.5 h-3.5" />
                          Desktop
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewDevice('mobile')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                            previewDevice === 'mobile'
                              ? 'bg-white dark:bg-neutral-700 text-[#044071] dark:text-white shadow-sm'
                              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                          }`}
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          Mobile
                        </button>
                      </div>
                    </div>

                    {/* Preview Box */}
                    <div className="w-full rounded-2xl border border-gray-200 dark:border-[#262626] overflow-hidden bg-white dark:bg-[#1a1a1a] shadow-sm flex flex-col">
                      {/* Browser Mockup Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#262626] bg-gray-50/50 dark:bg-[#1f1f1f]/50">
                        {/* Browser controls */}
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-red-400/80" />
                          <div className="w-2 h-2 rounded-full bg-yellow-400/80" />
                          <div className="w-2 h-2 rounded-full bg-green-400/80" />
                        </div>
                        <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider select-none">
                          Google Search Simulation
                        </span>
                        <div className="w-8" />
                      </div>

                      {/* Mockup Body */}
                      <div className="p-6 flex flex-col justify-center min-h-[160px]">
                        {previewDevice === 'desktop' ? (
                          /* Desktop Result */
                          <div className="space-y-1.5">
                            {/* Url and site name */}
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 truncate">
                              <div className="w-4 h-4 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center border border-gray-200 dark:border-neutral-700">
                                <Globe className="w-2.5 h-2.5 text-gray-400 dark:text-gray-500" />
                              </div>
                              <span className="font-semibold text-gray-750 dark:text-gray-300">Go Experts</span>
                              <span className="text-gray-400 dark:text-gray-500">https://goexperts.in › {form.slug || ''}</span>
                            </div>
                            
                            {/* Title */}
                            <h3 className="text-[#1a0dab] dark:text-[#8ab4f8] text-lg font-medium leading-normal hover:underline cursor-pointer truncate">
                              {form.meta_title || form.title || 'Page Title'}
                            </h3>
                            
                            {/* Description */}
                            <p className="text-[#4d5156] dark:text-[#bdc1c6] text-xs leading-relaxed line-clamp-2">
                              {form.meta_description || 'Please enter a meta description to see how this page will appear in search engine listings.'}
                            </p>
                          </div>
                        ) : (
                          /* Mobile Result */
                          <div className="space-y-2 max-w-[340px] mx-auto w-full">
                            {/* Mobile Url header */}
                            <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center border border-gray-200 dark:border-neutral-700">
                                <Globe className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-tight">Go Experts</span>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-none truncate">https://goexperts.in › {form.slug || ''}</span>
                              </div>
                            </div>

                            {/* Title */}
                            <h3 className="text-[#15c] dark:text-[#8ab4f8] text-base font-medium leading-tight hover:underline cursor-pointer">
                              {form.meta_title || form.title || 'Page Title'}
                            </h3>

                            {/* Description */}
                            <p className="text-[#4d5156] dark:text-[#bdc1c6] text-xs leading-relaxed line-clamp-3">
                              {form.meta_description || 'Please enter a meta description to see how this page will appear in search engine listings.'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-[#262626]">
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center justify-center gap-2 bg-[#F24C20] hover:bg-[#d43a12] disabled:opacity-60 text-white px-8 rounded-xl font-semibold text-sm shadow-md"
                style={{ height: '48px' }}
              >
                <CheckCircle className="w-4 h-4" />
                {saving ? 'Saving...' : editingPage ? 'Update Page' : 'Create Page'}
              </motion.button>
              <button 
                onClick={resetForm} 
                className="flex items-center justify-center px-8 rounded-xl border border-gray-300 dark:border-[#262626] hover:bg-gray-50 dark:hover:bg-[#262626] text-sm font-semibold"
                style={{ height: '48px' }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative">
        <Search className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" style={{ left: '18px' }} />
        <input
          type="text"
          placeholder="Search pages..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pr-4 py-3 rounded-xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
          style={{ paddingLeft: '44px' }}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading pages...</div>
      ) : (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#262626] overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#262626]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">#</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Page Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Slug / URL</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Last Updated</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#262626]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    No pages yet. Click "Add Page" to create one.
                  </td>
                </tr>
              ) : filtered.map((page, index) => (
                <motion.tr
                  key={page._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{page.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">/{page.slug}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${page.status === 'published' ? 'bg-green-100 dark:bg-green-900/20 text-green-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                      {page.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(page.updatedAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <motion.a
                        href={`http://localhost:5175/${page.slug}`}
                        target="_blank"
                        whileHover={{ scale: 1.1 }}
                        className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                      >
                        <Eye className="w-4 h-4 text-green-600" />
                      </motion.a>
                      <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleEdit(page)} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                        <Edit className="w-4 h-4 text-blue-600" />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleDelete(page._id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
