import type { SoftwareCatalogItem } from 'src/sections/software/types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { formatDateOnly } from 'src/utils/format';

import { StatusChip } from 'src/components/status-chip';

import { APPROVAL_STATUS_COLORS } from 'src/sections/requests/status-colors';

// ----------------------------------------------------------------------

// Every catalog version of the requested product, so the reviewer can see earlier decisions. The
// requested version is marked in text.
type Props = {
  versions: SoftwareCatalogItem[];
  requestedVersion: string;
};

export function ReviewCatalogVersions({ versions, requestedVersion }: Props) {
  return (
    <Card>
      <CardHeader
        title="In the software catalog"
        slotProps={{ title: { component: 'h2' } }}
      />
      <Box sx={{ p: 3 }}>
        {versions.length === 0 ? (
          <Typography variant="body2">
            No version of this software is in the catalog yet. The decision adds it.
          </Typography>
        ) : (
          <Box
            component="ul"
            sx={{ m: 0, p: 0, gap: 2, display: 'flex', listStyle: 'none', flexDirection: 'column' }}
          >
            {versions.map((version) => {
              const requested = version.version.toLowerCase() === requestedVersion.toLowerCase();
              return (
                <Box
                  component="li"
                  key={version.softwareId}
                  sx={{ gap: 0.5, display: 'flex', flexDirection: 'column', typography: 'body2' }}
                >
                  <Box sx={{ gap: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                    <Typography variant="subtitle2">
                      Version {version.version}
                      {requested && ' (requested)'}
                    </Typography>
                    <StatusChip
                      code={version.currentApprovalStatusCode}
                      label={version.currentApprovalStatusLabel}
                      colors={APPROVAL_STATUS_COLORS}
                    />
                  </Box>
                  <Box sx={{ color: 'text.secondary' }}>
                    Expires {formatDateOnly(version.approvalExpirationDate)}
                    {version.accessibilityRiskLabel && `, ${version.accessibilityRiskLabel} risk`}
                  </Box>
                  {version.conditions && <Box>Conditions: {version.conditions}</Box>}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Card>
  );
}
