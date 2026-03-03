import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img
                src="/ChatGPT_Image_Feb_27,_2026,_11_30_50_AM.png"
                alt="CeenAiX Logo"
                className="h-10 w-auto"
              />
              <span className="text-xl font-bold text-white">CeenAiX</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Secure healthcare platform with AI-powered insights
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Services</h4>
            <ul className="space-y-2">
              <li><button onClick={() => navigate('/find-doctor')} className="hover:text-ceenai-cyan transition-colors">Find Doctors</button></li>
              <li><button onClick={() => navigate('/find-clinic')} className="hover:text-ceenai-cyan transition-colors">Find Clinics</button></li>
              <li><button onClick={() => navigate('/ai-chat')} className="hover:text-ceenai-cyan transition-colors">AI Health Chat</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><button onClick={() => navigate('/health-education')} className="hover:text-ceenai-cyan transition-colors">Health Education</button></li>
              <li><button onClick={() => navigate('/insurance')} className="hover:text-ceenai-cyan transition-colors">Insurance</button></li>
              <li><a href="#" className="hover:text-ceenai-cyan transition-colors">Help Center</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li>support@ceenaix.com</li>
              <li>1-800-CEENAIX</li>
              <li>Available 24/7</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-sm text-gray-400">© 2026 CeenAiX. DHA-compliant healthcare technology. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
