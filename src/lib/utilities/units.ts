import { formatRational, type Decimal, type NumberFormat } from './decimal';

type Ratio = readonly [bigint, bigint];
interface Unit {
  id: string;
  factor: Ratio;
  offset: Ratio;
}
// Exact definitions, not measured estimates. Base: m, kg, m², L, K, m/s, s, B.
const unit = (id: string, numerator: bigint, denominator = 1n, offset: Ratio = [0n, 1n]): Unit => ({
  id,
  factor: [numerator, denominator],
  offset,
});
export const unitGroups = {
  length: [
    unit('mm', 1n, 1000n),
    unit('cm', 1n, 100n),
    unit('m', 1n),
    unit('km', 1000n),
    unit('in', 254n, 10000n),
    unit('ft', 3048n, 10000n),
    unit('yd', 9144n, 10000n),
    unit('mi', 1609344n, 1000n),
  ],
  mass: [
    unit('mg', 1n, 1000000n),
    unit('g', 1n, 1000n),
    unit('kg', 1n),
    unit('tonne', 1000n),
    unit('oz', 28349523125n, 1000000000000n),
    unit('lb', 45359237n, 100000000n),
  ],
  area: [
    unit('cm2', 1n, 10000n),
    unit('m2', 1n),
    unit('ha', 10000n),
    unit('km2', 1000000n),
    unit('ft2', 9290304n, 100000000n),
    unit('acre', 40468564224n, 10000000n),
  ],
  volume: [
    unit('ml', 1n, 1000n),
    unit('l', 1n),
    unit('m3', 1000n),
    unit('us_gal', 3785411784n, 1000000000n),
    unit('uk_gal', 454609n, 100000n),
  ],
  temperature: [
    unit('c', 1n, 1n, [27315n, 100n]),
    unit('f', 5n, 9n, [45967n, 180n]),
    unit('k', 1n),
  ],
  speed: [
    unit('mps', 1n),
    unit('kph', 5n, 18n),
    unit('mph', 1397n, 3125n),
    unit('knot', 463n, 900n),
  ],
  duration: [
    unit('ms', 1n, 1000n),
    unit('s', 1n),
    unit('min', 60n),
    unit('h', 3600n),
    unit('day', 86400n),
    unit('week', 604800n),
  ],
  data: [
    unit('bit', 1n, 8n),
    unit('byte', 1n),
    unit('kb', 1000n),
    unit('mb', 1000000n),
    unit('gb', 1000000000n),
    unit('tb', 1000000000000n),
    unit('kib', 1024n),
    unit('mib', 1048576n),
    unit('gib', 1073741824n),
    unit('tib', 1099511627776n),
  ],
} as const;
export type UnitGroup = keyof typeof unitGroups;
export const unitGroupIds = Object.keys(unitGroups) as UnitGroup[];
export type UnitResult =
  | { ok: true; text: string; rounded: boolean }
  | { ok: false; error: 'unit' | 'absoluteZero' | 'negative' };

export function convertUnit(
  value: Decimal,
  group: UnitGroup,
  fromId: string,
  toId: string,
  format: NumberFormat,
): UnitResult {
  const units: readonly Unit[] | undefined = unitGroups[group];
  const from = units?.find((item) => item.id === fromId);
  const to = units?.find((item) => item.id === toId);
  if (!from || !to) return { ok: false, error: 'unit' };
  if (group !== 'temperature' && value.coefficient < 0n) return { ok: false, error: 'negative' };
  const [fn, fd] = from.factor,
    [on, od] = from.offset;
  const inputDenominator = 10n ** BigInt(value.scale);
  const baseN = value.coefficient * fn * od + on * inputDenominator * fd;
  const baseD = inputDenominator * fd * od;
  if (group === 'temperature' && baseN < 0n) return { ok: false, error: 'absoluteZero' };
  const [tn, td] = to.factor,
    [ton, tod] = to.offset;
  return {
    ok: true,
    ...formatRational((baseN * tod - ton * baseD) * td, baseD * tod * tn, format),
  };
}
