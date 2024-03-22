import prisma from '@/configs/db.config';
import { CreatedResponseSchema } from '@/schemas/createResponse.schemas';
import { GetResponsesByFormIdParams } from '@/types/responses.types';

let instance: ResponsesService;

export const getResponsesService = () => {
  if (!instance) {
    instance = new ResponsesService();
  }
  return instance;
};

export class ResponsesService {
  public createResponse = async (
    formId: number,
    response: CreatedResponseSchema,
  ) =>
    prisma.$transaction(async (tx) => {
      const form = await tx.form.findFirstOrThrow({
        where: { id: formId },
        select: { totalSubmissions: true },
      });
      await tx.form.update({
        where: { id: formId },
        data: { totalSubmissions: form.totalSubmissions + 1 },
      });
      return tx.response.create({
        data: { formId, formAnswers: [...response.formAnswers] },
      });
    });

  public deleteResponse = async (formId: number, responseId: number) =>
    prisma.$transaction(async (tx) => {
      const form = await tx.form.findFirstOrThrow({
        where: { id: formId },
        select: { totalSubmissions: true },
      });
      await tx.form.update({
        where: { id: formId },
        data: { totalSubmissions: form.totalSubmissions - 1 },
      });
      return tx.response.delete({
        where: {
          id: responseId,
        },
      });
    });

  public getResponseById = (responseId: number) =>
    prisma.response.findUnique({
      where: {
        id: responseId,
      },
    });

  public getResponsesByFormId = async (props: GetResponsesByFormIdParams) => {
    const { formId, offset, limit, filterList, sortField, sortDirection } =
      props;
    return prisma.response.findMany({
      skip: offset,
      take: limit,
      where: { formId: formId, ...filterList },
      orderBy: {
        [sortField]: sortDirection,
      },
      select: {
        id: true,
        formAnswers: true,
        createdAt: true,
      },
    });
  };
}
