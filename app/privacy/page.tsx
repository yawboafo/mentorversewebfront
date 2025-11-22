export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-6">
          Last updated: November 22, 2025
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
          <p>
            Welcome to MentorVerse. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you about how we look after your personal data and tell you about 
            your privacy rights.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
          <p>We may collect, use, store and transfer different kinds of personal data about you:</p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li><strong>Identity Data:</strong> first name, last name, username</li>
            <li><strong>Contact Data:</strong> email address, phone number</li>
            <li><strong>Profile Data:</strong> bio, interests, mentoring preferences</li>
            <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
            <li><strong>Usage Data:</strong> information about how you use our platform</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
          <p>We use your personal data for the following purposes:</p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>To provide and maintain our service</li>
            <li>To match mentors with mentees</li>
            <li>To process payments and transactions</li>
            <li>To communicate with you about your account</li>
            <li>To improve our platform and user experience</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
          <p>
            We have implemented appropriate security measures to prevent your personal data from being 
            accidentally lost, used, or accessed in an unauthorized way. We use industry-standard encryption 
            and security protocols to protect your information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
          <p>Under data protection laws, you have rights including:</p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>The right to access your personal data</li>
            <li>The right to correct inaccurate data</li>
            <li>The right to request deletion of your data</li>
            <li>The right to object to processing of your data</li>
            <li>The right to data portability</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p>
            If you have any questions about this privacy policy or our privacy practices, please contact us at:{' '}
            <a href="mailto:privacy@mentorverse.com" className="text-primary hover:underline">
              privacy@mentorverse.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
