
import { useEffect, useState } from "react";
import { Camera, Mail, User, CalendarDays, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

import { useAuthStore } from "../store/useAuthStore.js";
import { getProfileImageUrl } from "../libs/utils.js";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ProfilePage = () => {
  const [selectedImg, setSelectedImg] = useState(null);

  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();

  useEffect(() => {
    return () => {
      if (selectedImg) URL.revokeObjectURL(selectedImg);
    };
  }, [selectedImg]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image must be less than 5 MB.");
      e.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setSelectedImg(previewUrl);

    try {
      await updateProfile({ profilePic: file });
    } catch {
      setSelectedImg(null);
      toast.error("Unable to update profile picture.");
    } finally {
      e.target.value = "";
    }
  };

  const profileImage =
    selectedImg ||
    getProfileImageUrl(authUser?.profilePic) ||
    "/avatar.png";

  const memberSince = authUser?.createdAt
    ? new Date(authUser.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not available";

  return (
    <main className="min-h-[100dvh] px-3 pb-8 pt-20 sm:px-6">
      <div className="mx-auto w-full max-w-2xl">
        <section className="overflow-hidden rounded-2xl border border-base-300 bg-base-200 shadow-sm">
          {/* Header */}
          <div className="border-b border-base-300 px-5 py-6 text-center sm:px-8">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Profile
            </h1>
            <p className="mt-2 text-sm text-base-content/60">
              Manage your personal information
            </p>
          </div>

          <div className="space-y-8 p-5 sm:p-8">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <img
                  src={profileImage}
                  alt="Profile avatar"
                  className="size-28 rounded-full border-4 border-base-300 bg-base-300 object-cover shadow-md sm:size-36"
                />

                <label
                  htmlFor="avatar-upload"
                  className={`absolute bottom-1 right-1 flex size-10 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-content shadow-md transition hover:scale-105 hover:opacity-90 ${
                    isUpdatingProfile
                      ? "pointer-events-none opacity-60"
                      : ""
                  }`}
                  title="Change profile picture"
                >
                  <Camera size={19} />

                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUpdatingProfile}
                  />
                </label>
              </div>

              <div className="text-center">
                <p className="font-semibold">
                  {authUser?.fullname || "Your Name"}
                </p>
                <p className="mt-1 text-xs text-base-content/60">
                  {isUpdatingProfile
                    ? "Uploading your picture..."
                    : "Click the camera icon to update your photo"}
                </p>
              </div>
            </div>

            {/* Personal information */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-base-content/50">
                Personal information
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="min-w-0 rounded-xl border border-base-300 bg-base-100 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm text-base-content/50">
                    <User size={17} />
                    Full name
                  </div>
                  <p className="break-words font-medium">
                    {authUser?.fullname || "Not available"}
                  </p>
                </div>

                <div className="min-w-0 rounded-xl border border-base-300 bg-base-100 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm text-base-content/50">
                    <Mail size={17} />
                    Email address
                  </div>
                  <p className="break-all font-medium">
                    {authUser?.email || "Not available"}
                  </p>
                </div>
              </div>
            </div>

            {/* Account information */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-base-content/50">
                Account information
              </h2>

              <div className="overflow-hidden rounded-xl border border-base-300 bg-base-100 px-4">
                <div className="flex items-center justify-between gap-3 border-b border-base-300 py-4">
                  <div className="flex items-center gap-3 text-sm text-base-content/60">
                    <CalendarDays size={17} />
                    Member since
                  </div>
                  <span className="text-right text-sm font-medium">
                    {memberSince}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 py-4">
                  <div className="flex items-center gap-3 text-sm text-base-content/60">
                    <ShieldCheck size={17} />
                    Account status
                  </div>
                  <span className="flex items-center gap-2 text-sm font-medium text-success">
                    <span className="size-2 rounded-full bg-success" />
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <p className="mt-4 text-center text-xs text-base-content/40">
          Your account information is securely managed.
        </p>
      </div>
    </main>
  );
};

export default ProfilePage;
