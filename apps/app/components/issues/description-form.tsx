import { FC, useCallback, useEffect, useState } from "react";

import dynamic from "next/dynamic";

// react-hook-form
import { Controller, useForm } from "react-hook-form";
// contexts
import { useProjectMyMembership } from "contexts/project-member.context";
// components
import { Loader, TextArea } from "components/ui";
const RemirrorRichTextEditor = dynamic(() => import("components/rich-text-editor"), {
  ssr: false,
  loading: () => (
    <Loader>
      <Loader.Item height="12rem" width="100%" />
    </Loader>
  ),
});
// types
import { IIssue } from "types";

export interface IssueDescriptionFormValues {
  name: string;
  description: any;
  description_html: string;
}

export interface IssueDetailsProps {
  issue: IIssue;
  handleFormSubmit: (value: IssueDescriptionFormValues) => Promise<void>;
}

export const IssueDescriptionForm: FC<IssueDetailsProps> = ({ issue, handleFormSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [characterLimit, setCharacterLimit] = useState(false);

  const { memberRole } = useProjectMyMembership();

  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    register,
    control,
    formState: { errors },
  } = useForm<IIssue>({
    defaultValues: {
      name: "",
      description: "",
      description_html: "",
    },
  });

  const handleDescriptionFormSubmit = useCallback(
    async (formData: Partial<IIssue>) => {
      if (!formData.name || formData.name.length === 0 || formData.name.length > 255) return;

      await handleFormSubmit({
        name: formData.name ?? "",
        description: formData.description ?? "",
        description_html: formData.description_html ?? "<p></p>",
      });
    },
    [handleFormSubmit]
  );

  // useEffect(() => {
  //   const alertUser = (e: BeforeUnloadEvent) => {
  //     e.preventDefault();
  //     e.returnValue = "";
  //     return "Are you sure you want to leave?";
  //   };

  //   window.addEventListener("beforeunload", alertUser);
  //   return () => {
  //     window.removeEventListener("beforeunload", alertUser);
  //   };
  // }, [isSubmitting]);

  // reset form values
  useEffect(() => {
    if (!issue) return;

    reset(issue);
  }, [issue, reset]);

  const isNotAllowed = memberRole.isGuest || memberRole.isViewer;

  return (
    <div className="relative">
      <div className="relative">
        <TextArea
          id="name"
          name="name"
          placeholder="Enter issue name"
          register={register}
          onFocus={() => setCharacterLimit(true)}
          onBlur={() => {
            setCharacterLimit(false);

            setIsSubmitting(true);
            handleSubmit(handleDescriptionFormSubmit)()
              .then(() => {
                setIsSubmitting(false);
              })
              .catch(() => {
                setIsSubmitting(false);
              });
          }}
          required={true}
          className="min-h-10 block w-full resize-none
      overflow-hidden rounded border-none bg-transparent
      px-3 py-2 text-xl outline-none ring-0 focus:ring-1 focus:ring-theme"
          role="textbox"
        />
        {characterLimit && (
          <div className="pointer-events-none absolute bottom-0 right-0 z-[2] rounded bg-brand-surface-2 p-1 text-xs">
            <span
              className={`${
                watch("name").length === 0 || watch("name").length > 255 ? "text-red-500" : ""
              }`}
            >
              {watch("name").length}
            </span>
            /255
          </div>
        )}
      </div>
      <span>{errors.name ? errors.name.message : null}</span>
      <Controller
        name="description"
        control={control}
        render={({ field: { value } }) => (
          <RemirrorRichTextEditor
            value={
              !value ||
              value === "" ||
              (typeof value === "object" && Object.keys(value).length === 0)
                ? watch("description_html")
                : value
            }
            onJSONChange={(jsonValue) => setValue("description", jsonValue)}
            onHTMLChange={(htmlValue) => setValue("description_html", htmlValue)}
            onBlur={() => {
              setIsSubmitting(true);
              handleSubmit(handleDescriptionFormSubmit)()
                .then(() => {
                  setIsSubmitting(false);
                })
                .catch(() => {
                  setIsSubmitting(false);
                });
            }}
            placeholder="Describe the issue..."
            editable={!isNotAllowed}
          />
        )}
      />
      <div
        className={`absolute -bottom-8 right-0 text-sm text-brand-secondary ${
          isSubmitting ? "block" : "hidden"
        }`}
      >
        Saving...
      </div>
    </div>
  );
};
