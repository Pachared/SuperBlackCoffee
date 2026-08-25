import { WebsiteFooter } from '../src/components/WebsiteFooter';
import { WebsiteNav } from '../src/components/WebsiteNav';
import { HeroSection } from '../src/sections/HeroSection';
import { MenuSection } from '../src/sections/MenuSection';
import { StatsSection } from '../src/sections/StatsSection';
import { StorySection } from '../src/sections/StorySection';
import { VisitSection } from '../src/sections/VisitSection';

export default function HomePage() {
  return <main><WebsiteNav /><HeroSection /><StatsSection /><StorySection /><MenuSection /><VisitSection /><WebsiteFooter /></main>;
}
