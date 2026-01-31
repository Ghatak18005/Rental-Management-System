'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Phone, 
  Save, 
  Loader2, 
  ChevronLeft, 
  Camera 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyProfilePage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
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

  // --- 2. Handle Input Change (With Validation) ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Special validation for Mobile Number
    if (name === 'mobile') {
      // Remove any non-numeric characters
      const numericValue = value.replace(/\D/g, '');

      // Limit to 10 digits
      if (numericValue.length <= 10) {
        setFormData({ ...formData, [name]: numericValue });
      }
    } else {
      // Normal handling for other fields
      setFormData({ ...formData, [name]: value });
    }
  };

  // --- 3. Save Changes ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Final Validation before saving
    if (formData.mobile.length !== 10) {
      toast.error("Mobile number must be exactly 10 digits");
      setSaving(false);
      return;
    }

    if (!user) return;

    try {
      const updates = {
        id: user.id,
        name: formData.name,
        mobile: formData.mobile,
        email: user.email,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('users')
        .upsert(updates, { onConflict: 'id' });

      if (error) throw error;

      await supabase.auth.updateUser({
        data: { full_name: formData.name, name: formData.name }
      });

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Save Error:", error);
      toast.error(error.message || "Failed to update profile");
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
        <div className="max-w-3xl mx-auto flex items-center">
          <button 
            onClick={() => router.back()} 
            className="p-2 -ml-2 mr-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold">My Profile</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-10">
        
        <div className="bg-[#1E1E1E] rounded-2xl border border-gray-800 p-8 shadow-xl">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative group cursor-pointer">
              {user?.user_metadata?.avatar_url ? (
                 <img 
                   src={user.user_metadata.avatar_url} 
                   alt="Profile" 
                   className="w-24 h-24 rounded-full border-4 border-[#1E1E1E] shadow-lg"
                 />
              ) : (
                <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg border-4 border-[#1E1E1E]">
                  {formData.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-8 w-8 text-white" />
              </div>
            </div>
            <p className="mt-4 text-lg font-semibold">{formData.name || 'New User'}</p>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-[#121212] border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-gray-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                  placeholder="Enter your name"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
                <input 
                  type="email" 
                  value={formData.email}
                  disabled
                  className="w-full bg-[#2a2a2a] border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-gray-400 cursor-not-allowed outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
                <input 
                  type="tel" 
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  maxLength={10} // HTML Constraint
                  className="w-full bg-[#121212] border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-gray-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all font-mono tracking-wider"
                  placeholder="9876543210"
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-1 ml-1">
                {formData.mobile.length}/10 digits
              </p>
            </div>

            {/* Save Button */}
            <div className="pt-6 border-t border-gray-800 flex justify-end">
              <button 
                type="submit" 
                disabled={saving}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-purple-900/20 transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <> <Loader2 className="animate-spin h-5 w-5 mr-2" /> Saving... </>
                ) : (
                  <> <Save className="h-5 w-5 mr-2" /> Save Changes </>
                )}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}