import { Link, useRouterState } from "@tanstack/react-router";

const tabs = [
  {
    id: "balance",
    to: "/",
    label: "Balance",
    icon: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        className="h-6 w-6"
      >
        <path d="M12 3v18M7 8h10a3 3 0 0 1 0 6H7a3 3 0 0 0 0 6h10" />
      </svg>
    ),
  },
  {
    id: "purchases",
    to: "/purchases",
    label: "Purchases",
    icon: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        className="h-6 w-6"
      >
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
      </svg>
    ),
  },
  {
    id: "create",
    to: "/purchases/new",
    label: "Create",
    icon: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        className="h-6 w-6"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
] as const;

function isTabActive(tabId: (typeof tabs)[number]["id"], pathname: string) {
  if (tabId === "balance") {
    return pathname === "/";
  }

  if (tabId === "create") {
    return pathname === "/purchases/new";
  }

  return (
    pathname === "/purchases" ||
    pathname === "/purchases/" ||
    (pathname.startsWith("/purchases/") && pathname !== "/purchases/new")
  );
}

export function BottomTabNav() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-200 bg-white/95 backdrop-blur"
    >
      <div className="mx-auto flex max-w-lg pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab) => {
          const active = isTabActive(tab.id, pathname);

          return (
            <Link
              key={tab.to}
              to={tab.to}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 px-2 py-2 text-xs font-semibold text-brand-600 transition-colors"
                  : "relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 px-2 py-2 text-xs font-medium text-neutral-500 transition-colors"
              }
            >
              {active ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-brand-600"
                />
              ) : null}
              <span
                aria-hidden="true"
                className={
                  active
                    ? "px-3 py-1 text-brand-600"
                    : "px-3 py-1 text-neutral-500"
                }
              >
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
