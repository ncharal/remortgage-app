"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import BalanceChart from "@/components/BalanceChart";

/**
 * Remortgage Comparison App — Full Featured (Typed)
 * - Multiple options (add/remove)
 * - Repayment type, interest rate
 * - Fees (add to mortgage / paid up front)
 * - Fixed term (years + months)
 * - Monthly overpayment
 * - ERC toggle + amount
 * - Reversion rate after fixed
 * - Results + differences table
 * - Balance-over-fixed-term chart (via BalanceChart)
 */

// ==== Types ====
type RepaymentType = "repayment" | "interestOnly";

type Option = {
  label: string;
  type: RepaymentType;
  rate: string;               // APR % during fixed
  feeAmount: string;          // £
  feeHandling: "add" | "upfront";
  fixedYears: string;
  fixedMonths: string;
  overpayment: string;        // £/month
  ercAmount: string;          // £
  applyERC: boolean;
  reversionRate: string;      // APR % after fixed
};

type ScheduleRow = {
  m: number;
  balance: number;
  payment: number;
  interest: number;
  principal: number;
};

type Metrics = {
  monthlyPayment: number;
  totalPaidDuringFixed: number;
  endBalance: number;
  startingBalance: number;
  addedToLoan: number;
  upfrontFee: number;
  fixedTermMonths: number;
  fixedSchedule: ScheduleRow[];
  afterFixedPayment: number;
  afterFixedTotal: number;
  totalCostFullTerm: number;
};

// ==== Utils ====
function currencyFormat(n: number): string {
  if (!isFinite(n)) return "-";
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `£${Number(n).toFixed(2)}`;
  }
}

function numberOrZero(v: unknown): number {
  const n = parseFloat(String(v).replace(/,/g, ""));
  return isNaN(n) ? 0 : n;
}

function monthsFromYearsMonths(years: number | string, months: number | string): number {
  return Math.max(0, Math.round(numberOrZero(years) * 12 + numberOrZero(months)));
}

function computeAmortizedPayment(P: number, annualRate: number, nMonths: number): number {
  const r = annualRate / 100 / 12;
  if (nMonths <= 0) return 0;
  if (r === 0) return P / nMonths;
  return (P * r) / (1 - Math.pow(1 + r, -nMonths));
}

function simulateSchedule({
  balance,
  annualRate,
  months,
  type,
  basePayment,
  overpayment = 0,
}: {
  balance: number;
  annualRate: number;
  months: number;
  type: RepaymentType;
  basePayment: number;
  overpayment?: number;
}): ScheduleRow[] {
  const r = annualRate / 100 / 12;
  const out: ScheduleRow[] = [];
  let b = balance;
  for (let m = 1; m <= months; m++) {
    const interest = b * r;
    const scheduled = type === "interestOnly" ? interest : basePayment;
    let payment = scheduled + overpayment;
    let principal = Math.max(0, payment - interest);
    if (principal > b) {
      principal = b;
      payment = interest + principal;
    }
    b = Math.max(0, b - principal);
    out.push({ m, balance: b, payment, interest, principal });
    if (b <= 0) break;
  }
  return out;
}

function computeOptionMetrics({
  outstanding,
  remainingTermMonths,
  option,
}: {
  outstanding: number;
  remainingTermMonths: number;
  option: Option;
}): Metrics {
  const {
    type,
    rate,
    feeAmount,
    feeHandling,
    fixedYears,
    fixedMonths,
    overpayment,
    ercAmount,
    applyERC,
    reversionRate,
  } = option;

  const fixedTermMonths = monthsFromYearsMonths(fixedYears, fixedMonths);

  const addedToLoan = feeHandling === "add" ? numberOrZero(feeAmount) : 0;
  const upfrontFee = feeHandling === "upfront" ? numberOrZero(feeAmount) : 0;

  const startingBalance = numberOrZero(outstanding) + addedToLoan;

  const n = Math.max(1, remainingTermMonths);
  const basePayment =
    type === "repayment" ? computeAmortizedPayment(startingBalance, numberOrZero(rate), n) : 0;
  const extra = Math.max(0, numberOrZero(overpayment));

  // Simulate fixed period
  const fixedSchedule = simulateSchedule({
    balance: startingBalance,
    annualRate: numberOrZero(rate),
    months: fixedTermMonths,
    type,
    basePayment,
    overpayment: extra,
  });

  const lastPoint = fixedSchedule[fixedSchedule.length - 1];
  const endBalance = fixedSchedule.length ? lastPoint.balance : startingBalance;
  const monthlyPayment =
    type === "interestOnly"
      ? startingBalance * (numberOrZero(rate) / 100 / 12) + extra
      : basePayment + extra;

  const fixedPaid = fixedSchedule.reduce((s, x) => s + x.payment, 0);
  const totalPaidDuringFixed = fixedPaid + upfrontFee + (applyERC ? numberOrZero(ercAmount) : 0);

  // Post-fixed estimates using reversion rate
  const remMonthsAfterFixed = Math.max(0, n - fixedTermMonths);
  const revRate = numberOrZero(reversionRate);
  let afterFixedPayment = 0;
  let afterFixedTotal = 0;
  if (remMonthsAfterFixed > 0) {
    if (type === "repayment") {
      afterFixedPayment = computeAmortizedPayment(
        endBalance,
        revRate || numberOrZero(rate),
        remMonthsAfterFixed
      );
      afterFixedTotal = afterFixedPayment * remMonthsAfterFixed;
    } else {
      // interest-only assumption continues at reversion rate
      const r = (revRate || numberOrZero(rate)) / 100 / 12;
      afterFixedPayment = endBalance * r;
      afterFixedTotal = afterFixedPayment * remMonthsAfterFixed;
    }
  }

  const totalCostFullTerm = totalPaidDuringFixed + afterFixedTotal; // excludes final redemption

  return {
    monthlyPayment,
    totalPaidDuringFixed,
    endBalance,
    startingBalance,
    addedToLoan,
    upfrontFee,
    fixedTermMonths,
    fixedSchedule,
    afterFixedPayment,
    afterFixedTotal,
    totalCostFullTerm,
  };
}

