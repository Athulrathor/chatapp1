
import { useChatStore } from "../store/useChatStore.js";
import Sidebar from "../components/Sidebar.jsx";
import NoChatSelected from "../components/NoChatSelected.jsx";
import ChatContainer from "../components/ChatContainer.jsx";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <main className="min-h-[100dvh] bg-base-200 pt-16">
      <div className="mx-auto h-[calc(100dvh-4rem)] w-full max-w-[1600px] p-0 sm:p-3 lg:p-5">
        <section className="flex h-full min-h-0 overflow-hidden bg-base-100 sm:rounded-2xl sm:border sm:border-base-300 sm:shadow-xl">
          <aside
            className={`${
              selectedUser ? "hidden md:flex" : "flex"
            } h-full w-full shrink-0 flex-col md:w-72 lg:w-80`}
          >
            <Sidebar />
          </aside>

          <section
            className={`${
              selectedUser ? "flex" : "hidden md:flex"
            } min-h-0 min-w-0 flex-1 flex-col`}
          >
            {selectedUser ? <ChatContainer /> : <NoChatSelected />}
          </section>
        </section>
      </div>
    </main>
  );
};

export default HomePage;
