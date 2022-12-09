import { Request } from "express";

export const parsePaginationInput = (req: Request): { page: number; count: number } => {
  let page = parseInt(req.query["page"] as string);
  let count = parseInt(req.query["count"] as string);

  if (isNaN(page)) {
    page = 1;
  }

  if (isNaN(count)) {
    count = 10;
  }
  return { page, count };
};
