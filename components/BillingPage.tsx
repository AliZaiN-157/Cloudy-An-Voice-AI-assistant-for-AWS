
import React from 'react';
import { CheckIcon } from './icons';

const PricingCard: React.FC<{
    plan: string;
    price: string;
    description: string;
    features: string[];
    isFeatured?: boolean;
}> = ({ plan, price, description, features, isFeatured = false }) => (
    <div className={`relative flex flex-col rounded-2xl border ${isFeatured ? 'border-[#623CEA] border-2' : 'border-gray-200'} bg-white shadow-sm`}>
        {isFeatured && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#623CEA] px-3 py-1 text-sm font-semibold text-white">
                Most Popular
            </div>
        )}
        <div className="p-8">
            <h3 className="text-xl font-semibold text-gray-900">{plan}</h3>
            <p className="mt-2 text-gray-500">{description}</p>
            <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-gray-900">${price}</span>
                <span className="text-sm font-semibold text-gray-500">/ month</span>
            </div>
            <a
                href="#"
                className={`mt-6 block w-full rounded-lg px-4 py-2 text-center text-sm font-semibold ${isFeatured ? 'bg-[#623CEA] text-white hover:bg-[#5028d9]' : 'bg-white text-[#623CEA] border border-[#623CEA] hover:bg-purple-50'}`}
            >
                {plan === 'Free' ? 'Get Started' : `Choose ${plan}`}
            </a>
        </div>
        <div className="flex-1 border-t border-gray-200 p-8">
            <ul role="list" className="space-y-4">
                {features.map((feature) => (
                    <li key={feature} className="flex items-start">
                        <CheckIcon className="h-6 w-6 flex-shrink-0 text-green-500" />
                        <p className="ml-3 text-sm text-gray-600">{feature}</p>
                    </li>
                ))}
            </ul>
        </div>
    </div>
);


export const BillingPage: React.FC = () => {
  return (
    <div className="p-4 md:p-8">
        <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Pricing Plans</h2>
            <p className="mt-4 text-lg text-gray-600">
                Choose the plan that's right for your team. All plans start with a 14-day free trial.
            </p>
        </div>
        <div className="mt-12 grid max-w-lg gap-8 lg:max-w-none lg:grid-cols-3 mx-auto">
            <PricingCard
                plan="Free"
                price="0"
                description="For individuals and hobbyists starting with AWS."
                features={[
                    '20 AI queries per month',
                    'Access to core AWS service guides',
                    'Community support',
                ]}
            />
            <PricingCard
                plan="Pro"
                price="29"
                description="For professional developers and small teams."
                features={[
                    'Unlimited AI queries',
                    'All AWS service guides',
                    'Code snippet generation',
                    'Priority email support',
                ]}
                isFeatured={true}
            />
            <PricingCard
                plan="Team"
                price="79"
                description="For larger teams and organizations with advanced needs."
                features={[
                    'All Pro features',
                    'Team member management',
                    'AWS Integration (soon)',
                    'Dedicated support channel',
                ]}
            />
        </div>
    </div>
  );
};
