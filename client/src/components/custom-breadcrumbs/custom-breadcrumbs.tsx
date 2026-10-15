import type { Theme, SxProps } from '@mui/material/styles';
import type { BreadcrumbsProps } from '@mui/material/Breadcrumbs';
import type { MoreLinksProps } from './more-links';
import type { BreadcrumbsLinkProps } from './breadcrumb-link';

import Breadcrumbs from '@mui/material/Breadcrumbs';

import { BackLink } from './back-link';
import { MoreLinks } from './more-links';
import { BreadcrumbsLink } from './breadcrumb-link';
import {
  BreadcrumbsRoot,
  BreadcrumbsHeading,
  BreadcrumbsContent,
  BreadcrumbsContainer,
  BreadcrumbsSeparator,
  BreadcrumbsHeadingRow,
} from './styles';

// ----------------------------------------------------------------------

export type CustomBreadcrumbsSlotProps = {
  breadcrumbs: BreadcrumbsProps;
  moreLinks: Omit<MoreLinksProps, 'links'>;
  heading: React.ComponentProps<typeof BreadcrumbsHeading>;
  content: React.ComponentProps<typeof BreadcrumbsContent>;
  container: React.ComponentProps<typeof BreadcrumbsContainer>;
};

export type CustomBreadcrumbsSlots = {
  breadcrumbs?: React.ReactNode;
};

export type CustomBreadcrumbsProps = React.ComponentProps<'div'> & {
  sx?: SxProps<Theme>;
  heading?: string;
  activeLast?: boolean;
  backHref?: string;
  // EOCR: accessible name of the back link (the template links the whole heading instead).
  backLabel?: string;
  action?: React.ReactNode;
  links?: BreadcrumbsLinkProps[];
  moreLinks?: MoreLinksProps['links'];
  slots?: CustomBreadcrumbsSlots;
  slotProps?: Partial<CustomBreadcrumbsSlotProps>;
};

export function CustomBreadcrumbs({
  sx,
  action,
  backHref,
  backLabel,
  heading,
  slots = {},
  links = [],
  moreLinks = [],
  slotProps = {},
  activeLast = false,
  ...other
}: CustomBreadcrumbsProps) {
  const lastLink = links[links.length - 1]?.name;

  // EOCR: the back arrow is its own named link next to the heading, not inside it (the template links
  // the whole heading), so the heading's name stays the page title.
  const renderHeading = () => (
    <BreadcrumbsHeadingRow>
      {backHref && <BackLink href={backHref} aria-label={backLabel ?? 'Back'} />}
      <BreadcrumbsHeading {...slotProps?.heading}>{heading}</BreadcrumbsHeading>
    </BreadcrumbsHeadingRow>
  );

  const renderLinks = () =>
    slots?.breadcrumbs ?? (
      <Breadcrumbs
        aria-label="Breadcrumb"
        separator={<BreadcrumbsSeparator />}
        {...slotProps?.breadcrumbs}
      >
        {links.map((link, index) => {
          const current = link.name === lastLink && !activeLast;
          return (
            <BreadcrumbsLink
              key={link.name ?? index}
              icon={link.icon}
              // EOCR: the current page is plain text marked aria-current (no link).
              href={current ? undefined : link.href}
              name={link.name}
              disabled={current}
              aria-current={current ? 'page' : undefined}
            />
          );
        })}
      </Breadcrumbs>
    );

  const renderMoreLinks = () => <MoreLinks links={moreLinks} {...slotProps?.moreLinks} />;

  return (
    <BreadcrumbsRoot sx={sx} {...other}>
      <BreadcrumbsContainer {...slotProps?.container}>
        <BreadcrumbsContent {...slotProps?.content}>
          {(heading || backHref) && renderHeading()}
          {(!!links.length || slots?.breadcrumbs) && renderLinks()}
        </BreadcrumbsContent>
        {action}
      </BreadcrumbsContainer>

      {!!moreLinks?.length && renderMoreLinks()}
    </BreadcrumbsRoot>
  );
}
