const filtersSchema = [
  {
    name: "content",
    metadatas: { label: "Message" },
    fieldSchema: { type: "string" },
  },
  {
    name: "createdAt",
    metadatas: { label: "CreatedAt" },
    fieldSchema: { type: "datetime" },
  },
  {
    name: "updatedAt",
    metadatas: { label: "UpdatedAt" },
    fieldSchema: { type: "datetime" },
  },
  {
    name: "authorName",
    metadatas: {label: "Author"},
    fieldSchema: {type: "string"},
  },
  {
    name: "threadOf",
    metadatas: {label: "threadOf"},
    fieldSchema: {
      type: "relation",
      mainField: {
        name: "id",
        schema: {
          type: "number"
        }
      }
    }
  }
];

export default filtersSchema;
