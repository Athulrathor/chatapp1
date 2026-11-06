
import { MessageCircle, ShieldCheck } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="hidden flex-1 flex-col items-center justify-center bg-base-200/30 p-6 text-center md:flex">
      <div className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
        <MessageCircle size={38} />
      </div>

      <h2 className="text-2xl font-bold tracking-tight">
        Your conversations
      </h2>

      <p className="mt-2 max-w-sm text-sm leading-relaxed text-base-content/50">
        Select someone from your contacts and start a conversation.
      </p>

      <div className="mt-6 flex items-center gap-2 rounded-full border border-base-300 bg-base-100 px-4 py-2 text-xs text-base-content/60">
        <ShieldCheck size={15} className="text-success" />
        End-to-end encrypted messaging
      </div>
    </div>
  );
};

export default NoChatSelected;
