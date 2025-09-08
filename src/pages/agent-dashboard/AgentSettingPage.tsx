import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../../components/ui/Loading';
import { SupabaseService } from '../../services/supabaseService';
import { toast } from 'react-hot-toast';

const AgentSettingPage: React.FC = () => {
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    setProfileData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    });
  }, [user]);

  const handleSubmit = async(e: React.FormEvent) => {
    try {
      setLoading(true);
      const { error } = await SupabaseService.updateProfile(user?.id || '', {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
      });
      if(error){
        throw error;
      }
      toast.success('Profile updated successfully');
    } catch (error) {
      console.log(error)
    } finally{
      setLoading(false);
    }
  };

  if(loading){
    return <Loading />
  }


  return (
    <div id="settings" className="tab-content">
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input type="text" value={`${profileData.firstName}`} onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input type="text" value={`${profileData.lastName}`} onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" value={user?.email} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  </div>
                </div>
              </div>
              
              <div className="pt-4 ">
                <button type='button' onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  Save Changes
                </button>
              </div>

            </div>
          </div>
        </div>
  );
};

export default AgentSettingPage;