import {useState} from "react";
import {getMessage} from "../../utils";
import {SingleSelect, SingleSelectOption} from "@strapi/design-system";
import {useQueryParams} from "@strapi/strapi/admin";
import {useSettingsAPI} from '../../pages/Settings/hooks/useSettingsAPI';

const getFilter = (filterName: string | undefined) => {
  return {
    related: {
      $contains: filterName
    },
  };
};

export const CommentsContentTypeFilters = () => {
  const [{ query: queryParams }, setQueryParams] = useQueryParams();
  const [currentFilter, setCurrentFilter] = useState<string>();

  const { config, collectionTypes } = useSettingsAPI();
  if (config.status !== 'success' || collectionTypes.status !== 'success')  {
    return '...';
  }
  const allCollections = collectionTypes.data.filter(ct => ct.uid.includes('api::'));

  const COMMENT_OPTIONS = allCollections.filter(
    (ct: any) => config.data.enabledCollections.some(
      (uid: string) => ct.uid === uid
    )
  );

  const handleChange = (filter: string | undefined) => {
    setCurrentFilter(filter);
    setQueryParams(
      Object.assign(queryParams,
        {
          page: {},
          filters: getFilter(filter),
        })
    );
  };

  return (
    <SingleSelect
      placeholder={getMessage("page.common.item.content-type.setFilter", "Set content type...")}
      value={currentFilter}
      onClear={() => handleChange(undefined)}
      onChange={handleChange}
    >
      {COMMENT_OPTIONS.map((option) => (
        <SingleSelectOption value={option.uid}>
          { option.schema.displayName }
        </SingleSelectOption>
      ))}
    </SingleSelect>
  );
};