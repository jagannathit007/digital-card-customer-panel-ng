class TeamMemberCommonConstant {
  appStorage: any;
  constructor() {}
  public TEAM_MEMBER_TOKEN: string = 'team_member_token';
  public TEAM_MEMBER_DATA: string = 'team_member_info';
  public TOKEN: string = 'token';
  public BOARD_DATA: string = 'board_data';
  public THEME: string = 'theme';
  public ASSIGNMENT_FILTER: string = 'assignment_filter_applied';
}

export let teamMemberCommon = new TeamMemberCommonConstant();