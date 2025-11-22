export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
      
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-8">
          We'd love to hear from you! Whether you have a question, feedback, or need support, 
          we're here to help.
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
          
          <div className="space-y-6">
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">General Inquiries</h3>
              <p className="text-muted-foreground mb-2">
                For general questions about MentorVerse, our services, or partnerships:
              </p>
              <a href="mailto:hello@mentorverse.com" className="text-primary hover:underline">
                hello@mentorverse.com
              </a>
            </div>

            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">Support</h3>
              <p className="text-muted-foreground mb-2">
                Need help with your account, payments, or technical issues?
              </p>
              <a href="mailto:support@mentorverse.com" className="text-primary hover:underline">
                support@mentorverse.com
              </a>
            </div>

            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">Become a Mentor</h3>
              <p className="text-muted-foreground mb-2">
                Interested in joining our community of mentors?
              </p>
              <a href="mailto:mentors@mentorverse.com" className="text-primary hover:underline">
                mentors@mentorverse.com
              </a>
            </div>

            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">Business & Partnerships</h3>
              <p className="text-muted-foreground mb-2">
                Exploring enterprise solutions or partnership opportunities?
              </p>
              <a href="mailto:business@mentorverse.com" className="text-primary hover:underline">
                business@mentorverse.com
              </a>
            </div>

            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">Press & Media</h3>
              <p className="text-muted-foreground mb-2">
                Media inquiries and press requests:
              </p>
              <a href="mailto:press@mentorverse.com" className="text-primary hover:underline">
                press@mentorverse.com
              </a>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Office Hours</h2>
          <p>
            Our support team is available Monday through Friday, 9:00 AM - 6:00 PM EST. 
            We aim to respond to all inquiries within 24-48 hours.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
          <p>
            Before reaching out, you might find the answer to your question in our FAQ section. 
            Check out our Help Center for quick answers to common questions about using MentorVerse.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Social Media</h2>
          <p className="mb-4">Connect with us on social media for updates, tips, and community highlights:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Twitter: <span className="text-muted-foreground">@mentorverse</span></li>
            <li>LinkedIn: <span className="text-muted-foreground">MentorVerse</span></li>
            <li>Instagram: <span className="text-muted-foreground">@mentorverse</span></li>
          </ul>
        </section>

        <section className="mb-8 p-6 bg-muted/50 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">We Value Your Feedback</h2>
          <p>
            Your input helps us improve MentorVerse for everyone. Whether it's a feature suggestion, 
            bug report, or success story, we'd love to hear from you. Every message is read by our team.
          </p>
        </section>
      </div>
    </div>
  );
}
