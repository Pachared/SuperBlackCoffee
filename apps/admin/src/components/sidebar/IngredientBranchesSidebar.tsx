import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';

export const ingredientBranches = [
  'ทุกสาขา',
  'สยามสแควร์',
  'อโศก',
  'อารีย์',
  'ทองหล่อ',
  'เซ็นทรัลลาดพร้าว',
  'สามย่าน',
  'เยาวราช',
  'ไอคอนสยาม',
  'เอ็มควอเทียร์',
  'พระราม 9',
  'รัชดา',
  'บางนา',
  'ศาลาแดง',
  'จตุจักร',
  'ลาดกระบัง',
  'ปิ่นเกล้า',
  'บางแค',
  'รามอินทรา',
  'วงเวียนใหญ่',
  'อนุสาวรีย์ชัยฯ',
] as const;
export type IngredientBranch = (typeof ingredientBranches)[number];

export function IngredientBranchesSidebar({
  activeBranch,
  onBranchChange,
}: {
  activeBranch: IngredientBranch;
  onBranchChange: (branch: IngredientBranch) => void;
}) {
  return (
    <Box
      component="aside"
      sx={{
        position: 'sticky',
        top: '72px',
        zIndex: 1201,
        alignSelf: 'flex-start',
        width: 160,
        flexShrink: 0,
        mt: '72px',
        height: 'calc(100vh - 72px)',
        overflowY: 'auto',
        overscrollBehaviorY: 'contain',
        '&::-webkit-scrollbar': { width: 8 },
        '&::-webkit-scrollbar-thumb': { bgcolor: '#805637', borderRadius: 8 },
        '&::-webkit-scrollbar-button': { display: 'none', width: 0, height: 0 },
        '&::-webkit-scrollbar-button:single-button:vertical:decrement, &::-webkit-scrollbar-button:single-button:vertical:increment':
          { display: 'none', height: 0 },
        bgcolor: '#fbfaf8',
        borderRight: '1px solid #e8ddd5',
        px: 1.25,
        pt: '10px',
      }}
    >
      <List disablePadding>
        {ingredientBranches.map((branch) => (
          <ListItemButton
            key={branch}
            selected={branch === activeBranch}
            onClick={() => onBranchChange(branch)}
            sx={{
              minHeight: 42,
              mb: 0.5,
              borderRadius: '10px',
              fontFamily: 'Kanit, sans-serif',
              '&.Mui-selected': {
                bgcolor: '#201914',
                color: '#fff',
                '&:hover': { bgcolor: '#3c2d24' },
              },
              '&:hover': { bgcolor: '#f1e7df' },
            }}
          >
            <ListItemText
              primary={
                <Typography
                  sx={{
                    fontFamily: 'Kanit, sans-serif',
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  {branch}
                </Typography>
              }
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
