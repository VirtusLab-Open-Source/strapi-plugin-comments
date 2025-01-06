import { Schema, UID } from '@strapi/strapi';
import { has, isDate, isNil, isObject, propEq } from 'lodash/fp';
import { inputObjectType } from 'nexus';
import type { InputDefinitionBlock } from 'nexus/dist/definitions/definitionBlocks';
import { StrapiContext, ToBeFixed } from '../@types';


const virtualScalarAttributes = ['id'];


const addScalarAttribute = (
  builder: InputDefinitionBlock<any>,
  attributeName: string,
  attribute: { type: string },
): void => {
  const { naming, mappers } = strapi.plugin('graphql').service('utils');

  const gqlType = mappers.strapiScalarToGraphQLScalar(attribute.type);

  builder.field(attributeName, {
    type: naming.getScalarFilterInputTypeName(gqlType),
  });
};

const addRelationalAttribute = (
  builder: InputDefinitionBlock<any>,
  attributeName: string,
  attribute: { target: UID.Schema },
): void => {
  const utils = strapi.plugin('graphql').service('utils');
  const extension = strapi.plugin('graphql').service('extension');
  const { getFiltersInputTypeName } = utils.naming;
  const { isMorphRelation } = utils.attributes;

  const model = strapi.getModel(attribute.target);

  // If there is no model corresponding to the attribute configuration
  // or if the attribute is a polymorphic relation, then ignore it
  if (!model || isMorphRelation(attribute)) return;

  // If the target model is disabled, then ignore it too
  if (extension.shadowCRUD(model.uid).isDisabled()) return;

  builder.field(attributeName, { type: getFiltersInputTypeName(model) });
};


const gqlService = ({ strapi }: StrapiContext) => {
  const { service: getService } = strapi.plugin('graphql');

  const recursivelyReplaceScalarOperators = (data: ToBeFixed): ToBeFixed => {
    const { operators } = getService("builders").filters;

    if (Array.isArray(data)) {
      return data.map(recursivelyReplaceScalarOperators);
    }

    // Note: We need to make an exception for date since GraphQL
    // automatically cast date strings to date instances in args
    if (isDate(data) || !isObject(data)) {
      return data;
    }

    const result: ToBeFixed = {};

    for (const [key, value] of Object.entries(data)) {
      const isOperator = !!operators[key];

      const newKey: string = isOperator ? operators[key].strapiOperator : key;

      result[newKey] = recursivelyReplaceScalarOperators(value);
    }

    return result;
  };


  const rootLevelOperators = () => {
    const { operators } = strapi.plugin('graphql').service('builders').filters;

    return [operators.and, operators.or, operators.not];
  };

  const graphQLFiltersToStrapiQuery = (queryFilters: ToBeFixed, contentType: ToBeFixed = {}) => {
    const { isStrapiScalar, isMedia, isRelation } = getService('utils').attributes;
    const { operators } = getService('builders').filters;

    const ROOT_LEVEL_OPERATORS = [operators.and, operators.or, operators.not];

    // Handle unwanted scenario where there is no filters defined
    if (isNil(queryFilters)) {
      return {};
    }

    // If filters is a collection, then apply the transformation to every item of the list
    if (Array.isArray(queryFilters)) {
      return queryFilters.reduce((acc, filtersItem) => {
        acc.push(graphQLFiltersToStrapiQuery(filtersItem, contentType));
        return acc;
      }, []);
    }

    const resultMap: ToBeFixed = {};
    const { attributes } = contentType;

    const isAttribute = (attributeName: string): boolean => {
      return (
        virtualScalarAttributes.includes(attributeName) || has(attributeName, attributes)
      );
    };

    for (const [key, value] of Object.entries(queryFilters)) {
      // If the key is an attribute, update the value
      if (isAttribute(key)) {
        const attribute: ToBeFixed = attributes[key];

        // If it's a scalar attribute
        if (
          virtualScalarAttributes.includes(key) ||
          isStrapiScalar(attribute)
        ) {
          // Replace (recursively) every GraphQL scalar operator with the associated Strapi operator
          resultMap[key] = recursivelyReplaceScalarOperators(value);
        }

        // If it's a deep filter on a relation
        else if (isRelation(attribute) || isMedia(attribute)) {
          // Fetch the model from the relation
          const relModel = strapi.getModel(attribute.target);

          // Recursively apply the mapping to the value using the fetched model,
          // and update the value within `resultMap`
          resultMap[key] = graphQLFiltersToStrapiQuery(value, relModel);
        }
      }

      // Handle the case where the key is not an attribute (operator, ...)
      else {
        const rootLevelOperator = ROOT_LEVEL_OPERATORS.find(
          propEq('fieldName', key),
        );

        // If it's a root level operator (AND, NOT, OR, ...)
        if (rootLevelOperator) {
          const { strapiOperator } = rootLevelOperator;

          // Transform the current value recursively and add it to the resultMap
          // object using the strapiOperator equivalent of the GraphQL key
          resultMap[strapiOperator] = graphQLFiltersToStrapiQuery(
            value,
            contentType,
          );
        }
      }
    }


    return resultMap;

  };

  return {
    graphQLFiltersToStrapiQuery,
    buildContentTypeFilters<T extends UID.ContentType>(contentType: Schema.ContentType<T>) {
      const utils = strapi.plugin('graphql').service('utils');
      const extension = strapi.plugin('graphql').service('extension');
      const { getFiltersInputTypeName, getScalarFilterInputTypeName } = utils.naming;
      const { isStrapiScalar, isRelation } = utils.attributes;

      const { attributes } = contentType;

      const filtersTypeName = getFiltersInputTypeName(contentType);
      return inputObjectType({
        name: filtersTypeName,
        definition(t) {
          const validAttributes = Object.entries(attributes).filter(
            ([attributeName]) =>
              extension
              .shadowCRUD(contentType.uid)
              .field(attributeName)
              .hasFiltersEnabeld(),
          );
          const isIDFilterEnabled = extension.shadowCRUD(contentType.uid).field('id').hasFiltersEnabeld();
          if (contentType.kind === 'collectionType' && isIDFilterEnabled) {
            t.field('id', { type: getScalarFilterInputTypeName('ID') });
          }
          // const isDocumentFilterEnabled = extension.shadowCRUD(contentType.uid).field('documentId').hasFiltersEnabeld();
          // if (contentType.kind === 'collectionType' && isDocumentFilterEnabled) {
          //   t.field('documentId', { type: getScalarFilterInputTypeName('ID') });
          // }
          // Add every defined attribute
          for (const [attributeName, attribute] of validAttributes) {
            // Handle scalars
            if (isStrapiScalar(attribute)) {
              addScalarAttribute(t, attributeName, attribute);
            }

            // Handle relations
            else if (isRelation(attribute)) {
              // TODO: fix this
              addRelationalAttribute(t, attributeName, attribute as ToBeFixed);
            }
          }

          // Conditional clauses
          for (const operator of rootLevelOperators()) {
            operator.add(t, filtersTypeName);
          }
        },
      });
    },
  };
};

export default gqlService;
