import React from "react";

import { useRouter } from "next/router";

// ui
import { CustomSelect, Tooltip } from "components/ui";
// icons
import { getPriorityIcon } from "components/icons/priority-icon";
// types
import { IIssue } from "types";
// constants
import { PRIORITIES } from "constants/project";
// services
import trackEventServices from "services/track-event.service";

type Props = {
  issue: IIssue;
  partialUpdateIssue: (formData: Partial<IIssue>) => void;
  position?: "left" | "right";
  selfPositioned?: boolean;
  isNotAllowed: boolean;
};

export const ViewPrioritySelect: React.FC<Props> = ({
  issue,
  partialUpdateIssue,
  position = "left",
  selfPositioned = false,
  isNotAllowed,
}) => {
  const router = useRouter();
  const { workspaceSlug } = router.query;

  return (
    <CustomSelect
      value={issue.priority}
      onChange={(data: string) => {
        partialUpdateIssue({ priority: data });
        trackEventServices.trackIssuePartialPropertyUpdateEvent(
          {
            workspaceSlug,
            workspaceId: issue.workspace,
            projectId: issue.project_detail.id,
            projectIdentifier: issue.project_detail.identifier,
            projectName: issue.project_detail.name,
            issueId: issue.id,
          },
          "ISSUE_PROPERTY_UPDATE_PRIORITY"
        );
      }}
      maxHeight="md"
      customButton={
        <button
          type="button"
          className={`grid h-6 w-6 place-items-center rounded border ${
            isNotAllowed ? "cursor-not-allowed" : "cursor-pointer"
          } items-center shadow-sm ${
            issue.priority === "urgent"
              ? "border-red-500/20 bg-red-500/20 text-red-500"
              : issue.priority === "high"
              ? "border-orange-500/20 bg-orange-500/20 text-orange-500"
              : issue.priority === "medium"
              ? "border-yellow-500/20 bg-yellow-500/20 text-yellow-500"
              : issue.priority === "low"
              ? "border-green-500/20 bg-green-500/20 text-green-500"
              : "border-brand-base"
          }`}
        >
          <Tooltip tooltipHeading="Priority" tooltipContent={issue.priority ?? "None"}>
            <span>
              {getPriorityIcon(
                issue.priority && issue.priority !== "" ? issue.priority ?? "" : "None",
                "text-sm"
              )}
            </span>
          </Tooltip>
        </button>
      }
      noChevron
      disabled={isNotAllowed}
      position={position}
      selfPositioned={selfPositioned}
    >
      {PRIORITIES?.map((priority) => (
        <CustomSelect.Option key={priority} value={priority} className="capitalize">
          <>
            {getPriorityIcon(priority, "text-sm")}
            {priority ?? "None"}
          </>
        </CustomSelect.Option>
      ))}
    </CustomSelect>
  );
};
