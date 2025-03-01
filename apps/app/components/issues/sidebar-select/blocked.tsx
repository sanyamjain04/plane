import React, { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import useSWR from "swr";

// react-hook-form
import { SubmitHandler, useForm, UseFormWatch } from "react-hook-form";
// headless ui
import { Combobox, Dialog, Transition } from "@headlessui/react";
// hooks
import useToast from "hooks/use-toast";
// services
import issuesService from "services/issues.service";
// ui
import { PrimaryButton, SecondaryButton } from "components/ui";
// icons
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { BlockedIcon, LayerDiagonalIcon } from "components/icons";
// types
import { IIssue, UserAuth } from "types";
// fetch-keys
import { PROJECT_ISSUES_LIST } from "constants/fetch-keys";

type FormInput = {
  blocked_issue_ids: string[];
};

type Props = {
  submitChanges: (formData: Partial<IIssue>) => void;
  issuesList: IIssue[];
  watch: UseFormWatch<IIssue>;
  userAuth: UserAuth;
};

export const SidebarBlockedSelect: React.FC<Props> = ({
  submitChanges,
  issuesList,
  watch,
  userAuth,
}) => {
  const [query, setQuery] = useState("");
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false);

  const { setToastAlert } = useToast();

  const router = useRouter();
  const { workspaceSlug, projectId } = router.query;

  const { data: issues } = useSWR(
    workspaceSlug && projectId
      ? PROJECT_ISSUES_LIST(workspaceSlug as string, projectId as string)
      : null,
    workspaceSlug && projectId
      ? () => issuesService.getIssues(workspaceSlug as string, projectId as string)
      : null
  );

  const {
    handleSubmit,
    reset,
    watch: watchBlocked,
    setValue,
  } = useForm<FormInput>({
    defaultValues: {
      blocked_issue_ids: [],
    },
  });

  const handleClose = () => {
    setIsBlockedModalOpen(false);
    reset();
  };

  const onSubmit: SubmitHandler<FormInput> = (data) => {
    if (!data.blocked_issue_ids || data.blocked_issue_ids.length === 0) {
      setToastAlert({
        title: "Error",
        type: "error",
        message: "Please select atleast one issue",
      });
      return;
    }

    if (!Array.isArray(data.blocked_issue_ids)) data.blocked_issue_ids = [data.blocked_issue_ids];

    const newBlocked = [...watch("blocked_list"), ...data.blocked_issue_ids];
    submitChanges({ blocks_list: newBlocked });
    handleClose();
  };

  const filteredIssues: IIssue[] =
    query === ""
      ? issuesList
      : issuesList.filter(
          (issue) =>
            issue.name.toLowerCase().includes(query.toLowerCase()) ||
            `${issue.project_detail.identifier}-${issue.sequence_id}`
              .toLowerCase()
              .includes(query.toLowerCase())
        );

  const isNotAllowed = userAuth.isGuest || userAuth.isViewer;

  return (
    <div className="flex flex-wrap items-start py-2">
      <div className="flex items-center gap-x-2 text-sm text-brand-secondary sm:basis-1/2">
        <BlockedIcon height={16} width={16} />
        <p>Blocked by</p>
      </div>
      <div className="space-y-1 sm:basis-1/2">
        <div className="flex flex-wrap gap-1">
          {watch("blocked_list") && watch("blocked_list").length > 0
            ? watch("blocked_list").map((issue) => (
                <div
                  key={issue}
                  className="group flex cursor-pointer items-center gap-1 rounded-2xl border border-brand-base px-1.5 py-0.5 text-xs text-red-500 duration-300 hover:border-red-500/20 hover:bg-red-500/20"
                >
                  <Link
                    href={`/${workspaceSlug}/projects/${projectId}/issues/${
                      issues?.find((i) => i.id === issue)?.id
                    }`}
                  >
                    <a className="flex items-center gap-1">
                      <BlockedIcon height={10} width={10} />
                      {`${issues?.find((i) => i.id === issue)?.project_detail?.identifier}-${
                        issues?.find((i) => i.id === issue)?.sequence_id
                      }`}
                    </a>
                  </Link>
                  <button
                    type="button"
                    className="opacity-0 duration-300 group-hover:opacity-100"
                    onClick={() => {
                      const updatedBlocked: string[] = watch("blocked_list").filter(
                        (i) => i !== issue
                      );
                      submitChanges({
                        blocks_list: updatedBlocked,
                      });
                    }}
                  >
                    <XMarkIcon className="h-2 w-2" />
                  </button>
                </div>
              ))
            : null}
        </div>
        <Transition.Root
          show={isBlockedModalOpen}
          as={React.Fragment}
          afterLeave={() => setQuery("")}
          appear
        >
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
              <div className="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-20 overflow-y-auto p-4 sm:p-6 md:p-20">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="relative mx-auto max-w-2xl transform divide-y divide-gray-500 divide-opacity-10 rounded-xl bg-brand-surface-2 bg-opacity-80 shadow-2xl ring-1 ring-black ring-opacity-5 backdrop-blur backdrop-filter transition-all">
                  <form>
                    <Combobox
                      onChange={(val: string) => {
                        const selectedIssues = watchBlocked("blocked_issue_ids");
                        if (selectedIssues.includes(val))
                          setValue(
                            "blocked_issue_ids",
                            selectedIssues.filter((i) => i !== val)
                          );
                        else setValue("blocked_issue_ids", [...selectedIssues, val]);
                      }}
                    >
                      <div className="relative m-1">
                        <MagnifyingGlassIcon
                          className="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-brand-base text-opacity-40"
                          aria-hidden="true"
                        />
                        <input
                          type="text"
                          className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-brand-base placeholder-gray-500 outline-none focus:ring-0 sm:text-sm"
                          placeholder="Search..."
                          onChange={(e) => setQuery(e.target.value)}
                        />
                      </div>

                      <Combobox.Options
                        static
                        className="max-h-80 scroll-py-2 divide-y divide-gray-500 divide-opacity-10 overflow-y-auto"
                      >
                        {filteredIssues.length > 0 ? (
                          <li className="p-2">
                            {query === "" && (
                              <h2 className="mt-4 mb-2 px-3 text-xs font-semibold text-brand-base">
                                Select blocked issues
                              </h2>
                            )}
                            <ul className="text-sm text-gray-700">
                              {filteredIssues.map((issue) => {
                                if (
                                  !watch("blocked_list").includes(issue.id) &&
                                  !watch("blockers_list").includes(issue.id)
                                ) {
                                  return (
                                    <Combobox.Option
                                      key={issue.id}
                                      as="div"
                                      value={issue.id}
                                      className={({ active }) =>
                                        `flex cursor-pointer select-none items-center justify-between rounded-md px-3 py-2 ${
                                          active ? "bg-gray-900 bg-opacity-5 text-brand-base" : ""
                                        }`
                                      }
                                    >
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="checkbox"
                                          checked={watchBlocked("blocked_issue_ids").includes(
                                            issue.id
                                          )}
                                          readOnly
                                        />
                                        <span
                                          className="block h-1.5 w-1.5 flex-shrink-0 rounded-full"
                                          style={{
                                            backgroundColor: issue.state_detail.color,
                                          }}
                                        />
                                        <span className="flex-shrink-0 text-xs text-brand-secondary">
                                          {
                                            issues?.find((i) => i.id === issue.id)?.project_detail
                                              ?.identifier
                                          }
                                          -{issue.sequence_id}
                                        </span>
                                        <span>{issue.name}</span>
                                      </div>
                                    </Combobox.Option>
                                  );
                                }
                              })}
                            </ul>
                          </li>
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-4 px-3 py-8 text-center">
                            <LayerDiagonalIcon height="56" width="56" />
                            <h3 className="text-brand-secondary">
                              No issues found. Create a new issue with{" "}
                              <pre className="inline rounded bg-brand-surface-2 px-2 py-1">C</pre>.
                            </h3>
                          </div>
                        )}
                      </Combobox.Options>
                    </Combobox>

                    {filteredIssues.length > 0 && (
                      <div className="flex items-center justify-end gap-2 p-3">
                        <SecondaryButton onClick={handleClose}>Cancel</SecondaryButton>
                        <PrimaryButton onClick={handleSubmit(onSubmit)}>
                          Add selected issues
                        </PrimaryButton>
                      </div>
                    )}
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>
        <button
          type="button"
          className={`flex w-full text-brand-secondary ${
            isNotAllowed ? "cursor-not-allowed" : "cursor-pointer hover:bg-brand-surface-2"
          } items-center justify-between gap-1 rounded-md border border-brand-base px-2 py-1 text-xs shadow-sm duration-300 focus:outline-none`}
          onClick={() => setIsBlockedModalOpen(true)}
          disabled={isNotAllowed}
        >
          Select issues
        </button>
      </div>
    </div>
  );
};
