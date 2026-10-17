// EOCR: only `fData` from the template's format-number.ts (the locale code is not ported).

type InputNumberValue = string | number | null | undefined;

export function fData(inputValue: InputNumberValue) {
  if (inputValue == null || Number.isNaN(inputValue)) return '0 bytes';

  const number = Number(inputValue);
  if (number === 0) return '0 bytes';

  const units = ['bytes', 'Kb', 'Mb', 'Gb', 'Tb', 'Pb', 'Eb', 'Zb', 'Yb'];
  const decimal = 2;
  const baseValue = 1024;

  const index = Math.floor(Math.log(number) / Math.log(baseValue));
  const fm = `${parseFloat((number / baseValue ** index).toFixed(decimal))} ${units[index]}`;

  return fm;
}
