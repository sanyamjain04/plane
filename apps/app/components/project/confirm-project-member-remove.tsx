import React, { useRef, useState } from "react";
// headless ui
import { Dialog, Transition } from "@headlessui/react";
// icons
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
// ui
import { SecondaryButton, DangerButton } from "components/ui";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  handleDelete: () => void;
  data?: any;
};

const ConfirmProjectMemberRemove: React.FC<Props> = ({ isOpen, onClose, data, handleDelete }) => {
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const handleClose = () => {
    onClose();
    setIsDeleteLoading(false);
  };

  const handleDeletion = async () => {
    setIsDeleteLoading(true);
    handleDelete();
    handleClose();
  };

  return (
    <Transition.Root show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-20" onClose={handleClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[#131313] bg-opacity-50 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-20 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-brand-surface-2 text-left shadow-xl transition-all sm:my-8 sm:w-[40rem]">
                <div className="bg-brand-surface-2 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <ExclamationTriangleIcon
                        className="h-6 w-6 text-red-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-brand-base">
                        Remove {data?.email}?
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-brand-secondary">
                          Are you sure you want to remove member- {" "}
                          <span className="font-bold">{data?.email}</span>
                          ? They will no longer have access to this project. This action
                          cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 bg-gray-50 p-4 sm:px-6">
                  <SecondaryButton onClick={handleClose}>Cancel</SecondaryButton>
                  <DangerButton onClick={handleDeletion} loading={isDeleteLoading}>
                    {isDeleteLoading ? "Removing..." : "Remove"}
                  </DangerButton>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ConfirmProjectMemberRemove;
