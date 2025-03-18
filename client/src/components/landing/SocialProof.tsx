import { SiAirbnb, SiAmazon, SiMicrosoft, SiGoogle, SiNetflix } from "react-icons/si";

export default function SocialProof() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-gray-500 font-medium">Trusted by innovative teams from</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 items-center justify-items-center opacity-70">
          <div className="h-8 flex items-center">
            <SiAirbnb className="h-8 w-auto text-gray-400" />
          </div>
          <div className="h-8 flex items-center">
            <SiAmazon className="h-8 w-auto text-gray-400" />
          </div>
          <div className="h-8 flex items-center">
            <SiMicrosoft className="h-8 w-auto text-gray-400" />
          </div>
          <div className="h-8 flex items-center">
            <SiGoogle className="h-8 w-auto text-gray-400" />
          </div>
          <div className="h-8 hidden lg:flex items-center">
            <SiNetflix className="h-8 w-auto text-gray-400" />
          </div>
        </div>
      </div>
    </section>
  );
}
