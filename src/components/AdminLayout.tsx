import { useState, useEffect } from 'react';
import api from '../lib/api';
import logoFallback from '../assets/logo.png';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Briefcase,
  Rocket,
  Lightbulb,
  Wallet,
  Scale,
  FileText,
  Tags,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Bell,
  Moon,
  Sun,
  Menu,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  AlertCircle,
  ShoppingBag,
  DollarSign,
  Percent,
  RotateCcw,
  FileCheck,
  Grid3x3,
  MessageSquare,
  Home,
  Image,
  Mail,
  Crown,
  X,
  Loader2
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  adminUser?: { full_name?: string; email?: string; roles?: string[] } | null;
  notificationCount: number;
  onClearNotifications: () => void;
  onSelectUser?: (userId: string) => void;
  onSelectProject?: (projectId: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  submenu?: { id: string; label: string; icon: React.ReactNode }[];
}

export function AdminLayout({ 
  children, 
  darkMode, 
  onToggleDarkMode, 
  currentPage, 
  onNavigate, 
  onLogout, 
  adminUser,
  notificationCount,
  onClearNotifications,
  onSelectUser,
  onSelectProject
}: AdminLayoutProps) {
  const { settings } = useSiteSettings();

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      id: 'users',
      label: 'User Management ',
      icon: <Users className="w-5 h-5" />,
      submenu: [
        { id: 'users', label: 'Users/Customers', icon: <Users className="w-4 h-4" /> }
      ]
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: <FolderKanban className="w-5 h-5" />,
      submenu: [
        { id: 'projects', label: 'Project Listings', icon: <ClipboardList className="w-4 h-4" /> },
        // { id: 'proposals', label: 'Proposals Overview', icon: <FileText className="w-4 h-4" /> }
      ]
    },
    {
      id: 'startup-ideas',
      label: 'Startup Ideas',
      icon: <Rocket className="w-5 h-5" />,
      submenu: [
        { id: 'startup-ideas', label: 'Manage Ideas', icon: <Lightbulb className="w-4 h-4" /> },
        { id: 'startup-categories', label: 'Idea Categories', icon: <Grid3x3 className="w-4 h-4" /> },
        { id: 'startup-ideas-faq', label: 'Startup Ideas FAQ', icon: <MessageSquare className="w-4 h-4" /> },
        { id: 'startup-ideas-terms', label: 'Terms & Conditions', icon: <Scale className="w-4 h-4" /> },
        { id: 'startup-ideas-privacy', label: 'Privacy Policy', icon: <FileCheck className="w-4 h-4" /> },
        { id: 'investor-meetings', label: 'Investor Meetings', icon: <Briefcase className="w-4 h-4" /> },
        { id: 'investor-opportunities', label: 'Opportunities Tracking', icon: <ClipboardList className="w-4 h-4" /> }
      ]
    },
    {
      id: 'subscriptions',
      label: 'Subscriptions',
      icon: <Crown className="w-5 h-5" />,
      submenu: [
        { id: 'subscriptions', label: 'Plans & Management', icon: <Crown className="w-4 h-4" /> },
      ]
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: <Wallet className="w-5 h-5" />,
      submenu: [
        { id: 'withdraw-requests', label: 'Withdrawal Requests', icon: <Wallet className="w-4 h-4" /> },
      ]
    },
    {
      id: 'disputes',
      label: 'Disputes',
      icon: <Scale className="w-5 h-5" />,
      submenu: [
        { id: 'disputes', label: 'Active Disputes', icon: <AlertCircle className="w-4 h-4" /> },
        { id: 'resolved-disputes', label: 'Resolved Cases', icon: <FileCheck className="w-4 h-4" /> }
      ]
    },
    {
      id: 'content',
      label: 'Content (CMS)',
      icon: <FileText className="w-5 h-5" />,
      submenu: [
        { id: 'pages', label: 'Pages Management', icon: <FileText className="w-4 h-4" /> },
        { id: 'contact-messages', label: 'Contact Inquiries', icon: <Mail className="w-4 h-4" /> },
        { id: 'menus', label: 'Menus Management', icon: <Menu className="w-4 h-4" /> },
        { id: 'banners', label: 'Banners & Hero', icon: <Image className="w-4 h-4" /> },
        { id: 'faqs', label: 'FAQs Management', icon: <MessageSquare className="w-4 h-4" /> },
        { id: 'testimonials', label: 'Testimonials', icon: <MessageSquare className="w-4 h-4" /> },
        { id: 'registration-steps', label: 'Registration Steps', icon: <ClipboardList className="w-4 h-4" /> }
      ]
    },
    {
      id: 'taxonomies',
      label: 'Taxonomies',
      icon: <Tags className="w-5 h-5" />,
      submenu: [
        { id: 'categories', label: 'Categories', icon: <Grid3x3 className="w-4 h-4" /> },
        { id: 'skills', label: 'Skills & Tags', icon: <Tags className="w-4 h-4" /> },
        { id: 'languages', label: 'Languages', icon: <MessageSquare className="w-4 h-4" /> }
      ]
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <BarChart3 className="w-5 h-5" />,
      submenu: [
        { id: 'analytics', label: 'Analytics Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      submenu: [
        { id: 'global-settings', label: 'Global Branding', icon: <Home className="w-4 h-4" /> },
        { id: 'email-settings', label: 'Email Templates', icon: <Mail className="w-4 h-4" /> },
        { id: 'admin-profile', label: 'Admin Security', icon: <Settings className="w-4 h-4" /> }
      ]
    }
  ];

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['users', 'projects', 'gigs', 'transactions', 'subscriptions', 'disputes', 'content', 'taxonomies', 'startup-ideas']);
  const [showAdminCard, setShowAdminCard] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    users: any[];
    projects: any[];
    gigs: any[];
  }>({ users: [], projects: [], gigs: [] });
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults({ users: [], projects: [], gigs: [] });
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        setSearchLoading(true);
        // Fetch users matching query
        const usersRes = await api.get('/admin/users', { params: { search: searchQuery, limit: 5 } });
        // Fetch projects (filter locally for safety/simplicity)
        const projectsRes = await api.get('/admin/projects');
        // Fetch gigs (filter locally)
        let gigsRes: any = { data: { success: false, gigs: [] } };
        try {
          gigsRes = await api.get('/admin/gigs');
        } catch (e) {
          console.warn('Gigs fetch failed', e);
        }

        const matchedUsers = usersRes.data.success ? usersRes.data.users : [];
        const matchedProjects = projectsRes.data.success 
          ? projectsRes.data.projects.filter((p: any) => p.title?.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
          : [];
        const matchedGigs = gigsRes.data.success
          ? gigsRes.data.gigs.filter((g: any) => g.title?.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
          : [];

        setSearchResults({
          users: matchedUsers,
          projects: matchedProjects,
          gigs: matchedGigs
        });
      } catch (err) {
        console.error('Error during global search:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSearchSubmit = async () => {
    const query = searchQuery.trim();
    if (!query) return;

    const queryLower = query.toLowerCase();

    // 1. Check keyword mapping
    const keywordMap: Record<string, string> = {
      'users': 'users',
      'user': 'users',
      'customers': 'users',
      'customer': 'users',
      'member': 'users',
      'members': 'users',
      'client': 'users',
      'clients': 'users',
      'new users': 'users-new',
      'new user': 'users-new',
      'new customer': 'users-new',
      'new customers': 'users-new',
      'active users': 'users-active',
      'active user': 'users-active',
      'active customer': 'users-active',
      'active customers': 'users-active',
      'kyc not verified': 'users-kyc-not-verified',
      'kyc pending': 'users-kyc-not-verified',
      'unverified users': 'users-kyc-not-verified',
      'unverified user': 'users-kyc-not-verified',
      'blocked users': 'users-blocked',
      'blocked user': 'users-blocked',
      'blocked': 'users-blocked',
      'deleted users': 'users-soft-deleted',
      'deleted user': 'users-soft-deleted',
      'soft deleted': 'users-soft-deleted',
      'paid users': 'users-paid',
      'paid user': 'users-paid',
      'premium users': 'users-paid',
      'premium user': 'users-paid',
      'verification': 'verification',
      'verifications': 'verification',
      'kyc': 'verification',
      'kyc review': 'verification',
      'verify': 'verification',
      'verify users': 'verification',
      'suspended': 'suspended',
      'suspended users': 'suspended',
      'suspend': 'suspended',
      'projects': 'projects',
      'project': 'projects',
      'listings': 'projects',
      'listing': 'projects',
      'jobs': 'projects',
      'job': 'projects',
      'pending approvals': 'pending-approvals',
      'pending approval': 'pending-approvals',
      'approve projects': 'pending-approvals',
      'project approvals': 'pending-approvals',
      'gigs': 'gigs',
      'gig': 'gigs',
      'services': 'gigs',
      'service': 'gigs',
      'gig orders': 'gig-orders',
      'orders': 'gig-orders',
      'order': 'gig-orders',
      'gig order': 'gig-orders',
      'gig approvals': 'gig-approvals',
      'approve gigs': 'gig-approvals',
      'subscriptions': 'subscriptions',
      'subscription': 'subscriptions',
      'plans': 'subscriptions',
      'plan': 'subscriptions',
      'create plan': 'create-subscription-plan',
      'new plan': 'create-subscription-plan',
      'payments': 'payments',
      'payment': 'payments',
      'transactions': 'payments',
      'transaction': 'payments',
      'earnings': 'payments',
      'billing': 'payments',
      'withdraw-requests': 'withdraw-requests',
      'withdraw': 'withdraw-requests',
      'withdrawals': 'withdraw-requests',
      'withdrawal': 'withdraw-requests',
      'withdraw requests': 'withdraw-requests',
      'commission': 'commission',
      'commission settings': 'commission',
      'commissions': 'commission',
      'refunds': 'refunds',
      'refund': 'refunds',
      'payment methods': 'payment-methods',
      'payment method': 'payment-methods',
      'disputes': 'disputes',
      'dispute': 'disputes',
      'active disputes': 'disputes',
      'resolved disputes': 'resolved-disputes',
      'resolved cases': 'resolved-disputes',
      'resolved dispute': 'resolved-disputes',
      'pages': 'pages',
      'page': 'pages',
      'cms': 'pages',
      'contact messages': 'contact-messages',
      'contact': 'contact-messages',
      'messages': 'contact-messages',
      'inquiries': 'contact-messages',
      'inquiry': 'contact-messages',
      'menus': 'menus',
      'menu': 'menus',
      'banners': 'banners',
      'banner': 'banners',
      'hero': 'banners',
      'faqs': 'faqs',
      'faq': 'faqs',
      'testimonials': 'testimonials',
      'testimonial': 'testimonials',
      'settings': 'global-settings',
      'global settings': 'global-settings',
      'branding': 'global-settings',
      'email settings': 'email-settings',
      'email templates': 'email-settings',
      'registration steps': 'registration-steps',
      'registration flow': 'registration-steps',
      'registration': 'registration-steps',
      'categories': 'categories',
      'category': 'categories',
      'skills': 'skills',
      'skill': 'skills',
      'tags': 'skills',
      'tag': 'skills',
      'languages': 'languages',
      'language': 'languages',
      'analytics': 'analytics',
      'reports': 'analytics',
      'report': 'analytics',
      'website demo': 'website-demo',
      'website': 'website-demo',
      'admin profile': 'admin-profile',
      'profile': 'admin-profile',
      'security': 'admin-profile',
      'admin settings': 'admin-profile',
      'startup ideas': 'startup-ideas',
      'ideas': 'startup-ideas',
      'idea': 'startup-ideas',
      'startup categories': 'startup-categories',
      'startup ideas faq': 'startup-ideas-faq',
      'startup ideas terms': 'startup-ideas-terms',
      'startup ideas privacy': 'startup-ideas-privacy',
      'investor meetings': 'investor-meetings',
      'meetings': 'investor-meetings',
      'investor opportunities': 'investor-opportunities',
      'opportunities': 'investor-opportunities',
    };

    if (keywordMap[queryLower]) {
      onNavigate(keywordMap[queryLower]);
      setSearchQuery('');
      return;
    }

    // 2. Check dynamic menu item / submenu label matching
    let matchedPageId: string | null = null;
    const cleanQuery = queryLower.trim();

    for (const item of menuItems) {
      const itemLabel = item.label.toLowerCase().trim();
      if (itemLabel === cleanQuery || itemLabel.replace(/[^a-z0-9]/g, '').includes(cleanQuery.replace(/[^a-z0-9]/g, ''))) {
        matchedPageId = item.id;
      }
      if (item.submenu) {
        for (const sub of item.submenu) {
          const subLabel = sub.label.toLowerCase().trim();
          if (subLabel === cleanQuery || subLabel.replace(/[^a-z0-9]/g, '').includes(cleanQuery.replace(/[^a-z0-9]/g, ''))) {
            matchedPageId = sub.id;
            break;
          }
        }
      }
      if (matchedPageId) break;
    }

    if (matchedPageId) {
      onNavigate(matchedPageId);
      setSearchQuery('');
      return;
    }

    // 3. Fetch live matching results if not already available
    let currentResults = searchResults;
    if (searchLoading || (searchResults.users.length === 0 && searchResults.projects.length === 0 && searchResults.gigs.length === 0)) {
      try {
        setSearchLoading(true);
        const [usersRes, projectsRes] = await Promise.all([
          api.get('/admin/users', { params: { search: query, limit: 5 } }),
          api.get('/admin/projects')
        ]);
        let gigsRes: any = { data: { success: false, gigs: [] } };
        try {
          gigsRes = await api.get('/admin/gigs');
        } catch (e) {
          console.warn('Gigs fetch failed', e);
        }

        const matchedUsers = usersRes.data.success ? usersRes.data.users : [];
        const matchedProjects = projectsRes.data.success 
          ? projectsRes.data.projects.filter((p: any) => p.title?.toLowerCase().includes(queryLower)).slice(0, 5)
          : [];
        const matchedGigs = gigsRes.data.success
          ? gigsRes.data.gigs.filter((g: any) => g.title?.toLowerCase().includes(queryLower)).slice(0, 5)
          : [];

        currentResults = {
          users: matchedUsers,
          projects: matchedProjects,
          gigs: matchedGigs
        };
        setSearchResults(currentResults);
      } catch (err) {
        console.error('Error during global search:', err);
      } finally {
        setSearchLoading(false);
      }
    }

    // 4. Exact or partial matches in the search results
    if (currentResults.users.length > 0) {
      onSelectUser?.(currentResults.users[0]._id);
      setSearchQuery('');
      return;
    }

    if (currentResults.projects.length > 0) {
      onSelectProject?.(currentResults.projects[0]._id);
      setSearchQuery('');
      return;
    }

    if (currentResults.gigs.length > 0) {
      onNavigate('gigs');
      setSearchQuery('');
      return;
    }
  };

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const logoUrl = settings.site_logo ? (settings.site_logo.startsWith('http') ? settings.site_logo : `${apiUrl}${settings.site_logo}`) : logoFallback;



  const toggleMenu = (id: string) => {
    setExpandedMenus(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  return (
    <div className={`h-screen flex flex-col ${darkMode ? 'dark bg-[#0a0a0a]' : 'bg-white'} overflow-hidden`}>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-[100000] overflow-visible ${darkMode ? 'bg-[#1a1a1a]/80 border-[#262626]' : 'bg-white/80'
          } backdrop-blur-xl border-b shadow-sm`}
        style={{ zIndex: 100000 }}
      >
        <div className="flex items-center justify-between px-6 h-16 overflow-visible">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-[#262626] rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <img src={logoUrl} alt="Go Experts" className="h-8 w-auto" />
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearchSubmit();
            }}
            className="hidden md:flex flex-1 max-w-xl mx-8 relative"
          >
            <div className="relative w-full">
              <button
                type="submit"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                title="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              <input
                type="text"
                placeholder="Search users, projects, gigs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-10 py-2 rounded-lg ${darkMode
                  ? 'bg-[#262626] border-[#262626] text-white'
                  : 'bg-gray-50 border-gray-200'
                  } border focus:outline-none focus:ring-2 focus:ring-[#F24C20]`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {searchQuery.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#262626] rounded-xl shadow-xl max-h-[400px] overflow-y-auto z-[2147483647] p-2">
                {searchLoading ? (
                  <div className="flex items-center justify-center p-4 text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin mr-2 text-[#F24C20]" />
                    Searching...
                  </div>
                ) : (searchResults.users.length === 0 && searchResults.projects.length === 0 && searchResults.gigs.length === 0) ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No results found for "{searchQuery}"
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Users Section */}
                    {searchResults.users.length > 0 && (
                      <div>
                        <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Users
                        </div>
                        <div className="mt-1 space-y-1">
                          {searchResults.users.map((user) => (
                            <button
                              key={user._id}
                              onClick={() => {
                                onSelectUser?.(user._id);
                                setSearchQuery('');
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#262626] text-left transition-colors"
                            >
                              <img
                                src={user.profile_image ? (user.profile_image.startsWith('http') ? user.profile_image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${user.profile_image.replace(/^\/+/, '').replace(/\\/g, '/')}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'U')}&background=random`}
                                alt={user.full_name}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate dark:text-white">{user.full_name}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projects Section */}
                    {searchResults.projects.length > 0 && (
                      <div>
                        <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Projects
                        </div>
                        <div className="mt-1 space-y-1">
                          {searchResults.projects.map((project) => (
                            <button
                              key={project._id}
                              onClick={() => {
                                onSelectProject?.(project._id);
                                setSearchQuery('');
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#262626] text-left transition-colors"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate dark:text-white">{project.title}</p>
                                <p className="text-xs text-gray-500 truncate">Budget: ₹{(project.budget_min || 0).toLocaleString()} - ₹{(project.budget_max || 0).toLocaleString()}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Gigs Section */}
                    {searchResults.gigs.length > 0 && (
                      <div>
                        <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Gigs
                        </div>
                        <div className="mt-1 space-y-1">
                          {searchResults.gigs.map((gig) => (
                            <button
                              key={gig._id}
                              onClick={() => {
                                onNavigate?.('gigs');
                                setSearchQuery('');
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#262626] text-left transition-colors"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate dark:text-white">{gig.title}</p>
                                <p className="text-xs text-gray-500 truncate">Category: {gig.category}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </form>

          <div className="flex items-center gap-3">
            <button
              onClick={onToggleDarkMode}
              className="p-2 hover:bg-gray-100 dark:hover:bg-[#262626] rounded-lg transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div
              className="relative"
              onMouseEnter={() => setShowNotifications(true)}
              onMouseLeave={() => setShowNotifications(false)}
            >
              <button 
                className={`relative p-2 hover:bg-gray-100 dark:hover:bg-[#262626] rounded-lg transition-colors ${showNotifications ? 'bg-gray-100 dark:bg-[#262626]' : ''}`}
              >
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#F24C20] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#1a1a1a]"
                  >
                    {notificationCount}
                  </motion.span>
                )}
              </button>

            </div>

             <div
              className="relative flex items-center gap-2 pl-3 border-l dark:border-[#262626] cursor-pointer overflow-visible"
              onMouseEnter={() => setShowAdminCard(true)}
              onMouseLeave={() => setShowAdminCard(false)}
              onClick={() => onNavigate('admin-profile')}
            >
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${adminUser?.full_name || 'Admin'}`}
                alt="Admin"
                className="w-8 h-8 rounded-full border-2 border-[#F24C20]/40"
              />
              <span className="hidden sm:block text-sm font-medium truncate max-w-[120px]">
                {adminUser?.full_name || 'Admin'}
              </span>

              <AnimatePresence>
                {showAdminCard && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    onClick={(e) => e.stopPropagation()}
                    className="fixed w-64 max-w-[calc(100vw-1rem)] bg-[#1a1a1a] border border-[#333] rounded-2xl shadow-2xl z-[2147483647] p-4"
                    style={{ top: 88, right: 12 }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${adminUser?.full_name || 'Admin'}`}
                        alt="Admin"
                        className="w-12 h-12 rounded-full border-2 border-[#F24C20]/40"
                      />
                      <div className="min-w-0">
                        <p className="text-white font-bold text-sm truncate">{adminUser?.full_name || 'Administrator'}</p>
                        <p className="text-gray-400 text-xs truncate">{adminUser?.email || ''}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-[#F24C20]/10 text-[#F24C20] text-[10px] font-bold rounded-full uppercase tracking-wider">Admin</span>
                      </div>
                    </div>
                    <div className="border-t border-[#333] pt-3">
                      <button
                        onClick={() => {
                          setShowAdminCard(false);
                          onNavigate('admin-profile');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-gray-200 hover:bg-zinc-800 rounded-xl text-sm font-medium transition-colors mb-1"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>
                      <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-900/20 rounded-xl text-sm font-medium transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="bg-[#1a1a1a] border border-[#333] rounded-2xl shadow-2xl overflow-hidden"
            onMouseEnter={() => setShowNotifications(true)}
            onMouseLeave={() => setShowNotifications(false)}
            style={{
              position: 'fixed',
              top: '80px',
              right: '24px',
              width: '420px',
              zIndex: 2147483647
            }}
          >
            <div className="p-4 border-b border-[#333] flex items-center justify-between gap-4">
              <h3 className="text-white font-bold text-sm whitespace-nowrap">Notifications</h3>
              <button
                onClick={() => {
                  onClearNotifications();
                  setShowNotifications(false);
                }}
                className="text-[10px] uppercase tracking-wider font-bold text-[#F24C20] hover:text-[#ff6b4a] transition-colors whitespace-nowrap"
              >
                Clear All
              </button>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {notificationCount === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-8 h-8 text-gray-600 mx-auto mb-2 opacity-20" />
                  <p className="text-gray-500 text-xs">No new notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-[#333]">
                  <div className="p-4 hover:bg-[#262626] cursor-pointer transition-colors">
                    <p className="text-white text-xs font-medium mb-1">New User Registered</p>
                    <p className="text-gray-400 text-[10px]">A new freelancer just joined the platform.</p>
                    <p className="text-gray-600 text-[9px] mt-2">Just now</p>
                  </div>
                  <div className="p-4 hover:bg-[#262626] cursor-pointer transition-colors">
                    <p className="text-white text-xs font-medium mb-1">Payment Received</p>
                    <p className="text-gray-400 text-[10px]">Premium subscription purchased by John Doe.</p>
                    <p className="text-gray-600 text-[9px] mt-2">5 mins ago</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 20 }}
            className={`fixed left-0 top-16 bottom-0 w-64 ${darkMode ? 'bg-[#1a1a1a] border-[#262626]' : 'bg-white border-gray-200'
              } border-r overflow-y-auto z-40 scrollbar-hide select-none`}
          >
            <nav className="p-4 space-y-1">
              {menuItems.map(item => (
                <div key={item.id}>
                  {item.submenu ? (
                    <>
                      <button
                        onClick={() => toggleMenu(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${currentPage === item.id || item.submenu.some(s => s.id === currentPage)
                          ? 'bg-[#F24C20] text-white'
                          : darkMode
                            ? 'hover:bg-[#262626] text-gray-300'
                            : 'hover:bg-gray-100 text-gray-700'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        {expandedMenus.includes(item.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      <AnimatePresence>
                        {expandedMenus.includes(item.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="ml-4 mt-1 space-y-1"
                          >
                            {item.submenu.map(subItem => (
                              <button
                                key={subItem.id}
                                onClick={() => onNavigate(subItem.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${currentPage === subItem.id
                                  ? 'bg-[#F24C20] text-white'
                                  : darkMode
                                    ? 'hover:bg-[#262626] text-gray-400'
                                    : 'hover:bg-gray-100 text-gray-600'
                                  }`}
                              >
                                {subItem.icon}
                                <span>{subItem.label}</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <button
                      onClick={() => onNavigate(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentPage === item.id
                        ? 'bg-[#F24C20] text-white'
                        : darkMode
                          ? 'hover:bg-[#262626] text-gray-300'
                          : 'hover:bg-gray-100 text-gray-700'
                        }`}
                    >
                      {item.icon}
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={onLogout}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mt-4 transition-colors ${
                  darkMode
                  ? 'hover:bg-red-900/20 text-red-400'
                  : 'hover:bg-red-50 text-red-600'
                }`}
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex-1 flex overflow-hidden">
        <main className={`flex-1 pt-16 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'} overflow-y-auto h-full`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
