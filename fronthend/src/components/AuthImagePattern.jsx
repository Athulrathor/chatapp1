
/* eslint-disable react/prop-types */

import { MessageCircle, Users, ShieldCheck } from "lucide-react";

const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <aside className="relative hidden min-w-0 overflow-hidden bg-base-200 lg:flex lg:items-center lg:justify-center">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 size-80 rounded-full bg-secondary/10 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-lg px-10 py-16 text-center xl:px-14">

        {/* Illustration grid */}
        <div className="mx-auto mb-10 grid max-w-[340px] grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, index) => (
            <div
              key={index}
              className={`flex aspect-square items-center justify-center rounded-2xl border border-primary/10 bg-base-100 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-md ${
                index % 2 === 0 ? "animate-pulse" : ""
              }`}
              style={{
                animationDelay: `${index * 150}ms`,
              }}
            >
              {index === 1 ? (
                <MessageCircle className="size-9 text-primary" />
              ) : index === 4 ? (
                <Users className="size-9 text-secondary" />
              ) : index === 7 ? (
                <ShieldCheck className="size-9 text-accent" />
              ) : (
                <div className="size-10 rounded-xl bg-primary/10" />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight xl:text-3xl">
            {title}
          </h2>

          <p className="mx-auto max-w-sm text-sm leading-7 text-base-content/60 xl:text-base">
            {subtitle}
          </p>
        </div>

        {/* Decorative dots */}
        <div className="mt-10 flex items-center justify-center gap-2">
          <span className="size-2 rounded-full bg-primary" />
          <span className="size-2 rounded-full bg-primary/40" />
          <span className="size-2 rounded-full bg-primary/20" />
        </div>
      </div>
    </aside>
  );
};

export default AuthImagePattern;
