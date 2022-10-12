export type PopulateField = "avatar" | "author";

export type CommentsFieldValue = {
  commentsNumber: number;
  renderType?: "FLAT" | "TREE";
  sortByDate?: "ASC" | "DESC";
  filterBy?: "DATE_CREATED" | "APPROVAL_STATUS";
  filterByValue?: string | Date;
  populate?: Array<PopulateField>;
};
