
import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { VoiceAgentPage } from './components/VoiceAgentPage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatInterface } from './components/ChatInterface';
import { SettingsPage } from './components/SettingsPage';
import { BillingPage } from './components/BillingPage';
import { Message, Role, AppPage } from './types';
import { generateChatResponse } from './services/geminiService';


type AppView = 'landing' | 'login' | 'dashboard' | 'voice-agent';

const Dashboard: React.FC<{ onNavigateToVoiceAgent: () => void }> = ({ onNavigateToVoiceAgent }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<AppPage>('chat');
  const [activeTopic, setActiveTopic] = useState<string>('Welcome');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (text: string, topic?: string) => {
    const userMessage: Message = { id: Date.now().toString(), role: Role.USER, content: text };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    if(topic) setActiveTopic(topic);

    const aiResponseText = await generateChatResponse(text);

    const aiMessage: Message = { id: (Date.now() + 1).toString(), role: Role.AI, content: aiResponseText };
    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
    if(topic) setActiveTopic(topic);
  };
  
  const handleTopicSelect = (topic: string) => {
    setCurrentPage('chat');
    setMessages([]);
    handleSendMessage(`Tell me about AWS ${topic}.`, topic);
  };
  
  const handleNewChat = () => {
    setCurrentPage('chat');
    setActiveTopic('Welcome');
    setMessages([]);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'chat':
        return <ChatInterface messages={messages} isLoading={isLoading} onSendMessage={handleSendMessage} onTopicSelect={handleTopicSelect} />;
      case 'settings':
        return <SettingsPage />;
      case 'billing':
        return <BillingPage />;
      default:
        return <ChatInterface messages={messages} isLoading={isLoading} onSendMessage={handleSendMessage} onTopicSelect={handleTopicSelect} />;
    }
  };

  const getHeaderTopic = () => {
    if (currentPage === 'chat') return activeTopic;
    if (currentPage === 'settings') return 'Settings';
    if (currentPage === 'billing') return 'Billing';
    return 'Dashboard';
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onTopicSelect={handleTopicSelect}
        onNewChat={handleNewChat}
        activeTopic={activeTopic}
        onPageSelect={setCurrentPage}
        currentPage={currentPage}
        onNavigateToVoiceAgent={onNavigateToVoiceAgent}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} topic={getHeaderTopic()} />
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [view, setView] = useState<AppView>('landing');

  const handleGetStarted = () => setView('login');
  const handleLogin = () => setView('dashboard');
  const handleNavigateToVoiceAgent = () => setView('voice-agent');
  const handleBackToDashboard = () => setView('dashboard');

  const renderContent = () => {
    switch (view) {
      case 'landing':
        return <LandingPage onGetStarted={handleGetStarted} />;
      case 'login':
        return <LoginPage onLogin={handleLogin} />;
      case 'dashboard':
        return <Dashboard onNavigateToVoiceAgent={handleNavigateToVoiceAgent} />;
      case 'voice-agent':
        return <VoiceAgentPage onBack={handleBackToDashboard} />;
      default:
        return <LandingPage onGetStarted={handleGetStarted} />;
    }
  };

  return <div className="h-screen w-screen bg-gray-50 text-gray-800">{renderContent()}</div>;
};

export default App;
