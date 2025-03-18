import { 
  BarChart3, 
  Users, 
  Zap, 
  ShieldCheck, 
  Smartphone, 
  PlugZap 
} from "lucide-react";
import { motion } from "framer-motion";

interface FeatureCardProps {
  icon: React.ReactNode;
  color: string;
  title: string;
  description: string;
  index: number;
}

function FeatureCard({ icon, color, title, description, index }: FeatureCardProps) {
  return (
    <motion.div 
      className="feature-card bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center text-white mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
}

export default function Features() {
  const features = [
    {
      icon: <BarChart3 className="h-6 w-6" />,
      color: "bg-gradient-to-r from-primary to-blue-600",
      title: "Real-time Analytics",
      description: "Gain instant insights into your team's performance with comprehensive dashboards and reports."
    },
    {
      icon: <Users className="h-6 w-6" />,
      color: "bg-green-600",
      title: "Team Collaboration",
      description: "Work together seamlessly with integrated messaging, file sharing, and task assignment."
    },
    {
      icon: <Zap className="h-6 w-6" />,
      color: "bg-violet-600",
      title: "Automation",
      description: "Save hours each week by automating repetitive tasks and streamlining workflows."
    },
    {
      icon: <ShieldCheck className="h-6 w-6" />,
      color: "bg-pink-500",
      title: "Enterprise Security",
      description: "Rest easy knowing your data is protected with bank-level encryption and security protocols."
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      color: "bg-yellow-500",
      title: "Mobile Access",
      description: "Access your workspace from anywhere with our powerful mobile apps for iOS and Android."
    },
    {
      icon: <PlugZap className="h-6 w-6" />,
      color: "bg-green-600",
      title: "Integrations",
      description: "Connect with your favorite tools and services through our extensive integration marketplace."
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-primary text-sm font-medium">Features</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6">Everything you need to succeed</h2>
          <p className="text-lg text-gray-600">LaunchPad combines powerful tools with an intuitive interface, helping your team achieve more with less effort.</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              color={feature.color}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
