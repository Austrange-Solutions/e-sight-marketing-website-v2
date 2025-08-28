import React, { useState, useEffect } from 'react';
import { Settings, Save, RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react';

interface AdminSetting {
  settingKey: string;
  settingValue: string | number | boolean;
  description: string;
}

interface DeliverySettingsProps {
  onRefresh: () => void;
}

const DeliverySettings: React.FC<DeliverySettingsProps> = ({ onRefresh }) => {
  const [settings, setSettings] = useState<Record<string, string | number | boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const defaultSettings: AdminSetting[] = [
    {
      settingKey: "DEFAULT_DELIVERY_CHARGES",
      settingValue: 500,
      description: "Default delivery charges for areas not in our delivery zone (₹)"
    },
    {
      settingKey: "MUMBAI_SUBURBAN_CHARGES",
      settingValue: 100,
      description: "Standard delivery charges for Mumbai suburban areas (₹)"
    },
    {
      settingKey: "PINCODE_VALIDATION_STRICT",
      settingValue: true,
      description: "Enable strict pincode validation (exact digit-by-digit matching)"
    },
    {
      settingKey: "PINCODE_LENGTH_VALIDATION",
      settingValue: 6,
      description: "Required pincode length (digits)"
    },
    {
      settingKey: "FREE_DELIVERY_THRESHOLD",
      settingValue: 2000,
      description: "Minimum order amount for free delivery (₹)"
    }
  ];

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const result = await response.json();
        setSettings(result.data || {});
      } else {
        console.error('Failed to fetch settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeSettings = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/settings/initialize', {
        method: 'POST'
      });
      
      if (response.ok) {
        const result = await response.json();
        setMessage({ type: 'success', text: result.message });
        await fetchSettings();
        onRefresh();
      } else {
        setMessage({ type: 'error', text: 'Failed to initialize settings' });
      }
    } catch (error) {
      console.error('Error initializing settings:', error);
      setMessage({ type: 'error', text: 'Error initializing settings' });
    } finally {
      setSaving(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      const settingsArray = defaultSettings.map(defaultSetting => ({
        settingKey: defaultSetting.settingKey,
        settingValue: settings[defaultSetting.settingKey] !== undefined 
          ? settings[defaultSetting.settingKey] 
          : defaultSetting.settingValue,
        description: defaultSetting.description
      }));

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings: settingsArray })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully' });
        await fetchSettings();
        onRefresh();
      } else {
        setMessage({ type: 'error', text: 'Failed to save settings' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Error saving settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (settingKey: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [settingKey]: value
    }));
    setMessage(null);
  };

  const resetToDefaults = () => {
    const defaultValues = defaultSettings.reduce((acc, setting) => {
      acc[setting.settingKey] = setting.settingValue;
      return acc;
    }, {} as Record<string, string | number | boolean>);
    setSettings(defaultValues);
    setMessage(null);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Delivery Settings</h2>
          <p className="text-gray-600">Configure delivery charges and validation rules</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={initializeSettings}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <Settings size={16} className="mr-2" />
            Initialize Defaults
          </button>
          <button
            onClick={resetToDefaults}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-orange-300 rounded-md text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 disabled:opacity-50"
          >
            <RotateCcw size={16} className="mr-2" />
            Reset
          </button>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save size={16} className="mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex">
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-400" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-400" />
            )}
            <div className="ml-3">
              <p className={`text-sm ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message.text}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Settings Form */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Delivery Configuration</h3>
        </div>
        
        <div className="p-6 space-y-6">
          {defaultSettings.map((defaultSetting) => (
            <div key={defaultSetting.settingKey} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {defaultSetting.settingKey.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                </label>
                <p className="text-xs text-gray-500">{defaultSetting.description}</p>
              </div>
              
              <div className="md:col-span-2">
                {typeof defaultSetting.settingValue === 'boolean' ? (
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={defaultSetting.settingKey}
                        checked={settings[defaultSetting.settingKey] === true}
                        onChange={() => handleInputChange(defaultSetting.settingKey, true)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enabled</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={defaultSetting.settingKey}
                        checked={settings[defaultSetting.settingKey] === false}
                        onChange={() => handleInputChange(defaultSetting.settingKey, false)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Disabled</span>
                    </label>
                  </div>
                ) : typeof defaultSetting.settingValue === 'number' ? (
                  <input
                    type="number"
                    min="0"
                    value={settings[defaultSetting.settingKey] !== undefined ? Number(settings[defaultSetting.settingKey]) : Number(defaultSetting.settingValue)}
                    onChange={(e) => handleInputChange(defaultSetting.settingKey, parseInt(e.target.value) || 0)}
                    className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <input
                    type="text"
                    value={settings[defaultSetting.settingKey] !== undefined ? String(settings[defaultSetting.settingKey]) : String(defaultSetting.settingValue)}
                    onChange={(e) => handleInputChange(defaultSetting.settingKey, e.target.value)}
                    className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Validation Rules Info */}
        <div className="px-6 py-4 bg-blue-50 border-t border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Strict Pincode Validation Rules:</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Pincode must be exactly 6 digits (000000-999999)</li>
            <li>• Each digit is matched character-by-character with database</li>
            <li>• No partial matches or fuzzy matching allowed</li>
            <li>• Invalid pincodes get default delivery charges as configured above</li>
            <li>• Free delivery applies when order amount exceeds threshold</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DeliverySettings;
