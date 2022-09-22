import { stringify } from "qs";
import { isEmpty } from "lodash";

import { getApiURL, axiosInstance, handleAPIError } from "../../utils";
import { Id } from "strapi-typed";
import { CommentDetails, CommentUpdateDetails } from "../../../../types/api"
import { ToBeFixed } from "../../../../types";

export const fetchDetailsData = async (
  id: Id,
  queryParams: ToBeFixed,
  toggleNotification: Function,
): Promise<ToBeFixed> => {
  try {
    const stringifiedProps = !isEmpty(queryParams)
      ? `?${stringify(queryParams, { encode: false })}`
      : "";
    const { data } = await axiosInstance.get(
      getApiURL(`moderate/single/${id}${stringifiedProps}`),
    );

    return data;
  } catch (err: ToBeFixed) {
    handleAPIError(err, toggleNotification);
  }
};

export const fetchContentTypeData = async (
  uid: string,
  toggleNotification: Function,
) => {
  try {
    const { data } = await axiosInstance.get(
      `/content-type-builder/content-types/${uid}`,
    );
    return data?.data;
  } catch (err: ToBeFixed) {
    handleAPIError(err, toggleNotification);
  }
};

export const blockItem = (id: Id) => {
  return axiosInstance.patch(getApiURL(`moderate/single/${id}/block`));
};

export const unblockItem = (id: Id) => {
  return axiosInstance.patch(getApiURL(`moderate/single/${id}/unblock`));
};

export const approveItem = (id: Id) => {
  return axiosInstance.patch(getApiURL(`moderate/single/${id}/approve`));
};

export const rejectItem = (id: Id) => {
  return axiosInstance.patch(getApiURL(`moderate/single/${id}/reject`));
};

export const deleteItem = (id: Id) => {
  return axiosInstance.delete(getApiURL(`moderate/single/${id}/delete`));
};

export const blockItemThread = (id: Id) => {
  return axiosInstance.patch(getApiURL(`moderate/thread/${id}/block`));
};

export const unblockItemThread = (id: Id) => {
  return axiosInstance.patch(getApiURL(`moderate/thread/${id}/unblock`));
};

export const resolveReport = ({ id, reportId }: ToBeFixed) => {
  return axiosInstance.patch(
    getApiURL(`moderate/single/${id}/report/${reportId}/resolve`),
  );
};

export const resolveCommentMultipleReports = ({
  id,
  reportIds,
}: {
  id: Id;
  reportIds: Array<Id>;
}) => {
  return axiosInstance.put(
    getApiURL(`moderate/single/${id}/report/resolve`),
    reportIds,
  );
};

export const resolveMultipleReports = (reportsIds: Array<Id>) =>
  axiosInstance.put(getApiURL(`moderate/multiple/report/resolve`), reportsIds);


export const resolveAllAbuseReportsForComment = (commentId: Id) =>
  axiosInstance.put(getApiURL(`moderate/all/${commentId}/report/resolve`));

export const resolveAllAbuseReportsForThread = (commentId: Id) =>
  axiosInstance.put(
    getApiURL(`moderate/all/${commentId}/report/resolve-thread`),
  );

  export const postComment = ({threadId, body, author} : CommentDetails) => {
  return axiosInstance.post(
    getApiURL(`moderate/thread/${threadId}/postComment`),
    {
      content: body,
      author: author
    },
  )
}

export const updateComment = ({id, body} : CommentUpdateDetails) => {
  return axiosInstance.put(
    getApiURL(`moderate/single/${id}/update`),
    {
      content: body,
    },
  )
}