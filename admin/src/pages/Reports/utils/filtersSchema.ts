const filtersSchema = [
  {
    name: 'content',
    metadatas: {label: 'Message'},
    fieldSchema: {type: 'string'},
  },
    {
    name: 'reason',
    metadatas: {label: 'Reason'},
    fieldSchema: {type: 'enum'},
  },  {
    name: 'resolved',
    metadatas: {label: 'Resolved'},
    fieldSchema: {type: 'boolean'},
  },  {
    name: 'related',
    metadatas: {label: 'Comment author'},
    fieldSchema: {
      type: "relation",
      mainField: {
        name: "authorName",
        schema: {
          type: "string"
        }
      }
    }
  },
];

export default filtersSchema;
