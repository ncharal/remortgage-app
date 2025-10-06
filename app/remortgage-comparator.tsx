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
 * Remortgage Comparison App — Typed & Chart Extracted
 * Clean version for Vercel build.
 */

// ==== Types ====
type RepaymentType = "repayment" | "interestOnly";

type Option = {
  label: string;
  type: RepaymentType;
  rate: string;
  feeAmount: string;
  feeHandling: "add" | "upfront";
  fixedYears: string;
  fixedMonths: string;
  overpayment: string;
  ercAmount: string;
  applyERC: boolean;
  reversionRate: string;
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
      const r = (revRate || numberOrZero(rate)) / 100 / 12;
      afterFixedPayment = endBalance * r;
      afterFixedTotal = afterFixedPayment * remMonthsAfterFixed;
    }
  }

  const totalCostFullTerm = totalPaidDuringFixed + afterFixedTotal;

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

// ==== UI ====
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

// ==== Page ====
export default function RemortgageComparisonApp(): JSX.Element {
  const [outstanding, setOutstanding] = useState("250000");
  const [remainYears, setRemainYears] = useState("25");
  const [remainMonths, setRemainMonths] = useState("0");

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

  const maxFixedMonths = Math.max(0, ...metrics.map((m) => m.data.fixedTermMonths || 0));
  const chartData = Array.from({ length: maxFixedMonths + 1 }, (_, i) => {
    const point: Record<string, number> & { month: number } = { month: i } as any;
    metrics.forEach((m) => {
      if (i === 0) point[m.name] = m.data.startingBalance;
      else {
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
          Enter your current mortgage details and configure multiple offers to see payments and balances side by side. All figures are indicative.
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
          <Card key={idx} className="shadow-sm">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-lg">{opt.label}</CardTitle>
              {options.length > 1 && (
                <Button variant="ghost" size="sm" onClick={() => removeOption(idx)}>
                  Remove
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <FieldRow label={<TooltipLabel text="Interest rate (APR %)" tip="Annual Percentage Rate applied during the fixed term." />}>
                <Input inputMode="decimal" value={opt.rate} onChange={(e) => setOptions(options.map((o, i) => (i === idx ? { ...opt, rate: e.target.value } : o)))} />
              </FieldRow>
              <FieldRow label={<TooltipLabel text="Product fee (£)" tip="Arrangement/product fee." />}>
                <Input inputMode="decimal" value={opt.feeAmount} onChange={(e) => setOptions(options.map((o, i) => (i === idx ? { ...opt, feeAmount: e.target.value } : o)))} />
              </FieldRow>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics.map((m, idx) => (
          <Card key={idx} className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">{m.name} — Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Indicative monthly payment</span>
                  <span className="font-semibold">{currencyFormat(m.data.monthlyPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total paid during fixed term</span>
                  <span className="font-semibold">{currencyFormat(m.data.totalPaidDuringFixed)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount left after fixed term</span>
                  <span className="font-semibold">{currencyFormat(m.data.endBalance)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Balance during fixed term</CardTitle>
        </CardHeader>
        <CardContent>
          <BalanceChart data={chartData} seriesNames={metrics.map((m) => m.name)} />
        </CardContent>
      </Card>
    </div>
  );
}
