import SvgIcon from '@mui/material/SvgIcon';

type IconKind = 'calendar' | 'clock' | 'pin' | 'dress';
const paths: Record<IconKind, string> = {
  calendar: 'M7 3v4m10-4v4M4 10h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1ZM8 14h2m4 0h2m-8 3h2',
  clock: 'M12 8v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  pin: 'M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0ZM14.5 10a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z',
  dress: 'm9 3-2 5 3 3-5 10h14l-5-10 3-3-2-5m-6 0c0 4 6 4 6 0M10 11h4',
};

export default function DetailIcon({ kind }: { kind: IconKind }) {
  return <SvgIcon className="detail-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d={paths[kind]} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </SvgIcon>;
}
