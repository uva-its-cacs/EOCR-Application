// THROWAWAY TEST PAGE. Not committed. URL: http://localhost:5173/focus-test/
import 'src/global.css';

import { useState } from 'react';
import { createRoot } from 'react-dom/client';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Menu from '@mui/material/Menu';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuList from '@mui/material/MenuList';
import { useColorScheme } from '@mui/material/styles';
import ListItemButton from '@mui/material/ListItemButton';
import FormControlLabel from '@mui/material/FormControlLabel';

import { themeConfig, ThemeProvider } from 'src/theme';
import { eocrThemeOverrides } from 'src/theme/eocr-overrides';

import { Iconify } from 'src/components/iconify';

const COLORS = ['primary', 'secondary', 'info', 'success', 'warning', 'error'] as const;

function ModeButtons() {
  const { mode, setMode } = useColorScheme();
  return (
    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
      <Typography>Mode: {mode}</Typography>
      <Button size="small" variant="outlined" onClick={() => setMode('light')}>
        Light
      </Button>
      <Button size="small" variant="outlined" onClick={() => setMode('dark')}>
        Dark
      </Button>
    </Stack>
  );
}

function Page() {
  const [tab, setTab] = useState(0);
  const [sel, setSel] = useState('a');
  return (
    <Box sx={{ p: 3, bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh' }}>
      <Typography variant="h3" component="h1" sx={{ mb: 2 }}>
        Focus ring and token test
      </Typography>
      <ModeButtons />

      <Box id="font-samples">
        {(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const).map((v) => (
          <Typography key={v} variant={v} data-font={v} component="div">
            Sample {v}
          </Typography>
        ))}
        <Typography variant="body1" data-font="p">
          Sample body text
        </Typography>
      </Box>

      <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
        Contained buttons: default (top) and hover (bottom, forced)
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
        {COLORS.map((c) => (
          <Button key={c} id={`btn-${c}`} variant="contained" color={c}>
            {c}
          </Button>
        ))}
      </Stack>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        {COLORS.map((c) => (
          <Button
            key={c}
            variant="contained"
            color={c}
            sx={(theme) => ({ bgcolor: theme.vars.palette[c].dark })}
          >
            {c} hover
          </Button>
        ))}
      </Stack>

      <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
        Outlined, soft and text variants
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        {COLORS.map((c) => (
          <Button key={c} variant="outlined" color={c}>
            {c}
          </Button>
        ))}
        {COLORS.map((c) => (
          <Button key={c} variant="soft" color={c}>
            {c}
          </Button>
        ))}
      </Stack>

      <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
        Inputs
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField id="tf-outlined" label="Outlined field" defaultValue="Text" />
        <TextField id="tf-placeholder" label="With placeholder" placeholder="Placeholder" />
      </Stack>

      <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
        Focus targets (press Tab)
      </Typography>
      <Stack direction="row" spacing={3} sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 3 }}>
        <Button id="t-button" variant="contained">
          Button
        </Button>
        <IconButton id="t-iconbutton" aria-label="Icon button">
          <Iconify icon="eva:info-outline" />
        </IconButton>
        <Link id="t-link" href="#x">
          Link
        </Link>
        <Select id="t-select" size="small" value={sel} onChange={(e) => setSel(e.target.value)}>
          <MenuItem value="a">A</MenuItem>
          <MenuItem value="b">B</MenuItem>
        </Select>
        <FormControlLabel control={<Checkbox id="t-checkbox" />} label="Checkbox" />
        <FormControlLabel control={<Switch id="t-switch" />} label="Switch" />
        <Chip id="t-chip" label="Clickable chip" onClick={() => {}} />
      </Stack>
      <Box sx={{ width: 240, mb: 3 }}>
        <ListItemButton id="t-listitembutton">List item button</ListItemButton>
        <MenuList>
          <MenuItem id="t-menuitem">Menu item</MenuItem>
        </MenuList>
      </Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab id="t-tab" label="Tab one" />
        <Tab label="Tab two" />
      </Tabs>
      <Menu open={false} />
    </Box>
  );
}

createRoot(document.getElementById('root')!).render(
  <ThemeProvider
    modeStorageKey={themeConfig.modeStorageKey}
    defaultMode={themeConfig.defaultMode}
    themeOverrides={eocrThemeOverrides}
  >
    <Page />
  </ThemeProvider>
);
