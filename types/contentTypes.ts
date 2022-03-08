export type Id = number | string;

export type Comment = {
    id: Id
    threadOf?: number
    related?: any
    itemsInTread?: number
    firstThreadItemId?: Id
};

export type RelatedEntity = {
    id: Id
    uid: string
};