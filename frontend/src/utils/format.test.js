import { formatDuration, minutesBetween, roleLabel } from './format';

test('formats the hours computed by the API without changing them', () => {
  expect(formatDuration(8.5)).toBe('8 h 30 min');
  expect(formatDuration(8)).toBe('8 h');
  expect(formatDuration(0.75)).toBe('45 min');
  expect(formatDuration(9.25)).toBe('9 h 15 min');
  expect(formatDuration(8.33)).toBe('8 h 20 min'); // API rounds to 2 decimals
});

test('previews a duration only for a valid range', () => {
  expect(minutesBetween('08:00', '16:30')).toBe(510);
  expect(minutesBetween('10:00', '09:00')).toBeNull();
  expect(minutesBetween('08:00', '')).toBeNull();
});

test('labels roles in Spanish', () => {
  expect(roleLabel('admin')).toBe('Administrador');
  expect(roleLabel('user')).toBe('Usuario');
});
