
import React from 'react';

const SettingsCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

const InputField: React.FC<{ label: string; type: string; id: string; value: string }> = ({ label, type, id, value }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1">
            <input
                type={type}
                name={id}
                id={id}
                defaultValue={value}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#623CEA] focus:ring-[#623CEA] sm:text-sm"
            />
        </div>
    </div>
);

export const SettingsPage: React.FC = () => {
    return (
        <div className="p-4 md:p-8 space-y-8">
            <SettingsCard title="Profile Management">
                <div className="space-y-4">
                    <InputField label="Full Name" type="text" id="fullName" value="Dev Team" />
                    <InputField label="Email Address" type="email" id="email" value="team@example.com" />
                     <button className="px-4 py-2 text-sm font-semibold text-white bg-[#623CEA] hover:bg-[#5028d9] rounded-lg shadow-sm transition-colors">
                        Update Profile
                    </button>
                </div>
            </SettingsCard>

            <SettingsCard title="API Key Management">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">Your API Key</label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <input
                                type="text"
                                name="apiKey"
                                id="apiKey"
                                readOnly
                                value="cl_******************************"
                                className="block w-full flex-1 rounded-none rounded-l-md border-gray-300 bg-gray-50 focus:border-[#623CEA] focus:ring-[#623CEA] sm:text-sm"
                            />
                            <button className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-[#623CEA] focus:outline-none focus:ring-1 focus:ring-[#623CEA]">
                                <span>Copy</span>
                            </button>
                        </div>
                    </div>
                    <button className="px-4 py-2 text-sm font-semibold text-white bg-[#623CEA] hover:bg-[#5028d9] rounded-lg shadow-sm transition-colors">
                        Regenerate Key
                    </button>
                </div>
            </SettingsCard>
            
            <SettingsCard title="AWS Integration">
                 <div className="space-y-4">
                    <p className="text-sm text-gray-600">Connect your AWS account to enable personalized cost-saving recommendations and infrastructure analysis. (Coming soon)</p>
                     <button disabled className="px-4 py-2 text-sm font-semibold text-white bg-gray-400 rounded-lg cursor-not-allowed">
                        Connect AWS Account
                    </button>
                </div>
            </SettingsCard>
        </div>
    );
};
