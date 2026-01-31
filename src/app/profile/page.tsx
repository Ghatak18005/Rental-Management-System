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
  const [uploading, setUploading] = useState(false); // For image upload
  const [isEditing, setIsEditing] = useState(false); // Toggle Edit Mode
  const [user, setUser] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    avatar_url: '' 
  });

  // --- 1. Fetch User Data ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          router.push('/login');
          return;
        }
        setUser(user);

        // Default data
        const initialData = {
          name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          email: user.email || '',
          mobile: '',
          avatar_url: user.user_metadata?.avatar_url || ''
        };

        // Fetch from 'users' table
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
            avatar_url: profile.avatar_url || initialData.avatar_url // Ensure your users table has this column or strictly use metadata
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

  // --- 2. Handle Image Upload ---
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      setUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;

      // Upload to Supabase Storage (Ensure you have a bucket named 'avatars')
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      toast.success("Image uploaded!");

    } catch (error: any) {
      console.error('Upload Error:', error);
      toast.error("Failed to upload image. (Check if 'avatars' bucket exists)");
    } finally {
      setUploading(false);
    }
  };

  // --- 3. Handle Input Change ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'mobile') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 10) setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // --- 4. Save Changes ---
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
        // avatar_url: formData.avatar_url // Add this column to public.users if you want to persist it there
      };

      const { error } = await supabase.from('users').upsert(updates, { onConflict: 'id' });
      if (error) throw error;

      // Sync with Auth Metadata
      await supabase.auth.updateUser({
        data: { 
          full_name: formData.name, 
          name: formData.name,
          avatar_url: formData.avatar_url 
        }
      });

      toast.success("Profile updated!");
      setIsEditing(false); // Exit Edit Mode
    } catch (error: any) {
      console.error("Save Error:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center text-white">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans selection:bg-purple-500 selection:text-white">
      
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 bg-[#121212] sticky top-0 z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="p-2 -ml-2 mr-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold">My Profile</h1>
          </div>
          
          {/* Edit / Cancel Toggle */}
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
            >
              <Edit2 className="h-4 w-4 mr-2" /> Edit Profile
            </button>
          ) : (
            <button 
              onClick={() => setIsEditing(false)}
              className="flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4 mr-2" /> Cancel
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-[#1E1E1E] rounded-2xl border border-gray-800 p-8 shadow-xl relative overflow-hidden">
          
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none"></div>

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
                   className="w-28 h-28 rounded-full border-4 border-[#1E1E1E] shadow-2xl object-cover"
                 />
              ) : (
                <div className="w-28 h-28 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-2xl border-4 border-[#1E1E1E]">
                  {formData.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              
              {/* Camera Overlay (Only visible in Edit Mode) */}
              {isEditing && (
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                  {uploading ? <Loader2 className="h-8 w-8 text-white animate-spin"/> : <Camera className="h-8 w-8 text-white" />}
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
            
            <h2 className="mt-4 text-2xl font-bold">{formData.name || 'New User'}</h2>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>

          <form onSubmit={handleSave} className="space-y-6 relative z-10">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative group">
                <User className={`absolute left-4 top-3.5 h-5 w-5 ${isEditing ? 'text-purple-500' : 'text-gray-600'} transition-colors`} />
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full bg-[#121212] border rounded-xl py-3 pl-12 pr-4 text-white outline-none transition-all 
                    ${isEditing 
                      ? 'border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500' 
                      : 'border-transparent cursor-default text-gray-300'}`}
                  placeholder="Enter your name"
                />
              </div>
            </div>

            {/* Email (Always Read-Only) */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-600" />
                <input 
                  type="email" 
                  value={formData.email}
                  disabled
                  className="w-full bg-[#121212] border border-transparent rounded-xl py-3 pl-12 pr-4 text-gray-400 cursor-not-allowed outline-none"
                />
                <Lock className="absolute right-4 top-3.5 h-4 w-4 text-gray-600" />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mobile Number</label>
              <div className="relative group">
                <Phone className={`absolute left-4 top-3.5 h-5 w-5 ${isEditing ? 'text-purple-500' : 'text-gray-600'} transition-colors`} />
                <input 
                  type="tel" 
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  disabled={!isEditing}
                  maxLength={10}
                  className={`w-full bg-[#121212] border rounded-xl py-3 pl-12 pr-4 text-white outline-none transition-all font-mono tracking-wider
                    ${isEditing 
                      ? 'border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500' 
                      : 'border-transparent cursor-default text-gray-300'}`}
                  placeholder={isEditing ? "9876543210" : "Not set"}
                />
              </div>
              {isEditing && (
                <p className="text-[10px] text-gray-500 mt-1 ml-1 text-right">
                  {formData.mobile.length}/10 digits
                </p>
              )}
            </div>

            {/* Save Button (Only visible in Edit Mode) */}
            {isEditing && (
              <div className="pt-6 border-t border-gray-800 flex justify-end animate-in fade-in slide-in-from-bottom-2">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-purple-900/20 transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
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