import { FranchiseContent } from '../../src/components/BrandPages';
import { WebsiteFooter } from '../../src/components/WebsiteFooter';
import { WebsiteNav } from '../../src/components/WebsiteNav';
export default function FranchisePage() {
  return (
    <main>
      <WebsiteNav />
      <FranchiseContent />
      <WebsiteFooter />
    </main>
  );
}
