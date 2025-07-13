
import React from 'react';
import { AWS_TOPICS, PlusIcon, CloseIcon, DashboardIcon, SettingsIcon, BillingIcon, SpeakingIcon } from './icons';
import { AppPage } from '../types';

interface SidebarProps {
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  onTopicSelect: (topic: string) => void;
  onNewChat: () => void;
  activeTopic: string;
  onPageSelect: (page: AppPage) => void;
  currentPage: AppPage;
  onNavigateToVoiceAgent: () => void;
}

const NavLink: React.FC<{
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon: Icon, label, isActive, onClick }) => (
  <a
    href="#"
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-[#623CEA] ${isActive ? 'bg-purple-100 text-[#623CEA]' : ''}`}
  >
    <Icon className="h-5 w-5" />
    <span className="text-sm font-medium">{label}</span>
  </a>
);

export const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, setSidebarOpen, onTopicSelect, onNewChat, activeTopic, onPageSelect, currentPage, onNavigateToVoiceAgent }) => {
  return (
    <>
      <div className={`fixed inset-0 z-30 bg-black/50 transition-opacity md:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)}></div>
      <aside className={`absolute md:relative z-40 flex h-full w-64 flex-col bg-white transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} border-r border-gray-200`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-[#623CEA]">Cloudy AI</h1>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 rounded-md hover:bg-gray-100">
            <CloseIcon className="w-6 h-6"/>
          </button>
        </div>
        <div className="p-4">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#623CEA] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#5028d9] focus:outline-none focus:ring-2 focus:ring-[#623CEA] focus:ring-offset-2"
          >
            <PlusIcon className="h-5 w-5" />
            New Chat
          </button>
        </div>
        
        <nav className="flex-1 space-y-4 p-4">
          <div>
             <NavLink
              icon={DashboardIcon}
              label="Dashboard"
              isActive={currentPage === 'chat'}
              onClick={() => onPageSelect('chat')}
            />
          </div>
          
          <div>
            <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">AWS Services</p>
            <div className="space-y-1">
              {AWS_TOPICS.map(({ name, icon: Icon }) => (
                <NavLink
                  key={name}
                  icon={Icon}
                  label={name}
                  isActive={currentPage === 'chat' && activeTopic === name}
                  onClick={() => onTopicSelect(name)}
                />
              ))}
            </div>
          </div>
           <div>
            <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tools</p>
            <div className="space-y-1">
              <NavLink
                icon={SpeakingIcon}
                label="Voice Agent"
                isActive={false}
                onClick={onNavigateToVoiceAgent}
              />
            </div>
          </div>
           <div>
            <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Account</p>
            <div className="space-y-1">
              <NavLink
                icon={BillingIcon}
                label="Billing"
                isActive={currentPage === 'billing'}
                onClick={() => onPageSelect('billing')}
              />
              <NavLink
                icon={SettingsIcon}
                label="Settings"
                isActive={currentPage === 'settings'}
                onClick={() => onPageSelect('settings')}
              />
            </div>
          </div>
        </nav>

        <div className="mt-auto border-t border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <img
              src="https://picsum.photos/seed/user/40/40"
              alt="User Avatar"
              className="h-10 w-10 rounded-full"
            />
            <div>
              <p className="text-sm font-semibold">Dev Team</p>
              <p className="text-xs text-gray-500">Pro Plan</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
