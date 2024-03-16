import { NextFunction, Request, Response } from 'express';
import status from 'http-status';

import { ERROR_MESSAGES, TEAM_ERROR_MESSAGES } from '../constants';
import { getTeamsService, TeamsService } from '../services/teams.service';
import { errorResponse } from '../utils';

const teamsService: TeamsService = getTeamsService();

export const checkTeamExistence = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const teamId = Number(id);

    const existingTeam = await teamsService.getTeamById(teamId);

    if (!existingTeam) {
      return errorResponse(
        res,
        TEAM_ERROR_MESSAGES.TEAM_NOT_FOUND,
        status.NOT_FOUND,
      );
    }

    req.body.team = existingTeam;

    next();
  } catch (error) {
    return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};
