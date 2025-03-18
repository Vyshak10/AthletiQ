import { motion } from "framer-motion";

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: "Sign up for early access",
      description: "Join our waitlist to be among the first to experience LaunchPad. We're carefully onboarding teams to ensure everyone gets personalized support."
    },
    {
      number: 2,
      title: "Set up your workspace",
      description: "When you're invited, our guided setup process helps you customize LaunchPad to your team's specific needs in minutes, not days."
    },
    {
      number: 3,
      title: "Invite your team",
      description: "Bring your colleagues on board with simple email invitations. Your team can be up and running in no time."
    },
    {
      number: 4,
      title: "Transform your workflow",
      description: "Watch as LaunchPad streamlines communication, boosts productivity, and gives you insights you never had before."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-primary text-sm font-medium">How It Works</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6">Simple yet powerful</h2>
          <p className="text-lg text-gray-600">LaunchPad's intuitive design makes it easy to get started while providing the power and flexibility your team needs.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
            <div className="space-y-12">
              {steps.map((step, index) => (
                <motion.div 
                  key={index} 
                  className="flex"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                      {step.number}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          <motion.div 
            className="order-1 md:order-2"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
              <div className="p-2 bg-gray-100 border-b border-gray-200">
                <div className="flex space-x-1">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
              </div>
              <div className="p-4 bg-white">
                <svg
                  className="w-full h-auto"
                  viewBox="0 0 800 500"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Dashboard UI Mockup */}
                  <rect width="800" height="500" fill="#f8fafc" />
                  
                  {/* Header */}
                  <rect x="0" y="0" width="800" height="60" fill="#3B82F6" />
                  <circle cx="40" cy="30" r="20" fill="white" fillOpacity="0.2" />
                  <rect x="75" y="25" width="120" height="10" rx="2" fill="white" />
                  <rect x="600" y="20" width="80" height="20" rx="10" fill="white" fillOpacity="0.2" />
                  <rect x="700" y="20" width="60" height="20" rx="10" fill="white" fillOpacity="0.2" />
                  
                  {/* Sidebar */}
                  <rect x="0" y="60" width="200" height="440" fill="#1e3a8a" />
                  <rect x="20" y="100" width="160" height="12" rx="2" fill="#93c5fd" />
                  <rect x="20" y="130" width="160" height="10" rx="2" fill="#60a5fa" fillOpacity="0.6" />
                  <rect x="20" y="160" width="160" height="10" rx="2" fill="#60a5fa" fillOpacity="0.6" />
                  <rect x="20" y="190" width="160" height="10" rx="2" fill="#60a5fa" fillOpacity="0.6" />
                  <rect x="20" y="220" width="160" height="10" rx="2" fill="#60a5fa" fillOpacity="0.6" />
                  <rect x="20" y="250" width="160" height="10" rx="2" fill="#60a5fa" fillOpacity="0.6" />
                  
                  {/* Content Area */}
                  <rect x="220" y="80" width="560" height="50" rx="4" fill="white" />
                  <rect x="240" y="95" width="150" height="20" rx="2" fill="#3B82F6" fillOpacity="0.2" />
                  <rect x="400" y="95" width="150" height="20" rx="2" fill="#e2e8f0" />
                  <rect x="560" y="95" width="150" height="20" rx="2" fill="#e2e8f0" />
                  
                  {/* Main Content */}
                  <rect x="220" y="150" width="270" height="160" rx="4" fill="white" />
                  <rect x="240" y="170" width="100" height="20" rx="2" fill="#3B82F6" />
                  <rect x="240" y="200" width="230" height="10" rx="2" fill="#94a3b8" />
                  <rect x="240" y="220" width="230" height="10" rx="2" fill="#94a3b8" />
                  <rect x="240" y="240" width="230" height="10" rx="2" fill="#94a3b8" />
                  <rect x="240" y="270" width="80" height="20" rx="10" fill="#3B82F6" />
                  
                  <rect x="510" y="150" width="270" height="160" rx="4" fill="white" />
                  <rect x="530" y="170" width="100" height="20" rx="2" fill="#3B82F6" />
                  <rect x="530" y="200" width="230" height="10" rx="2" fill="#94a3b8" />
                  <rect x="530" y="220" width="230" height="10" rx="2" fill="#94a3b8" />
                  <rect x="530" y="240" width="230" height="10" rx="2" fill="#94a3b8" />
                  <rect x="530" y="270" width="80" height="20" rx="10" fill="#3B82F6" />
                  
                  <rect x="220" y="330" width="560" height="150" rx="4" fill="white" />
                  <rect x="240" y="350" width="150" height="20" rx="2" fill="#3B82F6" />
                  <rect x="240" y="380" width="520" height="1" fill="#e2e8f0" />
                  
                  {/* Chart */}
                  <path d="M260 430 L320 410 L380 425 L440 400 L500 415 L560 405 L620 420 L680 390 L740 410" stroke="#3B82F6" strokeWidth="3" fill="none" />
                  <circle cx="320" cy="410" r="4" fill="#3B82F6" />
                  <circle cx="380" cy="425" r="4" fill="#3B82F6" />
                  <circle cx="440" cy="400" r="4" fill="#3B82F6" />
                  <circle cx="500" cy="415" r="4" fill="#3B82F6" />
                  <circle cx="560" cy="405" r="4" fill="#3B82F6" />
                  <circle cx="620" cy="420" r="4" fill="#3B82F6" />
                  <circle cx="680" cy="390" r="4" fill="#3B82F6" />
                  <circle cx="740" cy="410" r="4" fill="#3B82F6" />
                </svg>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
