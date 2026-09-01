import type { ReactElement, ReactNode } from 'react';
import {
  cloneElement,
  isValidElement,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  Box,
  Button,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { LogoutIcon, type LogoutIconHandle } from '../icons/LogoutIcon';
import {
  PanelLeftCloseIcon,
  type PanelLeftCloseIconHandle,
} from '../icons/PanelLeftCloseIcon';
import {
  PanelLeftOpenIcon,
  type PanelLeftOpenIconHandle,
} from '../icons/PanelLeftOpenIcon';
import superBlackLogo from '../../assets/superblack-logo.png';

type NavigationItem = {
  label: string;
  icon: ReactNode;
  badge?: number;
  group?: string;
};

export function DashboardSidebar({
  activePage,
  navigation,
  onNavigate,
  onLogout,
  selectedColor,
  activeBackground,
  accentColor,
  collapsed,
  onToggle,
  hideToggle = false,
  disableActiveConnection = false,
  collapseContentImmediately = false,
  disableWidthTransition = false,
  attachedPanel,
}: {
  activePage: string;
  navigation: NavigationItem[];
  onNavigate: (page: string) => void;
  onLogout: () => void;
  selectedColor: string;
  activeBackground: string;
  accentColor: string;
  collapsed: boolean;
  onToggle: () => void;
  hideToggle?: boolean;
  disableActiveConnection?: boolean;
  collapseContentImmediately?: boolean;
  disableWidthTransition?: boolean;
  attachedPanel?: ReactNode;
}) {
  const logoutIconRef = useRef<LogoutIconHandle>(null);
  const closeIconRef = useRef<PanelLeftCloseIconHandle>(null);
  const openIconRef = useRef<PanelLeftOpenIconHandle>(null);
  const [showExpandedContent, setShowExpandedContent] = useState(!collapsed);
  const [expandedContentVisible, setExpandedContentVisible] =
    useState(!collapsed);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [clickedMenu, setClickedMenu] = useState<string | null>(null);
  const hoverTimerRef = useRef<number | undefined>(undefined);

  useLayoutEffect(() => {
    if (collapsed) {
      setExpandedContentVisible(false);
      if (collapseContentImmediately) {
        setShowExpandedContent(false);
        return undefined;
      }
      const timer = window.setTimeout(() => setShowExpandedContent(false), 280);
      return () => window.clearTimeout(timer);
    }
    setShowExpandedContent(true);
    const frame = window.requestAnimationFrame(() =>
      setExpandedContentVisible(true),
    );
    return () => window.cancelAnimationFrame(frame);
  }, [collapsed, collapseContentImmediately]);
  const width = collapsed ? 96 : 230;
  const renderExpandedContent =
    showExpandedContent && (!collapseContentImmediately || !collapsed);
  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        transition: disableWidthTransition
          ? 'none'
          : 'width .28s cubic-bezier(.2,.8,.2,1)',
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          bgcolor: '#171411',
          color: '#fff',
          border: 0,
          borderRadius: '0 12px 0 0',
          overflow: 'visible',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          transition: disableWidthTransition
            ? 'none'
            : 'width .28s cubic-bezier(.2,.8,.2,1), padding .28s cubic-bezier(.2,.8,.2,1)',
        },
      }}
    >
      <Button
        onClick={onToggle}
        onMouseEnter={() =>
          (collapsed
            ? openIconRef.current
            : closeIconRef.current
          )?.startAnimation()
        }
        onMouseLeave={() =>
          (collapsed
            ? openIconRef.current
            : closeIconRef.current
          )?.stopAnimation()
        }
        aria-label={collapsed ? 'ขยายเมนู' : 'ยุบเมนู'}
        sx={{
          position: 'absolute',
          display: hideToggle ? 'none' : 'inline-flex',
          top: 18,
          right: -20,
          minWidth: 40,
          width: 40,
          height: 40,
          p: 0,
          borderRadius: '50%',
          bgcolor: '#171411',
          color: '#fff',
          boxShadow: 'none',
          zIndex: 2,
          '&:hover': { bgcolor: '#171411' },
        }}
      >
        {collapsed ? (
          <PanelLeftOpenIcon ref={openIconRef} size={24} />
        ) : (
          <PanelLeftCloseIcon ref={closeIconRef} size={24} />
        )}
      </Button>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          pb: 1.5,
        }}
      >
        <Box
          component="img"
          src={superBlackLogo}
          alt="Super Black Coffee"
          sx={{ width: 52, height: 52, objectFit: 'contain' }}
        />
        <Typography
          sx={{
            fontSize: 12,
            letterSpacing: 0.5,
            fontWeight: 800,
            textAlign: 'center',
            whiteSpace: 'nowrap',
            maxHeight: 24,
            minHeight: 24,
            opacity: collapsed ? 0 : 1,
            visibility:
              collapseContentImmediately && collapsed ? 'hidden' : 'visible',
            overflow: 'hidden',
            transition: collapseContentImmediately
              ? 'none'
              : 'opacity .14s ease',
          }}
        >
          SUPER{' '}
          <Box component="span" color={accentColor}>
            BLACK
          </Box>{' '}
          COFFEE
        </Typography>
      </Box>
      <List
        sx={{
          flex: 1,
          minHeight: 0,
          width: 'calc(100% + 32px)',
          mr: -4,
          py: 0,
          pr: 4,
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,.26) transparent',
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'rgba(255,255,255,.26)',
            borderRadius: 99,
          },
        }}
      >
        {navigation.map(({ label, icon, badge, group }, index) => (
          <Box key={label}>
            {group &&
              group !== navigation[index - 1]?.group &&
              !collapsed &&
              renderExpandedContent && (
                <Typography
                  sx={{
                    mt: index === 0 ? 0 : 1.25,
                    mb: 0.5,
                    px: 1,
                    color: 'rgba(255,255,255,.46)',
                    fontFamily: 'Kanit, sans-serif',
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '.08em',
                    lineHeight: 1.5,
                    opacity: expandedContentVisible ? 1 : 0,
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    transition: 'opacity .14s ease',
                  }}
                >
                  {group}
                </Typography>
              )}
            <ListItemButton
              selected={label === activePage}
              disableRipple
              disableTouchRipple
              onClick={() => {
                setClickedMenu(label);
                window.setTimeout(() => setClickedMenu(null), 350);
                onNavigate(label);
              }}
              onMouseEnter={() => {
                window.clearTimeout(hoverTimerRef.current);
                setHoveredMenu(label);
              }}
              onMouseLeave={() => {
                hoverTimerRef.current = window.setTimeout(
                  () => setHoveredMenu(null),
                  350,
                );
              }}
              sx={{
                minHeight: 48,
                justifyContent: collapsed ? 'center' : 'flex-start',
                position: 'relative',
                transition: 'none',
                borderRadius: '12px',
                mb: 0.5,
                '&.Mui-selected': disableActiveConnection
                  ? {
                      bgcolor: activeBackground,
                      color: '#171411',
                      borderRadius: '12px 0 0 12px',
                      mr: 0,
                    }
                  : collapsed
                    ? {
                        bgcolor: activeBackground,
                        color: '#171411',
                        borderRadius: '12px 0 0 12px',
                        mr: -2,
                        position: 'relative',
                        zIndex: 1,
                        '&::before, &::after': {
                          content: '""',
                          position: 'absolute',
                          right: 0,
                          width: 14,
                          height: 14,
                          bgcolor: '#171411',
                          pointerEvents: 'none',
                        },
                        '&::before': {
                          top: -14,
                          borderRadius: '0 0 14px 0',
                          boxShadow: '7px 7px 0 7px ' + activeBackground,
                        },
                        '&::after': {
                          bottom: -14,
                          borderRadius: '0 14px 0 0',
                          boxShadow: '7px -7px 0 7px ' + activeBackground,
                        },
                      }
                    : {
                        bgcolor: activeBackground,
                        color: '#171411',
                        borderRadius: '12px 0 0 12px',
                        mr: -2,
                        pr: 2,
                        position: 'relative',
                        zIndex: 1,
                        '&::before, &::after': {
                          content: '""',
                          position: 'absolute',
                          right: 0,
                          width: 14,
                          height: 14,
                          bgcolor: '#171411',
                          pointerEvents: 'none',
                        },
                        '&::before': {
                          top: -14,
                          borderRadius: '0 0 14px 0',
                          boxShadow: '7px 7px 0 7px ' + activeBackground,
                        },
                        '&::after': {
                          bottom: -14,
                          borderRadius: '0 14px 0 0',
                          boxShadow: '7px -7px 0 7px ' + activeBackground,
                        },
                      },
                '&.Mui-selected:hover': { bgcolor: activeBackground },
                '&:not(.Mui-selected):hover': {
                  bgcolor: selectedColor,
                  width: 'calc(100% + 12px)',
                  position: 'relative',
                  zIndex: 2,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: 'inherit',
                  position: 'absolute',
                  left: 0,
                  width: 64,
                  minWidth: 64,
                  display: 'flex',
                  justifyContent: 'center',
                  transition: 'color .2s ease',
                }}
              >
                {isValidElement(icon)
                  ? cloneElement(icon as ReactElement<{ animate?: boolean }>, {
                      animate: hoveredMenu === label || clickedMenu === label,
                    })
                  : icon}
              </ListItemIcon>
              {renderExpandedContent && (
                <ListItemText
                  sx={{
                    m: 0,
                    ml: '44px',
                    whiteSpace: 'nowrap',
                    opacity: expandedContentVisible ? 1 : 0,
                    transform: expandedContentVisible
                      ? 'translateX(0)'
                      : 'translateX(-10px)',
                    transition: 'opacity .14s ease, transform .14s ease',
                  }}
                  primary={
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 400,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {label}
                    </Typography>
                  }
                />
              )}
              {!!badge && (
                <Box
                  className="sbc-nav-badge"
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: collapsed ? 48 : 172,
                    zIndex: 3,
                    display: 'grid',
                    placeItems: 'center',
                    minWidth: 22,
                    height: 22,
                    px: 0.5,
                    borderRadius: 99,
                    bgcolor: '#e5291d',
                    color: '#fff',
                    transform: 'translateY(-50%)',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 11,
                    fontWeight: 800,
                    lineHeight: 1,
                  }}
                >
                  {badge > 99 ? '99+' : badge}
                </Box>
              )}
            </ListItemButton>
          </Box>
        ))}
      </List>
      <Box
        sx={{
          mt: 'auto',
          p: 0,
          bgcolor: '#171411',
          borderRadius: 0,
        }}
      >
        <Button
          onClick={onLogout}
          fullWidth
          onMouseEnter={() => logoutIconRef.current?.startAnimation()}
          onMouseLeave={() => logoutIconRef.current?.stopAnimation()}
          sx={{
            minHeight: 48,
            p: 0,
            color: '#fff',
            bgcolor: '#b42318',
            borderRadius: '12px',
            fontSize: '0.875rem',
            fontWeight: 500,
            '&:hover': { bgcolor: '#8f1c13' },
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: '100%',
              position: 'relative',
              lineHeight: 1,
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                left: 22,
                top: '50%',
                display: 'flex',
                transform: 'translateY(-50%)',
                transition: 'color .2s ease',
              }}
            >
              <LogoutIcon
                ref={logoutIconRef}
                size={19}
                style={{ display: 'flex', alignItems: 'center', lineHeight: 0 }}
              />
            </Box>
            {renderExpandedContent && (
              <Box
                component="span"
                sx={{
                  position: 'absolute',
                  left: 50,
                  top: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                  opacity: expandedContentVisible ? 1 : 0,
                  transform: expandedContentVisible
                    ? 'translate(0, -50%)'
                    : 'translate(-10px, -50%)',
                  transition: 'opacity .14s ease, transform .14s ease',
                }}
              >
                ออกจากระบบ
              </Box>
            )}
          </Box>
        </Button>
      </Box>
      {attachedPanel}
    </Drawer>
  );
}
