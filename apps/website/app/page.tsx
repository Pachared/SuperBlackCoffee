import { HomeContent } from '../src/components/BrandPages';
import { WebsiteFooter } from '../src/components/WebsiteFooter';
import { WebsiteNav } from '../src/components/WebsiteNav';

export default function HomePage() {
  return (
    <main>
      <WebsiteNav />
      <HomeContent />
      <WebsiteFooter />
    </main>
  );
}
