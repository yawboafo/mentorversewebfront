export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">About MentorVerse</h1>
      
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-lg">
            MentorVerse is dedicated to democratizing access to quality mentorship and knowledge. 
            We believe that everyone deserves the opportunity to learn from experienced professionals 
            and accelerate their personal and professional growth.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">What We Do</h2>
          <p>
            MentorVerse connects aspiring professionals with experienced mentors across various 
            industries and domains. Our platform offers:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li><strong>1-on-1 Mentoring:</strong> Personalized guidance from industry experts</li>
            <li><strong>Educational Content:</strong> Courses, guides, and resources created by mentors</li>
            <li><strong>Community:</strong> A supportive network of learners and professionals</li>
            <li><strong>Flexible Learning:</strong> Learn at your own pace with diverse content formats</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
          <p>
            Founded in 2025, MentorVerse was born from the recognition that traditional education 
            and career development often lack the personal touch of mentorship. We saw a gap between 
            those seeking guidance and experienced professionals willing to share their knowledge.
          </p>
          <p className="mt-4">
            Our platform bridges this gap by making mentorship accessible, affordable, and scalable. 
            Whether you're a student exploring career options, a professional looking to upskill, or 
            an entrepreneur building a business, MentorVerse provides the guidance you need to succeed.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">Accessibility</h3>
              <p>Quality mentorship should be available to everyone, regardless of background or location.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Quality</h3>
              <p>We carefully vet our mentors to ensure they bring real expertise and value to our community.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Empowerment</h3>
              <p>We empower both mentors and mentees to achieve their goals and realize their potential.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Community</h3>
              <p>We foster a supportive, collaborative environment where learning and growth thrive.</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">For Mentors</h2>
          <p>
            If you're an experienced professional looking to share your knowledge and make an impact, 
            MentorVerse provides the platform to reach motivated learners worldwide. Build your personal 
            brand, create passive income streams, and give back to the next generation of professionals.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Join Our Community</h2>
          <p>
            Whether you're seeking mentorship or looking to become a mentor, we invite you to join 
            the MentorVerse community. Together, we're building a world where knowledge flows freely 
            and everyone has the opportunity to learn, grow, and succeed.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p>
            Have questions or want to learn more? Reach out to us at:{' '}
            <a href="mailto:hello@mentorverse.com" className="text-primary hover:underline">
              hello@mentorverse.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
