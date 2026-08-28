import { AboutContent } from '../../src/components/BrandPages';
import { WebsiteFooter } from '../../src/components/WebsiteFooter';
import { WebsiteNav } from '../../src/components/WebsiteNav';
export default function AboutPage() {
  return (
    <main>
      <WebsiteNav />
      <AboutContent />
      <WebsiteFooter />
    </main>
  );
}
