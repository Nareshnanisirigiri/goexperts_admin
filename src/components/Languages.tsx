import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Plus, Edit, Trash2, Globe, CheckCircle, X } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';

interface LanguagesProps {
  onNavigate: (page: string) => void;
}

export function Languages({ onNavigate }: LanguagesProps) {
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Language added successfully!');
  const [editingLanguage, setEditingLanguage] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', code: '' });

  const [languagesList, setLanguagesList] = useState([
    { id: 1, name: 'English', code: 'en', level: 'Native', users: 2145, status: 'active' },
    { id: 2, name: 'Hindi', code: 'hi', level: 'Fluent', users: 1834, status: 'active' },
    { id: 3, name: 'Spanish', code: 'es', level: 'Professional', users: 892, status: 'active' },
    { id: 4, name: 'French', code: 'fr', level: 'Professional', users: 654, status: 'active' },
    { id: 5, name: 'German', code: 'de', level: 'Professional', users: 543, status: 'active' },
    { id: 6, name: 'Arabic', code: 'ar', level: 'Conversational', users: 432, status: 'active' },
    { id: 7, name: 'Chinese', code: 'zh', level: 'Professional', users: 387, status: 'active' },
    { id: 8, name: 'Japanese', code: 'ja', level: 'Conversational', users: 276, status: 'active' },
    { id: 9, name: 'Portuguese', code: 'pt', level: 'Professional', users: 234, status: 'active' },
    { id: 10, name: 'Russian', code: 'ru', level: 'Conversational', users: 198, status: 'active' },
  ]);

  const openAddForm = () => {
    if (showForm && !editingLanguage) {
      setShowForm(false);
    } else {
      setEditingLanguage(null);
      setFormData({ name: '', code: '' });
      setShowForm(true);
    }
  };

  const openEditForm = (lang: any) => {
    setEditingLanguage(lang);
    setFormData({ name: lang.name, code: lang.code });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.code.trim()) return;

    if (editingLanguage) {
      setLanguagesList(languagesList.map(lang => 
        lang.id === editingLanguage.id 
          ? { ...lang, name: formData.name, code: formData.code }
          : lang
      ));
      setSuccessMessage('Language updated successfully!');
    } else {
      const newLang = {
        id: Date.now(),
        name: formData.name,
        code: formData.code,
        level: 'Fluent',
        users: 0,
        status: 'active'
      };
      setLanguagesList([newLang, ...languagesList]);
      setSuccessMessage('Language added successfully!');
    }
    setShowSuccess(true);
    setShowForm(false);
    setEditingLanguage(null);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleDelete = (id: number) => {
    setLanguagesList(languagesList.filter(lang => lang.id !== id));
    setSuccessMessage('Language deleted successfully!');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div>
      <Breadcrumb 
        items={[{ label: 'Taxonomies', path: 'categories' }, { label: 'Languages' }]} 
        onNavigate={onNavigate}
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#044071] dark:text-white mb-2">Languages</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage language options for freelancers</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openAddForm}
          className="bg-[#F24C20] hover:bg-[#d43a12] text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Language
        </motion.button>
      </div>

      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6 flex items-center gap-3"
        >
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800 dark:text-green-200 font-medium">{successMessage}</span>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#262626] mb-6 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#044071] dark:text-white text-lg">
                {editingLanguage ? 'Edit Language' : 'Add New Language'}
              </h3>
              <button
                onClick={() => { setShowForm(false); setEditingLanguage(null); }}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#262626] rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-sm font-bold text-gray-750 dark:text-gray-400 mb-2 uppercase tracking-wider">Language Name</label>
                <input
                  type="text"
                  placeholder="e.g., Italian"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#262626] text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-750 dark:text-gray-400 mb-2 uppercase tracking-wider">Language Code</label>
                <input
                  type="text"
                  placeholder="e.g., it"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#262626] text-gray-955 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setShowForm(false); setEditingLanguage(null); }}
                className="px-5 h-11 rounded-xl border border-gray-200 dark:border-[#262626] text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-[#262626] transition-all"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className="px-6 h-11 bg-[#F24C20] hover:bg-[#d43a12] text-white rounded-xl font-bold transition-all"
              >
                {editingLanguage ? 'Update Language' : 'Create Language'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {languagesList.map((language, index) => (
          <motion.div
            key={language.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#262626]"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(242, 76, 32, 0.1)' }}>
                <Globe className="w-6 h-6 text-[#F24C20]" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                {language.status}
              </span>
            </div>

            <h3 className="text-xl font-bold text-[#044071] dark:text-white mb-2">{language.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Code: {language.code}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Proficiency Level:</span>
                <span className="font-medium">{language.level}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Users:</span>
                <span className="font-bold text-[#F24C20]">{language.users.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openEditForm(language)}
                className="flex-1 bg-[#F24C20] hover:bg-[#d43a12] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDelete(language.id)}
                className="px-4 py-2 rounded-lg border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
