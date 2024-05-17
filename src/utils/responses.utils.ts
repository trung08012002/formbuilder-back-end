import { Prisma } from '@prisma/client';
import { Response as ResponsePrismaSchema } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';
import { Response } from 'express';
import status from 'http-status';
import isUndefined from 'lodash.isundefined';
import toString from 'lodash.tostring';

import { RESPONSES_ERROR_MESSAGES } from '../constants';
import {
  CreatedResponseSchema,
  ElementResponseSchema,
} from '../schemas/createResponse.schemas';
import { ElementSchema } from '../schemas/forms.schemas';
import {
  getResponsesService,
  ResponsesService,
} from '../services/responses.service';

import { errorResponse } from './messages.utils';
import { isKeyOfObject } from './object.utils';

const responsesService: ResponsesService = getResponsesService();

export const findResponseById = async (responseId: number, res: Response) => {
  const existingResponse = await responsesService.getResponseById(responseId);
  if (!existingResponse) {
    return errorResponse(
      res,
      RESPONSES_ERROR_MESSAGES.RESPONSE_NOT_FOUND,
      status.NOT_FOUND,
    );
  }
  return existingResponse;
};

export const convertRawResponseToExtraInfoResponse = (
  elementListByIdObject: Record<string, Prisma.JsonValue>,
  response: {
    id: number;
    formAnswers: Prisma.JsonValue[];
    createdAt: Date;
  },
) => {
  const currentFormAnswer = response.formAnswers
    .map((elementResponse) => {
      const currentElementResponse = elementResponse as ElementResponseSchema;
      const formElement = elementListByIdObject[
        currentElementResponse.elementId
      ] as ElementSchema;
      if (!formElement) {
        return undefined;
      }
      const answers = currentElementResponse.answers.map((answer) => ({
        fieldId: answer.fieldId,
        text: answer.text,
        fieldName: formElement.fields.find(
          (field) => field.id === answer.fieldId,
        )?.name,
      }));
      const labelKey = Object.keys(formElement.config).filter((key) =>
        key.includes('fieldLabel'),
      )[0];
      return {
        elementId: currentElementResponse.elementId,
        answers: answers,
        elementName: isKeyOfObject(labelKey, formElement.config)
          ? toString(formElement.config[labelKey])
          : 'Field Label',
      };
    })
    .filter((value) => !isUndefined(value));
  return {
    id: response.id,
    createdAt: response.createdAt,
    formAnswers: currentFormAnswer,
  };
};

export const getHasFieldLabelElementIdAndName = (elements: JsonValue[]) =>
  elements
    .filter((element: JsonValue) =>
      isKeyOfObject('fieldLabel', (element as ElementSchema).config),
    )
    .sort(
      (firstValue, secondValue) =>
        (firstValue as ElementSchema).gridSize.y -
        (secondValue as ElementSchema).gridSize.y,
    )
    .map((element: JsonValue) => ({
      elementId: (element as ElementSchema).id,
      elementName: ((element as ElementSchema).config as { fieldLabel: string })
        .fieldLabel,
    }));
export const convertFormElementsToIdAndElementNameRecord = (
  elements: JsonValue[],
) =>
  elements
    .filter((element: JsonValue) =>
      isKeyOfObject('fieldLabel', (element as ElementSchema).config),
    )
    .sort(
      (firstValue, secondValue) =>
        (firstValue as ElementSchema).gridSize.y -
        (secondValue as ElementSchema).gridSize.y,
    )
    .reduce<Record<string, string>>(
      (acc, element: JsonValue) => ({
        ...acc,
        [(element as ElementSchema).id]: (
          (element as ElementSchema).config as { fieldLabel: string }
        ).fieldLabel,
      }),
      {},
    );

export const convertRawResponseToAnswerAndRate = (
  elementNameListById: Record<string, string>,
  responses: CreatedResponseSchema[],
) => {
  const frequencies = calculateFrequencies(
    responses.flatMap((response) =>
      response.formAnswers.map((formAnswer) => ({
        elementId: formAnswer.elementId,
        answer: formAnswer.answers.map((answer) => answer.text).join(' '),
      })),
    ),
  );

  const totals = Object.keys(frequencies).reduce((acc, key) => {
    const total = Object.values(frequencies[key]).reduce(
      (acc, total) => acc + total,
      0,
    );
    return { ...acc, [key]: total };
  }, {});

  return Object.keys(frequencies).map((key) => {
    const values = Object.entries(frequencies[key]).map((entry) => ({
      rate: (entry[1] / totals[key as keyof typeof totals]).toFixed(2),
      answer: entry[0],
    }));

    return {
      column: elementNameListById[key],
      columnId: key,
      data: values,
    };
  });
};

interface DataItem {
  elementId: string;
  answer: string;
}

interface DateAndDataItem {
  elementId: string;
  answer: string;
  date: string;
}
interface FrequencyMap {
  [key: string]: { [answer: string]: number };
}
interface DateFrequencyMap {
  [key: string]: { [answer: string]: { [date: string]: number } };
}

const calculateFrequencies = (arr: DataItem[]): FrequencyMap =>
  arr.reduce((acc: FrequencyMap, item: DataItem) => {
    const { elementId, answer } = item;
    return {
      ...acc,
      [elementId]: {
        ...acc[elementId],
        [answer]: (acc[elementId]?.[answer] || 0) + 1,
      },
    };
  }, {});

const calculateDateFrequencies = (arr: DateAndDataItem[]): DateFrequencyMap =>
  arr.reduce((acc: DateFrequencyMap, item: DateAndDataItem) => {
    const { elementId, answer, date } = item;
    return {
      ...acc,
      [elementId]: {
        ...acc[elementId],
        [answer]: {
          ...acc[elementId]?.[answer],
          [date]: (acc[elementId]?.[answer]?.[date] || 0) + 1,
        },
      },
    };
  }, {});

interface DataStructure {
  [key: string]: {
    [key: string]: { [key: string]: number };
  };
}

function mapTotalByDate(data: DataStructure): { [key: string]: number } {
  return Object.values(data)
    .flatMap((innerObject) =>
      Object.values(innerObject).flatMap((dates) =>
        Object.entries(dates).map(([date, count]) => ({
          [date]: count,
        })),
      ),
    )
    .reduce((acc, curr) => {
      const date = Object.keys(curr)[0];
      const count = curr[date];
      acc[date] = (acc[date] || 0) + count;
      return acc;
    }, {});
}

export const convertRawResponseToAnswerAndRateDate = (
  elementNameListById: Record<string, string>,
  responses: ResponsePrismaSchema[],
) => {
  const frequencies = calculateDateFrequencies(
    responses.flatMap((response) =>
      (response.formAnswers as ElementResponseSchema[]).map((formAnswer) => ({
        elementId: formAnswer.elementId,
        answer: formAnswer.answers.map((answer) => answer.text).join(' '),
        date: response.createdAt.toLocaleDateString(),
      })),
    ),
  );

  const totalByDate = mapTotalByDate(frequencies);

  return Object.keys(frequencies).map((key) => {
    const values = Object.entries(frequencies[key])
      .flatMap((entry) =>
        Object.keys(entry[1]).map((date) => ({
          rate: (entry[1][date] / totalByDate[date]).toFixed(2),
          answer: entry[0],
          date: date,
        })),
      )
      .sort((a, b) => (new Date(a.date) < new Date(b.date) ? -1 : 1));

    return {
      column: elementNameListById[key],
      columnId: key,
      data: values,
    };
  });
};