// ==== UI helpers ====
const FieldRow: React.FC<{ label: React.ReactNode; children: React.ReactNode; hint?: string }> = ({
  label,
  children,
  hint,
}) => (
  <div className="grid grid-cols-12 items-center gap-3 py-2">
    <Label className="col-span-5 text-sm text-muted-foreground">{label}</Label>
    <div className="col-span-7">{children}</div>
    {hint ? <div className="col-span-12 text-xs text-muted-foreground -mt-1">{hint}</div> : null}
  </div>
);

const TooltipLabel: React.FC<{ text: string; tip: string }> = ({ text, tip }) => (
  <span className="inline-flex items-center gap-1" title={tip}>
    {text}
    <span className="text-muted-foreground/70">ⓘ</span>
  </span>
);

// Per-option editor
const OptionEditor: React.FC<{
  title: string;
  option: Option;
  onChange: (opt: Option) => void;
  onRemove?: () => void;
}> = ({ title, option, onChange, onRemove }) => {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-lg">{title}</CardTitle>
        {onRemove && (
          <Button variant="ghost" size="sm" onClick={onRemove} aria-label="Remove option">
            Remove
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <FieldRow
            label={
              <TooltipLabel
                text="Repayment type"
                tip="Repayment reduces the balance each month. Interest-only pays interest only unless you overpay."
              />
            }
          >
            <Select value={option.type} onValueChange={(v) => onChange({ ...option, type: v as RepaymentType })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="repayment">Capital & interest (repayment)</SelectItem>
                <SelectItem value="interestOnly">Interest only</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>

          <FieldRow
            label={<TooltipLabel text="Interest rate (APR %)" tip="Annual Percentage Rate applied during the fixed term." />}
          >
            <Input
              inputMode="decimal"
              value={option.rate}
              onChange={(e) => onChange({ ...option, rate: e.target.value })}
            />
          </FieldRow>

          <div className="grid grid-cols-12 gap-3 items-center">
            <div className="col-span-6">
              <FieldRow label={<TooltipLabel text="Product fee (£)" tip="Often called arrangement/product fee." />}>
                <Input
                  inputMode="decimal"
                  value={option.feeAmount}
                  onChange={(e) => onChange({ ...option, feeAmount: e.target.value })}
                />
              </FieldRow>
            </div>
            <div className="col-span-6">
              <FieldRow
                label={
                  <TooltipLabel
                    text="Fee handling"
                    tip="Add to the mortgage increases the balance; paid up front adds to cash outlay but not balance."
                  />
                }
              >
                <Select
                  value={option.feeHandling}
                  onValueChange={(v) => onChange({ ...option, feeHandling: v as Option["feeHandling"] })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Add to mortgage or pay upfront" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Add to mortgage</SelectItem>
                    <SelectItem value="upfront">Fees paid up front</SelectItem>
                  </SelectContent>
                </Select>
              </FieldRow>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-6">
              <FieldRow
                label={<TooltipLabel text="Fixed term length (years)" tip="Length of the introductory fixed-rate period." />}
              >
                <Input
                  inputMode="numeric"
                  value={option.fixedYears}
                  onChange={(e) => onChange({ ...option, fixedYears: e.target.value })}
                />
              </FieldRow>
            </div>
            <div className="col-span-6">
              <FieldRow
                label={
                  <TooltipLabel text="Fixed term (extra months)" tip="Use this to model, say, 2 years and 6 months." />
                }
              >
                <Input
                  inputMode="numeric"
                  value={option.fixedMonths}
                  onChange={(e) => onChange({ ...option, fixedMonths: e.target.value })}
                />
              </FieldRow>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-6">
              <FieldRow
                label={<TooltipLabel text="Monthly overpayment (£)" tip="Extra amount you plan to pay each month." />}
              >
                <Input
                  inputMode="decimal"
                  value={option.overpayment}
                  onChange={(e) => onChange({ ...option, overpayment: e.target.value })}
                />
              </FieldRow>
            </div>
            <div className="col-span-6">
              <FieldRow
                label={
                  <TooltipLabel
                    text="Reversion rate (APR %)"
                    tip="Estimated rate after the fixed term—for indicative post-fixed payments."
                  />
                }
              >
                <Input
                  inputMode="decimal"
                  value={option.reversionRate}
                  onChange={(e) => onChange({ ...option, reversionRate: e.target.value })}
                />
              </FieldRow>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-3 items-center">
            <div className="col-span-8">
              <FieldRow
                label={
                  <TooltipLabel
                    text="Early Repayment Charge (£)"
                    tip="If you expect to redeem/leave during the fixed period, include the ERC here."
                  />
                }
              >
                <Input
                  inputMode="decimal"
                  value={option.ercAmount}
                  onChange={(e) => onChange({ ...option, ercAmount: e.target.value })}
                />
              </FieldRow>
            </div>
            <div className="col-span-4">
              <FieldRow
                label={<TooltipLabel text="Apply ERC" tip="Tick to include ERC in totals for the fixed term." />}
              >
                <div className="flex items-center gap-2">
                  <Switch
                    checked={!!option.applyERC}
                    onCheckedChange={(v) => onChange({ ...option, applyERC: !!v })}
                  />
                  <span className="text-sm text-muted-foreground">Include in totals</span>
                </div>
              </FieldRow>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Per-option results
const ResultCard: React.FC<{ name: string; metrics: Metrics }> = ({ name, metrics }) => {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">{name} — Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Indicative monthly payment</span>
            <span className="font-semibold">{currencyFormat(metrics.monthlyPayment)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total paid during fixed term</span>
            <span className="font-semibold">{currencyFormat(metrics.totalPaidDuringFixed)}</span>
          </div>
          <div className="flex justify-between">
            <span>Amount left after fixed term</span>
            <span className="font-semibold">{currencyFormat(Math.max(0, metrics.endBalance))}</span>
          </div>
          <div className="flex justify-between">
            <span>Estimated post-fixed monthly payment</span>
            <span className="font-semibold">{currencyFormat(metrics.afterFixedPayment)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total cost over full remaining term</span>
            <span className="font-semibold">{currencyFormat(metrics.totalCostFullTerm)}</span>
          </div>
          <div className="pt-2 text-xs text-muted-foreground">
            Assumes fixed interest for the period, optional overpayments applied monthly, and no rate changes mid-term.
            Reversion rate is used after the fixed period. Fees added to mortgage increase the starting balance; fees
            paid upfront are included in totals but not in balance.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ==== Page ====
export default function RemortgageComparisonApp(): JSX.Element {
  const [outstanding, setOutstanding] = useState<string>("250000");
  const [remainYears, setRemainYears] = useState<string>("25");
  const [remainMonths, setRemainMonths] = useState<string>("0");

  const makeDefaultOption = (label: string): Option => ({
    label,
    type: "repayment",
    rate: "4.99",
    feeAmount: "999",
    feeHandling: "add",
    fixedYears: "2",
    fixedMonths: "0",
    overpayment: "0",
    ercAmount: "0",
    applyERC: false,
    reversionRate: "6.00",
  });

  const [options, setOptions] = useState<Option[]>([
    makeDefaultOption("Option A"),
    { ...makeDefaultOption("Option B"), rate: "5.29", feeAmount: "0", fixedYears: "5" },
  ]);

  const remainingTermMonths = useMemo(
    () => monthsFromYearsMonths(remainYears, remainMonths),
    [remainYears, remainMonths]
  );

  const metrics = useMemo(
    () =>
      options.map((opt) => ({
        name: opt.label,
        data: computeOptionMetrics({
          outstanding: numberOrZero(outstanding),
          remainingTermMonths,
          option: opt,
        }),
      })),
    [options, outstanding, remainingTermMonths]
  );

  const addOption = () => {
    const nextLabel = String.fromCharCode("A".charCodeAt(0) + options.length);
    setOptions([...options, makeDefaultOption(`Option ${nextLabel}`)]);
  };

  const removeOption = (idx: number) => {
    const copy = [...options];
    copy.splice(idx, 1);
    setOptions(copy.map((o, i) => ({ ...o, label: `Option ${String.fromCharCode(65 + i)}` })));
  };

  // Chart data: month vs balance for each option during fixed period
  const maxFixedMonths = Math.max(0, ...metrics.map((m) => m.data.fixedTermMonths || 0));
  const chartData = Array.from({ length: maxFixedMonths + 1 }, (_, i) => {
    const point: Record<string, number> & { month: number } = { month: i } as any;
    metrics.forEach((m) => {
      if (i === 0) {
        point[m.name] = m.data.startingBalance;
      } else {
        const sched = m.data.fixedSchedule[i - 1];
        point[m.name] = sched ? sched.balance : m.data.endBalance;
      }
    });
    return point;
  });

  const base = metrics[0]?.data;

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Remortgage Options Comparator</h1>
        <p className="text-sm text-muted-foreground">
          Enter your current mortgage details and configure multiple offers to see payments and balances side by side.
          All figures are indicative.
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Your current mortgage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-4">
              <FieldRow label={<TooltipLabel text="Outstanding balance (£)" tip="Current principal remaining on your mortgage." />}>
                <Input value={outstanding} inputMode="decimal" onChange={(e) => setOutstanding(e.target.value)} />
              </FieldRow>
            </div>
            <div className="col-span-6 md:col-span-4">
              <FieldRow label={<TooltipLabel text="Remaining term (years)" tip="How many years are left on the mortgage." />}>
                <Input value={remainYears} inputMode="numeric" onChange={(e) => setRemainYears(e.target.value)} />
              </FieldRow>
            </div>
            <div className="col-span-6 md:col-span-4">
              <FieldRow label={<TooltipLabel text="Remaining term (months)" tip="Additional months beyond the years above." />}>
                <Input value={remainMonths} inputMode="numeric" onChange={(e) => setRemainMonths(e.target.value)} />
              </FieldRow>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Options</h2>
        <Button variant="secondary" onClick={addOption}>
          Add option
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {options.map((opt, idx) => (
          <OptionEditor
            key={idx}
            title={opt.label}
            option={opt}
            onChange={(v) => setOptions(options.map((o, i) => (i === idx ? { ...v, label: o.label } : o)))}
            onRemove={options.length > 1 ? () => removeOption(idx) : undefined}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics.map((m, idx) => (
          <ResultCard key={idx} name={m.name} metrics={m.data} />
        ))}
      </div>

      {metrics.length > 1 && base && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Differences vs {metrics[0].name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-2">Option</th>
                    <th className="py-2 pr-2">Monthly Δ</th>
                    <th className="py-2 pr-2">Fixed-term total Δ</th>
                    <th className="py-2 pr-2">End balance Δ</th>
                    <th className="py-2 pr-2">Full-term cost Δ</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.slice(1).map((m, i) => {
                    const b = m.data;
                    return (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-2 pr-2">{m.name}</td>
                        <td className="py-2 pr-2">{currencyFormat(b.monthlyPayment - base.monthlyPayment)}</td>
                        <td className="py-2 pr-2">{currencyFormat(b.totalPaidDuringFixed - base.totalPaidDuringFixed)}</td>
                        <td className="py-2 pr-2">{currencyFormat(b.endBalance - base.endBalance)}</td>
                        <td className="py-2 pr-2">{currencyFormat(b.totalCostFullTerm - base.totalCostFullTerm)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Balance during fixed term</CardTitle>
        </CardHeader>
        <CardContent>
          <BalanceChart data={chartData} seriesNames={metrics.map((m) => m.name)} />
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground leading-relaxed">
        <p className="mb-2">Notes & assumptions:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Interest rate is assumed fixed for the selected fixed-term length, with no changes mid-term.</li>
          <li>
            For <span className="font-medium">repayment</span>, the base monthly payment is calculated over the full remaining term. Any monthly overpayment reduces the balance faster and may shorten the overall term.
          </li>
          <li>
            For <span className="font-medium">interest-only</span>, the scheduled payment is monthly interest; any overpayment reduces the balance.
          </li>
          <li>
            Fees: choosing <span className="font-medium">Add to mortgage</span> increases the borrowed amount; choosing <span className="font-medium">Fees paid up front</span> includes the fee in the totals but does not increase the balance.
          </li>
          <li>ERC (if applied) is simply added to the fixed-period total for comparison purposes.</li>
          <li>Reversion rate is used to estimate payments and totals after the fixed period for the remainder of the term.</li>
          <li>Results exclude valuation/legal costs and any future product changes after the fixed period.</li>
        </ul>
      </div>
    </div>
  );
}
