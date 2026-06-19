import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Trash2, 
  Search, 
  Calendar, 
  User, 
  Phone, 
  MessageSquare, 
  CheckCircle,
  Eye,
  X,
  AlertCircle
} from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  subject: string;
  message: string;
  createdAt: string;
}

export function ContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/contact-messages');
      if (res.data.success) {
        setMessages(res.data.messages);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      const res = await api.delete(`/admin/contact-messages/${id}`);
      if (res.data.success) {
        toast.success('Message deleted');
        setMessages(prev => prev.filter(m => m._id !== id));
        if (selectedMessage?._id === id) setSelectedMessage(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete message');
    }
  };

  const filteredMessages = messages.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedMessage) {
    return (
      <div className="space-y-6">
        {/* Header & Back Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedMessage(null)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-[#262626] text-sm font-semibold transition-all duration-200 text-gray-700 dark:text-gray-200 shadow-sm"
            >
              <span>&larr;</span> Back to Inquiries
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#044071] dark:text-white">Inquiry Details</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Reviewing inquiry from {selectedMessage.name}</p>
            </div>
          </div>
          
          <button
            onClick={async () => {
              await deleteMessage(selectedMessage._id);
            }}
            className="flex items-center gap-2 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
            title="Delete Inquiry"
          >
            <Trash2 className="w-4 h-4" />
            Delete Message
          </button>
        </div>

        {/* Message Details Page Card */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-200 dark:border-[#262626] p-8 shadow-sm space-y-8 max-w-4xl">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 rounded-2xl bg-gray-55/10 dark:bg-[#262626]/20 border border-gray-100 dark:border-[#262626]/40">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Sender Name</span>
              <div className="flex items-center gap-2 font-semibold text-gray-950 dark:text-white text-sm">
                <User className="w-4 h-4 text-gray-400" />
                {selectedMessage.name}
              </div>
            </div>
            <div className="space-y-1 min-w-0">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Email Address</span>
              <div className="flex items-center gap-2 font-semibold text-gray-950 dark:text-white text-sm truncate">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="truncate" title={selectedMessage.email}>{selectedMessage.email}</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Phone Number</span>
              <div className="flex items-center gap-2 font-semibold text-gray-950 dark:text-white text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                {selectedMessage.phoneNumber || 'Not Provided'}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Received Date</span>
              <div className="flex items-center gap-2 font-semibold text-gray-950 dark:text-white text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                {new Date(selectedMessage.createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Subject Area */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Subject</span>
            <h2 className="text-lg font-bold text-[#044071] dark:text-blue-400 bg-gray-50 dark:bg-[#262626]/20 p-5 rounded-2xl border border-gray-100 dark:border-[#262626]/30 leading-snug">
              {selectedMessage.subject}
            </h2>
          </div>

          {/* Message Body Area */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Message Body</span>
            <div className="p-8 bg-gray-50 dark:bg-[#262626]/10 rounded-2xl border border-gray-100 dark:border-[#262626]/20 whitespace-pre-wrap leading-relaxed text-gray-850 dark:text-gray-200 text-sm min-h-[220px]">
              {selectedMessage.message}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-[#262626]">
            <button
              onClick={() => setSelectedMessage(null)}
              className="px-6 py-3 rounded-xl border border-gray-200 dark:border-[#262626] hover:bg-gray-50 dark:hover:bg-[#262626] text-sm font-semibold transition-colors"
            >
              Back to Inquiries
            </button>
            <a
              href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
              className="px-6 py-3 rounded-xl font-bold bg-[#F24C20] text-white hover:bg-orange-600 transition-all flex items-center gap-2 shadow-lg shadow-[#F24C20]/20 text-sm"
            >
              <MessageSquare className="w-4 h-4" />
              Reply via Email
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Contact Inquiries</h1>
          <p className="text-gray-550 text-sm">Review and respond to user messages from the frontend.</p>
        </div>
        
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-405" />
          <input
            type="text"
            placeholder="Search by name, email or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#262626] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#262626] bg-gray-50/50 dark:bg-[#262626]/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Sender</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Subject</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#262626]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 dark:bg-[#262626] rounded w-32" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 dark:bg-[#262626] rounded w-48" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 dark:bg-[#262626] rounded w-24" /></td>
                    <td className="px-6 py-4"><div className="h-8 bg-gray-100 dark:bg-[#262626] rounded w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                    No inquiries found.
                  </td>
                </tr>
              ) : (
                filteredMessages.map((msg) => (
                  <tr key={msg._id} className="hover:bg-gray-50 dark:hover:bg-[#262626]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{msg.name}</span>
                        <span className="text-xs text-gray-500">{msg.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                        {msg.subject}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedMessage(msg)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg transition-colors"
                          title="View Message"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteMessage(msg._id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
