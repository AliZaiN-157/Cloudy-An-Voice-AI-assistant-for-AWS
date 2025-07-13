
import React from 'react';
import { Ec2Icon, S3Icon, LambdaIcon, IamIcon, CheckIcon } from './icons';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingHeader: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => (
  <header className="bg-white/80 backdrop-blur-md fixed top-0 left-0 right-0 z-50 border-b border-gray-100">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <img src="https://i.ibb.co/6P8fCgC/cloudy-logo.png" alt="Cloudy Logo" className="w-8 h-8"/>
          <span className="text-xl font-bold text-[#623CEA]">Cloudy AI</span>
        </div>
        <button
          onClick={onGetStarted}
          className="px-4 py-2 text-sm font-semibold text-white bg-[#623CEA] hover:bg-[#5028d9] rounded-lg shadow-sm transition-colors"
        >
          Login / Sign Up
        </button>
      </div>
    </div>
  </header>
);

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-[#623CEA] transition-all duration-300">
    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 text-[#623CEA]">
      {icon}
    </div>
    <h3 className="mt-4 text-lg font-bold text-gray-800">{title}</h3>
    <p className="mt-2 text-gray-600">{description}</p>
  </div>
);

const TestimonialCard: React.FC<{ quote: string; author: string; role: string; avatar: string }> = ({ quote, author, role, avatar }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <p className="text-gray-700">"{quote}"</p>
      <div className="mt-4 flex items-center gap-3">
        <img src={avatar} alt={author} className="w-10 h-10 rounded-full" />
        <div>
          <p className="font-semibold text-gray-900">{author}</p>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </div>
    </div>
);


export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="bg-white text-gray-800">
      <LandingHeader onGetStarted={onGetStarted} />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative text-center py-24 sm:py-32 lg:py-40 px-4 bg-gray-50 overflow-hidden">
            <div className="absolute inset-0 z-0">
                <div className="absolute h-96 w-96 bg-purple-100 rounded-full -top-32 -left-32 opacity-50"></div>
                <div className="absolute h-96 w-96 bg-purple-100 rounded-full -bottom-32 -right-32 opacity-50"></div>
            </div>
            <div className="container mx-auto relative z-10">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900">
                Master AWS with Your Personal <span className="text-[#623CEA]">AI Cloud Assistant</span>
                </h1>
                <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600">
                Cloudy provides expert guidance, instant code snippets, and best practices to accelerate your cloud development.
                </p>
                <div className="mt-8">
                <button
                    onClick={onGetStarted}
                    className="px-8 py-3 text-base font-semibold text-white bg-[#623CEA] hover:bg-[#5028d9] rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                    Get Started For Free
                </button>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 sm:py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">Why Cloudy AI?</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">Everything you need to navigate the complexities of AWS.</p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                title="Instant AWS Guidance"
                description="Get immediate, clear answers to your AWS questions, from basic concepts to advanced architectures."
              />
              <FeatureCard 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>}
                title="Ready-to-use Snippets"
                description="Generate correct and efficient code snippets and CLI commands for various AWS services. Just copy and paste."
              />
              <FeatureCard 
                icon={<CheckIcon className="h-6 w-6" />}
                title="Best Practice Explanations"
                description="Learn the 'why' behind AWS recommendations, ensuring your infrastructure is secure, scalable, and cost-effective."
              />
            </div>
          </div>
        </section>
        
        {/* AWS Services Section */}
        <section className="py-20 sm:py-24 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Covers All Major AWS Services</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">From compute and storage to serverless and security, we've got you covered.</p>
                </div>
                <div className="mt-12 flex flex-wrap justify-center items-center gap-8 md:gap-12">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                        <Ec2Icon className="h-8 w-8 text-[#623CEA]" /> <span className="font-semibold text-gray-700">EC2</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                        <S3Icon className="h-8 w-8 text-[#623CEA]" /> <span className="font-semibold text-gray-700">S3</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                        <LambdaIcon className="h-8 w-8 text-[#623CEA]" /> <span className="font-semibold text-gray-700">Lambda</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                        <IamIcon className="h-8 w-8 text-[#623CEA]" /> <span className="font-semibold text-gray-700">IAM</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                        <span className="font-semibold text-gray-700">And many more...</span>
                    </div>
                </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 sm:py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">Loved by Developers Worldwide</h2>
               <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">Don't just take our word for it. Here's what our users are saying.</p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-1 lg:grid-cols-2">
                <TestimonialCard 
                    quote="Cloudy AI has been a game-changer for our team. We're building and deploying faster than ever before. The explanations are incredibly clear."
                    author="Alex Johnson"
                    role="Senior DevOps Engineer at TechCorp"
                    avatar="https://randomuser.me/api/portraits/men/32.jpg"
                />
                <TestimonialCard 
                    quote="As someone new to AWS, Cloudy was the perfect guide. It's like having a senior engineer available 24/7 to answer my questions."
                    author="Samantha Lee"
                    role="Full-Stack Developer at Innovate LLC"
                    avatar="https://randomuser.me/api/portraits/women/44.jpg"
                />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-50 border-t border-gray-200">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-600">&copy; 2024 Cloudy AI. All rights reserved.</p>
                    <div className="flex gap-4 text-sm text-gray-600">
                        <a href="#" className="hover:text-[#623CEA]">Terms of Service</a>
                        <a href="#" className="hover:text-[#623CEA]">Privacy Policy</a>
                    </div>
                </div>
            </div>
        </footer>
      </main>
    </div>
  );
};
