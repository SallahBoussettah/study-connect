import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheck, FaTimes } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PricingTier = ({ title, price, period, description, features, buttonText, buttonLink, highlighted = false }) => {
  return (
    <div className={`flex flex-col h-full rounded-2xl shadow-lg overflow-hidden ${highlighted ? 'border-2 border-primary-500 transform scale-105 z-10' : 'border border-secondary-200'}`}>
      <div className={`p-8 ${highlighted ? 'bg-primary-600 text-white' : 'bg-white text-secondary-900'}`}>
        <h3 className="text-2xl font-bold">{title}</h3>
        <div className="mt-4 flex items-baseline">
          <span className="text-4xl font-extrabold">{price}</span>
          {period && <span className="ml-1 text-xl font-medium text-opacity-80">{period}</span>}
        </div>
        <p className={`mt-5 text-lg ${highlighted ? 'text-primary-100' : 'text-secondary-600'}`}>{description}</p>
      </div>
      
      <div className="flex-grow bg-white p-8">
        <ul className="space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 text-primary-500 mr-2">
                {feature.included ? <FaCheck /> : <FaTimes className="text-secondary-400" />}
              </span>
              <span className={feature.included ? 'text-secondary-800' : 'text-secondary-400'}>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="p-8 bg-white border-t border-secondary-100">
        <Link 
          to={buttonLink} 
          className={`block w-full py-3 px-6 text-center rounded-lg font-medium transition-all duration-200 ${
            highlighted 
              ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-200' 
              : 'bg-secondary-100 text-secondary-800 hover:bg-secondary-200'
          }`}
        >
          {buttonText}
        </Link>
      </div>
    </div>
  );
};

const PricingPage = () => {
  const pricingTiers = [
    {
      title: "Basic",
      price: "Free",
      period: "",
      description: "Perfect for individual students just getting started.",
      highlighted: false,
      buttonText: "Get Started",
      buttonLink: "/register",
      features: [
        { text: "Join up to 5 study rooms", included: true },
        { text: "500MB storage for resources", included: true },
        { text: "Text chat in rooms", included: true },
        { text: "Basic flashcards & notes", included: true },
        { text: "Study timer", included: true },
        { text: "Up to 5 simultaneous collaborators", included: true },
        { text: "Voice & video calls", included: false },
        { text: "Advanced study analytics", included: false },
        { text: "AI study recommendations", included: false },
      ]
    },
    {
      title: "Pro",
      price: "$5.99",
      period: "/month",
      description: "Enhanced features for serious students.",
      highlighted: true,
      buttonText: "Try Pro Free",
      buttonLink: "/register?plan=pro",
      features: [
        { text: "Unlimited study rooms", included: true },
        { text: "5GB storage for resources", included: true },
        { text: "Text, voice & video chat", included: true },
        { text: "Advanced flashcards & rich notes", included: true },
        { text: "Customizable study timer", included: true },
        { text: "Up to 20 simultaneous collaborators", included: true },
        { text: "Personal study analytics", included: true },
        { text: "AI study recommendations", included: true },
        { text: "Priority support", included: true },
      ]
    },
    {
      title: "Campus",
      price: "Custom",
      period: "",
      description: "Tailored solutions for educational institutions.",
      highlighted: false,
      buttonText: "Contact Us",
      buttonLink: "/contact",
      features: [
        { text: "Custom branding", included: true },
        { text: "Unlimited storage", included: true },
        { text: "All communication features", included: true },
        { text: "All study tools", included: true },
        { text: "Admin dashboard", included: true },
        { text: "LMS integration", included: true },
        { text: "Institution-wide analytics", included: true },
        { text: "API access", included: true },
        { text: "Dedicated account manager", included: true },
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-24">
        <section className="py-20 bg-gradient-to-b from-primary-50 to-white">
          <div className="container-custom">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-secondary-900">
                Simple, Transparent <span className="text-primary-600">Pricing</span>
              </h1>
              <p className="mt-6 text-xl text-secondary-600">
                Choose the plan that works best for you. All plans include core features to enhance your study experience.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {pricingTiers.map((tier, index) => (
                <PricingTier key={index} {...tier} />
              ))}
            </div>
            
            <div className="mt-16 text-center">
              <h3 className="text-2xl font-bold text-secondary-900 mb-6">Special Programs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h4 className="font-semibold text-lg mb-2">Student Discount</h4>
                  <p className="text-secondary-600">50% off Pro plan for verified students</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h4 className="font-semibold text-lg mb-2">Educators</h4>
                  <p className="text-secondary-600">Free Pro accounts for verified teachers</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h4 className="font-semibold text-lg mb-2">Nonprofits</h4>
                  <p className="text-secondary-600">Special rates for educational nonprofits</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h4 className="font-semibold text-lg mb-2">Referrals</h4>
                  <p className="text-secondary-600">Get free Pro months by referring friends</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-20 bg-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto bg-secondary-50 rounded-2xl p-8 md:p-12">
              <h2 className="text-3xl font-bold text-secondary-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-secondary-800 mb-2">Can I switch between plans?</h3>
                  <p className="text-secondary-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-secondary-800 mb-2">Is there a free trial for Pro?</h3>
                  <p className="text-secondary-600">Yes, we offer a 14-day free trial of StudyConnect Pro so you can experience all the premium features before committing.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-secondary-800 mb-2">What happens to my data if I downgrade?</h3>
                  <p className="text-secondary-600">If you exceed the storage limit of your new plan, you won't be able to upload new files until you're under the limit, but you won't lose access to existing files.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-secondary-800 mb-2">Do you offer refunds?</h3>
                  <p className="text-secondary-600">We offer a 30-day money-back guarantee if you're not satisfied with your Pro subscription.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PricingPage; 