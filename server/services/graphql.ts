import { Primitive, StrapiContext } from 'strapi-typed';
import { IServiceGraphQL, ToBeFixed } from "../../types";

import { has, propEq, isNil, isDate, isObject } from 'lodash/fp';
import { inputObjectType }from 'nexus';

const virtualScalarAttributes = ['id'];

export = ({ strapi }: StrapiContext): IServiceGraphQL => {
  const { service: getService } = strapi.plugin('graphql');

  const rootLevelOperators = () => {
    const { operators } = strapi.plugin('graphql').service('builders').filters;

    return [operators.and, operators.or, operators.not];
  };

  const buildContentTypeFilters = (contentType: ToBeFixed) => {
    const utils = strapi.plugin('graphql').service('utils');
    const extension = strapi.plugin('graphql').service('extension');

    const { getFiltersInputTypeName, getScalarFilterInputTypeName } = utils.naming;
    const { isStrapiScalar, isRelation } = utils.attributes;

    const { attributes } = contentType;

    const filtersTypeName = getFiltersInputTypeName(contentType);

    return inputObjectType({
      name: filtersTypeName,

      definition(t) {
        const validAttributes = Object.entries(attributes).filter(([attributeName]) =>
          extension
            .shadowCRUD(contentType.uid)
            .field(attributeName)
            .hasFiltersEnabeld()
        );

        const isIDFilterEnabled = extension
          .shadowCRUD(contentType.uid)
          .field('id')
          .hasFiltersEnabeld();
        // Add an ID filter to the collection types
        if (contentType.kind === 'collectionType' && isIDFilterEnabled) {
          t.field('id', { type: getScalarFilterInputTypeName('ID') });
        }

        // Add every defined attribute
        for (const [attributeName, attribute] of validAttributes) {
          // Handle scalars
          if (isStrapiScalar(attribute)) {
            addScalarAttribute(t, attributeName, attribute);
          }

          // Handle relations
          else if (isRelation(attribute)) {
            addRelationalAttribute(t, attributeName, attribute);
          }
        }

        // Conditional clauses
        for (const operator of rootLevelOperators()) {
          operator.add(t, filtersTypeName);
        }
      },
    });
  };

  const addScalarAttribute = (builder: ToBeFixed, attributeName: string, attribute: ToBeFixed): void => {
    const { naming, mappers } = strapi.plugin('graphql').service('utils');

    const gqlType = mappers.strapiScalarToGraphQLScalar(attribute.type);

    builder.field(attributeName, { type: naming.getScalarFilterInputTypeName(gqlType) });
  };

  const addRelationalAttribute = (builder: ToBeFixed, attributeName: string, attribute: ToBeFixed): void => {
    const utils = strapi.plugin('graphql').service('utils');
    const extension = strapi.plugin('graphql').service('extension');
    const { getFiltersInputTypeName } = utils.naming;
    const { isMorphRelation } = utils.attributes;

    const model = strapi.getModel<ToBeFixed>(attribute.target);

    // If there is no model corresponding to the attribute configuration
    // or if the attribute is a polymorphic relation, then ignore it
    if (!model || isMorphRelation(attribute)) return;

    // If the target model is disabled, then ignore it too
    if (extension.shadowCRUD(model.uid).isDisabled()) return;

    builder.field(attributeName, { type: getFiltersInputTypeName(model) });
  };

  const recursivelyReplaceScalarOperators = (data: ToBeFixed): ToBeFixed => {
    const { operators } = getService('builders').filters;

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

  const graphQLFiltersToStrapiQuery = (filters: ToBeFixed, contentType: ToBeFixed = {}): Array<ToBeFixed> | ToBeFixed => {
    const { isStrapiScalar, isMedia, isRelation } = getService('utils').attributes;
    const { operators } = getService('builders').filters;

    const ROOT_LEVEL_OPERATORS = [operators.and, operators.or, operators.not];

    // Handle unwanted scenario where there is no filters defined
    if (isNil(filters)) {
      return {};
    }

    // If filters is a collection, then apply the transformation to every item of the list
    if (Array.isArray(filters)) {
      return filters.map(filtersItem =>
        graphQLFiltersToStrapiQuery(filtersItem, contentType)
      );
    }

    const resultMap: ToBeFixed = {};
    const { attributes } = contentType;

    const isAttribute = (attributeName: string): boolean => {
      return virtualScalarAttributes.includes(attributeName) || has(attributeName, attributes);
    };

    for (const [key, value] of Object.entries(filters)) {
      // If the key is an attribute, update the value
      if (isAttribute(key)) {
        const attribute: Primitive | ToBeFixed = attributes[key];

        // If it's a scalar attribute
        if (virtualScalarAttributes.includes(key) || isStrapiScalar(attribute)) {
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
        const rootLevelOperator = ROOT_LEVEL_OPERATORS.find(propEq('fieldName', key));

        // If it's a root level operator (AND, NOT, OR, ...)
        if (rootLevelOperator) {
          const { strapiOperator } = rootLevelOperator;

          // Transform the current value recursively and add it to the resultMap
          // object using the strapiOperator equivalent of the GraphQL key
          resultMap[strapiOperator] = graphQLFiltersToStrapiQuery(value, contentType);
        }
      }
    }

    return resultMap;
  };

  const serviceMethods: IServiceGraphQL = {
    buildContentTypeFilters,
    graphQLFiltersToStrapiQuery,
  };
  return serviceMethods;
};