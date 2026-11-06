
import { useEffect, useRef, useState } from "react";
import { ImagePlus, Send, X } from "lucide-react";
import { useChatStore } from "../store/useChatStore.js";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const { sendMessages } = useChatStore();
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB");
      e.target.value = "";
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImagePreview(null);
    setSelectedImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();

    if ((!text.trim() && !selectedImage) || isSending) return;

    try {
      setIsSending(true);

      await sendMessages({
        text: text.trim(),
        image: selectedImage,
      });

      setText("");
      removeImage();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <footer className="shrink-0 border-t border-base-300 bg-base-100 p-3 sm:p-4">
      <div className="mx-auto max-w-4xl">
        {imagePreview && (
          <div className="mb-3 inline-flex items-start">
            <div className="relative">
              <img
                src={imagePreview}
                alt="Image preview"
                className="size-20 rounded-xl border border-base-300 object-cover"
              />

              <button
                type="button"
                onClick={removeImage}
                className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-base-content text-base-100 shadow"
                aria-label="Remove image"
              >
                <X size={13} />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSend} className="flex min-w-0 items-center gap-2">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl text-base-content/60 transition hover:bg-base-200 hover:text-primary sm:size-11"
            aria-label="Attach image"
          >
            <ImagePlus size={21} />
          </button>

          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a message..."
            className="h-11 min-w-0 flex-1 rounded-xl border border-base-300 bg-base-200/60 px-3 text-sm outline-none transition focus:border-primary focus:bg-base-100"
          />

          <button
            type="submit"
            disabled={isSending || (!text.trim() && !selectedImage)}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-content transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:size-11"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </footer>
  );
};

export default MessageInput;
