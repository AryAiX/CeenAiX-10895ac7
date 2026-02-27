import React from 'react';
import { X } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-1">
          <div className="prose prose-sm max-w-none text-gray-700 space-y-4">
            <p className="text-sm text-gray-500">Last Updated: February 27, 2026</p>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">1. Introduction</h3>
              <p>
                This Privacy Policy describes how we collect, use, disclose, and safeguard your information when
                you use our healthcare platform. We are committed to protecting your privacy and ensuring the
                security of your personal health information in compliance with UAE laws and regulations.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">2. Information We Collect</h3>

              <h4 className="font-semibold text-gray-900 mt-4 mb-2">2.1 Personal Information</h4>
              <p>We collect the following personal information:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Full name (first and last name)</li>
                <li>Email address</li>
                <li>Emirates ID number and expiry date</li>
                <li>Date of birth</li>
                <li>Contact information (phone number, address)</li>
                <li>Insurance information (provider, policy number, expiry date)</li>
              </ul>

              <h4 className="font-semibold text-gray-900 mt-4 mb-2">2.2 Health Information</h4>
              <p>We collect and process sensitive health information including:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Medical history and conditions</li>
                <li>Prescription records and medications</li>
                <li>Appointment details and visit notes</li>
                <li>Lab results and diagnostic reports</li>
                <li>Family medical history (with your consent)</li>
                <li>Telemedicine consultation records</li>
              </ul>

              <h4 className="font-semibold text-gray-900 mt-4 mb-2">2.3 Technical Information</h4>
              <p>We automatically collect certain technical information:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>Access times and pages viewed</li>
                <li>Referring website addresses</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">3. How We Use Your Information</h3>
              <p>We use your information for the following purposes:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Providing healthcare services and managing your care</li>
                <li>Scheduling and managing appointments</li>
                <li>Facilitating communication between you and healthcare providers</li>
                <li>Processing insurance claims and payments</li>
                <li>Maintaining your medical records</li>
                <li>Sending appointment reminders and health notifications</li>
                <li>Improving our platform and services</li>
                <li>Complying with legal and regulatory requirements</li>
                <li>Preventing fraud and ensuring platform security</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">4. Information Sharing and Disclosure</h3>

              <h4 className="font-semibold text-gray-900 mt-4 mb-2">4.1 Healthcare Providers</h4>
              <p>
                We share your health information with licensed healthcare providers involved in your care, including
                doctors, specialists, and medical staff who need access to provide treatment.
              </p>

              <h4 className="font-semibold text-gray-900 mt-4 mb-2">4.2 Family Members</h4>
              <p>
                With your explicit consent, we share certain medical information with family members you have linked
                to your account through our family linking feature.
              </p>

              <h4 className="font-semibold text-gray-900 mt-4 mb-2">4.3 Insurance Companies</h4>
              <p>
                We may share necessary information with your insurance provider for claims processing and coverage
                verification purposes.
              </p>

              <h4 className="font-semibold text-gray-900 mt-4 mb-2">4.4 Legal Requirements</h4>
              <p>
                We may disclose your information when required by law, regulation, legal process, or governmental
                request, or to protect the rights, property, or safety of our users or others.
              </p>

              <h4 className="font-semibold text-gray-900 mt-4 mb-2">4.5 Service Providers</h4>
              <p>
                We may share information with trusted third-party service providers who assist us in operating the
                platform, subject to confidentiality agreements.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">5. Data Security</h3>
              <p>
                We implement appropriate technical and organizational security measures to protect your information:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>End-to-end encryption for data transmission</li>
                <li>Secure data storage with encryption at rest</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Employee training on data protection and confidentiality</li>
                <li>Secure backup and disaster recovery procedures</li>
              </ul>
              <p className="mt-2">
                However, no method of transmission over the internet or electronic storage is 100% secure. While
                we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">6. Your Rights</h3>
              <p>Under UAE data protection laws, you have the following rights:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li><strong>Access:</strong> Request copies of your personal and health information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your information (subject to legal requirements)</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Restriction:</strong> Request limitation on how we process your information</li>
                <li><strong>Objection:</strong> Object to certain types of processing</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing where applicable</li>
              </ul>
              <p className="mt-2">
                To exercise these rights, please contact us through the platform's support system.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">7. Data Retention</h3>
              <p>
                We retain your information for as long as necessary to provide services and comply with legal
                obligations. Medical records are retained in accordance with UAE healthcare regulations, typically
                for a minimum period as required by law even after account closure.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">8. Children's Privacy</h3>
              <p>
                Our platform is not intended for children under 18 years of age without parental consent. Parents
                or legal guardians may create accounts on behalf of minors and manage their health information.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">9. International Data Transfers</h3>
              <p>
                Your information is primarily stored and processed within the United Arab Emirates. If we transfer
                data internationally, we ensure appropriate safeguards are in place to protect your information
                in compliance with UAE data protection laws.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">10. Cookies and Tracking Technologies</h3>
              <p>
                We use cookies and similar tracking technologies to enhance your experience, analyze platform usage,
                and personalize content. You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">11. Changes to This Privacy Policy</h3>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by
                posting the new Privacy Policy on this page and updating the "Last Updated" date. Your continued
                use of the platform after such changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">12. Contact Information</h3>
              <p>
                If you have questions or concerns about this Privacy Policy or our data practices, please contact
                our Data Protection Officer through the platform's support system.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">13. Compliance</h3>
              <p>
                We comply with:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>UAE Federal Data Protection Law</li>
                <li>Dubai Healthcare City Authority (DHCA) regulations</li>
                <li>UAE Ministry of Health and Prevention guidelines</li>
                <li>International healthcare privacy standards where applicable</li>
              </ul>
            </section>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
