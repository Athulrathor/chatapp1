
import { Send, Check, Palette, Eye } from "lucide-react";

import { useThemeStore } from "../store/useThemeStore.js";
import THEMES from "../constants/index.js";

const PREVIEW_MESSAGE = [
  {
    id: "1",
    content: "Hey! How's it going?",
    isSend: false,
    time: "10:30 AM",
  },
  {
    id: "2",
    content: "I'm doing great! Just working on new features.",
    isSend: true,
    time: "10:31 AM",
  },
];

const SettingPage = () => {
  const { theme, setTheme } = useThemeStore();

  return (
    <main className="min-h-[100dvh] px-3 pb-8 pt-20 sm:px-6">
      <div className="mx-auto w-full max-w-5xl space-y-8">

        {/* Page heading */}
        <section>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Palette size={22} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                Settings
              </h1>
              <p className="text-sm text-base-content/60">
                Customize your chat experience
              </p>
            </div>
          </div>
        </section>

        {/* Theme selection */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Appearance</h2>
            <p className="mt-1 text-sm text-base-content/60">
              Choose a theme for your chat interface.
            </p>
          </div>

          <div className="rounded-2xl border border-base-300 bg-base-200 p-4 sm:p-6">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {THEMES.map((t) => {
                const isSelected = theme === t;

                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    aria-pressed={isSelected}
                    aria-label={`Select ${t} theme`}
                    className={`group relative min-w-0 rounded-xl border p-2 transition-all duration-200 ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-base-300 bg-base-100 hover:border-primary/50 hover:bg-base-100/70"
                    }`}
                  >
                    {/* Theme color preview */}
                    <div
                      data-theme={t}
                      className="relative h-12 overflow-hidden rounded-lg border border-base-300"
                    >
                      <div className="absolute inset-0 grid grid-cols-4 gap-1 p-2">
                        <div className="rounded bg-primary" />
                        <div className="rounded bg-secondary" />
                        <div className="rounded bg-accent" />
                        <div className="rounded bg-neutral" />
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-center gap-1">
                      <span className="truncate text-xs font-medium">
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </span>

                      {isSelected && (
                        <Check
                          size={13}
                          className="shrink-0 text-primary"
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Live preview */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Eye size={19} className="text-base-content/60" />
            <h2 className="text-lg font-semibold">Live Preview</h2>
          </div>

          <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-200 p-3 shadow-sm sm:p-6">
            <div className="mx-auto w-full max-w-lg">
              <div className="overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm">

                {/* Chat header */}
                <div className="flex items-center gap-3 border-b border-base-300 bg-base-100 px-4 py-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-content">
                    J
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold">
                      John Doe
                    </h3>
                    <p className="text-xs text-success">
                      Online
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex min-h-[220px] flex-col gap-4 overflow-y-auto bg-base-100 p-4">
                  {PREVIEW_MESSAGE.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.isSend ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] break-words rounded-2xl px-3 py-2 shadow-sm sm:max-w-[75%] ${
                          message.isSend
                            ? "rounded-br-sm bg-primary text-primary-content"
                            : "rounded-bl-sm bg-base-200 text-base-content"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>

                        <p
                          className={`mt-1 text-right text-[10px] ${
                            message.isSend
                              ? "text-primary-content/70"
                              : "text-base-content/50"
                          }`}
                        >
                          {message.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message input preview */}
                <div className="border-t border-base-300 bg-base-100 p-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <input
                      type="text"
                      className="input input-bordered h-10 min-w-0 flex-1 text-sm"
                      placeholder="Type a message..."
                      value="This is a preview"
                      readOnly
                    />

                    <button
                      type="button"
                      aria-label="Send preview message"
                      className="btn btn-primary size-10 min-h-0 shrink-0 px-0"
                    >
                      <Send size={17} />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <p className="text-center text-xs text-base-content/50">
            Your selected theme is applied instantly across the application.
          </p>
        </section>

      </div>
    </main>
  );
};

export default SettingPage;
