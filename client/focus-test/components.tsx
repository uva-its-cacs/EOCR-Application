// THROWAWAY TEST PAGE. Not committed. URL: http://localhost:5173/focus-test/components.html
// Optional query: ?only=<group-type> renders a single section; ?open=dialog|drawer|menu|select|filter|colmenu
import 'src/global.css';

import { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import Box from '@mui/material/Box';
import Radio from '@mui/material/Radio';
import Switch from '@mui/material/Switch';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Menu from '@mui/material/Menu';
import List from '@mui/material/List';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Drawer from '@mui/material/Drawer';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Backdrop from '@mui/material/Backdrop';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import DialogTitle from '@mui/material/DialogTitle';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';
import ListItemButton from '@mui/material/ListItemButton';
import { useColorScheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { themeConfig, ThemeProvider } from 'src/theme';
import { eocrThemeOverrides } from 'src/theme/eocr-overrides';

const SIX = ['primary', 'secondary', 'info', 'success', 'warning', 'error'] as const;
const SEVEN = ['default', ...SIX] as const;
const SURFACES = [
  { id: 'default', bg: 'background.default' },
  { id: 'paper', bg: 'background.paper' },
  { id: 'neutral', bg: 'background.neutral' },
] as const;
const params = new URLSearchParams(window.location.search);
const only = params.get('only');
const open = params.get('open');

// A measured group. The harness (outside this file) knows what to read for each `type`.
function G({
  name,
  type,
  force,
  forceSel,
  focus,
  children,
}: {
  name: string;
  type: string;
  force?: string;
  forceSel?: string;
  focus?: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      data-g={name}
      data-type={type}
      data-force={force}
      data-force-sel={forceSel}
      data-focus={focus}
      sx={{ display: 'inline-block', m: 0.5, verticalAlign: 'top' }}
    >
      {children}
    </Box>
  );
}

// Render the content on default, paper and neutral surfaces.
function Surfaces({ title, render }: { title: string; render: (s: string) => React.ReactNode }) {
  return (
    <Box sx={{ mb: 2 }} data-section={title}>
      <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
        {title}
      </Typography>
      {SURFACES.map((s) => (
        <Box key={s.id} data-surface={s.id} sx={{ bgcolor: s.bg, p: 1.5, mb: 0.5 }}>
          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
            surface: {s.id}
          </Typography>
          {render(s.id)}
        </Box>
      ))}
    </Box>
  );
}

function Section({ title, children, type }: { title: string; children: React.ReactNode; type: string }) {
  if (only && only !== type) return null;
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" component="h2" sx={{ mb: 1 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function ModeButtons() {
  const { mode, setMode } = useColorScheme();
  return (
    <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
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

const ROWS = [
  { id: 1, name: 'Alpha Software', status: 'Approved', owner: 'Dana' },
  { id: 2, name: 'Bravo Tool', status: 'Denied', owner: 'Sam' },
  { id: 3, name: 'Charlie App', status: 'Submitted', owner: 'Lee' },
  { id: 4, name: 'Delta Suite', status: 'Draft', owner: 'Kim' },
  { id: 5, name: 'Echo Portal', status: 'Approved', owner: 'Pat' },
];
const COLS = [
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'status', headerName: 'Status', flex: 1 },
  { field: 'owner', headerName: 'Owner', flex: 1 },
];

function Grid() {
  const apiRef = useGridApiRef();
  const done = useRef(false);
  return (
    <Box sx={{ height: 420, width: 640 }}>
      <DataGrid
        apiRef={apiRef}
        aria-label="Test software requests"
        rows={ROWS}
        columns={COLS}
        pageSizeOptions={[5, 10]}
        initialState={{
          pagination: { paginationModel: { pageSize: 5 } },
          sorting: { sortModel: [{ field: 'name', sort: 'asc' }] },
        }}
        rowSelectionModel={{ type: 'include', ids: new Set([2]) }}
        onStateChange={() => {
          if (done.current) return;
          done.current = true;
          if (open === 'filter') setTimeout(() => apiRef.current?.showFilterPanel(), 300);
          if (open === 'colmenu') setTimeout(() => apiRef.current?.showColumnMenu('name'), 300);
        }}
      />
    </Box>
  );
}

function Page() {
  const [page] = useState(2);
  const anchor = useRef<HTMLButtonElement>(null);
  return (
    <Box sx={{ p: 3, bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh' }}>
      <Typography variant="h3" component="h1" sx={{ mb: 1 }}>
        In-scope components
      </Typography>
      <ModeButtons />

      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
          Check by eye
        </Typography>
        <Typography sx={{ mb: 1 }}>
          Press Tab to see each focus ring. Open states:{' '}
          <Link href="?open=dialog">dialog</Link>, <Link href="?only=none&open=menu">menu</Link>,{' '}
          <Link href="?only=grid&open=filter">grid filter panel</Link>,{' '}
          <Link href="?only=grid&open=colmenu">grid column menu</Link>. Hover states are forced
          in the sections below.
        </Typography>
        <Stack direction="row" spacing={3} sx={{ mb: 1, alignItems: 'center' }}>
          <FormControlLabel control={<Checkbox />} label="Checkbox" />
          <FormControlLabel control={<Radio />} label="Radio" />
          <FormControlLabel control={<Switch />} label="Switch" />
        </Stack>
        <Typography>
          An <Link href="#a">inline link</Link> inside a sentence, and{' '}
          <Link href="#b">another inline link</Link> next to it.
        </Typography>
      </Box>

      <Section title="Fields" type="field">
        <Surfaces
          title="TextField states"
          render={() => (
            <>
              <G name="field unshrunk label" type="field">
                <TextField label="Unshrunk label" />
              </G>
              <G name="field shrunk label + helper" type="field">
                <TextField label="Shrunk label" defaultValue="Value text" helperText="Helper text" />
              </G>
              <G name="field placeholder" type="field">
                <TextField
                  label="Placeholder"
                  placeholder="Placeholder text"
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </G>
              <G name="field error" type="field">
                <TextField error label="Error label" defaultValue="Bad" helperText="Error message" />
              </G>
              <G name="field hover" type="field" force="hover" forceSel=".MuiOutlinedInput-root">
                <TextField label="Hover" defaultValue="Hover" />
              </G>
              <G name="field focus" type="field" focus="input">
                <TextField label="Focus" defaultValue="Focus" />
              </G>
              <G name="field disabled" type="field">
                <TextField disabled label="Disabled" defaultValue="Disabled value" />
              </G>
              <G name="select" type="field">
                <TextField select label="Select" defaultValue="a" sx={{ minWidth: 140 }}>
                  <MenuItem value="a">Option A</MenuItem>
                  <MenuItem value="b">Option B</MenuItem>
                </TextField>
              </G>
            </>
          )}
        />
      </Section>

      <Section title="Label (template)" type="label">
        <Surfaces
          title="Label variants x colors"
          render={() => (
            <>
              {(['soft', 'outlined', 'filled', 'inverted'] as const).map((v) => (
                <Box key={v}>
                  {SEVEN.map((c) => (
                    <G key={c} name={`Label ${v} ${c}`} type="label">
                      <Label variant={v} color={c}>
                        {c}
                      </Label>
                    </G>
                  ))}
                </Box>
              ))}
            </>
          )}
        />
      </Section>

      <Section title="Chip" type="chip">
        <Surfaces
          title="Chip variants x colors"
          render={() => (
            <>
              {(['filled', 'outlined', 'soft'] as const).map((v) => (
                <Box key={v}>
                  {SEVEN.map((c) => (
                    <G key={c} name={`Chip ${v} ${c}`} type="chip">
                      <Chip variant={v} color={c} label={`${c}`} />
                    </G>
                  ))}
                </Box>
              ))}
              <Box>
                {SEVEN.map((c) => (
                  <G key={c} name={`Chip avatar filled ${c}`} type="chipavatar">
                    <Chip color={c} label={c} avatar={<Avatar>A</Avatar>} onDelete={() => {}} />
                  </G>
                ))}
                {SEVEN.map((c) => (
                  <G key={c} name={`Chip avatar outlined ${c}`} type="chipavatar">
                    <Chip variant="outlined" color={c} label={c} avatar={<Avatar>A</Avatar>} onDelete={() => {}} />
                  </G>
                ))}
              </Box>
              <Box>
                {(['filled', 'outlined', 'soft'] as const).map((v) => (
                  <G key={v} name={`Chip clickable ${v} hover`} type="chip" force="hover">
                    <Chip variant={v} label="clickable" onClick={() => {}} />
                  </G>
                ))}
                {(['filled', 'outlined', 'soft'] as const).map((v) => (
                  <G key={v} name={`Chip clickable ${v} primary hover`} type="chip" force="hover">
                    <Chip variant={v} color="primary" label="clickable" onClick={() => {}} />
                  </G>
                ))}
              </Box>
            </>
          )}
        />
      </Section>

      <Section title="Alert" type="alert">
        <Surfaces
          title="Alert variants x severities"
          render={() => (
            <>
              {(['standard', 'outlined', 'filled'] as const).map((v) => (
                <Box key={v}>
                  {(['info', 'success', 'warning', 'error'] as const).map((c) => (
                    <G key={c} name={`Alert ${v} ${c}`} type="alert">
                      <Alert variant={v} severity={c} sx={{ width: 230 }}>
                        {c} message
                      </Alert>
                    </G>
                  ))}
                </Box>
              ))}
            </>
          )}
        />
      </Section>

      <Section title="Link and Breadcrumbs" type="link">
        <Surfaces
          title="Link"
          render={() => (
            <>
              <G name="Link inline rest" type="link">
                <Typography sx={{ color: 'text.primary' }}>
                  Body text with an <Link href="#x">inline link</Link> in a sentence.
                </Typography>
              </G>
              <G name="Link inline hover" type="link" force="hover" forceSel="a">
                <Typography sx={{ color: 'text.primary' }}>
                  Body text with an <Link href="#x">inline link</Link> in a sentence.
                </Typography>
              </G>
              <G name="Link underline always" type="link">
                <Typography sx={{ color: 'text.primary' }}>
                  Body text with an <Link href="#x" underline="always">underlined link</Link> in a
                  sentence.
                </Typography>
              </G>
              <G name="Breadcrumbs" type="crumbs">
                <Breadcrumbs aria-label="breadcrumb">
                  <Link href="#a">Home</Link>
                  <Link href="#b">Section</Link>
                  <Typography>Current page</Typography>
                </Breadcrumbs>
              </G>
            </>
          )}
        />
      </Section>

      <Section title="Buttons" type="button">
        <Surfaces
          title="Button variants x colors"
          render={() => (
            <>
              {(['contained', 'outlined', 'text', 'soft'] as const).map((v) => (
                <Box key={v}>
                  {SEVEN.map((c) => (
                    <G key={c} name={`Button ${v} ${c}`} type="button">
                      <Button variant={v} color={c === 'default' ? 'inherit' : c}>
                        {c}
                      </Button>
                    </G>
                  ))}
                  {SEVEN.map((c) => (
                    <G key={c + 'h'} name={`Button ${v} ${c} hover`} type="button" force="hover">
                      <Button variant={v} color={c === 'default' ? 'inherit' : c}>
                        {c} h
                      </Button>
                    </G>
                  ))}
                </Box>
              ))}
              <G name="IconButton default" type="icon">
                <IconButton aria-label="Info">
                  <Iconify icon="eva:info-outline" />
                </IconButton>
              </G>
              <G name="IconButton hover" type="icon" force="hover">
                <IconButton aria-label="Info">
                  <Iconify icon="eva:info-outline" />
                </IconButton>
              </G>
            </>
          )}
        />
      </Section>

      <Section title="List, Menu, Pagination, Table" type="nav">
        <Surfaces
          title="List / Menu / Pagination / Table"
          render={() => (
            <>
              <G name="ListItemButton rest" type="listitem">
                <List sx={{ width: 200 }} disablePadding>
                  <ListItemButton>Rest item</ListItemButton>
                </List>
              </G>
              <G name="ListItemButton selected" type="listitem">
                <List sx={{ width: 200 }} disablePadding>
                  <ListItemButton selected>Selected item</ListItemButton>
                </List>
              </G>
              <G name="ListItemButton hover" type="listitem" force="hover" forceSel=".MuiListItemButton-root">
                <List sx={{ width: 200 }} disablePadding>
                  <ListItemButton>Hover item</ListItemButton>
                </List>
              </G>
              <G name="MenuItem rest" type="listitem">
                <MenuList sx={{ width: 200 }}>
                  <MenuItem>Rest item</MenuItem>
                </MenuList>
              </G>
              <G name="MenuItem selected" type="listitem">
                <MenuList sx={{ width: 200 }}>
                  <MenuItem selected>Selected item</MenuItem>
                </MenuList>
              </G>
              <G name="MenuItem hover" type="listitem" force="hover" forceSel=".MuiMenuItem-root">
                <MenuList sx={{ width: 200 }}>
                  <MenuItem>Hover item</MenuItem>
                </MenuList>
              </G>
              <G name="Pagination" type="pagination">
                <Pagination count={5} page={page} />
              </G>
              <G name="Pagination outlined" type="pagination">
                <Pagination count={5} page={page} variant="outlined" />
              </G>
              <G name="Pagination hover" type="pagination" force="hover" forceSel=".MuiPaginationItem-root:not(.Mui-selected)">
                <Pagination count={5} page={page} />
              </G>
              <G name="Table" type="table">
                <Table size="small" sx={{ width: 320 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Header A</TableCell>
                      <TableCell>Header B</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow hover>
                      <TableCell>Row 1 a</TableCell>
                      <TableCell>Row 1 b</TableCell>
                    </TableRow>
                    <TableRow hover data-hover-target>
                      <TableCell>Row 2 a</TableCell>
                      <TableCell>Row 2 b</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </G>
            </>
          )}
        />
      </Section>

      <Section title="Surfaces and feedback" type="misc">
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', mb: 2, alignItems: 'flex-start' }}>
          <G name="Paper text" type="paper">
            <Paper sx={{ p: 2, width: 220 }}>
              <Typography>Primary text</Typography>
              <Typography sx={{ color: 'text.secondary' }}>Secondary text</Typography>
            </Paper>
          </G>
          <G name="Paper outlined" type="paper">
            <Paper variant="outlined" sx={{ p: 2, width: 220 }}>
              <Typography>Outlined paper</Typography>
            </Paper>
          </G>
          <G name="Avatar" type="avatar">
            <Avatar>AB</Avatar>
          </G>
          <G name="Avatar primary" type="avatar">
            <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>AB</Avatar>
          </G>
          <G name="Tooltip" type="tooltip">
            <Tooltip open title="Tooltip text" placement="right" arrow>
              <Button ref={anchor} variant="outlined" sx={{ mr: 14 }}>
                Anchor
              </Button>
            </Tooltip>
          </G>
          <G name="CircularProgress" type="progress">
            <CircularProgress />
          </G>
          <G name="LinearProgress" type="progress">
            <LinearProgress sx={{ width: 200 }} variant="determinate" value={40} />
          </G>
          <G name="Backdrop" type="backdrop">
            <Backdrop open sx={{ position: 'relative', width: 200, height: 80 }}>
              <CircularProgress color="inherit" />
            </Backdrop>
          </G>
        </Stack>
        <Box sx={{ position: 'relative', height: 200 }}>
          <G name="Drawer paper" type="drawer">
            <Drawer
              variant="persistent"
              open
              slotProps={{ paper: { sx: { position: 'relative', width: 240, height: 180 } } }}
            >
              <List>
                <ListItemButton>Drawer item</ListItemButton>
                <ListItemButton selected>Selected item</ListItemButton>
              </List>
            </Drawer>
          </G>
        </Box>
      </Section>

      <Section title="DataGrid" type="grid">
        <G name="DataGrid" type="grid">
          <Grid />
        </G>
      </Section>

      {open === 'dialog' && (
        <Dialog open>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Dialog title
            <IconButton aria-label="Close">
              <Iconify icon="eva:info-outline" />
            </IconButton>
          </DialogTitle>
          <DialogContent>Dialog content text.</DialogContent>
          <DialogActions>
            <Button>Cancel</Button>
            <Button variant="contained">Confirm</Button>
          </DialogActions>
        </Dialog>
      )}
      {open === 'menu' && (
        <Menu open anchorEl={document.body} slotProps={{ paper: { 'data-g': 'Menu open', 'data-type': 'listitem' } as never }}>
          <MenuItem>Menu item one</MenuItem>
          <MenuItem selected>Menu item two</MenuItem>
        </Menu>
      )}
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
