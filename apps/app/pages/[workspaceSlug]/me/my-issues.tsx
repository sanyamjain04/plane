import React from "react";

import { useRouter } from "next/router";

// headless ui
import { Disclosure, Popover, Transition } from "@headlessui/react";
// icons
import { ChevronDownIcon, PlusIcon, RectangleStackIcon } from "@heroicons/react/24/outline";
// layouts
import { WorkspaceAuthorizationLayout } from "layouts/auth-layout";
// hooks
import useIssues from "hooks/use-issues";
// ui
import { Spinner, EmptySpace, EmptySpaceItem, PrimaryButton } from "components/ui";
import { Breadcrumbs, BreadcrumbItem } from "components/breadcrumbs";
// hooks
import useIssuesProperties from "hooks/use-issue-properties";
// types
import { IIssue, Properties } from "types";
// components
import { MyIssuesListItem } from "components/issues";
// helpers
import { replaceUnderscoreIfSnakeCase } from "helpers/string.helper";
// types
import type { NextPage } from "next";

const MyIssuesPage: NextPage = () => {
  const router = useRouter();
  const { workspaceSlug } = router.query;

  // fetching user issues
  const { myIssues } = useIssues(workspaceSlug as string);

  const [properties, setProperties] = useIssuesProperties(
    workspaceSlug ? (workspaceSlug as string) : undefined,
    undefined
  );

  return (
    <WorkspaceAuthorizationLayout
      breadcrumbs={
        <Breadcrumbs>
          <BreadcrumbItem title="My Issues" />
        </Breadcrumbs>
      }
      noPadding
      right={
        <div className="flex items-center gap-2">
          {myIssues && myIssues.length > 0 && (
            <Popover className="relative">
              {({ open }) => (
                <>
                  <Popover.Button
                    className={`group flex items-center gap-2 rounded-md border border-brand-base bg-transparent px-3 py-1.5 text-xs hover:bg-brand-surface-1 hover:text-brand-base focus:outline-none ${
                      open ? "bg-brand-surface-1 text-brand-base" : "text-brand-muted-1"
                    }`}
                  >
                    <span>View</span>
                    <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
                  </Popover.Button>

                  <Transition
                    as={React.Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <Popover.Panel className="absolute right-1/2 z-10 mr-5 mt-1 w-screen max-w-xs translate-x-1/2 transform overflow-hidden rounded-lg bg-brand-base p-3 shadow-lg">
                      <div className="relative flex flex-col gap-1 gap-y-4">
                        <div className="relative flex flex-col gap-1">
                          <h4 className="text-base text-gray-600">Properties</h4>
                          <div className="flex flex-wrap items-center gap-2">
                            {Object.keys(properties).map((key) => {
                              if (key === "estimate") return null;

                              return (
                                <button
                                  key={key}
                                  type="button"
                                  className={`rounded border border-theme px-2 py-1 text-xs capitalize ${
                                    properties[key as keyof Properties]
                                      ? "border-theme bg-theme text-white"
                                      : ""
                                  }`}
                                  onClick={() => setProperties(key as keyof Properties)}
                                >
                                  {key === "key" ? "ID" : replaceUnderscoreIfSnakeCase(key)}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>
          )}
          <PrimaryButton
            className="flex items-center gap-2"
            onClick={() => {
              const e = new KeyboardEvent("keydown", { key: "c" });
              document.dispatchEvent(e);
            }}
          >
            <PlusIcon className="w-4 h-4" />
            Add Issue
          </PrimaryButton>
        </div>
      }
    >
      <div className="flex h-full w-full flex-col space-y-5">
        {myIssues ? (
          <>
            {myIssues.length > 0 ? (
              <div className="flex flex-col space-y-5">
                <Disclosure as="div" defaultOpen>
                  {({ open }) => (
                    <div className="rounded-[10px] border border-brand-base bg-brand-base">
                      <div
                        className={`flex items-center justify-start bg-brand-surface-1 px-4 py-2.5 ${
                          open ? "rounded-t-[10px]" : "rounded-[10px]"
                        }`}
                      >
                        <Disclosure.Button>
                          <div className="flex items-center gap-x-2">
                            <span>
                              <ChevronDownIcon
                                className={`h-4 w-4 text-gray-500 ${
                                  !open ? "-rotate-90 transform" : ""
                                }`}
                              />
                            </span>
                            <h2 className="font-medium leading-5">My Issues</h2>
                            <span className="rounded-full bg-brand-surface-2 py-0.5 px-3 text-sm text-brand-secondary">
                              {myIssues.length}
                            </span>
                          </div>
                        </Disclosure.Button>
                      </div>
                      <Transition
                        show={open}
                        enter="transition duration-100 ease-out"
                        enterFrom="transform opacity-0"
                        enterTo="transform opacity-100"
                        leave="transition duration-75 ease-out"
                        leaveFrom="transform opacity-100"
                        leaveTo="transform opacity-0"
                      >
                        <Disclosure.Panel>
                          {myIssues.map((issue: IIssue) => (
                            <MyIssuesListItem
                              key={issue.id}
                              issue={issue}
                              properties={properties}
                              projectId={issue.project}
                            />
                          ))}
                        </Disclosure.Panel>
                      </Transition>
                    </div>
                  )}
                </Disclosure>
              </div>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center px-4">
                <EmptySpace
                  title="You don't have any issue assigned to you yet."
                  description="Issues help you track individual pieces of work. With Issues, keep track of what's going on, who is working on it, and what's done."
                  Icon={RectangleStackIcon}
                >
                  <EmptySpaceItem
                    title="Create a new issue"
                    description={
                      <span>
                        Use <pre className="inline rounded bg-gray-200 px-2 py-1">C</pre> shortcut
                        to create a new issue
                      </span>
                    }
                    Icon={PlusIcon}
                    action={() => {
                      const e = new KeyboardEvent("keydown", {
                        key: "c",
                      });
                      document.dispatchEvent(e);
                    }}
                  />
                </EmptySpace>
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Spinner />
          </div>
        )}
      </div>
    </WorkspaceAuthorizationLayout>
  );
};

export default MyIssuesPage;
