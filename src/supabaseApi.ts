import { createClient } from '@supabase/supabase-js';
import { AppData, Enquiry, Project, Service, TeamMember } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tlwuxdwmqnvivyjjngdn.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_9pBXwadGe63qf7k6LSswcA_pbSO6I9H';

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
    paymentLink: settingsRes.data.social_links?.paymentLink || current.settings.paymentLink || '',
    upiId: settingsRes.data.social_links?.upiId || current.settings.upiId || '',
    paymentMerchant: settingsRes.data.social_links?.paymentMerchant || current.settings.paymentMerchant || 'EduCoder Coding Hub',
    paymentQrUrl: settingsRes.data.social_links?.paymentQrUrl || current.settings.paymentQrUrl || '',
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


const mapEnquiry = (e: any): Enquiry => ({
  id: e.id, number: e.enquiry_number || '', name: e.name || '', email: e.email || '', phone: e.phone || '',
  business: e.business_name || '', service: e.required_service || '', budget: e.budget_range || '',
  deadline: e.deadline || '', description: e.description || '', file: e.file_url || '',
  status: e.status || 'New Enquiry', notes: [], assignedTo: e.assigned_to || undefined,
  createdAt: e.created_at || new Date().toISOString(),
  paymentAmount: e.payment_amount || 0,
  paymentStatus: e.payment_status || 'Unpaid',
  paymentRef: e.payment_ref || '',
});

export async function signInWithGoogle() {
  if (!supabase) throw new Error('Supabase is not configured');
  const redirectTo = window.location.origin + window.location.pathname;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });
  if (error) throw error;
}

export async function getCurrentUserRole() {
  if (!supabase) return null;
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;
  const { data: profile, error } = await supabase.from('profiles').select('role,active').eq('id', user.id).maybeSingle();
  if (error) throw error;
  if (!profile) {
    await ensureClientProfile(user.user_metadata?.full_name || '');
    return 'client';
  }
  if (!profile.active) return null;
  return profile.role || 'client';
}

export async function ensureClientProfile(fullName = '') {
  if (!supabase) return;
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return;
  const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();
  if (!profile) {
    await supabase.from('profiles').insert({ id: user.id, full_name: fullName || user.user_metadata?.full_name || user.email, role: 'client', active: true });
  }
}


export async function registerClientAccount(fullName: string, email: string, password: string) {
  if (!supabase) throw new Error('Supabase is not configured');
  const emailRedirectTo = window.location.origin + window.location.pathname;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName }, emailRedirectTo },
  });
  if (error) throw error;
  if (data.user && data.session) {
    await ensureClientProfile(fullName);
  }
  return data;
}


export async function signInSuperAdmin(email: string, password: string) {
  if (!supabase) throw new Error('Supabase is not configured');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const { data: profile, error: profileError } = await supabase.from('profiles').select('role,active').eq('id', data.user.id).maybeSingle();
  if (profileError) throw profileError;
  if (!profile?.active || !['admin','super_admin','team_member','client'].includes(profile.role)) {
    await supabase.auth.signOut();
    throw new Error('This Supabase user is not an active staff account');
  }
  return { user: data.user, role: profile.role };
}

export async function sendPasswordRecovery(email: string) {
  if (!supabase) throw new Error('Supabase is not configured');
  if (!/\S+@\S+\.\S+/.test(email)) throw new Error('Enter a valid email address');
  const redirectTo = window.location.origin + window.location.pathname;
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo });
  if (error) throw error;
  return true;
}


export async function changeCurrentUserPassword(newPassword: string) {
  if (!supabase) throw new Error('Supabase is not configured');
  if (!newPassword || newPassword.length < 8) throw new Error('Password must be at least 8 characters');
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return true;
}


export async function signOutSupabase() { if (supabase) await supabase.auth.signOut(); }

export async function loadClientSupabaseData(current: AppData): Promise<AppData> {
  if (!supabase) return current;
  const { data: userData } = await supabase.auth.getUser();
  const email = userData.user?.email || '';
  const [settingsRes, enquiriesRes] = await Promise.all([
    supabase.from('settings').select('*').eq('id', 1).maybeSingle(),
    supabase.from('enquiries').select('*').eq('email', email).order('created_at', { ascending: false }),
  ]);
  if (enquiriesRes.error) throw enquiriesRes.error;
  const base = await loadPublicSupabaseData(current).catch(()=>current);
  const settings = settingsRes.data ? { ...base.settings, businessName: settingsRes.data.business_name || base.settings.businessName, logo: settingsRes.data.logo || base.settings.logo, email: settingsRes.data.email || base.settings.email, phone: settingsRes.data.phone || base.settings.phone, paymentLink: settingsRes.data.social_links?.paymentLink || base.settings.paymentLink || '', upiId: settingsRes.data.social_links?.upiId || base.settings.upiId || '', paymentMerchant: settingsRes.data.social_links?.paymentMerchant || base.settings.paymentMerchant || 'EduCoder Coding Hub', paymentQrUrl: settingsRes.data.social_links?.paymentQrUrl || base.settings.paymentQrUrl || '' } : base.settings;
  return { ...base, settings, enquiries: enquiriesRes.data?.map(mapEnquiry) || [], activity: ['Loaded client enquiries from Supabase', ...current.activity] };
}


