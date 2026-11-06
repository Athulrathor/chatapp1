
import { Users } from "lucide-react";

const SidebarSkeleton = () => {
  const skeletonContacts = Array.from({ length: 8 });

  return (
    <aside className="flex h-full w-20 shrink-0 flex-col overflow-hidden border-r border-base-300 bg-base-100 transition-all duration-200 lg:w-72">
      {/* Header */}
      <div className="flex w-full items-center justify-center border-b border-base-300 p-4 lg:justify-start lg:p-5">
        <div className="flex items-center gap-3">
          <Users className="size-6 shrink-0 text-base-content/70" />
          <span className="hidden font-semibold text-base-content lg:block">
            Contacts
          </span>
        </div>
      </div>

      {/* Contact skeletons */}
      <div className="min-h-0 w-full flex-1 space-y-1 overflow-y-auto py-3">
        {skeletonContacts.map((_, idx) => (
          <div
            key={idx}
            className="flex w-full items-center gap-3 p-3 transition-colors"
          >
            {/* Avatar */}
            <div className="mx-auto shrink-0 lg:mx-0">
              <div className="skeleton size-11 rounded-full sm:size-12" />
            </div>

            {/* Contact details */}
            <div className="hidden min-w-0 flex-1 space-y-2 lg:block">
              <div className="skeleton h-4 w-28 rounded sm:w-32" />
              <div className="skeleton h-3 w-16 rounded" />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default SidebarSkeleton;
