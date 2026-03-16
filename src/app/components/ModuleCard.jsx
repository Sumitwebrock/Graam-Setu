import { Link } from "react-router";
import { ArrowRight } from "lucide-react";

export default function ModuleCard({ icon: Icon, title, description, link, gradient }) {
  return (
    <Link to={link}>
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-[#1B7F3A] h-full flex flex-col group">
        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
          <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
        </div>
        <h3 className="text-xl md:text-2xl mb-3 text-gray-900">{title}</h3>
        <p className="text-gray-600 mb-6 flex-grow text-base md:text-lg leading-relaxed">
          {description}
        </p>
        <div className="flex items-center text-[#1B7F3A] group-hover:gap-3 transition-all">
          <span className="mr-2">Explore</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