export async function loadTeamSupabaseData(current: AppData): Promise<AppData> {
  if (!supabase) return current;
  const [settingsRes, enquiriesRes] = await Promise.all([
    supabase.from('settings').select('*').eq('id', 1).maybeSingle(),
    supabase.from('enquiries').select('*').order('created_at', { ascending: false }),
  ]);
  if (enquiriesRes.error) throw enquiriesRes.error;
  const settings = settingsRes.data ? {
    ...current.settings,
    businessName: settingsRes.data.business_name || current.settings.businessName,
    logo: settingsRes.data.logo || current.settings.logo,
    email: settingsRes.data.email || current.settings.email,
    phone: settingsRes.data.phone || current.settings.phone,
    theme: settingsRes.data.theme || current.settings.theme,
    paymentLink: settingsRes.data.social_links?.paymentLink || current.settings.paymentLink || '',
    upiId: settingsRes.data.social_links?.upiId || current.settings.upiId || '',
    paymentMerchant: settingsRes.data.social_links?.paymentMerchant || current.settings.paymentMerchant || 'EduCoder Coding Hub',
    paymentQrUrl: settingsRes.data.social_links?.paymentQrUrl || current.settings.paymentQrUrl || '',
  } : current.settings;
  return { ...current, settings, enquiries: enquiriesRes.data?.map(mapEnquiry) || [], activity: ['Loaded team enquiries from Supabase', ...current.activity] };
}


export async function loadAdminSupabaseData(current: AppData): Promise<AppData> {
  if (!supabase) return current;
  const [projectsRes, servicesRes, teamRes, settingsRes, enquiriesRes] = await Promise.all([
    supabase.from('projects').select('*').order('sort_order', { ascending: true }),
    supabase.from('services').select('*').order('sort_order', { ascending: true }),
    supabase.from('team_members').select('*').order('display_order', { ascending: true }),
    supabase.from('settings').select('*').eq('id', 1).maybeSingle(),
    supabase.from('enquiries').select('*').order('created_at', { ascending: false }),
  ]);
  if (projectsRes.error || servicesRes.error || teamRes.error || enquiriesRes.error) throw new Error(projectsRes.error?.message || servicesRes.error?.message || teamRes.error?.message || enquiriesRes.error?.message);
  const base = await loadPublicSupabaseData(current).catch(()=>current);
  return { ...base, projects: projectsRes.data?.map(mapProject) || [], services: servicesRes.data?.map(mapService) || [], team: teamRes.data?.map(mapTeam) || [], enquiries: enquiriesRes.data?.map(mapEnquiry) || [], activity: ['Loaded admin data from Supabase', ...current.activity] };
}


export async function getOwnTeamMemberProfile() {
  if (!supabase) return null;
  const { data: userData } = await supabase.auth.getUser();
  const email = userData.user?.email || '';
  if (!email) return null;
  const { data, error } = await supabase.from('team_members').select('*').eq('email', email).maybeSingle();
  if (error) throw error;
  return data ? mapTeam(data) : null;
}

export async function saveOwnTeamMemberProfile(m: TeamMember) {
  if (!supabase) return null;
  const { data: userData } = await supabase.auth.getUser();
  const email = userData.user?.email || '';
  if (!email) throw new Error('No logged in team email found');
  const row = {
    id: m.id || crypto.randomUUID(),
    full_name: m.fullName || m.name,
    username: m.username,
    profile_photo_url: m.photo,
    role: m.role,
    short_bio: m.shortBio || m.bio,
    long_bio: m.longBio,
    skills: m.skills,
    experience: m.experience,
    location: m.location,
    email,
    phone: m.phone,
    linkedin_url: m.socials.linkedin,
    github_url: m.socials.github,
    instagram_url: m.socials.instagram,
    facebook_url: m.socials.facebook,
    twitter_url: m.socials.twitter,
    youtube_url: m.socials.youtube,
    behance_url: m.socials.behance,
    dribbble_url: m.socials.dribbble,
    website_url: m.socials.website,
    portfolio_url: m.socials.portfolio,
    whatsapp_number: m.socials.whatsapp,
    resume_url: m.resumeUrl || m.socials.resume,
    is_visible: m.active,
    is_featured: m.featured,
    display_order: m.order || 999,
    availability_status: m.availability,
    join_date: m.joinDate || null,
  };
  const { data, error } = await supabase.from('team_members').upsert(row).select().single();
  if (error) throw error;
  return mapTeam(data);
}


