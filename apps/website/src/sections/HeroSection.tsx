import { Button } from '@mui/material';
import { coffeeIngredientsImage } from '@stackbuild/ui';

export function HeroSection() {
  return <section id="top" className="hero"><div className="hero-copy"><p className="eyebrow">BREWED FOR YOUR MOMENT</p><h1>กาแฟดี<br /><em>ในทุกจังหวะ</em>ของคุณ</h1><p className="hero-detail">Super Black Coffee คัดสรรทุกแก้วอย่างตั้งใจ ตั้งแต่เมล็ดกาแฟจนถึงช่วงเวลาที่คุณได้พัก</p><div className="hero-actions"><Button variant="contained" className="primary" href="#menu">ดูเมนูของเรา</Button><Button variant="outlined" className="secondary" href="#story">รู้จักเรา</Button></div></div><div className="hero-media"><img src={coffeeIngredientsImage} alt="เมล็ดกาแฟและวัตถุดิบ Super Black Coffee" /><div className="hero-note">ROASTED<br />DAILY</div></div></section>;
}
