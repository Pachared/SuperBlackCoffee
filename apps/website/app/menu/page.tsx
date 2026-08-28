import { MenuContent } from '../../src/components/BrandPages';
import { WebsiteFooter } from '../../src/components/WebsiteFooter';
import { WebsiteNav } from '../../src/components/WebsiteNav';
export default function MenuPage() {
  return (
    <main>
      <WebsiteNav />
      <MenuContent />
      <WebsiteFooter />
    </main>
  );
}
