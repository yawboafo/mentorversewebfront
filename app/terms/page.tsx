export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-6">
          Last updated: November 22, 2025
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Agreement to Terms</h2>
          <p>
            By accessing or using MentorVerse, you agree to be bound by these Terms of Service. 
            If you disagree with any part of the terms, you may not access the service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">User Accounts</h2>
          <p>When you create an account with us, you must provide accurate and complete information. You are responsible for:</p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Maintaining the security of your account</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us immediately of any unauthorized access</li>
            <li>Ensuring your account information remains accurate and up-to-date</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Mentor and Mentee Responsibilities</h2>
          <p><strong>Mentors agree to:</strong></p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Provide accurate information about their expertise and experience</li>
            <li>Maintain professional conduct in all interactions</li>
            <li>Deliver services as described in their profile</li>
            <li>Respect confidentiality and privacy of mentees</li>
          </ul>
          <p className="mt-4"><strong>Mentees agree to:</strong></p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Treat mentors with respect and professionalism</li>
            <li>Honor scheduled sessions and commitments</li>
            <li>Provide honest feedback when requested</li>
            <li>Not misuse the platform or mentor information</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Payment Terms</h2>
          <p>
            Users agree to pay all fees associated with purchased content or mentoring sessions. 
            All payments are processed securely through our payment provider. Refund policies are 
            determined by individual mentors and outlined in their service descriptions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Content Ownership</h2>
          <p>
            Mentors retain ownership of their content. By posting content on MentorVerse, mentors 
            grant us a license to display and distribute that content on the platform. Users may not 
            reproduce, redistribute, or resell mentor content without explicit permission.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Prohibited Activities</h2>
          <p>Users may not:</p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe upon intellectual property rights</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Attempt to gain unauthorized access to the platform</li>
            <li>Upload malicious code or viruses</li>
            <li>Engage in fraudulent activities</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Termination</h2>
          <p>
            We reserve the right to terminate or suspend access to our service immediately, 
            without prior notice, for any violation of these Terms of Service or for any other 
            reason at our sole discretion.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
          <p>
            MentorVerse provides a platform connecting mentors and mentees. We are not responsible 
            for the quality, accuracy, or outcomes of mentoring relationships. Our liability is 
            limited to the maximum extent permitted by law.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify users of any 
            material changes. Your continued use of the service after changes constitutes acceptance 
            of the new terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
          <p>
            For questions about these Terms of Service, please contact us at:{' '}
            <a href="mailto:legal@mentorverse.com" className="text-primary hover:underline">
              legal@mentorverse.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
