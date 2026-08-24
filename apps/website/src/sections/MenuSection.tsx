import { Button } from '@mui/material';
import { featuredMenus } from '../data/landing';
export function MenuSection() { return <section id="menu" className="menu"><div className="section-head"><div><p className="eyebrow">SIGNATURE SELECTION</p><h2>แก้วที่ใช่<br />สำหรับวันนี้</h2></div><Button variant="outlined" className="secondary">ดูเมนูทั้งหมด</Button></div><div className="menu-grid">{featuredMenus.map(([name, price], index) => <article key={name} className="menu-card"><span>0{index + 1}</span><h3>{name}</h3><p>{price}</p></article>)}</div></section>; }
