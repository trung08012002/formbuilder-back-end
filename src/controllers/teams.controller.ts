import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import status from 'http-status';

import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  TEAM_ERROR_MESSAGES,
  TEAM_SUCCESS_MESSAGES,
  USER_ERROR_MESSAGES,
} from '../constants';
import {
  AddTeamMemberSchemaType,
  CreateTeamSchemaType,
  RemoveTeamMemberSchemaType,
  UpdateTeamSchemaType,
} from '../schemas/teams.schemas';
import { AuthService, getAuthService } from '../services/auth.service';
import { getTeamsService, TeamsService } from '../services/teams.service';
import { getUsersService, UsersService } from '../services/users.service';
import { canEdit, canView, errorResponse, successResponse } from '../utils';

let instance: TeamsController | null = null;

export const getTeamsController = () => {
  if (!instance) {
    instance = new TeamsController();
  }

  return instance;
};

export class TeamsController {
  private teamsService: TeamsService;
  private authService: AuthService;
  private usersService: UsersService;

  public constructor() {
    this.teamsService = getTeamsService();
    this.authService = getAuthService();
    this.usersService = getUsersService();
  }

  public getAllMyTeams = async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;

      const teams = await this.teamsService.getTeamsByUserId(userId);
      return successResponse(res, teams, SUCCESS_MESSAGES.DEFAULT);
    } catch (error) {
      return errorResponse(
        res,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        status.INTERNAL_SERVER_ERROR,
      );
    }
  };

  public getTeamDetails = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const teamId = Number(id);
      const userId = req.session.userId;

      const team = await this.teamsService.getTeamById(teamId);

      if (!canView(userId, team?.permissions as Prisma.JsonObject)) {
        return errorResponse(
          res,
          ERROR_MESSAGES.ACCESS_DENIED,
          status.FORBIDDEN,
        );
      }

      return successResponse(res, team, SUCCESS_MESSAGES.DEFAULT);
    } catch (error) {
      return errorResponse(
        res,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        status.INTERNAL_SERVER_ERROR,
      );
    }
  };

  public createTeam = async (
    req: Request<ParamsDictionary, unknown, CreateTeamSchemaType>,
    res: Response,
  ) => {
    try {
      const { name, logoUrl } = req.body;
      const userId = req.session.userId;

      const newTeam = await this.teamsService.createTeam(name, logoUrl, userId);
      return successResponse(
        res,
        newTeam,
        TEAM_SUCCESS_MESSAGES.CREATE_TEAM_SUCCESS,
        status.CREATED,
      );
    } catch (error) {
      return errorResponse(
        res,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        status.INTERNAL_SERVER_ERROR,
      );
    }
  };

  public updateTeam = async (
    req: Request<ParamsDictionary, unknown, UpdateTeamSchemaType>,
    res: Response,
  ) => {
    try {
      const { id } = req.params;
      const teamId = Number(id);
      const userId = req.session.userId;
      const { name, logoUrl } = req.body;

      const team = await this.teamsService.getTeamById(teamId);

      if (!canEdit(userId, team?.permissions as Prisma.JsonObject)) {
        return errorResponse(
          res,
          ERROR_MESSAGES.ACCESS_DENIED,
          status.FORBIDDEN,
        );
      }

      const updatedTeam = await this.teamsService.updateTeam(
        teamId,
        name,
        logoUrl,
      );
      return successResponse(
        res,
        updatedTeam,
        TEAM_SUCCESS_MESSAGES.UPDATE_TEAM_SUCCESS,
      );
    } catch (error) {
      return errorResponse(
        res,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        status.INTERNAL_SERVER_ERROR,
      );
    }
  };

  public deleteTeam = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const teamId = Number(id);
      const userId = req.session.userId;

      const team = await this.teamsService.getTeamById(teamId);

      if (team?.creatorId !== userId) {
        return errorResponse(
          res,
          ERROR_MESSAGES.ACCESS_DENIED,
          status.FORBIDDEN,
        );
      }

      await this.teamsService.deleteTeam(teamId);

      return successResponse(
        res,
        {},
        TEAM_SUCCESS_MESSAGES.DELETE_TEAM_SUCCESS,
      );
    } catch (error) {
      return errorResponse(
        res,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        status.INTERNAL_SERVER_ERROR,
      );
    }
  };

  public addTeamMember = async (
    req: Request<ParamsDictionary, unknown, AddTeamMemberSchemaType>,
    res: Response,
  ) => {
    try {
      const { id } = req.params;
      const teamId = Number(id);
      const userId = req.session.userId;
      const { email } = req.body;

      const team = await this.teamsService.getTeamById(teamId);

      if (!canEdit(userId, team?.permissions as Prisma.JsonObject)) {
        return errorResponse(
          res,
          ERROR_MESSAGES.ACCESS_DENIED,
          status.FORBIDDEN,
        );
      }

      const foundUser = await this.authService.getUserByEmail(email);
      if (!foundUser) {
        return errorResponse(
          res,
          USER_ERROR_MESSAGES.USER_NOT_FOUND,
          status.NOT_FOUND,
        );
      }

      const memberExistsInTeam =
        await this.teamsService.checkMemberExistsInTeam(teamId, foundUser.id);

      if (memberExistsInTeam) {
        return errorResponse(res, TEAM_ERROR_MESSAGES.USER_EXISTS_IN_TEAM);
      }

      await this.teamsService.addTeamMember(teamId, foundUser.id);

      return successResponse(
        res,
        {},
        TEAM_SUCCESS_MESSAGES.ADD_TEAM_MEMBER_SUCCESS,
      );
    } catch (error) {
      return errorResponse(
        res,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        status.INTERNAL_SERVER_ERROR,
      );
    }
  };

  public removeTeamMember = async (
    req: Request<ParamsDictionary, unknown, RemoveTeamMemberSchemaType>,
    res: Response,
  ) => {
    try {
      const { id } = req.params;
      const teamId = Number(id);
      const userId = req.session.userId;
      const { memberIds } = req.body;

      const team = await this.teamsService.getTeamById(teamId);

      if (!canEdit(userId, team?.permissions as Prisma.JsonObject)) {
        return errorResponse(
          res,
          ERROR_MESSAGES.ACCESS_DENIED,
          status.FORBIDDEN,
        );
      }

      for (const memberId of memberIds) {
        if (memberId === team?.creatorId) {
          return errorResponse(
            res,
            TEAM_ERROR_MESSAGES.CAN_NOT_REMOVE_TEAM_OWNER,
          );
        }

        const existingUser = await this.usersService.getUserByID(memberId);
        if (!existingUser) {
          return errorResponse(res, `User with ID: ${memberId} does not exist`);
        }

        const memberExistsInTeam =
          await this.teamsService.checkMemberExistsInTeam(teamId, memberId);
        if (!memberExistsInTeam) {
          return errorResponse(
            res,
            `User with ID: ${memberId} is not a member in the team`,
          );
        }
      }

      await this.teamsService.removeTeamMember(teamId, memberIds);

      return successResponse(
        res,
        {},
        TEAM_SUCCESS_MESSAGES.REMOVE_TEAM_MEMBER_SUCCESS,
      );
    } catch (error) {
      return errorResponse(
        res,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        status.INTERNAL_SERVER_ERROR,
      );
    }
  };
}
