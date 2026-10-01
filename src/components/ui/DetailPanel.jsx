import { X } from "lucide-react";

export default function DetailPanel({
  title,
  tabs = [],
  activeTab,
  onTabChange,
  onClose,
  footer,
  children,
}) {
  return (
    <aside
      className="flex min-h-[560px] flex-col rounded-lg border border-slate-200 bg-white text-slate-800 shadow-sm"
      aria-label={title}
    >
      <div className="flex min-h-12 items-center justify-between border-b border-slate-200 px-4">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {onClose && (
          <button
            type="button"
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            onClick={onClose}
            aria-label={`Close ${title}`}
          >
            <X size={16} />
          </button>
        )}
      </div>
      {tabs.length > 0 && (
        <div
          className="flex gap-5 border-b border-slate-200 px-4"
          role="tablist"
          aria-label={`${title} sections`}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              className={`min-h-10 border-b-2 text-xs font-medium ${activeTab === tab.key ? "border-[#173557] text-[#173557]" : "border-transparent text-slate-500 hover:text-slate-700"}`}
              onClick={() => onTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
      <div className="flex-1 p-4">{children}</div>
      {footer && (
        <div className="border-t border-slate-200 bg-slate-50/70 p-3">
          {footer}
        </div>
      )}
    </aside>
  );
}
