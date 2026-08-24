import { WebsiteFooter } from './components/WebsiteFooter';
import { WebsiteNav } from './components/WebsiteNav';
import { HeroSection } from './sections/HeroSection';
import { MenuSection } from './sections/MenuSection';
import { StatsSection } from './sections/StatsSection';
import { StorySection } from './sections/StorySection';
import { VisitSection } from './sections/VisitSection';

export default function App() {
  return <main><WebsiteNav /><HeroSection /><StatsSection /><StorySection /><MenuSection /><VisitSection /><WebsiteFooter /></main>;
}