export async function uploadToSupabaseStorage(file: File, folder = 'uploads') {
  if (!supabase) return null;
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
  const path = `${folder}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from('creative-assets').upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from('creative-assets').getPublicUrl(path);
  return data.publicUrl;
}

export async function saveSupabaseProject(p: Project) {
  if (!supabase) return null;
  const row = {
    id: p.id,
    title: p.title,
    category: p.category,
    cover_image: p.coverImage,
    client_name: p.clientName,
    year: p.year,
    description: p.description,
    problem: p.problem,
    process: p.process,
    result: p.result,
    tools: p.tools,
    tags: p.tags,
    project_link: p.link,
    featured: p.featured,
    published: p.published,
    status: p.status,
    sort_order: p.order,
    assigned_to: p.assignedTo || null,
    revenue: p.revenue || 0,
    deadline: p.deadline || null,
  };
  const { data, error } = await supabase.from('projects').upsert(row).select().single();
  if (error) throw error;
  if (p.galleryImages?.length) {
    await supabase.from('project_images').delete().eq('project_id', p.id);
    const imgs = p.galleryImages.map((url, i) => ({ project_id: p.id, image_url: url, sort_order: i + 1, alt: p.title }));
    const { error: imgError } = await supabase.from('project_images').insert(imgs);
    if (imgError) throw imgError;
  }
  return data;
}


export async function syncCloudData(d: AppData) {
  if (!supabase) return;
  const services = d.services.map(s => ({
    id: s.id, name: s.name, icon: s.icon, description: s.description, price_label: s.price,
    delivery_time: s.deliveryTime, deliverables: s.deliverables, active: s.active, sort_order: s.order
  }));
  const team = d.team.map(m => ({
    id: m.id, full_name: m.fullName || m.name, username: m.username, profile_photo_url: m.photo, role: m.role,
    short_bio: m.shortBio || m.bio, long_bio: m.longBio, skills: m.skills, experience: m.experience,
    location: m.location, email: m.email, phone: m.phone, linkedin_url: m.socials.linkedin,
    github_url: m.socials.github, instagram_url: m.socials.instagram, facebook_url: m.socials.facebook,
    twitter_url: m.socials.twitter, youtube_url: m.socials.youtube, behance_url: m.socials.behance,
    dribbble_url: m.socials.dribbble, website_url: m.socials.website, portfolio_url: m.socials.portfolio,
    whatsapp_number: m.socials.whatsapp, resume_url: m.resumeUrl || m.socials.resume, is_visible: m.active,
    is_featured: m.featured, display_order: m.order, availability_status: m.availability, join_date: m.joinDate || null
  }));
  const projects = d.projects.map(p => ({
    id: p.id, title: p.title, category: p.category, cover_image: p.coverImage, client_name: p.clientName,
    year: p.year, description: p.description, problem: p.problem, process: p.process, result: p.result,
    tools: p.tools, tags: p.tags, project_link: p.link, featured: p.featured, published: p.published,
    status: p.status, sort_order: p.order, assigned_to: p.assignedTo || null, revenue: p.revenue, deadline: p.deadline || null
  }));
  const settings = {
    id: 1, business_name: d.settings.businessName, logo: d.settings.logo, owner_name: d.settings.ownerName,
    owner_profile: d.settings.ownerProfile, email: d.settings.email, phone: d.settings.phone,
    whatsapp: d.settings.whatsapp, social_links: {...d.settings.socials,paymentLink:d.settings.paymentLink||'',upiId:d.settings.upiId||'',paymentMerchant:d.settings.paymentMerchant||'',paymentQrUrl:d.settings.paymentQrUrl||''}, theme: d.settings.theme,
    currency: d.settings.currency, default_project_status: d.settings.defaultProjectStatus,
    notifications: d.settings.notifications
  };
  const ops: Promise<any>[] = [];
  if (services.length) ops.push(Promise.resolve(supabase.from('services').upsert(services)));
  if (team.length) ops.push(Promise.resolve(supabase.from('team_members').upsert(team)));
  if (projects.length) ops.push(Promise.resolve(supabase.from('projects').upsert(projects)));
  ops.push(Promise.resolve(supabase.from('settings').upsert(settings)));
  const results = await Promise.all(ops);
  const failed = results.find((r:any)=>r.error);
  if (failed?.error) throw failed.error;
}
