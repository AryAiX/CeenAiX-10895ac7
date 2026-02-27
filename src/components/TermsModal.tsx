import React from 'react';
import { X } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Terms and Conditions</h2>
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
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">1. Acceptance of Terms</h3>
              <p>
                By accessing and using this healthcare platform, you accept and agree to be bound by the terms
                and provisions of this agreement. If you do not agree to these terms, please do not use this
                platform.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">2. Medical Information Disclaimer</h3>
              <p>
                The information provided on this platform is for general informational purposes only and is not
                intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek
                the advice of your physician or other qualified health provider with any questions you may have
                regarding a medical condition.
              </p>
              <p className="mt-2">
                Never disregard professional medical advice or delay in seeking it because of something you have
                read on this platform. If you think you may have a medical emergency, call your doctor or emergency
                services immediately.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">3. User Account and Registration</h3>
              <p>
                To use certain features of the platform, you must register for an account. You agree to provide
                accurate, current, and complete information during the registration process and to update such
                information to keep it accurate, current, and complete.
              </p>
              <p className="mt-2">
                You are responsible for safeguarding your password and for all activities that occur under your
                account. You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">4. Privacy and Data Protection</h3>
              <p>
                Your use of the platform is also governed by our Privacy Policy. We are committed to protecting
                your personal health information in compliance with UAE data protection laws and regulations,
                including but not limited to the UAE Federal Data Protection Law.
              </p>
              <p className="mt-2">
                By using this platform, you consent to the collection, use, and sharing of your information as
                described in our Privacy Policy.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">5. Telemedicine Services</h3>
              <p>
                Telemedicine services provided through this platform are subject to the following conditions:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Services are provided by licensed healthcare professionals</li>
                <li>Video consultations require a stable internet connection</li>
                <li>Emergency medical conditions should be directed to emergency services</li>
                <li>Prescriptions are issued at the healthcare provider's discretion</li>
                <li>Follow-up care may be required for certain conditions</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">6. Appointment Scheduling and Cancellation</h3>
              <p>
                When scheduling appointments through the platform:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>You agree to arrive on time for scheduled appointments</li>
                <li>Cancellations must be made at least 24 hours in advance</li>
                <li>Late cancellations or no-shows may result in fees</li>
                <li>The healthcare provider reserves the right to reschedule if necessary</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">7. Payment and Insurance</h3>
              <p>
                You agree to pay all fees associated with services received through the platform. If you are using
                insurance coverage, you are responsible for verifying your coverage and any applicable co-payments
                or deductibles.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">8. Prohibited Uses</h3>
              <p>You agree not to use the platform to:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Violate any applicable laws or regulations</li>
                <li>Impersonate any person or entity</li>
                <li>Upload or transmit viruses or malicious code</li>
                <li>Collect or harvest personal information of other users</li>
                <li>Interfere with or disrupt the platform's operation</li>
                <li>Use the platform for any illegal or unauthorized purpose</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">9. Intellectual Property</h3>
              <p>
                The platform and its original content, features, and functionality are owned by the platform
                operator and are protected by international copyright, trademark, patent, trade secret, and
                other intellectual property laws.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">10. Limitation of Liability</h3>
              <p>
                To the maximum extent permitted by applicable law, the platform operator shall not be liable for
                any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or
                revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other
                intangible losses.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">11. Changes to Terms</h3>
              <p>
                We reserve the right to modify or replace these terms at any time. We will provide notice of any
                material changes by posting the new terms on this platform. Your continued use of the platform
                after such modifications constitutes your acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">12. Governing Law</h3>
              <p>
                These terms shall be governed by and construed in accordance with the laws of the United Arab
                Emirates, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">13. Contact Information</h3>
              <p>
                If you have any questions about these Terms and Conditions, please contact us through the
                platform's support system.
              </p>
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
