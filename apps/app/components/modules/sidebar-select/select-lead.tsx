import React from "react";

import Image from "next/image";
import { useRouter } from "next/router";

import useSWR from "swr";

// services
import projectService from "services/project.service";
// ui
import { Avatar, CustomSearchSelect } from "components/ui";
// icons
import { UserCircleIcon } from "@heroicons/react/24/outline";
import User from "public/user.png";
// fetch-keys
import { PROJECT_MEMBERS } from "constants/fetch-keys";

type Props = {
  value: string | null | undefined;
  onChange: (val: string) => void;
};

export const SidebarLeadSelect: React.FC<Props> = ({ value, onChange }) => {
  const router = useRouter();
  const { workspaceSlug, projectId } = router.query;

  const { data: members } = useSWR(
    workspaceSlug && projectId ? PROJECT_MEMBERS(projectId as string) : null,
    workspaceSlug && projectId
      ? () => projectService.projectMembers(workspaceSlug as string, projectId as string)
      : null
  );

  const options =
    members?.map((member) => ({
      value: member.member.id,
      query:
        (member.member.first_name && member.member.first_name !== ""
          ? member.member.first_name
          : member.member.email) +
          " " +
          member.member.last_name ?? "",
      content: (
        <div className="flex items-center gap-2">
          <Avatar user={member.member} />
          {member.member.first_name && member.member.first_name !== ""
            ? member.member.first_name
            : member.member.email}
        </div>
      ),
    })) ?? [];

  const selectedOption = members?.find((m) => m.member.id === value)?.member;

  return (
    <div className="flex items-center justify-start gap-1">
      <div className="flex w-40 items-center justify-start gap-2">
        <UserCircleIcon className="h-5 w-5 text-gray-400" />
        <span>Lead</span>
      </div>
      <div className="sm:basis-1/2">
        <CustomSearchSelect
          value={value}
          label={
            <div className="flex items-center gap-2 text-brand-secondary">
              {selectedOption ? (
                <Avatar user={selectedOption} />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-transparent bg-brand-surface-2">
                  <Image
                    src={User}
                    height="100%"
                    width="100%"
                    className="rounded-full"
                    alt="No user"
                  />
                </div>
              )}
              {selectedOption
                ? selectedOption?.first_name && selectedOption.first_name !== ""
                  ? selectedOption?.first_name
                  : selectedOption?.email
                : "N/A"}
            </div>
          }
          options={options}
          height="md"
          position="right"
          onChange={onChange}
        />
      </div>
    </div>
  );
};
