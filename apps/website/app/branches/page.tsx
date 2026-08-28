import { BranchesContent } from '../../src/components/BrandPages';
import { WebsiteFooter } from '../../src/components/WebsiteFooter';
import { WebsiteNav } from '../../src/components/WebsiteNav';
export default function BranchesPage() {
  return (
    <main>
      <WebsiteNav />
      <BranchesContent />
      <WebsiteFooter />
    </main>
  );
}
