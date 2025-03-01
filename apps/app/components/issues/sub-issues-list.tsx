import { FC, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import useSWR, { mutate } from "swr";

// headless ui
import { Disclosure, Transition } from "@headlessui/react";
// services
import issuesService from "services/issues.service";
// contexts
import { useProjectMyMembership } from "contexts/project-member.context";
// components
import { ExistingIssuesListModal } from "components/core";
import { CreateUpdateIssueModal } from "components/issues";
// ui
import { CustomMenu } from "components/ui";
// icons
import { ChevronRightIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
// helpers
import { orderArrayBy } from "helpers/array.helper";
// types
import { IIssue } from "types";
// fetch-keys
import { PROJECT_ISSUES_LIST, SUB_ISSUES } from "constants/fetch-keys";

type Props = {
  parentIssue: IIssue;
};

export const SubIssuesList: FC<Props> = ({ parentIssue }) => {
  // states
  const [createIssueModal, setCreateIssueModal] = useState(false);
  const [subIssuesListModal, setSubIssuesListModal] = useState(false);
  const [preloadedData, setPreloadedData] = useState<Partial<IIssue> | null>(null);

  const router = useRouter();
  const { workspaceSlug, projectId, issueId } = router.query;

  const { memberRole } = useProjectMyMembership();

  const { data: subIssues } = useSWR<IIssue[] | undefined>(
    workspaceSlug && projectId && issueId ? SUB_ISSUES(issueId as string) : null,
    workspaceSlug && projectId && issueId
      ? () =>
          issuesService.subIssues(workspaceSlug as string, projectId as string, issueId as string)
      : null
  );

  const { data: issues } = useSWR(
    workspaceSlug && projectId
      ? PROJECT_ISSUES_LIST(workspaceSlug as string, projectId as string)
      : null,
    workspaceSlug && projectId
      ? () => issuesService.getIssues(workspaceSlug as string, projectId as string)
      : null
  );

  const addAsSubIssue = async (data: { issues: string[] }) => {
    if (!workspaceSlug || !projectId) return;

    await issuesService
      .addSubIssues(workspaceSlug as string, projectId as string, parentIssue?.id ?? "", {
        sub_issue_ids: data.issues,
      })
      .then((res) => {
        mutate<IIssue[]>(
          SUB_ISSUES(parentIssue?.id ?? ""),
          (prevData) => {
            let newSubIssues = [...(prevData as IIssue[])];

            data.issues.forEach((issueId: string) => {
              const issue = issues?.find((i) => i.id === issueId);

              if (issue) newSubIssues.push(issue);
            });

            newSubIssues = orderArrayBy(newSubIssues, "created_at", "descending");

            return newSubIssues;
          },
          false
        );

        mutate<IIssue[]>(
          PROJECT_ISSUES_LIST(workspaceSlug as string, projectId as string),
          (prevData) =>
            (prevData ?? []).map((p) => {
              if (data.issues.includes(p.id))
                return {
                  ...p,
                  parent: parentIssue.id,
                };

              return p;
            }),
          false
        );

        mutate(PROJECT_ISSUES_LIST(workspaceSlug as string, projectId as string));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleSubIssueRemove = (issueId: string) => {
    if (!workspaceSlug || !projectId) return;

    mutate<IIssue[]>(
      SUB_ISSUES(parentIssue.id ?? ""),
      (prevData) => prevData?.filter((i) => i.id !== issueId),
      false
    );

    issuesService
      .patchIssue(workspaceSlug as string, projectId as string, issueId, { parent: null })
      .then((res) => {
        mutate(SUB_ISSUES(parentIssue.id ?? ""));

        mutate<IIssue[]>(
          PROJECT_ISSUES_LIST(workspaceSlug as string, projectId as string),
          (prevData) =>
            (prevData ?? []).map((p) => {
              if (p.id === res.id)
                return {
                  ...p,
                  ...res,
                };

              return p;
            }),
          false
        );
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const handleCreateIssueModal = () => {
    setCreateIssueModal(true);
    setPreloadedData({
      parent: parentIssue.id,
    });
  };

  const isNotAllowed = memberRole.isGuest || memberRole.isViewer;

  return (
    <>
      <CreateUpdateIssueModal
        isOpen={createIssueModal}
        prePopulateData={{ ...preloadedData }}
        handleClose={() => setCreateIssueModal(false)}
      />
      <ExistingIssuesListModal
        isOpen={subIssuesListModal}
        handleClose={() => setSubIssuesListModal(false)}
        issues={
          issues?.filter(
            (i) =>
              (i.parent === "" || i.parent === null) &&
              i.id !== parentIssue?.id &&
              i.id !== parentIssue?.parent
          ) ?? []
        }
        handleOnSubmit={addAsSubIssue}
      />
      {subIssues && subIssues.length > 0 ? (
        <Disclosure defaultOpen={true}>
          {({ open }) => (
            <>
              <div className="flex items-center justify-between">
                <Disclosure.Button className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium hover:bg-brand-surface-1">
                  <ChevronRightIcon className={`h-3 w-3 ${open ? "rotate-90" : ""}`} />
                  Sub-issues <span className="ml-1 text-gray-600">{subIssues.length}</span>
                </Disclosure.Button>
                {open && !isNotAllowed ? (
                  <div className="flex items-center">
                    <button
                      type="button"
                      className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium hover:bg-brand-surface-1"
                      onClick={handleCreateIssueModal}
                    >
                      <PlusIcon className="h-3 w-3" />
                      Create new
                    </button>

                    <CustomMenu ellipsis>
                      <CustomMenu.MenuItem onClick={() => setSubIssuesListModal(true)}>
                        Add an existing issue
                      </CustomMenu.MenuItem>
                    </CustomMenu>
                  </div>
                ) : null}
              </div>
              <Transition
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Disclosure.Panel className="mt-3 flex flex-col gap-y-1">
                  {subIssues.map((issue) => (
                    <Link
                      key={issue.id}
                      href={`/${workspaceSlug}/projects/${projectId}/issues/${issue.id}`}
                    >
                      <a className="group flex items-center justify-between gap-2 rounded p-2 hover:bg-brand-surface-1">
                        <div className="flex items-center gap-2 rounded text-xs">
                          <span
                            className="block h-1.5 w-1.5 flex-shrink-0 rounded-full"
                            style={{
                              backgroundColor: issue.state_detail.color,
                            }}
                          />
                          <span className="flex-shrink-0 text-gray-600">
                            {issue.project_detail.identifier}-{issue.sequence_id}
                          </span>
                          <span className="max-w-sm break-all font-medium">{issue.name}</span>
                        </div>

                        {!isNotAllowed && (
                          <button
                            type="button"
                            className="cursor-pointer opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSubIssueRemove(issue.id);
                            }}
                          >
                            <XMarkIcon className="h-4 w-4 text-brand-secondary hover:text-brand-base" />
                          </button>
                        )}
                      </a>
                    </Link>
                  ))}
                </Disclosure.Panel>
              </Transition>
            </>
          )}
        </Disclosure>
      ) : (
        !isNotAllowed && (
          <CustomMenu
            label={
              <>
                <PlusIcon className="h-3 w-3" />
                Add sub-issue
              </>
            }
            optionsPosition="left"
            noBorder
            noChevron
          >
            <CustomMenu.MenuItem onClick={handleCreateIssueModal}>Create new</CustomMenu.MenuItem>
            <CustomMenu.MenuItem onClick={() => setSubIssuesListModal(true)}>
              Add an existing issue
            </CustomMenu.MenuItem>
          </CustomMenu>
        )
      )}
    </>
  );
};
