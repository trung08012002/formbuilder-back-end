import { TEAM_ERROR_MESSAGES } from '../constants';
import { getTeamsService, TeamsService } from '../services/teams.service';

const teamsService: TeamsService = getTeamsService();

export const findTeamById = async (teamId: number) => {
  const existingTeam = await teamsService.getTeamById(teamId);
  if (!existingTeam) {
    throw new Error(TEAM_ERROR_MESSAGES.TEAM_NOT_FOUND);
  }
  return existingTeam;
};
