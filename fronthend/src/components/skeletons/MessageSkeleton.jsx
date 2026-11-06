
const MessageSkeleton = () => {
  const skeletonMessages = Array.from({ length: 6 });

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain p-3 sm:gap-6 sm:p-4">
      {skeletonMessages.map((_, idx) => {
        const isReceived = idx % 2 === 0;

        return (
          <div
            key={idx}
            className={`flex w-full gap-2 ${
              isReceived ? "justify-start" : "justify-end"
            }`}
          >
            {/* Received avatar */}
            {isReceived && (
              <div className="size-9 shrink-0 overflow-hidden rounded-full sm:size-10">
                <div className="skeleton h-full w-full rounded-full" />
              </div>
            )}

            <div
              className={`flex max-w-[85%] flex-col gap-2 sm:max-w-[70%] ${
                isReceived ? "items-start" : "items-end"
              }`}
            >
              {/* Sender name */}
              <div
                className={`skeleton h-3 w-20 rounded ${
                  isReceived ? "self-start" : "self-end"
                }`}
              />

              {/* Message bubble */}
              <div
                className={`skeleton h-14 rounded-2xl sm:h-16 ${
                  idx % 3 === 0
                    ? "w-36 sm:w-48"
                    : idx % 3 === 1
                      ? "w-48 sm:w-64"
                      : "w-40 sm:w-56"
                }`}
              />

              {/* Timestamp */}
              <div className="skeleton h-2.5 w-12 rounded" />
            </div>

            {/* Sent avatar */}
            {!isReceived && (
              <div className="size-9 shrink-0 overflow-hidden rounded-full sm:size-10">
                <div className="skeleton h-full w-full rounded-full" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MessageSkeleton;
