
import React, { useState } from 'react';
import { Message as MessageType, Role } from '../types';
import { ClipboardIcon, CheckIcon } from './icons';

interface MessageProps {
  message: MessageType;
  isLoading?: boolean;
}

const CodeBlock: React.FC<{ code: string }> = ({ code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gray-800 rounded-lg my-2 relative">
            <div className="flex justify-between items-center px-4 py-1 bg-gray-900/50 rounded-t-lg">
                <span className="text-xs text-gray-400">Code Snippet</span>
                <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white">
                    {copied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <ClipboardIcon className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm text-white">
                <code>{code}</code>
            </pre>
        </div>
    );
};

const renderContent = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
        if (part.startsWith('```')) {
            const code = part.replace(/```(bash|sh|javascript|python|json|typescript|tsx|html|zsh)?\n?/g, '').replace(/```/g, '').trim();
            return <CodeBlock key={index} code={code} />;
        }
        return <p key={index} className="whitespace-pre-wrap leading-relaxed">{part}</p>;
    });
};

export const Message: React.FC<MessageProps> = ({ message, isLoading = false }) => {
  const isUser = message.role === Role.USER;

  const TypingIndicator = () => (
    <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 animate-[bounce_1s_infinite] rounded-full bg-gray-400"></span>
        <span className="h-2 w-2 animate-[bounce_1s_infinite_200ms] rounded-full bg-gray-400 [animation-delay:200ms]"></span>
        <span className="h-2 w-2 animate-[bounce_1s_infinite_400ms] rounded-full bg-gray-400 [animation-delay:400ms]"></span>
    </div>
  );

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#623CEA] to-[#8A2BE2]">
          <img src="https://i.ibb.co/6P8fCgC/cloudy-logo.png" alt="AI Avatar" className="w-7 h-7" />
        </div>
      )}
      <div className={`max-w-xl rounded-2xl px-4 py-3 shadow-sm ${isUser ? 'bg-[#623CEA] text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'}`}>
        {isLoading ? <TypingIndicator /> : renderContent(message.content)}
      </div>
    </div>
  );
};
