import { Button } from '@mui/material';
import { superBlackLogo } from '@stackbuild/ui';

export function WebsiteNav() {
  return <nav className="nav"><a className="brand" href="#top"><img src={superBlackLogo} alt="Super Black Coffee" /><span>SUPER BLACK<br />COFFEE</span></a><div className="nav-links"><a href="#story">เรื่องราว</a><a href="#menu">เมนู</a><a href="#stores">สาขา</a></div><Button className="nav-cta" variant="contained" href="#stores">ค้นหาสาขา</Button></nav>;
}
