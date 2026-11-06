
import { Link } from "react-router-dom";
import { LogOut, MessageCircle, Settings, User } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore.js";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-base-300 bg-base-100/90 backdrop-blur-xl">
      <nav className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-content">
            <MessageCircle size={20} />
          </div>

          <span className="text-lg font-bold tracking-tight">Chat</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/setting"
            className="flex size-9 items-center justify-center rounded-xl text-base-content/60 hover:bg-base-200 sm:w-auto sm:gap-2 sm:px-3"
          >
            <Settings size={18} />
            <span className="hidden text-sm sm:inline">Settings</span>
          </Link>

          {authUser && (
            <>
              <Link
                to="/profile"
                className="flex size-9 items-center justify-center rounded-xl text-base-content/60 hover:bg-base-200 sm:w-auto sm:gap-2 sm:px-3"
              >
                <User size={18} />
                <span className="hidden text-sm sm:inline">Profile</span>
              </Link>

              <button
                onClick={logout}
                className="flex size-9 items-center justify-center rounded-xl text-error hover:bg-error/10 sm:w-auto sm:gap-2 sm:px-3"
              >
                <LogOut size={18} />
                <span className="hidden text-sm sm:inline">Logout</span>
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
