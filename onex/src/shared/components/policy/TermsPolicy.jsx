import React from "react";
import { Link } from "react-router-dom";

export default function TermsPolicy() {
  return (
    <div className="terms-policy-container bg-white text-black px-6 py-10 md:px-12 lg:px-20">
      {/* Header Section */}
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
        <p className="text-lg text-gray-700 italic max-w-3xl mx-auto">
          "Please review the policy page before contacting admins. Many common issues already have answers here."
        </p>
      </header>

      {/* Terms of Service Section */}
      <section className="policy-section max-w-4xl mx-auto space-y-6">
        <p><strong>Effective Date:</strong> 04-03-2026</p>

        <p>
          Welcome to Mystery Mansion. These Terms of Service (“Terms”) govern your access to and use of our mobile application,
          website, and related services (collectively, the “Platform”). By accessing or using the Platform, you agree to be bound by these Terms.
        </p>

        <h3 className="text-lg font-semibold underline">1. Eligibility</h3>
        <ul className="list-disc pl-6">
          <li>You must be at least 18 years old (or the age of majority in your jurisdiction) to use the Platform.</li>
          <li>You represent and warrant that you have the legal capacity to enter into these Terms.</li>
        </ul>

        <h3 className="text-lg font-semibold underline">2. Services Offered</h3>
        <ul className="list-disc pl-6">
          <li>The Platform connects consenting adults for companionship and entertainment purposes.</li>
          <li>We do not facilitate or promote illegal activity. All services must comply with local laws and regulations.</li>
        </ul>

        <h3 className="text-lg font-semibold underline">3. User Responsibilities</h3>
        <ul className="list-disc pl-6">
          <li>You agree to use the Platform respectfully and lawfully.</li>
          <li>You must not:
            <ul className="list-disc pl-6">
              <li>Harass, threaten, or exploit other users.</li>
              <li>Post false, misleading, or defamatory content.</li>
              <li>Use the Platform for any unlawful or non-consensual activity.</li>
            </ul>
          </li>
        </ul>

        <h3 className="text-lg font-semibold underline">4. Content and Conduct</h3>
        <ul className="list-disc pl-6">
          <li>You are responsible for the content you post, including profiles, images, and messages.</li>
          <li>We reserve the right to remove content or suspend accounts that violate these Terms or our Community Guidelines.</li>
        </ul>

        <h3 className="text-lg font-semibold underline">5. Payments and Fees</h3>
        <ul className="list-disc pl-6">
          <li>Some features may require payment. All transactions are final unless otherwise stated.</li>
          <li>We process payments primarily through Cash App. You will be provided with a secure Cash App payment link or username to complete your transaction.</li>
          <li>Payments made via Cash App are subject to Cash App's own terms and conditions.</li>
          <li>We do not store your Cash App account details or payment credentials on our platform.</li>
          <li>If you have any issues with a payment, please contact support with your payment confirmation and details.</li>
        </ul>

        <h3 className="text-lg font-semibold underline">5A. Current Platform Rules and Feature Notices</h3>
        <ul className="list-disc pl-6">
          <li>Sign in is email-only. Users must log in with their registered email and password.</li>
          <li>Post creation is free for all users.</li>
          <li>Promo codes are optional and can be used for promoted placement and extra exposure.</li>
          <li>If no category is selected when posting, the post is placed in the uncategorized section by default.</li>
          <li>Posts may include both image and video uploads, subject to platform moderation and file restrictions.</li>
          <li>Platform updates and feature updates may be added or removed by administrators to correct errors and keep notices accurate.</li>
          <li>Features and rules may change as the platform evolves. Users should review the updates page regularly for current behavior.</li>
        </ul>

        <h3 className="text-lg font-semibold underline">6. Privacy</h3>
        <p>
          Your privacy is important to us. Please review our <Link to="/privacy-policy" className="text-blue-600 underline">Privacy Policy</Link> for details on how we collect and use your data.
        </p>

        <h3 className="text-lg font-semibold underline">7. Account Suspension or Termination</h3>
        <ul className="list-disc pl-6">
          <li>We may suspend or terminate your account at our discretion for violations of these Terms or applicable laws.</li>
        </ul>

        <h3 className="text-lg font-semibold underline">8. Disclaimers</h3>
        <ul className="list-disc pl-6">
          <li>We do not guarantee the accuracy or availability of user profiles or services.</li>
          <li>We are not liable for any interactions or agreements made between users.</li>
        </ul>

        <h3 className="text-lg font-semibold underline">9. Limitation of Liability</h3>
        <ul className="list-disc pl-6">
          <li>To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from your use of the Platform.</li>
        </ul>

        <h3 className="text-lg font-semibold underline">10. Changes to Terms</h3>
        <ul className="list-disc pl-6">
          <li>We may update these Terms from time to time. Continued use of the Platform after changes constitutes acceptance of the new Terms.</li>
        </ul>

        <h3 className="text-lg font-semibold underline">11. Contact Us</h3>
        <p>
          For questions or concerns, contact us at <a href="mailto:support.mysterymansion@gmail.com" className="text-blue-600 underline">support.mysterymansion@gmail.com</a>.
        </p>
      </section>
    </div>
  );
}
