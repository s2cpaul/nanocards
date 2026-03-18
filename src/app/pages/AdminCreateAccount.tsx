import { useState } from 'react';
import { projectId, publicAnonKey } from '../../lib/supabase';

export function AdminCreateAccount() {
  const [accountType, setAccountType] = useState<'individual' | 'organization'>('individual');
  const [email, setEmail] = useState('carapaulson1@gmail.com');
  const [name, setName] = useState('Cara Paulson');
  const [organizationName, setOrganizationName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleCreateAccount = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const endpoint = accountType === 'organization' 
        ? 'admin/create-org-account'
        : 'admin/create-account';

      const body = accountType === 'organization'
        ? { email, name, organizationName }
        : { email, name };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d91f8206/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create account');
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin: Create Account</h1>
          
          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="admin-accountType" className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
              <select
                id="admin-accountType"
                value={accountType}
                onChange={(e) => setAccountType(e.target.value as 'individual' | 'organization')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="individual">Individual</option>
                <option value="organization">Organization</option>
              </select>
            </div>

            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label htmlFor="admin-name" className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                id="admin-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Full Name"
              />
            </div>

            {accountType === 'organization' && (
              <div>
                <label htmlFor="admin-orgName" className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
                <input
                  id="admin-orgName"
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Organization Name"
                />
              </div>
            )}
          </div>

          <button
            onClick={handleCreateAccount}
            disabled={loading || !email}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">Error:</p>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-bold text-lg mb-4">✅ {accountType === 'organization' ? 'Organization ' : ''}Account Created Successfully!</p>
              
              <div className="space-y-3">
                {accountType === 'organization' && result.organization && (
                  <>
                    <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 mb-4">
                      <p className="text-sm font-bold text-blue-900 mb-2">🏢 Organization ID</p>
                      <p className="text-2xl font-mono font-bold text-blue-700">{result.organization.orgId}</p>
                      <p className="text-xs text-blue-600 mt-2">This is the unique org ID auto-generated from {email} + Julian date/time</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700">Organization Name:</p>
                      <p className="text-gray-900">{result.organization.name}</p>
                    </div>

                    {result.organization.contactName && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Contact Name:</p>
                        <p className="text-gray-900">{result.organization.contactName}</p>
                      </div>
                    )}
                  </>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-700">Email:</p>
                  <p className="text-gray-900">{accountType === 'organization' ? result.organization.email : result.user.email}</p>
                </div>

                {result.user && result.user.name && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Name:</p>
                    <p className="text-gray-900">{result.user.name}</p>
                  </div>
                )}

                {accountType === 'organization' && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Organization ID:</p>
                    <p className="text-gray-900 font-mono text-lg">{result.organization.orgId}</p>
                  </div>
                )}

                {accountType === 'organization' && result.organization.orgPrefix && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Organization Prefix:</p>
                    <p className="text-gray-900 font-mono">{result.organization.orgPrefix}</p>
                  </div>
                )}

                {/* User ID removed - not displayed to users */}

                <div className="pt-4 border-t border-green-300">
                  <p className="text-sm font-medium text-gray-700 mb-2">{accountType === 'organization' ? 'Initial Password (Org ID)' : 'Temporary Password'}:</p>
                  <div className="bg-white p-3 rounded border border-gray-300">
                    <p className="text-gray-900 font-mono text-sm break-all">{result.initialPassword || result.temporaryPassword}</p>
                  </div>
                  {accountType === 'organization' ? (
                    <p className="text-xs text-gray-600 mt-2">ℹ️ The org ID is used as the initial password for easy team access. Users should change it after first login.</p>
                  ) : (
                    <p className="text-xs text-gray-600 mt-2">⚠️ This password is NOT emailed to the user. They must change it within 30 days.</p>
                  )}
                </div>

                <div className="pt-4 border-t border-green-300">
                  <p className="text-sm font-medium text-gray-700">Password Change Recommended By:</p>
                  <p className="text-gray-900">{new Date(result.passwordChangeRecommendedBy).toLocaleDateString()}</p>
                </div>

                <div className="pt-4 border-t border-green-300">
                  <p className="text-sm text-gray-700 italic">{result.message}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-bold text-blue-900 mb-2">How Account Creation Works:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Account is created in Supabase Auth</li>
              <li>✓ Random secure 16-character password is generated</li>
              <li>✓ Email is automatically confirmed (no email verification needed)</li>
              <li>✓ User profile is stored in KV store with 0 points and 'free' tier</li>
              <li>✓ Password change is recommended within 30 days</li>
              <li>⚠️ Temporary password is ONLY shown here - NEVER emailed to user</li>
              <li>📧 User should receive a welcome email explaining they need to set a new password</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}