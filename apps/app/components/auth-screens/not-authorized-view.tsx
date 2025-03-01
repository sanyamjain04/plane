import React from "react";
// next
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
// layouts
import DefaultLayout from "layouts/default-layout";
// hooks
import useUser from "hooks/use-user";
// images
import ProjectNotAuthorizedImg from "public/auth/project-not-authorized.svg";
import WorkspaceNotAuthorizedImg from "public/auth/workspace-not-authorized.svg";

type Props = {
  actionButton?: React.ReactNode;
  type: "project" | "workspace";
};

export const NotAuthorizedView: React.FC<Props> = ({ actionButton, type }) => {
  const { user } = useUser();
  const { asPath: currentPath } = useRouter();

  return (
    <DefaultLayout
      meta={{
        title: "Plane - Not Authorized",
        description: "You are not authorized to view this page",
      }}
    >
      <div className="flex h-full w-full flex-col items-center justify-center gap-y-5 text-center">
        <div className="h-44 w-72">
          <Image
            src={type === "project" ? ProjectNotAuthorizedImg : WorkspaceNotAuthorizedImg}
            height="176"
            width="288"
            alt="ProjectSettingImg"
          />
        </div>
        <h1 className="text-xl font-medium text-brand-base">
          Oops! You are not authorized to view this page
        </h1>

        <div className="w-full text-base text-brand-secondary max-w-md ">
          {user ? (
            <p>
              You have signed in as {user.email}. <br />
              <Link href={`/signin?next=${currentPath}`}>
                <a className="text-brand-base font-medium">Sign in</a>
              </Link>{" "}
              with different account that has access to this page.
            </p>
          ) : (
            <p>
              You need to{" "}
              <Link href={`/signin?next=${currentPath}`}>
                <a className="text-brand-base font-medium">Sign in</a>
              </Link>{" "}
              with an account that has access to this page.
            </p>
          )}
        </div>

        {actionButton}
      </div>
    </DefaultLayout>
  );
};
