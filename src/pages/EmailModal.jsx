// components/EmailModal.jsx
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";

export default function EmailModal({ isOpen, setIsOpen, applicant, subject, body, onSend }) {
  const [sending, setSending] = useState(false);

  const handleSend = () => {
    setSending(true);
    onSend(applicant)
      .finally(() => setSending(false))
      .then(() => setIsOpen(false));
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-30" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
            leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg">
              <Dialog.Title className="text-lg font-bold text-gray-800">Send Email</Dialog.Title>
              <div className="mt-4 space-y-2">
                <p><strong>To:</strong> {applicant.email}</p>
                <p><strong>Subject:</strong> {subject}</p>
                <textarea
                  className="w-full p-2 border rounded-md h-40"
                  value={body}
                  readOnly
                />
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  className={`px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 ${sending ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={sending}
                >
                  {sending ? "Sending..." : "Send Email"}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
