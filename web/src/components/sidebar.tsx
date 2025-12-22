'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  CreditCard, 
  FileText,
  MessageSquare,
  Settings,
  BadgeAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    label: 'MAIN',
    items: [
      { href: '/', label: 'ダッシュボード', icon: LayoutDashboard },
      { href: '/ledger', label: '受注台帳', icon: BookOpen },
      { href: '/billing', label: '請求・入金', icon: CreditCard },
      { href: '/reports', label: '週次レポート', icon: FileText },
    ]
  },
  {
    label: 'DEMO',
    items: [
      { href: '/demo', label: 'ガイド・解説', icon: BadgeAlert },
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 h-screen sticky top-0 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-4 border-b border-slate-200">
        <h1 className="text-lg font-bold text-slate-900">Close the Loop</h1>
        <p className="text-xs text-slate-500">受発注・請求・入金管理</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-4">
        {navItems.map((section) => (
          <div key={section.label}>
            <p className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {section.label}
            </p>
            <ul className="mt-1 space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive 
                          ? "bg-sky-50 text-sky-900" 
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-200">
        <div className="px-3 py-2 text-xs text-slate-400">
          Demo Version
        </div>
      </div>
    </aside>
  );
}
