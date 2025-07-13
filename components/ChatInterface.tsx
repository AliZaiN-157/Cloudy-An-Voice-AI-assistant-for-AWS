
import React, { useEffect, useRef } from 'react';
import { Message as MessageType, Role } from '../types';
import { Message } from './Message';
import { SendIcon, AWS_TOPICS } from './icons';

interface ChatInterfaceProps {
  messages: MessageType[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onTopicSelect: (topic: string) => void;
}

const WelcomeScreen: React.FC<{onTopicSelect: (topic: string) => void}> = ({onTopicSelect}) => (
  <div className="text-center">
    <div className="inline-block p-4 bg-gradient-to-r from-[#623CEA] to-[#8A2BE2] rounded-full">
        <div className="p-2 bg-white rounded-full">
            <img src="https://i.ibb.co/6P8fCgC/cloudy-logo.png" alt="Cloudy Logo" className="w-16 h-16"/>
        </div>
    </div>
    <h2 className="mt-6 text-2xl font-bold text-gray-800">Hello, I'm Cloudy!</h2>
    <p className="mt-2 text-gray-600">Your expert AI assistant for Amazon Web Services.</p>
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-gray-700">Suggested Topics</h3>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
        {AWS_TOPICS.map(({ name, icon: Icon }) => (
          <button
            key={name}
            onClick={() => onTopicSelect(name)}
            className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg hover:border-[#623CEA] transition-all duration-300"
          >
            <Icon className="h-8 w-8 text-[#623CEA]" />
            <span className="font-semibold text-gray-700">{name}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
);

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, isLoading, onSendMessage, onTopicSelect }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = React.useState('');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex h-full flex-col p-4 md:p-6">
      <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto pb-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <WelcomeScreen onTopicSelect={onTopicSelect} />
          </div>
        ) : (
          messages.map((msg) => <Message key={msg.id} message={msg} />)
        )}
        {isLoading && messages.length > 0 && (
           <Message key="loading" message={{id: 'loading', role: Role.AI, content: '...'}} isLoading={true} />
        )}
      </div>

      <div className="mt-auto pt-4 bg-gray-50">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about any AWS service..."
            className="w-full rounded-2xl border-gray-300 bg-white py-3 pl-4 pr-12 text-base shadow-sm focus:border-[#623CEA] focus:ring-2 focus:ring-[#623CEA]/50 transition-shadow"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute inset-y-0 right-0 flex items-center justify-center rounded-full w-10 h-10 my-auto mr-2 bg-[#623CEA] text-white disabled:bg-gray-300 transition-colors"
          >
            <SendIcon className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
