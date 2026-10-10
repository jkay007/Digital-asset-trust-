import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function TableWrap({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-card', className)} {...props} />;
}
export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return <table className={cn('w-full min-w-[640px] border-collapse text-left text-sm', className)} {...props} />;
}
export function THead(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500" {...props} />;
}
export function Th({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th scope="col" className={cn('px-4 py-3 font-semibold', className)} {...props} />;
}
export function Tr({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('border-b border-slate-100 last:border-0 hover:bg-slate-50/60', className)} {...props} />;
}
export function Td({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-4 py-3 align-top text-slate-700', className)} {...props} />;
}
