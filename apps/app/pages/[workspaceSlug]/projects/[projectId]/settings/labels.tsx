import React, { useState, useRef, useEffect } from "react";

import { useRouter } from "next/router";

import useSWR from "swr";

// mobx
import { observer } from "mobx-react-lite";

// hooks
import useUserAuth from "hooks/use-user-auth";
import { useMobxStore } from "lib/mobx/store-provider";
// services
import projectService from "services/project.service";
// layouts
import { ProjectAuthorizationWrapper } from "layouts/auth-layout";
// components
import {
  CreateUpdateLabelInline,
  DeleteLabelModal,
  LabelsListModal,
  SingleLabel,
  SingleLabelGroup,
} from "components/labels";
import { SettingsHeader } from "components/project";
// ui
import { EmptyState, Loader, PrimaryButton } from "components/ui";
import { BreadcrumbItem, Breadcrumbs } from "components/breadcrumbs";
// icons
import { PlusIcon } from "@heroicons/react/24/outline";
// images
import emptyLabel from "public/empty-state/label.svg";
// types
import { IIssueLabels } from "types";
import type { NextPage } from "next";
// fetch-keys
import { PROJECT_DETAILS } from "constants/fetch-keys";
// helper
import { truncateText } from "helpers/string.helper";

const LabelsSettings: NextPage = () => {
  // create/edit label form
  const [labelForm, setLabelForm] = useState(false);

  // edit label
  const [isUpdating, setIsUpdating] = useState(false);
  const [labelToUpdate, setLabelToUpdate] = useState<IIssueLabels | null>(null);

  // labels list modal
  const [labelsListModal, setLabelsListModal] = useState(false);
  const [parentLabel, setParentLabel] = useState<IIssueLabels | undefined>(undefined);

  // delete label
  const [selectDeleteLabel, setSelectDeleteLabel] = useState<IIssueLabels | null>(null);

  const router = useRouter();
  const { workspaceSlug, projectId } = router.query;

  const { user } = useUserAuth();

  const scrollToRef = useRef<HTMLDivElement>(null);

  const { labelStore } = useMobxStore();
  const { isLabelsLoading: isLoading, labels } = labelStore;

  const { data: projectDetails } = useSWR(
    workspaceSlug && projectId ? PROJECT_DETAILS(projectId as string) : null,
    workspaceSlug && projectId
      ? () => projectService.getProject(workspaceSlug as string, projectId as string)
      : null
  );

  const newLabel = () => {
    setIsUpdating(false);
    setLabelForm(true);
  };

  const addLabelToGroup = (parentLabel: IIssueLabels) => {
    setLabelsListModal(true);
    setParentLabel(parentLabel);
  };

  const editLabel = (label: IIssueLabels) => {
    setLabelForm(true);
    setIsUpdating(true);
    setLabelToUpdate(label);
  };

  useEffect(() => {
    if (workspaceSlug && projectId)
      labelStore.loadLabels(workspaceSlug.toString(), projectId.toString());
  }, [workspaceSlug, projectId, labelStore]);

  return (
    <>
      <LabelsListModal
        isOpen={labelsListModal}
        handleClose={() => setLabelsListModal(false)}
        parent={parentLabel}
        user={user}
      />
      <DeleteLabelModal
        isOpen={!!selectDeleteLabel}
        data={selectDeleteLabel ?? null}
        onClose={() => setSelectDeleteLabel(null)}
        user={user}
      />
      <ProjectAuthorizationWrapper
        breadcrumbs={
          <Breadcrumbs>
            <BreadcrumbItem
              title={`${truncateText(projectDetails?.name ?? "Project", 32)}`}
              link={`/${workspaceSlug}/projects/${projectDetails?.id}/issues`}
              linkTruncate
            />
            <BreadcrumbItem title="Labels Settings" unshrinkTitle />
          </Breadcrumbs>
        }
      >
        <div className="p-8">
          <SettingsHeader />
          <section className="grid grid-cols-12 gap-10">
            <div className="col-span-12 sm:col-span-5">
              <h3 className="text-2xl font-semibold">Labels</h3>
              <p className="text-custom-text-200">Manage the labels of this project.</p>
              <PrimaryButton onClick={newLabel} size="sm" className="mt-4">
                <span className="flex items-center gap-2">
                  <PlusIcon className="h-4 w-4" />
                  New label
                </span>
              </PrimaryButton>
            </div>
            <div className="col-span-12 space-y-5 sm:col-span-7">
              {labelForm && (
                <CreateUpdateLabelInline
                  labelForm={labelForm}
                  setLabelForm={setLabelForm}
                  isUpdating={isUpdating}
                  labelToUpdate={labelToUpdate}
                  ref={scrollToRef}
                />
              )}
              <>
                {!isLoading ? (
                  labels.length > 0 ? (
                    labels.map((label) => {
                      const children = labels?.filter((l) => l.parent === label.id);

                      if (children && children.length === 0) {
                        if (!label.parent)
                          return (
                            <SingleLabel
                              key={label.id}
                              label={label}
                              addLabelToGroup={() => {
                                addLabelToGroup(label);
                                // if (!workspaceSlug || !projectId || !user) return;
                                // labelStore.updateLabel(
                                //   workspaceSlug.toString(),
                                //   projectId.toString(),
                                //   label.id,
                                //   { parent: label.id },
                                //   user
                                // );
                              }}
                              editLabel={(label) => {
                                editLabel(label);
                                scrollToRef.current?.scrollIntoView({
                                  behavior: "smooth",
                                });
                              }}
                              handleLabelDelete={() => setSelectDeleteLabel(label)}
                            />
                          );
                      } else
                        return (
                          <SingleLabelGroup
                            key={label.id}
                            label={label}
                            labelChildren={children}
                            addLabelToGroup={addLabelToGroup}
                            editLabel={(label) => {
                              editLabel(label);
                              scrollToRef.current?.scrollIntoView({
                                behavior: "smooth",
                              });
                            }}
                            handleLabelDelete={() => setSelectDeleteLabel(label)}
                            user={user}
                          />
                        );
                    })
                  ) : (
                    <EmptyState
                      title="No labels yet"
                      description="Create labels to help organize and filter issues in you project"
                      image={emptyLabel}
                      primaryButton={{
                        text: "Add label",
                        onClick: () => newLabel(),
                      }}
                      isFullScreen={false}
                    />
                  )
                ) : (
                  <Loader className="space-y-5">
                    <Loader.Item height="40px" />
                    <Loader.Item height="40px" />
                    <Loader.Item height="40px" />
                    <Loader.Item height="40px" />
                  </Loader>
                )}
              </>
            </div>
          </section>
        </div>
      </ProjectAuthorizationWrapper>
    </>
  );
};

export default observer(LabelsSettings);
