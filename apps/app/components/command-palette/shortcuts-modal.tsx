import React, { useEffect, useState } from "react";
// headless ui
import { Dialog, Transition } from "@headlessui/react";
// icons
import { XMarkIcon } from "@heroicons/react/20/solid";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { MacCommandIcon } from "components/icons";
// ui
import { Input } from "components/ui";

type Props = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const shortcuts = [
  {
    title: "Navigation",
    shortcuts: [
      { keys: "Ctrl,K", description: "To open navigator" },
      { keys: "↑", description: "Move up" },
      { keys: "↓", description: "Move down" },
      { keys: "←", description: "Move left" },
      { keys: "→", description: "Move right" },
      { keys: "Enter", description: "Select" },
      { keys: "Esc", description: "Close" },
    ],
  },
  {
    title: "Common",
    shortcuts: [
      { keys: "P", description: "To create project" },
      { keys: "C", description: "To create issue" },
      { keys: "Q", description: "To create cycle" },
      { keys: "M", description: "To create module" },
      { keys: "V", description: "To create view" },
      { keys: "D", description: "To create page" },
      { keys: "Delete", description: "To bulk delete issues" },
      { keys: "H", description: "To open shortcuts guide" },
      {
        keys: "Ctrl,Alt,C",
        description: "To copy issue url when on issue detail page",
      },
    ],
  },
];

const allShortcuts = shortcuts.map((i) => i.shortcuts).flat(1);

export const ShortcutsModal: React.FC<Props> = ({ isOpen, setIsOpen }) => {
  const [query, setQuery] = useState("");
  const filteredShortcuts = allShortcuts.filter((shortcut) =>
    shortcut.description.toLowerCase().includes(query.trim().toLowerCase()) || query === ""
      ? true
      : false
  );

  useEffect(() => {
    if (!isOpen) setQuery("");
  }, [isOpen]);

  return (
    <Transition.Root show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-20" onClose={setIsOpen}>
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-brand-surface-2 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-brand-surface-2 p-5">
                  <div className="sm:flex sm:items-start">
                    <div className="flex w-full flex-col gap-y-4 text-center sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="flex justify-between text-lg font-medium leading-6 text-brand-base"
                      >
                        <span>Keyboard Shortcuts</span>
                        <span>
                          <button type="button" onClick={() => setIsOpen(false)}>
                            <XMarkIcon
                              className="h-6 w-6 text-gray-400 hover:text-brand-secondary"
                              aria-hidden="true"
                            />
                          </button>
                        </span>
                      </Dialog.Title>
                      <div>
                        <div className="flex w-full items-center justify-start gap-1 rounded border-[0.6px] border-brand-base bg-brand-surface-1 px-3 py-2">
                          <MagnifyingGlassIcon className="h-3.5 w-3.5 text-brand-secondary" />
                          <Input
                            className="w-full  border-none bg-transparent py-1 px-2 text-xs text-brand-secondary focus:outline-none"
                            id="search"
                            name="search"
                            type="text"
                            placeholder="Search for shortcuts"
                            onChange={(e) => setQuery(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex w-full flex-col gap-y-3">
                        {query.trim().length > 0 ? (
                          filteredShortcuts.length > 0 ? (
                            filteredShortcuts.map((shortcut) => (
                              <div key={shortcut.keys} className="flex w-full flex-col">
                                <div className="flex flex-col gap-y-3">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm text-brand-secondary">{shortcut.description}</p>
                                    <div className="flex items-center gap-x-2.5">
                                      {shortcut.keys.split(",").map((key, index) => (
                                        <span key={index} className="flex items-center gap-1">
                                          {key === "Ctrl" ? (
                                            <span className="flex h-full items-center rounded-sm border border-brand-base bg-brand-surface-1 p-2">
                                              <MacCommandIcon />
                                            </span>
                                          ) : (
                                            <kbd className="rounded-sm border border-brand-base bg-brand-surface-1 px-2 py-1 text-sm font-medium text-gray-800">
                                              {key === "Ctrl" ? <MacCommandIcon /> : key}
                                            </kbd>
                                          )}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="flex flex-col gap-y-3">
                              <p className="text-sm text-brand-secondary">
                                No shortcuts found for{" "}
                                <span className="font-semibold italic">
                                  {`"`}
                                  {query}
                                  {`"`}
                                </span>
                              </p>
                            </div>
                          )
                        ) : (
                          shortcuts.map(({ title, shortcuts }) => (
                            <div key={title} className="flex w-full flex-col">
                              <p className="mb-4 font-medium">{title}</p>
                              <div className="flex flex-col gap-y-3">
                                {shortcuts.map(({ keys, description }, index) => (
                                  <div key={index} className="flex items-center justify-between">
                                    <p className="text-sm text-brand-secondary">{description}</p>
                                    <div className="flex items-center gap-x-2.5">
                                      {keys.split(",").map((key, index) => (
                                        <span key={index} className="flex items-center gap-1">
                                          {key === "Ctrl" ? (
                                            <span className="flex h-full items-center rounded-sm border border-brand-base text-brand-secondary bg-brand-surface-1 p-2">
                                              <MacCommandIcon />
                                            </span>
                                          ) : (
                                            <kbd className="rounded-sm border border-brand-base bg-brand-surface-1 px-2 py-1 text-sm font-medium text-brand-secondary">
                                              {key === "Ctrl" ? <MacCommandIcon /> : key}
                                            </kbd>
                                          )}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
