'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  User, Mail, Phone, Save, Loader2, ChevronLeft, Camera, Edit2, X, Lock 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    avatar_url: '' 
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          router.push('/login');
          return;
        }
        setUser(user);

        const initialData = {
          name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          email: user.email || '',
          mobile: '',
          avatar_url: user.user_metadata?.avatar_url || ''
        };

        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profile) {
          setFormData({
            name: profile.name || initialData.name,
            email: profile.email || initialData.email,
            mobile: profile.mobile || '',
            avatar_url: profile.avatar_url || initialData.avatar_url
          });
        } else {
          setFormData(initialData);
        }
        
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router, supabase]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) return;
      setUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      toast.success("Image uploaded!");
    } catch (error: any) {
      toast.error("Upload failed. Ensure 'avatars' bucket exists.");
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'mobile') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 10) setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (formData.mobile.length > 0 && formData.mobile.length !== 10) {
      toast.error("Mobile number must be 10 digits");
      setSaving(false);
      return;
    }

    try {
      const updates = {
        id: user.id,
        name: formData.name,
        mobile: formData.mobile,
        email: user.email,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('users').upsert(updates, { onConflict: 'id' });
      if (error) throw error;

      await supabase.auth.updateUser({
        data: { 
          full_name: formData.name, 
          name: formData.name,
          avatar_url: formData.avatar_url 
        }
      });

      toast.success("Profile updated!");
      setIsEditing(false);
    } catch (error: any) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      
      {/* Header */}
      <header className="border-b border-border px-6 py-4 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="p-2 -ml-2 mr-2 text-foreground/40 hover:text-foreground hover:bg-secondary rounded-full transition-colors">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold">My Profile</h1>
          </div>
          
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center text-sm font-semibold text-primary hover:opacity-80 transition-all"
            >
              <Edit2 className="h-4 w-4 mr-2" /> Edit Profile
            </button>
          ) : (
            <button 
              onClick={() => setIsEditing(false)}
              className="flex items-center text-sm font-semibold text-foreground/60 hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4 mr-2" /> Cancel
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-card rounded-2xl border border-border p-8 shadow-xl relative overflow-hidden transition-colors">
          
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>

          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-10 relative z-10">
            <div 
              className={`relative group ${isEditing ? 'cursor-pointer' : ''}`} 
              onClick={() => isEditing && fileInputRef.current?.click()}
            >
              {formData.avatar_url ? (
                 <img 
                   src={formData.avatar_url} 
                   alt="Profile" 
                   className="w-28 h-28 rounded-full border-4 border-card shadow-2xl object-cover"
                 />
              ) : (
                <div className="w-28 h-28 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center text-4xl font-bold text-primary-foreground shadow-2xl border-4 border-card">
                  {formData.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              
              {isEditing && (
                <div className="absolute inset-0 bg-background/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                  {uploading ? <Loader2 className="h-8 w-8 text-primary animate-spin"/> : <Camera className="h-8 w-8 text-primary" />}
                </div>
              )}
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
                disabled={!isEditing || uploading}
              />
            </div>
            
            <h2 className="mt-4 text-2xl font-bold text-foreground">{formData.name || 'New User'}</h2>
            <p className="text-foreground/40 text-sm">{user.email}</p>
          </div>

          <form onSubmit={handleSave} className="space-y-6 relative z-10">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-foreground/40 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative group">
                <User className={`absolute left-4 top-3.5 h-5 w-5 ${isEditing ? 'text-primary' : 'text-foreground/30'} transition-colors`} />
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full bg-secondary/50 border rounded-xl py-3 pl-12 pr-4 text-foreground outline-none transition-all 
                    ${isEditing 
                      ? 'border-border focus:border-primary focus:ring-1 focus:ring-primary' 
                      : 'border-transparent cursor-default text-foreground/80'}`}
                  placeholder="Enter your name"
                />
              </div>
            </div>

            {/* Email (Always Read-Only) */}
            <div>
              <label className="block text-xs font-bold text-foreground/40 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-foreground/30" />
                <input 
                  type="email" 
                  value={formData.email}
                  disabled
                  className="w-full bg-muted border border-transparent rounded-xl py-3 pl-12 pr-4 text-foreground/40 cursor-not-allowed outline-none"
                />
                <Lock className="absolute right-4 top-3.5 h-4 w-4 text-foreground/20" />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-foreground/40 uppercase tracking-wider mb-2">Mobile Number</label>
              <div className="relative group">
                <Phone className={`absolute left-4 top-3.5 h-5 w-5 ${isEditing ? 'text-primary' : 'text-foreground/30'} transition-colors`} />
                <input 
                  type="tel" 
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  disabled={!isEditing}
                  maxLength={10}
                  className={`w-full bg-secondary/50 border rounded-xl py-3 pl-12 pr-4 text-foreground outline-none transition-all font-mono tracking-wider
                    ${isEditing 
                      ? 'border-border focus:border-primary focus:ring-1 focus:ring-primary' 
                      : 'border-transparent cursor-default text-foreground/80'}`}
                  placeholder={isEditing ? "9876543210" : "Not set"}
                />
              </div>
              {isEditing && (
                <p className="text-[10px] text-foreground/40 mt-1 ml-1 text-right">
                  {formData.mobile.length}/10 digits
                </p>
              )}
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="pt-6 border-t border-border flex justify-end animate-in fade-in slide-in-from-bottom-2">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="bg-primary text-primary-foreground font-bold py-3 px-8 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                >
                  {saving ? (
                    <> <Loader2 className="animate-spin h-5 w-5 mr-2" /> Saving... </>
                  ) : (
                    <> <Save className="h-5 w-5 mr-2" /> Save Changes </>
                  )}
                </button>
              </div>
            )}

          </form>
        </div>
      </main>
    </div>
  );
}