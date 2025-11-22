import Link from 'next/link';

export function Footer() {
  const footerLinks = [
    { label: 'About', href: '/about' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-primary mb-2">MentorVerse</h3>
            <p className="text-sm text-muted-foreground">
              Learn from real leaders. Access proven wisdom. Transform your future.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/mentors" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Find Mentors
                </Link>
              </li>
              <li>
                <Link href="/content" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Courses
                </Link>
              </li>
              <li>
                <Link href="/mentor/apply" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Become a Mentor
                </Link>
              </li>
              <li>
                <Link href="/ai/chat" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  AI Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} MentorVerse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
