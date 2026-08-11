import { createClient } from '@supabase/supabase-js';
import { AppData, Enquiry, Project, Service, TeamMember } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;

const mapProject = (p: any): Project => ({
  id: p.id,
  title: p.title || '',
  category: p.category || 'Websites',
  coverImage: p.cover_image || '',
  galleryImages: [],
  clientName: p.client_name || '',
  year: p.year || new Date().getFullYear(),
  description: p.description || '',
  problem: p.problem || '',
  process: p.process || '',
  result: p.result || '',
  tools: p.tools || [],
  tags: p.tags || [],
  link: p.project_link || '',
  featured: Boolean(p.featured),
  published: Boolean(p.published),
  status: p.status || 'Draft',
  order: p.sort_order || 999,
  assignedTo: p.assigned_to || undefined,
  revenue: Number(p.revenue || 0),
  deadline: p.deadline || '',
  updates: [],
});

const mapService = (s: any): Service => ({
  id: s.id,
  name: s.name || '',
  icon: s.icon || 'Sparkles',
  description: s.description || '',
  price: s.price_label || (s.starting_price ? `Rs. ${s.starting_price}` : ''),
  deliveryTime: s.delivery_time || '',
  deliverables: s.deliverables || [],
  active: Boolean(s.active),
  order: s.sort_order || 999,
});

const mapTeam = (m: any): TeamMember => ({
  id: m.id,
  username: m.username || '',
  photo: m.profile_photo_url || '',
  name: m.full_name || '',
  fullName: m.full_name || '',
  role: m.role || '',
  bio: m.short_bio || '',
  shortBio: m.short_bio || '',
  longBio: m.long_bio || '',
  skills: m.skills || [],
  experience: m.experience || '',
  location: m.location || '',
  email: m.email || '',
  phone: m.phone || '',
  socials: {
    linkedin: m.linkedin_url || '', github: m.github_url || '', instagram: m.instagram_url || '',
    facebook: m.facebook_url || '', twitter: m.twitter_url || '', youtube: m.youtube_url || '',
    behance: m.behance_url || '', dribbble: m.dribbble_url || '', website: m.website_url || '',
    portfolio: m.portfolio_url || '', whatsapp: m.whatsapp_number || '', email: m.email || '', resume: m.resume_url || '',
  },
  projects: [],
  active: Boolean(m.is_visible),
  featured: Boolean(m.is_featured),
  order: m.display_order || 999,
  joinDate: m.join_date || '',
  availability: m.availability_status || 'Available',
  resumeUrl: m.resume_url || '',
});

export async function loadPublicSupabaseData(current: AppData): Promise<AppData> {
  if (!supabase) return current;
  const [projectsRes, servicesRes, teamRes, settingsRes] = await Promise.all([
    supabase.from('projects').select('*').eq('published', true).order('sort_order', { ascending: true }),
    supabase.from('services').select('*').eq('active', true).order('sort_order', { ascending: true }),
    supabase.from('team_members').select('*').eq('is_visible', true).order('display_order', { ascending: true }),
    supabase.from('settings').select('*').eq('id', 1).maybeSingle(),
  ]);
  if (projectsRes.error || servicesRes.error || teamRes.error) throw new Error(projectsRes.error?.message || servicesRes.error?.message || teamRes.error?.message);
  const settings = settingsRes.data ? {
    ...current.settings,
    businessName: settingsRes.data.business_name || current.settings.businessName,
    logo: settingsRes.data.logo || current.settings.logo,
    ownerName: settingsRes.data.owner_name || current.settings.ownerName,
    ownerProfile: settingsRes.data.owner_profile || current.settings.ownerProfile,
    email: settingsRes.data.email || current.settings.email,
    phone: settingsRes.data.phone || current.settings.phone,
    whatsapp: settingsRes.data.whatsapp || current.settings.whatsapp,
    theme: settingsRes.data.theme || current.settings.theme,
    currency: settingsRes.data.currency || current.settings.currency,
    defaultProjectStatus: settingsRes.data.default_project_status || current.settings.defaultProjectStatus,
    notifications: settingsRes.data.notifications ?? current.settings.notifications,
  } : current.settings;
  return {
    ...current,
    projects: projectsRes.data?.length ? projectsRes.data.map(mapProject) : current.projects,
    services: servicesRes.data?.length ? servicesRes.data.map(mapService) : current.services,
    team: teamRes.data?.map(mapTeam) || [],
    settings,
    activity: ['Loaded public data from Supabase', ...current.activity],
  };
}

export async function createSupabaseEnquiry(e: Enquiry) {
  if (!supabase) return null;
  const payload = {
    enquiry_number: e.number,
    name: e.name,
    email: e.email,
    phone: e.phone,
    business_name: e.business,
    required_service: e.service,
    budget_range: e.budget,
    deadline: e.deadline || null,
    description: e.description,
    file_url: e.file || null,
    status: e.status,
  };
  const { data, error } = await supabase.from('enquiries').insert(payload).select().single();
  if (error) throw error;
  return data;
}
